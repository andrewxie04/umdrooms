/**
 * South lobby vestibule, UMD / HDR Ground guide, original PDF page index 6.
 * SOURCE DATA ONLY: unchanged PyMuPDF floats (exact fractions where lint requires) in PDF pt, top-left origin, +Y down.
 * Map every point, including cubic controls, through groundGuidePlan in a consumer.
 * Four double-door pairs form two parallel rows; the stair doors are separate context.
 * Every selected original path/item and paint style is retained, including opaque fills.
 * Consecutive commands can start distinct native subpaths; never connect their gaps.
 * See docs/research/iribe/lobby-south-doors-2026-10-03.md for evidence limits.
 */

export type LobbySouthPdfPoint = readonly [pdfX: number, pdfY: number];
export type LobbySouthPdfLine = readonly [from: LobbySouthPdfPoint, to: LobbySouthPdfPoint];
export type LobbySouthSourceCommand =
  | readonly ['l', from: LobbySouthPdfPoint, to: LobbySouthPdfPoint]
  | readonly [
      'c', from: LobbySouthPdfPoint, control1: LobbySouthPdfPoint,
      control2: LobbySouthPdfPoint, to: LobbySouthPdfPoint,
    ];
export interface LobbySouthSourceItemRef {
  /** Zero-based ORIGINAL guide[6].get_drawings() identity, never a replay index. */
  readonly pathIndex: number;
  readonly itemIndex: number;
}
export interface LobbySouthSourceItem {
  readonly itemIndex: number;
  readonly command: LobbySouthSourceCommand;
}
export type LobbySouthSourceStyleId =
  | 'facade-baseline' | 'door-symbol' | 'stair-upper-swing' | 'glazing-detail'
  | 'opaque-fill' | 'frame-detail' | 'wall-edge';
type LobbySouthSourceRgb = readonly [r: number, g: number, b: number];
/** Verbatim get_drawings() paint fields; null means not applicable in the source. */
export interface LobbySouthSourceStyle {
  readonly type: 's' | 'f';
  readonly color: LobbySouthSourceRgb | null;
  readonly fill: LobbySouthSourceRgb | null;
  readonly width: number | null;
  readonly closePath: boolean;
  readonly even_odd: boolean | null;
  readonly lineCap: readonly [number, number, number] | null;
  readonly lineJoin: number | null;
  readonly dashes: string | null;
  readonly stroke_opacity: number | null;
  readonly fill_opacity: number | null;
}
export interface LobbySouthSourcePath {
  readonly pathIndex: number;
  /** Original paint sequence; independent from pathIndex. */
  readonly seqno: number;
  readonly boundsPt: readonly [x0: number, y0: number, x1: number, y1: number];
  readonly style: LobbySouthSourceStyleId;
  readonly items: readonly LobbySouthSourceItem[];
}
export type LobbySouthDoorRow = 'page-upper' | 'page-lower';
export type LobbySouthDoorPairId =
  | 'page-upper-left' | 'page-upper-right' | 'page-lower-left' | 'page-lower-right';
export type LobbySouthJambId = `${LobbySouthDoorPairId}-${'left' | 'right'}-jamb`;
export interface LobbySouthJamb {
  readonly id: LobbySouthJambId;
  readonly row: LobbySouthDoorRow;
  readonly fillSourcePathIndices: readonly number[];
  readonly perimeterSourceItems: readonly LobbySouthSourceItemRef[];
}
export interface LobbySouthDoorLeaf {
  readonly id: string;
  readonly hingeJambId: LobbySouthJambId;
  /** Interpreted hinge: exact openLeafEdge FROM, without snapping to a jamb. */
  readonly hinge: LobbySouthPdfPoint;
  readonly openTip: LobbySouthPdfPoint;
  /** Original cubic endpoint opposite its open tip; no inferred meeting midpoint. */
  readonly closedTip: LobbySouthPdfPoint;
  readonly openLeafEdge: LobbySouthSourceItemRef;
  readonly swingCurve: LobbySouthSourceItemRef;
  readonly closedTipSourceEndpoint: 'from' | 'to';
}
export interface LobbySouthNativeBaseline {
  readonly sourceItem: LobbySouthSourceItemRef;
  /** Entire native continuous facade line, never a fitted or clipped sill. */
  readonly baseline: LobbySouthPdfLine;
}
export interface LobbySouthDoorPair {
  readonly id: LobbySouthDoorPairId;
  readonly row: LobbySouthDoorRow;
  readonly pageLeftJambId: LobbySouthJambId;
  readonly pageRightJambId: LobbySouthJambId;
  /** Upper row has no independent baseline across its openings. Lower pairs share 13443. */
  readonly nativeFacadeBaseline: LobbySouthNativeBaseline | null;
  readonly leaves: readonly [LobbySouthDoorLeaf, LobbySouthDoorLeaf];
  readonly pageVisibility: 'visible-on-page';
  readonly swingInterpretation: 'toward-increasing-page-y';
}
export interface LobbySouthAdjacentStairDoor {
  readonly id: 'stair-page-upper' | 'stair-page-lower';
  readonly hinge: LobbySouthPdfPoint;
  readonly openTip: LobbySouthPdfPoint;
  /** Retained separately: upper stair cubic joins the other side of the drawn contour. */
  readonly curveOpenTip: LobbySouthPdfPoint;
  readonly closedTip: LobbySouthPdfPoint;
  readonly openLeafEdge: LobbySouthSourceItemRef;
  readonly openLeafContourSourceItems: readonly LobbySouthSourceItemRef[];
  readonly swingCurve: LobbySouthSourceItemRef;
  readonly closedTipSourceEndpoint: 'from' | 'to';
  readonly jambEdgeSourceItems: readonly LobbySouthSourceItemRef[];
  readonly nativeFacadeBaseline: LobbySouthNativeBaseline | null;
}
export interface LobbySouthGlazing {
  readonly id: string;
  /** All four native edge strokes of each adjacent panel. */
  readonly edgeSourceItems: readonly LobbySouthSourceItemRef[];
}

export const LOBBY_SOUTH_DOOR_SOURCE = {
  "url": "https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf",
  "pdfSha256": "c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474",
  "pageIndex": 6,
  "pageWidthPt": 576,
  "pageHeightPt": 576,
  "coordinateOrigin": "top-left",
  "xDirection": "right",
  "yDirection": "down",
  "coordinateUnit": "pdf-pt",
  "coordinateTreatment": "unchanged-source-float",
  "extractionApi": "PyMuPDF Page.get_drawings()",
  "extractionVersion": "1.28.2",
  "originalPageDrawingCount": 56651,
  "requestedBoundsPt": [
    247,
    470,
    341,
    529
  ],
  "inspectedBoundsPt": [
    203,
    462,
    354,
    529
  ],
  "structuralInventoryBoundsPt": [
    210,
    480,
    347,
    523
  ],
  "omittedAnnotationPathIndices": [
    56631
  ],
  "doorSymbolsObscuredByAnnotation": false,
  "registrationConsumer": "groundGuidePlan",
  "hingeInterpretation": "open-leaf-edge-origin",
  "pairedClosedLeafEdgeIsDrawn": false,
  "physicalDimensionsEstablished": false
} as const;

export const LOBBY_SOUTH_DOOR_SOURCE_STYLES = {
  "facade-baseline": {
    "type": "s",
    "color": [
      0.6000000238418579,
      0.6000000238418579,
      0.6000000238418579
    ],
    "fill": null,
    "width": 0.06800000369548798,
    "closePath": false,
    "even_odd": null,
    "lineCap": [
      1,
      1,
      1
    ],
    "lineJoin": 1.0,
    "dashes": "[] 0",
    "stroke_opacity": 1.0,
    "fill_opacity": null
  },
  "door-symbol": {
    "type": "s",
    "color": [
      0.3019913136959076,
      0.3019913136959076,
      0.3019913136959076
    ],
    "fill": null,
    "width": 0.10199999809265137,
    "closePath": false,
    "even_odd": null,
    "lineCap": [
      1,
      1,
      1
    ],
    "lineJoin": 1.0,
    "dashes": "[] 0",
    "stroke_opacity": 1.0,
    "fill_opacity": null
  },
  "stair-upper-swing": {
    "type": "s",
    "color": [
      0.3019913136959076,
      0.3019913136959076,
      0.3019913136959076
    ],
    "fill": null,
    "width": 0.0949999988079071,
    "closePath": false,
    "even_odd": null,
    "lineCap": [
      0,
      0,
      0
    ],
    "lineJoin": 0.0,
    "dashes": "[] 0",
    "stroke_opacity": 1.0,
    "fill_opacity": null
  },
  "glazing-detail": {
    "type": "s",
    "color": [
      0.3019913136959076,
      0.3019913136959076,
      0.3019913136959076
    ],
    "fill": null,
    "width": 0.06800000369548798,
    "closePath": false,
    "even_odd": null,
    "lineCap": [
      1,
      1,
      1
    ],
    "lineJoin": 1.0,
    "dashes": "[] 0",
    "stroke_opacity": 1.0,
    "fill_opacity": null
  },
  "opaque-fill": {
    "type": "f",
    "color": null,
    "fill": [
      0.0,
      0.0,
      0.0
    ],
    "width": null,
    "closePath": false,
    "even_odd": false,
    "lineCap": null,
    "lineJoin": null,
    "dashes": null,
    "stroke_opacity": null,
    "fill_opacity": 1.0
  },
  "frame-detail": {
    "type": "s",
    "color": [
      0.0,
      0.0,
      0.0
    ],
    "fill": null,
    "width": 0.06800000369548798,
    "closePath": false,
    "even_odd": null,
    "lineCap": [
      1,
      1,
      1
    ],
    "lineJoin": 1.0,
    "dashes": "[] 0",
    "stroke_opacity": 1.0,
    "fill_opacity": null
  },
  "wall-edge": {
    "type": "s",
    "color": [
      0.0,
      0.0,
      0.0
    ],
    "fill": null,
    "width": 0.33899998664855957,
    "closePath": false,
    "even_odd": null,
    "lineCap": [
      1,
      1,
      1
    ],
    "lineJoin": 1.0,
    "dashes": "[] 0",
    "stroke_opacity": 1.0,
    "fill_opacity": null
  }
} as const satisfies Readonly<Record<LobbySouthSourceStyleId, LobbySouthSourceStyle>>;

