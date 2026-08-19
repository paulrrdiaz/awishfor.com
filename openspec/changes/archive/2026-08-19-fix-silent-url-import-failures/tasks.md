## 1. Import Success Contract

- [x] 1.1 Extend the importer error union with `metadata_unavailable` and add a reusable predicate that accepts a non-empty name, non-empty image URL, or finite numeric price as meaningful product metadata while ignoring URL/domain-only fields.
- [x] 1.2 Refactor metadata extraction into a shared candidate-building path used by both direct and Bright Data HTML responses without changing the existing JSON-LD, Open Graph, Twitter Card, title, or domain priority rules.

## 2. Metadata-Empty Fallback Orchestration

- [x] 2.1 Update `importGiftFromUrl` to return direct meaningful results without a scraper request and to route HTTP-successful metadata-empty direct responses through at most one configured Bright Data attempt.
- [x] 2.2 Return `metadata_unavailable` when the direct response is metadata-empty and fallback is unavailable or also metadata-empty, while preserving all existing typed errors and safety/resource limits.

## 3. Wizard and API Behavior

- [x] 3.1 Add friendly Spanish copy for `metadata_unavailable` in the gift import form and verify a failed import preserves the submitted URL, adds no gift, and leaves manual gift creation accessible.
- [x] 3.2 Verify the tRPC importer router passes the new typed error result through unchanged without altering the endpoint shape or authentication behavior.

## 4. Regression Coverage

- [x] 4.1 Replace the URL/domain-only sparse-success service test with `metadata_unavailable` coverage for both missing fallback configuration and a metadata-empty fallback response.
- [x] 4.2 Add service tests proving meaningful direct metadata skips Bright Data, meaningful fallback metadata succeeds after an empty direct response, and only one scraper attempt is made.
- [x] 4.3 Add or update wizard and router tests for the new error kind, no generic “Regalo importado” insertion, preserved retry input, and manual-entry availability.

## 5. Validation

- [x] 5.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`, resolving any regressions introduced by the change.
- [x] 5.2 Review the completed diff against the `url-import` delta spec and record any relevant importer milestone update in `docs/TASKS.md` before marking the OpenSpec change complete.
