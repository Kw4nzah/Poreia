import { createSign, generateKeyPairSync, X509Certificate } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  checkManifestSignature,
  codeSigningSettings,
  manifestPathInSite,
  parseSignatureHeader,
  signatureHeader,
} from './sign-manifest.mjs';
import { verifySite } from './verify-update.mjs';

// --- a throwaway self-signed certificate, built with node:crypto only -------------------------
// Same shape as the real one (certs/certificate.pem) and as `expo-updates codesigning:generate`:
// critical Key Usage digitalSignature and critical Extended Key Usage codeSigning.

const der = (tag, ...parts) => {
  const body = Buffer.concat(parts);
  const n = body.length;
  const len =
    n < 0x80
      ? Buffer.from([n])
      : Buffer.from([0x80 | Math.ceil(n.toString(16).length / 2), ...hexBytes(n)]);
  return Buffer.concat([Buffer.from([tag]), len, body]);
};
const hexBytes = (n) => {
  const hex = n.toString(16);
  return Buffer.from(hex.length % 2 ? `0${hex}` : hex, 'hex');
};
const oid = (dotted) => {
  const [a, b, ...rest] = dotted.split('.').map(Number);
  const bytes = [40 * a + b];
  for (const v of rest) {
    const chunk = [v & 0x7f];
    for (let x = v >> 7; x > 0; x >>= 7) chunk.unshift(0x80 | (x & 0x7f));
    bytes.push(...chunk);
  }
  return der(0x06, Buffer.from(bytes));
};
const seq = (...p) => der(0x30, ...p);
const utcTime = (d) =>
  der(0x17, Buffer.from(d.toISOString().replace(/[-:T]/g, '').slice(2, 14) + 'Z'));
const name = (cn) => seq(der(0x31, seq(oid('2.5.4.3'), der(0x0c, Buffer.from(cn)))));
const SHA256_RSA = seq(oid('1.2.840.113549.1.1.11'), Buffer.from([0x05, 0x00]));

function makeCertificate(keys, { codeSigning = true, notAfter } = {}) {
  const extensions = [
    seq(
      oid('2.5.29.15'),
      der(0x01, Buffer.from([0xff])),
      der(0x04, der(0x03, Buffer.from([7, 0x80]))),
    ),
  ];
  if (codeSigning) {
    extensions.push(
      seq(
        oid('2.5.29.37'),
        der(0x01, Buffer.from([0xff])),
        der(0x04, seq(oid('1.3.6.1.5.5.7.3.3'))),
      ),
    );
  }
  const now = Date.now();
  const tbs = seq(
    der(0xa0, der(0x02, Buffer.from([2]))),
    der(0x02, Buffer.from([0x01, 0x23, 0x45])),
    SHA256_RSA,
    name('Test OTA'),
    seq(utcTime(new Date(now - 86_400_000)), utcTime(notAfter ?? new Date(now + 365 * 86_400_000))),
    name('Test OTA'),
    keys.publicKey.export({ type: 'spki', format: 'der' }),
    der(0xa3, seq(...extensions)),
  );
  const signature = createSign('RSA-SHA256').update(tbs).sign(keys.privateKey);
  const cert = seq(tbs, SHA256_RSA, der(0x03, Buffer.from([0]), signature));
  const b64 = cert
    .toString('base64')
    .match(/.{1,64}/g)
    .join('\n');
  return `-----BEGIN CERTIFICATE-----\n${b64}\n-----END CERTIFICATE-----\n`;
}

const rsa = () => generateKeyPairSync('rsa', { modulusLength: 2048 });
const keys = rsa();
const otherKeys = rsa();
const privatePem = keys.privateKey.export({ type: 'pkcs8', format: 'pem' });
const otherPrivatePem = otherKeys.privateKey.export({ type: 'pkcs8', format: 'pem' });
const settings = { certificatePem: makeCertificate(keys), keyId: 'main' };
const manifest = Buffer.from(JSON.stringify({ id: 'x', runtimeVersion: '7', note: 'Ποreia ü' }));

// --------------------------------------------------------------------------------------------

