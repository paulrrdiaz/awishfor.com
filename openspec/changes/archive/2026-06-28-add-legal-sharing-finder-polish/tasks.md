## 1. WhatsApp share templates

- [x] 1.1 Add `whatsAppMessageForEvent(eventType, publicUrl)` in `src/lib/wishlist/share.ts` with Spanish templates for `baby_shower`, `birthday`, `wedding`, `housewarming`, and `general`, each ending with the public URL; `general` is the fallback for unknown values.
- [x] 1.2 Update `toWhatsAppShareUrl` to accept an optional `eventType` and build the message via `whatsAppMessageForEvent` (keep URL-only behavior working as the general fallback).
- [x] 1.3 Pass the wishlist `eventType` from `publish-step.tsx`, `overview-share.tsx`, and `share-panel.tsx` into the share URL builder.
- [x] 1.4 Add Vitest coverage for each event-type template and the general fallback (message content + URL-encoded `wa.me` link).

## 2. Legal pages

- [x] 2.1 Add `src/app/(marketing)/privacy/page.tsx` as a static, indexable RSC inside the marketing layout, disclosing processors (Clerk, PostHog, Sentry, UploadThing, Neon) and the guest purchase/contact data collected.
- [x] 2.2 Add `src/app/(marketing)/terms/page.tsx` as a static, indexable terms-of-use RSC inside the marketing layout.
- [x] 2.3 Add a shared support-contact constant (e.g. `hola@awishfor.com` in `src/config/contact.ts` or `share.ts`) reused by footers and legal pages.

## 3. Footer links

- [x] 3.1 Point marketing footer links: Términos→`/terms`, Privacidad→`/privacy`, Contacto→`mailto:hola@awishfor.com`.
- [x] 3.2 Add to shared `wishlist-footer.tsx`: "Hecho con cariño en A Wish For" line, a report `mailto` link, and the support email.

## 4. Guest list-finder wiring

- [x] 4.1 Add a client helper to extract a slug from the finder query: match a `/w/<slug>` segment in a pasted URL/path, or accept a bare slug matching `^[a-z0-9-]{3,60}$` with no leading/trailing hyphen.
- [x] 4.2 Wire `guest-finder.tsx` to navigate via `router.push("/w/<slug>")` on successful extraction, replacing the toast placeholder.
- [x] 4.3 Show inline Spanish not-found feedback ("No reconocimos ese enlace o nombre de lista") when extraction fails; do not navigate and do not call any name-search.
- [x] 4.4 Add Vitest coverage for the slug-extraction helper (full URL, bare slug, malformed input).

## 5. Validation

- [x] 5.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any issues.
- [x] 5.2 Manually verify `/privacy`, `/terms`, footer links, an event-type WhatsApp share, and finder link/slug resolution + not-found feedback.
