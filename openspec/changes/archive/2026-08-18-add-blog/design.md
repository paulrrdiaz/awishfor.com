## Context

Two finished design screens (`Blog Page.dc.html`, `Blog Post Page.dc.html`) need to become two static routes, plus shared chrome for every non-landing marketing page. The visual system already exists in `src/styles/marketing.css`; what does not exist is a content pipeline, a route structure that can host shared chrome, or any search-engine discovery.

Every decision below was resolved during exploration. Where the design canvas and the instruction "follow the current landing page look and feel" conflicted, the landing page won and the divergence is recorded.

## Route and layout structure

```
src/app/
  layout.tsx                      html/body, globals.css
  not-found.tsx                   MarketingNav (default variant)
  (marketing)/
    layout.tsx                    .marketing-theme + AccountLinkEnhancement
    page.tsx                      landing — preload() calls live HERE now
    (site)/
      layout.tsx                  <SiteHeader/> {children} <MarketingFooter/>
      privacy/page.tsx            moved from (marketing)/privacy/
      terms/page.tsx              moved from (marketing)/terms/
      blog/
        layout.tsx                blog-only concerns; inherits chrome
        page.tsx                  index
        [slug]/page.tsx           article — generateStaticParams
content/blog/*.mdx
```

`(site)` is a route group, so it adds no URL segment: `/privacy`, `/terms`, and `/blog` are unchanged.

**Why a nested group rather than the alternatives.** Putting the header in `(marketing)/layout.tsx` would give the landing page two navigations, because the landing renders its own `h2b` nav from inside `page.tsx`. Putting it in `blog/layout.tsx` alone would leave terms and privacy bare, which is the problem being fixed. A nested group writes the chrome once, applies it to exactly the right set of routes, and still leaves the blog its own layout for blog-specific concerns.

**Why the preloads must move.** `(marketing)/layout.tsx:21` currently calls `preload("/assets/hero/wedding-hero-mobile-300.jpg", { fetchPriority: "high" })` plus two font preloads. Any route inside that group inherits them. A blog page would issue a high-priority fetch for a hero image it never paints — a direct regression against the `web-performance-guardrails` LCP budget. `preload()` from `react-dom` is valid in a page component, so the calls move down into `(marketing)/page.tsx` unchanged.

## Content pipeline

```
content/blog/*.mdx
  ├── frontmatter ──→ gray-matter
  └── body ─────────→ next-mdx-remote/rsc  (post route only)
                              │
        ┌─────────────────────┴───────────────────┐
        │  src/server/blog/  (server-only module) │
        │   readdir → parse fm → validate         │
        │   → drop drafts in prod                 │
        │   → derive slug from filename           │
        │   → derive readingTime from wordcount   │
        │   → sort by date desc                   │
        └─────────────────────────────────────────┘
                    │                    │
              getAllPosts()         getPostBySlug()
                    │                    │
              /blog (index)        /blog/[slug]
              metadata only        generateStaticParams()
              NO MDX compiled      + compile body in RSC
```

The index never compiles MDX. It reads frontmatter only, so listing cost stays flat as the body length grows.

**Chosen: `gray-matter` + `next-mdx-remote/rsc`.** Lowest-magic shape that satisfies MDX + SSG — no extra build step, no watcher, no generated artifacts to keep in sync or gitignore.

Rejected alternatives:

| Option | Why not |
|---|---|
| `@next/mdx` alone | Gives MDX-as-route but produces no frontmatter index, so it cannot build the listing page at all. Insufficient on its own. |
| Velite | Genuinely good — Zod-validated frontmatter, typed output. Costs a build step and a watcher process. Worth revisiting if non-engineers start authoring and frontmatter typos need to fail the build; overkill for six repo-authored posts. |
| Contentlayer | Unmaintained, with known breakage on Next.js 15 and later. Not viable. |

**Compatibility is spiked, not assumed.** `next-mdx-remote` declares `react: >=16` and nothing about Next. Task 1.1 verifies the `/rsc` entrypoint compiles and renders inside a React Server Component on Next.js 16.2.9 / React 19.2.7 before anything is built on it. If it fails, the fallback is `@mdx-js/mdx`'s `compile`/`run` directly, which is what `next-mdx-remote/rsc` wraps.

## Frontmatter contract

```yaml
title:     "La guía definitiva para organizar un baby shower sin estrés"
excerpt:   "Desde el tema hasta la lista de regalos: un plan paso a paso…"
date:      2026-08-14
category:  planeacion          # key into the category registry
cover:     /assets/blog/baby-shower.jpg   # OPTIONAL
author:    valentina           # key into the author registry
tags:      [Baby shower, Planeación, Anfitriones]
featured:  true
draft:     false
related:   []                  # OPTIONAL manual override
```

