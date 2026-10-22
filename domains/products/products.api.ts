import { apiClient } from '@/shared/lib/client';
import type { ApiResponse, ListResponse } from '@/shared/lib/api.types';
import { HOME_LIST_LIMIT } from '@/domains/home/home.constants';
import type { CatalogSummary } from './products.types';
import type { CatalogProduct } from './data/productCatalog';

/** 상품 목록을 조회합니다. category 가 없거나 'all' 이면 전체를 조회합니다. */
export async function getProducts({
  category = 'all',
  limit = HOME_LIST_LIMIT.catalog,
}: { category?: string; limit?: number } = {}): Promise<CatalogSummary[]> {
  const response = await apiClient.get<
    ApiResponse<ListResponse<CatalogSummary>>
  >('products', { params: { category, limit } });
  return response.data.list;
}

/** 목업 제거 후 목록·상세 화면의 연결 구조만 유지합니다. TODO: 실제 상품 조회를 연결합니다. */
export async function getProductCatalog(): Promise<CatalogProduct[]> {
  return [];
}

export async function getProductById(id: string) {
  const products = await getProductCatalog();
  return products.find(
    (product) => product.id !== undefined && String(product.id) === id,
  );
}
