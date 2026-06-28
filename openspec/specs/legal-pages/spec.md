## ADDED Requirements

### Requirement: Privacy page

The system SHALL serve an indexable privacy page at `/privacy` within the marketing route group that discloses the third-party processors and the guest data the product collects.

#### Scenario: Privacy page renders with processor disclosures

- **WHEN** a visitor opens `/privacy`
- **THEN** the page renders inside the marketing layout
- **AND** it names the third-party processors Clerk, PostHog, Sentry, UploadThing, and Neon
- **AND** it describes the guest purchase/contact data collected (guest name plus optional email, phone, and message shared with the list owner)
- **AND** the page is indexable (not `noindex`)

### Requirement: Terms page

The system SHALL serve an indexable terms-of-use page at `/terms` within the marketing route group.

#### Scenario: Terms page renders

- **WHEN** a visitor opens `/terms`
- **THEN** the page renders inside the marketing layout with the terms of use content
- **AND** the page is indexable

### Requirement: Marketing footer legal and contact links

The marketing footer SHALL link its legal and contact entries to working destinations instead of placeholder anchors.

#### Scenario: Legal links resolve

- **WHEN** the marketing footer renders
- **THEN** "Términos de uso" links to `/terms`
- **AND** "Privacidad" links to `/privacy`
- **AND** "Contacto" opens an email draft to `hola@awishfor.com`

### Requirement: Public footer report and support links

The shared public wishlist footer SHALL display the brand line and provide report and support contact via the support email.

#### Scenario: Public footer shows contact affordances

- **WHEN** the shared public `wishlist-footer` renders
- **THEN** it shows "Hecho con cariño en A Wish For"
- **AND** it provides a report link that opens an email draft to `hola@awishfor.com`
- **AND** it surfaces the support email `hola@awishfor.com`
