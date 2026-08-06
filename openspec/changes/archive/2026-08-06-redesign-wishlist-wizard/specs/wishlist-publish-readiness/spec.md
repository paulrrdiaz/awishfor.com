## Purpose

Ensure wishlists meet minimum publishing requirements: complete identity, at least one visible gift, and sufficient cover images for the selected layout. The system evaluates readiness and reports per-requirement status for both dashboard and wizard UIs.

## Requirements

## MODIFIED Requirements

### Requirement: Publish readiness evaluation

The system SHALL evaluate a wishlist against the minimum publish requirements and return a checklist-friendly result that reports, per requirement, whether it is satisfied, plus an overall ready flag.

#### Scenario: Complete wishlist is ready

- **WHEN** a wishlist has a title, event type, format-valid slug, language, currency, at least one visible non-deleted gift, and enough cover images for its selected layout
- **THEN** the result reports every requirement satisfied and overall ready is true

#### Scenario: Result is checklist-friendly

- **WHEN** readiness is evaluated
- **THEN** the result includes a per-requirement breakdown (title, event type, slug, language, currency, visible gift, cover images) that the dashboard and the wizard can render as a checklist

### Requirement: Design settings do not block publishing

The system SHALL NOT require a theme, layout, font, or button style for a wishlist to be publish-ready; each has a default that resolves without creator input. Cover images are the exception and are covered by their own requirement, because a hero composition with unfilled slots renders placeholders on a public page.

#### Scenario: Missing style settings still ready

- **WHEN** a wishlist satisfies all required identity fields, has a visible gift and enough cover images, but has no theme, layout, fonts, or button style
- **THEN** overall ready is true

## ADDED Requirements

### Requirement: Cover images satisfy the selected layout

The system SHALL require a wishlist to hold at least as many cover images as its resolved layout's `heroImageSlots` for that wishlist to be publish-ready. The count SHALL be measured against the resolved layout, so a wishlist with a null or unknown `layoutId` is measured against the default layout.

#### Scenario: Enough images satisfies the requirement

- **WHEN** a wishlist's resolved layout renders three cover images and the wishlist has three or more
- **THEN** the cover-images checklist item is satisfied

#### Scenario: Too few images blocks readiness

- **WHEN** a wishlist's resolved layout renders three cover images and the wishlist has two
- **THEN** the cover-images checklist item is unsatisfied and overall ready is false

#### Scenario: No images blocks readiness

- **WHEN** a wishlist has no cover images
- **THEN** the cover-images checklist item is unsatisfied and overall ready is false

#### Scenario: Unknown layout measures against the default

- **WHEN** a wishlist's `layoutId` is null or unknown
- **THEN** the requirement is evaluated against the default layout's slot count

#### Scenario: Server enforces the requirement

- **WHEN** a publish request arrives for a wishlist with fewer cover images than its layout needs
- **THEN** the publish is rejected with the readiness failure rather than relying on the client to have blocked it
