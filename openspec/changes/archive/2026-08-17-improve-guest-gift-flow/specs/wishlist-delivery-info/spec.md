## ADDED Requirements

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Delivery block inside the purchase modal

**Reason**: Delivery guidance now belongs to the explicit product-departure decision, not to the form used to record a purchase.

**Migration**: Existing wishlist delivery data remains unchanged. The public purchase form stops rendering it, the new product departure drawer consumes the same composed delivery value, and every welcome-message delivery postscript remains in place.

