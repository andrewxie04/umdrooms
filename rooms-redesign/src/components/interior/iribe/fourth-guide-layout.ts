import { FOURTH_COLUMN_DIAGRAM_SOURCE, FOURTH_COLUMN_TRACE } from './fourth-column-trace';
import { SECOND_COLUMN_TRACE } from './second-column-trace';
import { secondGuideFirst } from './second-guide-layout';
import { firstGuideGround } from './first-guide-layout';
import { groundGuidePlan } from './ground-guide-layout';
import type { Point } from './layout';

/**
 * Original Level 4 guide page 12, including negative X on continuation page 11.
 * Equal-weight estimated similarity into original Ground guide page 6, using
 * twenty visually reviewed Level 2 counterparts and its existing registration.
 * Historical drawing agreement does not establish surveyed structural axes.
 * See docs/research/iribe/fourth-guide-registration-2026-10-03.md.
 */

/** Native original (page 12, page 10) path identities, reviewed by source context.
 * These are explicit correspondences, not nearest-point or fitted-shell matches.
 */
export const FOURTH_GUIDE_COLUMN_PAIRS = [
  [33635, 38706],
  [33643, 38715],
  [33651, 38725],
  [33655, 38728],
  [33793, 38887],
  [33799, 38890],
  [33817, 38904],
  [33820, 38908],
  [33824, 38911],
  [33841, 38927],
  [33851, 38939],
  [33865, 38949],
  [33875, 38962],
  [33881, 38971],
  [33911, 38997],
  [33955, 39041],
  [33992, 39078],
  [34021, 39105],
  [34041, 39128],
  [34065, 39150],
] as const;

export interface FourthGuideRegistrationAnchor {
  readonly id: string;
  readonly secondId: string;
  readonly fourthSourcePathIndex: number;
  readonly secondSourcePathIndex: number;
  /** Unchanged native original page 12 center, PDF points, +Y down. */
  readonly source: Point;
  /** Unchanged independently reviewed native original page 10 center. */
  readonly second: Point;
  /** Page 10 -> page 8 -> page 6 through the existing shared similarities. */
  readonly ground: Point;
  readonly sourceContext: string;
  readonly secondContext: string;
}

export const FOURTH_GUIDE_REGISTRATION_ANCHORS: readonly FourthGuideRegistrationAnchor[] =
  FOURTH_GUIDE_COLUMN_PAIRS.map(([fourthSourcePathIndex, secondSourcePathIndex]) => {
    const fourth = FOURTH_COLUMN_TRACE.find(column => column.centerSourcePathIndex === fourthSourcePathIndex);
    const second = SECOND_COLUMN_TRACE.find(column => column.centerSourcePathIndex === secondSourcePathIndex);
    if (!fourth || !second) throw new Error('Missing reviewed Level 4 / Level 2 source column');
    const first = secondGuideFirst(second.center[0], second.center[1]);
    return {
      id: fourth.id,
      secondId: second.id,
      fourthSourcePathIndex,
      secondSourcePathIndex,
      source: fourth.center,
      second: second.center,
      ground: firstGuideGround(...first),
      sourceContext: fourth.context,
      secondContext: second.context,
    };
  });

// Every pair has weight one; no rejection, center correction, shear or local fit.
const similarity = (() => {
  const anchors = FOURTH_GUIDE_REGISTRATION_ANCHORS;
  const count = anchors.length;
  const sourceMean: Point = [
    anchors.reduce((sum, anchor) => sum + anchor.source[0], 0) / count,
    anchors.reduce((sum, anchor) => sum + anchor.source[1], 0) / count,
  ];
  const groundMean: Point = [
    anchors.reduce((sum, anchor) => sum + anchor.ground[0], 0) / count,
    anchors.reduce((sum, anchor) => sum + anchor.ground[1], 0) / count,
  ];
  let denominator = 0, dot = 0, cross = 0;
  for (const anchor of anchors) {
    const x = anchor.source[0] - sourceMean[0], y = anchor.source[1] - sourceMean[1];
    const u = anchor.ground[0] - groundMean[0], v = anchor.ground[1] - groundMean[1];
    denominator += x * x + y * y;
    dot += x * u + y * v;
    cross += x * v - y * u;
  }
  const a = dot / denominator, b = cross / denominator;
  return {
    a,
    b,
    tx: groundMean[0] - a * sourceMean[0] + b * sourceMean[1],
    ty: groundMean[1] - b * sourceMean[0] - a * sourceMean[1],
  };
})();

/** Rows multiply [pdfX, pdfY, 1], returning original Ground page 6 PDF points. */
export const FOURTH_GUIDE_TO_GROUND = [
  [similarity.a, -similarity.b, similarity.tx],
  [similarity.b, similarity.a, similarity.ty],
] as const;

export function fourthGuideGround(pdfx: number, pdfy: number): Point {
  const [x, y] = FOURTH_GUIDE_TO_GROUND;
  return [x[0] * pdfx + x[1] * pdfy + x[2], y[0] * pdfx + y[1] * pdfy + y[2]];
}

/** Shared Ground world frame; one similarity preserves all source geometry. */
export function fourthGuidePlan(pdfx: number, pdfy: number): Point {
  return groundGuidePlan(...fourthGuideGround(pdfx, pdfy));
}

const residuals = FOURTH_GUIDE_REGISTRATION_ANCHORS.map(anchor => {
  const mapped = fourthGuideGround(...anchor.source);
  const delta: Point = [mapped[0] - anchor.ground[0], mapped[1] - anchor.ground[1]];
  return {
    id: anchor.id,
    secondId: anchor.secondId,
    fourthSourcePathIndex: anchor.fourthSourcePathIndex,
    secondSourcePathIndex: anchor.secondSourcePathIndex,
    delta,
    errorPt: Math.hypot(...delta),
  };
});

/** Full evaluated coefficients and per-pair residuals, never survey accuracy. */
export const FOURTH_GUIDE_REGISTRATION = {
  kind: 'estimated-similarity',
  sourceUrl: FOURTH_COLUMN_DIAGRAM_SOURCE.url,
  pdfSha256: FOURTH_COLUMN_DIAGRAM_SOURCE.pdfSha256,
  sourcePageIndex: 12,
  continuationPageIndex: 11,
  sourcePageSizePt: [576, 576],
  sourceCoordinateOrigin: 'top-left',
  sourceYDirection: 'down',
  correspondenceLevel: 2,
  correspondencePageIndex: 10,
  correspondenceContinuationPageIndex: 9,
  targetPageIndex: 6,
  targetFrame: 'original-Ground-guide-PDF-points',
  targetRegistrationChain: 'secondGuideFirst -> firstGuideGround',
  anchorCount: FOURTH_GUIDE_REGISTRATION_ANCHORS.length,
  anchorWeight: 1,
  coefficients: similarity,
  matrix: FOURTH_GUIDE_TO_GROUND,
  scale: Math.hypot(similarity.a, similarity.b),
  rotationRadians: Math.atan2(similarity.b, similarity.a),
  residuals,
  rmsResidualPt: Math.sqrt(residuals.reduce((sum, row) => sum + row.errorPt ** 2, 0) / residuals.length),
  maxResidualPt: Math.max(...residuals.map(row => row.errorPt)),
  evidence: 'visually reviewed common historical CAD underlay; unsurveyed estimated registration',
} as const;
