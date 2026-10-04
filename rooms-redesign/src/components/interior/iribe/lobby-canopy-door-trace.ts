/**
 * East canopy lobby doors, UMD / HDR Ground guide, original PDF page index 6.
 * SOURCE DATA ONLY: all points retain original PyMuPDF floating-point values.
 * Origin top-left, +X right, +Y down; units are PDF pt, not building dimensions.
 * Apply groundGuidePlan to every point in a consumer, including cubic controls.
 * Native baseline, hinge/leaf origins and jamb strokes stay distinct; no snapping.
 * The upper pair is recovered from vectors behind the yellow callout.
 * See docs/research/iribe/lobby-canopy-doors-2026-10-03.md for interpretation limits.
 */

export type LobbyCanopyPdfPoint = readonly [pdfX: number, pdfY: number];
export type LobbyCanopyPdfLine = readonly [from: LobbyCanopyPdfPoint, to: LobbyCanopyPdfPoint];
export type LobbyCanopySourceCommand =
  | readonly ['l', from: LobbyCanopyPdfPoint, to: LobbyCanopyPdfPoint]
  | readonly [
      'c', from: LobbyCanopyPdfPoint, control1: LobbyCanopyPdfPoint,
      control2: LobbyCanopyPdfPoint, to: LobbyCanopyPdfPoint,
    ];

export interface LobbyCanopySourceItemRef {
  /** Zero-based index in ORIGINAL guide[6].get_drawings(), never replay indices. */
  readonly pathIndex: number;
  /** Zero-based index in that original path's items array. */
  readonly itemIndex: number;
}
export interface LobbyCanopySourceItem {
  readonly itemIndex: number;
  readonly command: LobbyCanopySourceCommand;
}
export type LobbyCanopySourceStyleId =
  | 'threshold-baseline' | 'door-symbol' | 'glazing-edge' | 'jamb-fill' | 'jamb-edge';
type LobbyCanopySourceRgb = readonly [r: number, g: number, b: number];
/** Verbatim get_drawings() paint fields; null means not applicable in the source. */
export interface LobbyCanopySourceStyle {
  readonly type: 's' | 'f';
  readonly color: LobbyCanopySourceRgb | null;
  readonly fill: LobbyCanopySourceRgb | null;
  readonly width: number | null;
  readonly closePath: boolean;
  readonly even_odd: boolean | null;
  readonly lineCap: readonly [number, number, number] | null;
  readonly lineJoin: number | null;
  readonly dashes: string | null;
  readonly stroke_opacity: number | null;
  readonly fill_opacity: number | null;
}
export interface LobbyCanopySourcePath {
  readonly pathIndex: number;
  /** Original paint sequence number; it is NOT always the drawing array index. */
  readonly seqno: number;
  readonly style: LobbyCanopySourceStyleId;
  readonly items: readonly LobbyCanopySourceItem[];
}
export type LobbyCanopyJambId = 'jamb-0' | 'jamb-1' | 'jamb-2' | 'jamb-3';
export interface LobbyCanopyJamb {
  /** Ordered by increasing page Y; middle jambs serve adjacent pairs. */
  readonly id: LobbyCanopyJambId;
  /** Includes the tiny native fill fragment 52354 on jamb-1. */
  readonly fillSourcePathIndices: readonly number[];
  readonly pageUpperFace: LobbyCanopySourceItemRef;
  readonly pageLowerFace: LobbyCanopySourceItemRef;
  readonly canopyFace: LobbyCanopySourceItemRef;
  readonly lobbyFace: LobbyCanopySourceItemRef;
}
export interface LobbyCanopyDoorLeaf {
  readonly id: string;
  readonly hingeJambId: LobbyCanopyJambId;
  /** Exact openLeafEdge FROM point, interpreted as the plan symbol's hinge. */
  readonly hinge: LobbyCanopyPdfPoint;
  /** Exact openLeafEdge TO point. */
  readonly openTip: LobbyCanopyPdfPoint;
  /** Opposite endpoint of swingCurve to its open tip; NOT an inferred midpoint. */
  readonly closedTip: LobbyCanopyPdfPoint;
  readonly openLeafEdge: LobbyCanopySourceItemRef;
  /** Original cubic, not a replacement circular arc. */
  readonly swingCurve: LobbyCanopySourceItemRef;
  readonly closedTipSourceEndpoint: 'from' | 'to';
}
export interface LobbyCanopyDoorPair {
  readonly id: 'page-upper' | 'page-middle' | 'page-lower';
  readonly pageUpperJambId: LobbyCanopyJambId;
  readonly pageLowerJambId: LobbyCanopyJambId;
  readonly threshold: {
    readonly sourceItem: LobbyCanopySourceItemRef;
    /** Native pale threshold/facade baseline; not a manufactured sill outline. */
    readonly baseline: LobbyCanopyPdfLine;
  };
  readonly leaves: readonly [LobbyCanopyDoorLeaf, LobbyCanopyDoorLeaf];
  readonly pageVisibility: 'partly-obscured-recovered-from-vectors' | 'visible-on-page';
  readonly swingInterpretation: 'outward-to-canopy';
}
export interface LobbyCanopyFlankingGlazing {
  readonly id: 'page-upper' | 'page-lower';
  readonly baseline: LobbyCanopySourceItemRef;
  /** Four native edge strokes of the adjacent glazing panel, retained for jamb context. */
  readonly edgeSourceItems: readonly LobbyCanopySourceItemRef[];
}

