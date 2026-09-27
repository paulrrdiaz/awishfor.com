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

The system SHALL resolve a single visitor to a single analytics identity across the marketing route, public-wishlist route, and application shell, so that a visitor who moves from the landing page into the creation wizard or a public wishlist is not recorded as multiple people. Person profiles SHALL be created only for identified users; anonymous visitors and wishlist guests MUST NOT produce person profiles.

#### Scenario: A visitor crosses from marketing into the application

- **WHEN** a visitor loads `/` and then navigates into the creation wizard
- **THEN** events captured on both routes share one visitor identifier
- **AND** a funnel from landing to wizard entry resolves them as one person

#### Scenario: A creator authenticates

- **WHEN** a visitor completes sign-up or sign-in
- **THEN** the analytics identity is associated with their authentication user id
- **AND** events captured before authentication remain attributed to the same person

#### Scenario: A guest crosses from the finder into a public wishlist

- **WHEN** a visitor uses the landing-page guest finder and navigates to a published `/w/<slug>` page
- **THEN** `guest_finder_used` and `public_wishlist_viewed` share one anonymous visitor identifier
- **AND** the visitor is not identified or promoted to a person profile

#### Scenario: Anonymous traffic creates no profiles

- **WHEN** an anonymous visitor browses the landing page or a public wishlist without authenticating
- **THEN** their events are captured
- **AND** no person profile is created for them

### Requirement: Public-wishlist guest funnel capture

The system SHALL capture exactly this public-wishlist v1 event surface from the client: `public_wishlist_viewed`, `gift_store_opened`, `gift_purchase_started`, `gift_marked_purchased`, `gift_purchase_failed`, `gift_purchase_undone`, and `rsvp_submitted`. Public filter, sort, scroll, and generic click interactions MUST NOT emit analytics events in this change. Analytics failure MUST NOT delay or break navigation, public mutations, refresh, or user feedback.

#### Scenario: A published public wishlist is viewed

- **WHEN** a published `/w/<slug>` page renders with analytics configured
- **THEN** exactly one `public_wishlist_viewed` event is captured for the navigation
- **AND** the event identifies the route variant as `public`

#### Scenario: A personalized public wishlist is viewed

- **WHEN** a valid published `/w/<slug>/<guestSlug>` page renders with analytics configured
- **THEN** exactly one `public_wishlist_viewed` event is captured for the navigation
- **AND** the event identifies the route variant as `personalized`

#### Scenario: A draft-owner preview is viewed

- **WHEN** an owner opens a draft wishlist through `/w/<slug>`
- **THEN** no `public_wishlist_viewed` event is captured

#### Scenario: A published owner view uses the anonymous hot path

- **WHEN** a signed-in owner opens their own published `/w/<slug>` page
- **THEN** the view MAY be counted as `public_wishlist_viewed`
- **AND** analytics does not add an authentication lookup to distinguish the owner from a guest

#### Scenario: A guest opens the external store

- **WHEN** a guest activates a gift's external-store action
- **THEN** `gift_store_opened` is captured with the internal wishlist and gift identifiers
- **AND** capture does not delay or block opening the store

#### Scenario: A guest starts the purchase flow

- **WHEN** a guest opens the purchase form for a gift
- **THEN** `gift_purchase_started` is captured with the internal wishlist and gift identifiers

#### Scenario: A purchase succeeds

- **WHEN** `markGiftPurchased` returns success to the browser
- **THEN** `gift_marked_purchased` is captured from the success callback
- **AND** no success event is emitted before the server confirms the mutation

#### Scenario: A purchase fails

- **WHEN** `markGiftPurchased` returns an error to the browser
- **THEN** `gift_purchase_failed` is captured with a normalized error code
- **AND** the raw error message and submitted form values are not captured

#### Scenario: A purchase is undone

- **WHEN** `undoRecentPurchase` returns success to the browser
- **THEN** `gift_purchase_undone` is captured with the internal wishlist and gift identifiers

#### Scenario: An RSVP response succeeds

