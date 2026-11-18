# OTA update signing

Status on 2026-11-19: **implemented, ships with the next APK, not yet tested on a device.**
The code, the certificate and the workflow are in the repository; installs are protected only
once they run an APK built from this state (runtime 7 or later). Older APKs ignore the signature.

## What it protects

Without signing, the manifest on GitHub Pages lists every bundle and asset with a SHA-256, so a
single file cannot be swapped, but nothing proves who wrote the manifest: whoever can publish to
Pages for this repository (or break TLS to it) can ship code to all installs.

With signing, the APK carries a public certificate (`certs/certificate.pem`, `CN=Poreia OTA`,
RSA 2048, valid 2026-11-18 to 2056-11-18, Key Usage `digitalSignature`, Extended Key Usage
`codeSigning`). The app refuses a manifest that is not signed by the matching private key. A
compromise of the Pages site, of the `deploy` job or of the workflow's `GITHUB_TOKEN` is then not
enough; the attacker also needs the key. Not covered: a stolen GitHub account that can run the
`sign` job (it signs whatever the build produced), and a malicious npm package in the build (its
output gets signed like any other build). Branch protection and a reviewer on the `release`
environment are what narrow those.

## How it works

expo-updates reads the signature from the `expo-signature` HTTP response header of the manifest.
GitHub Pages cannot set response headers, so Poreia publishes the same value in a file next to the
manifest and patches expo-updates to read it from there.

- **Format** (RFC 8941 dictionary, exactly what `SignatureHeaderInfo.kt` parses and what Expo's own
  CLI sends): `sig="<base64>", keyid="main", alg="rsa-v1_5-sha256"`. `sig` must be a String item; a
  Byte Sequence (`sig=:...:`) is rejected by expo-updates. `<base64>` is an RSA PKCS#1 v1.5
  SHA-256 signature over the exact bytes of `manifest.json` as served.
- **App** (`patches/expo-updates+58.0.22.patch`, `loader/FileDownloader.kt`): in
  `downloadRemoteUpdate`, when code signing is configured, the response has no `expo-signature`
  header and is not multipart, the app fetches `<manifest url>.sig` with the same OkHttp client and
  passes its trimmed text to `parseRemoteUpdateResponse`, where it takes the place of the missing
  header. From there nothing is changed: `checkCodeSigningAndCreateManifest` calls
  `CodeSigningConfiguration.validateSignature` (keyid must equal `codeSigningMetadata.keyid`,
  certificate validity, Key Usage and Extended Key Usage, self-signature, then
  `SHA256withRSA` over the manifest bytes). Directive and multipart handling are untouched.
- **Fail closed**: a missing `.sig` (HTTP error), an empty or malformed one, a wrong keyid or a bad
  signature all end in an exception inside `downloadRemoteUpdate`, which expo-updates already
  handles like a network failure: the update is not stored, the app keeps running the embedded or
  last good bundle, and the error is logged (`UpdateCodeSigningError` or `UpdateFailedToLoad`). It
  runs in the background after launch (`fallbackToCacheTimeout: 0`), so it cannot block startup.
  `codeSigningAllowUnsignedManifests` stays at its default `false`.
- **App config** (`app.json`): `updates.codeSigningCertificate: "./certs/certificate.pem"` and
  `updates.codeSigningMetadata: { "keyid": "main", "alg": "rsa-v1_5-sha256" }`. The config plugin
  (`@expo/config-plugins` `android/Updates.js`) reads the PEM and writes both into
  `AndroidManifest.xml` as `expo.modules.updates.CODE_SIGNING_CERTIFICATE` and `..._METADATA`.
- **Build** (`.github/workflows/update.yml`): `build` (npm code, no secrets) exports the bundle,
  runs `build-update.mjs` and `verify-update.mjs --before-signing`, and uploads the unsigned site as
  an artifact. `sign` (environment `release`, fresh checkout, Node built-ins only) re-verifies it,
  runs `scripts/sign-manifest.mjs site` with `POREIA_OTA_PRIVATE_KEY` in that one step's
  environment, and runs `verify-update.mjs site`, which checks the signature the way the app does,
  before the Pages artifact is uploaded. `deploy` publishes it. The sign script fails when app.json
  requires signing and the secret is missing, and when the key does not belong to
  `certs/certificate.pem` (otherwise every install would refuse every update).
- **Tests**: `scripts/sign-manifest.test.mjs` signs with a throwaway key and a throwaway
  certificate built in the test, checks acceptance and every rejection path (changed bytes, other
  key, keyid, Byte Sequence, unknown alg, no code-signing usage, expired), the site check, and the
  committed certificate and app.json values.

## Keys

- Private key: generated with OpenSSL 3.5 on the owner's machine, stored **only** as
  `~/poreia-secrets/ota-private-key.pem` in the owner's home folder (outside the repository). `.gitignore`
  blocks every `*.pem` except `certs/certificate.pem`, and `verify-update.mjs` refuses any `.pem`
  or `.key` file in the published site.
- GitHub: the same PEM text must be stored as the environment secret `POREIA_OTA_PRIVATE_KEY` of
  the environment `release` (Settings, Environments, release, Add secret). Not done by any script.
- Back the key up offline. A lost key means no more OTA updates until a new APK with a new
  certificate is installed.
