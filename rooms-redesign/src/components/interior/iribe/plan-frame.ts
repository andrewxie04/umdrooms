import type { Point } from './layout';

/** Shared undimensioned plan frame; metres per diagram pixel are estimated. */
export const PLAN_SCALE=.085;
export const plan=(x:number,y:number):Point=>[(x-660)*PLAN_SCALE,(y-1100)*PLAN_SCALE];
export const groundPlan=(x:number,y:number):Point=>plan(640+.832*(y-810)-.069*(x-1080),1120-.832*(x-1080)-.069*(y-810));
