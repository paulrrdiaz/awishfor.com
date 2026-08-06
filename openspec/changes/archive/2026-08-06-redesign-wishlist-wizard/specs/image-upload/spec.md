## MODIFIED Requirements

### Requirement: Owner uploads and removes a wishlist cover image

The system SHALL allow the authenticated owner of a wishlist to upload up to eight ordered cover images, remove any of them, and reorder them. Successful changes SHALL persist each image as a `WishlistImage` record carrying its hosted URL, source width and height, derived orientation, and position; there SHALL be no mirrored single-URL column. Cover images hosted on UploadThing (domain `utfs.io`) SHALL be servable through the Next.js image optimization pipeline. The upload control SHALL disable adding beyond eight images and SHALL show a layout-aware hint of how many photos the selected layout displays.

#### Scenario: Owner uploads multiple cover images

- **WHEN** the owner uploads valid images through the cover control
- **THEN** each file is uploaded and persisted as an ordered image record with its dimensions and derived orientation, and the live preview reflects the gallery

#### Scenario: Owner reorders cover images

- **WHEN** the owner drags a cover image to a new position
- **THEN** the image records persist the new order and the first image becomes the principal image

#### Scenario: Owner removes a cover image

- **WHEN** the owner removes one of the cover images
- **THEN** that image record is removed and the remaining records keep their relative order with contiguous positions

#### Scenario: Ninth image is blocked

- **WHEN** the wishlist already has eight cover images
- **THEN** the add control is disabled and no further upload starts

#### Scenario: UploadThing cover image renders via next/image

- **WHEN** a wishlist cover image URL is hosted on `utfs.io`
- **THEN** the Next.js image optimization pipeline serves the image without an "unconfigured host" error

## ADDED Requirements

### Requirement: Batch cover upload with orientation grouping

The cover upload control SHALL accept multiple files in a single drop or file-picker selection, uploading each one and appending it in the order selected. When the incoming batch would exceed the eight-image cap, the control SHALL accept files up to the cap and report how many were skipped rather than failing the whole batch. The control SHALL present the accepted set grouped by persisted orientation, with a count per group.

#### Scenario: Several files in one drop

- **WHEN** the owner drops four valid images at once
- **THEN** all four upload and are appended in selection order, each with its dimensions and orientation

#### Scenario: Batch exceeding the cap is partially accepted

- **WHEN** the wishlist has six images and the owner drops four more
- **THEN** two are accepted to reach the cap and the control reports that two were skipped

#### Scenario: Set is grouped by orientation

- **WHEN** the control renders a set containing both landscape and portrait images
- **THEN** the two orientations are presented as separate groups, each labeled with its count

#### Scenario: Invalid file in a batch does not fail the rest

- **WHEN** a batch contains one file of a rejected type alongside valid images
- **THEN** the valid images upload and the rejected file is reported individually