- If the key leaks: delete the secret, generate a new pair and ship a new APK with the new
  certificate and a new runtime version. Apps with the old certificate cannot be moved over the
  air, because the attacker holds a key they still trust.
- Rotation before 2056: ship an APK with the next certificate well before the old one expires
  (`checkValidity()` fails after `notAfter`, and from then on that APK refuses every update).

Commands used (the second needs an OpenSSL config with `prompt = no`, `CN = Poreia OTA`,
`keyUsage = critical, digitalSignature`, `extendedKeyUsage = critical, codeSigning`):

    openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out <secrets>/ota-private-key.pem
    openssl req -new -x509 -key <secrets>/ota-private-key.pem -sha256 -days 10958 \
      -config ota-cert.cnf -out certs/certificate.pem

The pair was checked with `@expo/code-signing-certificates` `validateSelfSignedCertificate` and a
sign-and-verify round trip.

## Release order

1. Owner: add `POREIA_OTA_PRIVATE_KEY` to the `release` environment, and allow `main` as a
   deployment branch of `release` (the `sign` job runs on pushes to `main`; if the environment is
   limited to `v*` tags the job cannot start and nothing is published). A required reviewer on
   `release` then means every update publish waits for an approval.
2. Runtime bump (orchestrator): `runtimeVersion` 7 and `/7/` in `updates.url`, `version`,
   `android.versionCode`. Never publish a signed manifest to a runtime that unsigned APKs read and
   never ship the certificate without a runtime bump: an app with a certificate refuses unsigned
   manifests, so the two must not share an update path.
3. Tag, let CI build the APK, run the device test below.
4. Only then merge to `main`, so the first signed runtime-7 update is published.

## Review checklist (the Kotlin patch was not compiled here)

There is no Android SDK or JDK on the machine that wrote the patch. Every symbol was checked by
hand against the installed expo-updates 58.0.22 source: `configuration.codeSigningConfiguration`
(`UpdatesConfiguration`, lazy, null without a certificate), `configuration.updateUrl`
(`android.net.Uri`: `buildUpon()`, `encodedPath`), `downloadData(Request)` (private suspend, same
client and cache), OkHttp 4.9 `Response.headers[...]`, `.isSuccessful`, `.code`, `.body?`,
`ResponseBody.contentType()?.type`, `Closeable.use`, and the new default parameter of the internal
`parseRemoteUpdateResponse` (no other caller in main, test or androidTest sources). The patch
applies with `patch-package --error-on-fail` to a pristine `npm pack expo-updates@58.0.22`.

CI must show:

- [ ] `Build APK` passes `npx patch-package` and `./gradlew assembleRelease` (the Kotlin compiles).
- [ ] After `expo prebuild`, `android/app/src/main/AndroidManifest.xml` contains
      `expo.modules.updates.CODE_SIGNING_CERTIFICATE` (the PEM) and
      `expo.modules.updates.CODE_SIGNING_METADATA` = `{"keyid":"main","alg":"rsa-v1_5-sha256"}`.
- [ ] `Publish update`: the `sign` job logs `signed ... (keyid main)` and
      `signature valid (keyid main)`; the deployed site has
      `https://kw4nzah.github.io/Poreia/updates/android/7/manifest.json.sig`.

## Device test

Use a phone or emulator with `adb`; filter the log with `adb logcat | grep -iE "expo-updates|dev.expo.updates|CodeSigning"`.

1. Install the new APK (runtime 7). Start it once; it runs the embedded bundle.
2. Publish an update (merge to `main`). Check `curl -sI .../7/manifest.json.sig` returns 200.
3. Start the app twice (download on the first start, run on the second). Expected: the new
   bundle runs, `Updates.updateId` changes, and the log shows
   `Manifest code signing signature verified successfully`.
4. Negative test, on a throwaway branch or a fork's Pages site with the same path layout (never on
   the live site), or with a local HTTP server and an APK whose `updates.url` points to it:
   - change one character of the base64 in `manifest.json.sig`, or delete the file, or change one
     byte of `manifest.json` without re-signing;
   - restart the app twice. Expected: the app keeps the previous bundle, does not crash, and the
     log shows `Code signing verification failed for manifest` / `Incorrect signature`, or
     `Manifest signature request not successful: HTTP 404` for the deleted file.
5. Restore the correct files and confirm the next start loads the update again.

## Risks: what could stop installs from receiving updates

- The `sign` job cannot run: secret missing, `release` environment not allowing `main`, or an
  approval left pending. Nothing is published; installs keep their current bundle.
- The secret is not the key of `certs/certificate.pem`: the sign step fails the build (checked).
- Caching: the app fetches `manifest.json` and `manifest.json.sig` in two requests, each cached
  by GitHub's CDN and OkHttp for up to 10 minutes. Right after a deploy the app can briefly get a
  new manifest with an old signature (or the reverse); it rejects that update and retries on the
  next start. Self-healing, but a deploy can take one extra start to arrive.
- A future expo-updates upgrade: the patch must be re-created and re-checked; if
  `FileDownloader.kt` changes shape, `patch-package` fails in CI rather than silently dropping
  the signature fetch. If someone dropped only the FileDownloader hunk, signed apps would refuse
  every update (`No expo-signature header specified`), which is safe but stops OTA.
- The certificate expires on 2056-11-18 (also the end of the APK signing certificate).
- Lost private key: no further OTA updates for APKs with this certificate.
