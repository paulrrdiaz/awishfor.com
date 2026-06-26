## ADDED Requirements

### Requirement: URL safety validation

The importer SHALL validate a submitted URL before any network request and reject unsafe targets to prevent SSRF.

#### Scenario: Reject non-http(s) scheme
- **WHEN** a URL with a scheme other than `http` or `https` is submitted (e.g. `file:`, `ftp:`, `data:`)
- **THEN** the importer rejects it without fetching and returns a validation error

#### Scenario: Block private and internal hosts
- **WHEN** the URL host resolves to localhost, loopback, link-local, RFC-1918 private ranges, or a cloud metadata endpoint (e.g. `169.254.169.254`)
- **THEN** the importer rejects it without fetching and returns a validation error

#### Scenario: Accept a public product URL
- **WHEN** a well-formed `https` URL pointing at a public host is submitted
- **THEN** the importer proceeds to fetch it

### Requirement: Hardened fetching

The importer SHALL constrain the network request to bound time, size, and redirects, and SHALL re-validate the destination after redirects.

#### Scenario: Timeout aborts the request
- **WHEN** the target does not respond within the configured timeout
- **THEN** the request is aborted via `AbortController` and a friendly timeout error state is returned

#### Scenario: Redirects are capped
- **WHEN** following the URL would require more than 5 redirects
- **THEN** the importer stops and returns an error instead of following further

#### Scenario: Final URL is re-validated after redirects
- **WHEN** a redirect chain lands on a private or internal host
- **THEN** the importer rejects the response and does not parse its body

#### Scenario: Oversized response is capped
- **WHEN** the response body exceeds 2MB
- **THEN** the importer stops reading and does not parse beyond the limit

### Requirement: Metadata extraction priority chain

The importer SHALL extract gift metadata from fetched HTML using a defined priority order and SHALL fall back gracefully when higher-priority sources are absent.

#### Scenario: JSON-LD Product takes precedence
- **WHEN** the HTML contains a JSON-LD `Product` object with name, image, and price
- **THEN** those values are used for the draft over Open Graph, Twitter Card, or title

#### Scenario: Open Graph used when JSON-LD absent
- **WHEN** no JSON-LD Product is present but Open Graph tags exist
- **THEN** Open Graph values populate the draft

#### Scenario: Twitter Card used when OG absent
- **WHEN** neither JSON-LD nor Open Graph provide a field but Twitter Card tags do
- **THEN** Twitter Card values populate that field

#### Scenario: HTML title fallback
- **WHEN** no structured metadata provides a name but the document has a `<title>`
- **THEN** the title is used as the draft name

#### Scenario: Domain fallback for store name
- **WHEN** no store name is found in metadata
- **THEN** the host domain is used as the store name

### Requirement: ImportedGiftDraft result

The importer SHALL always return an `ImportedGiftDraft` so manual editing remains possible, and SHALL never throw raw fetch/parse errors to the caller.

#### Scenario: Best-effort draft on success
- **WHEN** a valid product URL is imported successfully
- **THEN** the result contains the best available metadata (name, image URL, price amount, price currency, store name, source URL), with unresolved fields left empty

#### Scenario: Sparse draft preserves manual fallback
- **WHEN** parsing yields little or no metadata
- **THEN** the importer still returns a draft (at minimum the source URL and domain store name) so the user can complete it manually

#### Scenario: Friendly error on failure
- **WHEN** fetching fails (timeout, network error, blocked host, oversized body)
- **THEN** the importer returns a friendly error state rather than throwing

### Requirement: Authenticated importer endpoint

The importer SHALL be exposed through an authenticated tRPC procedure that validates its input.

#### Scenario: Signed-out request is rejected
- **WHEN** a signed-out caller invokes the importer endpoint
- **THEN** the request is rejected with `UNAUTHORIZED`

#### Scenario: Invalid input is rejected
- **WHEN** the endpoint receives input that fails URL schema validation
- **THEN** the request is rejected with a validation error before any fetch

#### Scenario: Valid request returns a draft
- **WHEN** a signed-in caller submits a valid URL
- **THEN** the endpoint returns an `ImportedGiftDraft`
