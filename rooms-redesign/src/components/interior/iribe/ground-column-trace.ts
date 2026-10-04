/**
 * Solid round column symbols traced from the official UMD / HDR Ground guide.
 * Original PDF page index 6: 576 x 576 pt, origin top-left, +x right, +y down.
 * Data only. Consumers apply the shared groundGuidePlan registration.
 * Radii describe illustrative vector markers, never surveyed column sizes.
 * Thirty verified large symbols; four small auditorium marks remain unresolved.
 * Exact original source commands are retained below, including off-page data.
 * See docs/research/iribe/ground-columns-2026-10-03.md for evidence and limits.
 */

export type GroundColumnDiagramPoint = readonly [pdfX: number, pdfY: number];
export type GroundColumnDiagramBounds = readonly [xMin: number, yMin: number, xMax: number, yMax: number];

export type GroundColumnDiagramSourceCommand =
  | readonly ['l', from: GroundColumnDiagramPoint, to: GroundColumnDiagramPoint]
  | readonly [
      'c',
      from: GroundColumnDiagramPoint,
      control1: GroundColumnDiagramPoint,
      control2: GroundColumnDiagramPoint,
      to: GroundColumnDiagramPoint,
    ]
  | readonly ['re', bounds: GroundColumnDiagramBounds, orientation: 1 | -1];

export interface GroundColumnDiagramRecord {
  readonly id: string;
  /** Original-frame center estimate; inspect centerDerivation for the method. */
  readonly center: GroundColumnDiagramPoint;
  /** Core fill for compound symbols; outer fill for the other markers. */
  readonly centerSourcePathIndex: number;
  readonly centerDerivation:
    | 'control-bounds-midpoint'
    | 'curve-bounds-midpoint'
    | 'core-control-bounds-midpoint';
  /** Mean x/y half-extent of the actual outer curves, evaluated at extrema. */
  readonly markerRadiusPt: number;
  /** Mean x/y half-extent of get_drawings().rect, including Bezier controls. */
  readonly markerControlBoundsRadiusPt: number;
  readonly markerCurveBoundsPt: GroundColumnDiagramBounds;
  /** Relation to the source exterior glass/wall line, interpreted visually. */
  readonly sourceBuilding: 'inside' | 'outside';
  /** Page-position labels, not surveyed geographic bearings. */
  readonly zone:
    | 'east-canopy'
    | 'auditorium-east-circulation'
    | 'west-lab-and-support-wing'
    | 'cafe-and-west-atrium'
    | 'lobby-and-atrium';
  readonly page6Visibility: 'visible' | 'partly-covered' | 'covered-by-icon' | 'outside-page';
  readonly annotationOcclusion: 'none' | 'cafe-icon' | 'restroom-icon' | 'cafe-callout-leader';
  /** Zero-based get_drawings() indices on original PDF page 6. */
  readonly sourcePathIndices: readonly number[];
  /** Matching original page 5 paths; translate x by -576 pt into this frame. */
  readonly page5SourcePathIndices: readonly number[];
  /** Separate inner fill of a compound marker; do not count it as another column. */
  readonly coreMarkerRadiusPt?: number;
}

export interface GroundColumnUncertainDiagramMark {
  readonly id: string;
  readonly center: GroundColumnDiagramPoint;
  readonly markerControlBoundsRadiusPt: number;
  readonly sourceBuilding: 'inside';
  readonly sourcePathIndices: readonly number[];
  readonly page5SourcePathIndices: readonly number[];
}

export interface GroundColumnDiagramSourcePath {
  readonly pathIndex: number;
  readonly sequenceNumber: number;
  /** Original PyMuPDF rect: includes control points, not just curve extrema. */
  readonly controlBoundsPt: GroundColumnDiagramBounds;
  readonly commands: readonly GroundColumnDiagramSourceCommand[];
}

export const GROUND_COLUMN_DIAGRAM_SOURCE = {
  url: 'https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf',
  pdfSha256: 'c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474',
  pageIndex: 6,
  continuationPageIndex: 5,
  pageWidthPt: 576,
  pageHeightPt: 576,
  coordinateOrigin: 'top-left',
  xDirection: 'right',
  yDirection: 'down',
  continuationToPage6OffsetPt: [-576, 0],
  extractionApi: 'PyMuPDF 1.28.2 page.get_drawings()',
  page6DrawingCount: 56651,
  page5DrawingCount: 25380,
  derivedCoordinateDecimalPlaces: 6,
  sourceCommands: 'original-unrounded-floating-point-coordinates',
  sourcePathFill: [0, 0, 0],
  sourcePathFillOpacity: 1,
  sourcePathFillRule: 'nonzero',
  verifiedColumnCount: 30,
  verifiedSourcePathCount: 32,
  uncertainMarkCount: 4,
  retainedSourcePathCount: 40,
  evidence: 'round-structural-symbols-in-historical-illustrative-plan',
  physicalDimensions: 'not-surveyed',
} as const;

