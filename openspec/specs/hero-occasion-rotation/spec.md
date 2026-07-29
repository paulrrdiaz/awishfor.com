# hero-occasion-rotation Specification

## Purpose
TBD - created by archiving change hero-occasion-rotator. Update Purpose after archive.
## Requirements
### Requirement: Shared hero occasion data source

The four hero occasions SHALL be defined once in a single constants module that is the sole source of truth for each occasion's photograph URLs, contrast scrim strength, proof-rail content, and wishlist-card content. No component SHALL hardcode occasion photographs, names, or gift entries.

Each occasion's photograph SHALL be declared as a separate desktop and mobile source so the two crops can differ, and SHALL be expressed as a single replaceable string per crop so a hosted URL can later be swapped for a locally optimized asset without touching any component.

#### Scenario: Single definition drives every consumer

- **WHEN** the hero background stack, the hero proof rail, and the wishlist-card carousel render
- **THEN** all three read their occasion content from the shared constants module
- **AND** changing an occasion's photograph or gift entries in that module changes it in all three places

#### Scenario: Photograph source is swappable in one place

- **WHEN** an occasion's photograph is replaced with a locally hosted optimized asset
- **THEN** only that occasion's `photo.desktop` and `photo.mobile` string values change
- **AND** no component file requires modification

#### Scenario: Four occasions in canvas-first order

- **WHEN** the shared occasion list is read
- **THEN** it contains exactly four occasions: wedding, birthday, baby shower, and housewarming
- **AND** the first entry is the wedding occasion, so the hero's first paint matches the design canvas photograph

### Requirement: Automatic hero photograph rotation

The hero SHALL rotate its background photograph through all four occasions automatically and continuously, looping back to the first occasion after the last. The rotation SHALL expose no visitor controls: no arrows, no dots or indicators, no swipe or drag gesture, no keyboard navigation, and no pause or play affordance.

#### Scenario: Rotation advances without input

- **WHEN** a visitor loads the landing page and takes no action
- **THEN** the hero photograph advances to the next occasion after the hold interval elapses
- **AND** it continues advancing through all four occasions and loops back to the first

#### Scenario: No interactive carousel affordances are rendered

- **WHEN** the hero renders at any viewport
- **THEN** no navigation arrows, position dots, or pause control are present
- **AND** dragging or swiping the hero does not change the displayed occasion

#### Scenario: Rotation is not announced as interactive

- **WHEN** an assistive technology inspects the hero
- **THEN** the rotating background is exposed as decorative
- **AND** no carousel, tablist, or live-region semantics are present

### Requirement: Premium hero motion treatment

Occasion transitions SHALL use an opacity crossfade rather than a slide or cut, and each photograph SHALL carry a slow continuous scale-and-drift motion for the duration it is on screen. The motion direction SHALL alternate between consecutive occasions so the loop does not read as a repeating pulse. Animation SHALL be driven only through compositor-friendly `transform` and `opacity` properties.

#### Scenario: Occasions crossfade

- **WHEN** the hero advances from one occasion to the next
- **THEN** the outgoing photograph fades out while the incoming photograph fades in over the same interval
- **AND** neither photograph slides, cuts, or jumps position

#### Scenario: Continuous slow motion while displayed

- **WHEN** an occasion photograph is the active slide
- **THEN** it scales and drifts slowly and continuously for the whole time it is displayed
- **AND** the next occasion's motion runs in the opposite direction from the previous one

#### Scenario: Animation avoids layout and paint work

- **WHEN** the rotation is running
- **THEN** only `transform` and `opacity` are animated
- **AND** no animated property triggers layout or repaint per frame

### Requirement: Proof rail stays synchronized with the photograph

The hero proof rail SHALL display the occasion matching the photograph currently on screen, and both SHALL be driven from a single timing source so they can never disagree. When the photograph shows a wedding, the rail SHALL show the wedding example; when it shows a baby shower, the rail SHALL show the baby-shower example.

#### Scenario: Rail matches the active photograph

- **WHEN** the hero photograph is showing any occasion
- **THEN** the proof rail shows that same occasion's example name, event label, and gift entries

#### Scenario: Single clock prevents drift

- **WHEN** the rotation has been running through several full loops
- **THEN** the photograph and the rail are still showing the same occasion
- **AND** neither maintains an independent timer

#### Scenario: Rail transition matches the photograph transition

- **WHEN** the hero advances to the next occasion
- **THEN** the rail content transitions in the same interval as the photograph crossfade

### Requirement: Inactive occasion variants are hidden from assistive technology

