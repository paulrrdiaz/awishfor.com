## 1. Extend the typed analytics contract

- [x] 1.1 Add `wizard_started`, `wizard_step_completed`, and `wishlist_published` to the shared analytics event contract, with an exhaustive allowlisted union for the six forwardable wizard steps.
- [x] 1.2 Expose a typed application-shell capture method that uses the initialized PostHog runtime and safely becomes a no-op when analytics is unavailable.
- [x] 1.3 Add unit coverage for the new event shapes and disabled/unconfigured application capture behavior.

## 2. Instrument creator conversion outcomes

- [x] 2.1 Capture one `wizard_started` event after the initial wizard step hydrates, without capturing during loading, recovery redirects, or the published success state.
- [x] 2.2 Capture `wizard_step_completed` only when the normal forward action passes existing validation and navigates away from `event-type`, `details`, `layout`, `theme`, `images`, or `gifts`.
- [x] 2.3 Capture `wishlist_published` only after the publish mutation succeeds and before the existing published success transition completes.
- [x] 2.4 Add focused component tests for exact-once start capture, valid and invalid forward navigation, stable step values, publish success ordering, and absence of capture on failed or unauthenticated publishing.

## 3. Verify production ingestion and configure reporting

- [ ] 3.1 Deploy or otherwise run a production-configured build that targets PostHog project `575376`, then perform a controlled creator wizard and published guest wishlist journey.
- [ ] 3.2 Inspect the PostHog data schema and sampled payloads to confirm all expected events arrived, the wizard payload contains only the allowlisted step property, and no anonymous guest person profile was created.
- [x] 3.3 Create and attach a saved public-wishlist activity trends insight to dashboard `2028895` using only verified public event definitions.
- [ ] 3.4 Create and attach a saved ordered creator-wizard funnel to dashboard `2028895`, filtering each repeated step-completion stage by its verified `step` value and using a 30-day conversion window.

## 4. Validate and document

- [x] 4.1 Run `pnpm check`, focused analytics and wizard tests, `pnpm test`, and `pnpm typecheck`.
- [x] 4.2 Record the deployed ingestion check, verified PostHog event/property schemas, dashboard insight URLs, and any unresolved production-only limitation in the change verification evidence.
