## 1. Derive the action model

- [x] 1.1 Lift `CHECK_LABELS` out of `src/components/layouts/dashboard/wishlist-status-strip.tsx` into a shared module beside `src/lib/wishlist/publish-readiness.ts`, and point the status strip at it.
- [x] 1.2 Add `src/lib/dashboard/home-actions.ts` with the `HomeAction` union (`complete_draft`, `review_rsvps`, `invite_guests`, `archive`), its input type, and `deriveHomeActions`, deriving one action per wishlist per matched condition, excluding archived wishlists, and restricting `archive` to wishlists the user owns.
- [x] 1.3 Implement the ranking: kind order first, then the nearer relevant date (RSVP deadline for `review_rsvps`, event date otherwise) with missing dates last, then creation date descending; return the first as the recommended next step and the rest as subsequent actions.
- [x] 1.4 Generate each action's description from the reason it was derived, naming at most two unsatisfied publish-readiness checks and summarizing any remainder as a count.
- [x] 1.5 Add `src/lib/dashboard/home-actions.test.ts` covering each kind's trigger and its negative case, kind-outranks-nearer-deadline, within-kind date ordering, missing-date ordering, shared-wishlist attribution, the owner-only restriction on `archive`, archived exclusion, and the two-plus-remainder copy rule.

## 2. Serve the page in one query

- [x] 2.1 Add an include for the home query that pulls gifts with purchases and invites for owned and shared non-archived wishlists, and resolves the owner's name for shared ones.
- [x] 2.2 Add a mapper in `src/server/mappers/dashboard-wishlist.mapper.ts` that turns those rows into the `deriveHomeActions` input, reusing `getVisibleGiftAggregates` and `evaluatePublishReadiness`.
- [x] 2.3 Add the `home` `protectedProcedure` to `src/server/api/routers/wishlist.ts` returning the ranked actions, the recommended next step, the next upcoming event, and the summary aggregates (active wishlists, reserved over total units, pending RSVPs).
- [x] 2.4 Add router coverage in `src/server/api/routers/wishlist.test.ts`, following the existing `createCallerFactory` + mocked-`db` pattern, for a mixed owned/shared fixture, a user with no wishlists, and a user whose wishlists yield no actions.

## 3. Build the action center

- [x] 3.1 Convert `src/app/(protected)/dashboard/page.tsx` to consume `api.wishlist.home.useQuery()` and branch across the five states.
- [x] 3.2 Build the page header under `src/components/features/dashboard/home/`: time-of-day greeting taking the display name from Clerk's `useUser()` on the client rather than widening the `home` payload, the pending-count line, and the secondary `Crear wishlist` control.
- [x] 3.3 Build the preparation ribbon — the 2px rail with nodes, the travelled segment distinguished from the pending one — wrapping `Tu siguiente paso` and `Después`.
- [x] 3.4 Build the next-step card, including the status badge, event date, generated description, and the readiness pips rendered one per check with the count read off the readiness result.
- [x] 3.5 Build the subsequent-action rows as keyboard-activatable links with icon, title, wishlist name, forward affordance, the deadline badge for `review_rsvps`, and the owner badge for shared wishlists; wire each kind to its destination.
- [x] 3.6 Build the `Resumen` card: active wishlists, reserved units over total with a progress bar, pending responses — beside the actions at `md` and above, after them below it, omitted when the user has no wishlists.

## 4. Cover the remaining states

- [x] 4.1 Build the all-clear state: the confirmation card plus the next upcoming event with its badge, date, time remaining, reserved-gift progress, and its open and share controls; omit the event block when no future event exists.
- [x] 4.2 Build the first-run state: the three-step creation path, the primary create control, and the example link, with the summary omitted.
- [x] 4.3 Build the loading skeleton preserving the grid, the ribbon, and each card's height.
- [x] 4.4 Build the error state: greeting and `Crear wishlist` retained, the explanation and reassurance, `Reintentar` bound to `refetch`, the link to `Mis wishlists`, and the dashed placeholder in place of the subsequent actions.
- [x] 4.5 Add component tests asserting each of the five states renders its distinguishing element, that retry re-requests the data, and that the summary is absent in the first-run state.

## 5. Add the page chrome

- [x] 5.1 Add the desktop Inicio topbar at `md` and above carrying the route identity, with no `Crear wishlist` action and no help control while no help destination resolves.
- [x] 5.2 Add the mobile root-mode title bar under `src/components/layouts/dashboard/mobile/` — avatar, screen title, optional overflow, no back affordance — and render it on `/dashboard`.
- [x] 5.3 Add tests for the root-mode title bar: it renders the title and avatar, omits the back affordance, omits an overflow with nothing behind it, and does not render at `md` and above.

## 6. Validate

- [x] 6.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`.
- [x] 6.2 Compare the built page against the §6 artboards at 1440 and 390 for each of the five states, and record any deliberate divergence.

### Divergence notes (6.2)

Verified live against the running dev server (real signed-in data, `acciones pendientes` state) at desktop and ~414px mobile widths — greeting, count line, ribbon, next-step card, `Después` row, and `Resumen` all match the §6 artboard layout and copy. The other four states (todo encaminado, usuario nuevo, cargando, error) were verified by direct code/props inspection against the extracted artboard spec rather than by forcing each data shape live. Recorded deliberate divergences:

- **`complete_draft` destination**: routes to `/dashboard/wishlists/[id]` instead of the wizard (`/create`). The wizard's draft state is a single browser-local Zustand store with no `wishlistId` in the URL, so it cannot deep-link a specific server-side draft — see the correction logged in `design.md` decision 6.
- **Ribbon rail geometry**: implemented as two independently-bordered sections (`border-l-2`, lime for the traveled "Tu siguiente paso" segment, gray for "Después") rather than one continuous rail with a JS/ResizeObserver-computed traveled-height overlay. Visually equivalent for the two-segment case this page always renders; avoids client-side height measurement.
- **Color tokens**: reused the app's existing design tokens (`Badge` `published`/`draft`/`archived` variants, `wishlist-status.ts` labels, existing card/border/muted tokens) rather than introducing the mock's literal `--abg`/`--acard`/`--afg` hex values, per the general "reuse existing" bias — the app's off-white background and card styling are already visually equivalent. The one new token introduced is the lime ribbon/progress accent (`#C3E63E`), which is specific to this page and not used elsewhere yet.
- **Mobile bottom tab bar**: the artboard shows 4 tabs (Inicio/Wishlists/Datos/Cuenta); the existing `MobileTabBar` component (unchanged by this proposal) has 3 (Inicio/Wishlists/Cuenta) — a `Datos` root route doesn't exist yet. Left as-is; out of this change's scope.
- **Desktop topbar Ayuda pill**: omitted entirely rather than rendered inert, per `design.md` decision 7 (no help destination resolves yet).
