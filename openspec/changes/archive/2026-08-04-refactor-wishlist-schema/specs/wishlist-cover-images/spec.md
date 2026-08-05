## ADDED Requirements

### Requirement: Cover images are ordered records

A wishlist's cover images SHALL be stored as `WishlistImage` records rather than as URL columns on `Wishlist`. Each record SHALL carry the hosted `url`, the source `width` and `height` in pixels, a derived `orientation`, and a `sortOrder` establishing the gallery order. Records SHALL be deleted when their wishlist is deleted.

#### Scenario: Images persist with order and dimensions

- **WHEN** a wishlist with three cover images is read
- **THEN** three `WishlistImage` records are returned in `sortOrder` order, each carrying its url, width, height and orientation

#### Scenario: Images are removed with their wishlist

- **WHEN** a wishlist is deleted
- **THEN** its `WishlistImage` records are deleted with it

#### Scenario: Reordering rewrites sort order

- **WHEN** the owner moves the third cover image to the first position
- **THEN** the records persist the new contiguous `sortOrder` values and subsequent reads return the new order

### Requirement: Orientation is classified from source dimensions

Each cover image's `orientation` SHALL be one of `landscape`, `portrait`, or `square`, derived from the source dimensions using the shared classification helper: a width-to-height ratio within a 0.15 deadband of 1 is `square`, a greater ratio is `landscape`, and a lesser ratio is `portrait`. Orientation SHALL be computed once when the image is added and persisted, not recomputed at render time.

#### Scenario: Wide image classified as landscape

- **WHEN** an image measuring 1600×900 is added as a cover image
- **THEN** its persisted orientation is `landscape`

#### Scenario: Tall image classified as portrait

- **WHEN** an image measuring 900×1600 is added as a cover image
- **THEN** its persisted orientation is `portrait`

#### Scenario: Near-square image classified as square

- **WHEN** an image measuring 1000×1050 is added as a cover image
- **THEN** its persisted orientation is `square` because the ratio falls within the deadband

#### Scenario: Orientation survives without the source file

- **WHEN** a persisted cover image is read for rendering
- **THEN** its orientation comes from the stored value without measuring the image again

### Requirement: View models expose ordered cover images

Public and dashboard wishlist view models SHALL expose cover images as an ordered collection of serializable entries carrying url, width, height and orientation, replacing the previous `coverImageUrl` and `coverImageUrls` fields. A wishlist with no cover images SHALL expose an empty collection rather than a null value.

#### Scenario: Public view model carries image metadata

- **WHEN** a wishlist with cover images is mapped to the public view model
- **THEN** the view model exposes the images in order, each with url, width, height and orientation, and exposes no `coverImageUrl` or `coverImageUrls` field

#### Scenario: Wishlist without images maps to an empty collection

- **WHEN** a wishlist with no cover images is mapped
- **THEN** the view model's image collection is empty and no null-guard is required by consumers

### Requirement: Wizard drafts carry unsaved cover images

The wizard draft store SHALL hold cover images in the same shape used by the persisted records — url, width, height, orientation and order — so a draft can be previewed and saved without re-measuring. The persisted store version SHALL be raised, and a persisted draft written before this change SHALL rehydrate without error.

#### Scenario: Draft image survives reload

- **WHEN** the user adds cover images and reloads the wizard
- **THEN** the restored draft holds each image's url, dimensions, orientation and order

#### Scenario: Pre-change persisted draft rehydrates

- **WHEN** a draft persisted under the previous store version is rehydrated
- **THEN** the store migrates it to the current shape without throwing, discarding values it cannot map
