# VS Code 인계 — 이음 / 공통 컴포넌트

## 2026-10-17 공통 UI 이어서 작업

사용자의 후속 요청으로 이 체크아웃의 공통 UI 작업을 재개함. 기존 변경은 되돌리지 않고 현재 상태 위에 아래 변경을 추가함.

- `FormField.tsx`와 `ActionDialog.tsx`를 복구해 기존 `shared/components/index.tsx` 내보내기가 실제 파일과 연결됨. 입력 필드는 input/select, 도움말·오류의 접근성 연결을 지원함. 확인·취소·알림 다이얼로그는 외부에서 열림 상태, 처리 중 상태, 조건과 동작을 전달받음.
- `PotCard.tsx`와 `EmptyState.tsx` 추가. 팟 상태·신청 수·정원은 호출부 데이터만 표시하고, 조건 판정이나 상태 전환은 하지 않음. 빈 ProductGrid는 공통 빈 상태를 표시함.
- ProductGrid 반응형 열 수(모바일 2, 중간 3, 넓은 화면 4)를 적용하고 공통 index에서 내보냄.
- MainNavigation 기본 문구/목표를 소분마켓(`/products`), 함께 나누기(`/#how-it-works`), 취향 찾기(`/#find-your-taste`), 브랜드 이야기(`/#brand-story`)로 연결. 현재 메인 화면에서 확인한 섹션 ID를 사용함. MastHead는 좁은 화면에서 안전영역과 줄바꿈을 지원하고 네비게이션을 표시함.
- Footer는 브랜드명·슬로건·회사정보 항목을 표시함. 부트캠프 시안용 예시 데이터(리틀포션즈, 정은, 0 번호, 사용자가 지정한 부트캠프 주소)를 RootLayout에서 전달함. 이용약관 `/terms`, 개인정보처리방침 `/privacy` 경로를 추가했으며, 승인된 법률 원문이 없어 두 페이지는 시안용 안내만 표시함.
- 공통 콘텐츠 배경에 `#FFF8D6` 버터 토큰과 재사용 `ButterBackground` 컴포넌트를 적용함. RootLayout의 페이지 콘텐츠가 이를 사용하며 헤더/푸터 토큰은 기존 색을 유지함.

### Update log — 2026-10-17 02:41 KST

- User command tags: none.
- Request: 공통 컴포넌트에서 아주 밝은 버터색 배경을 재사용하고 화면 콘텐츠에 적용.
- Files changed: `app/globals.css`, `app/layout.tsx`, `shared/components/ButterBackground.tsx`, `shared/components/index.tsx`, `shared/components/README.md`, `CODEX_HANDOFF.md`.
- Verification: ESLint and `git diff --check` passed; headed browser computed the applied background as `rgb(255, 248, 214)` on `/`.
- Remaining: full type check was not rerun for this color-only change; local browser still reports existing 404 responses for the homepage video and poster assets.
- Audit/report link: none.
- `shared/components/README.md`를 현재 사용법과 범위에 맞게 보완함.

검증: 수정한 공통 컴포넌트 ESLint 통과, `git diff --check` 통과. `npx tsc --noEmit --incremental false`는 새 컴포넌트 오류 없이 기존 문제만 보고함: 삭제된 `app/portion-market/page.tsx`를 참조하는 `.next/types/validator.ts`, `@/shared/types/schema`, `shared/lib/mockup/fetchMockup` 누락. 브라우저 확인은 이번 이어서 작업에서 수행하지 않음. 로그인 세션/장바구니, 실제 회사 정보, 신청 팟 실제 데이터와 비즈니스 규칙은 여전히 화면 담당자 연결 사항임.

현재 추가 코드 편집을 멈춘 상태입니다. 기존 사용자 변경 보존, 커밋·푸시·PR·병합·새 에이전트 실행 금지.

## 먼저 확인

- 작업 저장소: `/Users/geil/LocalProjects/team-g-latest`
- origin: `https://github.com/whatukknow/Shoppingmall.git`
- 브랜치: `main`, 기준 HEAD: `65718ea0e402d4c29c4bfc9798324ce1af54ab0b`
- VS Code에서 읽기 확인한 열린 프로젝트는 별도 `/Users/geil/LocalProjects/team-g`이며 `feat/HomePage*+`, 변경 53개가 표시됨. 그 폴더에는 이번 구현을 복사하거나 적용하지 않았음. 두 폴더를 혼동하거나 덮어쓰지 말 것.
- Codex 사이드바와 최근 채팅 버튼은 보이지만 현재 열린 대화는 “Clone 최신 팀 Git”. 이 스레드의 이관 성공은 확인되지 않았음.

