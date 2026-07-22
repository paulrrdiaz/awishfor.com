## ADDED Requirements

### Requirement: Branded favicon and icon set
The system SHALL serve a branded favicon and icon set for A Wish For from `public/`, replacing the create-t3-app placeholder favicon.

#### Scenario: Browser tab favicon
- **WHEN** a user loads any page on the site in a desktop browser
- **THEN** the browser tab displays the A Wish For favicon (`/favicon.ico`, with `/favicon.svg` preferred by browsers that support SVG favicons)

#### Scenario: iOS home screen icon
- **WHEN** a user adds the site to their iOS home screen
- **THEN** iOS uses `/apple-touch-icon.png` as the home screen icon

#### Scenario: Android/PWA install icon
- **WHEN** a user installs the site as a PWA on Android or another manifest-aware platform
- **THEN** the installer uses the icons declared in `/site.webmanifest` (`web-app-manifest-192x192.png`, `web-app-manifest-512x512.png`)

### Requirement: Web app manifest reflects real site identity
The system SHALL serve `public/site.webmanifest` with `name` and `short_name` set to the actual product name ("A Wish For"), not generator placeholder values.

#### Scenario: Manifest identity
- **WHEN** `/site.webmanifest` is fetched
- **THEN** its `name` and `short_name` fields both read "A Wish For", not "MyWebSite"/"MySite"

### Requirement: Root metadata wires the full icon set
The system SHALL declare the full icon set and manifest in the root route's `metadata` export (`src/app/layout.tsx`) so Next.js emits the corresponding `<link>` tags on every page.

#### Scenario: Icon links present in rendered HTML
- **WHEN** any page is server-rendered
- **THEN** the response `<head>` includes link tags for the favicon, the 96x96 PNG icon, the Apple touch icon, and the web manifest
