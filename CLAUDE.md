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
