import type { LandmarkModule } from '../types';
import { buildEllicottCommunityHall } from './_shared/ellicott-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23502732',
  spec: { name: 'Hagerstown Hall', color: 0x967464, height: 19.8, roof: 'parapet', nightGlow: 0.08, genericWindows: true },
  maxHeight: 20.5,
  build(ctx) {
    return buildEllicottCommunityHall(ctx, {
      height: 19.8, brick: 0x967464, baseHeight: 3.65,
      entranceDirection: [1, 0], entranceWidth: 8.2,
    });
  },
};
