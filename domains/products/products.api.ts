import type { CatalogProduct } from './data/productCatalog';

/** 목업 제거 후 목록·상세 화면의 연결 구조만 유지합니다. TODO: 실제 상품 조회를 연결합니다. */
export async function getProductCatalog(): Promise<CatalogProduct[]> {
  return [];
}

export async function getProductById(id: string) {
  const products = await getProductCatalog();
  return products.find(
    (product) => product.id !== undefined && String(product.id) === id,
  );
}
