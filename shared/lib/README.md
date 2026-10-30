# apiClient 사용

공통 apiClient는 모든 요청을 실제 `/api` 라우트로 보냅니다. 목업 계층(fetchMock)은 제거되었습니다.

```ts
const ENDPOINTS = {
  list: 'products',
};

const response = await apiClient.get<ProductList>(ENDPOINTS.list);
```

## 동작 방식

- 브라우저: 상대 URL `/api/{path}` 로 fetch 합니다.
- 서버 컴포넌트(SSR): `next/headers`에서 호스트·쿠키를 읽어 절대 URL로 fetch 하고 `cache: 'no-store'`를 사용합니다.
- 비 2xx 응답은 `HTTP_ERROR` ApiError 로 변환됩니다.

## 실제 라우트

| 화면 데이터  | Endpoint                                       | 라우트 파일                                  |
| ------------ | ---------------------------------------------- | -------------------------------------------- |
| 홈 상품·추천 | `products`, `users/me/product-recommendations` | `app/api/products`, `app/api/users/me/...`   |
| 회원         | `auth/*`, `users/me`                           | `app/api/auth/*`, `app/api/users/me`         |
| 결제         | `payment/items`                                | `app/api/payment/items`                      |
| 팟           | `pods`, `products/:id/pods`                    | `app/api/pods`, `app/api/products/[id]/pods` |
