# image-upload Specification

## Purpose

Defines owner-authorized image uploads for wishlist covers and gifts, including validation and optimized rendering.
## Requirements
### Requirement: Owner uploads and removes a wishlist cover image

The system SHALL allow the authenticated owner of a wishlist to upload up to eight ordered cover images, remove any of them, and reorder them. Successful changes SHALL persist each image as a `WishlistImage` record carrying its hosted URL, hosted width and height, derived orientation, and position; there SHALL be no mirrored single-URL column. Cover images hosted on UploadThing (domain `utfs.io`) SHALL be servable through the Next.js image optimization pipeline. The upload control SHALL disable adding beyond eight images and SHALL show a layout-aware hint of how many photos the selected layout displays.

#### Scenario: Owner uploads multiple cover images

- **WHEN** the owner uploads valid images through the cover control
- **THEN** each file is uploaded and persisted as an ordered image record with its hosted dimensions and derived orientation, and the live preview reflects the gallery

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

The cover upload control SHALL measure the natural width and height of the actual file selected for hosted upload after any successful preprocessing and before persisting it, and SHALL submit those dimensions together with the hosted URL so orientation can be classified and stored. An image whose upload-candidate dimensions cannot be measured SHALL be rejected with a friendly error rather than persisted without them.

#### Scenario: Dimensions accompany the hosted URL

- **WHEN** an accepted cover image finishes preprocessing and uploading
- **THEN** the uploaded file's natural width and height are submitted alongside the hosted URL and persisted with the record

#### Scenario: Unmeasurable image is rejected

- **WHEN** the file selected for hosted upload has natural dimensions that cannot be read
- **THEN** the control surfaces a friendly error and no image record is created

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

### Requirement: Oversized cover images are preprocessed before transfer

The cover upload control SHALL preprocess accepted wishlist cover images in the browser before starting the hosted-file transfer when a file exceeds the configured byte or pixel-dimension optimization threshold. Preprocessing SHALL preserve the image's supported MIME type and aspect ratio, bound its longest edge to 2560 pixels, target no more than 1.5 MiB, and use a high-quality encoding suitable for full-width public presentation. The control SHALL perform preprocessing off the main thread when supported, SHALL upload the original accepted file when preprocessing fails, and SHALL use the preprocessed file only when it is smaller than the original. Gift-image uploads SHALL NOT use this cover preprocessing behavior.

#### Scenario: Large accepted cover becomes smaller

- **WHEN** an accepted cover image exceeds an optimization threshold and preprocessing produces a smaller supported image
- **THEN** the smaller image is uploaded with the same aspect ratio and a longest edge no greater than 2560 pixels

#### Scenario: Preprocessing does not reduce the file

- **WHEN** preprocessing succeeds but the resulting cover file is not smaller than the accepted original
- **THEN** the original file is uploaded unchanged

#### Scenario: Preprocessing fails

- **WHEN** an accepted cover image cannot be preprocessed in the browser
- **THEN** the original accepted file remains eligible for the existing upload flow rather than being discarded

#### Scenario: Small cover skips preprocessing

- **WHEN** an accepted cover image is within both optimization thresholds
- **THEN** the original file proceeds directly to upload without re-encoding

#### Scenario: Gift image behavior is unchanged

- **WHEN** an owner uploads or replaces a gift image
- **THEN** the gift image follows the existing validation and upload behavior without cover-image preprocessing

