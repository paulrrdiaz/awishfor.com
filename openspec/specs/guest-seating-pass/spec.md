# guest-seating-pass Specification

## Purpose

Shows a confirmed guest, on their personalized invite link, which table each confirmed member of their party is seated at during the final days before the event — the guest-facing "Mesa asignada" pass — in an owner-selected visual variant.

## Requirements

### Requirement: Seating pass visibility

The personalized invite page SHALL show the seating pass directly below the hero, in addition to the RSVP section, when all of the following hold: the wishlist has an event date; the number of calendar days from today to the event date, measured on the America/Lima calendar, is 5 or fewer (including zero and negative values); the invite's status is `confirmed`; and at least one confirmed member of the party has a table assignment. The RSVP section SHALL render exactly as it does without this capability in every case, including while the pass is shown. The pass SHALL never render on the plain (non-personalized) wishlist page.

#### Scenario: Pass appears five days before the event

- **WHEN** a guest with a `confirmed` invite, whose primary guest has a table, opens their personalized link 5 calendar days before the event date
- **THEN** the page shows the seating pass below the hero and the RSVP section unchanged

#### Scenario: Pass not shown six days before the event

- **WHEN** the same guest opens their link 6 calendar days before the event date
- **THEN** the page shows the RSVP section and no seating pass

#### Scenario: Pass shown on the event day

- **WHEN** the guest opens their link on the event date
- **THEN** the page shows the seating pass

#### Scenario: Pass remains after the event

- **WHEN** the guest opens their link after the event date
- **THEN** the page shows the seating pass

#### Scenario: Pending or declined invite sees no pass

- **WHEN** a guest whose invite status is `pending` or `declined` opens their link within the window, even if a stale table assignment exists for them
- **THEN** the page shows the RSVP section and no seating pass

#### Scenario: Nobody in the party is seated

- **WHEN** a confirmed guest opens their link within the window and no confirmed member of the party has a table
- **THEN** the page shows the RSVP section and no seating pass

#### Scenario: No event date

- **WHEN** the wishlist has no event date
- **THEN** the seating pass never appears

### Requirement: Seating pass party content

The seating pass SHALL address the primary guest by name and SHALL list every confirmed member of the party — the primary guest when confirmed and each confirmed extra guest — with their table label. A confirmed member without a table SHALL be listed with the text "Mesa por confirmar". Pending and declined members SHALL NOT be listed. An unnamed confirmed extra guest SHALL be listed as "Acompañante". The table label SHALL be the table's name when the host set one, and otherwise "Mesa N" where N is the table's position in the floor plan, matching the printed seating sheet. The pass SHALL show the event date and time and a countdown label ("Faltan N días", "Mañana", "Hoy") before and on the event date, and SHALL omit the countdown label after the event date.

#### Scenario: Party split across tables

- **WHEN** Lady and Marco are confirmed at "Mesa 4" and Sofía is confirmed at a table named "Mesa 7 · niños"
- **THEN** the pass lists Lady and Marco with "Mesa 4" and Sofía with "Mesa 7 · niños"

#### Scenario: Confirmed member not yet seated

- **WHEN** Lady is seated at "Mesa 4" and her confirmed companion Marco has no table
- **THEN** the pass lists Marco with "Mesa por confirmar"

#### Scenario: Declined companion is not listed

- **WHEN** an extra guest has status `declined` but still has a table assignment row
- **THEN** that extra guest does not appear on the pass

#### Scenario: Countdown label

- **WHEN** the event is 2 calendar days away
- **THEN** the pass shows "Faltan 2 días"

### Requirement: Seating pass tablemates

When the owner's "show tablemates" setting is on, the seating pass SHALL show, for each table the party uses, the other people seated there: members of other invites whose own status is `confirmed` and whose invite is not declined. Each tablemate SHALL be shown as first name plus last-name initial (for example "Ana R."); a single-word name SHALL be shown as-is and unnamed companions SHALL be omitted. Members of the viewer's own party SHALL NOT appear as tablemates. When the setting is off, the pass SHALL include no names from other invites, and the page payload SHALL NOT carry them.

#### Scenario: Tablemates shown with initials

- **WHEN** the setting is on and "Ana Ríos" and "Pedro Ríos" from another invite are confirmed at the viewer's table
- **THEN** the pass shows "Ana R." and "Pedro R." as tablemates of that table

#### Scenario: Pending guest at the same table is not shown

- **WHEN** a guest from another invite with status `pending` is seated at the viewer's table
- **THEN** that guest does not appear as a tablemate

#### Scenario: Tablemates hidden by the owner

- **WHEN** the owner turned the setting off
- **THEN** the pass shows no tablemates and the rendered page contains no names from other invites

### Requirement: Seating pass venue links

When the owner's "show venue" setting is on and the wishlist has an event location, the seating pass SHALL show the location text and two links that open the location in Google Maps and in Waze, each in a new tab. When the setting is off or the location is empty, the venue block SHALL be omitted.

#### Scenario: Venue links present

- **WHEN** the setting is on and the event location is "Casa Daniela, Av. José Larco 812, Miraflores"
- **THEN** the pass shows that text with a Google Maps link and a Waze link that search for it

#### Scenario: No location

- **WHEN** the wishlist has no event location
- **THEN** the pass shows no venue block

### Requirement: Seating pass variants

The seating pass SHALL render in the variant chosen by the owner, defaulting to `pass`:

- `pass` (Pase de mesa): a ticket whose header shows the primary guest's table as its most prominent element — a large numeral when the label is "Mesa N", otherwise the label itself — with the countdown label and event date/time, separated by a perforated divider from a "Tu grupo" list of every listed member and their table label; tablemates and the venue block follow.
- `ring` (Anillo de asientos): one row per distinct table the party uses, ordered by floor-plan position, each with a ring of dots equal to the table's capacity (capped at a legible maximum) around the table's number or label, the party's confirmed members at that table filled with the theme's primary color and the remaining dots neutral, beside the table label and the names of the party members there; members listed as "Mesa por confirmar" appear in a final row without a ring; tablemates and venue actions follow.

Both variants SHALL use the public page theme tokens and SHALL be legible at 320px viewport width.

#### Scenario: Default variant

- **WHEN** the owner never changed the setting
- **THEN** the pass renders as the `pass` variant

#### Scenario: Ring variant groups by table

- **WHEN** the owner chose `ring` and the party is split across two tables
- **THEN** the pass shows two rings, each with the party members seated at that table filled

#### Scenario: Large table stays legible

- **WHEN** a party member sits at a table with capacity 20 and the variant is `ring`
- **THEN** the ring renders without overlapping dots
