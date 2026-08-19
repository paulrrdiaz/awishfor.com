## REMOVED Requirements

### Requirement: Delivery card in the event-details card set

**Reason**: Delivery info no longer reads as a peer of the event-detail cards. It moves to a standalone presentation after the gift list, and adopts a different eyebrow, no intro line, and a single composed delivery line instead of the itemized field list. Replaced by "Delivery presentation renders after the gift list" and "Delivery bar presentation" below.

**Migration**: No data migration. Callers that rendered `DeliveryCard` beside the event-details cards render the new delivery presentation after the gift list instead; `DeliveryCard` is removed from the codebase.

### Requirement: Delivery card placement adapts to the layout

**Reason**: The per-layout branching this requirement described (last item of a single-column panel vs. full-width element beneath a horizontal band) existed to fit the delivery card into the event-details area of each layout. With delivery info moved to a single position relative to the gift list, every layout follows the same placement rule and no layout-specific branching remains. Replaced by "Delivery presentation renders after the gift list" below.

**Migration**: No data migration. Every layout adopts the same after-the-gift-list placement; no layout keeps the old event-details-adjacent placement.

## ADDED Requirements

### Requirement: Delivery presentation renders after the gift list

The delivery presentation SHALL render immediately after the gift list section on every public wishlist layout and in every render mode, including `compact`, whenever the wishlist has a delivery address. It SHALL NOT render before, inside, or alongside the event-details cards, and its position relative to the gift list SHALL be identical across all layouts rather than varying by each layout's event-details composition.

#### Scenario: Delivery renders after the gift list

- **WHEN** a published wishlist has a delivery address
- **THEN** the delivery presentation renders directly after the gift list section, before the thank-you message

#### Scenario: Every layout places it identically

- **WHEN** a wishlist with a delivery address is rendered under any available public layout
- **THEN** the delivery presentation renders in the same position relative to the gift list in every layout

#### Scenario: Compact mode shows delivery when present

- **WHEN** a wishlist with a delivery address renders in `compact` mode
- **THEN** the delivery presentation renders after the gift list, matching `full` and `preview` mode behavior

#### Scenario: No address means no presentation

- **WHEN** a wishlist has no delivery address
- **THEN** no delivery presentation renders in any render mode, and the gift list and thank-you message keep their normal spacing

### Requirement: Delivery bar presentation

The top-level delivery presentation SHALL render as a full-width bar distinct from the event-detail cards: an icon badge, the eyebrow label `Envíos a domicilio`, the composed delivery line rendered as a single line of text, and one copy action using the button treatment (not the compact text-link treatment). It SHALL NOT present the delivery fields as separate pictogram-per-field rows; that itemized presentation remains exclusive to the product departure drawer.

#### Scenario: Bar shows the composed line

- **WHEN** the delivery bar renders for a wishlist with a recipient name, address, and phone
- **THEN** it shows one bold line combining all three, matching the composed delivery line, without separate pictogram rows

#### Scenario: Bar shows a button-style copy action

- **WHEN** the delivery bar renders
- **THEN** its copy action uses the button treatment and writes the composed delivery line to the clipboard, confirming and reverting per the existing copy-action behavior

#### Scenario: Bar omits absent fields from the line

- **WHEN** the delivery bar renders for a wishlist with only an address
- **THEN** the composed line shows only the address, with no doubled, leading, or trailing separators

## MODIFIED Requirements

### Requirement: Delivery details keep their itemized presentation

The product departure drawer SHALL present each available delivery field on its own line with a leading pictogram — recipient name, address, and phone — omitting the line for any absent field, while the copy action continues to write the single composed line. The pictograms SHALL be hidden from assistive technology. The top-level delivery bar SHALL NOT use this itemized presentation; it shows the composed line as specified in "Delivery bar presentation".

#### Scenario: All three fields present

- **WHEN** the product departure drawer renders for a wishlist with a recipient name, an address, and a phone
- **THEN** the drawer shows three lines, one per field, each with its pictogram

#### Scenario: Only the address is present

- **WHEN** the product departure drawer renders for a wishlist with an address but no recipient name and no phone
- **THEN** the drawer shows only the address line

#### Scenario: Copy still writes the composed line

- **WHEN** the guest activates the drawer's copy action
- **THEN** the clipboard receives the single composed delivery line, not the itemized text
