// Keep the room-finder's residence search coordinates in sync with the same
// OSM footprints the native 3D campus uses. Hall/community names follow UMD
// Resident Life: https://reslife.umd.edu/explore-halls/residence-halls
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const campus = JSON.parse(await readFile(path.join(root, 'public/campus-data.json'), 'utf8'));
const groups = [
  ['Cambridge', 'cambridge-community', ['Bel Air', 'Cambridge', 'Centreville', 'Chestertown', 'Cumberland']],
  ['Denton', 'denton-community', ['Denton', 'Easton', 'Elkton']],
  ['Ellicott', 'ellicott-community', ['Ellicott', 'Hagerstown', 'La Plata']],
  ['Heritage', 'heritage-community', ['Johnson-Whittle', 'Pyon-Chen']],
  ['Oakland', 'oakland-community', ['Oakland']],
  ['North Hill', 'north-hill-community', ['Anne Arundel', 'Caroline', 'Carroll', 'Dorchester', 'Prince Frederick', "Queen Anne's", "St. Mary's", 'Somerset', 'Wicomico', 'Worcester']],
  ['South Hill', 'south-hill-community', ['Allegany', 'Baltimore', 'Calvert', 'Cecil', 'Charles', 'Frederick', 'Garrett', 'Harford', 'Howard', 'Kent', 'Montgomery', "Prince George's", 'Talbot', 'Washington']],
];
const aliases = { 'La Plata': 'LaPlata', 'Pyon-Chen': 'Pyon Chen', Worcester: 'Worchester' };
const area = (ring) => Math.abs(ring.reduce((sum, [x, y], i) => {
  const [nx, ny] = ring[(i + 1) % ring.length];
  return sum + x * ny - nx * y;
}, 0));

const residences = groups.flatMap(([community, communitySlug, hallNames]) => hallNames.map((shortName) => {
  const name = `${shortName} Hall`;
  const osmName = `${aliases[shortName] ?? shortName} Hall`;
  const matches = campus.buildings.filter((building) => building.name === osmName && building.footprint?.length >= 3);
  if (!matches.length) throw new Error(`No mapped footprint for ${name}`);
  const building = matches.sort((a, b) => area(b.footprint) - area(a.footprint))[0];
  const lng = building.footprint.reduce((sum, [x]) => sum + x, 0) / building.footprint.length;
  const lat = building.footprint.reduce((sum, [, y]) => sum + y, 0) / building.footprint.length;
  return { id: building.id, name, lat: Number(lat.toFixed(7)), lng: Number(lng.toFixed(7)), community, communitySlug };
}));

await writeFile(
  path.join(root, 'src/lib/residence-halls.generated.json'),
  `${JSON.stringify(residences, null, 2)}\n`,
);
console.log(`Mapped ${residences.length} UMD residence halls`);
