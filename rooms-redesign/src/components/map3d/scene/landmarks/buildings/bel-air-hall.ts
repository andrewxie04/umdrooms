import type { LandmarkModule } from '../types';
import { buildCambridgeCommunityHall } from './_shared/cambridge-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23543989',
  spec: { name: 'Bel Air Hall', color: 0x986858, roof: 'parapet', nightGlow: 0.08, genericWindows: true },
  maxHeight: 16.6,
  build(ctx) {
    return buildCambridgeCommunityHall(ctx, {
      brick: 0x986858, entranceDirection: [0, -1], entranceWidth: 4.4,
      portico: 'framed',
    });
  },
};
