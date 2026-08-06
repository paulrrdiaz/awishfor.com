## Why

`Wishlist Wizard.dc.html` specifies an eight-step creation flow; `/create` still ships the five steps that predate it. The current `design` step asks for theme, layout, fonts, buttons and cover images on one screen, and `publish` carries both the review checklist and the post-publish share screen. Neither matches the design, and the crowded design step is where creators have the least idea what their page will look like.

`refactor-wishlist-schema` already landed the data this depends on: one `title`, `WishlistImage` records with persisted orientation, nine layouts, seven themes, and per-occasion `sampleCoverImages` sitting unused in `EVENT_TYPE_PRESETS`. This change spends them.

The step order departs from the mock deliberately. The mock asks for photos (step 3) before the layout that determines what photos are needed (step 4). Reordering to layout → theme → images means the layout is chosen against realistic sample imagery instead of empty frames, and the upload step can state exactly what the chosen layout needs.

## What Changes

- Replace the five steps with eight: `event-type`, `details`, `layout`, `theme`, `images`, `gifts`, `review`, `published`. **BREAKING** for any bookmarked `?step=design` or `?step=publish` URL.
- Split the `design` step three ways — layout, theme, and images each get their own screen with its own preview pane.
- Split the `publish` step in two — `review` holds the checklist, full preview and publish action; `published` is the share screen.
- Make `published` a real routable step that is terminal: no Back control, and a direct visit without a completed publish redirects to `review`.
- Replace the numbered-circle desktop stepper with the design's segmented progress bar plus a "Paso N de 8 · Label" caption, at every breakpoint.
- Give every step the design's header: isotype plus a "Guardar borrador" pill.
- Preview panes composite the creator's real cover images with the occasion's `sampleCoverImages` in any slots still empty, marking the samples so they read as placeholders.
- The layout step presents the nine layouts as an inline grid with a live preview, rather than the compact modal trigger the shared picker uses on the dashboard.
- The images step accepts a multi-file drop, groups uploads by persisted orientation, and states the selected layout's requirement. Falling short warns without blocking.
- The gifts step keeps importing, adding and deleting; editing, hiding and reordering move to `/dashboard/wishlists/[id]/gifts`, which already supports them.
- **BREAKING** — Publish readiness gains a cover-images requirement, so a wishlist can no longer be published with fewer images than its layout renders. This reverses the current rule that no design setting blocks publishing.
- Raise the cover-image cap from six to eight, matching the design's "sugerido 4–8 fotos".

### Non-goals

- Any schema change. This change adds no columns and no tables.
- Editing a published wishlist from the wizard. `published` is terminal; corrections happen in the dashboard.
- Reworking the dashboard gift or design surfaces beyond what the shared layout picker requires.
- Changing how drafts are saved, recovered, or authenticated.

## Capabilities

### New Capabilities

- `wizard-sample-previews`: compositing a creator's real cover images with occasion-appropriate sample imagery so that every wizard preview reads as a finished page, and guaranteeing samples never reach a published one.

### Modified Capabilities

- `creation-wizard`: eight steps in a new order, the segmented stepper, the split design and publish steps, the terminal published step, layout-driven image guidance, and a gifts step scoped to import/add/delete.
- `wishlist-publish-readiness`: cover images become a publish requirement measured against the selected layout's slots; design settings no longer categorically exempt from blocking.
- `image-upload`: an eight-image cap, multi-file drop, and orientation-grouped presentation of the uploaded set.
- `layout-picker`: the wizard consumes an inline grid presentation while the dashboard keeps the compact modal trigger.

## Impact

- **Wizard core**: `src/components/features/wizard/wizard-steps.ts` (step ids, labels, order), `wizard-shell.tsx` (routing, guards, navigation), `src/components/shared/wizard-stepper.tsx` (rewritten as segments), `wizard-layout.tsx` and `wizard-nav.tsx` (header and footer chrome).
- **Step components**: `design-step.tsx` splits into layout, theme and images steps; `publish-step.tsx` splits into review and published steps; `details-step.tsx` and `gifts-step.tsx` are reworked against the design.
- **Preview**: `src/lib/wishlist/draft-to-preview.ts` gains sample-image compositing; a new module resolves samples per occasion and orientation.
- **Readiness**: `src/lib/wishlist/publish-readiness.ts` and its server-side enforcement in `src/server/services/wishlist.service.ts`.
- **Upload**: `src/components/features/wishlist/multi-image-upload.tsx` (cap, batch drop, orientation grouping).
- **Picker**: `src/components/features/wishlist/layout-picker.tsx` gains an inline presentation used by the wizard.
- **Tests and stories**: `wizard-steps.test.ts`, `gifts-step.test.tsx`, `publish-step.test.tsx`, `save-draft-controls.test.tsx`, `wizard-states.stories.tsx`, `wizard-stepper.stories.tsx`, plus the readiness and preview suites.
