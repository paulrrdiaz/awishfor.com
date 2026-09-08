## Context

See `proposal.md` for the motivation. The visual source is `Dashboard.dc.html` §6 — six artboards at `top:5348`: desktop 1440 default, `Todo encaminado`, `Usuario nuevo`, `Cargando`, `Error`, and two móvil 390 boards (acciones pendientes, usuario nuevo).

The shell around the page is already built. `(protected)/layout.tsx` renders `AppSidebar` + `SidebarInset` + `MobileTabBar`, and `dashboard-app-navigation` already fixes the four sidebar destinations with `Inicio` pointing at `/dashboard`. What does not exist is anything inside `/dashboard`, the desktop topbar for that route, and the mobile root-mode title bar.

The data the action model needs is already in the schema and largely already aggregated. `getVisibleGiftAggregates` in `src/server/mappers/dashboard-wishlist.mapper.ts` yields `purchasedUnits / totalUnits`; `wishlist.list` and `wishlist.summaryList` already split owned from shared and resolve `ownerName`. The one gap is invites: `wishlistWithGiftsInclude` does not pull them, so no existing procedure can answer *Respuestas pendientes: 6* across every list.

## Goals / Non-Goals

**Goals:**

- Turn the owner's scattered per-wishlist state into one ranked list of things to do, with exactly one recommended next step.
- Render every §6 state, including the two failure states, with no layout shift between skeleton and data.
- Keep the derivation logic pure and tested, separate from both the tRPC layer and the components.

**Non-Goals:**

- Changing what makes a wishlist publishable. `evaluatePublishReadiness` is read as-is.
- Per-wishlist analytics. `Estadísticas` stays a wishlist section (§8); Inicio carries only the cross-list `Resumen`.
- Dismissing, snoozing, or persisting action state. Actions are derived on read, every read.
- Building a help destination. See decision 7.

## Decisions

### 1. One `wishlist.home` query, client-side

Add a single `protectedProcedure` returning the whole page payload: `greeting` inputs, `actions`, `nextStep`, `upcomingEvent`, and `summary`. One query, one loading state, one `Reintentar` — the design's error artboard replaces the entire content column, so a partial-failure model would have nothing to render into.

`/dashboard` becomes a client component consuming `api.wishlist.home.useQuery()`. `isLoading` → the Cargando artboard, `isError` + `refetch` → the Error artboard, `data` → one of the three data states. An async server component cannot express `Reintentar` without a client island anyway, and splitting the page into a server shell plus a client island for the same single query buys nothing.

Alternatives considered: keeping the page an RSC and adding an error boundary with a `router.refresh()` retry — rejected because the skeleton would have to come from `loading.tsx`, which cannot preserve the per-card heights the design's note calls for.

### 2. Action derivation is a pure function

`src/lib/dashboard/home-actions.ts` exports `deriveHomeActions(input): HomeActionsResult`, mirroring how `src/lib/wishlist/publish-readiness.ts` sits beside its callers. The procedure fetches and shapes; the function ranks and writes copy. Codegraph flags `evaluatePublishReadiness` as having no covering tests — this module gets colocated Vitest coverage from the first task, not later.

### 3. Ranking is by kind, not by date

The default artboard settles this: the hero card is a draft whose event is in **4 días**, while `Revisa 4 respuestas` carries *Vence en 3 días* and sits below it in `Después`. A nearer deadline in the lower slot means the order cannot be date-first.

```
1. complete_draft   status=draft ∧ ¬readiness.ready
2. review_rsvps     invites pendientes > 0
3. invite_guests    status=published ∧ invites = 0
4. archive          eventDate < hoy ∧ status ≠ archived
```

Within a kind, the nearer relevant date wins (`rsvpDeadline` for `review_rsvps`, `eventDate` otherwise), then `createdAt` desc. The first action after ranking is the hero; the rest are `Después`. The header count is hero + Después together — four in the artboard is 1 + 3.

### 4. `eventDate` does not become a publish requirement

The hero copy in the artboard reads *"Faltan la fecha del evento y un regalo"*, but `PublishReadinessChecks` has no `eventDate` key. Treat that copy as illustrative: the description is **generated from the checks that actually fail**, so a list missing a title and a gift says so instead. Adding `eventDate` to readiness would reach into `publishWishlist`, `publishWizard`, and the settings checklist — a different change, and one to make deliberately rather than as a side effect of building a home page.

