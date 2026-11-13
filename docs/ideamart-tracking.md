# Ideamart Subscription 1

Event: ideamart_subscription_1. Label: Ideamart Subscription 1. Fires only after the existing Notify Me OTP verification returns success, not on button click, phone submission, OTP request or failure. Privacy choices are respected. Phone number, OTP and reference number never enter the tracking payload.

The current server verifies OTP through appzone.lk but does not independently check subscription/billing status or store a product-specific stock-alert subscription. Therefore verification_status is otp_verified; this event must not be described as independently confirmed paid subscription revenue. Confirm the provider contract and stock-alert delivery before treating it as a completed paid subscription.

GTM-Ideamart-Subscription-1-draft.json contains a merge-ready paused GA4 tag and exact event trigger. This file has not been imported/published. Test with an authorized provider sandbox/number before enabling the tag; no real OTP or SMS subscription was requested during implementation.
