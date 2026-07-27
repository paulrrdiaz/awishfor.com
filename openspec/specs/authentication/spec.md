# authentication Specification

## Purpose
TBD - created by archiving change add-clerk-auth. Update Purpose after archive.
## Requirements
### Requirement: Authentication provider

The system SHALL use Clerk as the authentication backend. The application root SHALL be wrapped in `ClerkProvider`, and Clerk environment variables SHALL be validated through `src/env.js`.

#### Scenario: Missing Clerk keys at startup

- **WHEN** the app starts without the required Clerk environment variables set
- **THEN** environment validation SHALL fail with a clear error identifying the missing Clerk variables

#### Scenario: Clerk session available to the app

- **WHEN** a request is handled in the app with a valid Clerk session
- **THEN** the current user's authentication state SHALL be accessible to server and client components via Clerk

### Requirement: Custom sign-up form

The system SHALL provide a sign-up page at `src/app/(auth)` built with `react-hook-form` and `zod`, using Clerk's headless `useSignUp` hook. No Clerk pre-built UI component SHALL be used. The page SHALL follow the "A Wish For" app design language (brand tokens, Lora serif headings, Inter body, JetBrains Mono eyebrow, pill primary button, Spanish copy) and SHALL render a two-column split layout with a brand panel at desktop widths (≥1024px), collapsing to a single centered card on mobile.

#### Scenario: Successful email sign-up

- **WHEN** a user submits the sign-up form with a valid email and a password meeting the schema rules
- **THEN** the system SHALL create a Clerk sign-up attempt and begin email verification

#### Scenario: Invalid input is blocked client-side

- **WHEN** a user submits the sign-up form with an invalid email or a password that fails the zod schema
- **THEN** the form SHALL display validation errors and SHALL NOT call Clerk

#### Scenario: Clerk rejects the sign-up

- **WHEN** Clerk returns an error (e.g. email already in use)
- **THEN** the form SHALL surface a human-readable error message and remain on the page

#### Scenario: Design language on desktop and mobile

- **WHEN** the sign-up page renders at ≥1024px versus at 390px
- **THEN** desktop SHALL show the split brand-panel + form layout and mobile SHALL show a single centered card, both using the app brand tokens and Spanish copy

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

### Requirement: Email verification for sign-up

The system SHALL require email-code verification to complete a sign-up, using Clerk's email verification flow.

#### Scenario: Valid code completes sign-up

- **WHEN** a user enters the correct verification code sent to their email
- **THEN** Clerk SHALL activate the session and the user SHALL be redirected to the resolved post-authentication destination (the validated `redirect_url`, or `/dashboard` when absent/invalid)

#### Scenario: Invalid code

- **WHEN** a user enters an incorrect verification code
- **THEN** the system SHALL show an error and allow the user to retry

### Requirement: Custom sign-in form

The system SHALL provide a sign-in page at `src/app/(auth)` built with `react-hook-form` and `zod`, using Clerk's headless `useSignIn` hook. No Clerk pre-built UI component SHALL be used. The page SHALL follow the "A Wish For" app design language (brand tokens, Lora serif headings, Inter body, JetBrains Mono eyebrow, pill primary button, Spanish copy), SHALL render a two-column split layout with a brand panel at desktop widths (≥1024px) collapsing to a single centered card on mobile, and SHALL include a "¿Olvidaste tu contraseña?" link to the password recovery flow.

#### Scenario: Successful sign-in

- **WHEN** a user submits the sign-in form with valid credentials
- **THEN** Clerk SHALL establish an active session and the user SHALL be redirected to the resolved post-authentication destination (the validated `redirect_url`, or `/dashboard` when absent/invalid)

#### Scenario: Invalid credentials

- **WHEN** a user submits incorrect credentials
- **THEN** the form SHALL display a human-readable error and remain on the page

#### Scenario: Recovery link is present

- **WHEN** the sign-in page renders
- **THEN** it SHALL show a "¿Olvidaste tu contraseña?" link that navigates to the password recovery route

#### Scenario: Design language on desktop and mobile

- **WHEN** the sign-in page renders at ≥1024px versus at 390px
- **THEN** desktop SHALL show the split brand-panel + form layout and mobile SHALL show a single centered card, both using the app brand tokens and Spanish copy

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

### Requirement: Password recovery flow

The system SHALL provide a password recovery page under `src/app/(auth)` (e.g. `/forgot-password`) using Clerk's headless `useSignIn` signal API to send an email reset code and set a new password, then activate the session. The route SHALL be public in `src/proxy.ts`. The flow SHALL use `react-hook-form` and `zod` for input validation. No Clerk pre-built UI component SHALL be used.

#### Scenario: User requests a reset code

- **WHEN** a user submits a valid email on the recovery page
- **THEN** the system SHALL start a Clerk sign-in attempt for that identifier and send an email reset code, then advance to the code + new-password step

#### Scenario: Valid code and new password completes recovery

- **WHEN** a user enters the correct reset code and a new password meeting the schema rules
- **THEN** Clerk SHALL set the new password, activate the session, and the user SHALL be redirected to the resolved post-authentication destination (the validated `redirect_url`, or `/dashboard` when absent/invalid)

#### Scenario: Invalid code or weak password

- **WHEN** a user enters an incorrect reset code or a password that fails the zod schema
- **THEN** the system SHALL show a human-readable error and remain on the step, allowing retry

#### Scenario: Recovery route is public

- **WHEN** an unauthenticated user requests the recovery route
- **THEN** the middleware SHALL allow access without redirecting to sign-in

### Requirement: Check-your-email confirmation

The system SHALL present a "Revisa tu correo" confirmation state after a verification or reset code is sent, indicating a code was emailed and where to enter it. This confirmation MAY be an in-place state of the sign-up and recovery forms rather than a distinct route, so the active Clerk verification/reset session is preserved.

#### Scenario: Confirmation after sign-up code send

- **WHEN** the sign-up flow sends an email verification code
- **THEN** the system SHALL show the check-your-email confirmation with the code-entry field in the same view, preserving the Clerk sign-up session

#### Scenario: Confirmation after reset code send

- **WHEN** the recovery flow sends an email reset code
- **THEN** the system SHALL show the check-your-email confirmation with the code + new-password entry in the same view, preserving the Clerk sign-in session

