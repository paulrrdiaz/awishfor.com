## Context

See `proposal.md` — Why. What shapes the approach here:

- **Design source of truth**: Claude Design project `10380ffb-0586-4cc7-aa3b-862f4fb0ab17`, file `PublicWishlistPages.dc.html`, section `08 · ArchTrio · tres imágenes en arco · Cielo Suave Rosa · Baby Shower · con RSVP 3a`. The three-way RSVP exploration lives in `RSVP Section Proposals.dc.html`; only direction `3a` (tarjeta de respuesta) ships. That file's own rules footer states: *solo con link de invitado · nunca en el link general · después del hero, antes de la lista de regalos · una sola respuesta por link, editable hasta la fecha del evento · sin acompañantes registrados la sección pierde el bloque de acompañantes y queda en un solo sí/no*.
- **Theming**: `PublicThemeProvider` (`src/components/layouts/public-wishlist/public-theme-provider.tsx`) writes the active `ThemePreset.vars` onto a wrapper as CSS custom properties, so every descendant reads `--primary`, `--card`, `--border`, `--muted`, `--muted-fg`, `--accent-fg` from the parent. Anything inside it that hard-codes a color breaks theme switching.
- **Layout split**: six layouts render their body through `PublicWishlistBody`; three (`collage-staggered`, `split-image-right`, `arch-trio`, listed in `SELF_CONTAINED_LAYOUT_IDS`) compose their own page and own their `#regalos` markup. Any change to the gift section must be applied at four sites, not one.
- **Current RSVP**: `GuestWelcomeSection` → `RsvpControl`, rendered inside each layout's hero. `RsvpControl` fires `invite.respond` on click with no confirmation step and no companion input. All nine layouts already import it, so the swap touches all nine regardless.
- **Current data**: `InviteExtraGuest` stores only `{ id, inviteId, name?, sortOrder }`, and `resolvePersonalizedInvite` maps extras down to `{ name }` — dropping the id. There is no RSVP deadline field anywhere in the schema.

## Goals / Non-Goals

**Goals:**

- One RSVP component, driven entirely by theme tokens, that all nine layouts mount identically.
- Per-companion RSVP that the owner can actually read back on the Invitados tab.
- A gift band treatment that is defined once and applied consistently across both the shared body and the three self-contained layouts.
- An additive migration with no backfill and no downtime.

**Non-Goals:**

- Choosing a replacement hero treatment for the removed guest greeting. `Guest Name Hero Proposals.dc.html` (directions 1b/2a) stays an open product decision; this change simply leaves the hero without a greeting.
- Changing the trust model of the personalized link. See "Risks".
- Reworking `PublicGiftFilters`, `GiftGrid`, or `GiftCard` internals. The band wraps them; it does not restructure them.

## Decisions

### D1 — Replace `GuestWelcomeSection` outright rather than adding a second surface

The design's section 08 hero carries no guest greeting; the guest's name appears only in the RSVP card. Keeping both would print the guest's name twice on the same screen.

`guest-welcome-section.tsx` and its stories are deleted. `rsvp-control.tsx` is replaced by a new `src/components/shared/rsvp-section.tsx` (client component) rather than being extended in place — the component's contract changes from "fire a mutation on click" to "hold form state, then submit", so incremental edits would leave dead props behind. The `tone="on-photo"` prop disappears with it: the new section always sits on the page background, never over a photo, so the branch has no caller.

*Alternative considered*: keep `GuestWelcomeSection` in the hero for the greeting and add `RsvpSection` below. Rejected — duplicate name, and it contradicts the design file directly.

### D2 — Section placement: the same four sites as the gift band

Section 08's markup runs hero → event detail cards (Fecha / Lugar / Dresscode) → welcome message → motif divider → **RSVP** → gift band. So the section does not sit next to the hero at all; it sits directly above the gift list, at the end of the shared body sequence. The proposals footer's *"después del hero, antes de la lista de regalos"* is satisfied by both readings — the markup settles it.

That makes `PublicWishlistBody` the right host for the six layouts that use it: `<RsvpSection>` mounts immediately before the `#regalos` section, after the welcome message. The three `SELF_CONTAINED_LAYOUT_IDS` layouts mount it themselves in the same relative position.

This is the same set of four sites already touched for the gift band (D6), so both changes land together and the RSVP mount cannot drift from the band it sits above.

*Alternatives considered*: mounting in all nine layouts individually — rejected as nine mechanical edits where four suffice, with more drift surface. Mounting once in `PublicWishlistPage` between `<LayoutComponent>` and the footer — rejected, that lands the section after the gift list rather than before it.

### D3 — Per-companion status on `InviteExtraGuest`, not a JSON blob on `Invite`

`InviteExtraGuest.status RsvpStatus @default(pending)` reuses the existing enum, keeps the owner-side count a simple aggregate, and needs no backfill (existing rows adopt the default). A JSON column on `Invite` would have made the "2 de 3 confirmados" count an application-level parse and would not be queryable later.

`PublicGuestExtraGuestViewModel` becomes `{ id, name, status }`. The `id` is required — the submit payload keys companion statuses by it, and without it the client has nothing stable to send. Note this exposes `InviteExtraGuest.id` (a cuid) on a public page; it is an opaque identifier scoped to an invite the viewer already holds the URL for, so it leaks nothing the viewer does not already have.

### D4 — `respond` becomes a single transactional submit

```
respond({
  wishlistSlug, guestSlug,
  status: "confirmed" | "declined",
  extraGuests: { id, status: "confirmed" | "declined" }[]
})
```

