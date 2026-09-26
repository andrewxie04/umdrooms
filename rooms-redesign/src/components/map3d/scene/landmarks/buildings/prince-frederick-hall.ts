import type { LandmarkModule } from '../types';
import { buildModernBrickResidence } from './_shared/modern-brick-residence-parts';

export const landmark: LandmarkModule = {
  id: 'way/238683607',
  spec: { name: 'Prince Frederick Hall', color: 0xa86b53, roof: 'parapet', nightGlow: 0.07 },
  maxHeight: 26.5,
  build: (ctx) => buildModernBrickResidence(ctx, 'prince-frederick'),
};