## 구현 완료

기존 공통을 재사용해 회사 정보 Footer, imageUrl 전달, 카드 겹침 해결에 이어 Figma 공통 요소를 보완함. 기존 브랜드 색상을 유지함.

- MastHead: 기존 brand 표시를 유지하고 header 모드 추가. 모바일 56px/PC 80px 상단 헤더, 안전영역, 로그인 전/후 props(`user={ name: '정은' }` → 정은님), 이름·장바구니 행동 전달. app/layout.tsx에 기본 비로그인 헤더 배치.
- MainNavigation / NavigationAction: 실제 상품 `/products` 링크, 나머지 대상은 href 또는 콜백 전달. 미연결 메뉴는 비활성. 팟·설문·로그인·회원 페이지를 새로 만들지 않음.
- CategoryMenu: 존재하지 않는 `/category/*` 기본 주소 제거. 실제 href 또는 onSelectCategory를 전달하도록 보완. 전체 상품은 `/products`.
- Button: 기존 기본값 유지, 48px `size="touch"` / `variant="actionOutline"` 추가.
- FormField: 기존 Input 재사용. 48px 입력, label/id·필수·도움말·오류 aria 연결.
- StatusBadge: 기존 Badge 재사용. 모집 중 / 결제 가능 / 결제 완료 / 내 신청 취소 표시만 수행.
- ActionDialog / CancellationDialog / NotificationDialog: 기존 Dialog·Button·Card 재사용, 모바일 세로/PC 가로 버튼, 포커스 관리. canCancel 필수·pending·onConfirm·onOpenChange로 외부 연결. 팟 유지 원칙만 문구 반영, 취소/매칭/기한 정책은 결정하지 않음.
- ProductCard: 이미지/상품명 상세 링크와 하단 + 담기 버튼을 분리. 정사각형, 모바일 2열/PC 4열, CarouselContainer 재사용 유지.
- 사용법: `shared/components/README.md`.

## 최신 검증

- 수정한 공통 및 layout의 ESLint와 git diff --check 통과.
- 브라우저 390px·1440px에서 로그인→정은님 전환, 이름/장바구니/메뉴/카테고리/담기/알림/취소 콜백, 필수·오류·비활성 입력, 48px 컨트롤, 상품 경로 이동 통과.
- 대화상자 Tab 포커스 유지, Escape 닫기·원래 버튼 복귀, 취소 불가 disabled, 처리 중 확인 비활성 통과.
- 공통 검증 화면에서 겹침/가로 넘침 없음, 정사각 이미지 유지. 전체 홈의 기존 배너 등은 별도 범위이며 전체 페이지가 Figma대로 완성됐다는 의미 아님.
- 임시 app/component-check 페이지는 삭제했고 개발 서버는 종료함. 검증용 SVG/문구만 사용했으며 상품 데이터나 농작물 이미지를 만들지 않음.
- 최신 tsc --noEmit --incremental false는 기존 `domains/product-list/productList.api.ts:2`의 `@/shared/types/schema` 누락(TS2307)만 보고함. 최신 UI 추가 후 production build 재실행은 이관 요청으로 보류.
- 이전 npm run build는 prebuild의 기존 테스트 2개에서 실패. 직접 next build는 컴파일 후 위 schema 누락으로 실패. 빌드 통과를 주장하지 말 것.
- 기존 테스트명: `renders the configured number of items and navigation controls` (다음 상품 보기 vs 실제 다음 슬라이드), `renders nothing when there are no items` (빈 문자열 vs 실제 0–0 / 0). 수정 전 HEAD 추출본으로도 동일한 2개 실패 확인. 테스트는 수정하지 않음.
- 임시 경로 삭제 직후 `.next/dev/types`에는 component-check 참조가 남아 있는 것을 확인함. VS Code에서 작업 재개 시 개발 서버를 재시작해 생성 타입을 갱신하거나 생성 캐시를 정리할 것. 이 캐시 문제를 실제 제품 코드 오류로 혼동하지 말 것.

