import { productCatalog } from '@/domains/products/data/productCatalog';

export const productsData: Record<string, string> = {
  'products/list': JSON.stringify(productCatalog),
};
