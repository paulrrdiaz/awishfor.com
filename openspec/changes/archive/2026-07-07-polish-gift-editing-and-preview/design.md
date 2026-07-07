## Context

The creation wizard Gifts step already stores draft gifts in the local Zustand wizard store and renders a split desktop layout: controls on the left and a guest-facing preview on the right. Today, selecting `Editar` sets local React state and replaces the whole step with the gift form, which hides the gift list and preview while editing. The preview cards also render images with `object-cover`, causing tall or product-isolated images to crop in a way that does not match the user's expectation of seeing the complete gift image.

The category panel in the same step renders default categories as chips with text buttons for `Renombrar` and `Quitar`. This is functional but visually noisy in the compact chip layout shown in the Claude Design direction. The project already has local `Drawer`, `Tooltip`, `Button`, and `lucide-react` primitives, while `nuqs` is not currently installed.

## Goals / Non-Goals

**Goals:**

- Keep users in the Gifts step context when editing a draft gift.
- Make gift edit state URL-addressable so refresh/back/share of the wizard state is predictable.
- Preserve the existing local draft gift schema and store actions.
- Make preview cards show complete product images and use available horizontal space more effectively, including a three-column layout on wide viewports when practical.
- Replace category chip text actions with compact icon buttons that remain accessible through labels and tooltips.

**Non-Goals:**

- No database, API, Prisma, Clerk, or saved-draft contract changes.
- No implementation of product URL import beyond the current importer entry point.
- No change to public purchase behavior.
- No broad redesign of all public wishlist layouts.

## Decisions

1. Use the existing `Drawer` primitive for editing draft gifts.

   The edit flow should render a drawer containing `GiftForm` with the selected gift's initial values. On submit, call the existing `updateGift(id, values)` store action, close the drawer, and clear the selected gift query param. On cancel, overlay close, escape, or close button, also clear the param. The rest of the Gifts step should remain visible behind the drawer so users keep list and preview context.

   Alternative considered: keep the current full-step replacement. That hides context and does not satisfy the requested drawer interaction.

2. Add `nuqs` for typed query-param state.

   Use a query param such as `giftId` for the selected draft gift id. `Editar` sets `giftId` to that id; the drawer is open when the param points to an existing draft gift. Closing clears `giftId`. If the URL contains an unknown id, the drawer should not open and the implementation should clear or ignore the stale param without mutating gifts.

   Alternative considered: use raw `useSearchParams` and `router.replace`. That avoids a dependency, but it spreads parsing and history behavior through the component. `nuqs` keeps the state localized and is acceptable because the user explicitly allowed it.

3. Keep add-new-gift as the current inline flow unless implementation naturally extracts a reusable form wrapper.

   The request targets the edit action from the existing gift cards. Moving add into the drawer is optional only if it reduces duplication without changing expected behavior. The acceptance path is edit-in-drawer.

4. Extract preview card image treatment to avoid cropping.

   Wizard preview gift cards should use a fixed, stable media area with `object-contain`, a neutral background, and enough padding/height to show the whole product image. The desktop preview grid should support three columns at wide sizes, while falling back to two columns or one column as space narrows. This can be local to `GiftsStep` or use shared `GiftCard` / `GiftGrid` props if that is cleaner.

   Alternative considered: simply increase the existing image height while retaining `object-cover`. That reduces some cropping but still cuts off product imagery.

5. Use lucide icons plus existing tooltip primitives for category chip actions.

   Replace visible `Renombrar` and `Quitar` chip text buttons with icon buttons, likely `Pencil`/`Edit3` and `Trash2`/`X`. Each button must have an `aria-label` naming the category and a `TooltipContent` with the Spanish action label. The rename form may keep explicit text for `Guardar` and `Cancelar` because those are transient form commands, not chip action affordances.

## Risks / Trade-offs

- Query param conflicts with wizard step state → Use a narrow param name such as `giftId` only on the Gifts step, and preserve existing query params when setting or clearing it.
- Stale `giftId` after deletion or reload → Derive the selected gift from the current draft list and close/ignore when not found.
- Drawer form height on mobile → Keep `DrawerContent` scrollable within `max-h-[92svh]` and avoid nested page-level scroll traps.
- Three-column preview can get cramped in the split pane → Use responsive grid constraints so three columns only apply when the preview pane is wide enough; otherwise fall back to two.
- Icon-only actions can become less discoverable → Pair icons with tooltips and clear accessible labels, and use familiar lucide icons.

## Migration Plan

No data migration is required. Implementation is a client-side UI change plus an optional dependency addition (`nuqs`). Rollback is limited to reverting the wizard UI changes and removing the dependency if it was added.
