import { apiClient } from '@/shared/lib/client';
import type { CatalogProduct } from './data/productCatalog';

const ENDPOINTS = {
  list: 'products/list',
} as const;

export function getProductCatalog() {
  return apiClient.get<CatalogProduct[]>(ENDPOINTS.list);
}

export async function getProductById(id: string) {
  const productCatalog = await getProductCatalog();
  return productCatalog.find((product) => product.id === id);
}
