import { homeData } from './datas/home.mock';
import { productsData } from './datas/products.mock';

export default function fetchMockup(
  method: string,
  path: string,
  body?: string,
): string | undefined {
  void body;
  if (method !== 'GET') return undefined;

  const endpoint = path.split('?')[0];
  return { ...homeData, ...productsData }[endpoint];
}
