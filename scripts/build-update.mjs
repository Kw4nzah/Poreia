// Turns an `expo export` output into a static site that expo-updates can read.
//
//   node scripts/build-update.mjs <exportDir> <siteDir>
//
// The site is published on GitHub Pages. The manifest location comes from
// `updates.url` in the app config, so the runtime version lives in one place.
// Files are content-addressed, so the app downloads only what it lacks.

import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const [exportDir, siteDir] = process.argv.slice(2);
if (!exportDir || !siteDir) {
  console.error('usage: node scripts/build-update.mjs <exportDir> <siteDir>');
  process.exit(1);
}

const MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ttf: 'font/ttf',
  otf: 'font/otf',
  json: 'application/json',
  mp3: 'audio/mpeg',
};

const config = JSON.parse(
  execSync('npx expo config --json --type public', { encoding: 'utf8', maxBuffer: 1 << 26 }),
);
const runtimeVersion = config.runtimeVersion;
const manifestUrl = new URL(config.updates.url);
if (typeof runtimeVersion !== 'string') {
  throw new Error('runtimeVersion must be a plain string in the app config');
}
if (!manifestUrl.pathname.includes(`/${runtimeVersion}/`)) {
  throw new Error(`updates.url must contain the runtime version "${runtimeVersion}"`);
}

// A project site lives under /<repo>/, which is the root of the published folder.
const pathInSite = manifestUrl.pathname.split('/').slice(2).join('/');
const manifestFile = join(siteDir, pathInSite);
const updateDir = dirname(manifestFile);
const baseUrl = manifestUrl.href.slice(0, manifestUrl.href.lastIndexOf('/'));

const metadata = JSON.parse(readFileSync(join(exportDir, 'metadata.json'), 'utf8'));
const android = metadata.fileMetadata.android;
if (!android) throw new Error('export has no android bundle');

function publish(relativePath, ext, contentType) {
  const data = readFileSync(join(exportDir, relativePath));
  const sha256 = createHash('sha256').update(data);
  const hex = sha256.copy().digest('hex');
  const fileName = `${hex}.${ext}`;
  const target = join(updateDir, 'files', fileName);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(exportDir, relativePath), target);
  return {
    hash: sha256.digest('base64url'),
    key: createHash('md5').update(data).digest('hex'),
    contentType,
    fileExtension: `.${ext}`,
    url: `${baseUrl}/files/${fileName}`,
  };
}

const launchAsset = publish(android.bundle, 'bundle', 'application/javascript');
const assets = android.assets.map((asset) =>
  publish(asset.path, asset.ext, MIME[asset.ext] ?? 'application/octet-stream'),
);

// Same content gives the same id, so redeploying unchanged code is not a new update.
const idHex = createHash('sha256')
  .update([runtimeVersion, launchAsset.hash, ...assets.map((a) => a.hash)].join('\n'))
  .digest('hex');
const id = [
  idHex.slice(0, 8),
  idHex.slice(8, 12),
  idHex.slice(12, 16),
  idHex.slice(16, 20),
  idHex.slice(20, 32),
].join('-');

const manifest = {
  id,
  createdAt: new Date().toISOString(),
  runtimeVersion,
  launchAsset,
  assets,
  metadata: {},
  extra: { expoClient: config },
};

writeFileSync(manifestFile, JSON.stringify(manifest));
writeFileSync(join(siteDir, '.nojekyll'), '');
console.log(`update ${id} for runtime ${runtimeVersion}: 1 bundle, ${assets.length} assets`);
console.log(`manifest: ${manifestFile}`);
