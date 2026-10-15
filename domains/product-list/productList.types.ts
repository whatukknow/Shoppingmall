// 상품 목록 화면이 쓰는 데이터 모양
// 전체 상품, 카테고리별 상품 페이지가 같이 씀

// 목록에 나오는 상품 하나 (공통 ProductCard에 넘길 값)
export type ProductListItem = {
  id: string;
  name: string;
  price: number;
  href: string;
  imageUrl?: string;
};

// 목록 페이지 하나
export type ProductListPage = {
  title: string; // 예: '전체 상품', '채소'
  items: ProductListItem[];
};