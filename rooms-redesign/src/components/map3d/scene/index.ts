// src/components/map3d/scene/index.ts
//
// Public contract surface (plan.md Phase 2): createCampusScene + the
// CampusSceneHandle interface. The overlay layer (CampusMap3D) codes against
// this module only.

export { createCampusScene, HOME_VIEW, HOME_VIEW_2D } from './scene';
export type { CampusSceneHandleV2, SceneTimeMode } from './scene';
export type { CampusSceneHandle, FlyToTarget, ProjectedPoint } from './types';
export type {
  CampusData,
  CampusBuilding,
  CampusRoad,
  CampusArea,
  RoadKind,
  AreaKind,
} from './types';
