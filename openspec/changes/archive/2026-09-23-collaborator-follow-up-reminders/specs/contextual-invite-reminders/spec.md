## MODIFIED Requirements

### Requirement: Clipboard copy recording

The system SHALL copy the derived message to the clipboard and SHALL record the successful follow-up's kind and copy time against the invitation only after the clipboard write succeeds. The interface SHALL describe this state as copied, never sent or delivered. A failed clipboard write SHALL show retryable failure feedback and SHALL NOT update follow-up metadata. The wishlist owner and any wishlist collaborator SHALL be allowed to record follow-up copy metadata; a caller with no access to the wishlist SHALL NOT.

Previously copied metadata SHALL de-emphasize repeated copies within the same follow-up stage, while progression to a later event-reminder stage SHALL create a new recommendation. Copy metadata SHALL NOT suppress an action that the host or a collaborator chooses to repeat.

#### Scenario: Successful copy is recorded accurately
- **WHEN** the owner's or a collaborator's clipboard write succeeds for a contextual follow-up
- **THEN** the invitation records that follow-up kind and the current copy time
- **AND** the interface reports that the reminder was copied

#### Scenario: Clipboard write fails
- **WHEN** the clipboard rejects a contextual follow-up write
- **THEN** the interface explains that the message could not be copied and offers retry
- **AND** the invitation's follow-up metadata remains unchanged

#### Scenario: Later event stage becomes eligible
- **WHEN** a 14-day event heads-up was previously copied and the event later enters the 7-day stage
- **THEN** the practical event reminder is recommended as a new stage

#### Scenario: Collaborator attempts to record a copy
- **WHEN** a non-owner collaborator with wishlist access records follow-up copy metadata
- **THEN** the operation succeeds and the invitation records that follow-up kind and the current copy time

#### Scenario: Caller without wishlist access attempts to record a copy
- **WHEN** a caller with no ownership or membership on the wishlist attempts to record follow-up copy metadata
- **THEN** the operation is rejected and the invitation remains unchanged
