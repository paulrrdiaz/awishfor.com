## MODIFIED Requirements

### Requirement: Branded preview image

Each published wishlist SHALL expose a 1200×630 branded preview image that includes the A Wish For identity and the wishlist title. When the wishlist has a first ordered cover image, that image SHALL be the dominant visual of the composition, with the wishlist identity, event type, and title rendered as a legible overlay on top of it. The image SHALL fall back to a deterministic, text-only branded composition when the wishlist has no cover image or the cover image cannot be rendered. The preview image response SHALL complete within a bounded time even when the remote cover-image host is slow or unreachable, degrading to the fallback composition rather than remaining pending or returning an error.

#### Scenario: First cover image is available

- **WHEN** a published wishlist has one or more ordered cover images
- **THEN** its social preview renders that first image as the dominant visual of the branded 1200×630 composition, with the title and identity overlaid legibly on top of it

#### Scenario: Cover image is unavailable

- **WHEN** the wishlist has no cover image, or the first image cannot be rendered within a bounded time
- **THEN** the social preview still returns a valid branded 1200×630 image using the text-only fallback composition, without the response hanging on or erroring from the remote host's availability or latency
