import { groundPlan } from './plan-frame';
import type { Point } from './layout';

/**
 * HDR / UMD Ground guide, original PDF page index 6 (576 by 576 points).
 * Coordinates start at that page's top left; +Y runs down the page. The
 * canonical 1152 by 1152 raster is twice these coordinates on both axes.
 * This is an estimated diagram registration into the existing Ground frame,
 * not surveyed dimensions. See ground-guide-registration-2026-10-03.md.
 */
export interface GroundGuideRegistrationAnchor {
  readonly id: string;
  readonly pdf: Point;
  readonly wayfinding: Point;
  /** Zero-based index in PyMuPDF page.get_drawings(), original PDF page 6. */
  readonly pdfDrawingIndex: number;
}

/** Matched structural column centers, not room highlight or lift cab fits. */
export const GROUND_GUIDE_REGISTRATION_ANCHORS = [
  { id: 'lobby-north-west', pdf: [193.198807, 349.015518], wayfinding: [1050.36, 638.94], pdfDrawingIndex: 52455 },
  { id: 'lobby-north-east', pdf: [234.502098, 357.647522], wayfinding: [1139.72, 657.60], pdfDrawingIndex: 52428 },
  { id: 'atrium-stair-east', pdf: [229.454300, 397.041107], wayfinding: [1128.80, 742.94], pdfDrawingIndex: 52429 },
  { id: 'east-stair-south-west', pdf: [285.732697, 404.250122], wayfinding: [1250.62, 758.56], pdfDrawingIndex: 52402 },
  { id: 'east-stair-south-east', pdf: [341.969986, 411.459595], wayfinding: [1372.38, 774.12], pdfDrawingIndex: 52368 },
  { id: 'entrance-west', pdf: [277.126694, 471.395813], wayfinding: [1232.00, 904.00], pdfDrawingIndex: 52406 },
  { id: 'entrance-east', pdf: [334.312500, 471.396698], wayfinding: [1355.84, 903.94], pdfDrawingIndex: 52372 },
] as const satisfies readonly GroundGuideRegistrationAnchor[];

// Equal-weight, orientation-preserving least-squares similarity. Keeping the
// fit derived from the anchors avoids independent furniture offsets or shear.
const similarity = (() => {
  const anchors = GROUND_GUIDE_REGISTRATION_ANCHORS;
  const count = anchors.length;
  const pdfMean: Point = [
    anchors.reduce((sum, p) => sum + p.pdf[0], 0) / count,
    anchors.reduce((sum, p) => sum + p.pdf[1], 0) / count,
  ];
  const targetMean: Point = [
    anchors.reduce((sum, p) => sum + p.wayfinding[0], 0) / count,
    anchors.reduce((sum, p) => sum + p.wayfinding[1], 0) / count,
  ];
  let denominator = 0, dot = 0, cross = 0;
  for (const anchor of anchors) {
    const x = anchor.pdf[0] - pdfMean[0], y = anchor.pdf[1] - pdfMean[1];
    const u = anchor.wayfinding[0] - targetMean[0], v = anchor.wayfinding[1] - targetMean[1];
    denominator += x * x + y * y;
    dot += x * u + y * v;
    cross += x * v - y * u;
  }
  const a = dot / denominator, b = cross / denominator;
  const translation: Point = [
    targetMean[0] - a * pdfMean[0] + b * pdfMean[1],
    targetMean[1] - b * pdfMean[0] - a * pdfMean[1],
  ];
  return { a, b, translation };
})();

/** Rows act on [pdfX, pdfY, 1], returning 1920 by 1080 wayfinding pixels. */
export const GROUND_GUIDE_TO_WAYFINDING = [
  [similarity.a, -similarity.b, similarity.translation[0]],
  [similarity.b, similarity.a, similarity.translation[1]],
] as const;

export function groundGuideWayfinding(pdfx: number, pdfy: number): Point {
  const [x, y] = GROUND_GUIDE_TO_WAYFINDING;
  return [x[0] * pdfx + x[1] * pdfy + x[2], y[0] * pdfx + y[1] * pdfy + y[2]];
}

/** Preserves the guide's relative geometry and uses the existing Ground frame. */
export function groundGuidePlan(pdfx: number, pdfy: number): Point {
  return groundPlan(...groundGuideWayfinding(pdfx, pdfy));
}

const residuals = GROUND_GUIDE_REGISTRATION_ANCHORS.map(anchor => {
  const mapped = groundGuideWayfinding(anchor.pdf[0], anchor.pdf[1]);
  const delta: Point = [mapped[0] - anchor.wayfinding[0], mapped[1] - anchor.wayfinding[1]];
  return { id: anchor.id, delta, errorPixels: Math.hypot(...delta) };
});

/** Residuals describe agreement of drawings; subpixel fit is not survey accuracy. */
export const GROUND_GUIDE_REGISTRATION = {
  kind: 'estimated-similarity',
  sourceUrl: 'https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf',
  pdfPageIndex: 6,
  pdfPageSize: [576, 576],
  wayfindingImageSize: [1920, 1080],
  matrix: GROUND_GUIDE_TO_WAYFINDING,
  scalePixelsPerPdfPoint: Math.hypot(similarity.a, similarity.b),
  rotationRadians: Math.atan2(similarity.b, similarity.a),
  residuals,
  rmsResidualPixels: Math.sqrt(residuals.reduce((sum, p) => sum + p.errorPixels ** 2, 0) / residuals.length),
  maxResidualPixels: Math.max(...residuals.map(p => p.errorPixels)),
} as const;
