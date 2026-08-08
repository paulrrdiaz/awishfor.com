## Context

Three components on the public wishlist page render owner-authored content: the countdown, the welcome message, and the thank-you message. Each has exactly one hardcoded appearance today, and each has three approved directions in the Claude Design project that none of the current renderers match.

Current state, established by reading the code:

- **Ten layouts.** Eight delegate their below-hero content to `PublicWishlistBody`; two (`collage-staggered-layout.tsx`, `split-image-right-layout.tsx`) are self-contained and compose their own.
- **`Countdown`** already has a `variant` prop with `"default"` (an accent box) and `"chip"` (an outline pill). `"chip"` is effectively the approved `outline-pill`; `"default"` matches nothing approved. The two self-contained layouts hardcode `variant="chip"`.
- **The welcome message is implemented twice** — an inline block at `public-wishlist-body.tsx:41-52`, and the `WishlistMessage` component used only by the two self-contained layouts.
- **`WishlistThankYou`** is a plain centered paragraph.
- **`formatCountdown`** (`src/lib/format/countdown.ts`) already handles past dates, returning `"Gracias por celebrar con nosotros."` — a full sentence, not a pill-sized string.
- **Seven theme presets**, all light, exposed as CSS custom properties by `PublicThemeProvider`. The design mocks use hardcoded cielo-palette hex.
- **Messages are edited in the settings form** (`wishlist-settings-form.tsx`), not the design editor. The design editor has no message fields; the settings form has no preview.

Constraint from the product owner: variants must inherit color from the wishlist theme, and the owner picks a variant beside each message with one selected by default.

## Goals / Non-Goals

**Goals:**

- Nine variants (3 components × 3) faithful to the approved designs, each drawing all color from theme tokens.
- Owner-selectable per wishlist, persisted, with a sensible default when unset.
- One implementation per component — no duplicated renderers, no per-layout hardcoding that overrides the owner.
- Variants degrade gracefully when the data they want (a signature, purchase history, an event date) is missing.

**Non-Goals:**

- Per-layout variant overrides. The design file suggests a per-layout mapping (2a on dense layouts, 2d where a stat row exists, 1d on editorial ones); we deliberately let the owner's single choice apply everywhere instead. Revisit only if owners ask.
- A live preview inside the settings form.
- Changing hero composition, layout catalog, or message copy semantics.
- Variants for any other page section.

## Decisions

### Storage: nullable string columns resolved through a config module

Three nullable `String?` columns on `Wishlist` (`countdownVariant`, `welcomeMessageVariant`, `thankYouMessageVariant`), resolved through a new `src/config/public-message-variants.ts` exposing `getAll*`, `resolve*`, and `DEFAULT_*_VARIANT_ID`.

*Why:* this is exactly how `themeId`, `layoutId`, `buttonStyle`, and the font ids already work. A Prisma enum would be more type-safe at the DB boundary but would demand a migration for every future variant and would split the source of truth between the schema and the config module, unlike every sibling design field. Consistency with the surrounding code wins.

`NULL` means "unset" and resolves to the default at read time, so the migration needs no backfill and existing wishlists keep rendering.

### Variant ids are semantic, not design-file ids

The design files call them `2a`, `1c`, `1d`. We store `filled-pill`, `outline-pill`, `progress-bar`, `postcard`, `handwritten`, `avatars`, `spotlight`, `social-proof`.

*Why:* the design ids are exploration-round artifacts and carry no meaning in the codebase; two unrelated components both having a `1c` invites confusion. Each config entry keeps a comment naming its origin proposal so the design file stays traceable.

### Defaults chosen by fewest data dependencies

Welcome `postcard`, thank-you `handwritten`, countdown `outline-pill`.

*Why:* `postcard` uses a static "PARA TI" stamp and needs no initials at all, so it renders well even when the owner never fills in a signature. `handwritten` needs only a signature, degrading to a seal-less card without one. `outline-pill` is what two layouts already show, so existing pages change least. The data-hungry variants (`avatars`, `social-proof`, `progress-bar`) are opt-in.

### All variant color comes from theme tokens, with an explicit inversion rule

