## ADDED Requirements

### Requirement: Statically generated blog index at `/blog`

The system SHALL serve a public blog index at `/blog`, rendered inside the marketing route group, accessible without authentication, and indexable by search engines. The route MUST be statically renderable: request-time authentication, database access, and application client-provider initialization MUST NOT block its response.

#### Scenario: Signed-out visitor opens the blog index

- **WHEN** a signed-out visitor navigates to `/blog`
- **THEN** the blog index renders without redirecting to sign-in

#### Scenario: Production build classifies the index as static

- **WHEN** the application completes a production build
- **THEN** `/blog` is reported as a static or prerendered route
- **AND** reading authentication state is not part of the route's server render

#### Scenario: Index is indexable

- **WHEN** a crawler requests `/blog`
- **THEN** the page is not marked `noindex`
- **AND** the document exposes a descriptive `<title>` and meta description

### Requirement: Statically generated post routes at `/blog/[slug]`

The system SHALL serve one statically generated route per published post at `/blog/[slug]`, with the set of slugs enumerated at build time. Requesting a slug that does not correspond to a published post SHALL render the not-found response.

#### Scenario: Every published post is prerendered

- **WHEN** the application completes a production build
- **THEN** one static route exists for each published post in `content/blog/`
- **AND** each is reported as static or prerendered

#### Scenario: Unknown slug

- **WHEN** a visitor requests `/blog/` followed by a slug with no matching published post
- **THEN** the not-found response is rendered

#### Scenario: Post exposes its own metadata

- **WHEN** a crawler requests a published post
- **THEN** the document's title and meta description come from that post's frontmatter
- **AND** the Open Graph image is derived from the post's cover image when one is declared

### Requirement: MDX content pipeline

Posts SHALL be authored as MDX files in `content/blog/`, parsed and compiled at build time. No database, content management system, or request-time content fetch may participate in rendering a post. Publishing SHALL require only committing a file and deploying.

#### Scenario: Adding a post

- **WHEN** an author adds a valid `.mdx` file to `content/blog/` and the application is rebuilt
- **THEN** the post appears on the index and is reachable at its own route
- **AND** no database record or external service call is involved

#### Scenario: The index does not compile post bodies

- **WHEN** the blog index is rendered
- **THEN** only post frontmatter is read
- **AND** no post body is compiled to produce the listing

#### Scenario: Malformed frontmatter fails the build

- **WHEN** a post declares frontmatter missing a required field or referencing an unknown category or author key
- **THEN** the build fails with an error naming the offending file and field

### Requirement: Post frontmatter contract

Each post SHALL declare `title`, `excerpt`, `date`, `category`, `author`, and `tags`. Each post MAY declare `cover`, `featured`, `draft`, and `related`. The system SHALL derive the post's slug from its filename and its reading time from its body word count; neither may be authored in frontmatter.

#### Scenario: Slug derives from filename

- **WHEN** a post is stored as `content/blog/organizar-baby-shower-sin-estres.mdx`
- **THEN** it is served at `/blog/organizar-baby-shower-sin-estres`

#### Scenario: Reading time is computed

- **WHEN** a post's body is rendered or listed
- **THEN** its displayed reading time is computed from the current body word count
- **AND** editing the body changes the displayed reading time on the next build without any frontmatter edit

#### Scenario: Cover image is optional

- **WHEN** a post declares no `cover`
- **THEN** the post renders without a hero image
- **AND** any card representing that post renders the fallback treatment rather than a broken or empty image slot

### Requirement: Draft posts are excluded from production

A post declaring `draft: true` SHALL be excluded from the production build entirely — absent from the index, from related-post rails, from the sitemap, and without a route of its own. Draft posts SHALL remain visible in development.

#### Scenario: Draft is invisible in production

- **WHEN** the application is built for production with a `draft: true` post present
- **THEN** the post does not appear on the index
- **AND** no route is generated for it
- **AND** it does not appear in the sitemap

#### Scenario: Draft is visible in development

- **WHEN** the development server renders the blog index with a `draft: true` post present
- **THEN** the post is listed, so its author can review it

### Requirement: Featured post drives the index hero

Exactly one published post declaring `featured: true` SHALL render in the index's large two-column hero card. The remaining published posts SHALL render in the three-column grid below it, sorted newest first.

#### Scenario: Featured post is hoisted

- **WHEN** the index renders with a post declaring `featured: true`
- **THEN** that post occupies the hero card
- **AND** it does not also appear in the grid below

#### Scenario: Posts are sorted newest first

- **WHEN** the index grid renders
- **THEN** posts appear in descending date order

### Requirement: Category registry and badge styling

Post categories SHALL resolve through a typed registry that supplies each category's display label and badge colors. A post MUST NOT declare a category outside the registry.

#### Scenario: Badge renders registry colors

- **WHEN** a post card renders its category badge
- **THEN** the badge uses the background and foreground colors the registry assigns to that category
- **AND** the badge shows the category's full display label

#### Scenario: Unknown category is rejected

- **WHEN** a post declares a category key absent from the registry
- **THEN** the build fails rather than rendering an unstyled badge

### Requirement: Client-side category filtering

The index SHALL present category filter chips including an "all" option, filtering the already-rendered post list on the client without a network request or navigation. The "all" chip SHALL be selected on load.

#### Scenario: Filtering by category

