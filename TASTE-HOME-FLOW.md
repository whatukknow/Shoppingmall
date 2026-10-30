# 취향 저장과 메인 추천 연결 명세

관련 이슈: #143. 구현 기준: 2026-10-30 머지된 `main`의 `3c44754`.

## 사용자 흐름

로그인 → 기존 취향 찾기 설문·결과 → 사용자가 메인 반영 선택 → 취향 저장 성공 → 메인 `#share-products`의 기존 추천 캐러셀.

- 로그인한 회원에게 저장된 취향이 있으면 그 추천을 조회한다.
- 비로그인 또는 취향 미저장이면 같은 캐러셀에 기존 랜덤 상품 API 결과를 표시한다.
- 과거 프로필의 추천 목록이 비어 있으면 랜덤으로 표시한다. 기존 프로필을 임의 수정하거나 추천을 자동 저장하지 않는다. 새 취향을 저장하면 해당 추천으로 교체된다.
- 기존 취향이 있는 사용자가 이번 결과에서 반영을 선택하지 않으면 저장된 취향은 그대로 유지한다. 선택 해제는 기존 취향 삭제가 아니다.
- 저장 실패 시 기존 결과 화면의 오류 안내를 표시하고 이동하지 않는다.
- 회원·추천·상품 조회의 장애는 미저장·비로그인으로 변환하지 않는다.
- 완료 후 같은 홈 URL로 새 문서 요청을 보내 저장 전 프리패치된 홈 결과가 재사용되지 않도록 한다.
- 이후 상품 상세 → 팟 생성·참여 → 주문·결제 → 내역 조회의 현재 구현은 변경하지 않는다.

## API와 저장 경계

| 단계 | 경로·메서드 | 동작 |
|---|---|---|
| 회원 상태 | `GET /api/users/me` | Supabase 세션 회원과 `hasTasteProfile` 확인, 비로그인 401 |
| 취향 저장 | `PUT /api/users/me/taste-profile` | 기존 camelCase→snake_case 요청 변환, 서버에서 세션 회원 ID 적용 |
| 취향 조회 | `GET /api/users/me/taste-profile` | 해당 회원 최신 취향, 없음 404 |
| 저장된 추천 | `GET /api/users/me/product-recommendations?limit=15` | 해당 회원 최신 취향의 추천 순서 유지 |
| 랜덤 추천 | `GET /api/products?type=random&limit=15` | 최신 원물·DIY 공통 메뉴에서 기존 방식으로 랜덤 조회 |

응답은 기존 `{ data: ... }` 구조를 유지한다. 추천 목록은 `{ data: { list, total, limit, offset } }`이며 항목은 `{ id, name, imageUrl }`이다. 요청·오류 계약을 새 엔드포인트로 교체하지 않는다.

취향 저장은 기존 `taste_profiles`의 회원·생일·성별·설문·오행 컬럼에 더해 `recommended_product_ids`에 추천 카탈로그 ID의 JSON 배열을 저장한다. `items`와 `kit`의 추천 튜플을 기존 카탈로그의 정확한 이름/ID로 검증·중복 제거한다. 잘못된 JSON·알 수 없는 추천은 400으로 거절한다. 현재 추천은 기존 규칙 기반 계산이며 외부 AI 모델 호출은 추가하지 않는다.

카탈로그 ID는 화면의 안정적인 식별자이며 DB 운영 상품 ID를 뜻하지 않는다. 과거 운영 상품 ID 추천도 활성 상품 조회와 명시적 카탈로그 대응을 거쳐 지원한다. 추천 노출 자체는 구매 허용이 아니며 상세의 기존 실제 상품 대응·가격·활성 조건을 유지한다.

브라우저 sessionStorage는 회원 추천의 저장소로 사용하지 않는다. 서버는 요청 본문의 회원 ID 대신 Supabase 세션을 사용한다. DB 스키마·RLS·가격·재고·운영 상품은 변경하지 않는다.

## 보존 범위와 소스

- 원물34·DIY22 데이터와 서버 업로드 이미지·픽셀·경로·역할표를 유지한다.
- `ShareProductsCarousel`, `CarouselContainer`, `HomeProductCard`의 JSX와 스타일·이미지 배치는 유지한다.
- 온보딩의 JSX·애니메이션·선택 UI·경로·컴포넌트 구조를 유지하고 완료 처리의 데이터 저장과 이동만 연결한다.
- 메인 이미지 역할은 현재 `catalogImages(...).recommendation`을 그대로 사용한다. 취향 찾기 결과의 원물06 이미지는 그대로다.
- 저장: `domains/auth/users.server.ts`, `domains/home/onboarding/react/tasteProfile.ts`.
- 결과 완료: `domains/home/onboarding/react/ResultStep.tsx`.
- 메인 분기: `domains/home/data/homeRecommendations.ts`, `domains/home/containers/ShareProductsContainer.tsx`.
- 이미지·운영 상품 대응: `domains/products/catalog/catalog.ts`, `menu.server.ts`(수정하지 않음).

## 검증 범위

자동 테스트는 합성 Supabase 클라이언트로 저장→새 조회, 회원 분리, 오류 전파, 잘못된 추천 거절, 기존 API·결제·상품 회귀를 확인한다. 실제 Supabase RLS·실제 저장·브라우저 재로그인·실제 iOS Safari·전체 구매 완주는 별도 운영 검증 대상이다. 미실행 검사를 완료로 표시하지 않는다.

