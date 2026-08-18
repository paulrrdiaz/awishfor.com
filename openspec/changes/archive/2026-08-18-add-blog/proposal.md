## Why

A Wish For has no owned-content surface. Every acquisition path today terminates at `/` — a single conversion-optimized page that answers "what is this product" but never "how do I plan a baby shower", which is what people actually search before they know a wishlist product exists. The landing page can only convert demand that already exists; it cannot create it.

The Claude Design canvas already resolves this into two finished screens — `Blog Page.dc.html` (index) and `Blog Post Page.dc.html` (article) — drawn against the same light-green marketing palette the landing page ships today. Their token values (`#EEF9E6`, `#173E29`, `#BCE25A`, `#CCE8BE`, `#7FB069`, `#F4C84A`) are already declared verbatim in `src/styles/marketing.css` as `--mbg`, `--mink`, `--mlime`, `--mline`, `--mrose`, `--msun`, and the Lora/Inter/JetBrains Mono trio is already self-hosted with `.m-serif` and `.m-eyebrow` helpers. The visual system needed to build this exists; only the content pipeline and the routes do not.

Two adjacent gaps surfaced during exploration and are folded in because the blog cannot ship correctly without them. First, marketing subpages have no chrome at all: `src/app/(marketing)/privacy/page.tsx` and `terms/page.tsx` render a bare `<main>` with no header and no footer, so a visitor who lands on them has no navigation and no way back. Adding a blog would make that a three-page problem instead of a two-page one. Second, the repository has no `sitemap.ts` and no `robots.ts` anywhere, so a content surface built to earn organic traffic would launch undiscoverable by the crawlers it exists to attract.

## What Changes

- Add a statically generated blog at `/blog` (index) and `/blog/[slug]` (article), authored as MDX files in `content/blog/` and compiled at build time, with no database, no CMS, and no request-time work.
- Introduce a frontmatter contract (`title`, `excerpt`, `date`, `category`, `cover`, `author`, `tags`, `featured`, `draft`, optional `related`) parsed by a server-only loader that produces the listing index without compiling any MDX body.
- Add a category registry and an author registry as typed configuration, so badge colors and author display names resolve from a key rather than repeated free text.
- Derive reading time and slug rather than authoring them, so neither can drift from the file they describe.
- Add a shared `SiteHeader` for every non-landing marketing page — blog, terms, privacy — carrying `Inicio · Blog · Contacto`, an `Iniciar sesión` link, and the `Crea un wishlist` call to action, on the design's solid `#173E29` bar.
- Reuse the landing page's `MarketingFooter` verbatim on those same pages, newsletter band included, so subpage chrome is identical to the surface it is meant to match.
- Restructure `(marketing)` with a nested `(site)` route group that owns the shared chrome, and move the landing-only `preload()` calls out of the shared layout and down into the landing page so subpages stop preloading a hero image they never render.
- Add a "Blog" entry to the landing navigation (desktop scrollspy nav and mobile drawer) so the blog is reachable and crawlable from the site's highest-traffic page.
- Rename the support contact from `hola@awishfor.com` to `contact@awishfor.com` across code, tests, live specs, and product docs.
- Add `sitemap.ts` and `robots.ts` covering the public marketing surface and every published post, explicitly excluding the `noindex` public wishlist routes.
- Seed six posts in `content/blog/` expanded from the design canvas's own titles and excerpts, so the index and its category filter render against real content rather than an empty state.

## Capabilities

### New Capabilities

- `blog`: Defines the MDX content pipeline, the frontmatter contract, static generation of index and post routes, category filtering, related-post selection, draft handling, and the reading surface.
- `marketing-chrome`: Defines the shared header and footer applied to every non-landing marketing page, and the route-group structure that owns them.
- `search-engine-discovery`: Defines the sitemap and robots policy for the public surface, including which routes are deliberately excluded.

### Modified Capabilities

- `marketing-landing`: The landing navigation gains a "Blog" destination, and the route group's asset preloads move down to the landing page itself.
- `legal-pages`: The support contact address changes, and the terms and privacy pages gain the shared header and footer.

## Impact

