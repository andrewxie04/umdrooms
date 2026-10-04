/**
 * Local Ground north vestibule / east glazing corner beside column-pdf6-52303.
 * Original UMD/HDR guide[6], zero-based original get_drawings() path/item IDs.
 * DATA ONLY. PDF pt, top-left origin, +x right, +y down. No app integration.
 * Every retained native path keeps all original commands, bounds and paint fields.
 * Map endpoints AND cubic controls with the existing groundGuidePlan in a consumer.
 * Source commands may have gaps: reversed changes travel only; never snap the data.
 * Recommended inner/outer chains select native rails; their closure bridges and
 * line intersections are consumer estimates, not additional PDF commands.
 * Page-position labels do not establish geographic bearings or physical sizes.
 * See docs/research/iribe/ground-north-corner-2026-10-03.md.
 */
export type GroundNorthCornerPdfPoint = readonly [pdfX: number, pdfY: number];
export type GroundNorthCornerPdfBounds = readonly [x0: number, y0: number, x1: number, y1: number];
export type GroundNorthCornerSourceCommand =
  | readonly ['l', from: GroundNorthCornerPdfPoint, to: GroundNorthCornerPdfPoint]
  | readonly ['c', from: GroundNorthCornerPdfPoint, control1: GroundNorthCornerPdfPoint,
      control2: GroundNorthCornerPdfPoint, to: GroundNorthCornerPdfPoint];
export interface GroundNorthCornerItemRef {
  readonly pathIndex: number;
  readonly itemIndex: number;
}
export interface GroundNorthCornerDirectedItemRef extends GroundNorthCornerItemRef {
  readonly reversed: boolean;
}
type GroundNorthCornerRgb = readonly [r: number, g: number, b: number];
export interface GroundNorthCornerSourceStyle {
  readonly type: 's' | 'f';
  readonly color: GroundNorthCornerRgb | null;
  readonly fill: GroundNorthCornerRgb | null;
  readonly width: number | null;
  readonly closePath: boolean | null;
  readonly even_odd: boolean | null;
  readonly lineCap: readonly [number, number, number] | null;
  readonly lineJoin: number | null;
  readonly dashes: string | null;
  readonly stroke_opacity: number | null;
  readonly fill_opacity: number | null;
  readonly layer: string;
}
export interface GroundNorthCornerSourcePath {
  readonly pathIndex: number;
  /** Paint sequence is distinct: many selected seqno values are pathIndex + 2. */
  readonly seqno: number;
  readonly boundsPt: GroundNorthCornerPdfBounds;
  readonly style: keyof typeof GROUND_NORTH_CORNER_SOURCE_STYLES;
  readonly role: 'site-context-excluded' | 'pane-contour' | 'vestibule-wall-fill'
    | 'column-context' | 'vestibule-wall-recess' | 'pane-black-rail-or-cap'
    | 'vestibule-wall-outline';
  readonly items: readonly { readonly itemIndex: number;
    readonly command: GroundNorthCornerSourceCommand }[];
}

// Round-trip decimals reproduce the original binary floats exactly. The local
// lint exception permits those source representations; evaluated JS exports
// are checked coordinate-for-coordinate against the reopened original PDF.
/* eslint-disable no-loss-of-precision */
export const GROUND_NORTH_CORNER_PROVENANCE = {
  "url": "https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf",
  "pdfSha256": "c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474",
  "pageIndex": 6,
  "pageSizePt": [
    576,
    576
  ],
  "coordinateOrigin": "top-left",
  "xDirection": "right",
  "yDirection": "down",
  "coordinateUnit": "pdf-pt",
  "extractionApi": "PyMuPDF 1.28.2 Page.get_drawings()",
  "originalPageDrawingCount": 56651,
  "coordinateTreatment": "unchanged-source-float",
  "contextInspectedBoundsPt": [
    350,
    60,
    505,
    300
  ],
  "itemAuditBoundsPt": [
    410,
    95,
    490,
    210
  ],
  "focusBoundsPt": [
    444,
    114,
    462,
    159
  ],
  "retainedArchitecturalBoundsPt": [
    444.7409973144531,
    114.5535888671875,
    461.264892578125,
    158.0120086669922
  ],
  "allRetainedSourceBoundsPt": [
    442.83221435546875,
    114.5535888671875,
    461.264892578125,
    185.9119873046875
  ],
  "registrationConsumer": "groundGuidePlan",
  "sourcePathCount": 54,
  "sourceItemCount": 107,
  "completeFacade": false,
  "surveyedGeometry": false
} as const;

