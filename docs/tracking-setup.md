# Buyphone tracking setup

## IDs and environments

- GTM web container: GTM-5NC48789 (account 6404562997, container 286551623, workspace 2).
- GA4 property: 563958095. Web stream: 16327688286. Measurement ID: G-KYP75GP21W.
- Local development: http://localhost:5173/ uses the normal GTM loader.
- Production: Cloudflare Google Tag Gateway is enabled for buyphone.lk at /metrics/; Set up tag is off. Gateway does not run on localhost.
- Root bootstrap skips its direct GTM loader when Cloudflare's google_tags_first_party marker contains the same container. A separate one-time guard prevents repeated direct loading.

## Unpublished GTM setup

- CE - virtual_page_view: exact custom event virtual_page_view.
- Google Analytics G-KYP75GP21W: Initialization - All Pages, send_page_view = JS - Boolean false. Additional analytics_storage consent check is retained.
- GA4 - page_view - SPA: page_view on CE - virtual_page_view, mapping page_location, page_path, page_title from matching Data Layer Variables.
- Legacy Google Tag, suppression HTML experiment, ecommerce, and Meta draft tags remain paused. Do not enable the suppression experiment.
- This source change does not publish the 23 pending workspace changes or add a direct GA4 script.

## Verification on 2026-11-13

- npm run typecheck passes across the source project.
- npm run build passes, including sitemap/RSS generation.
- npm run test:tracking covers SSR safety, URL filtering, nested private-key filtering, cyclic/throwing payload safety, route readiness/title timing, duplicate suppression, admin exclusion, cancelled navigation, and Cloudflare/direct loader exclusivity.
- GTM Preview connected to localhost: five settled public page visits produced five virtual_page_view events and five GA4 page_view hits. Initial load, Shop, product, and browser history were exercised. Rapidly cancelled transitions are intentionally excluded.
- Login, registration, and search render after fixing missing imports and search head metadata. Search title includes the validated query.
- Tag Assistant hit details show G-KYP75GP21W, sanitized localhost page_location, and _dbg=1. GA4 DebugView subsequently confirmed eight page_view events (11 total events including first_visit, session_start, and user_engagement). The latest page_view contained http://localhost:5173/search?q=iphone and the correct search title. The device counter showed zero despite events being visible; receipt was verified from the actual event timeline and parameters.
- Supabase zero-record queries accepted the coupon, inventory log, and review columns represented by the existing migrations. No database migration or customer-data read was performed.
- Functional lint passes for changed storefront/tracking files with formatting checks excluded. Wider source lint still reports existing no-explicit-any and React refresh warnings; these are not a clean full-lint result.
- Tag Assistant may produce a development hydration warning by adding data-tag-assistant attributes to the html element before hydration.

## Still required before calling ecommerce complete

This reverted checkout does not yet dispatch view_item, search, add_to_cart, begin_checkout, or verified purchase ecommerce payloads. Current ecommerce TypeScript types still describe future top-level fields rather than the GTM draft's nested ecommerce object. Implement and validate that contract before unpausing ecommerce tags. Meta/catalog validation is also pending.

No new consent default or implicit consent grant was added. A complete analytics/marketing preference lifecycle must be validated before publishing. Private-key and common email/phone text filtering is defensive, not proof that arbitrary free text is free of personal data.

To test unpublished tags: open workspace 2, click Preview, connect http://localhost:5173/, navigate slowly enough for each destination to settle, and compare virtual_page_view messages with GA4 page_view hits. Verify GA4 DebugView and production gateway hits separately. GTM publication requires owner approval.
