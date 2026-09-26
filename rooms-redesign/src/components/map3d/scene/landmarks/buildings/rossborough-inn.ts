import type { LandmarkModule } from '../types';
import { buildRossborough } from './_shared/rossborough-parts';

export const landmark: LandmarkModule = {
  id: 'way/23988920',
  spec: { name: 'Rossborough Inn', color: 0x8c4d3e, roof: 'parapet' },
  maxHeight: 13.1,
  build: ctx => buildRossborough(ctx, true),
};
