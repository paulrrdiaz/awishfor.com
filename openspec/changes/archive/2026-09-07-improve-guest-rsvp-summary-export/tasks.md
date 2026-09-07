## 1. Confirmed-roster projection

- [x] 1.1 Add focused tests for person-level confirmed counts, mixed primary/companion states, Spanish pluralization, alphabetical party grouping, unnamed companion labels, duplicate names, and privacy exclusions.
- [x] 1.2 Implement the pure dashboard utility that returns one confirmed-person count and matching plain-text roster from the complete invitation list and wishlist title.

## 2. Declined RSVP treatment

- [x] 2.1 Add light/dark declined-status surface and foreground tokens, expose their Tailwind mappings, and add the semantic `declined` badge variant without changing archived or destructive styles.
- [x] 2.2 Map declined RSVP indicators to the new variant and add coverage proving confirmed, pending, archived, and destructive treatments remain unchanged.

## 3. Guest header and clipboard action

- [x] 3.1 Add component tests for clipboard success, temporary `Lista copiada` feedback, rejected clipboard writes, and the accessible disabled state when zero people are confirmed.
- [x] 3.2 Implement the feature-specific `CopyConfirmedGuestsButton` with outline styling, copy/check states, explicit Spanish error feedback, and mobile-safe accessibility.
- [x] 3.3 Update the guest page to derive total people, confirmed people, pending invitations, and roster text from the complete list before applying search or RSVP filters.
- [x] 3.4 Update the guest header to show correctly pluralized total-person, confirmed-person, and pending-invitation metrics; remove redundant total-invitation metadata; and place copy/add actions responsively without changing the mobile pinned action bar.
- [x] 3.5 Add header/page coverage proving metrics and copied roster remain anchored to the complete list while filters alter only visible invitation cards.

## 4. Validation and tracking

- [x] 4.1 Run focused Vitest coverage for guest roster, header/control, filters, and RSVP badge behavior; resolve failures.
- [x] 4.2 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; resolve failures or report any external blocker.
- [x] 4.3 Update the corresponding guest-dashboard milestone entry in `docs/TASKS.md` after implementation and validation complete.
