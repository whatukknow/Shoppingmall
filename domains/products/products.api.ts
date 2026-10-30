import { apiClient } from '@/shared/lib/client';
import type { ApiResponse, ListResponse } from '@/shared/lib/api.types';
import { HOME_LIST_LIMIT } from '@/domains/home/home.constants';
import type { ProductListItem, ProductSort } from './products.types';
import type { ProductDetailResponse } from './products.types';

/** 상품 목록을 조회합니다. category 가 없거나 'all' 이면 전체를 조회합니다. */
export async function getProducts({
  category = 'all',
  sort = 'latest',
  limit = HOME_LIST_LIMIT.catalog,
  offset = 0,
}: {
  category?: string;
  sort?: ProductSort;
  limit?: number;
  offset?: number;
} = {}): Promise<ListResponse<ProductListItem>> {
  const response = await apiClient.get<
    ApiResponse<ListResponse<ProductListItem>>
  >('products', { params: { category, sort, limit, offset } });
  return response.data;
}

/** 상품 상세를 조회합니다. 존재하지 않는 id 는 404 ApiError 로 전파됩니다. */
export async function getProductDetail(
  id: string,
): Promise<ProductDetailResponse> {
  const response = await apiClient.get<ApiResponse<ProductDetailResponse>>(
    `products/${encodeURIComponent(id)}`,
  );
  return response.data;
}
