## ADDED Requirements

### Requirement: Anonymous marketing pageview capture

The system SHALL capture a pageview event for the anonymous marketing route from the client, including the path, referrer, and any campaign parameters present on the URL. Pageview capture MUST NOT introduce request-time server work into the marketing route, and the marketing route MUST remain statically prerendered in the production build.

#### Scenario: A visitor loads the landing page

- **WHEN** an anonymous visitor loads `/` in a browser with analytics configured
- **THEN** exactly one pageview event is captured for that navigation
- **AND** the event records the path, the document referrer when present, and the campaign parameters present on the URL

#### Scenario: Static rendering is preserved

- **WHEN** the application is built for production
- **THEN** the build output classifies `/` as static or prerendered
- **AND** no analytics code causes the marketing route to read request-time server APIs

#### Scenario: Client navigation emits a pageview

- **WHEN** a visitor navigates between marketing routes without a full document load
- **THEN** a pageview event is captured for the destination route
- **AND** no duplicate pageview is captured for the same navigation

#### Scenario: Analytics is unconfigured

- **WHEN** the analytics project key is absent from the environment
- **THEN** the marketing route renders and behaves normally
- **AND** capture calls become no-ops rather than throwing or blocking render

### Requirement: Marketing engagement events

The system SHALL capture named engagement events describing how a visitor moves through the landing page: occasion selection, section reach, theme preview interaction, FAQ disclosure, guest-finder use, and call-to-action activation. Every marketing event MUST carry a property distinguishing creator intent from guest intent so the two audiences can be analyzed separately.

#### Scenario: A visitor selects an occasion

- **WHEN** a visitor chooses an occasion in the occasion picker
- **THEN** an occasion-selection event is captured identifying the chosen occasion

#### Scenario: A visitor reaches a marketing section

- **WHEN** a marketing section enters the viewport for the first time during a pageview
- **THEN** a section-reach event is captured identifying that section
- **AND** repeated scrolling across the same section during the same pageview captures no further events for it

#### Scenario: A visitor activates a call to action

- **WHEN** a visitor activates any call to action leading to the creation wizard
- **THEN** a call-to-action event is captured identifying which placement was used
- **AND** the event does not delay or block the resulting navigation

#### Scenario: A guest uses the wishlist finder

- **WHEN** a visitor submits the guest wishlist finder on the landing page
- **THEN** a guest-finder event is captured carrying guest intent
- **AND** the event is distinguishable from creator-intent events in reporting

#### Scenario: Engagement capture never breaks the page

- **WHEN** an analytics request fails, is blocked, or times out
- **THEN** the interaction that triggered it completes normally
- **AND** no error surfaces to the visitor

### Requirement: Visitor identity continuity

The system SHALL resolve a single visitor to a single analytics identity across the marketing route and the application shell, so that a visitor who moves from the landing page into the creation wizard is not recorded as two people. Person profiles SHALL be created only for identified users; anonymous visitors and wishlist guests MUST NOT produce person profiles.

#### Scenario: A visitor crosses from marketing into the application

- **WHEN** a visitor loads `/` and then navigates into the creation wizard
- **THEN** events captured on both routes share one visitor identifier
- **AND** a funnel from landing to wizard entry resolves them as one person

#### Scenario: A creator authenticates

- **WHEN** a visitor completes sign-up or sign-in
- **THEN** the analytics identity is associated with their authentication user id
- **AND** events captured before authentication remain attributed to the same person

#### Scenario: Anonymous traffic creates no profiles

- **WHEN** an anonymous visitor browses the landing page or a public wishlist without authenticating
- **THEN** their events are captured
- **AND** no person profile is created for them

### Requirement: First-party analytics ingestion

The system SHALL send analytics traffic through a first-party path on the application's own origin rather than directly to a third-party analytics hostname. The ingestion path MUST NOT be matched by the authentication middleware, so ingestion performs no session work.

#### Scenario: Events are sent to the application origin

- **WHEN** the client captures any event
- **THEN** the request targets a first-party path on the application origin
- **AND** the application forwards it to the configured analytics region

#### Scenario: Ingestion bypasses authentication middleware

- **WHEN** an ingestion request is made
- **THEN** the request path is not matched by the middleware route matcher
- **AND** no authentication lookup is performed for it

### Requirement: Marketing analytics payload budget

Analytics MUST NOT push the anonymous marketing route past its established JavaScript budget. The analytics client and its instrumentation SHALL add no more than 10 KiB of compressed JavaScript to the marketing route, and total compressed route JavaScript MUST remain at or below the configured `javascriptBytes` budget. Deferring analytics loading purely to move bytes outside the audit's measurement window MUST NOT be used to satisfy this requirement.

#### Scenario: The analytics delta stays within budget

- **WHEN** the production marketing audit runs after analytics is added
- **THEN** compressed route JavaScript remains at or below the configured budget
- **AND** the measured increase attributable to analytics is at most 10 KiB

#### Scenario: A budget change is deliberate

- **WHEN** an analytics requirement cannot be met within the configured budget
- **THEN** the budget configuration is changed explicitly and committed with a written rationale
- **AND** the analytics payload is not hidden from measurement by deferral or conditional loading

#### Scenario: The performance audit is verification evidence

- **WHEN** this change is reviewed
- **THEN** its verification records the production marketing audit result
- **AND** the record distinguishes the analytics delta from budget failures that predate the change

### Requirement: Environment isolation for analytics capture

Analytics configuration SHALL be validated through the project's environment schema, and capture SHALL be suppressed outside production so development and test activity cannot enter reporting.

#### Scenario: Configuration is validated

- **WHEN** the application starts
- **THEN** the analytics project key and host are validated by the environment schema
- **AND** both are declared in the example environment file

#### Scenario: Development activity is not captured

- **WHEN** the application runs in development or test
- **THEN** no events are sent to the analytics service

### Requirement: Typed event contract

The system SHALL declare all analytics event names and their property shapes in a single typed module, and call sites SHALL use that contract rather than inline string literals. The contract MUST be covered by tests asserting that instrumented flows capture the expected events.

#### Scenario: Events are captured through the contract

- **WHEN** an instrumented interaction occurs
- **THEN** the event name and properties originate from the typed contract
- **AND** a call site cannot introduce an unregistered event name without a type error

#### Scenario: Instrumented flows are tested

- **WHEN** the test suite runs
- **THEN** tests assert that each instrumented marketing flow captures its expected event and properties against a mocked client

### Requirement: Analytics data minimization

Analytics MUST NOT capture session recordings, page content, form input values, or guest contact data. Collected data MUST remain within what the published privacy policy discloses.

#### Scenario: No recording or content capture

- **WHEN** any analytics client initializes
- **THEN** session recording and content capture remain disabled
- **AND** no form input values or free-text field contents are sent

#### Scenario: Guest contact data is never captured

- **WHEN** a guest interacts with any wishlist or finder flow
- **THEN** no name, email address, phone number, or message text is included in any event

#### Scenario: Collection matches disclosure

- **WHEN** analytics events are added or changed
- **THEN** the collected data remains consistent with the processors and purposes named in the privacy policy