export const LOBBY_CANOPY_DOOR_SOURCE = {
  url: 'https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf',
  pdfSha256: 'c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474',
  pageIndex: 6,
  pageWidthPt: 576,
  pageHeightPt: 576,
  coordinateOrigin: 'top-left',
  xDirection: 'right',
  yDirection: 'down',
  coordinateUnit: 'pdf-pt',
  coordinateTreatment: 'unchanged-source-float',
  extractionApi: 'PyMuPDF Page.get_drawings()',
  extractionVersion: '1.28.2',
  originalPageDrawingCount: 56651,
  requestedBoundsPt: [347, 393, 389, 466],
  inspectedBoundsPt: [340, 385, 398, 474],
  /** Replayed at original coordinates while omitting only these colored paths. */
  occludingAnnotationPathIndices: [56645, 56646, 56647],
  registrationConsumer: 'groundGuidePlan',
  hingeInterpretation: 'open-leaf-edge-origin',
  closedLeafEdgeIsDrawn: false,
  physicalDimensionsEstablished: false,
} as const;

export const LOBBY_CANOPY_DOOR_SOURCE_STYLES = {
  'threshold-baseline': {
    type: "s",
    color: [0.6000000238418579, 0.6000000238418579, 0.6000000238418579],
    fill: null,
    width: 0.06800000369548798,
    closePath: false,
    even_odd: null,
    lineCap: [1, 1, 1],
    lineJoin: 1.0,
    dashes: "[] 0",
    stroke_opacity: 1.0,
    fill_opacity: null,
  },
  'door-symbol': {
    type: "s",
    color: [0.3019913136959076, 0.3019913136959076, 0.3019913136959076],
    fill: null,
    width: 0.10199999809265137,
    closePath: false,
    even_odd: null,
    lineCap: [1, 1, 1],
    lineJoin: 1.0,
    dashes: "[] 0",
    stroke_opacity: 1.0,
    fill_opacity: null,
  },
  'glazing-edge': {
    type: "s",
    color: [0.3019913136959076, 0.3019913136959076, 0.3019913136959076],
    fill: null,
    width: 0.06800000369548798,
    closePath: false,
    even_odd: null,
    lineCap: [1, 1, 1],
    lineJoin: 1.0,
    dashes: "[] 0",
    stroke_opacity: 1.0,
    fill_opacity: null,
  },
  'jamb-fill': {
    type: "f",
    color: null,
    fill: [0.0, 0.0, 0.0],
    width: null,
    closePath: false,
    even_odd: false,
    lineCap: null,
    lineJoin: null,
    dashes: null,
    stroke_opacity: null,
    fill_opacity: 1.0,
  },
  'jamb-edge': {
    type: "s",
    color: [0.0, 0.0, 0.0],
    fill: null,
    width: 0.06800000369548798,
    closePath: false,
    even_odd: null,
    lineCap: [1, 1, 1],
    lineJoin: 1.0,
    dashes: "[] 0",
    stroke_opacity: 1.0,
    fill_opacity: null,
  },
} as const satisfies Readonly<Record<LobbyCanopySourceStyleId, LobbyCanopySourceStyle>>;

