import type { LandmarkModule } from '../types';
import { buildCambridgeCommunityHall } from './_shared/cambridge-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23543980',
  spec: { name: 'Chestertown Hall', color: 0x936453, roof: 'parapet', nightGlow: 0.08, genericWindows: true },
  maxHeight: 16.6,
  build(ctx) {
    return buildCambridgeCommunityHall(ctx, {
      brick: 0x936453, entranceDirection: [0, -1], entranceWidth: 4.8,
      portico: 'framed',
    });
  },
};
