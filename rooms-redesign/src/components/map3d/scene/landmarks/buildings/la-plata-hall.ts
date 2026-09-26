import type { LandmarkModule } from '../types';
import { buildEllicottCommunityHall } from './_shared/ellicott-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23543912',
  spec: { name: 'La Plata Hall', color: 0xa47b6b, height: 33, roof: 'parapet', nightGlow: 0.1, genericWindows: true },
  maxHeight: 33.7,
  build(ctx) {
    return buildEllicottCommunityHall(ctx, {
      height: 33, brick: 0xa47b6b, baseHeight: 1.35,
      entranceDirection: [-1, 0], entranceWidth: 9.4, entrySteps: true,
    });
  },
};
