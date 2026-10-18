import {
  popularProducts,
  pantryProducts,
  shareProducts,
} from '@/domains/home/data/homeProducts';

export const homeData: Record<string, string> = {
  'home/share-products': JSON.stringify(shareProducts),
  'home/popular-products': JSON.stringify(popularProducts),
  'home/pantry-products': JSON.stringify(pantryProducts),
};
