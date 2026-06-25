## 1. Database Schema

- [x] 1.1 Add the `User.wishlists` relation and required `Wishlist.ownerId` relation.
- [x] 1.2 Add required `Wishlist` identity fields: `title`, globally unique `slug`, and `eventType`.
- [x] 1.3 Add `Wishlist.language` default `es` and `Wishlist.currency` default `PEN` using existing enums.
- [x] 1.4 Add public content fields: `heroTitle`, `welcomeMessage`, `thankYouMessage`, and `displayName`.
- [x] 1.5 Add optional event detail fields: `eventDate`, `eventTime`, and `eventLocation`.
- [x] 1.6 Add optional design fields: `coverImageUrl`, `themeId`, `layoutId`, `buttonStyle`, and `fontPairing`.
- [x] 1.7 Add `showHowItWorks` defaulting to true plus useful indexes for owner/status lookups.

## 2. Migration and Client

- [x] 2.1 Create a Prisma migration for the expanded wishlist model.
- [x] 2.2 Regenerate the Prisma client without manually editing `src/generated/prisma`.

## 3. Validation

- [x] 3.1 Expand wishlist create/update validators for owner, identity, content, event, design, language, currency, and how-it-works fields.
- [x] 3.2 Validate slug format and event time as 24-hour `HH:mm`.
- [x] 3.3 Preserve acceptance of optional event date/time/location, including dates in the past.

## 4. Service Layer

- [x] 4.1 Update wishlist creation to require an owner and persist expanded wishlist input with defaults.
- [x] 4.2 Preserve publish, archive, and restore lifecycle behavior with the expanded model.
- [x] 4.3 Add or update focused tests for defaults, required ownership, stored fields, slug validation, and event time validation.

## 5. Documentation and Verification

- [x] 5.1 Mark `docs/TASKS.md` milestone 1.2 tasks complete after implementation and validation status is known.
- [x] 5.2 Run `pnpm check` and address any issues.
- [x] 5.3 Run `pnpm test` and address any failures.
- [x] 5.4 Run `pnpm typecheck` and address any failures.
