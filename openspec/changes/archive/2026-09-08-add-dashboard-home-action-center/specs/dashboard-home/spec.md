## Purpose

Define `/dashboard` as the owner's action center: what it derives, how it ranks it, what it renders in each state, and the chrome it carries on each breakpoint.

## ADDED Requirements

### Requirement: Cross-wishlist action model

The system SHALL derive a set of pending actions across every non-archived wishlist the signed-in user owns or is a member of. Four action kinds SHALL be derived:

- `complete_draft` — the wishlist is a draft and is not publish-ready.
- `review_rsvps` — the wishlist has at least one invite whose RSVP is still pending.
- `invite_guests` — the wishlist is published and has no invites.
- `archive` — the wishlist's event date is in the past, the wishlist is not archived, and the user owns it.

Actions SHALL be derived on read from existing wishlist, invite, and gift data. The system SHALL NOT persist, dismiss, or snooze an action.

#### Scenario: A draft that cannot be published yields a completion action

- **WHEN** the user owns a draft wishlist whose publish readiness reports at least one unsatisfied check
- **THEN** a `complete_draft` action is derived for that wishlist

#### Scenario: Pending RSVPs yield a review action

- **WHEN** a wishlist has three invites still pending a response
- **THEN** a single `review_rsvps` action is derived for that wishlist carrying the pending count

#### Scenario: A published wishlist with no guests yields an invite action

- **WHEN** a published wishlist has no invites
- **THEN** an `invite_guests` action is derived
- **AND** no `invite_guests` action is derived once that wishlist has at least one invite

#### Scenario: A past event yields an archive action

- **WHEN** a wishlist the user owns has an event date before today and its status is not archived
- **THEN** an `archive` action is derived

#### Scenario: A collaborator is not offered archiving

- **WHEN** a wishlist whose event date has passed belongs to someone else and the user is only a member
- **THEN** no `archive` action is derived, because only the owner may archive

#### Scenario: Archived wishlists are excluded

- **WHEN** a wishlist is archived
- **THEN** no action of any kind is derived for it

#### Scenario: Shared wishlists participate in the actions a member may perform

- **WHEN** the user is a member, not the owner, of a wishlist meeting the condition for `complete_draft`, `review_rsvps`, or `invite_guests`
- **THEN** the action is derived and identifies the wishlist's owner

### Requirement: Action ranking and next step

The system SHALL order derived actions by kind in the order `complete_draft`, `review_rsvps`, `invite_guests`, `archive`. Within a kind, actions SHALL be ordered by the nearer relevant date — the RSVP deadline for `review_rsvps`, the event date otherwise — with wishlists lacking that date ordered last, and creation date descending as the final tiebreak. The first action after ordering SHALL be the recommended next step; the remainder SHALL be the subsequent actions.

#### Scenario: Kind outranks a nearer deadline

- **WHEN** a `complete_draft` action's event is in four days and a `review_rsvps` action's deadline is in three days
- **THEN** the `complete_draft` action is the recommended next step
- **AND** the `review_rsvps` action appears among the subsequent actions

#### Scenario: Nearer date wins within a kind

- **WHEN** two `review_rsvps` actions have deadlines in two and nine days
- **THEN** the two-day action is ordered first

#### Scenario: A missing date does not win by absence

- **WHEN** one `archive` action's wishlist has an event date and another has none
- **THEN** the one with an event date is ordered first

### Requirement: Action center page

`/dashboard` SHALL render a greeting addressing the signed-in user, a one-line summary of how many actions are pending, a secondary `Crear wishlist` control, the recommended next step as the page's only primary action, and the subsequent actions beneath it. The pending count SHALL include the recommended next step together with the subsequent actions. The page SHALL NOT render an individual wishlist's detail or analytics.

#### Scenario: The greeting reflects the time of day

- **WHEN** the owner opens `/dashboard`
- **THEN** the greeting addresses them by name and reflects the current time of day

#### Scenario: The count covers every action

- **WHEN** one action is the recommended next step and three are subsequent
- **THEN** the summary line reads that four actions are pending

#### Scenario: Only the next step is primary

- **WHEN** actions are pending
- **THEN** the recommended next step carries the only primary button on the page
- **AND** `Crear wishlist` renders as a secondary control in the page header

### Requirement: Recommended next step presentation

The recommended next step SHALL identify its wishlist by status badge, title, and event date where present, and SHALL carry a description generated from the reason the action was derived. A `complete_draft` next step SHALL render publish progress as one segment per publish-readiness check, the satisfied ones distinguished, together with a count of satisfied over total checks read from the readiness result rather than a fixed number. Its description SHALL name the unsatisfied checks, enumerating at most two and summarizing any remainder.

#### Scenario: Progress reflects the readiness result

- **WHEN** the readiness result reports four of its checks satisfied
- **THEN** the next step renders one segment per check with four distinguished, and a count of four over the total number of checks

#### Scenario: The description names what is missing

- **WHEN** a draft is missing its currency and a visible gift
- **THEN** the description names those two unsatisfied checks

#### Scenario: Many unmet checks are summarized

- **WHEN** a draft has four unsatisfied checks
- **THEN** the description names two of them and summarizes the rest as a count

