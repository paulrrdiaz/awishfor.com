## ADDED Requirements

### Requirement: Owner configures the seating pass

The settings form SHALL include a "Mesa asignada" section where the owner chooses the seating pass variant — `pass` ("Pase de mesa", the default) or `ring` ("Anillo de asientos") — and toggles "Mostrar compañeros de mesa" (default on) and "Mostrar cómo llegar" (default on). The section SHALL explain that guests see the pass on their personal link from 5 days before the event once they are confirmed and seated. The values SHALL persist through the owner-scoped `wishlist.updateSettings` mutation, which SHALL reject any variant other than `pass` or `ring`. Saving SHALL revalidate the public wishlist paths so personalized links reflect the change. Collaborators SHALL NOT be able to change these settings.

#### Scenario: Defaults for an existing wishlist

- **WHEN** the owner opens settings for a wishlist that never configured the pass
- **THEN** the section shows "Pase de mesa" selected with both toggles on

#### Scenario: Owner switches to the ring variant

- **WHEN** the owner selects "Anillo de asientos" and saves
- **THEN** the setting is persisted and a guest who sees the pass afterwards sees the `ring` variant

#### Scenario: Invalid variant rejected

- **WHEN** a request to `wishlist.updateSettings` carries a seating pass variant other than `pass` or `ring`
- **THEN** the mutation fails validation and nothing is persisted

### Requirement: Seating pass preview in settings

The "Mesa asignada" section SHALL render a live preview of the seating pass for the currently selected variant and toggles, using sample data (a three-person party split across two tables, sample tablemates, and the wishlist's own event date, time and location when set) and the wishlist's public theme. The preview SHALL update immediately as the owner changes the variant or toggles, before saving, and SHALL NOT read or expose real guests' data.

#### Scenario: Preview follows the variant choice

- **WHEN** the owner selects "Anillo de asientos" without saving
- **THEN** the preview immediately re-renders as the `ring` variant

#### Scenario: Preview hides tablemates

- **WHEN** the owner turns off "Mostrar compañeros de mesa"
- **THEN** the preview no longer shows tablemates