All four occasions' proof-rail variants SHALL be present in the server-rendered HTML, but only the active variant SHALL be exposed to assistive technology and to the keyboard focus order. Inactive variants SHALL be marked both non-interactive and hidden from the accessibility tree, and this state SHALL be updated whenever the active occasion changes.

#### Scenario: One rail is announced

- **WHEN** a screen-reader user reaches the hero
- **THEN** exactly one proof rail is announced

#### Scenario: One focusable link in the rail

- **WHEN** a keyboard user tabs through the hero
- **THEN** the proof rail contributes exactly one focus stop, belonging to the active occasion

#### Scenario: Hidden state follows the rotation

- **WHEN** the hero advances to the next occasion
- **THEN** the newly active rail becomes focusable and exposed
- **AND** the previously active rail becomes non-interactive and hidden from the accessibility tree

### Requirement: Per-occasion contrast compensation

Each occasion SHALL declare its own contrast scrim strength as data alongside its photograph, and the hero SHALL apply the active occasion's strength to the overlay gradients. Hero headline, body, and trust-line text SHALL remain legible over every occasion photograph.

#### Scenario: Bright photographs receive a stronger scrim

- **WHEN** an occasion whose photograph is bright or high-key is the active slide
- **THEN** the hero applies that occasion's declared stronger scrim strength
- **AND** the white headline remains legible against the photograph

#### Scenario: Dark photographs are not over-darkened

- **WHEN** an occasion whose photograph is already dark behind the copy is the active slide
- **THEN** the hero applies that occasion's lighter scrim strength rather than a single global maximum

#### Scenario: Overlay structure is preserved

- **WHEN** the scrim strength changes between occasions
- **THEN** the horizontal, vertical, and header overlay gradients retain their exported structure and direction
- **AND** only their opacity stops vary

### Requirement: Rotation pauses when not being viewed

The rotation SHALL pause when the hero is not visible to the visitor and resume when it becomes visible again, so that a background tab or a scrolled-past hero performs no continuous animation work.

#### Scenario: Hidden tab pauses rotation

- **WHEN** the visitor switches to another browser tab
- **THEN** the rotation timeline pauses
- **AND** it resumes from its paused position when the tab becomes visible again

#### Scenario: Scrolled-away hero pauses rotation

- **WHEN** the visitor scrolls the hero out of the viewport
- **THEN** the rotation timeline pauses
- **AND** it resumes when the hero scrolls back into view

### Requirement: Rotation degrades to the canvas photograph

Under `prefers-reduced-motion: reduce`, or when JavaScript does not run, the hero SHALL render the first occasion as a static photograph with the full copy block, CTAs, trust line, and proof rail visible and correct. No occasion SHALL be skipped in a way that leaves the hero blank, and no content SHALL depend on the rotation having started.

#### Scenario: Reduced motion shows a static hero

- **WHEN** the visitor has `prefers-reduced-motion: reduce` set
- **THEN** the photograph does not rotate, crossfade, scale, or drift
- **AND** the first occasion's photograph and matching proof rail are displayed

#### Scenario: No JavaScript shows a static hero

- **WHEN** JavaScript is unavailable or fails to load
- **THEN** the first occasion's photograph is visible with the correct scrim
- **AND** the hero copy, CTAs, trust line, and first occasion's proof rail are all present and readable

#### Scenario: Fallback matches the established first fold

- **WHEN** the hero renders in either fallback state at `lg` or above
- **THEN** its appearance matches the H2b first fold as specified by the design canvas

### Requirement: Rotation preserves a single LCP image candidate

Although four photographs are present in the hero, only the first occasion's photograph SHALL be loaded at high priority. Remaining photographs SHALL be requested at low priority so they cannot compete with the first for bandwidth, and the rotation SHALL NOT begin before the page has finished loading. Hero photographs SHALL be served through the framework image optimizer rather than bypassing it.

#### Scenario: Only the first photograph is prioritized

- **WHEN** the landing page loads
- **THEN** the first occasion's photograph is requested with high priority
- **AND** the other three occasions' photographs are requested at low priority

#### Scenario: Rotation waits for load

- **WHEN** the page is still loading
- **THEN** the rotation has not started
- **AND** it begins only after the load event

#### Scenario: Optimized formats are served

- **WHEN** a hero photograph is requested by a browser that supports modern image formats
- **THEN** it is served in an optimized format at a width appropriate to the viewport
- **AND** the hero images do not bypass the framework image optimizer

#### Scenario: Mobile receives mobile crops

- **WHEN** the hero renders below the `lg` breakpoint
- **THEN** each occasion's mobile photograph source is used rather than the desktop crop

