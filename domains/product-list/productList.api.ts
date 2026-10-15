import { apiClient } from '@/shared/lib/client';
import type { Category, Product, Upload } from '@/shared/types/schema';

// 요청할 주소 모음. 상돈님이 정한 실제 주소와 다르면 여기만 고치기
const ENDPOINTS = {
  categories: 'categories/list',
  products: 'products/list',
  uploads: 'uploads/list',
};

// 목데이터는 JSON 글자로 오기 때문에, 글자면 객체로 바꿔주는 도우미
const parse = <T>(response: T | string): T =>
  typeof response === 'string' ? JSON.parse(response) : response;

// 상품 목록 페이지에 필요한 테이블 3개를 한 번에 요청
export async function getProductListSource() {
  const [categories, products, uploads] = await Promise.all([
    apiClient.get<Category[] | string>(ENDPOINTS.categories),
    apiClient.get<Product[] | string>(ENDPOINTS.products),
    apiClient.get<Upload[] | string>(ENDPOINTS.uploads),
  ]);

  return {
    categories: parse(categories),
    products: parse(products),
    uploads: parse(uploads),
  };
}

export type ProductListSource = Awaited<ReturnType<typeof getProductListSource>>;