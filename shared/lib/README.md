# Mockup data 설정

도메인이 정해지면 datas에 도메인에 해당하는 목데이터를 정리하고, `fetchMockup.ts`에서 도메인에 따라 분기 설정을 진행하세요.

## `lib/mockup/datas`

도메인별 Mock data를 정의하는 폴더입입니다. 각 도메인별로 파일을 생성하시고 Endpoint에 따라 데이터를 분류하세요.

파일명 규칙: `도메인.mock.ts`
객체명 규칙: `도메인Data`

예) 상품 목록 가져오기 (products/list)

도메인 Mock 데이터 파일 및 객체 생성

> lib/mockup/datas/products.mock.ts

```ts
export const productsData: { [key: string]: string } = {
  'products/list': '{"list": [{"name": "상품명"}]}',
};
```

## `lib/mockup/fetchMockup.ts`

```ts
switch (true) {
  case path.startsWith('products'):
    return productsData[path];
}
```

기존 분기에서 추가한 도메인으로 시작하는 case를 추가하여 도메인의 Mock data에서 path에 해당하는 값을 반환한다.

페이지처리나 post 결과에 대한 처리는 추후에 정리

# apiClient 사용

```ts
const ENDPOINTS = {
  list: 'products/list',
};

const response = await apiClient.get<ProductList>(ENDPOINTS.list);
```
