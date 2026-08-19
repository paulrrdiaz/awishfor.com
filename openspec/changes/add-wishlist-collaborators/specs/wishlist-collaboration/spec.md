## ADDED Requirements

### Requirement: Wishlist membership

A wishlist SHALL have exactly one owner and MAY have any number of collaborators. Membership SHALL be additive to ownership: the owner is not a member row, and removing every collaborator SHALL leave the wishlist exactly as it was before it was ever shared. A given person SHALL NOT hold more than one membership on the same wishlist.

#### Scenario: A wishlist has no collaborators

- **WHEN** a wishlist has never been shared
- **THEN** its owner has full access
- **AND** no other account can read or modify it

#### Scenario: Sharing twice with the same person

- **WHEN** an owner shares a wishlist with an address that already has access to it
- **THEN** no duplicate membership is created
- **AND** the operation reports that the person already has access

#### Scenario: The owner cannot be removed

- **WHEN** any account attempts to remove the owner from their own wishlist
- **THEN** the operation is rejected
- **AND** the owner retains access

### Requirement: Unified wishlist access check

Every read and write of wishlist-scoped data SHALL authorize the caller through a single shared access check that grants access to the owner and to collaborators. Application code SHALL NOT authorize by comparing an owner identifier inline. When the caller has no access, the system SHALL respond as though the wishlist does not exist, and SHALL NOT distinguish a wishlist that is absent from one the caller cannot reach.

#### Scenario: The owner acts on their wishlist

- **WHEN** the owner performs any wishlist-scoped read or write
- **THEN** the access check grants access
- **AND** the operation proceeds

#### Scenario: A collaborator acts on a shared wishlist

- **WHEN** a collaborator performs any wishlist-scoped read or write that is not owner-reserved
- **THEN** the access check grants access
- **AND** the operation proceeds

#### Scenario: An unrelated account attempts access

- **WHEN** an account that is neither owner nor collaborator requests a wishlist
- **THEN** the request fails as not found
- **AND** the response is indistinguishable from the response for a wishlist that does not exist

#### Scenario: A removed collaborator attempts access

- **WHEN** an account whose membership was removed requests the wishlist
- **THEN** the request fails as not found
- **AND** work that account performed while it had access remains intact

### Requirement: Owner-reserved capabilities

Archiving, restoring, deleting a wishlist, and managing its collaborators SHALL be reserved to the owner. All other wishlist capabilities, including managing gifts, categories, guest invites, design, settings, publishing, unpublishing, and viewing purchase records, SHALL be available to collaborators.

#### Scenario: A collaborator attempts to archive

- **WHEN** a collaborator attempts to archive, restore, or delete a shared wishlist
- **THEN** the operation is rejected
- **AND** the wishlist status is unchanged

#### Scenario: A collaborator attempts to manage collaborators

- **WHEN** a collaborator attempts to share the wishlist with someone else or remove an existing collaborator
- **THEN** the operation is rejected

#### Scenario: A collaborator manages content

- **WHEN** a collaborator adds, edits, reorders, or removes a gift, category, or guest invite
- **THEN** the operation succeeds

#### Scenario: A collaborator changes configuration

- **WHEN** a collaborator changes the wishlist's settings, design, or delivery information
- **THEN** the operation succeeds

#### Scenario: A collaborator publishes

- **WHEN** a collaborator publishes or unpublishes a shared wishlist
- **THEN** the operation succeeds

#### Scenario: A collaborator views purchases

- **WHEN** a collaborator views the wishlist's purchase records
- **THEN** the guest names, optional contact details, and messages are visible to them

### Requirement: Sharing by email address without acceptance

An owner SHALL share a wishlist by supplying an email address. Access SHALL be granted without any action by the recipient: there SHALL be no acceptance, approval, or decline step. When the address belongs to an existing account, membership SHALL be created immediately. When it does not, a pending invitation SHALL be recorded against that address.

#### Scenario: Sharing with an existing account

- **WHEN** an owner shares a wishlist with an email address belonging to an existing account
- **THEN** membership is created immediately
- **AND** the recipient has access without taking any action

#### Scenario: Sharing with an address that has no account

- **WHEN** an owner shares a wishlist with an email address that has no account
- **THEN** a pending invitation is recorded for that address
- **AND** no membership exists until an account for that address exists

#### Scenario: Address normalization

- **WHEN** an owner supplies an email address with surrounding whitespace or mixed capitalization
- **THEN** the address is normalized before being matched or stored
- **AND** addresses differing only by whitespace or capitalization are treated as the same address

#### Scenario: Sharing with oneself

- **WHEN** an owner supplies their own email address
- **THEN** the operation is rejected with an explanation
- **AND** no membership or invitation is created

### Requirement: Recipient confirmation before sharing

Before access is granted, the system SHALL show the owner who they are about to share with. When the supplied address belongs to an existing account, the confirmation SHALL display that account's name. The owner SHALL be able to cancel without granting access.

#### Scenario: The address matches an account

- **WHEN** an owner enters an email address belonging to an existing account
- **THEN** the confirmation displays that account's name alongside the address
- **AND** access is granted only after the owner confirms

#### Scenario: The address matches no account

- **WHEN** an owner enters an email address with no account
- **THEN** the confirmation states that the person will be invited to create an account
- **AND** access is granted only after the owner confirms

#### Scenario: The owner cancels

- **WHEN** an owner cancels at the confirmation step
- **THEN** no membership or invitation is created
- **AND** no email is sent

### Requirement: Invitation notification

Sharing a wishlist SHALL send an email to the recipient in both cases, identifying the wishlist and the person who shared it. The message SHALL differ only in its call to action: an existing account is directed to view the wishlist, and an address without an account is directed to create one. The owner-facing result of sharing SHALL be worded identically in both cases.

