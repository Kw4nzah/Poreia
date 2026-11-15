# Poreia

Start here: `HANDOFF.md`.

Orthodox fasting companion for Android (Expo / React Native / TypeScript). See `AGENTS.md`
for Expo conventions.

- `npm test` — unit tests (vitest)
- `npm run typecheck` — TypeScript check
- Calendar engine lives in `src/calendar/` and returns ids only; all user-facing text goes
  through the i18n layer (tr / en / ru).
