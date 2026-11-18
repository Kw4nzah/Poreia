# Security notes

Reporting a problem: see [../SECURITY.md](../SECURITY.md). Network behaviour in plain words:
[../PRIVACY.md](../PRIVACY.md). Last full review: 2026-11-18 (second pass, detailed scan; the
findings are in the table near the end).

## Threat model

Poreia is an offline-first Android app with no backend and no accounts. The things worth
protecting are small, and the realistic attacks are on the delivery path, not on the data.

### What data exists

| Data | Where | Sensitivity |
|---|---|---|
| Settings: language, church, fish rule, notification options, text size | AsyncStorage on the device (key `poreia.settings.v1`) | Low |
| The user's first name | Same JSON | Personal, low |
| Saint names and chosen topics (at most 10) | Same JSON | Personal (religious practice), medium |
| "I am fasting" marks | AsyncStorage, one key per day (`poreia.done.YYYY-MM-DD`) | Personal (religious practice), low to medium |
| Widget content | Computed from the settings and the date, drawn by Android | Same as above |

AsyncStorage is not encrypted. That is accepted: the data is low sensitivity, the app's directory
is private to it, backups are switched off (`allowBackup: false`, confirmed in the released
manifest), and anyone who can read the app's directory already has a rooted or unlocked device.

Nothing the user typed or marked is sent anywhere. There are no analytics, ads, crash reports or
push tokens. Notifications are local, and their text holds only the day's fasting rule and feasts
(no name, no saints).

### Network: every endpoint the app can contact

Checked on 2026-11-18 by reading the code (`fetch`, `Linking`, `File.downloadFileAsync`) and by
extracting every URL from the released APK's Hermes bundle and dex (v0.6.1). The APK carries no
Firebase configuration (`google_app_id` and the other Google config strings are absent from
`resources.arsc`), so Firebase Messaging and Installations never initialise and never call out.

| Endpoint | When | What is sent | Pinned or checked how |
|---|---|---|---|
| `https://kw4nzah.github.io/Poreia/updates/android/6/manifest.json` and `.../files/<sha256>.<ext>` | App start (expo-updates) | The expo-updates request headers: platform, protocol and runtime version, the ids of the running update, and a **persistent random per-install id** (`EAS-Client-ID`, a UUID kept in `dev.expo.EASSharedPreferences`), plus up to 1 024 characters of the previous fatal error if the app crashed (`Expo-Fatal-Error`). Nothing the user entered | URL fixed in the APK; HTTPS; SHA-256 per file from the manifest |
| `https://api.github.com/repos/Kw4nzah/Poreia/releases/latest` | Settings and app start, once per session | An `Accept` header | Fixed URL in code; the response is validated by `pickNewerApk` |
| `https://github.com/Kw4nzah/Poreia/releases/download/<tag>/<file>.apk`, which GitHub redirects to its own object storage | Only when the user taps "Download and install" | Nothing | Start URL allowlisted; the downloaded file must match the SHA-256 GitHub lists for the asset |
| `https://www.bible.com/...`, `https://github.com/Kw4nzah/Poreia` | On tap, in the browser or the YouVersion app | Nothing from the app (the services see an ordinary request) | Allowlist in `src/security/externalLinks.ts` |

No other host is contacted. In particular there is no WebView, no `exp.host` push-token request
(the strings exist in the library code but `getExpoPushTokenAsync` and `getDevicePushTokenAsync`
are never called) and no install-referrer call. The app targets API 36, where cleartext HTTP is
off by default, and the released manifest has no `usesCleartextTraffic` and no
`networkSecurityConfig`.

### Attackers and what stops them

