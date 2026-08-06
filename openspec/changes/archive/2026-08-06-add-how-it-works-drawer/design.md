## Context

The public wishlist has nine hero layouts but one shared CTA component. Today `HeroCtas` renders “Cómo funciona” as an `href="#como-funciona"`, while `HowItWorks` is mounted near the bottom by `PublicWishlistBody`; `collage-staggered` duplicates that lower-page composition because it has a bespoke body. This makes the explanation easy to miss, produces a dead link when `showHowItWorks` is false, and forces a guest away from the decision point in the hero.

The repository already includes `src/components/ui/drawer.tsx`, backed by Vaul, and no additional package is required. Public theme variables are applied inline to `.public-theme`. Vaul portals default to `body`, so a drawer portalled without an explicit container would inherit the app/root palette instead of the active wishlist palette—especially visible in owner previews and pages with non-default themes.

The approved reference is a bottom-anchored sheet at mobile and desktop widths: dimmed backdrop, centered narrow content on wider screens, drag handle, close button, serif title, three numbered instruction rows, and a full-width “Entendido” action.

## Goals / Non-Goals

**Goals:**

- Open the guest instructions from the shared hero “Cómo funciona” control without scrolling the page.
- Apply the same interaction and content to all nine public wishlist layouts.
- Preserve `showHowItWorks` as the single availability flag.
- Keep drawer colors, typography, focus treatment, and controls inside the active public theme.
- Provide accessible modal behavior and motion-aware dismissal using the existing ShadCN/Vaul primitive.
- Remove duplicated inline how-it-works rendering and its obsolete anchor target.

**Non-Goals:**

- Change the marketing landing page’s separate process section.
- Change purchase flows, gift data, routes, persistence, APIs, or configuration schemas.
- Introduce customizable instruction copy or localization work.
- Make the drawer responsive into a centered dialog on desktop; the reference remains a bottom drawer at every width.
- Rework public themes, hero layouts, or the host-selected button-style system.

## Decisions

### D1 — Compose one shared drawer through `HeroCtas`

`HowItWorks` becomes a client-side drawer component responsible for its trigger-adjacent content and interaction. `HeroCtas` composes it beside the existing gift anchor and receives `showHowItWorks` from each layout’s wishlist view model. All nine layout call sites pass the flag explicitly; making the prop required prevents a future layout from silently rendering a dead or unconditional control.

The existing primary gift CTA remains a scoped hash link with reduced-motion-aware scrolling. Only the secondary how-it-works control changes from an anchor to `DrawerTrigger asChild` around a real button, preserving the layout-specific class overrides and `on-photo` treatment.

*Alternative considered:* mount one controlled drawer in `PublicWishlistPage` and expose it through React context. Rejected because there is only one trigger group per rendered layout, while context adds provider/state indirection and complicates pages that render multiple independent public previews.

*Alternative considered:* implement a drawer independently in each layout. Rejected because it duplicates state, accessibility behavior, copy, and future maintenance nine times.

### D2 — Remove the inline section from page composition

`PublicWishlistBody` no longer imports or renders `HowItWorks`, and `collage-staggered` removes its bespoke inline mount. The ordered document flow becomes hero → event details → countdown → welcome message → gifts → thank-you/footer. The how-it-works guidance is modal content reachable from the hero, not a document section or hash target.

When `showHowItWorks` is false, `HeroCtas` omits the trigger and does not mount drawer content. This fixes the current dead `#como-funciona` link while preserving the setting’s intent.

*Alternative considered:* keep the inline section as a second access point. Rejected because it duplicates the same content, leaves obsolete page length, and weakens the new drawer as the single interaction model.

### D3 — Use the ShadCN/Vaul drawer at every breakpoint

The shared component uses the existing `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`, and `DrawerClose` wrappers. Content is full-width on narrow screens and capped at approximately 430–480 px, centered at the bottom on wider screens. The sheet keeps rounded top corners, a visible drag handle, and enough bottom padding for safe-area devices.

Vaul supplies focus trapping, focus restoration, Escape dismissal, outside-click dismissal, body scroll locking, and swipe-to-close. Motion is owned by the primitive and must respect reduced-motion preferences through its existing behavior/CSS; no parallel animation system is added.

