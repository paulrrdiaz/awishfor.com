## MODIFIED Requirements

### Requirement: Authentication provider

The system SHALL use Clerk as the authentication backend. Every route group that consumes Clerk client state SHALL be wrapped in `ClerkProvider`, while anonymous marketing and published public-wishlist surfaces that need only server authentication SHALL render outside the client provider boundary. Clerk environment variables SHALL be validated through `src/env.ts`.

#### Scenario: Missing Clerk keys at startup

- **WHEN** the app starts without the required Clerk environment variables set
- **THEN** environment validation SHALL fail with a clear error identifying the missing Clerk variables

#### Scenario: Clerk session available to the app

- **WHEN** a request is handled in an authenticated, auth-flow, or creation surface with a valid Clerk session
- **THEN** the current user's authentication state SHALL be accessible to server and client components via Clerk

#### Scenario: Public wishlist retains server authorization

- **WHEN** a signed-in owner requests their draft wishlist through `/w/<slug>`
- **THEN** server authentication SHALL recognize the owner and allow the existing draft preview
- **AND** the public wishlist SHALL not require the Clerk client provider or its UI packages

#### Scenario: Anonymous published wishlist omits Clerk client UI

- **WHEN** a signed-out guest opens a published `/w/<slug>` page
- **THEN** no Clerk client UI package is requested
- **AND** the wishlist remains fully usable for public guest interactions

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

- **WHEN** the scoped `ClerkProvider` persists across sign-up, sign-in, verification, recovery, OAuth callback, creation, and protected application routes
- **THEN** Clerk client state remains available throughout those flows
- **AND** Clerk middleware continues to cover required page, API, and `/__clerk` requests without making public pages protected

#### Scenario: Design language on desktop and mobile

- **WHEN** the sign-up page renders at ≥1024px versus at 390px
- **THEN** desktop SHALL show the split brand-panel + form layout and mobile SHALL show a single centered card, both using the app brand tokens and Spanish copy
