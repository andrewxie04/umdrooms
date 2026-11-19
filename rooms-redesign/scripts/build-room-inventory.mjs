import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';

const sourceUrl = new URL('../public/buildings_data.json', import.meta.url);
const outputUrl = new URL('../public/buildings_inventory.json', import.meta.url);
const buildings = JSON.parse(await readFile(sourceUrl, 'utf8'));

if (!Array.isArray(buildings) || buildings.length === 0) {
  throw new Error('buildings_data.json must contain a non-empty building array');
}

let minDate = null;
let maxDate = null;
const inventory = buildings.map((building) => ({
  ...building,
  classrooms: (building.classrooms ?? []).map((room) => {
    for (const slot of room.availability_times ?? []) {
      const date = String(slot.date ?? '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
    }
    return { ...room, availability_times: [] };
  }),
}));

const coverage = minDate && maxDate ? { minDate, maxDate } : null;
const output = JSON.stringify({ coverage, buildings: inventory });
let previous = null;
try {
  previous = await readFile(outputUrl, 'utf8');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
if (output !== previous) await writeFile(outputUrl, output);
console.log(`${output === previous ? 'Verified' : 'Built'} room inventory: ${inventory.length} buildings, ${coverage?.minDate ?? 'no schedule'}–${coverage?.maxDate ?? 'no schedule'}`);

// Per-day shards: the client needs one day's slots, not the ~10 MB archive.
// Each file maps "<building code>/<room id>" to that day's slots only; rooms
// without slots are omitted and read as free, exactly as in the archive.
const shardDirUrl = new URL('../public/availability-days/', import.meta.url);
const days = new Map();
for (const building of buildings) {
  for (const room of building.classrooms ?? []) {
    const key = `${building.code}/${room.id}`;
    for (const slot of room.availability_times ?? []) {
      const date = String(slot.date ?? '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      if (!days.has(date)) days.set(date, {});
      (days.get(date)[key] ??= []).push(slot);
    }
  }
}
await mkdir(shardDirUrl, { recursive: true });
const wanted = new Set([...days.keys()].map((date) => `${date}.json`));
for (const name of await readdir(shardDirUrl)) {
  if (name.endsWith('.json') && !wanted.has(name)) await rm(new URL(name, shardDirUrl));
}
let shardBytes = 0;
for (const [date, rooms] of days) {
  const text = JSON.stringify({ date, rooms });
  shardBytes += text.length;
  await writeFile(new URL(`${date}.json`, shardDirUrl), text);
}
console.log(`Wrote ${days.size} day shards (${Math.round(shardBytes / days.size / 1024)} KB average)`);
