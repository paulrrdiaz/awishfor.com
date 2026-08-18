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

- **WHEN** Clerk rejects a sign-up attempt with one error associated with the email or password field
- **THEN** the form SHALL display the Spanish translation for known Clerk error codes beneath that field and remain on the page

#### Scenario: Clerk rejects sign-up with multiple simultaneous errors

- **WHEN** Clerk returns multiple errors for one sign-up attempt
- **THEN** the form SHALL preserve every returned message, display email and password errors beneath their corresponding fields, display unassociated errors in the general form banner, and remain on the page

#### Scenario: Clerk rejects sign-up without a field association

- **WHEN** Clerk rejects a sign-up attempt with an error that is not associated with the email or password field
- **THEN** the form SHALL display Clerk's human-readable message in the general form banner and remain on the page

#### Scenario: Clerk loses the current sign-up attempt

- **WHEN** Clerk rejects the verification-code request with `client_state_invalid`
- **THEN** the system SHALL reset the stale sign-up state, display a Spanish retry message, and keep the user on the sign-up form

#### Scenario: Clerk client state survives application navigation

- **WHEN** the root `ClerkProvider` renders or persists across application routes
- **THEN** Clerk middleware SHALL cover every non-static page request, every API request, and Clerk's `/__clerk` frontend routes without making public pages protected

#### Scenario: Design language on desktop and mobile

- **WHEN** the sign-up page renders at ≥1024px versus at 390px
- **THEN** desktop SHALL show the split brand-panel + form layout and mobile SHALL show a single centered card, both using the app brand tokens and Spanish copy

### Requirement: Custom sign-in form

The system SHALL provide a sign-in page at `src/app/(auth)` built with `react-hook-form` and `zod`, using Clerk's headless `useSignIn` hook. No Clerk pre-built UI component SHALL be used. The page SHALL follow the "A Wish For" app design language (brand tokens, Lora serif headings, Inter body, JetBrains Mono eyebrow, pill primary button, Spanish copy), SHALL render a two-column split layout with a brand panel at desktop widths (≥1024px) collapsing to a single centered card on mobile, and SHALL include a "¿Olvidaste tu contraseña?" link to the password recovery flow.

#### Scenario: Successful sign-in

- **WHEN** a user submits the sign-in form with valid credentials
- **THEN** Clerk SHALL establish an active session and the user SHALL be redirected to the resolved post-authentication destination (the validated `redirect_url`, or `/dashboard` when absent/invalid)

#### Scenario: Invalid credentials

- **WHEN** Clerk rejects a sign-in attempt with one error associated with the email or password field
- **THEN** the form SHALL display the Spanish translation for known Clerk error codes beneath that field and remain on the page

#### Scenario: Clerk rejects sign-in with multiple simultaneous errors

- **WHEN** Clerk returns multiple errors for one sign-in attempt
- **THEN** the form SHALL preserve every returned message, display email and password errors beneath their corresponding fields, display unassociated errors in the general form banner, and remain on the page

#### Scenario: Clerk rejects sign-in without a field association

- **WHEN** Clerk rejects a sign-in attempt with an error that is not associated with the email or password field
- **THEN** the form SHALL display Clerk's human-readable message in the general form banner and remain on the page

#### Scenario: Recovery link is present

- **WHEN** the sign-in page renders
- **THEN** it SHALL show a "¿Olvidaste tu contraseña?" link that navigates to the password recovery route

#### Scenario: Design language on desktop and mobile

- **WHEN** the sign-in page renders at ≥1024px versus at 390px
- **THEN** desktop SHALL show the split brand-panel + form layout and mobile SHALL show a single centered card, both using the app brand tokens and Spanish copy
