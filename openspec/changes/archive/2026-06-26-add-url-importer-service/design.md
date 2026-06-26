## Context

Gift creation (wizard + dashboard) currently requires manual entry of name, image, price, and store. Owners typically have a product URL on hand, so a paste-a-link importer removes most of that typing. The constraint set is non-trivial: fetching arbitrary user-supplied URLs server-side is a classic SSRF vector, so safety must be designed in, not bolted on. The stack is Next.js 16 / tRPC v11 / Prisma 7; services live in `src/server/services/`, routers in `src/server/api/routers/` (registered in `src/server/api/root.ts`), validators in `src/server/validators/`. Existing services (e.g. `slug.service.ts`) are plain async functions taking dependencies as arguments, which keeps them unit-testable without a live DB — the importer follows the same shape.

## Goals / Non-Goals

**Goals:**
- Turn a product URL into a best-effort `ImportedGiftDraft` mapped onto existing `Gift` fields.
- Be SSRF-safe: validate scheme and host before fetch, and re-validate after redirects.
- Bound resource use: timeout, redirect cap (5), body cap (2MB).
- Degrade gracefully — always return a draft so manual entry stays possible; never throw raw fetch/parse errors to callers.
- Stay unit-testable with HTML fixtures and an injectable fetch.

**Non-Goals:**
- No JS execution / headless browser. HTML-only parsing.
- No persistence; saving the gift stays in gift-management.
- No tracking-param cleanup or store display-name mapping (task 4.2).
- No rate limiting (separate abuse-protection milestone).

## Decisions

**1. Plain function service with injectable fetch.** `importGiftFromUrl(deps, input)` where `deps` carries a `fetch` implementation (default `globalThis.fetch`). Rationale: matches existing service style, lets tests pass fixture responses without network. Alternative — module-level `fetch` call — rejected because it makes deterministic tests hard.

**2. SSRF defense by host classification, not allowlist.** Reject non-`http(s)` schemes; parse the host and reject loopback/link-local/RFC-1918/unique-local and known metadata IPs (`169.254.169.254`). Validate again on the final URL after redirects. Rationale: an allowlist of stores is too brittle for an open product space. Trade-off: DNS-rebinding is not fully closed by URL inspection alone (see Risks).

**3. Manual redirect following.** Use `redirect: "manual"` and follow up to 5 hops ourselves, re-running host validation on each `Location`. Rationale: native `redirect: "follow"` would bypass our per-hop host check, re-opening the SSRF hole through a public→private redirect.

**4. Streamed, size-capped body read.** Read the response body incrementally and abort once 2MB is exceeded rather than buffering the whole thing. Rationale: prevents a malicious/huge page from exhausting memory.

**5. Metadata priority chain.** JSON-LD `Product` → Open Graph → Twitter Card → `<title>`, field-by-field (a field can come from a lower tier if higher tiers omit it). Store name falls back to the host domain. Rationale: JSON-LD is the most structured and reliable for price/currency; OG/Twitter cover the long tail; title/domain guarantee a non-empty draft. Parse with a lightweight HTML approach (regex/targeted extraction or a small parser) — no full DOM/JS.

**6. Result is a discriminated union internally, always a draft outward.** The service returns either an ok draft or a typed friendly-error state; the tRPC layer maps that to a normal return value (not a thrown error) so the client can always offer manual editing. Input validation (URL shape) happens in `importer.schema.ts` via Zod at the procedure boundary; deep host-safety lives in the service.

## Risks / Trade-offs

- **DNS rebinding (TOCTOU between validation and fetch)** → Mitigate by re-validating the final resolved URL/host after redirects and keeping the redirect cap low; full mitigation (pinning the validated IP into the connection) is out of scope for this pass and noted for hardening.
- **Parser brittleness across sites** → Field-by-field fallback chain plus domain/title guarantees a usable (if sparse) draft; never blocks manual entry.
- **Timeout too aggressive/lax** → Single tunable constant in the service; start conservative and adjust from real usage.
- **Large/streaming responses** → 2MB hard cap with early abort bounds memory and time.
- **No rate limiting yet** → Endpoint is `protectedProcedure` (authenticated only), limiting exposure until the dedicated rate-limit milestone lands.

## Migration Plan

Additive only — new files plus one line registering the `importer` router in `src/server/api/root.ts`. No schema/migration, no env vars. Rollback is removing the router registration (endpoint disappears; no data to unwind).

## Open Questions

- Exact timeout value (proposed default ~5s) — confirm against slow but legitimate stores.
- Whether to pin the validated IP for the actual connection now or defer to the security/rate-limit milestone (leaning defer).
