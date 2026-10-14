// TODO: 테스트를 위해 임시 정의한 interface. 추후 삭제
export interface Product {
  name: string;
}
export interface ProductList {
  list: Product[];
}

export const productsData: { [key: string]: string } = {
  'products/list': '{"list": [{"name": "상품명"}]}',
};
