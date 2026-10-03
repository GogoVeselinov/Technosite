/**
 * sync-prices.mjs
 *
 * Reads data/prices.json and updates every `data-price` placeholder
 * in all HTML files under the project root.
 *
 * HOW TO UPDATE ALL PRICES:
 *   1. Edit data/prices.json
 *   2. Run:  node scripts/sync-prices.mjs
 *   3. Review the changed HTML files
 *   4. Deploy
 *
 * Usage:
 *   node scripts/sync-prices.mjs
 *   node scripts/sync-prices.mjs --dry-run   (show changes without writing)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const PRICES_FILE = join(ROOT, 'data', 'prices.json');
const DRY_RUN = process.argv.includes('--dry-run');

const prices = JSON.parse(readFileSync(PRICES_FILE, 'utf8'));

function formatPrice(entry) {
  const suffix = entry.per ? `/${entry.per}` : '';
  if (entry.fixed !== undefined) {
    return `${entry.fixed}€${suffix}`;
  }
  return `${entry.min}–${entry.max}€${suffix}`;
}

function collectHtmlFiles(dir, results = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      collectHtmlFiles(full, results);
    } else if (name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

let totalUpdated = 0;

for (const file of collectHtmlFiles(ROOT)) {
  let content = readFileSync(file, 'utf8');
  let changed = false;

  content = content.replace(
    /<span([^>]*?)\bdata-price="([^"]+)"([^>]*)>([^<]*)<\/span>/g,
    (match, pre, key, post, _current) => {
      const entry = prices[key];
      if (!entry) {
        console.warn(`  WARN: unknown price key "${key}" in ${file}`);
        return match;
      }
      const value = formatPrice(entry);
      if (_current !== value) {
        changed = true;
        totalUpdated++;
      }
      return `<span${pre} data-price="${key}"${post}>${value}</span>`;
    }
  );

  if (changed) {
    const rel = file.replace(ROOT, '').replace(/\\/g, '/');
    console.log(`  Updated: ${rel}`);
    if (!DRY_RUN) writeFileSync(file, content, 'utf8');
  }
}

console.log(`\nDone. ${totalUpdated} price span(s) ${DRY_RUN ? 'would be ' : ''}updated.`);
if (DRY_RUN) console.log('(dry-run — no files written)');
