// 상품 목록 목업은 제거했습니다. 공통 응답 구조는 유지합니다.
export const productsData: Record<`GET ${string}`, string> = {
  'GET products/list': JSON.stringify([]),
};
