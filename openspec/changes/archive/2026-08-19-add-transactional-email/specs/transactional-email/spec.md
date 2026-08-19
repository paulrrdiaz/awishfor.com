## ADDED Requirements

### Requirement: Provider configuration through validated environment

The system SHALL configure its transactional email provider through validated environment variables declared in `src/env.ts`, with placeholders in `.env.example`. The provider credential SHALL be optional, and the application SHALL start, build, typecheck, and run its test suite when the credential is absent.

#### Scenario: Credential is present

- **WHEN** the provider credential and sender identity are configured
- **THEN** the sender is able to dispatch messages through the provider

#### Scenario: Credential is absent

- **WHEN** the provider credential is not set in the environment
- **THEN** the application starts and serves requests normally
- **AND** environment validation does not fail
- **AND** no provider client is constructed

#### Scenario: Sender identity is validated

- **WHEN** the application reads its email configuration
- **THEN** the sending address is validated as an email address at startup rather than at send time

### Requirement: Single sender module

The system SHALL expose exactly one send entry point for transactional email, and the email provider's SDK types SHALL NOT appear in any signature outside the module that constructs the provider client. Application code, tRPC routers, services, and server actions SHALL NOT import the provider SDK directly.

#### Scenario: A feature sends an email

- **WHEN** application code needs to send a transactional message
- **THEN** it calls the shared send entry point with a rendered template
- **AND** it does not import or reference the provider SDK

#### Scenario: Provider replacement is contained

- **WHEN** the underlying provider is replaced
- **THEN** only the module constructing the provider client requires modification
- **AND** no calling feature's code changes

### Requirement: Unconfigured sending degrades to a no-op

When the provider credential is absent, the send entry point SHALL return a result indicating the send was skipped, SHALL NOT throw, and SHALL NOT attempt a network call.

#### Scenario: Sending without configuration

- **WHEN** a feature calls the send entry point and no provider credential is configured
- **THEN** the call returns a skipped result identifying the absent configuration as the reason
- **AND** no network request is made
- **AND** no exception propagates to the caller

#### Scenario: The calling feature continues

- **WHEN** a send is skipped because the provider is unconfigured
- **THEN** the user action that triggered the send still completes successfully

### Requirement: Sending occurs outside the request path

Transactional email SHALL be dispatched after the response to the triggering request has been sent. A mutation that triggers an email SHALL commit its database work before the send is scheduled, and the outcome of the send SHALL NOT determine the outcome of the mutation.

#### Scenario: A mutation triggers an email

- **WHEN** a mutation persists a change and triggers a transactional email
- **THEN** the database write is committed before the send is scheduled
- **AND** the mutation returns its result without waiting for the provider

#### Scenario: The provider is slow

- **WHEN** the email provider responds slowly or times out
- **THEN** the triggering mutation has already returned successfully
- **AND** the user's request latency is unaffected by the provider

#### Scenario: The database write fails

- **WHEN** the database write in a mutation that triggers email fails
- **THEN** no email is sent

### Requirement: Send failures are returned, never thrown

The send entry point SHALL catch all errors, including provider errors, network errors, and timeouts, and SHALL return a structured result distinguishing a successful send, a deliberately skipped send, and a failed send. It SHALL NOT throw under any circumstance.

#### Scenario: The provider returns an error

- **WHEN** the provider rejects a send request
- **THEN** the entry point returns a failed result carrying a description of the failure
- **AND** no exception escapes the entry point

#### Scenario: The network call fails

- **WHEN** the request to the provider fails at the network level
- **THEN** the entry point returns a failed result
- **AND** no unhandled promise rejection occurs

#### Scenario: A caller distinguishes outcomes

- **WHEN** a feature inspects a send result
- **THEN** it can distinguish a message that was sent, a message deliberately not sent, and a message whose send was attempted and failed

### Requirement: Non-production sends never reach real recipients

Outside a production environment, the system SHALL NOT deliver mail to the requested recipient address unless an explicit development redirect address is configured, in which case every recipient SHALL be rewritten to that single address.

#### Scenario: Sending in development without a redirect configured

- **WHEN** a send is triggered outside production and no development redirect address is configured
- **THEN** no message is delivered to any address
- **AND** the rendered subject, recipient, HTML body, and text body are written to the application log
- **AND** the entry point returns a skipped result identifying the non-production environment as the reason

#### Scenario: Sending in development with a redirect configured

- **WHEN** a send is triggered outside production and a development redirect address is configured
- **THEN** the message is delivered to the redirect address instead of the requested recipient
- **AND** the originally requested recipient is recorded in the message or the log

#### Scenario: The test suite sends no mail

- **WHEN** the unit test suite executes a code path that triggers a send
- **THEN** no network request is made to the provider

### Requirement: Messages carry a plain-text alternative

Every transactional message SHALL be defined by a template producing a subject, an HTML body, and a plain-text body. The plain-text body SHALL be required, SHALL convey the same information as the HTML body, and SHALL include any action URL present in the HTML body.

#### Scenario: A template is rendered

- **WHEN** a message template is rendered for sending
- **THEN** it produces a subject, an HTML body, and a plain-text body
- **AND** none of the three is empty

#### Scenario: Text alternative preserves the action

- **WHEN** an HTML body contains a link the recipient is expected to follow
- **THEN** the plain-text body contains the same destination URL in a form the recipient can open

#### Scenario: Message copy language

- **WHEN** any transactional message is rendered
- **THEN** its subject and both bodies are written in Spanish, consistent with the rest of the product
