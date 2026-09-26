import type { LandmarkModule } from '../types';
import { buildCambridgeCommunityHall } from './_shared/cambridge-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23543957',
  spec: { name: 'Centreville Hall', color: 0x795347, roof: 'parapet', nightGlow: 0.08, genericWindows: true },
  maxHeight: 30.4,
  build(ctx) {
    return buildCambridgeCommunityHall(ctx, {
      brick: 0x795347, entranceDirection: [-1, 0], entranceWidth: 7.2,
      portico: 'two-column', steps: true,
    });
  },
};