**Derived, never authored.** `slug` comes from the filename, so the file and its identity cannot diverge. `readingTime` is computed from body wordcount at build — authors reliably forget to update it after an edit, and a stale "7 MIN" on a two-minute post is worse than showing nothing. Author display name and avatar initial resolve from the author key.

**`cover` is optional.** `Blog Post Page.dc.html` proves this: the third "Sigue leyendo" card has no image and renders a `#173E29` block with a 🔗 glyph instead. That fallback is part of the design, not an oversight, and applies anywhere a cover is absent.

**`featured` exists because the index layout requires exactly one hero post.** Deriving it as "newest wins" would take editorial control away and silently reshuffle the hero on every publish.

**`draft: true`** is excluded from the production build and visible in development, so work in progress can be committed without publishing.

Validation is a hand-written parser with explicit errors, not a schema library. It runs at build time; a malformed post should fail the build loudly and name the file.

## Registries

Categories carry design-assigned badge colors, so they are typed configuration rather than free strings — an unmapped free-text value would silently render an unstyled badge.

```ts
// src/config/blog-categories.ts
planeacion  "Planeación de eventos"   bg #7FB069  fg #ffffff
guias       "Guías de regalos"        bg #BCE25A  fg #1B3A12
producto    "Producto"                bg #F4C84A  fg #4A3800
```

This mirrors the existing `hero-occasions.ts` pattern.

*Design inconsistency, resolved:* the featured card badges `PLANEACIÓN DE EVENTOS` while small cards badge only `PLANEACIÓN`. The full label is used everywhere; the truncation reads as a space-saving hack rather than intent.

Authors are a parallel registry (`src/config/blog-authors.ts`) mapping a key to display name and avatar initial, so "Valentina Ríos" / "V" is not retyped per post.

## Reading surface

The design canvas puts the post page on `#FDFCF8`, a warm off-white that is not in the token set. The instruction to follow the landing look and feel takes precedence, but `#EEF9E6` is a saturated tint intended for short marketing bursts, not a seven-minute read.

**Resolution:** page background stays `#EEF9E6`, and the article column floats on a white card — `background:#fff; border:1px solid var(--mline); border-radius:16px`. That is precisely the existing `.mcard` primitive used by every index card and every landing card. The palette is the landing's, the reading surface is paper-white, and nothing new is invented.

Body text uses the design's `#3A3F35` on that white card, where it was tuned to sit.

## Prose styles

`.m-prose`, scoped in `marketing.css`, transcribed from the design — matching how every other marketing style in this repo was built. No typography plugin.

The design only demonstrates `p`, `h3`, and `blockquote`. Real posts need more, extended along the same visual logic:

| Element | Treatment |
|---|---|
| `p` | 16px / 1.85, `#3A3F35` |
| `h2` | Lora 28px, `--mink`, margin 44px 0 16px |
| `h3` | Lora 24px, `--mink`, margin 36px 0 14px — from design |
| `blockquote` | 3px `--mlime` left border, Lora italic 20px, `--mink` — from design |
| `ul` / `ol` | 1.85 leading, `--mmut` markers |
| `a` | `--mink`, lime underline, thickens on hover |
| `img` | full column width, radius 14px, matching the hero image |

## Related posts ("Sigue leyendo")

The design draws three cards and does not say how they are chosen. At six posts, naive rules degrade badly.

**Rule:** same category → newest first → exclude self → backfill from newest overall until three. If frontmatter declares `related: [...]`, that wins outright.

Rejected: "newest 3 excluding self" — with six posts, five of them would show an identical rail. Tag-overlap scoring is the right long-term answer but needs a tag vocabulary that does not exist yet. Manual-only is correct per post and unmaintainable across a growing archive.

Backfilled posts may lack a cover, which is exactly the fallback treatment the design already drew.

## Chrome

```
SiteHeader — #173E29 solid, static (not fixed), padding 20px 44px

◆ A Wish For      Inicio · Blog · Contacto      Iniciar sesión   [ Crea un wishlist ]
  isotype 26px    mono 11px, .12em tracking     data-marketing-   → /create
  Lora 18px #fff  rgba(255,255,255,.75)         account-link      #BCE25A pill
                  active: 2px #BCE25A underline → /sign-in
```

`Contacto` opens `mailto:contact@awishfor.com`, consistent with what `FooterBody` already does. `Iniciar sesión` carries `data-marketing-account-link`, so the existing `AccountLinkEnhancement` in `(marketing)/layout.tsx` swaps it to "Dashboard" after hydration without pulling Clerk into the bundle. All destinations are real routes, so the off-route anchor problem does not arise in this header.

