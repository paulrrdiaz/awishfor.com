## Why

Public wishlist pages currently end with a minimal utility footer that does not carry the stronger A Wish For brand and navigation treatment used on the marketing landing page. Reusing the marketing footer body on standalone wishlists creates a consistent brand ending while allowing each wishlist to retain its selected visual identity.

## What Changes

- Reuse the marketing footer body—brand logo and description, product/occasion navigation, legal and contact links, and copyright—on standalone public wishlist pages.
- Exclude the marketing newsletter band from wishlist pages.
- Render the wishlist footer from the active public theme's scoped semantic color and font variables, including accessible foreground/background pairings, instead of the fixed light-green marketing palette.
- Show the expanded themed footer on published wishlist routes, personalized guest routes, and standalone owner draft previews across every public layout.
- Keep embedded wizard/dashboard previews compact so the expanded footer does not dominate their constrained preview panes; compact marketing demos remain unchanged.
- Preserve the wishlist thank-you message before the footer and retain public report/support contact affordances.
- Make landing-section navigation work from `/w/*` by using root-qualified marketing anchors.
- Refactor the marketing footer body into reusable presentation without changing the landing page's current appearance or newsletter behavior.
- Treat archived, not-found, dashboard, and creation-wizard pages as out of scope; no new newsletter persistence, social destinations, or footer customization controls are introduced.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `public-wishlist-layout`: Define the expanded themed footer composition and its standalone, embedded-preview, and compact render behavior across all public layouts.
- `legal-pages`: Expand the public wishlist footer while preserving working privacy, terms, contact, support, and report-list destinations.

## Impact

- Affected components include the marketing footer, shared wishlist footer, public wishlist shell/body, and the bespoke `collage-staggered` layout.
- Public route rendering needs an explicit standalone-versus-embedded distinction because both route previews and editor previews currently use `mode="preview"`.
- Existing marketing and public theme configuration is reused; there are no database, Prisma schema, API, environment-variable, authentication, or dependency changes.
- Tests and Storybook coverage will be updated for footer composition, link destinations, theme inheritance, render-surface behavior, and all public layout variants.
