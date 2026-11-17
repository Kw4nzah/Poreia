# OTA update signing (evaluation and steps, NOT enabled)

Status on 2026-11-18: **not enabled.** Nothing in `app.json`, the workflows or the app uses it.
`scripts/sign-manifest.mjs` exists but nothing calls it. Enabling it changes native configuration
and needs a new APK and a new runtime version (see "Release order").

## What is protected today

- The app downloads the update manifest over HTTPS from `kw4nzah.github.io`.
- The manifest lists every bundle and asset with a SHA-256 hash; expo-updates rejects any file
  whose hash differs. So a file cannot be swapped without changing the manifest.
- Nothing proves who wrote the manifest. Whoever can publish to GitHub Pages for this repository
  (or break TLS to it) can ship code to all installs.

Code signing closes that: the app carries a public certificate, and refuses a manifest that was not
signed by the matching private key. Then even a full compromise of the Pages site or of the
workflow's `GITHUB_TOKEN` is not enough; the attacker also needs the signing key. Note that a
stolen GitHub account that can also read Actions secrets can still sign, so keep the signing key in
an environment secret that only `main` may use.

## The obstacle: static hosting cannot send the header

expo-updates reads the signature from the `expo-signature` HTTP response header of the manifest
request (or from a multipart part header). GitHub Pages serves files with fixed headers, so the
signature cannot travel that way. Poreia already patches expo-updates
(`patches/expo-updates+58.0.22.patch`) because Pages also cannot send `expo-protocol-version`.

Two ways forward:

A. Extend the patch (stays GitHub only). In
   `android/.../loader/FileDownloader.kt`, where the manifest response is turned into
   `ResponsePartHeaderData(signature = responseHeaders["expo-signature"])`, fall back to fetching
   `<manifest url>.sig` (a second small request) when the header is absent, and use its text as the
   signature. The signature must be computed over the exact bytes of the manifest file, which is
   what `scripts/sign-manifest.mjs` does. This is a native patch, so it ships only in an APK.
   The patch has to be redone on every expo-updates upgrade. Do not forget the failure mode: if the
   `.sig` request fails, the update must be refused, not accepted unsigned.
B. Host the manifest where response headers can be set (Cloudflare Pages `_headers`, a Worker,
   Netlify). Then no native patch is needed, but it leaves the GitHub-only model.

Option A is the recommended one. It needs a careful Kotlin change that was not made here because it
cannot be tested without building and running an APK.

## Steps (option A)

1. Generate the key pair and certificate on a trusted machine, outside the repository:

       npx expo-updates codesigning:generate \
         --key-output-directory ~/poreia-ota-keys \
         --certificate-output-directory code-signing \
         --certificate-validity-duration-years 10 \
         --certificate-common-name "Poreia"

   This writes `private-key.pem` and `public-key.pem` to the key directory and `certificate.pem`
   to `code-signing/`. Keep the private key out of the repo; `.gitignore` already blocks `*.pem`,
   `*.key` and `**/private*.pem`. Back it up offline (a lost key means a new APK for everyone).

2. Allow the public certificate to be committed: add `!code-signing/certificate.pem` to
   `.gitignore` after the `*.pem` line, then `git add code-signing/certificate.pem`.

3. Add the configuration to `app.json` (or run
   `npx expo-updates codesigning:configure --certificate-input-directory code-signing --key-input-directory ~/poreia-ota-keys`):

       "updates": {
         "url": "https://kw4nzah.github.io/Poreia/updates/android/6/manifest.json",
         "codeSigningCertificate": "./code-signing/certificate.pem",
         "codeSigningMetadata": { "keyid": "main", "alg": "rsa-v1_5-sha256" },
         ...
       }

4. Bump `runtimeVersion` to `"6"` and the number in `updates.url`, `version` and
   `android.versionCode`, as `CLAUDE.md` requires for a native change. Old APKs (runtime 5) keep
   receiving unsigned runtime-5 updates from the old path until you stop publishing it.

5. Store the private key as a GitHub secret, preferably an environment secret in a protected
   environment: `OTA_SIGNING_KEY_PEM` (the PEM text).

6. In `.github/workflows/update.yml`, after "Build update site" and before upload, add:

       - name: Sign manifest
         env:
           OTA_SIGNING_KEY_PEM: ${{ secrets.OTA_SIGNING_KEY_PEM }}
         run: node scripts/sign-manifest.mjs "site/updates/android/6/manifest.json"

   The script verifies its own signature before it writes `manifest.json.sig`. Do not change the
   manifest after this step.

7. Apply the `FileDownloader.kt` change from option A to the patch (`npx patch-package expo-updates`
   after editing `node_modules`), then build an APK with a `v*` tag.

8. Test on a device before anyone else gets it: install the APK, publish an update, confirm it
   loads; then publish a deliberately wrongly signed manifest and confirm the app refuses it and
   keeps the old bundle (`adb logcat` shows `UpdateCodeSigningError` / "Incorrect signature").

## Release order

1. Land the patch, certificate and `app.json` changes with the runtime bump on a branch.
2. Tag, let CI build the APK, install it, run the checks from step 8.
3. Only then merge to `main` so the runtime-6 update is published.

Never publish a signed manifest to a runtime that old APKs read, and never enable signing without a
runtime bump: an app with a certificate refuses unsigned manifests, an app without one ignores the
signature, so the two must not share an update path.

## Key handling and rotation

- The certificate expires (10 years above). Plan the rotation: ship a new APK with the next
  certificate before the old one expires.
- If the private key leaks, remove the secret, generate a new pair and ship a new APK with the new
  certificate and a new runtime version. Apps with the old certificate cannot be moved over the
  air, because an attacker holds a key they still trust.
- Treat `OTA_SIGNING_KEY_PEM` like the Android keystore: only in GitHub secrets, never in logs, a
  file in the repository or a local `.env`.
