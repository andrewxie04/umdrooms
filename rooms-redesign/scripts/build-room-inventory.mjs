import { readFile, writeFile } from 'node:fs/promises';

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
