## ADDED Requirements

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

## MODIFIED Requirements

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
