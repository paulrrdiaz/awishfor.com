## Why

Milestone 8's landing page, demo preview, QR download, and FAQ already shipped, but three launch-blocking gaps remain: there are no legal pages (`/privacy`, `/terms`) and the footers link them to dead `#` anchors with no report/support contact; the WhatsApp share helper sends one generic message instead of the event-specific Spanish templates the brief calls for; and the marketing guest list-finder is a visual placeholder whose submit only fires a toast. These block a credible public launch (legal/consent transparency) and weaken the core sharing and discovery loops.

## What Changes

- Add `/privacy` and `/terms` legal pages under the marketing route group, naming the third-party processors (Clerk, PostHog, Sentry, UploadThing, Neon) and describing the guest purchase/contact data the product collects.
- Wire the marketing footer's "Términos de uso" / "Privacidad" links to the real routes, and add report + support contact (`hola@awishfor.com`) and a "Hecho con cariño en A Wish For" line to the shared public `wishlist-footer`.
- Replace the single generic `toWhatsAppShareUrl` message with event-type-specific Spanish templates (baby shower, birthday, wedding, housewarming, general), selected by the wishlist's `eventType`, used in the wizard publish step, dashboard share panel, and marketing.
- Wire the guest list-finder to resolve a pasted public link or exact slug to `/w/[slug]` (link/slug only — no name search, no DB name index), with clear not-found feedback.

### Non-goals

- No name-based search or search index across published wishlists (finder is link/slug resolution only).
- No cookie/consent banner (no ad/retargeting trackers added).
- No custom WhatsApp message editor; templates are fixed per event type.
- No changes to landing structure, theme, GSAP animations, QR generation, or FAQ — those already shipped.

## Capabilities

### New Capabilities
- `legal-pages`: Privacy and terms pages plus public footer legal/report/support links and contact email.
- `whatsapp-share-templates`: Event-type-specific Spanish WhatsApp share message templates used across publish, dashboard, and marketing share entry points.
- `guest-list-finder`: Public resolution of a pasted wishlist link or exact slug to the public wishlist page, with not-found feedback.

### Modified Capabilities
<!-- None. marketing-landing already requires the finder section and footer to exist; this change adds new behavior in separate capabilities rather than altering existing requirements. -->

## Impact

- **Routes/pages**: new `src/app/(marketing)/privacy/page.tsx`, `src/app/(marketing)/terms/page.tsx`.
- **Components**: `src/components/layouts/marketing/marketing-footer.tsx` (legal hrefs), `src/components/shared/wishlist-footer.tsx` (report/support/cariño links), `src/components/layouts/marketing/guest-finder.tsx` (lookup wiring).
- **Libs**: `src/lib/wishlist/share.ts` (per-event templates), possibly a new `src/lib/wishlist/slug.ts`/lookup helper for finder link parsing.
- **API**: `src/server/api/routers/wishlist.ts` — public `publicProcedure` lookup for finder slug resolution (reuses published-wishlist read path).
- **Consumers**: wizard `publish-step.tsx`, dashboard `overview-share.tsx`, `share-panel.tsx` switch to event-aware templates.
- **Config/env/schema**: none expected (support email is a constant; no new env vars or Prisma changes).
