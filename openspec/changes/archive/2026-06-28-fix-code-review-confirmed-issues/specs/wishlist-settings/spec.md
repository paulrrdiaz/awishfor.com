## MODIFIED Requirements

### Requirement: Share URL generation uses configurable origin

The system SHALL generate canonical wishlist share URLs using the `NEXT_PUBLIC_APP_URL` environment variable as the origin rather than a hardcoded production domain. In local and staging environments the configured origin SHALL be used so share links, WhatsApp messages, and QR codes point to the correct environment.

#### Scenario: Share URL uses configured origin in production

- **WHEN** a wishlist share URL is generated in production
- **THEN** the URL uses the `NEXT_PUBLIC_APP_URL` origin (e.g. `https://awishfor.com/w/<slug>`)

#### Scenario: Share URL uses localhost in development

- **WHEN** a wishlist share URL is generated in a local development environment with `NEXT_PUBLIC_APP_URL=http://localhost:4000`
- **THEN** the generated URL points to `http://localhost:4000/w/<slug>` rather than the production domain

#### Scenario: Missing NEXT_PUBLIC_APP_URL prevents app startup

- **WHEN** the application starts without `NEXT_PUBLIC_APP_URL` set in the environment
- **THEN** the `createEnv` validation throws and the app does not start, surfacing the missing variable
