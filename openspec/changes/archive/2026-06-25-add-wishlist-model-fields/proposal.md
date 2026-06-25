## Why

Wishlist records currently only support lifecycle state. To build public wishlist pages, creation flows, and owner management, the core wishlist model needs to persist owner, event, content, design, language, and currency settings.

## What Changes

- Add an owner relationship between `Wishlist` and `User`.
- Add required public identity fields for each wishlist: `title`, globally unique `slug`, and `eventType`.
- Add localization and pricing defaults with `language` defaulting to `es` and `currency` defaulting to `PEN`.
- Add public page copy fields: `heroTitle`, `welcomeMessage`, `thankYouMessage`, and `displayName`.
- Add optional event detail fields: `eventDate`, `eventTime`, and `eventLocation`.
- Add optional visual/media fields: `coverImageUrl`, `themeId`, `layoutId`, `buttonStyle`, and `fontPairing`.
- Add `showHowItWorks` defaulting to `true`.
- Update wishlist validation and service creation inputs so persisted wishlists can store these fields while lifecycle behavior remains intact.
- Non-goals: no rich-text event location, map links, slug redirect history, public discovery, checkout, payment processing, or hard delete.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `wishlist-lifecycle`: Expand wishlist requirements beyond lifecycle state so the core wishlist record stores owner, public page content, event metadata, localization, currency, and design settings.

## Impact

- `prisma/schema.prisma`: add fields, indexes/uniqueness, and `User` relation for `Wishlist`.
- `src/server/validators/wishlist.schema.ts`: validate creation/update inputs, enum defaults, optional event details, and string formats such as slug and `HH:mm` event time.
- `src/server/services/wishlist.service.ts`: accept and persist the expanded wishlist creation data while preserving draft/publish/archive/restore lifecycle helpers.
- Prisma migration and generated client refresh are required; generated files in `src/generated/prisma` remain untouched in source edits.
- No new environment variables or external dependencies are expected.