## 남은 일

1. 작업 체크아웃은 `/Users/geil/LocalProjects/team-g-latest`로 확인됨. 별도 `team-g` 체크아웃은 이번 작업 대상이 아님.
2. 실제 인증 세션·로그인/내 신청 팟/장바구니/설문/소개 경로를 담당자와 합의해 제공된 props에 연결. 기본 layout은 아직 인증 연동 전이며 로그인 버튼도 미연결 상태.
3. 회사 실제 정보·약관 URL 반영, 상품 목록 데이터 연결. schema 누락과 기존 자동 테스트 기대값 불일치 해결 후 빌드 재검증.
4. (후속 변경으로 일부 대체됨) 사용처 없는 CurationCarousel 및 단독 CartPopup, 현재 필터가 없는 카테고리 메뉴 컴포넌트는 2026-10-17 03:01 KST 사용처 검토 후 삭제됨. 모바일 레이아웃 검토는 별도 상태.
5. 서인 리뷰 전에 diff·캡처·남은 차단 원인 함께 전달. 자동 전송/PR 생성 금지.

## 기준 Figma

- 모바일: https://www.figma.com/design/9ldiC9PzBdNEnXM815e80a/?node-id=4597-362
- PC: https://www.figma.com/design/9ldiC9PzBdNEnXM815e80a/?node-id=4601-362
- 실제로 읽은 공통 보드: 4590:21, 헤더 4591:325 / 4602:374, 입력/버튼 4592:124, 알림 4591:562, 취소 4592:466 / 4604:831.

## 변경 파일 전체 (이 인계 문서 추가 직전)

```text
 M app/layout.tsx
 M domains/Home/components/YourPantry.tsx
 M shared/components/CarouselContainer.tsx
 M shared/components/CategoryMenuContainer.tsx
 M shared/components/CategoryMenuView.tsx
 M shared/components/Footer.tsx
 M shared/components/MainNavigation.tsx
 M shared/components/MastHead.tsx
 M shared/components/ProductCard.tsx
 M shared/components/ProductGrid.tsx
 M shared/components/index.tsx
 M shared/components/ui/button.tsx
?? shared/components/ActionDialog.tsx
?? shared/components/FormField.tsx
?? shared/components/NavigationAction.tsx
?? shared/components/README.md
?? shared/components/StatusBadge.tsx
```

## 화면 근거 및 검증 스크립트

별도 작업 폴더: `/Users/geil/Documents/Codex/2026-10-16/task-2/output/playwright/`

- figma-header-390.png / figma-header-1440.png
- figma-fields-390.png / figma-fields-1440.png
- figma-grid-390.png / figma-grid-1440.png
- figma-cancel-390.png / figma-cancel-1440.png
- figma-notice-390.png / figma-notice-1440.png
- check-common.js: 수행한 브라우저 검증 코드. 삭제한 임시 검증 페이지를 전제로 하므로 그대로 실행하면 안 됨.

VS Code에서 이어갈 때: “CODEX_HANDOFF.md와 shared/components/README.md를 읽고, 현재 git diff를 보존한 뒤 공통 컴포넌트 작업을 이어가 주세요. 먼저 team-g-latest 경로인지 확인해 주세요.”

## 2026-10-17 02:43 KST — 메인 헤더 영상 복구

- 사용자 요청: 메인 헤더의 가득 찬 영상 위치 확인 및 복구.
- 변경: `IMG_5162.mp4`를 `public/videos/home-header.mp4`로 복사하고 포스터 이미지를 생성함. `app/page.tsx` 영상 영역을 전체 폭 배경 영상으로 바꿈.
- 검증: ESLint `app/page.tsx` 통과, `git diff --check` 통과. 브라우저/로컬 HTTP 응답은 현재 서버 상태로 확인되지 않음.
- 미확인: 실제 브라우저 재생 및 홈 상단 내비게이션이 영상 위에 겹치는 최종 배치.

## 2026-10-17 02:45 KST — 중복 홈 헤더 정리

- 사용자 화면에서 홈에 공통 헤더와 페이지 내부 헤더가 중복 표시되는 문제를 확인함.
- `app/page.tsx`의 중복 헤더를 제거하고 `shared/components/MastHead.tsx`에서 홈일 때 공통 로고·내비게이션을 영상 위 투명 오버레이로 표시하도록 변경함. 영상의 브라우저 컨트롤은 제거하고 자동 재생·반복 배경으로 둠.
- 검증: 변경 파일 ESLint 및 `git diff --check` 통과. 브라우저 시각 확인은 미수행.