| Attacker | Goal | Defence | Residual risk |
|---|---|---|---|
| Network attacker (public Wi-Fi) | Serve a fake update or APK | HTTPS to GitHub; every bundle and asset has a SHA-256 in the manifest; the APK must match the SHA-256 GitHub lists for it; Android only installs an APK signed with the same key as the installed app | The manifest itself is not signed (see SECURITY-OTA-SIGNING.md); TLS and GitHub are trusted |
| Whoever can write to the GitHub repo, Actions or Pages | Ship malicious JS to every install through the next update, or get a signed APK built | Pinned actions, least-privilege job permissions, build and deploy split, main-only publishing, tag must match `app.json` and be on main, `.github/CODEOWNERS` | **No branch or tag protection is set on the repository yet and a second account has write access (finding F-01).** Account takeover is the biggest single risk of this release model |
| Malicious or compromised npm package | Run code in the build or the app | `npm ci --ignore-scripts` with a lockfile (only `fsevents` has an install script, macOS only), every package resolved from `registry.npmjs.org` with sha512 integrity, weekly Dependabot PRs, review before merge | A compromised package still runs when the build runs `expo export` or Gradle |
| Malicious app on the same phone | Read settings, call the widget or components | Private app storage, backups off, widget receiver not exported, only the launcher activity and a few permission-guarded system receivers exported (table below) | Rooted devices are out of scope |
| Someone holding the unlocked phone | Read name and saints | None beyond the Android lock screen | Accepted: the data is low sensitivity |
| Corrupted or tampered storage | Crash the app or inject content | All stored settings are validated field by field with length caps; unknown keys dropped | A rewritten but valid value (for example another saint name) is accepted by design |
| A bad link target | Make the app open `intent:`, `file:`, `http:` or foreign hosts | Every outgoing link goes through `src/security/openExternal.ts` (https and a host allowlist) | New hosts must be added to the allowlist on purpose |

## What the code enforces

- External links: `src/security/externalLinks.ts` allows only `https` to `www.bible.com`,
  `bible.com` and `github.com`. `Linking.openURL` is used in exactly one place,
  `src/security/openExternal.ts`. Tests: `src/security/externalLinks.test.ts`.
- APK update (`src/updates/`):
  - a release is offered only for a plain version tag (`v0.6.1`, optional `-rc.1`), not a draft or
    pre-release and only when newer than the installed version;
  - the asset URL must start with `https://github.com/Kw4nzah/Poreia/releases/download/<that tag>/`
    and end in `.apk` (`isAllowedApkUrl`, `pickNewerApk`);
  - GitHub's `digest` field for the asset (`sha256:<hex>`, present on v0.6.1) is carried with the
    release and, after the download, the file's SHA-256 is computed natively
    (`File.digest('SHA-256')`, `java.security.MessageDigest`) and compared. A different hash, an
    unreadable file or a wrong size deletes the file and nothing is installed. If GitHub lists no
    digest the hash step is skipped and the size check and Android's signature check remain;
  - the file is saved as `poreia-update.apk` in the app's private cache and handed to the installer
    as a `content://` URI of the app's own non-exported `FileProvider` (read grant only);
  - Android then asks the user to confirm the install and refuses an APK signed with a different
    key.
  Tests: `src/updates/apkRelease.test.ts`, `apkFetch.test.ts`.
- Stored settings: `parseSettings` (`src/settings/model.ts`) rejects input over 16 384 characters,
  non-objects and arrays, checks every enum and number, trims and strips control characters from
  the name (40 characters) and saint names (60 characters, at most 10). The widget task handler uses
  the same function, so the widget never trusts raw storage. "Done" marks are compared with the
  exact value `"1"`.
- Backup and restore (`src/backup/`): the backup is text the user copies out (share sheet) and
  pastes back in; the app never sends it anywhere itself. Pasted text is untrusted: it is limited to
  65 536 characters, the edges are trimmed by a linear scan (`trimInvisible`; the earlier regular
  expression was quadratic, finding F-07), it must be a JSON object with `app: "poreia"` and a known
  `version`, only its own properties are read (so `__proto__` or `constructor` keys do nothing), the
  settings go through `parseSettings`, and the done list must hold only real `YYYY-MM-DD` days (one
  bad entry rejects the backup, at most 1 500 days). Restore asks for confirmation, writes done days
  only under the `poreia.done.` prefix, and never throws. Tests: `src/backup/*.test.ts`.
