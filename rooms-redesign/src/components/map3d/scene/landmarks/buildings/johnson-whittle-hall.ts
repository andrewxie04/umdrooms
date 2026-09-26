import type { LandmarkModule } from '../types';
import { buildHeritageHall } from './_shared/heritage-hall-parts';

export const landmark: LandmarkModule = {
  id: 'way/964453320',
  spec: { name: 'Johnson-Whittle Hall', color: 0xd4d9d6, height: 21.37, roof: 'parapet', nightGlow: 0.08 },
  maxHeight: 21.5,
  build(ctx) {
    return buildHeritageHall(ctx, {
      entranceDirection: [0, 1], wall: 0xd4d9d6, accent: 0xb7c1be,
    });
  },
};
