import { apiClient } from '@/shared/lib/client';
import type {
  Category,
  Product,
  Upload,
  RelatedProduct,
} from './portionMarket.types';

// 요청할 주소 모음 (팀 README 방식)
const ENDPOINTS = {
  detail: 'portion-market/detail',
};

// portion-market/detail 응답 모양 (ERD의 테이블 4개)
export type PortionMarketDetailResponse = {
  categories: Category[];
  products: Product[];
  uploads: Upload[];
  relatedProducts: RelatedProduct[];
};

// 소분마켓 데이터 요청
export async function getPortionMarketDetail(): Promise<PortionMarketDetailResponse> {
  const response = await apiClient.get<PortionMarketDetailResponse | string>(
    ENDPOINTS.detail,
  );

  // 목데이터는 JSON 글자로 오기 때문에, 글자면 객체로 바꿔줌
  if (typeof response === 'string') {
    return JSON.parse(response);
  }
  return response;
}
