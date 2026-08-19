# Verification — add-transactional-email

## Provider

- Provider: Resend
- Account: created, API key issued and stored in `.env` as `RESEND_API_KEY`

## Sending domain

- Domain: `awishfor.com`
- Resend domain status: **verified** (confirmed via `GET /domains` on 2026-08-19)
- Region: `sa-east-1`
- Sending: enabled
- `from` identity: `no-reply@awishfor.com` (`EMAIL_FROM` in `.env`)

## Delivery checks

- [x] 5.2 Inbox placement (not spam) confirmed for Gmail — landed in Inbox, categorized under the **Promotions** tab rather than Primary (confirmed by screenshot, 2026-08-19). Not spam, but worth revisiting sender reputation/headers if the real invitation email underperforms once `add-wishlist-collaborators` ships.
- [x] 5.3 Plain-text alternative confirmed to render correctly with HTML disabled — confirmed via Gmail "Show original" (2026-08-19)
- [x] 5.4 Domain verification complete — see above
