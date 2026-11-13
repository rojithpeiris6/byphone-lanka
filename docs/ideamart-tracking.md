# Ideamart Subscription 1

Three events: ideamart_phone_submitted (initial phone form submission), ideamart_otp_submitted (each verification attempt), and ideamart_subscription_1 (successful provider response with subscriptionStatus exactly REGISTERED). Attempts include API failures and legitimate retries. Resend OTP is not a new initial phone submission. GA4 event count measures attempts; total users measures consenting browser users, not distinct phone numbers.

All stages respect existing tracking preferences and exclude phone, OTP, provider reference and subscriberId. Product UUID and fixed stage metadata only are sent. A synchronous submission lock blocks duplicate in-flight form submissions; success deduplicates the provider reference in memory.

The appzone.lk proxy must forward subscriptionStatus from Ideamart. S1000 alone is OTP success and does not count as registration. Missing/pending/unregistered status does not fire registration success. Official contract: https://docs.ideamart.io/developer-docs/otp-api/ . No live OTP, paid subscription or SMS was requested during tests. Confirm the proxy response using an authorized test before enabling.

GTM-Ideamart-Subscription-1-draft.json is merge-ready with all three GA4 tags paused; not imported or published. Import with Merge/overwrite matching names into the existing workspace, map funnel_step and item_id if needed, test, then approve activation. No Meta funnel tag was added.
