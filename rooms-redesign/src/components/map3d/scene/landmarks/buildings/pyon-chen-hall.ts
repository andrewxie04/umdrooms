import type { LandmarkModule } from '../types';
import { buildHeritageHall } from './_shared/heritage-hall-parts';

export const landmark: LandmarkModule = {
  id: 'way/964453319',
  spec: { name: 'Pyon-Chen Hall', color: 0xd8dcd8, roof: 'parapet', nightGlow: 0.08 },
  maxHeight: 21.5,
  build(ctx) {
    return buildHeritageHall(ctx, {
      entranceDirection: [0, -1], wall: 0xd8dcd8, accent: 0xbec7c4,
    });
  },
};
