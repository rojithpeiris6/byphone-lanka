# Buyphone.lk tracking — 13 November 2026

The local source implementation and unpublished GTM workspace are configured. GTM has not been published. A production deployment, confirmed test order, and Meta catalog import remain separate release steps.

## Verified accounts

- Source: `D:\WebProjects\Buyphone-GTM-intregration`, branch `ekvin`.
- GTM: `GTM-5NC48789`, account `6404562997`, container `286551623`, workspace `2`. The user selected this container instead of GTM-WXCMVZ4M. Google administrator access was verified earlier; this is not a legal ownership determination.
- GA4: account `59329457`, property `563958095`, stream `16327688286`, measurement ID `G-KYP75GP21W`.
- Meta: existing Buyphone.lk Pixel/dataset `1904367720546258`, owner Imagine Idea `419698455433022`. The user confirmed reusing this Pixel; no new Pixel was created. Portfolio-wide access works. The unrelated Imagine Idea PVT LTD restriction does not describe this Pixel's owner.
- Cloudflare: Google Tag Gateway was enabled for `buyphone.lk`, path `/metrics/`, container GTM-5NC48789. Cloudflare's additional “Set up tag” option is off. GTM Admin still says gateway “Not started”; actual production routing must be checked after deployment and publishing.

## Source changes

- SSR-safe dataLayer helper, URL filtering and common private-field/email/phone filtering; tracking errors do not break storefront rendering. Filtering is defensive and cannot guarantee that arbitrary free text contains no personal data.
- Settled public SPA navigation emits `virtual_page_view` after the destination title updates. Repeated/cancelled navigation and admin routes are excluded.
- Separate analytics/marketing choices default to denied, restore saved explicit preferences, update Google consent states, and support withdrawal. No silent consent grant.
- Real product/search/cart/checkout interactions emit `view_item`, `search`, `add_to_cart`, and `begin_checkout`. Ecommerce clears stale state first, uses numeric LKR values and products.id UUIDs, and includes selected variant price/quantity.
- Purchase verification requires a signed checkout receipt, verifies the current order on the server, permits eligible COD or paid orders, rejects cancelled/refunded/unpaid/inconsistent records, and excludes shipping from ecommerce.value. Browser persistent deduplication and transaction IDs reduce repeats. Purchase delivery has not been tested with a real order, and browser/storage limits prevent an absolute cross-device guarantee.
- Checkout defaults to its available COD method, avoids initializing an unconfigured Paddle client, validates variant/product membership, applies coupon discounts server-side, and checks payment transaction/order association.
- The real server-only Supabase key is used privately. Existing report/settings server functions now verify the bearer token and admin role before privileged queries. Browser server-function requests attach the existing signed-in session token. No key is embedded in client files or committed.
- Local Vite/Netlify middleware and cache separation were corrected so production builds do not leave localhost serving untransformed assets.
- Live XML/CSV catalog endpoints query public active products. Canonical product UUID, current base/sale price, image, product URL, brand, stock availability, and product_type are mapped. Missing images are excluded. Feeds refresh through requests with 5-minute browser/15-minute shared caching, rather than requiring a stale postbuild snapshot. Variant-specific price differences are not separate catalog variants; the catalog uses parent product UUIDs/base offers.

## Saved GTM draft

38 pending workspace changes; nothing published. Final actual workspace export: `GTM-5NC48789-ecommerce-workspace.json`.

| Object | ID | Saved behavior |
|---|---:|---|
| CE virtual_page_view | 4 | Exact custom event |
| Analytics consent granted | 27 | tracking_analytics_granted |
| Ecommerce/search trigger | 21 | view_item, search, add_to_cart, begin_checkout only |
| Verified purchase trigger | 28 | purchase |
| Consent update trigger | 35 | tracking_consent_update |
| Google Analytics initialization | 17 | Initialization + analytics grant; once per event; send_page_view boolean false; analytics consent required |
| Manual SPA page_view | 16 | virtual_page_view, sanitized location/referrer and title/path |
| GA4 ecommerce/search | 22 | Data Layer ecommerce, Event name, search_term; enabled for Preview |
| Meta base/SPA PageView | 23 | Pixel init once, autoConfig false, virtual navigation, marketing consent; enabled for Preview |
| Meta ecommerce | 25 | ViewContent/Search/AddToCart/InitiateCheckout, UUID content_ids/contents, LKR/value; enabled for Preview |
| Meta consent withdrawal | 37 | Revoke/grant only an already initialized Pixel |
| GA4 purchase | 31 | Paused pending confirmed order test |
| Meta purchase | 39 | Paused pending confirmed order test; transaction-based eventID |
| Legacy Google tag / HTML experiment | 3 / 26 | Paused; do not re-enable alongside the verified initialization |

