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
- **THEN** no delivery card renders on the public wishlist page and no delivery block renders in the purchase modal

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

### Requirement: Delivery card in the event-details card set

The public wishlist page SHALL present the delivery details in a dedicated card that reads as a peer of the event-detail cards (date, location, dress code). The card SHALL carry the eyebrow label `ENVÍO A DOMICILIO` in the same treatment as its sibling cards' labels, followed by the line `Si prefieres enviarlo a casa`, followed by the delivery details and the copy action. The card SHALL NOT render as an entry inside the event-details grid, and SHALL NOT alter the labels, order, or presentation of the existing event-detail cards.

#### Scenario: Card renders with the event details

- **WHEN** a published wishlist has a delivery address and at least one event detail
- **THEN** the delivery card renders alongside the event-detail cards with the eyebrow `ENVÍO A DOMICILIO`

#### Scenario: Intro line is exact

- **WHEN** the delivery card renders
- **THEN** the line `Si prefieres enviarlo a casa` appears between the eyebrow label and the delivery details

#### Scenario: Card renders when there are no event details

- **WHEN** a published wishlist has a delivery address but no event date, no location, and no dress code
- **THEN** the delivery card still renders, even though no event-detail cards render

#### Scenario: Event details are unaffected

- **WHEN** the delivery card renders next to the event-detail cards
- **THEN** the date, location, and dress code cards show the same labels and values they showed before this capability existed

### Requirement: Delivery card placement adapts to the layout

The delivery card SHALL render on every public wishlist layout. Where the event details are presented as a single-column panel, the card SHALL be positioned as the last item of that panel. Where the event details are presented as a horizontal band, the card SHALL be positioned directly beneath that band and SHALL NOT leave an orphaned cell in the band's grid.

#### Scenario: Single-column details panel

- **WHEN** a layout presents its event details as a vertical single-column panel
- **THEN** the delivery card renders as the final card in that panel

#### Scenario: Horizontal details band

- **WHEN** a layout presents its event details as a horizontal multi-column band
- **THEN** the delivery card renders as a full-width element directly below the band rather than as an extra cell inside it

#### Scenario: Every layout is covered

- **WHEN** a wishlist with a delivery address is rendered under any available public layout
- **THEN** the delivery card renders in that layout

### Requirement: Delivery details keep their itemized presentation

The delivery card SHALL present each available delivery field on its own line with a leading pictogram — recipient name, address, and phone — omitting the line for any absent field, while the copy action continues to write the single composed line. The pictograms SHALL be hidden from assistive technology.

#### Scenario: All three fields present

- **WHEN** the wishlist has a recipient name, an address, and a phone
- **THEN** the card shows three lines, one per field, each with its pictogram

#### Scenario: Only the address is present

- **WHEN** the wishlist has an address but no recipient name and no phone
- **THEN** the card shows only the address line

#### Scenario: Copy still writes the composed line

- **WHEN** the guest activates the card's copy action
- **THEN** the clipboard receives the single composed delivery line, not the itemized text

### Requirement: Delivery block inside the purchase modal

The purchase modal SHALL present the delivery details as a contained block within its form phase, visually separated from the guest consent copy so the two do not read as one run of fine print. The block SHALL NOT appear in the modal's success, undo, loading, or error phases.

#### Scenario: Block renders in the form phase

- **WHEN** a guest opens the purchase modal for a wishlist that has a delivery address
- **THEN** the form phase shows the delivery block with the composed line and a copy action

#### Scenario: Block is absent after confirming

- **WHEN** the guest submits the purchase and the modal moves to its success or undo state
- **THEN** the delivery block is not shown in those states

#### Scenario: Block is distinct from consent copy

- **WHEN** the delivery block and the guest consent copy both render
- **THEN** the delivery block is presented as a contained element rather than as another paragraph of muted fine print
