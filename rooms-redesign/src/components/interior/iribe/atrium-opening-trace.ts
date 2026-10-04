/**
 * UMD / HDR Level 1 guide, original page index 8. Source PDF points have a
 * top-left origin and are rounded to six decimals. Path and item indices are
 * zero-based PyMuPDF get_drawings() indices on that ORIGINAL page.
 *
 * This trace distinguishes the broad atrium opening guard from stair guards
 * and the lift enclosure. All contours are OPEN: the guide does not resolve
 * a complete slab-hole closure at the stair mouth and core/apron junctions.
 * No elevations, physical guard thickness or surveyed dimensions are inferred.
 * See docs/research/iribe/atrium-opening-review-2026-10-03.md.
 *
 * Integration should map these source points with the existing firstGuidePlan
 * from first-guide-layout.ts. There is no independent registration here.
 */
export type AtriumOpeningPoint = readonly [number, number];

export type AtriumOpeningSourceSegment = {
  readonly pathIndex: number;
  readonly itemIndex: number;
  /** Travel direction only; points remain in their original source order. */
  readonly reversed: boolean;
} & (
  | { readonly op: 'l'; readonly points: readonly [AtriumOpeningPoint, AtriumOpeningPoint] }
  | { readonly op: 'c'; readonly points: readonly [AtriumOpeningPoint, AtriumOpeningPoint, AtriumOpeningPoint, AtriumOpeningPoint] }
);

export const ATRIUM_OPENING_PROVENANCE = {
  sourceUrl: 'https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf',
  pdfSha256: 'c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474',
  pdfPageIndex: 8,
  pdfPageSizePt: [576, 576],
  sourceOrigin: 'top-left',
  decimalPlaces: 6,
  closedSlabContour: false,
  curveTolerancePt: 0.01,
  joinTolerancePt: 0.002,
} as const;

/** Void-facing drawn outline: stair-mouth south cap, northwest shoulder,
 * west side, south sweep, and south core/apron termination. This is the broad
 * opening boundary, not the smaller intermediate stair landing curve. */
export const ATRIUM_OPENING_VOID_FACING_SOURCE = [
  { pathIndex: 96371, itemIndex: 0, op: 'c', reversed: true, points: [[156.896606, 400.267395], [159.619614, 401.146393], [162.353607, 401.987396], [165.097610, 402.792389]] },
  { pathIndex: 96374, itemIndex: 0, op: 'c', reversed: true, points: [[152.337906, 397.232178], [153.612900, 398.721191], [155.030899, 399.665192], [156.896912, 400.267181]] },
  { pathIndex: 96387, itemIndex: 0, op: 'l', reversed: false, points: [[152.337906, 397.232178], [136.423904, 378.654175]] },
  { pathIndex: 96388, itemIndex: 0, op: 'c', reversed: false, points: [[136.424698, 378.654907], [132.988693, 374.643921], [126.561699, 375.505920], [124.301697, 380.278900]] },
  { pathIndex: 96391, itemIndex: 0, op: 'l', reversed: false, points: [[124.302002, 380.278595], [103.327003, 424.595581]] },
  { pathIndex: 96393, itemIndex: 0, op: 'c', reversed: false, points: [[103.326302, 424.596100], [101.067299, 429.369110], [102.155304, 432.276093], [106.994301, 434.392090]] },
  { pathIndex: 96395, itemIndex: 0, op: 'c', reversed: false, points: [[106.994400, 434.391907], [136.563400, 447.318909], [166.552399, 456.048920], [198.439392, 461.009918]] },
  { pathIndex: 96397, itemIndex: 0, op: 'c', reversed: false, points: [[198.439407, 461.009796], [203.644409, 461.818787], [206.118408, 459.960785], [206.788406, 454.734802]] },
  { pathIndex: 96401, itemIndex: 0, op: 'l', reversed: false, points: [[206.788498, 454.734985], [207.439499, 449.651978]] },
] as const satisfies readonly AtriumOpeningSourceSegment[];

/** Opposite drawn outline of the same broad guard. There is a 0.746358 pt
 * source-stroke gap between paths 96372 and 96375; the sampler keeps two runs.
 * The black filled band continues here, but no smooth connector is fabricated. */
