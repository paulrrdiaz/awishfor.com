## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Delivery postscript inside the welcome message card

**Reason**: The welcome message card holds the host's personal message — a quote with a signature. A shipping address and a copy control appended to it read as a graft on emotional copy, and a guest looking for logistics looks at the event-detail cards, not at the message. The delivery presentation moves there instead.

**Migration**: The postscript and its intro copy `P.D. — si prefieres enviarlo a casa:` are gone from every welcome variant. The same delivery details now render in the delivery card defined by "Delivery card in the event-details card set", introduced by `Si prefieres enviarlo a casa`. No host action is required and no stored data changes; the welcome message and its variant catalog are unaffected.
