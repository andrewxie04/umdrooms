import type { LandmarkModule } from '../types';
import { buildRossborough } from './_shared/rossborough-parts';

export const landmark: LandmarkModule = {
  id: 'way/1499355407',
  spec: { name: 'Rossborough Inn wing', color: 0x915543, roof: 'parapet' },
  maxHeight: 10.6,
  build: ctx => buildRossborough(ctx, false),
};