export const ATRIUM_OPENING_CORRIDOR_FACING_SOURCE = [
  { pathIndex: 96372, itemIndex: 0, op: 'c', reversed: true, points: [[157.822495, 399.831909], [160.303497, 400.626923], [162.794495, 401.388916], [165.294495, 402.123901]] },
  { pathIndex: 96375, itemIndex: 0, op: 'c', reversed: true, points: [[152.867996, 396.778320], [154.054993, 398.163330], [155.375000, 399.042328], [157.112000, 399.603333]] },
  { pathIndex: 96386, itemIndex: 0, op: 'l', reversed: true, points: [[136.954697, 378.200989], [152.868698, 396.778992]] },
  { pathIndex: 96389, itemIndex: 0, op: 'c', reversed: false, points: [[136.954697, 378.200989], [133.190704, 373.806000], [126.147697, 374.750000], [123.671700, 379.979980]] },
  { pathIndex: 96390, itemIndex: 0, op: 'l', reversed: true, points: [[102.695999, 424.297913], [123.670998, 379.979919]] },
  { pathIndex: 96394, itemIndex: 0, op: 'c', reversed: false, points: [[102.695999, 424.297913], [100.221001, 429.528900], [101.412003, 432.712921], [106.715996, 435.031921]] },
  { pathIndex: 96396, itemIndex: 0, op: 'c', reversed: false, points: [[106.715698, 435.031311], [136.338699, 447.983307], [166.383698, 456.728302], [198.331696, 461.698303]] },
  { pathIndex: 96398, itemIndex: 0, op: 'c', reversed: false, points: [[198.331207, 461.698608], [204.035202, 462.586609], [206.747208, 460.550598], [207.479202, 454.823608]] },
  { pathIndex: 96400, itemIndex: 0, op: 'l', reversed: true, points: [[208.146606, 449.622894], [207.479599, 454.822906]] },
] as const satisfies readonly AtriumOpeningSourceSegment[];

/** Upper stair north guard interface, flight-facing drawn outline. Its
 * elevation follows the stair and must not be assigned uniformly to Level 1. */
export const ATRIUM_UPPER_NORTH_FLIGHT_FACING_GUARD_SOURCE = [
  { pathIndex: 96365, itemIndex: 0, op: 'c', reversed: false, points: [[165.803101, 388.470886], [179.329102, 392.598877], [192.977097, 395.757874], [206.941101, 397.989899]] },
  { pathIndex: 96368, itemIndex: 0, op: 'c', reversed: true, points: [[213.015198, 406.140594], [213.674194, 401.147583], [211.914200, 398.785583], [206.940201, 397.989594]] },
  { pathIndex: 96364, itemIndex: 0, op: 'l', reversed: true, points: [[212.283401, 411.849121], [213.015396, 406.141113]] },
] as const satisfies readonly AtriumOpeningSourceSegment[];

/** Opposite drawn outline of the upper stair north guard, retained for
 * boundary reconciliation only. This is not an additional slab opening edge. */
export const ATRIUM_UPPER_NORTH_OPPOSITE_GUARD_SOURCE = [
  { pathIndex: 96367, itemIndex: 0, op: 'c', reversed: false, points: [[166.006302, 387.803497], [179.501297, 391.922485], [193.119308, 395.073486], [207.050293, 397.301483]] },
  { pathIndex: 96369, itemIndex: 0, op: 'c', reversed: true, points: [[213.706696, 406.230408], [214.427689, 400.759399], [212.499695, 398.172394], [207.050690, 397.300415]] },
  { pathIndex: 96342, itemIndex: 0, op: 'l', reversed: false, points: [[213.706696, 406.230408], [212.957703, 412.086395]] },
] as const satisfies readonly AtriumOpeningSourceSegment[];

/** Continuous gray architectural baseline on the upper stair south side,
 * from west to east. It meets visible tread endpoints and continues through
 * the 86934-86935 gap. It is the tread-facing line, not the void-facing edge
 * of the black guard band, and supplies no tread elevations. */
