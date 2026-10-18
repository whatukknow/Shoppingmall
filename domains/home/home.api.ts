import { apiClient } from '@/shared/lib/client';
import type { HomeProduct, PantryProduct } from './data/homeProducts';

const ENDPOINTS = {
  shareProducts: 'home/share-products',
  pantryProducts: 'home/pantry-products',
} as const;

export async function getHomeProducts() {
  const [shareProducts, pantryProducts] = await Promise.all([
    apiClient.get<HomeProduct[]>(ENDPOINTS.shareProducts),
    apiClient.get<PantryProduct[]>(ENDPOINTS.pantryProducts),
  ]);

  return { shareProducts, pantryProducts };
}
