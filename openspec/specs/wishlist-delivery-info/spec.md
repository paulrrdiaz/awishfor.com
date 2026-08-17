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
- **THEN** no delivery postscript renders on the public wishlist page and no delivery block renders in the purchase modal

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

Every surface that presents delivery details SHALL offer a single copy action that writes the entire composed line to the clipboard. The action SHALL confirm success by changing its own label, and SHALL revert to its resting label afterward. Per-field copy actions SHALL NOT be offered.

#### Scenario: Guest copies the details

- **WHEN** a guest activates the copy action
- **THEN** the composed delivery line is written to the clipboard and the action's label changes to a copied confirmation

#### Scenario: Confirmation reverts

- **WHEN** the copied confirmation has been shown for its confirmation window
- **THEN** the action returns to its resting label and can be used again

#### Scenario: Copy is unavailable

- **WHEN** the clipboard is unavailable or the write is rejected by the browser
- **THEN** the surface does not error visibly and the delivery details remain readable on screen

### Requirement: Delivery details appear anywhere the wishlist is public

The delivery presentation SHALL render for any visitor of a published wishlist's public page, without requiring a personalized guest link. It SHALL render identically on the anonymous public route and the personalized guest route.

#### Scenario: Anonymous visitor sees the details

- **WHEN** a visitor with no invite opens a published wishlist's public URL
- **THEN** the delivery postscript renders if the wishlist has a delivery address

#### Scenario: Invited guest sees the same details

- **WHEN** a guest opens their personalized wishlist link
- **THEN** the delivery postscript renders with the same content as the anonymous route

### Requirement: Delivery postscript inside the welcome message card

The public wishlist page SHALL render the delivery details as a postscript inside the welcome message card, introduced by the exact copy `P.D. — si prefieres enviarlo a casa:` followed by the composed line, with the recipient name emphasized when present. The postscript SHALL render inside the card for every welcome variant, and SHALL NOT introduce a new welcome variant or otherwise change which variants a host can select.

#### Scenario: Postscript renders in every welcome variant

- **WHEN** a wishlist with a delivery address renders its welcome message under any selected welcome variant
- **THEN** the postscript renders inside that variant's card beneath the message body

#### Scenario: Variant catalog is unchanged

- **WHEN** the host views the welcome message variant options
- **THEN** the same variants are offered as before this capability existed, with no delivery-specific variant added

#### Scenario: Intro copy is exact

- **WHEN** the postscript renders
- **THEN** it is introduced by `P.D. — si prefieres enviarlo a casa:`

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

