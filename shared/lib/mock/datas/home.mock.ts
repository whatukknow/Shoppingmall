import {
  popularProducts,
  shareProducts,
} from '@/domains/home/data/homeProducts';

export const homeData: Record<`GET ${string}`, string> = {
  'GET home/share-products': JSON.stringify(shareProducts),
  'GET home/popular-products': JSON.stringify(popularProducts),
};