Variants use the existing semantic tokens (`--background`, `--foreground`, `--card`, `--primary`, `--accent`, `--muted-foreground`, `--border`). No hex from the mocks is copied.

The thank-you `spotlight` variant is the hard case: the mock is `#1E2940` ground with `#F4F0E6` text and a `#BFA06B` gold rule, while all seven presets are light. Mapping: **background → `--foreground`, text → `--background`, divider → `--primary`.** There is no gold token and inventing one would break theme inheritance; `--primary` is the honest substitute and stays legible against an inverted ground in every preset.

*Alternative rejected:* adding a dark token set per preset. That is a theme-system change with seven presets to redesign, far beyond this change.

### Signature initials: split on conjunctions only, never whitespace

New `src/lib/format/signature.ts`. `parseSignatureInitials("Ana & Diego")` → `["A", "D"]`, splitting on `&`, `+`, `,`, and word-boundaried `y` / `e` / `and`.

*Why not reuse `getInitials` from `recent-purchases.tsx:21`?* It splits on whitespace, which is correct for one person's name (`"María Gómez"` → `MG`) and wrong for a signature (`"Ana & Diego"` → `"A&"`). Worse, whitespace-splitting a signature mangles single-entity names: `"Familia Rodríguez"` would become two people, as would `"María José"`. Conjunction-only splitting is the property that makes the helper correct.

Two consumers compose from the same primitive: the seal joins with `+` (`"A+D"`, `"V"`), the avatar cluster maps to circles. Accents are preserved — the seal is decorative, not a sort key.

The two helpers stay separate: conjunction-splitting for the owner's signature, whitespace-splitting for an individual guest's name.

### Contributor summary is computed server-side, initials only

The public mapper gains `contributors: { count: number; initials: string[] }`. Raw `guestName` values never reach the client.

Three correctness rules the mock does not address:

1. **Dedupe by guest.** `Purchase` is one row per gift, so a guest buying three gifts is three rows. `count` is distinct `guestName`, compared case- and whitespace-insensitively.
2. **Exclude owner bookkeeping.** `OWNER_MANUAL_PURCHASE_DEFAULT_NAME` (`"Registrado por el creador"`, `purchase.service.ts:93`) lands in `guestName` when the owner marks a gift bought without naming a buyer. Left in, it renders an `(R)` avatar and counts the owner as thanking themselves.
3. **Count in-undo-window purchases.** `Purchase` has no status column; "pending" is derived as `undoExpiresAt > now` (`dashboard-wishlist.mapper.ts:80-89`). We count them — the undo window is short, and a contributor disappearing from the wall minutes after buying is a worse artifact than a rare transient over-count.

`initials` is capped at 4, with the remainder implied by `count` for the `+N` chip.

This is a deliberate privacy widening, decided by the product owner: initials become visible to anyone holding the public link. Names, emails, phones, and messages remain owner-only, so the existing `wishlist-view-models` exclusion requirement is narrowed rather than dropped.

### `createdAt` joins the public view model

The countdown `progress-bar` variant renders elapsed time between list creation and the event, labelled "Lista creada" → "Gran día". That needs a start anchor, and `createdAt` is not currently on `PublicWishlistViewModel`.

Progress is clamped to `[0, 100]`, and when `createdAt` is after `eventDate` (imported or backdated data) the bar renders full rather than inverted.

### Pickers live in the settings form, with thumbnails instead of a preview

Each picker sits directly beneath the field it styles, inside the existing "Contenido" section: countdown under the event date/time field, welcome under the welcome textarea, thank-you under the thank-you textarea.

*Why here:* "next to each message" only has a referent where the messages are. The design editor holds theme/layout/fonts and has no message fields.

*The trade-off:* the settings form has no live preview, so the owner picks blind. Mitigated with small inline visual thumbnails in the picker itself, the pattern `ThemeSwatchPicker` and `LayoutPicker` already establish. The design editor's live preview will reflect the saved choice.

### "Firma del mensaje" becomes page-wide

`welcomeMessageAttribution` signs both the welcome and the thank-you. No new column.

*Why:* the field's label is already generic ("Firma del mensaje", not "…de bienvenida") and it already sits in the shared "Contenido" section between both textareas. Only the help text changes, from "Aparecerá debajo del mensaje" to wording covering both.