/** Complete original commands in original drawing order; all native subpaths survive. */
export const LOBBY_SOUTH_DOOR_SOURCE_PATHS: readonly LobbySouthSourcePath[] = [
  { pathIndex: 13440, seqno: 13440, boundsPt: [333.1470031738281, 505.54620361328125, 345.5480041503906, 505.54620361328125], style: 'facade-baseline', items: [
    { itemIndex: 0, command: ["l", [345.5480041503906, 505.54620361328125], [333.1470031738281, 505.54620361328125]] },
  ] },
  { pathIndex: 13441, seqno: 13441, boundsPt: [268.3600158691406, 8454545 / 16384, 331.5270080566406, 8454545 / 16384], style: 'facade-baseline', items: [
    { itemIndex: 0, command: ["l", [331.5270080566406, 8454545 / 16384], [268.3600158691406, 8454545 / 16384]] },
  ] },
  { pathIndex: 13442, seqno: 13442, boundsPt: [268.3594055175781, 505.5984802246094, 269.6763916015625, 8454545 / 16384], style: 'facade-baseline', items: [
    { itemIndex: 0, command: ["l", [268.3594055175781, 8454545 / 16384], [269.6763916015625, 505.5984802246094]] },
  ] },
  { pathIndex: 13443, seqno: 13443, boundsPt: [226.80419921875, 505.597900390625, 269.67620849609375, 505.597900390625], style: 'facade-baseline', items: [
    { itemIndex: 0, command: ["l", [269.67620849609375, 505.597900390625], [226.80419921875, 505.597900390625]] },
  ] },
  { pathIndex: 13444, seqno: 13444, boundsPt: [218.04969787597656, 505.597900390625, 226.80470275878906, 505.597900390625], style: 'facade-baseline', items: [
    { itemIndex: 0, command: ["l", [226.80470275878906, 505.597900390625], [218.04969787597656, 505.597900390625]] },
  ] },
  { pathIndex: 13445, seqno: 13445, boundsPt: [216.68238830566406, 505.597900390625, 218.0493927001953, 516.02392578125], style: 'facade-baseline', items: [
    { itemIndex: 0, command: ["l", [218.0493927001953, 505.597900390625], [216.68238830566406, 516.02392578125]] },
  ] },
  { pathIndex: 13446, seqno: 13446, boundsPt: [210.96240234375, 8454545 / 16384, 7100249 / 32768, 8454545 / 16384], style: 'facade-baseline', items: [
    { itemIndex: 0, command: ["l", [7100249 / 32768, 8454545 / 16384], [210.96240234375, 8454545 / 16384]] },
  ] },
  { pathIndex: 13447, seqno: 13447, boundsPt: [6912829 / 32768, 505.5464782714844, 212.27879333496094, 8454545 / 16384], style: 'facade-baseline', items: [
    { itemIndex: 0, command: ["l", [6912829 / 32768, 8454545 / 16384], [212.27879333496094, 505.5464782714844]] },
  ] },
  { pathIndex: 13448, seqno: 13448, boundsPt: [6954297 / 32768, 505.54620361328125, 212.27830505371094, 505.54620361328125], style: 'facade-baseline', items: [
    { itemIndex: 0, command: ["l", [212.27830505371094, 505.54620361328125], [6954297 / 32768, 505.54620361328125]] },
  ] },
  { pathIndex: 48810, seqno: 48810, boundsPt: [277.7106018066406, 486.59979248046875, 278.6325988769531, 493.1528015136719], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [278.6325988769531, 486.59979248046875], [277.7106018066406, 493.1528015136719]] },
  ] },
  { pathIndex: 48811, seqno: 48811, boundsPt: [277.71148681640625, 493.15301513671875, 277.9854736328125, 493.1910095214844], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [277.71148681640625, 493.15301513671875], [277.9854736328125, 493.1910095214844]] },
  ] },
  { pathIndex: 48812, seqno: 48812, boundsPt: [277.9855041503906, 486.6383972167969, 278.906494140625, 493.19140625], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [277.9855041503906, 493.19140625], [278.906494140625, 486.6383972167969]] },
  ] },
  { pathIndex: 48813, seqno: 48813, boundsPt: [278.6325988769531, 486.59979248046875, 278.9065856933594, 486.6377868652344], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [278.6325988769531, 486.59979248046875], [278.9065856933594, 486.6377868652344]] },
  ] },
  { pathIndex: 48814, seqno: 48814, boundsPt: [277.9855041503906, 486.02099609375, 285.7015075683594, 493.7200012207031], style: 'stair-upper-swing', items: [
    { itemIndex: 0, command: ["c", [277.9855041503906, 493.19000244140625], [283.3684997558594, 493.7200012207031], [285.7015075683594, 491.4110107421875], [285.23150634765625, 486.02099609375]] },
  ] },
  { pathIndex: 48818, seqno: 48818, boundsPt: [227.18589782714844, 485.4669189453125, 227.18589782714844, 490.9079284667969], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [227.18589782714844, 485.4669189453125], [227.18589782714844, 490.9079284667969]] },
  ] },
  { pathIndex: 48819, seqno: 48819, boundsPt: [238.0677947998047, 485.4669189453125, 238.0677947998047, 490.9079284667969], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [238.0677947998047, 485.4669189453125], [238.0677947998047, 490.9079284667969]] },
  ] },
  { pathIndex: 48820, seqno: 48820, boundsPt: [227.18589782714844, 485.4662780761719, 232.62689208984375, 490.90728759765625], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [227.18589782714844, 490.90728759765625], [231.03289794921875, 490.90728759765625], [232.62689208984375, 489.31329345703125], [232.62689208984375, 485.4662780761719]] },
  ] },
  { pathIndex: 48821, seqno: 48821, boundsPt: [232.6260986328125, 485.4669189453125, 238.06809997558594, 490.9079284667969], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [232.6260986328125, 485.4669189453125], [232.6260986328125, 489.31390380859375], [7674957 / 32768, 490.9079284667969], [238.06809997558594, 490.9079284667969]] },
  ] },
  { pathIndex: 48829, seqno: 48829, boundsPt: [249.87469482421875, 485.4669189453125, 249.87469482421875, 490.9079284667969], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [249.87469482421875, 485.4669189453125], [249.87469482421875, 490.9079284667969]] },
  ] },
  { pathIndex: 48830, seqno: 48830, boundsPt: [260.7567138671875, 485.4669189453125, 260.7567138671875, 490.9079284667969], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [260.7567138671875, 485.4669189453125], [260.7567138671875, 490.9079284667969]] },
  ] },
  { pathIndex: 48831, seqno: 48831, boundsPt: [249.87469482421875, 485.4662780761719, 255.3166961669922, 490.90728759765625], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [249.87469482421875, 490.90728759765625], [253.72369384765625, 490.90728759765625], [255.3166961669922, 489.31329345703125], [255.3166961669922, 485.4662780761719]] },
  ] },
  { pathIndex: 48832, seqno: 48832, boundsPt: [255.31649780273438, 485.4669189453125, 260.75750732421875, 490.9079284667969], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [255.31649780273438, 485.4669189453125], [255.31649780273438, 489.31390380859375], [256.9104919433594, 490.9079284667969], [260.75750732421875, 490.9079284667969]] },
  ] },
  { pathIndex: 48862, seqno: 48862, boundsPt: [255.32569885253906, 505.2431945800781, 260.7677001953125, 510.6842041015625], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [255.32569885253906, 505.2431945800781], [255.32569885253906, 509.0901794433594], [256.9206848144531, 510.6842041015625], [260.7677001953125, 510.6842041015625]] },
  ] },
  { pathIndex: 48863, seqno: 48863, boundsPt: [8188245 / 32768, 505.24249267578125, 255.32640075683594, 510.6835021972656], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [8188245 / 32768, 510.6835021972656], [253.73240661621094, 510.6835021972656], [255.32640075683594, 509.0895080566406], [255.32640075683594, 505.24249267578125]] },
  ] },
  { pathIndex: 48864, seqno: 48864, boundsPt: [260.7673034667969, 505.2431945800781, 260.7673034667969, 510.6842041015625], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [260.7673034667969, 505.2431945800781], [260.7673034667969, 510.6842041015625]] },
  ] },
  { pathIndex: 48865, seqno: 48865, boundsPt: [8188245 / 32768, 505.2431945800781, 8188245 / 32768, 510.6842041015625], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [8188245 / 32768, 505.2431945800781], [8188245 / 32768, 510.6842041015625]] },
  ] },
  { pathIndex: 48870, seqno: 48870, boundsPt: [232.6168975830078, 505.2431945800781, 7800681 / 32768, 510.6842041015625], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [232.6168975830078, 505.2431945800781], [232.6168975830078, 509.0901794433594], [234.2108917236328, 510.6842041015625], [7800681 / 32768, 510.6842041015625]] },
  ] },
  { pathIndex: 48871, seqno: 48871, boundsPt: [227.17649841308594, 505.24249267578125, 232.61749267578125, 510.6835021972656], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [227.17649841308594, 510.6835021972656], [231.02349853515625, 510.6835021972656], [232.61749267578125, 509.0895080566406], [232.61749267578125, 505.24249267578125]] },
  ] },
  { pathIndex: 48872, seqno: 48872, boundsPt: [238.05709838867188, 505.2431945800781, 238.05709838867188, 510.6842041015625], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [238.05709838867188, 505.2431945800781], [238.05709838867188, 510.6842041015625]] },
  ] },
  { pathIndex: 48873, seqno: 48873, boundsPt: [227.17649841308594, 505.2431945800781, 227.17649841308594, 510.6842041015625], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [227.17649841308594, 505.2431945800781], [227.17649841308594, 510.6842041015625]] },
  ] },
  { pathIndex: 48874, seqno: 48874, boundsPt: [275.54791259765625, 515.35888671875, 275.54791259765625, 8552069 / 16384], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["l", [275.54791259765625, 515.35888671875], [275.54791259765625, 8552069 / 16384]] },
  ] },
  { pathIndex: 48875, seqno: 48875, boundsPt: [275.54791259765625, 515.3590087890625, 282.16790771484375, 521.9769897460938], style: 'door-symbol', items: [
    { itemIndex: 0, command: ["c", [275.54791259765625, 521.9769897460938], [280.2279052734375, 521.9769897460938], [282.16790771484375, 520.0379638671875], [282.16790771484375, 515.3590087890625]] },
  ] },
  { pathIndex: 49194, seqno: 49194, boundsPt: [7168013 / 32768, 505.2829895019531, 226.8603973388672, 505.2829895019531], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [226.8603973388672, 505.2829895019531], [7168013 / 32768, 505.2829895019531]] },
  ] },
  { pathIndex: 49195, seqno: 49195, boundsPt: [218.74949645996094, 505.2829895019531, 218.74949645996094, 505.44000244140625], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [218.74949645996094, 505.2829895019531], [218.74949645996094, 505.44000244140625]] },
  ] },
  { pathIndex: 49196, seqno: 49196, boundsPt: [218.74949645996094, 505.4403991699219, 226.8594970703125, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [218.74949645996094, 505.4403991699219], [226.8594970703125, 505.4403991699219]] },
  ] },
  { pathIndex: 49197, seqno: 49197, boundsPt: [226.8603973388672, 505.28338623046875, 226.8603973388672, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [226.8603973388672, 505.4403991699219], [226.8603973388672, 505.28338623046875]] },
  ] },
  { pathIndex: 49268, seqno: 49268, boundsPt: [218.85169982910156, 474.54400634765625, 219.9207000732422, 482.8890075683594], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [219.9207000732422, 474.54400634765625], [218.85169982910156, 482.8890075683594]] },
  ] },
  { pathIndex: 49269, seqno: 49269, boundsPt: [218.85130310058594, 482.88909912109375, 219.00730895996094, 482.9090881347656], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [218.85130310058594, 482.88909912109375], [219.00730895996094, 482.9090881347656]] },
  ] },
  { pathIndex: 49270, seqno: 49270, boundsPt: [219.0074005126953, 474.56390380859375, 220.07640075683594, 482.9089050292969], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [219.0074005126953, 482.9089050292969], [220.07640075683594, 474.56390380859375]] },
  ] },
  { pathIndex: 49271, seqno: 49271, boundsPt: [219.92079162597656, 474.5437927246094, 220.07679748535156, 474.56378173828125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [220.07679748535156, 474.56378173828125], [219.92079162597656, 474.5437927246094]] },
  ] },
  { pathIndex: 49278, seqno: 49278, boundsPt: [261.07281494140625, 485.2301025390625, 272.3348083496094, 485.2301025390625], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [272.3348083496094, 485.2301025390625], [261.07281494140625, 485.2301025390625]] },
  ] },
  { pathIndex: 49279, seqno: 49279, boundsPt: [261.0729064941406, 485.2301025390625, 261.0729064941406, 485.3871154785156], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [261.0729064941406, 485.2301025390625], [261.0729064941406, 485.3871154785156]] },
  ] },
  { pathIndex: 49292, seqno: 49292, boundsPt: [341.5448913574219, 505.4403991699219, 345.9559020996094, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [341.5448913574219, 505.4403991699219], [345.9559020996094, 505.4403991699219]] },
  ] },
  { pathIndex: 49293, seqno: 49293, boundsPt: [345.9555969238281, 505.025390625, 345.9555969238281, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [345.9555969238281, 505.4403991699219], [345.9555969238281, 505.025390625]] },
  ] },
  { pathIndex: 49294, seqno: 49294, boundsPt: [341.5445861816406, 505.02618408203125, 345.9555969238281, 505.02618408203125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [345.9555969238281, 505.02618408203125], [341.5445861816406, 505.02618408203125]] },
  ] },
  { pathIndex: 49295, seqno: 49295, boundsPt: [341.5448913574219, 505.02618408203125, 341.5448913574219, 505.4411926269531], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [341.5448913574219, 505.02618408203125], [341.5448913574219, 505.4411926269531]] },
  ] },
  { pathIndex: 49296, seqno: 49296, boundsPt: [261.0729064941406, 485.38751220703125, 272.33489990234375, 485.38751220703125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [261.0729064941406, 485.38751220703125], [272.33489990234375, 485.38751220703125]] },
  ] },
  { pathIndex: 49297, seqno: 49297, boundsPt: [272.3348083496094, 485.2304992675781, 272.3348083496094, 485.38751220703125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [272.3348083496094, 485.38751220703125], [272.3348083496094, 485.2304992675781]] },
  ] },
  { pathIndex: 49298, seqno: 49298, boundsPt: [238.38279724121094, 485.2301025390625, 249.55979919433594, 485.2301025390625], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [249.55979919433594, 485.2301025390625], [238.38279724121094, 485.2301025390625]] },
  ] },
  { pathIndex: 49299, seqno: 49299, boundsPt: [238.38279724121094, 485.2301025390625, 238.38279724121094, 485.3871154785156], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [238.38279724121094, 485.2301025390625], [238.38279724121094, 485.3871154785156]] },
  ] },
  { pathIndex: 49300, seqno: 49300, boundsPt: [238.38279724121094, 485.38751220703125, 249.55979919433594, 485.38751220703125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [238.38279724121094, 485.38751220703125], [249.55979919433594, 485.38751220703125]] },
  ] },
  { pathIndex: 49301, seqno: 49301, boundsPt: [249.55979919433594, 485.2304992675781, 249.55979919433594, 485.38751220703125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [249.55979919433594, 485.38751220703125], [249.55979919433594, 485.2304992675781]] },
  ] },
  { pathIndex: 49302, seqno: 49302, boundsPt: [221.27589416503906, 485.2301025390625, 226.8708953857422, 485.2301025390625], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [226.8708953857422, 485.2301025390625], [221.27589416503906, 485.2301025390625]] },
  ] },
  { pathIndex: 49303, seqno: 49303, boundsPt: [221.2758026123047, 485.2301025390625, 221.2758026123047, 485.3871154785156], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [221.2758026123047, 485.2301025390625], [221.2758026123047, 485.3871154785156]] },
  ] },
  { pathIndex: 49304, seqno: 49304, boundsPt: [221.2758026123047, 485.38751220703125, 226.8708038330078, 485.38751220703125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [221.2758026123047, 485.38751220703125], [226.8708038330078, 485.38751220703125]] },
  ] },
  { pathIndex: 49305, seqno: 49305, boundsPt: [226.8708953857422, 485.2304992675781, 226.8708953857422, 485.38751220703125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [226.8708953857422, 485.38751220703125], [226.8708953857422, 485.2304992675781]] },
  ] },
  { pathIndex: 49325, seqno: 49325, boundsPt: [333.0715026855469, 505.4403991699219, 341.5455017089844, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [333.0715026855469, 505.4403991699219], [341.5455017089844, 505.4403991699219]] },
  ] },
  { pathIndex: 49326, seqno: 49326, boundsPt: [341.5448913574219, 505.025390625, 341.5448913574219, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [341.5448913574219, 505.4403991699219], [341.5448913574219, 505.025390625]] },
  ] },
  { pathIndex: 49327, seqno: 49327, boundsPt: [333.0708923339844, 505.02618408203125, 341.5448913574219, 505.02618408203125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [341.5448913574219, 505.02618408203125], [333.0708923339844, 505.02618408203125]] },
  ] },
  { pathIndex: 49328, seqno: 49328, boundsPt: [333.0715026855469, 505.02618408203125, 333.0715026855469, 505.4411926269531], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [333.0715026855469, 505.02618408203125], [333.0715026855469, 505.4411926269531]] },
  ] },
  { pathIndex: 49329, seqno: 49329, boundsPt: [346.0852966308594, 494.239501953125, 349.51629638671875, 505.51849365234375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [346.0852966308594, 505.51849365234375], [349.51629638671875, 494.239501953125]] },
  ] },
  { pathIndex: 49330, seqno: 49330, boundsPt: [349.1208190917969, 494.11859130859375, 349.5168151855469, 494.2395935058594], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [349.5168151855469, 494.2395935058594], [349.1208190917969, 494.11859130859375]] },
  ] },
  { pathIndex: 49331, seqno: 49331, boundsPt: [345.69000244140625, 494.1191101074219, 349.1210021972656, 505.3981018066406], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [349.1210021972656, 494.1191101074219], [345.69000244140625, 505.3981018066406]] },
  ] },
  { pathIndex: 49332, seqno: 49332, boundsPt: [345.6896057128906, 505.39801025390625, 346.0856018066406, 505.5190124511719], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [345.6896057128906, 505.39801025390625], [346.0856018066406, 505.5190124511719]] },
  ] },
  { pathIndex: 49410, seqno: 49410, boundsPt: [261.0823974609375, 505.2829895019531, 269.73040771484375, 505.2829895019531], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [269.73040771484375, 505.2829895019531], [261.0823974609375, 505.2829895019531]] },
  ] },
  { pathIndex: 49411, seqno: 49411, boundsPt: [261.0823059082031, 505.2829895019531, 261.0823059082031, 505.44000244140625], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [261.0823059082031, 505.2829895019531], [261.0823059082031, 505.44000244140625]] },
  ] },
  { pathIndex: 49412, seqno: 49412, boundsPt: [261.0823059082031, 505.4403991699219, 269.7303161621094, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [261.0823059082031, 505.4403991699219], [269.7303161621094, 505.4403991699219]] },
  ] },
  { pathIndex: 49413, seqno: 49413, boundsPt: [269.73040771484375, 505.28338623046875, 269.73040771484375, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [269.73040771484375, 505.4403991699219], [269.73040771484375, 505.28338623046875]] },
  ] },
  { pathIndex: 49414, seqno: 49414, boundsPt: [238.37339782714844, 505.2829895019531, 249.57040405273438, 505.2829895019531], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [249.57040405273438, 505.2829895019531], [238.37339782714844, 505.2829895019531]] },
  ] },
  { pathIndex: 49415, seqno: 49415, boundsPt: [238.37339782714844, 505.2829895019531, 238.37339782714844, 505.44000244140625], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [238.37339782714844, 505.2829895019531], [238.37339782714844, 505.44000244140625]] },
  ] },
  { pathIndex: 49416, seqno: 49416, boundsPt: [238.37339782714844, 505.4403991699219, 249.57040405273438, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [238.37339782714844, 505.4403991699219], [249.57040405273438, 505.4403991699219]] },
  ] },
  { pathIndex: 49417, seqno: 49417, boundsPt: [249.57040405273438, 505.28338623046875, 249.57040405273438, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [249.57040405273438, 505.4403991699219], [249.57040405273438, 505.28338623046875]] },
  ] },
  { pathIndex: 49441, seqno: 49441, boundsPt: [204.3079071044922, 505.2829895019531, 212.63690185546875, 505.2829895019531], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [212.63690185546875, 505.2829895019531], [204.3079071044922, 505.2829895019531]] },
  ] },
  { pathIndex: 49442, seqno: 49442, boundsPt: [204.30889892578125, 505.2829895019531, 204.30889892578125, 505.44000244140625], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [204.30889892578125, 505.2829895019531], [204.30889892578125, 505.44000244140625]] },
  ] },
  { pathIndex: 49443, seqno: 49443, boundsPt: [204.30889892578125, 505.4403991699219, 212.6378936767578, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [204.30889892578125, 505.4403991699219], [212.6378936767578, 505.4403991699219]] },
  ] },
  { pathIndex: 49444, seqno: 49444, boundsPt: [212.63690185546875, 505.28338623046875, 212.63690185546875, 505.4403991699219], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [212.63690185546875, 505.4403991699219], [212.63690185546875, 505.28338623046875]] },
  ] },
  { pathIndex: 52363, seqno: 52363, boundsPt: [348.08209228515625, 493.3489074707031, 349.3830871582031, 494.16290283203125], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [349.3830871582031, 493.7008972167969], [349.24609375, 494.16290283203125]] },
    { itemIndex: 1, command: ["l", [349.24609375, 494.16290283203125], [349.1260986328125, 494.12188720703125]] },
    { itemIndex: 2, command: ["l", [349.1260986328125, 494.12188720703125], [349.0290832519531, 494.0939025878906]] },
    { itemIndex: 3, command: ["l", [349.0290832519531, 494.0939025878906], [348.08209228515625, 493.7958984375]] },
    { itemIndex: 4, command: ["l", [348.08209228515625, 493.7958984375], [348.21807861328125, 493.3489074707031]] },
    { itemIndex: 5, command: ["l", [348.21807861328125, 493.3489074707031], [349.16607666015625, 493.6329040527344]] },
    { itemIndex: 6, command: ["l", [349.16607666015625, 493.6329040527344], [349.2601013183594, 493.6618957519531]] },
    { itemIndex: 7, command: ["l", [349.2601013183594, 493.6618957519531], [349.3830871582031, 493.7008972167969]] },
  ] },
  { pathIndex: 52366, seqno: 52366, boundsPt: [345.6833190917969, 505.03021240234375, 345.9543151855469, 505.4372253417969], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [345.9543151855469, 505.03021240234375], [345.9543151855469, 505.4372253417969]] },
    { itemIndex: 1, command: ["l", [345.9543151855469, 505.4372253417969], [345.81732177734375, 505.4372253417969]] },
    { itemIndex: 2, command: ["l", [345.81732177734375, 505.4372253417969], [345.6833190917969, 505.397216796875]] },
    { itemIndex: 3, command: ["l", [345.6833190917969, 505.397216796875], [345.79132080078125, 505.03021240234375]] },
    { itemIndex: 4, command: ["l", [345.79132080078125, 505.03021240234375], [345.9543151855469, 505.03021240234375]] },
  ] },
  { pathIndex: 52373, seqno: 52373, boundsPt: [282.6430969238281, 483.2270812988281, 335.9801025390625, 515.8441162109375], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [332.4031066894531, 486.38409423828125], [332.38909912109375, 486.52008056640625]] },
    { itemIndex: 1, command: ["l", [332.38909912109375, 486.52008056640625], [328.3921203613281, 486.52008056640625]] },
    { itemIndex: 2, command: ["l", [328.3921203613281, 486.52008056640625], [324.9211120605469, 8413857 / 16384]] },
    { itemIndex: 3, command: ["l", [324.9211120605469, 8413857 / 16384], [329.77410888671875, 8413857 / 16384]] },
    { itemIndex: 4, command: ["l", [329.77410888671875, 8413857 / 16384], [329.9371032714844, 512.3070678710938]] },
    { itemIndex: 5, command: ["l", [329.9371032714844, 512.3070678710938], [330.2080993652344, 510.1260986328125]] },
    { itemIndex: 6, command: ["l", [330.2080993652344, 510.1260986328125], [330.85809326171875, 505.110107421875]] },
    { itemIndex: 7, command: ["l", [330.85809326171875, 505.110107421875], [331.589111328125, 505.20709228515625]] },
    { itemIndex: 8, command: ["l", [331.589111328125, 505.20709228515625], [333.9891052246094, 486.52008056640625]] },
    { itemIndex: 9, command: ["l", [333.9891052246094, 486.52008056640625], [333.5281066894531, 486.52008056640625]] },
    { itemIndex: 10, command: ["l", [333.5281066894531, 486.52008056640625], [332.4031066894531, 486.38409423828125]] },
    { itemIndex: 11, command: ["l", [327.6191101074219, 486.52008056640625], [316.3041076660156, 486.52008056640625]] },
    { itemIndex: 12, command: ["l", [316.3041076660156, 486.52008056640625], [316.3041076660156, 488.6470947265625]] },
    { itemIndex: 13, command: ["l", [316.3041076660156, 488.6470947265625], [315.11212158203125, 488.6470947265625]] },
    { itemIndex: 14, command: ["l", [315.11212158203125, 488.6470947265625], [297.5631103515625, 488.6470947265625]] },
    { itemIndex: 15, command: ["l", [297.5631103515625, 488.6470947265625], [295.0421142578125, 488.6470947265625]] },
    { itemIndex: 16, command: ["l", [295.0421142578125, 488.6470947265625], [292.1971130371094, 488.6470947265625]] },
    { itemIndex: 17, command: ["l", [292.1971130371094, 488.6470947265625], [288.4161071777344, 488.6470947265625]] },
    { itemIndex: 18, command: ["l", [288.4161071777344, 488.6470947265625], [288.4161071777344, 486.52008056640625]] },
    { itemIndex: 19, command: ["l", [288.4161071777344, 486.52008056640625], [285.569091796875, 486.52008056640625]] },
    { itemIndex: 20, command: ["l", [285.569091796875, 486.52008056640625], [285.569091796875, 485.381103515625]] },
    { itemIndex: 21, command: ["l", [285.569091796875, 485.381103515625], [288.38909912109375, 485.381103515625]] },
    { itemIndex: 22, command: ["l", [288.38909912109375, 485.381103515625], [289.5541076660156, 485.53009033203125]] },
    { itemIndex: 23, command: ["l", [289.5541076660156, 485.53009033203125], [289.5541076660156, 487.50909423828125]] },
    { itemIndex: 24, command: ["l", [289.5541076660156, 487.50909423828125], [315.1661071777344, 487.50909423828125]] },
    { itemIndex: 25, command: ["l", [315.1661071777344, 487.50909423828125], [315.1661071777344, 485.381103515625]] },
    { itemIndex: 26, command: ["l", [315.1661071777344, 485.381103515625], [333.9211120605469, 485.381103515625]] },
    { itemIndex: 27, command: ["l", [333.9211120605469, 485.381103515625], [333.9601135253906, 485.0000915527344]] },
    { itemIndex: 28, command: ["l", [333.9601135253906, 485.0000915527344], [290.2181091308594, 485.0000915527344]] },
    { itemIndex: 29, command: ["l", [290.2181091308594, 485.0000915527344], [290.1371154785156, 485.59808349609375]] },
    { itemIndex: 30, command: ["l", [290.1371154785156, 485.59808349609375], [289.5541076660156, 485.53009033203125]] },
    { itemIndex: 31, command: ["l", [289.5541076660156, 485.53009033203125], [289.5541076660156, 485.381103515625]] },
    { itemIndex: 32, command: ["l", [289.5541076660156, 485.381103515625], [288.38909912109375, 485.381103515625]] },
    { itemIndex: 33, command: ["l", [288.38909912109375, 485.381103515625], [288.66009521484375, 483.2270812988281]] },
    { itemIndex: 34, command: ["l", [288.66009521484375, 483.2270812988281], [296.3561096191406, 483.2270812988281]] },
    { itemIndex: 35, command: ["l", [296.3561096191406, 483.2270812988281], [298.1461181640625, 483.2270812988281]] },
    { itemIndex: 36, command: ["l", [298.1461181640625, 483.2270812988281], [298.2680969238281, 483.2270812988281]] },
    { itemIndex: 37, command: ["l", [298.2680969238281, 483.2270812988281], [300.05609130859375, 483.2270812988281]] },
    { itemIndex: 38, command: ["l", [300.05609130859375, 483.2270812988281], [300.1781005859375, 483.2270812988281]] },
    { itemIndex: 39, command: ["l", [300.1781005859375, 483.2270812988281], [301.96710205078125, 483.2270812988281]] },
    { itemIndex: 40, command: ["l", [301.96710205078125, 483.2270812988281], [302.07611083984375, 483.2270812988281]] },
    { itemIndex: 41, command: ["l", [302.07611083984375, 483.2270812988281], [303.86309814453125, 483.2270812988281]] },
    { itemIndex: 42, command: ["l", [303.86309814453125, 483.2270812988281], [303.9861145019531, 483.2270812988281]] },
    { itemIndex: 43, command: ["l", [303.9861145019531, 483.2270812988281], [305.7751159667969, 483.2270812988281]] },
    { itemIndex: 44, command: ["l", [305.7751159667969, 483.2270812988281], [305.8961181640625, 483.2270812988281]] },
    { itemIndex: 45, command: ["l", [305.8961181640625, 483.2270812988281], [307.68609619140625, 483.2270812988281]] },
    { itemIndex: 46, command: ["l", [307.68609619140625, 483.2270812988281], [307.7940979003906, 483.2270812988281]] },
    { itemIndex: 47, command: ["l", [307.7940979003906, 483.2270812988281], [309.5830993652344, 483.2270812988281]] },
    { itemIndex: 48, command: ["l", [309.5830993652344, 483.2270812988281], [309.7051086425781, 483.2270812988281]] },
    { itemIndex: 49, command: ["l", [309.7051086425781, 483.2270812988281], [311.4941101074219, 483.2270812988281]] },
    { itemIndex: 50, command: ["l", [311.4941101074219, 483.2270812988281], [311.6161193847656, 483.2270812988281]] },
    { itemIndex: 51, command: ["l", [311.6161193847656, 483.2270812988281], [313.4031066894531, 483.2270812988281]] },
    { itemIndex: 52, command: ["l", [313.4031066894531, 483.2270812988281], [313.5260925292969, 483.2270812988281]] },
    { itemIndex: 53, command: ["l", [313.5260925292969, 483.2270812988281], [315.3011169433594, 483.2270812988281]] },
    { itemIndex: 54, command: ["l", [315.3011169433594, 483.2270812988281], [315.423095703125, 483.2270812988281]] },
    { itemIndex: 55, command: ["l", [315.423095703125, 483.2270812988281], [317.21209716796875, 483.2270812988281]] },
    { itemIndex: 56, command: ["l", [317.21209716796875, 483.2270812988281], [317.3341064453125, 483.2270812988281]] },
    { itemIndex: 57, command: ["l", [317.3341064453125, 483.2270812988281], [335.9801025390625, 483.2270812988281]] },
    { itemIndex: 58, command: ["l", [335.9801025390625, 483.2270812988281], [333.1891174316406, 505.03009033203125]] },
    { itemIndex: 59, command: ["l", [333.1891174316406, 505.03009033203125], [333.0671081542969, 505.03009033203125]] },
    { itemIndex: 60, command: ["l", [333.0671081542969, 505.03009033203125], [333.0671081542969, 505.4371032714844]] },
    { itemIndex: 61, command: ["l", [333.0671081542969, 505.4371032714844], [333.1351013183594, 505.4371032714844]] },
    { itemIndex: 62, command: ["l", [333.1351013183594, 505.4371032714844], [331.8070983886719, 515.8441162109375]] },
    { itemIndex: 63, command: ["l", [331.8070983886719, 515.8441162109375], [282.6430969238281, 515.8441162109375]] },
    { itemIndex: 64, command: ["l", [282.6430969238281, 515.8441162109375], [282.6430969238281, 515.6671142578125]] },
    { itemIndex: 65, command: ["l", [282.6430969238281, 515.6671142578125], [282.6430969238281, 514.611083984375]] },
    { itemIndex: 66, command: ["l", [282.6430969238281, 514.611083984375], [282.6430969238281, 8413857 / 16384]] },
    { itemIndex: 67, command: ["l", [282.6430969238281, 8413857 / 16384], [324.1501159667969, 8413857 / 16384]] },
    { itemIndex: 68, command: ["l", [324.1501159667969, 8413857 / 16384], [324.5981140136719, 510.0850830078125]] },
    { itemIndex: 69, command: ["l", [324.5981140136719, 510.0850830078125], [327.2931213378906, 489.0120849609375]] },
    { itemIndex: 70, command: ["l", [327.2931213378906, 489.0120849609375], [327.6191101074219, 486.52008056640625]] },
  ] },
  { pathIndex: 52375, seqno: 52375, boundsPt: [324.9220275878906, 486.51898193359375, 333.989013671875, 513.5399780273438], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [332.3900146484375, 486.51898193359375], [333.52801513671875, 486.51898193359375]] },
    { itemIndex: 1, command: ["l", [333.52801513671875, 486.51898193359375], [333.989013671875, 486.51898193359375]] },
    { itemIndex: 2, command: ["l", [333.989013671875, 486.51898193359375], [331.5890197753906, 505.20599365234375]] },
    { itemIndex: 3, command: ["l", [331.5890197753906, 505.20599365234375], [330.8590087890625, 505.1109924316406]] },
    { itemIndex: 4, command: ["l", [330.8590087890625, 505.1109924316406], [330.2080078125, 510.1249694824219]] },
    { itemIndex: 5, command: ["l", [330.2080078125, 510.1249694824219], [329.3680114746094, 510.0169677734375]] },
    { itemIndex: 6, command: ["l", [329.3680114746094, 510.0169677734375], [329.0830078125, 512.197998046875]] },
    { itemIndex: 7, command: ["l", [329.0830078125, 512.197998046875], [329.0830078125, 8392081 / 16384]] },
    { itemIndex: 8, command: ["l", [329.0830078125, 8392081 / 16384], [329.9360046386719, 512.3070068359375]] },
    { itemIndex: 9, command: ["l", [329.9360046386719, 512.3070068359375], [329.77301025390625, 513.5399780273438]] },
    { itemIndex: 10, command: ["l", [329.77301025390625, 513.5399780273438], [324.9220275878906, 513.5399780273438]] },
    { itemIndex: 11, command: ["l", [324.9220275878906, 513.5399780273438], [328.39202880859375, 486.51898193359375]] },
    { itemIndex: 12, command: ["l", [328.39202880859375, 486.51898193359375], [332.3900146484375, 486.51898193359375]] },
  ] },
  { pathIndex: 52376, seqno: 52376, boundsPt: [289.5536804199219, 485.0011901855469, 333.960693359375, 487.5091857910156], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [333.960693359375, 485.0011901855469], [333.92169189453125, 485.38018798828125]] },
    { itemIndex: 1, command: ["l", [333.92169189453125, 485.38018798828125], [315.16668701171875, 485.38018798828125]] },
    { itemIndex: 2, command: ["l", [315.16668701171875, 485.38018798828125], [315.16668701171875, 487.5091857910156]] },
    { itemIndex: 3, command: ["l", [315.16668701171875, 487.5091857910156], [289.5536804199219, 487.5091857910156]] },
    { itemIndex: 4, command: ["l", [289.5536804199219, 487.5091857910156], [289.5536804199219, 485.53118896484375]] },
    { itemIndex: 5, command: ["l", [289.5536804199219, 485.53118896484375], [290.13568115234375, 485.5971984863281]] },
    { itemIndex: 6, command: ["l", [290.13568115234375, 485.5971984863281], [290.21868896484375, 485.0011901855469]] },
    { itemIndex: 7, command: ["l", [290.21868896484375, 485.0011901855469], [333.960693359375, 485.0011901855469]] },
  ] },
  { pathIndex: 52379, seqno: 52379, boundsPt: [329.08270263671875, 510.0169982910156, 330.20770263671875, 512.3070068359375], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [330.20770263671875, 510.125], [329.93670654296875, 512.3070068359375]] },
    { itemIndex: 1, command: ["l", [329.93670654296875, 512.3070068359375], [329.08270263671875, 8392081 / 16384]] },
    { itemIndex: 2, command: ["l", [329.08270263671875, 8392081 / 16384], [329.08270263671875, 512.197998046875]] },
    { itemIndex: 3, command: ["l", [329.08270263671875, 512.197998046875], [329.3677062988281, 510.0169982910156]] },
    { itemIndex: 4, command: ["l", [329.3677062988281, 510.0169982910156], [330.20770263671875, 510.125]] },
  ] },
  { pathIndex: 52380, seqno: 52380, boundsPt: [316.3041076660156, 486.51898193359375, 327.6191101074219, 489.0119934082031], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [327.6191101074219, 486.51898193359375], [327.2940979003906, 489.0119934082031]] },
    { itemIndex: 1, command: ["l", [327.2940979003906, 489.0119934082031], [327.3341064453125, 488.64697265625]] },
    { itemIndex: 2, command: ["l", [327.3341064453125, 488.64697265625], [316.3041076660156, 488.64697265625]] },
    { itemIndex: 3, command: ["l", [316.3041076660156, 488.64697265625], [316.3041076660156, 486.51898193359375]] },
    { itemIndex: 4, command: ["l", [316.3041076660156, 486.51898193359375], [327.6191101074219, 486.51898193359375]] },
  ] },
  { pathIndex: 52405, seqno: 52405, boundsPt: [282.1676940917969, 514.611328125, 282.6437072753906, 515.6673583984375], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [282.6437072753906, 514.611328125], [282.6437072753906, 515.6673583984375]] },
    { itemIndex: 1, command: ["l", [282.6437072753906, 515.6673583984375], [282.1676940917969, 515.6673583984375]] },
    { itemIndex: 2, command: ["l", [282.1676940917969, 515.6673583984375], [282.1676940917969, 515.3563232421875]] },
    { itemIndex: 3, command: ["l", [282.1676940917969, 515.3563232421875], [282.1676940917969, 515.206298828125]] },
    { itemIndex: 4, command: ["l", [282.1676940917969, 515.206298828125], [282.1676940917969, 514.611328125]] },
    { itemIndex: 5, command: ["l", [282.1676940917969, 514.611328125], [282.6437072753906, 514.611328125]] },
  ] },
  { pathIndex: 52407, seqno: 52407, boundsPt: [268.5635070800781, 483.226806640625, 278.4695129394531, 8451601 / 16384], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [274.1465148925781, 486.247802734375], [273.8755187988281, 488.4298095703125]] },
    { itemIndex: 1, command: ["l", [273.8755187988281, 488.4298095703125], [271.58551025390625, 506.2358093261719]] },
    { itemIndex: 2, command: ["l", [271.58551025390625, 506.2358093261719], [272.113525390625, 506.3048095703125]] },
    { itemIndex: 3, command: ["l", [272.113525390625, 506.3048095703125], [271.65350341796875, 509.94879150390625]] },
    { itemIndex: 4, command: ["l", [271.65350341796875, 509.94879150390625], [271.3684997558594, 512.143798828125]] },
    { itemIndex: 5, command: ["l", [271.3684997558594, 512.143798828125], [271.1925048828125, 513.540771484375]] },
    { itemIndex: 6, command: ["l", [271.1925048828125, 513.540771484375], [273.42852783203125, 513.540771484375]] },
    { itemIndex: 7, command: ["l", [273.42852783203125, 513.540771484375], [273.3065185546875, 514.5158081054688]] },
    { itemIndex: 8, command: ["l", [273.3065185546875, 514.5158081054688], [274.44451904296875, 514.665771484375]] },
    { itemIndex: 9, command: ["l", [274.44451904296875, 514.665771484375], [274.593505859375, 513.540771484375]] },
    { itemIndex: 10, command: ["l", [274.593505859375, 513.540771484375], [275.0815124511719, 513.540771484375]] },
    { itemIndex: 11, command: ["l", [275.0815124511719, 513.540771484375], [275.0815124511719, 514.61181640625]] },
    { itemIndex: 12, command: ["l", [275.0815124511719, 514.61181640625], [275.0815124511719, 8448701 / 16384]] },
    { itemIndex: 13, command: ["l", [275.0815124511719, 8448701 / 16384], [275.0815124511719, 8451601 / 16384]] },
    { itemIndex: 14, command: ["l", [275.0815124511719, 8451601 / 16384], [268.5635070800781, 8451601 / 16384]] },
    { itemIndex: 15, command: ["l", [268.5635070800781, 8451601 / 16384], [269.91851806640625, 505.288818359375]] },
    { itemIndex: 16, command: ["l", [269.91851806640625, 505.288818359375], [270.05352783203125, 504.2178039550781]] },
    { itemIndex: 17, command: ["l", [270.05352783203125, 504.2178039550781], [270.0675048828125, 504.09478759765625]] },
    { itemIndex: 18, command: ["l", [270.0675048828125, 504.09478759765625], [272.48150634765625, 485.3138122558594]] },
    { itemIndex: 19, command: ["l", [272.48150634765625, 485.3138122558594], [272.7505187988281, 483.226806640625]] },
    { itemIndex: 20, command: ["l", [272.7505187988281, 483.226806640625], [278.4695129394531, 483.226806640625]] },
    { itemIndex: 21, command: ["l", [278.4695129394531, 483.226806640625], [278.1985168457031, 485.38079833984375]] },
    { itemIndex: 22, command: ["l", [278.1985168457031, 485.38079833984375], [276.4365234375, 485.1498107910156]] },
    { itemIndex: 23, command: ["l", [276.4365234375, 485.1498107910156], [276.4635009765625, 485.00079345703125]] },
    { itemIndex: 24, command: ["l", [276.4635009765625, 485.00079345703125], [274.30950927734375, 485.00079345703125]] },
    { itemIndex: 25, command: ["l", [274.30950927734375, 485.00079345703125], [274.1465148925781, 486.247802734375]] },
  ] },
  { pathIndex: 52408, seqno: 52408, boundsPt: [273.4283142089844, 485.3809814453125, 278.3203125, 513.5399780273438], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [278.3203125, 485.3809814453125], [278.3203125, 486.51898193359375]] },
    { itemIndex: 1, command: ["l", [278.3203125, 486.51898193359375], [278.04931640625, 486.51898193359375]] },
    { itemIndex: 2, command: ["l", [278.04931640625, 486.51898193359375], [274.59332275390625, 513.5399780273438]] },
    { itemIndex: 3, command: ["l", [274.59332275390625, 513.5399780273438], [273.4283142089844, 513.5399780273438]] },
    { itemIndex: 4, command: ["l", [273.4283142089844, 513.5399780273438], [277.04632568359375, 485.3809814453125]] },
    { itemIndex: 5, command: ["l", [277.04632568359375, 485.3809814453125], [278.19830322265625, 485.3809814453125]] },
    { itemIndex: 6, command: ["l", [278.19830322265625, 485.3809814453125], [278.3203125, 485.3809814453125]] },
  ] },
  { pathIndex: 52409, seqno: 52409, boundsPt: [271.19232177734375, 485.0010070800781, 278.19830322265625, 513.541015625], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [274.9193115234375, 488.56500244140625], [275.2043151855469, 486.3710021972656]] },
    { itemIndex: 1, command: ["l", [275.2043151855469, 486.3710021972656], [274.1473083496094, 486.2480163574219]] },
    { itemIndex: 2, command: ["l", [274.1473083496094, 486.2480163574219], [274.309326171875, 485.0010070800781]] },
    { itemIndex: 3, command: ["l", [274.309326171875, 485.0010070800781], [276.4643249511719, 485.0010070800781]] },
    { itemIndex: 4, command: ["l", [276.4643249511719, 485.0010070800781], [276.43731689453125, 485.1499938964844]] },
    { itemIndex: 5, command: ["l", [276.43731689453125, 485.1499938964844], [278.19830322265625, 485.3800048828125]] },
    { itemIndex: 6, command: ["l", [278.19830322265625, 485.3800048828125], [277.0453186035156, 485.3800048828125]] },
    { itemIndex: 7, command: ["l", [277.0453186035156, 485.3800048828125], [273.42730712890625, 513.541015625]] },
    { itemIndex: 8, command: ["l", [273.42730712890625, 513.541015625], [271.19232177734375, 513.541015625]] },
    { itemIndex: 9, command: ["l", [271.19232177734375, 513.541015625], [271.36932373046875, 512.1439819335938]] },
    { itemIndex: 10, command: ["l", [271.36932373046875, 512.1439819335938], [271.8973083496094, 8392081 / 16384]] },
    { itemIndex: 11, command: ["l", [271.8973083496094, 8392081 / 16384], [272.1683044433594, 510.0159912109375]] },
    { itemIndex: 12, command: ["l", [272.1683044433594, 510.0159912109375], [271.6533203125, 509.9490051269531]] },
    { itemIndex: 13, command: ["l", [271.6533203125, 509.9490051269531], [272.11431884765625, 506.30499267578125]] },
    { itemIndex: 14, command: ["l", [272.11431884765625, 506.30499267578125], [271.5852966308594, 506.2359924316406]] },
    { itemIndex: 15, command: ["l", [271.5852966308594, 506.2359924316406], [273.8742980957031, 488.42999267578125]] },
    { itemIndex: 16, command: ["l", [273.8742980957031, 488.42999267578125], [274.9193115234375, 488.56500244140625]] },
  ] },
  { pathIndex: 52410, seqno: 52410, boundsPt: [275.08160400390625, 514.611328125, 275.5426025390625, 8448677 / 16384], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [275.5426025390625, 515.3563232421875], [275.5426025390625, 8448677 / 16384]] },
    { itemIndex: 1, command: ["l", [275.5426025390625, 8448677 / 16384], [275.08160400390625, 8448677 / 16384]] },
    { itemIndex: 2, command: ["l", [275.08160400390625, 8448677 / 16384], [275.08160400390625, 514.611328125]] },
    { itemIndex: 3, command: ["l", [275.08160400390625, 514.611328125], [275.5426025390625, 514.611328125]] },
    { itemIndex: 4, command: ["l", [275.5426025390625, 514.611328125], [275.5426025390625, 8441157 / 16384]] },
    { itemIndex: 5, command: ["l", [275.5426025390625, 8441157 / 16384], [275.5426025390625, 515.3563232421875]] },
  ] },
  { pathIndex: 52411, seqno: 52411, boundsPt: [273.87579345703125, 486.247802734375, 275.20379638671875, 488.5647888183594], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [275.20379638671875, 486.37078857421875], [274.9187927246094, 488.5647888183594]] },
    { itemIndex: 1, command: ["l", [274.9187927246094, 488.5647888183594], [273.87579345703125, 488.4307861328125]] },
    { itemIndex: 2, command: ["l", [273.87579345703125, 488.4307861328125], [274.14678955078125, 486.247802734375]] },
    { itemIndex: 3, command: ["l", [274.14678955078125, 486.247802734375], [275.20379638671875, 486.37078857421875]] },
  ] },
  { pathIndex: 52412, seqno: 52412, boundsPt: [273.30670166015625, 8413849 / 16384, 274.59368896484375, 8432281 / 16384], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [274.59368896484375, 8413849 / 16384], [274.4447021484375, 8432281 / 16384]] },
    { itemIndex: 1, command: ["l", [274.4447021484375, 8432281 / 16384], [273.30670166015625, 514.5166015625]] },
    { itemIndex: 2, command: ["l", [273.30670166015625, 514.5166015625], [273.4286804199219, 8413849 / 16384]] },
    { itemIndex: 3, command: ["l", [273.4286804199219, 8413849 / 16384], [274.59368896484375, 8413849 / 16384]] },
  ] },
  { pathIndex: 52413, seqno: 52413, boundsPt: [271.3680114746094, 509.9485168457031, 272.1679992675781, 8392073 / 16384], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [272.1679992675781, 510.0165100097656], [271.8970031738281, 8392073 / 16384]] },
    { itemIndex: 1, command: ["l", [271.8970031738281, 8392073 / 16384], [271.3680114746094, 512.14453125]] },
    { itemIndex: 2, command: ["l", [271.3680114746094, 512.14453125], [271.6529846191406, 509.9485168457031]] },
    { itemIndex: 3, command: ["l", [271.6529846191406, 509.9485168457031], [272.1679992675781, 510.0165100097656]] },
  ] },
  { pathIndex: 52414, seqno: 52414, boundsPt: [269.5658264160156, 504.2174987792969, 269.809814453125, 505.28851318359375], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [269.809814453125, 504.2174987792969], [269.809814453125, 505.28851318359375]] },
    { itemIndex: 1, command: ["l", [269.809814453125, 505.28851318359375], [269.72882080078125, 505.28851318359375]] },
    { itemIndex: 2, command: ["l", [269.72882080078125, 505.28851318359375], [269.5658264160156, 505.28851318359375]] },
    { itemIndex: 3, command: ["l", [269.5658264160156, 505.28851318359375], [269.5658264160156, 504.2174987792969]] },
    { itemIndex: 4, command: ["l", [269.5658264160156, 504.2174987792969], [269.809814453125, 504.2174987792969]] },
  ] },
  { pathIndex: 52416, seqno: 52416, boundsPt: [260.7704772949219, 504.2174987792969, 261.2464904785156, 505.28851318359375], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [261.2464904785156, 504.2174987792969], [261.2464904785156, 505.28851318359375]] },
    { itemIndex: 1, command: ["l", [261.2464904785156, 505.28851318359375], [261.08349609375, 505.28851318359375]] },
    { itemIndex: 2, command: ["l", [261.08349609375, 505.28851318359375], [260.7704772949219, 505.28851318359375]] },
    { itemIndex: 3, command: ["l", [260.7704772949219, 505.28851318359375], [260.7704772949219, 505.24749755859375]] },
    { itemIndex: 4, command: ["l", [260.7704772949219, 505.24749755859375], [260.7704772949219, 504.2174987792969]] },
    { itemIndex: 5, command: ["l", [260.7704772949219, 504.2174987792969], [261.2464904785156, 504.2174987792969]] },
  ] },
  { pathIndex: 52417, seqno: 52417, boundsPt: [260.7578125, 484.160888671875, 261.2318115234375, 485.2319030761719], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [261.2318115234375, 484.160888671875], [261.2318115234375, 485.2319030761719]] },
    { itemIndex: 1, command: ["l", [261.2318115234375, 485.2319030761719], [261.07080078125, 485.2319030761719]] },
    { itemIndex: 2, command: ["l", [261.07080078125, 485.2319030761719], [260.7578125, 485.2319030761719]] },
    { itemIndex: 3, command: ["l", [260.7578125, 485.2319030761719], [260.7578125, 484.160888671875]] },
    { itemIndex: 4, command: ["l", [260.7578125, 484.160888671875], [261.2318115234375, 484.160888671875]] },
  ] },
  { pathIndex: 52420, seqno: 52420, boundsPt: [8172821 / 32768, 504.2171936035156, 249.8907012939453, 505.2881774902344], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [249.8907012939453, 505.2471923828125], [249.8907012939453, 505.2881774902344]] },
    { itemIndex: 1, command: ["l", [249.8907012939453, 505.2881774902344], [8177769 / 32768, 505.2881774902344]] },
    { itemIndex: 2, command: ["l", [8177769 / 32768, 505.2881774902344], [8172821 / 32768, 505.2881774902344]] },
    { itemIndex: 3, command: ["l", [8172821 / 32768, 505.2881774902344], [8172821 / 32768, 504.2171936035156]] },
    { itemIndex: 4, command: ["l", [8172821 / 32768, 504.2171936035156], [249.8907012939453, 504.2171936035156]] },
    { itemIndex: 5, command: ["l", [249.8907012939453, 504.2171936035156], [249.8907012939453, 505.2471923828125]] },
  ] },
  { pathIndex: 52421, seqno: 52421, boundsPt: [8172405 / 32768, 484.160888671875, 8187937 / 32768, 485.2319030761719], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [8187937 / 32768, 484.160888671875], [8187937 / 32768, 485.2319030761719]] },
    { itemIndex: 1, command: ["l", [8187937 / 32768, 485.2319030761719], [249.56600952148438, 485.2319030761719]] },
    { itemIndex: 2, command: ["l", [249.56600952148438, 485.2319030761719], [8172405 / 32768, 485.2319030761719]] },
    { itemIndex: 3, command: ["l", [8172405 / 32768, 485.2319030761719], [8172405 / 32768, 484.160888671875]] },
    { itemIndex: 4, command: ["l", [8172405 / 32768, 484.160888671875], [8187937 / 32768, 484.160888671875]] },
  ] },
  { pathIndex: 52426, seqno: 52426, boundsPt: [7800737 / 32768, 504.2174987792969, 7816269 / 32768, 505.28851318359375], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [7816269 / 32768, 504.2174987792969], [7816269 / 32768, 505.28851318359375]] },
    { itemIndex: 1, command: ["l", [7816269 / 32768, 505.28851318359375], [238.3726043701172, 505.28851318359375]] },
    { itemIndex: 2, command: ["l", [238.3726043701172, 505.28851318359375], [7800737 / 32768, 505.28851318359375]] },
    { itemIndex: 3, command: ["l", [7800737 / 32768, 505.28851318359375], [7800737 / 32768, 505.24749755859375]] },
    { itemIndex: 4, command: ["l", [7800737 / 32768, 505.24749755859375], [7800737 / 32768, 504.2174987792969]] },
    { itemIndex: 5, command: ["l", [7800737 / 32768, 504.2174987792969], [7816269 / 32768, 504.2174987792969]] },
  ] },
  { pathIndex: 52427, seqno: 52427, boundsPt: [238.07260131835938, 484.160888671875, 7816269 / 32768, 485.2319030761719], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [7816269 / 32768, 484.160888671875], [7816269 / 32768, 485.2319030761719]] },
    { itemIndex: 1, command: ["l", [7816269 / 32768, 485.2319030761719], [238.38560485839844, 485.2319030761719]] },
    { itemIndex: 2, command: ["l", [238.38560485839844, 485.2319030761719], [238.07260131835938, 485.2319030761719]] },
    { itemIndex: 3, command: ["l", [238.07260131835938, 485.2319030761719], [238.07260131835938, 484.160888671875]] },
    { itemIndex: 4, command: ["l", [238.07260131835938, 484.160888671875], [7816269 / 32768, 484.160888671875]] },
  ] },
  { pathIndex: 52431, seqno: 52431, boundsPt: [226.7165069580078, 484.160888671875, 227.1925048828125, 485.2319030761719], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [227.1925048828125, 484.160888671875], [227.1925048828125, 485.2319030761719]] },
    { itemIndex: 1, command: ["l", [227.1925048828125, 485.2319030761719], [226.8675079345703, 485.2319030761719]] },
    { itemIndex: 2, command: ["l", [226.8675079345703, 485.2319030761719], [226.7165069580078, 485.2319030761719]] },
    { itemIndex: 3, command: ["l", [226.7165069580078, 485.2319030761719], [226.7165069580078, 484.160888671875]] },
    { itemIndex: 4, command: ["l", [226.7165069580078, 484.160888671875], [227.1925048828125, 484.160888671875]] },
  ] },
  { pathIndex: 52432, seqno: 52432, boundsPt: [226.7039031982422, 504.2171936035156, 227.1779022216797, 505.2881774902344], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [227.1779022216797, 505.2471923828125], [227.1779022216797, 505.2881774902344]] },
    { itemIndex: 1, command: ["l", [227.1779022216797, 505.2881774902344], [226.86790466308594, 505.2881774902344]] },
    { itemIndex: 2, command: ["l", [226.86790466308594, 505.2881774902344], [226.7039031982422, 505.2881774902344]] },
    { itemIndex: 3, command: ["l", [226.7039031982422, 505.2881774902344], [226.7039031982422, 504.2171936035156]] },
    { itemIndex: 4, command: ["l", [226.7039031982422, 504.2171936035156], [227.1779022216797, 504.2171936035156]] },
    { itemIndex: 5, command: ["l", [227.1779022216797, 504.2171936035156], [227.1779022216797, 505.2471923828125]] },
  ] },
  { pathIndex: 52437, seqno: 52437, boundsPt: [6970373 / 32768, 483.29400634765625, 221.2559051513672, 505.58599853515625], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [221.2559051513672, 483.29400634765625], [7241725 / 32768, 485.3130187988281]] },
    { itemIndex: 1, command: ["l", [7241725 / 32768, 485.3130187988281], [218.5998992919922, 504.0950012207031]] },
    { itemIndex: 2, command: ["l", [218.5998992919922, 504.0950012207031], [218.58590698242188, 504.2170104980469]] },
    { itemIndex: 3, command: ["l", [218.58590698242188, 504.2170104980469], [218.451904296875, 505.2879943847656]] },
    { itemIndex: 4, command: ["l", [218.451904296875, 505.2879943847656], [218.43690490722656, 505.3550109863281]] },
    { itemIndex: 5, command: ["l", [218.43690490722656, 505.3550109863281], [216.6359100341797, 505.125]] },
    { itemIndex: 6, command: ["l", [216.6359100341797, 505.125], [219.20989990234375, 485.09600830078125]] },
    { itemIndex: 7, command: ["l", [219.20989990234375, 485.09600830078125], [217.1359100341797, 485.09600830078125]] },
    { itemIndex: 8, command: ["l", [217.1359100341797, 485.09600830078125], [214.54991149902344, 505.2879943847656]] },
    { itemIndex: 9, command: ["l", [214.54991149902344, 505.2879943847656], [7029421 / 32768, 505.58599853515625]] },
    { itemIndex: 10, command: ["l", [7029421 / 32768, 505.58599853515625], [214.5089111328125, 505.58599853515625]] },
    { itemIndex: 11, command: ["l", [214.5089111328125, 505.58599853515625], [6970373 / 32768, 505.3550109863281]] },
    { itemIndex: 12, command: ["l", [6970373 / 32768, 505.3550109863281], [212.86891174316406, 504.1759948730469]] },
    { itemIndex: 13, command: ["l", [212.86891174316406, 504.1759948730469], [6978401 / 32768, 503.4720153808594]] },
    { itemIndex: 14, command: ["l", [6978401 / 32768, 503.4720153808594], [213.0319061279297, 503.4720153808594]] },
    { itemIndex: 15, command: ["l", [213.0319061279297, 503.4720153808594], [213.6269073486328, 498.8240051269531]] },
    { itemIndex: 16, command: ["l", [213.6269073486328, 498.8240051269531], [213.55889892578125, 498.80999755859375]] },
    { itemIndex: 17, command: ["l", [213.55889892578125, 498.80999755859375], [213.8029022216797, 496.8860168457031]] },
    { itemIndex: 18, command: ["l", [213.8029022216797, 496.8860168457031], [213.8859100341797, 496.8990173339844]] },
    { itemIndex: 19, command: ["l", [213.8859100341797, 496.8990173339844], [214.27890014648438, 493.80999755859375]] },
    { itemIndex: 20, command: ["l", [214.27890014648438, 493.80999755859375], [214.19590759277344, 493.80999755859375]] },
    { itemIndex: 21, command: ["l", [214.19590759277344, 493.80999755859375], [214.805908203125, 489.0820007324219]] },
    { itemIndex: 22, command: ["l", [214.805908203125, 489.0820007324219], [214.87290954589844, 489.0820007324219]] },
    { itemIndex: 23, command: ["l", [214.87290954589844, 489.0820007324219], [215.28089904785156, 486.0039978027344]] },
    { itemIndex: 24, command: ["l", [215.28089904785156, 486.0039978027344], [215.1988983154297, 485.9909973144531]] },
    { itemIndex: 25, command: ["l", [215.1988983154297, 485.9909973144531], [215.5369110107422, 483.29400634765625]] },
    { itemIndex: 26, command: ["l", [215.5369110107422, 483.29400634765625], [216.4589080810547, 483.29400634765625]] },
    { itemIndex: 27, command: ["l", [216.4589080810547, 483.29400634765625], [216.4589080810547, 483.36199951171875]] },
    { itemIndex: 28, command: ["l", [216.4589080810547, 483.36199951171875], [217.75990295410156, 483.36199951171875]] },
    { itemIndex: 29, command: ["l", [217.75990295410156, 483.36199951171875], [217.75990295410156, 483.29400634765625]] },
    { itemIndex: 30, command: ["l", [217.75990295410156, 483.29400634765625], [218.81690979003906, 483.29400634765625]] },
    { itemIndex: 31, command: ["l", [218.81690979003906, 483.29400634765625], [221.2559051513672, 483.29400634765625]] },
  ] },
  { pathIndex: 52441, seqno: 52441, boundsPt: [214.5500030517578, 485.09649658203125, 219.2100067138672, 505.2875061035156], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [219.2100067138672, 485.09649658203125], [216.6370086669922, 505.12548828125]] },
    { itemIndex: 1, command: ["l", [216.6370086669922, 505.12548828125], [216.62200927734375, 505.2875061035156]] },
    { itemIndex: 2, command: ["l", [216.62200927734375, 505.2875061035156], [214.5500030517578, 505.2875061035156]] },
    { itemIndex: 3, command: ["l", [214.5500030517578, 505.2875061035156], [217.1370086669922, 485.09649658203125]] },
    { itemIndex: 4, command: ["l", [217.1370086669922, 485.09649658203125], [219.2100067138672, 485.09649658203125]] },
  ] },
  { pathIndex: 52442, seqno: 52442, boundsPt: [218.66819763183594, 504.2174987792969, 218.91220092773438, 505.28851318359375], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [218.91220092773438, 504.2174987792969], [218.91220092773438, 505.28851318359375]] },
    { itemIndex: 1, command: ["l", [218.91220092773438, 505.28851318359375], [218.74920654296875, 505.28851318359375]] },
    { itemIndex: 2, command: ["l", [218.74920654296875, 505.28851318359375], [218.66819763183594, 505.28851318359375]] },
    { itemIndex: 3, command: ["l", [218.66819763183594, 505.28851318359375], [218.66819763183594, 504.2174987792969]] },
    { itemIndex: 4, command: ["l", [218.66819763183594, 504.2174987792969], [218.91220092773438, 504.2174987792969]] },
  ] },
  { pathIndex: 52443, seqno: 52443, boundsPt: [6926405 / 32768, 505.1257019042969, 218.43710327148438, 515.8447265625], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [218.43710327148438, 505.355712890625], [218.2611083984375, 506.76470947265625]] },
    { itemIndex: 1, command: ["l", [218.2611083984375, 506.76470947265625], [218.22210693359375, 506.751708984375]] },
    { itemIndex: 2, command: ["l", [218.22210693359375, 506.751708984375], [218.2071075439453, 506.7917175292969]] },
    { itemIndex: 3, command: ["l", [218.2071075439453, 506.7917175292969], [7151521 / 32768, 506.8047180175781]] },
    { itemIndex: 4, command: ["l", [7151521 / 32768, 506.8047180175781], [217.85411071777344, 509.9356994628906]] },
    { itemIndex: 5, command: ["l", [217.85411071777344, 509.9356994628906], [217.77410888671875, 509.9226989746094]] },
    { itemIndex: 6, command: ["l", [217.77410888671875, 509.9226989746094], [217.381103515625, 513.0107421875]] },
    { itemIndex: 7, command: ["l", [217.381103515625, 513.0107421875], [217.4490966796875, 8405413 / 16384]] },
    { itemIndex: 8, command: ["l", [217.4490966796875, 8405413 / 16384], [217.09710693359375, 515.8447265625]] },
    { itemIndex: 9, command: ["l", [217.09710693359375, 515.8447265625], [216.0131072998047, 515.8447265625]] },
    { itemIndex: 10, command: ["l", [216.0131072998047, 515.8447265625], [216.0131072998047, 515.7626953125]] },
    { itemIndex: 11, command: ["l", [216.0131072998047, 515.7626953125], [6957469 / 32768, 515.7626953125]] },
    { itemIndex: 12, command: ["l", [6957469 / 32768, 515.7626953125], [6957469 / 32768, 515.8447265625]] },
    { itemIndex: 13, command: ["l", [6957469 / 32768, 515.8447265625], [6926405 / 32768, 515.8447265625]] },
    { itemIndex: 14, command: ["l", [6926405 / 32768, 515.8447265625], [211.50010681152344, 514.8956909179688]] },
    { itemIndex: 15, command: ["l", [211.50010681152344, 514.8956909179688], [211.56809997558594, 514.8956909179688]] },
    { itemIndex: 16, command: ["l", [211.56809997558594, 514.8956909179688], [211.8101043701172, 513.064697265625]] },
    { itemIndex: 17, command: ["l", [211.8101043701172, 513.064697265625], [6938005 / 32768, 513.052734375]] },
    { itemIndex: 18, command: ["l", [6938005 / 32768, 513.052734375], [212.13710021972656, 509.8957214355469]] },
    { itemIndex: 19, command: ["l", [212.13710021972656, 509.8957214355469], [212.21710205078125, 509.8957214355469]] },
    { itemIndex: 20, command: ["l", [212.21710205078125, 509.8957214355469], [212.610107421875, 506.8197021484375]] },
    { itemIndex: 21, command: ["l", [212.610107421875, 506.8197021484375], [212.5301055908203, 506.8047180175781]] },
    { itemIndex: 22, command: ["l", [212.5301055908203, 506.8047180175781], [212.71810913085938, 505.355712890625]] },
    { itemIndex: 23, command: ["l", [212.71810913085938, 505.355712890625], [214.5091094970703, 505.5857238769531]] },
    { itemIndex: 24, command: ["l", [214.5091094970703, 505.5857238769531], [214.52110290527344, 505.5857238769531]] },
    { itemIndex: 25, command: ["l", [214.52110290527344, 505.5857238769531], [213.96510314941406, 509.86871337890625]] },
    { itemIndex: 26, command: ["l", [213.96510314941406, 509.86871337890625], [213.6811065673828, 512.1027221679688]] },
    { itemIndex: 27, command: ["l", [213.6811065673828, 512.1027221679688], [213.4381103515625, 514.0267333984375]] },
    { itemIndex: 28, command: ["l", [213.4381103515625, 514.0267333984375], [215.49610900878906, 514.0267333984375]] },
    { itemIndex: 29, command: ["l", [215.49610900878906, 514.0267333984375], [215.71310424804688, 512.3616943359375]] },
    { itemIndex: 30, command: ["l", [215.71310424804688, 512.3616943359375], [215.99810791015625, 510.1257019042969]] },
    { itemIndex: 31, command: ["l", [215.99810791015625, 510.1257019042969], [216.62110900878906, 505.2877197265625]] },
    { itemIndex: 32, command: ["l", [216.62110900878906, 505.2877197265625], [216.6361083984375, 505.1257019042969]] },
    { itemIndex: 33, command: ["l", [216.6361083984375, 505.1257019042969], [218.43710327148438, 505.355712890625]] },
  ] },
  { pathIndex: 52444, seqno: 52444, boundsPt: [213.9654998779297, 505.2882080078125, 216.6215057373047, 510.12420654296875], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [216.6215057373047, 505.2882080078125], [215.99850463867188, 510.12420654296875]] },
    { itemIndex: 1, command: ["l", [215.99850463867188, 510.12420654296875], [215.7675018310547, 510.0992126464844]] },
    { itemIndex: 2, command: ["l", [215.7675018310547, 510.0992126464844], [214.98150634765625, 509.9902038574219]] },
    { itemIndex: 3, command: ["l", [214.98150634765625, 509.9902038574219], [214.1955108642578, 509.8941955566406]] },
    { itemIndex: 4, command: ["l", [214.1955108642578, 509.8941955566406], [213.9654998779297, 509.8681945800781]] },
    { itemIndex: 5, command: ["l", [213.9654998779297, 509.8681945800781], [214.52149963378906, 505.5862121582031]] },
    { itemIndex: 6, command: ["l", [214.52149963378906, 505.5862121582031], [214.54949951171875, 505.2882080078125]] },
    { itemIndex: 7, command: ["l", [214.54949951171875, 505.2882080078125], [216.6215057373047, 505.2882080078125]] },
  ] },
  { pathIndex: 52445, seqno: 52445, boundsPt: [214.69720458984375, 509.989990234375, 7077829 / 32768, 512.3610229492188], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [7077829 / 32768, 510.125], [215.71319580078125, 512.3610229492188]] },
    { itemIndex: 1, command: ["l", [215.71319580078125, 512.3610229492188], [215.4832000732422, 512.333984375]] },
    { itemIndex: 2, command: ["l", [215.4832000732422, 512.333984375], [214.69720458984375, 512.2249755859375]] },
    { itemIndex: 3, command: ["l", [214.69720458984375, 512.2249755859375], [214.98219299316406, 509.989990234375]] },
    { itemIndex: 4, command: ["l", [214.98219299316406, 509.989990234375], [215.76820373535156, 510.0979919433594]] },
    { itemIndex: 5, command: ["l", [215.76820373535156, 510.0979919433594], [7077829 / 32768, 510.125]] },
  ] },
  { pathIndex: 52446, seqno: 52446, boundsPt: [213.43670654296875, 512.1044921875, 215.7136993408203, 514.0264892578125], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [215.7136993408203, 512.3615112304688], [215.4967041015625, 514.0264892578125]] },
    { itemIndex: 1, command: ["l", [215.4967041015625, 514.0264892578125], [213.43670654296875, 514.0264892578125]] },
    { itemIndex: 2, command: ["l", [213.43670654296875, 514.0264892578125], [7001889 / 32768, 512.1044921875]] },
    { itemIndex: 3, command: ["l", [7001889 / 32768, 512.1044921875], [213.9116973876953, 512.1315307617188]] },
    { itemIndex: 4, command: ["l", [213.9116973876953, 512.1315307617188], [214.69769287109375, 512.2244873046875]] },
    { itemIndex: 5, command: ["l", [214.69769287109375, 512.2244873046875], [215.48370361328125, 512.33349609375]] },
    { itemIndex: 6, command: ["l", [215.48370361328125, 512.33349609375], [215.7136993408203, 512.3615112304688]] },
  ] },
  { pathIndex: 52447, seqno: 52447, boundsPt: [213.68080139160156, 509.86810302734375, 214.98179626464844, 512.22509765625], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [214.98179626464844, 509.9901123046875], [214.69679260253906, 512.22509765625]] },
    { itemIndex: 1, command: ["l", [214.69679260253906, 512.22509765625], [7009429 / 32768, 512.131103515625]] },
    { itemIndex: 2, command: ["l", [7009429 / 32768, 512.131103515625], [213.68080139160156, 512.1041259765625]] },
    { itemIndex: 3, command: ["l", [213.68080139160156, 512.1041259765625], [213.96578979492188, 509.86810302734375]] },
    { itemIndex: 4, command: ["l", [213.96578979492188, 509.86810302734375], [214.19580078125, 509.8951110839844]] },
    { itemIndex: 5, command: ["l", [214.19580078125, 509.8951110839844], [214.98179626464844, 509.9901123046875]] },
  ] },
  { pathIndex: 52450, seqno: 52450, boundsPt: [212.4748992919922, 504.2174987792969, 6970373 / 32768, 505.28851318359375], style: 'opaque-fill', items: [
    { itemIndex: 0, command: ["l", [6970373 / 32768, 504.2174987792969], [6970373 / 32768, 505.28851318359375]] },
    { itemIndex: 1, command: ["l", [6970373 / 32768, 505.28851318359375], [212.63790893554688, 505.28851318359375]] },
    { itemIndex: 2, command: ["l", [212.63790893554688, 505.28851318359375], [212.4748992919922, 505.28851318359375]] },
    { itemIndex: 3, command: ["l", [212.4748992919922, 505.28851318359375], [212.4748992919922, 504.2174987792969]] },
    { itemIndex: 4, command: ["l", [212.4748992919922, 504.2174987792969], [6970373 / 32768, 504.2174987792969]] },
  ] },
  { pathIndex: 52738, seqno: 52740, boundsPt: [217.75559997558594, 483.288818359375, 217.75559997558594, 483.3688049316406], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [217.75559997558594, 483.288818359375], [217.75559997558594, 483.3688049316406]] },
  ] },
  { pathIndex: 52739, seqno: 52741, boundsPt: [216.4561004638672, 483.2881164550781, 216.4561004638672, 483.36810302734375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [216.4561004638672, 483.36810302734375], [216.4561004638672, 483.2881164550781]] },
  ] },
  { pathIndex: 52740, seqno: 52742, boundsPt: [7092817 / 32768, 483.36810302734375, 217.75559997558594, 483.36810302734375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [217.75559997558594, 483.36810302734375], [7092817 / 32768, 483.36810302734375]] },
  ] },
  { pathIndex: 52741, seqno: 52743, boundsPt: [216.4561004638672, 483.288818359375, 217.75509643554688, 483.288818359375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [216.4561004638672, 483.288818359375], [217.75509643554688, 483.288818359375]] },
  ] },
  { pathIndex: 53079, seqno: 53081, boundsPt: [7125477 / 32768, 509.9359130859375, 7138453 / 32768, 513.0219116210938], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [7138453 / 32768, 509.9359130859375], [7125477 / 32768, 513.0219116210938]] },
  ] },
  { pathIndex: 53080, seqno: 53082, boundsPt: [217.37460327148438, 509.9256896972656, 217.77059936523438, 513.0126953125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [217.37460327148438, 513.0126953125], [217.77059936523438, 509.9256896972656]] },
  ] },
  { pathIndex: 53081, seqno: 53083, boundsPt: [217.7700958251953, 509.92529296875, 217.84909057617188, 509.936279296875], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [217.7700958251953, 509.92529296875], [217.84909057617188, 509.936279296875]] },
  ] },
  { pathIndex: 53082, seqno: 53084, boundsPt: [217.3736114501953, 513.012939453125, 217.45260620117188, 513.0219116210938], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [217.45260620117188, 513.0219116210938], [217.3736114501953, 513.012939453125]] },
  ] },
  { pathIndex: 53321, seqno: 53323, boundsPt: [212.32980346679688, 515.8406982421875, 216.01280212402344, 515.8406982421875], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [216.01280212402344, 515.8406982421875], [212.32980346679688, 515.8406982421875]] },
  ] },
  { pathIndex: 53322, seqno: 53324, boundsPt: [212.32980346679688, 515.7625732421875, 216.01280212402344, 515.7625732421875], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [212.32980346679688, 515.7625732421875], [216.01280212402344, 515.7625732421875]] },
  ] },
  { pathIndex: 53323, seqno: 53325, boundsPt: [212.32980346679688, 515.76171875, 212.32980346679688, 515.8406982421875], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [212.32980346679688, 515.8406982421875], [212.32980346679688, 515.76171875]] },
  ] },
  { pathIndex: 53324, seqno: 53326, boundsPt: [216.01280212402344, 515.7625732421875, 216.01280212402344, 515.841552734375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [216.01280212402344, 515.7625732421875], [216.01280212402344, 515.841552734375]] },
  ] },
  { pathIndex: 53325, seqno: 53327, boundsPt: [214.80189514160156, 485.9886779785156, 215.19789123535156, 489.07568359375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [214.80189514160156, 489.07568359375], [215.19789123535156, 485.9886779785156]] },
  ] },
  { pathIndex: 53326, seqno: 53328, boundsPt: [214.87960815429688, 485.9989929199219, 215.27560424804688, 489.0849914550781], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [215.27560424804688, 485.9989929199219], [214.87960815429688, 489.0849914550781]] },
  ] },
  { pathIndex: 53327, seqno: 53329, boundsPt: [214.8009033203125, 489.07598876953125, 214.87989807128906, 489.0849914550781], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [214.87989807128906, 489.0849914550781], [214.8009033203125, 489.07598876953125]] },
  ] },
  { pathIndex: 53328, seqno: 53330, boundsPt: [215.19760131835938, 485.9884033203125, 215.27659606933594, 485.9993896484375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [215.19760131835938, 485.9884033203125], [215.27659606933594, 485.9993896484375]] },
  ] },
  { pathIndex: 53329, seqno: 53331, boundsPt: [7005805 / 32768, 493.80450439453125, 7018781 / 32768, 496.8915100097656], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [7005805 / 32768, 496.8915100097656], [7018781 / 32768, 493.80450439453125]] },
  ] },
  { pathIndex: 53330, seqno: 53332, boundsPt: [213.87789916992188, 493.814697265625, 214.27389526367188, 496.90069580078125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [214.27389526367188, 493.814697265625], [213.87789916992188, 496.90069580078125]] },
  ] },
  { pathIndex: 53331, seqno: 53333, boundsPt: [213.79920959472656, 496.8916931152344, 7008361 / 32768, 496.90069580078125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [7008361 / 32768, 496.90069580078125], [213.79920959472656, 496.8916931152344]] },
  ] },
  { pathIndex: 53332, seqno: 53334, boundsPt: [214.19569396972656, 493.80419921875, 7021353 / 32768, 493.815185546875], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [214.19569396972656, 493.80419921875], [7021353 / 32768, 493.815185546875]] },
  ] },
  { pathIndex: 53333, seqno: 53335, boundsPt: [212.95849609375, 498.81500244140625, 6997721 / 32768, 503.46600341796875], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [212.95849609375, 503.46600341796875], [6997721 / 32768, 498.81500244140625]] },
  ] },
  { pathIndex: 53334, seqno: 53336, boundsPt: [213.03700256347656, 498.8262023925781, 213.6320037841797, 503.4772033691406], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [213.6320037841797, 498.8262023925781], [213.03700256347656, 503.4772033691406]] },
  ] },
  { pathIndex: 53335, seqno: 53337, boundsPt: [212.95761108398438, 503.4656066894531, 213.03660583496094, 503.4765930175781], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [213.03660583496094, 503.4765930175781], [212.95761108398438, 503.4656066894531]] },
  ] },
  { pathIndex: 53336, seqno: 53338, boundsPt: [213.5540008544922, 498.81561279296875, 213.63299560546875, 498.82659912109375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [213.5540008544922, 498.81561279296875], [213.63299560546875, 498.82659912109375]] },
  ] },
  { pathIndex: 53337, seqno: 53339, boundsPt: [211.49349975585938, 513.0557861328125, 211.7294921875, 514.8917846679688], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [211.49349975585938, 514.8917846679688], [211.7294921875, 513.0557861328125]] },
  ] },
  { pathIndex: 53338, seqno: 53340, boundsPt: [211.5712127685547, 8406065 / 16384, 211.8072052001953, 514.9014892578125], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [211.8072052001953, 8406065 / 16384], [211.5712127685547, 514.9014892578125]] },
  ] },
  { pathIndex: 53339, seqno: 53341, boundsPt: [211.4925079345703, 8435981 / 16384, 211.57150268554688, 8436161 / 16384], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [211.57150268554688, 8436161 / 16384], [211.4925079345703, 8435981 / 16384]] },
  ] },
  { pathIndex: 53340, seqno: 53342, boundsPt: [211.72900390625, 513.054931640625, 211.80799865722656, 513.06591796875], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [211.72900390625, 513.054931640625], [211.80799865722656, 513.06591796875]] },
  ] },
  { pathIndex: 53341, seqno: 53343, boundsPt: [212.1352996826172, 506.8034973144531, 212.5312957763672, 509.8894958496094], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [212.1352996826172, 509.8894958496094], [212.5312957763672, 506.8034973144531]] },
  ] },
  { pathIndex: 53342, seqno: 53344, boundsPt: [212.21299743652344, 506.81268310546875, 212.60899353027344, 509.8996887207031], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [212.60899353027344, 506.81268310546875], [212.21299743652344, 509.8996887207031]] },
  ] },
  { pathIndex: 53343, seqno: 53345, boundsPt: [212.1343994140625, 509.88909912109375, 212.21339416503906, 509.90008544921875], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [212.21339416503906, 509.90008544921875], [212.1343994140625, 509.88909912109375]] },
  ] },
  { pathIndex: 53344, seqno: 53346, boundsPt: [212.53089904785156, 506.80340576171875, 6966801 / 32768, 506.8124084472656], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [212.53089904785156, 506.80340576171875], [6966801 / 32768, 506.8124084472656]] },
  ] },
  { pathIndex: 53345, seqno: 53347, boundsPt: [218.25050354003906, 506.7604064941406, 218.25550842285156, 506.7994079589844], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [218.25050354003906, 506.7994079589844], [218.25550842285156, 506.7604064941406]] },
  ] },
  { pathIndex: 53346, seqno: 53348, boundsPt: [218.216796875, 506.7557067871094, 218.25579833984375, 506.75970458984375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [218.25579833984375, 506.75970458984375], [218.216796875, 506.7557067871094]] },
  ] },
  { pathIndex: 53347, seqno: 53349, boundsPt: [7150341 / 32768, 506.75579833984375, 7150505 / 32768, 506.7937927246094], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [7150505 / 32768, 506.75579833984375], [7150341 / 32768, 506.7937927246094]] },
  ] },
  { pathIndex: 53348, seqno: 53350, boundsPt: [218.21080017089844, 506.794189453125, 218.2498016357422, 506.7991943359375], style: 'glazing-detail', items: [
    { itemIndex: 0, command: ["l", [218.21080017089844, 506.794189453125], [218.2498016357422, 506.7991943359375]] },
  ] },
  { pathIndex: 53975, seqno: 53977, boundsPt: [285.25201416015625, 486.59979248046875, 285.5660095214844, 486.59979248046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [285.25201416015625, 486.59979248046875], [285.5660095214844, 486.59979248046875]] },
  ] },
  { pathIndex: 53976, seqno: 53978, boundsPt: [285.25201416015625, 485.29888916015625, 285.25201416015625, 486.5998840332031], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [285.25201416015625, 485.29888916015625], [285.25201416015625, 486.5998840332031]] },
  ] },
  { pathIndex: 53977, seqno: 53979, boundsPt: [285.25299072265625, 485.29888916015625, 285.5669860839844, 485.29888916015625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [285.5669860839844, 485.29888916015625], [285.25299072265625, 485.29888916015625]] },
  ] },
  { pathIndex: 53978, seqno: 53980, boundsPt: [285.5669860839844, 485.2987976074219, 285.5669860839844, 486.59979248046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [285.5669860839844, 486.59979248046875], [285.5669860839844, 485.2987976074219]] },
  ] },
  { pathIndex: 53979, seqno: 53981, boundsPt: [278.318603515625, 485.29888916015625, 278.6325988769531, 485.29888916015625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [278.6325988769531, 485.29888916015625], [278.318603515625, 485.29888916015625]] },
  ] },
  { pathIndex: 53980, seqno: 53982, boundsPt: [278.6325988769531, 485.2987976074219, 278.6325988769531, 486.59979248046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [278.6325988769531, 486.59979248046875], [278.6325988769531, 485.2987976074219]] },
  ] },
  { pathIndex: 53981, seqno: 53983, boundsPt: [278.3175964355469, 486.59979248046875, 278.631591796875, 486.59979248046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [278.3175964355469, 486.59979248046875], [278.631591796875, 486.59979248046875]] },
  ] },
  { pathIndex: 53982, seqno: 53984, boundsPt: [278.3175964355469, 485.29888916015625, 278.3175964355469, 486.5998840332031], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [278.3175964355469, 485.29888916015625], [278.3175964355469, 486.5998840332031]] },
  ] },
  { pathIndex: 54060, seqno: 54062, boundsPt: [282.16680908203125, 8431369 / 16384, 282.6398010253906, 8431369 / 16384], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [282.6398010253906, 8431369 / 16384], [282.16680908203125, 8431369 / 16384]] },
  ] },
  { pathIndex: 54061, seqno: 54063, boundsPt: [282.16729736328125, 8431369 / 16384, 282.16729736328125, 515.6739501953125], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [282.16729736328125, 8431369 / 16384], [282.16729736328125, 515.6739501953125]] },
  ] },
  { pathIndex: 54062, seqno: 54064, boundsPt: [282.16729736328125, 515.673828125, 282.6402893066406, 515.673828125], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [282.16729736328125, 515.673828125], [282.6402893066406, 515.673828125]] },
  ] },
  { pathIndex: 54063, seqno: 54065, boundsPt: [282.6398010253906, 514.6098022460938, 282.6398010253906, 515.673828125], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [282.6398010253906, 515.673828125], [282.6398010253906, 514.6098022460938]] },
  ] },
  { pathIndex: 54132, seqno: 54134, boundsPt: [275.0749206542969, 8431369 / 16384, 275.54791259765625, 8431369 / 16384], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [275.54791259765625, 8431369 / 16384], [275.0749206542969, 8431369 / 16384]] },
  ] },
  { pathIndex: 54133, seqno: 54135, boundsPt: [275.0754089355469, 8431369 / 16384, 275.0754089355469, 515.6739501953125], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [275.0754089355469, 8431369 / 16384], [275.0754089355469, 515.6739501953125]] },
  ] },
  { pathIndex: 54134, seqno: 54136, boundsPt: [275.0754089355469, 515.673828125, 275.54840087890625, 515.673828125], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [275.0754089355469, 515.673828125], [275.54840087890625, 515.673828125]] },
  ] },
  { pathIndex: 54135, seqno: 54137, boundsPt: [275.54791259765625, 514.6098022460938, 275.54791259765625, 515.673828125], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [275.54791259765625, 515.673828125], [275.54791259765625, 514.6098022460938]] },
  ] },
  { pathIndex: 54156, seqno: 54158, boundsPt: [348.0752868652344, 493.34881591796875, 348.2132873535156, 493.80181884765625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [348.2132873535156, 493.34881591796875], [348.0752868652344, 493.80181884765625]] },
  ] },
  { pathIndex: 54157, seqno: 54159, boundsPt: [348.0755920410156, 493.801513671875, 349.24359130859375, 494.1565246582031], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [348.0755920410156, 493.801513671875], [349.24359130859375, 494.1565246582031]] },
  ] },
  { pathIndex: 54158, seqno: 54160, boundsPt: [349.2442932128906, 493.7051086425781, 349.3822937011719, 494.1560974121094], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [349.2442932128906, 494.1560974121094], [349.3822937011719, 493.7051086425781]] },
  ] },
  { pathIndex: 54159, seqno: 54161, boundsPt: [348.21380615234375, 493.34881591796875, 349.3818054199219, 493.7048034667969], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [349.3818054199219, 493.7048034667969], [348.21380615234375, 493.34881591796875]] },
  ] },
  { pathIndex: 54333, seqno: 54335, boundsPt: [261.2398986816406, 504.2189025878906, 269.5729064941406, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [269.5729064941406, 504.2189025878906], [261.2398986816406, 504.2189025878906]] },
  ] },
  { pathIndex: 54334, seqno: 54336, boundsPt: [7816177 / 32768, 504.2189025878906, 249.4127960205078, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [249.4127960205078, 504.2189025878906], [7816177 / 32768, 504.2189025878906]] },
  ] },
  { pathIndex: 54335, seqno: 54337, boundsPt: [260.7666931152344, 504.2189025878906, 261.23968505859375, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [261.23968505859375, 504.2189025878906], [260.7666931152344, 504.2189025878906]] },
  ] },
  { pathIndex: 54336, seqno: 54338, boundsPt: [260.7673034667969, 504.2189025878906, 260.7673034667969, 505.28289794921875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [260.7673034667969, 504.2189025878906], [260.7673034667969, 505.28289794921875]] },
  ] },
  { pathIndex: 54337, seqno: 54339, boundsPt: [260.7673034667969, 505.2829895019531, 261.24029541015625, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [260.7673034667969, 505.2829895019531], [261.24029541015625, 505.2829895019531]] },
  ] },
  { pathIndex: 54338, seqno: 54340, boundsPt: [261.23968505859375, 504.218994140625, 261.23968505859375, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [261.23968505859375, 505.2829895019531], [261.23968505859375, 504.218994140625]] },
  ] },
  { pathIndex: 54339, seqno: 54341, boundsPt: [249.4123992919922, 504.2189025878906, 8188245 / 32768, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [8188245 / 32768, 504.2189025878906], [249.4123992919922, 504.2189025878906]] },
  ] },
  { pathIndex: 54340, seqno: 54342, boundsPt: [249.4127960205078, 504.2189025878906, 249.4127960205078, 505.28289794921875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [249.4127960205078, 504.2189025878906], [249.4127960205078, 505.28289794921875]] },
  ] },
  { pathIndex: 54341, seqno: 54343, boundsPt: [249.4127960205078, 505.2829895019531, 249.88580322265625, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [249.4127960205078, 505.2829895019531], [249.88580322265625, 505.2829895019531]] },
  ] },
  { pathIndex: 54342, seqno: 54344, boundsPt: [8188245 / 32768, 504.218994140625, 8188245 / 32768, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [8188245 / 32768, 505.2829895019531], [8188245 / 32768, 504.218994140625]] },
  ] },
  { pathIndex: 54343, seqno: 54345, boundsPt: [238.0570068359375, 504.2189025878906, 238.531005859375, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [238.531005859375, 504.2189025878906], [238.0570068359375, 504.2189025878906]] },
  ] },
  { pathIndex: 54344, seqno: 54346, boundsPt: [238.05709838867188, 504.2189025878906, 238.05709838867188, 505.28289794921875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [238.05709838867188, 504.2189025878906], [238.05709838867188, 505.28289794921875]] },
  ] },
  { pathIndex: 54345, seqno: 54347, boundsPt: [238.05709838867188, 505.2829895019531, 238.53109741210938, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [238.05709838867188, 505.2829895019531], [238.53109741210938, 505.2829895019531]] },
  ] },
  { pathIndex: 54346, seqno: 54348, boundsPt: [238.531005859375, 504.218994140625, 238.531005859375, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [238.531005859375, 505.2829895019531], [238.531005859375, 504.218994140625]] },
  ] },
  { pathIndex: 54347, seqno: 54349, boundsPt: [226.70249938964844, 504.2189025878906, 227.17649841308594, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [227.17649841308594, 504.2189025878906], [226.70249938964844, 504.2189025878906]] },
  ] },
  { pathIndex: 54348, seqno: 54350, boundsPt: [226.7028045654297, 504.2189025878906, 226.7028045654297, 505.28289794921875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [226.7028045654297, 504.2189025878906], [226.7028045654297, 505.28289794921875]] },
  ] },
  { pathIndex: 54349, seqno: 54351, boundsPt: [226.7028045654297, 505.2829895019531, 227.1768035888672, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [226.7028045654297, 505.2829895019531], [227.1768035888672, 505.2829895019531]] },
  ] },
  { pathIndex: 54350, seqno: 54352, boundsPt: [227.17649841308594, 504.218994140625, 227.17649841308594, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [227.17649841308594, 505.2829895019531], [227.17649841308594, 504.218994140625]] },
  ] },
  { pathIndex: 54351, seqno: 54353, boundsPt: [218.90679931640625, 504.2189025878906, 226.7028045654297, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [226.7028045654297, 504.2189025878906], [218.90679931640625, 504.2189025878906]] },
  ] },
  { pathIndex: 54352, seqno: 54354, boundsPt: [269.572509765625, 504.2189025878906, 269.8085021972656, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [269.8085021972656, 504.2189025878906], [269.572509765625, 504.2189025878906]] },
  ] },
  { pathIndex: 54353, seqno: 54355, boundsPt: [269.5729064941406, 504.2189025878906, 269.5729064941406, 505.28289794921875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [269.5729064941406, 504.2189025878906], [269.5729064941406, 505.28289794921875]] },
  ] },
  { pathIndex: 54354, seqno: 54356, boundsPt: [269.5729064941406, 505.2829895019531, 269.80889892578125, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [269.5729064941406, 505.2829895019531], [269.80889892578125, 505.2829895019531]] },
  ] },
  { pathIndex: 54355, seqno: 54357, boundsPt: [269.8085021972656, 504.218994140625, 269.8085021972656, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [269.8085021972656, 505.2829895019531], [269.8085021972656, 504.218994140625]] },
  ] },
  { pathIndex: 54356, seqno: 54358, boundsPt: [261.2303161621094, 484.16619873046875, 272.17730712890625, 484.16619873046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [272.17730712890625, 484.16619873046875], [261.2303161621094, 484.16619873046875]] },
  ] },
  { pathIndex: 54357, seqno: 54359, boundsPt: [238.53929138183594, 484.16619873046875, 249.4022979736328, 484.16619873046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [249.4022979736328, 484.16619873046875], [238.53929138183594, 484.16619873046875]] },
  ] },
  { pathIndex: 54358, seqno: 54360, boundsPt: [260.75640869140625, 484.16619873046875, 261.23040771484375, 484.16619873046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [261.23040771484375, 484.16619873046875], [260.75640869140625, 484.16619873046875]] },
  ] },
  { pathIndex: 54359, seqno: 54361, boundsPt: [260.7567138671875, 484.16619873046875, 260.7567138671875, 485.2301940917969], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [260.7567138671875, 484.16619873046875], [260.7567138671875, 485.2301940917969]] },
  ] },
  { pathIndex: 54360, seqno: 54362, boundsPt: [260.7567138671875, 485.2301025390625, 261.230712890625, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [260.7567138671875, 485.2301025390625], [261.230712890625, 485.2301025390625]] },
  ] },
  { pathIndex: 54361, seqno: 54363, boundsPt: [261.23040771484375, 484.1661071777344, 261.23040771484375, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [261.23040771484375, 485.2301025390625], [261.23040771484375, 484.1661071777344]] },
  ] },
  { pathIndex: 54362, seqno: 54364, boundsPt: [249.4016876220703, 484.16619873046875, 249.87469482421875, 484.16619873046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [249.87469482421875, 484.16619873046875], [249.4016876220703, 484.16619873046875]] },
  ] },
  { pathIndex: 54363, seqno: 54365, boundsPt: [249.4022979736328, 484.16619873046875, 249.4022979736328, 485.2301940917969], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [249.4022979736328, 484.16619873046875], [249.4022979736328, 485.2301940917969]] },
  ] },
  { pathIndex: 54364, seqno: 54366, boundsPt: [249.4022979736328, 485.2301025390625, 249.87530517578125, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [249.4022979736328, 485.2301025390625], [249.87530517578125, 485.2301025390625]] },
  ] },
  { pathIndex: 54365, seqno: 54367, boundsPt: [249.87469482421875, 484.1661071777344, 249.87469482421875, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [249.87469482421875, 485.2301025390625], [249.87469482421875, 484.1661071777344]] },
  ] },
  { pathIndex: 54366, seqno: 54368, boundsPt: [238.06719970703125, 484.16619873046875, 238.5402069091797, 484.16619873046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [238.5402069091797, 484.16619873046875], [238.06719970703125, 484.16619873046875]] },
  ] },
  { pathIndex: 54367, seqno: 54369, boundsPt: [238.0677947998047, 484.16619873046875, 238.0677947998047, 485.2301940917969], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [238.0677947998047, 484.16619873046875], [238.0677947998047, 485.2301940917969]] },
  ] },
  { pathIndex: 54368, seqno: 54370, boundsPt: [238.0677947998047, 485.2301025390625, 7816505 / 32768, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [238.0677947998047, 485.2301025390625], [7816505 / 32768, 485.2301025390625]] },
  ] },
  { pathIndex: 54369, seqno: 54371, boundsPt: [238.5402069091797, 484.1661071777344, 238.5402069091797, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [238.5402069091797, 485.2301025390625], [238.5402069091797, 484.1661071777344]] },
  ] },
  { pathIndex: 54370, seqno: 54372, boundsPt: [226.712890625, 484.16619873046875, 227.18589782714844, 484.16619873046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [227.18589782714844, 484.16619873046875], [226.712890625, 484.16619873046875]] },
  ] },
  { pathIndex: 54371, seqno: 54373, boundsPt: [226.7135009765625, 484.16619873046875, 226.7135009765625, 485.2301940917969], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [226.7135009765625, 484.16619873046875], [226.7135009765625, 485.2301940917969]] },
  ] },
  { pathIndex: 54372, seqno: 54374, boundsPt: [226.7135009765625, 485.2301025390625, 227.18650817871094, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [226.7135009765625, 485.2301025390625], [227.18650817871094, 485.2301025390625]] },
  ] },
  { pathIndex: 54373, seqno: 54375, boundsPt: [227.18589782714844, 484.1661071777344, 227.18589782714844, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [227.18589782714844, 485.2301025390625], [227.18589782714844, 484.1661071777344]] },
  ] },
  { pathIndex: 54374, seqno: 54376, boundsPt: [7255933 / 32768, 484.16619873046875, 226.7135009765625, 484.16619873046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [226.7135009765625, 484.16619873046875], [7255933 / 32768, 484.16619873046875]] },
  ] },
  { pathIndex: 54375, seqno: 54377, boundsPt: [272.17681884765625, 484.16619873046875, 272.4128112792969, 484.16619873046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [272.4128112792969, 484.16619873046875], [272.17681884765625, 484.16619873046875]] },
  ] },
  { pathIndex: 54376, seqno: 54378, boundsPt: [272.17730712890625, 484.16619873046875, 272.17730712890625, 485.2301940917969], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [272.17730712890625, 484.16619873046875], [272.17730712890625, 485.2301940917969]] },
  ] },
  { pathIndex: 54377, seqno: 54379, boundsPt: [272.17730712890625, 485.2301025390625, 272.4132995605469, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [272.17730712890625, 485.2301025390625], [272.4132995605469, 485.2301025390625]] },
  ] },
  { pathIndex: 54378, seqno: 54380, boundsPt: [272.4128112792969, 484.1661071777344, 272.4128112792969, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [272.4128112792969, 485.2301025390625], [272.4128112792969, 484.1661071777344]] },
  ] },
  { pathIndex: 54383, seqno: 54385, boundsPt: [212.4781036376953, 504.2189025878906, 212.4781036376953, 505.28289794921875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [212.4781036376953, 504.2189025878906], [212.4781036376953, 505.28289794921875]] },
  ] },
  { pathIndex: 54430, seqno: 54432, boundsPt: [212.47799682617188, 504.2189025878906, 6970245 / 32768, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [6970245 / 32768, 504.2189025878906], [212.47799682617188, 504.2189025878906]] },
  ] },
  { pathIndex: 54431, seqno: 54433, boundsPt: [212.4781036376953, 504.2189025878906, 212.4781036376953, 505.28289794921875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [212.4781036376953, 504.2189025878906], [212.4781036376953, 505.28289794921875]] },
  ] },
  { pathIndex: 54432, seqno: 54434, boundsPt: [212.4781036376953, 505.2829895019531, 212.71510314941406, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [212.4781036376953, 505.2829895019531], [212.71510314941406, 505.2829895019531]] },
  ] },
  { pathIndex: 54433, seqno: 54435, boundsPt: [6970245 / 32768, 504.218994140625, 6970245 / 32768, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [6970245 / 32768, 505.2829895019531], [6970245 / 32768, 504.218994140625]] },
  ] },
  { pathIndex: 54690, seqno: 54692, boundsPt: [217.75559997558594, 483.0662841796875, 218.8115997314453, 483.2022705078125], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [217.75559997558594, 483.0662841796875], [218.8115997314453, 483.2022705078125]] },
  ] },
  { pathIndex: 54691, seqno: 54693, boundsPt: [218.8115997314453, 482.7325134277344, 218.87159729003906, 483.2015075683594], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [218.8115997314453, 483.2015075683594], [218.87159729003906, 482.7325134277344]] },
  ] },
  { pathIndex: 54692, seqno: 54694, boundsPt: [217.81719970703125, 482.597900390625, 218.87120056152344, 482.73291015625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [218.87120056152344, 482.73291015625], [217.81719970703125, 482.597900390625]] },
  ] },
  { pathIndex: 54693, seqno: 54695, boundsPt: [217.7554931640625, 482.597900390625, 217.81649780273438, 483.06689453125], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [217.81649780273438, 482.597900390625], [217.7554931640625, 483.06689453125]] },
  ] },
  { pathIndex: 54779, seqno: 54781, boundsPt: [218.67140197753906, 504.2189025878906, 218.67140197753906, 505.28289794921875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [218.67140197753906, 504.2189025878906], [218.67140197753906, 505.28289794921875]] },
  ] },
  { pathIndex: 54780, seqno: 54782, boundsPt: [218.67140197753906, 505.2829895019531, 218.9073944091797, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [218.67140197753906, 505.2829895019531], [218.9073944091797, 505.2829895019531]] },
  ] },
  { pathIndex: 54781, seqno: 54783, boundsPt: [218.9069061279297, 504.218994140625, 218.9069061279297, 505.2829895019531], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [218.9069061279297, 505.2829895019531], [218.9069061279297, 504.218994140625]] },
  ] },
  { pathIndex: 54782, seqno: 54784, boundsPt: [218.67091369628906, 504.2189025878906, 218.9069061279297, 504.2189025878906], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [218.9069061279297, 504.2189025878906], [218.67091369628906, 504.2189025878906]] },
  ] },
  { pathIndex: 54783, seqno: 54785, boundsPt: [221.19639587402344, 484.16619873046875, 221.19639587402344, 485.2301940917969], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [221.19639587402344, 484.16619873046875], [221.19639587402344, 485.2301940917969]] },
  ] },
  { pathIndex: 54784, seqno: 54786, boundsPt: [221.19639587402344, 485.2301025390625, 221.4333953857422, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [221.19639587402344, 485.2301025390625], [221.4333953857422, 485.2301025390625]] },
  ] },
  { pathIndex: 54785, seqno: 54787, boundsPt: [221.43319702148438, 484.1661071777344, 221.43319702148438, 485.2301025390625], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [221.43319702148438, 485.2301025390625], [221.43319702148438, 484.1661071777344]] },
  ] },
  { pathIndex: 54786, seqno: 54788, boundsPt: [7248157 / 32768, 484.16619873046875, 221.43319702148438, 484.16619873046875], style: 'frame-detail', items: [
    { itemIndex: 0, command: ["l", [221.43319702148438, 484.16619873046875], [7248157 / 32768, 484.16619873046875]] },
  ] },
  { pathIndex: 55122, seqno: 55124, boundsPt: [278.0530090332031, 486.5203857421875, 278.3170166015625, 486.5203857421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [278.0530090332031, 486.5203857421875], [278.3170166015625, 486.5203857421875]] },
  ] },
  { pathIndex: 55123, seqno: 55125, boundsPt: [277.047607421875, 485.3782958984375, 278.3175964355469, 485.3782958984375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [278.3175964355469, 485.3782958984375], [277.047607421875, 485.3782958984375]] },
  ] },
  { pathIndex: 55124, seqno: 55126, boundsPt: [285.5669860839844, 486.5203857421875, 288.4139709472656, 486.5203857421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [285.5669860839844, 486.5203857421875], [288.4139709472656, 486.5203857421875]] },
  ] },
  { pathIndex: 55125, seqno: 55127, boundsPt: [285.5675048828125, 485.3782958984375, 289.5555114746094, 485.3782958984375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [289.5555114746094, 485.3782958984375], [285.5675048828125, 485.3782958984375]] },
  ] },
  { pathIndex: 55134, seqno: 55136, boundsPt: [274.44549560546875, 486.51953125, 278.052490234375, 514.66552734375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [274.44549560546875, 514.66552734375], [278.052490234375, 486.51953125]] },
  ] },
  { pathIndex: 55135, seqno: 55137, boundsPt: [273.3122253417969, 485.3782958984375, 277.0472106933594, 8429901 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [277.0472106933594, 485.3782958984375], [273.3122253417969, 8429901 / 16384]] },
  ] },
  { pathIndex: 55136, seqno: 55138, boundsPt: [273.3125915527344, 514.52001953125, 274.4455871582031, 514.6650390625], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [273.3125915527344, 514.52001953125], [274.4455871582031, 514.6650390625]] },
  ] },
  { pathIndex: 55226, seqno: 55228, boundsPt: [324.9276123046875, 486.5196838378906, 328.3896179199219, 8413785 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [324.9276123046875, 8413785 / 16384], [328.3896179199219, 486.5196838378906]] },
  ] },
  { pathIndex: 55227, seqno: 55229, boundsPt: [324.1531982421875, 486.5203857421875, 327.6152038574219, 8413797 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [327.6152038574219, 486.5203857421875], [324.1531982421875, 8413797 / 16384]] },
  ] },
  { pathIndex: 55312, seqno: 55314, boundsPt: [288.3848876953125, 483.2251892089844, 288.660888671875, 485.3782043457031], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [288.660888671875, 483.2251892089844], [288.3848876953125, 485.3782043457031]] },
  ] },
  { pathIndex: 55313, seqno: 55315, boundsPt: [288.3843994140625, 485.3782958984375, 290.1434020996094, 485.6033020019531], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [288.3843994140625, 485.3782958984375], [290.1434020996094, 485.6033020019531]] },
  ] },
  { pathIndex: 55314, seqno: 55316, boundsPt: [290.1430969238281, 484.997314453125, 290.22210693359375, 485.6033020019531], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [290.1430969238281, 485.6033020019531], [290.22210693359375, 484.997314453125]] },
  ] },
  { pathIndex: 55565, seqno: 55567, boundsPt: [271.1874084472656, 506.30267333984375, 272.1144104003906, 8413785 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [271.1874084472656, 8413785 / 16384], [272.1144104003906, 506.30267333984375]] },
  ] },
  { pathIndex: 55566, seqno: 55568, boundsPt: [271.5848083496094, 506.2351989746094, 272.1138000488281, 506.3031921386719], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [272.1138000488281, 506.3031921386719], [271.5848083496094, 506.2351989746094]] },
  ] },
  { pathIndex: 55567, seqno: 55569, boundsPt: [329.77362060546875, 505.1083068847656, 330.8536071777344, 513.5372924804688], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [330.8536071777344, 505.1083068847656], [329.77362060546875, 513.5372924804688]] },
  ] },
  { pathIndex: 55568, seqno: 55570, boundsPt: [330.8528747558594, 505.1084899902344, 331.59588623046875, 505.2034912109375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [331.59588623046875, 505.2034912109375], [330.8528747558594, 505.1084899902344]] },
  ] },
  { pathIndex: 55569, seqno: 55571, boundsPt: [274.30780029296875, 484.9971008300781, 276.4598083496094, 484.9971008300781], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [274.30780029296875, 484.9971008300781], [276.4598083496094, 484.9971008300781]] },
  ] },
  { pathIndex: 55570, seqno: 55572, boundsPt: [272.7471008300781, 483.2251892089844, 278.47509765625, 483.2251892089844], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [278.47509765625, 483.2251892089844], [272.7471008300781, 483.2251892089844]] },
  ] },
  { pathIndex: 55571, seqno: 55573, boundsPt: [271.585693359375, 484.9967041015625, 274.30767822265625, 506.2357177734375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [271.585693359375, 506.2357177734375], [274.30767822265625, 484.9967041015625]] },
  ] },
  { pathIndex: 55572, seqno: 55574, boundsPt: [268.5687255859375, 483.2251892089844, 272.7477111816406, 515.8402099609375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [272.7477111816406, 483.2251892089844], [268.5687255859375, 515.8402099609375]] },
  ] },
  { pathIndex: 55573, seqno: 55575, boundsPt: [276.439697265625, 484.9971008300781, 276.4596862792969, 485.152099609375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [276.4596862792969, 484.9971008300781], [276.439697265625, 485.152099609375]] },
  ] },
  { pathIndex: 55574, seqno: 55576, boundsPt: [276.4397888183594, 485.1520080566406, 278.19879150390625, 485.3780212402344], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [276.4397888183594, 485.1520080566406], [278.19879150390625, 485.3780212402344]] },
  ] },
  { pathIndex: 55575, seqno: 55577, boundsPt: [278.198486328125, 483.22528076171875, 278.4744873046875, 485.3782958984375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [278.198486328125, 485.3782958984375], [278.4744873046875, 483.22528076171875]] },
  ] },
  { pathIndex: 55576, seqno: 55578, boundsPt: [290.22119140625, 484.9971008300781, 333.9651794433594, 484.9971008300781], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [290.22119140625, 484.9971008300781], [333.9651794433594, 484.9971008300781]] },
  ] },
  { pathIndex: 55577, seqno: 55579, boundsPt: [288.660400390625, 483.2251892089844, 335.9814147949219, 483.2251892089844], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [335.9814147949219, 483.2251892089844], [288.660400390625, 483.2251892089844]] },
  ] },
  { pathIndex: 55578, seqno: 55580, boundsPt: [331.59490966796875, 486.5203857421875, 333.9898986816406, 505.2033996582031], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [333.9898986816406, 486.5203857421875], [331.59490966796875, 505.2033996582031]] },
  ] },
  { pathIndex: 55579, seqno: 55581, boundsPt: [331.8009948730469, 483.2257080078125, 335.9809875488281, 515.8406982421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [331.8009948730469, 515.8406982421875], [335.9809875488281, 483.2257080078125]] },
  ] },
  { pathIndex: 55580, seqno: 55582, boundsPt: [217.13890075683594, 485.1016845703125, 219.20289611816406, 485.1016845703125], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [217.13890075683594, 485.1016845703125], [219.20289611816406, 485.1016845703125]] },
  ] },
  { pathIndex: 55581, seqno: 55583, boundsPt: [217.7554931640625, 483.288818359375, 221.2624969482422, 483.288818359375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [221.2624969482422, 483.288818359375], [217.7554931640625, 483.288818359375]] },
  ] },
  { pathIndex: 55582, seqno: 55584, boundsPt: [215.54310607910156, 483.288818359375, 216.4561004638672, 483.288818359375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [216.4561004638672, 483.288818359375], [215.54310607910156, 483.288818359375]] },
  ] },
  { pathIndex: 55583, seqno: 55585, boundsPt: [215.19700622558594, 483.288818359375, 7062913 / 32768, 485.9878234863281], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [7062913 / 32768, 483.288818359375], [215.19700622558594, 485.9878234863281]] },
  ] },
  { pathIndex: 55584, seqno: 55586, boundsPt: [213.43260192871094, 514.0289916992188, 215.49659729003906, 514.0289916992188], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [215.49659729003906, 514.0289916992188], [213.43260192871094, 514.0289916992188]] },
  ] },
  { pathIndex: 55585, seqno: 55587, boundsPt: [211.3715057373047, 514.8917846679688, 211.49349975585938, 515.8407592773438], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [211.49349975585938, 514.8917846679688], [211.3715057373047, 515.8407592773438]] },
  ] },
  { pathIndex: 55586, seqno: 55588, boundsPt: [211.37179565429688, 515.8406982421875, 212.3297882080078, 515.8406982421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [211.37179565429688, 515.8406982421875], [212.3297882080078, 515.8406982421875]] },
  ] },
  { pathIndex: 55587, seqno: 55589, boundsPt: [216.01280212402344, 515.8406982421875, 217.091796875, 515.8406982421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [216.01280212402344, 515.8406982421875], [217.091796875, 515.8406982421875]] },
  ] },
  { pathIndex: 55588, seqno: 55590, boundsPt: [217.09129333496094, 513.021728515625, 217.4532928466797, 515.8406982421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [217.09129333496094, 515.8406982421875], [217.4532928466797, 513.021728515625]] },
  ] },
  { pathIndex: 55589, seqno: 55591, boundsPt: [216.6374969482422, 505.1309814453125, 218.4344940185547, 505.3609924316406], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [218.4344940185547, 505.3609924316406], [216.6374969482422, 505.1309814453125]] },
  ] },
  { pathIndex: 55590, seqno: 55592, boundsPt: [6970245 / 32768, 505.3611755371094, 7029129 / 32768, 505.5911865234375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [7029129 / 32768, 505.5911865234375], [6970245 / 32768, 505.3611755371094]] },
  ] },
  { pathIndex: 55591, seqno: 55593, boundsPt: [6937913 / 32768, 509.8894958496094, 212.1352996826172, 8405901 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [212.1352996826172, 509.8894958496094], [6937913 / 32768, 8405901 / 16384]] },
  ] },
  { pathIndex: 55592, seqno: 55594, boundsPt: [215.49740600585938, 485.1016845703125, 7182857 / 32768, 514.0296630859375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [7182857 / 32768, 485.1016845703125], [215.49740600585938, 514.0296630859375]] },
  ] },
  { pathIndex: 55593, seqno: 55595, boundsPt: [7138453 / 32768, 483.2889099121094, 221.26329040527344, 509.9359130859375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [7138453 / 32768, 509.9359130859375], [221.26329040527344, 483.2889099121094]] },
  ] },
  { pathIndex: 55594, seqno: 55596, boundsPt: [213.4322967529297, 485.1009826660156, 217.13829040527344, 514.0289916992188], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [213.4322967529297, 514.0289916992188], [217.13829040527344, 485.1009826660156]] },
  ] },
  { pathIndex: 55595, seqno: 55597, boundsPt: [214.19589233398438, 489.07568359375, 214.80189514160156, 493.8036804199219], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [214.80189514160156, 489.07568359375], [214.19589233398438, 493.8036804199219]] },
  ] },
  { pathIndex: 55596, seqno: 55598, boundsPt: [213.55320739746094, 496.8915100097656, 7005805 / 32768, 498.8155212402344], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [7005805 / 32768, 496.8915100097656], [213.55320739746094, 498.8155212402344]] },
  ] },
  { pathIndex: 55597, seqno: 55599, boundsPt: [212.531494140625, 503.46600341796875, 212.95849609375, 506.80401611328125], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [212.95849609375, 503.46600341796875], [212.531494140625, 506.80401611328125]] },
  ] },
  { pathIndex: 55598, seqno: 55600, boundsPt: [289.5556945800781, 487.51019287109375, 315.1636962890625, 487.51019287109375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [315.1636962890625, 487.51019287109375], [289.5556945800781, 487.51019287109375]] },
  ] },
  { pathIndex: 55599, seqno: 55601, boundsPt: [288.41351318359375, 488.6536865234375, 316.3055114746094, 488.6536865234375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [288.41351318359375, 488.6536865234375], [316.3055114746094, 488.6536865234375]] },
  ] },
  { pathIndex: 55600, seqno: 55602, boundsPt: [316.3057861328125, 486.52069091796875, 316.3057861328125, 488.6536865234375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [316.3057861328125, 488.6536865234375], [316.3057861328125, 486.52069091796875]] },
  ] },
  { pathIndex: 55601, seqno: 55603, boundsPt: [289.5555114746094, 485.3782043457031, 289.5555114746094, 487.51019287109375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [289.5555114746094, 487.51019287109375], [289.5555114746094, 485.3782043457031]] },
  ] },
  { pathIndex: 55602, seqno: 55604, boundsPt: [288.41351318359375, 486.5203857421875, 288.41351318359375, 488.65338134765625], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [288.41351318359375, 486.5203857421875], [288.41351318359375, 488.65338134765625]] },
  ] },
  { pathIndex: 55603, seqno: 55605, boundsPt: [315.1636962890625, 485.3782958984375, 315.1636962890625, 487.5102844238281], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [315.1636962890625, 485.3782958984375], [315.1636962890625, 487.5102844238281]] },
  ] },
  { pathIndex: 55617, seqno: 55619, boundsPt: [7018637 / 32768, 509.8948059082031, 215.7707977294922, 510.0968017578125], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [7018637 / 32768, 509.8948059082031], [215.7707977294922, 510.0968017578125]] },
  ] },
  { pathIndex: 55618, seqno: 55620, boundsPt: [7009229 / 32768, 512.1298828125, 215.4836883544922, 512.3319091796875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [7009229 / 32768, 512.1298828125], [215.4836883544922, 512.3319091796875]] },
  ] },
  { pathIndex: 55619, seqno: 55621, boundsPt: [214.6945037841797, 509.9953918457031, 7044481 / 32768, 512.2304077148438], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [7044481 / 32768, 509.9953918457031], [214.6945037841797, 512.2304077148438]] },
  ] },
  { pathIndex: 55806, seqno: 55808, boundsPt: [271.0404968261719, 509.87371826171875, 273.3074951171875, 510.1647033691406], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [271.0404968261719, 509.87371826171875], [273.3074951171875, 510.1647033691406]] },
  ] },
  { pathIndex: 55807, seqno: 55809, boundsPt: [270.760009765625, 512.0623779296875, 273.0270080566406, 8394381 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [270.760009765625, 512.0623779296875], [273.0270080566406, 8394381 / 16384]] },
  ] },
  { pathIndex: 55808, seqno: 55810, boundsPt: [271.8943176269531, 510.0191955566406, 272.1733093261719, 512.2081909179688], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [272.1733093261719, 510.0191955566406], [271.8943176269531, 512.2081909179688]] },
  ] },
  { pathIndex: 55809, seqno: 55811, boundsPt: [328.2372131347656, 509.87371826171875, 330.5032043457031, 510.1647033691406], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [328.2372131347656, 509.87371826171875], [330.5032043457031, 510.1647033691406]] },
  ] },
  { pathIndex: 55810, seqno: 55812, boundsPt: [327.956787109375, 512.0623779296875, 330.2227783203125, 8394381 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [327.956787109375, 512.0623779296875], [330.2227783203125, 8394381 / 16384]] },
  ] },
  { pathIndex: 55811, seqno: 55813, boundsPt: [329.0888977050781, 510.0191955566406, 329.3699035644531, 512.2081909179688], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [329.3699035644531, 510.0191955566406], [329.0888977050781, 512.2081909179688]] },
  ] },
  { pathIndex: 55815, seqno: 55817, boundsPt: [274.0683898925781, 486.2319030761719, 276.33538818359375, 486.52191162109375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [274.0683898925781, 486.2319030761719], [276.33538818359375, 486.52191162109375]] },
  ] },
  { pathIndex: 55816, seqno: 55818, boundsPt: [273.7890930175781, 488.4193115234375, 276.0550842285156, 488.7102966308594], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [273.7890930175781, 488.4193115234375], [276.0550842285156, 488.7102966308594]] },
  ] },
  { pathIndex: 55817, seqno: 55819, boundsPt: [274.9215087890625, 486.3760986328125, 275.2025146484375, 488.5650939941406], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [275.2025146484375, 486.3760986328125], [274.9215087890625, 488.5650939941406]] },
  ] },
  { pathIndex: 55818, seqno: 55820, boundsPt: [331.2677001953125, 486.2319030761719, 333.53369140625, 486.52288818359375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [331.2677001953125, 486.2319030761719], [333.53369140625, 486.52288818359375]] },
  ] },
  { pathIndex: 55819, seqno: 55821, boundsPt: [330.9872131347656, 488.42071533203125, 333.2532043457031, 488.7107238769531], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [330.9872131347656, 488.42071533203125], [333.2532043457031, 488.7107238769531]] },
  ] },
  { pathIndex: 55820, seqno: 55822, boundsPt: [332.1195983886719, 486.3774108886719, 332.4006042480469, 488.5644226074219], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [332.4006042480469, 486.3774108886719], [332.1195983886719, 488.5644226074219]] },
  ] },
  { pathIndex: 56036, seqno: 56038, boundsPt: [333.9189147949219, 484.9971008300781, 333.9659118652344, 485.37811279296875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [333.9659118652344, 484.9971008300781], [333.9189147949219, 485.37811279296875]] },
  ] },
  { pathIndex: 56146, seqno: 56148, boundsPt: [316.3057861328125, 486.5203857421875, 333.9897766113281, 486.5203857421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [316.3057861328125, 486.5203857421875], [333.9897766113281, 486.5203857421875]] },
  ] },
  { pathIndex: 56147, seqno: 56149, boundsPt: [315.16339111328125, 485.3782958984375, 333.91839599609375, 485.3782958984375], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [333.91839599609375, 485.3782958984375], [315.16339111328125, 485.3782958984375]] },
  ] },
  { pathIndex: 56298, seqno: 56300, boundsPt: [275.0754089355469, 8413785 / 16384, 275.0754089355469, 515.8406982421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [275.0754089355469, 515.8406982421875], [275.0754089355469, 8413785 / 16384]] },
  ] },
  { pathIndex: 56299, seqno: 56301, boundsPt: [268.5685119628906, 515.8406982421875, 275.07550048828125, 515.8406982421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [268.5685119628906, 515.8406982421875], [275.07550048828125, 515.8406982421875]] },
  ] },
  { pathIndex: 56300, seqno: 56302, boundsPt: [271.1874084472656, 8413785 / 16384, 275.0754089355469, 8413785 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [275.0754089355469, 8413785 / 16384], [271.1874084472656, 8413785 / 16384]] },
  ] },
  { pathIndex: 56301, seqno: 56303, boundsPt: [282.6398010253906, 515.8406982421875, 331.8008117675781, 515.8406982421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [282.6398010253906, 515.8406982421875], [331.8008117675781, 515.8406982421875]] },
  ] },
  { pathIndex: 56302, seqno: 56304, boundsPt: [282.6398010253906, 8413785 / 16384, 282.6398010253906, 515.8406982421875], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [282.6398010253906, 8413785 / 16384], [282.6398010253906, 515.8406982421875]] },
  ] },
  { pathIndex: 56303, seqno: 56305, boundsPt: [282.639404296875, 8413785 / 16384, 324.1534118652344, 8413785 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [324.1534118652344, 8413785 / 16384], [282.639404296875, 8413785 / 16384]] },
  ] },
  { pathIndex: 56304, seqno: 56306, boundsPt: [324.9275817871094, 8413785 / 16384, 329.7735900878906, 8413785 / 16384], style: 'wall-edge', items: [
    { itemIndex: 0, command: ["l", [329.7735900878906, 8413785 / 16384], [324.9275817871094, 8413785 / 16384]] },
  ] },
];

