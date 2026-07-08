## ADDED Requirements

### Requirement: Post-authentication redirect target is validated

The system SHALL accept an optional `redirect_url` query parameter on the sign-in and sign-up routes as the desired post-authentication destination. The system SHALL treat `redirect_url` as safe to use only when it is a same-origin relative path (starts with a single `/`, does not start with `//` or `/\`, and does not contain `://`); any other value, or an absent `redirect_url`, SHALL resolve to `/dashboard`. This validated destination SHALL be used consistently by the password sign-in flow, the sign-up email-verification flow, the Google OAuth flow (including the redirect back through `/sso-callback`), and the already-authenticated redirect in route middleware.

#### Scenario: Valid relative redirect_url is honored

- **WHEN** the sign-in or sign-up route is loaded with `redirect_url=%2Fcreate%3Fstep%3Dpublish`
- **THEN** the resolved post-authentication destination is `/create?step=publish`

#### Scenario: Absolute or cross-origin redirect_url is rejected

- **WHEN** `redirect_url` is an absolute URL, a protocol-relative URL (e.g. `//evil.example`), or otherwise not a same-origin relative path
- **THEN** the resolved post-authentication destination falls back to `/dashboard`

#### Scenario: Missing redirect_url defaults to the dashboard

- **WHEN** the sign-in or sign-up route is loaded with no `redirect_url` present
- **THEN** the resolved post-authentication destination is `/dashboard`

## MODIFIED Requirements

### Requirement: Email verification for sign-up

The system SHALL require email-code verification to complete a sign-up, using Clerk's email verification flow.

#### Scenario: Valid code completes sign-up

- **WHEN** a user enters the correct verification code sent to their email
- **THEN** Clerk SHALL activate the session and the user SHALL be redirected to the resolved post-authentication destination (the validated `redirect_url`, or `/dashboard` when absent/invalid)

#### Scenario: Invalid code

- **WHEN** a user enters an incorrect verification code
- **THEN** the system SHALL show an error and allow the user to retry

### Requirement: Custom sign-in form

The system SHALL provide a sign-in page at `src/app/(auth)` built with `react-hook-form` and `zod`, using Clerk's headless `useSignIn` hook. No Clerk pre-built UI component SHALL be used.

#### Scenario: Successful sign-in

- **WHEN** a user submits the sign-in form with valid credentials
- **THEN** Clerk SHALL establish an active session and the user SHALL be redirected to the resolved post-authentication destination (the validated `redirect_url`, or `/dashboard` when absent/invalid)

#### Scenario: Invalid credentials

- **WHEN** a user submits incorrect credentials
- **THEN** the form SHALL display a human-readable error and remain on the page

### Requirement: Google OAuth on both pages

The system SHALL provide a reusable "Continue with Google" button on both the sign-up and sign-in pages that initiates Clerk Google OAuth via the headless `sso` flow (`signIn.sso`/`signUp.sso`).

#### Scenario: User starts Google sign-in

- **WHEN** a user clicks "Continue with Google"
- **THEN** the system SHALL redirect to Google's OAuth consent flow through Clerk, carrying the resolved post-authentication destination through the `/sso-callback` return URL

#### Scenario: OAuth callback completes authentication

- **WHEN** Google redirects back to the application's OAuth callback route
- **THEN** Clerk SHALL finalize the session and the user SHALL be redirected to the resolved post-authentication destination (the validated `redirect_url` carried through the callback URL, or `/dashboard` when absent/invalid)

### Requirement: Route protection

The system SHALL use `clerkMiddleware` to enforce authentication, keeping the sign-in and sign-up routes public while requiring a session for protected routes.

#### Scenario: Unauthenticated access to a protected route

- **WHEN** an unauthenticated user requests a protected route
- **THEN** the system SHALL redirect them to the sign-in page

#### Scenario: Auth pages remain public

- **WHEN** an unauthenticated user requests the sign-in or sign-up page
- **THEN** the system SHALL allow access without redirecting

#### Scenario: Already-authenticated visit to sign-in honors redirect_url

- **WHEN** an already-authenticated user requests the sign-in or sign-up route with a valid `redirect_url`
- **THEN** the middleware SHALL redirect them to the resolved destination instead of unconditionally redirecting to `/dashboard`
