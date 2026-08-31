# wishlist-view-analytics Specification

## Purpose
Defines privacy-preserving recording of real public wishlist views and the owner-only aggregate metrics derived from those records.
## Requirements
### Requirement: Qualifying published page views are recorded
The system SHALL record one wishlist view when a published public or personalized wishlist page completes its client-side view signal. A record SHALL include the wishlist, the view time, an optional personalized invite, and a wishlist-scoped anonymous visitor identifier. Draft previews, archived pages, not-found pages, metadata-only requests, and server-side rendering alone SHALL NOT create a view record.

#### Scenario: General public link records an anonymous view
- **WHEN** a browser completes the view signal on a published `/w/<wishlist-slug>` page
- **THEN** the system records a view for that wishlist without an invite attribution

#### Scenario: Personalized link records an attributed view
- **WHEN** a browser completes the view signal on a published `/w/<wishlist-slug>/<guest-slug>` page that resolves to an invite
- **THEN** the system records a view for that wishlist attributed to that invite

#### Scenario: Preview and non-public results are not counted
- **WHEN** an owner views a draft preview, or any browser receives an archived or not-found result
- **THEN** no wishlist view record is created

#### Scenario: Metadata resolution is not counted
- **WHEN** a crawler resolves social metadata without a browser completing the public-page view signal
- **THEN** no wishlist view record is created

### Requirement: Owner overview exposes aggregate view metrics
The wishlist owner SHALL see total recorded views, approximate unique visitors, and the latest recorded view time in that wishlist's dashboard overview. Total views SHALL include both general and personalized links; approximate unique visitors SHALL count distinct anonymous identifiers within that wishlist; and the latest time SHALL be null when no view has been recorded.

#### Scenario: Overview combines general and personalized views
- **WHEN** a wishlist has two general-link views and three personalized-link views
- **THEN** its owner overview reports five total views

#### Scenario: Overview approximates unique visitors within a wishlist
- **WHEN** the same browser records two views for one wishlist and another browser records one view for that wishlist
- **THEN** the owner overview reports two approximate unique visitors

#### Scenario: Empty analytics state is explicit
- **WHEN** no qualifying view has been recorded for a wishlist
- **THEN** its owner overview reports zero total views, zero approximate unique visitors, and no latest view time

### Requirement: Owner view analytics remain private and minimized
Only the wishlist owner SHALL receive view analytics for that wishlist. The stored and returned owner analytics SHALL NOT include a public-link visitor's name, email, IP address, full referrer URL, browser fingerprint, or cross-wishlist identifier. An invite name SHALL be visible only through the existing owner-managed invite relationship when a recorded view came from that invite's personalized link.

#### Scenario: Collaborator cannot receive view analytics
- **WHEN** a non-owner collaborator opens a wishlist dashboard overview or queries its invitation list
- **THEN** view totals, unique-visitor counts, and invite view details are not returned

#### Scenario: General-link visitor remains anonymous
- **WHEN** an owner views analytics for visits made through the general public link
- **THEN** the owner can see only aggregate counts and latest-view time, not visitor identity or technical tracking data

#### Scenario: Analytics data is removed with its wishlist
- **WHEN** a wishlist is deleted
- **THEN** all stored view records and invite view metrics associated with that wishlist are deleted with it

