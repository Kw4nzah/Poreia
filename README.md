# Poreia

Poreia is an Orthodox fasting companion for Android. It shows the fasting rules
for the day, the saints and readings of the day, the prayers of the Church and a
daily reminder, in English, Turkish and Russian. It works offline.

## Features

- **Fasting calendar:** the fast of the day, with the rules of the Church
  (dietary rules, the Greek and Russian traditions, and the choice of fish rule
  your parish follows).
- **Saints and readings:** the commemorations of the day, the Epistle and Gospel
  readings, and a link from each reading to the same passage on YouVersion.
- **Prayers:** morning, evening and meal prayers, the Lord's Prayer, the Creed,
  the Trisagion, the Prayer of St. Ephraim and the Prayer of Manasseh, plus
  prayers for the saints. You can name your patron saint and the prayer uses your
  name.
- **Notifications:** an optional daily notification at the time you choose, with
  today's fast. It can repeat until you open the app.
- **Languages:** English, Turkish and Russian.
- **Themes:** light and dark, following the system setting.
- **Offline:** the calendar, readings and prayers are shipped with the app.

See [SECURITY.md](SECURITY.md) to report a vulnerability and [PRIVACY.md](PRIVACY.md) for what the app stores and what it sends over the
network, and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the sources of
the texts.

## Installation

Download the latest signed APK from the
[GitHub Releases](https://github.com/Kw4nzah/Poreia/releases) page and install it.
Allow installs from your browser or file manager when Android asks.

Updates are checked when the app starts. Content and small fixes arrive as
over-the-air updates; new APKs are offered in the Settings screen.

## Development

Requirements: Node.js and npm.

```bash
npm install            # also applies patches/ through patch-package
npm start              # start the Expo dev server
npm test               # unit tests (vitest)
npm run typecheck      # TypeScript check (tsc --noEmit)
npm run export:android # expo export for Android into dist/
```

Conventions for Expo and React Native code are in [AGENTS.md](AGENTS.md).

## Release model

- **Push to `main`:** publishes a JavaScript and asset update to GitHub Pages.
  Installed apps download it on the next start.
- **`v*` tag:** builds the signed APK and creates a GitHub release.
- **Native change** (new native module, permission, icon, SDK upgrade): bump
  `runtimeVersion` and the matching number in `updates.url`, `version` and
  `android.versionCode` in `app.json`, then tag. A native change is never shipped
  as a plain update.
- `patches/expo-updates+*.patch` lets the app accept a manifest from static
  hosting. Keep it, and re-create it when expo-updates is upgraded.

## Project structure

```
src/
  app/            Expo Router screens and layouts (Today, Readings, Prayers, Settings)
  calendar/       Fasting calendar engine; returns ids only
  commemorations/ Saints and readings data, service and Bible links
  i18n/           All user-facing text in en, tr and ru
  notifications/  Daily notification content and schedule
  prayers/        Prayer texts and saint-topic prayers
  screens/        Screen components
  settings/       Settings model and provider (AsyncStorage)
  ui/             Shared UI components and theme
  updates/        Over-the-air and APK update checks
scripts/          Build scripts for reading texts, commemorations, update manifests and icons
assets/           App icons and splash image
patches/          patch-package patches
```

## License

License: not yet chosen.