#### Scenario: Notifying an existing account

- **WHEN** a wishlist is shared with an existing account
- **THEN** an email is sent identifying the wishlist and the person who shared it
- **AND** its call to action leads to the shared wishlist

#### Scenario: Notifying an address without an account

- **WHEN** a wishlist is shared with an address that has no account
- **THEN** an email is sent identifying the wishlist and the person who shared it
- **AND** its call to action leads to account creation

#### Scenario: Owner-facing wording does not reveal account existence

- **WHEN** an owner completes sharing
- **THEN** the confirmation shown to the owner is worded the same whether or not the address had an account

#### Scenario: Email delivery fails

- **WHEN** the invitation email cannot be sent
- **THEN** the membership or pending invitation is still recorded
- **AND** the sharing operation still reports success
- **AND** the owner is able to send the invitation again

### Requirement: Invitation links and expiry

A pending invitation SHALL be reachable through a link containing a single-use token, and only a hash of that token SHALL be stored. The link SHALL be reachable without an authenticated session. An invitation SHALL expire 30 days after it is created, and an expired invitation SHALL NOT grant access.

#### Scenario: The token is not stored in readable form

- **WHEN** a pending invitation is recorded
- **THEN** only a hash of its token is persisted
- **AND** the token itself appears only in the email sent to the recipient

#### Scenario: An unauthenticated visitor opens the link

- **WHEN** a signed-out visitor opens an invitation link
- **THEN** the page identifies the wishlist and the person who shared it
- **AND** it offers to create an account or sign in, returning to the invitation afterwards
- **AND** it does not reveal the wishlist's gifts, guests, delivery details, or purchase records

#### Scenario: A signed-in visitor opens the link

- **WHEN** a signed-in visitor opens an invitation link for a pending invitation
- **THEN** membership is created for that account
- **AND** the visitor is taken to the wishlist

#### Scenario: An expired invitation is opened

- **WHEN** a visitor opens an invitation link more than 30 days after it was created
- **THEN** no membership is created
- **AND** the page explains that the invitation has expired and that a new one must be requested

#### Scenario: An unknown or already-used token is opened

- **WHEN** a visitor opens an invitation link whose token is unknown or already claimed
- **THEN** no membership is created
- **AND** the page explains the link is no longer valid without revealing whether the wishlist exists

### Requirement: Claiming invitations at account creation

Pending invitations SHALL be converted to membership when the invited person gains an account, through two independent paths: following the invitation link, which SHALL claim the invitation regardless of which address the account was created with; and account creation, which SHALL claim every pending invitation matching the account's verified email address. Claiming SHALL be idempotent and SHALL NOT depend on webhook delivery.

#### Scenario: Signing up through the invitation link with a different address

- **WHEN** a person opens an invitation link and creates an account using an email address different from the invited one
- **THEN** the invitation is claimed and membership is created
- **AND** the mismatch between the invited and registered addresses does not prevent access

#### Scenario: Signing up without following the link

- **WHEN** a person creates an account whose verified email address matches a pending invitation
- **THEN** that invitation is claimed and membership is created
- **AND** the shared wishlist is available on their first visit to the dashboard

#### Scenario: Claiming does not depend on webhook delivery

- **WHEN** a newly created account is used before any external user-synchronization webhook has been processed
- **THEN** pending invitations for that account's verified address are still claimed

#### Scenario: Unverified addresses do not claim

- **WHEN** an account holds an email address that matches a pending invitation but that address is not verified
- **THEN** the invitation is not claimed

#### Scenario: Claiming twice

- **WHEN** the claim process runs more than once for the same person and invitation
- **THEN** exactly one membership exists
- **AND** no error is raised

### Requirement: Collaborator management and revocation

The owner SHALL be able to view every collaborator and every pending invitation for a wishlist, each identified by email address, and SHALL be able to remove any of them. Removal SHALL take effect immediately. Content created by a removed collaborator SHALL be retained.

#### Scenario: Viewing collaborators

- **WHEN** an owner opens the collaborator management view
- **THEN** every collaborator and every pending invitation is listed with its email address

#### Scenario: Removing a collaborator

- **WHEN** an owner removes a collaborator
- **THEN** that account immediately loses access to the wishlist
- **AND** gifts, categories, and guest invites they created remain unchanged

#### Scenario: Revoking a pending invitation

- **WHEN** an owner revokes a pending invitation
- **THEN** the invitation link no longer grants access
- **AND** creating an account with that address does not grant access

#### Scenario: Resending a pending invitation

- **WHEN** an owner resends a pending invitation
- **THEN** the invitation email is sent again
- **AND** the owner can see when it was last sent

### Requirement: Shared wishlists in the dashboard

Wishlists shared with the signed-in user SHALL appear in the dashboard, visually separated from wishlists they own and labeled with the name of the owner. When no wishlists are shared with the user, the shared grouping SHALL NOT be rendered at all.

#### Scenario: A user with shared wishlists

- **WHEN** a user who has been given access to a wishlist opens the dashboard
- **THEN** a separate shared grouping lists that wishlist
- **AND** each entry is labeled with the name of its owner

#### Scenario: A user with no shared wishlists

- **WHEN** a user with no shared wishlists opens the dashboard
- **THEN** no shared grouping is rendered
- **AND** their dashboard is unchanged from before this capability existed

#### Scenario: Navigating to a shared wishlist

- **WHEN** a user selects a shared wishlist from the dashboard
- **THEN** the wishlist opens with the same management interface used for owned wishlists
- **AND** owner-reserved controls are not offered

#### Scenario: Owned and shared wishlists are distinguishable

- **WHEN** a user has both owned and shared wishlists
- **THEN** the two groupings are visually distinct
- **AND** a shared wishlist is never presented as one the user owns