/** Complete original commands for selected paths, in original drawing order. */
export const LOBBY_CANOPY_DOOR_SOURCE_PATHS: readonly LobbyCanopySourcePath[] = [
  { pathIndex: 13432, seqno: 13432, style: 'threshold-baseline', items: [
    { itemIndex: 0, command: ["l", [372.9307861328125, 415.50250244140625], [369.99578857421875, 425.1214904785156]] },
  ] },
  { pathIndex: 13433, seqno: 13433, style: 'threshold-baseline', items: [
    { itemIndex: 0, command: ["l", [369.8937072753906, 425.5758972167969], [366.3497009277344, 437.1148986816406]] },
  ] },
  { pathIndex: 13434, seqno: 13434, style: 'threshold-baseline', items: [
    { itemIndex: 0, command: ["l", [366.1990051269531, 437.57080078125], [362.7070007324219, 449.1628112792969]] },
  ] },
  { pathIndex: 13435, seqno: 13435, style: 'threshold-baseline', items: [
    { itemIndex: 0, command: ["l", [362.55450439453125, 449.6171875], [359.0625, 461.2091979980469]] },
  ] },
  { pathIndex: 13436, seqno: 13436, style: 'threshold-baseline', items: [
    { itemIndex: 0, command: ["l", [358.9100036621094, 461.6134948730469], [355.9750061035156, 471.2304992675781]] },
  ] },
  { pathIndex: 48825, seqno: 48825, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [368.2475891113281, 431.572021484375], [372.3235778808594, 432.81201171875], [374.527587890625, 431.63702392578125], [375.7666015625, 427.56103515625]] },
  ] },
  { pathIndex: 48826, seqno: 48826, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [372.2585144042969, 439.0899963378906], [373.4985046386719, 435.0140075683594], [372.3235168457031, 432.81201171875], [368.2475280761719, 431.5719909667969]] },
  ] },
  { pathIndex: 48827, seqno: 48827, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [370.0022888183594, 425.8074035644531], [375.7673034667969, 427.5614013671875]] },
  ] },
  { pathIndex: 48828, seqno: 48828, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [366.4939880371094, 437.3352966308594], [372.2590026855469, 439.0903015136719]] },
  ] },
  { pathIndex: 48834, seqno: 48834, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [364.601806640625, 443.55499267578125], [368.6798095703125, 444.7959899902344], [370.8828125, 443.6210021972656], [372.122802734375, 439.5429992675781]] },
  ] },
  { pathIndex: 48876, seqno: 48876, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [359.19970703125, 461.3065185546875], [364.9656982421875, 463.0625305175781]] },
  ] },
  { pathIndex: 48877, seqno: 48877, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [362.70928955078125, 449.77349853515625], [368.47528076171875, 451.52850341796875]] },
  ] },
  { pathIndex: 48878, seqno: 48878, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [364.9656066894531, 463.0625], [366.20660400390625, 458.9834899902344], [365.0316162109375, 456.781494140625], [360.9546203613281, 455.5404968261719]] },
  ] },
  { pathIndex: 48879, seqno: 48879, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [360.9547119140625, 455.54058837890625], [365.0317077636719, 456.7815856933594], [367.2357177734375, 455.6065979003906], [368.4757080078125, 451.5285949707031]] },
  ] },
  { pathIndex: 48880, seqno: 48880, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [362.8468933105469, 449.32220458984375], [368.6128845214844, 451.07720947265625]] },
  ] },
  { pathIndex: 48881, seqno: 48881, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [366.35650634765625, 437.78790283203125], [372.12249755859375, 439.54290771484375]] },
  ] },
  { pathIndex: 48882, seqno: 48882, style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [368.61279296875, 451.0769958496094], [369.8537902832031, 446.99798583984375], [368.6788024902344, 444.7959899902344], [364.601806640625, 443.55499267578125]] },
  ] },
  { pathIndex: 49166, seqno: 49166, style: 'glazing-edge', items: [
    { itemIndex: 0, command: ["l", [370.45098876953125, 425.44891357421875], [373.3559875488281, 415.9049072265625]] },
  ] },
  { pathIndex: 49167, seqno: 49167, style: 'glazing-edge', items: [
    { itemIndex: 0, command: ["l", [373.355712890625, 415.90411376953125], [372.959716796875, 415.7831115722656]] },
  ] },
  { pathIndex: 49168, seqno: 49168, style: 'glazing-edge', items: [
    { itemIndex: 0, command: ["l", [372.9599914550781, 415.7838134765625], [370.05499267578125, 425.32781982421875]] },
  ] },
  { pathIndex: 49169, seqno: 49169, style: 'glazing-edge', items: [
    { itemIndex: 0, command: ["l", [370.0552062988281, 425.3283996582031], [370.4512023925781, 425.44940185546875]] },
  ] },
  { pathIndex: 49280, seqno: 49280, style: 'glazing-edge', items: [
    { itemIndex: 0, command: ["l", [359.3731994628906, 461.85430908203125], [356.46820068359375, 471.3993225097656]] },
  ] },
  { pathIndex: 49281, seqno: 49281, style: 'glazing-edge', items: [
    { itemIndex: 0, command: ["l", [356.07269287109375, 471.279296875], [358.9776916503906, 461.7342834472656]] },
  ] },
  { pathIndex: 49282, seqno: 49282, style: 'glazing-edge', items: [
    { itemIndex: 0, command: ["l", [359.3731994628906, 461.85430908203125], [358.9772033691406, 461.7333068847656]] },
  ] },
  { pathIndex: 49283, seqno: 49283, style: 'glazing-edge', items: [
    { itemIndex: 0, command: ["l", [356.4684143066406, 471.3996887207031], [356.0724182128906, 471.2786865234375]] },
  ] },
  { pathIndex: 52350, seqno: 52350, style: 'jamb-fill', items: [
    { itemIndex: 0, command: ["l", [370.18359375, 425.3629150390625], [370.03460693359375, 425.82391357421875]] },
    { itemIndex: 1, command: ["l", [370.03460693359375, 425.82391357421875], [370.0075988769531, 425.8099060058594]] },
    { itemIndex: 2, command: ["l", [370.0075988769531, 425.8099060058594], [369.8175964355469, 425.75592041015625]] },
    { itemIndex: 3, command: ["l", [369.8175964355469, 425.75592041015625], [368.8695983886719, 425.4579162597656]] },
    { itemIndex: 4, command: ["l", [368.8695983886719, 425.4579162597656], [369.0046081542969, 425.01092529296875]] },
    { itemIndex: 5, command: ["l", [369.0046081542969, 425.01092529296875], [369.9665832519531, 425.294921875]] },
    { itemIndex: 6, command: ["l", [369.9665832519531, 425.294921875], [370.06158447265625, 425.3219299316406]] },
    { itemIndex: 7, command: ["l", [370.06158447265625, 425.3219299316406], [370.18359375, 425.3629150390625]] },
  ] },
  { pathIndex: 52353, seqno: 52353, style: 'jamb-fill', items: [
    { itemIndex: 0, command: ["l", [366.5245056152344, 437.3419189453125], [366.5245056152344, 437.3559265136719]] },
    { itemIndex: 1, command: ["l", [366.5245056152344, 437.3559265136719], [366.3885192871094, 437.7889099121094]] },
    { itemIndex: 2, command: ["l", [366.3885192871094, 437.7889099121094], [366.36151123046875, 437.7889099121094]] },
    { itemIndex: 3, command: ["l", [366.36151123046875, 437.7889099121094], [365.2235107421875, 437.4499206542969]] },
    { itemIndex: 4, command: ["l", [365.2235107421875, 437.4499206542969], [365.3605041503906, 436.98992919921875]] },
    { itemIndex: 5, command: ["l", [365.3605041503906, 436.98992919921875], [366.49749755859375, 437.3419189453125]] },
    { itemIndex: 6, command: ["l", [366.49749755859375, 437.3419189453125], [366.5245056152344, 437.3419189453125]] },
  ] },
  { pathIndex: 52354, seqno: 52354, style: 'jamb-fill', items: [
    { itemIndex: 0, command: ["l", [366.38958740234375, 437.7890930175781], [366.38958740234375, 437.8031005859375]] },
    { itemIndex: 1, command: ["l", [366.38958740234375, 437.8031005859375], [366.360595703125, 437.7890930175781]] },
    { itemIndex: 2, command: ["l", [366.360595703125, 437.7890930175781], [366.38958740234375, 437.7890930175781]] },
  ] },
  { pathIndex: 52357, seqno: 52357, style: 'jamb-fill', items: [
    { itemIndex: 0, command: ["l", [362.8522033691406, 449.3208923339844], [362.8802185058594, 449.3359069824219]] },
    { itemIndex: 1, command: ["l", [362.8802185058594, 449.3359069824219], [362.74420166015625, 449.78289794921875]] },
    { itemIndex: 2, command: ["l", [362.74420166015625, 449.78289794921875], [362.7041931152344, 449.76788330078125]] },
    { itemIndex: 3, command: ["l", [362.7041931152344, 449.76788330078125], [361.5791931152344, 449.42889404296875]] },
    { itemIndex: 4, command: ["l", [361.5791931152344, 449.42889404296875], [361.7142028808594, 448.9819030761719]] },
    { itemIndex: 5, command: ["l", [361.7142028808594, 448.9819030761719], [362.8522033691406, 449.3208923339844]] },
  ] },
  { pathIndex: 52360, seqno: 52360, style: 'jamb-fill', items: [
    { itemIndex: 0, command: ["l", [359.23419189453125, 461.31439208984375], [359.09820556640625, 461.775390625]] },
    { itemIndex: 1, command: ["l", [359.09820556640625, 461.775390625], [358.9781799316406, 461.7344055175781]] },
    { itemIndex: 2, command: ["l", [358.9781799316406, 461.7344055175781], [358.8822021484375, 461.7073974609375]] },
    { itemIndex: 3, command: ["l", [358.8822021484375, 461.7073974609375], [357.9331970214844, 461.40838623046875]] },
    { itemIndex: 4, command: ["l", [357.9331970214844, 461.40838623046875], [358.0691833496094, 460.96240234375]] },
    { itemIndex: 5, command: ["l", [358.0691833496094, 460.96240234375], [359.0171813964844, 461.24639892578125]] },
    { itemIndex: 6, command: ["l", [359.0171813964844, 461.24639892578125], [359.1932067871094, 461.3003845214844]] },
    { itemIndex: 7, command: ["l", [359.1932067871094, 461.3003845214844], [359.23419189453125, 461.31439208984375]] },
  ] },
  { pathIndex: 54588, seqno: 54590, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [357.9306945800781, 461.4150085449219], [359.09869384765625, 461.77099609375]] },
  ] },
  { pathIndex: 54589, seqno: 54591, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [359.2367858886719, 461.3183898925781], [359.0987854003906, 461.7713928222656]] },
  ] },
  { pathIndex: 54590, seqno: 54592, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [358.06829833984375, 460.96240234375], [359.2362976074219, 461.3183898925781]] },
  ] },
  { pathIndex: 54591, seqno: 54593, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [357.9306945800781, 461.4150085449219], [358.0686950683594, 460.9620056152344]] },
  ] },
  { pathIndex: 54592, seqno: 54594, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [361.5777893066406, 449.42938232421875], [362.74578857421875, 449.7853698730469]] },
  ] },
  { pathIndex: 54593, seqno: 54595, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [362.8840026855469, 449.3327941894531], [362.7460021972656, 449.7857971191406]] },
  ] },
  { pathIndex: 54594, seqno: 54596, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [361.71551513671875, 448.97808837890625], [362.8835144042969, 449.3330993652344]] },
  ] },
  { pathIndex: 54595, seqno: 54597, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [361.5777893066406, 449.42938232421875], [361.7157897949219, 448.9783935546875]] },
  ] },
  { pathIndex: 54596, seqno: 54598, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [366.53118896484375, 437.3471984863281], [365.3631896972656, 436.9912109375]] },
  ] },
  { pathIndex: 54597, seqno: 54599, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [366.3935852050781, 437.7996826171875], [366.5315856933594, 437.3466796875]] },
  ] },
  { pathIndex: 54598, seqno: 54600, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [365.2250061035156, 437.44378662109375], [366.39300537109375, 437.7997741699219]] },
  ] },
  { pathIndex: 54599, seqno: 54601, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [365.36260986328125, 436.9912109375], [365.224609375, 437.4442138671875]] },
  ] },
  { pathIndex: 54600, seqno: 54602, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [370.177001953125, 425.3668212890625], [369.0090026855469, 425.0108337402344]] },
  ] },
  { pathIndex: 54601, seqno: 54603, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [370.03948974609375, 425.8179931640625], [370.177490234375, 425.36700439453125]] },
  ] },
  { pathIndex: 54602, seqno: 54604, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [368.87078857421875, 425.46337890625], [370.0387878417969, 425.8183898925781]] },
  ] },
  { pathIndex: 54603, seqno: 54605, style: 'jamb-edge', items: [
    { itemIndex: 0, command: ["l", [369.0085144042969, 425.01068115234375], [368.8705139160156, 425.46368408203125]] },
  ] },
];

