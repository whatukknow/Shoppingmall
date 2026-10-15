// ─────────────────────────────────────────────
// API가 주는 모양 (데이터 스키마의 테이블과 같게)
// ─────────────────────────────────────────────

// CATEGORIES: 상품 카테고리
export type Category = {
  id: number;
  product_group: string;
  sort_order: number;
};

// PRODUCTS: 상품
export type Product = {
  id: string;
  category_id: number;
  name: string;
  brand_type: string;
  description: string;
  quantity: number;
  price: number;
  quantity_unit: string;
  is_on: boolean;
  details: {
    키트설명?: string;
    키트제공팁?: string;
  } | null;
  sort_order: number;
};

// UPLOADS: 미디어(사진)
export type Upload = {
  id: string;
  gid: string;
  original_name: string;
  extension: string;
  byte_size: number;
  location: string;
  head_img: boolean;
  sort_order: number;
  page: string;
};

// RELATED_PRODUCTS: 관련 상품
export type RelatedProduct = {
  id: string;
  product_id: string;
  sort_order: number;
};

// ─────────────────────────────────────────────
// 화면이 쓰는 모양 (위 테이블들을 엮어서 만듦)
// ─────────────────────────────────────────────

// 캐러셀에 들어가는 상품 하나
export type PortionMarketProduct = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
};

// 조리 순서 한 단계 (01, 02, 03)
export type PortionMarketStep = {
  no: string;
  title: string;
  body: string;
  imageUrl?: string;
};

// 상품 묶음 하나 (채소·과일 칸, 고기 칸)
export type PortionMarketSection = {
  categoryId: number;
  title: string;
  description: string;
  products: PortionMarketProduct[];
};

// 소분마켓 페이지 전체
export type PortionMarketPage = {
  heroImageUrl?: string;
  kitName: string;
  steps: PortionMarketStep[];
  sections: PortionMarketSection[];
};
