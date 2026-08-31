# public-wishlist-social-metadata Specification

## Purpose

Defines privacy-safe, crawler-readable social metadata and branded preview images for shared public wishlist links without making those links discoverable in search.
## Requirements
### Requirement: Published wishlist social metadata

A published wishlist at `/w/<slug>` SHALL return crawler-readable metadata in the initial HTML containing a localized, event-aware social title, a non-empty bounded description, an absolute canonical URL, Open Graph website fields, a Twitter summary-large-image card, and at least one absolute 1200×630 preview-image URL. When an event date exists, the social title SHALL combine the wishlist title, the date formatted with weekday in the wishlist language, and the A Wish For identity. When no event date exists, the social title SHALL combine the wishlist title, a locale-appropriate wishlist label, and the A Wish For identity. The complete social title SHALL be bounded to 60 characters by truncating only the wishlist-title portion at a word boundary when necessary. The social description SHALL use the whitespace-normalized welcome message, truncate it at a word boundary to no more than 125 characters, and use non-empty event-aware fallback copy when the welcome message is empty. The canonical and social URLs SHALL use the configured public application origin and the clean `/w/<slug>` path.

#### Scenario: Published wishlist emits complete social tags

- **WHEN** a crawler requests a published wishlist URL
- **THEN** the initial HTML contains canonical, Open Graph, and Twitter Card metadata with absolute URLs
- **AND** the Open Graph and Twitter metadata identify the wishlist with the same bounded social title and description

#### Scenario: Dated Spanish wishlist uses localized title

- **WHEN** a Spanish-language published wishlist has an event date
- **THEN** its social title includes the wishlist title, the Spanish weekday and date, and `A Wish For`
- **AND** the complete social title does not exceed 60 characters

#### Scenario: Dated English wishlist uses localized title

- **WHEN** an English-language published wishlist has an event date
- **THEN** its social title includes the wishlist title, the English weekday and date, and `A Wish For`
- **AND** the complete social title does not exceed 60 characters

#### Scenario: Wishlist without event date uses branded fallback title

- **WHEN** a published wishlist has no event date
- **THEN** its social title includes the wishlist title, a wishlist label in the configured language, and `A Wish For`
- **AND** no missing or invalid date text appears

#### Scenario: Welcome message is too long for the social description

- **WHEN** the normalized welcome message exceeds 125 characters
- **THEN** the social description ends at a word boundary with an ellipsis and does not exceed 125 characters

#### Scenario: Welcome message is empty

- **WHEN** the welcome message is empty or whitespace-only
- **THEN** the social description uses non-empty event-aware fallback copy bounded to 125 characters

#### Scenario: Metadata requires no client execution

- **WHEN** a social crawler reads only the server-rendered HTML without executing JavaScript
- **THEN** every required social metadata field is available in that HTML

### Requirement: Branded preview image

Each published wishlist SHALL expose a 1200×630 branded JPEG preview image that includes the A Wish For identity and the wishlist title. When the wishlist has a first ordered cover image, that image SHALL be the dominant visual of the composition, with the wishlist identity, event type, and title rendered as a legible overlay on top of it. The image SHALL fall back to a deterministic, text-only branded composition when the wishlist has no cover image or the cover image cannot be rendered. The encoded preview response MUST remain below 1 MiB for both cover-photo and fallback compositions and SHALL target 500 KiB or less for representative production fixtures. The preview image response SHALL complete within a bounded time even when the remote cover-image host is slow or unreachable, degrading to the fallback composition rather than remaining pending or returning an error.

#### Scenario: First cover image is available

- **WHEN** a published wishlist has one or more ordered cover images
- **THEN** its social preview renders that first image as the dominant visual of the branded 1200×630 composition, with the title and identity overlaid legibly on top of it
- **AND** the response declares a JPEG content type and remains below 1 MiB

#### Scenario: Cover image is unavailable

- **WHEN** the wishlist has no cover image, or the first image cannot be rendered within a bounded time
- **THEN** the social preview still returns a valid branded 1200×630 JPEG using the text-only fallback composition, without the response hanging on or erroring from the remote host's availability or latency
- **AND** the response remains below 1 MiB

#### Scenario: Representative social cards meet the preferred budget

- **WHEN** deterministic cover-photo and text-only social-card fixtures are encoded during verification
- **THEN** each resulting response is 500 KiB or less

### Requirement: Social metadata preserves wishlist privacy

Wishlist social metadata and preview images MUST contain only public wishlist presentation fields. They MUST NOT contain guest names or slugs, owner identity, contact or delivery details, hidden or deleted gifts, purchase records, internal notes, or draft-only content.

#### Scenario: Personalized URL is shared

- **WHEN** a crawler requests `/w/<slug>/<guestSlug>` for a valid personalized invite
- **THEN** the metadata and image are identical in public identity to the parent `/w/<slug>` wishlist
- **AND** neither the guest name nor `guestSlug` appears in the metadata, canonical URL, or preview image

#### Scenario: Sensitive wishlist data exists

- **WHEN** a published wishlist contains delivery data, owner-only fields, hidden gifts, or purchase information
- **THEN** none of those values appears in its social metadata or preview image

### Requirement: Non-public lifecycle states do not leak rich metadata

Draft, archived, unknown, and inaccessible wishlist states SHALL NOT publish wishlist-specific Open Graph, Twitter Card, or preview-image content. Draft owner previews SHALL remain `noindex` and SHALL not create a publicly cacheable social representation.

#### Scenario: Signed-out crawler requests a draft

- **WHEN** a signed-out crawler requests the slug of a draft wishlist
- **THEN** it receives the existing not-found behavior
- **AND** no wishlist-specific social metadata leaks the draft title, description, or images

#### Scenario: Crawler requests an archived wishlist

- **WHEN** a crawler requests an archived wishlist
- **THEN** the inactive response remains `noindex`
- **AND** it does not advertise the archived wishlist through rich social metadata

### Requirement: Social sharing remains unlisted

Rich social metadata SHALL coexist with the existing unlisted policy. Every public and personalized wishlist response SHALL continue to instruct search engines not to index or follow the page.

#### Scenario: Rich preview remains noindex

- **WHEN** a published wishlist emits complete Open Graph and Twitter Card metadata
- **THEN** the same response emits `noindex, nofollow`

