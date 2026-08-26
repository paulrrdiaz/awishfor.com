## MODIFIED Requirements

### Requirement: Open tracking

Each qualifying browser view of a personalized invite page SHALL increment that invite's recorded view count and update its latest view time. The first qualifying view SHALL set `openedAt` only when it is unset, preserving the original first-open time; later views SHALL leave `openedAt` unchanged. A request that does not complete the browser-page view signal SHALL not change any invite view field.

#### Scenario: First open sets openedAt
- **WHEN** a browser completes the view signal for a personalized invite whose `openedAt` is unset
- **THEN** the system increments its view count to one, sets `openedAt`, and sets its latest view time to the view time

#### Scenario: Later opens preserve the first openedAt
- **WHEN** a browser completes another qualifying view for a personalized invite that has already been opened
- **THEN** the system increments its view count, updates its latest view time, and preserves its existing `openedAt`

#### Scenario: Metadata and server rendering do not update invite metrics
- **WHEN** a personalized route is resolved for metadata generation or server rendering without a browser completing the view signal
- **THEN** the invite's view count, latest view time, and `openedAt` remain unchanged
