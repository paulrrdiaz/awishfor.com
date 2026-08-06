# creation-wizard Specification

## Purpose
TBD - update purpose after archive.
## Requirements
### Requirement: Wizard route with step routing

The system SHALL serve the creation wizard at `/create` and render the active step based on a query parameter (e.g. `?step=event-type`). The recognized steps SHALL be `event-type`, `details`, `layout`, `theme`, `images`, `gifts`, `review`, and `published`, in that order. The route SHALL be publicly accessible without authentication.

#### Scenario: Unauthenticated user opens the wizard

- **WHEN** a signed-out user navigates to `/create`
- **THEN** the wizard shell renders without redirecting to sign-in

#### Scenario: Step selected by query param

- **WHEN** the URL contains a recognized `step` query param
- **THEN** the wizard renders that step; for a missing or unknown value it falls back to the first (event-type) step

#### Scenario: Retired step ids fall back

- **WHEN** the URL carries a step id from the previous flow such as `design` or `publish`
- **THEN** the wizard treats it as unknown and renders the first step rather than erroring

### Requirement: Local draft store with persistence

The system SHALL hold the in-progress wishlist draft in a Zustand store (`src/stores/wishlist-wizard.store.ts`) and persist it to `localStorage`. The persisted draft SHALL be restored on reload.

#### Scenario: Draft survives reload

- **WHEN** the user edits the draft and reloads the page
- **THEN** the restored draft reflects the edits made before reload

#### Scenario: Reset clears the draft

- **WHEN** the user triggers reset / start over
- **THEN** the store and its persisted copy are cleared and the wizard returns to an empty first step

### Requirement: Stale draft recovery

The store SHALL record the draft's last-updated timestamp and treat a draft older than 30 days as stale. When a stale draft is detected on load, the system SHALL prompt the user to continue or start over rather than silently resuming.

#### Scenario: Old draft prompts before resuming

- **WHEN** a persisted draft older than 30 days is loaded
- **THEN** the user is shown a recovery prompt to continue or discard before editing proceeds

#### Scenario: Fresh draft resumes silently

- **WHEN** a persisted draft newer than 30 days is loaded
- **THEN** the draft resumes without a recovery prompt

### Requirement: Event Type selection step

The Event Type step SHALL present a selectable card per event type using the preset Spanish labels. Selecting an event type SHALL set the draft's `eventType` and seed default categories, default theme/layout, and default copy from the matching preset.

#### Scenario: Selecting an event type seeds defaults

- **WHEN** the user selects an event-type card
- **THEN** the draft's `eventType`, default categories, default theme/layout IDs, and untouched copy fields are populated from that preset

### Requirement: Preset copy does not overwrite user edits

The store SHALL track, local-only, whether each seeded copy field (welcome message, thank-you message) has been edited by the user (`copyTouched`). Changing the event type SHALL update only copy fields that are still untouched; edited copy SHALL be preserved. The wishlist name is never seeded from a preset and therefore is never tracked or overwritten by an event-type change.

#### Scenario: Edited copy is preserved on event-type change

- **WHEN** the user has edited the welcome message and then changes the event type
- **THEN** the edited welcome message is preserved while untouched copy fields update to the new preset

#### Scenario: Manual regeneration overwrites copy

- **WHEN** the user triggers "regenerate suggested copy"
- **THEN** copy fields are reset to the current preset defaults and their `copyTouched` flags are cleared

#### Scenario: Event-type change never rewrites the name

- **WHEN** the user has typed a wishlist name and then changes the event type
- **THEN** the typed name is untouched

### Requirement: Multi-step wizard navigation

The wizard SHALL route between the steps `event-type`, `details`, `layout`, `theme`, `images`, `gifts`, `review`, and `published` via the `?step=` query param, falling back to the first step for a missing or unknown value, and SHALL provide Back/Next controls that move between adjacent steps in that order. The `published` step SHALL be terminal: it SHALL offer no Back control and SHALL NOT be reachable by forward navigation from `review` except as the result of a successful publish.

#### Scenario: Navigating forward and back

