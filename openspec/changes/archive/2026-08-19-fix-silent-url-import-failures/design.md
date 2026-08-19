## Context

See `proposal.md` for the user-facing failure. The current service performs a hardened direct fetch, optionally retries only recognized block responses through Bright Data, extracts metadata, adds the domain as a store fallback, and returns `ok: true` even when every product field is absent. The wizard then converts the absent name into “Regalo importado.”

The observed Wong URL demonstrates the gap: a normal browser receives JSON-LD and Open Graph product data, while the deployed server-side request returns an HTTP-successful response from which the current extractor finds no name, image, or price. Because that response does not match a known block marker, the existing scraper path is skipped.

Constraints:

- Preserve the current SSRF validation, manual redirect handling, five-second direct timeout, thirty-second scraper timeout, five-redirect cap, and two-megabyte body cap.
- Keep Bright Data optional and reuse the existing `.pe` country targeting when it is invoked.
- Keep metadata extraction HTML-only; the product requirements exclude browser automation and JavaScript execution.
- Do not alter persistence, Prisma models, or gift validation.

## Goals / Non-Goals

**Goals:**

- Distinguish transport success from product-import success.
- Recover metadata-empty direct responses through one existing scraper attempt.
- Preserve typed, user-friendly failures and make the wizard outcome truthful.
- Keep the decision and retry orchestration deterministic and unit-testable with injected fetch responses.

**Non-Goals:**

- Detect every possible generic interstitial title or build a retailer-specific Wong parser.
- Retry timeouts, generic network errors, unsafe URLs, redirect-limit errors, or oversized responses through the scraper.
- Add live retailer calls to the automated test suite.
- Add observability infrastructure, rate limiting, dependencies, or new configuration.

## Decisions

### 1. Evaluate meaningful metadata before applying domain-only success semantics

Introduce a single predicate over extracted metadata. It returns true when at least one of these values is usable:

- `name` is a non-empty trimmed string, regardless of whether it came from JSON-LD, Open Graph, Twitter Card, or HTML title;
- `imageUrl` is a non-empty trimmed string;
- `priceAmount` is a finite number, including zero.

`storeName`, `productUrl`, and `priceCurrency` alone do not demonstrate that product extraction worked. The domain fallback can still populate successful drafts, but it cannot make an otherwise empty extraction successful.

Alternative considered: require all of name, image, and price. Rejected because many valid store pages expose only a subset and the importer is intentionally best-effort. Alternative considered: keep URL/domain-only success and add a warning. Rejected because the current UI consumes success by adding a gift immediately, reproducing the silent failure.

### 2. Parse the direct response before deciding whether fallback is needed

The flow becomes:

```text
safe direct fetch
       │
       ├─ recognized blocked response ─────────────┐
       │                                           │
       ▼                                           ▼
extract candidate ── meaningful? yes ──▶ success  scraper configured?
       │ no                                        │
       └───────────────────────────────────────────┤
                                                   ▼
                                      one scraper fetch + extract
                                                   │
                              meaningful? ─────────┴───────── no
                                  │ yes                        │
                                  ▼                            ▼
                               success              typed import error
```

Extraction should be represented by one reusable helper that runs the existing priority chain and returns metadata plus the final URL/domain context. Both direct and scraper responses pass through the same helper so parsing behavior cannot drift.

Alternative considered: add Wong-specific block strings to `isBlockedPage`. Rejected as insufficient: the deployed response is known only by its lack of extractable data, and other retailers can exhibit the same HTTP-200 behavior.

### 3. Limit the new fallback trigger to structurally empty successful responses

The existing scraper retry for recognized blocking remains. The new trigger applies only after a usable direct HTTP response yields no meaningful metadata. The importer makes at most one scraper request per import.

Timeout, generic network, unsafe-host, redirect-limit, and oversized-body errors retain their current meanings and do not gain a paid retry. This bounds cost and avoids masking security or resource-limit failures.

Alternative considered: route every import through Bright Data first. Rejected because it adds latency and cost to retailers that already work with the direct fetch. Alternative considered: retry every direct failure. Rejected because several failure classes are intentional safety boundaries rather than anti-bot responses.

### 4. Add `metadata_unavailable` to the result union

Extend `ImportErrorKind` with `metadata_unavailable`. Use it when a usable direct response lacks meaningful metadata and either no scraper is configured or the scraper response is also metadata-empty. Explicitly detected block responses continue to use `blocked`; existing fetch errors keep their existing kinds.

The tRPC response remains the same discriminated union shape, so there is no endpoint or transport change beyond the additional error-kind value and the removal of sparse `ok: true` results.

Alternative considered: reuse `blocked` for metadata-empty pages. Rejected because an empty result is evidence of unavailable metadata, not proof of blocking, and the distinction improves UI copy and diagnostics.

### 5. Keep failed imports out of wizard state

Add a Spanish message for `metadata_unavailable` that explains that product data could not be found and directs the user to manual entry. The existing `!result.ok` branch already prevents gift creation; the new service contract ensures metadata-empty results reach that branch. Preserve the submitted URL after failure so it can be corrected or retried.

The successful path may retain its defensive name fallback for type/runtime resilience, but tests must establish that the service no longer returns a metadata-empty success under supported behavior.

### 6. Validate behavior at service and UI boundaries

Service tests will cover:

- meaningful direct metadata returns without scraper use;
- metadata-empty direct response followed by meaningful scraper response succeeds;
- metadata-empty direct response without scraper configuration returns `metadata_unavailable`;
- metadata-empty direct and scraper responses return `metadata_unavailable` after one retry;
- existing explicit blocking, timeout, network, redirect, size, and SSRF behavior remains unchanged;
- URL/domain-only sparse success is removed.

Wizard tests will cover the new message, unchanged input after failure, absence of a new gift, and continued manual-entry access. Router tests will assert that the new typed result passes through unchanged.

No live retailer request belongs in CI; fixture responses model the observed response classes deterministically.

## Risks / Trade-offs

- [Risk] A legitimate URL meant only as a manual bookmark can no longer use automatic import to create a sparse gift → Mitigation: the existing manual gift form remains the explicit path for that use case.
- [Risk] Metadata-empty responses increase paid scraper usage → Mitigation: direct meaningful results never invoke the scraper, each import gets at most one fallback, and configuration remains optional.
- [Risk] A generic interstitial with a non-empty `<title>` can still pass the meaningful predicate → Mitigation: retain known block-page detection; expand markers later from observed evidence rather than guessing in this focused fix.
- [Risk] Bright Data may return a usable page larger than the existing two-megabyte cap → Mitigation: keep the cap as a security/resource boundary and return the existing `oversized` error rather than weakening it.
- [Trade-off] The API behavior changes for sparse successes → Mitigation: the only current client is updated in the same change, router behavior is covered, and no sparse draft is persisted automatically by the endpoint.

## Migration Plan

Deploy the service contract, client error mapping, and tests together. No data migration or configuration rollout is required. Existing Bright Data credentials, when present, are reused.

Rollback is a code revert restoring URL/domain-only sparse success and the previous UI behavior; there is no stored-state migration to undo.
