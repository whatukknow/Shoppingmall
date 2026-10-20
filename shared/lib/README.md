> 현재 삭제 범위는 홈·상품 샘플 목록입니다. 해당 엔드포인트는 빈 목록을 반환합니다.
> 회원·결제 목업과 공통 apiClient/fetchMock 계층은 유지합니다.

# Mock data 설정

도메인이 정해지면 datas에 도메인에 해당하는 목데이터를 정리하고, `fetchMock.ts`에서 도메인에 따라 분기 설정을 진행하세요.

## `lib/mock/datas`

도메인별 Mock data를 정의하는 폴더입입니다. 각 도메인별로 파일을 생성하시고 Endpoint에 따라 데이터를 분류하세요.

파일명 규칙: `도메인.mock.ts`
객체명 규칙: `도메인Data`

예) 상품 목록 가져오기 (products/list)

도메인 Mock 데이터 파일 및 객체 생성

> lib/mock/datas/products.mock.ts

```ts
export const productsData: { [key: string]: string } = {
  'products/list': '{"list": [{"name": "상품명"}]}',
};
```

## `lib/mock/fetchMock.ts`

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

## 현재 화면에서 사용하는 목업 경로

| 화면 데이터       | Endpoint                | 목업 파일                |
| ----------------- | ----------------------- | ------------------------ |
| 홈 함께 나눌 품목 | `home/share-products`   | `datas/home.mock.ts`     |
| 홈 인기 상품      | `home/popular-products` | `datas/home.mock.ts`     |
| 상품 목록         | `products/list`         | `datas/products.mock.ts` |

각 화면은 도메인 API 함수를 통해 `apiClient.get`을 호출합니다. `fetchMock.ts`는
Endpoint에 맞는 JSON 문자열을 반환하고, `client.ts`가 객체로 파싱합니다. 현재 데이터는
시안용 정적 목업이며 실제 서버나 DB에 연결되지 않습니다.
