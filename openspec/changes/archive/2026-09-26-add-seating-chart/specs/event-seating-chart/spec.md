## Purpose

Let a wishlist owner or collaborator recreate their venue's table configuration spatially, seat each invited person at a table, and print an alphabetical guest → table lookup sheet for the door — all driven by the RSVP data the product already holds.

## ADDED Requirements

### Requirement: Eligible guest pool

The system SHALL derive the seatable population for a wishlist from its existing invitations: every `Invite` whose status is not `declined` contributes its primary guest, and every `InviteExtraGuest` whose status is not `declined` contributes one additional person. Each person MUST be addressable independently of their party, and no separate guest list may be introduced.

#### Scenario: A confirmed party with a declined plus-one

- **WHEN** an invitation is `confirmed` with two extra guests, one `pending` and one `declined`
- **THEN** the primary guest and the `pending` extra guest appear as two separately seatable people
- **AND** the `declined` extra guest does not appear

#### Scenario: A wholly declined invitation

- **WHEN** an invitation's status is `declined`
- **THEN** neither its primary guest nor any of its extra guests appears in the seatable population

#### Scenario: A plus-one with no name

- **WHEN** an eligible extra guest has no name recorded
- **THEN** that person is still seatable and is labelled with a placeholder naming their party
- **AND** the interface offers an inline action to give them a name

#### Scenario: Someone declines after being seated

- **WHEN** a seated person's status changes to `declined`
- **THEN** they stop appearing in the seatable population and stop counting toward their table's occupancy
- **AND** no seating record is required to be deleted for this to take effect

#### Scenario: A declined guest reopens their response

- **WHEN** a previously `declined` person's status changes back to `pending` or `confirmed` and their prior table still exists
- **THEN** they appear seated at that table again

### Requirement: Table configuration

The system SHALL let an authorized user add tables to a wishlist, each with an explicit shape of round or rectangular, a capacity, and a free position on a canvas representing the room. Shape MUST be chosen explicitly and MUST NOT be inferred from capacity. Capacity MUST be constrained to a whole number between 1 and 20.

#### Scenario: Adding a table

- **WHEN** an authorized user submits a new table with a shape and a capacity
- **THEN** the table is persisted against that wishlist and appears on the canvas
- **AND** it is rendered with a default label derived from its position in the wishlist's table order unless a name was given

#### Scenario: Adding several identical tables at once

- **WHEN** an authorized user submits a new table with a repeat count greater than one
- **THEN** that many tables of the same shape and capacity are created
- **AND** each is positioned so that none is created fully hidden behind another

#### Scenario: Repositioning a table

- **WHEN** an authorized user drags a table to a new position on the canvas
- **THEN** the new position is persisted for that wishlist without requiring a separate save action
- **AND** the stored position is independent of the canvas zoom level in effect during the drag

#### Scenario: Capacity outside the allowed range

- **WHEN** a table is submitted with a capacity below 1 or above 20, or a non-integer capacity
- **THEN** the request is rejected and no table is created or modified

### Requirement: Per-person seat assignment

The system SHALL assign an eligible person to at most one table at a time, and SHALL reject any assignment that would exceed a table's capacity. Both the single-table rule and the capacity limit MUST be enforced by the server, and the single-table rule MUST additionally be enforced by a database constraint.

#### Scenario: Seating a person

- **WHEN** an authorized user drops a person onto a table that has an open seat
- **THEN** that person is recorded as seated at that table
- **AND** the table's displayed occupancy increases by one

#### Scenario: Moving a person between tables

- **WHEN** an authorized user drops an already-seated person onto a different table with an open seat
- **THEN** that person is seated at the new table only
- **AND** the previous table's occupancy decreases by one

#### Scenario: Returning a person to the unassigned list

- **WHEN** an authorized user drops a seated person onto the canvas background or the guest panel
- **THEN** that person has no table
- **AND** they reappear in the unassigned list

#### Scenario: Dropping onto a full table

- **WHEN** a person is dragged over a table whose occupancy already equals its capacity
- **THEN** the table is shown as an invalid target before the drop is released
- **AND** releasing the drag leaves the person where they were

#### Scenario: Two collaborators seat people simultaneously

- **WHEN** two authorized users each assign a different person to the same table with exactly one open seat
- **THEN** exactly one assignment succeeds and the other is rejected as full
- **AND** the table's occupancy never exceeds its capacity

#### Scenario: A database-level double seating attempt

- **WHEN** a second seating record is written for a person who already has one
- **THEN** the write fails
- **AND** this holds for a primary guest as well as for an extra guest

#### Scenario: An assignment failure is not left on screen

- **WHEN** a seat assignment is shown optimistically and the server rejects it
- **THEN** the person is returned to their previous position in the interface
- **AND** the user is told the change was not saved

### Requirement: Destructive table edits are guarded

The system SHALL refuse to reduce a table's capacity below the number of people currently seated at it, and SHALL require confirmation before deleting a table that has people seated. No seated person may ever be silently removed from the seatable population or silently ejected from a table.

#### Scenario: Reducing capacity below the seated count

- **WHEN** an authorized user attempts to set a table's capacity to fewer seats than the people currently seated there
- **THEN** the change is refused
- **AND** the interface names the people who would have to move first and offers to remove each from the table
- **AND** the save action stays unavailable until the seated count fits the new capacity