- **WHEN** a visitor selects a category chip
- **THEN** only posts in that category remain visible
- **AND** no navigation or network request occurs

#### Scenario: Returning to all posts

- **WHEN** a visitor selects the "all" chip
- **THEN** every published post is visible again

#### Scenario: Default state

- **WHEN** the index first renders
- **THEN** the "all" chip is selected and every published post is visible

### Requirement: Load-more affordance reflects real state

The index SHALL NOT present a non-functional "load more" control. Where no further posts exist to reveal, the control SHALL be absent.

#### Scenario: All posts already visible

- **WHEN** every published post is rendered on the index
- **THEN** no "load more" button is displayed

### Requirement: Related posts on each article

Each post SHALL display up to three related posts. Selection SHALL prefer posts sharing the article's category, newest first, excluding the article itself, backfilled from the newest published posts overall until three are shown. A post declaring `related` in frontmatter SHALL use that list instead.

#### Scenario: Same-category selection

- **WHEN** a post's category contains at least three other published posts
- **THEN** the three newest of them are shown
- **AND** the article itself is never among them

#### Scenario: Backfill when the category is thin

- **WHEN** a post's category contains fewer than three other published posts
- **THEN** the rail is filled to three with the newest published posts from other categories
- **AND** no post appears twice

#### Scenario: Manual override

- **WHEN** a post declares `related` in its frontmatter
- **THEN** exactly those posts are shown, in the declared order

#### Scenario: Related post without a cover

- **WHEN** a selected related post declares no cover image
- **THEN** its card renders the image fallback treatment

### Requirement: Article reading surface

The post page SHALL render on the marketing background color with its article column presented on a white card surface consistent with the existing marketing card primitive.

#### Scenario: Article column is a card

- **WHEN** a post renders
- **THEN** the page background is the marketing background color
- **AND** the article column sits on a white surface with the marketing border color and rounded corners

### Requirement: Article prose styling

The post body SHALL style paragraphs, second- and third-level headings, blockquotes, ordered and unordered lists, inline links, and images, within a scoped prose class consistent with the marketing design system.

#### Scenario: Body elements are styled

- **WHEN** a post body contains headings, lists, a blockquote, an inline link, and an image
- **THEN** each renders with the marketing design system's typography rather than browser defaults

### Requirement: Article share control

Each post SHALL provide a share control that uses the Web Share API where available and falls back to copying the post's URL to the clipboard, confirming the copy to the visitor.

#### Scenario: Native share available

- **WHEN** a visitor activates the share control in a browser supporting the Web Share API
- **THEN** the native share sheet opens with the post's title and URL

#### Scenario: Clipboard fallback

- **WHEN** a visitor activates the share control in a browser without the Web Share API
- **THEN** the post's URL is copied to the clipboard
- **AND** the visitor receives visible confirmation

### Requirement: Blog surfaces adapt across breakpoints

The design canvas draws the blog index and post page at desktop width only. Both routes SHALL nonetheless be usable from the smallest supported viewport upward: multi-column grids SHALL collapse, the fixed-width reading column SHALL become fluid, and no blog surface may overflow horizontally. Interactive controls SHALL meet the project's minimum touch-target size. The mobile profile is the gating profile for this project's performance budget, so mobile is a requirement of these routes rather than an enhancement.

#### Scenario: Index grid collapses

- **WHEN** the blog index renders below the desktop breakpoint
- **THEN** the three-column post grid collapses to fewer columns
- **AND** the two-column featured hero card stacks its image above its text
- **AND** the page does not scroll horizontally

#### Scenario: Reading column is fluid

- **WHEN** a post renders below the desktop breakpoint
- **THEN** the article column fills the available width within its gutters instead of holding a fixed width
- **AND** the page does not scroll horizontally

#### Scenario: Related rail adapts

- **WHEN** the "Sigue leyendo" rail renders below the desktop breakpoint
- **THEN** its three cards reflow to fewer columns without clipping

#### Scenario: Filter chips remain usable

- **WHEN** the category filter renders below the desktop breakpoint
- **THEN** the chips wrap rather than overflow
- **AND** each chip meets the minimum touch-target size

#### Scenario: Share control remains usable

- **WHEN** the share control renders below the desktop breakpoint
- **THEN** it meets the minimum touch-target size

### Requirement: Date presentation differs by surface

Post dates SHALL render in the monospace uppercase form on the index and in the lowercase form on the post page, matching the design canvas, and both SHALL be derived from the post's `date` frontmatter through the project's shared date formatting rather than authored strings.

#### Scenario: Index date form

- **WHEN** a post card renders its date on the index
- **THEN** it appears in the monospace uppercase form, such as `14 AGO 2026`

#### Scenario: Post date form

- **WHEN** a post page renders its meta line
- **THEN** the date appears in the lowercase form, such as `14 ago 2026`

### Requirement: Blog client JavaScript is limited to interactive controls

The blog index SHALL ship no client JavaScript beyond the category filter, and a post page SHALL ship none beyond the share control, excluding client code already required by the shared footer.

#### Scenario: Index hydration scope

- **WHEN** the blog index loads
- **THEN** the only blog-specific client component that hydrates is the category filter

#### Scenario: Post hydration scope

- **WHEN** a post page loads
- **THEN** the only blog-specific client component that hydrates is the share control
