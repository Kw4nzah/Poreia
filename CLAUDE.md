# Poreia

Start here: `HANDOFF.md`.

Orthodox fasting companion for Android (Expo / React Native / TypeScript). See `AGENTS.md`
for Expo conventions.

- `npm test` — unit tests (vitest)
- `npm run typecheck` — TypeScript check
- Calendar engine lives in `src/calendar/` and returns ids only; all user-facing text goes
  through the i18n layer (tr / en / ru).

## Releases (GitHub only, no Expo account)

- Push to `main` publishes a JS/asset update to GitHub Pages; installed apps download it.
- A `v*` tag builds the signed APK and creates a GitHub release.
- Native change (new native module, permission, icon, SDK upgrade): bump `runtimeVersion`
  and the matching number in `updates.url`, `version` and `android.versionCode` in
  `app.json`, then tag. Never ship a native change as a plain update.
- `patches/expo-updates+*.patch` lets the app accept a manifest from static hosting. Keep
  it; re-create it when expo-updates is upgraded.

## Liturgy texts

- The texts live in `assets/liturgy/<id>.<lang>.ltxt` (JSON: `header`, `blocks`, `source`), not in the JS bundle, so code-only updates stay small. They were generated from azbyka.ru (cu/ru) and hand-prepared sources (en/tr); the file header and credit stay in each file.
- `src/liturgy/data/index.ts` is generated: after adding or removing an asset run `node scripts/build-liturgy-assets.mjs`. Loading and validation: `src/liturgy/assetLoader.ts`, `parseLiturgyText.ts`. A read failure makes `loadLiturgyText` return null (the reader shows its "text not available" state).