describe('manifest signature', () => {
  it('builds a certificate that Node reads as a self-signed code signing certificate', () => {
    const cert = new X509Certificate(settings.certificatePem);
    expect(cert.verify(cert.publicKey)).toBe(true);
    expect(cert.extKeyUsage ?? cert.keyUsage).toContain('1.3.6.1.5.5.7.3.3');
  });

  it('signs in the expo-signature format and verifies with the matching certificate', () => {
    const header = signatureHeader(manifest, privatePem, 'main');
    expect(header).toMatch(/^sig="[A-Za-z0-9+/]+={0,2}", keyid="main", alg="rsa-v1_5-sha256"$/);
    expect(parseSignatureHeader(header)).toMatchObject({ keyId: 'main', alg: 'rsa-v1_5-sha256' });
    expect(checkManifestSignature(manifest, header, settings)).toBeNull();
    // the app trims the fetched text, so a trailing newline from an editor is harmless
    expect(checkManifestSignature(manifest, `${header}\n`, settings)).toBeNull();
  });

  it('rejects a changed manifest, another key and a mismatched keyid', () => {
    const header = signatureHeader(manifest, privatePem, 'main');
    const changed = Buffer.from(manifest);
    changed[5] ^= 1;
    expect(checkManifestSignature(changed, header, settings)).toMatch(/does not match/);
    const foreign = signatureHeader(manifest, otherPrivatePem, 'main');
    expect(checkManifestSignature(manifest, foreign, settings)).toMatch(/does not match/);
    const wrongId = signatureHeader(manifest, privatePem, 'other');
    expect(checkManifestSignature(manifest, wrongId, settings)).toMatch(/keyid/);
  });

  it('parses the signature like expo-updates: sig must be a String, keyid defaults to root', () => {
    const sig = signatureHeader(manifest, privatePem, 'main').match(/sig="([^"]+)"/)[1];
    // a Byte Sequence is not what SignatureHeaderInfo.kt accepts
    expect(() => parseSignatureHeader(`sig=:${sig}:, keyid="main"`)).toThrow(/sig not found/);
    expect(() => parseSignatureHeader('keyid="main"')).toThrow(/sig not found/);
    expect(() => parseSignatureHeader(`sig="${sig}", alg="ecdsa-p256"`)).toThrow(/algorithm/);
    expect(() => parseSignatureHeader(`sig="${sig}",`)).toThrow(/malformed/);
    expect(parseSignatureHeader(`sig="${sig}"`)).toEqual({
      sig,
      keyId: 'root',
      alg: 'rsa-v1_5-sha256',
    });
    expect(checkManifestSignature(manifest, `sig="${sig}"`, settings)).toMatch(/keyid root/);
    expect(checkManifestSignature(manifest, 'garbage', settings)).toMatch(/malformed|sig not/);
  });

  it('rejects a certificate without code signing usage, or one that has expired', () => {
    const header = signatureHeader(manifest, privatePem, 'main');
    const plain = { ...settings, certificatePem: makeCertificate(keys, { codeSigning: false }) };
    expect(checkManifestSignature(manifest, header, plain)).toMatch(/code signing/);
    const later = new Date(Date.now() + 2 * 365 * 86_400_000);
    expect(checkManifestSignature(manifest, header, settings, later)).toMatch(/not valid now/);
  });
});

describe('verifySite with code signing', () => {
  const dirs = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });
  const app = {
    runtimeVersion: '7',
    updateUrl: 'https://owner.github.io/Repo/updates/android/7/manifest.json',
    codeSigning: settings,
  };

  function site(signature) {
    const root = mkdtempSync(join(tmpdir(), 'poreia-signed-'));
    dirs.push(root);
    const file = join(root, manifestPathInSite(app.updateUrl));
    mkdirSync(dirname(file), { recursive: true });
    // no assets: only the signature checks are under test here
    const body = JSON.stringify({
      id: '9b750092-2b47-45a0-8558-e8c3c8ddacd5',
      runtimeVersion: '7',
    });
    writeFileSync(file, body);
    if (signature) writeFileSync(`${file}.sig`, signature(Buffer.from(body)));
    return root;
  }
  const signatureProblems = (root) => verifySite(root, app).filter((p) => /signature/.test(p));

  it('requires the signature file and accepts a valid one', () => {
    expect(signatureProblems(site())).toEqual([
      'no signature file at updates/android/7/manifest.json.sig (app.json requires code signing)',
    ]);
    expect(signatureProblems(site((b) => signatureHeader(b, privatePem, 'main')))).toEqual([]);
  });

  it('rejects a signature by another key or over other bytes', () => {
    const foreign = site((b) => signatureHeader(b, otherPrivatePem, 'main'));
    expect(signatureProblems(foreign).join('\n')).toMatch(/does not match/);
    const stale = site(() => signatureHeader(Buffer.from('{}'), privatePem, 'main'));
    expect(signatureProblems(stale).join('\n')).toMatch(/does not match/);
  });
});

describe('the committed configuration', () => {
  const expo = JSON.parse(readFileSync('app.json', 'utf8')).expo;
  const real = codeSigningSettings(expo);

  it('points app.json at a self-signed code signing certificate valid for decades', () => {
    expect(real).not.toBeNull();
    expect(expo.updates.codeSigningMetadata).toEqual({ keyid: 'main', alg: 'rsa-v1_5-sha256' });
    const cert = new X509Certificate(real.certificatePem);
    expect(cert.subject).toBe('CN=Poreia OTA');
    expect(cert.verify(cert.publicKey)).toBe(true);
    expect(cert.extKeyUsage ?? cert.keyUsage).toContain('1.3.6.1.5.5.7.3.3');
    expect(new Date(cert.validTo).getFullYear()).toBeGreaterThanOrEqual(2050);
    // the throwaway key is not the real one
    const header = signatureHeader(manifest, privatePem, 'main');
    expect(checkManifestSignature(manifest, header, real)).toMatch(/does not match/);
  });
});
