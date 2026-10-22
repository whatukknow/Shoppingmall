# Little Portions 공통 컴포넌트 사용 안내

이 문서는 페이지 담당자가 공통 UI를 가져다 쓸 때 **컴포넌트가 처리하는 범위**, **호출부가 준비해야 할 데이터와 동작**, **현재 연결 상태와 제한**을 빠르게 구분하도록 작성했습니다.

공통 컴포넌트는 `shared/components/`에 두고, 외부 사용 시에는 가능하면 `@/shared/components` 진입점에서 가져옵니다. UI 프리미티브(`Button`, `Input`, `Badge`, `Card`, `Dialog`)는 반복되는 모양과 기본 접근성을 제공하고, 도메인 컴포넌트는 상품·팟 등 화면 단위를 조합합니다. 컴포넌트 자체가 API나 로그인 상태, 결제 조건을 추측하지 않습니다.

```tsx
import {
  ActionDialog,
  BrandLogo,
  Button,
  CarouselContainer,
  EmptyState,
  FormField,
  MastHead,
  PotCard,
  ProductGrid,
  StatusBadge,
} from '@/shared/components';
```

기준 UI는 Figma PC `4601:362`, 공통 요소 `4590:21`, 취소 대화상자 `4592:466` / `4604:831`을 참고했습니다. Figma에 별도 등록된 컴포넌트라는 뜻은 아니며, 실제 데이터·정책은 기능 담당자가 연결해야 합니다.

## 먼저 기억할 책임 경계

| 공통 컴포넌트가 담당                                             | 페이지/기능 담당자가 담당                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| 반복 레이아웃, 텍스트 구조, 버튼/링크 렌더링, 전달받은 상태 표시 | 실제 상품·팟 데이터, 사용자 인증, API 요청, 유효성 검사와 저장 |
| 버튼을 눌렀을 때 제공된 콜백 호출                                | 콜백이 할 일, 성공/실패 처리와 사용자 안내                     |
| 제공된 상태를 정해진 배지 문구로 표현                            | 상태를 확정하는 서버 규칙, 신청·취소·결제 가능 조건            |
| 빈 상태, 로딩 이후 대기/완료 문구의 공통 틀 제공                 | 어느 상황에 표시할지, 재시도·목록 이동 동작                    |
| 화면 항목을 지정 개수로 나누고 슬라이드 화살표 제공              | 항목 목록, 한 장에 보일 개수, 카드 모양과 이동할 주소          |

실제 API·계정 상태가 연결되지 않은 화면은 “예시 데이터”, “연결 준비 중”으로 표시하세요. 예시 수량·인기 순위를 실제 서비스 결과처럼 표현하지 않습니다.

## 메인 페이지 섹션 구성

`app/page.tsx`는 Next.js가 `/` 주소에 연결하는 라우트 진입점입니다. 파일명은 프레임워크 규칙이므로 유지하고, 메인 화면의 각 콘텐츠는 역할이 드러나는 `domains/home/components/` 파일로 나눠 조합합니다. 상품 목록의 `/products` 라우트인 `app/products/page.tsx`도 같은 이유로 파일명을 유지합니다.

| 파일                          | 화면 역할                                     |
| ----------------------------- | --------------------------------------------- |
| `HomeHero.tsx`                | 메인 전체 폭 배경 영상과 소개 문구            |
| `HowItWorksSection.tsx`       | 함께 나누는 방식 안내                         |
| `ShareProductsCarousel.tsx`   | 함께 나눌 품목 캐러셀                         |
| `PopularProductsCarousel.tsx` | 인기 상품 예시 캐러셀                         |
| `BrandStorySection.tsx`       | 브랜드 이야기 영역                            |
| `TasteFinderSection.tsx`      | 취향 찾기 영역                                |
| `HomeProductCard.tsx`         | 위 두 캐러셀에서 재사용하는 메인 전용 카드    |
| `HomeProductIllustration.tsx` | 이미지 자료 연결 전 상품 종류별 임시 일러스트 |
| `../data/homeProducts.ts`     | 두 캐러셀에 쓰는 예시 품목 데이터             |

메인 전용 카드는 `shared/components/ProductCard`와 용도가 다릅니다. 상품 API 연동 시 `homeProducts.ts`의 예시 배열을 실제 데이터로 교체하고, 카드/이미지 표시 정책을 화면 담당자와 맞추세요. 정적 리소스는 저장소 루트 `uploads/`에 보관하고, 히어로 영상은 `uploads/videos/home-header.mp4`에서 `app/uploads/[...assetPath]/route.ts`를 통해 제공합니다.

이전 시안의 `YourPantry*`, `FreshPick*`, `PortionMarket`, `StoryCard*` 홈 조각은 새 메인에서 참조하지 않아 제거했습니다. 새 시안에 필요한 섹션은 위 역할별 파일을 확장합니다.

