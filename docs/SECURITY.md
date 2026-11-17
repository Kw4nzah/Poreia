# Security notes

Reporting a problem: see [../SECURITY.md](../SECURITY.md). Network behaviour in plain words:
[../PRIVACY.md](../PRIVACY.md). Last full review: 2026-11-18.

## Threat model

Poreia is an offline-first Android app with no backend and no accounts. The things worth
protecting are small, and the realistic attacks are on the delivery path, not on the data.

### What data exists

| Data | Where | Sensitivity |
|---|---|---|
| Settings: language, church, fish rule, notification options, text size | AsyncStorage on the device (key `poreia.settings.v1`) | Low |
| The user's first name | Same JSON | Personal, low |
| Saint names and chosen topics (at most 10) | Same JSON | Personal (religious practice), medium |
| "Complete today" marks | AsyncStorage, one key per day (`poreia.done.YYYY-MM-DD`) | Low |
| Widget content | Computed from the settings and the date, drawn by Android | Same as above |

Nothing is sent anywhere. There are no analytics, ads, crash reports, push tokens or identifiers.
Notifications are local. The app's data directory is private to the app; backups are switched off
(`allowBackup: false`), so the name and saints do not leave the phone through Android backup or
device transfer either.

### Network

Only these connections exist (details in PRIVACY.md):

1. App start: update check against `kw4nzah.github.io` (expo-updates), HTTPS only.
2. Settings and app start: `api.github.com` latest-release lookup (version number and APK link).
3. On request: the APK download from this project's GitHub releases.
4. On tap: external links, opened in the browser or YouVersion app.

No request carries user data. The app targets Android API 28 or higher, where cleartext HTTP is off by
default; the `usesCleartextTraffic` flag that Expo sets in the debug manifest is not part of the
release APK. All URLs in the code are https.

### Attackers and what stops them

| Attacker | Goal | Defence | Residual risk |
|---|---|---|---|
| Network attacker (public Wi-Fi) | Serve a fake update or APK | HTTPS to GitHub; every bundle and asset has a SHA-256 in the manifest; Android only installs an APK signed with the same key as the installed app | The manifest itself is not signed (see SECURITY-OTA-SIGNING.md); TLS and GitHub are trusted |
| Whoever controls the GitHub repo, Actions or Pages | Ship malicious JS to every install through the next update | Pinned actions, least-privilege workflow permissions, Dependabot, secrets only in GitHub (see Owner checklist) | Account takeover is the biggest single risk of this release model. Use 2FA and a hardware key or passkey |
| Malicious or compromised npm package | Run code in the build or the app | `npm ci` with a lockfile, weekly Dependabot PRs, review before merge | Build tools carry open advisories (below) |
| Malicious app on the same phone | Read settings, call the widget or components | Private app storage, no exported components beyond the launcher activity and the widget (Android system) receivers, backups off, no exported content provider expected (verify with the commands under Permissions) | Rooted devices are out of scope |
| Someone holding the unlocked phone | Read name and saints | None beyond the Android lock screen | Accepted: the data is low sensitivity |
| Corrupted or tampered storage | Crash the app or inject content | All stored settings are validated field by field with length caps; unknown keys dropped | A rewritten but valid value (for example another saint name) is accepted by design |
| A bad link target | Make the app open `intent:`, `file:`, `http:` or foreign hosts | Every outgoing link goes through `src/security/openExternal.ts` (https and a host allowlist); the APK URL must be on this project's own release path | New hosts must be added to the allowlist on purpose |

## What the code enforces

- External links: `src/security/externalLinks.ts` allows only `https` to `www.bible.com`,
  `bible.com` and `github.com`. `Linking.openURL` is used in exactly one place,
  `src/security/openExternal.ts`. Tests: `src/security/externalLinks.test.ts`.
- APK update: a release asset is offered only when its URL starts with
  `https://github.com/Kw4nzah/Poreia/releases/download/` and ends in `.apk`
  (`isAllowedApkUrl`, used by `pickNewerApk`). Android then asks the user to confirm the install and
  refuses an APK signed with a different key.
