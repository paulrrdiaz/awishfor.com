## ADDED Requirements

### Requirement: Scroll-linked section parallax

The landing SHALL provide scroll-linked parallax and rise motion on the occasion picker, how-it-works, example preview, and guest finder sections. This motion SHALL be expressed with CSS scroll-driven animations rather than an animation runtime, SHALL add no JavaScript to the route payload, and SHALL NOT convert any server component into a client component. Motion SHALL animate only `transform` and `opacity`. Every parallaxed image SHALL be clipped by an ancestor so translation never reveals an edge or gap. No section above the fold SHALL carry scroll-linked motion.

#### Scenario: Named sections move with scroll

- **WHEN** a visitor scrolls the occasion picker, how-it-works, example preview, or guest finder section through the viewport with motion allowed and the browser supports scroll-driven animations
- **THEN** the section's designated images or content move in proportion to its scroll progress through the viewport
- **AND** only `transform` and `opacity` change
- **AND** no additional JavaScript is requested to produce the motion

#### Scenario: Motion is scroll-linked, never ambient

- **WHEN** the visitor stops scrolling at any position
- **THEN** all section motion is stationary
- **AND** no animation continues to run or repaint while scroll position is unchanged

#### Scenario: Parallax translation stays clipped

- **WHEN** a parallaxed image reaches either extreme of its travel at any supported viewport width
- **THEN** its container remains fully covered
- **AND** no edge, gap, or background shows through

#### Scenario: Server components are preserved

- **WHEN** the occasion picker, how-it-works, and example preview sections render
- **THEN** each remains a server component
- **AND** no additional data is serialized into the client payload to support motion

#### Scenario: Above-the-fold content is excluded

- **WHEN** the landing loads
- **THEN** the navigation, hero, and first fold carry no scroll-linked motion
- **AND** the largest contentful paint element is never animated from a hidden or offset state

#### Scenario: Unsupported browsers receive the static page

- **WHEN** a browser without `animation-timeline` support renders the landing
- **THEN** every section displays in its final static position
- **AND** the page is visually identical to the pre-parallax layout

#### Scenario: Reduced motion disables section parallax

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** no section parallax or rise motion plays at any viewport width
- **AND** all content displays in its final static position

#### Scenario: Parallax holds the performance budget

- **WHEN** the production marketing audit runs after section motion is applied
- **THEN** the route JavaScript payload is unchanged from its pre-parallax measurement
- **AND** cumulative layout shift remains at zero
- **AND** the median mobile performance score, largest contentful paint, and route CSS budget all remain within their thresholds

## MODIFIED Requirements

### Requirement: Targeted hero and header motion with reduced-motion fallback

The landing SHALL preserve the required H2b header state and scroll-progress indicator and the required activity-gated hero rotation. GSAP MAY be used only for the hero and header when it provides these required behaviors; other marketing motion is optional and SHALL use CSS or small browser APIs rather than broad animation-runtime expansion. Scroll-linked section motion SHALL use CSS scroll-driven animations and SHALL NOT introduce an animation runtime. Motion SHALL use compositor-friendly transform and opacity changes, SHALL initialize only when its target approaches the viewport or the visitor activates the hero, and SHALL stop when hidden. Decorative infinite paint effects SHALL be replaced by static, hover/focus, scroll-linked, or finite treatments. All content SHALL remain visible when JavaScript is unavailable, and non-structural motion SHALL be disabled when reduced motion is preferred.

#### Scenario: H2b header state follows scroll

- **WHEN** a desktop visitor crosses the H2b header trigger in either direction
- **THEN** the corresponding top or compact navigation state is applied
- **AND** the header exposes a visible progress indicator that advances with document scroll
- **AND** any GSAP use remains confined to the header implementation

#### Scenario: Scroll reveals enhance visible content

- **WHEN** a reveal target approaches the viewport with motion allowed
- **THEN** it animates through transform and opacity
- **AND** content is visible by default before enhancement is registered

#### Scenario: Hero rotation is activated lazily

- **WHEN** the landing has loaded, motion is allowed, the hero is visible, and the visitor provides a meaningful activity signal
- **THEN** the hero rotation controller starts
- **AND** it was not running during idle first paint
- **AND** any GSAP use remains confined to the hero implementation

#### Scenario: Paint-heavy loops are absent

- **WHEN** the landing animations initialize
- **THEN** no continuous box-shadow, filter, gradient, mesh-drift, bob, pulse, spin, or headline-shimmer loop runs
- **AND** any marquee or decorative transform loop pauses while outside the viewport
- **AND** scroll-linked section motion does not run while scroll position is unchanged

#### Scenario: Reduced motion disables animation

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** decorative animations do not play
- **AND** the hero photograph does not rotate
- **AND** scroll-linked section parallax does not play
- **AND** the structural H2b header state still changes without an animated transition

#### Scenario: No layout shift or content gating

- **WHEN** JavaScript is disabled or an enhancement fails to load
- **THEN** all landing content remains visible and readable
- **AND** the hero shows its first occasion photograph, copy, trust line, and proof rail
- **AND** the H2b top header scrolls away with the first fold instead of remaining transparent over later content
- **AND** scroll-linked section motion continues to function, because it requires no JavaScript

### Requirement: Decorative animation gating on small viewports

The landing SHALL carry no ambient decorative motion loops. Permitted non-hero marketing animation is limited to a compositor-only glow on primary lime calls to action and scroll-linked section motion on the occasion picker, how-it-works, example preview, and guest finder sections. Scroll-linked motion SHALL be driven by scroll position only and SHALL NOT run while the visitor is stationary. Hero occasion rotation SHALL remain subject to visitor activity, visibility, page lifecycle, and reduced-motion conditions.

#### Scenario: Ambient effects are absent

- **WHEN** the landing renders at any viewport with motion allowed
- **THEN** no floating blob, floating emoji, or time-driven decorative timeline runs
- **AND** the hero remains static until the visitor activity condition is satisfied

#### Scenario: Scroll-linked motion is permitted but bounded

- **WHEN** a visitor scrolls through a section carrying scroll-linked motion
- **THEN** its motion advances only in proportion to scroll progress
- **AND** the motion is confined to the occasion picker, how-it-works, example preview, and guest finder sections

#### Scenario: CTA glow is compositor-only

- **WHEN** a primary lime call to action renders with motion allowed
- **THEN** its glow animates only properties that do not trigger layout or repaint of surrounding content

#### Scenario: Reduced motion still wins

- **WHEN** `prefers-reduced-motion: reduce` is set at any viewport width
- **THEN** no non-structural marketing animations play, including the call-to-action glow and scroll-linked section motion

#### Scenario: No orphaned motion hooks remain

- **WHEN** the marketing markup is inspected
- **THEN** no animation hook attribute or motion class is present without a stylesheet rule or controller that consumes it
