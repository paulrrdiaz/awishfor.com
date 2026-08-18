## ADDED Requirements

### Requirement: Hybrid hero image allocation

Public-wishlist hero layouts that combine two primary static image frames with a carousel SHALL partition the ordered cover-image collection by role. The first ordered image SHALL occupy the first primary static frame, the second ordered image SHALL occupy the second primary static frame, and only images after those two SHALL be eligible for the carousel, in their existing order. A cover image assigned to either primary static frame SHALL NOT also appear as a carousel slide.

This allocation SHALL apply to `arch-trio` and `collage-staggered` in full, preview, and compact modes. If the carousel allocation contains no image, its frame SHALL render the existing empty-state treatment; if it contains one image, that image SHALL render without carousel controls; and if it contains two or more images, the frame SHALL expose the existing carousel behavior.

#### Scenario: Five images occupy exclusive roles

- **WHEN** a hybrid hero receives five ordered cover images
- **THEN** images 1 and 2 occupy its two primary static frames and the carousel contains images 3, 4, and 5 in that order

#### Scenario: Minimum complete composition has no carousel controls

- **WHEN** a hybrid hero receives three ordered cover images
- **THEN** images 1 and 2 occupy its two primary static frames and image 3 renders in the carousel frame without navigation controls

#### Scenario: Fourth image enables carousel behavior

- **WHEN** a hybrid hero receives four ordered cover images
- **THEN** the carousel contains images 3 and 4 in order and exposes its existing multi-image controls and rotation behavior

#### Scenario: Static images never rotate through the carousel

- **WHEN** a guest navigates through every carousel slide in a hybrid hero
- **THEN** neither image assigned to a primary static frame appears in the carousel

#### Scenario: Allocation is consistent across render modes

- **WHEN** the same ordered image collection renders in full, preview, or compact mode
- **THEN** each mode assigns the same images to the two primary static frames and the carousel

## MODIFIED Requirements

### Requirement: Arch trio composition

The `arch-trio` layout SHALL render as a self-contained page rather than delegating its body to the shared public wishlist body component. It SHALL compose the shared page shell for its header, centered content wrapper and footer, and SHALL supply its own body content.

Its hero SHALL be arranged as a two-column grid at the `lg` breakpoint and above — a fixed-width 290px media column and a flexible text column — over a diagonal gradient from the theme's accent to its card surface, and SHALL NOT bleed beyond the shared shell's centered content wrapper. Below the `lg` breakpoint the grid SHALL collapse to a single column with the media column rendered first.

The media column SHALL present three circular cover-image slots in an overlapping arc: a large primary slot, a medium slot offset to the lower right, and a small slot offset to the upper right. The medium and small slots SHALL carry a ring in the theme's card color. The large carousel frame SHALL carry a white ring whose responsive thickness matches the medium and small rings. The text column SHALL present, in order, the event-type eyebrow, the wishlist title, the event summary line, the guest welcome section, and the hero CTA group.

Below the hero the layout SHALL render, in the required section order: the event-details cards in their compact presentation, the countdown in the variant selected for the wishlist, the welcome message in its selected variant when one exists, a divider, the gift-list heading with an inline availability summary, the filtered gift list, and the thank-you message in its selected variant.

Its gift filter SHALL expose the status filters alone — all, available, purchased, and starred — without category filters, matching the design canvas.

#### Scenario: Layout renders through the shared shell

- **WHEN** the `arch-trio` layout renders a wishlist
- **THEN** its header, centered content wrapper and footer come from the shared page shell, and it does not delegate to the shared public wishlist body component

#### Scenario: Two-column hero at large breakpoints

- **WHEN** the `arch-trio` layout renders at the `lg` breakpoint or wider
- **THEN** the three arc images occupy a fixed 290px media column and the title and CTA content occupy a flexible text column beside it

#### Scenario: Single column below the large breakpoint

- **WHEN** the `arch-trio` layout renders below the `lg` breakpoint
- **THEN** the hero collapses to one column with the arc composition above the text content

#### Scenario: Hero stays within the shared content wrapper

- **WHEN** the `arch-trio` layout renders in any mode
- **THEN** its hero is bounded by the shell's centered content wrapper and does not extend to the full viewport width

#### Scenario: Large frame has a white ring

- **WHEN** the `arch-trio` hero renders with either one carousel-eligible image or multiple carousel slides
- **THEN** the large circular frame has a white ring that matches the responsive thickness of the two smaller frame rings

#### Scenario: Gift filter exposes status filters only

- **WHEN** the `arch-trio` layout renders its gift section for a wishlist whose gifts span several categories
- **THEN** the filter row offers all, available, purchased and starred, and no category filters
