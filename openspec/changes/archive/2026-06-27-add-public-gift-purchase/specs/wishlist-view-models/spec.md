## ADDED Requirements

### Requirement: Public gift view model exposes remaining quantity

The public gift view model SHALL include the gift's remaining quantity, computed as quantity needed minus purchased quantity and never below zero, without exposing individual purchaser identities.

#### Scenario: Partially purchased gift remaining quantity
- **WHEN** a gift with quantity needed of 3 and purchased quantity of 1 is mapped to the public gift view model
- **THEN** the view model includes a remaining quantity of 2

#### Scenario: Fully purchased gift remaining quantity
- **WHEN** a gift's purchased quantity is greater than or equal to its quantity needed
- **THEN** the view model includes a remaining quantity of 0