- **WHEN** the user is on the `details` step and activates Next, then Back
- **THEN** the wizard renders the `layout` step, then returns to the `details` step, with the `?step=` query param reflecting the active step

#### Scenario: Gifts step advances to review

- **WHEN** the user is on the `gifts` step and activates Next
- **THEN** the wizard renders the `review` step with `?step=review`

#### Scenario: Review step navigates back to gifts

- **WHEN** the user is on the `review` step and activates Back
- **THEN** the wizard renders the `gifts` step with `?step=gifts`

#### Scenario: Published step offers no back navigation

- **WHEN** the `published` step renders after a successful publish
- **THEN** no Back control is presented and the footer offers only the forward actions

#### Scenario: Direct visit to published without a publish redirects

- **WHEN** a user navigates to `?step=published` with no publish success in the wizard store
- **THEN** the wizard redirects to the `review` step instead of rendering an empty success screen

### Requirement: Event Details step

The Event Details step SHALL let the user edit the draft's name (`title`), an optional combined event date and time, optional event location, and optional dress code ("Código de vestimenta"). There SHALL be a single name field: the value identifies the wishlist in the owner's dashboard and is the heading guests see, so no separate display name is collected. The event date and time SHALL be chosen through a single `DateTimePicker` field (a calendar in a popover plus a time input), with the time normalized to `HH:mm`. Name, date, time, location, and dress code SHALL all persist to the draft store (`eventDate` and `eventTime` remain separate draft fields). When the selected event date is in the past, the step SHALL show the exact warning copy "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." without blocking.

#### Scenario: Editing details persists to the draft

- **WHEN** the user enters a name, picks an event date and time in the combined picker, types a location, and types a dress code
- **THEN** the draft store holds the name as `title`, the selected date, the time normalized to `HH:mm`, the location, and the dress code

#### Scenario: One name field only

- **WHEN** the Event Details step renders
- **THEN** it shows a single name field and no display-name or hero-title field

#### Scenario: The name is described as guest-facing

- **WHEN** the name field renders its help text
- **THEN** the text states that this is both how the creator identifies the list and how guests see it, rather than describing it as internal-only

#### Scenario: Event date, time, location, and dress code are optional

- **WHEN** the user leaves the combined date/time field, location, and dress code empty
- **THEN** the step is still valid and the draft stores null/empty for those fields

#### Scenario: Past event date warns without blocking

- **WHEN** the user selects an event date in the past through the combined picker
- **THEN** the step shows "Esta fecha ya pasó. Puedes continuar, pero el contador mostrará un mensaje de cierre." and the date is still accepted

### Requirement: Slug generation and editable slug

The Event Details step SHALL auto-generate the slug from the title using the shared `slugify` helper until the user manually edits the slug; after a manual edit the slug SHALL stop tracking the title. The slug field SHALL be editable directly.

#### Scenario: Slug auto-fills from title

- **WHEN** the user types a title and has not edited the slug
- **THEN** the slug field updates to the slugified title

#### Scenario: Manual slug edit stops auto-tracking

- **WHEN** the user edits the slug field and then changes the title
- **THEN** the manually edited slug is preserved and does not get overwritten by the new title

### Requirement: Slug availability check for signed-out users

The system SHALL expose the slug-availability check as a publicly callable procedure so that an unauthenticated wizard user can verify a slug. The Event Details step SHALL validate the slug client-side and check availability with a debounced request, surfacing the exact states: `◌ Verificando…` while checking, `✓ Disponible` (with a green ring) when available, `✕ Ya está en uso` when taken, and `✕ Solo letras, números y guiones` when invalid.

#### Scenario: Signed-out user checks an available slug

- **WHEN** a signed-out user enters a syntactically valid, unused slug
- **THEN** an availability request is made and the slug shows `✓ Disponible` with a green ring

#### Scenario: Checking state is shown during the request

- **WHEN** the debounced availability request is in flight
- **THEN** the slug field shows `◌ Verificando…`

#### Scenario: Taken slug is reported

- **WHEN** the user enters a slug that already belongs to an existing wishlist
- **THEN** the slug shows `✕ Ya está en uso`

#### Scenario: Invalid slug is rejected client-side

