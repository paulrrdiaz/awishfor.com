## ADDED Requirements

### Requirement: Component-authoring priority is ShadCN-first, Tailwind-fallback, GSAP-for-motion

The system SHALL author UI by reaching first for a ShadCN/Base UI primitive (generated into `src/components/ui/`), falling back to raw TailwindCSS only when no primitive fits, and using GSAP for motion/"good vibes" on top — with all motion reduced-motion-guarded. This priority SHALL apply to both `shared/` and stateful `features/` components.

#### Scenario: Primitive is preferred over hand-rolled markup

- **WHEN** a component needs behavior a Base UI primitive provides (select, tabs, dialog, popover, etc.)
- **THEN** it uses the `@/components/ui/*` primitive rather than re-implementing the behavior in raw Tailwind

#### Scenario: Tailwind is the fallback, GSAP is the motion layer

- **WHEN** no suitable primitive exists
- **THEN** the component is composed with TailwindCSS, and any motion is added via the GSAP layer under a reduced-motion guard
