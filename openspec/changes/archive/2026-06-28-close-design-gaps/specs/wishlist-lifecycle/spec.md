## MODIFIED Requirements

### Requirement: Wishlist event details

The system SHALL store optional event date, event time, event location, and dress code fields for a wishlist. The dress code SHALL be optional plain text and SHALL power the public "Código de vestimenta" details card.

#### Scenario: Event details are optional

- **WHEN** a wishlist is created without event date, event time, event location, or dress code
- **THEN** the persisted wishlist is valid and stores those event detail fields as empty

#### Scenario: Past event dates are allowed

- **WHEN** a wishlist is created or updated with an event date in the past
- **THEN** the system accepts and persists that date

#### Scenario: Event time uses HH:mm format

- **WHEN** a wishlist is created or updated with an event time
- **THEN** the system accepts only a valid 24-hour `HH:mm` value

#### Scenario: Dress code is optional plain text

- **WHEN** a wishlist is created or updated with a dress code value
- **THEN** the system persists it as plain text
- **AND** when the dress code is empty the public details card for dress code is omitted
