import { authData } from './datas/auth.mock';
import { homeData } from './datas/home.mock';
import { paymentData } from './datas/payment.mock';
import { podsData } from './datas/pods.mock';
import { productsData } from './datas/products.mock';
import { usersData } from './datas/users.mock';

type MockMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type MockKey = `${MockMethod} ${string}`;
type MockRegistry = Record<MockKey, string>;

// 목업으로 스크린 온 상태(401 등)를 흉내 낼 때 표시하는 마커 응답입니다.
// client.ts 가 마커를 읽어 ApiError(status, 'MOCK_ERROR', message) 로 바꿉니다.
export function mockError(status: number, message: string): string {
  return JSON.stringify({ __mockError: { status, message } });
}

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
  podsData,
  paymentData,
  authData,
  usersData,
);

// limit·offset 은 페이징 파라미터이므로 키 매칭에서 제외합니다.
function toExactKey(method: string, path: string): MockKey {
  const [rawPath, rawQuery] = path.split('?');
  const endpoint = `${method.toUpperCase()} ${rawPath}`;

  if (rawQuery === undefined) return endpoint as MockKey;

  const kept = rawQuery
    .split('&')
    .filter(Boolean)
    .filter(
      (pair) => !pair.startsWith('limit=') && !pair.startsWith('offset='),
    );

  if (kept.length === 0) return endpoint as MockKey;
  return `${endpoint}?${kept.join('&')}` as MockKey;
}

export default function fetchMock(
  method: string,
  path: string,
  body?: string,
): string | undefined {
  void body;

  // (a) 쿼리 포함 키 우선 매칭 (limit·offset 제외)
  const exactKey = toExactKey(method, path);
  if (Object.prototype.hasOwnProperty.call(mockRegistry, exactKey)) {
    return mockRegistry[exactKey];
  }

  // (b) 기존처럼 쿼리 없는 경로 키 매칭
  const endpoint = `${method.toUpperCase()} ${path.split('?')[0]}` as MockKey;
  return Object.prototype.hasOwnProperty.call(mockRegistry, endpoint)
    ? mockRegistry[endpoint]
    : undefined;
}
