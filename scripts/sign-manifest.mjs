// NOT ACTIVE. Nothing calls this script yet. See docs/SECURITY-OTA-SIGNING.md before using it.
//
// Signs the update manifest written by scripts/build-update.mjs with an RSA key, the way
// expo-updates code signing expects it, and writes the value of the `expo-signature` header next
// to the manifest as `manifest.json.sig`.
//
//   OTA_SIGNING_KEY_PEM="$(cat private-key.pem)" node scripts/sign-manifest.mjs <manifest.json> [keyid]
//
// The private key is read from an environment variable (a GitHub secret in CI), never from a file
// in the repository. The signature covers the exact bytes of the manifest file, so the manifest
// must not be rewritten after signing.

import { createSign, createVerify, createPublicKey } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [manifestPath, keyId = 'main'] = process.argv.slice(2);
const privateKeyPem = process.env.OTA_SIGNING_KEY_PEM;
if (!manifestPath || !privateKeyPem) {
  console.error(
    'usage: OTA_SIGNING_KEY_PEM=... node scripts/sign-manifest.mjs <manifest.json> [keyid]',
  );
  process.exit(1);
}

const body = readFileSync(manifestPath);
const signature = createSign('RSA-SHA256').update(body).sign(privateKeyPem, 'base64');

// Check our own signature before publishing it, so a wrong key fails the build, not the users.
const publicKey = createPublicKey(privateKeyPem);
if (!createVerify('RSA-SHA256').update(body).verify(publicKey, signature, 'base64')) {
  throw new Error('signature does not verify against the key it was made with');
}

// RFC 8941 structured-field dictionary, as in the `expo-signature` response header.
const header = `sig="${signature}", keyid="${keyId}", alg="rsa-v1_5-sha256"`;
writeFileSync(`${manifestPath}.sig`, header);
console.log(`signed ${manifestPath} (keyid ${keyId}) -> ${manifestPath}.sig`);
