import {
  catalogIdForRow,
  catalogImages,
  findCatalogProduct,
} from '@/domains/products/catalog/catalog';
import { tasteRecommendationIds } from '@/domains/home/onboarding/react/tasteProfile';
import { AuthApiError } from '@/domains/auth/auth.server';
import { createServerClient } from '@/shared/lib/supabase/server';
import { fetchHeadImages } from '@/domains/products/products.server';
import { parseRecommendedProductIds, toMyPayment } from './users.mapper';
import type { Database } from '@/shared/lib/supabase/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RowOf } from '@/shared/lib/supabase/database.types';
import { toRecommendedProduct } from '@/domains/products/products.mapper';
import { toListResponse } from '@/shared/lib/mapper.utils';
import { Buffer } from 'node:buffer';
import type {
  MyPayment,
  MyPodApplication,
  MyPodApplicationStatus,
  TasteProfile,
  TasteProfileRequest,
} from './users.types';
import type { ListResponse } from '@/shared/lib/api.types';
import type { RecommendedProduct } from '@/domains/home/home.types';
import type { PaymentOrderItem } from '@/domains/payment/data/payment.types';

type TasteProfilesRow = RowOf<'taste_profiles'>;
type PodsRow = RowOf<'pods'>;
type ApplicationsRow = RowOf<'pod_applications'>;
type ParticipantsRow = RowOf<'pod_participants'>;
type OrdersRow = RowOf<'orders'>;
type ProductsRow = RowOf<'products'>;

type ProductEmbed = {
  name: string;
  gid: string;
  portion_label: string;
  portion_price: number;
} | null;

type JoinedApplication = ApplicationsRow & {
  pods: (PodsRow & { products: ProductEmbed }) | null;
};

type JoinedParticipant = ParticipantsRow & {
  pods: (PodsRow & { products: ProductEmbed }) | null;
};

const LOGIN_REQUIRED_MESSAGE = 'Please log in to continue.';
const SERVER_ERROR_MESSAGE =
  'Could not process your request. Please try again shortly.';

/** 세션 사용자 확인 — 없으면 401 (모든 users/me 함수 진입점) */
async function requireUser(client: SupabaseClient<Database>): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) {
    const status = (error as { status?: number }).status;
    if (status === 401 || status === 403) {
      throw new AuthApiError(401, LOGIN_REQUIRED_MESSAGE);
    }
    // 세션 없음(AuthSessionMissingError, status 400)은 서버 오류가 아니라
    // 비로그인 상태이므로 서버 오류 문구 대신 조용히 401 로 응답한다
    if (
      status === 400 ||
      error.name === 'AuthSessionMissingError' ||
      (error as { code?: string }).code === 'AuthSessionMissingError'
    ) {
      throw new AuthApiError(401, LOGIN_REQUIRED_MESSAGE);
    }
    console.error(
      '사용자 조회 실패 (서버 오류)',
      (error as { code?: string }).code ?? '',
      error.message ?? '',
      status ?? '',
    );
    // Supabase 5xx·네트워크 오류는 서버 장애이므로 401 (로그인 필요) 로 위장하지 않는다
    throw new AuthApiError(500, SERVER_ERROR_MESSAGE);
  }
  if (!data.user) {
    throw new AuthApiError(401, LOGIN_REQUIRED_MESSAGE);
  }
  return data.user.id;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** taste_profiles.id 는 varchar(30) 이다 — user.id(uuid 36자)를 그대로 쓰면
 * 'tp_'+36자 = 39자 로 22001 오류가 나므로 uuid 16바이트를 base64url 로 인코딩해
 * 'tp_'+22자 = 25자 로 줄인다. 결정적(id)이라 같은 사용자는 항상 같은 id, 다른
 * 사용자는 충돌 없음. uuid 형식이 아니면 throw 한다. */
export function toTasteProfileId(userId: string): string {
  if (!UUID_RE.test(userId)) {
    throw new Error(
      `toTasteProfileId: uuid 형식이 아닌 사용자 id 입니다: ${userId}`,
    );
  }
  const bytes = Buffer.from(userId.replace(/-/g, ''), 'hex');
  return `tp_${bytes.toString('base64url')}`;
}

