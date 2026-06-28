## MODIFIED Requirements

### Requirement: URL safety validation

The importer SHALL validate a submitted URL before any network request and reject unsafe targets to prevent SSRF. The submitted URL SHALL be further restricted to `http` and `https` schemes only; any other scheme SHALL be rejected at the validator boundary before the importer is invoked.

#### Scenario: Reject non-http(s) scheme

- **WHEN** a URL with a scheme other than `http` or `https` is submitted (e.g. `file:`, `ftp:`, `data:`, `javascript:`)
- **THEN** the validator rejects it without invoking the importer and returns a validation error

#### Scenario: Block private and internal hosts

- **WHEN** the URL host resolves to localhost, loopback, link-local, RFC-1918 private ranges, or a cloud metadata endpoint (e.g. `169.254.169.254`)
- **THEN** the importer rejects it without fetching and returns a validation error

#### Scenario: Accept a public product URL

- **WHEN** a well-formed `https` URL pointing at a public host is submitted
- **THEN** the importer proceeds to fetch it
