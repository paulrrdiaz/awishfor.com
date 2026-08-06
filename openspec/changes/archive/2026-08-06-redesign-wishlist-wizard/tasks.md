## 1. Step model and chrome

- [x] 1.1 Rewrite `WIZARD_STEPS`, `WIZARD_STEP_LABELS` and `DEFAULT_WIZARD_STEP` in `wizard-steps.ts` for the eight ids in order: `event-type`, `details`, `layout`, `theme`, `images`, `gifts`, `review`, `published`
- [x] 1.2 Update `wizard-steps.test.ts` for the new order, including that retired ids `design` and `publish` resolve to the first step
- [x] 1.3 Rewrite `src/components/shared/wizard-stepper.tsx` as one segmented bar for all breakpoints, with a "Paso N de 8 · Label" caption and completed segments still activatable
- [x] 1.4 Update `wizard-stepper.stories.tsx` for the segmented treatment at eight steps
- [x] 1.5 Update the wizard header in `wizard-layout.tsx` to show the isotype alone (no serif wordmark) with "Guardar borrador" on the right
- [x] 1.6 Point `wizard-shell.tsx`'s `StepContent` at the eight ids, keeping the existing step components mounted until they are split

## 2. Split the design step

- [x] 2.1 Add an inline grid presentation to `layout-picker.tsx` alongside the compact trigger, sharing `options`/`selected`/`onSelect`
- [x] 2.2 Create the layout step: inline nine-thumbnail grid plus a preview pane captioned with the selected layout's name
- [x] 2.3 Create the theme step: seven self-previewing swatches, heading and body font selects, button-style chips, and a live preview
- [x] 2.4 Create the images step: multi-file drop, orientation-grouped presentation, per-group counts against the selected layout, and an advisory non-blocking shortfall state
- [x] 2.5 Delete `design-step.tsx` once its three successors cover its controls
- [x] 2.6 Update `layout-picker` tests for both presentations

## 3. Split the publish step

- [x] 3.1 Create the review step from the existing `PublishReadinessCard`, `PublishActionsCard`, `PublishPreviewPane` and `PublishAuthGate` exports, relabeling the preview "Así lo verán tus invitados" and adding the not-yet-public banner
- [x] 3.2 Regroup the readiness checklist into the four design items — name and occasion, cover images, layout and theme, visible gifts — each naming its specific value or shortfall
- [x] 3.3 Create the published step from `PublishSuccessPanel`: copy action, "WhatsApp", "QR" and "Email" shares, primary "Ver mi página", secondary dashboard link
- [x] 3.4 Add the `mailto:` email share reusing the Spanish invitation copy the WhatsApp share builds
- [x] 3.5 Make `completePublish` navigate to `?step=published`, and guard that step so a visit without publish success redirects to `review`
- [x] 3.6 Remove the Back control on `published` and hide "Guardar borrador" there
- [x] 3.7 Delete `publish-step.tsx` and split `publish-step.test.tsx` across the two new steps

## 4. Sample-image previews

- [x] 4.1 Add a resolver that selects `sampleCoverImages` by event type and by the orientation a layout's slots need
- [x] 4.2 Composite real images first and samples into unfilled slots in the preview view model, flagging each composited sample
- [x] 4.3 Render the sample marker in the shared hero gallery for flagged entries only
- [x] 4.4 Assert in tests that compositing never mutates the draft, never persists, and never runs for the published page
- [x] 4.5 Wire the composited preview into the layout, theme and images steps

## 5. Publish readiness

- [x] 5.1 Add an `images` check to `evaluatePublishReadiness` comparing image count against `resolveLayout(layoutId).heroImageSlots`, measuring a null or unknown layout against the default
- [x] 5.2 Enforce the new check in the server publish path so a short wishlist is rejected regardless of the client
- [x] 5.3 Update `publish-readiness.test.ts` and the service tests, including the unknown-layout case
- [x] 5.4 Update the dashboard readiness surface for the added checklist item

## 6. Gifts step scope

- [x] 6.1 Remove the edit drawer, the gift-id query param wiring and the hide toggle from `gifts-step.tsx`, keeping import, categories, manual add and delete
- [x] 6.2 Verify `/dashboard/wishlists/[id]/gifts` covers edit, hide and reorder before removing them from the wizard
- [x] 6.3 Rework the gifts step into the design's two-pane composition with guest-styled cards in the preview pane
- [x] 6.4 Update `gifts-step.test.tsx` for the reduced scope

## 7. Images cap and batch upload

- [x] 7.1 Raise the cover-image cap from six to eight in `multi-image-upload.tsx`
- [x] 7.2 Accept multi-file drops, appending in selection order and partially accepting a batch that would exceed the cap while reporting how many were skipped
- [x] 7.3 Report a rejected file individually without failing the rest of its batch
- [x] 7.4 Update the upload tests for the cap, batch acceptance and orientation grouping

## 8. Verification

- [x] 8.1 Update `wizard-states.stories.tsx` and `save-draft-controls.test.tsx` for the eight-step flow
- [x] 8.2 Run `pnpm check`, `pnpm test` and `pnpm typecheck` until clean
- [x] 8.3 Walk `/create` end to end at desktop and mobile widths: pick an occasion, name the list, choose a layout against samples, set a theme, upload fewer images than the layout needs, add a gift, confirm review blocks on the images item, complete the images, publish, and confirm the published step is terminal with working share actions
- [x] 8.4 Confirm a published page with a short image set renders tinted placeholders and no sample photography