/** taste_profiles 행 → TasteProfile. 테이블에 없는 컬럼(source, variant, animal, items, kit,
 * consent, qualityFlags)은 빈 값으로 채운다 — taste_profiles 에 컬럼 없음 (정책). */
function toTasteProfile(row: TasteProfilesRow): TasteProfile {
  const birth = row.birth_date ?? '';
  const birthMd =
    birth.length >= 10 && birth.includes('-')
      ? birth.slice(5, 7) + birth.slice(8, 10)
      : '';
  return {
    // taste_profiles 에 컬럼 없음
    source: '',
    variant: '',
    nickname: row.nickname ?? '',
    birthYear: birth.length >= 4 ? birth.slice(0, 4) : '',
    birthMd,
    gender: row.gender ?? '',
    // taste_profiles 에 컬럼 없음
    animal: '',
    element: row.element ?? '',
    sunday: row.sunday_scene ?? '',
    fridge: row.fridge_state ?? '',
    // taste_profiles 에 컬럼 없음
    items: '[]',
    kit: '[]',
    consent: false,
    qualityFlags: '[]',
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string';
}

/** TasteProfileRequest 최소 검증 — 형식이 다르면 null */
export function parseTasteProfileRequest(
  value: unknown,
): TasteProfileRequest | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const stringKeys = [
    'source',
    'variant',
    'nickname',
    'birth_year',
    'birth_md',
    'gender',
    'animal',
    'element',
    'sunday',
    'fridge',
    'items',
    'kit',
    'quality_flags',
  ];
  for (const key of stringKeys) {
    if (!isNonEmptyString(v[key])) return null;
  }
  if (typeof v.consent !== 'boolean') return null;
  if (!/^\d{4}$/.test(v.birth_year as string)) return null;
  if (!/^\d{4}$/.test(v.birth_md as string)) return null;
  return v as unknown as TasteProfileRequest;
}

/** taste_profiles 저장 컬럼 값 — 역방향 매핑만 (추천 카탈로그 ID를 기존 recommended_product_ids 컬럼에 저장) */
function tasteProfileColumns(
  body: TasteProfileRequest,
): Database['public']['Tables']['taste_profiles']['Update'] {
  return {
    recommended_product_ids: JSON.stringify(
      tasteRecommendationIds(body.items, body.kit),
    ),
    nickname: body.nickname,
    birth_date: `${body.birth_year}-${body.birth_md.slice(0, 2)}-${body.birth_md.slice(2, 4)}`,
    gender: body.gender,
    sunday_scene: body.sunday,
    fridge_state: body.fridge,
    element: body.element,
  };
}

/** GET users/me/taste-profile — 본인 취향 프로필 최신 1행. 없으면 404 */
export async function getTasteProfile(
  client: SupabaseClient<Database> = createServerClient(),
): Promise<TasteProfile> {
  const uid = await requireUser(client);

  const { data, error } = await client
    .from('taste_profiles')
    .select('*')
    .eq('profile_id', uid)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;

  const rows = (data ?? []) as TasteProfilesRow[];
  if (rows.length === 0) {
    throw new AuthApiError(404, 'No taste profile yet.');
  }
  return toTasteProfile(rows[0]);
}

/** PUT users/me/taste-profile — 본인 기존 행(created_at desc 먼저)이 있으면 update,
 * 없으면 결정적 id toTasteProfileId(user.id) 로 upsert(onConflict: 'id').
 * profile_id 에 유니크 제약이 없어 PK(결정적 id)로 중복 방지 — 동시 PUT 에도 1행만 생긴다. */
