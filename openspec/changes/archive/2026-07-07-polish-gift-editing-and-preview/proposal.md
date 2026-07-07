## Why

The Gifts step currently exposes the right data, but key interactions feel incomplete: editing a listed gift lacks a focused drawer flow, the guest preview crops product images, and category chips use text-heavy actions that crowd the UI. This change improves the owner-facing creation experience so gift setup and preview review feel polished before publish.

## What Changes

- Open a drawer when the user clicks `Editar` for a draft gift in the Gifts step.
- Store the selected gift id in the URL query string, using a query param such as `giftId`, so the edit drawer is deep-linkable and closes cleanly by clearing the param.
- Let the drawer edit the existing draft gift fields already supported by the wizard draft store, then reflect saved changes in the gift list and preview.
- Improve the guest preview gift cards so product images are fully visible instead of being awkwardly cropped; prefer a denser responsive layout such as three columns on wide viewports when space allows.
- Replace category chip text actions (`Renombrar`, `Quitar`) with icon buttons and accessible tooltips.
- Preserve existing Spanish labels and the Claude Design visual direction.

Non-goals:

- No new database fields, Prisma migration, or persistence model changes.
- No URL importer implementation.
- No public purchase flow changes.
- No dashboard gift management changes beyond shared component updates required by the wizard.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `creation-wizard`: The Gifts step edit interaction, URL state, and preview gift card layout requirements are changing.
- `category-management-ui`: Wizard category action controls should use icon buttons with accessible tooltips instead of text action labels.

## Impact

- Affected UI likely includes `src/app/create`, wizard gift components, draft store selectors/actions, preview gift card components, and shared drawer/tooltip/button primitives.
- `nuqs` may be used for query-param state if already present or added as a dependency.
- No API, Prisma schema, environment variable, or Clerk changes are expected.
- Tests should focus on draft gift edit behavior, query-param open/close behavior, category action accessibility, and preview card image/layout rendering where practical.
