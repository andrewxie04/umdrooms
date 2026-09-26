// Fetch georeferenced Maryland imagery for design reference only. These files
// stay outside public/ and are never loaded by the site.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SERVICE = 'https://mdgeodata.md.gov/imagery/rest/services/SixInch/SixInchImagery/ImageServer';
const REFERENCE = fileURLToPath(new URL('../design-reference/', import.meta.url));
const tiles = [
  { name: 'campus-aerial-wide', bounds: [-76.960, 38.975, -76.920, 38.997], width: 4096 },
  { name: 'campus-aerial-core', bounds: [-76.951, 38.9805, -76.934, 38.993], width: 4096 },
];

const mercator = (lng, lat) => {
  const r = 6378137;
  return [r * lng * Math.PI / 180, r * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))];
};

await mkdir(REFERENCE, { recursive: true });
for (const tile of tiles) {
  const [west, south, east, north] = tile.bounds;
  const [xmin, ymin] = mercator(west, south);
  const [xmax, ymax] = mercator(east, north);
  const height = Math.round(tile.width * (ymax - ymin) / (xmax - xmin));
  if (height > 4100) throw new Error(`${tile.name} exceeds service height limit`);
  const query = new URLSearchParams({
    bbox: [xmin, ymin, xmax, ymax].join(','),
    bboxSR: '3857',
    imageSR: '3857',
    size: `${tile.width},${height}`,
    format: 'jpg',
    compressionQuality: '88',
    interpolation: 'RSP_BilinearInterpolation',
    f: 'image',
  });
  const response = await fetch(`${SERVICE}/exportImage?${query}`);
  if (!response.ok) throw new Error(`${tile.name}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error(`${tile.name}: service did not return JPEG`);
  await writeFile(path.join(REFERENCE, `${tile.name}.jpg`), bytes);
  console.log(`${tile.name}: ${tile.width} × ${height}, ${(bytes.length / 1048576).toFixed(1)} MiB`);
}

await writeFile(path.join(REFERENCE, 'campus-aerial.SOURCE.txt'), [
  'Source: Maryland MD iMAP, SixInchImagery ImageServer',
  SERVICE,
  'Attribution: Aerial imagery: MD iMAP',
  'Each image was exported in EPSG:3857 and positioned by its WGS84 bounds.',
  ...tiles.map((tile) => `${tile.name}.jpg WGS84 bounds [west,south,east,north]: ${tile.bounds.join(',')}`),
  'The composite service selects the latest available statewide imagery; Prince George\'s County source imagery is from 2023.',
  'Design reference only. This imagery is not bundled or rendered by the site.',
  '',
].join('\n'));