export const GROUND_COLUMN_TRACE = [
  {
    id: 'column-pdf6-52169',
    center: [405.214799, 295.959516],
    centerSourcePathIndex: 52169,
    centerDerivation: 'curve-bounds-midpoint',
    markerRadiusPt: 2.418029,
    markerControlBoundsRadiusPt: 2.530746,
    markerCurveBoundsPt: [402.802481, 293.535777, 407.627118, 298.383256],
    sourceBuilding: 'inside',
    zone: 'auditorium-east-circulation',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52169],
    page5SourcePathIndices: [24051],
  },
  {
    id: 'column-pdf6-52195',
    center: [421.967466, 240.907787],
    centerSourcePathIndex: 52195,
    centerDerivation: 'curve-bounds-midpoint',
    markerRadiusPt: 2.418511,
    markerControlBoundsRadiusPt: 2.548004,
    markerCurveBoundsPt: [419.552889, 238.48534, 424.382042, 243.330234],
    sourceBuilding: 'inside',
    zone: 'auditorium-east-circulation',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52195],
    page5SourcePathIndices: [24077],
  },
  {
    id: 'column-pdf6-52301',
    center: [511.203613, 428.70372],
    centerSourcePathIndex: 52301,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 3.18167,
    markerControlBoundsRadiusPt: 3.408257,
    markerCurveBoundsPt: [508.023962, 425.515375, 514.383263, 431.882755],
    sourceBuilding: 'outside',
    zone: 'east-canopy',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52301],
    page5SourcePathIndices: [24183],
  },
  {
    id: 'column-pdf6-52302',
    center: [505.207901, 475.752594],
    centerSourcePathIndex: 52302,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 3.182289,
    markerControlBoundsRadiusPt: 3.411507,
    markerCurveBoundsPt: [502.022272, 472.573656, 508.393549, 478.931536],
    sourceBuilding: 'outside',
    zone: 'east-canopy',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52302],
    page5SourcePathIndices: [24184],
  },
  {
    id: 'column-pdf6-52303',
    center: [455.487289, 130.842194],
    centerSourcePathIndex: 52303,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.440168,
    markerControlBoundsRadiusPt: 2.737251,
    markerCurveBoundsPt: [453.04988, 128.404117, 457.926455, 133.288211],
    sourceBuilding: 'inside',
    zone: 'auditorium-east-circulation',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52303],
    page5SourcePathIndices: [24185],
  },
  {
    id: 'column-pdf6-52304',
    center: [454.694992, 423.350403],
    centerSourcePathIndex: 52304,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 3.179266,
    markerControlBoundsRadiusPt: 3.408501,
    markerCurveBoundsPt: [451.515445, 420.171465, 457.874628, 426.529345],
    sourceBuilding: 'outside',
    zone: 'east-canopy',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52304],
    page5SourcePathIndices: [24186],
  },
  {
    id: 'column-pdf6-52305',
    center: [448.244797, 473.895996],
    centerSourcePathIndex: 52305,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 3.179288,
    markerControlBoundsRadiusPt: 3.408501,
    markerCurveBoundsPt: [445.065161, 470.71706, 451.424433, 477.074939],
    sourceBuilding: 'outside',
    zone: 'east-canopy',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52305],
    page5SourcePathIndices: [24187],
  },
  {
    id: 'column-pdf6-52308',
    center: [438.752197, 185.859497],
    centerSourcePathIndex: 52308,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.440061,
    markerControlBoundsRadiusPt: 2.737,
    markerCurveBoundsPt: [436.306185, 183.42142, 441.190274, 188.297574],
    sourceBuilding: 'inside',
    zone: 'auditorium-east-circulation',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52308],
    page5SourcePathIndices: [24190],
  },
  {
    id: 'column-pdf6-52327',
    center: [398.214188, 417.835205],
    centerSourcePathIndex: 52327,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 3.179287,
    markerControlBoundsRadiusPt: 3.408501,
    markerCurveBoundsPt: [395.034552, 414.656267, 401.393824, 421.014143],
    sourceBuilding: 'outside',
    zone: 'east-canopy',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52327],
    page5SourcePathIndices: [24209],
  },
  {
    id: 'column-pdf6-52330',
    center: [391.256714, 472.202118],
    centerSourcePathIndex: 52330,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 3.182367,
    markerControlBoundsRadiusPt: 3.411758,
    markerCurveBoundsPt: [388.070562, 469.023182, 394.44215, 475.38106],
    sourceBuilding: 'outside',
    zone: 'east-canopy',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52330],
    page5SourcePathIndices: [24212],
  },
  {
    id: 'column-pdf6-52368',
    center: [341.997498, 411.459091],
    centerSourcePathIndex: 52369,
    centerDerivation: 'core-control-bounds-midpoint',
    markerRadiusPt: 2.442157,
    markerControlBoundsRadiusPt: 2.737251,
    markerCurveBoundsPt: [339.524043, 409.013568, 344.408567, 413.897672],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52368, 52369],
    page5SourcePathIndices: [24250, 24251],
    coreMarkerRadiusPt: 2.045998,
  },
  {
    id: 'column-pdf6-52372',
    center: [334.354797, 471.402908],
    centerSourcePathIndex: 52374,
    centerDerivation: 'core-control-bounds-midpoint',
    markerRadiusPt: 2.4425,
    markerControlBoundsRadiusPt: 2.737747,
    markerCurveBoundsPt: [331.875088, 468.957629, 336.759587, 473.843131],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52372, 52374],
    page5SourcePathIndices: [24254, 24256],
    coreMarkerRadiusPt: 2.049995,
  },
  {
    id: 'column-pdf6-52402',
    center: [285.732697, 404.250122],
    centerSourcePathIndex: 52402,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.440061,
    markerControlBoundsRadiusPt: 2.737,
    markerCurveBoundsPt: [283.286684, 401.812045, 288.170774, 406.688199],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52402],
    page5SourcePathIndices: [24284],
  },
  {
    id: 'column-pdf6-52406',
    center: [277.126694, 471.395813],
    centerSourcePathIndex: 52406,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.442292,
    markerControlBoundsRadiusPt: 2.737251,
    markerCurveBoundsPt: [274.681337, 468.957751, 279.56586, 473.842394],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52406],
    page5SourcePathIndices: [24288],
  },
  {
    id: 'column-pdf6-52419',
    center: [249.631409, 276.015594],
    centerSourcePathIndex: 52419,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.442154,
    markerControlBoundsRadiusPt: 2.737251,
    markerCurveBoundsPt: [247.186052, 273.577517, 252.070566, 278.461621],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52419],
    page5SourcePathIndices: [24301],
  },
  {
    id: 'column-pdf6-52428',
    center: [234.502098, 357.647522],
    centerSourcePathIndex: 52428,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.443617,
    markerControlBoundsRadiusPt: 2.740749,
    markerCurveBoundsPt: [232.057311, 355.209445, 236.947675, 360.093548],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52428],
    page5SourcePathIndices: [24310],
  },
  {
    id: 'column-pdf6-52429',
    center: [229.4543, 397.041107],
    centerSourcePathIndex: 52429,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.438073,
    markerControlBoundsRadiusPt: 2.737,
    markerCurveBoundsPt: [227.016808, 394.60303, 231.892948, 399.479184],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52429],
    page5SourcePathIndices: [24311],
  },
  {
    id: 'column-pdf6-52436',
    center: [220.320404, 468.319595],
    centerSourcePathIndex: 52436,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.440282,
    markerControlBoundsRadiusPt: 2.737503,
    markerCurveBoundsPt: [217.882986, 465.87421, 222.759561, 470.758761],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52436],
    page5SourcePathIndices: [24318],
  },
  {
    id: 'column-pdf6-52452',
    center: [204.981598, 308.741486],
    centerSourcePathIndex: 52452,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.441766,
    markerControlBoundsRadiusPt: 2.737,
    markerCurveBoundsPt: [202.543521, 306.303409, 207.42648, 311.187512],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52452],
    page5SourcePathIndices: [24334],
  },
  {
    id: 'column-pdf6-52455',
    center: [193.198807, 349.015518],
    centerSourcePathIndex: 52455,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.443152,
    markerControlBoundsRadiusPt: 2.740753,
    markerCurveBoundsPt: [190.753741, 346.571434, 195.643684, 351.454099],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52455],
    page5SourcePathIndices: [24337],
  },
  {
    id: 'column-pdf6-52458',
    center: [182.038406, 387.128311],
    centerSourcePathIndex: 52458,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.443335,
    markerControlBoundsRadiusPt: 2.740753,
    markerCurveBoundsPt: [179.600988, 384.68323, 184.48437, 389.573188],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52458],
    page5SourcePathIndices: [24340],
  },
  {
    id: 'column-pdf6-52464',
    center: [161.8545, 456.096817],
    centerSourcePathIndex: 52464,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.443756,
    markerControlBoundsRadiusPt: 2.740749,
    markerCurveBoundsPt: [159.409645, 453.650874, 164.300144, 458.535398],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52464],
    page5SourcePathIndices: [24346],
  },
  {
    id: 'column-pdf6-52468',
    center: [153.757004, 334.014282],
    centerSourcePathIndex: 52468,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.440167,
    markerControlBoundsRadiusPt: 2.737251,
    markerCurveBoundsPt: [151.311647, 331.576205, 156.196161, 336.452359],
    sourceBuilding: 'inside',
    zone: 'cafe-and-west-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52468],
    page5SourcePathIndices: [24350],
  },
  {
    id: 'column-pdf6-52475',
    center: [136.764809, 369.911301],
    centerSourcePathIndex: 52475,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.441767,
    markerControlBoundsRadiusPt: 2.737003,
    markerCurveBoundsPt: [134.327228, 367.465357, 139.209772, 372.349881],
    sourceBuilding: 'inside',
    zone: 'cafe-and-west-atrium',
    page6Visibility: 'covered-by-icon',
    annotationOcclusion: 'cafe-icon',
    sourcePathIndices: [52475],
    page5SourcePathIndices: [24357],
  },
  {
    id: 'column-pdf6-52480',
    center: [117.125015, 313.064807],
    centerSourcePathIndex: 52480,
    centerDerivation: 'curve-bounds-midpoint',
    markerRadiusPt: 2.40648,
    markerControlBoundsRadiusPt: 2.62575,
    markerCurveBoundsPt: [114.709474, 310.667388, 119.540556, 315.462227],
    sourceBuilding: 'inside',
    zone: 'cafe-and-west-atrium',
    page6Visibility: 'partly-covered',
    annotationOcclusion: 'cafe-callout-leader',
    sourcePathIndices: [52480],
    page5SourcePathIndices: [24362],
  },
  {
    id: 'column-pdf6-52484',
    center: [106.030396, 434.862],
    centerSourcePathIndex: 52484,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.440198,
    markerControlBoundsRadiusPt: 2.737,
    markerCurveBoundsPt: [103.584388, 432.423937, 108.469039, 437.300077],
    sourceBuilding: 'inside',
    zone: 'lobby-and-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52484],
    page5SourcePathIndices: [24366],
  },
  {
    id: 'column-pdf6-52508',
    center: [57.022499, 315.429489],
    centerSourcePathIndex: 52508,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.444976,
    markerControlBoundsRadiusPt: 2.744001,
    markerCurveBoundsPt: [54.57821, 312.984408, 59.468157, 317.874366],
    sourceBuilding: 'inside',
    zone: 'west-lab-and-support-wing',
    page6Visibility: 'partly-covered',
    annotationOcclusion: 'restroom-icon',
    sourcePathIndices: [52508],
    page5SourcePathIndices: [24390],
  },
  {
    id: 'column-pdf6-52511',
    center: [54.210201, 405.144714],
    centerSourcePathIndex: 52511,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.440169,
    markerControlBoundsRadiusPt: 2.737249,
    markerCurveBoundsPt: [51.772787, 402.706637, 56.649359, 407.590741],
    sourceBuilding: 'inside',
    zone: 'cafe-and-west-atrium',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52511],
    page5SourcePathIndices: [24393],
  },
  {
    id: 'column-pdf6-52550',
    center: [7.7302, 367.702591],
    centerSourcePathIndex: 52550,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.44201,
    markerControlBoundsRadiusPt: 2.737252,
    markerCurveBoundsPt: [5.292705, 365.256648, 10.176222, 370.141171],
    sourceBuilding: 'inside',
    zone: 'west-lab-and-support-wing',
    page6Visibility: 'visible',
    annotationOcclusion: 'none',
    sourcePathIndices: [52550],
    page5SourcePathIndices: [24432],
  },
  {
    id: 'column-pdf6-52583',
    center: [-30.638801, 325.639786],
    centerSourcePathIndex: 52583,
    centerDerivation: 'control-bounds-midpoint',
    markerRadiusPt: 2.443335,
    markerControlBoundsRadiusPt: 2.740752,
    markerCurveBoundsPt: [-33.083876, 323.193842, -28.195061, 328.078366],
    sourceBuilding: 'inside',
    zone: 'west-lab-and-support-wing',
    page6Visibility: 'outside-page',
    annotationOcclusion: 'none',
    sourcePathIndices: [52583],
    page5SourcePathIndices: [24465],
  },
] as const satisfies readonly GroundColumnDiagramRecord[];

