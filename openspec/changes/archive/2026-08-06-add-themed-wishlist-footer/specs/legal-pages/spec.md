## MODIFIED Requirements

### Requirement: Public footer report and support links

The shared public wishlist footer SHALL reuse the A Wish For brand/navigation/legal footer body and SHALL provide working privacy, terms, contact, report-list, and support destinations. The public footer SHALL surface the configured support email and SHALL preserve a report link that opens a pre-addressed email draft without exposing wishlist data to a new API or third party.

#### Scenario: Public footer shows legal and contact affordances

- **WHEN** the expanded shared public `wishlist-footer` renders
- **THEN** it presents the A Wish For brand treatment
- **AND** "Privacidad" links to `/privacy`
- **AND** "Términos de uso" links to `/terms`
- **AND** "Contacto" opens an email draft to `hola@awishfor.com`
- **AND** it provides a report link that opens an email draft to `hola@awishfor.com`
- **AND** it surfaces the support email `hola@awishfor.com`

#### Scenario: Compact public footer preserves reporting access

- **WHEN** the shared public `wishlist-footer` renders its compact embedded-preview presentation
- **THEN** its compact treatment preserves the A Wish For brand line and report/support destinations without rendering the expanded navigation body
