import { productsData } from './datas/products.mock';

export default function fetchMockup(
  method: string,
  path: string,
  body?: string,
): string {
  switch (true) {
    case path.startsWith('products'):
      return productsData[path];
  }
  return JSON.parse('{test: value}');
}