The procedure loads the invite with its extras, rejects when the submitted id set does not exactly match the invite's extras (guards both stale clients and tampering), then writes the invite status, every extra guest status, and `respondedAt` in one `db.$transaction`. Partial writes would leave a party half-answered with no way for the guest to tell.

`status: "declined"` for the primary forces every extra guest to `declined` server-side regardless of what the client sent — the UI collapses the companion rows in that case, so the client has no meaningful values to offer, and the server should not trust them anyway.

Editability: the procedure accepts a response that overwrites an earlier one. It rejects once the wishlist's `eventDate` has passed (or, when `eventDate` is null, once `rsvpDeadline` has passed); with neither set, responses stay open indefinitely.

### D5 — `rsvpDeadline` is a real nullable column, not derived

The design shows *"confirma antes del 8 de agosto"* for an event on *"viernes 15 de agosto"* — seven days prior. Deriving that from `eventDate` would invent a business rule the product has not chosen, and `eventDate` is itself nullable. `Wishlist.rsvpDeadline DateTime?` is added and surfaced next to the event date in both editing surfaces (`wizard/details-step.tsx`, `dashboard/settings/wishlist-settings-form.tsx`). Null deadline → the section omits the deadline copy entirely.

Validation: the deadline may not fall after `eventDate` when one is set. Enforced in the shared Zod schema so both the wizard and settings get it.

### D6 — Gift band as a wrapper, with the constrained column preserved

Today the section is `mx-auto w-full max-w-4xl px-6 py-12` — putting a background on that element tints only the centered column. The band needs an outer full-width element carrying `bg-card border-t border-border` with the existing constrained element nested inside it unchanged.

The treatment is extracted into one shared wrapper component (or a single exported class constant) rather than copy-pasted, so the four call sites — `public-wishlist-body.tsx:71`, `arch-trio-layout.tsx:184`, `collage-staggered-layout.tsx:172`, `split-image-right-layout.tsx:150` — cannot drift. `id="regalos"` stays on the anchor target the hero CTA scrolls to; the scroll-margin utilities currently on the self-contained layouts' sections must move or stay with whichever element keeps the id.

### D7 — Unnamed extra guests get ordinal rows, not a "+N" count

The old guest section aggregated unnamed extras into "+2 acompañantes". That cannot carry a per-person toggle. Each extra guest — named or not — becomes its own row; unnamed ones are labelled by position ("Acompañante 1"). This is a visible behavior change for invites created with unnamed extras.

### D8 — Component structure

`RsvpSection` is a single client component holding the form state (`primary: "confirmed" | "declined" | null`, `extras: Record<id, status>`) and switching between three renders: pending form, responded summary, responded read-only. Splitting it into presentational children would spread one small state machine across files for no gain. Storybook coverage takes the states as props-driven stories.

## Risks / Trade-offs

- **Anyone holding the personalized URL can overwrite the whole party's answer, repeatedly, until the event date** → Accepted, unchanged from today's trust model: the personalized URL *is* the credential, `invite.respond` stays a `publicProcedure`, and the design explicitly calls for editable responses. What is new is the blast radius of one call (whole party vs. one enum). Mitigation is bounded by the transactional write plus the id-set match check, which prevents a caller from inventing companions. If this becomes a real problem, the fix is a per-invite response token, not auth — out of scope here.
- **The `--card` band is nearly invisible on the `clasico-minimal` theme** → `cielo-suave-rosa` gives `#FFFFFF` on `#FBF1F4`, a clear separation; `clasico-minimal` gives `#FFFFFF` on `#FAFAF8`, effectively no separation. The top border in `--border` (`#E4E4DF`) does the whole job on that theme. Accepted as-is since the border still delineates the section, but it means the band reads as a strong design move on six themes and a hairline on one. Flagged for a product call rather than silently compensated with a hard-coded tint, which would break D-theming.
- **All nine layouts must drop their `GuestWelcomeSection` usage even though only four gain the RSVP mount** → No layout has direct test coverage (`public-wishlist-page.tsx` and its layouts report no covering tests), so a missed removal would silently leave a stale greeting in one hero. Mitigation: deleting `guest-welcome-section.tsx` turns any missed usage into a compile error, plus a registry-level test asserting every layout renders the RSVP section when `guest` is present and omits it when absent.
- **Removing the hero greeting is user-visible regression until a hero treatment is chosen** → Personalized pages briefly lose the "¡Hola, Lady!" moment above the fold; the greeting reappears lower, inside the RSVP card. Accepted deliberately (see Non-Goals) — the alternative is blocking this change on an unresolved hero decision.
- **`PublicGuestExtraGuestViewModel` gains a required `id`** → Any consumer constructing that view model in tests or stories breaks at compile time. That is the desired failure mode; `pnpm typecheck` catches all of them.

## Migration Plan

1. Additive Prisma migration: `InviteExtraGuest.status` (`RsvpStatus`, default `pending`) and `Wishlist.rsvpDeadline` (`DateTime?`). Both nullable-or-defaulted, so existing rows need no backfill and the migration is safe to run against a live database.
2. Deploy server + client together. There is no period where an old client talks to the new `respond` signature, since both ship in one Next.js build.
3. Rollback: the migration is additive and the dropped columns are unread by the previous release, so rolling back the application alone restores prior behavior; the columns can be left in place.

## Open Questions

- Whether the `clasico-minimal` theme should get a distinct band treatment (e.g. `--muted` instead of `--card`) so the section separation reads there too. Deferring is safe: it is a one-token change confined to `public-themes.ts` or the band wrapper, and it changes no requirement, no interface, and no task.