- Deep links: the app registers the scheme `poreia`. Every route parameter is validated before use:
  `/day/<date>` through `parseIsoDate` (real day, years 2000 to 2200), `/report/<key>` through
  `parsePeriodKey` (known fast id and a four-digit year in range), `/settings/<section>` through
  `isSectionId`, `/prayer/<id>` through `isPrayerId`, `/reading/<n>?date=` an integer index and
  `parseIsoDate`. Anything else shows an empty state or redirects to a list. No deep link performs
  an action; they only open read-only screens. The one side effect is that opening the report of a
  fast that has already ended marks that report as seen (it stops being offered on Today).
- Regular expressions on user input: the pasted backup (now linear), the free-text search fields
  (`normalizeForSearch`, `\p{M}+`, `[^\p{L}\p{N}]+`: single linear passes) and the URL check
  (`HTTPS_URL`, one bounded class per position). The other patterns run on fixed bundled data.
- No `eval`, `new Function` or `require` with a variable. The `require` calls load fixed files.
  No WebView, no `dangerouslySetInnerHTML`, no `Clipboard` API.
- Logging: the app logs nothing in release builds. The error boundary logs only under `__DEV__`
  and its fallback screen shows no error details.
- Notifications are bounded (30 days ahead, at most 6 repeats a day) and carry no personal text.

## Android surface of the released APK (v0.6.1)

Inspected on 2026-11-18 with androguard in a throwaway virtual environment, from a copy of
`poreia-v0.6.1.apk` (SHA-256 `90161d5b...cf4197695`, equal to the `digest` GitHub lists for it).
The file was only read, never run.

