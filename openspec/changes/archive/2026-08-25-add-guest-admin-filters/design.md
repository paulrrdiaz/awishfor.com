## Context

See `proposal.md` for motivation and `specs/guest-invite-management/spec.md` for observable behavior. The guests page is a server component that fetches the complete owner-authorized invitation list, derives canonical invitation URLs and global totals, and passes the list to a client component that owns only edit-sheet state. The dashboard gifts page already establishes the local pattern for URL-backed search/filter controls: `nuqs` server parsers, small client controls, pure filtering helpers, and a distinct filtered empty state.

The invitation view model already includes primary contact fields, named extra guests, invitation RSVP status, party size, and timestamps. Typical lists are small enough to load and filter in memory, and this change must preserve the current `invite.list` authorization and data contract.

## Goals / Non-Goals

**Goals:**

- Reuse the dashboard's existing server-rendered, URL-backed filtering pattern.
- Keep matching, counting, and normalization deterministic in a pure tested utility.
- Preserve the invitation cards' existing order and management actions.
- Keep query controls usable at desktop and narrow widths without introducing a second dashboard interaction model.

**Non-Goals:**

- Moving filtering, counting, or pagination into Prisma or tRPC.
- Treating individual extra-guest statuses as separate filterable rows.
- Sorting, bulk reminders/actions, response analytics, or engagement segmentation.
- Exposing `openedAt` as a reliable opened/unopened filter.

## Decisions

### 1. Use `q` and `status` URL search parameters

The guests route will parse `q` as a string defaulting to empty and `status` as one of `all | pending | confirmed | declined`, defaulting to `all`. Default values will be omitted from the serialized URL. Client controls will use the same parsers, debounce search updates, and synchronize their displayed values when browser navigation changes the query.

This matches the existing gift-management convention and makes filtered views reloadable and compatible with browser back/forward behavior. Component-only state was rejected because it loses context on refresh and duplicates an established dashboard pattern.

### 2. Filter the complete list in the guests server component

The page will continue calling `invite.list` once, then pass the complete mapped array through a pure `filterDashboardInvites` helper using the parsed query. The filtered array goes to `GuestList`; global header totals and RSVP chip counts are derived from the complete array. The helper preserves source order.

Server-side database filtering was rejected for this change because the page already needs the complete list to calculate global person, invitation, and per-status counts. Adding filter inputs to the protected API would increase contract and test surface without reducing the current query or payload.

### 3. Normalize text and phone values according to their domains

Text matching will trim, lowercase, Unicode-normalize, and remove combining diacritic marks before substring comparison. It applies to the primary name, named extra guests, and primary email. Phone matching will compare digits-only forms of the stored phone and query whenever the query contains digits. Empty or formatting-only queries behave as no search.

Plain lowercase matching was rejected because Spanish names commonly contain accents and users should not have to reproduce them exactly. One shared normalization form for phone and text was rejected because punctuation and spacing carry different meaning in those domains.

### 4. Treat RSVP status as invitation-level state

The status chips map directly to the primary invitation's existing `status`, the same state shown by `RsvpStatusBadge`. Extra guests remain searchable by name but do not independently place the card into multiple status buckets. Counts are therefore invitation counts: `Todos` is the complete invitation count, and each other chip counts invitations with that primary status.

Person-level status filtering was rejected because the page renders one card per invitation and a mixed party could otherwise appear in several buckets at once. Changing that model would require a separate reporting design.

### 5. Add a dedicated responsive filter toolbar and filtered empty state

The toolbar will render only when the wishlist has invitations. Its search input expands to available width; status chips wrap below or alongside it as space permits. Labels use the existing Spanish RSVP vocabulary: `Todos`, `Pendientes`, `Confirmados`, and `No asistirán`. Counts remain visible on the chips and are computed independently of the active search/status intersection.

If the complete list is empty, the current onboarding empty state remains unchanged. If the complete list is non-empty but the filtered array is empty, a separate empty state explains that no invitations match and clears both URL parameters. Reusing the onboarding state was rejected because its add-first-invite message is incorrect when data exists.

### 6. Preserve active filters across guest mutations

Create, update, and delete actions continue to revalidate the guests route without rewriting its search parameters. Existing success toasts confirm mutations even when the current filter excludes the created or updated invitation. Automatically clearing controls after mutation was rejected because it would discard explicit owner context and make URL-backed behavior inconsistent.

## Risks / Trade-offs

- [A newly created pending invitation can remain hidden under another status or search] → Preserve the owner's chosen context, retain the existing success toast, and refresh global/chip counts so the mutation is still acknowledged.
- [In-memory filtering will eventually be inefficient for very large lists] → Keep filtering behind a pure helper and revisit API/database filtering together with pagination if list sizes warrant it.
- [Search normalization can broaden matches] → Use substring matching only within the explicitly supported identity/contact fields and keep results scoped to the already-authorized wishlist.
- [URL updates can cause excessive server navigations while typing] → Debounce search query updates while updating the local input immediately.

## Migration Plan

No data, schema, API, dependency, environment, or configuration migration is required. Deploy the route parsing, filtering utility, toolbar, and empty state together. Rollback consists of removing those additions; existing invitation data and management actions remain compatible.
