## ADDED Requirements

### Requirement: Sitemap covers the public marketing surface

The system SHALL serve a sitemap enumerating the publicly indexable routes: the landing page, the wishlist creation entry point, the blog index, every published post, and the legal pages. The sitemap MUST be generated at build time from the same source of truth that generates the post routes.

#### Scenario: Sitemap lists public routes

- **WHEN** a crawler requests the sitemap
- **THEN** it lists `/`, `/create`, `/blog`, `/terms`, and `/privacy`
- **AND** it lists one entry per published post

#### Scenario: Sitemap tracks published posts

- **WHEN** a post is added to the content directory and the application is rebuilt
- **THEN** the sitemap includes that post without any separate edit

#### Scenario: Drafts are absent

- **WHEN** a post declares `draft: true`
- **THEN** it does not appear in the production sitemap

### Requirement: Non-indexable routes are excluded from the sitemap

The sitemap MUST NOT list public wishlist routes, dashboard routes, authentication routes, or API routes. Public wishlist pages are deliberately marked `noindex`, and listing them would contradict that policy.

#### Scenario: Public wishlists excluded

- **WHEN** the sitemap is generated
- **THEN** no `/w/` route appears in it

#### Scenario: Private and functional routes excluded

- **WHEN** the sitemap is generated
- **THEN** no dashboard, sign-in, sign-up, or API route appears in it

### Requirement: Robots policy

The system SHALL serve a robots policy that permits crawling of the public marketing surface, disallows dashboard, API, and authentication routes, and references the sitemap.

#### Scenario: Public surface is crawlable

- **WHEN** a crawler reads the robots policy
- **THEN** the landing page, blog index, post routes, and legal pages are permitted

#### Scenario: Private routes are disallowed

- **WHEN** a crawler reads the robots policy
- **THEN** dashboard, API, and authentication routes are disallowed

#### Scenario: Sitemap is discoverable

- **WHEN** a crawler reads the robots policy
- **THEN** it contains a reference to the sitemap's absolute URL
