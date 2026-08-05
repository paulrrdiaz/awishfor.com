# image-upload Specification

## Purpose

Defines owner-authorized image uploads for wishlist covers and gifts, including validation and optimized rendering.
## Requirements
### Requirement: Owner uploads and removes a wishlist cover image

The system SHALL allow the authenticated owner of a wishlist to upload up to six ordered cover images, remove any of them, and reorder them. Successful changes SHALL persist each image as a `WishlistImage` record carrying its hosted URL, source width and height, derived orientation, and position; there SHALL be no mirrored single-URL column. Cover images hosted on UploadThing (domain `utfs.io`) SHALL be servable through the Next.js image optimization pipeline. The upload control SHALL disable adding beyond six images and SHALL show a layout-aware hint of how many photos the selected layout displays.

#### Scenario: Owner uploads multiple cover images

- **WHEN** the owner uploads valid images through the cover control
- **THEN** each file is uploaded and persisted as an ordered image record with its dimensions and derived orientation, and the live preview reflects the gallery

#### Scenario: Owner reorders cover images

- **WHEN** the owner drags a cover image to a new position
- **THEN** the image records persist the new order and the first image becomes the principal image

#### Scenario: Owner removes a cover image

- **WHEN** the owner removes one of the cover images
- **THEN** that image record is removed and the remaining records keep their relative order with contiguous positions

#### Scenario: Seventh image is blocked

- **WHEN** the wishlist already has six cover images
- **THEN** the add control is disabled and no further upload starts

#### Scenario: UploadThing cover image renders via next/image

- **WHEN** a wishlist cover image URL is hosted on `utfs.io`
- **THEN** the Next.js image optimization pipeline serves the image without an "unconfigured host" error

### Requirement: Owner uploads, replaces, and removes a gift image

The system SHALL allow the authenticated owner to upload an image for a gift, replace an existing gift image, and remove it. A successful upload or replacement SHALL persist the hosted image URL to `Gift.imageUrl`; removal SHALL clear that field to null. Gift images hosted on UploadThing (domain `utfs.io`) SHALL be servable through the Next.js image optimization pipeline.

#### Scenario: Owner uploads a gift image
- **WHEN** the owner selects a valid image in the gift form image control
- **THEN** the file is uploaded and `imageUrl` is set to the hosted URL with a visible preview

#### Scenario: Owner replaces a gift image
- **WHEN** a gift already has an image and the owner uploads a new valid image
- **THEN** `imageUrl` is updated to the new hosted URL and the preview shows the new image

#### Scenario: Owner removes a gift image
- **WHEN** the owner clicks remove on an existing gift image
- **THEN** `imageUrl` is cleared and the control returns to the empty upload state

#### Scenario: UploadThing gift image renders via next/image
- **WHEN** a gift image URL is hosted on `utfs.io`
- **THEN** the Next.js image optimization pipeline serves the image without an "unconfigured host" error

### Requirement: File type validation

The system SHALL accept only JPG, PNG, and WEBP image files for both cover and gift uploads, and SHALL reject any other file type with a friendly error message without changing the stored image.

#### Scenario: Invalid file type rejected
- **WHEN** the owner attempts to upload a file that is not JPG, PNG, or WEBP
- **THEN** the upload is rejected, an error message is shown, and no image URL is stored

### Requirement: File size validation

The system SHALL reject cover images larger than 4MB and gift images larger than 3MB, showing a friendly error message and leaving the stored image unchanged.

#### Scenario: Oversized cover image rejected
- **WHEN** the owner attempts to upload a cover image larger than 4MB
- **THEN** the upload is rejected with an error message and the wishlist's existing cover images are unchanged

#### Scenario: Oversized gift image rejected
- **WHEN** the owner attempts to upload a gift image larger than 3MB
- **THEN** the upload is rejected with an error message and `imageUrl` is unchanged

### Requirement: Upload authorization

The system SHALL restrict image uploads to authenticated users. The upload endpoint SHALL reject requests from signed-out users.

#### Scenario: Signed-out upload rejected
- **WHEN** a request reaches the upload endpoint without an authenticated session
- **THEN** the upload is rejected as unauthorized and no file is stored

### Requirement: Cover uploads capture source dimensions

The cover upload control SHALL measure each accepted image's natural width and height in the browser before persisting it, and SHALL submit those dimensions together with the hosted URL so orientation can be classified and stored. An image whose dimensions cannot be measured SHALL be rejected with a friendly error rather than persisted without them.

#### Scenario: Dimensions accompany the hosted URL

- **WHEN** an accepted cover image finishes uploading
- **THEN** its natural width and height are submitted alongside the hosted URL and persisted with the record

#### Scenario: Unmeasurable image is rejected

- **WHEN** an accepted file's natural dimensions cannot be read
- **THEN** the control surfaces a friendly error and no image record is created
