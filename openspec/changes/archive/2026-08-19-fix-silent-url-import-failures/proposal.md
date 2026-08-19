## Why

Some retailers return an HTTP 200 page to server-side fetches without exposing any usable product metadata. The importer currently treats that response as success and the wizard silently creates a generic “Regalo importado” card, so users receive neither the requested data nor an actionable error.

## What Changes

- Define an automatic import as successful only when extraction produces at least one meaningful product field: a non-empty name, an image URL, or a numeric price.
- Retry through the existing Bright Data Web Unlocker when the direct response is successful at the HTTP layer but contains no meaningful product metadata, just as the importer already retries recognized block pages.
- Return a dedicated `metadata_unavailable` error when no meaningful metadata can be extracted, the scraper fallback is not configured, or the fallback also yields no meaningful metadata.
- **BREAKING (behavioral)**: stop returning `ok: true` drafts that contain only the source URL and domain store name.
- Keep manual gift creation available as an explicit user fallback and show a friendly import error instead of automatically adding a generic gift.
- Preserve the current parsing priority, URL safety checks, redirect cap, response-size cap, timeouts, and optional scraper configuration.

Non-goals:

- Do not introduce browser automation or JavaScript execution.
- Do not add retailer-specific parsers, change metadata priority, or broaden fallback to unrelated network/timeout failures.
- Do not make Bright Data configuration mandatory or add new environment variables.
- Do not change gift persistence or database schemas.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `url-import`: require meaningful product metadata for a successful automatic import, retry metadata-empty HTTP 200 responses through the existing scraper fallback, and return an actionable typed error rather than a sparse success when extraction remains empty.

## Impact

- `src/server/services/importer.service.ts`: extraction-success predicate, retry orchestration, and new typed error result.
- `src/server/validators/importer.schema.ts`: imported result/error typing if the shared contract is extended there.
- `src/components/features/wizard/gifts-step.tsx`: friendly `metadata_unavailable` message and removal of the silent generic-card path for failed imports.
- Importer service, router, and wizard tests: replace sparse-success expectations and cover direct success, metadata-empty fallback success, unavailable fallback, and unusable fallback responses.
- External systems: more Bright Data requests only for direct responses that are HTTP-successful but metadata-empty; existing credentials and Peru country targeting are reused.
- No Prisma migration, dependency, or environment/config additions.