## 2026-10-17 02:48 KST — 전 페이지 박스 배경 정리

- 사용자 요청: 모든 페이지에서 박스별 배경색을 없애고 공통 배경색이 이어져 보이게 조정.
- `--background`와 `--butter`를 `#fff8d6`로 통일하고 카드 토큰을 투명하게 변경. 홈, 상품 목록, 신선 추천/스토리 카드, 상품 이미지 자리, 공통 Card에서 개별 표면색을 제거함. 버튼과 식재료 일러스트의 의미 있는 색은 유지함.
- 검증: 변경 파일 ESLint 통과, `git diff --check` 통과. 브라우저 화면 검증은 미수행.

## 2026-10-17 02:52 KST — 영문 브랜드 로고 공통화

- 사용자 피드백: 헤더의 영문 로고 폰트가 다른 브랜드 표기와 맞지 않음.
- `shared/components/BrandLogo.tsx`를 추가해 `font-heading`과 `Little Portions` 표기를 공통 제공. MastHead의 헤더/브랜드형, 푸터, 회사 정보 영역에서 공통 워드마크 사용.
- 검증: 변경 파일 ESLint 및 `git diff --check` 통과. 브라우저 시각 확인은 미수행.

## 2026-10-17 02:55 KST — 푸터 버터 배경 직접 적용

- 사용자 지적: 푸터에 공통 배경색이 보이지 않음.
- MainFooter와 SubFooter 래퍼에 `var(--butter, #fff8d6)` 배경색을 직접 적용해 본문과 같은 공통 배경을 사용하도록 수정.
- 검증: Footer ESLint 및 `git diff --check` 통과. 브라우저 시각 확인은 미수행.

## 2026-10-17 02:47 KST — 헤더 메뉴 위치 변경

- 사용자 요청: 네비게이션에는 소분마켓·취향 찾기·브랜드 이야기만 두고, 장바구니 자리에 함께 나누기를 배치.
- 공통 `MainNavigation`에서 함께 나누기 항목을 제거하고 3열로 변경. `MastHead` 우측 동작을 `/#how-it-works` 링크의 함께 나누기로 교체하고 사용하지 않는 cart prop을 제거.
- 검증: 변경 파일 ESLint 및 `git diff --check` 통과. 브라우저 확인은 미수행.

## 2026-10-17 02:49 KST — 영상 아래 섹션 간격

- 사용자 요청: 메인 영상과 바로 아래 섹션 사이 약 20px 간격.
- `#how-it-works` 섹션에 `mt-5`를 추가해 20px 상단 간격 적용.
- 검증: `app/page.tsx` ESLint 및 `git diff --check` 통과. 브라우저 확인은 미수행.


## 2026-10-17 02:50 KST — 현재 작업 상태 저장

### 작업 위치와 보존 상태

- 활성 체크아웃: `/Users/geil/LocalProjects/team-g-latest`.
- 변경은 모두 미커밋 상태. 사용자 기존 변경·삭제 파일은 되돌리지 않았으며, 이전에 있던 전체 변경을 이 handoff 항목만으로 완전히 열거했다고 보지 말 것.
- `team-g`는 별도 체크아웃이며 현재 작업 대상이 아님.

### 최근 반영 사항

- 원본 `IMG_5162.mp4`를 `public/videos/home-header.mp4`로 복사하고 포스터 이미지 생성.
- 홈 히어로 영상을 전체 폭 배경으로 표시하고 공통 헤더를 투명 오버레이로 배치. 메인 페이지 내부의 중복 헤더 제거.
- 전역 배경을 버터색 `#fff8d6`로 맞추고 정적 카드/콘텐츠 박스의 개별 표면색을 제거. 푸터 두 유형에도 `--butter`를 직접 적용.
- 공통 `BrandLogo`로 영문 로고 폰트/표기를 통일.
- 상단 메뉴를 소분마켓·취향 찾기·브랜드 이야기로 구성하고, 기존 장바구니 위치를 함께 나누기 링크로 바꿈.
- 영상 아래 첫 섹션에 20px 상단 간격 적용.

