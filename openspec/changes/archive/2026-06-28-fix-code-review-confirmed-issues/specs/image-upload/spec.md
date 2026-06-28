## MODIFIED Requirements

### Requirement: Owner uploads and removes a wishlist cover image

The system SHALL allow the authenticated owner of a wishlist to upload a cover image and to remove it. A successful upload SHALL persist the hosted image URL to `Wishlist.coverImageUrl`; removal SHALL clear that field to null. Cover images hosted on UploadThing (domain `utfs.io`) SHALL be servable through the Next.js image optimization pipeline.

#### Scenario: Owner uploads a cover image

- **WHEN** the owner selects a valid image in the wizard design step cover control
- **THEN** the file is uploaded, `coverImageUrl` is set to the hosted URL, and the cover preview renders in the live preview

#### Scenario: Owner removes a cover image

- **WHEN** the owner clicks remove on an existing cover image
- **THEN** `coverImageUrl` is cleared and the control returns to the empty upload state

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
