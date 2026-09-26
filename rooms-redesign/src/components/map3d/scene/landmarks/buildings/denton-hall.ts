import type { LandmarkModule } from '../types';
import { buildDentonCommunityHall } from './_shared/denton-community-parts';

export const landmark: LandmarkModule = {
  id: 'way/23545038',
  spec: { name: 'Denton Hall', color: 0x946d5e, height: 26.4, roof: 'parapet', nightGlow: 0.1, genericWindows: true },
  maxHeight: 27.1,
  build(ctx) {
    return buildDentonCommunityHall(ctx, {
      height: 26.4, brick: 0x946d5e, entranceDirection: [0.25, 0.97],
    });
  },
};