### 검증 및 미확인

- 관련 변경 시 ESLint와 `git diff --check`가 통과함.
- 이 최신 조합의 브라우저 시각 검수 및 영상 실재 재생은 미확인.
- 기존 타입/빌드 문제와 이전 handoff에 적힌 CarouselContainer 테스트 기대값 차이는 해결됐다고 확인되지 않음. 별도 범위로 유지.
- 다음 재개 시 `git status --short`와 이 파일의 최근 섹션을 먼저 확인하고, 브라우저에서 홈 헤더/영상/푸터 배경 및 상품 목록 배경을 검수할 것.

## 2026-10-17 02:56 KST — 메인 상품 캐러셀 2개 추가

- 첫 상품 블럭을 5개 노출형 캐러셀로 교체. 15개 예시 품목으로 3장(다음 2회 이동) 구성하고, 기존 작물 4종에 브로콜리·토마토·당근·양파 일러스트를 추가.
- 다음 블럭에 인기 소분마켓 상품 예시 10개를 5개씩 2장으로 표시. 실제 상품/인기 집계가 연결되지 않아 예시 순위임을 화면에 명시.
- 공통 `CarouselContainer`의 renderItem에 절대 항목 index를 전달해 슬라이드가 바뀌어도 TOP 순위가 유지되도록 확장.
- 검증: 수정 파일 ESLint 및 `git diff --check` 통과. localhost:3000 개발 서버는 실행 중이 아니어서 브라우저 검수 미수행. 자동 테스트는 실행하지 않음.

## 2026-10-17 03:00 KST — 공통 컴포넌트 팀 안내 보강

- 사용자 요청: 팀원들이 공통 컴포넌트의 사용법과 범위를 혼동하지 않도록 설명을 자세히 기록.
- `shared/components/README.md`를 현재 구현에 맞춰 재작성. 공통/호출부 책임 경계, 사용 코드, props 동작, 현재 비연결 상태와 시안 데이터, CarouselContainer의 5개 단위 페이지/절대 index/반응형 제한, 변경 시 문서 갱신 원칙을 설명.
- 주요 헤더 구성을 소분마켓·취향 찾기·브랜드 이야기 및 오른쪽 함께 나누기로 수정 반영하고 오래된 메뉴 설명을 바로잡음.
- 검증: `git diff --check` 통과. 문서 변경만이며 코드 테스트/브라우저 검수는 실행하지 않음.

## 2026-10-17 03:01 KST — 미사용 공통 컴포넌트 제거

- 사용자 요청: 불필요한 공통 컴포넌트 정리.
- app/domains 실제 호출부를 검색해 미사용인 `CartPopup.tsx`, `CategoryMenuContainer.tsx`, `CategoryMenuView.tsx`, `CurationCarousel.tsx` 제거. `shared/components/index.tsx`의 해당 export도 제거.
- `FormField`, `ActionDialog`, `PotCard`, `StatusBadge`, `ProductGrid` 및 기반 UI primitives는 기존 공유 UI 계획에 포함되어 현재 호출부가 없어도 보존. README에 제거 사유와 보존 기준 기록.
- 검증: `rg`에서 app/domains/shared의 코드 참조 0건 확인(README와 과거 handoff의 설명 기록은 유지). `npx eslint shared/components`와 `git diff --check` 통과. 브라우저 동작 검수는 실행하지 않음.

## 2026-10-17 03:04 KST — 홈 섹션별 파일 분리

- 사용자 선택: 메인 화면을 섹션별 파일로 분리하고, 이전 홈 컴포넌트 중 미사용 항목을 정리. Next.js 라우팅 진입점 파일명은 유지.
- `app/page.tsx`는 `/` 라우트의 조합 진입점으로 두고, 메인 영상·진행 안내·품목 캐러셀·인기 캐러셀·브랜드 이야기·취향 찾기를 `domains/home/components/` 아래 역할별 파일로 구성. 메인 상품 카드와 임시 일러스트, 예시 데이터도 분리.
- 새 시안에서 더 이상 쓰지 않는 이전 홈 파일 `FreshPickCard.tsx`, `FreshPickCardContainer.tsx`, `PortionMarket.tsx`, `StoryCard.tsx`, `StoryCardsContainer.tsx`, `YourPantry.tsx`, `YourPantryContainer.tsx` 제거. `MainBannerCuration.tsx`도 현재 페이지에서 호출하지 않는 구 시안 구성으로 함께 제거됨.
- `shared/components/README.md`에 파일별 책임, 홈 라우트와 섹션 파일 구분, 상품 목록의 `app/products/page.tsx`는 라우팅 규칙상 유지한다는 점을 기록하고 기존 캐러셀 안내 경로를 갱신.
- 검증: 이전 컴포넌트 코드 참조 없음, 홈 TSX/data ESLint 통과, `git diff --check` 통과. README 파일은 ESLint 대상 설정이 없어 lint 검사에서 제외 경고가 나왔으며 Markdown 자체에 lint 적용은 하지 않음. 브라우저 확인과 자동 테스트는 미수행.

