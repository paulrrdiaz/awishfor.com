## Context

See `proposal.md` for motivation and the delta specs for observable behavior.

The guest page currently fetches the wishlist overview and the complete invitation list in parallel, then computes total people and invitation-level filter counts before applying URL-backed filters. Each dashboard invitation view model already carries the primary status plus every extra guest's name and status, so all new counts and roster content are available without API or schema changes. The header is a client component because it owns the add-invite sheet; per-row URL copying and shared clipboard controls provide existing interaction patterns, but their silent error behavior does not satisfy this roster's feedback requirement.

The app palette reserves lime for the primary action. Confirmed badges use the published green treatment, pending badges use the neutral draft treatment, and declined badges currently reuse neutral archived colors. Mobile section chrome already reserves its pinned action bar for `Agregar invitado` plus at most one pending-reminder action.

## Goals / Non-Goals

**Goals:**

- Derive header metrics and copied roster from the same complete invitation snapshot so displayed and copied totals agree.
- Keep person-level and invitation-level units explicit in Spanish copy.
- Produce deterministic, privacy-conscious plain text useful in WhatsApp and at venue reception.
- Make copy behavior accessible and usable at desktop and mobile widths without displacing the primary add action.
- Introduce a semantic declined-status visual without changing unrelated archived or destructive treatments.

**Non-Goals:**

- No direct WhatsApp deep link, Web Share integration, downloadable file, print view, or editable export template.
- No contact details, RSVP timestamps, invitation URLs, or view analytics in copied text.
- No changes to RSVP persistence, filtering semantics, collaborator permissions, database schema, or public invitation pages.
- No refactor of all clipboard controls into one abstraction.

## Decisions

### 1. Build one unfiltered attendance projection on the server page

Add a pure dashboard utility that accepts `DashboardInviteViewModel[]` plus the wishlist title and returns the confirmed-person count and formatted roster text. Continue deriving pending invitations from the complete invitation-level filter counts. Invoke both before `filterDashboardInvites` in the Server Component and pass only prepared values to the header.

This makes the complete list, not the filtered view, the source of truth and prevents the visible count from drifting from the clipboard total. Returning count and text together prevents two independent confirmed-status loops from evolving differently.

Alternative rejected: use `wishlist.metrics.confirmedGuests`. The overview and invitation list are separate queries, so a response recorded between them could make the count disagree with the roster. The invitation list already contains all required state.

Alternative rejected: format inside the client header. Server-side formatting avoids sending a second structured invitation collection to the header and keeps clipboard UI limited to interaction state.

### 2. Define roster format as deterministic plain text grouped by invitation

The formatter will:

1. Select individual primary and extra guests with status `confirmed`.
2. Exclude invitation groups containing no confirmed person.
3. Sort groups by primary name with a Spanish, case- and accent-insensitive collator; preserve extra-guest `sortOrder` through the existing mapped order.
4. Render a title line using the wishlist title, a correctly pluralized confirmed-person total, and one compact bullet per invitation group. The primary name SHALL appear only once in its group bullet.
5. Join named confirmed companions with the primary name using Spanish conjunctions; represent unnamed confirmed companions as `+ <n>` when the primary is confirmed. When only companions are confirmed, preserve the primary name only as contextual attribution.

Plain text works in WhatsApp, email, Notes, and venue documents without importing a file-generation dependency. Compact group bullets retain household context without visually repeating the primary guest. The formatter will not deduplicate equal names because two invitation records can legitimately represent different people.

Alternative rejected: flat global alphabetical list. It loses the relationship between unnamed companions and the primary guest.

Alternative rejected: CSV. Better for spreadsheets, but worse for the requested WhatsApp/reception handoff and introduces escaping/download behavior outside current scope.

### 3. Keep roster copying in a feature-specific client control

Add a `CopyConfirmedGuestsButton` under the guest feature. It receives preformatted text and confirmed count, writes through `navigator.clipboard.writeText`, temporarily changes its label to `Lista copiada` on success, and emits an explicit Spanish error toast on rejection. With zero confirmed people it remains rendered and disabled, with an accessible description explaining why.

Do not change the shared `CopyButton`: that component intentionally fails silently because its adjacent source text remains selectable. The roster text is not otherwise rendered, so a silent failure would strand the user.

Use an outline treatment and copy/check icon. `Agregar invitado` remains the sole lime primary action. On desktop both actions sit at the header's end; below `md`, the add button remains in existing fixed mobile action bar while the outline copy control stays in page header content. This preserves the mobile shell's two-action maximum and keeps copying available on phones.

### 4. Replace redundant header metadata with operational counts

Render:

`Invitados · <total> persona(s) · <confirmed> confirmada(s) · <pending> invitación/invitaciones pendiente(s)`

All three values come from the complete list. The total invitation count is removed from header because `Todos · <count>` immediately below already reports it. Existing filter chips remain invitation-level and unchanged.

At narrow widths, allow metrics to wrap as a compact secondary line while keeping labels attached to their numbers. Do not introduce dashboard statistic cards; hierarchy should remain quiet and consistent with the existing list header.

### 5. Add a declined semantic token and badge variant

Add `--status-declined` and `--status-declined-foreground` app-theme values, expose them through Tailwind's inline theme mapping, and add a `declined` `Badge` variant. Map RSVP `declined` to that variant while leaving `archived` untouched.

Use a low-chroma red surface with darker red text in light mode and a legible dark-mode pair. Exact values and spacing require comparison with `A Wish For.dc.html` before implementation completion. The new token is intentionally separate from `--destructive`: a declined RSVP is information, not a destructive action.

Alternative rejected: map declined RSVP to the existing destructive badge. That conflates data status with dangerous actions and prevents independent palette tuning.

Alternative rejected: recolor archived globally. Archived wishlist semantics must remain neutral.

### 6. Validation boundaries

Pure utility tests cover primary and extra statuses, mixed parties, zero/one/many pluralization, stable unnamed labels, privacy exclusions, group ordering, and no deduplication. Header/control DOM tests cover unfiltered labels, disabled zero state, successful clipboard feedback, and rejected clipboard toast. Badge tests assert the semantic declined variant without coupling to literal color values. Existing guest-filter tests continue proving invitation-level counts and URL behavior.

Implementation validation runs `pnpm check`, focused Vitest files, full `pnpm test`, and `pnpm typecheck`. Visual QA covers desktop and mobile widths plus light/dark themes; compare final appearance with Claude Design when MCP access exists.

## Risks / Trade-offs

- [Two people share the same name] → Keep both entries; do not deduplicate roster records.
- [Unnamed companions are insufficient for strict venue identity checks] → Preserve their invitation association and stable position; collecting required companion names remains outside scope.
- [Clipboard API unavailable or denied] → Keep action state unchanged and show explicit retry feedback.
- [Status changes after page render] → Copied data represents the invitation snapshot currently rendered; existing revalidation refreshes it after RSVP mutations.
- [Long titles or large counts wrap the header] → Use flexible wrapping and keep the outline action independent from metric text; verify narrow mobile and localized singular cases.
- [Muted red becomes confused with destructive UI] → Use dedicated declined tokens and visually compare badge beside destructive controls in light and dark themes.

## Migration Plan

No data migration or rollout flag is required. Deploy utility, header/control, and semantic-token changes together. Rollback removes the new header props/control and restores the declined-to-archived mapping; persisted data remains unaffected.
