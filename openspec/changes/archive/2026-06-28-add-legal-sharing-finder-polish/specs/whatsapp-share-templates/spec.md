## ADDED Requirements

### Requirement: Event-type-specific WhatsApp share message

The system SHALL build the WhatsApp share message from a Spanish template selected by the wishlist's `eventType`, with each template including the wishlist's public URL.

#### Scenario: Template selected per event type

- **WHEN** a share URL is generated for a wishlist with `eventType` of `baby_shower`, `birthday`, `wedding`, or `housewarming`
- **THEN** the message uses the Spanish template specific to that event type
- **AND** the message includes the wishlist's public URL

#### Scenario: General fallback

- **WHEN** a share URL is generated for a wishlist with `eventType` of `general` or an unrecognized value
- **THEN** the message uses the general Spanish template
- **AND** the message includes the wishlist's public URL

#### Scenario: Message is URL-encoded into the wa.me link

- **WHEN** the WhatsApp share URL is produced
- **THEN** it targets `https://wa.me/` with the selected message URL-encoded in the `text` query parameter

### Requirement: Share consumers use event-aware templates

The wizard publish step, dashboard share panel, and marketing share entry points SHALL produce WhatsApp share links using the event-aware template selection.

#### Scenario: Publish step shares with event template

- **WHEN** an owner shares via WhatsApp from the wizard publish success state
- **THEN** the opened message matches the wishlist's event type

#### Scenario: Dashboard share uses event template

- **WHEN** an owner shares via WhatsApp from the dashboard share panel
- **THEN** the opened message matches the wishlist's event type