- **WHEN** `invite.respond` returns success to the browser
- **THEN** `rsvp_submitted` is captured with response status and party size
- **AND** no guest identifier or guest name is captured

### Requirement: Public-wishlist analytics property allowlist

Public-wishlist analytics SHALL use explicit capture rather than automatic pageviews or autocapture. The final outbound payload MAY contain stable internal `wishlist_id` and `gift_id`, event type, layout id, theme id, `route_variant`, gift count, referrer hostname, allowlisted campaign parameters, normalized error code, RSVP status, and party size as applicable. It MUST NOT contain wishlist or guest slugs, wishlist titles, gift names, guest identifiers or names, contact details, form values, raw referrers, pathnames, or full or partial public-wishlist URLs.

#### Scenario: Automatic public capture is disabled

- **WHEN** the public-wishlist analytics client initializes
- **THEN** automatic pageview capture and autocapture are disabled
- **AND** only the registered public-wishlist events can be emitted by the public instrumentation

#### Scenario: Automatic client properties are sanitized

- **WHEN** a public-wishlist event reaches the analytics transport boundary
- **THEN** the complete outbound properties, including properties automatically added by the client, match the public allowlist
- **AND** `$current_url`, `$pathname`, raw referrer fields, or equivalent properties do not reveal a wishlist slug or `guestSlug`

#### Scenario: Public attribution is minimized

- **WHEN** a public-wishlist view has a referrer or campaign parameters
- **THEN** the event may contain only the referrer hostname and explicitly allowlisted campaign parameters
- **AND** no raw referrer or unrecognized query parameter is captured

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

### Requirement: Public-wishlist analytics payload budget

Analytics MUST NOT push `/w/*` past the established public-wishlist JavaScript budget. Total compressed route JavaScript MUST remain at or below the configured 225,280-byte `javascriptBytes` ceiling for both light and heavy audit fixtures. This change MUST NOT raise that ceiling or defer or conditionally load analytics merely to move its bytes outside the audit measurement window.

#### Scenario: The public-wishlist route remains within budget

- **WHEN** the production public-wishlist audit runs after analytics is added
- **THEN** both light and heavy fixtures remain at or below 225,280 compressed JavaScript bytes
- **AND** the analytics delta is recorded against a baseline captured before implementation

#### Scenario: The minimal runtime does not fit

- **WHEN** the minimal client and public instrumentation exceed the configured public-wishlist JavaScript ceiling
- **THEN** implementation pauses and the analytics design is revisited
- **AND** the budget is not raised or evaded as part of this change

#### Scenario: The public performance audit is verification evidence

- **WHEN** this change is reviewed
- **THEN** its verification records the before-and-after production public-wishlist audit results
- **AND** any failures that predate analytics are distinguished from the analytics delta

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
- **THEN** tests assert that each instrumented marketing and public-wishlist flow captures its expected event and properties against a mocked client

### Requirement: Analytics data minimization

Analytics MUST NOT capture session recordings, page content, form input values, guest contact data, human-readable wishlist or gift content, or personalized public URLs. Collected data MUST remain within what the published privacy policy discloses.

#### Scenario: No recording or content capture

- **WHEN** any analytics client initializes
- **THEN** session recording and content capture remain disabled
- **AND** no form input values or free-text field contents are sent

#### Scenario: Guest contact data is never captured

- **WHEN** a guest interacts with any wishlist or finder flow
- **THEN** no name, email address, phone number, or message text is included in any event

#### Scenario: Public route identity is never captured as content

- **WHEN** a guest interacts with `/w/<slug>` or `/w/<slug>/<guestSlug>`
- **THEN** no wishlist slug, guest slug, wishlist title, gift name, guest identifier, pathname, or public-wishlist URL is included in any event
- **AND** stable internal wishlist and gift identifiers MAY be included

#### Scenario: Collection matches disclosure

- **WHEN** analytics events are added or changed
- **THEN** the collected data remains consistent with the processors and purposes named in the privacy policy