#### Scenario: Reducing capacity to exactly the seated count

- **WHEN** an authorized user sets a table's capacity equal to its current seated count
- **THEN** the change is accepted and the table is shown as full

#### Scenario: Deleting a table with people seated

- **WHEN** an authorized user deletes a table that has people seated
- **THEN** a confirmation step first names those people and states that they will return to the unassigned list
- **AND** on confirmation the table is deleted and those people appear in the unassigned list with no table

#### Scenario: Deleting an empty table

- **WHEN** an authorized user deletes a table with nobody seated
- **THEN** the table is deleted without a confirmation step

#### Scenario: A guest is deleted from the invitation list

- **WHEN** an invitation or extra guest is deleted elsewhere in the dashboard
- **THEN** any seating record for that person is removed with it
- **AND** the seating view shows no orphaned seat

### Requirement: Authorized access

The system SHALL scope every seating read and write to a wishlist the requesting user owns or collaborates on, and SHALL treat an inaccessible wishlist as not found. Collaborators MUST be able to edit seating, not only view it.

#### Scenario: A collaborator edits seating

- **WHEN** a collaborator on a wishlist adds a table or seats a person
- **THEN** the change succeeds

#### Scenario: A stranger requests a seating board

- **WHEN** a signed-in user who neither owns nor collaborates on a wishlist requests its seating data or attempts a seating change
- **THEN** the request fails as not found, without revealing whether the wishlist exists

#### Scenario: Cross-wishlist assignment

- **WHEN** an assignment names a table and a person belonging to different wishlists
- **THEN** the request is rejected

### Requirement: Floor-plan editor surface

The system SHALL present the seating tool as a canvas of positioned tables beside a panel of the wishlist's people, within a single drag context so a person can be dragged from the panel directly onto a table. Each table MUST show its live occupancy as seated-of-capacity, and a full table MUST be distinguishable from one with open seats without relying on colour alone.

#### Scenario: A wishlist with no eligible guests

- **WHEN** an authorized user opens the seating view for a wishlist with no eligible invited guests
- **THEN** the view explains that guests are needed first and links to the invitations view
- **AND** the navigation entry is neither hidden nor disabled

#### Scenario: A wishlist with guests but no tables

- **WHEN** an authorized user opens the seating view for a wishlist that has eligible guests and no tables
- **THEN** the view shows a first-run state inviting them to add their first table

#### Scenario: Reading a table at a glance

- **WHEN** the canvas shows tables of differing shapes and capacities
- **THEN** each renders at a size proportional to its capacity and distinguishable by shape
- **AND** each states its occupancy numerically and its state in text, in addition to any colour treatment

#### Scenario: Finding one person in a long list

- **WHEN** a wishlist has enough eligible people that the panel scrolls
- **THEN** the panel offers a text search and filters for unseated, seated, and pending people
- **AND** unseated people are grouped by their invitation with the party shown on each person

#### Scenario: Everyone is seated

- **WHEN** every eligible person has a table and the wishlist has at least one table
- **THEN** the panel acknowledges that seating is complete and offers the print sheet

#### Scenario: Assigning without a pointer

- **WHEN** an authorized user operates the guest panel by keyboard
- **THEN** a person can be picked up, moved among tables that have open seats, and seated or cancelled
- **AND** the result of each action is announced to assistive technology

#### Scenario: Fewer seats than people

- **WHEN** the wishlist's total table capacity is less than its number of eligible people
- **THEN** the view states the shortfall and suggests adding a table or raising a capacity
- **AND** it does not block any seating action

#### Scenario: Opening the editor on a small screen

- **WHEN** an authorized user opens the seating view on a viewport narrower than the canvas supports
- **THEN** the canvas is not offered for editing and the view explains that a tablet or computer is needed
- **AND** the unassigned list, the table list with occupancy, and the print sheet remain reachable

### Requirement: Printable guest lookup sheet

The system SHALL provide a print-oriented view listing every seated person alphabetically by name against their table label, using the browser's native print. Only people actually seated may appear on the printed page, and any eligible person without a table MUST be named on screen before printing.

#### Scenario: Printing the lookup sheet

- **WHEN** an authorized user opens the print view for a wishlist with seated people
- **THEN** the page lists those people in one alphabetical sequence, each against their table label
- **AND** the list is not grouped by table
- **AND** the event name and the time the sheet was produced appear on the page

#### Scenario: Guests are still unseated

- **WHEN** the print view is opened while eligible people have no table
- **THEN** the page names those people in a warning above the sheet and states that they will be missing from the printed page
- **AND** printing is still permitted
- **AND** the warning and any on-screen controls are excluded from the printed output

#### Scenario: An unnamed plus-one on the sheet

- **WHEN** a seated eligible person has no name recorded
- **THEN** they appear on the sheet with a placeholder that names their party, alongside their table label
- **AND** they are positioned with their party's primary guest rather than alphabetised on the placeholder text, so a reader scanning for the party finds them

#### Scenario: A sheet that spans pages

- **WHEN** the seated population does not fit on one page
- **THEN** alphabetical groups are not split across a page boundary
- **AND** each page carries the sheet's heading