## 2026-10-17 03:08 KST — Playwright 작업 폴더 Git 제외

- 사용자 요청: `.playwright-cli/`가 Git에 올라가지 않도록 설정.
- `.gitignore`에 `/.playwright-cli/` 규칙을 추가해 저장소 루트의 Playwright CLI 작업 폴더를 무시.
- 검증: `git check-ignore -v .playwright-cli/`로 적용 규칙 확인, `git ls-files .playwright-cli` 결과가 비어 있어 현재 추적 파일 없음 확인. 기존 파일은 삭제하지 않음.

## 2026-10-17 03:52 KST — BBH Hegarty 로컬 폰트 연결

- 사용자 요청: 시작한 `next/font/local` 설정을 이어 프로젝트에 BBH Hegarty 적용.
- 다운로드 폴더의 `BBHHegarty-Regular.ttf` 및 `OFL.txt`를 `app/fonts/`에 복사. `app/layout.tsx`에서 `next/font/local`로 로드하고 `--font-bbh-hegarty` 변수로 등록. 기존 `globals.css`의 `--font-heading`이 이 변수를 가리켜 워드마크/영문 제목의 공통 토큰은 유지.
- `<body>`에 변수 식별자를 문자 그대로 적어둔 클래스(`bbhHegarty.variable`)를 제거. 폰트 변수는 이미 `<html>`에 붙어 하위 요소에서 사용 가능. `globals.css`의 :root 안에 잘못 배치된 `.special-heading` 규칙을 제거.
- 검증: `npx eslint app/layout.tsx`, `git diff --check` 통과. 브라우저 렌더링과 빌드는 실행하지 않음.

## 2026-10-17 03:53 KST — 프로젝트 README에 폰트 사용법 추가

- 사용자 요청: BBH Hegarty 로컬 폰트 정보를 프로젝트 README에 기록.
- `README.md`에 폰트 파일 경로, 동봉 OFL 라이선스, `next/font/local` 등록 위치, `font-heading` 공통 사용법과 간단한 JSX 예시를 추가. 기존 create-next-app의 Geist 전용 설명을 현재 프로젝트 설정에 맞게 대체.
- 검증: Markdown 변경을 확인하고 `git diff --check` 실행. 빌드/브라우저는 실행하지 않음.

## 2026-10-17 03:58 KST — 메인 페이지 표시 오류 복구

- 사용자 피드백: 로컬 화면 주소에 접속할 수 없음.
- 개발 서버 로그에서 홈 페이지의 Server Component가 Client Component인 `CarouselContainer`에 render/key 함수를 전달해 실패하는 오류를 확인. `ShareProductsCarousel.tsx`, `PopularProductsCarousel.tsx`를 Client Component로 지정해 함수 전달이 클라이언트 경계 안에서 이뤄지도록 수정.
- 검증: 두 홈 섹션 ESLint 통과, `git diff --check` 통과. `127.0.0.1:3000` HTTP 200 및 메인 로고/품목 섹션/인기 섹션 문구를 응답 HTML에서 확인. 브라우저 UI 자동화는 현재 세션에서 직접 열지 못함.

## 2026-10-17 04:00 KST — 메인 배너 영상 교체