- **WHEN** the user enters a slug that fails client-side validation
- **THEN** the slug shows `✕ Solo letras, números y guiones` and no availability request is required

### Requirement: Preview uses sample gifts before real gifts exist

The Design & Preview step SHALL render the selected event type's preset `sampleGifts` as placeholder gifts when the draft has no visible user-created gifts, so the preview is never empty.

#### Scenario: Sample gifts shown when draft has no gifts

- **WHEN** the draft has an event type selected but no visible gifts
- **THEN** the preview renders the preset `sampleGifts` as placeholders

#### Scenario: Real gifts replace samples

- **WHEN** the draft has at least one visible user-created gift
- **THEN** the preview renders the user's gifts instead of the sample gifts

### Requirement: Gifts step with local draft gifts

The Gifts step SHALL let the user import, add, and remove gifts that are stored in the wizard draft store as local draft gifts (no database write). Each gift SHALL support a name, optional product URL, optional image, optional price, a category assignment, a quantity, a priority, and public and internal notes. The step SHALL provide a URL-import entry point, category management, and a manual add action, and SHALL offer a delete action for each gift. Editing an existing gift, toggling its visibility, and reordering gifts SHALL NOT be offered in the wizard; those actions live in `/dashboard/wishlists/[id]/gifts` after the wishlist exists.

#### Scenario: Add a manual gift without a product URL

- **WHEN** the user fills in a gift name (and no product URL) and saves
- **THEN** a draft gift is added to the store and appears in the gift list

#### Scenario: Assign category and quantity

- **WHEN** the user assigns a gift to one of the draft categories and sets a quantity
- **THEN** the draft gift stores that category and quantity

#### Scenario: Remove a gift

- **WHEN** the user activates delete for a gift in the Gifts step
- **THEN** the gift is removed from the draft store and disappears from the list and the preview

#### Scenario: No edit affordance in the wizard

- **WHEN** the Gifts step renders its gift list
- **THEN** it offers no edit, hide, or reorder control for an existing gift

### Requirement: Draft store holds detail, design, and gift fields

The wizard draft store SHALL persist the detail fields (name, slug, event date, event time, event location, dress code), the design fields (theme, layout, heading font, body font, button style, ordered cover images with dimensions and orientation), and a local `gifts` array, alongside the existing event-type and copy fields, and SHALL survive reload via `localStorage`. The store SHALL NOT carry a display name, a hero title, or a font pairing. A draft persisted under an earlier store version SHALL rehydrate without throwing, dropping values that no longer have a home.

#### Scenario: Extended draft survives reload

- **WHEN** the user fills in details, picks design options including fonts and multiple cover images, adds a gift, and reloads
- **THEN** the restored draft reflects the name, slug, design selections, cover images in order with their orientation, and the added gift

#### Scenario: Earlier persisted draft rehydrates safely

- **WHEN** a draft persisted before this change — carrying a display name, hero title, font pairing, and plain cover image URLs — is rehydrated
- **THEN** the store migrates it to the current shape without throwing and without retaining the removed fields

#### Scenario: Reset clears the extended draft

- **WHEN** the user triggers reset / start over
- **THEN** the detail, design (including cover images and fonts), and gift fields are cleared along with the rest of the draft

### Requirement: Wizard provides authenticated manual draft saving

The hydrated creation wizard SHALL provide a `Guardar borrador` action on every
wizard step. It SHALL save only when a signed-in creator activates the action;
the wizard SHALL not autosave. Signed-out visitors SHALL be prompted to sign in
before saving and no save mutation SHALL be sent for them.

#### Scenario: Signed-in creator saves manually
- **WHEN** a signed-in creator activates `Guardar borrador`
- **THEN** the wizard submits the current complete local draft once and prevents duplicate save activation until the request finishes

#### Scenario: Signed-out visitor tries to save
- **WHEN** a signed-out visitor activates the save action
- **THEN** the wizard presents an authentication prompt and preserves the local draft without sending a save request

### Requirement: Wizard retains saved-draft identity and revision locally

The persisted wizard store SHALL retain `savedWishlistId` and `lastSavedAt` after
a successful save. Subsequent manual saves SHALL use those values to update the
same database draft and detect conflicts. Resetting the wizard SHALL clear both
values.

