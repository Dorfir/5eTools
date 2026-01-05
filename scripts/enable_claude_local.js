#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const MODEL = 'Claude Haiku 4.5';

async function findJsonFiles(dir) {
  const results = [];
  async function walk(d) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.isFile() && e.name.endsWith('.json')) results.push(full);
    }
  }
  await walk(dir);
  return results;
}

async function readJson(file) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

async function writeJson(file, obj) {
  const content = JSON.stringify(obj, null, 2) + '\n';
  await fs.writeFile(file, content, 'utf8');
}

async function processFile(file, options = {}) {
  const { dryRun = false } = options;
  const obj = await readJson(file);
  if (obj === null) return { file, changed: false, reason: 'parse-error' };

  let changed = false;

  if (Array.isArray(obj.enabledModels)) {
    if (!obj.enabledModels.includes(MODEL)) {
      obj.enabledModels.push(MODEL);
      changed = true;
    }
  } else if (typeof obj.model === 'string') {
    if (obj.model !== MODEL) {
      obj.model = MODEL;
      changed = true;
    }
  } else {
    obj.enabledModels = [MODEL];
    changed = true;
  }

  if (changed && !dryRun) await writeJson(file, obj);
  return { file, changed };
}

function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

async function main() {
  const argv = process.argv.slice(2);
  const dir = argv[0] || '.';
  const dryRun = argv.includes('--dry-run') || argv.includes('-n');

  const resolved = path.resolve(dir);
  console.log(`Scanning directory: ${resolved}`);
  const files = await findJsonFiles(resolved);
  if (files.length === 0) {
    console.log('No JSON files found.');
    return;
  }

  console.log(`Found ${files.length} JSON files. Processing in batches of 5.`);
  const batches = chunkArray(files, 5);
  const summary = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} files)...`);
    const results = await Promise.all(batch.map(f => processFile(f, { dryRun })));
    results.forEach(r => summary.push(r));
  }

  const changed = summary.filter(s => s.changed).length;
  console.log(`Done. ${changed} files would be changed${dryRun ? ' (dry-run)' : ''}.`);
  if (dryRun) {
    summary.filter(s => s.changed).forEach(s => console.log(`Would change: ${s.file}`));
  } else {
    summary.filter(s => s.changed).forEach(s => console.log(`Changed: ${s.file}`));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