export async function putTasteProfile(
  body: TasteProfileRequest,
  client: SupabaseClient<Database> = createServerClient(),
): Promise<TasteProfile> {
  const uid = await requireUser(client);
  const parsed = parseTasteProfileRequest(body);
  if (!parsed) {
    throw new AuthApiError(400, 'Invalid taste profile.');
  }

  let columns: Database['public']['Tables']['taste_profiles']['Update'];
  try {
    columns = tasteProfileColumns(parsed);
  } catch {
    throw new AuthApiError(400, 'Invalid recommendation list.');
  }
  const { data: existing, error: existingError } = await client
    .from('taste_profiles')
    .select('id')
    .eq('profile_id', uid)
    .order('created_at', { ascending: false })
    .limit(1);

  if (existingError) throw existingError;

  let saved: TasteProfilesRow | null = null;
  if (((existing ?? []) as { id: string }[]).length > 0) {
    // database.types 가 Relationships 정의가 없어 update/insert 인자가 never 로 추론된다 — pods.server.ts 와 동일한 any 우회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = client.from('taste_profiles') as any;
    const { data, error } = await query
      .update(columns)
      .eq('profile_id', uid)
      .select('*');
    if (error) throw error;
    saved = ((data ?? []) as TasteProfilesRow[])[0] ?? null;
  } else {
    const insertPayload: Database['public']['Tables']['taste_profiles']['Insert'] =
      {
        // profile_id 유니크 제약이 없어 PK(결정적 id)로 중복 방지 — 동시 PUT 에도 1행만 생긴다
        id: toTasteProfileId(uid),
        profile_id: uid,
        ...columns,
      };
    // database.types 가 Relationships 정의가 없어 update/insert 인자가 never 로 추론된다 — pods.server.ts 와 동일한 any 우회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = client.from('taste_profiles') as any;
    const { data, error } = await query
      .upsert(insertPayload, { onConflict: 'id' })
      .select('*');
    if (error) throw error;
    saved = ((data ?? []) as TasteProfilesRow[])[0] ?? null;
  }

  if (!saved) {
    console.error('취향 프로필 저장 후 행 반환 없음', uid);
    throw new AuthApiError(
      500,
      'Could not save your taste profile. Please try again shortly.',
    );
  }
  return toTasteProfile(saved);
}

/** payment 준비 상태 판정: paid → paid / ready_at 있고 payment_due_at 경과 → expired /
 * ready_at → ready / 그 외 not-ready */
function toPaymentEligibility(
  participant: ParticipantsRow | null,
  pod: PodsRow | null,
  now: Date,
): MyPodApplication['paymentEligibility'] {
  if (participant?.paid_at) return 'paid';
  if (participant?.payment_ready_at && pod?.payment_due_at) {
    if (now.getTime() > Date.parse(pod.payment_due_at)) return 'expired';
    return 'ready';
  }
  if (participant?.payment_ready_at) return 'ready';
  return 'not-ready';
}

/** pods.status → 화면 podStatus (confirmed 는 matched 로 본다) */
function toApplicationPodStatus(
  status: string | null,
): MyPodApplication['podStatus'] {
  if (status === 'recruiting') return 'recruiting';
  if (status === 'matched' || status === 'confirmed') return 'matched';
  if (status === 'cancelled') return 'cancelled';
  return 'closed';
}

/** pod_applications → MyPodApplication */
function toMyPodApplication(
  row: JoinedApplication,
  participant: ParticipantsRow | null,
  images: Map<string, string>,
  now: Date,
): MyPodApplication {
  const pod = row.pods ?? null;
  const product = pod?.products ?? null;
  const gid = product?.gid ?? '';
  return {
    id: String(row.id),
    podId: row.requested_pod_id ?? '',
    productId: row.product_id ?? '',
    productName: product?.name ?? '',
    optionLabel: product?.portion_label ?? '',
    imageUrl: images.get(gid) ?? '',
    quantity: 1,
    unitPrice: product?.portion_price ?? 0,
    status: row.status === 'accepted' ? 'accepted' : 'pending',
    paymentEligibility: toPaymentEligibility(participant, pod, now),
    podStatus: toApplicationPodStatus(pod?.status ?? null),
    applicantCount: pod?.member_count ?? 0,
    capacity: pod?.capacity ?? 0,
    deadlineAt: pod?.recruit_deadline ?? '',
    appliedAt: row.requested_at ?? '',
  };
}