Data Layer variables map page fields, ecommerce, items, currency, value, shipping, transaction_id, coupon, search_term and marketing_allowed. Google automatic event detection and user-provided data capabilities are disabled in the draft. GA4 Enhanced Measurement was observed off. Meta automatic events, detailed page/product capture and automatic advanced matching were observed off and were left off.

## Verification actually performed

- Full TypeScript check and production build pass.
- Tracking regression tests pass: SSR/failure isolation, privacy filtering, router timing/history/deduplication, consent defaults/withdrawal, ecommerce validation/reset/value, persistent purchase deduplication, signed receipt integrity/expiry, catalog mapping and mocked purchase eligibility.
- Admin authorization regression tests reject missing/invalid tokens and non-admin users and allow verified admins.
- Focused lint on tracking modules, new preferences/purchase/admin middleware passes. Repository-wide lint is not clean; existing unrelated typing/formatting issues remain.
- The server key accepted a zero-record schema query; no customer records were fetched for that check. Actual server key and signing secret were absent from the browser production bundle.
- Both localhost catalog endpoints return HTTP 200 and 50 product records. Product UUID `6a71e107-6819-441c-8323-2f0233cc09e5` was observed in Meta ViewContent with LKR 430000.
- GTM Preview exercised initial navigation, public SPA routes, product view, cart add, checkout start, search and consent changes. Initial denied loads did not fire optional tags; denied navigation emitted no virtual page event. The initialization tag was changed from once per page to once per event so it can run after consent is granted.
- GA4 DebugView visibly received page_view, view_item, add_to_cart, begin_checkout and search. A final timeline showed four page views and one each of those ecommerce/search events in the selected sequence. Earlier history/back testing produced five virtual page events and five hits. These are tested sequences, not a guarantee for every route/device.
- Meta Test Events processed PageView, ViewContent, AddToCart, InitiateCheckout and Search from localhost. Product UUID/currency/value were inspected.
- Tag Assistant retained some deferred-hit warnings during consent/reload experiments; successful GA4 receipt was verified from DebugView. Production consent and routing checks remain required. Its injected html attributes may also cause a development-only hydration warning.
- No real order, payment, inventory mutation, ad campaign or advertising spend was created during tests. Local cart state changed only in the browser.

## Remaining release steps

1. Deploy the pushed source using the normal hosting workflow. In hosting's server environment, privately set matching SUPABASE_SERVICE_ROLE_KEY and TRACKING_RECEIPT_SECRET plus the public Supabase URL/key. Never prefix private keys with VITE_. The signing secret must remain stable across instances/deployments for outstanding receipts.
2. Confirm the deployed storefront renders and `/meta-catalog.xml` and `/meta-catalog.csv` return the new feed. Confirm Cloudflare `/metrics/` routing, one GTM container load, consent-before-tag behavior, and no additional legacy analytics installation on production.
3. After explicit approval, publish only the reviewed non-purchase GTM setup. Keep purchase tags 31/39 paused until an authorized confirmed test order validates totals, payment policy, reload and return navigation. A URL order number alone must not send Purchase.
4. In Meta Commerce Manager create/select the Buyphone catalog, use scheduled feed `https://buyphone.lk/meta-catalog.xml` (CSV alternative available), choose LKR, connect Pixel 1904367720546258 as its event source, and inspect import diagnostics. Match feed id exactly to event content_ids/contents.id, retaining the parent UUID strategy. No catalog has been created or connected by this work yet.
5. Run the confirmed order test, verify Purchase in GA4/Meta with transaction ID and correct value/shipping, then separately approve enabling/publishing purchase tags. Add server-side transaction/inventory enforcement and cross-device conversion idempotency if those stronger guarantees are required; existing sequential order/stock writes were not redesigned here.

No authentication prompt is currently blocking GTM/GA4/Meta access. The remaining blockers are release approval, production environment/deployment checks, catalog import, and a confirmed purchase test.