- 사용자 요청: 첨부 `IMG_4673.mov`로 홈 마스터 배너 영상을 교체.
- 입력은 약 4.14초, 회전 정보가 적용된 2160×1296 화면, HEVC/HDR 영상. 기존 `HomeHero`가 가리키는 `public/videos/home-header.mp4` 파일명을 유지해 1920×1080 H.264/yuv420p/bt709 MP4로 변환하고 기존 파일을 대체. 오디오는 배경 자동재생 영상에서 쓰지 않아 제외.
- `public/videos/home-header-poster.jpg`도 새 영상에서 추출한 프레임으로 교체. `HomeHero.tsx`는 기존 영상/포스터 경로를 그대로 사용.
- 검증: ffprobe에서 결과가 H.264, 1920×1080, 4.14초, bt709임을 확인. 홈 URL과 MP4 URL 모두 HTTP 200, MP4 MIME `video/mp4`, 크기 약 5.0 MB 확인. 관련 홈 TSX ESLint 및 `git diff --check` 통과. 실제 브라우저 재생은 미확인.

## 2026-10-17 04:01 KST — 홈 히어로 버튼 문구 수정

- 사용자 요청: `함께 나눌 팟 둘러보기`를 `함께 나눌 소분마켓 둘러보기`로 교체.
- `domains/home/components/HomeHero.tsx`의 링크 문구만 변경하고 `/products` 이동은 유지.
- 검증: ESLint 및 `git diff --check` 통과.

## 2026-10-17 04:03 KST — 함께 나눌 품목 일러스트 교체

- 사용자 요청: 공유한 그림으로 홈의 `함께 나눌 품목을 골라보세요` 섹션 일러스트를 교체.
- 투명 배경 품목 PNG 15개를 `public/images/home/products/`에 작물별 파일명으로 추가. `HomeProductIllustration.tsx`에서 Next Image로 렌더링하도록 바꾸고, `homeProducts.ts`의 15개 품목 예시를 제공된 그림과 맞게 수정. 인기 상품 예시 카드도 공유 일러스트를 재사용.
- 배송 박스 이미지는 품목 일러스트가 아니어서 이 섹션에 연결하지 않음.
- 검증: 홈 페이지 HTML에 새 이미지 경로가 렌더링되고 PNG 정적 경로가 HTTP 200. 관련 TSX/data ESLint, `git diff --check` 통과. 브라우저 시각 확인은 미수행.

## 2026-10-17 04:04 KST — 포도 품목명 정정

- 사용자 정정: 공유 일러스트는 청포도가 아니라 적포도.
- 홈의 함께 나눌 품목 및 인기 상품 예시 데이터 두 곳에서 상품명을 `적포도`로 수정. 그림 파일/렌더링은 그대로 사용.
- 검증: `청포도` 잔여 참조 없음, ESLint 및 `git diff --check` 통과.

## 2026-10-17 04:20 KST — 상품목록 예시 데이터와 첨부 사진 컷아웃

- User command tags: none.
- Request: 기존 홈 일러스트와 구분되는 판매 상품 목록을 구성하고, 첨부한 사진 14장을 모두 배경 제거해 넣기.
- `imagegen`으로 첨부 원본 14장을 각각 투명 배경 PNG로 만들고 `public/images/products/`에 보관. 원본은 수정하지 않음. 긴 변 최대 1000px로 최적화 복사했고 알파 채널 투명도(0–255)가 모두 확인됨.
- `domains/products/data/productCatalog.ts`에 14개 예시 상품, `domains/products/components/ProductCatalogCard.tsx`에 읽기 전용 투명 이미지 카드 추가. `/products`는 예시 목록과 실제 판매·재고 정보가 아님을 알리는 문구를 표시함. 금액과 상품명은 시안 구성을 위한 임의 예시이며 운영 데이터 연결 전 교체해야 함.
- Verification: 변경 TS/TSX ESLint 통과, `git diff --check` 통과, PNG 14개와 RGBA 알파 범위 0–255 확인. 로컬 `/products` HTTP 응답에서 제목, 예시 안내와 이미지 경로 14개 확인. 시각적 브라우저 검사와 자동 테스트는 실행하지 않음.
- Audit/report link: none.

## 2026-10-17 04:36 KST — 홈 함께 나눌 품목 7개 추가

