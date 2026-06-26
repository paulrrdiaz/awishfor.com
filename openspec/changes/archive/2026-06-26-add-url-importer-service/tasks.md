## 1. Validation schema

- [x] 1.1 Add `src/server/validators/importer.schema.ts` with a Zod schema for the import input (URL string, trimmed, max length, valid `http(s)` URL).
- [x] 1.2 Export the `ImportedGiftDraft` type (name, productUrl, imageUrl, storeName, priceAmount, priceCurrency) mapped onto `Gift` fields.
- [x] 1.3 Add `importer.schema.test.ts` covering accept/reject of scheme and shape.

## 2. URL safety

- [x] 2.1 In `src/server/services/importer.service.ts`, add a host classifier that blocks loopback, link-local, RFC-1918/unique-local, and metadata IPs.
- [x] 2.2 Add `assertSafeUrl` that rejects non-`http(s)` schemes and unsafe hosts.
- [x] 2.3 Unit-test safety: reject `file:`/`ftp:`/`data:`, localhost, `169.254.169.254`, private ranges; accept a public host.

## 3. Hardened fetch

- [x] 3.1 Implement fetch with injectable `fetch` dep and an `AbortController` timeout.
- [x] 3.2 Follow redirects manually, cap at 5, and re-run `assertSafeUrl` on each hop's `Location`.
- [x] 3.3 Read the body incrementally and cap at 2MB, aborting when exceeded.
- [x] 3.4 Re-validate the final URL after redirects before parsing.
- [x] 3.5 Test timeout, redirect cap, public→private redirect rejection, and oversized-body cap.

## 4. Metadata extraction

- [x] 4.1 Parse JSON-LD `Product` (name, image, price, currency).
- [x] 4.2 Parse Open Graph tags.
- [x] 4.3 Parse Twitter Card tags.
- [x] 4.4 Parse HTML `<title>`.
- [x] 4.5 Apply field-by-field priority chain (JSON-LD → OG → Twitter → title) with domain fallback for store name.
- [x] 4.6 Add `src/test/fixtures/importer-html-fixtures.ts` and test extraction per source and the fallback chain.

## 5. Result assembly

- [x] 5.1 Assemble `ImportedGiftDraft` from extracted fields, always returning a draft (at minimum source URL + domain store name).
- [x] 5.2 Return a typed friendly-error state on timeout/network/blocked/oversized instead of throwing.
- [x] 5.3 Test sparse-draft and friendly-error outcomes.

## 6. tRPC endpoint

- [x] 6.1 Add `src/server/api/routers/importer.ts` with a `protectedProcedure` using the import schema.
- [x] 6.2 Map the service result to a normal return value (never throw raw fetch/parse errors).
- [x] 6.3 Register the `importer` router in `src/server/api/root.ts`.
- [x] 6.4 Test signed-out rejection, invalid-input rejection, and valid-request draft return.

## 7. Validation

- [x] 7.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; fix any failures.
