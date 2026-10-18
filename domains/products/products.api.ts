import { apiClient } from '@/shared/lib/client';
import type { CatalogProduct } from './data/productCatalog';

const ENDPOINTS = {
  list: 'products/list',
} as const;

export function getProductCatalog() {
  return apiClient.get<CatalogProduct[]>(ENDPOINTS.list);
}