| Item | Finding |
|---|---|
| Package, versions | `com.kw4nzah.poreia`, versionName 0.6.1, versionCode 9, minSdk 24, targetSdk 36 |
| `android:debuggable` | Absent (false) |
| `android:allowBackup` | `false` |
| Cleartext, network security config | No `usesCleartextTraffic`, no `networkSecurityConfig` (API 36 default: cleartext blocked) |
| Signing | APK Signature Scheme **v2 only** (v1 and v3 absent). One signer, CN=Poreia, valid 2026-11-15 to 2056-11-07, certificate SHA-256 `ef88664588fb2876f1b558dac28fa2752a08067850b2fc68be337d18e9569375`. The same certificate signs v0.4.0, v0.5.0, v0.6.0 and v0.6.1 (checked on all four downloaded APKs), so same-key updates work across all releases to date |
| Exported activity | `MainActivity` (launcher, and a `VIEW` filter for the scheme `poreia`, BROWSABLE) |
| Widget | `PoreiaFast` receiver is `exported="false"`. Its `WIDGET_CLICK` action cannot be sent by another app. The task handler also accepts only `TOGGLE_DONE` for the done mark |
| Exported provider | `RNWidgetImageProvider` (`...rnwidget.imageprovider`) is exported with no permission, as the launcher must read the widget images. Source reviewed: read mode only, file names must match `widget_<id>_mode_(light\|dark)_...<64 hex random>.png`, the path is canonicalised and must be a direct child of `files/widget_images`. Without a name nothing can be read, and the names are 256-bit random. The widget image shows only the day's fasting text, foods, feast and the done mark (no name, no saints) |
| Non-exported provider | `FileSystemFileProvider` (`exported=false`, `grantUriPermissions=true`); its paths cover the app's files and cache directories, and access is only by explicit grant (the installer gets one for the APK) |
| Exported but permission-guarded | `SystemJobService` (`BIND_JOB_SERVICE`), `DiagnosticsReceiver` and `ProfileInstallReceiver` (`DUMP`, shell only), `FirebaseInstanceIdReceiver` (`c2dm.permission.SEND`) |
| Other components | All other services, receivers, activities and providers are `exported="false"` |
| Permissions actually requested | `INTERNET`, `REQUEST_INSTALL_PACKAGES`, `VIBRATE`, `ACCESS_NETWORK_STATE`, `RECEIVE_BOOT_COMPLETED`, `POST_NOTIFICATIONS`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, `com.google.android.c2dm.permission.RECEIVE`, the install-referrer binding permission, 16 launcher badge permissions, and the app's own `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` |
| Blocked already effective | `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` are not in the APK |
| Contents of the APK | One ABI (`arm64-v8a`), Hermes bytecode bundle, no source maps, no `.env`, no keys or credentials (pattern scan for GitHub, AWS, Google and PEM private keys: no hit; `assets/expo-root.pem` is Expo's public root certificate for code signing, not a secret) |

### `REQUEST_INSTALL_PACKAGES`

The permission lets the app ask Android to install an APK. It does not install anything silently:
Android shows the "install unknown apps" switch for Poreia (off until the user turns it on) and then
the installer's own confirmation. Poreia's installer intent is a plain `ACTION_VIEW` with the MIME
type `application/vnd.android.package-archive` and a read grant on the file's content URI; the
system package installer handles it. The permission is also a signal to store reviewers and to
people reading the manifest, which is why it is documented here. Remove it if in-app APK updates are
ever dropped.

### Signing continuity

Android refuses to update an installed app with an APK signed by a different certificate. The
certificate above is stable over four releases. The release workflow now compares the certificate
inside the keystore secret, before building, and of the built APK, after building, with this
fingerprint, and stops on a mismatch. The keystore and its password exist only as GitHub secrets
and (the owner must confirm) in an offline backup; losing both would lock every installed copy out
of in-app updates. Because the APK has no v3 signature, certificate rotation with a lineage is not
possible for the existing installs; rotation would mean a new package id.

## The expo-updates patch (`patches/expo-updates+58.0.22.patch`)

The whole patch is one change in `manifest/UpdateFactory.kt`: a manifest response without the
`expo-protocol-version` header used to throw "Legacy manifests are no longer supported"; it is now
read as protocol 1 (`null, 0, 1 ->`). GitHub Pages cannot send that header.

What it weakens: nothing that is a security check. The header selects the manifest format, it does
not authenticate anything. Still enforced, read from the installed expo-updates source:

- The update URL is the one in the APK's manifest meta-data (`EXPO_UPDATE_URL`). It can only be
  overridden by JavaScript if the build enables `disableAntiBrickingMeasures`, which it does not,
  and the app never calls an override API. A manifest cannot move the app to another host;
  `LoaderSelectionPolicyFilterAware` refuses an update whose `url` differs from the configured one.
- An update is launched only if its `runtimeVersion` equals the app's
  (`LauncherSelectionPolicyFilterAware`). A runtime-5 manifest on the runtime-6 path is stored but
  never run.
- An update replaces the running one only if its `createdAt` is later
  (`LoaderSelectionPolicyFilterAware`: `newUpdate.commitTime.after(launchedUpdate.commitTime)`), so
  replaying an old manifest is not a downgrade. A rollback is a new deploy of old code, which gets a
  new `createdAt`.
- Every bundle and asset is verified against the `hash` in the manifest
  (`downloadAssetAndVerifyHashAndWriteToPath`), and asset file names are checked for path traversal
  (`isSafeFilename`).
- What the patch also means: static hosting cannot send `expo-signature` either, so no code signing,
  and no roll-back-to-embedded directive (directives travel only in multipart responses). Neither
  is a regression, since both were already impossible on static hosting.

Weak points that exist with or without the patch: the manifest carries its own hashes, so the
hashes defend against a swapped file but not against a swapped manifest; a `createdAt` that does not
parse becomes "now" instead of an error; and the manifest's asset URLs may name any host (a tampered
manifest could point the bundle anywhere). All of these need the attacker to control the manifest,
which is the code-signing problem in SECURITY-OTA-SIGNING.md.

## The OTA path