### 5. Progress pips render from the readiness result

`readiness.checks` has seven keys today (`title`, `eventType`, `slug`, `language`, `currency`, `visibleGift`, `images`); the artboards draw six pips because they predate `images`. Render one pip per key and read the count off the object, so the ribbon stays true if a check is added or removed. `CHECK_LABELS` in `wishlist-status-strip.tsx` already names each check in Spanish and is lifted to a shared module rather than duplicated.

### 6. Rows are navigation, not inline mutations

Every `Después` row is a link with a chevron, so each action carries a destination:

| kind | destino |
|---|---|
| `complete_draft` | `/dashboard/wishlists/[id]`, `Continuar configuración` |
| `review_rsvps` | `/dashboard/wishlists/[id]/guests` |
| `invite_guests` | `/dashboard/wishlists/[id]/guests` |
| `archive` | `/dashboard/wishlists/[id]/settings` |

Archiving keeps living where it already lives — the settings form and the wishlist actions menu — so this page never becomes a second place that can destroy state.

**Correction found during implementation:** the table originally sent `complete_draft` to the wizard (`/create`). The wizard's draft state is a single browser-local Zustand store (`wishlist-wizard.store`, persisted via `zustand/persist`) rehydrated with no `wishlistId` in the URL — `wizard-shell.tsx` reads only a `step` query param. `/create` therefore cannot deep-link to a *specific* server-side draft: it would open whatever draft happens to be in that browser's local storage, which may not be the wishlist the action is about, may not exist there at all, and is meaningless for a collaborator (a different browser/session) reviewing a shared draft — a direct violation of "every row leads somewhere the user may act." The wishlist's own overview page (`/dashboard/wishlists/[id]`) already renders `WishlistStatusStrip`'s `DraftStrip` — the readiness checklist and the `Publicar` button — and is reachable by any member via `assertWishlistAccess` (no `requireOwner`). `complete_draft` now routes there instead.

Shared lists follow the same rule, which forces one divergence from the artboard. The default board shows `Archiva esta wishlist` badged `Compartida por Lucía`, i.e. offered to a collaborator — but `archiveWishlist` calls `assertWishlistAccess(..., { requireOwner: true })`, so that row would land a member on a screen where they cannot act. `archive` is therefore derived **only for wishlists the user owns**. The other three kinds are collaborator work by definition and keep the owner badge, so the badge the artboard introduces still appears — on `review_rsvps` and `invite_guests` rows rather than on `archive`.

### 7. The topbar carries identity, and the Ayuda pill waits

The desktop artboard shows a 56px bar reading `Inicio` with an `Ayuda` pill. No help route exists, and the sidebar's own `Ayuda y soporte` button is already inert. `dashboard-mobile-shell` sets the precedent that a destination navigating nowhere is omitted rather than rendered dead, so the pill is omitted until a help destination resolves. The bar still renders — it is what separates the page from the sidebar on desktop.

`Crear wishlist` sits in the page header as a **secondary** pill, per the design note: on this route the only primary button is the recommended next step.

### 8. Mobile is the same model in one column

The móvil 390 board is not a different page: same greeting, same ribbon, same hero, same `Después` rows, with `Resumen` moved below them and `Crear wishlist` full-width under the greeting. It gets root-mode chrome — avatar, `Inicio`, overflow — which `dashboard-mobile-shell` describes but no route implements.

## Risks / Trade-offs

- **Query cost.** `home` reads every non-archived owned and shared wishlist with its gifts, purchases, and invites. That is the same shape `summaryList` already pays for, plus invites, and bounded by how many lists one person owns. If it becomes a problem the fix is counting invites in SQL rather than loading them; not worth pre-optimizing.
- **Copy generated from checks can read stiffly** when four checks fail at once. Cap the enumeration at two unmet checks plus "y N más", so the sentence stays close to the artboard's cadence.
- **Ranking by kind is a product judgment.** A deadline expiring today still sits below an unpublished draft. It matches the artboard, and it is one ordered constant to change if it proves wrong in use.
