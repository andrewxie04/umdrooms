import type { LandmarkModule } from '../types';
import { buildDentonCommunityHall } from './_shared/denton-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23502736',
  spec: { name: 'Elkton Hall', color: 0x986959, height: 26.4, roof: 'parapet', nightGlow: 0.1, genericWindows: true },
  maxHeight: 27.1,
  build(ctx) {
    return buildDentonCommunityHall(ctx, {
      height: 26.4, brick: 0x986959, entranceDirection: [-0.94, 0.34], archedGroundFloor: true,
    });
  },
};
