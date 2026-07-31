## MODIFIED Requirements

### Requirement: Automatic hero photograph rotation

The hero SHALL rotate its background photograph through all four occasions continuously only after the production page has loaded, the hero is visible, motion is allowed, and the visitor has provided a meaningful activity signal such as scrolling, pointer interaction, touch interaction, or keyboard input. Until that signal, the first occasion SHALL remain static. The rotation SHALL expose no visitor controls: no arrows, no dots or indicators, no swipe or drag gesture, no keyboard navigation, and no pause or play affordance.

#### Scenario: Idle first paint remains static

- **WHEN** a visitor loads the landing page and takes no action
- **THEN** the first occasion remains displayed
- **AND** no rotation timer or photograph motion starts

#### Scenario: Rotation advances after visitor activity

- **WHEN** the page has loaded, the hero is visible, motion is allowed, and the visitor first scrolls, presses a key, touches, or uses a pointer
- **THEN** the rotation timer starts after the configured hold interval
- **AND** it advances through all four occasions and loops back to the first

#### Scenario: No interactive carousel affordances are rendered

- **WHEN** the hero renders at any viewport
- **THEN** no navigation arrows, position dots, or pause control are present
- **AND** dragging or swiping the hero does not directly change the displayed occasion

#### Scenario: Rotation is not announced as interactive

- **WHEN** an assistive technology inspects the hero
- **THEN** the rotating background is exposed as decorative
- **AND** no carousel, tablist, or live-region semantics are present

### Requirement: Inactive occasion variants are hidden from assistive technology

The server-rendered hero SHALL contain one proof rail for the first occasion. After enhancement begins, the hero SHALL keep exactly one proof rail exposed to assistive technology and the keyboard at a time; implementations MAY replace the active rail in place or briefly retain an outgoing presentation-only rail during a visual crossfade. Inactive occasion data SHALL NOT create duplicate focus stops or repeated accessible content.

#### Scenario: Initial HTML contains one rail

- **WHEN** the server-rendered landing HTML is inspected before hydration
- **THEN** it contains the first occasion's proof rail
- **AND** it does not contain four repeated interactive proof rails

#### Scenario: One rail is announced

- **WHEN** a screen-reader user reaches the enhanced hero
- **THEN** exactly one proof rail is announced

#### Scenario: One focusable link in the rail

- **WHEN** a keyboard user tabs through the hero
- **THEN** the proof rail contributes exactly one focus stop belonging to the active occasion

#### Scenario: Accessible content follows the rotation

- **WHEN** the hero advances to the next occasion
- **THEN** the new occasion's rail becomes the only exposed and focusable rail
- **AND** any outgoing rail retained for a crossfade is non-interactive and hidden from the accessibility tree

### Requirement: Rotation preserves a single LCP image candidate

The server-rendered hero SHALL include only the first occasion photograph as one optimized local `next/image` request candidate. That photograph SHALL be the sole high-priority content image. Future occasion photographs SHALL not enter the document or preload queue until visitor activity enables rotation, after which the implementation SHALL keep no more than the active and imminent photographs mounted. All hero photographs SHALL be served through the framework image optimizer or from equivalently optimized local assets.

#### Scenario: Only the first photograph is initially requestable

- **WHEN** the landing page loads without visitor input
- **THEN** the first occasion's photograph is the only hero photograph requested
- **AND** it is the only hero photograph marked high priority

#### Scenario: Browser requests one optimized initial candidate

- **WHEN** the hero loads at a mobile or desktop viewport
- **THEN** the browser requests one optimized first-occasion image appropriate to its `sizes` policy
- **AND** it does not download a hidden duplicate breakpoint image

#### Scenario: Future photographs load after activation

- **WHEN** visitor activity activates rotation
- **THEN** the next occasion photograph may be requested before its transition
- **AND** photographs beyond the active and imminent occasions are not simultaneously mounted

#### Scenario: Rotation cannot create a late initial LCP candidate

- **WHEN** the page is still idle or the initial load is being measured
- **THEN** a future occasion does not replace the first photograph
- **AND** no later hero photograph can become an initial-load LCP candidate

#### Scenario: Optimized formats are served

- **WHEN** a hero photograph is requested by a browser that supports modern image formats
- **THEN** it is served in an optimized format at a width appropriate to the viewport
- **AND** it does not bypass the configured image optimization path
