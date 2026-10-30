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
