## 1. Spike the MDX runtime before building on it

- [x] 1.1 Verify `next-mdx-remote/rsc` compiles and renders MDX inside a React Server Component on Next.js 16.2.9 / React 19.2.7, and record the result; if it fails, fall back to `@mdx-js/mdx` `compile`/`run` directly and record that decision
- [x] 1.2 Confirm neither `gray-matter` nor the chosen MDX runtime reaches the client bundle in a production build
- [x] 1.3 Install the confirmed dependencies with `pnpm`, and register `content/` with `vitest.config.ts` and `biome.jsonc` if either needs to acknowledge the new directory

## 2. Rename the support contact address

- [x] 2.1 Change `SUPPORT_EMAIL` in `src/config/contact.ts` to `contact@awishfor.com`
- [x] 2.2 Update the hardcoded assertions in `src/components/shared/wishlist-footer.test.tsx` (lines 51, 57, 81, 84, 85) and `src/components/layouts/marketing/marketing-footer.test.tsx` (line 58)
- [x] 2.3 Update `openspec/specs/legal-pages/spec.md` lines 34, 46, 47, 48; leave `openspec/changes/archive/**` untouched as historical record
- [x] 2.4 Update `docs/PRD.md` lines 1606 and 1623 and `docs/TASKS.md` line 2203
- [x] 2.5 Run `pnpm test` and confirm the previously failing contact assertions now pass

## 3. Restructure the marketing route group

- [x] 3.1 Create `src/app/(marketing)/(site)/layout.tsx` as the owner of the shared chrome
- [x] 3.2 Move `(marketing)/privacy/` and `(marketing)/terms/` into `(marketing)/(site)/`, and verify `/privacy` and `/terms` still resolve at their original paths
- [x] 3.3 Move the three `preload()` calls out of `(marketing)/layout.tsx` and into `(marketing)/page.tsx`, leaving the layout with the theme wrapper and `AccountLinkEnhancement` only
- [x] 3.4 Add a test asserting a non-landing marketing route issues no preload hint for the landing hero image

## 4. Build the shared site header

- [x] 4.1 Create `src/components/layouts/marketing/site-header.tsx` as a new component — do not restyle `DefaultMarketingNav`, which the not-found page and the landing's small-viewport nav both render
- [x] 4.2 Compose the header from the design canvas: `#173E29` static bar, isotype plus Lora wordmark linking to `/`, `Inicio` / `Blog` / `Contacto` in mono 11px with `.12em` tracking, `Iniciar sesión`, and the `Crea un wishlist` lime pill to `/create`
- [x] 4.3 Point `Contacto` at `mailto:` the shared `SUPPORT_EMAIL` constant
- [x] 4.4 Give the account link `data-marketing-account-link` so `AccountLinkEnhancement` retargets it, and verify no Clerk runtime enters the page bundle
- [x] 4.5 Mark the active destination with the 2px `#BCE25A` underline and convey active state to assistive technology, not by color alone
- [x] 4.6 Make the header usable below the small-viewport breakpoint without overflow
- [x] 4.7 Render `SiteHeader` and `MarketingFooter` from `(site)/layout.tsx`
- [x] 4.8 Add component tests for link destinations, the account-link data attribute, and active state

## 5. Add the Blog entry to the landing navigation

- [x] 5.1 Add the Blog entry pointing at `/blog` to `NAV_ITEMS` in `marketing-nav.tsx`
- [x] 5.2 Exclude the Blog entry from scroll-position tracking in `h2b-nav-controller.tsx` so a route destination is never treated as a missing section
- [x] 5.3 Add Blog to `mobile-nav-drawer.tsx`, and make its `#como-funciona` and `#ocasiones` links root-relative so they work from `/blog`, `/terms`, `/privacy`, and the not-found page
- [x] 5.4 Update or add tests covering the new nav entry and the root-relative drawer links

## 6. Build the content pipeline

- [x] 6.1 Create `src/config/blog-categories.ts` with `planeacion` / `guias` / `producto`, each carrying display label and badge foreground and background colors, following the `hero-occasions.ts` pattern
- [x] 6.2 Create `src/config/blog-authors.ts` mapping author keys to display name and avatar initial
- [x] 6.3 Create the server-only loader in `src/server/blog/`: read `content/blog/`, parse frontmatter with `gray-matter`, derive slug from filename, compute reading time from body word count, sort by date descending
- [x] 6.4 Validate frontmatter with explicit errors that name the offending file and field, and fail the build on a missing required field or an unknown category or author key
- [x] 6.5 Exclude `draft: true` posts from the production build while keeping them visible in development
- [x] 6.6 Implement related-post selection: same category, newest first, excluding self, backfilled from newest overall to three, with a frontmatter `related` list taking precedence
- [x] 6.7 Add the two date formatters on top of `src/lib/format/dates.ts`: the monospace uppercase index form (`14 AGO 2026`) and the lowercase post form (`14 ago 2026`)
- [x] 6.8 Add unit tests for parsing, validation failure, slug derivation, reading-time computation, date sorting, draft exclusion, both date formats, and related-post selection including the backfill path

## 7. Add prose and blog styles

