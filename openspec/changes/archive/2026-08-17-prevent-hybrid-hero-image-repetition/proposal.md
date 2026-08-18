## Why

Hybrid public-wishlist heroes currently feed the complete ordered cover-image collection to their carousel while also rendering entries from that collection in static slots. Guests therefore see the same photo repeated across simultaneous static and rotating positions, weakening the intended multi-photo composition.

## What Changes

- Partition ordered cover images between static slots and the carousel in hybrid layouts so a cover image is assigned to only one of those roles.
- Make the first two ordered images static and give the remaining ordered images to the carousel in `arch-trio` and `collage-staggered`.
- Preserve the gallery fallback: one remaining carousel image renders as a fixed frame without navigation, while two or more remaining images render carousel controls and autoplay.
- Add a responsive white ring to the large carousel frame in `arch-trio`, matching the visual treatment of its smaller circular frames.
- Keep cover-image persistence, ordering, upload limits, layout publication requirements, and intentionally decorative non-carousel image reuse unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `public-wishlist-layout`: Define exclusive image allocation for hybrid static-plus-carousel heroes and the white-ring treatment for the `arch-trio` carousel frame.

## Impact

- Affected UI: `arch-trio` and `collage-staggered` public-wishlist hero compositions in full, preview, and compact modes.
- Affected shared logic/tests: hero image-slot allocation and carousel regression coverage.
- No API, database schema, environment-variable, dependency, or persisted-data changes.
- Non-goals: changing upload order, deduplicating equal URLs, changing the six-image cap or publication readiness, redesigning carousel controls, or removing deliberate decorative reuse outside the carousel.
