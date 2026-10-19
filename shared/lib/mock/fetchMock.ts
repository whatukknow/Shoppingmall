import { authData } from './datas/auth.mock';
import { homeData } from './datas/home.mock';
import { paymentData } from './datas/payment.mock';
import { productsData } from './datas/products.mock';

type MockMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type MockKey = `${MockMethod} ${string}`;
type MockRegistry = Record<MockKey, string>;

// 등록부 병합: 엔드포인트 키가 중복되면 조용히 덮어쓰지 않고 즉시 실패
export function mergeRegistries(...registries: MockRegistry[]): MockRegistry {
  const merged: MockRegistry = {};
  for (const registry of registries) {
    for (const [key, value] of Object.entries(registry) as [
      MockKey,
      string,
    ][]) {
      if (Object.prototype.hasOwnProperty.call(merged, key)) {
        throw new Error(`목데이터 엔드포인트 키가 중복되었습니다: ${key}`);
      }
      merged[key] = value;
    }
  }
  return merged;
}

// 모듈 로드 시 1회 병합
const mockRegistry = mergeRegistries(
  homeData,
  productsData,
  paymentData,
  authData,
);

export default function fetchMock(
  method: string,
  path: string,
  body?: string,
): string | undefined {
  void body;

  const endpoint = `${method.toUpperCase()} ${path.split('?')[0]}` as MockKey;
  return Object.prototype.hasOwnProperty.call(mockRegistry, endpoint)
    ? mockRegistry[endpoint]
    : undefined;
}
