# http-security-headers Specification

## Purpose
Defines HTTP security headers emitted on all application responses to prevent clickjacking, MIME-type sniffing, and other common browser-level attacks.

## Requirements

### Requirement: HTTP security headers on all responses

The system SHALL emit a fixed set of security-relevant HTTP response headers on every route via the Next.js `headers()` configuration in `next.config.ts`. The headers SHALL apply globally to all paths.

#### Scenario: Security headers are present on any route

- **WHEN** any HTTP request is made to the application
- **THEN** the response includes `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()`

#### Scenario: Clickjacking is prevented

- **WHEN** a browser attempts to embed the application in an `<iframe>`
- **THEN** the `X-Frame-Options: DENY` header prevents the frame from rendering

#### Scenario: MIME-type sniffing is prevented

- **WHEN** a browser receives a response with a declared `Content-Type`
- **THEN** the `X-Content-Type-Options: nosniff` header prevents the browser from overriding the declared type