**This must be a new component, not an edit to `DefaultMarketingNav`.** That component is shared: root `not-found.tsx:9` renders it, and `MarketingNav variant="h2b"` uses it as the landing's own mobile navigation (`marketing-nav.tsx:98`). Restyling it to the dark bar would change both.

**Footer: the full `MarketingFooter`, newsletter band included.** The design draws a slimmer strip, but the instruction is consistency with the landing, and `MarketingFooter` *is* the landing footer. Splitting off the band would make subpage chrome visibly differ from the page it is meant to match. The accepted cost is that `NewsletterForm` — a stub that persists nothing — ships to the blog, the surface where a reader is most likely to use it. Recorded as a known trade in the proposal's non-goals.

## Landing navigation

`NAV_ITEMS` in `marketing-nav.tsx:11-14` gains a Blog entry pointing at `/blog`. Without it the link graph is one-directional: the header links back to `/`, but `/` never links forward, so the blog earns no internal link equity from the site's highest-traffic page and visitors cannot discover it exists.

Two consequences:

1. `H2bNavController` is a scrollspy keyed on an `id` matching an on-page section. A route destination has no section to observe, so it must be explicitly excluded from tracking rather than left to never highlight.
2. `MobileNavDrawer` hardcodes its own link list (`mobile-nav-drawer.tsx:74-95`) with bare hashes `#como-funciona` and `#ocasiones`. It gains Blog, and those hashes become root-relative. That also repairs an existing defect: the drawer renders on root `not-found.tsx`, where bare hashes resolve against `/404` and go nowhere today.

## Search-engine discovery

Neither `sitemap.ts` nor `robots.ts` exists anywhere in the repository. Both are added at `src/app/`.

The sitemap covers `/`, `/create`, `/blog`, every published post, `/terms`, and `/privacy`. It **excludes** `/w/[slug]` public wishlists — those are `noindex` by deliberate design — and all `/dashboard`, `(auth)`, and `/api` routes. Draft posts are absent because they are absent from the build.

`robots.ts` allows the public surface, disallows `/dashboard`, `/api`, and the auth routes, and points at the sitemap.

## Responsive behaviour

The design canvas draws both blog screens at desktop width only — `padding: 20px 44px`, `grid-template-columns: repeat(3,1fr)`, `1.1fr 1fr` on the featured card, and a fixed `680px` reading column. None of that survives a 390px viewport, and the canvas offers no mobile frame to transcribe.

This is not optional polish. `web-performance-guardrails` gates on the **mobile** Lighthouse profile (median ≥95, no run below 90), so mobile is the profile these routes are judged on. The adaptations follow what `marketing-landing` already does at its own breakpoints:

| Surface | Desktop | Below breakpoint |
|---|---|---|
| Index grid | 3 columns | 2 → 1 column |
| Featured card | `1.1fr 1fr` side by side | image stacked above text |
| Filter chips | single row | wrap, minimum touch target |
| Reading column | fixed `680px` | fluid max-width within gutters |
| "Sigue leyendo" | 3 columns | reflow to fewer |
| Share control | inline tag | minimum touch target |

No blog surface may scroll horizontally at the smallest supported width.

## Date formats

The canvas uses two forms for the same value: `14 AGO 2026` in monospace uppercase on index cards, and `14 ago 2026` lowercase in the post meta line. Both derive from the post's `date` frontmatter through `src/lib/format/dates.ts` rather than being authored as strings, so a post's date cannot disagree with itself across surfaces.

## Client JavaScript budget

Only two client components are introduced:

- **Category filter** (index) — chips filter an already-loaded list. The design draws them as `<span>`, not links, which is a client filter at face value. Indexable category routes are a deliberate follow-up.
- **Share control** (post) — Web Share API with a clipboard fallback.

`MarketingFooter` brings `NewsletterForm`, already client. Nothing else on either route hydrates.

## Validation

- Unit tests for the loader: frontmatter parsing, draft exclusion under production, slug derivation, reading-time computation, date sorting, related-post selection including the backfill path, and a malformed post failing loudly.
- Unit tests for the category and author registries, including unmapped-key behavior.
- Component tests for `SiteHeader` (link destinations, `data-marketing-account-link` presence, active state) and the category filter.
- Updated assertions in `wishlist-footer.test.tsx` and `marketing-footer.test.tsx` for the contact rename.
- A production build must classify `/blog` and every `/blog/[slug]` as static or prerendered.
- `pnpm audit:marketing` re-run to confirm the preload move did not regress the landing, since `(marketing)/layout.tsx` is on the landing's critical path.
- `pnpm check`, `pnpm test`, and `pnpm typecheck` before the apply session closes.
