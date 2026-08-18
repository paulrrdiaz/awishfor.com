## Context

See `proposal.md` for motivation. A wishlist currently has one required `title` that feeds dashboard identity, slug generation, public headings, sharing, and metadata. There is no separate short supporting-copy field. The persisted wizard draft, save/publish schemas and services, Prisma model, owner/public mappers, settings mutation, and nine public layouts all carry or consume the title independently.

Six public layouts delegate their content below the hero to `PublicWishlistBody`; `collage-staggered`, `split-image-right`, and `arch-trio` own their section composition. `HeroCtas` currently lives in the hero for the six shared-body layouts and `collage-staggered`. `split-image-right` already places it after its welcome content, and the working tree contains a user-owned `arch-trio` edit that moves it into the welcome/countdown column. Apply work must preserve and complete that edit rather than replace it.

The existing OpenSpec contract calls the control group a hero CTA and says the title appears alone. The delta specs deliberately replace those placement assumptions while preserving the title as the only hero heading and preserving all CTA interactions.

## Goals / Non-Goals

**Goals:**

- Keep `title` as the only wishlist identity and heading while adding a small, optional guest-facing supporting line.
- Make one normalized subtitle value survive every wizard, database, settings, preview, and public rendering path.
- Give brand-new wizard users useful generic copy without injecting that copy into existing database rows or legacy local drafts.
- Move one shared CTA group consistently into the welcome-message content region across all nine layouts without changing its behavior.
- Preserve full, preview, compact, standalone, embedded, personalized, and themed rendering behavior.

**Non-Goals:**

- Reintroducing the removed `heroTitle` or `displayName` concepts.
- Event-specific presets, AI copy generation, subtitle variants, rich text, or multiline editing.
- Changing title-derived slugs, dashboard labels, share titles, social descriptions, or Open Graph images.
- Reordering event details, RSVP, gifts, thank-you content, or footer beyond the CTA relocation.
- Refactoring all layout title markup or completing the remaining self-contained-layout migration.

## Decisions

### 1. Store `subtitle` as nullable normalized text

Add `subtitle String?` beside `title` on `Wishlist`. Define one reusable optional validator capped at 160 characters; trim input and normalize empty strings to `null`. The TypeScript/Prisma property is `subtitle`, not `subTitle`, because “subtitle” is one word and matches established platform terminology.

The limit is shorter than the 2,000-character welcome message and longer than a typical one-line tagline. It prevents a second essay-sized hero block while allowing natural Spanish copy. Database-level nullability keeps existing rows backward-compatible and distinguishes intentionally absent copy from the wizard suggestion.

Rejected alternatives:

- Reuse `welcomeMessage`: it has different purpose, requiredness, placement, length, attribution, and visual variants.
- Derive the subtitle from event details: hosts need free-form context, and generated date/location content would duplicate the event-details section.
- Store an empty string: normalization is already the repository convention for optional text and conditional rendering is clearer with `null`.

### 2. Seed only brand-new wizard drafts

Define the generic copy once in the wizard domain and use it when `emptyDraft()` creates a genuinely new draft or reset starts over:

`Una lista creada con cariño para celebrar juntos.`

The subtitle is not part of `EVENT_TYPE_PRESETS` and needs no `copyTouched` flag because it does not change with event type. Users may edit or clear it directly. Bump the persisted wizard-store version and migrate drafts from earlier versions with `subtitle: ""`, preserving the rule that preexisting work does not acquire newly public content without its owner's action.

Server-loaded database drafts with `subtitle = null` similarly map to an empty local string. Preview mapping uses the draft value and does not add a fallback; therefore a cleared or migrated subtitle disappears immediately and accurately previews publication.

Rejected alternative: seed from every event preset. This would require touch tracking to prevent event-type changes from overwriting edits and would contradict the requested generic, event-neutral copy.

### 3. Carry subtitle through the complete write/read graph

The data flow is:

```text
Details input
  -> persisted Zustand draft
  -> save/publish input validator
  -> draft service create/update
  -> Wishlist.subtitle
  -> public/owner query projection and mapper
  -> PublicWishlistViewModel / Settings data
  -> nine layout heroes

Settings input
  -> owner-scoped updateSettings validator/mutation
  -> Wishlist.subtitle
  -> public cache/path invalidation
```

Update both wizard transforms (`draftToSaveDraftInput` and server-conflict restoration), both preview transforms (local draft and persisted dashboard data), service record types/data objects, router projections, public/dashboard view-model types, and their mappers. Generated Prisma files are regenerated, never hand-edited.

Social metadata deliberately remains `title` plus the existing welcome-message/event fallback. This avoids silently changing share cards and keeps the proposal's subtitle purpose limited to the visible page.

