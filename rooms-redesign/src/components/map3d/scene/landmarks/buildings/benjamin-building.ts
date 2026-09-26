// UMD Facilities facade photo: https://facilities.umd.edu/node/370 . The
// mapped relation includes an inner courtyard, which brickShell preserves.
import type { LandmarkModule } from '../types';
import { brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'relation/9692235',
  spec: { name: 'Benjamin Building', color: 0xa55f4d, accent: 0xe8e3d8, height: 12.2, roof: 'hipped' },
  maxHeight: 15.3,
  build(ctx) {
    const parts: Parts = []; const brick = color(0xa55f4d), stone = color(0xe8e3d8);
    brickShell(ctx, parts, 11.9, brick, stone, color(0x777875));
    hip(ctx, parts, [0.23, 0.96, 0.03, 0.19], 12.1, 2.0, color(0x55575a));
    hip(ctx, parts, [0.32, 0.78, 0.78, 0.94], 12.1, 2.0, color(0x55575a));
    portico(ctx, parts, { side: 'east', width: 10, depth: 2.7, columns: 2,
      columnHeight: 5.0, pediment: 1.5 }, stone, color(0x414d50));
    stripWindows(ctx, parts, 'east', [0.16, 0.43], [1.3, 4.7, 8.1], 4, stone, color(0x536673));
    stripWindows(ctx, parts, 'east', [0.57, 0.84], [1.3, 4.7, 8.1], 4, stone, color(0x536673));
    stripWindows(ctx, parts, 'west', [0.15, 0.85], [1.3, 4.7, 8.1], 7, stone, color(0x536673));
    return parts;
  },
};
