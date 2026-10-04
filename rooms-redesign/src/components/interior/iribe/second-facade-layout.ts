import { SECOND_FACADE_SOURCE, SECOND_WEST_FACADE_SOURCE, SECOND_WEST_SOUTH_INTERFACE_SOURCE } from './second-facade-trace';
import { registeredClosedGlazingBaseline, registeredGlazingBaseline } from './first-facade-layout';
import { secondGuidePlan } from './second-guide-layout';

/** Independently retained native Level 2 panes under its twenty-column fit. */
export const SECOND_WEST_FACADE=registeredGlazingBaseline(SECOND_WEST_FACADE_SOURCE,SECOND_WEST_SOUTH_INTERFACE_SOURCE,9,secondGuidePlan);
/** All 195 Level 2 panes; no fitted north/east/south envelope remains. */
export const SECOND_SOURCE_FOOTPRINT=registeredClosedGlazingBaseline(SECOND_FACADE_SOURCE,9,secondGuidePlan);
