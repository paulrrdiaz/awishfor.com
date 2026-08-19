# wishlist-delivery-info Specification

## Purpose
Lets a host publish where a guest can ship a physical gift — recipient name, address, and phone — so a guest who prefers to send something directly to the host's home can find and copy those details without having to ask. Defines how the fields compose into one line, how they degrade when only some are present, and where they surface on the public wishlist.
## Requirements
### Requirement: Delivery details are optional per-wishlist content

A wishlist SHALL carry three optional delivery fields: a recipient name, a delivery address, and a delivery phone. Each SHALL be independently optional. The recipient name SHALL accept at most 120 characters, the address at most 240 characters, and the phone at most 40 characters. Values SHALL be trimmed, and a value that is empty after trimming SHALL be stored as absent.

#### Scenario: Host saves all three details

- **WHEN** the host saves a recipient name, address, and phone
- **THEN** all three persist on the wishlist and are available to the public wishlist page

#### Scenario: Host saves only some details

- **WHEN** the host saves an address but leaves the recipient name and phone empty
- **THEN** the address persists and the other two are stored as absent

#### Scenario: Whitespace-only value is treated as absent

- **WHEN** the host submits a delivery field containing only whitespace
- **THEN** the field is stored as absent rather than as a blank value

#### Scenario: Over-length value is rejected

- **WHEN** the host submits a recipient name longer than 120 characters, an address longer than 240 characters, or a phone longer than 40 characters
- **THEN** the mutation rejects and the form surfaces the validation error

### Requirement: The address anchors the delivery block

The system SHALL NOT present delivery details anywhere when the delivery address is absent. The recipient name and phone SHALL NOT, alone or together, cause a delivery presentation to render.

#### Scenario: No address means no presentation

- **WHEN** a wishlist has a recipient name and a phone but no delivery address
- **THEN** no delivery postscript renders on the public wishlist page and no delivery block renders in the product departure drawer

#### Scenario: Address alone is enough

- **WHEN** a wishlist has a delivery address but no recipient name and no phone
- **THEN** the delivery presentation renders showing only the address

#### Scenario: No delivery details at all

- **WHEN** a wishlist has none of the three delivery fields
- **THEN** no delivery presentation renders and the surfaces that would host it are otherwise unchanged

### Requirement: Delivery details compose into a single line

The system SHALL compose the present delivery fields into one line by joining the recipient name and address with `, ` and appending the phone preceded by ` · `. Absent fields SHALL be omitted along with their separators, leaving no doubled, leading, or trailing separator.

#### Scenario: All three fields present

- **WHEN** the recipient name is `Ana Beltrán`, the address is `Av. Universidad 1500, Col. Narvarte, CDMX`, and the phone is `+52 55 1122 3344`
- **THEN** the composed line reads `Ana Beltrán, Av. Universidad 1500, Col. Narvarte, CDMX · +52 55 1122 3344`

#### Scenario: Name and address without phone

- **WHEN** the phone is absent
- **THEN** the composed line ends after the address with no trailing ` · `

#### Scenario: Address and phone without name

- **WHEN** the recipient name is absent
- **THEN** the composed line starts with the address and no leading `, `

### Requirement: Delivery details are copyable in one action

Every surface that presents delivery details SHALL offer a single copy action that writes the entire composed line to the clipboard. The action SHALL confirm success by changing its own label, and SHALL revert to its resting label afterward. Per-field copy actions SHALL NOT be offered. The action's visual treatment MAY differ per surface — a compact text action in the delivery card, a button in the purchase modal — but its labelling, confirmation, and revert behavior SHALL be identical across surfaces.

#### Scenario: Guest copies the details

- **WHEN** a guest activates the copy action
- **THEN** the composed delivery line is written to the clipboard and the action's label changes to a copied confirmation

#### Scenario: Confirmation reverts

- **WHEN** the copied confirmation has been shown for its confirmation window
- **THEN** the action returns to its resting label and can be used again

#### Scenario: Copy is unavailable

- **WHEN** the clipboard is unavailable or the write is rejected by the browser
- **THEN** the surface does not error visibly and the delivery details remain readable on screen

#### Scenario: Treatments confirm identically

- **WHEN** the delivery card's copy action and the purchase modal's copy action are each activated
- **THEN** both show the same copied confirmation and both revert after the same confirmation window

### Requirement: Delivery details appear anywhere the wishlist is public

The delivery presentation SHALL render for any visitor of a published wishlist's public page, without requiring a personalized guest link. It SHALL render identically on the anonymous public route and the personalized guest route.

#### Scenario: Anonymous visitor sees the details

- **WHEN** a visitor with no invite opens a published wishlist's public URL
- **THEN** the delivery card renders if the wishlist has a delivery address

#### Scenario: Invited guest sees the same details

- **WHEN** a guest opens their personalized wishlist link
- **THEN** the delivery card renders with the same content as the anonymous route

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

### Requirement: Delivery block inside the product departure drawer

The product departure drawer SHALL present delivery details as a contained block when the wishlist has a delivery address. The block SHALL use the existing composed delivery value, visually distinguish the delivery destination from surrounding helper copy, and provide one copy action. Moving this block SHALL NOT alter the delivery postscript rendered by any welcome-message variant.

#### Scenario: Product drawer shows composed delivery

- **WHEN** a guest opens the product departure drawer for a wishlist with a delivery address
- **THEN** the drawer shows the composed recipient, address, and optional phone with one copy action

#### Scenario: Product drawer omits absent delivery

- **WHEN** a guest opens the product departure drawer for a wishlist without a delivery address
- **THEN** no delivery block or copy action appears in the drawer

#### Scenario: Purchase drawer omits delivery

- **WHEN** a guest opens or submits the purchase drawer
- **THEN** delivery details do not appear in its form, loading, error, success, or undo states

#### Scenario: Welcome-message postscript remains unchanged

- **WHEN** a wishlist with a delivery address renders any supported welcome-message variant
- **THEN** its existing delivery postscript continues to render with the same content, composition, and copy behavior

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