## 페이지 배경과 브랜드

### `ButterBackground`

`#FFF8D6` 공통 버터색 배경을 적용하는 컨테이너입니다. 현재 `app/layout.tsx`에서 페이지 콘텐츠를 감쌉니다. 공통 배경을 쓰는 별도 영역에도 사용할 수 있습니다.

```tsx
<ButterBackground className="px-6 py-8">{children}</ButterBackground>
```

컴포넌트는 `--butter` CSS 변수를 사용합니다. 박스/카드마다 다른 배경색을 주지 말고 바탕이 이어져야 하는 콘텐츠는 투명 배경으로 둡니다. 버튼, 배지, 일러스트처럼 의미 전달에 필요한 색은 별도로 사용할 수 있습니다.

### `BrandLogo`

영문 워드마크 `Little Portions`의 대소문자, `font-heading`, 자간을 한 곳에서 통일합니다. 헤더/푸터에 별도 텍스트를 직접 적지 말고 재사용하세요.

```tsx
<BrandLogo className="text-primary text-[22px]" />
```

`className`은 크기·색상·배치만 덮어씁니다. 폰트 계열을 개별 로고마다 바꾸면 공통화가 깨집니다.

## 헤더와 내비게이션

### `MastHead`

사이트 상단 공통 헤더입니다. `app/layout.tsx`에서 `variant="header"`로 한 번 배치합니다. 홈에서는 영상 위에 투명 오버레이로 올라가고, 내부 페이지에서는 일반 상단 바가 됩니다. 따라서 페이지 본문에서 두 번째 헤더를 만들지 마세요.

현재 헤더 구성은 다음과 같습니다.

- 왼쪽: `BrandLogo`
- 주요 메뉴: 소분마켓, 취향 찾기, 브랜드 이야기
- 오른쪽: 로그인(로그인 후에는 전달된 사용자 이름), 함께 나누기
- 함께 나누기 링크는 홈의 `#how-it-works` 섹션으로 연결

```tsx
<MastHead
  variant="header"
  user={sessionUser ? { name: sessionUser.name } : null}
  login={{ onClick: openLogin }}
  account={{ onClick: openAccount }}
  navigation={{
    products: { href: '/products' },
    recommendation: { onClick: openTaste },
    about: { onClick: openBrandStory },
  }}
/>
```

위 함수형 예시는 클릭 동작이 필요한 Client Component 안에서만 사용하세요. Server Component에서 함수 props를 내려보내지 않습니다. 실제 루트 layout은 아직 세션/로그인 동작을 전달하지 않으므로 기본 상태의 로그인 메뉴는 비활성입니다. `user` 이름, 로그인·계정 동작은 담당 인증 흐름이 연결해야 합니다.

### `MainNavigation`, `NavigationAction`

`MainNavigation`은 주요 메뉴 3개를 표시합니다. 기본 링크는 소분마켓 `/products`, 취향 찾기 `/#find-your-taste`, 브랜드 이야기 `/about`입니다. 현재 경로 표시도 처리합니다.

`NavigationAction`은 목적지에 따라 링크 또는 버튼을 렌더링합니다.

- `{ href: '/products' }`: Next 링크로 이동
- `{ onClick: handler }`: 버튼으로 콜백 실행
- `target` 생략: 준비 중 비활성 버튼

두 종류를 한 항목에 동시에 주지 마세요. 존재하지 않는 경로를 임의로 만들어 연결하지 말고, 화면이 없다면 콜백 또는 비활성 상태를 유지합니다.

## 상품 목록, 카드, 캐러셀

### `ProductCard`와 `ProductGrid`

`ProductCard`는 상품 이미지 영역, 이름, 가격, 담기 버튼을 제공합니다. 상세 링크와 장바구니 동작은 분리되어 있습니다. `imageUrl`이 없으면 임의 사진은 만들지 않고 비어 있는 정사각 영역과 스크린리더 안내를 둡니다.

`ProductGrid`는 상품을 2/3/4열로 배치하고 상품이 없으면 `EmptyState`를 표시합니다.

```tsx
<ProductGrid
  products={products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    href: `/products/${product.id}`,
    imageUrl: product.imageUrl,
  }))}
  onAddToCart={(productId) => addToCart(productId)}
  emptyTitle="상품을 준비하고 있어요"
/>
```

상품 필드와 가격 형식은 데이터 소유 페이지가 맞춥니다. `onAddToCart`에는 현재 카드의 상품 ID가 들어오며, 서버 저장/장바구니 상태 관리는 호출부 책임입니다. 현재 전체 상품 페이지에는 실제 상품 데이터가 연결되어 있지 않습니다.

### `CarouselContainer`