/** GET users/me/pod-applications — 본인 소분 팟 신청 내역 (open은 모집 중, close는 그 외) */
export async function listMyPodApplications(
  options: {
    status?: MyPodApplicationStatus;
    sort?: 'latest';
    limit?: number;
    offset?: number;
    now?: Date;
  } = {},
  client: SupabaseClient<Database> = createServerClient(),
): Promise<ListResponse<MyPodApplication>> {
  const uid = await requireUser(client);
  const { status = 'all', limit = 0, offset = 0 } = options;
  const now = options.now ?? new Date();

  const { data, error } = await client
    .from('pod_applications')
    .select('*, pods(*, products(name, gid, portion_label, portion_price))')
    .eq('profile_id', uid)
    .order('requested_at', { ascending: false });
  if (error) throw error;
  let rows = (data ?? []) as JoinedApplication[];

  // open = 모집 중 pods, close = 그 외 — pods 조인으로 필터
  if (status === 'open') {
    rows = rows.filter((row) => row.pods?.status === 'recruiting');
  } else if (status === 'close') {
    rows = rows.filter((row) => row.pods?.status !== 'recruiting');
  }

  // participant 를 application_id 로 일괄 조회
  const appIds = rows.map((row) => row.id);
  const participants = new Map<number, ParticipantsRow>();
  if (appIds.length > 0) {
    const { data: partData, error: partError } = await client
      .from('pod_participants')
      .select('*')
      .in('application_id', appIds);
    if (partError) throw partError;
    for (const row of (partData ?? []) as ParticipantsRow[]) {
      if (row.application_id != null) {
        participants.set(row.application_id, row);
      }
    }
  }

  // 취소(연결 participant 없음 또는 is_active=false)한 신청은 제외한다
  rows = rows.filter((row) => {
    if (row.id == null) return false;
    const participant = participants.get(row.id);
    return participant != null && participant.is_active === true;
  });

  // 같은 팟에 활성 신청이 여러 개면 최신(requested_at 내림차순 정렬상 첫 번째) 1건만
  const seenPods = new Set<string>();
  rows = rows.filter((row) => {
    const key = row.requested_pod_id ?? '';
    if (!key || seenPods.has(key)) return false;
    seenPods.add(key);
    return true;
  });

  const total = rows.length;

  const gids = rows
    .map((row) => row.pods?.products?.gid)
    .filter((gid): gid is string => typeof gid === 'string');
  const images = await fetchHeadImages(client, gids);

  if (limit > 0) rows = rows.slice(offset, offset + limit);
  else if (offset > 0) rows = rows.slice(offset);

  return toListResponse(
    rows.map((row) =>
      toMyPodApplication(
        row,
        row.id != null ? (participants.get(row.id) ?? null) : null,
        images,
        now,
      ),
    ),
    total,
    limit,
    offset,
  );
}

/** GET users/me/payments — 본인 주문 내역 + 주문 항목 일괄 조회 */
export async function listMyPayments(
  {
    status,
    limit = 20,
    offset = 0,
  }: {
    status?: 'paid' | 'pending';
    limit?: number;
    offset?: number;
  } = {},
  client: SupabaseClient<Database> = createServerClient(),
): Promise<ListResponse<MyPayment>> {
  const uid = await requireUser(client);

  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('profile_id', uid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  let rows = (data ?? []) as OrdersRow[];

  if (status) rows = rows.filter((row) => row.status === status);
  const total = rows.length;

  // order_items 를 order_id 로 일괄 조회
  const orderIds = rows.map((row) => row.id);
  const itemsByOrder = new Map<string, RowOf<'order_items'>[]>();
  if (orderIds.length > 0) {
    const { data: itemData, error: itemError } = await client
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);
    if (itemError) throw itemError;
    for (const item of (itemData ?? []) as RowOf<'order_items'>[]) {
      if (item.order_id != null) {
        const list = itemsByOrder.get(item.order_id) ?? [];
        list.push(item);
        itemsByOrder.set(item.order_id, list);
      }
    }
  }

  if (limit > 0) rows = rows.slice(offset, offset + limit);
  else if (offset > 0) rows = rows.slice(offset);

  return toListResponse(
    rows.map((row) => toMyPayment(row, itemsByOrder.get(row.id) ?? [])),
    total,
    limit,
    offset,
  );
}