export const ATRIUM_UPPER_SOUTH_TREAD_FACING_EDGE_SOURCE = [
  { pathIndex: 91378, itemIndex: 45, op: 'c', reversed: true, points: [[160.046005, 400.428802], [159.072006, 400.121796], [158.098999, 399.813782], [157.126007, 399.508789]] },
  { pathIndex: 91378, itemIndex: 44, op: 'c', reversed: true, points: [[160.400009, 400.539795], [160.283005, 400.501801], [160.164001, 400.464783], [160.046005, 400.428802]] },
  { pathIndex: 91378, itemIndex: 43, op: 'c', reversed: true, points: [[160.486008, 400.564789], [160.456009, 400.556793], [160.430008, 400.548798], [160.400009, 400.539795]] },
  { pathIndex: 91378, itemIndex: 42, op: 'c', reversed: true, points: [[160.792007, 400.661804], [160.690002, 400.629791], [160.587006, 400.597809], [160.486008, 400.564789]] },
  { pathIndex: 91378, itemIndex: 41, op: 'c', reversed: true, points: [[161.088013, 400.753784], [160.990005, 400.723785], [160.891006, 400.692810], [160.792007, 400.661804]] },
  { pathIndex: 91378, itemIndex: 40, op: 'l', reversed: true, points: [[161.623001, 400.919800], [161.088013, 400.753784]] },
  { pathIndex: 91378, itemIndex: 39, op: 'c', reversed: true, points: [[162.327011, 401.136810], [162.094009, 401.064789], [161.858002, 400.991791], [161.623001, 400.919800]] },
  { pathIndex: 91378, itemIndex: 38, op: 'c', reversed: true, points: [[163.029999, 401.349792], [162.797012, 401.279785], [162.562012, 401.207794], [162.327011, 401.136810]] },
  { pathIndex: 91378, itemIndex: 37, op: 'c', reversed: true, points: [[163.725006, 401.559784], [163.494003, 401.489807], [163.263000, 401.420807], [163.029999, 401.349792]] },
  { pathIndex: 91378, itemIndex: 36, op: 'c', reversed: true, points: [[163.838013, 401.594788], [163.801010, 401.582794], [163.763000, 401.571808], [163.725006, 401.559784]] },
  { pathIndex: 91378, itemIndex: 35, op: 'c', reversed: true, points: [[163.898010, 401.611786], [163.878006, 401.606812], [163.858002, 401.599792], [163.838013, 401.594788]] },
  { pathIndex: 91378, itemIndex: 34, op: 'c', reversed: true, points: [[164.070007, 401.663788], [164.013000, 401.646790], [163.955002, 401.628784], [163.898010, 401.611786]] },
  { pathIndex: 91378, itemIndex: 33, op: 'c', reversed: true, points: [[164.414001, 401.764801], [164.299011, 401.731812], [164.184998, 401.698792], [164.070007, 401.663788]] },
  { pathIndex: 91378, itemIndex: 32, op: 'c', reversed: true, points: [[165.095001, 401.967804], [164.870010, 401.900787], [164.641998, 401.832794], [164.414001, 401.764801]] },
  { pathIndex: 91378, itemIndex: 31, op: 'c', reversed: true, points: [[165.769012, 402.164795], [165.546005, 402.099792], [165.322006, 402.034790], [165.095001, 401.967804]] },
  { pathIndex: 91378, itemIndex: 30, op: 'c', reversed: true, points: [[166.438004, 402.358795], [166.215012, 402.294800], [165.993011, 402.230804], [165.769012, 402.164795]] },
  { pathIndex: 91378, itemIndex: 29, op: 'c', reversed: true, points: [[166.769012, 402.454803], [166.658005, 402.422791], [166.549011, 402.390808], [166.438004, 402.358795]] },
  { pathIndex: 91378, itemIndex: 28, op: 'c', reversed: true, points: [[167.057007, 402.536804], [166.962006, 402.508789], [166.866013, 402.480804], [166.769012, 402.454803]] },
  { pathIndex: 91378, itemIndex: 27, op: 'c', reversed: true, points: [[167.239014, 402.588806], [167.179001, 402.571808], [167.118011, 402.554810], [167.057007, 402.536804]] },
  { pathIndex: 91378, itemIndex: 26, op: 'c', reversed: true, points: [[168.550003, 402.960785], [168.115005, 402.838806], [167.678009, 402.714783], [167.239014, 402.588806]] },
  { pathIndex: 91378, itemIndex: 25, op: 'c', reversed: true, points: [[170.109009, 403.396790], [169.590012, 403.252808], [169.071014, 403.108795], [168.550003, 402.960785]] },
  { pathIndex: 91378, itemIndex: 24, op: 'c', reversed: true, points: [[170.169006, 403.412811], [170.150009, 403.407806], [170.128998, 403.402802], [170.109009, 403.396790]] },
  { pathIndex: 91378, itemIndex: 23, op: 'c', reversed: true, points: [[172.877014, 404.148804], [171.975006, 403.907806], [171.071014, 403.663788], [170.169006, 403.412811]] },
  { pathIndex: 91378, itemIndex: 22, op: 'l', reversed: true, points: [[173.266006, 404.252808], [172.877014, 404.148804]] },
  { pathIndex: 91378, itemIndex: 21, op: 'c', reversed: true, points: [[173.526001, 404.320801], [173.439011, 404.298798], [173.353012, 404.275787], [173.266006, 404.252808]] },
  { pathIndex: 91378, itemIndex: 20, op: 'c', reversed: true, points: [[174.174011, 404.491791], [173.958008, 404.435791], [173.742004, 404.378784], [173.526001, 404.320801]] },
  { pathIndex: 91378, itemIndex: 19, op: 'c', reversed: true, points: [[175.467010, 404.828796], [175.037003, 404.716797], [174.606003, 404.604797], [174.174011, 404.491791]] },
  { pathIndex: 91378, itemIndex: 18, op: 'c', reversed: true, points: [[176.353012, 405.055786], [176.057007, 404.980804], [175.763000, 404.904785], [175.467010, 404.828796]] },
  { pathIndex: 91378, itemIndex: 17, op: 'c', reversed: true, points: [[176.760010, 405.158783], [176.624008, 405.123810], [176.489014, 405.090790], [176.353012, 405.055786]] },
  { pathIndex: 91378, itemIndex: 16, op: 'c', reversed: true, points: [[178.048004, 405.482788], [177.618011, 405.375793], [177.189011, 405.267792], [176.760010, 405.158783]] },
  { pathIndex: 91378, itemIndex: 15, op: 'c', reversed: true, points: [[179.335999, 405.800812], [178.908005, 405.695801], [178.478012, 405.590790], [178.048004, 405.482788]] },
  { pathIndex: 91378, itemIndex: 14, op: 'c', reversed: true, points: [[179.430008, 405.823792], [179.398010, 405.815796], [179.368011, 405.808807], [179.335999, 405.800812]] },
  { pathIndex: 91378, itemIndex: 13, op: 'c', reversed: true, points: [[180.624008, 406.112793], [180.225006, 406.016785], [179.828003, 405.920807], [179.430008, 405.823792]] },
  { pathIndex: 91378, itemIndex: 12, op: 'c', reversed: true, points: [[182.412003, 406.536804], [181.816010, 406.396790], [181.220001, 406.256805], [180.624008, 406.112793]] },
  { pathIndex: 91378, itemIndex: 11, op: 'c', reversed: true, points: [[182.501007, 406.558807], [182.472000, 406.551788], [182.441010, 406.543793], [182.412003, 406.536804]] },
  { pathIndex: 91378, itemIndex: 10, op: 'c', reversed: true, points: [[183.926010, 406.887787], [183.450012, 406.779785], [182.977005, 406.668793], [182.501007, 406.558807]] },
  { pathIndex: 91378, itemIndex: 9, op: 'c', reversed: true, points: [[185.569000, 407.259796], [185.022003, 407.136810], [184.473999, 407.012787], [183.926010, 406.887787]] },
  { pathIndex: 91378, itemIndex: 8, op: 'c', reversed: true, points: [[185.644012, 407.275787], [185.618011, 407.270782], [185.594009, 407.264801], [185.569000, 407.259796]] },
  { pathIndex: 91378, itemIndex: 7, op: 'c', reversed: true, points: [[186.924011, 407.559784], [186.497009, 407.466797], [186.070007, 407.371796], [185.644012, 407.275787]] },
  { pathIndex: 91378, itemIndex: 6, op: 'c', reversed: true, points: [[188.197006, 407.835785], [187.773010, 407.744781], [187.348007, 407.651794], [186.924011, 407.559784]] },
  { pathIndex: 91378, itemIndex: 5, op: 'c', reversed: true, points: [[188.612000, 407.924805], [188.473999, 407.895782], [188.335999, 407.864807], [188.197006, 407.835785]] },
  { pathIndex: 91378, itemIndex: 4, op: 'c', reversed: true, points: [[189.589005, 408.131805], [189.264008, 408.063782], [188.937012, 407.994781], [188.612000, 407.924805]] },
  { pathIndex: 91378, itemIndex: 3, op: 'c', reversed: true, points: [[190.856003, 408.394806], [190.432999, 408.307800], [190.012009, 408.219788], [189.589005, 408.131805]] },
  { pathIndex: 91378, itemIndex: 2, op: 'c', reversed: true, points: [[191.629013, 408.552795], [191.372009, 408.500793], [191.113007, 408.447784], [190.856003, 408.394806]] },
  { pathIndex: 91378, itemIndex: 1, op: 'c', reversed: true, points: [[192.116013, 408.651794], [191.953003, 408.619781], [191.791000, 408.586792], [191.629013, 408.552795]] },
  { pathIndex: 91378, itemIndex: 0, op: 'c', reversed: true, points: [[194.628006, 409.147797], [193.792007, 408.986786], [192.955002, 408.820801], [192.116013, 408.651794]] },
] as const satisfies readonly AtriumOpeningSourceSegment[];

