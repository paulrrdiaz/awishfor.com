## Why

The PostHog project for A Wish For has not received production events, so the new Wishlist & Wizard Funnel dashboard cannot yet provide trustworthy visibility. The public-wishlist event contract is implemented, but the creator wizard has no telemetry at all, leaving the main creator conversion path unmeasurable.

## What Changes

- Verify that the deployed application sends analytics to the intended PostHog US project and record a production ingestion check without polluting reports from development or tests.
- Extend the typed analytics contract with privacy-safe creator-wizard start, forward-step completion, and publish-success events.
- Instrument the wizard only after hydration and at confirmed user outcomes, preserving existing navigation, validation, authentication, and publishing behavior.
- Populate the existing PostHog `Wishlist & Wizard Funnel` dashboard with saved public-wishlist activity and creator-wizard funnel insights after their event schemas have appeared in production.
- Add focused regression tests for the wizard event sequence, event properties, no-duplicate behavior, and publish-success ordering.

## Capabilities

### New Capabilities

- `creator-wizard-analytics`: Defines privacy-safe creator-wizard conversion capture and the PostHog insights that make the wizard and existing public-wishlist events operationally visible.

### Modified Capabilities

None.

## Impact

- Affected code: `src/lib/analytics/events.ts`, the application analytics client, `src/components/features/wizard/wizard-shell.tsx`, publish flow components, and colocated tests.
- Affected external system: PostHog US project `575376` and its existing `Wishlist & Wizard Funnel` dashboard.
- No database migration, tRPC contract, new dependency, session replay, autocapture, or marketing/public-wishlist payload expansion is planned.