/**
 * Four small black marks along the auditorium seating/desk ends. Their repeated
 * placement is visible, but the guide has no legend confirming structural use.
 * They are deliberately outside GROUND_COLUMN_TRACE pending stronger evidence.
 */
export const GROUND_COLUMN_UNCERTAIN_MARKS = [
  {
    id: 'unresolved-auditorium-pdf6-52290',
    center: [386.925995, 98.007492],
    markerControlBoundsRadiusPt: 0.944756,
    sourceBuilding: 'inside',
    sourcePathIndices: [52290, 52291],
    page5SourcePathIndices: [24172, 24173],
  },
  {
    id: 'unresolved-auditorium-pdf6-52294',
    center: [386.925995, 135.252502],
    markerControlBoundsRadiusPt: 0.907761,
    sourceBuilding: 'inside',
    sourcePathIndices: [52294, 52295],
    page5SourcePathIndices: [24176, 24177],
  },
  {
    id: 'unresolved-auditorium-pdf6-52292',
    center: [386.925995, 172.999512],
    markerControlBoundsRadiusPt: 0.917755,
    sourceBuilding: 'inside',
    sourcePathIndices: [52292, 52293],
    page5SourcePathIndices: [24174, 24175],
  },
  {
    id: 'unresolved-auditorium-pdf6-52288',
    center: [386.925995, 210.210999],
    markerControlBoundsRadiusPt: 0.944504,
    sourceBuilding: 'inside',
    sourcePathIndices: [52288, 52289],
    page5SourcePathIndices: [24170, 24171],
  },
] as const satisfies readonly GroundColumnUncertainDiagramMark[];

/**
 * All 32 verified-symbol paths and eight paths for unresolved auditorium marks.
 * All are opaque black fills with the nonzero fill rule. Compound paths retain
 * both subpaths; source fills for their cores are retained as separate paths.
 */
