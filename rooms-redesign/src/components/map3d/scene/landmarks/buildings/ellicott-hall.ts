import type { LandmarkModule } from '../types';
import { buildEllicottCommunityHall } from './_shared/ellicott-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23502767',
  spec: { name: 'Ellicott Hall', color: 0x9e7564, height: 29.7, roof: 'parapet', nightGlow: 0.08, genericWindows: true },
  maxHeight: 30.4,
  build(ctx) {
    return buildEllicottCommunityHall(ctx, {
      height: 29.7, brick: 0x9e7564, baseHeight: 4.0,
      entranceDirection: [0, 1], entranceWidth: 9.2, pairedDoors: true,
    });
  },
};
