// Checks the update site written by scripts/build-update.mjs before it is published.
//
//   node scripts/verify-update.mjs <siteDir>
//
// It reads the manifest from where app.json says the app will look for it, then checks that what
// is about to go to GitHub Pages is exactly what the manifest promises and nothing more:
//   - the runtime version is the one in app.json (an app only loads a matching runtime);
//   - every bundle and asset URL is https, under the manifest's own folder, and names a file that
//     exists whose SHA-256 is the `hash` in the manifest and whose name is that hash;
//   - nothing else is in the site (source maps, .env files, keys, stray files);
//   - `createdAt` is a real date that is not in the future (expo-updates orders updates by it).
// It cannot tell who wrote the manifest (see docs/SECURITY-OTA-SIGNING.md); it catches mistakes
// and accidental leaks in the build, not a compromised build.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const FORBIDDEN = /(\.map|\.env[^/]*|\.pem|\.key|\.jks|\.keystore|\.p12)$/i;

function listFiles(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory()
      ? listFiles(full, base)
      : [relative(base, full).split(sep).join('/')];
  });
}

/**
 * @param {string} siteDir folder that will be published
 * @param {{ runtimeVersion: string, updateUrl: string }} app values from app.json
 * @param {Date} [now]
 * @returns {string[]} problems, empty when the site is fine
 */
export function verifySite(siteDir, app, now = new Date()) {
  const problems = [];
  const url = new URL(app.updateUrl);
  if (url.protocol !== 'https:') problems.push(`updates.url is not https: ${app.updateUrl}`);
  const manifestPath = url.pathname.split('/').slice(2).join('/');
  const baseUrl = url.href.slice(0, url.href.lastIndexOf('/'));
  const manifestFile = join(siteDir, manifestPath);
  if (!existsSync(manifestFile)) return [...problems, `no manifest at ${manifestPath}`];

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  } catch {
    return [...problems, 'manifest is not valid JSON'];
  }

  if (manifest.runtimeVersion !== app.runtimeVersion) {
    problems.push(
      `runtimeVersion ${JSON.stringify(manifest.runtimeVersion)} differs from app.json ${JSON.stringify(app.runtimeVersion)}`,
    );
  }
  if (typeof manifest.id !== 'string' || !/^[0-9a-f-]{36}$/.test(manifest.id)) {
    problems.push('manifest id is not a UUID');
  }
  const created = Date.parse(manifest.createdAt);
  if (Number.isNaN(created)) problems.push('createdAt is not a date');
  else if (created > now.getTime() + 5 * 60_000) problems.push('createdAt is in the future');

  // `<manifest>.sig` is the signature file of docs/SECURITY-OTA-SIGNING.md, once that is enabled.
  const expected = new Set([manifestPath, `${manifestPath}.sig`, '.nojekyll']);
  const assets = [manifest.launchAsset, ...(Array.isArray(manifest.assets) ? manifest.assets : [])];
  for (const [index, asset] of assets.entries()) {
    const label = index === 0 ? 'launchAsset' : `assets[${index - 1}]`;
    if (!asset || typeof asset !== 'object') {
      problems.push(`${label} is missing`);
      continue;
    }
    const { url: assetUrl, hash, fileExtension } = asset;
    if (typeof assetUrl !== 'string' || !assetUrl.startsWith(`${baseUrl}/files/`)) {
      problems.push(`${label} url is not under ${baseUrl}/files/: ${assetUrl}`);
      continue;
    }
    if (/[?#]/.test(assetUrl) || assetUrl.includes('..')) {
      problems.push(`${label} url has a query, fragment or ..: ${assetUrl}`);
      continue;
    }
    const rel = `${url.pathname.split('/').slice(2, -1).join('/')}/files/${assetUrl.slice(`${baseUrl}/files/`.length)}`;
    const file = join(siteDir, rel);
    expected.add(rel);
    if (!existsSync(file)) {
      problems.push(`${label} file is missing: ${rel}`);
      continue;
    }
    const data = readFileSync(file);
    const sha = createHash('sha256').update(data);
    const actualHash = sha.copy().digest('base64url');
    if (typeof hash !== 'string' || hash !== actualHash) {
      problems.push(`${label} hash does not match its file: ${rel}`);
    }
    const hex = sha.digest('hex');
    if (!rel.endsWith(`/${hex}${fileExtension}`)) {
      problems.push(`${label} file name is not its SHA-256 plus extension: ${rel}`);
    }
  }

  for (const file of listFiles(siteDir)) {
    if (FORBIDDEN.test(file)) problems.push(`forbidden file in the site: ${file}`);
    else if (!expected.has(file)) problems.push(`file not named by the manifest: ${file}`);
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const siteDir = process.argv[2];
  if (!siteDir) {
    console.error('usage: node scripts/verify-update.mjs <siteDir>');
    process.exit(1);
  }
  const expo = JSON.parse(readFileSync('app.json', 'utf8')).expo;
  const problems = verifySite(siteDir, {
    runtimeVersion: expo.runtimeVersion,
    updateUrl: expo.updates.url,
  });
  if (problems.length > 0) {
    for (const problem of problems) console.error(`FAIL ${problem}`);
    process.exit(1);
  }
  console.log(
    `update site verified: ${listFiles(siteDir).length} files, hashes match the manifest`,
  );
}