/** Uninterrupted gray north baseline adjacent to the parent-observed
 * 86934-86935 missing-cross-section span. Its continuity does not establish
 * whether the span is flat, sloping, cut in plan, or omitted in the guide. */
export const ATRIUM_UPPER_GAP_NORTH_EDGE_SOURCE = [
  { pathIndex: 86911, itemIndex: 0, op: 'c', reversed: false, points: [[188.101898, 395.133179], [190.558899, 395.684174], [193.021896, 396.205170], [195.492905, 396.696167]] },
] as const satisfies readonly AtriumOpeningSourceSegment[];

/** Source termination points, not inferred bridge/slab closure segments.
 * pointIndex indexes the segment's points after the l/c operator. */
export const ATRIUM_OPENING_INTERFACE_POINTS = {
  approachNorth: { pathIndex: 96366, itemIndex: 0, pointIndex: 1, point: [165.803299, 388.470490] },
  approachSouth: { pathIndex: 96370, itemIndex: 0, pointIndex: 0, point: [165.098694, 402.792786] },
  upperCoreFlightFacing: { pathIndex: 96364, itemIndex: 0, pointIndex: 0, point: [212.283401, 411.849121] },
  upperCoreOpposite: { pathIndex: 96342, itemIndex: 0, pointIndex: 1, point: [212.957703, 412.086395] },
  southCoreVoidFacing: { pathIndex: 96401, itemIndex: 0, pointIndex: 1, point: [207.439499, 449.651978] },
  southCoreCorridorFacing: { pathIndex: 96400, itemIndex: 0, pointIndex: 0, point: [208.146606, 449.622894] },
} as const;