항목을 정해진 개수씩 페이지 단위로 자르는 공통 캐러셀입니다. 이전/다음 화살표, 비활성 경계, 현재 항목 범위를 표시합니다. 자동재생·무한순환·스와이프는 구현되어 있지 않습니다.

```tsx
<CarouselContainer
  items={items}
  itemsPerSlide={5}
  getItemKey={(item) => item.id}
  ariaLabel="함께 나눌 품목"
  renderItem={(item, index) => (
    <ProductCardView item={item} position={index + 1} />
  )}
/>
```

- `itemsPerSlide={5}`와 15개 항목이면 총 3장입니다. 다음을 두 번 누르면 마지막 장에 도달합니다.
- 항목 10개와 5개씩 표시하면 총 2장입니다.
- `index`는 **0부터 시작하는 전체 목록 기준 위치**입니다. 두 번째 장에서도 5, 6… 순번에 맞춰 순위를 만들 수 있습니다.
- 각 항목의 `getItemKey`는 목록 전체에서 유일해야 합니다.
- 현재 지정 개수는 뷰포트별로 자동 변경되지 않습니다. 5열 사용은 넓은 화면용이며 작은 폭에서도 같은 수가 유지됩니다. 반응형 카드 수가 필요하면 호출부와 컴포넌트 동작을 함께 조정해야 합니다.
- 좌우 화살표 공간을 고려해 사용처에서 좌우 여백을 확보하세요.

홈의 두 상품 블럭은 모두 `CarouselContainer`를 사용합니다. 별도 배너형 `CurationCarousel`은 실제 사용처가 없어 제거했습니다.

홈의 두 예시 캐러셀은 `domains/home/components/ShareProductsCarousel.tsx`와 `PopularProductsCarousel.tsx`에서 각각 사용합니다. 첫 품목 캐러셀은 15개 예시/5개씩 3장, 인기 상품 캐러셀은 10개 예시/5개씩 2장입니다. 인기 순위는 실제 판매 데이터가 아니라고 화면에 표시되어 있습니다. 상품 카드와 데이터가 생기면 이 예시 배열을 담당 API 결과로 교체하세요.

## 입력과 액션

### `FormField`

라벨, input/select, 도움말, 오류 문구를 연결합니다. label/id, `aria-describedby`, 오류 시 `aria-invalid`, 오류의 `role="alert"`을 처리합니다.

```tsx
<FormField
  label="이메일"
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
  required
  description="로그인에 사용할 이메일"
  error={emailError}
/>

<FormField as="select" label="선호하는 맛" value={taste} onChange={handleTasteChange}>
  <option value="fresh">산뜻한 맛</option>
  <option value="rich">진한 맛</option>
</FormField>
```

상태, 유효성 검사, 서버 저장은 페이지가 담당합니다. `id`를 직접 주지 않으면 고유 ID를 생성합니다. 필수 표시와 브라우저 검사에 필요한 `required`를 호출부에서 전달하세요.

### `Button`, `Input`, `Badge`, `Card`, `Dialog`

`shared/components/ui/` 안의 공통 원시 UI입니다. 새 동작을 만들기보다 의미에 맞는 variant/props를 전달해 사용합니다.

- `Button`: 버튼 크기, 색상 변형, `disabled`, `onClick` 처리
- `Input`: 폼의 기본 입력 모양. 오류와 설명 연결은 `FormField`를 우선 사용
- `Badge`: 전달된 상태를 짧게 표시
- `Card`: 자식 요소의 레이아웃/간격 컨테이너. 현재 별도 배경색이나 테두리 없이 부모 배경을 보여줌
- `Dialog`: 모달 기본 구조와 키보드 포커스 동작. 실제 문구와 버튼 동작은 호출부 제공

컴포넌트의 간격/색을 페이지에서 다시 덮기 전에 `shared/components/ui/*.tsx`의 현재 variant를 확인하세요. 공통 토큰을 바꿀 때는 전체 사용처의 화면 영향도 확인합니다.

### `ActionDialog`, `CancellationDialog`, `NotificationDialog`

열림 상태를 호출부가 관리하는 확인/알림 창입니다. 다이얼로그는 액션을 대신 실행하지 않습니다.

```tsx
<ActionDialog
  open={open}
  onOpenChange={setOpen}
  title="신청을 진행할까요?"
  description="신청 내용을 확인해 주세요."
  confirmLabel="신청하기"
  pending={saving}
  onConfirm={submitApplication}
/>
```

- 호출부가 `open`, `onOpenChange`, `onConfirm`, `pending`을 제공
- `pending` 동안 닫기/확인을 막고 확인 버튼에 처리 중 표시
- 확인 성공 후 닫을지, 오류를 어떻게 보여줄지는 호출부가 결정
- `CancellationDialog`는 내 신청 취소용이며 `canCancel`을 반드시 전달
- 취소 가능 조건을 다이얼로그에서 계산하지 않음. 취소해도 팟은 유지된다는 안내를 제공
- `NotificationDialog`는 알림 전달/결제 처리 기능이 아님. 표시할 때와 확인 후 동작은 호출부 책임

