import { createServerClient } from '@/shared/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { toImageUrl, toListResponse, toRange } from '@/shared/lib/mapper.utils';
import type { ListResponse } from '@/shared/lib/api.types';
import {
  toProductDetail,
  toProductListItem,
  toRecommendedProduct,
} from './products.mapper';
import type { ProductListItem, ProductSort } from './products.types';
import type { RecommendedProduct } from '@/domains/home/home.types';
import type { Database } from '@/shared/lib/supabase/database.types';
import type { ProductDetailResponse } from './products.types';

type ProductsRow = Database['public']['Tables']['products']['Row'];
type UploadsRow = Database['public']['Tables']['uploads']['Row'];

/** 정렬 기준 (가정): latest=created_at desc, asc/desc=name 오름/내림차순. 동률은 sort_order asc 로 보조 정렬 */
function applySort(
  query: ReturnType<typeof baseProductQuery>,
  sort: ProductSort,
): ReturnType<typeof baseProductQuery> {
  if (sort === 'asc') {
    return query
      .order('name', { ascending: true })
      .order('sort_order', { ascending: true });
  }
  if (sort === 'desc') {
    return query
      .order('name', { ascending: false })
      .order('sort_order', { ascending: true });
  }
  return query
    .order('created_at', { ascending: false })
    .order('sort_order', { ascending: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductQuery = any;

function baseProductQuery(client: SupabaseClient<Database>, inner = false) {
  // categories.category 는 products.category_id 조인으로 가져온다
  // inner 조인(parent 필터)이 필요하면 !inner 로 부모 행을 거른다
  const embed = inner
    ? 'categories!inner(category, sort_order)'
    : 'categories(category, sort_order)';
  return client.from('products').select(`*, ${embed}`, { count: 'exact' });
}

/** uploads 를 gid 목록으로 한 번에 조회해 gid 별 대표(head_img) 이미지를 뽑는다 (N+1 방지) */
export async function fetchHeadImages(
  client: SupabaseClient<Database>,
  gids: string[],
): Promise<Map<string, string>> {
  const filtered = gids.filter((gid) => gid.length > 0);
  const map = new Map<string, string>();
  if (filtered.length === 0) return map;

  const { data, error } = await client
    .from('uploads')
    .select('*')
    .in('gid', filtered)
    .eq('head_img', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  for (const row of (data ?? []) as UploadsRow[]) {
    const gid = row.gid;
    if (gid && !map.has(gid)) map.set(gid, toImageUrl(row));
  }
  return map;
}

/** uploads page='product' 상세 이미지를 sort_order 순으로 조회 */
async function fetchDetailImages(
  client: SupabaseClient<Database>,
  gid: string,
): Promise<string[]> {
  const { data, error } = await client
    .from('uploads')
    .select('*')
    .eq('gid', gid)
    .eq('page', 'product')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as UploadsRow[]).map((row) => toImageUrl(row));
}

export async function listProducts(
  {
    category = 'all',
    sort = 'latest',
    limit = 0,
    offset = 0,
  }: {
    category?: string;
    sort?: ProductSort;
    limit?: number;
    offset?: number;
  } = {},
  client: SupabaseClient<Database> = createServerClient(),
): Promise<ListResponse<ProductListItem>> {
  const filterCategory = category && category !== 'all' ? category : null;
  let query: ProductQuery = applySort(
    baseProductQuery(client, filterCategory !== null),
    sort,
  );
  if (filterCategory) {
    query = query.eq('categories.category', filterCategory);
  }
  const range = toRange(limit, offset);
  if (range) query = query.range(range.from, range.to);

  const { data, error, count } = await query;
  if (error) throw error;
  const rows = (data ?? []) as (ProductsRow & {
    categories: { category: string | null } | null;
  })[];

  const gids = rows
    .map((row) => row.gid)
    .filter((gid): gid is string => typeof gid === 'string');
  const headImages = await fetchHeadImages(client, gids);

  return toListResponse(
    rows.map((row) =>
      toProductListItem(
        row,
        headImages.get(row.gid ?? '') ?? '',
        row.categories?.category ?? '',
      ),
    ),
    count ?? rows.length,
    limit,
    offset,
  );
}

export async function listRandomProducts(
  limit: number,
  client: SupabaseClient<Database> = createServerClient(),
): Promise<ListResponse<RecommendedProduct>> {
  // 활성 상품을 전부 조회한 뒤 서버에서 섞어 limit 개를 고른다(total 은 셔플 전 전체 개수)
  const {
    data: rows,
    count,
    error,
  } = await client
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true);
  if (error) throw error;

  const shuffled = [...((rows ?? []) as ProductsRow[])];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = shuffled.slice(0, Math.max(0, limit));

  const gids = picked
    .map((row) => row.gid)
    .filter((gid): gid is string => typeof gid === 'string');
  const headImages = await fetchHeadImages(client, gids);

  return toListResponse(
    picked.map((row) =>
      toRecommendedProduct(row, headImages.get(row.gid ?? '') ?? ''),
    ),
    count ?? ((rows ?? []) as ProductsRow[]).length,
    picked.length,
    0,
  );
}

export async function getProductDetail(
  id: string,
  client: SupabaseClient<Database> = createServerClient(),
): Promise<ProductDetailResponse | null> {
  const { data: row, error } = await client
    .from('products')
    .select('*, categories(category, sort_order)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const productRow = row as ProductsRow & {
    categories: { category: string | null } | null;
  };

  const detailImages = await fetchDetailImages(client, productRow.gid ?? '');
  // 대표 이미지를 맨 앞에 두되 중복은 제거하고, 없으면 상세 이미지로 대체
  const headImages = await fetchHeadImages(client, [productRow.gid ?? '']);
  const headUrl = headImages.get(productRow.gid ?? '') ?? '';
  const images = [
    ...(headUrl ? [headUrl] : []),
    ...detailImages.filter((url) => url !== headUrl),
  ];

  return toProductDetail(
    productRow,
    productRow.categories?.category ?? '',
    images,
  );
}