/** Context IDs only: these smaller curves are deliberately NOT promoted to
 * the Level 1 slab opening, and are not a trace of the intermediate landing. */
export const ATRIUM_OPENING_EXCLUDED_CONTEXT = [
  { pathIndex: 86863, role: 'intermediate-stair-outer-curve', controlBoundsPt: [156.940598, 424.540100, 165.588608, 450.691101] },
  { pathIndex: 92852, role: 'lift-enclosure-filled-cut', controlBoundsPt: [173.211288, 411.268097, 210.972290, 445.068085] },
  { pathIndex: 92854, role: 'lift-enclosure-outer-band', controlBoundsPt: [173.210297, 409.614624, 211.639297, 448.895630] },
  { pathIndex: 96769, role: 'lift-enclosure-north-curve', controlBoundsPt: [192.032608, 410.153320, 211.641602, 412.578308] },
] as const;

const midpoint = (a: AtriumOpeningPoint, b: AtriumOpeningPoint): AtriumOpeningPoint => [
  (a[0] + b[0]) / 2, (a[1] + b[1]) / 2,
];

function distanceToChord(point: AtriumOpeningPoint, a: AtriumOpeningPoint, b: AtriumOpeningPoint): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
    ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / lengthSquared));
  return Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy);
}

/** Adaptive de Casteljau sampling. Tolerance is PDF diagram points, not metres.
 * The convex-hull distance of controls to each chord bounds its curve error.
 * Original endpoints are preserved. No inferred segment closes a contour. */