#### Scenario: Successful save enables a later update
- **WHEN** a manual save succeeds
- **THEN** the wizard stores the returned wishlist ID and server revision timestamp with the local draft

#### Scenario: Reset clears saved draft metadata
- **WHEN** the creator resets the wizard
- **THEN** the local draft, saved wishlist ID, and last saved timestamp are cleared

### Requirement: Wizard communicates save outcome and conflict options

The wizard SHALL show a Sonner success toast after a completed save and provide
a `Ver en dashboard` link to the authenticated dashboard. On a save conflict it
SHALL present options to load the current server draft or explicitly overwrite it
with the local draft; it SHALL not silently discard either version.

#### Scenario: Save success is confirmed
- **WHEN** the save-draft operation returns success
- **THEN** the wizard updates its saved-draft metadata, displays a success toast, and exposes `Ver en dashboard`

#### Scenario: Creator resolves a save conflict
- **WHEN** the save-draft operation returns a conflict
- **THEN** the wizard presents the server and local resolution choices before making another write

### Requirement: Final publish step preview

The `review` step SHALL render an embedded preview of the current local draft using the public wishlist preview mode, labeled "Así lo verán tus invitados", together with a banner marking the list as not yet public, and SHALL provide a full-page owner preview action before publish.

#### Scenario: Review preview renders current draft

- **WHEN** the user opens `/create?step=review` with a local draft
- **THEN** the step renders an embedded public wishlist preview labeled "Así lo verán tus invitados" using the current draft content, design selections, categories, and visible gifts

#### Scenario: Preview is marked as not public

- **WHEN** the review preview renders
- **THEN** a banner states that the list is not yet public

#### Scenario: Review preview disables guest actions

- **WHEN** the review embedded preview renders gifts
- **THEN** guest purchase actions are disabled and no purchase mutation can be triggered from the preview

#### Scenario: Full page preview is available before publish

- **WHEN** the user opens the review step before the wishlist is published
- **THEN** the step provides a full-page preview action for the owner without exposing the draft as a public wishlist to non-owners

### Requirement: Publish readiness checklist on final step

The `review` step SHALL show a checklist-friendly readiness result grouped into the four items the design presents — name and occasion, cover images, layout and theme, and visible gifts — and SHALL block publish while any required item is unsatisfied. Each item SHALL name the specific value or shortfall rather than only its state.

#### Scenario: Ready draft enables publish

- **WHEN** the local draft satisfies every readiness requirement including its layout's cover-image slots
- **THEN** the checklist shows every item satisfied and the publish action is enabled for an authenticated user

#### Scenario: Missing readiness item blocks publish

- **WHEN** any required readiness item is missing, invalid, unavailable, or unsatisfied
- **THEN** the checklist identifies the failed item and the publish action remains disabled

#### Scenario: Checklist items are specific

- **WHEN** the checklist renders a satisfied name-and-occasion item
- **THEN** it shows the draft's name and occasion rather than a bare check

#### Scenario: Insufficient images block publish

- **WHEN** the draft has fewer cover images than the selected layout renders
- **THEN** the cover-images checklist item is unsatisfied and publish remains blocked

#### Scenario: Hidden gifts do not satisfy readiness

- **WHEN** the draft has gifts but all of them are hidden
- **THEN** the visible gift checklist item is unsatisfied and publish remains blocked

### Requirement: Publish authentication gate

The `review` step SHALL require authentication before sending a publish mutation. Signed-out users SHALL be prompted to sign in with reassurance copy that "tu progreso ya está guardado", and the local draft SHALL remain intact.

#### Scenario: Signed-out user tries to publish

- **WHEN** a signed-out user activates the publish action from the review step
- **THEN** the wizard shows an authentication prompt including the copy "tu progreso ya está guardado" and sends no publish mutation

#### Scenario: Signed-out draft is preserved through auth prompt

- **WHEN** a signed-out user is prompted to authenticate before publishing
- **THEN** the local wizard draft remains persisted so the user can return to `/create?step=review`

#### Scenario: Signed-in user can publish

