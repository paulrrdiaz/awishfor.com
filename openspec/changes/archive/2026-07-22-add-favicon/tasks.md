## 1. Copy icon assets into public/

- [x] 1.1 Copy `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png` from `/Users/paulrrdiaz/Downloads/favicon` into `public/`, overwriting the existing `public/favicon.ico`
- [x] 1.2 Copy `site.webmanifest` from `/Users/paulrrdiaz/Downloads/favicon` into `public/site.webmanifest`, editing `name` and `short_name` to `"A Wish For"` before/while copying

## 2. Wire metadata in root layout

- [x] 2.1 In `src/app/layout.tsx`, replace the `icons` array in `metadata` with the object form (`icon`, `shortcut`, `apple` entries) covering `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, and `apple-touch-icon.png`
- [x] 2.2 Add `manifest: "/site.webmanifest"` to `metadata` in `src/app/layout.tsx`
- [x] 2.3 Update `metadata.title` and `metadata.description` in `src/app/layout.tsx` from the create-t3-app placeholders to real A Wish For copy

## 3. Validate

- [x] 3.1 Run `pnpm check`, `pnpm test`, and `pnpm typecheck`; report and fix any failures before closing the session
- [x] 3.2 Reminder (manual, skip during apply): verify favicon/apple-touch-icon/manifest render correctly in a browser tab and iOS/Android install preview
