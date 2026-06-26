## ADDED Requirements

### Requirement: Owner uploads and removes a wishlist cover image

The system SHALL allow the authenticated owner of a wishlist to upload a cover image and to remove it. A successful upload SHALL persist the hosted image URL to `Wishlist.coverImageUrl`; removal SHALL clear that field to null.

#### Scenario: Owner uploads a cover image
- **WHEN** the owner selects a valid image in the wizard design step cover control
- **THEN** the file is uploaded, `coverImageUrl` is set to the hosted URL, and the cover preview renders in the live preview

#### Scenario: Owner removes a cover image
- **WHEN** the owner clicks remove on an existing cover image
- **THEN** `coverImageUrl` is cleared and the control returns to the empty upload state

### Requirement: Owner uploads, replaces, and removes a gift image

The system SHALL allow the authenticated owner to upload an image for a gift, replace an existing gift image, and remove it. A successful upload or replacement SHALL persist the hosted image URL to `Gift.imageUrl`; removal SHALL clear that field to null.

#### Scenario: Owner uploads a gift image
- **WHEN** the owner selects a valid image in the gift form image control
- **THEN** the file is uploaded and `imageUrl` is set to the hosted URL with a visible preview

#### Scenario: Owner replaces a gift image
- **WHEN** a gift already has an image and the owner uploads a new valid image
- **THEN** `imageUrl` is updated to the new hosted URL and the preview shows the new image

#### Scenario: Owner removes a gift image
- **WHEN** the owner clicks remove on an existing gift image
- **THEN** `imageUrl` is cleared and the control returns to the empty upload state

### Requirement: File type validation

The system SHALL accept only JPG, PNG, and WEBP image files for both cover and gift uploads, and SHALL reject any other file type with a friendly error message without changing the stored image.

#### Scenario: Invalid file type rejected
- **WHEN** the owner attempts to upload a file that is not JPG, PNG, or WEBP
- **THEN** the upload is rejected, an error message is shown, and no image URL is stored

### Requirement: File size validation

The system SHALL reject cover images larger than 4MB and gift images larger than 3MB, showing a friendly error message and leaving the stored image unchanged.

#### Scenario: Oversized cover image rejected
- **WHEN** the owner attempts to upload a cover image larger than 4MB
- **THEN** the upload is rejected with an error message and `coverImageUrl` is unchanged

#### Scenario: Oversized gift image rejected
- **WHEN** the owner attempts to upload a gift image larger than 3MB
- **THEN** the upload is rejected with an error message and `imageUrl` is unchanged

### Requirement: Upload authorization

The system SHALL restrict image uploads to authenticated users. The upload endpoint SHALL reject requests from signed-out users.

#### Scenario: Signed-out upload rejected
- **WHEN** a request reaches the upload endpoint without an authenticated session
- **THEN** the upload is rejected as unauthorized and no file is stored