export const GROUND_NORTH_CORNER_SOURCE_STYLES = {
  "style-0": {
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
    "fill_opacity": null,
    "layer": ""
  },
  "style-1": {
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
    "fill_opacity": null,
    "layer": ""
  },
  "style-2": {
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
    "fill_opacity": 1.0,
    "layer": ""
  },
  "style-3": {
    "type": "f",
    "color": null,
    "fill": [
      0.0,
      0.0,
      0.0
    ],
    "width": null,
    "closePath": null,
    "even_odd": false,
    "lineCap": null,
    "lineJoin": null,
    "dashes": null,
    "stroke_opacity": null,
    "fill_opacity": 1.0,
    "layer": ""
  },
  "style-4": {
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
    "fill_opacity": null,
    "layer": ""
  },
  "style-5": {
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
    "fill_opacity": null,
    "layer": ""
  }
} as const satisfies Readonly<Record<string, GroundNorthCornerSourceStyle>>;

export const GROUND_NORTH_CORNER_SOURCE_PATHS = [
  {
    "pathIndex": 13420, "seqno": 13420, "boundsPt": [449.3110046386719, 123.95950317382812, 461.20501708984375, 125.47850036621094], "style": "style-0", "role": "site-context-excluded",
    items: [
      {"itemIndex": 0, "command": ["l", [449.3110046386719, 123.95950317382812], [461.20501708984375, 125.47850036621094]]},
    ],
  },
  {
    "pathIndex": 13421, "seqno": 13421, "boundsPt": [442.83221435546875, 125.47799682617188, 461.2052001953125, 185.9119873046875], "style": "style-0", "role": "site-context-excluded",
    items: [
      {"itemIndex": 0, "command": ["l", [461.2052001953125, 125.47799682617188], [442.83221435546875, 185.9119873046875]]},
    ],
  },
  {
    "pathIndex": 49116, "seqno": 49116, "boundsPt": [451.4468994140625, 157.86318969726562, 451.8428955078125, 157.98219299316406], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [451.4468994140625, 157.86318969726562], [451.8428955078125, 157.98219299316406]]},
    ],
  },
  {
    "pathIndex": 49117, "seqno": 49117, "boundsPt": [451.44580078125, 146.66159057617188, 454.8558044433594, 157.8625946044922], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [454.8558044433594, 146.66159057617188], [451.44580078125, 157.8625946044922]]},
    ],
  },
  {
    "pathIndex": 49118, "seqno": 49118, "boundsPt": [454.8554992675781, 146.6610107421875, 455.2514953613281, 146.78201293945312], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [455.2514953613281, 146.78201293945312], [454.8554992675781, 146.6610107421875]]},
    ],
  },
  {
    "pathIndex": 49119, "seqno": 49119, "boundsPt": [451.84271240234375, 146.7819061279297, 455.251708984375, 157.98291015625], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [451.84271240234375, 157.98291015625], [455.251708984375, 146.7819061279297]]},
    ],
  },
  {
    "pathIndex": 49120, "seqno": 49120, "boundsPt": [454.8558044433594, 146.66159057617188, 455.2518005371094, 146.7825927734375], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [454.8558044433594, 146.66159057617188], [455.2518005371094, 146.7825927734375]]},
    ],
  },
  {
    "pathIndex": 49121, "seqno": 49121, "boundsPt": [454.85479736328125, 135.45809936523438, 458.2648010253906, 146.66209411621094], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [458.2648010253906, 135.45809936523438], [454.85479736328125, 146.66209411621094]]},
    ],
  },
  {
    "pathIndex": 49122, "seqno": 49122, "boundsPt": [458.2644958496094, 135.45748901367188, 458.6604919433594, 135.5784912109375], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [458.6604919433594, 135.5784912109375], [458.2644958496094, 135.45748901367188]]},
    ],
  },
  {
    "pathIndex": 49123, "seqno": 49123, "boundsPt": [455.2514953613281, 135.57801818847656, 458.6604919433594, 146.78201293945312], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [455.2514953613281, 146.78201293945312], [458.6604919433594, 135.57801818847656]]},
    ],
  },
  {
    "pathIndex": 49124, "seqno": 49124, "boundsPt": [458.2648010253906, 135.45809936523438, 458.6607971191406, 135.5791015625], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [458.2648010253906, 135.45809936523438], [458.6607971191406, 135.5791015625]]},
    ],
  },
  {
    "pathIndex": 49125, "seqno": 49125, "boundsPt": [458.2638854980469, 127.21231079101562, 460.7738952636719, 135.45831298828125], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [460.7738952636719, 127.21231079101562], [458.2638854980469, 135.45831298828125]]},
    ],
  },
  {
    "pathIndex": 49126, "seqno": 49126, "boundsPt": [460.7735900878906, 127.21160888671875, 461.1695861816406, 127.33261108398438], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [461.1695861816406, 127.33261108398438], [460.7735900878906, 127.21160888671875]]},
    ],
  },
  {
    "pathIndex": 49127, "seqno": 49127, "boundsPt": [458.6604919433594, 127.33248901367188, 461.1705017089844, 135.5784912109375], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [458.6604919433594, 135.5784912109375], [461.1705017089844, 127.33248901367188]]},
    ],
  },
  {
    "pathIndex": 49138, "seqno": 49138, "boundsPt": [449.0713806152344, 125.54620361328125, 449.1243896484375, 125.95720672607422], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [449.1243896484375, 125.54620361328125], [449.0713806152344, 125.95720672607422]]},
    ],
  },
  {
    "pathIndex": 49139, "seqno": 49139, "boundsPt": [449.1238098144531, 125.5452880859375, 460.9988098144531, 127.06729125976562], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [460.9988098144531, 127.06729125976562], [449.1238098144531, 125.5452880859375]]},
    ],
  },
  {
    "pathIndex": 49140, "seqno": 49140, "boundsPt": [460.9458923339844, 127.06708526611328, 460.9989013671875, 127.47808837890625], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [460.9458923339844, 127.47808837890625], [460.9989013671875, 127.06708526611328]]},
    ],
  },
  {
    "pathIndex": 49141, "seqno": 49141, "boundsPt": [449.0714111328125, 125.95639038085938, 460.9464111328125, 127.4783935546875], "style": "style-1", "role": "pane-contour",
    items: [
      {"itemIndex": 0, "command": ["l", [449.0714111328125, 125.95639038085938], [460.9464111328125, 127.4783935546875]]},
    ],
  },
  {
    "pathIndex": 52198, "seqno": 52198, "boundsPt": [444.7409973144531, 114.5535888671875, 450.19000244140625, 137.38758850097656], "style": "style-2", "role": "vestibule-wall-fill",
    items: [
      {"itemIndex": 0, "command": ["l", [447.6289978027344, 114.5535888671875], [450.19000244140625, 114.87858581542969]]},
      {"itemIndex": 1, "command": ["l", [450.19000244140625, 114.87858581542969], [449.97198486328125, 116.53258514404297]]},
      {"itemIndex": 2, "command": ["l", [449.97198486328125, 116.53258514404297], [449.9599914550781, 116.53258514404297]]},
      {"itemIndex": 3, "command": ["l", [449.9599914550781, 116.53258514404297], [449.9309997558594, 116.74858856201172]]},
      {"itemIndex": 4, "command": ["l", [449.9309997558594, 116.74858856201172], [449.94598388671875, 116.74858856201172]]},
      {"itemIndex": 5, "command": ["l", [449.94598388671875, 116.74858856201172], [449.72900390625, 118.41558837890625]]},
      {"itemIndex": 6, "command": ["l", [449.72900390625, 118.41558837890625], [449.71600341796875, 118.41558837890625]]},
      {"itemIndex": 7, "command": ["l", [449.71600341796875, 118.41558837890625], [449.6889953613281, 118.6325912475586]]},
      {"itemIndex": 8, "command": ["l", [449.6889953613281, 118.6325912475586], [449.70098876953125, 118.6325912475586]]},
      {"itemIndex": 9, "command": ["l", [449.70098876953125, 118.6325912475586], [449.70098876953125, 118.65959167480469]]},
      {"itemIndex": 10, "command": ["l", [449.70098876953125, 118.65959167480469], [449.6210021972656, 118.64559173583984]]},
      {"itemIndex": 11, "command": ["l", [449.6210021972656, 118.64559173583984], [449.2539978027344, 121.5055923461914]]},
      {"itemIndex": 12, "command": ["l", [449.2539978027344, 121.5055923461914], [449.33599853515625, 121.5055923461914]]},
      {"itemIndex": 13, "command": ["l", [449.33599853515625, 121.5055923461914], [449.33599853515625, 121.54558563232422]]},
      {"itemIndex": 14, "command": ["l", [449.33599853515625, 121.54558563232422], [449.322998046875, 121.54558563232422]]},
      {"itemIndex": 15, "command": ["l", [449.322998046875, 121.54558563232422], [449.29400634765625, 121.74958801269531]]},
      {"itemIndex": 16, "command": ["l", [449.29400634765625, 121.74958801269531], [449.0920104980469, 123.41558837890625]]},
      {"itemIndex": 17, "command": ["l", [449.0920104980469, 123.41558837890625], [449.0780029296875, 123.41558837890625]]},
      {"itemIndex": 18, "command": ["l", [449.0780029296875, 123.41558837890625], [449.052001953125, 123.6325912475586]]},
      {"itemIndex": 19, "command": ["l", [449.052001953125, 123.6325912475586], [449.06500244140625, 123.6325912475586]]},
      {"itemIndex": 20, "command": ["l", [449.06500244140625, 123.6325912475586], [448.8760070800781, 125.04258728027344]]},
      {"itemIndex": 21, "command": ["l", [448.8760070800781, 125.04258728027344], [448.8059997558594, 125.0285873413086]]},
      {"itemIndex": 22, "command": ["l", [448.8059997558594, 125.0285873413086], [448.6050109863281, 126.6275863647461]]},
      {"itemIndex": 23, "command": ["l", [448.6050109863281, 126.6275863647461], [448.6719970703125, 126.64158630371094]]},
      {"itemIndex": 24, "command": ["l", [448.6719970703125, 126.64158630371094], [448.6449890136719, 126.74958801269531]]},
      {"itemIndex": 25, "command": ["l", [448.6449890136719, 126.74958801269531], [448.65899658203125, 126.76358795166016]]},
      {"itemIndex": 26, "command": ["l", [448.65899658203125, 126.76358795166016], [448.0899963378906, 131.235595703125]]},
      {"itemIndex": 27, "command": ["l", [448.0899963378906, 131.235595703125], [448.07598876953125, 131.235595703125]]},
      {"itemIndex": 28, "command": ["l", [448.07598876953125, 131.235595703125], [448.04901123046875, 131.4515838623047]]},
      {"itemIndex": 29, "command": ["l", [448.04901123046875, 131.4515838623047], [448.0610046386719, 131.4515838623047]]},
      {"itemIndex": 30, "command": ["l", [448.0610046386719, 131.4515838623047], [448.0610046386719, 131.4785919189453]]},
      {"itemIndex": 31, "command": ["l", [448.0610046386719, 131.4785919189453], [447.9809875488281, 131.46559143066406]]},
      {"itemIndex": 32, "command": ["l", [447.9809875488281, 131.46559143066406], [447.6139831542969, 134.3245849609375]]},
      {"itemIndex": 33, "command": ["l", [447.6139831542969, 134.3245849609375], [447.6969909667969, 134.3245849609375]]},
      {"itemIndex": 34, "command": ["l", [447.6969909667969, 134.3245849609375], [447.6829833984375, 134.35159301757812]]},
      {"itemIndex": 35, "command": ["l", [447.6829833984375, 134.35159301757812], [447.656005859375, 134.56858825683594]]},
      {"itemIndex": 36, "command": ["l", [447.656005859375, 134.56858825683594], [447.45098876953125, 136.235595703125]]},
      {"itemIndex": 37, "command": ["l", [447.45098876953125, 136.235595703125], [447.43798828125, 136.235595703125]]},
      {"itemIndex": 38, "command": ["l", [447.43798828125, 136.235595703125], [447.4119873046875, 136.4525909423828]]},
      {"itemIndex": 39, "command": ["l", [447.4119873046875, 136.4525909423828], [447.4259948730469, 136.4525909423828]]},
      {"itemIndex": 40, "command": ["l", [447.4259948730469, 136.4525909423828], [447.3039855957031, 137.38758850097656]]},
      {"itemIndex": 41, "command": ["l", [447.3039855957031, 137.38758850097656], [444.7409973144531, 137.06158447265625]]},
      {"itemIndex": 42, "command": ["l", [444.7409973144531, 137.06158447265625], [444.9859924316406, 135.1785888671875]]},
      {"itemIndex": 43, "command": ["l", [444.9859924316406, 135.1785888671875], [445.0119934082031, 135.00259399414062]]},
      {"itemIndex": 44, "command": ["l", [445.0119934082031, 135.00259399414062], [445.1080017089844, 134.2845916748047]]},
      {"itemIndex": 45, "command": ["l", [445.1080017089844, 134.2845916748047], [445.0950012207031, 134.2845916748047]]},
      {"itemIndex": 46, "command": ["l", [445.0950012207031, 134.2845916748047], [447.2489929199219, 117.46759033203125]]},
      {"itemIndex": 47, "command": ["l", [447.2489929199219, 117.46759033203125], [447.2619934082031, 117.46759033203125]]},
      {"itemIndex": 48, "command": ["l", [447.2619934082031, 117.46759033203125], [447.2749938964844, 117.31858825683594]]},
      {"itemIndex": 49, "command": ["l", [447.2749938964844, 117.31858825683594], [447.3710021972656, 116.55958557128906]]},
      {"itemIndex": 50, "command": ["l", [447.3710021972656, 116.55958557128906], [447.6289978027344, 114.5535888671875]]},
    ],
  },
  {
    "pathIndex": 52303, "seqno": 52303, "boundsPt": [452.7497863769531, 128.10519409179688, 458.22479248046875, 133.57919311523438], "style": "style-3", "role": "column-context",
    items: [
      {"itemIndex": 0, "command": ["c", [456.1528015136719, 128.57919311523438], [457.7518005371094, 129.04019165039062], [458.22479248046875, 129.90719604492188], [457.7518005371094, 131.50619506835938]]},
      {"itemIndex": 1, "command": ["c", [457.7518005371094, 131.50619506835938], [457.2908020019531, 133.1191864013672], [456.42279052734375, 133.57919311523438], [454.8247985839844, 133.1191864013672]]},
      {"itemIndex": 2, "command": ["c", [454.8247985839844, 133.1191864013672], [453.2257995605469, 132.64419555664062], [452.7497863769531, 131.79119873046875], [453.2257995605469, 130.17819213867188]]},
      {"itemIndex": 3, "command": ["c", [453.2257995605469, 130.17819213867188], [453.6867980957031, 128.57919311523438], [454.55279541015625, 128.10519409179688], [456.1528015136719, 128.57919311523438]]},
    ],
  },
  {
    "pathIndex": 52879, "seqno": 52881, "boundsPt": [448.6759033203125, 125.03799438476562, 448.8808898925781, 126.6409912109375], "style": "style-1", "role": "vestibule-wall-recess",
    items: [
      {"itemIndex": 0, "command": ["l", [448.8808898925781, 125.03799438476562], [448.6759033203125, 126.6409912109375]]},
    ],
  },
  {
    "pathIndex": 52883, "seqno": 52885, "boundsPt": [448.59759521484375, 125.02800750732422, 448.8025817871094, 126.6300048828125], "style": "style-1", "role": "vestibule-wall-recess",
    items: [
      {"itemIndex": 0, "command": ["l", [448.59759521484375, 126.6300048828125], [448.8025817871094, 125.02800750732422]]},
    ],
  },
  {
    "pathIndex": 54194, "seqno": 54196, "boundsPt": [451.9375, 146.81100463867188, 455.3454895019531, 158.0120086669922], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [455.3454895019531, 146.81100463867188], [451.9375, 158.0120086669922]]},
    ],
  },
  {
    "pathIndex": 54195, "seqno": 54197, "boundsPt": [451.8994140625, 146.7998046875, 455.30841064453125, 157.9998016357422], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [455.30841064453125, 146.7998046875], [451.8994140625, 157.9998016357422]]},
    ],
  },
  {
    "pathIndex": 54196, "seqno": 54198, "boundsPt": [451.3910217285156, 146.64511108398438, 454.79901123046875, 157.8461151123047], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [454.79901123046875, 146.64511108398438], [451.3910217285156, 157.8461151123047]]},
    ],
  },
  {
    "pathIndex": 54197, "seqno": 54199, "boundsPt": [451.35198974609375, 146.6337890625, 454.7619934082031, 157.8337860107422], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [454.7619934082031, 146.6337890625], [451.35198974609375, 157.8337860107422]]},
    ],
  },
  {
    "pathIndex": 54198, "seqno": 54200, "boundsPt": [455.34478759765625, 135.60699462890625, 458.75579833984375, 146.8109893798828], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [458.75579833984375, 135.60699462890625], [455.34478759765625, 146.8109893798828]]},
    ],
  },
  {
    "pathIndex": 54199, "seqno": 54201, "boundsPt": [455.3074035644531, 135.59579467773438, 458.7174072265625, 146.79978942871094], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [458.7174072265625, 135.59579467773438], [455.3074035644531, 146.79978942871094]]},
    ],
  },
  {
    "pathIndex": 54200, "seqno": 54202, "boundsPt": [454.7981872558594, 135.44088745117188, 458.2091979980469, 146.64488220214844], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [458.2091979980469, 135.44088745117188], [454.7981872558594, 146.64488220214844]]},
    ],
  },
  {
    "pathIndex": 54201, "seqno": 54203, "boundsPt": [454.76080322265625, 135.42898559570312, 458.1708068847656, 146.6329803466797], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [458.1708068847656, 135.42898559570312], [454.76080322265625, 146.6329803466797]]},
    ],
  },
  {
    "pathIndex": 54202, "seqno": 54204, "boundsPt": [461.1695861816406, 127.33261108398438, 461.2265930175781, 127.3506088256836], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [461.1695861816406, 127.33261108398438], [461.2265930175781, 127.3506088256836]]},
    ],
  },
  {
    "pathIndex": 54203, "seqno": 54205, "boundsPt": [461.22650146484375, 127.34991455078125, 461.2644958496094, 127.3619155883789], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [461.22650146484375, 127.34991455078125], [461.2644958496094, 127.3619155883789]]},
    ],
  },
  {
    "pathIndex": 54204, "seqno": 54206, "boundsPt": [458.7548828125, 127.36178588867188, 461.264892578125, 135.60678100585938], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [461.264892578125, 127.36178588867188], [458.7548828125, 135.60678100585938]]},
    ],
  },
  {
    "pathIndex": 54205, "seqno": 54207, "boundsPt": [458.71649169921875, 127.34991455078125, 461.22650146484375, 135.59591674804688], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [461.22650146484375, 127.34991455078125], [458.71649169921875, 135.59591674804688]]},
    ],
  },
  {
    "pathIndex": 54206, "seqno": 54208, "boundsPt": [458.2091979980469, 127.4390869140625, 460.6441955566406, 135.4410858154297], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [460.6441955566406, 127.4390869140625], [458.2091979980469, 135.4410858154297]]},
    ],
  },
  {
    "pathIndex": 54207, "seqno": 54209, "boundsPt": [458.1705017089844, 127.43389892578125, 460.6044921875, 135.42889404296875], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [460.6044921875, 127.43389892578125], [458.1705017089844, 135.42889404296875]]},
    ],
  },
  {
    "pathIndex": 54634, "seqno": 54636, "boundsPt": [449.0581970214844, 126.01470947265625, 449.0632019042969, 126.0537109375], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [449.0581970214844, 126.0537109375], [449.0632019042969, 126.01470947265625]]},
    ],
  },
  {
    "pathIndex": 54635, "seqno": 54637, "boundsPt": [449.0635070800781, 125.95658874511719, 449.0715026855469, 126.01458740234375], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [449.0635070800781, 126.01458740234375], [449.0715026855469, 125.95658874511719]]},
    ],
  },
  {
    "pathIndex": 54636, "seqno": 54638, "boundsPt": [449.1243896484375, 125.48820495605469, 449.1313781738281, 125.54620361328125], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [449.1243896484375, 125.54620361328125], [449.1313781738281, 125.48820495605469]]},
    ],
  },
  {
    "pathIndex": 54637, "seqno": 54639, "boundsPt": [449.1310119628906, 125.44821166992188, 449.1360168457031, 125.48721313476562], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [449.1310119628906, 125.48721313476562], [449.1360168457031, 125.44821166992188]]},
    ],
  },
  {
    "pathIndex": 54638, "seqno": 54640, "boundsPt": [461.00579833984375, 126.97000122070312, 461.01080322265625, 127.00900268554688], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [461.01080322265625, 126.97000122070312], [461.00579833984375, 127.00900268554688]]},
    ],
  },
  {
    "pathIndex": 54639, "seqno": 54641, "boundsPt": [460.9985046386719, 127.00918579101562, 461.0054931640625, 127.06718444824219], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [461.0054931640625, 127.00918579101562], [460.9985046386719, 127.06718444824219]]},
    ],
  },
  {
    "pathIndex": 54640, "seqno": 54642, "boundsPt": [449.05859375, 126.05339050292969, 460.6745910644531, 127.54238891601562], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [460.6745910644531, 127.54238891601562], [449.05859375, 126.05339050292969]]},
    ],
  },
  {
    "pathIndex": 54641, "seqno": 54643, "boundsPt": [449.06329345703125, 126.01499938964844, 460.685302734375, 127.50399780273438], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [460.685302734375, 127.50399780273438], [449.06329345703125, 126.01499938964844]]},
    ],
  },
  {
    "pathIndex": 54642, "seqno": 54644, "boundsPt": [449.1304931640625, 125.4871826171875, 461.0054931640625, 127.00918579101562], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [461.0054931640625, 127.00918579101562], [449.1304931640625, 125.4871826171875]]},
    ],
  },
  {
    "pathIndex": 54643, "seqno": 54645, "boundsPt": [449.13580322265625, 125.447998046875, 461.01080322265625, 126.97000122070312], "style": "style-4", "role": "pane-black-rail-or-cap",
    items: [
      {"itemIndex": 0, "command": ["l", [461.01080322265625, 126.97000122070312], [449.13580322265625, 125.447998046875]]},
    ],
  },
  {
    "pathIndex": 55190, "seqno": 55192, "boundsPt": [448.0869140625, 126.75699615478516, 448.6609191894531, 131.23199462890625], "style": "style-5", "role": "vestibule-wall-outline",
    items: [
      {"itemIndex": 0, "command": ["l", [448.0869140625, 131.23199462890625], [448.6609191894531, 126.75699615478516]]},
    ],
  },
  {
    "pathIndex": 55191, "seqno": 55193, "boundsPt": [448.6502990722656, 126.7566909790039, 448.6612854003906, 126.7576904296875], "style": "style-5", "role": "vestibule-wall-outline",
    items: [
      {"itemIndex": 0, "command": ["l", [448.6612854003906, 126.7576904296875], [448.6502990722656, 126.7566909790039]]},
    ],
  },
  {
    "pathIndex": 55192, "seqno": 55194, "boundsPt": [448.6506042480469, 126.63928985595703, 448.6665954589844, 126.75628662109375], "style": "style-5", "role": "vestibule-wall-outline",
    items: [
      {"itemIndex": 0, "command": ["l", [448.6506042480469, 126.75628662109375], [448.6665954589844, 126.63928985595703]]},
    ],
  },
  {
    "pathIndex": 55193, "seqno": 55195, "boundsPt": [448.8808898925781, 123.63099670410156, 449.0608825683594, 125.03799438476562], "style": "style-5", "role": "vestibule-wall-outline",
    items: [
      {"itemIndex": 0, "command": ["l", [448.8808898925781, 125.03799438476562], [449.0608825683594, 123.63099670410156]]},
    ],
  },
  {
    "pathIndex": 55194, "seqno": 55196, "boundsPt": [449.05078125, 123.63028717041016, 449.060791015625, 123.63128662109375], "style": "style-5", "role": "vestibule-wall-outline",
    items: [
      {"itemIndex": 0, "command": ["l", [449.060791015625, 123.63128662109375], [449.05078125, 123.63028717041016]]},
    ],
  },
  {
    "pathIndex": 55195, "seqno": 55197, "boundsPt": [449.0516052246094, 123.4149169921875, 449.0796203613281, 123.62991333007812], "style": "style-5", "role": "vestibule-wall-outline",
    items: [
      {"itemIndex": 0, "command": ["l", [449.0516052246094, 123.62991333007812], [449.0796203613281, 123.4149169921875]]},
    ],
  },
  {
    "pathIndex": 55196, "seqno": 55198, "boundsPt": [449.07940673828125, 123.41488647460938, 449.0884094238281, 123.41588592529297], "style": "style-5", "role": "vestibule-wall-outline",
    items: [
      {"itemIndex": 0, "command": ["l", [449.07940673828125, 123.41488647460938], [449.0884094238281, 123.41588592529297]]},
    ],
  },
  {
    "pathIndex": 55197, "seqno": 55199, "boundsPt": [449.0885925292969, 121.75519561767578, 449.3016052246094, 123.41619873046875], "style": "style-5", "role": "vestibule-wall-outline",
    items: [
      {"itemIndex": 0, "command": ["l", [449.0885925292969, 123.41619873046875], [449.3016052246094, 121.75519561767578]]},
    ],
  },
] as const satisfies readonly GroundNorthCornerSourcePath[];
/* eslint-enable no-loss-of-precision */

