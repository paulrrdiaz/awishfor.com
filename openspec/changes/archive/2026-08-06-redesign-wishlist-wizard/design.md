## Context

`/create` ships five steps. `refactor-wishlist-schema` (archived, commit `4f32630`) already moved the data underneath them: `Wishlist` carries one `title`, cover images are `WishlistImage` records with persisted orientation, the catalogs are down to nine layouts and seven themes, and `EVENT_TYPE_PRESETS` carries `sampleCoverImages` that nothing reads yet.

What remains is the flow itself. `design-step.tsx` puts theme, layout, fonts, buttons and cover images on one screen — the screen where a creator has the least sense of what they are building. `publish-step.tsx` is 855 lines carrying the readiness checklist, the auth gate, the publish mutation and the post-publish share screen. `wizard-stepper.tsx` renders numbered circles with labels and connectors on desktop, which does not survive going from five steps to eight.

## Goals / Non-Goals

**Goals:**

- Eight steps matching `Wishlist Wizard.dc.html`, each with a single job and its own preview.
- A creator picks a layout while looking at realistic imagery, not empty frames.
- The images step states what the chosen layout actually needs.
- No published page ever renders stock photography.
- The published step is a real destination, terminal and guarded.

**Non-Goals:**

- Any schema change; this change adds no columns and no tables.
- Editing a published wishlist from the wizard.
- Reworking dashboard gift or design surfaces beyond the shared picker's second presentation.
- Changing draft saving, recovery, or the authentication gate's behavior.

## Decisions

### Steps reorder to layout → theme → images

The mock's order is 3 Imágenes, 4 Layout, 5 Tema. This change ships 3 Layout, 4 Tema, 5 Imágenes.

The mock's order asks for photos before the layout that determines which photos are needed. Since each preset already declares `heroImageSlots` and `imageGuidance.orientation`, choosing the layout first turns a vague "sube unas fotos" into "este diseño muestra 3 fotos horizontales" — and lets the images step's requirement be real rather than a fixed guess.

Putting theme between layout and images was preferred over swapping only 3 and 4. It keeps the two aesthetic decisions adjacent and means that by the time the creator reaches the step that costs them the most effort, the preview beside their uploads is already showing their real layout and their real theme.

The cost is that images are no longer the third thing asked. That is acceptable because the sample compositing makes the two preceding steps productive without any upload.

### Sample compositing happens at the view-model boundary

`draftToPreview()` already substitutes `preset.sampleGifts` when a draft has no visible gifts. Cover-image samples follow the same seam: a resolver picks samples for the draft's event type and the resolved layout's slot orientation, and the preview view model is built with real images first and samples appended into unfilled slots.

Doing this inside the layout components was rejected — it would mean touching all nine, and each would need its own notion of "how many slots am I short". Doing it in the store was rejected outright: samples must never be draft state, or they get saved and published.

The marker that identifies a sample rides on the composited entry, so a layout renders it without knowing where the image came from.

### Cover images become a publish requirement

`evaluatePublishReadiness` gains an `images` check comparing the wishlist's image count against `resolveLayout(layoutId).heroImageSlots`. This reverses the existing rule that no design setting blocks publishing, and that reversal is deliberate: every other design setting has a default that resolves silently, while a short image set renders visible placeholder blocks on a public page.

The check is enforced server-side in the publish path, not only in the review step, for the same reason every other readiness item is.

This is what makes the images step's soft gate safe. A creator can move past the images step with too few photos and keep building; the shortfall resurfaces as a specific checklist item at review and blocks publishing there. They are never trapped mid-flow, and stock imagery can never leak.

### The stepper becomes eight segments at every breakpoint

The mock renders a segmented bar plus a "Paso N de 8 · Label" caption, and the current desktop treatment — numbered circle, label, connector, eight times — does not fit the 1240px frame. Rather than shrink it, the segmented bar the wizard already uses on mobile becomes the single treatment.

Completed segments stay activatable for backward navigation, preserving the existing affordance; the label lives in the caption instead of on each segment, which is what makes eight fit.

### `published` is routable, terminal, and guarded

