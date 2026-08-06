## ADDED Requirements

### Requirement: Wizard previews composite real and sample cover images

Wizard preview panes SHALL fill a layout's unfilled hero image slots with the selected occasion's `sampleCoverImages`, preferring samples whose orientation matches the slot the layout renders. The creator's own images SHALL always occupy the earliest slots in their stored order, so a real photo is never displaced by a sample.

#### Scenario: Empty draft previews entirely with samples

- **WHEN** a preview renders a layout with three hero slots for a draft holding no cover images
- **THEN** all three slots render occasion samples of the layout's recommended orientation

#### Scenario: Partial draft mixes real and sample

- **WHEN** a preview renders a layout with three hero slots for a draft holding one cover image
- **THEN** the creator's image occupies the first slot and samples fill the remaining two

#### Scenario: Complete draft uses no samples

- **WHEN** a draft holds at least as many images as the layout renders
- **THEN** the preview uses only the creator's images and no sample appears

#### Scenario: Samples match the occasion

- **WHEN** a preview composites samples for a draft whose event type is `wedding`
- **THEN** the samples come from the `wedding` preset rather than a generic set

#### Scenario: Samples match the slot orientation

- **WHEN** a layout's hero slots are portrait
- **THEN** the samples chosen to fill them are portrait

### Requirement: Sample images are visibly marked

Any preview slot filled with a sample SHALL carry a visible marker identifying it as placeholder imagery, so a creator never mistakes stock photography for their own uploads or for what guests will see.

#### Scenario: Sample slot is marked

- **WHEN** a preview slot renders a sample image
- **THEN** it displays a marker identifying the image as a sample

#### Scenario: Real slot is unmarked

- **WHEN** a preview slot renders one of the creator's own images
- **THEN** no sample marker is displayed

### Requirement: Samples never reach a published page

Sample cover images SHALL exist only in wizard and dashboard preview surfaces. They SHALL NOT be written to the draft, SHALL NOT be persisted as `WishlistImage` records, and SHALL NOT render on a published public wishlist page, where unfilled slots continue to render the active theme's tinted placeholder.

#### Scenario: Samples are not persisted

- **WHEN** a draft whose preview showed samples is saved or published
- **THEN** only the creator's own images are written as image records

#### Scenario: Published page shows tinted placeholders, not samples

- **WHEN** a published wishlist has fewer images than its layout renders
- **THEN** the unfilled slots render the theme's tinted placeholder and no sample photography

#### Scenario: Preview compositing does not mutate the draft

- **WHEN** a preview composites samples into unfilled slots
- **THEN** the draft's image collection is unchanged in count and content