- Stored settings: `parseSettings` (`src/settings/model.ts`) rejects input over 16 000 characters,
  non-objects and arrays, checks every enum and number, trims and strips control characters from
  the name (40 characters) and saint names (60 characters, at most 10). The widget task handler uses
  the same function, so the widget never trusts raw storage. "Done" marks are compared with the
  exact value `"1"`.
- No `eval`, `new Function` or `require` with a variable. The two lazy `require` calls load fixed
  files.
- Logging: the app logs nothing in release builds. The error boundary logs only under `__DEV__`
  and its fallback screen shows no error details.

## Permissions

Declared in `app.json`:

- `REQUEST_INSTALL_PACKAGES`: needed for installing a newer APK from Settings.
- Added by Expo and its modules (expected, to be confirmed with the commands below): `INTERNET`
  (update and release checks) and the notification related ones from expo-notifications.
- Blocked in `app.json` (`blockedPermissions`, takes effect with the next APK): `SYSTEM_ALERT_WINDOW`
  (developer overlay only), `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` (nothing uses shared
  storage; the APK is downloaded to the app cache).

After building an APK, check the real list rather than trusting this page:

    aapt2 dump permissions poreia-vX.Y.Z.apk
    aapt2 dump xmltree --file AndroidManifest.xml poreia-vX.Y.Z.apk | grep -B1 -A3 exported

Only the launcher activity and the widget provider/receivers (which Android must reach) should be
exported.

## Supply chain

`npm audit` on 2026-11-18 reports 40 findings that come from two advisories, both in
build and test tooling (Metro, the Expo CLI, vitest/vite). None of this code is in the shipped
bundle.

| Advisory | Package | Status |
|---|---|---|
| GHSA-fc5q-39xc-vjpf, ReDoS in extglob matching | `picomatch` (all versions) | No fixed release exists. Wait for upstream |
| GHSA-g3hv-75wg-m249, DoS through globparts amplification | `minimatch` 7.0.0 to 11.0.0 | Fixed in 11.0.1, but the Expo tooling that uses it is pinned to 10.x. The only npm "fix" is a downgrade to Expo 54, which is not acceptable |

`npm audit fix` changed only the lockfile and fixed neither, so nothing was applied. Revisit after
each Expo SDK upgrade.

CI hardening in `.github/`:

- Every action is pinned to a commit SHA with the version in a comment. Dependabot
  (`.github/dependabot.yml`, weekly) proposes updates for npm and for the actions.
- Workflow-level permissions are `contents: read`; the jobs that need more ask for it themselves
  (release creation, Pages deploy). Checkout does not persist the token.
- The keystore comes from GitHub secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`),
  is written to the runner's temp directory and deleted on exit, and is never echoed.
- Secrets scan of the full history (69 commits, gitleaks) found nothing. `.gitignore` covers
  keystores, keys, `.env` files and service files.

## Owner checklist (settings that only the repository owner can change)

- [ ] Enable two-factor authentication (passkey or security key) on the GitHub account.
- [ ] Repository, Settings, Code security: turn on private vulnerability reporting, Dependabot
      alerts, Dependabot security updates, secret scanning and push protection.
- [ ] Settings, Branches: protect `main` (no force push, no deletion; require the CI check; ideally
      require a pull request).
- [ ] Settings, Environments, `github-pages`: allow deployment from `main` only.
- [ ] Settings, Actions, General: default workflow token permission "Read repository contents",
      and "Require approval for first-time contributors". Allow only actions from GitHub (or pinned
      ones).
- [ ] Settings, Rules: protect `v*` tags so only the owner can create them (a tag builds a signed
      APK).
- [ ] Keep an offline backup of the keystore and its password. Losing it means users must
      uninstall and reinstall to get a newer APK.
- [ ] Decide about OTA manifest signing: [SECURITY-OTA-SIGNING.md](SECURITY-OTA-SIGNING.md).

## Needs the next APK

These are in `app.json` or the code now but reach phones only with the next `v*` release:

- `android.allowBackup: false` (Expo's template already writes the same value; this makes it
  explicit and stable across SDK upgrades).
- `android.blockedPermissions` (three permissions listed above).
- Anything about OTA code signing (not enabled).

Everything else on this page, including the link allowlist, the settings validation, and the
quieter error boundary, is JavaScript and ships as a normal update.