/** Eight distinct paired-door jambs; the glass between pairs separates their jambs. */
export const LOBBY_SOUTH_DOOR_JAMBS: readonly LobbySouthJamb[] = [
  {
    "id": "page-upper-left-left-jamb",
    "row": "page-upper",
    "fillSourcePathIndices": [
      52431
    ],
    "perimeterSourceItems": [
      {
        "pathIndex": 54370,
        "itemIndex": 0
      },
      {
        "pathIndex": 54371,
        "itemIndex": 0
      },
      {
        "pathIndex": 54372,
        "itemIndex": 0
      },
      {
        "pathIndex": 54373,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-upper-left-right-jamb",
    "row": "page-upper",
    "fillSourcePathIndices": [
      52427
    ],
    "perimeterSourceItems": [
      {
        "pathIndex": 54366,
        "itemIndex": 0
      },
      {
        "pathIndex": 54367,
        "itemIndex": 0
      },
      {
        "pathIndex": 54368,
        "itemIndex": 0
      },
      {
        "pathIndex": 54369,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-upper-right-left-jamb",
    "row": "page-upper",
    "fillSourcePathIndices": [
      52421
    ],
    "perimeterSourceItems": [
      {
        "pathIndex": 54362,
        "itemIndex": 0
      },
      {
        "pathIndex": 54363,
        "itemIndex": 0
      },
      {
        "pathIndex": 54364,
        "itemIndex": 0
      },
      {
        "pathIndex": 54365,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-upper-right-right-jamb",
    "row": "page-upper",
    "fillSourcePathIndices": [
      52417
    ],
    "perimeterSourceItems": [
      {
        "pathIndex": 54358,
        "itemIndex": 0
      },
      {
        "pathIndex": 54359,
        "itemIndex": 0
      },
      {
        "pathIndex": 54360,
        "itemIndex": 0
      },
      {
        "pathIndex": 54361,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-lower-left-left-jamb",
    "row": "page-lower",
    "fillSourcePathIndices": [
      52432
    ],
    "perimeterSourceItems": [
      {
        "pathIndex": 54347,
        "itemIndex": 0
      },
      {
        "pathIndex": 54348,
        "itemIndex": 0
      },
      {
        "pathIndex": 54349,
        "itemIndex": 0
      },
      {
        "pathIndex": 54350,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-lower-left-right-jamb",
    "row": "page-lower",
    "fillSourcePathIndices": [
      52426
    ],
    "perimeterSourceItems": [
      {
        "pathIndex": 54343,
        "itemIndex": 0
      },
      {
        "pathIndex": 54344,
        "itemIndex": 0
      },
      {
        "pathIndex": 54345,
        "itemIndex": 0
      },
      {
        "pathIndex": 54346,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-lower-right-left-jamb",
    "row": "page-lower",
    "fillSourcePathIndices": [
      52420
    ],
    "perimeterSourceItems": [
      {
        "pathIndex": 54339,
        "itemIndex": 0
      },
      {
        "pathIndex": 54340,
        "itemIndex": 0
      },
      {
        "pathIndex": 54341,
        "itemIndex": 0
      },
      {
        "pathIndex": 54342,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-lower-right-right-jamb",
    "row": "page-lower",
    "fillSourcePathIndices": [
      52416
    ],
    "perimeterSourceItems": [
      {
        "pathIndex": 54335,
        "itemIndex": 0
      },
      {
        "pathIndex": 54336,
        "itemIndex": 0
      },
      {
        "pathIndex": 54337,
        "itemIndex": 0
      },
      {
        "pathIndex": 54338,
        "itemIndex": 0
      }
    ]
  },
];

/** Page-upper is the lobby boundary; page-lower is the exterior boundary. */
export const LOBBY_SOUTH_DOOR_PAIRS: readonly LobbySouthDoorPair[] = [
  {
    "id": "page-upper-left",
    "row": "page-upper",
    "pageLeftJambId": "page-upper-left-left-jamb",
    "pageRightJambId": "page-upper-left-right-jamb",
    "nativeFacadeBaseline": null,
    "leaves": [
      {
        "id": "page-upper-left-left-leaf",
        "hingeJambId": "page-upper-left-left-jamb",
        "hinge": [
          227.18589782714844,
          485.4669189453125
        ],
        "openTip": [
          227.18589782714844,
          490.9079284667969
        ],
        "closedTip": [
          232.62689208984375,
          485.4662780761719
        ],
        "openLeafEdge": {
          "pathIndex": 48818,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48820,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "to"
      },
      {
        "id": "page-upper-left-right-leaf",
        "hingeJambId": "page-upper-left-right-jamb",
        "hinge": [
          238.0677947998047,
          485.4669189453125
        ],
        "openTip": [
          238.0677947998047,
          490.9079284667969
        ],
        "closedTip": [
          232.6260986328125,
          485.4669189453125
        ],
        "openLeafEdge": {
          "pathIndex": 48819,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48821,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "from"
      }
    ],
    "pageVisibility": "visible-on-page",
    "swingInterpretation": "toward-increasing-page-y"
  },
  {
    "id": "page-upper-right",
    "row": "page-upper",
    "pageLeftJambId": "page-upper-right-left-jamb",
    "pageRightJambId": "page-upper-right-right-jamb",
    "nativeFacadeBaseline": null,
    "leaves": [
      {
        "id": "page-upper-right-left-leaf",
        "hingeJambId": "page-upper-right-left-jamb",
        "hinge": [
          249.87469482421875,
          485.4669189453125
        ],
        "openTip": [
          249.87469482421875,
          490.9079284667969
        ],
        "closedTip": [
          255.3166961669922,
          485.4662780761719
        ],
        "openLeafEdge": {
          "pathIndex": 48829,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48831,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "to"
      },
      {
        "id": "page-upper-right-right-leaf",
        "hingeJambId": "page-upper-right-right-jamb",
        "hinge": [
          260.7567138671875,
          485.4669189453125
        ],
        "openTip": [
          260.7567138671875,
          490.9079284667969
        ],
        "closedTip": [
          255.31649780273438,
          485.4669189453125
        ],
        "openLeafEdge": {
          "pathIndex": 48830,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48832,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "from"
      }
    ],
    "pageVisibility": "visible-on-page",
    "swingInterpretation": "toward-increasing-page-y"
  },
  {
    "id": "page-lower-left",
    "row": "page-lower",
    "pageLeftJambId": "page-lower-left-left-jamb",
    "pageRightJambId": "page-lower-left-right-jamb",
    "nativeFacadeBaseline": {
      "sourceItem": {
        "pathIndex": 13443,
        "itemIndex": 0
      },
      "baseline": [
        [
          269.67620849609375,
          505.597900390625
        ],
        [
          226.80419921875,
          505.597900390625
        ]
      ]
    },
    "leaves": [
      {
        "id": "page-lower-left-left-leaf",
        "hingeJambId": "page-lower-left-left-jamb",
        "hinge": [
          227.17649841308594,
          505.2431945800781
        ],
        "openTip": [
          227.17649841308594,
          510.6842041015625
        ],
        "closedTip": [
          232.61749267578125,
          505.24249267578125
        ],
        "openLeafEdge": {
          "pathIndex": 48873,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48871,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "to"
      },
      {
        "id": "page-lower-left-right-leaf",
        "hingeJambId": "page-lower-left-right-jamb",
        "hinge": [
          238.05709838867188,
          505.2431945800781
        ],
        "openTip": [
          238.05709838867188,
          510.6842041015625
        ],
        "closedTip": [
          232.6168975830078,
          505.2431945800781
        ],
        "openLeafEdge": {
          "pathIndex": 48872,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48870,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "from"
      }
    ],
    "pageVisibility": "visible-on-page",
    "swingInterpretation": "toward-increasing-page-y"
  },
  {
    "id": "page-lower-right",
    "row": "page-lower",
    "pageLeftJambId": "page-lower-right-left-jamb",
    "pageRightJambId": "page-lower-right-right-jamb",
    "nativeFacadeBaseline": {
      "sourceItem": {
        "pathIndex": 13443,
        "itemIndex": 0
      },
      "baseline": [
        [
          269.67620849609375,
          505.597900390625
        ],
        [
          226.80419921875,
          505.597900390625
        ]
      ]
    },
    "leaves": [
      {
        "id": "page-lower-right-left-leaf",
        "hingeJambId": "page-lower-right-left-jamb",
        "hinge": [
          8188245 / 32768,
          505.2431945800781
        ],
        "openTip": [
          8188245 / 32768,
          510.6842041015625
        ],
        "closedTip": [
          255.32640075683594,
          505.24249267578125
        ],
        "openLeafEdge": {
          "pathIndex": 48865,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48863,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "to"
      },
      {
        "id": "page-lower-right-right-leaf",
        "hingeJambId": "page-lower-right-right-jamb",
        "hinge": [
          260.7673034667969,
          505.2431945800781
        ],
        "openTip": [
          260.7673034667969,
          510.6842041015625
        ],
        "closedTip": [
          255.32569885253906,
          505.2431945800781
        ],
        "openLeafEdge": {
          "pathIndex": 48864,
          "itemIndex": 0
        },
        "swingCurve": {
          "pathIndex": 48862,
          "itemIndex": 0
        },
        "closedTipSourceEndpoint": "from"
      }
    ],
    "pageVisibility": "visible-on-page",
    "swingInterpretation": "toward-increasing-page-y"
  },
];

/** These two single doors belong to the adjoining stair enclosure. */
export const LOBBY_SOUTH_DOOR_ADJACENT_STAIR_DOORS: readonly LobbySouthAdjacentStairDoor[] = [
  {
    "id": "stair-page-upper",
    "hinge": [
      278.6325988769531,
      486.59979248046875
    ],
    "openTip": [
      277.7106018066406,
      493.1528015136719
    ],
    "curveOpenTip": [
      277.9855041503906,
      493.19000244140625
    ],
    "closedTip": [
      285.23150634765625,
      486.02099609375
    ],
    "openLeafEdge": {
      "pathIndex": 48810,
      "itemIndex": 0
    },
    "openLeafContourSourceItems": [
      {
        "pathIndex": 48810,
        "itemIndex": 0
      },
      {
        "pathIndex": 48811,
        "itemIndex": 0
      },
      {
        "pathIndex": 48812,
        "itemIndex": 0
      },
      {
        "pathIndex": 48813,
        "itemIndex": 0
      }
    ],
    "swingCurve": {
      "pathIndex": 48814,
      "itemIndex": 0
    },
    "closedTipSourceEndpoint": "to",
    "jambEdgeSourceItems": [
      {
        "pathIndex": 53975,
        "itemIndex": 0
      },
      {
        "pathIndex": 53976,
        "itemIndex": 0
      },
      {
        "pathIndex": 53977,
        "itemIndex": 0
      },
      {
        "pathIndex": 53978,
        "itemIndex": 0
      },
      {
        "pathIndex": 53979,
        "itemIndex": 0
      },
      {
        "pathIndex": 53980,
        "itemIndex": 0
      },
      {
        "pathIndex": 53981,
        "itemIndex": 0
      },
      {
        "pathIndex": 53982,
        "itemIndex": 0
      }
    ],
    "nativeFacadeBaseline": null
  },
  {
    "id": "stair-page-lower",
    "hinge": [
      275.54791259765625,
      515.35888671875
    ],
    "openTip": [
      275.54791259765625,
      8552069 / 16384
    ],
    "curveOpenTip": [
      275.54791259765625,
      521.9769897460938
    ],
    "closedTip": [
      282.16790771484375,
      515.3590087890625
    ],
    "openLeafEdge": {
      "pathIndex": 48874,
      "itemIndex": 0
    },
    "openLeafContourSourceItems": [
      {
        "pathIndex": 48874,
        "itemIndex": 0
      }
    ],
    "swingCurve": {
      "pathIndex": 48875,
      "itemIndex": 0
    },
    "closedTipSourceEndpoint": "to",
    "jambEdgeSourceItems": [
      {
        "pathIndex": 54060,
        "itemIndex": 0
      },
      {
        "pathIndex": 54061,
        "itemIndex": 0
      },
      {
        "pathIndex": 54062,
        "itemIndex": 0
      },
      {
        "pathIndex": 54063,
        "itemIndex": 0
      },
      {
        "pathIndex": 54132,
        "itemIndex": 0
      },
      {
        "pathIndex": 54133,
        "itemIndex": 0
      },
      {
        "pathIndex": 54134,
        "itemIndex": 0
      },
      {
        "pathIndex": 54135,
        "itemIndex": 0
      }
    ],
    "nativeFacadeBaseline": {
      "sourceItem": {
        "pathIndex": 13441,
        "itemIndex": 0
      },
      "baseline": [
        [
          331.5270080566406,
          8454545 / 16384
        ],
        [
          268.3600158691406,
          8454545 / 16384
        ]
      ]
    }
  },
];

/** Six vestibule panels and five adjoining facade/return panels, without fitted edges. */
export const LOBBY_SOUTH_DOOR_ADJACENT_GLAZING: readonly LobbySouthGlazing[] = [
  {
    "id": "page-upper-left",
    "edgeSourceItems": [
      {
        "pathIndex": 49302,
        "itemIndex": 0
      },
      {
        "pathIndex": 49303,
        "itemIndex": 0
      },
      {
        "pathIndex": 49304,
        "itemIndex": 0
      },
      {
        "pathIndex": 49305,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-upper-between-pairs",
    "edgeSourceItems": [
      {
        "pathIndex": 49298,
        "itemIndex": 0
      },
      {
        "pathIndex": 49299,
        "itemIndex": 0
      },
      {
        "pathIndex": 49300,
        "itemIndex": 0
      },
      {
        "pathIndex": 49301,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-upper-right",
    "edgeSourceItems": [
      {
        "pathIndex": 49278,
        "itemIndex": 0
      },
      {
        "pathIndex": 49279,
        "itemIndex": 0
      },
      {
        "pathIndex": 49296,
        "itemIndex": 0
      },
      {
        "pathIndex": 49297,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-lower-left",
    "edgeSourceItems": [
      {
        "pathIndex": 49194,
        "itemIndex": 0
      },
      {
        "pathIndex": 49195,
        "itemIndex": 0
      },
      {
        "pathIndex": 49196,
        "itemIndex": 0
      },
      {
        "pathIndex": 49197,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-lower-between-pairs",
    "edgeSourceItems": [
      {
        "pathIndex": 49414,
        "itemIndex": 0
      },
      {
        "pathIndex": 49415,
        "itemIndex": 0
      },
      {
        "pathIndex": 49416,
        "itemIndex": 0
      },
      {
        "pathIndex": 49417,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "page-lower-right",
    "edgeSourceItems": [
      {
        "pathIndex": 49410,
        "itemIndex": 0
      },
      {
        "pathIndex": 49411,
        "itemIndex": 0
      },
      {
        "pathIndex": 49412,
        "itemIndex": 0
      },
      {
        "pathIndex": 49413,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "stair-page-right-near",
    "edgeSourceItems": [
      {
        "pathIndex": 49325,
        "itemIndex": 0
      },
      {
        "pathIndex": 49326,
        "itemIndex": 0
      },
      {
        "pathIndex": 49327,
        "itemIndex": 0
      },
      {
        "pathIndex": 49328,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "stair-page-right-far",
    "edgeSourceItems": [
      {
        "pathIndex": 49292,
        "itemIndex": 0
      },
      {
        "pathIndex": 49293,
        "itemIndex": 0
      },
      {
        "pathIndex": 49294,
        "itemIndex": 0
      },
      {
        "pathIndex": 49295,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "stair-page-right-return",
    "edgeSourceItems": [
      {
        "pathIndex": 49329,
        "itemIndex": 0
      },
      {
        "pathIndex": 49330,
        "itemIndex": 0
      },
      {
        "pathIndex": 49331,
        "itemIndex": 0
      },
      {
        "pathIndex": 49332,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "vestibule-page-left-upper-return",
    "edgeSourceItems": [
      {
        "pathIndex": 49268,
        "itemIndex": 0
      },
      {
        "pathIndex": 49269,
        "itemIndex": 0
      },
      {
        "pathIndex": 49270,
        "itemIndex": 0
      },
      {
        "pathIndex": 49271,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "vestibule-page-left-exterior",
    "edgeSourceItems": [
      {
        "pathIndex": 49441,
        "itemIndex": 0
      },
      {
        "pathIndex": 49442,
        "itemIndex": 0
      },
      {
        "pathIndex": 49443,
        "itemIndex": 0
      },
      {
        "pathIndex": 49444,
        "itemIndex": 0
      }
    ]
  },
];

/** All native opaque wall/jamb/patch polygons, including the compound path 52373. */
export const LOBBY_SOUTH_DOOR_OPAQUE_FILL_PATH_INDICES: readonly number[] = [52363, 52366, 52373, 52375, 52376, 52379, 52380, 52405, 52407, 52408, 52409, 52410, 52411, 52412, 52413, 52414, 52416, 52417, 52420, 52421, 52426, 52427, 52431, 52432, 52437, 52441, 52442, 52443, 52444, 52445, 52446, 52447, 52450];

export const LOBBY_SOUTH_DOOR_SOURCE_LEDGER = {
  source: LOBBY_SOUTH_DOOR_SOURCE,
  styles: LOBBY_SOUTH_DOOR_SOURCE_STYLES,
  sourcePaths: LOBBY_SOUTH_DOOR_SOURCE_PATHS,
  jambs: LOBBY_SOUTH_DOOR_JAMBS,
  pairs: LOBBY_SOUTH_DOOR_PAIRS,
  adjacentStairDoors: LOBBY_SOUTH_DOOR_ADJACENT_STAIR_DOORS,
  adjacentGlazing: LOBBY_SOUTH_DOOR_ADJACENT_GLAZING,
  opaqueFillPathIndices: LOBBY_SOUTH_DOOR_OPAQUE_FILL_PATH_INDICES,
} as const;
