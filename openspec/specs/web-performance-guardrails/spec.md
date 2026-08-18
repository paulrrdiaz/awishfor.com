# web-performance-guardrails Specification

## Purpose
TBD - created by archiving change optimize-marketing-performance. Update Purpose after archive.
## Requirements
### Requirement: Production marketing audit

The project MUST provide a repeatable command that builds and serves the application in production mode, audits the anonymous `/` route with a cold browser profile, and records the environment and measured results. Development-mode measurements MUST NOT be accepted as release evidence.

#### Scenario: Audit runs against a production build

- **WHEN** a contributor runs the marketing performance audit
- **THEN** the command creates or reuses a successful production build and starts the production server on a known local port
- **AND** the audit fails with an explanatory message if it detects a Next.js development runtime

#### Scenario: Audit result is reproducible

- **WHEN** the audit completes
- **THEN** it reports the tested URL, build revision when available, viewport profile, throttling profile, run count, individual run values, and median values
- **AND** it uses at least three cold-cache runs for the gating mobile profile

### Requirement: Near-perfect Lighthouse performance budget

The anonymous marketing route MUST achieve a median Lighthouse Performance score of at least 95 in the production mobile audit, with no individual run below 90. A median score of 98 or greater SHALL be reported as the optimization target rather than treated as a deterministic guarantee.

#### Scenario: Performance budget passes

- **WHEN** three cold-cache production mobile audits produce a median Performance score of at least 95 and every run scores at least 90
- **THEN** the Lighthouse score budget passes

#### Scenario: A noisy or severe regression fails

- **WHEN** the median Performance score is below 95 or any individual run is below 90
- **THEN** the audit exits unsuccessfully and identifies the failed threshold

#### Scenario: Desktop result remains visible

- **WHEN** the performance audit runs
- **THEN** it also reports a production desktop Lighthouse result
- **AND** the desktop result is retained for comparison even when only the mobile profile gates the change

### Requirement: Core Web Vitals and responsiveness budget

The marketing route MUST meet the "good" Core Web Vitals thresholds at the 75th percentile when representative field data is available: LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1. Until field data exists, the production audit MUST gate LCP at 2.5 seconds, CLS at 0.1, and total blocking time at 200 milliseconds or less as a laboratory responsiveness proxy.

#### Scenario: Laboratory vital thresholds pass

- **WHEN** the production mobile audit reports median LCP at or below 2.5 seconds, CLS at or below 0.1, and total blocking time at or below 200 milliseconds
- **THEN** the laboratory Core Web Vitals budget passes

#### Scenario: Field data becomes available

- **WHEN** representative real-user data covers enough traffic to report a 75th percentile
- **THEN** release reviews use the field LCP, INP, and CLS thresholds as the authoritative user-experience check
- **AND** laboratory results remain regression diagnostics rather than a substitute for field data

### Requirement: Initial route payload budget

The production marketing route MUST keep compressed first-load JavaScript at or below 220 KiB, compressed route CSS at or below 40 KiB, preloaded font data at or below 100 KiB, and total initial transferred resources at or below 800 KiB under the audit profile.

#### Scenario: Payload stays within budget

- **WHEN** the anonymous `/` route reaches its initial settled state without scrolling or interaction
- **THEN** each JavaScript, CSS, font-preload, and total-transfer budget is satisfied

#### Scenario: Deferred resources are not counted as critical

- **WHEN** a below-the-fold enhancement is loaded only after its section approaches the viewport or the visitor interacts
- **THEN** it is reported separately from the initial route payload
- **AND** it does not consume bandwidth before its activation condition

#### Scenario: Payload regression identifies its source

- **WHEN** a payload threshold is exceeded
- **THEN** the audit reports the resource URLs, encoded sizes, initiators, and resource types that contributed to the failure

### Requirement: Critical resource discipline

The initial marketing response MUST expose exactly one high-priority content image candidate for the first fold, MUST NOT preload below-the-fold images, and MUST preload no more than three font files. Decorative or future-state media MUST NOT compete with the initial hero for bandwidth.

#### Scenario: Initial image priority is singular

- **WHEN** the anonymous landing route begins loading
- **THEN** exactly one content image is marked high priority or preloaded
- **AND** that image is the first visible hero photograph at the current viewport

#### Scenario: Below-the-fold media remains deferred

- **WHEN** the visitor has not approached the example and later marketing sections
- **THEN** their images are neither preloaded nor requested at high priority

#### Scenario: Font preload count is bounded

- **WHEN** the initial document head is inspected
- **THEN** no more than three font resources are preloaded
- **AND** every preloaded font is used by above-the-fold marketing content

### Requirement: Performance checks are part of change verification

Marketing changes that can affect rendering, hydration, fonts, images, or animation MUST include the production performance audit in their verification evidence. Static quality checks and performance checks MUST remain separate so a passing typecheck cannot conceal a delivery regression.

#### Scenario: Performance-sensitive change is reviewed

- **WHEN** a pull request changes a marketing component, marketing layout, provider boundary, font registration, image priority, or animation controller
- **THEN** its verification records the production audit result alongside tests, typecheck, and code-quality checks

#### Scenario: Budget configuration is versioned

- **WHEN** a performance threshold or audit profile changes
- **THEN** the configuration change is committed with a rationale
- **AND** the threshold cannot silently relax through an untracked local setting

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