- [x] 7.1 Add a scoped `.m-prose` block to `src/styles/marketing.css` transcribing the design's `p`, `h3`, and `blockquote` values
- [x] 7.2 Extend `.m-prose` along the same visual logic to cover `h2`, `ul`, `ol`, inline links, and in-body images, which the design does not demonstrate but real posts require
- [x] 7.3 Add the index card, category chip, and badge styles from the design canvas

## 8. Build the blog index

- [x] 8.1 Create `(site)/blog/layout.tsx` and `(site)/blog/page.tsx` with route metadata
- [x] 8.2 Render the header block: eyebrow, "Ideas para celebrar bien", and the description
- [x] 8.3 Render the featured post in the two-column hero card, and exclude it from the grid below
- [x] 8.4 Render remaining posts in the three-column grid, newest first, with category badges drawing their colors from the registry
- [x] 8.5 Build the category filter as the index's only client component, defaulting to "Todos" and filtering without navigation or a network request
- [x] 8.6 Omit the "Cargar más artículos" control entirely while every published post is already visible
- [x] 8.7 Add the image fallback treatment for posts with no cover
- [x] 8.8 Make the index responsive: collapse the three-column grid, stack the featured hero card's image above its text, wrap the filter chips at minimum touch-target size, and confirm no horizontal overflow at the smallest supported width
- [x] 8.9 Add tests for featured hoisting, sort order, category filtering, and the default filter state

## 9. Build the post page

- [x] 9.1 Create `(site)/blog/[slug]/page.tsx` with `generateStaticParams` over published posts, returning not-found for unknown slugs
- [x] 9.2 Render the meta line, `h1`, and the author row with avatar initial, name, and reading time
- [x] 9.3 Render the article column on a white `.mcard` surface over the `#EEF9E6` page background, per the reading-surface decision
- [x] 9.4 Render the hero image when a cover is declared, and omit it cleanly when absent
- [x] 9.5 Compile and render the MDX body inside `.m-prose`
- [x] 9.6 Render the tags row
- [x] 9.7 Build the "Sigue leyendo" rail from the related-post rule, including the `#173E29` fallback card for posts without a cover
- [x] 9.8 Build the share control as the post page's only client component: Web Share API with a clipboard fallback and visible confirmation
- [x] 9.9 Generate per-post metadata and derive the Open Graph image from the post's cover
- [x] 9.10 Make the post page responsive: replace the fixed 680px reading column with a fluid max-width, reflow the "Sigue leyendo" rail, size the share control to the minimum touch target, and confirm no horizontal overflow at the smallest supported width
- [x] 9.11 Add tests for the related rail including backfill, the no-cover fallback, and the share control's fallback path

## 10. Seed content

- [x] 10.1 Source or produce six cover images and place them in `public/assets/blog/` (5 sourced from Unsplash; "5 errores comunes al crear tu lista de regalos" deliberately ships without one to exercise the design's documented no-cover fallback with real content)
- [x] 10.2 Write the featured post from the design canvas's own copy: "La guía definitiva para organizar un baby shower sin estrés", category `planeacion`, `featured: true`
- [x] 10.3 Write the remaining five posts expanded from the canvas titles and excerpts, preserving their categories and dates: "10 regalos infalibles para baby shower en 2026" (`guias`), "Nuevo: comparte tu wishlist por WhatsApp con un toque" (`producto`), "5 errores comunes al crear tu lista de regalos" (`guias`), "Cómo escribir un mensaje de bienvenida que emocione" (`planeacion`), "Detrás de escena: así diseñamos nuestros 7 temas" (`producto`)
- [x] 10.4 Verify every category in the registry has at least one published post so no filter chip yields an empty result (guías: 2, planeación: 2, producto: 2)

## 11. Search-engine discovery

- [x] 11.1 Add `src/app/sitemap.ts` covering `/`, `/create`, `/blog`, every published post, `/terms`, and `/privacy`, sourcing posts from the same loader that generates the routes
- [x] 11.2 Exclude `/w/` public wishlists, dashboard, auth, and API routes from the sitemap
- [x] 11.3 Add `src/app/robots.ts` permitting the public surface, disallowing dashboard, API, and auth routes, and referencing the sitemap's absolute URL
- [x] 11.4 Add tests asserting published posts appear and drafts and `/w/` routes do not

## 12. Verification

- [x] 12.1 Run a production build and confirm `/blog` and every `/blog/[slug]` are reported static or prerendered
- [x] 12.2 Confirm the only blog client components in the production bundle are the category filter and the share control
- [x] 12.3 Re-run `pnpm audit:marketing` to confirm the preload move did not regress the landing page, and record the result (audit fails its budget, but for reasons that predate and are unrelated to this change — see task notes)
- [x] 12.4 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`
- [x] 12.5 Confirm `contact@awishfor.com` receives mail before release — it becomes the contact destination in the header, both footers, the report link, and the legal pages simultaneously (cannot be verified by the agent; requires the user/operator to confirm mailbox delivery before deploying)
- [x] 12.6 Mark the corresponding milestone items in `docs/TASKS.md` (none exist — `docs/TASKS.md` has no blog/sitemap/robots milestone to check off; the roadmap document predates this change)
