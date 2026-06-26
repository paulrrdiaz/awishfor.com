# gift-management Specification

## Purpose
Defines how gifts are persisted, structured, and managed within a wishlist, including category assignment, pricing, quantity, priority, visibility, notes, ordering, and soft deletion.

## Requirements

### Requirement: Gift persistence
The system SHALL persist gifts as records owned by exactly one wishlist.

#### Scenario: Gift is stored for a wishlist
- **WHEN** a gift is created with a valid wishlist and a non-empty trimmed name
- **THEN** the system persists the gift with that wishlist relation, name, created timestamp, and updated timestamp

#### Scenario: Gift is created without optional commerce metadata
- **WHEN** a gift is created without a product URL, image URL, store name, or price
- **THEN** the system persists the gift and leaves those fields empty

#### Scenario: Gift name is invalid
- **WHEN** a gift name is empty after trimming or exceeds the allowed length
- **THEN** the system rejects the request and does not create a gift

### Requirement: Gift optional category assignment
The system SHALL allow a gift to be assigned to at most one category in the same wishlist, and SHALL keep the gift when that category is deleted.

#### Scenario: Gift is assigned a category
- **WHEN** a gift is created or updated with a category that belongs to its wishlist
- **THEN** the system stores the category relation on the gift

#### Scenario: Gift has no category
- **WHEN** a gift is created without a category
- **THEN** the system persists the gift as uncategorized

#### Scenario: Assigned category is deleted
- **WHEN** the category assigned to a gift is deleted
- **THEN** the system keeps the gift and clears its category assignment

### Requirement: Gift price
The system SHALL store an optional gift price as a fixed-precision decimal with an optional currency.

#### Scenario: Gift has a price
- **WHEN** a gift is created with a price amount and currency
- **THEN** the system persists the amount with two-decimal precision and the selected currency

#### Scenario: Gift price is omitted
- **WHEN** a gift is created without a price amount
- **THEN** the system persists the gift with no price and no price currency

### Requirement: Gift quantity
The system SHALL store the number of units a gift needs, defaulting to one and never below one.

#### Scenario: Gift needs multiple units
- **WHEN** a gift is created with a quantity needed greater than one
- **THEN** the system persists that quantity

#### Scenario: Gift quantity is omitted
- **WHEN** a gift is created without a quantity needed
- **THEN** the system persists a quantity needed of one

#### Scenario: Gift quantity is below one
- **WHEN** a gift is created with a quantity needed below one
- **THEN** the system rejects the request and does not create a gift

### Requirement: Gift priority and visibility
The system SHALL store a gift priority and a visibility status, defaulting to medium priority and available visibility.

#### Scenario: Gift defaults are applied
- **WHEN** a gift is created without an explicit priority or visibility status
- **THEN** the system persists the gift with medium priority and available visibility

#### Scenario: Gift is hidden
- **WHEN** a gift is created or updated with hidden visibility
- **THEN** the system persists the gift as hidden so it can be excluded from public display

### Requirement: Gift notes and ordering
The system SHALL store an optional public note, an optional internal note, and a sort order for each gift.

#### Scenario: Gift stores notes and order
- **WHEN** a gift is created with a public note, an internal note, and a sort order
- **THEN** the system persists all three values on the gift

#### Scenario: Gift sort order is omitted
- **WHEN** a gift is created without a sort order
- **THEN** the system persists a deterministic default sort order

### Requirement: Gift soft delete
The system SHALL soft delete gifts by recording a deletion timestamp, and SHALL exclude soft-deleted gifts from quantity and progress calculations without hard deleting them.

#### Scenario: Gift is soft deleted
- **WHEN** a gift is soft deleted
- **THEN** the system records the deletion timestamp and retains the row

#### Scenario: Soft-deleted gift is excluded from progress
- **WHEN** quantity or progress is calculated for a wishlist
- **THEN** the system excludes gifts that have a deletion timestamp
