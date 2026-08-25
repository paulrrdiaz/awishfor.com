## 1. Filtering Foundation

- [x] 1.1 Add typed guests-route search-parameter parsers for the debounced search term and invitation RSVP status, with URL-omitted defaults.
- [x] 1.2 Add a pure dashboard invitation filtering/counting utility that preserves list order, normalizes case and accents, matches named companions and contact fields, and compares phone digits independently.
- [x] 1.3 Add focused unit tests for text normalization, formatted phone matching, invitation-level status filtering, combined search/status intersections, stable order, and global status counts.
- [x] 1.4 Add tests for valid, missing, and invalid guests-route search parameters.

## 2. Guest Filter Interface

- [x] 2.1 Add an accessible guest search input that reflects URL state immediately, debounces URL updates, and resynchronizes on browser navigation.
- [x] 2.2 Add RSVP status chips for Todos, Pendientes, Confirmados, and No asistirán, including global invitation counts and URL-backed selection state.
- [x] 2.3 Compose the search and status controls into a responsive guests filter toolbar consistent with the existing dashboard visual language.
- [x] 2.4 Add a filtered-results empty state that clears both URL controls while leaving the existing zero-invitations onboarding state unchanged.

## 3. Route Integration and Behavior Coverage

- [x] 3.1 Update the guests page to parse URL state, compute global totals/counts from the complete invitation list, filter results server-side in memory, and render the toolbar only when invitations exist.
- [x] 3.2 Preserve guest card edit, copy, delete, and add flows while active filters survive route revalidation.
- [x] 3.3 Add component or route-level tests covering chip counts, combined controls, URL persistence, clear-filters behavior, and the distinction between zero invitations and zero filtered matches.

## 4. Validation and Tracking

- [x] 4.1 Run `pnpm check` and resolve all Biome findings.
- [x] 4.2 Run `pnpm test` and resolve all test failures.
- [x] 4.3 Run `pnpm typecheck` and resolve all TypeScript errors.
- [x] 4.4 Reconcile the completed change with any corresponding guest/dashboard milestone items in `docs/TASKS.md`.
