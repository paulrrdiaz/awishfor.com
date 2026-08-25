## Context

See `proposal.md` for the motivation. The anonymous marketing and public-wishlist boundaries use the minimal first-party beacon transport because of strict route budgets. The creation wizard runs inside the Clerk-backed application shell, where the full PostHog client is already initialized with the shared anonymous identifier, automatic pageviews disabled, and person profiles limited to identified users.

The current typed contract contains marketing and public-wishlist events only. The public funnel calls are already in the client code, while `WizardShell` owns the forward navigation between seven non-published steps and `ReviewStep` owns the asynchronous publish success transition. PostHog project `575376` has no ingested client events, so its data schema cannot yet validate or support saved event insights.

## Goals / Non-Goals

**Goals:**

- Capture a minimal creator conversion sequence that accurately represents a user beginning, advancing through, and successfully publishing from `/create`.
- Preserve the existing cross-route visitor identifier and the application's identified-only profile policy.
- Prove the production deployment reaches PostHog project `575376`, then add saved insights to the existing dashboard using only verified schemas.

**Non-Goals:**

- Capture field edits, back/stepper navigation, save-draft activity, preview activity, validation error content, or any user-entered wizard data.
- Add server-side PostHog capture, database changes, session replay, autocapture, or new environment variables.
- Build an owner-facing analytics feature in the A Wish For application.

## Decisions

### 1. Use three event concepts with an allowlisted step property

Add `wizard_started`, `wizard_step_completed`, and `wishlist_published` to the shared typed contract. `wizard_step_completed` carries a `step` union of the forwardable non-terminal steps: `event-type`, `details`, `layout`, `theme`, `images`, and `gifts`.

One generic completion event makes the dashboard funnel composable through an exact event-property filter while keeping the contract small. `review` is terminal: a successful `wishlist_published` event, rather than a separate review-completed event, is the outcome that matters.

Alternatives considered:

- One event name per wizard step: rejected because the event catalog becomes noisy and new steps require dashboard restructuring.
- Step-view events: rejected because views conflate deliberate progress with direct URL access, back navigation, and stepper navigation.
- Tracking every draft mutation: rejected because it adds noise and risks collecting sensitive user content without improving the conversion funnel.

### 2. Capture confirmed client outcomes at their owning boundaries

`WizardShell` captures `wizard_started` after the initial step is hydrated and captures `wizard_step_completed` only after existing local validation permits the normal forward navigation. `ReviewStep` captures `wishlist_published` only after the publish mutation succeeds, alongside the existing transition to the published success state.

The application analytics client will expose a typed application capture method that waits for its already-configured PostHog runtime and otherwise resolves as a no-op. This avoids using the anonymous minimal transport in the application shell and preserves identity continuity.

### 3. Keep wizard payloads content-free

The only product property is `step` on `wizard_step_completed`. The remaining fields are PostHog transport metadata and the established distinct identifier. In particular, do not add the draft id, saved wishlist id, slug, title, event type, gift count, images, or URL. Those are unnecessary to calculate the funnel and could persist creator content in third-party analytics.

### 4. Create insights only after schema verification

Production capture is intentionally disabled in development and test, so local verification cannot populate PostHog. After deployment, exercise a fresh creator journey and a published guest journey, confirm their event definitions and allowed properties through the PostHog data schema, then save:

- a public-wishlist trends insight covering views, intent clicks, and confirmed outcomes; and
- an ordered creator funnel: `wizard_started` → each exact `wizard_step_completed.step` value → `wishlist_published`, with a 30-day conversion window matching the persisted-draft lifetime.

Attach both to dashboard `2028895` (`Wishlist & Wizard Funnel`). This sequence prevents empty or misspelled event references from becoming durable reporting artifacts.

## Risks / Trade-offs

- [Production environment is misconfigured or traffic has not reached it] → Confirm the deployed public key targets project `575376`, execute a controlled production journey, and verify the resulting schema before adding insights.
- [A rerender causes duplicate start events] → Guard initial capture by the hydrated navigation state and cover it with a component test.
- [A capture attempt races navigation] → Use non-blocking capture; analytics success is never a prerequisite for navigation or publish state.
- [Users return to a saved draft days later] → Use an ordered, 30-day funnel window; the metric measures eventual conversion, not same-session completion.

## Migration Plan

1. Deploy the typed wizard instrumentation with focused tests and normal quality checks.
2. Confirm the deployment exposes the configured PostHog project key and first-party ingest path.
3. Perform controlled creator and guest production journeys; inspect the target project schema and event payloads for the allowlisted properties.
4. Save and attach the two verified insights to dashboard `2028895`.
5. If capture fails or payloads contain unexpected properties, remove or disable the new capture calls and investigate configuration before relying on the dashboard; no data migration or rollback is required.
