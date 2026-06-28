## Context

Milestone 8 landing, demo, QR, and FAQ shipped. Remaining gaps are legal pages, event-aware WhatsApp templates, and finder wiring. Current state:

- `src/lib/wishlist/share.ts` exports `toWhatsAppShareUrl(publicUrl)` with one hardcoded message; consumed by `publish-step.tsx`, `overview-share.tsx`, `share-panel.tsx`, and marketing.
- `marketing-footer.tsx` links Términos/Privacidad/Contacto to `#`. The shared public `wishlist-footer.tsx` has no legal/report/support links.
- `guest-finder.tsx` validates a 2–80 char query then fires a placeholder `toast.info`.
- Public read path already exists (`public-wishlist.service.ts` + `/w/[slug]`); `wishlist.checkSlugAvailability` is the only public `wishlist` router procedure today.

Constraints: marketing theme tokens scoped to `.marketing-theme`; legal pages live in `(marketing)` group; Spanish copy is the product default; no new env vars or Prisma changes.

## Goals / Non-Goals

**Goals:**
- Real `/privacy` + `/terms` pages with processor + guest-data disclosures, linked from footers.
- Public footer carries report + support contact and brand line.
- Event-type-aware WhatsApp templates, single source of truth, used everywhere share happens.
- Finder resolves a pasted link or exact slug to `/w/[slug]` with clear not-found feedback.

**Non-Goals:**
- Name search / search index; cookie banner; custom message editor; changes to landing structure/theme/GSAP/QR/FAQ.

## Decisions

### Finder: client-side slug extraction, no name-search endpoint
Parse the query client-side: accept a full URL (extract the `/w/<slug>` segment) or a bare slug matching the existing slug rules (`^[a-z0-9-]{3,60}$`, no leading/trailing hyphen). On valid extraction, navigate via `router.push("/w/<slug>")`; the existing public page renders 404 for unknown/draft slugs, which doubles as the not-found path. Show inline error for malformed input before navigating.

- **Why over a server lookup procedure**: the public page already handles existence/draft/404. A dedicated `findBySlug` query would duplicate that logic and add a round-trip. Link/slug-only scope (per product decision) means no name index is needed.
- **Alternative considered**: a `publicProcedure` that confirms existence and returns the canonical path. Rejected — adds surface area and a privacy vector (slug enumeration) for no UX gain over letting `/w/[slug]` 404.
- If extraction yields nothing usable, keep the user on the page with a Spanish error ("No reconocimos ese enlace o nombre de lista").

### WhatsApp templates keyed by `EventType`
Add a `whatsAppMessageForEvent(eventType, publicUrl)` (and keep `toWhatsAppShareUrl` as a thin wrapper or update its signature to take an optional `eventType`) in `src/lib/wishlist/share.ts`. Templates map `EventType` (`baby_shower | birthday | wedding | housewarming | general`) → Spanish message, each ending with the public URL, falling back to `general`. Callers pass the wishlist's `eventType` (already on view models / available at publish + dashboard).

- **Why colocated in share.ts**: single source of truth already imported by all three consumers; no new module needed.
- **Alternative**: per-consumer inline strings. Rejected — drift risk, harder to test.
- Templates are pure functions → covered by Vitest like existing share/format helpers.

### Legal pages: static RSC pages in `(marketing)`
`/privacy` and `/terms` are static server components reusing the marketing shell/footer for consistent theme. Content names processors (Clerk, PostHog, Sentry, UploadThing, Neon) and the guest purchase/contact data (name + optional email/phone/message shared with the list owner, matching the purchase-modal consent copy). Indexable (unlike `/w/[slug]`).

### Footer links
Marketing footer: point Términos→`/terms`, Privacidad→`/privacy`, Contacto→`mailto:hola@awishfor.com`. Shared `wishlist-footer`: add "Hecho con cariño en A Wish For", a report `mailto:hola@awishfor.com?subject=...`, and support email. Support email as a shared constant (e.g. in `share.ts` or a small `src/config/contact.ts`) to avoid duplication.

## Risks / Trade-offs

- [Finder slug extraction misparses unusual links] → Restrict to the `/w/<slug>` pattern + bare-slug regex; anything else shows the inline not-found message rather than navigating wrong.
- [Legal copy is product/legal-sensitive, not engineering] → Ship clear, accurate disclosures of processors and guest data; flag that final legal review is a business follow-up, not a code gate.
- [Changing `toWhatsAppShareUrl` signature breaks callers] → Update all three consumers in the same change; keep a URL-only overload/default so nothing silently regresses. Tests cover each event type.

## Migration Plan

Additive only — new pages, new footer links, new template function, finder behavior swap. No schema/env/data migration. Rollback = revert the change; no persisted state involved.

## Open Questions

- Exact legal copy wording is subject to business/legal sign-off; engineering ships accurate-by-construction placeholders naming the real processors and data.
