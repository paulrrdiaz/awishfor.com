## MODIFIED Requirements

### Requirement: Owner uploads and removes a wishlist cover image

The system SHALL allow the authenticated owner of a wishlist to upload up to six ordered cover images, remove any of them, and reorder them. Successful changes SHALL persist the ordered hosted URLs to `Wishlist.coverImageUrls`; the deprecated `Wishlist.coverImageUrl` SHALL be kept in sync as the first element (or null when the list is empty) until its pre-PROD removal. Cover images hosted on UploadThing (domain `utfs.io`) SHALL be servable through the Next.js image optimization pipeline. The upload control SHALL disable adding beyond six images and SHALL show a layout-aware hint of how many photos the selected layout displays.

#### Scenario: Owner uploads multiple cover images

- **WHEN** the owner uploads valid images through the cover control
- **THEN** each file is uploaded, its URL is appended to `coverImageUrls` in order, and the live preview reflects the gallery

#### Scenario: Owner reorders cover images

- **WHEN** the owner drags a cover image to a new position
- **THEN** `coverImageUrls` persists the new order and the first image becomes the principal image

#### Scenario: Owner removes a cover image

- **WHEN** the owner removes one of the cover images
- **THEN** that URL is removed from `coverImageUrls`, the remaining order is preserved, and the deprecated `coverImageUrl` mirror updates to the new first element or null

#### Scenario: Seventh image is blocked

- **WHEN** the wishlist already has six cover images
- **THEN** the add control is disabled and no further upload starts

#### Scenario: UploadThing cover image renders via next/image

- **WHEN** a wishlist cover image URL is hosted on `utfs.io`
- **THEN** the Next.js image optimization pipeline serves the image without an "unconfigured host" error
