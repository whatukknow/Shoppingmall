import { createServerClient } from '@/shared/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { toListResponse, toRange } from '@/shared/lib/mapper.utils';
import type { ListResponse } from '@/shared/lib/api.types';
import { toPod, toPodSummary } from './pods.mapper';
import { fetchHeadImages } from '@/domains/products/products.server';
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
  const rows = (data ?? []) as JoinedPod[];

  const images = await fetchHeadImages(client, toGids(rows));

  return toListResponse(
    rows.map((row) =>
      toPod(
        row,
        row.products?.name ?? '',
        images.get(row.products?.gid ?? '') ?? '',
      ),
    ),
    count ?? rows.length,
    limit,
    offset,
  );
}
