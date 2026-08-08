## ADDED Requirements

### Requirement: Signature initials split on conjunctions only

`parseSignatureInitials` SHALL derive display initials from an owner's free-text signature by splitting on explicit conjunctions and separators — `&`, `+`, `,`, and whitespace-delimited `y`, `e`, and `and` — and SHALL NOT split on bare whitespace. Accented characters SHALL be preserved. The helper SHALL return an empty result for a missing, empty, or whitespace-only signature.

This helper is distinct from whitespace-based initials for a single person's name, which remains correct for individual guest names.

#### Scenario: Two-person signature yields two initials

- **WHEN** `parseSignatureInitials` is called with `Ana & Diego`, `Ana y Diego`, or `Ana, Diego`
- **THEN** it returns `["A", "D"]`

#### Scenario: Spanish "e" conjunction is recognized

- **WHEN** `parseSignatureInitials` is called with `Isabel e Ignacio`
- **THEN** it returns `["I", "I"]`

#### Scenario: Multi-part signature yields one initial per person

- **WHEN** `parseSignatureInitials` is called with `Ana, Diego y Sofía`
- **THEN** it returns `["A", "D", "S"]`

#### Scenario: Single-entity name with spaces is not split

- **WHEN** `parseSignatureInitials` is called with `Familia Rodríguez` or `María José`
- **THEN** it returns a single initial, `["F"]` and `["M"]` respectively

#### Scenario: Accents are preserved

- **WHEN** `parseSignatureInitials` is called with `Álvaro`
- **THEN** it returns `["Á"]`

#### Scenario: Missing signature returns nothing

- **WHEN** `parseSignatureInitials` is called with `null`, an empty string, or only whitespace
- **THEN** it returns an empty array
