# English raw / DIY catalog integration — 2026-10-30

Follow-up to [#137](https://github.com/whatukknow/Shoppingmall/issues/137) and [#138](https://github.com/whatukknow/Shoppingmall/issues/138).

Branch: `feat/yc-english-catalog`. Base: `origin/main` at `f0e51d3` (includes #136, removal of the mock runtime).

## Menu and translations

- 34 raw products and 22 DIY kits share the menu prepared for the presentation and the earlier server release. `diy-20` and `diy-22` remain excluded because their included raw ingredient lists were empty.
- Included ingredients reference exact raw product IDs and names. Pantry ingredients are listed separately and are not included in the kit. Recipe amounts are proposals, not confirmed fulfillment quantities.
- Korean source names and stable IDs remain intact for database binding and recommendation matching. English labels, farm concept captions, ingredient names, recipe steps and notices are applied at the presentation boundary.
- The English changes from #137 are retained, including `Brand information`, `Seoin Bae`, `littleportionscs@gmail.com`, and removal of the Company/registration-number fields and the old `pc-102` catalog item.
- Unknown live text is preserved instead of being replaced with fabricated product facts. New operational copy needs its own reviewed translation.

## Images

All 426 WebP derivatives are included under `uploads/catalog`, with original/derivative SHA256 and byte sizes in `domains/products/data/image-manifest.json`. The existing uploads route serves these assets. Image pixels remain the supplied concepts; English localization changes surrounding UI and alt text.

| Location                                                     | Image role                                       |
| ------------------------------------------------------------ | ------------------------------------------------ |
| Raw detail gallery                                           | 01–04                                            |
| Home recommendations/popular cards                           | 05                                               |
| Taste Finder raw ingredients, including collection animation | **06 portion package**                           |
| Raw story                                                    | 07                                               |
| Raw catalog                                                  | 08 illustration                                  |
| DIY gallery                                                  | 01–04                                            |
| DIY included ingredients / recipe / story                    | 02 / 03 / 07                                     |
| DIY catalog and Taste Finder kit                             | 08 (diy-01 retains its existing 00-catalog file) |

The images are generated concepts, not verified photographs of suppliers, packages or fulfillment contents. Original questionnaire layout/navigation and existing gallery positions are retained.

## Operational boundaries

- `GET /api/products` and `GET /api/products/:id` project the shared menu from real product bindings. All requests use the live API client from #136; no mock runtime or endpoint fallback switch is reintroduced.
- Exact names or explicit `details.catalogId` bind operational rows. Ambiguous, missing, inactive or unpriced bindings cannot enable purchases. Null prices remain unknown, not zero.
- Bound details and pod navigation keep operational product IDs and prices. Historical product IDs continue to resolve through the existing operational detail query.
- No database rows, prices, inventory, RLS, orders or payments were changed during this integration.

## Verification

- 270 tests pass, including English coverage for all 56 menu entries and all kit ingredients/recipe steps, operational ID/price preservation, recommendation membership, image placement and SHA256 checks for all 426 assets.
- TypeScript and scoped ESLint pass (one pre-existing unused-variable warning in `brandStoryMotion.js`). Production build passes.
- The upload-route tests create and remove their own PNG fixtures, so a clean checkout no longer needs ignored legacy images to run the tests.
- Local visual checks use a temporary review route with catalog drafts and seeded questionnaire answers, not a real authenticated session. That route was removed before commit. All 426 local image URLs returned 200. The browser confirmed 56 English menu links, DIY thumbnail switching and loaded slot-06 Taste Finder images. No real login, order or payment was performed.

## Deployment distinction

The existing public server was previously updated with the Korean catalog release `catalog-20261030-raw34-diy22`, build `cTnlJ-s-w6Plkatr8xol4`. Its 56 menu entries and 426 image responses were verified then. That deployment does not establish that this English integration is deployed.

This change is prepared for Git publication. Review the pull request and satisfy required checks, then merge into `main`. Deploy only that merged `main` commit, retaining the existing environment; do not deploy the feature branch before merge. Run authenticated order/payment and mobile checks separately before claiming those flows have passed end to end.


## 2026-10-31 사용자 후속 결정

위 표는 10월30일 통합 당시 기록이다. 이후 승인된 현재 계약과 실행 결과는 `TASTE-HOME-FLOW.md`를 따른다.

- 취향 찾기 내부 상품 담기·추천 상품은 이름별 픽셀아트로 복구한다(#145).
- 메인 첫 추천 원물은06 소분 패키지 이미지를 사용한다(#146).
- DIY22 메인 추천·목록은 기존 투명 catalog 컷아웃을 사용하며 상세01~04는 유지한다(#147).
- 원물06 전체34종의 투명 컷아웃은 별도 작업(#148)이며, 승인된 결과는 아직 없다. 원본 이미지는 보존한다.

### 2026-10-31 00:41 KST — 원물06 로컬 컷아웃 후속 적용

사용자 승인에 따라 원물34종의 06 소분 포장 이미지를 로컬 외곽 마스크로 처리했다. 원본 RGB·규격·포장과 기존426개 자산을 보존하고 투명 WebP34개만 추가해 manifest460개로 확장했다. rawProducts의 tasteFinderImage만 새 컷아웃으로 변경했으며 상세 갤러리·원본06·원물05는 유지했다. DIY22는 기존 투명 catalog 컷아웃을 계속 사용한다. 메인 추천의 실제 적용과 독립 검증은 TASTE-HOME-FLOW.md, 팀 요구사항 대조와 신규 계정 미검증 상태는 SLACK-REQUIREMENTS-CHECK-20261031.md에 기록한다. PR #144 초안에 반영하며 사람 머지·서버 배포는 별도이다.