### Requirement: Subsequent actions as navigation

Each subsequent action SHALL render as a single activatable row carrying an icon, a title, its wishlist name, and a forward affordance, and SHALL navigate to the screen where the work is done rather than mutating state in place. A `review_rsvps` row whose wishlist has an RSVP deadline SHALL carry a badge stating the time remaining. A row for a wishlist the user does not own SHALL carry a badge naming its owner. Rows SHALL be reachable and activatable by keyboard.

#### Scenario: A row navigates to its destination

- **WHEN** the owner activates a `review_rsvps` row
- **THEN** they land on that wishlist's guests screen

#### Scenario: An archive row does not archive

- **WHEN** the owner activates an `archive` row
- **THEN** they land on that wishlist's settings screen and the wishlist is not archived by the activation

#### Scenario: Every row leads somewhere the user may act

- **WHEN** an action row is rendered for a wishlist the user does not own
- **THEN** its destination is a screen whose existing permissions allow that member to perform the work the row describes

#### Scenario: An approaching deadline is badged

- **WHEN** a `review_rsvps` action's wishlist has an RSVP deadline three days out
- **THEN** the row carries a badge stating that it expires in three days

#### Scenario: A shared wishlist names its owner

- **WHEN** an action belongs to a wishlist owned by someone else
- **THEN** the row carries a badge naming that owner

### Requirement: Cross-wishlist summary

The page SHALL render a summary of the user's non-archived wishlists reporting the number of active wishlists, reserved gift units over total visible units with a progress indicator, and the total number of pending RSVPs. The summary SHALL be presented beside the actions at desktop widths and after them on mobile. The summary SHALL NOT render when the user has no wishlists.

#### Scenario: Summary reports cross-list totals

- **WHEN** the user has two active wishlists with fourteen of thirty-two units reserved and six pending RSVPs
- **THEN** the summary reports two active wishlists, fourteen of thirty-two reserved with a progress indicator, and six pending responses

#### Scenario: Summary follows the actions on mobile

- **WHEN** the page is viewed below the `md` breakpoint
- **THEN** the summary renders after the actions in a single column

### Requirement: All-clear state

When the user has at least one wishlist and no actions are derived, the page SHALL replace the recommended next step with a confirmation that nothing is pending, and SHALL present the next upcoming event — its status, title, event date, time remaining, and reserved-gift progress — with controls to open and to share that wishlist. The summary SHALL still render.

#### Scenario: Nothing pending shows the next event

- **WHEN** the user has wishlists and no actions are derived, and their nearest future event is in seven days
- **THEN** the page confirms nothing is pending and presents that wishlist with its date, its time remaining, and its reserved-gift progress

#### Scenario: No future event still confirms

- **WHEN** no action is derived and no wishlist has a future event date
- **THEN** the page still confirms that nothing is pending and omits the upcoming-event block

### Requirement: First-run state

When the user has no wishlists, the page SHALL greet them, present the three steps of creating a wishlist in order, and offer creating a first wishlist as its primary action alongside viewing an example. The summary SHALL be omitted, because there is nothing to summarize.

#### Scenario: A new user sees the path, not metrics

- **WHEN** a signed-in user with no wishlists opens `/dashboard`
- **THEN** the page presents the three creation steps and a primary control to create their first wishlist
- **AND** no summary is rendered

### Requirement: Loading state preserves layout

While the page's data is loading, the page SHALL render a skeleton that preserves the grid, the connecting ribbon, and the height of each card, so that no content shifts position when the data arrives.

#### Scenario: Data arrival does not shift the layout

- **WHEN** the page's data resolves after its skeleton has rendered
- **THEN** the cards occupy the same positions the skeleton reserved

### Requirement: Error state remains actionable

When the page's data cannot be loaded, the page SHALL keep its greeting and its `Crear wishlist` control, explain that the actions could not be calculated, reassure the user that their wishlists and gifts are intact, and offer both retrying the load and navigating to `Mis wishlists`. The page SHALL NOT render blank.

#### Scenario: A failed load offers a retry

- **WHEN** the query backing the page fails
- **THEN** the page explains the failure, states that the user's data is safe, and offers a retry control and a link to `Mis wishlists`

#### Scenario: Retrying reloads the page data

- **WHEN** the user activates the retry control
- **THEN** the page re-requests its data and renders the resulting state

### Requirement: Inicio page chrome

At `md` and above `/dashboard` SHALL render a topbar carrying the route's identity. A control in that topbar whose destination does not resolve SHALL be omitted rather than rendered inert. The topbar SHALL NOT carry a `Crear wishlist` action on this route, so that the recommended next step remains the page's only primary action.

#### Scenario: The topbar names the route

- **WHEN** the owner opens `/dashboard` at `md` or above
- **THEN** a topbar renders identifying the route as `Inicio`

#### Scenario: An unresolvable control is absent

- **WHEN** no help destination resolves
- **THEN** no help control renders in the topbar

#### Scenario: Creating stays secondary here

- **WHEN** the owner opens `/dashboard`
- **THEN** no `Crear wishlist` control renders in the topbar, and one renders as a secondary control in the page header
