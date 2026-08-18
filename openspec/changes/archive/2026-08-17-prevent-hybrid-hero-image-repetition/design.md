## Context

See `proposal.md` for motivation and `specs/public-wishlist-layout/spec.md` for observable behavior.

`arch-trio` and `collage-staggered` currently resolve static image slots from the ordered `wishlist.images` collection, then pass that same complete collection to `HeroCarouselGallery`. A non-zero carousel start index changes only the initially selected slide; looping navigation eventually exposes every supplied image, including those already visible in static frames. `HeroCarouselGallery` already provides the required zero-, one-, and multi-image behavior, so the layouts need to change the collection they supply rather than change carousel mechanics.

Preview image composition appends sample records to the same ordered collection until the selected layout's required slot count is met. Persisted public wishlists and previews can therefore use one allocation rule without special-casing sample images.

The attached product reference adds a white ring to the large `arch-trio` frame. This is a later product decision that intentionally supersedes the existing no-ring statement in the capability spec. The Claude Design MCP is not available in this session, so implementation visual validation must use the supplied reference and existing responsive ring treatment.

## Goals / Non-Goals

**Goals:**

- Centralize order-preserving partitioning so hybrid layouts cannot accidentally feed primary static images back into their carousel.
- Preserve each image record, including preview-only `isSample` metadata, without mutation.
- Apply the Arch Trio ring in both the one-image fallback and multi-slide carousel branches.
- Keep allocation identical across full, preview, and compact modes.

**Non-Goals:**

- Deduplicating records by URL or changing creator-controlled ordering.
- Changing image persistence, upload limits, layout image requirements, or sample-image generation.
- Reworking `HeroCarouselGallery`, its autoplay timing, controls, or captions.
- Removing deliberate decorative copies outside the two primary static frames, including Collage Staggered's Polaroid treatment.

## Decisions

### Use an order-based partition helper

Add a small generic helper alongside `resolveHeroSlots` that accepts the ordered image collection and a static-slot count, returning null-padded static slots plus the untouched remainder for the carousel. Both hybrid layouts will request two static slots.

This makes the invariant explicit:

```text
ordered images:   [1, 2, 3, 4, 5]
static slots:     [1, 2]
carousel images:  [3, 4, 5]
```

The helper will partition by array position, not URL. URL-based deduplication was rejected because it changes the meaning of ordered records and could remove distinct entries that happen to share a source URL. Layout-local `slice()` calls were also considered, but a shared helper gives the cross-layout rule one unit-testable integration point and prevents the two layouts from drifting.

### Give the carousel only its owned subset

`arch-trio` and `collage-staggered` will pass only the partition remainder to `HeroCarouselGallery`. They will not use `startIndex` to hide static images: `startIndex` affects initial selection but does not remove slides, especially in a looping carousel.

The existing gallery component remains responsible for rendering a placeholder for zero images, a fixed frame for one image, and controls/autoplay for two or more. With the unchanged three-image publication requirement, a valid three-image wishlist produces two static frames and one fixed large frame; carousel controls begin at four total images.

Collage Staggered's two primary side frames will consume images 1 and 2. Its separate Polaroid remains a decorative treatment and is not part of the exclusive primary-static allocation contract.

### Put the Arch Trio ring on the gallery frame boundary

Add a white `3px` ring at the base breakpoint and `5px` from `sm` upward to the class list that defines Arch Trio's large circular gallery frame. `HeroCarouselGallery` applies that frame class to the fallback image slot when zero or one image is supplied and to the carousel root when multiple images are supplied, so one declaration covers every gallery state without changing shared gallery props.

Using an extra wrapper was rejected because it adds positioning and sizing complexity to the overlapping arc. Using the theme card token was rejected for the large frame because the new product decision explicitly calls for white, while the smaller frames retain their existing theme-card rings.

### Validate allocation independently and at layout integration points

Unit tests will cover partition sizes from zero through the six-image cap, order preservation, null padding, metadata preservation, and disjoint static/carousel outputs. Focused layout regression coverage will verify that both layouts use the partitioned subsets and that Arch Trio applies the white ring in fallback and multi-image states. Existing `HeroCarouselGallery` tests continue to cover control branching.

Visual validation will render Arch Trio at mobile and desktop widths with at least five uniquely identifiable images, confirm the white ring remains circular and evenly thick, and navigate through every slide to confirm images 1 and 2 never enter the carousel.

## Risks / Trade-offs

- **[Carousel controls now require four total images in hybrid layouts]** → This follows the specified ownership model: three total images leave one carousel-owned image, which correctly uses the gallery's no-controls fallback. Update regression expectations and comments that assume controls appear at two total cover images.
- **[Existing previews may appear to start on a different photo]** → Preserve upload order and document the deterministic mapping; no persisted data migration is needed.
- **[Border sizing could shrink or clip the image differently]** → Apply the border to the existing border-box frame and visually verify both responsive thicknesses and carousel controls at representative breakpoints.
- **[Decorative Collage reuse can still repeat a carousel-owned image]** → Keep it explicitly outside this change's primary-static/carousel uniqueness rule; address global no-repetition as a separate visual decision if desired.

## Migration Plan

No data, schema, API, configuration, or environment migration is required. Deploy the UI and tests together. Rollback consists of reverting the allocation call sites, helper, and Arch Trio border classes; persisted image order remains compatible in either direction.
