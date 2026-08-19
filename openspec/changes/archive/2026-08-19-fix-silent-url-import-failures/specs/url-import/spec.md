## ADDED Requirements

### Requirement: Metadata-empty response fallback

The importer SHALL consider an extracted result meaningful only when it contains at least one of: a non-empty product name, a non-empty product image URL, or a finite numeric product price. A store/domain name and source URL alone SHALL NOT qualify as meaningful product metadata. When a direct HTTP response is usable but extraction is not meaningful, the importer SHALL make at most one attempt through the configured scraper fallback before returning a result.

#### Scenario: Metadata-empty direct response uses configured fallback

- **WHEN** the direct request returns a usable HTTP response but extraction produces only the source URL and store/domain name
- **THEN** the importer requests the same safe public URL once through the configured scraper fallback

#### Scenario: Fallback recovers meaningful metadata

- **WHEN** the direct response is metadata-empty and the scraper fallback returns a page containing a product name, image, or finite numeric price
- **THEN** the importer returns a successful draft populated from the fallback response

#### Scenario: Meaningful direct response avoids scraper cost

- **WHEN** the direct response produces at least one meaningful product field
- **THEN** the importer returns that successful draft without invoking the scraper fallback

#### Scenario: Metadata-empty response without configured fallback

- **WHEN** the direct response is metadata-empty and scraper fallback credentials are unavailable
- **THEN** the importer returns a typed `metadata_unavailable` error

#### Scenario: Metadata-empty fallback remains a failure

- **WHEN** both the direct response and the single scraper fallback attempt produce no meaningful product metadata
- **THEN** the importer returns a typed `metadata_unavailable` error and does not return a sparse draft

### Requirement: Explicit wizard failure for unavailable metadata

The creation wizard SHALL add a gift only after a successful automatic import. When product metadata remains unavailable, the wizard SHALL display a friendly error and SHALL keep manual gift creation available without silently adding a generic gift.

#### Scenario: Unavailable metadata does not add a gift

- **WHEN** the importer returns `metadata_unavailable`
- **THEN** the wizard displays an actionable message, leaves the submitted URL available for correction or retry, and does not add a “Regalo importado” gift

#### Scenario: User can switch to manual creation

- **WHEN** automatic import cannot retrieve meaningful product metadata
- **THEN** the user can still open the existing manual gift form and enter the product details explicitly

## MODIFIED Requirements

### Requirement: ImportedGiftDraft result

The importer SHALL return an `ImportedGiftDraft` only when automatic extraction produces meaningful product metadata, and SHALL never throw raw fetch or parse errors to the caller. A successful draft SHALL retain the resolved source URL and best available store name in addition to any extracted product fields.

#### Scenario: Best-effort draft on success

- **WHEN** a valid product URL yields at least a non-empty product name, non-empty product image URL, or finite numeric product price through the direct or scraper response
- **THEN** the result contains the best available metadata, store name, and resolved source URL, with other unresolved product fields left empty

#### Scenario: Sparse draft preserves manual fallback

- **WHEN** parsing yields no meaningful product metadata after the applicable direct and fallback attempts
- **THEN** the importer returns `metadata_unavailable` instead of returning a draft containing only the source URL and domain store name

#### Scenario: Friendly error on failure

- **WHEN** fetching fails because of timeout, network error, blocked host or page, excessive redirects, or an oversized body
- **THEN** the importer returns the corresponding friendly typed error state rather than throwing a raw error
