import type { LandmarkModule } from '../types';
import { buildCambridgeCommunityHall } from './_shared/cambridge-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23543927',
  spec: { name: 'Cumberland Hall', color: 0x886050, roof: 'parapet', nightGlow: 0.08, genericWindows: true },
  maxHeight: 27.1,
  build(ctx) {
    return buildCambridgeCommunityHall(ctx, {
      brick: 0x886050, entranceDirection: [1, 0], entranceWidth: 8.0,
      portico: 'two-column', steps: true,
    });
  },
};