- **New runtime dependencies:** `gray-matter` (frontmatter parsing) and `next-mdx-remote` (RSC-compatible MDX compilation). Both are build-and-server-only and must not reach the client bundle. Task 1.1 spikes `next-mdx-remote/rsc` against Next.js 16.2.9 and React 19.2.7 before any implementation depends on it; the change does not assume compatibility.
- **New content directory:** `content/blog/*.mdx`, outside `src/`. `vitest.config.ts` and `biome.jsonc` may need to acknowledge it.
- **New image assets:** cover images move to `public/assets/blog/` and render through `next/image`. The design's hotlinked `images.unsplash.com` URLs are not used in shipped content — `next.config.ts` already allows that host, so no config change is needed either way.
- **Files that move:** `(marketing)/privacy/` and `(marketing)/terms/` relocate into `(marketing)/(site)/`. Route group parentheses add no URL segment, so `/privacy` and `/terms` are unchanged. This is a pure file move, but it touches two routes outside the blog's blast radius.
- **Landing files edited:** `marketing-nav.tsx` (`NAV_ITEMS` gains Blog), `h2b-nav-controller.tsx` (a route destination must be excluded from scrollspy tracking rather than silently never highlighting), `mobile-nav-drawer.tsx` (gains Blog; its hardcoded bare hashes `#como-funciona` and `#ocasiones` become root-relative, which also repairs the root `not-found.tsx` mobile menu where those anchors are dead today), and `(marketing)/layout.tsx` (preloads move out).
- **Contact rename blast radius:** `src/config/contact.ts:1` is the only code change; seven files import the constant and need no edit. Six test assertions hardcode the literal string (`wishlist-footer.test.tsx:51,57,81,84,85` and `marketing-footer.test.tsx:58`) and will fail until updated. `openspec/specs/legal-pages/spec.md:34,46,47,48` is a live spec and must be updated. `docs/PRD.md:1606,1623` and `docs/TASKS.md:2203` follow. Archived changes under `openspec/changes/archive/` are historical record and are left untouched.
- **Operational precondition:** `contact@awishfor.com` must be receiving mail before this ships. It becomes the contact destination in the new header, both footers, the report-list link, and the terms and privacy pages simultaneously — if the mailbox does not exist, every contact affordance in the product breaks at once.
- **Performance:** `/blog` and `/blog/[slug]` are bound by the `web-performance-guardrails` capability. Moving the landing hero preload out of the shared layout is a prerequisite, not an optimization: without it every blog page issues a high-priority fetch for `wedding-hero-mobile-300.jpg`, which it never paints. The only client JavaScript on a post page is the share control; the only client JavaScript on the index is the category filter.
- **No Prisma schema, migration, tRPC router, Clerk configuration, or environment variable is added.** Publishing is a git commit and a deploy.

## Non-Goals

- **No CMS and no database-backed posts.** Content is repository files. Non-technical publishing without a deploy is a separate problem and is not solved here.
- **No category or tag routes.** Category chips filter on the client, matching the design, which draws them as `<span>` rather than links. Indexable `/blog/categoria/[slug]` archives are a real SEO enhancement and a deliberate follow-up.
- **No pagination.** All published posts render on the index; the design's "Cargar más artículos" button is hidden when nothing remains rather than wired to a dead action. Pagination becomes worthwhile somewhere past thirty posts.
- **No RSS feed, no JSON-LD `Article` markup, no comments, no author archive pages, no reading-progress indicator, and no view counts.**
- **No syntax highlighting.** No Shiki, no Prism. A Spanish lifestyle blog ships no code blocks, and the dependency would be pure cost.
- **The newsletter form stays a stub.** `NewsletterForm` acknowledges intent without persisting anything (`newsletter-form.tsx:6-9`), and it ships to blog pages unchanged. Making it real means storage, double opt-in, and a privacy-policy revision — its own change. This is a known and accepted trade: the blog is the surface where a reader is most likely to try it.
- **No contact page.** "Contacto" opens a `mailto:` draft, consistent with what `FooterBody` already does. A form-backed `/contact` route needs validation, an email transport, and spam handling.
- **No dynamic Open Graph image generation.** Post OG images derive from the post's own `cover`, keeping every route prerendered.
