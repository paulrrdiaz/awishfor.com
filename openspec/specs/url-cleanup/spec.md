## ADDED Requirements

### Requirement: Tracking-param cleanup

The system SHALL provide a pure helper that removes known tracking params from a product URL while preserving the rest of the URL unchanged.

#### Scenario: Strip known UTM params
- **WHEN** a URL contains `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, or `utm_content`
- **THEN** those params are removed from the returned URL

#### Scenario: Strip known click-ID params
- **WHEN** a URL contains known click-ID params (e.g. `gclid`, `fbclid`, `msclkid`, `dclid`, `mc_eid`)
- **THEN** those params are removed from the returned URL

#### Scenario: Preserve unknown params
- **WHEN** a URL contains params not on the known tracking list (e.g. `variant`, `size`, `id`)
- **THEN** those params are retained unchanged in the returned URL

#### Scenario: Preserve path, host, and fragment
- **WHEN** a URL with tracking params is cleaned
- **THEN** the scheme, host, path, and fragment are returned unchanged and only the disallowed query params are removed

#### Scenario: No query string is a no-op
- **WHEN** a URL has no query string
- **THEN** the URL is returned unchanged

#### Scenario: Malformed input is returned unchanged
- **WHEN** the input is not a parseable URL
- **THEN** the helper returns the original input without throwing

### Requirement: Store display-name mapping

The system SHALL provide a pure helper that resolves a product URL or domain to a curated friendly store display name, falling back to the clean domain when the store is unknown.

#### Scenario: Known store maps to friendly name
- **WHEN** the URL host matches a mapped store domain (e.g. `falabella.com`)
- **THEN** the curated display name (e.g. `Falabella`) is returned

#### Scenario: Known store ignores www and subdomain noise
- **WHEN** the URL host is a mapped store prefixed with `www.` or a regional subdomain
- **THEN** the curated display name is still returned

#### Scenario: Unknown store falls back to clean domain
- **WHEN** the URL host is not in the mapping
- **THEN** the cleaned domain (without `www.`) is returned as the display name

#### Scenario: Peru/LatAm stores are covered
- **WHEN** the URL host is a known Peru/LatAm store domain
- **THEN** its curated display name is returned

#### Scenario: International stores are covered
- **WHEN** the URL host is a known international store domain (e.g. `amazon.com`)
- **THEN** its curated display name is returned

#### Scenario: Empty or malformed input returns empty
- **WHEN** the input is empty, null, or not a parseable URL
- **THEN** the helper returns an empty string
