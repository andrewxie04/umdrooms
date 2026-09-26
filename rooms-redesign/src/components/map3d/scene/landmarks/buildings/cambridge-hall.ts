import type { LandmarkModule } from '../types';
import { buildCambridgeCommunityHall } from './_shared/cambridge-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23543940',
  spec: { name: 'Cambridge Hall', color: 0xa16d5d, roof: 'parapet', nightGlow: 0.08, genericWindows: true },
  maxHeight: 13.3,
  build(ctx) {
    return buildCambridgeCommunityHall(ctx, {
      brick: 0xa16d5d, entranceDirection: [0, -1], entranceWidth: 10.2,
      portico: 'four-column', steps: true,
    });
  },
};
