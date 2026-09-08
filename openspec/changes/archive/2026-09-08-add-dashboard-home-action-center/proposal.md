## Why

`/dashboard` is a nine-line placeholder that tells the owner to "selecciona una lista en el panel lateral". It is the first screen after sign-in and it currently answers nothing: not what is unfinished, not what needs a reply, not what is about to expire. Every real task lives two clicks away inside a specific wishlist, so an owner with a draft that never got published, an RSVP deadline in three days, and a published list with zero guests has no surface that says so.

`Dashboard.dc.html` §6 replaces it with a **centro de acciones**: a greeting, a single recommended next step, the tasks that come after it, and a cross-wishlist summary — desktop and mobile, with a defined rendering for the loading, error, all-clear, and first-run cases.

## What Changes

- Add a cross-wishlist **action model**: publish-blocking drafts, pending RSVP reviews, published lists with no guests, and past-event lists that should be archived — derived from existing data, ranked by kind, with dates as tiebreak and as copy.
- Add one `wishlist.home` tRPC query that returns the ranked actions, the recommended next step, the next upcoming event, and the summary aggregates for owned and shared lists in a single round-trip.
- Rebuild `/dashboard` as the action center: greeting by time of day, secondary `Crear wishlist`, the "cinta de preparación" ribbon connecting `Tu siguiente paso` to `Después`, and the right-hand `Resumen` column.
- Render five states with a defined shape each: acciones pendientes, todo encaminado, usuario nuevo, cargando (height-preserving skeleton), and error with `Reintentar`.
- Add the page's own chrome: the desktop Inicio topbar and the mobile root-mode title bar that `dashboard-mobile-shell` specifies but nothing implements.
- Cover the ranking, next-step selection, and copy derivation with colocated unit tests.

## Capabilities

### New Capabilities

- `dashboard-home`: defines `/dashboard` as the owner's action center — the action model, its ranking, the five render states, the summary column, and the page chrome on both breakpoints.

### Modified Capabilities

- `dashboard-mobile-shell`: makes root mode concrete. The existing requirement names a root-mode title bar but leaves its contents open and no route renders one; this pins the identity avatar, the screen title, and the single overflow control.

## Impact

- Affected code: `src/app/(protected)/dashboard/page.tsx`, a new `src/lib/dashboard/` action module, `src/server/api/routers/wishlist.ts`, `src/server/mappers/dashboard-wishlist.mapper.ts`, new components under `src/components/features/dashboard/home/`, and a root-mode title bar under `src/components/layouts/dashboard/mobile/`.
- No database migration. Every field the action model reads already exists: `Wishlist.eventDate`, `Wishlist.rsvpDeadline`, `Wishlist.status`, `Wishlist.archivedAt`, `Invite.status`, and `WishlistMember`.
- `evaluatePublishReadiness` is read but not changed; `eventDate` does not become a publish requirement in this change.
- `/dashboard` moves from an async server component to a client query so `Reintentar` and the skeleton have something to bind to.
