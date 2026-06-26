## Requirements

### Requirement: Money formatting is currency and locale aware

`formatMoney` SHALL format a numeric or string amount according to a given currency and locale, producing the correct currency symbol, grouping, and decimal conventions.

#### Scenario: PEN in Spanish Peru
- **WHEN** `formatMoney` is called with an amount and currency `PEN` and locale `es`
- **THEN** the output uses Peruvian Sol formatting (e.g. `S/` symbol and es-PE grouping/decimals)

#### Scenario: USD in English US
- **WHEN** `formatMoney` is called with an amount and currency `USD` and locale `en`
- **THEN** the output uses US dollar formatting (e.g. `$` symbol and en-US grouping/decimals)

#### Scenario: String decimal input
- **WHEN** `formatMoney` is called with a string amount such as `"199.90"`
- **THEN** it parses and formats the value without precision loss

### Requirement: Event date formatting respects locale

`formatEventDate` SHALL format a date (Date or ISO string) into a human-readable event date in the given locale.

#### Scenario: Spanish event date
- **WHEN** `formatEventDate` is called with a date and locale `es`
- **THEN** the output is a Spanish-language formatted date

#### Scenario: English event date
- **WHEN** `formatEventDate` is called with a date and locale `en`
- **THEN** the output is an English-language formatted date

### Requirement: Relative date formatting respects locale

`formatRelativeDate` SHALL express the difference between a target date and now as a localized relative phrase (e.g. "in 3 days", "hace 2 días").

#### Scenario: Future relative date
- **WHEN** `formatRelativeDate` is called with a date in the future and locale `en`
- **THEN** the output is a future-tense localized relative phrase

#### Scenario: Past relative date in Spanish
- **WHEN** `formatRelativeDate` is called with a date in the past and locale `es`
- **THEN** the output is a past-tense Spanish relative phrase

### Requirement: Store domain formatting is clean with safe fallback

`formatStoreDomain` SHALL derive a clean hostname from a product or store URL, stripping the `www.` prefix and lowercasing, and SHALL fall back gracefully when the URL is missing or invalid.

#### Scenario: Clean domain from URL
- **WHEN** `formatStoreDomain` is called with `https://www.Amazon.com/dp/123`
- **THEN** the output is `amazon.com`

#### Scenario: Missing or invalid URL fallback
- **WHEN** `formatStoreDomain` is called with a null, empty, or unparseable URL
- **THEN** it returns a clean fallback value rather than throwing
