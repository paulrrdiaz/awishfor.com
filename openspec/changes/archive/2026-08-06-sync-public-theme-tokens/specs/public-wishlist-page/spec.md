## ADDED Requirements

### Requirement: Gift status badge colors are theme-independent

The gift status badge on the public wishlist page SHALL render each purchase status in a fixed colour pair that does not change with the active theme, because status is information the guest must read identically on every wishlist. The pairs are available `#E4F3E8` on `#2F7D43`, partially funded `#FBF1DC` on `#9A6F1E`, and purchased `#EAECEF` on `#71798A`, as specified by the design handoff.

The "★ Infaltable" priority badge is explicitly excluded and SHALL continue to resolve from the active theme's `--accent` / `--accent-foreground` pair.

#### Scenario: Status colours are identical across themes

- **WHEN** the same gift status is rendered under two different theme presets
- **THEN** the badge's background and text colours are identical in both

#### Scenario: Must-have badge stays theme-tinted

- **WHEN** a gift marked "Infaltable" is rendered
- **THEN** its badge resolves from the active theme's accent pair, not from the fixed status colours
