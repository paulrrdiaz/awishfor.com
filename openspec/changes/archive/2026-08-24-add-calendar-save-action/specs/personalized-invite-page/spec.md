## ADDED Requirements

### Requirement: Confirmed RSVP summary provides calendar-save access
When a personalized invite has a `confirmed` primary RSVP status and its wishlist has an event date, the personalized invite page SHALL provide calendar-save access alongside the confirmed RSVP experience. The access SHALL use the shared themed calendar-save control and SHALL remain absent for pending and declined RSVP states.

#### Scenario: Confirmation summary is accompanied by calendar-save access
- **WHEN** a guest confirms attendance for a wishlist with an event date
- **THEN** the refreshed personalized page shows the confirmed RSVP summary and calendar-save access

#### Scenario: No calendar-save access for a declined summary
- **WHEN** a guest declines attendance
- **THEN** the personalized page shows the declined RSVP summary without calendar-save access