- **WHEN** a signed-in user activates publish for a ready draft
- **THEN** the wizard sends one publish request and prevents duplicate publish activation until the request finishes

### Requirement: Publish success and share state

After a successful publish the wizard SHALL advance to the `published` step and render a confirmation containing the public wishlist URL with a copy action, three share actions labeled "WhatsApp", "QR" and "Email", a primary "Ver mi página" action, and a secondary action leading to the wishlist's dashboard. The dashboard action SHALL be present because the published step is terminal and gift editing lives in the dashboard.

#### Scenario: Successful publish advances to the published step

- **WHEN** the publish request succeeds
- **THEN** the wizard navigates to `/create?step=published` and shows the confirmation

#### Scenario: Confirmation shows the URL and its actions

- **WHEN** the published step renders
- **THEN** it shows the public URL with a copy action, the "WhatsApp", "QR" and "Email" share actions, a primary "Ver mi página" action, and a secondary action to manage the wishlist in the dashboard

#### Scenario: Share actions use public URL

- **WHEN** the published step renders
- **THEN** copy-link, WhatsApp, QR download, email, and public wishlist actions all use the canonical `/w/[slug]` public wishlist URL returned for the published wishlist

#### Scenario: WhatsApp share uses Spanish invitation copy

- **WHEN** the user activates the WhatsApp share action
- **THEN** the system opens a WhatsApp share URL containing Spanish invitation text and the public wishlist URL

#### Scenario: Email share opens a prefilled message

- **WHEN** the user activates the Email share action
- **THEN** the system opens a mail composition URL with Spanish invitation text and the public wishlist URL

### Requirement: Local draft clears after successful publish

The wizard SHALL clear the persisted local draft, saved draft metadata, stale recovery state, and wizard store content after a successful publish, while preserving the publish success state that the `published` step renders for the current page session.

#### Scenario: Local storage clears after publish

- **WHEN** a wishlist is successfully published from the wizard
- **THEN** the Zustand/localStorage draft data and saved-draft metadata are cleared

#### Scenario: Published step survives the clearing

- **WHEN** the local draft is cleared after publish
- **THEN** the `published` step still renders its confirmation and share actions until the user leaves or restarts the wizard

### Requirement: Wizard renders with app theme tokens

The creation wizard shell and all five steps SHALL render exclusively with the app design-system theme tokens (`background`, `foreground`, `card`, `card-foreground`, `muted`, `muted-foreground`, `primary`, `primary-foreground`, `accent`, `accent-foreground`, `border`, `input`, `ring`, `destructive`) via their Tailwind semantic utilities. The wizard SHALL NOT use hardcoded color utilities (`gray-*`, `red-*`, `green-*`, `amber-*`, `bg-white`, `text-white`) for chrome, surfaces, text, borders, or states.

#### Scenario: Wizard chrome uses theme tokens

- **WHEN** the wizard renders any step at `/create`
- **THEN** surfaces use `bg-background`/`bg-card`, text uses `text-foreground`/`text-muted-foreground`, borders use `border-border`, and the active/primary affordances use `bg-primary`/`text-primary-foreground`
- **AND** no element uses a hardcoded `gray-*`, `red-*`, `green-*`, `amber-*`, `bg-white`, or `text-white` utility

#### Scenario: Status colors map to semantic tokens

- **WHEN** the Event Details step shows slug availability or the past-date warning
- **THEN** the available state uses primary/accent tokens with a `ring` affordance, the taken/invalid and past-date states use `text-destructive`, and the checking/hint states use `text-muted-foreground`
- **AND** the exact Spanish strings (`◌ Verificando…`, `✓ Disponible`, `✕ Ya está en uso`, `✕ Solo letras, números y guiones`, and the past-date warning) remain unchanged

### Requirement: Wizard uses ShadCN and shared primitives

The wizard shell and steps SHALL be composed from ShadCN UI primitives (`Button`, `Input`, `Label`, `Field`, `Textarea`, `Badge`, `Separator`, `Progress`, `Card`) and shared design-system components rather than raw `<button>`, `<input>`, or `<textarea>` markup with bespoke classes.

#### Scenario: Form controls are ShadCN primitives

