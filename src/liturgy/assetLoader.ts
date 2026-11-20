// Loads one liturgy text from its bundled/OTA asset file (assets/liturgy/*.ltxt) instead of from
// the JS bundle, so a code-only update does not re-download the texts. Parsed texts are kept in a
// small in-memory LRU.
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { parseLiturgyText } from './parseLiturgyText';
import type { LiturgyData } from './types';

const CACHE_SIZE = 6;
const cache = new Map<string, LiturgyData>();

export async function readAssetText(moduleId: number): Promise<string> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  try {
    return await new File(uri).text();
  } catch {
    // Some environments (dev server, embedded assets) serve the asset over fetch only.
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`asset ${response.status}`);
    return await response.text();
  }
}

/** A loader for the registry; rejects on any failure (the registry maps that to null). */
export function assetLoader(moduleId: number, key: string): () => Promise<LiturgyData> {
  return async () => {
    const hit = cache.get(key);
    if (hit) {
      cache.delete(key);
      cache.set(key, hit);
      return hit;
    }
    const data = parseLiturgyText(await readAssetText(moduleId));
    cache.set(key, data);
    if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value as string);
    return data;
  };
}
