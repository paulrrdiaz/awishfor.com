## ADDED Requirements

### Requirement: Persisted User record

The system SHALL persist a `User` record in its own database for each Clerk user, keyed by the Clerk user id stored as a unique `clerkId`. The record SHALL store the user's primary email, display name, and image URL, along with creation and update timestamps.

#### Scenario: User shape

- **WHEN** a `User` row exists
- **THEN** it has a unique `clerkId` matching the Clerk user id, a unique `email`, an optional `name` and `imageUrl`, and `createdAt`/`updatedAt` timestamps

#### Scenario: Clerk id is the join key

- **WHEN** server code needs the local record for an authenticated request
- **THEN** it resolves the `User` by `clerkId` (from the Clerk session), not by the local autoincrement id

### Requirement: Webhook signature verification

The webhook endpoint SHALL verify every incoming request's signature using `verifyWebhook` from `@clerk/nextjs/webhooks` against `CLERK_WEBHOOK_SIGNING_SECRET` before processing, and SHALL reject unverifiable requests.

#### Scenario: Valid signature

- **WHEN** a request with a valid Clerk (Svix) signature is received at the webhook route
- **THEN** the system parses the typed event and proceeds to handle it

#### Scenario: Invalid or missing signature

- **WHEN** a request with a missing or invalid signature is received
- **THEN** the system does NOT mutate the database and responds with HTTP 400

### Requirement: Webhook route is publicly reachable

The webhook route SHALL be excluded from Clerk authentication middleware so Clerk's servers can deliver events without a session.

#### Scenario: Unauthenticated delivery

- **WHEN** Clerk POSTs an event to `/api/webhooks/clerk` with no user session
- **THEN** the middleware allows the request through and does not return 401/redirect

### Requirement: User creation sync

The system SHALL create (upsert) a local `User` when it receives a `user.created` event, populating `clerkId`, `email`, `name`, and `imageUrl` from the event payload.

#### Scenario: New user created in Clerk

- **WHEN** a `user.created` event is verified and handled
- **THEN** a `User` row exists with `clerkId` equal to the event `data.id` and the primary email from `data.email_addresses`

#### Scenario: Duplicate delivery is idempotent

- **WHEN** a `user.created` event is delivered more than once for the same user
- **THEN** exactly one `User` row exists for that `clerkId` and no error is returned

### Requirement: User update sync

The system SHALL update the matching local `User` when it receives a `user.updated` event, refreshing email, name, and image URL.

#### Scenario: Profile changed in Clerk

- **WHEN** a `user.updated` event is verified and handled for an existing user
- **THEN** the `User` row's `email`, `name`, and `imageUrl` reflect the new payload values

#### Scenario: Update for unknown user

- **WHEN** a `user.updated` event arrives for a `clerkId` not present locally
- **THEN** the system upserts the user rather than failing

### Requirement: User deletion sync

The system SHALL delete the matching local `User` when it receives a `user.deleted` event. When the event payload does not include a `clerkId`, the system SHALL log a warning and skip the deletion rather than failing silently.

#### Scenario: User deleted in Clerk

- **WHEN** a `user.deleted` event is verified and handled with a valid `clerkId`
- **THEN** the `User` row with the matching `clerkId` no longer exists

#### Scenario: Delete for unknown user

- **WHEN** a `user.deleted` event arrives for a `clerkId` not present locally
- **THEN** the system responds successfully without throwing

#### Scenario: Missing clerkId in deletion event

- **WHEN** a verified `user.deleted` event is received but `evt.data.id` is falsy
- **THEN** the system logs a warning identifying the anomaly and responds successfully without performing any database deletion

### Requirement: Reliable acknowledgement

The system SHALL respond with a 2xx status only after a handled event is successfully processed, and SHALL respond with a non-2xx status on processing failure so Clerk retries delivery. Events whose type is not subscribed SHALL be acknowledged with 2xx and ignored.

#### Scenario: Successful processing

- **WHEN** a subscribed event is handled without error
- **THEN** the endpoint returns HTTP 200

#### Scenario: Processing failure triggers retry

- **WHEN** the database operation for a verified event throws
- **THEN** the endpoint returns a non-2xx status so Clerk re-delivers the event

#### Scenario: Unsubscribed event type

- **WHEN** a verified event of an unhandled type is received
- **THEN** the endpoint returns HTTP 200 and makes no database change

### Requirement: Database access via tRPC context

Server code SHALL access the database through a single Prisma client instance exposed on the tRPC context, avoiding multiple client instances in development.

#### Scenario: Router queries the database

- **WHEN** a tRPC procedure runs
- **THEN** it can read and write `User` records through `ctx.db` backed by the shared Prisma client
