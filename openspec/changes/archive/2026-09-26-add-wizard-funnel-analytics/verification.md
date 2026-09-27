## In-repository verification — 2026-08-24

- `pnpm check` passed.
- `pnpm test -- src/lib/analytics/analytics.test.ts src/components/features/wizard/wizard-shell.test.tsx src/components/features/wizard/review-step.test.tsx` passed: 162 files, 1,250 tests. (The repository test script ran the complete suite.)
- `pnpm typecheck` passed.
- `pnpm build` passed using the production build configuration.

## Production/PostHog verification — pending

PostHog US opened at `https://us.posthog.com/login` without an authenticated
session. Port 4000 is already occupied by a Next.js development server (with
Dev Tools/HMR), so its browser journey cannot emit production-only analytics;
the browser also has no signed-in Clerk user for the publish-success step.
Therefore the following release requirements remain unverified and no dashboard
changes were made:

- Deployment or production-configured controlled creator and guest journeys for
  project `575376`.
- Event/property schemas and sampled payloads, including identified-only person
  profile behavior.
- Public-wishlist activity insight and ordered creator-wizard funnel attached to
  dashboard `2028895`.

Resume after a deployed environment and authenticated PostHog access are
available. Add resulting schema evidence and saved-insight URLs here before
completing task 4.2.

## PostHog MCP verification — 2026-08-31

The PostHog MCP connection is authenticated to the intended US project
`575376`; dashboard `2028895` is the existing **Wishlist & Wizard Funnel**
dashboard. A fresh production build was served locally with the configured
public key and first-party `/ingest` path. A clean browser journey entered
`/create`, retained anonymous id `c130fa81-6125-4291-a870-ed72782546af`, chose
an event type, and advanced to `?step=details` without blocking navigation.

Live PostHog schema verification confirms these public definitions are present:
`public_wishlist_viewed`, `gift_store_opened`, `gift_purchase_started`,
`gift_marked_purchased`, and `rsvp_submitted`. A test trends query returned
nonzero 30-day activity for each expected public journey stage. The saved,
dashboard-attached insight is:

- **Verified public wishlist activity** —
  `https://us.posthog.com/project/575376/insights/0iRLcyjz`

The live schema also recognizes `wizard_started`; its sampled properties are
transport and browser metadata only, with no draft content. It does **not yet**
recognize `wizard_step_completed`, the `step` property, or
`wishlist_published`. Consequently, the ordered creator funnel has not been
created: the specification explicitly prohibits saving an insight that names
unverified event definitions or properties. A production path capable of a
successful authenticated publish is still required before completing tasks 3.1,
3.2, and 3.4. Anonymous guest person-profile verification also remains tied to
that controlled public journey.

## PostHog MCP verification — 2026-09-27

Controlled journeys against project `575376` (production-configured build) have
now landed the full creator event schema. A 30-day HogQL check found:

| event | `step` | count |
| --- | --- | --- |
| `wizard_started` | — | 6 |
| `wizard_step_completed` | `event-type` | 3 |
| `wizard_step_completed` | `details` | 2 |
| `wizard_step_completed` | `layout` | 2 |
| `wizard_step_completed` | `theme` | 2 |
| `wizard_step_completed` | `images` | 1 |
| `wizard_step_completed` | `gifts` | 1 |
| `wishlist_published` | — | 1 |

- `wizard_step_completed` properties: `step` plus standard PostHog metadata; no
  draft content. `wishlist_published` has no product properties (the
  `$user_id` seen is transport metadata from the identified creator).
- Person profiles: all public-wishlist events (`public_wishlist_viewed` 246,
  `gift_store_opened` 46, `gift_marked_purchased` 24) carry
  `$process_person_profile = false`, so no anonymous guest profile is created.
  `wishlist_published` is the only identified event; anonymous `/create`
  starts also carry no profile.
- Saved, dashboard-attached insights (dashboard `2028895`):
  - **Verified public wishlist activity** —
    `https://us.posthog.com/project/575376/insights/0iRLcyjz`
  - **Creator wizard funnel** (ordered, 30-day window, each step filtered by
    exact `step` value) —
    `https://us.posthog.com/project/575376/insights/POgRiisL`

Limitation: this evidence comes from a locally served production build rather
than a public deployment; the ingestion path and key are the same.
