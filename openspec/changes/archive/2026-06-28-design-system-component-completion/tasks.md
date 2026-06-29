## 1. ShadCN primitive coverage

- [x] 1.1 Generate missing Base UI primitives into `src/components/ui/` via shadcn CLI: `select`, `tabs`, `progress`, `popover`, `calendar`, `toggle-group`, `drawer`, `checkbox`, `switch`, `textarea`.
- [x] 1.2 Add a Sonner `Toaster` to the app root (`src/app/layout.tsx`) if not already mounted, themed to app tokens.
- [x] 1.3 For any primitive the Base UI registry lacks directly (e.g. `drawer`/`calendar`), provide the closest primitive or a thin documented Tailwind wrapper and note the substitute.
- [x] 1.4 Verify each new primitive imports from `@/components/ui/*`, typechecks, and uses `cn()`/`cva` conventions.

## 2. GSAP product motion layer

- [x] 2.1 Add `src/lib/gsap/` product motion helpers (reuse the marketing reduced-motion guard): success-check draw-in, undo countdown ring, toast slide/lift, modal/sheet ease, copy-success pop, card hover lift, theme-swatch hover.
- [x] 2.2 Ensure every helper checks `prefers-reduced-motion: reduce` and degrades to the final static state with no layout shift (transform/opacity only).

## 3. Purchase modal six-state machine

- [x] 3.1 Expand `Phase` in `purchase-gift-modal.tsx` to `form | loading | success | undo-available | undo-expired | purchase-error`.
- [x] 3.2 Wire `loading` to mutation `isPending` (disable actions, "Confirmando tu regalo…") and `purchase-error` to `onError` with a retry affordance — no new mutations.
- [x] 3.3 Wire `undo-available` countdown ring (motion layer) and `undo-expired` copy ("El tiempo para deshacer expiró").
- [x] 3.4 Surface the undo-available toast via Sonner; apply success-check motion on the `success` state.
- [x] 3.5 Confirm existing `purchase-gift-modal.test.tsx` still passes; extend if state transitions need coverage.

## 4. GiftCard + dashboard state coverage

- [x] 4.1 Confirm/align `GiftCard` `available | partial | purchased | hidden` cva variants with the canvas (purchased de-emphasis, `Oculto` badge + `Mostrar`/`Editar` on dashboard).
- [x] 4.2 Implement/confirm responsive `Tabs → Select` wishlist detail nav (tabs ≥ md, `Select` below md) using the new primitives.
- [x] 4.3 Confirm settings slug-change warning callout for published wishlists with canvas copy.
- [x] 4.4 Confirm share panel copy `success` (`Enlace copiado`) and `error` (manual-copy) states with copy-success motion.
- [x] 4.5 Confirm archive/restore confirmation dialog (`Restaurar publicada` / `Restaurar como borrador`) using `AlertDialog`.

## 5. Storybook coverage for stateful components

- [x] 5.1 Add colocated `*.stories.tsx` for `PurchaseGiftModal` covering all six states with stubbed handlers.
- [x] 5.2 Add stories for the creation-wizard steps (`event · details · design · gifts · publish`) and the auth-gate state.
- [x] 5.3 Add stories for dashboard states: empty state, `Tabs → Select` nav, slug-change warning, share copy success/error, archive/restore dialog.
- [x] 5.4 Verify all new stories render under the seven-theme toolbar and perform no real network calls.

## 6. Docs sync

- [x] 6.1 Update `docs/PRD.md` §13 with the ShadCN-first / Tailwind-fallback / GSAP-motion authoring priority and the component state matrices.
- [x] 6.2 Add Milestone 10 (Design system component completion & motion) to `docs/TASKS.md`.

## 7. Validation

- [x] 7.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix issues.
- [x] 7.2 Run `pnpm build-storybook` to confirm all stories build.
