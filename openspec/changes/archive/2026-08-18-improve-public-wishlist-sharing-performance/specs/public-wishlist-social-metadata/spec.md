## Purpose

Defines privacy-safe, crawler-readable social metadata and branded preview images for shared public wishlist links without making those links discoverable in search.

## ADDED Requirements

### Requirement: Published wishlist social metadata

A published wishlist at `/w/<slug>` SHALL return crawler-readable metadata in the initial HTML containing its wishlist title, a non-empty description, an absolute canonical URL, Open Graph website fields, a Twitter summary-large-image card, and at least one absolute 1200×630 preview-image URL. The canonical and social URLs SHALL use the configured public application origin and the clean `/w/<slug>` path.

#### Scenario: Published wishlist emits complete social tags

- **WHEN** a crawler requests a published wishlist URL
- **THEN** the initial HTML contains canonical, Open Graph, and Twitter Card metadata with absolute URLs
- **AND** the Open Graph and Twitter metadata identify the wishlist by its public title and description

#### Scenario: Metadata requires no client execution

- **WHEN** a social crawler reads only the server-rendered HTML without executing JavaScript
- **THEN** every required social metadata field is available in that HTML

### Requirement: Branded preview image

Each published wishlist SHALL expose a 1200×630 branded preview image that includes the A Wish For identity and the wishlist title. The image SHALL use the first ordered cover image when it can be rendered safely and SHALL fall back to a deterministic branded composition when the wishlist has no cover image or the cover image cannot be loaded.

#### Scenario: First cover image is available

- **WHEN** a published wishlist has one or more ordered cover images and the first image is readable
- **THEN** its social preview uses that first image in the branded 1200×630 composition

#### Scenario: Cover image is unavailable

- **WHEN** the wishlist has no cover image or the first image cannot be loaded
- **THEN** the social preview still returns a valid branded 1200×630 image without a broken external-image dependency

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
