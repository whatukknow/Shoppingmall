// 홈 상품 목업은 제거했습니다. 공통 응답 구조는 유지합니다.
export const homeData: Record<`GET ${string}`, string> = {
  'GET home/share-products': JSON.stringify([]),
  'GET home/popular-products': JSON.stringify([]),
};