Who can publish: anyone who can push to `main` (the workflow `Publish update` runs on every push to
`main` and on a manual run). At the time of this review (2026-11-18) `main` had **no branch
protection and there were no rulesets**, and two accounts can push (the owner and one collaborator
with the `write` role). The `github-pages` environment allows deployments from `main` and from the
stale branch `feat/calendar-engine`. See findings F-01 and F-03.

If Pages content were tampered with: the next app start (`checkAutomatically: ON_LOAD`,
`fallbackToCacheTimeout: 0`) downloads and, on the following launch, runs the new bundle with all
the app's permissions. The per-file hashes do not help if the manifest is replaced. Impact: code
execution inside the app: reading the settings and marks, drawing arbitrary UI, opening allowlisted
links, and starting the APK download (the signature check and the digest check still apply to
that). It cannot silently install anything.

Risk rating (before the owner actions in the checklist): **High**. Likelihood is low to medium (it
needs write access to the repository or Pages, or TLS interception), impact is every install.
After branch and tag protection, required review and a 2FA key on the owner account: Medium.
After manifest signing: Low.

Mitigations in place after this review (all in `.github/` and `scripts/`, no native change):

- The workflow is split. `build` has only `contents: read` and is the only job that runs project or
  npm code; `deploy` has `pages: write` and `id-token: write` and runs only `actions/deploy-pages`.
- Both jobs run only for `refs/heads/main`, so a manual run from another branch cannot publish,
  whatever the environment rules say.
- `npm ci --ignore-scripts` and an explicit `npx patch-package`: no dependency install script runs
  in any workflow (checked: only `fsevents` declares one).
- `scripts/verify-update.mjs` runs before the upload and fails the build unless the runtime version
  matches `app.json`, every URL is https under the manifest's own folder, every file's SHA-256 and
  name match the manifest, `createdAt` is a real date that is not in the future, and nothing else
  (source maps, `.env`, keys, strays) is in the site. Tests: `scripts/verify-update.test.mjs`.
- `.github/CODEOWNERS` marks the files that decide what ships.

## Permissions

Declared in `app.json`:

- `REQUEST_INSTALL_PACKAGES`: needed for installing a newer APK from Settings.
- Added by Expo and its modules: `INTERNET`, `ACCESS_NETWORK_STATE`, `VIBRATE`, `WAKE_LOCK`,
  `FOREGROUND_SERVICE`, `RECEIVE_BOOT_COMPLETED` (notifications are rescheduled after a reboot) and
  `POST_NOTIFICATIONS`.
- Blocked in `blockedPermissions`: `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`,
  `WRITE_EXTERNAL_STORAGE` (already effective in v0.6.1), and, **new, effective with the next
  APK**, the push receive permission, the install-referrer binding permission and the 16 launcher
  badge permissions that expo-notifications adds (the app never sets a badge and never receives
  push).

After building an APK, check the real list rather than trusting this page:

    aapt2 dump permissions poreia-vX.Y.Z.apk
    aapt2 dump xmltree --file AndroidManifest.xml poreia-vX.Y.Z.apk | grep -B1 -A3 exported

## Supply chain

`npm audit` (full and `--omit=dev` give the same result) on 2026-11-18, from a clean `npm ci`:
4 moderate findings from **one** advisory, `GHSA-g3hv-75wg-m249`, denial of service through
`minimatch` 7.0.0 to 11.0.0, reached through `expo`, `@expo/fingerprint` (`minimatch@10.2.6`) and
`react-native-android-widget` (which only peers on `expo`). `@expo/fingerprint` is a Node tool used
by `expo prebuild` and the Expo CLI. It is **not in the shipped app**: the string `minimatch` is
absent from the Hermes bundle of the released APK and from a fresh `expo export`. It runs on build
machines on fixed ignore patterns, not on attacker input. The earlier note about two advisories
and 40 findings (including `picomatch`) is out of date: the Expo SDK update removed it.

