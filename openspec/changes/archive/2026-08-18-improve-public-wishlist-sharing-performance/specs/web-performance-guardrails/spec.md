## ADDED Requirements

### Requirement: Production public wishlist audit

The project MUST provide a repeatable production-mode performance audit for an anonymous light public-wishlist fixture and an anonymous heavy public-wishlist fixture. The fixtures SHALL be deterministic, SHALL exercise the real public route, layouts, metadata, providers, gift rendering, and image-priority behavior, and SHALL be unavailable in normal application runtime. Development-mode results MUST NOT be accepted as release evidence.

#### Scenario: Public wishlist audit is reproducible

- **WHEN** a contributor runs the public wishlist performance audit
- **THEN** it builds and serves the application in production mode and audits both deterministic fixtures
- **AND** it records the revision, tested URLs, fixture sizes, profiles, run values, medians, and generated time

#### Scenario: Mobile profile gates the change

- **WHEN** the public wishlist audit runs
- **THEN** each fixture receives at least three cold-cache mobile runs
- **AND** the heavy fixture also records a desktop comparison

#### Scenario: Audit fixtures are not public product routes

- **WHEN** the application runs without the audit command's server-only mode
- **THEN** the deterministic audit slugs are unavailable and cannot shadow a real wishlist

### Requirement: Public wishlist Lighthouse budget

Both public-wishlist fixtures MUST achieve a median mobile Lighthouse Performance score of at least 95 with no individual run below 90. The median mobile LCP MUST be at or below 2.5 seconds, CLS at or below 0.1, and total blocking time at or below 200 milliseconds.

#### Scenario: Public wishlist performance budget passes

- **WHEN** every fixture's three cold mobile runs satisfy the score, LCP, CLS, and TBT thresholds
- **THEN** the public wishlist performance gate passes

#### Scenario: Light-only success is insufficient

- **WHEN** the light fixture passes but the heavy fixture violates any threshold
- **THEN** the audit exits unsuccessfully and identifies the heavy-fixture regression

### Requirement: Public wishlist initial payload budget

Each audited public wishlist MUST keep compressed initial JavaScript at or below 220 KiB, compressed route CSS at or below 40 KiB, initially transferred font data at or below 100 KiB, and total initial transferred resources at or below 800 KiB. The initial document SHALL expose exactly one high-priority content image and no more than three initial font requests.

#### Scenario: Public payload stays within budget

- **WHEN** an audited wishlist reaches its initial settled state without scrolling or interaction
- **THEN** every JavaScript, CSS, font, total-transfer, image-priority, and font-count threshold is satisfied

#### Scenario: Optional interaction code is deferred

- **WHEN** a guest has not opened a drawer or RSVP interaction
- **THEN** code used only by that interaction does not consume the initial payload budget

#### Scenario: Payload failure is diagnosable

- **WHEN** a public wishlist exceeds a payload or resource-count threshold
- **THEN** the audit reports contributing resource URLs, encoded sizes, initiators, and resource types

### Requirement: Public wishlist performance verification

Changes to public wishlist routes, layouts, provider boundaries, font registration, metadata images, image priority, gift rendering, or interaction hydration MUST include the production public-wishlist audit in their verification evidence alongside static checks and tests.

#### Scenario: Performance-sensitive public change is reviewed

- **WHEN** a pull request changes a performance-sensitive public-wishlist area
- **THEN** its verification records the public-wishlist audit results for both fixtures

#### Scenario: Public budget configuration is versioned

- **WHEN** a public-wishlist threshold, fixture, or audit profile changes
- **THEN** that configuration change is committed with a rationale and cannot silently relax locally