/* eslint-disable no-loss-of-precision -- Original PyMuPDF IEEE-754 coordinates use Python's round-trip decimals; verified identical after JavaScript parsing. */
export const GROUND_COLUMN_SOURCE_PATHS = [
  {
    pathIndex: 52169, sequenceNumber: 52169,
    controlBoundsPt: [402.6793212890625, 293.4964904785156, 407.6393127441406, 298.65948486328125],
    commands: [
      ['c', [407.4493103027344, 296.6134948730469], [407.0023193359375, 298.1715087890625], [406.1753234863281, 298.65948486328125], [404.6443176269531, 298.239501953125]],
      ['c', [404.6443176269531, 298.239501953125], [404.6173095703125, 298.22650146484375], [404.5763244628906, 298.22650146484375], [404.54931640625, 298.2124938964844]],
      ['c', [404.54931640625, 298.2124938964844], [403.96630859375, 298.0364990234375], [403.5333251953125, 297.8194885253906], [403.2353210449219, 297.50750732421875]],
      ['c', [403.2353210449219, 297.50750732421875], [402.76031494140625, 297.0065002441406], [402.6793212890625, 296.2884826660156], [402.977294921875, 295.29949951171875]],
      ['c', [402.977294921875, 295.29949951171875], [403.1533203125, 294.6894836425781], [403.3843078613281, 294.24249267578125], [403.6953125, 293.9574890136719]],
      ['c', [403.6953125, 293.9574890136719], [403.84429931640625, 293.8085021972656], [404.00732421875, 293.7135009765625], [404.1833190917969, 293.6455078125]],
      ['c', [404.1833190917969, 293.6455078125], [404.1972961425781, 293.6455078125], [404.1972961425781, 293.63250732421875], [404.2102966308594, 293.63250732421875]],
      ['c', [404.2102966308594, 293.63250732421875], [404.29229736328125, 293.6054992675781], [404.3863220214844, 293.5784912109375], [404.4813232421875, 293.5644836425781]],
      ['c', [404.4813232421875, 293.5644836425781], [404.8742980957031, 293.4964904785156], [405.3213195800781, 293.5505065917969], [405.8633117675781, 293.7135009765625]],
      ['c', [405.8633117675781, 293.7135009765625], [407.029296875, 294.052490234375], [407.5843200683594, 294.594482421875], [407.62530517578125, 295.4884948730469]],
      ['c', [407.62530517578125, 295.4884948730469], [407.6393127441406, 295.8144836425781], [407.5713195800781, 296.1934814453125], [407.4493103027344, 296.6134948730469]],
    ],
  },
  {
    pathIndex: 52195, sequenceNumber: 52195,
    controlBoundsPt: [419.4953918457031, 238.45179748535156, 424.67340087890625, 243.46580505371094],
    commands: [
      ['c', [419.8623962402344, 239.83380126953125], [419.8623962402344, 239.81979370117188], [419.8753967285156, 239.81979370117188], [419.8753967285156, 239.81979370117188]],
      ['c', [419.8753967285156, 239.81979370117188], [420.118408203125, 239.1697998046875], [420.4573974609375, 238.7637939453125], [420.9464111328125, 238.58680725097656]],
      ['c', [420.9464111328125, 238.58680725097656], [421.0413818359375, 238.55979919433594], [421.1343994140625, 238.53280639648438], [421.244384765625, 238.50579833984375]],
      ['c', [421.244384765625, 238.50579833984375], [421.6243896484375, 238.45179748535156], [422.0714111328125, 238.50579833984375], [422.6134033203125, 238.65480041503906]],
      ['c', [422.6134033203125, 238.65480041503906], [424.21240234375, 239.12879943847656], [424.67340087890625, 239.98280334472656], [424.21240234375, 241.5688018798828]],
      ['c', [424.21240234375, 241.5688018798828], [424.17138671875, 241.71780395507812], [424.1174011230469, 241.86680603027344], [424.0633850097656, 242.00180053710938]],
      ['c', [424.0633850097656, 242.00180053710938], [423.62939453125, 243.0727996826172], [422.952392578125, 243.46580505371094], [421.8544006347656, 243.289794921875]],
      ['c', [421.8544006347656, 243.289794921875], [421.67840576171875, 243.2617950439453], [421.4884033203125, 243.20779418945312], [421.29840087890625, 243.15380859375]],
      ['c', [421.29840087890625, 243.15380859375], [420.702392578125, 242.97779846191406], [420.2694091796875, 242.76080322265625], [419.9844055175781, 242.46279907226562]],
      ['c', [419.9844055175781, 242.46279907226562], [419.8334045410156, 242.2998046875], [419.72540283203125, 242.13780212402344], [419.6593933105469, 241.9477996826172]],
      ['c', [419.6593933105469, 241.9477996826172], [419.4953918457031, 241.5008087158203], [419.5234069824219, 240.94479370117188], [419.72540283203125, 240.2407989501953]],
      ['c', [419.72540283203125, 240.2407989501953], [419.75439453125, 240.09080505371094], [419.80841064453125, 239.95579528808594], [419.8623962402344, 239.83380126953125]],
    ],
  },
  {
    pathIndex: 52288, sequenceNumber: 52288,
    controlBoundsPt: [385.9849853515625, 209.26300048828125, 387.86700439453125, 211.15899658203125],
    commands: [
      ['re', [386.4590148925781, 209.73599243164062, 387.3940124511719, 210.68499755859375], -1],
      ['c', [386.9339904785156, 209.26300048828125], [387.59600830078125, 209.26300048828125], [387.86700439453125, 209.54800415039062], [387.86700439453125, 210.21099853515625]],
      ['c', [387.86700439453125, 210.21099853515625], [387.86700439453125, 210.88800048828125], [387.59600830078125, 211.15899658203125], [386.9339904785156, 211.15899658203125]],
      ['c', [386.9339904785156, 211.15899658203125], [386.2560119628906, 211.15899658203125], [385.9849853515625, 210.88800048828125], [385.9849853515625, 210.21099853515625]],
      ['c', [385.9849853515625, 210.21099853515625], [385.9849853515625, 209.54800415039062], [386.2560119628906, 209.26300048828125], [386.9339904785156, 209.26300048828125]],
    ],
  },
  {
    pathIndex: 52289, sequenceNumber: 52289,
    controlBoundsPt: [386.4590148925781, 209.73599243164062, 387.3940124511719, 210.68499755859375],
    commands: [
      ['re', [386.4590148925781, 209.73599243164062, 387.3940124511719, 210.68499755859375], 1],
    ],
  },
  {
    pathIndex: 52290, sequenceNumber: 52290,
    controlBoundsPt: [385.9849853515625, 97.05899047851562, 387.86700439453125, 98.95599365234375],
    commands: [
      ['re', [386.4590148925781, 97.53298950195312, 387.3940124511719, 98.48199462890625], -1],
      ['c', [386.9339904785156, 97.05899047851562], [387.59600830078125, 97.05899047851562], [387.86700439453125, 97.34298706054688], [387.86700439453125, 98.00698852539062]],
      ['c', [387.86700439453125, 98.00698852539062], [387.86700439453125, 98.68499755859375], [387.59600830078125, 98.95599365234375], [386.9339904785156, 98.95599365234375]],
      ['c', [386.9339904785156, 98.95599365234375], [386.2560119628906, 98.95599365234375], [385.9849853515625, 98.68499755859375], [385.9849853515625, 98.00698852539062]],
      ['c', [385.9849853515625, 98.00698852539062], [385.9849853515625, 97.34298706054688], [386.2560119628906, 97.05899047851562], [386.9339904785156, 97.05899047851562]],
    ],
  },
  {
    pathIndex: 52291, sequenceNumber: 52291,
    controlBoundsPt: [386.4590148925781, 97.53399658203125, 387.3940124511719, 98.48300170898438],
    commands: [
      ['re', [386.4590148925781, 97.53399658203125, 387.3940124511719, 98.48300170898438], 1],
    ],
  },
  {
    pathIndex: 52292, sequenceNumber: 52292,
    controlBoundsPt: [385.9849853515625, 172.10501098632812, 387.86700439453125, 173.89401245117188],
    commands: [
      ['re', [386.4590148925781, 172.552001953125, 387.3940124511719, 173.50100708007812], -1],
      ['c', [387.86700439453125, 173.0260009765625], [387.86700439453125, 173.51400756835938], [387.7200012207031, 173.78500366210938], [387.3940124511719, 173.89401245117188]],
      ['l', [387.3940124511719, 173.89401245117188], [387.3940124511719, 173.8389892578125]],
      ['l', [387.3940124511719, 173.8389892578125], [386.33599853515625, 173.8389892578125]],
      ['c', [386.33599853515625, 173.8389892578125], [386.093994140625, 173.70401000976562], [385.9849853515625, 173.44601440429688], [385.9849853515625, 173.0260009765625]],
      ['c', [385.9849853515625, 173.0260009765625], [385.9849853515625, 172.45700073242188], [386.1730041503906, 172.17300415039062], [386.6340026855469, 172.10501098632812]],
      ['l', [386.6340026855469, 172.10501098632812], [387.2300109863281, 172.10501098632812]],
      ['c', [387.2300109863281, 172.10501098632812], [387.6789855957031, 172.18600463867188], [387.86700439453125, 172.45700073242188], [387.86700439453125, 173.0260009765625]],
    ],
  },
  {
    pathIndex: 52293, sequenceNumber: 52293,
    controlBoundsPt: [386.4590148925781, 172.552001953125, 387.3940124511719, 173.50100708007812],
    commands: [
      ['re', [386.4590148925781, 172.552001953125, 387.3940124511719, 173.50100708007812], 1],
    ],
  },
  {
    pathIndex: 52294, sequenceNumber: 52294,
    controlBoundsPt: [385.9849853515625, 134.37799072265625, 387.86700439453125, 136.12701416015625],
    commands: [
      ['re', [386.4590148925781, 134.73199462890625, 387.3940124511719, 135.68099975585938], -1],
      ['c', [387.3940124511719, 134.32400512695312], [387.7200012207031, 134.43301391601562], [387.86700439453125, 134.71701049804688], [387.86700439453125, 135.20498657226562]],
      ['c', [387.86700439453125, 135.20498657226562], [387.86700439453125, 135.78799438476562], [387.6650085449219, 136.07199096679688], [387.16400146484375, 136.12701416015625]],
      ['l', [387.16400146484375, 136.12701416015625], [386.7030029296875, 136.12701416015625]],
      ['c', [386.7030029296875, 136.12701416015625], [386.18701171875, 136.07199096679688], [385.9849853515625, 135.78799438476562], [385.9849853515625, 135.20498657226562]],
      ['c', [385.9849853515625, 135.20498657226562], [385.9849853515625, 134.7860107421875], [386.093994140625, 134.51400756835938], [386.33599853515625, 134.37799072265625]],
      ['l', [386.33599853515625, 134.37799072265625], [387.3940124511719, 134.37799072265625]],
      ['l', [387.3940124511719, 134.37799072265625], [387.3940124511719, 134.32400512695312]],
    ],
  },
  {
    pathIndex: 52295, sequenceNumber: 52295,
    controlBoundsPt: [386.4590148925781, 134.72998046875, 387.3940124511719, 135.67898559570312],
    commands: [
      ['re', [386.4590148925781, 134.72998046875, 387.3940124511719, 135.67898559570312], 1],
    ],
  },
  {
    pathIndex: 52301, sequenceNumber: 52301,
    controlBoundsPt: [507.79510498046875, 425.29571533203125, 514.6121215820312, 432.1117248535156],
    commands: [
      ['c', [511.6040954589844, 425.56671142578125], [513.8131103515625, 425.8517150878906], [514.6121215820312, 426.8937072753906], [514.328125, 429.1017150878906]],
      ['c', [514.328125, 429.1017150878906], [514.0430908203125, 431.3106994628906], [513.0131225585938, 432.1117248535156], [510.8031005859375, 431.82769775390625]],
      ['c', [510.8031005859375, 431.82769775390625], [508.5940856933594, 431.542724609375], [507.79510498046875, 430.51171875], [508.0791015625, 428.3037109375]],
      ['c', [508.0791015625, 428.3037109375], [508.3641052246094, 426.08172607421875], [509.39508056640625, 425.29571533203125], [511.6040954589844, 425.56671142578125]],
    ],
  },
  {
    pathIndex: 52302, sequenceNumber: 52302,
    controlBoundsPt: [501.79339599609375, 472.3440856933594, 508.6224060058594, 479.1611022949219],
    commands: [
      ['c', [505.6144104003906, 472.62908935546875], [507.82342529296875, 472.9140930175781], [508.6224060058594, 473.9430847167969], [508.3384094238281, 476.1540832519531]],
      ['c', [508.3384094238281, 476.1540832519531], [508.05340576171875, 478.361083984375], [507.0234069824219, 479.1611022949219], [504.8004150390625, 478.8760986328125]],
      ['c', [504.8004150390625, 478.8760986328125], [502.5924072265625, 478.6051025390625], [501.79339599609375, 477.5630798339844], [502.0774230957031, 475.35308837890625]],
      ['c', [502.0774230957031, 475.35308837890625], [502.3623962402344, 473.14410400390625], [503.3904113769531, 472.3440856933594], [505.6144104003906, 472.62908935546875]],
    ],
  },
  {
    pathIndex: 52303, sequenceNumber: 52303,
    controlBoundsPt: [452.7497863769531, 128.10519409179688, 458.22479248046875, 133.57919311523438],
    commands: [
      ['c', [456.1528015136719, 128.57919311523438], [457.7518005371094, 129.04019165039062], [458.22479248046875, 129.90719604492188], [457.7518005371094, 131.50619506835938]],
      ['c', [457.7518005371094, 131.50619506835938], [457.2908020019531, 133.1191864013672], [456.42279052734375, 133.57919311523438], [454.8247985839844, 133.1191864013672]],
      ['c', [454.8247985839844, 133.1191864013672], [453.2257995605469, 132.64419555664062], [452.7497863769531, 131.79119873046875], [453.2257995605469, 130.17819213867188]],
      ['c', [453.2257995605469, 130.17819213867188], [453.6867980957031, 128.57919311523438], [454.55279541015625, 128.10519409179688], [456.1528015136719, 128.57919311523438]],
    ],
  },
  {
    pathIndex: 52304, sequenceNumber: 52304,
    controlBoundsPt: [451.2864990234375, 419.94189453125, 458.1034851074219, 426.7589111328125],
    commands: [
      ['c', [455.0954895019531, 420.2268981933594], [457.30450439453125, 420.51190185546875], [458.1034851074219, 421.5408935546875], [457.8194885253906, 423.75189208984375]],
      ['c', [457.8194885253906, 423.75189208984375], [457.5484924316406, 425.9588928222656], [456.5044860839844, 426.7589111328125], [454.2955017089844, 426.4739074707031]],
      ['c', [454.2955017089844, 426.4739074707031], [452.0874938964844, 426.1899108886719], [451.2864990234375, 425.159912109375], [451.57049560546875, 422.9508972167969]],
      ['c', [451.57049560546875, 422.9508972167969], [451.8554992675781, 420.7419128417969], [452.886474609375, 419.94189453125], [455.0954895019531, 420.2268981933594]],
    ],
  },
  {
    pathIndex: 52305, sequenceNumber: 52305,
    controlBoundsPt: [444.8363037109375, 470.48748779296875, 451.6532897949219, 477.30450439453125],
    commands: [
      ['c', [448.6452941894531, 470.7724914550781], [450.85430908203125, 471.0574951171875], [451.6532897949219, 472.0885009765625], [451.3692932128906, 474.2974853515625]],
      ['c', [451.3692932128906, 474.2974853515625], [451.08428955078125, 476.5044860839844], [450.0542907714844, 477.30450439453125], [447.84429931640625, 477.0195007324219]],
      ['c', [447.84429931640625, 477.0195007324219], [445.6352844238281, 476.7355041503906], [444.8363037109375, 475.70648193359375], [445.12030029296875, 473.49749755859375]],
      ['c', [445.12030029296875, 473.49749755859375], [445.4053039550781, 471.2875061035156], [446.435302734375, 470.48748779296875], [448.6452941894531, 470.7724914550781]],
    ],
  },
  {
    pathIndex: 52308, sequenceNumber: 52308,
    controlBoundsPt: [436.01519775390625, 183.12249755859375, 441.48919677734375, 188.59649658203125],
    commands: [
      ['c', [439.41619873046875, 183.59649658203125], [441.01519775390625, 184.0574951171875], [441.48919677734375, 184.92449951171875], [441.01519775390625, 186.52349853515625]],
      ['c', [441.01519775390625, 186.52349853515625], [440.54119873046875, 188.12249755859375], [439.68719482421875, 188.59649658203125], [438.0892028808594, 188.12249755859375]],
      ['c', [438.0892028808594, 188.12249755859375], [436.4751892089844, 187.6614990234375], [436.01519775390625, 186.79449462890625], [436.4751892089844, 185.19549560546875]],
      ['c', [436.4751892089844, 185.19549560546875], [436.9501953125, 183.59649658203125], [437.8052062988281, 183.12249755859375], [439.41619873046875, 183.59649658203125]],
    ],
  },
  {
    pathIndex: 52327, sequenceNumber: 52327,
    controlBoundsPt: [394.8056945800781, 414.42669677734375, 401.6226806640625, 421.24371337890625],
    commands: [
      ['c', [398.61468505859375, 414.7117004394531], [400.8236999511719, 414.9826965332031], [401.6226806640625, 416.02569580078125], [401.33868408203125, 418.2347106933594]],
      ['c', [401.33868408203125, 418.2347106933594], [401.0536804199219, 420.4436950683594], [400.0226745605469, 421.24371337890625], [397.8136901855469, 420.9587097167969]],
      ['c', [397.8136901855469, 420.9587097167969], [395.60467529296875, 420.6747131347656], [394.8056945800781, 419.64471435546875], [395.0896911621094, 417.4356994628906]],
      ['c', [395.0896911621094, 417.4356994628906], [395.37469482421875, 415.2267150878906], [396.4046936035156, 414.42669677734375], [398.61468505859375, 414.7117004394531]],
    ],
  },
  {
    pathIndex: 52330, sequenceNumber: 52330,
    controlBoundsPt: [387.8417053222656, 468.7936096191406, 394.6717224121094, 475.6106262207031],
    commands: [
      ['c', [391.6617126464844, 469.07861328125], [393.8717041015625, 469.3636169433594], [394.6717224121094, 470.3946228027344], [394.38671875, 472.6036071777344]],
      ['c', [394.38671875, 472.6036071777344], [394.1017150878906, 474.81060791015625], [393.0707092285156, 475.6106262207031], [390.8487243652344, 475.32562255859375]],
      ['c', [390.8487243652344, 475.32562255859375], [388.6407165527344, 475.0416259765625], [387.8417053222656, 474.0126037597656], [388.1257019042969, 471.8036193847656]],
      ['c', [388.1257019042969, 471.8036193847656], [388.41070556640625, 469.5936279296875], [389.4397277832031, 468.7936096191406], [391.6617126464844, 469.07861328125]],
    ],
  },
  {
    pathIndex: 52368, sequenceNumber: 52368,
    controlBoundsPt: [339.23248291015625, 408.72259521484375, 344.7074890136719, 414.19659423828125],
    commands: [
      ['c', [344.0434875488281, 411.4595947265625], [344.0434875488281, 410.00958251953125], [343.4474792480469, 409.4136047363281], [341.99749755859375, 409.4136047363281]],
      ['c', [341.99749755859375, 409.4136047363281], [340.5474853515625, 409.4136047363281], [339.95147705078125, 410.00958251953125], [339.95147705078125, 411.4595947265625]],
      ['c', [339.95147705078125, 411.4595947265625], [339.95147705078125, 412.90960693359375], [340.5474853515625, 413.5055847167969], [341.99749755859375, 413.5055847167969]],
      ['c', [341.99749755859375, 413.5055847167969], [343.4474792480469, 413.5055847167969], [344.0434875488281, 412.90960693359375], [344.0434875488281, 411.4595947265625]],
      ['c', [342.6344909667969, 409.1825866699219], [344.2334899902344, 409.6575927734375], [344.7074890136719, 410.5105895996094], [344.2334899902344, 412.12359619140625]],
      ['c', [344.2334899902344, 412.12359619140625], [343.75848388671875, 413.72259521484375], [342.9054870605469, 414.19659423828125], [341.3064880371094, 413.72259521484375]],
      ['c', [341.3064880371094, 413.72259521484375], [339.6934814453125, 413.2615966796875], [339.23248291015625, 412.39459228515625], [339.6934814453125, 410.79559326171875]],
      ['c', [339.6934814453125, 410.79559326171875], [340.16748046875, 409.1825866699219], [341.0224914550781, 408.72259521484375], [342.6344909667969, 409.1825866699219]],
    ],
  },
  {
    pathIndex: 52369, sequenceNumber: 52369,
    controlBoundsPt: [339.9515075683594, 409.4130859375, 344.0434875488281, 413.5050964355469],
    commands: [
      ['c', [341.99749755859375, 409.4130859375], [343.4465026855469, 409.4130859375], [344.0434875488281, 410.00909423828125], [344.0434875488281, 411.4590759277344]],
      ['c', [344.0434875488281, 411.4590759277344], [344.0434875488281, 412.9090881347656], [343.4465026855469, 413.5050964355469], [341.99749755859375, 413.5050964355469]],
      ['c', [341.99749755859375, 413.5050964355469], [340.5474853515625, 413.5050964355469], [339.9515075683594, 412.9090881347656], [339.9515075683594, 411.4590759277344]],
      ['c', [339.9515075683594, 411.4590759277344], [339.9515075683594, 410.00909423828125], [340.5474853515625, 409.4130859375], [341.99749755859375, 409.4130859375]],
    ],
  },
  {
    pathIndex: 52372, sequenceNumber: 52372,
    controlBoundsPt: [331.57501220703125, 468.65869140625, 337.04998779296875, 474.13470458984375],
    commands: [
      ['c', [336.4010009765625, 471.39569091796875], [336.4010009765625, 469.9466857910156], [335.80499267578125, 469.3497009277344], [334.3529968261719, 469.3497009277344]],
      ['c', [334.3529968261719, 469.3497009277344], [332.9049987792969, 469.3497009277344], [332.3070068359375, 469.9466857910156], [332.3070068359375, 471.39569091796875]],
      ['c', [332.3070068359375, 471.39569091796875], [332.3070068359375, 472.845703125], [332.9049987792969, 473.4566955566406], [334.3529968261719, 473.4566955566406]],
      ['c', [334.3529968261719, 473.4566955566406], [335.80499267578125, 473.4566955566406], [336.4010009765625, 472.845703125], [336.4010009765625, 471.39569091796875]],
      ['c', [334.97698974609375, 469.1326904296875], [336.59100341796875, 469.60870361328125], [337.04998779296875, 470.4617004394531], [336.59100341796875, 472.0596923828125]],
      ['c', [336.59100341796875, 472.0596923828125], [336.1159973144531, 473.6737060546875], [335.26300048828125, 474.13470458984375], [333.6499938964844, 473.6737060546875]],
      ['c', [333.6499938964844, 473.6737060546875], [332.0509948730469, 473.19769287109375], [331.57501220703125, 472.3446960449219], [332.0509948730469, 470.7326965332031]],
      ['c', [332.0509948730469, 470.7326965332031], [332.5249938964844, 469.1326904296875], [333.3789978027344, 468.65869140625], [334.97698974609375, 469.1326904296875]],
    ],
  },
  {
    pathIndex: 52374, sequenceNumber: 52374,
    controlBoundsPt: [332.30780029296875, 469.34991455078125, 336.40179443359375, 473.4559020996094],
    commands: [
      ['c', [334.3537902832031, 469.34991455078125], [335.8038024902344, 469.34991455078125], [336.40179443359375, 469.9459228515625], [336.40179443359375, 471.3959045410156]],
      ['c', [336.40179443359375, 471.3959045410156], [336.40179443359375, 472.8459167480469], [335.8038024902344, 473.4559020996094], [334.3537902832031, 473.4559020996094]],
      ['c', [334.3537902832031, 473.4559020996094], [332.90478515625, 473.4559020996094], [332.30780029296875, 472.8459167480469], [332.30780029296875, 471.3959045410156]],
      ['c', [332.30780029296875, 471.3959045410156], [332.30780029296875, 469.9459228515625], [332.90478515625, 469.34991455078125], [334.3537902832031, 469.34991455078125]],
    ],
  },
  {
    pathIndex: 52402, sequenceNumber: 52402,
    controlBoundsPt: [282.9956970214844, 401.51312255859375, 288.4696960449219, 406.98712158203125],
    commands: [
      ['c', [286.3966979980469, 401.98712158203125], [287.9956970214844, 402.4481201171875], [288.4696960449219, 403.31512451171875], [287.9956970214844, 404.91412353515625]],
      ['c', [287.9956970214844, 404.91412353515625], [287.5216979980469, 406.51312255859375], [286.6676940917969, 406.98712158203125], [285.0697021484375, 406.51312255859375]],
      ['c', [285.0697021484375, 406.51312255859375], [283.4556884765625, 406.0521240234375], [282.9956970214844, 405.18511962890625], [283.4556884765625, 403.58612060546875]],
      ['c', [283.4556884765625, 403.58612060546875], [283.9306945800781, 401.98712158203125], [284.78570556640625, 401.51312255859375], [286.3966979980469, 401.98712158203125]],
    ],
  },
  {
    pathIndex: 52406, sequenceNumber: 52406,
    controlBoundsPt: [274.3891906738281, 468.6588134765625, 279.86419677734375, 474.1328125],
    commands: [
      ['c', [277.7922058105469, 469.1328125], [279.3912048339844, 469.60882568359375], [279.86419677734375, 470.4608154296875], [279.3912048339844, 472.059814453125]],
      ['c', [279.3912048339844, 472.059814453125], [278.9172058105469, 473.6737976074219], [278.06219482421875, 474.1328125], [276.4642028808594, 473.6737976074219]],
      ['c', [276.4642028808594, 473.6737976074219], [274.8511962890625, 473.19781494140625], [274.3891906738281, 472.3448181152344], [274.8511962890625, 470.7328186035156]],
      ['c', [274.8511962890625, 470.7328186035156], [275.3262023925781, 469.1328125], [276.17919921875, 468.6588134765625], [277.7922058105469, 469.1328125]],
    ],
  },
  {
    pathIndex: 52419, sequenceNumber: 52419,
    controlBoundsPt: [246.89390563964844, 273.2785949707031, 252.36891174316406, 278.7525939941406],
    commands: [
      ['c', [250.29690551757812, 273.7525939941406], [251.89590454101562, 274.2135925292969], [252.36891174316406, 275.0805969238281], [251.89590454101562, 276.6795959472656]],
      ['c', [251.89590454101562, 276.6795959472656], [251.42190551757812, 278.2926025390625], [250.56790161132812, 278.7525939941406], [248.96890258789062, 278.2926025390625]],
      ['c', [248.96890258789062, 278.2926025390625], [247.3559112548828, 277.8175964355469], [246.89390563964844, 276.964599609375], [247.3559112548828, 275.3515930175781]],
      ['c', [247.3559112548828, 275.3515930175781], [247.83090209960938, 273.7525939941406], [248.68389892578125, 273.2785949707031], [250.29690551757812, 273.7525939941406]],
    ],
  },
  {
    pathIndex: 52428, sequenceNumber: 52428,
    controlBoundsPt: [231.75759887695312, 354.9105224609375, 237.24659729003906, 360.384521484375],
    commands: [
      ['c', [235.17359924316406, 355.384521484375], [236.77259826660156, 355.84552001953125], [237.24659729003906, 356.7125244140625], [236.77259826660156, 358.3115234375]],
      ['c', [236.77259826660156, 358.3115234375], [236.29859924316406, 359.9245300292969], [235.44459533691406, 360.384521484375], [233.84559631347656, 359.9245300292969]],
      ['c', [233.84559631347656, 359.9245300292969], [232.23260498046875, 359.44952392578125], [231.75759887695312, 358.5965270996094], [232.23260498046875, 356.9835205078125]],
      ['c', [232.23260498046875, 356.9835205078125], [232.7075958251953, 355.384521484375], [233.5605926513672, 354.9105224609375], [235.17359924316406, 355.384521484375]],
    ],
  },
  {
    pathIndex: 52429, sequenceNumber: 52429,
    controlBoundsPt: [226.71730041503906, 394.3041076660156, 232.19129943847656, 399.7781066894531],
    commands: [
      ['c', [230.11830139160156, 394.7781066894531], [231.7183074951172, 395.2391052246094], [232.19129943847656, 396.1061096191406], [231.7183074951172, 397.7051086425781]],
      ['c', [231.7183074951172, 397.7051086425781], [231.25830078125, 399.3041076660156], [230.38929748535156, 399.7781066894531], [228.7913055419922, 399.3041076660156]],
      ['c', [228.7913055419922, 399.3041076660156], [227.1923065185547, 398.8431091308594], [226.71730041503906, 397.9761047363281], [227.1923065185547, 396.3771057128906]],
      ['c', [227.1923065185547, 396.3771057128906], [227.65330505371094, 394.7781066894531], [228.51930236816406, 394.3041076660156], [230.11830139160156, 394.7781066894531]],
    ],
  },
  {
    pathIndex: 52436, sequenceNumber: 52436,
    controlBoundsPt: [217.58290100097656, 465.58209228515625, 223.0579071044922, 471.0570983886719],
    commands: [
      ['c', [220.98590087890625, 466.0440979003906], [222.58489990234375, 466.5180969238281], [223.0579071044922, 467.37109375], [222.58489990234375, 468.985107421875]],
      ['c', [222.58489990234375, 468.985107421875], [222.1239013671875, 470.5841064453125], [221.2559051513672, 471.0570983886719], [219.65789794921875, 470.5841064453125]],
      ['c', [219.65789794921875, 470.5841064453125], [218.05889892578125, 470.12310791015625], [217.58290100097656, 469.25408935546875], [218.05889892578125, 467.65509033203125]],
      ['c', [218.05889892578125, 467.65509033203125], [218.5198974609375, 466.0440979003906], [219.38589477539062, 465.58209228515625], [220.98590087890625, 466.0440979003906]],
    ],
  },
  {
    pathIndex: 52452, sequenceNumber: 52452,
    controlBoundsPt: [202.24459838867188, 306.0044860839844, 207.71859741210938, 311.4784851074219],
    commands: [
      ['c', [205.64559936523438, 306.4784851074219], [207.256591796875, 306.9524841308594], [207.71859741210938, 307.8064880371094], [207.256591796875, 309.4054870605469]],
      ['c', [207.256591796875, 309.4054870605469], [206.78359985351562, 311.01849365234375], [205.93060302734375, 311.4784851074219], [204.31759643554688, 311.01849365234375]],
      ['c', [204.31759643554688, 311.01849365234375], [202.71859741210938, 310.5434875488281], [202.24459838867188, 309.69049072265625], [202.71859741210938, 308.0774841308594]],
      ['c', [202.71859741210938, 308.0774841308594], [203.17959594726562, 306.4784851074219], [204.04660034179688, 306.0044860839844], [205.64559936523438, 306.4784851074219]],
    ],
  },
  {
    pathIndex: 52455, sequenceNumber: 52455,
    controlBoundsPt: [190.45480346679688, 346.27801513671875, 195.94281005859375, 351.7530212402344],
    commands: [
      ['c', [193.85580444335938, 346.739013671875], [195.46881103515625, 347.2130126953125], [195.94281005859375, 348.0810241699219], [195.46881103515625, 349.6800231933594]],
      ['c', [195.46881103515625, 349.6800231933594], [194.99380493164062, 351.2790222167969], [194.14080810546875, 351.7530212402344], [192.52880859375, 351.2790222167969]],
      ['c', [192.52880859375, 351.2790222167969], [190.92880249023438, 350.8180236816406], [190.45480346679688, 349.9510192871094], [190.92880249023438, 348.3520202636719]],
      ['c', [190.92880249023438, 348.3520202636719], [191.40280151367188, 346.7530212402344], [192.25680541992188, 346.27801513671875], [193.85580444335938, 346.739013671875]],
    ],
  },
  {
    pathIndex: 52458, sequenceNumber: 52458,
    controlBoundsPt: [179.3009033203125, 384.3843078613281, 184.77590942382812, 389.872314453125],
    commands: [
      ['c', [182.7039031982422, 384.8583068847656], [184.3148956298828, 385.3323059082031], [184.77590942382812, 386.1863098144531], [184.3148956298828, 387.7853088378906]],
      ['c', [184.3148956298828, 387.7853088378906], [183.84190368652344, 389.3983154296875], [182.98890686035156, 389.872314453125], [181.3759002685547, 389.3983154296875]],
      ['c', [181.3759002685547, 389.3983154296875], [179.7769012451172, 388.9233093261719], [179.3009033203125, 388.0703125], [179.7769012451172, 386.4573059082031]],
      ['c', [179.7769012451172, 386.4573059082031], [180.23789978027344, 384.8583068847656], [181.10389709472656, 384.3843078613281], [182.7039031982422, 384.8583068847656]],
    ],
  },
  {
    pathIndex: 52464, sequenceNumber: 52464,
    controlBoundsPt: [159.11050415039062, 453.35931396484375, 164.59849548339844, 458.8343200683594],
    commands: [
      ['c', [162.52549743652344, 453.8203125], [164.12550354003906, 454.2943115234375], [164.59849548339844, 455.1483154296875], [164.12550354003906, 456.7613220214844]],
      ['c', [164.12550354003906, 456.7613220214844], [163.65049743652344, 458.3603210449219], [162.79649353027344, 458.8343200683594], [161.19850158691406, 458.3603210449219]],
      ['c', [161.19850158691406, 458.3603210449219], [159.58450317382812, 457.8993225097656], [159.11050415039062, 457.0323181152344], [159.58450317382812, 455.4333190917969]],
      ['c', [159.58450317382812, 455.4333190917969], [160.0605010986328, 453.8203125], [160.9145050048828, 453.35931396484375], [162.52549743652344, 453.8203125]],
    ],
  },
  {
    pathIndex: 52468, sequenceNumber: 52468,
    controlBoundsPt: [151.01950073242188, 331.27728271484375, 156.4945068359375, 336.75128173828125],
    commands: [
      ['c', [154.42250061035156, 331.75128173828125], [156.02149963378906, 332.2122802734375], [156.4945068359375, 333.07928466796875], [156.02149963378906, 334.67828369140625]],
      ['c', [156.02149963378906, 334.67828369140625], [155.5605010986328, 336.27728271484375], [154.69349670410156, 336.75128173828125], [153.09449768066406, 336.27728271484375]],
      ['c', [153.09449768066406, 336.27728271484375], [151.48150634765625, 335.8162841796875], [151.01950073242188, 334.94927978515625], [151.48150634765625, 333.35028076171875]],
      ['c', [151.48150634765625, 333.35028076171875], [151.9564971923828, 331.75128173828125], [152.8094940185547, 331.27728271484375], [154.42250061035156, 331.75128173828125]],
    ],
  },
  {
    pathIndex: 52475, sequenceNumber: 52475,
    controlBoundsPt: [134.02830505371094, 367.1737976074219, 139.50131225585938, 372.6488037109375],
    commands: [
      ['c', [137.42930603027344, 367.6347961425781], [139.04029846191406, 368.1087951660156], [139.50131225585938, 368.9627990722656], [139.04029846191406, 370.5758056640625]],
      ['c', [139.04029846191406, 370.5758056640625], [138.5673065185547, 372.1748046875], [137.7143096923828, 372.6488037109375], [136.10130310058594, 372.1748046875]],
      ['c', [136.10130310058594, 372.1748046875], [134.50230407714844, 371.71380615234375], [134.02830505371094, 370.8468017578125], [134.50230407714844, 369.247802734375]],
      ['c', [134.50230407714844, 369.247802734375], [134.9633026123047, 367.6347961425781], [135.8292999267578, 367.1737976074219], [137.42930603027344, 367.6347961425781]],
    ],
  },
  {
    pathIndex: 52480, sequenceNumber: 52480,
    controlBoundsPt: [114.41790008544922, 310.5442810058594, 119.83889770507812, 315.62628173828125],
    commands: [
      ['c', [117.76689910888672, 310.84228515625], [119.36589813232422, 311.30328369140625], [119.83889770507812, 312.1702880859375], [119.36589813232422, 313.769287109375]],
      ['c', [119.36589813232422, 313.769287109375], [119.2698974609375, 314.0672912597656], [119.17489624023438, 314.3382873535156], [119.05290222167969, 314.5552978515625]],
      ['c', [119.05290222167969, 314.5552978515625], [119.01390075683594, 314.6502990722656], [118.95890045166016, 314.7312927246094], [118.90489959716797, 314.7992858886719]],
      ['c', [118.90489959716797, 314.7992858886719], [118.38990020751953, 315.477294921875], [117.62989807128906, 315.62628173828125], [116.4928970336914, 315.28729248046875]],
      ['c', [116.4928970336914, 315.28729248046875], [114.87889862060547, 314.8262939453125], [114.41790008544922, 313.95928955078125], [114.87889862060547, 312.36029052734375]],
      ['c', [114.87889862060547, 312.36029052734375], [114.9738998413086, 312.04827880859375], [115.06990051269531, 311.7912902832031], [115.19190216064453, 311.57427978515625]],
      ['c', [115.19190216064453, 311.57427978515625], [115.24589538574219, 311.46527099609375], [115.31289672851562, 311.37127685546875], [115.36689758300781, 311.2892761230469]],
      ['c', [115.36689758300781, 311.2892761230469], [115.42289733886719, 311.2212829589844], [115.48889923095703, 311.154296875], [115.54290008544922, 311.0992736816406]],
      ['c', [115.54290008544922, 311.0992736816406], [116.05789947509766, 310.6252746582031], [116.76390075683594, 310.5442810058594], [117.76689910888672, 310.84228515625]],
    ],
  },
  {
    pathIndex: 52484, sequenceNumber: 52484,
    controlBoundsPt: [103.29339599609375, 432.125, 108.76739501953125, 437.5989990234375],
    commands: [
      ['c', [106.69439697265625, 432.5989990234375], [108.29439544677734, 433.05999755859375], [108.76739501953125, 433.927001953125], [108.29439544677734, 435.5260009765625]],
      ['c', [108.29439544677734, 435.5260009765625], [107.81939697265625, 437.125], [106.96540069580078, 437.5989990234375], [105.36739349365234, 437.125]],
      ['c', [105.36739349365234, 437.125], [103.7533950805664, 436.66400146484375], [103.29339599609375, 435.7969970703125], [103.7533950805664, 434.1990051269531]],
      ['c', [103.7533950805664, 434.1990051269531], [104.22940063476562, 432.5989990234375], [105.0833969116211, 432.125], [106.69439697265625, 432.5989990234375]],
    ],
  },
  {
    pathIndex: 52508, sequenceNumber: 52508,
    controlBoundsPt: [54.278499603271484, 312.68548583984375, 59.76649856567383, 318.1734924316406],
    commands: [
      ['c', [57.69449996948242, 313.15948486328125], [59.29349899291992, 313.63348388671875], [59.76649856567383, 314.48748779296875], [59.29349899291992, 316.08648681640625]],
      ['c', [59.29349899291992, 316.08648681640625], [58.81949996948242, 317.6994934082031], [57.964500427246094, 318.1734924316406], [56.36650085449219, 317.6994934082031]],
      ['c', [56.36650085449219, 317.6994934082031], [54.753501892089844, 317.2244873046875], [54.278499603271484, 316.3714904785156], [54.753501892089844, 314.75848388671875]],
      ['c', [54.753501892089844, 314.75848388671875], [55.22850036621094, 313.15948486328125], [56.08150100708008, 312.68548583984375], [57.69449996948242, 313.15948486328125]],
    ],
  },
  {
    pathIndex: 52511, sequenceNumber: 52511,
    controlBoundsPt: [51.47270202636719, 402.40771484375, 56.94770050048828, 407.8817138671875],
    commands: [
      ['c', [54.875701904296875, 402.8817138671875], [56.474700927734375, 403.34271240234375], [56.94770050048828, 404.209716796875], [56.474700927734375, 405.8087158203125]],
      ['c', [56.474700927734375, 405.8087158203125], [56.013702392578125, 407.4217224121094], [55.14570236206055, 407.8817138671875], [53.54770278930664, 407.4217224121094]],
      ['c', [53.54770278930664, 407.4217224121094], [51.948699951171875, 406.94671630859375], [51.47270202636719, 406.0937194824219], [51.948699951171875, 404.480712890625]],
      ['c', [51.948699951171875, 404.480712890625], [52.40970230102539, 402.8817138671875], [53.27570343017578, 402.40771484375], [54.875701904296875, 402.8817138671875]],
    ],
  },
  {
    pathIndex: 52550, sequenceNumber: 52550,
    controlBoundsPt: [4.993200302124023, 364.965087890625, 10.46720027923584, 370.4400939941406],
    commands: [
      ['c', [8.394200325012207, 365.42608642578125], [10.007200241088867, 365.90008544921875], [10.46720027923584, 366.75408935546875], [10.007200241088867, 368.3670959472656]],
      ['c', [10.007200241088867, 368.3670959472656], [9.534200668334961, 369.9660949707031], [8.680200576782227, 370.4400939941406], [7.067200183868408, 369.9660949707031]],
      ['c', [7.067200183868408, 369.9660949707031], [5.468200206756592, 369.4910888671875], [4.993200302124023, 368.6380920410156], [5.468200206756592, 367.0390930175781]],
      ['c', [5.468200206756592, 367.0390930175781], [5.929200172424316, 365.42608642578125], [6.795200347900391, 364.965087890625], [8.394200325012207, 365.42608642578125]],
    ],
  },
  {
    pathIndex: 52583, sequenceNumber: 52583,
    controlBoundsPt: [-33.3828010559082, 322.90228271484375, -27.894800186157227, 328.3772888183594],
    commands: [
      ['c', [-29.981800079345703, 323.36328125], [-28.370800018310547, 323.8372802734375], [-27.894800186157227, 324.6912841796875], [-28.370800018310547, 326.3042907714844]],
      ['c', [-28.370800018310547, 326.3042907714844], [-28.843799591064453, 327.9032897949219], [-29.696800231933594, 328.3772888183594], [-31.309799194335938, 327.9032897949219]],
      ['c', [-31.309799194335938, 327.9032897949219], [-32.90879821777344, 327.42828369140625], [-33.3828010559082, 326.5752868652344], [-32.90879821777344, 324.9762878417969]],
      ['c', [-32.90879821777344, 324.9762878417969], [-32.43579864501953, 323.36328125], [-31.58180046081543, 322.90228271484375], [-29.981800079345703, 323.36328125]],
    ],
  },
] as const satisfies readonly GroundColumnDiagramSourcePath[];
/* eslint-enable no-loss-of-precision */