Fix applied: `package.json` `overrides` pins `@expo/fingerprint`'s `minimatch` to `^11.0.9` (same
maintainer, one new dependency `@isaacs/nonrecursive-glob-match`, no install scripts). Verified in a
clean directory: `npm ci --ignore-scripts`, `npx patch-package`, `npx tsc --noEmit`, `npm test`,
`npx expo prebuild --platform android --no-install`, a fingerprint run, and `npm audit` reports
0 vulnerabilities. Remove the override when Expo ships a fingerprint that depends on
`minimatch` 11 itself. The override is a build-tooling change only, nothing in the app changes.

Lockfile: version 3, 622 packages, every `resolved` URL is `https://registry.npmjs.org/...`, every
entry has a sha512 integrity, no git, file or tarball URL dependencies. The only packages with an
install script are the root project (`postinstall: patch-package`) and `fsevents` (macOS only).
The direct dependencies are the expected Expo SDK 58 set; no look-alike names.

CI hardening in `.github/`:

- Every action is pinned to a commit SHA with the version in a comment. On 2026-11-18 each of the
  six SHAs was checked against the tag through the GitHub API and matched (`actions/checkout`
  v4.4.0, `setup-node` v4.4.0, `setup-java` v4.9.1, `upload-pages-artifact` v3.0.1,
  `deploy-pages` v4.0.5, `configure-pages` v5.0.0 which is no longer used). All are GitHub-owned;
  there is no third-party action. Dependabot (`.github/dependabot.yml`, weekly) proposes updates
  for npm and for the actions.
- No `pull_request_target`, no `${{ github.event... }}` in any `run:` block (the only expressions
  are secrets, `github.token`, the Pages URL output and the concurrency group). `pull_request` runs
  (CI) get a read-only token and no secrets.
- Workflow-level permissions are `contents: read`; the jobs that need more ask for it themselves
  (release creation, Pages deploy). Checkout does not persist the token.