export const LOBBY_CANOPY_DOOR_JAMBS: readonly LobbyCanopyJamb[] = [
  {
    "id": "jamb-0",
    "fillSourcePathIndices": [
      52350
    ],
    "pageUpperFace": {
      "pathIndex": 54600,
      "itemIndex": 0
    },
    "pageLowerFace": {
      "pathIndex": 54602,
      "itemIndex": 0
    },
    "canopyFace": {
      "pathIndex": 54601,
      "itemIndex": 0
    },
    "lobbyFace": {
      "pathIndex": 54603,
      "itemIndex": 0
    }
  },
  {
    "id": "jamb-1",
    "fillSourcePathIndices": [
      52353,
      52354
    ],
    "pageUpperFace": {
      "pathIndex": 54596,
      "itemIndex": 0
    },
    "pageLowerFace": {
      "pathIndex": 54598,
      "itemIndex": 0
    },
    "canopyFace": {
      "pathIndex": 54597,
      "itemIndex": 0
    },
    "lobbyFace": {
      "pathIndex": 54599,
      "itemIndex": 0
    }
  },
  {
    "id": "jamb-2",
    "fillSourcePathIndices": [
      52357
    ],
    "pageUpperFace": {
      "pathIndex": 54594,
      "itemIndex": 0
    },
    "pageLowerFace": {
      "pathIndex": 54592,
      "itemIndex": 0
    },
    "canopyFace": {
      "pathIndex": 54593,
      "itemIndex": 0
    },
    "lobbyFace": {
      "pathIndex": 54595,
      "itemIndex": 0
    }
  },
  {
    "id": "jamb-3",
    "fillSourcePathIndices": [
      52360
    ],
    "pageUpperFace": {
      "pathIndex": 54590,
      "itemIndex": 0
    },
    "pageLowerFace": {
      "pathIndex": 54588,
      "itemIndex": 0
    },
    "canopyFace": {
      "pathIndex": 54589,
      "itemIndex": 0
    },
    "lobbyFace": {
      "pathIndex": 54591,
      "itemIndex": 0
    }
  }
];