The ShadCN drawer wrapper gains only reusable presentation hooks needed by this instance: a `DrawerHandle` export and a per-instance overlay class hook. Existing defaults remain backward compatible.

*Alternative considered:* use `Dialog` at desktop widths and `Drawer` on mobile. Rejected because the reference explicitly retains a bottom sheet on desktop, and two primitives would split interaction behavior and test coverage.

### D4 — Portal into the active public-theme container

The CTA/drawer component resolves its nearest `.public-theme` element and supplies that element through Vaul’s supported `container` prop. The drawer is closed until the component has mounted, so the theme-local container is available before content is portalled. This preserves semantic utilities such as `bg-popover`, `text-popover-foreground`, `border-border`, `bg-foreground`, and `text-background` for each wishlist instance, including multiple differently themed previews on one screen.

*Alternative considered:* mirror computed CSS values onto `body` while open. Rejected because it mutates global state, races when multiple previews exist, and can leak theme values into dashboard chrome.

*Alternative considered:* hardcode Cielo colors in the drawer. Rejected because the feature must work across all seven themes and all templates.

### D5 — Match the reference with theme-semantic styling

The drawer surface uses the active card/popover pair, borders and handle use theme borders, and supporting copy uses muted foreground. Number circles and the “Entendido” action use the theme ink (`foreground`) with the theme background as contrast, matching the dark decisive controls in the reference without adding an unrelated color. The hero trigger continues to honor the selected public button style and any layout-specific CTA overrides; the drawer’s closing action remains a consistent rounded pill.

The Spanish content is:

1. **Elige un regalo** — “Explora la lista y elige el regalo que quieres dar.”
2. **Márcalo como regalado** — “Haz clic en el botón y confirma tu regalo.”
3. **¡Listo!** — “Queda reservado para que nadie más lo repita — el anfitrión también lo verá.”

`DrawerTitle` exposes “¿Cómo funciona?” as the accessible name. A visually hidden `DrawerDescription` summarizes the purpose so the primitive has a complete accessible description.

### D6 — Render-mode behavior stays intentional

Full and owner-preview modes expose the trigger when `showHowItWorks` is true; the drawer is informational and does not enable any purchase action in preview mode. Compact mode continues to omit hero CTAs and therefore does not mount the drawer, keeping landing embeds trimmed and non-interactive.

### D7 — Validate behavior at shared and integration boundaries

Component tests cover conditional trigger visibility, button semantics, open content, exact three-step copy, close action, and the existing scoped gift scroll. A theme-containment regression renders multiple `.public-theme` instances and asserts the opened drawer portal belongs to the triggering theme container. Public-page/layout coverage verifies all nine layout renderers pass `showHowItWorks`, no `#como-funciona` target remains, preview mode can open the informational drawer, and compact mode omits it.

Visual browser verification covers Cielo and one contrasting theme at mobile and desktop widths, including overlay strength, safe-area spacing, focus visibility, swipe/close behavior, and restoration of focus to the trigger.

## Risks / Trade-offs

- **Theme variables can be lost through the portal** → Require a nearest-`.public-theme` container and test DOM containment with two differently themed instances.
- **Required prop touches all nine layout files** → Treat the compile-time churn as intentional coverage; TypeScript identifies any missed layout.
- **Vaul interaction can be brittle in jsdom** → Keep unit assertions focused on observable roles/state and supplement with browser verification for swipe, focus, and animation behavior.
- **Removing the inline section changes page length and old fragment links** → No external route contract promises `#como-funciona`; the visible hero control remains and becomes more immediate. Rollback restores the shared section mounts and hash link.
- **Owner preview is interactive while guest actions are disabled** → The drawer is informational only, so previewing it is useful and cannot mutate data.

## Migration Plan

1. Extend the drawer wrapper without changing its existing defaults.
2. Convert the shared how-it-works component to the drawer composition and add focused tests.
3. Update `HeroCtas` and all nine layout call sites to pass `showHowItWorks`.
4. Remove inline mounts from the shared body and collage body.
5. Run unit tests, Biome, typecheck, and mobile/desktop browser checks across at least two themes and representative shared/bespoke layouts.

No data migration or deployment sequencing is required. Rollback is a source revert: restore the hash link and inline section mounts.

## Open Questions

None. The supplied reference and existing setting define the interaction, copy, layout, and visibility behavior sufficiently for implementation.
