// Test helper: reads the liturgy text assets straight from disk.
import fs from 'node:fs';
import path from 'node:path';
import type { LiturgyData } from './types';

export const LITURGY_ASSET_DIR = path.resolve(__dirname, '../../assets/liturgy');

export function readLiturgyAsset(id: string, language: string): LiturgyData {
  const raw = fs.readFileSync(path.join(LITURGY_ASSET_DIR, `${id}.${language}.ltxt`), 'utf8');
  return JSON.parse(raw) as LiturgyData;
}

export function hasLiturgyAsset(id: string, language: string): boolean {
  return fs.existsSync(path.join(LITURGY_ASSET_DIR, `${id}.${language}.ltxt`));
}