export function sampleAtriumOpeningSegment(
  segment: AtriumOpeningSourceSegment,
  tolerancePt = ATRIUM_OPENING_PROVENANCE.curveTolerancePt as number,
): readonly AtriumOpeningPoint[] {
  if (!Number.isFinite(tolerancePt) || tolerancePt <= 0) throw new RangeError('Curve tolerance must be finite and positive');
  if (segment.op === 'l') return segment.reversed
    ? [segment.points[1], segment.points[0]] : [...segment.points];
  const [a, b, c, d] = segment.points;
  const ordered = segment.reversed ? [d, c, b, a] as const : segment.points;
  const result: AtriumOpeningPoint[] = [ordered[0]];
  const subdivide = (
    p0: AtriumOpeningPoint, p1: AtriumOpeningPoint,
    p2: AtriumOpeningPoint, p3: AtriumOpeningPoint, depth: number,
  ): void => {
    if (Math.max(distanceToChord(p1, p0, p3), distanceToChord(p2, p0, p3)) <= tolerancePt) {
      result.push(p3);
      return;
    }
    if (depth >= 24) throw new RangeError('Curve tolerance exceeds subdivision precision');
    const ab = midpoint(p0, p1), bc = midpoint(p1, p2), cd = midpoint(p2, p3);
    const abc = midpoint(ab, bc), bcd = midpoint(bc, cd), center = midpoint(abc, bcd);
    subdivide(p0, ab, abc, center, depth + 1);
    subdivide(center, bcd, cd, p3, depth + 1);
  };
  subdivide(...ordered, 0);
  return result;
}

/** Keep open runs separate across actual gaps. Sub-0.002 pt source joins are
 * retained with BOTH endpoints, leaving only an explicitly tiny join chord.
 * There is no averaging, extrapolation, offsetting, or automatic loop closure. */
export function sampleAtriumOpeningContours(
  segments: readonly AtriumOpeningSourceSegment[],
  tolerancePt = ATRIUM_OPENING_PROVENANCE.curveTolerancePt as number,
  joinTolerancePt = ATRIUM_OPENING_PROVENANCE.joinTolerancePt as number,
): readonly (readonly AtriumOpeningPoint[])[] {
  if (!Number.isFinite(joinTolerancePt) || joinTolerancePt < 0) throw new RangeError('Join tolerance must be finite and nonnegative');
  const runs: AtriumOpeningPoint[][] = [];
  for (const segment of segments) {
    const sampled = sampleAtriumOpeningSegment(segment, tolerancePt);
    const current = runs.at(-1), end = current?.at(-1), start = sampled[0];
    const gap = end ? Math.hypot(end[0] - start[0], end[1] - start[1]) : Infinity;
    if (!current || gap > joinTolerancePt) runs.push([...sampled]);
    else current.push(...(gap === 0 ? sampled.slice(1) : sampled));
  }
  return runs;
}

/** Derived OPEN source contours, preserving provenance in the families above.
 * Map each point with firstGuidePlan when the parent integrates this trace.
 * Do not close these arrays to create a surveyed or complete slab-hole mask. */
export const ATRIUM_OPENING_SAMPLED_SOURCE = {
  voidFacing: sampleAtriumOpeningContours(ATRIUM_OPENING_VOID_FACING_SOURCE),
  corridorFacing: sampleAtriumOpeningContours(ATRIUM_OPENING_CORRIDOR_FACING_SOURCE),
  upperNorthFlightFacing: sampleAtriumOpeningContours(ATRIUM_UPPER_NORTH_FLIGHT_FACING_GUARD_SOURCE),
  upperNorthOpposite: sampleAtriumOpeningContours(ATRIUM_UPPER_NORTH_OPPOSITE_GUARD_SOURCE),
  upperSouthTreadFacing: sampleAtriumOpeningContours(ATRIUM_UPPER_SOUTH_TREAD_FACING_EDGE_SOURCE),
} as const;