- The keystore comes from GitHub secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`),
  is written to the runner's temp directory and deleted on exit, and is never echoed. No other
  secret appears in any workflow. The release job now also runs in the environment `release`, so
  the owner can move the secrets there and require an approval.
- A tag must equal `v` plus the version in `app.json` and its commit must be on `main`; the keystore
  and the built APK must carry the expected certificate (fingerprint above).
- The signing secret is still visible to the whole Gradle build (npm packages' Gradle plugins run
  in it). Signing in a last step with `apksigner` would narrow that to one command; it was not done
  here because it cannot be tested without cutting a release. It is listed under "left".
- Secrets scan, 2026-11-18, gitleaks 8.30.1: full history (97 commits, all branches), the working
  tree and `--redact` runs: no leaks. `.gitignore` covers keystores, keys, `.env` files and service
  files. A search for tokens, keys, passwords and URLs with credentials found only the workflow
  references to the GitHub secrets. One finding: a test-output file (`.vitest/json/output.json`)
  was tracked and recorded absolute paths of the author's machine and other work directories. It
  is untracked and ignored now; it stays in older commits.

## Findings of the 2026-11-18 detailed scan

Severity is a judgement for this app (small, local, no accounts). "Evidence" says how it was
established. Status: fixed (in this change; JavaScript and CI changes ship with the next update or
workflow run), needs-owner (a GitHub setting only the owner can change), needs-APK (reaches phones
with the next `v*` release), left (accepted or not worth the risk).

| ID | Severity | Finding | Evidence | Status |
|---|---|---|---|---|
| F-01 | High | `main` has no branch protection and there are no rulesets, so tags are unprotected. A collaborator with `write` can push to `main` (publishes to every install) or push a `v*` tag (builds a signed APK in a run that can read the keystore secrets; a changed workflow could also copy them out) | `gh api repos/Kw4nzah/Poreia/branches/main/protection` returned 404; `.../rulesets` returned `[]`; `.../collaborators` lists `egemenmermer` with `push: true` | needs-owner (checklist). In-repo guards added (main-only publishing, tag on main and equal to the version, CODEOWNERS, `environment: release`) |
| F-02 | High (impact) | The update manifest is not signed, so repository or Pages write access means code execution in every install | Documented; `docs/SECURITY-OTA-SIGNING.md`; no `codeSigningCertificate` in the released `app.config` | left (needs native patch, APK and a new runtime; steps documented) |
| F-03 | Medium | The `github-pages` environment allows deployments from the stale branch `feat/calendar-engine` as well as `main` | `gh api .../environments/github-pages/deployment-branch-policies` | needs-owner. The workflow itself now refuses any ref except `main` |
| F-04 | Medium | Private vulnerability reporting is off although SECURITY.md tells reporters to use it; Dependabot alerts and security updates are off. (Secret scanning and push protection are on) | `gh api repos/Kw4nzah/Poreia/private-vulnerability-reporting` returned `enabled: false`; `.../vulnerability-alerts` 404; `security_and_analysis` in the repo object | needs-owner |
| F-05 | Medium | The signing secret is exposed to the whole Gradle build, so any code in the build can read it | `apk.yml` passes it as environment of the Gradle step | left (documented; option: sign last with `apksigner`). Reduced: certificate pin checks, tag checks, environment |
| F-06 | Medium | The downloaded APK was never checked against anything but its size, and the download follows GitHub's redirect to another host with no check of where it ended | `useApkUpdate.ts` before this change; `FileSystemDownload.kt` uses a default `OkHttpClient` that follows redirects | fixed in JavaScript: SHA-256 of the file compared with GitHub's `digest` (native hashing), tag and path consistency, tag format and size sanity (`apkRelease.ts`, `apkFetch.ts`; tests). Residual: the check is skipped if GitHub lists no digest, and it does not defend against a compromised GitHub account (only Android's signature check does) |
| F-07 | Low | Pasting a backup of 65 536 spaces stalled the app: the trim regular expression backtracked quadratically (2.6 s in V8 on this input, slower on a phone) | Reproduced in Node: 8 000 chars 40 ms, 16 000 159 ms, 32 000 637 ms, 65 000 2 634 ms | fixed (`trimInvisible`, linear; regression test with a 250 ms bound) |
| F-08 | Low | `PRIVACY.md` said the app adds "no identifiers", but expo-updates sends a persistent random per-install id (`EAS-Client-ID`) and the previous crash text (`Expo-Fatal-Error`) with every manifest request, to the GitHub Pages host | `FileDownloader.kt` lines 900 and 1016 (header names), about 1029 (fatal error); `EASClientID.kt` (UUID kept in shared preferences) | docs fixed. Removing the header needs a native patch: needs-APK, optional |
| F-09 | Low | The backup text, which the user shares through Android's share sheet, holds name, saints, church and every marked day in plain text; the share sheet, clipboard history and receiving apps may keep it | `src/backup/backup.ts` `createBackup`, `BackupSection.tsx` `Share.share` | warning added to the copy hint in tr, en and ru (ships as an update). Residual accepted: no encryption (would need a passphrase and a crypto library) |
| F-10 | Low | Libraries merge permissions the app never uses: push receive, install-referrer binding and 16 launcher badge permissions | `uses-permission` lines 25, 28 to 44 of the released manifest | needs-APK: added to `blockedPermissions`. Checked in the generated source manifest after `expo prebuild` (`tools:node="remove"`); not yet checked in a built APK |
| F-11 | Low | `.vitest/json/output.json` was tracked and records absolute local paths (user name, other worktrees) | `git ls-files .vitest`; file content | fixed going forward (untracked, ignored); history left unrewritten |
| F-12 | Info | Build-tool advisory `GHSA-g3hv-75wg-m249` (minimatch ReDoS), 4 moderate rows, not in the shipped bundle | `npm audit`, `npm audit --omit=dev`, string absent from the `.hbc` bundle and the APK | fixed with `overrides` (audit now 0); build-tool only either way |
| F-13 | Info | `RNWidgetImageProvider` is exported without a permission (required for the launcher to read widget images) | Released manifest line 78; library source reviewed | left: read-only, unguessable names, path canonicalised |
| F-14 | Info | The widget's click `PendingIntent`s are `FLAG_MUTABLE` (library). A malicious launcher holding one could fill in extras; the target component is explicit and fixed, and `OPEN_URI` would open a URI in the app's name | `RNWidget.java` lines 232 to 237 and 372 | left (library behaviour; needs a malicious home app) |
| F-15 | Info | APK has only a v2 signature (no v1, no v3) | androguard `is_signed_v1/v2/v3` on all four releases | left: fine for minSdk 24; no key rotation lineage possible |
| F-16 | Info | A stale `poreia-update.apk` (35 MB) can stay in the private cache after an install | `useApkUpdate.ts` target path | left (private cache, Android may clear it) |
| F-17 | Info | The repository setting "require actions to be pinned to a full SHA" is off and any action is allowed | `gh api .../actions/permissions`: `sha_pinning_required: false`, `allowed_actions: all` | needs-owner (checklist) |

## Owner checklist (settings that only the repository owner can change)

- [ ] Enable two-factor authentication (passkey or security key) on the GitHub account.
- [ ] Decide about the second collaborator (`egemenmermer`, `write`). Anyone with write access
      can publish an update to every install. Either remove the account, lower it to `read` or
      `triage`, or let the protections below force a pull request and the owner's approval.
- [ ] Repository, Settings, Code security: turn on private vulnerability reporting (SECURITY.md
      depends on it), Dependabot alerts and Dependabot security updates. Secret scanning and push
      protection are already on.
- [ ] Settings, Branches (or Rules, Rulesets): protect `main`: no force push, no deletion, require
      a pull request, require the CI check, require review from Code Owners (the `CODEOWNERS` file
      is in place), and do not allow bypass for admins if you can accept that.
- [ ] Settings, Rules: a ruleset that restricts creation of `v*` tags to the owner (a tag builds a
      signed APK), and blocks deletion and update of them.
- [ ] Settings, Environments, `github-pages`: remove the `feat/calendar-engine` deployment branch;
      leave `main` only.
- [ ] Settings, Environments, `release` (the release job now uses it; it is created on the first
      run, or create it first): move `ANDROID_KEYSTORE_BASE64` and `ANDROID_KEYSTORE_PASSWORD`
      from repository secrets into this environment, restrict its deployment tags to `v*`, and add
      yourself as a required reviewer.
- [ ] Settings, Actions, General: keep the default workflow token permission "Read repository
      contents" (it is), keep "Require approval for first-time contributors" (it is), and tick
      "Require actions to be pinned to a full-length commit SHA"; allow GitHub-owned actions only.
- [ ] Keep an offline backup of the keystore and its password. Losing it means users must
      uninstall and reinstall to get a newer APK.
- [ ] Decide about OTA manifest signing: [SECURITY-OTA-SIGNING.md](SECURITY-OTA-SIGNING.md).

## Needs the next APK

These are in `app.json` or the code now but reach phones only with the next `v*` release:

- `android.allowBackup: false` (Expo's template already writes the same value, and v0.6.1 already
  has it; the explicit setting keeps it stable across SDK upgrades).
- The enlarged `android.blockedPermissions` list (finding F-10).
- Anything about OTA code signing (not enabled) and the optional removal of the `EAS-Client-ID`
  header (finding F-08).

Everything else on this page, including the APK digest check, the link allowlist, the settings
validation, the backup trim, the quieter error boundary and the backup warning text, is
JavaScript and ships as a normal update. The workflow, `CODEOWNERS` and `package.json` changes take
effect on the next push or tag.

## Not verified

- The new workflow steps (keystore and APK certificate checks, tag checks, the build and deploy
  split) are written and syntax-checked but have not been run on GitHub; the first `v*` tag and the
  first push to `main` after merging are the real test. Both fail closed (nothing is published).
- The SHA-256 check was tested with fakes; it has not run against a real download on a phone.
- The merged Android manifest of a build with the enlarged `blockedPermissions` has not been built.
