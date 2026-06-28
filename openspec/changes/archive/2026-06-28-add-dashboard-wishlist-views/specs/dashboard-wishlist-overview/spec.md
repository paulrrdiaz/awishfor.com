## ADDED Requirements

### Requirement: Wishlist overview metrics

The dashboard SHALL provide an overview at `/dashboard/wishlists/[id]`, scoped to the owner, that displays four metric cards: Regalos totales, Disponibles, Comprados, and Progreso de compras (with a progress bar). Progress SHALL be quantity-based.

#### Scenario: Owner sees quantity-based metrics

- **WHEN** the owner opens the overview of a wishlist they own
- **THEN** the page SHALL show total gifts, available gifts, purchased gifts, and a purchase-progress bar computed from purchased units over total units

#### Scenario: Non-owner cannot view the overview

- **WHEN** a signed-in user requests the overview of a wishlist they do not own
- **THEN** the request SHALL be rejected as not found and the overview SHALL NOT render that wishlist's data

### Requirement: Public link sharing

The overview SHALL present the wishlist's public link with actions to copy the link, share via WhatsApp, and download a QR code.

#### Scenario: Copy public link

- **WHEN** the owner activates the copy action
- **THEN** the wishlist's canonical public URL SHALL be copied to the clipboard

#### Scenario: Share via WhatsApp

- **WHEN** the owner activates the WhatsApp action
- **THEN** a WhatsApp share link containing the public URL SHALL open

#### Scenario: Download QR

- **WHEN** the owner activates the QR action
- **THEN** a QR code image encoding the public URL SHALL be downloaded

### Requirement: Recent purchases

The overview SHALL show the latest five purchases across the wishlist's gifts, each with the buyer, the purchased gift, a relative time, and a status badge.

#### Scenario: Owner sees latest five purchases

- **WHEN** the owner opens the overview of a wishlist that has purchases
- **THEN** at most the five most recent purchases SHALL be shown, ordered newest first, each displaying the buyer name, gift name, a relative timestamp, and a status badge

#### Scenario: No purchases yet

- **WHEN** the wishlist has no purchases
- **THEN** the recent-purchases section SHALL show an empty state

### Requirement: Publish readiness and publish action

The overview SHALL show a publish-readiness checklist and a publish action; the owner SHALL be able to publish when the wishlist is ready.

#### Scenario: Checklist reflects readiness

- **WHEN** the overview renders
- **THEN** it SHALL show each readiness check (title, event type, slug, language, currency, at least one visible gift) and whether it passes

#### Scenario: Owner publishes a ready wishlist

- **WHEN** the wishlist meets all readiness checks and the owner activates the publish action
- **THEN** the wishlist SHALL be published and its status SHALL become published

#### Scenario: Publish blocked when not ready

- **WHEN** the wishlist fails one or more readiness checks
- **THEN** the publish action SHALL be unavailable or rejected, and the unmet checks SHALL remain visible

#### Scenario: Sharing available after publish

- **WHEN** the wishlist is published
- **THEN** the public link and its share actions SHALL be available on the overview
