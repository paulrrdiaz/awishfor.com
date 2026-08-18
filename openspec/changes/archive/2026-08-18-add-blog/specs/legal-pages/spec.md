## MODIFIED Requirements

### Requirement: Privacy page

The system SHALL serve an indexable privacy page at `/privacy` within the marketing route group that discloses the third-party processors and the guest data the product collects. The page SHALL render with the shared non-landing marketing header and the marketing footer.

#### Scenario: Privacy page renders with processor disclosures

- **WHEN** a visitor opens `/privacy`
- **THEN** the page renders inside the marketing layout
- **AND** it names the third-party processors Clerk, PostHog, Sentry, UploadThing, and Neon
- **AND** it describes the guest purchase/contact data collected (guest name plus optional email, phone, and message shared with the list owner)
- **AND** the page is indexable (not `noindex`)

#### Scenario: Privacy page carries shared chrome

- **WHEN** a visitor opens `/privacy`
- **THEN** the shared non-landing header renders above the content
- **AND** the marketing footer renders below it
- **AND** the page remains served at `/privacy`

### Requirement: Terms page

The system SHALL serve an indexable terms-of-use page at `/terms` within the marketing route group. The page SHALL render with the shared non-landing marketing header and the marketing footer.

#### Scenario: Terms page renders

- **WHEN** a visitor opens `/terms`
- **THEN** the page renders inside the marketing layout with the terms of use content
- **AND** the page is indexable

#### Scenario: Terms page carries shared chrome

- **WHEN** a visitor opens `/terms`
- **THEN** the shared non-landing header renders above the content
- **AND** the marketing footer renders below it
- **AND** the page remains served at `/terms`

### Requirement: Marketing footer legal and contact links

The marketing footer SHALL link its legal and contact entries to working destinations instead of placeholder anchors.

#### Scenario: Legal links resolve

- **WHEN** the marketing footer renders
- **THEN** "Términos de uso" links to `/terms`
- **AND** "Privacidad" links to `/privacy`
- **AND** "Contacto" opens an email draft to `contact@awishfor.com`

### Requirement: Public footer report and support links

The shared public wishlist footer SHALL reuse the A Wish For brand/navigation/legal footer body and SHALL provide working privacy, terms, contact, report-list, and support destinations. The public footer SHALL surface the configured support email and SHALL preserve a report link that opens a pre-addressed email draft without exposing wishlist data to a new API or third party.

#### Scenario: Public footer shows legal and contact affordances

- **WHEN** the expanded shared public `wishlist-footer` renders
- **THEN** it presents the A Wish For brand treatment
- **AND** "Privacidad" links to `/privacy`
- **AND** "Términos de uso" links to `/terms`
- **AND** "Contacto" opens an email draft to `contact@awishfor.com`
- **AND** it provides a report link that opens an email draft to `contact@awishfor.com`
- **AND** it surfaces the support email `contact@awishfor.com`

#### Scenario: Compact public footer preserves reporting access

- **WHEN** the shared public `wishlist-footer` renders its compact embedded-preview presentation
- **THEN** its compact treatment preserves the A Wish For brand line and report/support destinations without rendering the expanded navigation body

## ADDED Requirements

### Requirement: Support contact address is a single constant

The product's support contact address SHALL be `contact@awishfor.com`, declared once as a shared constant and referenced by every contact, support, and report affordance. No surface may hardcode the address independently.

#### Scenario: Every contact affordance uses the shared address

- **WHEN** the shared header, marketing footer, public wishlist footer, privacy page, or terms page presents a contact, support, or report destination
- **THEN** that destination addresses `contact@awishfor.com`
- **AND** it resolves the address from the shared constant rather than a local literal

#### Scenario: Changing the address is a single edit

- **WHEN** the support contact address changes
- **THEN** updating the shared constant updates every affordance that presents it
