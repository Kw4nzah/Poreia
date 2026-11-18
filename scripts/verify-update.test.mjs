import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { verifySite } from './verify-update.mjs';

const app = {
  runtimeVersion: '6',
  updateUrl: 'https://owner.github.io/Repo/updates/android/6/manifest.json',
};
const BASE = 'https://owner.github.io/Repo/updates/android/6';
const dirs = [];

function write(root, rel, data) {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
}

/** A site the way build-update.mjs lays it out, with one bundle and one asset. */
function makeSite(edit = () => {}) {
  const root = mkdtempSync(join(tmpdir(), 'poreia-site-'));
  dirs.push(root);
  const pieces = [
    ['bundle', Buffer.from('console.log(1)')],
    ['png', Buffer.from('not really a png')],
  ].map(([ext, data]) => {
    const sha = createHash('sha256').update(data);
    const hex = sha.copy().digest('hex');
    write(root, `updates/android/6/files/${hex}.${ext}`, data);
    return {
      hash: sha.digest('base64url'),
      fileExtension: `.${ext}`,
      url: `${BASE}/files/${hex}.${ext}`,
    };
  });
  const manifest = {
    id: '9b750092-2b47-45a0-8558-e8c3c8ddacd5',
    createdAt: new Date().toISOString(),
    runtimeVersion: '6',
    launchAsset: pieces[0],
    assets: [pieces[1]],
  };
  edit(manifest, root);
  write(root, 'updates/android/6/manifest.json', JSON.stringify(manifest));
  write(root, '.nojekyll', '');
  return root;
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('verifySite', () => {
  it('accepts a site laid out the way build-update.mjs writes it', () => {
    expect(verifySite(makeSite(), app)).toEqual([]);
  });

  it('rejects a runtime version that is not the one in app.json', () => {
    const site = makeSite((m) => (m.runtimeVersion = '5'));
    expect(verifySite(site, app).join('\n')).toMatch(/runtimeVersion/);
  });

  it('rejects an asset whose bytes do not match the hash in the manifest', () => {
    const site = makeSite((m) => (m.launchAsset.hash = 'A'.repeat(43)));
    expect(verifySite(site, app).join('\n')).toMatch(/hash does not match/);
  });

  it('rejects asset URLs outside the update folder or with a query', () => {
    const elsewhere = makeSite((m) => (m.assets[0].url = 'https://evil.example/x.png'));
    expect(verifySite(elsewhere, app).join('\n')).toMatch(/not under/);
    const query = makeSite((m) => (m.assets[0].url += '?x=1'));
    expect(verifySite(query, app).join('\n')).toMatch(/query/);
    const http = makeSite(
      (m) => (m.launchAsset.url = m.launchAsset.url.replace('https:', 'http:')),
    );
    expect(verifySite(http, app).join('\n')).toMatch(/not under/);
  });

  it('rejects a file that the manifest does not name, and secrets or source maps', () => {
    const stray = makeSite((_m, root) => write(root, 'updates/android/6/files/extra.bundle', 'x'));
    expect(verifySite(stray, app).join('\n')).toMatch(/not named by the manifest/);
    const map = makeSite((_m, root) => write(root, 'updates/android/6/files/app.bundle.map', 'x'));
    expect(verifySite(map, app).join('\n')).toMatch(/forbidden/);
    const env = makeSite((_m, root) => write(root, '.env', 'TOKEN=1'));
    expect(verifySite(env, app).join('\n')).toMatch(/forbidden/);
  });

  it('rejects a missing manifest, broken JSON, a bad date and a future date', () => {
    expect(verifySite(mkdtempSync(join(tmpdir(), 'poreia-empty-')), app).join('\n')).toMatch(
      /no manifest/,
    );
    const broken = makeSite();
    write(broken, 'updates/android/6/manifest.json', '{nope');
    expect(verifySite(broken, app).join('\n')).toMatch(/not valid JSON/);
    expect(
      verifySite(
        makeSite((m) => (m.createdAt = 'yesterday')),
        app,
      ).join('\n'),
    ).toMatch(/createdAt is not a date/);
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(
      verifySite(
        makeSite((m) => (m.createdAt = future)),
        app,
      ).join('\n'),
    ).toMatch(/future/);
  });

  it('accepts the signature file that sign-manifest.mjs writes next to the manifest', () => {
    const site = makeSite((_m, root) => write(root, 'updates/android/6/manifest.json.sig', 'sig'));
    expect(verifySite(site, app)).toEqual([]);
  });

  it('rejects an update URL that is not https', () => {
    const site = makeSite();
    expect(
      verifySite(site, { ...app, updateUrl: app.updateUrl.replace('https:', 'http:') }).join('\n'),
    ).toMatch(/not https/);
  });
});
