/** 숫자 가격을 한국어 로케일의 천 단위 표기와 원 단위로 변환합니다. */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}
