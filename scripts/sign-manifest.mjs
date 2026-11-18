// Signs the update manifest for expo-updates code signing and writes `manifest.json.sig` next to it.
//
//   POREIA_OTA_PRIVATE_KEY="$(cat ota-private-key.pem)" node scripts/sign-manifest.mjs <siteDir>
//
// GitHub Pages cannot send the `expo-signature` response header, so the patched expo-updates
// (patches/expo-updates+*.patch) fetches `<manifest url>.sig` instead and checks it exactly like the
// header: same structured-field format, same keyid check, same RSA-SHA256 verification against the
// certificate embedded in the APK (`updates.codeSigningCertificate` in app.json).
//
// The signature covers the exact bytes of the manifest file, so nothing may rewrite the manifest
// after this step. The private key comes only from the environment (a GitHub environment secret in
// CI); it is never read from or written to a file here, and never printed. Only Node built-ins are
// imported, so no npm package runs while the key is in memory.
//
// Format (RFC 8941 dictionary, as expo-updates' SignatureHeaderInfo.kt parses it):
//   sig="<base64 RSA-SHA256 signature>", keyid="<keyid>", alg="rsa-v1_5-sha256"
// `sig` must be a String item: a Byte Sequence (`sig=:...:`) is rejected by expo-updates.

import { X509Certificate, createPublicKey, createSign, createVerify } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ALGORITHM = 'rsa-v1_5-sha256';
const DEFAULT_KEY_ID = 'root'; // CODE_SIGNING_METADATA_DEFAULT_KEY_ID in expo-updates
const CODE_SIGNING_EKU = '1.3.6.1.5.5.7.3.3';

/**
 * Code signing settings from the `expo` object of app.json, or null when signing is not configured.
 * @param {any} expo
 * @param {string} projectRoot
 */
export function codeSigningSettings(expo, projectRoot = '.') {
  const certificate = expo?.updates?.codeSigningCertificate;
  if (!certificate) return null;
  const metadata = expo.updates.codeSigningMetadata ?? {};
  return {
    certificatePem: readFileSync(resolve(projectRoot, certificate), 'utf8'),
    keyId: metadata.keyid ?? DEFAULT_KEY_ID,
    alg: metadata.alg ?? ALGORITHM,
  };
}

/** Path of the manifest inside the site folder, from `updates.url` (a project site under /<repo>/). */
export function manifestPathInSite(updateUrl) {
  return new URL(updateUrl).pathname.split('/').slice(2).join('/');
}

/**
 * The value of the signature file for `bytes`.
 * @param {Buffer} bytes exact bytes that are published
 * @param {string} privateKeyPem
 * @param {string} keyId
 */
export function signatureHeader(bytes, privateKeyPem, keyId) {
  if (!/^[a-zA-Z0-9_.-]+$/.test(keyId)) throw new Error(`unsupported keyid: ${keyId}`);
  const sig = createSign('RSA-SHA256').update(bytes).sign(privateKeyPem, 'base64');
  return `sig="${sig}", keyid="${keyId}", alg="${ALGORITHM}"`;
}

/**
 * Parses the signature the way expo-updates does (SignatureHeaderInfo.parseSignatureHeader): an
 * RFC 8941 dictionary; `sig` must be a String; a missing or non-String `keyid` means "root"; a
 * missing `alg` means rsa-v1_5-sha256 and any other value is an error. Supports the item types a
 * signature can contain and rejects parameters, which expo-updates never sends.
 * @param {string} text
 */
