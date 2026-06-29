## ADDED Requirements

### Requirement: Reduced-motion-guarded GSAP motion layer for product components

The system SHALL provide a reusable GSAP-based motion layer under `src/lib/gsap/` for product (non-marketing) components, and every animation it drives SHALL be guarded by `prefers-reduced-motion: reduce` such that, when reduced motion is requested, the component renders directly in its final static state with no animation.

#### Scenario: Motion plays when allowed

- **WHEN** a component using the motion layer mounts and the user has not requested reduced motion
- **THEN** the GSAP micro-interaction plays and settles on the final visual state

#### Scenario: Reduced motion skips animation

- **WHEN** the user has `prefers-reduced-motion: reduce` set
- **THEN** the component renders its final static state immediately with no GSAP animation and no layout shift

### Requirement: Canonical product micro-interactions

The system SHALL express the canvas "good vibes" micro-interactions through the motion layer, covering at minimum: success-check draw-in, undo countdown ring, toast slide/lift, modal/sheet ease-in, copy-success pop, card hover lift, and theme-swatch hover. Each micro-interaction SHALL animate only transform/opacity and SHALL NOT cause layout shift.

#### Scenario: Success check animates on purchase success

- **WHEN** the purchase modal enters its `success` state with motion allowed
- **THEN** the success check draws in via the motion layer and the confirmation content is fully visible after it settles

#### Scenario: Undo ring reflects the countdown

- **WHEN** the purchase success `undo` state is active with motion allowed
- **THEN** the undo countdown ring animates in sync with the remaining undo seconds and resolves at expiry

#### Scenario: Micro-interactions avoid layout shift

- **WHEN** any product micro-interaction runs
- **THEN** it animates only transform/opacity properties and does not shift surrounding layout
