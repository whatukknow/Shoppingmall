import { productsData } from './datas/products.mock';
import { portionMarketData } from './datas/portionMarket.mock';

export default function fetchMockup(
  method: string,
  path: string,
  body?: string,
): string | undefined {
  const endpoint = path.split('?')[0];
  const mockData: Record<string, string> = {
    ...productsData,
    ...portionMarketData,
  };

  return mockData[endpoint];
}
