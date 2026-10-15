import type {
  Category,
  Product,
  Upload,
  RelatedProduct,
} from '@/domains/portion-market/portionMarket.types';

const categories: Category[] = [
  { id: 1, product_group: '채소·과일', sort_order: 1 },
  { id: 2, product_group: '육류', sort_order: 2 },
  { id: 3, product_group: '소스', sort_order: 3 },
];

// 상품 하나를 만드는 도우미. 바뀌는 값만 넣고 나머지는 기본값
const product = (
  id: string,
  category_id: number,
  name: string,
  description: string,
  sort_order: number,
): Product => ({
  id,
  category_id,
  name,
  brand_type: '일반 상품',
  description,
  quantity: 0,
  price: 0,
  quantity_unit: '',
  is_on: true,
  details: null,
  sort_order,
});

const products: Product[] = [
  product(
    'LP-002',
    3,
    '홈메이드 바질페스토 150g',
    '파스타와 빵에 취향대로 곁들이는 맛.',
    1,
  ),
  product('LP-014', 1, '한 줌의 바질', '페스토부터 파스타 마무리까지.', 1),
  product(
    'LP-015',
    1,
    '한 끼 토마토',
    '샐러드와 샌드위치에 곁들이기 좋은 제안.',
    2,
  ),
  product(
    'LP-016',
    1,
    '조금씩 담는 채소 믹스',
    '한 가지 요리보다 여러 끼를 떠올리는 장보기.',
    3,
  ),
  product(
    'LP-017',
    1,
    '작은 딸기 한 팩',
    '그대로 먹거나 빵과 함께 곁들여요.',
    4,
  ),
  product(
    'LP-018',
    1,
    '컬러 방울토마토',
    '도시락과 샐러드에 작은 색을 더해요.',
    5,
  ),
  product(
    'LP-019',
    1,
    '잎채소 소분 믹스',
    '샐러드부터 곁들임까지 조금씩 즐겨요.',
    6,
  ),
  product('LP-020', 2, '구이용 소고기 소분', '', 1),
];

// 사진 하나를 만드는 도우미
const upload = (
  id: string,
  gid: string,
  extension: string,
  location: string,
  page: string,
): Upload => ({
  id,
  gid,
  original_name: '',
  extension,
  byte_size: 0,
  location,
  head_img: true,
  sort_order: 0,
  page,
});

const uploads: Upload[] = [
  upload(
    '0ff4363b-7b22-40b9-9672-638cc471db76',
    'G-PAGE-79-170',
    'png',
    'editor',
    '소분 마켓 / 상세 소개',
  ),
  upload(
    '0492e5c8-55e7-4372-83ce-7d3849fe5874',
    'G-LP-014',
    'jpeg',
    'list',
    '',
  ),
  upload(
    '684993d2-0960-452a-81e3-c4f9943b9e7a',
    'G-LP-015',
    'jpeg',
    'list',
    '',
  ),
  upload(
    '4255fba5-179f-4eda-aa6c-6a1937eab289',
    'G-LP-016',
    'jpeg',
    'list',
    '',
  ),
  upload(
    '81014440-81b9-4539-9812-2faf78bf1a0c',
    'G-LP-017',
    'jpeg',
    'list',
    '',
  ),
  upload(
    'a737d445-ae08-45d4-8c69-acae501b424a',
    'G-LP-018',
    'jpeg',
    'list',
    '',
  ),
  upload(
    '69c33b37-cab5-49b6-ac36-bb6d900095b4',
    'G-LP-019',
    'jpeg',
    'list',
    '',
  ),
  upload(
    '1ba8094b-ca36-426c-a588-325448306312',
    'G-LP-020',
    'jpeg',
    'list',
    '',
  ),
];

// 키트(LP-002)의 관련 상품. sort_order가 조리 순서
const relatedProducts: RelatedProduct[] = [
  { id: 'LP-014', product_id: 'LP-002', sort_order: 1 },
  { id: 'LP-015', product_id: 'LP-002', sort_order: 2 },
  { id: 'LP-016', product_id: 'LP-002', sort_order: 3 },
];

// 팀 규칙: 엔드포인트를 열쇠로, 값은 JSON 글자로
export const portionMarketData: { [key: string]: string } = {
  'portion-market/detail': JSON.stringify({
    categories,
    products,
    uploads,
    relatedProducts,
  }),
};
