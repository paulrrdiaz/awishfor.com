## ADDED Requirements

### Requirement: Public font delivery follows the active selection

The public wishlist SHALL request only font families used by its resolved heading, body, and above-the-fold utility typography. Inactive families from the configurable font catalog MUST NOT be preloaded or downloaded during initial page load. When heading and body resolve to the same family, that family SHALL not be requested twice.

#### Scenario: Distinct heading and body fonts

- **WHEN** a published wishlist resolves to different heading and body font families
- **THEN** initial font requests are limited to those active families plus at most one above-the-fold utility family

#### Scenario: Same family serves heading and body

- **WHEN** heading and body both resolve to the same font family
- **THEN** the initial page does not issue duplicate font requests for that family

#### Scenario: Inactive catalog fonts stay deferred

- **WHEN** a wishlist uses Lora headings and Inter body text
- **THEN** Playfair Display, Cormorant Garamond, DM Serif Display, Nunito, Figtree, Source Serif 4, and Karla are neither preloaded nor downloaded during initial load