/** All native pane contours and companion black rails/caps, including both sides. */
export const GROUND_NORTH_CORNER_PANES = [
  {
    "id": "north-return",
    "contourItems": [
      {
        "pathIndex": 49138,
        "itemIndex": 0
      },
      {
        "pathIndex": 49139,
        "itemIndex": 0
      },
      {
        "pathIndex": 49140,
        "itemIndex": 0
      },
      {
        "pathIndex": 49141,
        "itemIndex": 0
      }
    ],
    "blackRailAndCapItems": [
      {
        "pathIndex": 54634,
        "itemIndex": 0
      },
      {
        "pathIndex": 54635,
        "itemIndex": 0
      },
      {
        "pathIndex": 54636,
        "itemIndex": 0
      },
      {
        "pathIndex": 54637,
        "itemIndex": 0
      },
      {
        "pathIndex": 54638,
        "itemIndex": 0
      },
      {
        "pathIndex": 54639,
        "itemIndex": 0
      },
      {
        "pathIndex": 54640,
        "itemIndex": 0
      },
      {
        "pathIndex": 54641,
        "itemIndex": 0
      },
      {
        "pathIndex": 54642,
        "itemIndex": 0
      },
      {
        "pathIndex": 54643,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "corner-sloping-pane",
    "contourItems": [
      {
        "pathIndex": 49124,
        "itemIndex": 0
      },
      {
        "pathIndex": 49125,
        "itemIndex": 0
      },
      {
        "pathIndex": 49126,
        "itemIndex": 0
      },
      {
        "pathIndex": 49127,
        "itemIndex": 0
      }
    ],
    "blackRailAndCapItems": [
      {
        "pathIndex": 54202,
        "itemIndex": 0
      },
      {
        "pathIndex": 54203,
        "itemIndex": 0
      },
      {
        "pathIndex": 54204,
        "itemIndex": 0
      },
      {
        "pathIndex": 54205,
        "itemIndex": 0
      },
      {
        "pathIndex": 54206,
        "itemIndex": 0
      },
      {
        "pathIndex": 54207,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "sloping-continuation-1",
    "contourItems": [
      {
        "pathIndex": 49120,
        "itemIndex": 0
      },
      {
        "pathIndex": 49121,
        "itemIndex": 0
      },
      {
        "pathIndex": 49122,
        "itemIndex": 0
      },
      {
        "pathIndex": 49123,
        "itemIndex": 0
      }
    ],
    "blackRailAndCapItems": [
      {
        "pathIndex": 54198,
        "itemIndex": 0
      },
      {
        "pathIndex": 54199,
        "itemIndex": 0
      },
      {
        "pathIndex": 54200,
        "itemIndex": 0
      },
      {
        "pathIndex": 54201,
        "itemIndex": 0
      }
    ]
  },
  {
    "id": "sloping-continuation-2",
    "contourItems": [
      {
        "pathIndex": 49116,
        "itemIndex": 0
      },
      {
        "pathIndex": 49117,
        "itemIndex": 0
      },
      {
        "pathIndex": 49118,
        "itemIndex": 0
      },
      {
        "pathIndex": 49119,
        "itemIndex": 0
      }
    ],
    "blackRailAndCapItems": [
      {
        "pathIndex": 54194,
        "itemIndex": 0
      },
      {
        "pathIndex": 54195,
        "itemIndex": 0
      },
      {
        "pathIndex": 54196,
        "itemIndex": 0
      },
      {
        "pathIndex": 54197,
        "itemIndex": 0
      }
    ]
  }
] as const;

/** Inside faces: north return toward the corner, then increasing page y. */
export const GROUND_NORTH_CORNER_INNER_CHAIN = [
  {
    "pathIndex": 54640,
    "itemIndex": 0,
    "reversed": true
  },
  {
    "pathIndex": 54207,
    "itemIndex": 0,
    "reversed": false
  },
  {
    "pathIndex": 54201,
    "itemIndex": 0,
    "reversed": false
  },
  {
    "pathIndex": 54197,
    "itemIndex": 0,
    "reversed": false
  }
] as const satisfies readonly GroundNorthCornerDirectedItemRef[];

/** Outside faces, retained as a distinct parallel chain; do not mix the two. */
export const GROUND_NORTH_CORNER_OUTER_CHAIN = [
  {
    "pathIndex": 54643,
    "itemIndex": 0,
    "reversed": true
  },
  {
    "pathIndex": 54204,
    "itemIndex": 0,
    "reversed": false
  },
  {
    "pathIndex": 54198,
    "itemIndex": 0,
    "reversed": false
  },
  {
    "pathIndex": 54194,
    "itemIndex": 0,
    "reversed": false
  }
] as const satisfies readonly GroundNorthCornerDirectedItemRef[];

/** Native wall context. Closing the pane-to-wall gap is a consumer estimate. */
export const GROUND_NORTH_CORNER_WALL_INTERFACE = {
  "fillPathIndex": 52198,
  "northReturnFacingFillItems": [
    {
      "pathIndex": 52198,
      "itemIndex": 20
    },
    {
      "pathIndex": 52198,
      "itemIndex": 21
    },
    {
      "pathIndex": 52198,
      "itemIndex": 22
    },
    {
      "pathIndex": 52198,
      "itemIndex": 23
    }
  ],
  "recessStrokes": [
    {
      "pathIndex": 52879,
      "itemIndex": 0
    },
    {
      "pathIndex": 52883,
      "itemIndex": 0
    }
  ],
  "outlineItems": [
    {
      "pathIndex": 55190,
      "itemIndex": 0
    },
    {
      "pathIndex": 55191,
      "itemIndex": 0
    },
    {
      "pathIndex": 55192,
      "itemIndex": 0
    },
    {
      "pathIndex": 55193,
      "itemIndex": 0
    },
    {
      "pathIndex": 55194,
      "itemIndex": 0
    },
    {
      "pathIndex": 55195,
      "itemIndex": 0
    },
    {
      "pathIndex": 55196,
      "itemIndex": 0
    },
    {
      "pathIndex": 55197,
      "itemIndex": 0
    }
  ],
  "sourceGapIsNotSnapped": true
} as const;

/** Use center/radius evidence from ground-column-trace.ts; do not move this symbol. */
export const GROUND_NORTH_CORNER_COLUMN_CONTEXT = {
  id: 'column-pdf6-52303', sourcePathIndex: 52303,
  evidenceConsumer: 'GROUND_COLUMN_TRACE',
} as const;

/** Pale site edges precede/lie outside the black glazing; excluded from shell chains. */
export const GROUND_NORTH_CORNER_EXCLUDED_SITE_ITEMS = [
  {
    "pathIndex": 13420,
    "itemIndex": 0
  },
  {
    "pathIndex": 13421,
    "itemIndex": 0
  }
] as const;