export const LOBBY_CANOPY_DOOR_PAIRS: readonly LobbyCanopyDoorPair[] = [
  {
    "id": "page-upper",
    "pageUpperJambId": "jamb-0",
    "pageLowerJambId": "jamb-1",
    "threshold": {
      "sourceItem": {
        "pathIndex": 13433,
        "itemIndex": 0
      },
      "baseline": [
        [
          369.8937072753906,
          425.5758972167969
        ],
        [
          366.3497009277344,
          437.1148986816406
        ]
      ]
    },
    "leaves": [
      {
        "id": "page-upper-upper-leaf",
        "hingeJambId": "jamb-0",
        "hinge": [
          370.0022888183594,
          425.8074035644531
        ],
        "openTip": [
          375.7673034667969,
          427.5614013671875
        ],
        "closedTip": [
          368.2475891113281,
          431.572021484375
        ],
        "openLeafEdge": {
          "pathIndex": 48827,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48825,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "from"
      },
      {
        "id": "page-upper-lower-leaf",
        "hingeJambId": "jamb-1",
        "hinge": [
          366.4939880371094,
          437.3352966308594
        ],
        "openTip": [
          372.2590026855469,
          439.0903015136719
        ],
        "closedTip": [
          368.2475280761719,
          431.5719909667969
        ],
        "openLeafEdge": {
          "pathIndex": 48828,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48826,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "to"
      }
    ],
    "pageVisibility": "partly-obscured-recovered-from-vectors",
    "swingInterpretation": "outward-to-canopy"
  },
  {
    "id": "page-middle",
    "pageUpperJambId": "jamb-1",
    "pageLowerJambId": "jamb-2",
    "threshold": {
      "sourceItem": {
        "pathIndex": 13434,
        "itemIndex": 0
      },
      "baseline": [
        [
          366.1990051269531,
          437.57080078125
        ],
        [
          362.7070007324219,
          449.1628112792969
        ]
      ]
    },
    "leaves": [
      {
        "id": "page-middle-upper-leaf",
        "hingeJambId": "jamb-1",
        "hinge": [
          366.35650634765625,
          437.78790283203125
        ],
        "openTip": [
          372.12249755859375,
          439.54290771484375
        ],
        "closedTip": [
          364.601806640625,
          443.55499267578125
        ],
        "openLeafEdge": {
          "pathIndex": 48881,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48834,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "from"
      },
      {
        "id": "page-middle-lower-leaf",
        "hingeJambId": "jamb-2",
        "hinge": [
          362.8468933105469,
          449.32220458984375
        ],
        "openTip": [
          368.6128845214844,
          451.07720947265625
        ],
        "closedTip": [
          364.601806640625,
          443.55499267578125
        ],
        "openLeafEdge": {
          "pathIndex": 48880,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48882,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "to"
      }
    ],
    "pageVisibility": "visible-on-page",
    "swingInterpretation": "outward-to-canopy"
  },
  {
    "id": "page-lower",
    "pageUpperJambId": "jamb-2",
    "pageLowerJambId": "jamb-3",
    "threshold": {
      "sourceItem": {
        "pathIndex": 13435,
        "itemIndex": 0
      },
      "baseline": [
        [
          362.55450439453125,
          449.6171875
        ],
        [
          359.0625,
          461.2091979980469
        ]
      ]
    },
    "leaves": [
      {
        "id": "page-lower-upper-leaf",
        "hingeJambId": "jamb-2",
        "hinge": [
          362.70928955078125,
          449.77349853515625
        ],
        "openTip": [
          368.47528076171875,
          451.52850341796875
        ],
        "closedTip": [
          360.9547119140625,
          455.54058837890625
        ],
        "openLeafEdge": {
          "pathIndex": 48877,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48879,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "from"
      },
      {
        "id": "page-lower-lower-leaf",
        "hingeJambId": "jamb-3",
        "hinge": [
          359.19970703125,
          461.3065185546875
        ],
        "openTip": [
          364.9656982421875,
          463.0625305175781
        ],
        "closedTip": [
          360.9546203613281,
          455.5404968261719
        ],
        "openLeafEdge": {
          "pathIndex": 48876,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48878,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "to"
      }
    ],
    "pageVisibility": "visible-on-page",
    "swingInterpretation": "outward-to-canopy"
  }
];

export const LOBBY_CANOPY_FLANKING_GLAZING: readonly LobbyCanopyFlankingGlazing[] = [
  {
    "id": "page-upper",
    "baseline": {
      "pathIndex": 13432,
      "itemIndex": 0
    },
    "edgeSourceItems": [
      {
        "pathIndex": 49166,
        "itemIndex": 0
      },
      {
        "pathIndex": 49167,
        "itemIndex": 0
      },
      {
        "pathIndex": 49168,
        "itemIndex": 0
      },
      {
        "pathIndex": 49169,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-lower",
    "baseline": {
      "pathIndex": 13436,
      "itemIndex": 0
    },
    "edgeSourceItems": [
      {
        "pathIndex": 49280,
        "itemIndex": 0
      },
      {
        "pathIndex": 49281,
        "itemIndex": 0
      },
      {
        "pathIndex": 49282,
        "itemIndex": 0
      },
      {
        "pathIndex": 49283,
        "itemIndex": 0
      }
    ]
  }
];

export interface LobbyCanopyDoorSourceLedger {
  readonly source: typeof LOBBY_CANOPY_DOOR_SOURCE;
  readonly styles: Readonly<Record<LobbyCanopySourceStyleId, LobbyCanopySourceStyle>>;
  readonly sourcePaths: readonly LobbyCanopySourcePath[];
  readonly jambs: readonly LobbyCanopyJamb[];
  readonly pairs: readonly LobbyCanopyDoorPair[];
  readonly flankingGlazing: readonly LobbyCanopyFlankingGlazing[];
}

/** Data only. No fitted application coordinates, geometry creation or registration. */
export const LOBBY_CANOPY_DOOR_SOURCE_LEDGER: LobbyCanopyDoorSourceLedger = {
  source: LOBBY_CANOPY_DOOR_SOURCE,
  styles: LOBBY_CANOPY_DOOR_SOURCE_STYLES,
  sourcePaths: LOBBY_CANOPY_DOOR_SOURCE_PATHS,
  jambs: LOBBY_CANOPY_DOOR_JAMBS,
  pairs: LOBBY_CANOPY_DOOR_PAIRS,
  flankingGlazing: LOBBY_CANOPY_FLANKING_GLAZING,
};
