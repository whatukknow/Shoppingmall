import { productCatalog } from '@/domains/products/data/productCatalog';

export const productsData: Record<`GET ${string}`, string> = {
  'GET products/list': JSON.stringify(productCatalog),
};
