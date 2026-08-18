## ADDED Requirements

### Requirement: Published wishlist snapshot consistency

The metadata and visible page body for one published-wishlist request SHALL be derived from one consistent public wishlist snapshot so that the title, description, cover image, gift statuses, and progress cannot disagree within the same response.

#### Scenario: Wishlist changes during rendering

- **WHEN** a published wishlist changes while a request is producing metadata and page content
- **THEN** the response uses one internally consistent snapshot rather than mixing values from separate reads

### Requirement: Published wishlist cache safety and freshness

Published wishlist presentation data SHALL be reusable across anonymous requests. Draft owner previews, personalized invite state, and inaccessible lifecycle states MUST NOT be stored in the shared published-data cache. A successful mutation that changes public content, design, images, gifts, purchases, purchase undo state, slug, or lifecycle SHALL invalidate every affected published-wishlist cache entry before subsequent page refreshes are served.

#### Scenario: Repeated anonymous published request

- **WHEN** multiple anonymous guests request the same unchanged published wishlist
- **THEN** the system may reuse its public presentation snapshot without reloading an identical complete relation graph for every request

#### Scenario: Purchase invalidates public progress

- **WHEN** a guest successfully purchases or undoes a purchase for a published wishlist
- **THEN** the next refreshed public snapshot reflects the new gift status and progress totals

#### Scenario: Owner changes public presentation

- **WHEN** an owner successfully changes public content, design, cover images, gifts, slug, or lifecycle
- **THEN** affected public URLs do not continue serving the stale cached presentation

#### Scenario: Draft preview is isolated

- **WHEN** an owner views a draft wishlist preview
- **THEN** that owner-specific result is not written to or served from the shared published-data cache

### Requirement: Public interaction behavior survives delivery optimization

Performance optimization SHALL preserve filtering, sorting, product departure, purchase, undo, progress refresh, share, and RSVP behavior. Deferring non-critical client code SHALL NOT prevent the first user interaction from completing or make keyboard focus restoration inaccessible.

#### Scenario: Deferred purchase interaction is activated

- **WHEN** a guest activates a gift purchase action before its non-critical drawer code has loaded
- **THEN** the system loads and opens the purchase interaction from that activation without requiring a second click

#### Scenario: Purchase refresh keeps filter state

- **WHEN** a purchase or undo refreshes an optimized public page
- **THEN** the active gift filter and sort selection remain applied as already specified