### 4. Render subtitle locally inside each hero composition

Each layout already owns materially different title typography, alignment, overlays, and spacing. Add a conditional supporting-text element directly after its existing `h1`, using body typography, a restrained size, muted/appropriate contrast, and layout-specific alignment. Do not introduce a shared title-block abstraction solely for two text nodes; that abstraction would need enough styling escape hatches to provide little consistency.

Render the subtitle in `full`, `preview`, and `compact` modes when present. Conditional markup owns its margin so a missing subtitle creates no gap. The title remains the only `h1`, and subtitle text uses paragraph semantics. On photographic heroes, use the established white/opacity treatment; elsewhere use theme semantic tokens.

The Details-step header preview also renders the real draft subtitle beneath its title. Other live previews receive the field through `draftToPreview` and therefore exercise the same layout code as public pages.

### 5. Centralize CTA relocation where composition is already shared

For the six layouts backed by `PublicWishlistBody`, remove `HeroCtas` imports/calls from their hero components and render one group inside `PublicWishlistBody` after `WishlistMessage`. This gives those layouts one placement owner and prevents duplicate controls.

For self-contained layouts:

- Preserve the user-owned `arch-trio` relocation after its welcome/countdown content and correct its final formatting while integrating.
- Keep `split-image-right` in its already compliant post-welcome position.
- Move `collage-staggered` from beneath the hero imagery to after `WishlistMessage` and before RSVP/gifts.

The primary `Ver regalos disponibles` anchor, scoped smooth scrolling, optional `Cómo funciona` trigger, drawer portal/theme behavior, `showHowItWorks` toggle, and component styling remain in `HeroCtas`. Non-compact modes render the group; compact mode continues to omit it. Layouts may keep an existing countdown between the welcome message and CTA when both occupy the same content region, matching `arch-trio` and the supplied design.

Rejected alternatives:

- Put CTA placement in `WishlistMessage`: that would couple an independent navigation/action component to message variants and complicate message-only stories/tests.
- Add CTA composition to `PublicLayoutShell`: the shell does not own body section order and only three layouts use it.
- Duplicate the CTA after welcome in all nine files: it would ignore the six-layout shared-body boundary and invite drift.

### 6. Validate behavior at boundaries and across layouts

Focused unit tests cover 160-character normalization, empty-to-null behavior, draft round trips, version migration, service persistence/conflict recovery, and public/owner mapping. Component tests cover wizard and Settings labels/help/clearing. Cross-layout tests render all nine layout ids with and without subtitle and assert one `h1`, conditional subtitle presence, one CTA group outside the hero title block, compact omission, and unchanged How-it-works toggling.

Visual verification uses representative mobile and desktop widths for `arch-trio` (the supplied reference), one photographic shared-body layout, `collage-staggered`, and `split-image-right`, plus wizard desktop/mobile views. It checks wrapping, contrast, missing-subtitle collapse, welcome/CTA proximity, and absence of duplicate actions.

## Risks / Trade-offs

- [A default subtitle may feel generic when a host publishes without editing it] → Make the field visible and editable in Details, explain later editing, and allow clearing without validation cost.
- [Nine title compositions can drift in spacing or contrast] → Use the same semantic role and size intent, then enforce cross-layout behavioral tests and representative visual QA rather than forcing an unsuitable shared title abstraction.
- [CTA relocation can accidentally duplicate controls in shared-body layouts] → Move ownership to `PublicWishlistBody`, remove hero call sites, and assert exactly one group per non-compact layout.
- [Legacy local drafts could gain unintended copy or controlled inputs could receive `undefined`] → Bump the store version and explicitly migrate missing subtitles to an empty string.
- [The existing dirty `arch-trio` edit could be overwritten] → Treat its relocation as the starting point, preserve it during apply, and limit edits there to integration, formatting, subtitle rendering, and tests.
- [Public caches could show stale subtitle after Settings updates] → Reuse the mutation's existing public-wishlist invalidation and path revalidation behavior.

## Migration Plan

1. Add the nullable Prisma column and migration, then regenerate the client.
2. Add validator, state, service, projection, mapper, and API propagation while the UI still tolerates `null`.
3. Bump and test the wizard persisted-state migration before exposing the new controlled input.
4. Add wizard/Settings editing and preview support.
5. Add subtitle rendering and relocate CTAs across the shared and self-contained layout paths.
6. Run focused tests, the full test suite, typecheck, Biome checks, and visual verification.

Deployment is backward-compatible after the nullable column exists. Rollback should revert application behavior while leaving the nullable column in place; dropping it is unnecessary and would destroy subtitles entered after deployment.
