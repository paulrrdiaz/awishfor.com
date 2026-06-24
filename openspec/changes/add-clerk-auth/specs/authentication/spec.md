## ADDED Requirements

### Requirement: Authentication provider

The system SHALL use Clerk as the authentication backend. The application root SHALL be wrapped in `ClerkProvider`, and Clerk environment variables SHALL be validated through `src/env.js`.

#### Scenario: Missing Clerk keys at startup

- **WHEN** the app starts without the required Clerk environment variables set
- **THEN** environment validation SHALL fail with a clear error identifying the missing Clerk variables

#### Scenario: Clerk session available to the app

- **WHEN** a request is handled in the app with a valid Clerk session
- **THEN** the current user's authentication state SHALL be accessible to server and client components via Clerk

### Requirement: Custom sign-up form

The system SHALL provide a sign-up page at `src/app/(auth)` built with `react-hook-form` and `zod`, using Clerk's headless `useSignUp` hook. No Clerk pre-built UI component SHALL be used.

#### Scenario: Successful email sign-up

- **WHEN** a user submits the sign-up form with a valid email and a password meeting the schema rules
- **THEN** the system SHALL create a Clerk sign-up attempt and begin email verification

#### Scenario: Invalid input is blocked client-side

- **WHEN** a user submits the sign-up form with an invalid email or a password that fails the zod schema
- **THEN** the form SHALL display validation errors and SHALL NOT call Clerk

#### Scenario: Clerk rejects the sign-up

- **WHEN** Clerk returns an error (e.g. email already in use)
- **THEN** the form SHALL surface a human-readable error message and remain on the page

### Requirement: Email verification for sign-up

The system SHALL require email-code verification to complete a sign-up, using Clerk's email verification flow.

#### Scenario: Valid code completes sign-up

- **WHEN** a user enters the correct verification code sent to their email
- **THEN** Clerk SHALL activate the session and the user SHALL be redirected to the post-authentication destination

#### Scenario: Invalid code

- **WHEN** a user enters an incorrect verification code
- **THEN** the system SHALL show an error and allow the user to retry

### Requirement: Custom sign-in form

The system SHALL provide a sign-in page at `src/app/(auth)` built with `react-hook-form` and `zod`, using Clerk's headless `useSignIn` hook. No Clerk pre-built UI component SHALL be used.

#### Scenario: Successful sign-in

- **WHEN** a user submits the sign-in form with valid credentials
- **THEN** Clerk SHALL establish an active session and the user SHALL be redirected to the post-authentication destination

#### Scenario: Invalid credentials

- **WHEN** a user submits incorrect credentials
- **THEN** the form SHALL display a human-readable error and remain on the page

### Requirement: Google OAuth on both pages

The system SHALL provide a reusable "Continue with Google" button on both the sign-up and sign-in pages that initiates Clerk Google OAuth via `authenticateWithRedirect` with `strategy: oauth_google`.

#### Scenario: User starts Google sign-in

- **WHEN** a user clicks "Continue with Google"
- **THEN** the system SHALL redirect to Google's OAuth consent flow through Clerk

#### Scenario: OAuth callback completes authentication

- **WHEN** Google redirects back to the application's OAuth callback route
- **THEN** Clerk SHALL finalize the session and the user SHALL be redirected to the post-authentication destination

### Requirement: Route protection

The system SHALL use `clerkMiddleware` to enforce authentication, keeping the sign-in and sign-up routes public while requiring a session for protected routes.

#### Scenario: Unauthenticated access to a protected route

- **WHEN** an unauthenticated user requests a protected route
- **THEN** the system SHALL redirect them to the sign-in page

#### Scenario: Auth pages remain public

- **WHEN** an unauthenticated user requests the sign-in or sign-up page
- **THEN** the system SHALL allow access without redirecting