Today `publishSuccess` is store state and `PublishStep` branches on it. It becomes a real step id so the mock's progress bar can show 8 of 8.

Terminal means no Back control: `completePublish()` clears the draft, so returning to `review` would land on an empty wizard. A direct visit to `?step=published` with no publish success redirects to `review` rather than rendering an empty confirmation.

The share actions follow the mock — copy, WhatsApp, QR, Email, "Ver mi página" — plus a secondary link to the wishlist's dashboard that the mock omits. With the step terminal and gift editing having moved to the dashboard, dropping that link would leave a creator with no route to the place they now need. Email is new and is a `mailto:` with the same Spanish invitation copy the WhatsApp share already builds.

### The layout picker grows a second presentation

The wizard's Layout step renders the nine thumbnails inline; the dashboard keeps the compact trigger and modal. One selection model, two presentations, same `options`/`selected`/`onSelect` props.

A modal was right when layout was one control among six on a crowded step. On a step whose entire purpose is choosing a layout, hiding the choices behind a trigger adds a click and removes the side-by-side comparison that makes the grid useful.

### The gifts step loses edit, hide and reorder

The step keeps importing, adding and deleting. Editing, hiding and reordering move to `/dashboard/wishlists/[id]/gifts`, which already specifies all three (`dashboard-gift-management`, `gift-ordering`).

Delete stays in the wizard deliberately: a typo or a mis-imported product needs a fix in place, and forcing a creator to publish before removing a wrong item is worse than the small duplication.

This also retires the drawer-and-query-param editing machinery from the wizard, which is a meaningful share of `gifts-step.tsx`.

### Old step ids fall back rather than redirect

`?step=design` and `?step=publish` resolve to the first step through the existing unknown-value fallback in `resolveWizardStep`, instead of getting explicit redirects. There is no production traffic to preserve, and a mapping would be arbitrary anyway — `design` corresponds to three steps now.

## Risks / Trade-offs

- **Splitting `publish-step.tsx` (855 lines, with its own auth gate, mutation, QR generation and share state) is the single riskiest refactor here** → Split along the seams the file already has: `PublishReadinessCard`, `PublishActionsCard`, `PublishPreviewPane`, `PublishAuthGate` and `PublishSuccessPanel` are already separate exported components, so review keeps the first four and published takes the last.
- **Eight steps is more friction than five, and drop-off compounds per step** → Mitigated by "Guardar borrador" remaining on every step and by two of the three new steps (layout, theme) being single-decision screens that a creator can pass through in seconds.
- **The readiness reversal can make an existing saved draft unpublishable** — a draft saved with one image against a three-slot layout now blocks → No production data, and the review checklist names the shortfall specifically, with the images step one Back away.
- **A sample marker that reads as a real badge would be worse than no marker** → The marker is specified as identifying placeholder imagery, and the same compositing never runs on the published page, so the two states cannot be confused across surfaces.
- **`draftToPreview` accumulating a second substitution rule makes it the place where "what the creator sees" quietly diverges from "what guests see"** → Both substitutions are preview-only and both are covered by scenarios asserting the published page shows neither sample gifts nor sample images.
- **The images step's soft gate depends entirely on the review step's hard gate being right** → The readiness check is enforced server-side as well as in the review step, so a client-side regression cannot publish a short wishlist.

## Migration Plan

No schema change, no data migration. The work sequences so the wizard stays runnable:

1. Step ids, labels and order in `wizard-steps.ts`; segmented `wizard-stepper.tsx`; header chrome. The five existing step components stay mounted under their new neighbours' ids until step 2 lands.
2. Split `design-step.tsx` into layout, theme and images steps.
3. Split `publish-step.tsx` into review and published steps; add the guard and the terminal footer.
4. Sample compositing in the preview path, consumed by the layout, theme and images steps.
5. Readiness `images` check plus server enforcement.
6. Gifts step scope reduction.
7. Tests and stories.

Rollback is a code revert; nothing persisted changes shape.

## Open Questions

- The mock frames are desktop-only ("Wizard — 8 pasos (desktop)"). Mobile composition for the three new steps follows the existing responsive requirement — single column, controls above preview — but the layout grid's mobile column count is an implementation call rather than a specified one.
