import { createServerClient } from '@/shared/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { toListResponse, toRange } from '@/shared/lib/mapper.utils';
import type { ListResponse } from '@/shared/lib/api.types';
import { toPod, toPodSummary } from './pods.mapper';
import { fetchHeadImages } from '@/domains/products/products.server';
import { podCutoutImage } from '@/domains/products/catalog/pod-images';
import type { Pod, PodSort, PodSummary } from './pods.types';
import type { Database } from '@/shared/lib/supabase/database.types';

type PodsRow = Database['public']['Tables']['pods']['Row'];

type JoinedPod = PodsRow & {
  products: { name: string; gid: string } | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PodQuery = any;

/** 화면 status 필터를 DB status 조건으로 변환: open=recruiting, close=그 외 */
function applyStatusFilter(
  query: PodQuery,
  status: 'open' | 'close',
): PodQuery {
  return status === 'open'
    ? query.eq('status', 'recruiting')
    : query.neq('status', 'recruiting');
}

function basePodQuery(
  client: SupabaseClient<Database>,
  count: boolean,
): PodQuery {
  const select = '*, products(name, gid)';
  return client
    .from('pods')
    .select(select, count ? { count: 'exact' } : undefined);
}

/** 세션 사용자 id — 비로그인·조회 실패는 참여 없음으로 취급한다 */
async function getSessionUserId(
  client: SupabaseClient<Database>,
): Promise<string | null> {
  try {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

function toGids(rows: JoinedPod[]): string[] {
  return rows
    .map((row) => row.products?.gid)
    .filter((gid): gid is string => typeof gid === 'string');
}

/** GET pods — open 은 recruiting, close 는 그 외 상태의 소분팟 목록 */
export async function listPods(
  {
    status = 'open',
    sort = 'best',
    limit = 10,
  }: {
    status?: 'open' | 'close';
    sort?: 'best' | 'asc' | 'desc';
    limit?: number;
  } = {},
  client: SupabaseClient<Database> = createServerClient(),
): Promise<ListResponse<PodSummary>> {
  const isBest = sort === 'best';
  let query: PodQuery = basePodQuery(client, true);
  query = applyStatusFilter(query, status);
  if (isBest) {
    // 모집률(member_count/capacity) 정렬은 DB 정렬 불가 — 전체 조회 후
    // 서버에서 정렬하고 그 뒤에 limit 을 적용한다(total 은 정렬 전 count).
    query = query
      .order('recruit_deadline', { ascending: true })
      .order('id', { ascending: true });
  } else {
    query = query.order('recruit_deadline', { ascending: sort === 'asc' });
    const range = toRange(limit, 0);
    if (range) query = query.range(range.from, range.to);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  let rows = (data ?? []) as JoinedPod[];

  const gids = toGids(rows);
  const images = await fetchHeadImages(client, gids);

  if (isBest) {
    // recruit_deadline 오름차순으로 받아왔으므로 안정 정렬로 동률이 유지된다
    const rate = (row: JoinedPod) =>
      (row.capacity ?? 0) > 0
        ? (row.member_count ?? 0) / (row.capacity ?? 0)
        : 0;
    rows = [...rows].sort((a, b) => rate(b) - rate(a));
    if (limit > 0) rows = rows.slice(0, limit);
  }

  return toListResponse(
    rows.map((row) =>
      toPodSummary(
        row,
        row.products?.name ?? '',
        images.get(row.products?.gid ?? '') ?? '',
      ),
    ),
    count ?? rows.length,
    limit,
    0,
  );
}

/** GET products/:id/pods — 상품별 소분팟 목록 */
export async function listProductPods(
  productId: string,
  {
    status = 'all',
    sort = 'deadline',
    limit = 10,
    offset = 0,
  }: {
    status?: 'all' | 'open' | 'close';
    sort?: PodSort;
    limit?: number;
    offset?: number;
  } = {},
  client: SupabaseClient<Database> = createServerClient(),
): Promise<ListResponse<Pod>> {
  const uid = await getSessionUserId(client);

  // 내 활성 참여(생성 포함) pod_id 집합 — 비로그인은 참여 없음
  let joinedIds = new Set<string>();
  if (uid) {
    const { data, error } = await client
      .from('pod_participants')
      .select('pod_id')
      .eq('profile_id', uid)
      .eq('product_id', productId)
      .eq('is_active', true);
    if (error) throw error;
    joinedIds = new Set(
      ((data ?? []) as { pod_id: string | null }[])
        .map((row) => row.pod_id)
        .filter((id): id is string => typeof id === 'string'),
    );
  }

  let query: PodQuery = basePodQuery(client, true).eq('product_id', productId);
  if (status !== 'all') query = applyStatusFilter(query, status);
  if (sort === 'deadline') {
    query = query.order('recruit_deadline', { ascending: true });
  } else {
    query = query.order('pod_no', { ascending: sort === 'asc' });
  }
  const range = toRange(limit, offset);
  if (range) query = query.range(range.from, range.to);

  const { data, error, count } = await query;
  if (error) throw error;
  let rows = (data ?? []) as JoinedPod[];
  const total = count ?? rows.length;

  // 첫 페이지에서 참여 팟이 limit 밖이면 동일 필터로 재조회해 맨 앞에 포함
  if (offset === 0 && joinedIds.size > 0) {
    const missing = [...joinedIds].filter(
      (id) => !rows.some((row) => String(row.id) === id),
    );
    if (missing.length > 0) {
      let extraQuery: PodQuery = basePodQuery(client, false).eq(
        'product_id',
        productId,
      );
      if (status !== 'all') extraQuery = applyStatusFilter(extraQuery, status);
      extraQuery = extraQuery.in('id', missing);
      const { data: extraData, error: extraError } = await extraQuery;
      if (extraError) throw extraError;
      rows = [...((extraData ?? []) as JoinedPod[]), ...rows];
    }
  }

  // 참여 팟은 created_at 최신순 맨 앞, 나머지는 기존 정렬 유지
  const joinedRows = rows
    .filter((row) => joinedIds.has(String(row.id)))
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
  rows = [
    ...joinedRows,
    ...rows.filter((row) => !joinedIds.has(String(row.id))),
  ];

  const images = await fetchHeadImages(client, toGids(rows));

  const items = rows.map((row) =>
    toPod(
      row,
      row.products?.name ?? '',
      podCutoutImage(
        row.product_id ?? '',
        row.products?.name ?? '',
        images.get(row.products?.gid ?? '') ?? '',
      ),
    ),
  );
  for (const item of items) {
    item.isJoined = joinedIds.has(item.id);
  }

  return toListResponse(items, total, limit, offset);
}

/** 서버 전용 팟 쓰기 오류. route handler 가 HTTP 상태·사용자 메시지로 매핑한다 */
export class PodWriteError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'PodWriteError';
    this.status = status;
  }
}

/** GET pods/:podId(서버 내부) — 팟 1건을 products 조인·대표 이미지까지 매핑 */
export async function getPod(
  podId: string,
  client: SupabaseClient<Database> = createServerClient(),
): Promise<Pod> {
  const query = basePodQuery(client, false).eq('id', podId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  const row = data as JoinedPod | null;
  if (!row) {
    throw new PodWriteError(404, 'Buying group not found.');
  }
  const images = await fetchHeadImages(client, toGids([row]));
  return toPod(
    row,
    row.products?.name ?? '',
    images.get(row.products?.gid ?? '') ?? '',
  );
}
