import type { LandmarkModule } from '../types';
import { buildModernBrickResidence } from './_shared/modern-brick-residence-parts';

export const landmark: LandmarkModule = {
  id: 'way/120379719',
  spec: { name: 'Oakland Hall', color: 0x995e4c, roof: 'parapet', nightGlow: 0.07 },
  maxHeight: 29,
  build: (ctx) => buildModernBrickResidence(ctx, 'oakland'),
};