- **WHEN** a user edits fields on the Event Details or Gifts step
- **THEN** the inputs, labels, and buttons are rendered by the ShadCN `Input`/`Label`/`Field`/`Button` components

#### Scenario: Step surfaces use the Card primitive

- **WHEN** the Gifts, Design, or Publish step renders a panel, gift entry, or preview frame
- **THEN** the panel is rendered with the ShadCN `Card` primitive (token-based border/radius/elevation) rather than hand-rolled `rounded-* border bg-white` markup

### Requirement: Responsive mobile-first and desktop wizard layouts

The wizard SHALL provide a deliberate mobile-first layout and a distinct desktop layout for the shell and every step, pixel-matching the DesignSync canvas (`A Wish For.dc.html`) frames `Desktop Step 1`–`4`/`4b` (desktop) and `Step 1` (mobile stepper markup). On mobile the shell SHALL present a single full-bleed column with a segmented 5-bar step indicator sticky at the top and a sticky action bar at the bottom. On desktop (`lg` breakpoint and up) the shell SHALL present a centered `max-w-[1200px]` card containing its own logo header, full labeled stepper, two-pane step content, and footer action bar — not a wider version of the mobile full-bleed shell.

#### Scenario: Mobile layout

- **WHEN** the wizard is viewed at a mobile viewport width
- **THEN** content is a single full-width column, the step indicator is a 5-segment bar (`.wbar`/`.wseg`-equivalent: fixed segments, no continuous percentage fill) fixed to the top, the Back/Save/Next controls are a sticky bottom action bar, and interactive targets are at least 44px tall

#### Scenario: Desktop layout

- **WHEN** the wizard is viewed at a desktop viewport width (`lg` and up)
- **THEN** the wizard renders as a centered card (`bg-card`, `border-border`, `rounded-[18px]`) containing an in-card logo header (isotype + "A Wish For" wordmark, left; "Guardar borrador", right), an in-card full stepper with 26px done/active/upcoming nodes and connecting lines, a fixed-height two-pane content area (fixed-width left pane + flex-1 right pane, per-step widths as specified in design.md D7), and an in-card footer nav (outline "← Atrás" + primary "Continuar →")
- **AND** the Design step's right pane renders its live preview on the canvas-specified `#E6EBF0` backdrop, not the app background

#### Scenario: Completed-step navigation preserved across layouts

- **WHEN** a user taps or clicks a completed step in the stepper on either mobile or desktop
- **THEN** the wizard navigates to that step via the `?step=` query param, and upcoming (incomplete) steps remain non-interactive

### Requirement: Desktop wizard header shows the product wordmark

The desktop (`lg` and up) wizard card header SHALL display the `isotype.svg` mark on its left and the "Guardar borrador" action on its right, on every step except `published`. The header SHALL NOT render the "A Wish For" serif wordmark alongside the mark. The mobile wizard chrome SHALL NOT show the mark.

#### Scenario: Desktop header shows the isotype and save action

- **WHEN** the wizard is viewed at a desktop viewport width (`lg` and up) on any step before `published`
- **THEN** the card header's left side shows the isotype mark (26px tall) with no wordmark text, and the right side shows the "Guardar borrador" action

#### Scenario: Published step drops the save action

- **WHEN** the `published` step renders
- **THEN** the header shows no "Guardar borrador" action, because the draft has already been published and cleared

#### Scenario: Mobile header has no mark

- **WHEN** the wizard is viewed at a mobile viewport width
- **THEN** the sticky mobile chrome does not render the isotype mark or "A Wish For" wordmark

### Requirement: Gifts step preview shows complete product images

The Gifts step guest preview SHALL render gift images so the complete product image is visible within a stable card media area. The preview layout SHALL use the available desktop width efficiently, including a three-column gift card layout on wide viewports when space allows.

#### Scenario: Product image is not cropped in preview

- **WHEN** a visible draft gift has an image URL
- **THEN** the Gifts step guest preview shows the complete image within the card media area without cropping off product edges

#### Scenario: Preview uses three columns when space allows

- **WHEN** the Gifts step preview pane has enough horizontal space for three gift cards
- **THEN** visible preview gifts render in a three-column grid