## 팟 상태와 목록 없음

### `PotCard`, `StatusBadge`

`PotCard`는 팟 제목, 작물명, 설명, 신청 현황, 상태 배지와 선택 액션을 보여줍니다. `applicantCount`, `capacity`, `status`는 확정된 값을 전달해야 합니다. 카드가 신청 인원을 추정하거나 신청 가능 여부를 계산하지 않습니다. 액션은 `actionLabel`과 `onAction`이 모두 있을 때만 표시됩니다.

지원 상태 키는 다음 네 가지입니다.

- `recruiting`: 모집 중
- `payment-ready`: 결제 가능
- `paid`: 결제 완료
- `cancelled`: 내 신청 취소

`StatusBadge`는 전달된 상태를 문구와 Badge variant로 바꿉니다. 상태 전이는 기능 담당 코드가 수행합니다.

### `EmptyState`

목록 없음, 준비 중, 완료 등 빈 영역의 제목·설명·선택 액션을 표시합니다. 버튼은 `actionLabel`과 `onAction`을 모두 전달한 경우에만 나옵니다. 특정 API 상태를 감지하지 않으므로 어느 경우에 보여줄지 호출부가 정합니다.

## 푸터와 회사 정보

`Footer`는 pathname에 따라 홈 메인 푸터와 서브 푸터를 선택하고, 같은 `BrandLogo`, 슬로건, 회사정보, 정책 링크 구조를 사용합니다. 바탕은 페이지와 같은 `--butter`를 사용합니다.

```tsx
<Footer
  companyName={companyName}
  representative={representative}
  businessRegistrationNumber={businessRegistrationNumber}
  ecommerceRegistrationNumber={ecommerceRegistrationNumber}
  address={address}
  customerService={customerService}
  termsUrl="/terms"
  privacyUrl="/privacy"
/>
```

루트 `app/layout.tsx`에는 부트캠프 화면 확인용 `0` 형식과 지정 주소가 전달되어 있습니다. 실제 사업자 정보로 오인하지 말고, 실제 운영 값은 담당자가 확정 후 바꿔야 합니다. 현재 `/terms`, `/privacy`는 시안 안내 페이지이지 확정 약관 원문이 아닙니다.

## 변경·검토 원칙

1. 공통 스타일을 바꾸기 전에 사용처를 검색합니다 (`rg "ComponentName" app domains shared`).
2. 데이터가 필요한 값은 임의로 만들지 말고 페이지의 실제 데이터 소유자에게서 받습니다. 시안 데이터를 쓰면 화면과 코드에 예시임을 표시합니다.
3. 공통 컴포넌트는 표시와 일반 상호작용만 맡기고, 업무 규칙은 페이지/도메인 계층에 둡니다.
4. 새 prop을 추가하거나 의미를 바꾸면 이 문서의 API와 책임 경계도 함께 갱신합니다.
5. 변경 후 해당 컴포넌트와 영향을 받는 사용처의 ESLint/build/browser 결과를 실제 수행한 범위대로 기록합니다. 수행하지 않은 확인은 통과로 적지 않습니다.

## 이번 정리에서 제거한 미사용 컴포넌트

아래 네 파일은 `app/` 및 `domains/`의 실제 화면에서 import하거나 렌더링하지 않았습니다. 현재 기능과 사용처를 확인한 뒤 제거했으며, `shared/components/index.tsx` 내보내기도 함께 삭제했습니다.

- `CartPopup.tsx`: 호출부가 없고 실제 장바구니 흐름도 연결되지 않은 단독 팝업.
- `CategoryMenuContainer.tsx`, `CategoryMenuView.tsx`: 호출부가 없고 현재 상품 목록 화면에도 카테고리 필터 동작이 없음. 실제 필터 정책과 데이터가 정해질 때 필요한 형태로 다시 추가합니다.
- `CurationCarousel.tsx`: 호출부가 없으며 홈 상품 캐러셀은 `CarouselContainer`로 통일.

`FormField`, `ActionDialog`, `PotCard`, `StatusBadge`, `ProductGrid`처럼 아직 실제 화면에 연결되지 않은 컴포넌트는 기존 공통 UI 요구 묶음에서 명시된 준비 항목이라 이번 삭제 대상에서 유지했습니다. `ui/`의 Button/Input/Badge/Card/Dialog/DropdownMenu는 여러 공통 컴포넌트가 가져다 쓸 수 있는 기반 요소이므로, 단순히 화면에서 직접 참조되지 않는다는 이유만으로 삭제하지 않습니다.
