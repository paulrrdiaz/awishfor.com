## Context

Eight items in `docs/TASKS.md` are partially checked: the underlying features ship and pass, but the Claude Design brief added a tail of design/copy refinements on top. The brief's own files (`Claude Design Output.md`, `A Wish For.dc.html`) are not in the repo, so the exact Spanish copy strings in `docs/TASKS.md` are the source of truth. The relevant specs (`creation-wizard`, `public-wishlist-layout`, `public-wishlist-filters`, `public-wishlist-page`, `event-type-presets`, `wishlist-lifecycle`) already encode the feature shape; several already mention these behaviors loosely (e.g. countdown states, the five share actions, "de-emphasized purchased gifts"). This change tightens them to exact, testable copy and adds the one missing data field.

## Goals / Non-Goals

**Goals:**
- Add the `dressCode` wishlist field end-to-end (schema → validator → service → mappers → details card + wizard field).
- Pin exact, brief-accurate Spanish copy and interaction details for: countdown states, empty-filter states, slug states, past-date warning, preview/auth/success labels, and purchase consent.
- Make the public filter chips an accessible scroll-snap toggle group; make the purchase modal responsive (bottom sheet on mobile, dialog ≥ md).
- Pin a default theme + layout per event type matching the brief table.
- Leave each of the 8 TASKS items fully checkable.

**Non-Goals:**
- No new feature milestones; no dashboard share panel work (8.5/8.6 stay open, blocked on Milestone 7).
- No new dependencies, env vars, or API surface.
- No redesign of components beyond the listed refinements.

## Decisions

- **Copy lives next to where it renders, in Spanish constants.** These are UI strings for a single-locale (es) surface; introducing an i18n layer is out of scope. Slug-state and empty-filter copy already have natural homes in their components — extend those rather than create a strings module. Alternative (central `copy.ts`) rejected as premature for ~10 strings.
- **`dressCode` is `String?` on `Wishlist`**, mirroring `eventLocation` (optional plain text). One additive Prisma migration; nullable, so no backfill. Public mapper carries it; the details card hides when empty. Dashboard settings editing is out of scope here (that's Milestone 7) — wizard Details step is the only editing entry point now.
- **Purchase modal responsiveness reuses the existing Base UI primitive.** Render as a bottom sheet below `md` and a centered dialog at `md+` with a sticky 48px footer, via responsive classes on the existing modal — no new sheet component. Consent copy becomes the exact brief string.
- **Filter chips become a `role`-correct toggle group** with `aria-pressed` per chip, `overflow-x-auto` + `snap-x` for scroll-snap, and the selected chip inverted (`bg-foreground text-background`). Single-active-selection behavior is unchanged; only the rendering/markup and a11y tighten.
- **Purchased-gift de-emphasis is specified concretely**: ~60% opacity + line-through on the name, sorted below available gifts. The recommended-sort spec already orders purchased last; this adds the visual treatment to `GiftCard`/`GiftList`.
- **Event-type default theme/layout is data in `event-type-presets.ts`.** The `defaultThemeId`/`defaultLayoutId` fields already exist; this change only changes their values to the brief table and asserts them in the spec.

## Risks / Trade-offs

- **Hardcoded Spanish copy** → Acceptable: app is single-locale today; if i18n arrives, these constants are the extraction points.
- **Prisma migration in a feature branch** → Mitigation: additive nullable column, generated client regenerated via `pnpm prisma generate`; no data migration needed.
- **Tightening already-passing specs could surface drift** between spec text and current components → Mitigation: deltas copy the full existing requirement and only add the exact-copy clauses, so behavior scenarios stay intact; `pnpm test` + manual check of each surface before marking tasks done.
- **Default theme/layout reassignment changes seeded look for new wishlists** → Intended by the brief; existing wishlists store their own ids and are unaffected.

## Migration Plan

1. Add `dressCode String?` to `Wishlist`; `pnpm prisma migrate dev`; regenerate client.
2. Thread `dressCode` through validator schema, service create/update, and public/dashboard mappers.
3. Implement UI refinements per spec deltas (layout, filters, modal, wizard steps, presets).
4. `pnpm check`, `pnpm test`, `pnpm typecheck`; verify each surface; tick the 8 TASKS items.

Rollback: revert the branch; the nullable column can be dropped with a follow-up migration if needed.

## Open Questions

- None blocking. Dashboard editing of `dressCode` is deliberately deferred to Milestone 7 settings.