이슈 → 작업 브랜치 → PR → 바로 독립 검증·Claude Code 교차검토 → 실패 수정·재검증 → 사람 머지. 배포는 별도 승인 후 머지된 main만 대상으로 한다.

## 변경 기록

- 시각: 2026-10-30 23:57 KST
- 사용자 명령 태그: 없음(구현 및 GitHub 이슈·PR·사람 머지 요청).
- 요청 요약: 현재 겉모습을 유지하며 Supabase 취향 저장과 메인 추천 캐러셀을 실제로 연결.
- 변경 파일: `domains/auth/users.server.ts`, `domains/home/containers/ShareProductsContainer.tsx`, `domains/home/data/homeRecommendations.ts`, `domains/home/onboarding/react/ResultStep.tsx`, `domains/home/onboarding/react/tasteProfile.ts`, 관련 테스트, `AGENTS.md`, 본 명세.
- 검증: 전체 테스트 275개 통과, Next 라우트 타입 생성 후 TypeScript 검사 통과. 이후 독립 검증·교차검토·최종 빌드 결과는 PR에 기록.
- 감사 참조: GitHub 이슈 #143. 자동 머지·운영 DB 쓰기·배포 없음.


## 실행·검수 기록

### 2026-10-30 23:58 KST — 구현 및 독립 재검증

- 사용자 명령 태그: 없음(작업 과정 기록 요청 포함).
- 실행 주체: Codex 구현, 별도 바로(independent_qa) 독립 검수, 클로가 실제 Claude Code 읽기 전용 교차검토 운영 중.
- GitHub 연결 도구의 이슈 작성은 403으로 실패. 기존 로그인된 GitHub CLI로 이슈 #143 등록 성공. 인증·권한 변경 없음.
- 기준 main `3c44754`에서 `fix/143-taste-home-flow` 작업 브랜치 분리. 기존 체크아웃의 30개 수정 파일·502개 미추적 파일은 변경하지 않음.
- 원인: 취향 저장 함수가 추천 ID를 저장하지 않아 추천 조회와 단절. 로그인·미저장 상태는 랜덤 대신 안내 카드 모드 선택. 브라우저 저장값은 메인 서버 조회의 근거로 사용되지 않음.
- 수정: 기존 추천 ID 컬럼 저장, 세션 회원별 최신 추천 조회, 과거 운영 ID 지원, 미저장 랜덤, 저장 실패 시 이동 중지, 완료 후 새 홈 문서 조회.
- 초기 검사: 전체 테스트 275개, 타입·변경 파일 ESLint 검사 통과. 오류 검증 중 가짜 DB 클라이언트가 error 필드를 항상 null로 지우는 것을 발견해 가짜 클라이언트도 수정.
- 바로 1차 검수: P2 발견. 카탈로그에 대응하지 않는 과거 추천이 투영 과정에서 사라져 빈 캐러셀이 될 수 있음. 합성 64개 설문 조합의 추천 카탈로그 대응은 통과.
- 보완: 최종 표시 가능한 카탈로그 목록을 기준으로 랜덤 대체하도록 수정, 관련 경계·오류 회귀 테스트 추가.
- 바로 독립 재검증: 같은 과거 상품 입력에서 random 분기와 랜덤 조회1회 확인. 전체 테스트 279개·TypeScript·변경 파일 ESLint·diff 공백 검사 통과. 합성·정적 범위 PASS.
- 빌드: Webpack 컴파일과 라우트 생성 후 Next.js `SecurityFatalError` 보안 업그레이드 안내로 종료1. 프로덕션 빌드 통과로 표시하지 않음. 의존성 자동 업그레이드 안 함.
- 보존 확인: 이미지·영상·카탈로그 데이터·CarouselContainer·ShareProductsCarousel·HomeProductCard·스타일 파일 변경 없음. 온보딩 JSX와 className 변경 없음.
- 미검증: 실제 Supabase 쓰기·RLS·운영 회원 세션·브라우저 재로그인·실제 iOS Safari·실구매. 실제 운영 DB에 접속하거나 저장하지 않음.
- 대기: Claude Code 실제 검토 결과, 최종 PR 등록 및 사용자 검토·머지.
- 감사 링크: https://github.com/whatukknow/Shoppingmall/issues/143


### 2026-10-30 23:59 KST — 교차검토 반영 및 최종 작성자 검사

- 실제 Claude Code 1차 읽기 전용 검토에서 혼합 카탈로그 ID·과거 운영 ID가 같은 상품이면 canonical ID 중복이 가능하다는 관찰을 받음.
- 최종 추천 응답에서 canonical ID별 첫 등장 순서만 유지하도록 수정. 중복 카드·React key 충돌 방지 회귀 테스트 추가.
- 바로 좁은 독립 재검증: 추천·저장 관련 10개 검사와 변경 파일 ESLint·공백 검사 PASS. 이 단계에서 전체 테스트를 독립 재실행한 것은 아님.
- 작성자 최종 검사: 전체 테스트 280개 PASS. 최종 Webpack 프로덕션 빌드 재실행 종료0. 앞선 보안 안내는 있었으며 의존성 버전은 변경하지 않았음. 설치된 Next.js의 보안 업그레이드 필요성은 별도 후속 검토 대상.
- 이미지 파일·카탈로그 데이터·CSS·캐러셀/카드 JSX는 변경하지 않음. Supabase 실제 운영 데이터 쓰기 없음.
- 테스트·빌드 로그 자체는 로컬 임시 저장소에만 유지하고, 외부 PR에는 결과와 재현 명령·제한만 기록.