export function parseSignatureHeader(text) {
  const s = text.trim();
  const fields = new Map();
  let i = 0;
  const fail = (why) => {
    throw new Error(`malformed signature: ${why}`);
  };
  while (i < s.length) {
    const key = /^[a-z*][a-z0-9_.*-]*/.exec(s.slice(i));
    if (!key) fail(`bad key at ${i}`);
    i += key[0].length;
    let value = { type: 'boolean', value: true };
    if (s[i] === '=') {
      i += 1;
      if (s[i] === '"') {
        let out = '';
        i += 1;
        for (;;) {
          if (i >= s.length) fail('unterminated string');
          const c = s[i];
          if (c === '\\') {
            if (s[i + 1] !== '"' && s[i + 1] !== '\\') fail('bad escape');
            out += s[i + 1];
            i += 2;
          } else if (c === '"') {
            i += 1;
            break;
          } else {
            if (c < ' ' || c > '~') fail('non-printable character in string');
            out += c;
            i += 1;
          }
        }
        value = { type: 'string', value: out };
      } else {
        const other =
          /^(:[A-Za-z0-9+/=]*:|\?[01]|-?[0-9.]+|[A-Za-z*][A-Za-z0-9:/!#$%&'*+.^_`|~-]*)/.exec(
            s.slice(i),
          );
        if (!other) fail(`bad value for ${key[0]}`);
        i += other[0].length;
        value = { type: other[0].startsWith(':') ? 'bytes' : 'other', value: other[0] };
      }
    }
    if (s[i] === ';') fail('parameters are not supported');
    fields.set(key[0], value);
    while (s[i] === ' ' || s[i] === '\t') i += 1;
    if (i >= s.length) break;
    if (s[i] !== ',') fail(`expected "," at ${i}`);
    i += 1;
    while (s[i] === ' ' || s[i] === '\t') i += 1;
    if (i >= s.length) fail('trailing comma');
  }
  const str = (name) => (fields.get(name)?.type === 'string' ? fields.get(name).value : null);
  const sig = str('sig');
  if (sig === null) throw new Error('structured field sig not found (it must be a String item)');
  const alg = str('alg') ?? ALGORITHM;
  if (alg !== ALGORITHM) throw new Error(`invalid code signing algorithm name: ${alg}`);
  return { sig, keyId: str('keyid') ?? DEFAULT_KEY_ID, alg };
}

/**
 * Checks a signature file against the manifest bytes and the embedded certificate the way the app
 * does. Returns null when the app would accept it, otherwise the reason it would not.
 * @param {Buffer} bytes
 * @param {string} signatureText
 * @param {{ certificatePem: string, keyId: string }} settings
 * @param {Date} [now]
 */
export function checkManifestSignature(bytes, signatureText, settings, now = new Date()) {
  let info;
  try {
    info = parseSignatureHeader(signatureText);
  } catch (error) {
    return error.message;
  }
  if (info.keyId !== settings.keyId) {
    return `keyid ${info.keyId} does not match the app's keyid ${settings.keyId}`;
  }
  const certificate = new X509Certificate(settings.certificatePem);
  if (now < new Date(certificate.validFrom) || now > new Date(certificate.validTo)) {
    return 'certificate is not valid now';
  }
  if (certificate.subject !== certificate.issuer || !certificate.verify(certificate.publicKey)) {
    return 'certificate is not self-signed';
  }
  const eku = certificate.extKeyUsage ?? certificate.keyUsage ?? [];
  if (!eku.includes(CODE_SIGNING_EKU)) return 'certificate lacks the code signing key usage';
  const valid = createVerify('RSA-SHA256')
    .update(bytes)
    .verify(certificate.publicKey, Buffer.from(info.sig, 'base64'));
  return valid ? null : 'signature does not match the manifest and the certificate';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const siteDir = process.argv[2];
  if (!siteDir) {
    console.error('usage: POREIA_OTA_PRIVATE_KEY=... node scripts/sign-manifest.mjs <siteDir>');
    process.exit(1);
  }
  const expo = JSON.parse(readFileSync('app.json', 'utf8')).expo;
  const settings = codeSigningSettings(expo);
  if (!settings) {
    console.log(
      'code signing is not configured in app.json (updates.codeSigningCertificate); skipped',
    );
    process.exit(0);
  }
  const privateKeyPem = process.env.POREIA_OTA_PRIVATE_KEY;
  if (!privateKeyPem || !privateKeyPem.includes('PRIVATE KEY')) {
    console.error('POREIA_OTA_PRIVATE_KEY is not set: app.json requires a signed manifest');
    process.exit(1);
  }
  const manifestFile = join(siteDir, manifestPathInSite(expo.updates.url));
  if (!existsSync(manifestFile)) {
    console.error(`no manifest at ${manifestFile}`);
    process.exit(1);
  }
  const bytes = readFileSync(manifestFile);
  let header;
  try {
    createPublicKey(privateKeyPem); // a malformed key fails here, without echoing it
    header = signatureHeader(bytes, privateKeyPem, settings.keyId);
  } catch {
    console.error('POREIA_OTA_PRIVATE_KEY could not be used to sign (not an RSA private key?)');
    process.exit(1);
  }
  // A key that does not belong to the embedded certificate would make every install refuse every
  // update, so check against the certificate before anything is written.
  const problem = checkManifestSignature(bytes, header, settings);
  if (problem) {
    console.error(`the new signature would be refused by the app: ${problem}`);
    process.exit(1);
  }
  writeFileSync(`${manifestFile}.sig`, header);
  console.log(`signed ${manifestFile} (keyid ${settings.keyId}) -> ${manifestFile}.sig`);
}
