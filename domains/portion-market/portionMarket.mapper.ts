import type { PortionMarketDetailResponse } from './portionMarket.api';
import type {
  Product,
  Upload,
  PortionMarketPage,
  PortionMarketProduct,
} from './portionMarket.types';

// ─────────────────────────────────────────────
// 설정 (바꾸고 싶으면 여기만 고치기)
// ─────────────────────────────────────────────

// 조리 순서를 보여줄 키트
const KIT_ID = 'LP-002';

// 상단 사진을 찾을 페이지 이름 (UPLOADS.page)
const HERO_PAGE = '소분 마켓 / 상세 소개';

// 화면에 보여줄 상품 칸. 위에서부터 순서대로 그려짐
// 제목·설명 문구는 데이터에 없어서 여기서 정함
const SECTIONS = [
  {
    group: '채소·과일',
    title: '필요한 만큼, 싱그럽게.',
    description: '채소와 과일을 작은 식탁에 맞게 골라 담아요.',
  },
  {
    group: '육류',
    title: '고기도 필요한 만큼.',
    description: '함께 나눠 담는 장보기로 한두 사람의 식탁을 채워요.',
  },
];

// ─────────────────────────────────────────────
// 작은 도우미 함수들
// ─────────────────────────────────────────────

// 사진 한 장의 주소 만들기 → /uploads/{id}.{extension}
const toImageUrl = (upload?: Upload) =>
  upload ? `/uploads/${upload.id}.${upload.extension}` : undefined;

// 상품의 대표 사진 찾기 (gid가 G-상품id 이고, 대표 사진인 것)
const findProductImage = (product: Product, uploads: Upload[]) =>
  toImageUrl(
    uploads.find(
      (upload) => upload.gid === `G-${product.id}` && upload.head_img,
    ),
  );

// 테이블의 상품 → 화면용 상품
const toPortionMarketProduct = (
  product: Product,
  uploads: Upload[],
): PortionMarketProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  imageUrl: findProductImage(product, uploads),
});

// ─────────────────────────────────────────────
// 메인 규칙: 테이블 4개 → 소분마켓 페이지 데이터
// ─────────────────────────────────────────────

export function toPortionMarketPage({
  categories,
  products,
  uploads,
  relatedProducts,
}: PortionMarketDetailResponse): PortionMarketPage {
  // ① 상단 사진: 소분마켓 페이지에 올라간 대표 사진
  const heroUpload = uploads.find(
    (upload) => upload.page === HERO_PAGE && upload.head_img,
  );

  // ② 키트와 조리 순서
  const kit = products.find((product) => product.id === KIT_ID);

  const steps = relatedProducts
    .filter((related) => related.product_id === KIT_ID)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((related, index) => {
      const product = products.find((p) => p.id === related.id);
      return {
        no: String(index + 1).padStart(2, '0'), // 1 → '01'
        title: product?.name ?? '',
        body: product?.description ?? '',
        imageUrl: product ? findProductImage(product, uploads) : undefined,
      };
    });

  // ③ 상품 칸: 카테고리별로 노출 중인 상품을 순서대로
  const sections = SECTIONS.map((section) => {
    const category = categories.find((c) => c.product_group === section.group);

    const sectionProducts = products
      .filter((p) => p.category_id === category?.id && p.is_on)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => toPortionMarketProduct(p, uploads));

    return {
      categoryId: category?.id ?? 0,
      title: section.title,
      description: section.description,
      products: sectionProducts,
    };
  }).filter((section) => section.products.length > 0); // 상품 없는 칸은 숨김

  return {
    heroImageUrl: toImageUrl(heroUpload),
    kitName: kit?.name ?? '',
    steps,
    sections,
  };
}
