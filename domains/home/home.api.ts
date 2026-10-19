import { apiClient } from '@/shared/lib/client';
import type { HomeProduct } from './data/homeProducts';

const ENDPOINTS = {
  shareProducts: 'home/share-products',
  popularProducts: 'home/popular-products',
} as const;

export async function getHomeProducts() {
  const [shareProducts, popularProducts] = await Promise.all([
    apiClient.get<HomeProduct[]>(ENDPOINTS.shareProducts),
    apiClient.get<HomeProduct[]>(ENDPOINTS.popularProducts),
  ]);

  return { shareProducts, popularProducts };
}
