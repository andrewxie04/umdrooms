import type { LandmarkModule } from '../types';
import { buildDentonCommunityHall } from './_shared/denton-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23545068',
  spec: { name: 'Easton Hall', color: 0x986f60, height: 29.7, roof: 'parapet', nightGlow: 0.1, genericWindows: true },
  maxHeight: 30.4,
  build(ctx) {
    return buildDentonCommunityHall(ctx, {
      height: 29.7, brick: 0x986f60, entranceDirection: [0.92, -0.39],
    });
  },
};