*Alternative rejected:* a separate `thankYouMessageAttribution`. More flexible — an owner could sign the welcome "Ana & Diego" and the thank-you "Ana" — but it adds a column, a form field, and fixture churn to serve a case no one has asked for. The host's Clerk account name was also rejected as a source: it is a legal name, not a celebratory signature, and one account routinely represents two people.

### Consolidation

- All three welcome variants live in `wishlist-message.tsx`; the inline block at `public-wishlist-body.tsx:41-52` is deleted.
- All three thank-you variants live in `wishlist-thank-you.tsx`.
- `Countdown`'s `variant` prop changes from `"default" | "chip"` to the three variant ids. The accent-box rendering is removed; the two layouts hardcoding `variant="chip"` read the owner's choice instead.

### Past-date handling

`formatCountdown` returns a full sentence once the event has passed (`"Gracias por celebrar con nosotros."`), which does not fit a pill.

The shipped `public-wishlist-layout` "Countdown formatting" requirement mandates that this message be shown, so variants must not simply hide once the event passes. Instead, all three variants fall back to a **variant-neutral container** for the post-event message — the sentence renders as centered muted text rather than being crammed into a pill or bolted onto a completed progress bar. No variant ever emits a negative day count.

## Risks / Trade-offs

- **Guest initials become public** → Only initials cross the wire, computed server-side; full names, emails, phones, and messages stay owner-only. Owner-registered manual purchases are filtered out. The exposure is scoped to one opt-in variant that is not the default.
- **Conjunction splitting produces a wrong seal on an unusual signature** (e.g. a business name containing "y") → Splitting requires whitespace-delimited conjunctions, so mid-word matches are impossible, and single-entity names with spaces are protected by never splitting on whitespace. The failure mode is a cosmetic seal, never data loss. Test table pins the known cases.
- **Owner picks a variant blind, without a preview** → Inline thumbnails in the picker; the design editor's live preview shows the saved result. Accepted as the cost of putting the control beside the message it styles.
- **Removing `Countdown`'s `variant="default"` changes eight layouts at once** → It matches no approved design, so keeping it would mean shipping a fourth unapproved variant. Storybook stories cover all three variants to catch regressions.
- **`social-proof` shows "0 personas" on a fresh list** → The variant renders its plain message body without the contributor block whenever `count` is zero, so a new list never announces that nobody has given anything.
- **Three new columns plus a public view model field increase fixture churn** → Every field is nullable or derived, so existing fixtures compile untouched wherever the field is optional; the enumerated file list in the proposal keeps the sweep bounded.

## Migration Plan

1. Add the three nullable columns and migrate. No backfill: `NULL` resolves to the default at read time.

   **All three components change appearance on every published wishlist at deploy** — this is a design refresh, not a no-op rollout. The countdown moves from the accent box to `outline-pill`; the welcome moves from a plain inline italic block (eight layouts) or the `WishlistMessage` accent box (two layouts) to `postcard`; the thank-you moves from a plain centered paragraph to `handwritten`. Owners who want a different look pick one; owners who do nothing get the refreshed defaults. If a quieter rollout is wanted instead, the defaults would need to be the shapes closest to today's rendering rather than the fewest-dependency ones — that trade was decided in favor of the refresh.
2. Ship the config module and the signature helper with unit tests before any component consumes them.
3. Rebuild the three components variant-by-variant, keeping the current appearance reachable as the default until all three are done.
4. Delete the duplicated inline welcome block and the hardcoded `variant="chip"` call sites in the same commit that makes the components variant-aware, so no intermediate state renders two different welcome messages.
5. Add pickers to the settings form last, once every variant renders correctly.

Rollback: the columns are additive and nullable; reverting the application code leaves them unread and harmless.

## Open Questions

- Should the `+N` overflow chip in `social-proof` and `avatars` appear at a fixed cap of 4, or scale with viewport? Starting fixed at 4 per the mock.
- Does the `progress-bar` variant deserve a minimum sensible span (e.g. lists created two days before the event show a nearly-full bar immediately)? Shipping without a floor and observing.
