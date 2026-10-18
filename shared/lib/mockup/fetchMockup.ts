import { homeData } from './datas/home.mock';
import { productsData } from './datas/products.mock';

export default function fetchMockup(
  method: string,
  path: string,
  body?: string,
): string | undefined {
  // 현재 목업 어댑터는 정적 GET 응답만 제공합니다.
  void body;
  if (method !== 'GET') return undefined;

  const endpoint = path.split('?')[0];
  const mockData: Record<string, string> = {
    ...homeData,
    ...productsData,
  };

  return mockData[endpoint];
}
