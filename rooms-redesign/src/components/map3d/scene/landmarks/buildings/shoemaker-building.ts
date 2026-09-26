// UMD Facilities photo: six tall fluted columns and a broad pediment across
// the east front of the compact cross-plan brick building.
import type { LandmarkModule } from '../types';
import { brickShell, color, hip, portico, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23579330',
  spec: { name: 'Shoemaker Building', color: 0x985849, accent: 0xece9df, height: 11.6, roof: 'hipped', genericWindows: true },
  maxHeight: 14.8,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xece9df), slate = color(0x555b5f);
    brickShell(ctx, parts, 10.2, color(0x985849), stone, color(0x777a79));
    hip(ctx, parts, [0.51, 0.83, 0.03, 0.96], 10.4, 2.2, slate);
    hip(ctx, parts, [0.07, 0.93, 0.35, 0.68], 10.5, 1.9, slate);
    portico(ctx, parts, { side: 'east', width: 18, depth: 3.5,
      columns: 6, baseY: 0.7, columnHeight: 8.4, pediment: 2.3 }, stone, color(0x45545d));
    return parts;
  },
};