- User command tags: none.
- Request: 제공된 일러스트 7개를 홈의 `함께 나눌 품목`에 추가하고, Team Git에 올리기 전 브랜치 상태 확인.
- 제공된 투명 PNG를 `public/images/home/products/`에 각각 추가하고 `domains/home/data/homeProducts.ts`, `HomeProductIllustration.tsx`, `ShareProductsCarousel.tsx`에 연결. 품목은 15개에서 22개로 늘었으며 한 슬라이드 5개 구성은 유지되어 마지막 슬라이드에 2개가 표시됨.
- Git: 작업 저장소는 로컬 `commen_components` 브랜치이며 `main`/`origin/main`의 동일 기준 커밋에서 시작. 현재 브랜치의 upstream 설정은 없고 기존 변경이 이미 많이 포함되어 있음. 이번 요청에서는 별도 브랜치 생성, 커밋, 푸시를 하지 않음. 다음 Team Git 업로드 전 포함 파일 범위를 먼저 검토해야 함.
- Verification: 변경 TS/TSX ESLint와 `git diff --check` 통과. 7개 PNG 알파 채널(0–255) 확인, 기존 로컬 홈 응답 확인, 새 이미지 정적 경로 7개 모두 HTTP 200. 브라우저 UI로 슬라이드를 직접 넘기는 확인과 자동 테스트는 미실행.
- Audit/report link: none.


## 2026-10-18 14:25 KST — Small PR following Sangdon review on #46 / #49

- User command tags: none; user requested a small published pull request covering the review.
- Request summary: carry remaining review follow-up on latest main while preserving the active local design.
- Base: `e5224af` (merged PR #49); existing API requests, product detail links, server-compatible StatusBadge and dialog width fixes are inherited.
- Files changed: `.prettierignore`, `app/uploads/[...assetPath]/route.ts`, `domains/home/components/HomeProductIllustration.tsx`, `domains/home/data/homeProducts.ts`, `domains/products/data/productCatalog.ts`, `CODEX_HANDOFF.md`.
- Applied: exclude generated UI from bulk Prettier; reconnect home/catalog apple to existing local illustration; use eight available image-backed catalog entries with Korean names; correct orange label to user-identified red potato. No JSX layout or className changes. Upload binaries remain excluded from Git.
- Verification: focused ESLint passed; Prettier file-info confirms generated dialog ignored; eight image paths checked against local media and route allowlist; diff whitespace check passed. No new browser pass, full build or automated test run in this isolated checkout.
- Team decisions: a blanket prohibition on generated UI edits and future project-task granularity remain team discussion items; this PR does not assert agreement. Local media must be provisioned separately in other environments.
- Audit/report: PR #46 and PR #49 on whatukknow/Shoppingmall; new PR URL returned after publication.


## 2026-10-18 14:41 KST — Include the requested 1 AM design in PR #51

- User command tags: none; explicit request to publish the local 1 AM design together with Sangdon review responses.
- Supersedes: the previous small-PR-only scope for #51.
- Changes: restore the active local homepage composition, full-width video hero, overlay masthead, butter background/footer styling, share/popular carousels and existing catalog card layout. Remove the alternate editorial-only components absent from the active local design. Keep inherited API client use, product ID routes, server-compatible StatusBadge and fixed dialog width. Keep generated UI excluded from Prettier and uploads excluded from Git.
- Verification: local design/API source parity checked for 17 files; focused ESLint passed; diff whitespace check passed. Type check reports missing generated LayoutProps and pre-existing shared/types/schema. No full build, automated test run or new browser verification in the isolated PR checkout. Previous local browser observations do not establish full PR runtime validation.
- Media: binaries remain local in the root uploads directory and must be provided separately to collaborators.
- Audit/report: https://github.com/whatukknow/Shoppingmall/pull/51


## Team G CSS authoring policy — 2026-10-21

- Policy ID: `team-g-global-css-only-2026-10-21`.
- Logged at: 2026-10-21T21:43:15+09:00. Source: explicit user instruction to record, log, and share; scope explicitly restricted to the G-team shopping-mall project.
- Decision: In this project, write new or additional CSS in `app/globals.css`; do not create separate CSS files. Preserve existing selectors and scope. Do not apply this rule to other projects. Existing unrelated CSS files are not authorized for bulk migration.
- Agent handoff: All agents working on this project must follow the rule in `AGENTS.md` and include it in subsequent handoffs.
- Verified implementation: route-theme CSS was moved to `app/globals.css`; the four route-group imports were removed.
- Delivery: saved in project instructions and this handoff log. No other connected in-scope agent was available in the current agent inventory. External-session acknowledgment/adoption and remote publication are unverified.