#### Scenario: Preview remains responsive when narrow

- **WHEN** the Gifts step preview pane is too narrow for three gift cards
- **THEN** the preview falls back to fewer columns without overlapping card content or clipping text

### Requirement: Segmented step progress indicator

The wizard chrome SHALL present progress as a row of eight equal segments — one per step — above a caption reading "Paso N de 8 · <Label>" with the label emphasized, at every breakpoint. Completed steps SHALL render filled in the ink tone, the active step in the accent tone, and upcoming steps in the border tone. A completed segment SHALL be activatable to navigate back to that step; the active and upcoming segments SHALL NOT be.

#### Scenario: Segments reflect position

- **WHEN** the wizard renders the fourth step
- **THEN** three segments render as completed, the fourth as active, four as upcoming, and the caption reads "Paso 4 de 8" with that step's label

#### Scenario: Completed segment navigates back

- **WHEN** the user activates a segment for an already-completed step
- **THEN** the wizard navigates to that step and the `?step=` query param updates

#### Scenario: Upcoming segment is inert

- **WHEN** the user activates a segment for a step they have not reached
- **THEN** no navigation occurs

#### Scenario: Indicator is identical across breakpoints

- **WHEN** the wizard renders at mobile and at desktop widths
- **THEN** both show the same eight-segment bar and caption rather than a separate numbered-circle treatment

### Requirement: Layout step

The `layout` step SHALL present the nine layout presets as an inline grid of labeled thumbnails alongside a live preview of the selected layout, captioned with that layout's name. Selecting a layout SHALL write `layoutId` to the draft and re-render the preview immediately. The preview SHALL composite whatever cover images the draft already holds with occasion-appropriate samples, so no layout is ever previewed empty.

#### Scenario: Layouts render as an inline grid

- **WHEN** the layout step renders
- **THEN** all nine layouts appear as selectable labeled thumbnails without requiring a modal

#### Scenario: Selection updates the preview

- **WHEN** the user selects a layout
- **THEN** the draft's `layoutId` updates and the preview pane re-renders in that layout, captioned with its name

#### Scenario: Preview is never empty

- **WHEN** the layout step previews a layout for a draft with no cover images
- **THEN** the composition renders with the occasion's sample imagery rather than empty frames

### Requirement: Theme step

The `theme` step SHALL let the user select a color theme from the seven presets, a heading font, a body font, and a button style, alongside a live preview reflecting every selection. Each control SHALL preview itself: theme swatches render their own palette, font options render in their own family, and button-style options render in their own shape.

#### Scenario: Seven theme swatches are offered

- **WHEN** the theme step renders the color selector
- **THEN** all seven theme swatches are shown, each rendering its own palette

#### Scenario: Selections update the live preview

- **WHEN** the user changes the theme, heading font, body font, or button style
- **THEN** the draft stores the selected id and the preview re-renders with that choice applied

#### Scenario: Controls preview themselves

- **WHEN** the theme step renders the font and button-style options
- **THEN** each font option renders in its own family and each button-style option renders in its own radius, border and weight

### Requirement: Images step

The `images` step SHALL accept multiple image files in one drop or file selection, classify each by its persisted orientation, and present the uploaded set grouped into horizontal and vertical columns with a per-group count against what the selected layout needs. The step SHALL state the selected layout's requirement in words. Falling short SHALL surface an advisory state without blocking forward navigation; the shortfall is enforced at publish instead.

#### Scenario: Multi-file drop is accepted

- **WHEN** the user drops several images at once
- **THEN** each valid file uploads and is added to the draft with its dimensions and orientation

#### Scenario: Uploads group by orientation

- **WHEN** the step renders uploaded images
- **THEN** horizontal and vertical images appear in separate groups, each showing its count against the layout's requirement

#### Scenario: Requirement comes from the selected layout

- **WHEN** the selected layout renders three landscape images
- **THEN** the step states that three horizontal photos are needed rather than a fixed generic minimum

#### Scenario: Shortfall warns without blocking

- **WHEN** the draft has fewer images than the layout needs
- **THEN** the step shows an advisory state and the user can still continue to the next step