/** GET users/me/product-recommendations — 본인 취향 추천 상품 (ID 순서 유지, 활성만) */
export async function listRecommendedProducts(
  { limit = 5 }: { limit?: number } = {},
  client: SupabaseClient<Database> = createServerClient(),
): Promise<ListResponse<RecommendedProduct>> {
  const uid = await requireUser(client);

  const { data: tasteData, error: tasteError } = await client
    .from('taste_profiles')
    .select('recommended_product_ids')
    .eq('profile_id', uid)
    .order('created_at', { ascending: false })
    .limit(1);
  if (tasteError) throw tasteError;
  const ids = parseRecommendedProductIds(
    ((tasteData ?? []) as { recommended_product_ids: string | null }[])[0]
      ?.recommended_product_ids ?? null,
  );
  if (ids.length === 0) return toListResponse([], 0, limit, 0);

  // 새 저장값은 안정적인 카탈로그 ID, 과거 저장값은 실제 상품 ID다.
  const legacyIds = ids.filter((id) => !findCatalogProduct(id));
  const catalogPicks = new Map(
    ids.flatMap((id) => {
      const item = findCatalogProduct(id);
      return item
        ? [
            [
              id,
              {
                id: item.id,
                name: item.name,
                imageUrl: catalogImages(item.id)!.recommendation,
              },
            ] as const,
          ]
        : [];
    }),
  );
  // 카탈로그 표시는 판매 허용이 아니다. 구매 가능 여부는 기존 상세에서 판정한다.
  // 과거 상품 ID는 활성 상품만 조회한 뒤 원래 순서로 합친다.
  const { data: productData, error: productError } =
    legacyIds.length > 0
      ? await client
          .from('products')
          .select('*')
          .in('id', legacyIds)
          .eq('is_active', true)
      : { data: [], error: null };
  if (productError) throw productError;
  const rows = (productData ?? []) as ProductsRow[];
  const byId = new Map(rows.map((row) => [row.id, row]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((row): row is ProductsRow => row != null);
  const gids = ordered
    .map((row) => row.gid)
    .filter((gid): gid is string => typeof gid === 'string');
  const images = await fetchHeadImages(client, gids);

  const operationalPicks = new Map(
    ordered.map((row) => {
      const item = findCatalogProduct(catalogIdForRow(row) ?? '');
      return [
        row.id,
        item
          ? {
              id: item.id,
              name: item.name,
              imageUrl: catalogImages(item.id)!.recommendation,
            }
          : toRecommendedProduct(row, images.get(row.gid ?? '') ?? ''),
      ] as const;
    }),
  );
  const all: RecommendedProduct[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const item = catalogPicks.get(id) ?? operationalPicks.get(id);
    if (item && !seen.has(item.id)) {
      seen.add(item.id);
      all.push(item);
    }
  }
  return toListResponse(
    limit > 0 ? all.slice(0, limit) : all,
    all.length,
    limit,
    0,
  );
}

/** GET payment/items — 결제 가능 상품 목록 (봉투 없이 배열) */
export async function getPaymentItems(
  client: SupabaseClient<Database> = createServerClient(),
): Promise<PaymentOrderItem[]> {
  const uid = await requireUser(client);

  const { data, error } = await client
    .from('pod_participants')
    .select('*, pods(*, products(name, gid, portion_label, portion_price))')
    .eq('profile_id', uid)
    .eq('is_active', true)
    .not('payment_ready_at', 'is', null)
    .is('paid_at', null)
    .order('applied_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as JoinedParticipant[];

  const gids = rows
    .map((row) => row.pods?.products?.gid)
    .filter((gid): gid is string => typeof gid === 'string');
  const images = await fetchHeadImages(client, gids);

  return rows.map((row) => {
    const product = row.pods?.products ?? null;
    return {
      podId: row.pod_id ?? '',
      productName: product?.name ?? '',
      optionLabel: product?.portion_label ?? '',
      quantity: 1,
      unitPrice: product?.portion_price ?? 0,
      imageUrl: images.get(product?.gid ?? '') ?? '',
    };
  });
}
