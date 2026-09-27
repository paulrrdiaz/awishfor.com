## Purpose

Provide reliable, privacy-safe visibility into creator progress through the wishlist creation wizard and the existing guest wishlist conversion surface.

## ADDED Requirements

### Requirement: Creator wizard conversion capture

The system SHALL capture a creator-wizard start event, a forward-step-completion event for each completed non-terminal wizard step, and a publish-success event. These events MUST use the visitor identity already established by the application analytics runtime, and MUST NOT delay or change wizard navigation, validation, authentication, persistence, or publishing behavior.

#### Scenario: A creator begins a new wizard journey

- **WHEN** a hydrated visitor enters the initial creation-wizard step
- **THEN** exactly one wizard-start event is captured for that wizard navigation
- **AND** it shares the visitor identity used by the marketing and application analytics surfaces

#### Scenario: A creator completes a non-terminal step

- **WHEN** a creator successfully advances from a non-terminal wizard step through the normal forward action
- **THEN** one step-completion event is captured with that step's stable identifier
- **AND** no step-completion event is captured when local validation prevents advancement

#### Scenario: A creator publishes a wishlist

- **WHEN** the publish operation succeeds and the wizard enters its published success state
- **THEN** one publish-success event is captured
- **AND** no publish-success event is captured for a failed, canceled, or unauthenticated publish attempt

#### Scenario: Analytics transport fails

- **WHEN** capture is blocked, unavailable, or fails
- **THEN** the wizard continues its existing navigation and publish behavior
- **AND** no analytics error is surfaced to the creator

### Requirement: Creator wizard analytics data minimization

Creator-wizard analytics SHALL contain only a stable wizard step identifier on step-completion events. Wizard-start and publish-success events MUST NOT contain draft titles, slugs, event dates, locations, messages, gift details, image URLs, personal contact data, or public wishlist URLs.

#### Scenario: A step-completion event is emitted

- **WHEN** a creator advances through the wizard
- **THEN** the event properties contain only the documented stable step identifier and transport-required metadata
- **AND** no draft field or user-entered content is included

#### Scenario: A publish-success event is emitted

- **WHEN** a wishlist is published successfully
- **THEN** the event contains no wishlist identifier, slug, title, or URL
- **AND** the event is sufficient to serve as the terminal step of a creator conversion funnel

### Requirement: Operational PostHog funnel visibility

After the relevant production event schemas are available, the PostHog `Wishlist & Wizard Funnel` dashboard SHALL contain saved insights for public-wishlist activity and the ordered creator-wizard journey. Dashboard insights MUST use only event names and properties verified in the target PostHog project.

#### Scenario: Public-wishlist events arrive in PostHog

- **WHEN** the target PostHog project has received the public-wishlist event schema
- **THEN** the dashboard contains a saved activity insight for wishlist views, guest intent clicks, and confirmed guest outcomes
- **AND** the insight can be used to inspect event volume over time

#### Scenario: Creator-wizard events arrive in PostHog

- **WHEN** the target PostHog project has received the creator-wizard event schema
- **THEN** the dashboard contains a saved ordered funnel from wizard start through each completed step to publish success
- **AND** the funnel uses the stable step identifier to distinguish repeated step-completion events

#### Scenario: Production ingestion is unverified

- **WHEN** the target PostHog project has not received a required event schema
- **THEN** an insight MUST NOT be configured to reference that unverified event or property
- **AND** production ingestion verification remains an explicit release requirement
