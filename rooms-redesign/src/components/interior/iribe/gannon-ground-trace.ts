/**
 * SOURCE ONLY: Gannon IRB 0318 and its immediate Ground public connection.
 * Original HDR/UMD guide[6], 576 x 576 PDF pt, top-left origin, +Y down.
 * All native path/item indices, commands, endpoints, controls, bounds and paint
 * fields are preserved. Compound paths also contain explicitly excluded context.
 * Boundary selections are open native runs, not a silently closed room polygon.
 * Virtual thresholds, junctions and one curve handoff are separate estimates.
 * Map endpoints AND cubic controls through groundGuidePlan only in a consumer.
 * See docs/research/iribe/gannon-ground-source-2026-10-03.md for assignment,
 * the west doorway paint conflict, stepped-transition limits and replay audit.
 */
export type GannonGroundPdfPoint = readonly [pdfX: number, pdfY: number];
export type GannonGroundPdfBounds = readonly [x0: number, y0: number, x1: number, y1: number];
export type GannonGroundSourceCommand =
  | readonly ['l', from: GannonGroundPdfPoint, to: GannonGroundPdfPoint]
  | readonly ['c', from: GannonGroundPdfPoint, control1: GannonGroundPdfPoint,
      control2: GannonGroundPdfPoint, to: GannonGroundPdfPoint]
  | readonly ['re', bounds: GannonGroundPdfBounds, orientation: number];
export interface GannonGroundSourceStyle {
  readonly type: 's' | 'f' | 'fs';
  readonly color: readonly [number, number, number] | null;
  readonly fill: readonly [number, number, number] | null;
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
export interface GannonGroundSourcePath {
  readonly pathIndex: number;
  readonly seqno: number;
  readonly boundsPt: GannonGroundPdfBounds;
  readonly style: keyof typeof GANNON_GROUND_SOURCE_STYLES;
  readonly roles: readonly string[];
  readonly items: readonly { readonly itemIndex: number; readonly command: GannonGroundSourceCommand }[];
}
export interface GannonGroundDirectedItemRef {
  readonly pathIndex: number;
  readonly itemIndex: number;
  readonly reversed: boolean;
  /** Fractions select part of a native command without rewriting its endpoints.
   * t0/t1 are parameter bounds in original travel, even for reversed refs. */
  readonly t0?: number;
  readonly t1?: number;
}
export interface GannonGroundBoundaryRun {
  readonly id: string;
  readonly items: readonly GannonGroundDirectedItemRef[];
  readonly interpretation: string;
}

// Exact representations of source binary floats are intentional.
/* eslint-disable no-loss-of-precision */
export const GANNON_GROUND_PROVENANCE = {
  "sourceUrl": "https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf",
  "pdfSha256": "c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474",
  "pageIndex": 6,
  "pageOrdinal": 7,
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
  "identityConvention": "Zero-based original drawing/item indices; seqno separately retained. No renumbering after filtering.",
  "coordinateTreatment": "unchanged-source-float; exact round-trip decimals",
  "registrationConsumer": "groundGuidePlan; no transform applied here",
  "inspectedPageIndices": [
    5,
    6,
    8
  ],
  "focusBoundsPt": [
    321,
    77,
    461,
    292
  ],
  "sourcePathCount": 708,
  "sourceItemCount": 1861,
  "sourceStyleCount": 12,
  "surveyedGeometry": false,
  "runtimeIntegrated": false,
  "closedSourceRoomPolygon": false,
  "roomAssignment": {
    "id": "0318",
    "name": "Gannon Auditorium",
    "capacity": 100,
    "officialListingUrl": "https://www.cs.umd.edu/meeting-event-request",
    "officialRoomPlanUrl": "https://www.cs.umd.edu/sites/default/files/images/floorplans/irb_0318_floorplan.png",
    "floorEvidenceUrl": "https://www.cs.umd.edu/cs50/schedule.html",
    "wayfindingUrl": "https://drf.umd.edu/sites/default/files/2024-01/iribe_wayfinding_ground-01.png"
  }
} as const;

export const GANNON_GROUND_SOURCE_STYLES = {
  "style-0": {"type": "s", "color": [0.3019913136959076, 0.3019913136959076, 0.3019913136959076], "fill": null, "width": 0.10199999809265137, "closePath": false, "even_odd": null, "lineCap": [1, 1, 1], "lineJoin": 1.0, "dashes": "[] 0", "stroke_opacity": 1.0, "fill_opacity": null, "layer": ""},
  "style-1": {"type": "s", "color": [0.3019913136959076, 0.3019913136959076, 0.3019913136959076], "fill": null, "width": 0.06800000369548798, "closePath": false, "even_odd": null, "lineCap": [1, 1, 1], "lineJoin": 1.0, "dashes": "[] 0", "stroke_opacity": 1.0, "fill_opacity": null, "layer": ""},
  "style-2": {"type": "s", "color": [0.501991331577301, 0.501991331577301, 0.501991331577301], "fill": null, "width": 0.06800000369548798, "closePath": false, "even_odd": null, "lineCap": [0, 0, 0], "lineJoin": 0.0, "dashes": "[] 0", "stroke_opacity": 1.0, "fill_opacity": null, "layer": ""},
  "style-3": {"type": "f", "color": null, "fill": [0.0, 0.0, 0.0], "width": null, "closePath": false, "even_odd": false, "lineCap": null, "lineJoin": null, "dashes": null, "stroke_opacity": null, "fill_opacity": 1.0, "layer": ""},
  "style-4": {"type": "f", "color": null, "fill": [0.0, 0.0, 0.0], "width": null, "closePath": null, "even_odd": false, "lineCap": null, "lineJoin": null, "dashes": null, "stroke_opacity": null, "fill_opacity": 1.0, "layer": ""},
  "style-5": {"type": "f", "color": null, "fill": [1.0, 1.0, 1.0], "width": null, "closePath": false, "even_odd": false, "lineCap": null, "lineJoin": null, "dashes": null, "stroke_opacity": null, "fill_opacity": 1.0, "layer": ""},
  "style-6": {"type": "s", "color": [0.0, 0.0, 0.0], "fill": null, "width": 0.2709999978542328, "closePath": false, "even_odd": null, "lineCap": [0, 0, 0], "lineJoin": 0.0, "dashes": "[ 2.71 2.71 ] 0", "stroke_opacity": 1.0, "fill_opacity": null, "layer": ""},
  "style-7": {"type": "fs", "color": [0.0, 0.0, 0.0], "fill": [0.0, 0.0, 0.0], "width": 0.2709999978542328, "closePath": false, "even_odd": false, "lineCap": [0, 0, 0], "lineJoin": 0.0, "dashes": "[] 0", "stroke_opacity": 1.0, "fill_opacity": 1.0, "layer": ""},
  "style-8": {"type": "s", "color": [0.0, 0.0, 0.0], "fill": null, "width": 0.2709999978542328, "closePath": false, "even_odd": null, "lineCap": [0, 0, 0], "lineJoin": 0.0, "dashes": "[ 2.766 2.766 ] 0", "stroke_opacity": 1.0, "fill_opacity": null, "layer": ""},
  "style-9": {"type": "s", "color": [0.0, 0.0, 0.0], "fill": null, "width": 0.2709999978542328, "closePath": false, "even_odd": null, "lineCap": [0, 0, 0], "lineJoin": 0.0, "dashes": "[] 0", "stroke_opacity": 1.0, "fill_opacity": null, "layer": ""},
  "style-10": {"type": "s", "color": [0.0, 0.0, 0.0], "fill": null, "width": 0.06800000369548798, "closePath": false, "even_odd": null, "lineCap": [1, 1, 1], "lineJoin": 1.0, "dashes": "[] 0", "stroke_opacity": 1.0, "fill_opacity": null, "layer": ""},
  "style-11": {"type": "s", "color": [0.0, 0.0, 0.0], "fill": null, "width": 0.33899998664855957, "closePath": false, "even_odd": null, "lineCap": [1, 1, 1], "lineJoin": 1.0, "dashes": "[] 0", "stroke_opacity": 1.0, "fill_opacity": null, "layer": ""}
} as const satisfies Readonly<Record<string, GannonGroundSourceStyle>>;

export const GANNON_GROUND_SOURCE_PATHS = [
  { "pathIndex": 48785, "seqno": 48785, "boundsPt": [372.0357971191406, 218.027099609375, 377.7738037109375, 224.18710327148438], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["c", [377.41180419921875, 224.18710327148438], [377.7738037109375, 220.06210327148438], [376.17279052734375, 218.2270965576172], [372.0357971191406, 218.027099609375]]}
  ] },
  { "pathIndex": 48786, "seqno": 48786, "boundsPt": [391.239501953125, 224.29261779785156, 398.72650146484375, 231.38961791992188], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["c", [391.239501953125, 230.43661499023438], [395.2695007324219, 231.38961791992188], [397.92950439453125, 228.35562133789062], [398.72650146484375, 224.29261779785156]]}
  ] },
  { "pathIndex": 48787, "seqno": 48787, "boundsPt": [371.7611999511719, 223.69268798828125, 372.03619384765625, 223.69268798828125], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [371.7611999511719, 223.69268798828125], [372.03619384765625, 223.69268798828125]]}
  ] },
  { "pathIndex": 48788, "seqno": 48788, "boundsPt": [372.0362854003906, 218.01950073242188, 372.0362854003906, 223.69349670410156], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [372.0362854003906, 218.01950073242188], [372.0362854003906, 223.69349670410156]]}
  ] },
  { "pathIndex": 48789, "seqno": 48789, "boundsPt": [371.7611999511719, 218.01950073242188, 372.03619384765625, 218.01950073242188], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [371.7611999511719, 218.01950073242188], [372.03619384765625, 218.01950073242188]]}
  ] },
  { "pathIndex": 48790, "seqno": 48790, "boundsPt": [371.7611999511719, 218.01869201660156, 371.7611999511719, 223.69268798828125], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [371.7611999511719, 223.69268798828125], [371.7611999511719, 218.01869201660156]]}
  ] },
  { "pathIndex": 48791, "seqno": 48791, "boundsPt": [364.4007873535156, 225.73728942871094, 370.560791015625, 231.47329711914062], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["c", [370.560791015625, 226.0972900390625], [366.435791015625, 225.73728942871094], [364.602783203125, 227.33729553222656], [364.4007873535156, 231.47329711914062]]}
  ] },
  { "pathIndex": 48792, "seqno": 48792, "boundsPt": [370.0672912597656, 231.47329711914062, 370.0672912597656, 231.74929809570312], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [370.0672912597656, 231.74929809570312], [370.0672912597656, 231.47329711914062]]}
  ] },
  { "pathIndex": 48793, "seqno": 48793, "boundsPt": [364.3938903808594, 231.473388671875, 370.0679016113281, 231.473388671875], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [364.3938903808594, 231.473388671875], [370.0679016113281, 231.473388671875]]}
  ] },
  { "pathIndex": 48794, "seqno": 48794, "boundsPt": [364.3938903808594, 231.47329711914062, 364.3938903808594, 231.74929809570312], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [364.3938903808594, 231.74929809570312], [364.3938903808594, 231.47329711914062]]}
  ] },
  { "pathIndex": 48795, "seqno": 48795, "boundsPt": [364.3932800292969, 231.74929809570312, 370.0672912597656, 231.74929809570312], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [370.0672912597656, 231.74929809570312], [364.3932800292969, 231.74929809570312]]}
  ] },
  { "pathIndex": 48901, "seqno": 48901, "boundsPt": [433.6689147949219, 109.45450592041016, 434.36090087890625, 114.84750366210938], "style": "style-0", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [433.6689147949219, 114.84750366210938], [434.36090087890625, 109.45450592041016]]}
  ] },
  { "pathIndex": 48902, "seqno": 48902, "boundsPt": [444.4543151855469, 110.8369140625, 445.14630126953125, 116.22891235351562], "style": "style-0", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.4543151855469, 116.22891235351562], [445.14630126953125, 110.8369140625]]}
  ] },
  { "pathIndex": 48903, "seqno": 48903, "boundsPt": [434.3606262207031, 109.45420837402344, 439.5506286621094, 115.5382080078125], "style": "style-0", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["c", [439.0616149902344, 115.5382080078125], [439.5506286621094, 111.72520446777344], [438.1736145019531, 109.94320678710938], [434.3606262207031, 109.45420837402344]]}
  ] },
  { "pathIndex": 48904, "seqno": 48904, "boundsPt": [439.0615234375, 110.34839630126953, 445.1465148925781, 115.53839874267578], "style": "style-0", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["c", [445.1465148925781, 110.83639526367188], [441.3335266113281, 110.34839630126953], [439.551513671875, 111.72539520263672], [439.0615234375, 115.53839874267578]]}
  ] },
  { "pathIndex": 48921, "seqno": 48921, "boundsPt": [411.46038818359375, 154.968994140625, 417.1263732910156, 155.2449951171875], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [411.46038818359375, 154.968994140625], [417.1263732910156, 155.2449951171875]]}
  ] },
  { "pathIndex": 48926, "seqno": 48926, "boundsPt": [432.10589599609375, 126.90000915527344, 437.2958984375, 132.9840087890625], "style": "style-0", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["c", [436.8078918457031, 132.9840087890625], [437.2958984375, 129.17100524902344], [435.9198913574219, 127.38900756835938], [432.10589599609375, 126.90000915527344]]}
  ] },
  { "pathIndex": 48927, "seqno": 48927, "boundsPt": [436.8083801269531, 127.79419708251953, 442.8913879394531, 132.98419189453125], "style": "style-0", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["c", [442.8913879394531, 128.28219604492188], [439.0793762207031, 127.79419708251953], [437.29638671875, 129.17120361328125], [436.8083801269531, 132.98419189453125]]}
  ] },
  { "pathIndex": 48928, "seqno": 48928, "boundsPt": [431.4151916503906, 126.90069580078125, 432.106201171875, 132.29269409179688], "style": "style-0", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [431.4151916503906, 132.29269409179688], [432.106201171875, 126.90069580078125]]}
  ] },
  { "pathIndex": 48948, "seqno": 48948, "boundsPt": [442.20050048828125, 128.28289794921875, 442.8915100097656, 133.67489624023438], "style": "style-0", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [442.20050048828125, 133.67489624023438], [442.8915100097656, 128.28289794921875]]}
  ] },
  { "pathIndex": 48960, "seqno": 48960, "boundsPt": [417.1257019042969, 154.96990966796875, 417.1407165527344, 155.24490356445312], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [417.1257019042969, 155.24490356445312], [417.1407165527344, 154.96990966796875]]}
  ] },
  { "pathIndex": 48961, "seqno": 48961, "boundsPt": [411.4732971191406, 154.69369506835938, 417.1402893066406, 154.96969604492188], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [417.1402893066406, 154.96969604492188], [411.4732971191406, 154.69369506835938]]}
  ] },
  { "pathIndex": 48962, "seqno": 48962, "boundsPt": [411.46038818359375, 154.69400024414062, 411.473388671875, 154.968994140625], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [411.46038818359375, 154.968994140625], [411.473388671875, 154.69400024414062]]}
  ] },
  { "pathIndex": 48963, "seqno": 48963, "boundsPt": [411.2406005859375, 149.1409912109375, 417.13360595703125, 154.968994140625], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["c", [417.13360595703125, 154.968994140625], [417.13360595703125, 150.82798767089844], [415.37860107421875, 149.1409912109375], [411.2406005859375, 149.2989959716797]]}
  ] },
  { "pathIndex": 48964, "seqno": 48964, "boundsPt": [412.01220703125, 143.63571166992188, 417.6781921386719, 143.91171264648438], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [412.01220703125, 143.63571166992188], [417.6781921386719, 143.91171264648438]]}
  ] },
  { "pathIndex": 48965, "seqno": 48965, "boundsPt": [417.6636047363281, 143.91171264648438, 417.6776123046875, 144.18771362304688], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [417.6776123046875, 143.91171264648438], [417.6636047363281, 144.18771362304688]]}
  ] },
  { "pathIndex": 48966, "seqno": 48966, "boundsPt": [411.997314453125, 143.91159057617188, 417.664306640625, 144.18759155273438], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [417.664306640625, 144.18759155273438], [411.997314453125, 143.91159057617188]]}
  ] },
  { "pathIndex": 48967, "seqno": 48967, "boundsPt": [411.9971923828125, 143.63571166992188, 412.01220703125, 143.91171264648438], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [412.01220703125, 143.63571166992188], [411.9971923828125, 143.91171264648438]]}
  ] },
  { "pathIndex": 48968, "seqno": 48968, "boundsPt": [411.2432861328125, 144.18771362304688, 417.65728759765625, 149.81771850585938], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["c", [411.2432861328125, 149.2567138671875], [415.34527587890625, 149.81771850585938], [417.25628662109375, 148.30770874023438], [417.65728759765625, 144.18771362304688]]}
  ] },
  { "pathIndex": 48969, "seqno": 48969, "boundsPt": [410.5816955566406, 167.07101440429688, 416.23968505859375, 167.4860076904297], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [410.5816955566406, 167.07101440429688], [416.23968505859375, 167.4860076904297]]}
  ] },
  { "pathIndex": 48970, "seqno": 48970, "boundsPt": [416.239013671875, 167.21099853515625, 416.2610168457031, 167.48599243164062], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [416.239013671875, 167.48599243164062], [416.2610168457031, 167.21099853515625]]}
  ] },
  { "pathIndex": 48971, "seqno": 48971, "boundsPt": [410.601318359375, 166.7952117919922, 416.26031494140625, 167.21121215820312], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [416.26031494140625, 167.21121215820312], [410.601318359375, 166.7952117919922]]}
  ] },
  { "pathIndex": 48972, "seqno": 48972, "boundsPt": [410.5816955566406, 166.7960205078125, 410.6016845703125, 167.07101440429688], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [410.5816955566406, 167.07101440429688], [410.6016845703125, 166.7960205078125]]}
  ] },
  { "pathIndex": 48973, "seqno": 48973, "boundsPt": [410.5025939941406, 161.3406982421875, 416.3555908203125, 167.210693359375], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["c", [416.25360107421875, 167.210693359375], [416.3555908203125, 163.07069396972656], [414.64361572265625, 161.3406982421875], [410.5025939941406, 161.39869689941406]]}
  ] },
  { "pathIndex": 48974, "seqno": 48974, "boundsPt": [411.4114074707031, 155.75491333007812, 417.0704040527344, 156.16990661621094], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [411.4114074707031, 155.75491333007812], [417.0704040527344, 156.16990661621094]]}
  ] },
  { "pathIndex": 48975, "seqno": 48975, "boundsPt": [417.05010986328125, 156.16989135742188, 417.0700988769531, 156.44488525390625], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [417.0700988769531, 156.16989135742188], [417.05010986328125, 156.44488525390625]]}
  ] },
  { "pathIndex": 48976, "seqno": 48976, "boundsPt": [411.39141845703125, 156.0301055908203, 417.0504150390625, 156.44509887695312], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [417.0504150390625, 156.44509887695312], [411.39141845703125, 156.0301055908203]]}
  ] },
  { "pathIndex": 48977, "seqno": 48977, "boundsPt": [411.39141845703125, 155.75491333007812, 411.4114074707031, 156.0299072265625], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [411.4114074707031, 155.75491333007812], [411.39141845703125, 156.0299072265625]]}
  ] },
  { "pathIndex": 48978, "seqno": 48978, "boundsPt": [410.5049133300781, 156.4445037841797, 417.0419006347656, 162.01649475097656], "style": "style-0", "roles": ["gannon-east-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["c", [410.5049133300781, 161.35549926757812], [414.5929260253906, 162.01649475097656], [416.5389099121094, 160.55450439453125], [417.0419006347656, 156.4445037841797]]}
  ] },
  { "pathIndex": 49010, "seqno": 49010, "boundsPt": [392.0718078613281, 223.91720581054688, 392.3818054199219, 223.97320556640625], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [392.0718078613281, 223.91720581054688], [392.3818054199219, 223.97320556640625]]}
  ] },
  { "pathIndex": 49011, "seqno": 49011, "boundsPt": [391.2315979003906, 223.97140502929688, 392.38360595703125, 230.48941040039062], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [391.2315979003906, 230.48941040039062], [392.38360595703125, 223.97140502929688]]}
  ] },
  { "pathIndex": 49012, "seqno": 49012, "boundsPt": [390.9205017089844, 230.43460083007812, 391.2304992675781, 230.4906005859375], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [390.9205017089844, 230.43460083007812], [391.2304992675781, 230.4906005859375]]}
  ] },
  { "pathIndex": 49013, "seqno": 49013, "boundsPt": [390.9197998046875, 223.91720581054688, 392.0718078613281, 230.43521118164062], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [392.0718078613281, 223.91720581054688], [390.9197998046875, 230.43521118164062]]}
  ] },
  { "pathIndex": 49014, "seqno": 49014, "boundsPt": [381.9750061035156, 237.37921142578125, 388.4020080566406, 245.47720336914062], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["c", [386.1990051269531, 245.47720336914062], [388.4020080566406, 240.97019958496094], [386.9320068359375, 238.1511993408203], [381.9750061035156, 237.37921142578125]]}
  ] },
  { "pathIndex": 49015, "seqno": 49015, "boundsPt": [381.10260009765625, 242.74429321289062, 381.235595703125, 242.98529052734375], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [381.10260009765625, 242.98529052734375], [381.235595703125, 242.74429321289062]]}
  ] },
  { "pathIndex": 49016, "seqno": 49016, "boundsPt": [381.2351989746094, 242.743408203125, 386.2041931152344, 245.48040771484375], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [386.2041931152344, 245.48040771484375], [381.2351989746094, 242.743408203125]]}
  ] },
  { "pathIndex": 49017, "seqno": 49017, "boundsPt": [386.0718078613281, 245.48098754882812, 386.2048034667969, 245.72198486328125], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [386.0718078613281, 245.72198486328125], [386.2048034667969, 245.48098754882812]]}
  ] },
  { "pathIndex": 49018, "seqno": 49018, "boundsPt": [381.10260009765625, 242.98529052734375, 386.07159423828125, 245.7222900390625], "style": "style-0", "roles": ["neighbor-door-unassigned"], "items": [
    {"itemIndex": 0, "command": ["l", [381.10260009765625, 242.98529052734375], [386.07159423828125, 245.7222900390625]]}
  ] },
  { "pathIndex": 49042, "seqno": 49042, "boundsPt": [331.9056091308594, 188.42759704589844, 337.47662353515625, 189.49859619140625], "style": "style-0", "roles": ["gannon-front-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [331.9056091308594, 189.49859619140625], [337.47662353515625, 188.42759704589844]]}
  ] },
  { "pathIndex": 49043, "seqno": 49043, "boundsPt": [337.47698974609375, 188.42800903320312, 337.5279846191406, 188.69900512695312], "style": "style-0", "roles": ["gannon-front-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [337.47698974609375, 188.42800903320312], [337.5279846191406, 188.69900512695312]]}
  ] },
  { "pathIndex": 49044, "seqno": 49044, "boundsPt": [331.9573974609375, 188.69931030273438, 337.5284118652344, 189.7703094482422], "style": "style-0", "roles": ["gannon-front-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["l", [337.5284118652344, 188.69931030273438], [331.9573974609375, 189.7703094482422]]}
  ] },
  { "pathIndex": 49045, "seqno": 49045, "boundsPt": [332.97491455078125, 188.7010040283203, 338.06292724609375, 195.07000732421875], "style": "style-0", "roles": ["gannon-front-door-leaf-or-swing"], "items": [
    {"itemIndex": 0, "command": ["c", [332.97491455078125, 195.07000732421875], [336.75592041015625, 194.34400939941406], [338.06292724609375, 192.5120086669922], [337.5209045410156, 188.7010040283203]]}
  ] },
  { "pathIndex": 49073, "seqno": 49073, "boundsPt": [413.9512939453125, 269.8752136230469, 417.3612976074219, 281.0762023925781], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [417.3612976074219, 269.8752136230469], [413.9512939453125, 281.0762023925781]]}
  ] },
  { "pathIndex": 49074, "seqno": 49074, "boundsPt": [417.3608093261719, 269.87469482421875, 417.7568054199219, 269.9956970214844], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [417.7568054199219, 269.9956970214844], [417.3608093261719, 269.87469482421875]]}
  ] },
  { "pathIndex": 49075, "seqno": 49075, "boundsPt": [414.3479919433594, 269.9963073730469, 417.7569885253906, 281.1972961425781], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [414.3479919433594, 281.1972961425781], [417.7569885253906, 269.9963073730469]]}
  ] },
  { "pathIndex": 49076, "seqno": 49076, "boundsPt": [417.3612976074219, 269.8752136230469, 417.7572937011719, 269.9962158203125], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [417.3612976074219, 269.8752136230469], [417.7572937011719, 269.9962158203125]]}
  ] },
  { "pathIndex": 49077, "seqno": 49077, "boundsPt": [417.3601989746094, 258.6744079589844, 420.77020263671875, 269.8753967285156], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [420.77020263671875, 258.6744079589844], [417.3601989746094, 269.8753967285156]]}
  ] },
  { "pathIndex": 49078, "seqno": 49078, "boundsPt": [420.7698974609375, 258.6737060546875, 421.1658935546875, 258.7947082519531], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [421.1658935546875, 258.7947082519531], [420.7698974609375, 258.6737060546875]]}
  ] },
  { "pathIndex": 49079, "seqno": 49079, "boundsPt": [417.7568054199219, 258.7947082519531, 421.1658020019531, 269.9956970214844], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [417.7568054199219, 269.9956970214844], [421.1658020019531, 258.7947082519531]]}
  ] },
  { "pathIndex": 49080, "seqno": 49080, "boundsPt": [420.77020263671875, 258.6744079589844, 421.16619873046875, 258.79541015625], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [420.77020263671875, 258.6744079589844], [421.16619873046875, 258.79541015625]]}
  ] },
  { "pathIndex": 49081, "seqno": 49081, "boundsPt": [420.7698974609375, 247.47280883789062, 424.1778869628906, 258.6737976074219], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [424.1778869628906, 247.47280883789062], [420.7698974609375, 258.6737976074219]]}
  ] },
  { "pathIndex": 49082, "seqno": 49082, "boundsPt": [424.177490234375, 247.47219848632812, 424.573486328125, 247.59320068359375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [424.573486328125, 247.59320068359375], [424.177490234375, 247.47219848632812]]}
  ] },
  { "pathIndex": 49083, "seqno": 49083, "boundsPt": [421.1658935546875, 247.5937042236328, 424.5738830566406, 258.7947082519531], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [421.1658935546875, 258.7947082519531], [424.5738830566406, 247.5937042236328]]}
  ] },
  { "pathIndex": 49084, "seqno": 49084, "boundsPt": [424.1778869628906, 247.47280883789062, 424.5738830566406, 247.59381103515625], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [424.1778869628906, 247.47280883789062], [424.5738830566406, 247.59381103515625]]}
  ] },
  { "pathIndex": 49085, "seqno": 49085, "boundsPt": [424.17791748046875, 236.27191162109375, 427.5869140625, 247.47291564941406], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [427.5869140625, 236.27191162109375], [424.17791748046875, 247.47291564941406]]}
  ] },
  { "pathIndex": 49086, "seqno": 49086, "boundsPt": [427.5863952636719, 236.27268981933594, 427.9823913574219, 236.39169311523438], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [427.9823913574219, 236.39169311523438], [427.5863952636719, 236.27268981933594]]}
  ] },
  { "pathIndex": 49087, "seqno": 49087, "boundsPt": [424.573486328125, 236.39219665527344, 427.98248291015625, 247.59320068359375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [424.573486328125, 247.59320068359375], [427.98248291015625, 236.39219665527344]]}
  ] },
  { "pathIndex": 49088, "seqno": 49088, "boundsPt": [427.5869140625, 236.27191162109375, 427.98291015625, 236.3909149169922], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [427.5869140625, 236.27191162109375], [427.98291015625, 236.3909149169922]]}
  ] },
  { "pathIndex": 49089, "seqno": 49089, "boundsPt": [427.5857849121094, 225.07040405273438, 430.99578857421875, 236.2714080810547], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [430.99578857421875, 225.07040405273438], [427.5857849121094, 236.2714080810547]]}
  ] },
  { "pathIndex": 49090, "seqno": 49090, "boundsPt": [430.9955139160156, 225.06979370117188, 431.3915100097656, 225.1907958984375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [431.3915100097656, 225.1907958984375], [430.9955139160156, 225.06979370117188]]}
  ] },
  { "pathIndex": 49091, "seqno": 49091, "boundsPt": [427.9823913574219, 225.19068908691406, 431.3913879394531, 236.39169311523438], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [427.9823913574219, 236.39169311523438], [431.3913879394531, 225.19068908691406]]}
  ] },
  { "pathIndex": 49092, "seqno": 49092, "boundsPt": [430.99578857421875, 225.07040405273438, 431.39178466796875, 225.19140625], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [430.99578857421875, 225.07040405273438], [431.39178466796875, 225.19140625]]}
  ] },
  { "pathIndex": 49093, "seqno": 49093, "boundsPt": [430.99542236328125, 213.86880493164062, 434.4034118652344, 225.06980895996094], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [434.4034118652344, 213.86880493164062], [430.99542236328125, 225.06980895996094]]}
  ] },
  { "pathIndex": 49094, "seqno": 49094, "boundsPt": [434.4034118652344, 213.8682861328125, 434.8004150390625, 213.98928833007812], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [434.8004150390625, 213.98928833007812], [434.4034118652344, 213.8682861328125]]}
  ] },
  { "pathIndex": 49095, "seqno": 49095, "boundsPt": [431.3915100097656, 213.9897918701172, 434.8005065917969, 225.1907958984375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [431.3915100097656, 225.1907958984375], [434.8005065917969, 213.9897918701172]]}
  ] },
  { "pathIndex": 49096, "seqno": 49096, "boundsPt": [434.4034118652344, 213.86880493164062, 434.8004150390625, 213.98980712890625], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [434.4034118652344, 213.86880493164062], [434.8004150390625, 213.98980712890625]]}
  ] },
  { "pathIndex": 49097, "seqno": 49097, "boundsPt": [434.40228271484375, 202.66799926757812, 437.8122863769531, 213.86900329589844], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [437.8122863769531, 202.66799926757812], [434.40228271484375, 213.86900329589844]]}
  ] },
  { "pathIndex": 49098, "seqno": 49098, "boundsPt": [437.8118896484375, 202.66751098632812, 438.2078857421875, 202.78851318359375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [438.2078857421875, 202.78851318359375], [437.8118896484375, 202.66751098632812]]}
  ] },
  { "pathIndex": 49099, "seqno": 49099, "boundsPt": [434.8004150390625, 202.7882843017578, 438.2084045410156, 213.98928833007812], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [434.8004150390625, 213.98928833007812], [438.2084045410156, 202.7882843017578]]}
  ] },
  { "pathIndex": 49100, "seqno": 49100, "boundsPt": [437.8122863769531, 202.66799926757812, 438.2082824707031, 202.78900146484375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [437.8122863769531, 202.66799926757812], [438.2082824707031, 202.78900146484375]]}
  ] },
  { "pathIndex": 49101, "seqno": 49101, "boundsPt": [437.8113098144531, 191.46649169921875, 441.2213134765625, 202.66749572753906], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [441.2213134765625, 191.46649169921875], [437.8113098144531, 202.66749572753906]]}
  ] },
  { "pathIndex": 49102, "seqno": 49102, "boundsPt": [441.2210998535156, 191.46591186523438, 441.6170959472656, 191.5869140625], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [441.6170959472656, 191.5869140625], [441.2210998535156, 191.46591186523438]]}
  ] },
  { "pathIndex": 49103, "seqno": 49103, "boundsPt": [438.2078857421875, 191.58750915527344, 441.61688232421875, 202.78851318359375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [438.2078857421875, 202.78851318359375], [441.61688232421875, 191.58750915527344]]}
  ] },
  { "pathIndex": 49104, "seqno": 49104, "boundsPt": [441.2213134765625, 191.46649169921875, 441.6173095703125, 191.58749389648438], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [441.2213134765625, 191.46649169921875], [441.6173095703125, 191.58749389648438]]}
  ] },
  { "pathIndex": 49105, "seqno": 49105, "boundsPt": [441.2203063964844, 180.2655029296875, 444.63031005859375, 191.4665069580078], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [444.63031005859375, 180.2655029296875], [441.2203063964844, 191.4665069580078]]}
  ] },
  { "pathIndex": 49106, "seqno": 49106, "boundsPt": [444.6300048828125, 180.264892578125, 445.0260009765625, 180.38589477539062], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [445.0260009765625, 180.38589477539062], [444.6300048828125, 180.264892578125]]}
  ] },
  { "pathIndex": 49107, "seqno": 49107, "boundsPt": [441.6170959472656, 180.3859100341797, 445.0260925292969, 191.5869140625], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [441.6170959472656, 191.5869140625], [445.0260925292969, 180.3859100341797]]}
  ] },
  { "pathIndex": 49108, "seqno": 49108, "boundsPt": [444.63031005859375, 180.2655029296875, 445.02630615234375, 180.38650512695312], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [444.63031005859375, 180.2655029296875], [445.02630615234375, 180.38650512695312]]}
  ] },
  { "pathIndex": 49109, "seqno": 49109, "boundsPt": [444.62982177734375, 169.06399536132812, 448.0378112792969, 180.26499938964844], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0378112792969, 169.06399536132812], [444.62982177734375, 180.26499938964844]]}
  ] },
  { "pathIndex": 49110, "seqno": 49110, "boundsPt": [448.03790283203125, 169.06338500976562, 448.4349060058594, 169.18438720703125], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [448.4349060058594, 169.18438720703125], [448.03790283203125, 169.06338500976562]]}
  ] },
  { "pathIndex": 49111, "seqno": 49111, "boundsPt": [445.0260009765625, 169.1848907470703, 448.43499755859375, 180.38589477539062], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [445.0260009765625, 180.38589477539062], [448.43499755859375, 169.1848907470703]]}
  ] },
  { "pathIndex": 49112, "seqno": 49112, "boundsPt": [448.0378112792969, 169.06399536132812, 448.434814453125, 169.18499755859375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0378112792969, 169.06399536132812], [448.434814453125, 169.18499755859375]]}
  ] },
  { "pathIndex": 49113, "seqno": 49113, "boundsPt": [448.0368957519531, 157.86318969726562, 451.4468994140625, 169.06419372558594], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [451.4468994140625, 157.86318969726562], [448.0368957519531, 169.06419372558594]]}
  ] },
  { "pathIndex": 49114, "seqno": 49114, "boundsPt": [451.44671630859375, 157.86390686035156, 451.84271240234375, 157.98291015625], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [451.84271240234375, 157.98291015625], [451.44671630859375, 157.86390686035156]]}
  ] },
  { "pathIndex": 49115, "seqno": 49115, "boundsPt": [448.4349060058594, 157.98338317871094, 451.8428955078125, 169.18438720703125], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [448.4349060058594, 169.18438720703125], [451.8428955078125, 157.98338317871094]]}
  ] },
  { "pathIndex": 49116, "seqno": 49116, "boundsPt": [451.4468994140625, 157.86318969726562, 451.8428955078125, 157.98219299316406], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [451.4468994140625, 157.86318969726562], [451.8428955078125, 157.98219299316406]]}
  ] },
  { "pathIndex": 49117, "seqno": 49117, "boundsPt": [451.44580078125, 146.66159057617188, 454.8558044433594, 157.8625946044922], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [454.8558044433594, 146.66159057617188], [451.44580078125, 157.8625946044922]]}
  ] },
  { "pathIndex": 49118, "seqno": 49118, "boundsPt": [454.8554992675781, 146.6610107421875, 455.2514953613281, 146.78201293945312], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [455.2514953613281, 146.78201293945312], [454.8554992675781, 146.6610107421875]]}
  ] },
  { "pathIndex": 49119, "seqno": 49119, "boundsPt": [451.84271240234375, 146.7819061279297, 455.251708984375, 157.98291015625], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [451.84271240234375, 157.98291015625], [455.251708984375, 146.7819061279297]]}
  ] },
  { "pathIndex": 49120, "seqno": 49120, "boundsPt": [454.8558044433594, 146.66159057617188, 455.2518005371094, 146.7825927734375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [454.8558044433594, 146.66159057617188], [455.2518005371094, 146.7825927734375]]}
  ] },
  { "pathIndex": 49121, "seqno": 49121, "boundsPt": [454.85479736328125, 135.45809936523438, 458.2648010253906, 146.66209411621094], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [458.2648010253906, 135.45809936523438], [454.85479736328125, 146.66209411621094]]}
  ] },
  { "pathIndex": 49122, "seqno": 49122, "boundsPt": [458.2644958496094, 135.45748901367188, 458.6604919433594, 135.5784912109375], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [458.6604919433594, 135.5784912109375], [458.2644958496094, 135.45748901367188]]}
  ] },
  { "pathIndex": 49123, "seqno": 49123, "boundsPt": [455.2514953613281, 135.57801818847656, 458.6604919433594, 146.78201293945312], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [455.2514953613281, 146.78201293945312], [458.6604919433594, 135.57801818847656]]}
  ] },
  { "pathIndex": 49129, "seqno": 49129, "boundsPt": [410.54229736328125, 281.0768127441406, 413.9523010253906, 292.2778015136719], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [413.9523010253906, 281.0768127441406], [410.54229736328125, 292.2778015136719]]}
  ] },
  { "pathIndex": 49130, "seqno": 49130, "boundsPt": [413.9519958496094, 281.0762939453125, 414.3479919433594, 281.1972961425781], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [414.3479919433594, 281.1972961425781], [413.9519958496094, 281.0762939453125]]}
  ] },
  { "pathIndex": 49131, "seqno": 49131, "boundsPt": [410.9389953613281, 281.1971130371094, 414.3479919433594, 292.3981018066406], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [410.9389953613281, 292.3981018066406], [414.3479919433594, 281.1971130371094]]}
  ] },
  { "pathIndex": 49132, "seqno": 49132, "boundsPt": [414.65618896484375, 121.1361083984375, 414.7091979980469, 121.54711151123047], "style": "style-1", "roles": ["corridor-east-pane-outline"], "items": [
    {"itemIndex": 0, "command": ["l", [414.7091979980469, 121.1361083984375], [414.65618896484375, 121.54711151123047]]}
  ] },
  { "pathIndex": 49135, "seqno": 49135, "boundsPt": [426.71868896484375, 122.6808853149414, 426.7716979980469, 123.09188842773438], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.71868896484375, 123.09188842773438], [426.7716979980469, 122.6808853149414]]}
  ] },
  { "pathIndex": 49138, "seqno": 49138, "boundsPt": [449.0713806152344, 125.54620361328125, 449.1243896484375, 125.95720672607422], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.1243896484375, 125.54620361328125], [449.0713806152344, 125.95720672607422]]}
  ] },
  { "pathIndex": 49250, "seqno": 49250, "boundsPt": [428.9425048828125, 132.07528686523438, 430.9335021972656, 132.33029174804688], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [430.9335021972656, 132.33029174804688], [428.9425048828125, 132.07528686523438]]}
  ] },
  { "pathIndex": 49251, "seqno": 49251, "boundsPt": [428.9281921386719, 132.07559204101562, 428.9432067871094, 132.19259643554688], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.9432067871094, 132.07559204101562], [428.9281921386719, 132.19259643554688]]}
  ] },
  { "pathIndex": 49252, "seqno": 49252, "boundsPt": [428.9285888671875, 132.19281005859375, 430.9195861816406, 132.44781494140625], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.9285888671875, 132.19281005859375], [430.9195861816406, 132.44781494140625]]}
  ] },
  { "pathIndex": 49257, "seqno": 49257, "boundsPt": [430.9189147949219, 132.33009338378906, 430.9339294433594, 132.44808959960938], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [430.9189147949219, 132.44808959960938], [430.9339294433594, 132.33009338378906]]}
  ] },
  { "pathIndex": 49258, "seqno": 49258, "boundsPt": [444.9306945800781, 116.23028564453125, 446.90869140625, 116.48328399658203], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.9306945800781, 116.23028564453125], [446.90869140625, 116.48328399658203]]}
  ] },
  { "pathIndex": 49259, "seqno": 49259, "boundsPt": [446.90899658203125, 116.36670684814453, 446.92401123046875, 116.48370361328125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [446.90899658203125, 116.48370361328125], [446.92401123046875, 116.36670684814453]]}
  ] },
  { "pathIndex": 49260, "seqno": 49260, "boundsPt": [444.9466247558594, 116.11360931396484, 446.9236145019531, 116.36660766601562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [446.9236145019531, 116.36660766601562], [444.9466247558594, 116.11360931396484]]}
  ] },
  { "pathIndex": 49261, "seqno": 49261, "boundsPt": [444.93060302734375, 116.11318969726562, 444.94659423828125, 116.23018646240234], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.94659423828125, 116.11318969726562], [444.93060302734375, 116.23018646240234]]}
  ] },
  { "pathIndex": 49262, "seqno": 49262, "boundsPt": [442.65679931640625, 133.83340454101562, 444.6528015136719, 134.08840942382812], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.6528015136719, 134.08840942382812], [442.65679931640625, 133.83340454101562]]}
  ] },
  { "pathIndex": 49267, "seqno": 49267, "boundsPt": [442.64208984375, 133.8330078125, 442.6571044921875, 133.95001220703125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [442.6571044921875, 133.8330078125], [442.64208984375, 133.95001220703125]]}
  ] },
  { "pathIndex": 49272, "seqno": 49272, "boundsPt": [442.6426086425781, 133.95010375976562, 444.63861083984375, 134.20510864257812], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [442.6426086425781, 133.95010375976562], [444.63861083984375, 134.20510864257812]]}
  ] },
  { "pathIndex": 49273, "seqno": 49273, "boundsPt": [444.6383056640625, 134.0885009765625, 444.6533203125, 134.20550537109375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.6383056640625, 134.20550537109375], [444.6533203125, 134.0885009765625]]}
  ] },
  { "pathIndex": 49274, "seqno": 49274, "boundsPt": [431.1995849609375, 114.47088623046875, 433.20758056640625, 114.72888946533203], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [431.1995849609375, 114.47088623046875], [433.20758056640625, 114.72888946533203]]}
  ] },
  { "pathIndex": 49275, "seqno": 49275, "boundsPt": [433.2084045410156, 114.6113052368164, 433.2234191894531, 114.72830200195312], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [433.2084045410156, 114.72830200195312], [433.2234191894531, 114.6113052368164]]}
  ] },
  { "pathIndex": 49276, "seqno": 49276, "boundsPt": [431.21490478515625, 114.35420227050781, 433.222900390625, 114.6112060546875], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [433.222900390625, 114.6112060546875], [431.21490478515625, 114.35420227050781]]}
  ] },
  { "pathIndex": 49277, "seqno": 49277, "boundsPt": [431.1990966796875, 114.35391235351562, 431.214111328125, 114.47090911865234], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [431.214111328125, 114.35391235351562], [431.1990966796875, 114.47090911865234]]}
  ] },
  { "pathIndex": 50523, "seqno": 50523, "boundsPt": [402.6409912109375, 213.0628204345703, 402.9419860839844, 213.11581420898438], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [402.9419860839844, 213.11581420898438], [402.6409912109375, 213.0628204345703]]}
  ] },
  { "pathIndex": 50524, "seqno": 50524, "boundsPt": [395.01458740234375, 211.71791076660156, 402.4085998535156, 213.02191162109375], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [402.4085998535156, 213.02191162109375], [395.01458740234375, 211.71791076660156]]}
  ] },
  { "pathIndex": 50525, "seqno": 50525, "boundsPt": [394.5690002441406, 211.63870239257812, 394.7820129394531, 211.67669677734375], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.7820129394531, 211.67669677734375], [394.5690002441406, 211.63870239257812]]}
  ] },
  { "pathIndex": 50526, "seqno": 50526, "boundsPt": [403.54339599609375, 207.94178771972656, 403.8523864746094, 207.99578857421875], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.8523864746094, 207.99578857421875], [403.54339599609375, 207.94178771972656]]}
  ] },
  { "pathIndex": 50527, "seqno": 50527, "boundsPt": [395.9176025390625, 206.5965118408203, 403.3125915527344, 207.9005126953125], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.3125915527344, 207.9005126953125], [395.9176025390625, 206.5965118408203]]}
  ] },
  { "pathIndex": 50528, "seqno": 50528, "boundsPt": [395.4718017578125, 206.51730346679688, 395.684814453125, 206.5552978515625], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.684814453125, 206.5552978515625], [395.4718017578125, 206.51730346679688]]}
  ] },
  { "pathIndex": 50529, "seqno": 50529, "boundsPt": [394.5685119628906, 209.93179321289062, 394.8695068359375, 211.6387939453125], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.8695068359375, 209.93179321289062], [394.5685119628906, 211.6387939453125]]}
  ] },
  { "pathIndex": 50530, "seqno": 50530, "boundsPt": [394.8692932128906, 208.22479248046875, 395.1712951660156, 209.93179321289062], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.1712951660156, 208.22479248046875], [394.8692932128906, 209.93179321289062]]}
  ] },
  { "pathIndex": 50531, "seqno": 50531, "boundsPt": [395.17059326171875, 206.51760864257812, 395.4715881347656, 208.224609375], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.4715881347656, 206.51760864257812], [395.17059326171875, 208.224609375]]}
  ] },
  { "pathIndex": 50532, "seqno": 50532, "boundsPt": [403.6233825683594, 207.99578857421875, 403.8523864746094, 209.29379272460938], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.8523864746094, 207.99578857421875], [403.6233825683594, 209.29379272460938]]}
  ] },
  { "pathIndex": 50533, "seqno": 50533, "boundsPt": [402.9217834472656, 211.4715118408203, 403.21978759765625, 211.52450561523438], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.21978759765625, 211.52450561523438], [402.9217834472656, 211.4715118408203]]}
  ] },
  { "pathIndex": 50534, "seqno": 50534, "boundsPt": [395.2951965332031, 210.12660217285156, 402.689208984375, 211.43060302734375], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [402.689208984375, 211.43060302734375], [395.2951965332031, 210.12660217285156]]}
  ] },
  { "pathIndex": 50535, "seqno": 50535, "boundsPt": [394.8497009277344, 210.048095703125, 395.0627136230469, 210.08609008789062], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.0627136230469, 210.08609008789062], [394.8497009277344, 210.048095703125]]}
  ] },
  { "pathIndex": 50536, "seqno": 50536, "boundsPt": [403.22247314453125, 209.76380920410156, 403.5174865722656, 209.81680297851562], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.5174865722656, 209.81680297851562], [403.22247314453125, 209.76380920410156]]}
  ] },
  { "pathIndex": 50537, "seqno": 50537, "boundsPt": [395.59600830078125, 208.4193878173828, 402.9909973144531, 209.723388671875], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [402.9909973144531, 209.723388671875], [395.59600830078125, 208.4193878173828]]}
  ] },
  { "pathIndex": 50538, "seqno": 50538, "boundsPt": [395.1501770019531, 208.34091186523438, 395.3631896972656, 208.37890625], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.3631896972656, 208.37890625], [395.1501770019531, 208.34091186523438]]}
  ] },
  { "pathIndex": 50539, "seqno": 50539, "boundsPt": [403.523193359375, 208.05760192871094, 403.8312072753906, 208.11160278320312], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.8312072753906, 208.11160278320312], [403.523193359375, 208.05760192871094]]}
  ] },
  { "pathIndex": 50540, "seqno": 50540, "boundsPt": [395.89727783203125, 206.71238708496094, 403.2912902832031, 208.01638793945312], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.2912902832031, 208.01638793945312], [395.89727783203125, 206.71238708496094]]}
  ] },
  { "pathIndex": 50541, "seqno": 50541, "boundsPt": [395.4517822265625, 206.63381958007812, 395.664794921875, 206.67181396484375], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.664794921875, 206.67181396484375], [395.4517822265625, 206.63381958007812]]}
  ] },
  { "pathIndex": 50542, "seqno": 50542, "boundsPt": [402.9418029785156, 211.35511779785156, 403.23980712890625, 211.40811157226562], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.23980712890625, 211.40811157226562], [402.9418029785156, 211.35511779785156]]}
  ] },
  { "pathIndex": 50543, "seqno": 50543, "boundsPt": [395.3153991699219, 210.0106964111328, 402.71038818359375, 211.314697265625], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [402.71038818359375, 211.314697265625], [395.3153991699219, 210.0106964111328]]}
  ] },
  { "pathIndex": 50544, "seqno": 50544, "boundsPt": [394.8694763183594, 209.93161010742188, 395.0824890136719, 209.9696044921875], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.0824890136719, 209.9696044921875], [394.8694763183594, 209.93161010742188]]}
  ] },
  { "pathIndex": 50545, "seqno": 50545, "boundsPt": [403.2434997558594, 209.6472930908203, 403.5375061035156, 209.70028686523438], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.5375061035156, 209.70028686523438], [403.2434997558594, 209.6472930908203]]}
  ] },
  { "pathIndex": 50546, "seqno": 50546, "boundsPt": [395.61669921875, 208.30369567871094, 403.0107116699219, 209.60769653320312], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.0107116699219, 209.60769653320312], [395.61669921875, 208.30369567871094]]}
  ] },
  { "pathIndex": 50547, "seqno": 50547, "boundsPt": [395.1712951660156, 208.22451782226562, 395.3843078613281, 208.26251220703125], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.3843078613281, 208.26251220703125], [395.1712951660156, 208.22451782226562]]}
  ] },
  { "pathIndex": 50627, "seqno": 50627, "boundsPt": [402.76287841796875, 209.29071044921875, 403.60888671875, 214.14170837402344], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.60888671875, 209.29071044921875], [402.76287841796875, 214.14170837402344]]}
  ] },
  { "pathIndex": 51965, "seqno": 51965, "boundsPt": [392.63690185546875, 211.99038696289062, 394.9659118652344, 211.99038696289062], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [392.63690185546875, 211.99038696289062], [394.9659118652344, 211.99038696289062]]}
  ] },
  { "pathIndex": 51966, "seqno": 51966, "boundsPt": [392.63690185546875, 211.75350952148438, 394.7688903808594, 211.75350952148438], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.7688903808594, 211.75350952148438], [392.63690185546875, 211.75350952148438]]}
  ] },
  { "pathIndex": 51967, "seqno": 51967, "boundsPt": [394.9660949707031, 211.7183837890625, 395.0151062011719, 211.99038696289062], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.9660949707031, 211.99038696289062], [395.0151062011719, 211.7183837890625]]}
  ] },
  { "pathIndex": 51968, "seqno": 51968, "boundsPt": [394.76800537109375, 211.67669677734375, 394.7820129394531, 211.75369262695312], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.7820129394531, 211.67669677734375], [394.76800537109375, 211.75369262695312]]}
  ] },
  { "pathIndex": 51969, "seqno": 51969, "boundsPt": [392.63690185546875, 211.75338745117188, 392.63690185546875, 211.99038696289062], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [392.63690185546875, 211.99038696289062], [392.63690185546875, 211.75338745117188]]}
  ] },
  { "pathIndex": 51970, "seqno": 51970, "boundsPt": [394.8840026855469, 211.69448852539062, 394.9120178222656, 211.69949340820312], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.8840026855469, 211.69448852539062], [394.9120178222656, 211.69949340820312]]}
  ] },
  { "pathIndex": 51971, "seqno": 51971, "boundsPt": [394.7680969238281, 211.75338745117188, 394.9660949707031, 211.99038696289062], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["c", [394.9660949707031, 211.99038696289062], [394.9660949707031, 211.99038696289062], [394.9660949707031, 211.9893798828125], [394.9631042480469, 211.98638916015625]]},
    {"itemIndex": 1, "command": ["c", [394.9631042480469, 211.98638916015625], [394.9610900878906, 211.98338317871094], [394.9580993652344, 211.97938537597656], [394.95208740234375, 211.97438049316406]]},
    {"itemIndex": 2, "command": ["c", [394.95208740234375, 211.97438049316406], [394.9510803222656, 211.9713897705078], [394.9480895996094, 211.9683837890625], [394.94610595703125, 211.9663848876953]]},
    {"itemIndex": 3, "command": ["c", [394.94610595703125, 211.9663848876953], [394.9430847167969, 211.9613800048828], [394.9400939941406, 211.95938110351562], [394.9371032714844, 211.95538330078125]]},
    {"itemIndex": 4, "command": ["c", [394.9371032714844, 211.95538330078125], [394.9350891113281, 211.952392578125], [394.9320983886719, 211.94837951660156], [394.9281005859375, 211.9443817138672]]},
    {"itemIndex": 5, "command": ["c", [394.9281005859375, 211.9443817138672], [394.9270935058594, 211.94139099121094], [394.9241027832031, 211.93838500976562], [394.923095703125, 211.93739318847656]]},
    {"itemIndex": 6, "command": ["c", [394.923095703125, 211.93739318847656], [394.92108154296875, 211.93438720703125], [394.9190979003906, 211.93338012695312], [394.9170837402344, 211.93038940429688]]},
    {"itemIndex": 7, "command": ["c", [394.9170837402344, 211.93038940429688], [394.9130859375, 211.9263916015625], [394.9090881347656, 211.92239379882812], [394.90509033203125, 211.91738891601562]]},
    {"itemIndex": 8, "command": ["c", [394.90509033203125, 211.91738891601562], [394.9040832519531, 211.9143829345703], [394.9010925292969, 211.91139221191406], [394.90008544921875, 211.90939331054688]]},
    {"itemIndex": 9, "command": ["c", [394.90008544921875, 211.90939331054688], [394.8970947265625, 211.9073944091797], [394.89410400390625, 211.90538024902344], [394.8930969238281, 211.9023895263672]]},
    {"itemIndex": 10, "command": ["c", [394.8930969238281, 211.9023895263672], [394.8901062011719, 211.90138244628906], [394.88909912109375, 211.8983917236328], [394.8861083984375, 211.8953857421875]]},
    {"itemIndex": 11, "command": ["c", [394.8861083984375, 211.8953857421875], [394.8830871582031, 211.8923797607422], [394.882080078125, 211.890380859375], [394.881103515625, 211.88739013671875]]},
    {"itemIndex": 12, "command": ["c", [394.881103515625, 211.88739013671875], [394.87908935546875, 211.88438415527344], [394.8771057128906, 211.88238525390625], [394.87408447265625, 211.87939453125]]},
    {"itemIndex": 13, "command": ["c", [394.87408447265625, 211.87939453125], [394.8721008300781, 211.87838745117188], [394.8700866699219, 211.87538146972656], [394.8670959472656, 211.8723907470703]]},
    {"itemIndex": 14, "command": ["c", [394.8670959472656, 211.8723907470703], [394.8660888671875, 211.869384765625], [394.86309814453125, 211.8673858642578], [394.8620910644531, 211.8643798828125]]},
    {"itemIndex": 15, "command": ["c", [394.8620910644531, 211.8643798828125], [394.8591003417969, 211.86138916015625], [394.8561096191406, 211.85939025878906], [394.8551025390625, 211.85638427734375]]},
    {"itemIndex": 16, "command": ["c", [394.8551025390625, 211.85638427734375], [394.8520812988281, 211.8533935546875], [394.8490905761719, 211.8503875732422], [394.84808349609375, 211.84938049316406]]},
    {"itemIndex": 17, "command": ["c", [394.84808349609375, 211.84938049316406], [394.8450927734375, 211.8463897705078], [394.8440856933594, 211.84439086914062], [394.8410949707031, 211.8413848876953]]},
    {"itemIndex": 18, "command": ["c", [394.8410949707031, 211.8413848876953], [394.8390808105469, 211.83839416503906], [394.83709716796875, 211.8363800048828], [394.8350830078125, 211.83438110351562]]},
    {"itemIndex": 19, "command": ["c", [394.8350830078125, 211.83438110351562], [394.8330993652344, 211.83139038085938], [394.8301086425781, 211.8293914794922], [394.8291015625, 211.82638549804688]]},
    {"itemIndex": 20, "command": ["c", [394.8291015625, 211.82638549804688], [394.8251037597656, 211.82138061523438], [394.82208251953125, 211.81838989257812], [394.8180847167969, 211.81338500976562]]},
    {"itemIndex": 21, "command": ["c", [394.8180847167969, 211.81338500976562], [394.8171081542969, 211.81039428710938], [394.8140869140625, 211.80838012695312], [394.8130798339844, 211.80638122558594]]},
    {"itemIndex": 22, "command": ["c", [394.8130798339844, 211.80638122558594], [394.8100891113281, 211.80438232421875], [394.80908203125, 211.80238342285156], [394.8070983886719, 211.7993927001953]]},
    {"itemIndex": 23, "command": ["c", [394.8070983886719, 211.7993927001953], [394.8031005859375, 211.79537963867188], [394.80108642578125, 211.79238891601562], [394.798095703125, 211.78839111328125]]},
    {"itemIndex": 24, "command": ["c", [394.798095703125, 211.78839111328125], [394.7940979003906, 211.78439331054688], [394.7911071777344, 211.78138732910156], [394.7880859375, 211.7773895263672]]},
    {"itemIndex": 25, "command": ["c", [394.7880859375, 211.7773895263672], [394.7861022949219, 211.775390625], [394.7830810546875, 211.7723846435547], [394.7821044921875, 211.76939392089844]]},
    {"itemIndex": 26, "command": ["c", [394.7821044921875, 211.76939392089844], [394.7760925292969, 211.76438903808594], [394.77410888671875, 211.76138305664062], [394.7710876464844, 211.75839233398438]]},
    {"itemIndex": 27, "command": ["c", [394.7710876464844, 211.75839233398438], [394.7680969238281, 211.7563934326172], [394.7680969238281, 211.75338745117188], [394.7680969238281, 211.75338745117188]]}
  ] },
  { "pathIndex": 51972, "seqno": 51972, "boundsPt": [387.83319091796875, 211.4223175048828, 387.83319091796875, 211.54031372070312], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [387.83319091796875, 211.54031372070312], [387.83319091796875, 211.4223175048828]]}
  ] },
  { "pathIndex": 51973, "seqno": 51973, "boundsPt": [394.41290283203125, 211.422607421875, 394.41290283203125, 211.5406036376953], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.41290283203125, 211.422607421875], [394.41290283203125, 211.5406036376953]]}
  ] },
  { "pathIndex": 51974, "seqno": 51974, "boundsPt": [387.83319091796875, 211.422607421875, 394.4122009277344, 211.422607421875], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [387.83319091796875, 211.422607421875], [394.4122009277344, 211.422607421875]]}
  ] },
  { "pathIndex": 51975, "seqno": 51975, "boundsPt": [387.8338928222656, 211.54031372070312, 394.41290283203125, 211.54031372070312], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.41290283203125, 211.54031372070312], [387.8338928222656, 211.54031372070312]]}
  ] },
  { "pathIndex": 51979, "seqno": 51979, "boundsPt": [402.40850830078125, 213.02330017089844, 402.6415100097656, 213.06430053710938], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [402.6415100097656, 213.06430053710938], [402.40850830078125, 213.02330017089844]]}
  ] },
  { "pathIndex": 51980, "seqno": 51980, "boundsPt": [402.64117431640625, 207.94290161132812, 403.544189453125, 213.06390380859375], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.544189453125, 207.94290161132812], [402.64117431640625, 213.06390380859375]]}
  ] },
  { "pathIndex": 51981, "seqno": 51981, "boundsPt": [403.5436096191406, 205.60589599609375, 403.95159912109375, 207.9438934326172], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.95159912109375, 205.60589599609375], [403.5436096191406, 207.9438934326172]]}
  ] },
  { "pathIndex": 51982, "seqno": 51982, "boundsPt": [403.71868896484375, 205.56549072265625, 403.9516906738281, 205.6064910888672], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.71868896484375, 205.56549072265625], [403.9516906738281, 205.6064910888672]]}
  ] },
  { "pathIndex": 51983, "seqno": 51983, "boundsPt": [402.4081726074219, 207.90188598632812, 403.3111877441406, 213.02288818359375], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.3111877441406, 207.90188598632812], [402.4081726074219, 213.02288818359375]]}
  ] },
  { "pathIndex": 51984, "seqno": 51984, "boundsPt": [403.3106994628906, 205.56549072265625, 403.71868896484375, 207.9014892578125], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.71868896484375, 205.56549072265625], [403.3106994628906, 207.9014892578125]]}
  ] },
  { "pathIndex": 51985, "seqno": 51985, "boundsPt": [394.35430908203125, 211.60179138183594, 394.4713134765625, 211.62179565429688], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.4713134765625, 211.62179565429688], [394.35430908203125, 211.60179138183594]]}
  ] },
  { "pathIndex": 51986, "seqno": 51986, "boundsPt": [394.47119140625, 205.14801025390625, 395.6131896972656, 211.6210174560547], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.6131896972656, 205.14801025390625], [394.47119140625, 211.6210174560547]]}
  ] },
  { "pathIndex": 51987, "seqno": 51987, "boundsPt": [395.4967956542969, 205.12741088867188, 395.6138000488281, 205.1474151611328], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.4967956542969, 205.12741088867188], [395.6138000488281, 205.1474151611328]]}
  ] },
  { "pathIndex": 51988, "seqno": 51988, "boundsPt": [394.3868103027344, 205.12741088867188, 395.4967956542969, 211.4234161376953], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.4967956542969, 205.12741088867188], [394.3868103027344, 211.4234161376953]]}
  ] },
  { "pathIndex": 51989, "seqno": 51989, "boundsPt": [394.3546142578125, 211.54031372070312, 394.3666076660156, 211.601318359375], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [394.3666076660156, 211.54031372070312], [394.3546142578125, 211.601318359375]]}
  ] },
  { "pathIndex": 51990, "seqno": 51990, "boundsPt": [394.7821044921875, 211.6767120361328, 395.0151062011719, 211.71771240234375], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.0151062011719, 211.71771240234375], [394.7821044921875, 211.6767120361328]]}
  ] },
  { "pathIndex": 51991, "seqno": 51991, "boundsPt": [395.0148010253906, 205.24398803710938, 396.1557922363281, 211.7169952392578], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [396.1557922363281, 205.24398803710938], [395.0148010253906, 211.7169952392578]]}
  ] },
  { "pathIndex": 51992, "seqno": 51992, "boundsPt": [395.9241943359375, 205.20291137695312, 396.15618896484375, 205.24391174316406], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.9241943359375, 205.20291137695312], [396.15618896484375, 205.24391174316406]]}
  ] },
  { "pathIndex": 51993, "seqno": 51993, "boundsPt": [394.7821960449219, 205.20291137695312, 395.9241943359375, 211.67591857910156], "style": "style-2", "roles": ["southeast-step-or-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [395.9241943359375, 205.20291137695312], [394.7821960449219, 211.67591857910156]]}
  ] },
  { "pathIndex": 52167, "seqno": 52167, "boundsPt": [412.8019104003906, 120.9502944946289, 419.3069152832031, 140.45028686523438], "style": "style-3", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [414.6589050292969, 121.54629516601562], [414.6438903808594, 121.60029602050781]]},
    {"itemIndex": 1, "command": ["l", [414.6438903808594, 121.60029602050781], [414.6438903808594, 121.64129638671875]]},
    {"itemIndex": 2, "command": ["l", [414.6438903808594, 121.64129638671875], [415.4989013671875, 121.74929809570312]]},
    {"itemIndex": 3, "command": ["l", [415.4989013671875, 121.74929809570312], [417.6669006347656, 121.93929290771484]]},
    {"itemIndex": 4, "command": ["l", [417.6669006347656, 121.93929290771484], [419.1018981933594, 122.11529541015625]]},
    {"itemIndex": 5, "command": ["l", [419.1018981933594, 122.11529541015625], [419.1018981933594, 122.1292953491211]]},
    {"itemIndex": 6, "command": ["c", [419.1018981933594, 122.1292953491211], [419.3069152832031, 128.24029541015625], [419.29290771484375, 134.33828735351562], [419.0628967285156, 140.45028686523438]]},
    {"itemIndex": 7, "command": ["l", [419.0628967285156, 140.45028686523438], [417.59991455078125, 140.39630126953125]]},
    {"itemIndex": 8, "command": ["l", [417.59991455078125, 140.39630126953125], [415.5129089355469, 137.685302734375]]},
    {"itemIndex": 9, "command": ["l", [415.5129089355469, 137.685302734375], [412.9109191894531, 137.6042938232422]]},
    {"itemIndex": 10, "command": ["c", [412.9109191894531, 137.6042938232422], [412.9109191894531, 137.29229736328125], [412.9109191894531, 136.99429321289062], [412.9239196777344, 136.68328857421875]]},
    {"itemIndex": 11, "command": ["c", [412.9239196777344, 136.68328857421875], [412.9239196777344, 136.56129455566406], [412.9369201660156, 136.42529296875], [412.9369201660156, 136.3032989501953]]},
    {"itemIndex": 12, "command": ["l", [412.9369201660156, 136.3032989501953], [413.39691162109375, 136.3032989501953]]},
    {"itemIndex": 13, "command": ["l", [413.39691162109375, 136.3032989501953], [413.39691162109375, 134.09429931640625]]},
    {"itemIndex": 14, "command": ["l", [413.39691162109375, 134.09429931640625], [412.96490478515625, 134.09429931640625]]},
    {"itemIndex": 15, "command": ["c", [412.96490478515625, 134.09429931640625], [412.9919128417969, 133.5522918701172], [412.9919128417969, 133.0102996826172], [412.9919128417969, 132.46829223632812]]},
    {"itemIndex": 16, "command": ["l", [412.9919128417969, 132.46829223632812], [412.9919128417969, 132.34629821777344]]},
    {"itemIndex": 17, "command": ["c", [412.9919128417969, 132.34629821777344], [413.00390625, 131.45230102539062], [413.00390625, 130.55828857421875], [413.00390625, 129.66329956054688]]},
    {"itemIndex": 18, "command": ["l", [413.00390625, 129.66329956054688], [413.00390625, 128.25430297851562]]},
    {"itemIndex": 19, "command": ["c", [413.00390625, 128.25430297851562], [413.00390625, 127.79329681396484], [413.00390625, 127.31929779052734], [412.9919128417969, 126.85829162597656]]},
    {"itemIndex": 20, "command": ["c", [412.9919128417969, 126.85829162597656], [412.9919128417969, 126.38429260253906], [412.9789123535156, 125.90929412841797], [412.96490478515625, 125.44929504394531]]},
    {"itemIndex": 21, "command": ["c", [412.96490478515625, 125.44929504394531], [412.96490478515625, 125.2732925415039], [412.94989013671875, 125.09629821777344], [412.94989013671875, 124.92029571533203]]},
    {"itemIndex": 22, "command": ["c", [412.94989013671875, 124.92029571533203], [412.9369201660156, 124.74429321289062], [412.9369201660156, 124.5542984008789], [412.9369201660156, 124.3782958984375]]},
    {"itemIndex": 23, "command": ["c", [412.9369201660156, 124.3782958984375], [412.9369201660156, 124.29729461669922], [412.9369201660156, 124.2022933959961], [412.9239196777344, 124.12129211425781]]},
    {"itemIndex": 24, "command": ["l", [412.9239196777344, 124.12129211425781], [412.9239196777344, 124.03929138183594]]},
    {"itemIndex": 25, "command": ["c", [412.9239196777344, 124.03929138183594], [412.9109191894531, 123.57929229736328], [412.8959045410156, 123.10429382324219], [412.88189697265625, 122.64429473876953]]},
    {"itemIndex": 26, "command": ["c", [412.88189697265625, 122.64429473876953], [412.8569030761719, 122.16929626464844], [412.8428955078125, 121.70929718017578], [412.81591796875, 121.23429870605469]]},
    {"itemIndex": 27, "command": ["c", [412.81591796875, 121.23429870605469], [412.81591796875, 121.16729736328125], [412.81591796875, 121.08529663085938], [412.8019104003906, 121.01729583740234]]},
    {"itemIndex": 28, "command": ["l", [412.8019104003906, 121.01729583740234], [413.77789306640625, 120.9502944946289]]},
    {"itemIndex": 29, "command": ["l", [413.77789306640625, 120.9502944946289], [414.712890625, 121.07229614257812]]},
    {"itemIndex": 30, "command": ["l", [414.712890625, 121.07229614257812], [414.712890625, 121.13929748535156]]},
    {"itemIndex": 31, "command": ["l", [414.712890625, 121.13929748535156], [414.6589050292969, 121.54629516601562]]}
  ] },
  { "pathIndex": 52175, "seqno": 52175, "boundsPt": [370.0622863769531, 231.635986328125, 379.20928955078125, 246.3389892578125], "style": "style-3", "roles": ["neighbor-context-excluded"], "items": [
    {"itemIndex": 0, "command": ["l", [378.1792907714844, 246.24398803710938], [377.9762878417969, 246.1219940185547]]},
    {"itemIndex": 1, "command": ["l", [377.9762878417969, 246.1219940185547], [371.0242919921875, 242.00299072265625]]},
    {"itemIndex": 2, "command": ["l", [371.0242919921875, 242.00299072265625], [371.0242919921875, 233.51998901367188]]},
    {"itemIndex": 3, "command": ["l", [371.0242919921875, 233.51998901367188], [370.97027587890625, 233.51998901367188]]},
    {"itemIndex": 4, "command": ["l", [370.97027587890625, 233.51998901367188], [370.97027587890625, 232.0699920654297]]},
    {"itemIndex": 5, "command": ["l", [370.97027587890625, 232.0699920654297], [371.05029296875, 232.0699920654297]]},
    {"itemIndex": 6, "command": ["l", [371.05029296875, 232.0699920654297], [371.05029296875, 231.74398803710938]]},
    {"itemIndex": 7, "command": ["l", [371.05029296875, 231.74398803710938], [370.0622863769531, 231.74398803710938]]},
    {"itemIndex": 8, "command": ["l", [370.0622863769531, 231.74398803710938], [370.0622863769531, 231.635986328125]]},
    {"itemIndex": 9, "command": ["l", [370.0622863769531, 231.635986328125], [372.9202880859375, 231.635986328125]]},
    {"itemIndex": 10, "command": ["l", [372.9202880859375, 231.635986328125], [372.9202880859375, 240.91798400878906]]},
    {"itemIndex": 11, "command": ["l", [372.9202880859375, 240.91798400878906], [379.20928955078125, 244.6589813232422]]},
    {"itemIndex": 12, "command": ["c", [379.20928955078125, 244.6589813232422], [379.1802978515625, 244.7939910888672], [379.14129638671875, 244.91598510742188], [379.11328125, 245.05198669433594]]},
    {"itemIndex": 13, "command": ["l", [379.11328125, 245.05198669433594], [378.35528564453125, 246.3389892578125]]},
    {"itemIndex": 14, "command": ["l", [378.35528564453125, 246.3389892578125], [378.3403015136719, 246.3389892578125]]},
    {"itemIndex": 15, "command": ["l", [378.3403015136719, 246.3389892578125], [378.1792907714844, 246.24398803710938]]}
  ] },
  { "pathIndex": 52188, "seqno": 52188, "boundsPt": [307.224609375, 84.09121704101562, 387.8406066894531, 264.55120849609375], "style": "style-3", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [356.07659912109375, 256.35321044921875], [356.07659912109375, 242.87020874023438]]},
    {"itemIndex": 1, "command": ["l", [356.07659912109375, 242.87020874023438], [355.1426086425781, 242.87020874023438]]},
    {"itemIndex": 2, "command": ["l", [355.1426086425781, 242.87020874023438], [354.8586120605469, 242.87020874023438]]},
    {"itemIndex": 3, "command": ["l", [354.8586120605469, 242.87020874023438], [349.4635925292969, 242.87020874023438]]},
    {"itemIndex": 4, "command": ["l", [349.4635925292969, 242.87020874023438], [346.7395935058594, 242.87020874023438]]},
    {"itemIndex": 5, "command": ["l", [346.7395935058594, 242.87020874023438], [346.7395935058594, 233.5192108154297]]},
    {"itemIndex": 6, "command": ["l", [346.7395935058594, 233.5192108154297], [326.1416015625, 233.5192108154297]]},
    {"itemIndex": 7, "command": ["l", [326.1416015625, 233.5192108154297], [326.1416015625, 232.69320678710938]]},
    {"itemIndex": 8, "command": ["l", [326.1416015625, 232.69320678710938], [349.1535949707031, 232.69320678710938]]},
    {"itemIndex": 9, "command": ["l", [349.1535949707031, 232.69320678710938], [355.45361328125, 232.69320678710938]]},
    {"itemIndex": 10, "command": ["l", [355.45361328125, 232.69320678710938], [356.07659912109375, 232.69320678710938]]},
    {"itemIndex": 11, "command": ["l", [356.07659912109375, 232.69320678710938], [356.07659912109375, 212.97621154785156]]},
    {"itemIndex": 12, "command": ["l", [356.07659912109375, 212.97621154785156], [335.1665954589844, 212.97621154785156]]},
    {"itemIndex": 13, "command": ["l", [335.1665954589844, 212.97621154785156], [326.1416015625, 212.97621154785156]]},
    {"itemIndex": 14, "command": ["l", [326.1416015625, 212.97621154785156], [326.1416015625, 211.83721923828125]]},
    {"itemIndex": 15, "command": ["l", [326.1416015625, 211.83721923828125], [334.9505920410156, 211.83721923828125]]},
    {"itemIndex": 16, "command": ["l", [334.9505920410156, 211.83721923828125], [334.90960693359375, 211.63421630859375]]},
    {"itemIndex": 17, "command": ["l", [334.90960693359375, 211.63421630859375], [334.90960693359375, 211.60720825195312]]},
    {"itemIndex": 18, "command": ["l", [334.90960693359375, 211.60720825195312], [332.6875915527344, 200.02120971679688]]},
    {"itemIndex": 19, "command": ["l", [332.6875915527344, 200.02120971679688], [326.1416015625, 200.02120971679688]]},
    {"itemIndex": 20, "command": ["l", [326.1416015625, 200.02120971679688], [326.1416015625, 198.86920166015625]]},
    {"itemIndex": 21, "command": ["l", [326.1416015625, 198.86920166015625], [332.45660400390625, 198.86920166015625]]},
    {"itemIndex": 22, "command": ["l", [332.45660400390625, 198.86920166015625], [331.8335876464844, 195.60321044921875]]},
    {"itemIndex": 23, "command": ["l", [331.8335876464844, 195.60321044921875], [330.6405944824219, 189.42420959472656]]},
    {"itemIndex": 24, "command": ["l", [330.6405944824219, 189.42420959472656], [326.1416015625, 189.42420959472656]]},
    {"itemIndex": 25, "command": ["l", [326.1416015625, 189.42420959472656], [326.1416015625, 188.272216796875]]},
    {"itemIndex": 26, "command": ["l", [326.1416015625, 188.272216796875], [330.4245910644531, 188.272216796875]]},
    {"itemIndex": 27, "command": ["l", [330.4245910644531, 188.272216796875], [329.7735900878906, 184.85720825195312]]},
    {"itemIndex": 28, "command": ["l", [329.7735900878906, 184.85720825195312], [329.7735900878906, 119.8662109375]]},
    {"itemIndex": 29, "command": ["l", [329.7735900878906, 119.8662109375], [335.4656066894531, 90.16221618652344]]},
    {"itemIndex": 30, "command": ["l", [335.4656066894531, 90.16221618652344], [335.4656066894531, 90.14820861816406]]},
    {"itemIndex": 31, "command": ["l", [335.4656066894531, 90.14820861816406], [335.4786071777344, 90.14820861816406]]},
    {"itemIndex": 32, "command": ["l", [335.4786071777344, 90.14820861816406], [335.51959228515625, 89.918212890625]]},
    {"itemIndex": 33, "command": ["l", [335.51959228515625, 89.918212890625], [335.58758544921875, 89.55221557617188]]},
    {"itemIndex": 34, "command": ["l", [335.58758544921875, 89.55221557617188], [326.1416015625, 89.55221557617188]]},
    {"itemIndex": 35, "command": ["l", [326.1416015625, 89.55221557617188], [326.1416015625, 135.82920837402344]]},
    {"itemIndex": 36, "command": ["l", [326.1416015625, 135.82920837402344], [324.2445983886719, 135.82920837402344]]},
    {"itemIndex": 37, "command": ["l", [324.2445983886719, 135.82920837402344], [324.2445983886719, 89.064208984375]]},
    {"itemIndex": 38, "command": ["l", [324.2445983886719, 89.064208984375], [309.12359619140625, 89.064208984375]]},
    {"itemIndex": 39, "command": ["l", [309.12359619140625, 89.064208984375], [309.12359619140625, 94.40321350097656]]},
    {"itemIndex": 40, "command": ["l", [309.12359619140625, 94.40321350097656], [307.224609375, 94.40321350097656]]},
    {"itemIndex": 41, "command": ["l", [307.224609375, 94.40321350097656], [307.224609375, 87.92620849609375]]},
    {"itemIndex": 42, "command": ["l", [307.224609375, 87.92620849609375], [307.224609375, 84.71420288085938]]},
    {"itemIndex": 43, "command": ["c", [307.224609375, 84.71420288085938], [307.360595703125, 84.6732177734375], [307.49560546875, 84.61921691894531], [307.631591796875, 84.57920837402344]]},
    {"itemIndex": 44, "command": ["c", [307.631591796875, 84.57920837402344], [308.07861328125, 84.42921447753906], [308.5256042480469, 84.28021240234375], [308.97259521484375, 84.13121032714844]]},
    {"itemIndex": 45, "command": ["c", [308.97259521484375, 84.13121032714844], [309.026611328125, 84.11820983886719], [309.068603515625, 84.10421752929688], [309.12359619140625, 84.09121704101562]]},
    {"itemIndex": 46, "command": ["l", [309.12359619140625, 84.09121704101562], [309.12359619140625, 87.92620849609375]]},
    {"itemIndex": 47, "command": ["l", [309.12359619140625, 87.92620849609375], [324.2445983886719, 87.92620849609375]]},
    {"itemIndex": 48, "command": ["l", [324.2445983886719, 87.92620849609375], [326.1416015625, 87.92620849609375]]},
    {"itemIndex": 49, "command": ["l", [326.1416015625, 87.92620849609375], [326.1416015625, 88.41421508789062]]},
    {"itemIndex": 50, "command": ["l", [326.1416015625, 88.41421508789062], [333.0256042480469, 88.41421508789062]]},
    {"itemIndex": 51, "command": ["l", [333.0256042480469, 88.41421508789062], [361.8645935058594, 88.41421508789062]]},
    {"itemIndex": 52, "command": ["l", [361.8645935058594, 88.41421508789062], [361.8645935058594, 88.71220397949219]]},
    {"itemIndex": 53, "command": ["l", [361.8645935058594, 88.71220397949219], [362.81158447265625, 88.71220397949219]]},
    {"itemIndex": 54, "command": ["l", [362.81158447265625, 88.71220397949219], [362.81158447265625, 88.41421508789062]]},
    {"itemIndex": 55, "command": ["l", [362.81158447265625, 88.41421508789062], [380.1435852050781, 88.41421508789062]]},
    {"itemIndex": 56, "command": ["l", [380.1435852050781, 88.41421508789062], [382.3536071777344, 88.41421508789062]]},
    {"itemIndex": 57, "command": ["l", [382.3536071777344, 88.41421508789062], [387.2575988769531, 88.41421508789062]]},
    {"itemIndex": 58, "command": ["l", [387.2575988769531, 88.41421508789062], [387.2575988769531, 88.44120788574219]]},
    {"itemIndex": 59, "command": ["l", [387.2575988769531, 88.44120788574219], [387.2575988769531, 89.647216796875]]},
    {"itemIndex": 60, "command": ["l", [387.2575988769531, 89.647216796875], [386.9455871582031, 89.647216796875]]},
    {"itemIndex": 61, "command": ["l", [386.9455871582031, 89.647216796875], [386.93359375, 89.647216796875]]},
    {"itemIndex": 62, "command": ["l", [386.93359375, 89.647216796875], [356.672607421875, 89.647216796875]]},
    {"itemIndex": 63, "command": ["l", [356.672607421875, 89.647216796875], [336.73858642578125, 89.647216796875]]},
    {"itemIndex": 64, "command": ["l", [336.73858642578125, 89.647216796875], [336.6846008300781, 89.918212890625]]},
    {"itemIndex": 65, "command": ["l", [336.6846008300781, 89.918212890625], [336.64459228515625, 90.14820861816406]]},
    {"itemIndex": 66, "command": ["l", [336.64459228515625, 90.14820861816406], [336.64459228515625, 90.16221618652344]]},
    {"itemIndex": 67, "command": ["l", [336.64459228515625, 90.16221618652344], [335.6275939941406, 95.41920471191406]]},
    {"itemIndex": 68, "command": ["l", [335.6275939941406, 95.41920471191406], [335.58758544921875, 95.6632080078125]]},
    {"itemIndex": 69, "command": ["l", [335.58758544921875, 95.6632080078125], [335.24859619140625, 97.39820861816406]]},
    {"itemIndex": 70, "command": ["l", [335.24859619140625, 97.39820861816406], [330.96661376953125, 119.69021606445312]]},
    {"itemIndex": 71, "command": ["l", [330.96661376953125, 119.69021606445312], [330.9115905761719, 119.97421264648438]]},
    {"itemIndex": 72, "command": ["l", [330.9115905761719, 119.97421264648438], [330.9115905761719, 123.21321105957031]]},
    {"itemIndex": 73, "command": ["l", [330.9115905761719, 123.21321105957031], [330.9115905761719, 123.45721435546875]]},
    {"itemIndex": 74, "command": ["l", [330.9115905761719, 123.45721435546875], [330.9115905761719, 184.74920654296875]]},
    {"itemIndex": 75, "command": ["l", [330.9115905761719, 184.74920654296875], [331.7666015625, 189.20721435546875]]},
    {"itemIndex": 76, "command": ["l", [331.7666015625, 189.20721435546875], [332.9585876464844, 195.40020751953125]]},
    {"itemIndex": 77, "command": ["l", [332.9585876464844, 195.40020751953125], [333.7995910644531, 199.80421447753906]]},
    {"itemIndex": 78, "command": ["l", [333.7995910644531, 199.80421447753906], [333.8255920410156, 199.92620849609375]]},
    {"itemIndex": 79, "command": ["l", [333.8255920410156, 199.92620849609375], [334.16461181640625, 201.6612091064453]]},
    {"itemIndex": 80, "command": ["l", [334.16461181640625, 201.6612091064453], [336.0745849609375, 211.60720825195312]]},
    {"itemIndex": 81, "command": ["l", [336.0745849609375, 211.60720825195312], [336.0745849609375, 211.63421630859375]]},
    {"itemIndex": 82, "command": ["l", [336.0745849609375, 211.63421630859375], [337.0235900878906, 211.63421630859375]]},
    {"itemIndex": 83, "command": ["l", [337.0235900878906, 211.63421630859375], [353.5575866699219, 211.63421630859375]]},
    {"itemIndex": 84, "command": ["l", [353.5575866699219, 211.63421630859375], [353.5696105957031, 211.63421630859375]]},
    {"itemIndex": 85, "command": ["l", [353.5696105957031, 211.63421630859375], [353.5575866699219, 211.72921752929688]]},
    {"itemIndex": 86, "command": ["l", [353.5575866699219, 211.72921752929688], [353.5426025390625, 211.85121154785156]]},
    {"itemIndex": 87, "command": ["l", [353.5426025390625, 211.85121154785156], [372.256591796875, 211.85121154785156]]},
    {"itemIndex": 88, "command": ["l", [372.256591796875, 211.85121154785156], [372.256591796875, 211.63421630859375]]},
    {"itemIndex": 89, "command": ["l", [372.256591796875, 211.63421630859375], [385.360595703125, 211.63421630859375]]},
    {"itemIndex": 90, "command": ["l", [385.360595703125, 211.63421630859375], [387.69158935546875, 211.63421630859375]]},
    {"itemIndex": 91, "command": ["l", [387.69158935546875, 211.63421630859375], [387.82659912109375, 211.63421630859375]]},
    {"itemIndex": 92, "command": ["l", [387.82659912109375, 211.63421630859375], [387.8406066894531, 211.63421630859375]]},
    {"itemIndex": 93, "command": ["c", [387.8406066894531, 211.63421630859375], [387.5696105957031, 213.1112060546875], [387.298583984375, 214.5882110595703], [387.0006103515625, 216.05221557617188]]},
    {"itemIndex": 94, "command": ["c", [387.0006103515625, 216.05221557617188], [386.8916015625, 216.689208984375], [386.76959228515625, 217.32620239257812], [386.6346130371094, 217.94921875]]},
    {"itemIndex": 95, "command": ["c", [386.6346130371094, 217.94921875], [385.3876037597656, 224.38621520996094], [383.9786071777344, 230.78221130371094], [382.4606018066406, 237.15121459960938]]},
    {"itemIndex": 96, "command": ["l", [382.4606018066406, 237.15121459960938], [381.15960693359375, 236.82620239257812]]},
    {"itemIndex": 97, "command": ["l", [381.15960693359375, 236.82620239257812], [382.1086120605469, 232.7602081298828]]},
    {"itemIndex": 98, "command": ["l", [382.1086120605469, 232.7602081298828], [383.0315856933594, 228.6822052001953]]},
    {"itemIndex": 99, "command": ["l", [383.0315856933594, 228.6822052001953], [383.9245910644531, 224.60321044921875]]},
    {"itemIndex": 100, "command": ["l", [383.9245910644531, 224.60321044921875], [377.7445983886719, 224.60321044921875]]},
    {"itemIndex": 101, "command": ["l", [377.7445983886719, 224.60321044921875], [377.7445983886719, 223.77621459960938]]},
    {"itemIndex": 102, "command": ["l", [377.7445983886719, 223.77621459960938], [384.08660888671875, 223.77621459960938]]},
    {"itemIndex": 103, "command": ["l", [384.08660888671875, 223.77621459960938], [384.83160400390625, 220.18521118164062]]},
    {"itemIndex": 104, "command": ["l", [384.83160400390625, 220.18521118164062], [385.27960205078125, 217.94921875]]},
    {"itemIndex": 105, "command": ["l", [385.27960205078125, 217.94921875], [385.55059814453125, 216.58021545410156]]},
    {"itemIndex": 106, "command": ["l", [385.55059814453125, 216.58021545410156], [385.6455993652344, 216.05221557617188]]},
    {"itemIndex": 107, "command": ["l", [385.6455993652344, 216.05221557617188], [386.22760009765625, 212.97621154785156]]},
    {"itemIndex": 108, "command": ["l", [386.22760009765625, 212.97621154785156], [370.9696044921875, 212.97621154785156]]},
    {"itemIndex": 109, "command": ["l", [370.9696044921875, 212.97621154785156], [370.9696044921875, 216.05221557617188]]},
    {"itemIndex": 110, "command": ["l", [370.9696044921875, 216.05221557617188], [370.9696044921875, 217.94921875]]},
    {"itemIndex": 111, "command": ["l", [370.9696044921875, 217.94921875], [370.9696044921875, 223.77621459960938]]},
    {"itemIndex": 112, "command": ["l", [370.9696044921875, 223.77621459960938], [371.443603515625, 223.77621459960938]]},
    {"itemIndex": 113, "command": ["l", [371.443603515625, 223.77621459960938], [371.443603515625, 224.60321044921875]]},
    {"itemIndex": 114, "command": ["l", [371.443603515625, 224.60321044921875], [370.9696044921875, 224.60321044921875]]},
    {"itemIndex": 115, "command": ["l", [370.9696044921875, 224.60321044921875], [370.9696044921875, 225.75421142578125]]},
    {"itemIndex": 116, "command": ["l", [370.9696044921875, 225.75421142578125], [370.1426086425781, 225.75421142578125]]},
    {"itemIndex": 117, "command": ["l", [370.1426086425781, 225.75421142578125], [370.1426086425781, 217.94921875]]},
    {"itemIndex": 118, "command": ["l", [370.1426086425781, 217.94921875], [370.1426086425781, 216.05221557617188]]},
    {"itemIndex": 119, "command": ["l", [370.1426086425781, 216.05221557617188], [370.1426086425781, 212.97621154785156]]},
    {"itemIndex": 120, "command": ["l", [370.1426086425781, 212.97621154785156], [356.9035949707031, 212.97621154785156]]},
    {"itemIndex": 121, "command": ["l", [356.9035949707031, 212.97621154785156], [356.9035949707031, 216.05221557617188]]},
    {"itemIndex": 122, "command": ["l", [356.9035949707031, 216.05221557617188], [356.9035949707031, 232.69320678710938]]},
    {"itemIndex": 123, "command": ["l", [356.9035949707031, 232.69320678710938], [370.1426086425781, 232.69320678710938]]},
    {"itemIndex": 124, "command": ["l", [370.1426086425781, 232.69320678710938], [370.1426086425781, 232.0692138671875]]},
    {"itemIndex": 125, "command": ["l", [370.1426086425781, 232.0692138671875], [370.9696044921875, 232.0692138671875]]},
    {"itemIndex": 126, "command": ["l", [370.9696044921875, 232.0692138671875], [370.9696044921875, 233.5192108154297]]},
    {"itemIndex": 127, "command": ["l", [370.9696044921875, 233.5192108154297], [370.57659912109375, 233.5192108154297]]},
    {"itemIndex": 128, "command": ["l", [370.57659912109375, 233.5192108154297], [370.3456115722656, 233.5192108154297]]},
    {"itemIndex": 129, "command": ["l", [370.3456115722656, 233.5192108154297], [370.1426086425781, 233.5192108154297]]},
    {"itemIndex": 130, "command": ["l", [370.1426086425781, 233.5192108154297], [369.8305969238281, 233.5192108154297]]},
    {"itemIndex": 131, "command": ["l", [369.8305969238281, 233.5192108154297], [355.45361328125, 233.5192108154297]]},
    {"itemIndex": 132, "command": ["l", [355.45361328125, 233.5192108154297], [349.1535949707031, 233.5192108154297]]},
    {"itemIndex": 133, "command": ["l", [349.1535949707031, 233.5192108154297], [347.56658935546875, 233.5192108154297]]},
    {"itemIndex": 134, "command": ["l", [347.56658935546875, 233.5192108154297], [347.56658935546875, 242.043212890625]]},
    {"itemIndex": 135, "command": ["l", [347.56658935546875, 242.043212890625], [349.1535949707031, 242.043212890625]]},
    {"itemIndex": 136, "command": ["l", [349.1535949707031, 242.043212890625], [355.45361328125, 242.043212890625]]},
    {"itemIndex": 137, "command": ["l", [355.45361328125, 242.043212890625], [356.9035949707031, 242.043212890625]]},
    {"itemIndex": 138, "command": ["l", [356.9035949707031, 242.043212890625], [356.9035949707031, 244.25221252441406]]},
    {"itemIndex": 139, "command": ["l", [356.9035949707031, 244.25221252441406], [356.9035949707031, 244.37420654296875]]},
    {"itemIndex": 140, "command": ["l", [356.9035949707031, 244.37420654296875], [356.9035949707031, 245.9862060546875]]},
    {"itemIndex": 141, "command": ["l", [356.9035949707031, 245.9862060546875], [356.9035949707031, 246.10821533203125]]},
    {"itemIndex": 142, "command": ["l", [356.9035949707031, 246.10821533203125], [356.9035949707031, 247.72120666503906]]},
    {"itemIndex": 143, "command": ["l", [356.9035949707031, 247.72120666503906], [356.9035949707031, 247.8432159423828]]},
    {"itemIndex": 144, "command": ["l", [356.9035949707031, 247.8432159423828], [356.9035949707031, 249.45521545410156]]},
    {"itemIndex": 145, "command": ["l", [356.9035949707031, 249.45521545410156], [356.9035949707031, 256.35321044921875]]},
    {"itemIndex": 146, "command": ["l", [356.9035949707031, 256.35321044921875], [365.2915954589844, 256.35321044921875]]},
    {"itemIndex": 147, "command": ["l", [365.2915954589844, 256.35321044921875], [365.2915954589844, 258.5751953125]]},
    {"itemIndex": 148, "command": ["l", [365.2915954589844, 258.5751953125], [371.7286071777344, 257.4912109375]]},
    {"itemIndex": 149, "command": ["l", [371.7286071777344, 257.4912109375], [373.923583984375, 253.79220581054688]]},
    {"itemIndex": 150, "command": ["l", [373.923583984375, 253.79220581054688], [373.97760009765625, 253.69720458984375]]},
    {"itemIndex": 151, "command": ["l", [373.97760009765625, 253.69720458984375], [373.9916076660156, 253.69720458984375]]},
    {"itemIndex": 152, "command": ["l", [373.9916076660156, 253.69720458984375], [374.8175964355469, 252.30120849609375]]},
    {"itemIndex": 153, "command": ["l", [374.8175964355469, 252.30120849609375], [374.8716125488281, 252.20620727539062]]},
    {"itemIndex": 154, "command": ["l", [374.8716125488281, 252.20620727539062], [375.6986083984375, 250.81121826171875]]},
    {"itemIndex": 155, "command": ["l", [375.6986083984375, 250.81121826171875], [375.7546081542969, 250.71621704101562]]},
    {"itemIndex": 156, "command": ["l", [375.7546081542969, 250.71621704101562], [376.57958984375, 249.32020568847656]]},
    {"itemIndex": 157, "command": ["l", [376.57958984375, 249.32020568847656], [376.63360595703125, 249.22520446777344]]},
    {"itemIndex": 158, "command": ["l", [376.63360595703125, 249.22520446777344], [377.4606018066406, 247.82920837402344]]},
    {"itemIndex": 159, "command": ["l", [377.4606018066406, 247.82920837402344], [377.51458740234375, 247.7342071533203]]},
    {"itemIndex": 160, "command": ["l", [377.51458740234375, 247.7342071533203], [377.527587890625, 247.7342071533203]]},
    {"itemIndex": 161, "command": ["l", [377.527587890625, 247.7342071533203], [378.34161376953125, 246.33920288085938]]},
    {"itemIndex": 162, "command": ["l", [378.34161376953125, 246.33920288085938], [378.3546142578125, 246.33920288085938]]},
    {"itemIndex": 163, "command": ["l", [378.3546142578125, 246.33920288085938], [379.11358642578125, 245.05120849609375]]},
    {"itemIndex": 164, "command": ["c", [379.11358642578125, 245.05120849609375], [379.1416015625, 244.9162139892578], [379.1816101074219, 244.79420471191406], [379.2085876464844, 244.658203125]]},
    {"itemIndex": 165, "command": ["c", [379.2085876464844, 244.658203125], [379.35760498046875, 244.10321044921875], [379.506591796875, 243.52020263671875], [379.6556091308594, 242.95120239257812]]},
    {"itemIndex": 166, "command": ["l", [379.6556091308594, 242.95120239257812], [380.95660400390625, 243.27621459960938]]},
    {"itemIndex": 167, "command": ["l", [380.95660400390625, 243.27621459960938], [380.7806091308594, 243.92721557617188]]},
    {"itemIndex": 168, "command": ["l", [380.7806091308594, 243.92721557617188], [387.2725830078125, 247.77520751953125]]},
    {"itemIndex": 169, "command": ["l", [387.2725830078125, 247.77520751953125], [386.8515930175781, 248.48020935058594]]},
    {"itemIndex": 170, "command": ["l", [386.8515930175781, 248.48020935058594], [380.3326110839844, 244.6182098388672]]},
    {"itemIndex": 171, "command": ["l", [380.3326110839844, 244.6182098388672], [380.0216064453125, 245.13320922851562]]},
    {"itemIndex": 172, "command": ["l", [380.0216064453125, 245.13320922851562], [376.09259033203125, 251.77320861816406]]},
    {"itemIndex": 173, "command": ["l", [376.09259033203125, 251.77320861816406], [374.45361328125, 254.53721618652344]]},
    {"itemIndex": 174, "command": ["l", [374.45361328125, 254.53721618652344], [373.19158935546875, 256.6512145996094]]},
    {"itemIndex": 175, "command": ["l", [373.19158935546875, 256.6512145996094], [374.1145935058594, 257.1932067871094]]},
    {"itemIndex": 176, "command": ["l", [374.1145935058594, 257.1932067871094], [374.5736083984375, 257.4642028808594]]},
    {"itemIndex": 177, "command": ["l", [374.5736083984375, 257.4642028808594], [376.70159912109375, 258.7242126464844]]},
    {"itemIndex": 178, "command": ["l", [376.70159912109375, 258.7242126464844], [380.7936096191406, 261.15020751953125]]},
    {"itemIndex": 179, "command": ["l", [380.7936096191406, 261.15020751953125], [383.1246032714844, 262.5321960449219]]},
    {"itemIndex": 180, "command": ["l", [383.1246032714844, 262.5321960449219], [385.1846008300781, 263.752197265625]]},
    {"itemIndex": 181, "command": ["l", [385.1846008300781, 263.752197265625], [385.55059814453125, 263.9822082519531]]},
    {"itemIndex": 182, "command": ["c", [385.55059814453125, 263.9822082519531], [385.4555969238281, 264.11822509765625], [385.360595703125, 264.2402038574219], [385.2525939941406, 264.3622131347656]]},
    {"itemIndex": 183, "command": ["c", [385.2525939941406, 264.3622131347656], [385.1976013183594, 264.42919921875], [385.1435852050781, 264.4842224121094], [385.089599609375, 264.55120849609375]]},
    {"itemIndex": 184, "command": ["l", [385.089599609375, 264.55120849609375], [373.7336120605469, 257.81719970703125]]},
    {"itemIndex": 185, "command": ["l", [373.7336120605469, 257.81719970703125], [372.7445983886719, 257.22021484375]]},
    {"itemIndex": 186, "command": ["l", [372.7445983886719, 257.22021484375], [371.6195983886719, 259.1172180175781]]},
    {"itemIndex": 187, "command": ["l", [371.6195983886719, 259.1172180175781], [371.38958740234375, 259.5102233886719]]},
    {"itemIndex": 188, "command": ["c", [371.38958740234375, 259.5102233886719], [369.18060302734375, 259.876220703125], [366.985595703125, 260.2152099609375], [364.776611328125, 260.55419921875]]},
    {"itemIndex": 189, "command": ["l", [364.776611328125, 260.55419921875], [364.6676025390625, 259.8362121582031]]},
    {"itemIndex": 190, "command": ["c", [364.6676025390625, 259.8362121582031], [364.4916076660156, 259.86322021484375], [364.32958984375, 259.89019775390625], [364.152587890625, 259.9172058105469]]},
    {"itemIndex": 191, "command": ["l", [364.152587890625, 259.9172058105469], [364.152587890625, 259.75421142578125]]},
    {"itemIndex": 192, "command": ["l", [364.152587890625, 259.75421142578125], [364.152587890625, 257.4912109375]]},
    {"itemIndex": 193, "command": ["l", [364.152587890625, 257.4912109375], [363.4486083984375, 257.4912109375]]},
    {"itemIndex": 194, "command": ["l", [363.4486083984375, 257.4912109375], [361.2406005859375, 257.4912109375]]},
    {"itemIndex": 195, "command": ["l", [361.2406005859375, 257.4912109375], [344.8565979003906, 257.4912109375]]},
    {"itemIndex": 196, "command": ["l", [344.8565979003906, 257.4912109375], [342.6476135253906, 257.4912109375]]},
    {"itemIndex": 197, "command": ["l", [342.6476135253906, 257.4912109375], [327.5105895996094, 257.4912109375]]},
    {"itemIndex": 198, "command": ["l", [327.5105895996094, 257.4912109375], [326.1416015625, 257.4912109375]]},
    {"itemIndex": 199, "command": ["l", [326.1416015625, 257.4912109375], [326.1416015625, 256.35321044921875]]},
    {"itemIndex": 200, "command": ["l", [326.1416015625, 256.35321044921875], [356.07659912109375, 256.35321044921875]]},
    {"itemIndex": 201, "command": ["l", [370.9285888671875, 258.8462219238281], [370.9696044921875, 258.7792053222656]]},
    {"itemIndex": 202, "command": ["l", [370.9696044921875, 258.7792053222656], [369.2215881347656, 259.07720947265625]]},
    {"itemIndex": 203, "command": ["l", [369.2215881347656, 259.07720947265625], [365.2915954589844, 259.7272033691406]]},
    {"itemIndex": 204, "command": ["l", [365.2915954589844, 259.7272033691406], [365.2915954589844, 259.7412109375]]},
    {"itemIndex": 205, "command": ["l", [365.2915954589844, 259.7412109375], [367.798583984375, 259.34820556640625]]},
    {"itemIndex": 206, "command": ["l", [367.798583984375, 259.34820556640625], [370.9285888671875, 258.8462219238281]]}
  ] },
  { "pathIndex": 52189, "seqno": 52189, "boundsPt": [387.285400390625, 88.43989562988281, 410.4034118652344, 118.5918960571289], "style": "style-4", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["c", [388.2474060058594, 88.48089599609375], [395.2264099121094, 88.80589294433594], [399.11541748046875, 91.48889923095703], [401.9743957519531, 97.91289520263672]]},
    {"itemIndex": 1, "command": ["c", [401.9743957519531, 97.91289520263672], [402.0154113769531, 97.97989654541016], [402.04241943359375, 98.04789733886719], [402.06939697265625, 98.11589813232422]]},
    {"itemIndex": 2, "command": ["c", [402.06939697265625, 98.11589813232422], [402.150390625, 98.27890014648438], [402.2184143066406, 98.45489501953125], [402.2864074707031, 98.61689758300781]]},
    {"itemIndex": 3, "command": ["l", [402.2864074707031, 98.61689758300781], [403.8023986816406, 102.22189331054688]]},
    {"itemIndex": 4, "command": ["l", [403.8023986816406, 102.22189331054688], [407.3004150390625, 101.6658935546875]]},
    {"itemIndex": 5, "command": ["c", [407.3004150390625, 101.6658935546875], [407.47540283203125, 102.03189849853516], [407.6253967285156, 102.38489532470703], [407.7744140625, 102.74989318847656]]},
    {"itemIndex": 6, "command": ["l", [407.7744140625, 102.74989318847656], [404.25140380859375, 103.30589294433594]]},
    {"itemIndex": 7, "command": ["l", [404.25140380859375, 103.30589294433594], [410.3904113769531, 117.98189544677734]]},
    {"itemIndex": 8, "command": ["c", [410.3904113769531, 117.98189544677734], [410.3904113769531, 118.02289581298828], [410.4034118652344, 118.07689666748047], [410.4034118652344, 118.11689758300781]]},
    {"itemIndex": 9, "command": ["l", [410.4034118652344, 118.11689758300781], [410.3904113769531, 118.13089752197266]]},
    {"itemIndex": 10, "command": ["l", [410.3904113769531, 118.13089752197266], [410.3904113769531, 118.11689758300781]]},
    {"itemIndex": 11, "command": ["l", [410.3904113769531, 118.11689758300781], [409.83441162109375, 118.37489318847656]]},
    {"itemIndex": 12, "command": ["l", [409.83441162109375, 118.37489318847656], [409.305419921875, 118.5918960571289]]},
    {"itemIndex": 13, "command": ["l", [409.305419921875, 118.5918960571289], [406.9884033203125, 113.04889678955078]]},
    {"itemIndex": 14, "command": ["l", [406.9884033203125, 113.04889678955078], [401.1484069824219, 99.0918960571289]]},
    {"itemIndex": 15, "command": ["c", [401.1484069824219, 99.0918960571289], [398.3434143066406, 92.41089630126953], [394.535400390625, 89.8228988647461], [387.285400390625, 89.67389678955078]]},
    {"itemIndex": 16, "command": ["l", [387.285400390625, 89.67389678955078], [387.3124084472656, 88.43989562988281]]},
    {"itemIndex": 17, "command": ["c", [387.3124084472656, 88.43989562988281], [387.42041015625, 88.43989562988281], [387.5414123535156, 88.43989562988281], [387.6513977050781, 88.45389556884766]]},
    {"itemIndex": 18, "command": ["c", [387.6513977050781, 88.45389556884766], [387.8544006347656, 88.45389556884766], [388.0444030761719, 88.4678955078125], [388.2474060058594, 88.48089599609375]]}
  ] },
  { "pathIndex": 52195, "seqno": 52195, "boundsPt": [419.4953918457031, 238.45179748535156, 424.67340087890625, 243.46580505371094], "style": "style-4", "roles": ["corridor-column-context"], "items": [
    {"itemIndex": 0, "command": ["c", [419.8623962402344, 239.83380126953125], [419.8623962402344, 239.81979370117188], [419.8753967285156, 239.81979370117188], [419.8753967285156, 239.81979370117188]]},
    {"itemIndex": 1, "command": ["c", [419.8753967285156, 239.81979370117188], [420.118408203125, 239.1697998046875], [420.4573974609375, 238.7637939453125], [420.9464111328125, 238.58680725097656]]},
    {"itemIndex": 2, "command": ["c", [420.9464111328125, 238.58680725097656], [421.0413818359375, 238.55979919433594], [421.1343994140625, 238.53280639648438], [421.244384765625, 238.50579833984375]]},
    {"itemIndex": 3, "command": ["c", [421.244384765625, 238.50579833984375], [421.6243896484375, 238.45179748535156], [422.0714111328125, 238.50579833984375], [422.6134033203125, 238.65480041503906]]},
    {"itemIndex": 4, "command": ["c", [422.6134033203125, 238.65480041503906], [424.21240234375, 239.12879943847656], [424.67340087890625, 239.98280334472656], [424.21240234375, 241.5688018798828]]},
    {"itemIndex": 5, "command": ["c", [424.21240234375, 241.5688018798828], [424.17138671875, 241.71780395507812], [424.1174011230469, 241.86680603027344], [424.0633850097656, 242.00180053710938]]},
    {"itemIndex": 6, "command": ["c", [424.0633850097656, 242.00180053710938], [423.62939453125, 243.0727996826172], [422.952392578125, 243.46580505371094], [421.8544006347656, 243.289794921875]]},
    {"itemIndex": 7, "command": ["c", [421.8544006347656, 243.289794921875], [421.67840576171875, 243.2617950439453], [421.4884033203125, 243.20779418945312], [421.29840087890625, 243.15380859375]]},
    {"itemIndex": 8, "command": ["c", [421.29840087890625, 243.15380859375], [420.702392578125, 242.97779846191406], [420.2694091796875, 242.76080322265625], [419.9844055175781, 242.46279907226562]]},
    {"itemIndex": 9, "command": ["c", [419.9844055175781, 242.46279907226562], [419.8334045410156, 242.2998046875], [419.72540283203125, 242.13780212402344], [419.6593933105469, 241.9477996826172]]},
    {"itemIndex": 10, "command": ["c", [419.6593933105469, 241.9477996826172], [419.4953918457031, 241.5008087158203], [419.5234069824219, 240.94479370117188], [419.72540283203125, 240.2407989501953]]},
    {"itemIndex": 11, "command": ["c", [419.72540283203125, 240.2407989501953], [419.75439453125, 240.09080505371094], [419.80841064453125, 239.95579528808594], [419.8623962402344, 239.83380126953125]]}
  ] },
  { "pathIndex": 52198, "seqno": 52198, "boundsPt": [444.7409973144531, 114.5535888671875, 450.19000244140625, 137.38758850097656], "style": "style-3", "roles": ["north-vestibule-wall-or-jamb-paint"], "items": [
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
    {"itemIndex": 50, "command": ["l", [447.3710021972656, 116.55958557128906], [447.6289978027344, 114.5535888671875]]}
  ] },
  { "pathIndex": 52244, "seqno": 52244, "boundsPt": [387.6513977050781, 88.45389556884766, 388.2474060058594, 88.48089599609375], "style": "style-4", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["c", [388.2474060058594, 88.48089599609375], [388.0444030761719, 88.4678955078125], [387.8544006347656, 88.45389556884766], [387.6513977050781, 88.45389556884766]]},
    {"itemIndex": 1, "command": ["c", [387.6513977050781, 88.45389556884766], [387.8544006347656, 88.45389556884766], [388.0574035644531, 88.4678955078125], [388.2474060058594, 88.48089599609375]]}
  ] },
  { "pathIndex": 52250, "seqno": 52250, "boundsPt": [309.1222839355469, 78.30388641357422, 407.30029296875, 102.22188568115234], "style": "style-4", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["c", [390.9032897949219, 86.7598876953125], [391.3372802734375, 86.92288970947266], [391.7843017578125, 87.09888458251953], [392.21728515625, 87.27488708496094]]},
    {"itemIndex": 1, "command": ["c", [392.21728515625, 87.27488708496094], [392.4342956542969, 87.36988830566406], [392.6512756347656, 87.46488952636719], [392.8682861328125, 87.55989074707031]]},
    {"itemIndex": 2, "command": ["c", [392.8682861328125, 87.55989074707031], [393.0852966308594, 87.65388488769531], [393.3013000488281, 87.74888610839844], [393.5182800292969, 87.84388732910156]]},
    {"itemIndex": 3, "command": ["c", [393.5182800292969, 87.84388732910156], [393.93829345703125, 88.04689025878906], [394.3722839355469, 88.26388549804688], [394.779296875, 88.48088836669922]]},
    {"itemIndex": 4, "command": ["c", [394.779296875, 88.48088836669922], [395.19927978515625, 88.69789123535156], [395.6172790527344, 88.92788696289062], [396.0252990722656, 89.17189025878906]]},
    {"itemIndex": 5, "command": ["c", [396.0252990722656, 89.17189025878906], [396.4322814941406, 89.40288543701172], [396.8252868652344, 89.6598892211914], [397.2182922363281, 89.91688537597656]]},
    {"itemIndex": 6, "command": ["c", [397.2182922363281, 89.91688537597656], [397.6112976074219, 90.17488861083984], [398.0043029785156, 90.44588470458984], [398.38330078125, 90.73088836669922]]},
    {"itemIndex": 7, "command": ["c", [398.38330078125, 90.73088836669922], [398.7632751464844, 91.00188446044922], [399.1423034667969, 91.29988861083984], [399.50830078125, 91.59788513183594]]},
    {"itemIndex": 8, "command": ["c", [399.50830078125, 91.59788513183594], [399.8742980957031, 91.89588928222656], [400.2262878417969, 92.19388580322266], [400.5782775878906, 92.51889038085938]]},
    {"itemIndex": 9, "command": ["c", [400.5782775878906, 92.51889038085938], [400.9312744140625, 92.83088684082031], [401.2702941894531, 93.1558837890625], [401.6082763671875, 93.49488830566406]]},
    {"itemIndex": 10, "command": ["c", [401.6082763671875, 93.49488830566406], [401.9472961425781, 93.81988525390625], [402.27227783203125, 94.17288970947266], [402.58428955078125, 94.52488708496094]]},
    {"itemIndex": 11, "command": ["c", [402.58428955078125, 94.52488708496094], [402.89630126953125, 94.8638916015625], [403.207275390625, 95.22888946533203], [403.50628662109375, 95.59488677978516]]},
    {"itemIndex": 12, "command": ["c", [403.50628662109375, 95.59488677978516], [403.8042907714844, 95.96089172363281], [404.102294921875, 96.32688903808594], [404.373291015625, 96.7068862915039]]},
    {"itemIndex": 13, "command": ["c", [404.373291015625, 96.7068862915039], [404.65728759765625, 97.08589172363281], [404.92828369140625, 97.47888946533203], [405.186279296875, 97.87188720703125]]},
    {"itemIndex": 14, "command": ["c", [405.186279296875, 97.87188720703125], [405.457275390625, 98.26488494873047], [405.7012939453125, 98.65789031982422], [405.9452819824219, 99.06488800048828]]},
    {"itemIndex": 15, "command": ["c", [405.9452819824219, 99.06488800048828], [406.1893005371094, 99.47088623046875], [406.4192810058594, 99.89088439941406], [406.63629150390625, 100.3108901977539]]},
    {"itemIndex": 16, "command": ["c", [406.63629150390625, 100.3108901977539], [406.8533020019531, 100.71788787841797], [407.0702819824219, 101.15088653564453], [407.25927734375, 101.57188415527344]]},
    {"itemIndex": 17, "command": ["c", [407.25927734375, 101.57188415527344], [407.2732849121094, 101.59888458251953], [407.2862854003906, 101.63888549804688], [407.30029296875, 101.66588592529297]]},
    {"itemIndex": 18, "command": ["l", [407.30029296875, 101.66588592529297], [403.8042907714844, 102.22188568115234]]},
    {"itemIndex": 19, "command": ["l", [403.8042907714844, 102.22188568115234], [402.2862854003906, 98.61688995361328]]},
    {"itemIndex": 20, "command": ["c", [402.2862854003906, 98.61688995361328], [402.2182922363281, 98.45488739013672], [402.1502990722656, 98.27788543701172], [402.06927490234375, 98.11589050292969]]},
    {"itemIndex": 21, "command": ["c", [402.06927490234375, 98.11589050292969], [402.04229736328125, 98.04788970947266], [402.0152893066406, 97.97988891601562], [401.97430419921875, 97.91288757324219]]},
    {"itemIndex": 22, "command": ["c", [401.97430419921875, 97.91288757324219], [399.11529541015625, 91.4888916015625], [395.2262878417969, 88.8058853149414], [388.2472839355469, 88.48088836669922]]},
    {"itemIndex": 23, "command": ["c", [388.2472839355469, 88.48088836669922], [388.0572814941406, 88.46688842773438], [387.8542785644531, 88.45388793945312], [387.6512756347656, 88.45388793945312]]},
    {"itemIndex": 24, "command": ["c", [387.6512756347656, 88.45388793945312], [387.54229736328125, 88.43988800048828], [387.4202880859375, 88.43988800048828], [387.3122863769531, 88.43988800048828]]},
    {"itemIndex": 25, "command": ["l", [387.3122863769531, 88.43988800048828], [387.25830078125, 88.43988800048828]]},
    {"itemIndex": 26, "command": ["l", [387.25830078125, 88.43988800048828], [387.25830078125, 88.41288757324219]]},
    {"itemIndex": 27, "command": ["l", [387.25830078125, 88.41288757324219], [382.352294921875, 88.41288757324219]]},
    {"itemIndex": 28, "command": ["l", [382.352294921875, 88.41288757324219], [382.352294921875, 87.92488861083984]]},
    {"itemIndex": 29, "command": ["l", [382.352294921875, 87.92488861083984], [380.1432800292969, 87.92488861083984]]},
    {"itemIndex": 30, "command": ["l", [380.1432800292969, 87.92488861083984], [380.1432800292969, 88.41288757324219]]},
    {"itemIndex": 31, "command": ["l", [380.1432800292969, 88.41288757324219], [362.811279296875, 88.41288757324219]]},
    {"itemIndex": 32, "command": ["l", [362.811279296875, 88.41288757324219], [362.811279296875, 87.13988494873047]]},
    {"itemIndex": 33, "command": ["l", [362.811279296875, 87.13988494873047], [361.86328125, 87.13988494873047]]},
    {"itemIndex": 34, "command": ["l", [361.86328125, 87.13988494873047], [361.86328125, 88.41288757324219]]},
    {"itemIndex": 35, "command": ["l", [361.86328125, 88.41288757324219], [333.02630615234375, 88.41288757324219]]},
    {"itemIndex": 36, "command": ["l", [333.02630615234375, 88.41288757324219], [326.14227294921875, 88.41288757324219]]},
    {"itemIndex": 37, "command": ["l", [326.14227294921875, 88.41288757324219], [326.14227294921875, 87.92488861083984]]},
    {"itemIndex": 38, "command": ["l", [326.14227294921875, 87.92488861083984], [324.24530029296875, 87.92488861083984]]},
    {"itemIndex": 39, "command": ["l", [324.24530029296875, 87.92488861083984], [309.1222839355469, 87.92488861083984]]},
    {"itemIndex": 40, "command": ["l", [309.1222839355469, 87.92488861083984], [309.1222839355469, 84.09088897705078]]},
    {"itemIndex": 41, "command": ["c", [309.1222839355469, 84.09088897705078], [309.5152893066406, 83.96788787841797], [309.935302734375, 83.8328857421875], [310.32830810546875, 83.71088409423828]]},
    {"itemIndex": 42, "command": ["c", [310.32830810546875, 83.71088409423828], [310.7752990722656, 83.57588958740234], [311.2362976074219, 83.43988800048828], [311.68328857421875, 83.30388641357422]]},
    {"itemIndex": 43, "command": ["c", [311.68328857421875, 83.30388641357422], [312.1302795410156, 83.16888427734375], [312.59130859375, 83.03289031982422], [313.0382995605469, 82.9118881225586]]},
    {"itemIndex": 44, "command": ["c", [313.0382995605469, 82.9118881225586], [313.4992980957031, 82.77588653564453], [313.95928955078125, 82.65388488769531], [314.40728759765625, 82.53189086914062]]},
    {"itemIndex": 45, "command": ["c", [314.40728759765625, 82.53189086914062], [314.8672790527344, 82.4098892211914], [315.3273010253906, 82.28788757324219], [315.7752990722656, 82.16588592529297]]},
    {"itemIndex": 46, "command": ["c", [315.7752990722656, 82.16588592529297], [316.2362976074219, 82.0578842163086], [316.6972961425781, 81.9358901977539], [317.1582946777344, 81.82688903808594]]},
    {"itemIndex": 47, "command": ["c", [317.1582946777344, 81.82688903808594], [317.6182861328125, 81.71888732910156], [318.0662841796875, 81.59688568115234], [318.52630615234375, 81.50188446044922]]},
    {"itemIndex": 48, "command": ["c", [318.52630615234375, 81.50188446044922], [318.9873046875, 81.39389038085938], [319.44830322265625, 81.2848892211914], [319.9082946777344, 81.17688751220703]]},
    {"itemIndex": 49, "command": ["c", [319.9082946777344, 81.17688751220703], [320.3692932128906, 81.0818862915039], [320.8302917480469, 80.98688507080078], [321.3042907714844, 80.87889099121094]]},
    {"itemIndex": 50, "command": ["c", [321.3042907714844, 80.87889099121094], [321.7642822265625, 80.78388977050781], [322.2262878417969, 80.68888854980469], [322.686279296875, 80.6078872680664]]},
    {"itemIndex": 51, "command": ["c", [322.686279296875, 80.6078872680664], [323.14727783203125, 80.51288604736328], [323.6082763671875, 80.41788482666016], [324.082275390625, 80.3368911743164]]},
    {"itemIndex": 52, "command": ["c", [324.082275390625, 80.3368911743164], [324.54327392578125, 80.25489044189453], [325.0042724609375, 80.17388916015625], [325.478271484375, 80.09288787841797]]},
    {"itemIndex": 53, "command": ["c", [325.478271484375, 80.09288787841797], [325.9393005371094, 80.01188659667969], [326.3992919921875, 79.92988586425781], [326.8742980957031, 79.86288452148438]]},
    {"itemIndex": 54, "command": ["c", [326.8742980957031, 79.86288452148438], [327.33428955078125, 79.7808837890625], [327.8092956542969, 79.712890625], [328.2702941894531, 79.64588928222656]]},
    {"itemIndex": 55, "command": ["c", [328.2702941894531, 79.64588928222656], [328.7442932128906, 79.56388854980469], [329.2052917480469, 79.49688720703125], [329.6792907714844, 79.44188690185547]]},
    {"itemIndex": 56, "command": ["c", [329.6792907714844, 79.44188690185547], [330.1402893066406, 79.37488555908203], [330.6142883300781, 79.306884765625], [331.0752868652344, 79.25288391113281]]},
    {"itemIndex": 57, "command": ["c", [331.0752868652344, 79.25288391113281], [331.5492858886719, 79.19889068603516], [332.0102844238281, 79.14389038085938], [332.4842834472656, 79.08988952636719]]},
    {"itemIndex": 58, "command": ["c", [332.4842834472656, 79.08988952636719], [332.9582824707031, 79.035888671875], [333.4192810058594, 78.98188781738281], [333.8932800292969, 78.94088745117188]]},
    {"itemIndex": 59, "command": ["c", [333.8932800292969, 78.94088745117188], [334.3682861328125, 78.88688659667969], [334.8282775878906, 78.84588623046875], [335.30328369140625, 78.8058853149414]]},
    {"itemIndex": 60, "command": ["c", [335.30328369140625, 78.8058853149414], [335.77728271484375, 78.75088500976562], [336.23828125, 78.71089172363281], [336.7122802734375, 78.68388366699219]]},
    {"itemIndex": 61, "command": ["c", [336.7122802734375, 78.68388366699219], [337.186279296875, 78.64289093017578], [337.6602783203125, 78.61589050292969], [338.12127685546875, 78.57489013671875]]},
    {"itemIndex": 62, "command": ["c", [338.12127685546875, 78.57489013671875], [338.5962829589844, 78.54788970947266], [339.0702819824219, 78.52088928222656], [339.5442810058594, 78.49388885498047]]},
    {"itemIndex": 63, "command": ["c", [339.5442810058594, 78.49388885498047], [340.0182800292969, 78.46688842773438], [340.4792785644531, 78.43988800048828], [340.9532775878906, 78.42588806152344]]},
    {"itemIndex": 64, "command": ["c", [340.9532775878906, 78.42588806152344], [341.42828369140625, 78.39888763427734], [341.90228271484375, 78.3848876953125], [342.37628173828125, 78.37188720703125]]},
    {"itemIndex": 65, "command": ["c", [342.37628173828125, 78.37188720703125], [342.8512878417969, 78.3578872680664], [343.311279296875, 78.34488677978516], [343.7843017578125, 78.33088684082031]]},
    {"itemIndex": 66, "command": ["c", [343.7843017578125, 78.33088684082031], [344.2602844238281, 78.31788635253906], [344.7342834472656, 78.31788635253906], [345.2082824707031, 78.31788635253906]]},
    {"itemIndex": 67, "command": ["c", [345.2082824707031, 78.31788635253906], [345.68328857421875, 78.30388641357422], [346.1432800292969, 78.30388641357422], [346.6182861328125, 78.30388641357422]]},
    {"itemIndex": 68, "command": ["c", [346.6182861328125, 78.30388641357422], [347.09228515625, 78.30388641357422], [347.5662841796875, 78.31788635253906], [348.0412902832031, 78.31788635253906]]},
    {"itemIndex": 69, "command": ["c", [348.0412902832031, 78.31788635253906], [348.5152893066406, 78.33088684082031], [348.9892883300781, 78.33088684082031], [349.4502868652344, 78.34488677978516]]},
    {"itemIndex": 70, "command": ["c", [349.4502868652344, 78.34488677978516], [349.9242858886719, 78.3578872680664], [350.3992919921875, 78.37188720703125], [350.873291015625, 78.39888763427734]]},
    {"itemIndex": 71, "command": ["c", [350.873291015625, 78.39888763427734], [351.3472900390625, 78.41288757324219], [351.8212890625, 78.43988800048828], [352.28228759765625, 78.45288848876953]]},
    {"itemIndex": 72, "command": ["c", [352.28228759765625, 78.45288848876953], [352.75628662109375, 78.47988891601562], [353.2312927246094, 78.50688934326172], [353.7052917480469, 78.5348892211914]]},
    {"itemIndex": 73, "command": ["c", [353.7052917480469, 78.5348892211914], [354.1792907714844, 78.5618896484375], [354.6402893066406, 78.5888900756836], [355.1142883300781, 78.62889099121094]]},
    {"itemIndex": 74, "command": ["c", [355.1142883300781, 78.62889099121094], [355.58929443359375, 78.66989135742188], [356.06329345703125, 78.69688415527344], [356.5242919921875, 78.73788452148438]]},
    {"itemIndex": 75, "command": ["c", [356.5242919921875, 78.73788452148438], [356.9972839355469, 78.77788543701172], [357.4722900390625, 78.81888580322266], [357.93328857421875, 78.87288665771484]]},
    {"itemIndex": 76, "command": ["c", [357.93328857421875, 78.87288665771484], [358.40728759765625, 78.91388702392578], [358.8822937011719, 78.95488739013672], [359.34228515625, 79.0088882446289]]},
    {"itemIndex": 77, "command": ["c", [359.34228515625, 79.0088882446289], [359.8172912597656, 79.0628890991211], [360.2912902832031, 79.11688995361328], [360.7522888183594, 79.17089080810547]]},
    {"itemIndex": 78, "command": ["c", [360.7522888183594, 79.17089080810547], [361.2262878417969, 79.22589111328125], [361.6872863769531, 79.2798843383789], [362.1612854003906, 79.34788513183594]]},
    {"itemIndex": 79, "command": ["c", [362.1612854003906, 79.34788513183594], [362.6352844238281, 79.41488647460938], [363.09527587890625, 79.46988677978516], [363.5702819824219, 79.5368881225586]]},
    {"itemIndex": 80, "command": ["c", [363.5702819824219, 79.5368881225586], [364.0312805175781, 79.60488891601562], [364.5052795410156, 79.67288970947266], [364.9662780761719, 79.75389099121094]]},
    {"itemIndex": 81, "command": ["c", [364.9662780761719, 79.75389099121094], [365.4272766113281, 79.82188415527344], [365.9012756347656, 79.90288543701172], [366.3623046875, 79.97088623046875]]},
    {"itemIndex": 82, "command": ["c", [366.3623046875, 79.97088623046875], [366.8363037109375, 80.05188751220703], [367.29730224609375, 80.1338882446289], [367.75830078125, 80.21488952636719]]},
    {"itemIndex": 83, "command": ["c", [367.75830078125, 80.21488952636719], [368.2322998046875, 80.29589080810547], [368.69329833984375, 80.39088439941406], [369.1532897949219, 80.47188568115234]]},
    {"itemIndex": 84, "command": ["c", [369.1532897949219, 80.47188568115234], [369.6142883300781, 80.56688690185547], [370.0752868652344, 80.64888763427734], [370.54827880859375, 80.74288940429688]]},
    {"itemIndex": 85, "command": ["c", [370.54827880859375, 80.74288940429688], [371.0102844238281, 80.837890625], [371.4712829589844, 80.9328842163086], [371.9312744140625, 81.04088592529297]]},
    {"itemIndex": 86, "command": ["c", [371.9312744140625, 81.04088592529297], [372.3923034667969, 81.1358871459961], [372.8533020019531, 81.24488830566406], [373.3143005371094, 81.33988952636719]]},
    {"itemIndex": 87, "command": ["c", [373.3143005371094, 81.33988952636719], [373.7742919921875, 81.44789123535156], [374.23529052734375, 81.5558853149414], [374.6962890625, 81.66488647460938]]},
    {"itemIndex": 88, "command": ["c", [374.6962890625, 81.66488647460938], [375.1562805175781, 81.77288818359375], [375.6172790527344, 81.88188934326172], [376.0643005371094, 82.00389099121094]]},
    {"itemIndex": 89, "command": ["c", [376.0643005371094, 82.00389099121094], [376.5252990722656, 82.11188507080078], [376.98529052734375, 82.23388671875], [377.4472961425781, 82.35588836669922]]},
    {"itemIndex": 90, "command": ["c", [377.4472961425781, 82.35588836669922], [377.894287109375, 82.47789001464844], [378.35528564453125, 82.59988403320312], [378.8152770996094, 82.72188568115234]]},
    {"itemIndex": 91, "command": ["c", [378.8152770996094, 82.72188568115234], [379.2622985839844, 82.85688781738281], [379.7232971191406, 82.97888946533203], [380.1702880859375, 83.1148910522461]]},
    {"itemIndex": 92, "command": ["c", [380.1702880859375, 83.1148910522461], [380.63128662109375, 83.23688507080078], [381.0782775878906, 83.37188720703125], [381.5262756347656, 83.50788879394531]]},
    {"itemIndex": 93, "command": ["c", [381.5262756347656, 83.50788879394531], [381.9862976074219, 83.64289093017578], [382.4342956542969, 83.79188537597656], [382.88128662109375, 83.92788696289062]]},
    {"itemIndex": 94, "command": ["c", [382.88128662109375, 83.92788696289062], [383.3412780761719, 84.07688903808594], [383.7892761230469, 84.212890625], [384.2362976074219, 84.36188507080078]]},
    {"itemIndex": 95, "command": ["c", [384.2362976074219, 84.36188507080078], [384.68328857421875, 84.5108871459961], [385.1302795410156, 84.6598892211914], [385.5773010253906, 84.80889129638672]]},
    {"itemIndex": 96, "command": ["c", [385.5773010253906, 84.80889129638672], [386.0252990722656, 84.9578857421875], [386.47027587890625, 85.11988830566406], [386.9192810058594, 85.26889038085938]]},
    {"itemIndex": 97, "command": ["c", [386.9192810058594, 85.26889038085938], [387.3663024902344, 85.431884765625], [387.80029296875, 85.59488677978516], [388.2472839355469, 85.75688934326172]]},
    {"itemIndex": 98, "command": ["c", [388.2472839355469, 85.75688934326172], [388.46429443359375, 85.8388900756836], [388.69427490234375, 85.91989135742188], [388.9112854003906, 86.00088500976562]]},
    {"itemIndex": 99, "command": ["c", [388.9112854003906, 86.00088500976562], [389.1282958984375, 86.0818862915039], [389.3582763671875, 86.16388702392578], [389.5752868652344, 86.2588882446289]]},
    {"itemIndex": 100, "command": ["c", [389.5752868652344, 86.2588882446289], [389.79229736328125, 86.33988952636719], [390.02227783203125, 86.42089080810547], [390.2392883300781, 86.50288391113281]]},
    {"itemIndex": 101, "command": ["c", [390.2392883300781, 86.50288391113281], [390.456298828125, 86.5838851928711], [390.686279296875, 86.66488647460938], [390.9032897949219, 86.7598876953125]]}
  ] },
  { "pathIndex": 52285, "seqno": 52285, "boundsPt": [404.25079345703125, 102.74980926513672, 410.3898010253906, 117.9818115234375], "style": "style-4", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [410.3898010253906, 117.9818115234375], [404.25079345703125, 103.3058090209961]]},
    {"itemIndex": 1, "command": ["l", [404.25079345703125, 103.3058090209961], [407.7748107910156, 102.74980926513672]]},
    {"itemIndex": 2, "command": ["c", [407.7748107910156, 102.74980926513672], [407.8017883300781, 102.79080963134766], [407.8147888183594, 102.8318099975586], [407.82879638671875, 102.87281036376953]]},
    {"itemIndex": 3, "command": ["c", [407.82879638671875, 102.87281036376953], [408.0047912597656, 103.3058090209961], [408.1807861328125, 103.7528076171875], [408.3298034667969, 104.20081329345703]]},
    {"itemIndex": 4, "command": ["c", [408.3298034667969, 104.20081329345703], [408.4787902832031, 104.64781188964844], [408.6278076171875, 105.09481048583984], [408.7637939453125, 105.5558090209961]]},
    {"itemIndex": 5, "command": ["c", [408.7637939453125, 105.5558090209961], [408.8988037109375, 106.0028076171875], [409.02081298828125, 106.46381378173828], [409.1297912597656, 106.92381286621094]]},
    {"itemIndex": 6, "command": ["c", [409.1297912597656, 106.92381286621094], [409.1838073730469, 107.14080810546875], [409.23779296875, 107.37181091308594], [409.27880859375, 107.61481475830078]]},
    {"itemIndex": 7, "command": ["c", [409.27880859375, 107.61481475830078], [409.3327941894531, 107.84580993652344], [409.3738098144531, 108.07581329345703], [409.42779541015625, 108.30680847167969]]},
    {"itemIndex": 8, "command": ["c", [409.42779541015625, 108.30680847167969], [409.4678039550781, 108.53681182861328], [409.5087890625, 108.76681518554688], [409.5357971191406, 108.99781036376953]]},
    {"itemIndex": 9, "command": ["c", [409.5357971191406, 108.99781036376953], [409.5768127441406, 109.24181365966797], [409.6177978515625, 109.47180938720703], [409.6448059082031, 109.70181274414062]]},
    {"itemIndex": 10, "command": ["c", [409.6448059082031, 109.70181274414062], [409.7117919921875, 110.17681121826172], [409.7528076171875, 110.63681030273438], [409.8067932128906, 111.11180877685547]]},
    {"itemIndex": 11, "command": ["c", [409.8067932128906, 111.11180877685547], [409.83380126953125, 111.34181213378906], [409.8608093261719, 111.5858154296875], [409.8747863769531, 111.81581115722656]]},
    {"itemIndex": 12, "command": ["c", [409.8747863769531, 111.81581115722656], [409.90179443359375, 112.04681396484375], [409.9288024902344, 112.29080963134766], [409.94281005859375, 112.52081298828125]]},
    {"itemIndex": 13, "command": ["c", [409.94281005859375, 112.52081298828125], [409.96978759765625, 112.75080871582031], [409.9967956542969, 112.99481201171875], [410.01080322265625, 113.22581481933594]]},
    {"itemIndex": 14, "command": ["c", [410.01080322265625, 113.22581481933594], [410.0378112792969, 113.455810546875], [410.0508117675781, 113.69981384277344], [410.0798034667969, 113.9298095703125]]},
    {"itemIndex": 15, "command": ["c", [410.0798034667969, 113.9298095703125], [410.1188049316406, 114.4048080444336], [410.1597900390625, 114.86481475830078], [410.1997985839844, 115.33981323242188]]},
    {"itemIndex": 16, "command": ["c", [410.1997985839844, 115.33981323242188], [410.2408142089844, 115.81381225585938], [410.2677917480469, 116.28781127929688], [410.3088073730469, 116.74880981445312]]},
    {"itemIndex": 17, "command": ["c", [410.3088073730469, 116.74880981445312], [410.3358154296875, 117.1548080444336], [410.36279296875, 117.57581329345703], [410.3898010253906, 117.9818115234375]]}
  ] },
  { "pathIndex": 52288, "seqno": 52288, "boundsPt": [385.9849853515625, 209.26300048828125, 387.86700439453125, 211.15899658203125], "style": "style-4", "roles": ["room-marker-paint-context"], "items": [
    {"itemIndex": 0, "command": ["re", [386.4590148925781, 209.73599243164062, 387.3940124511719, 210.68499755859375], -1]},
    {"itemIndex": 1, "command": ["c", [386.9339904785156, 209.26300048828125], [387.59600830078125, 209.26300048828125], [387.86700439453125, 209.54800415039062], [387.86700439453125, 210.21099853515625]]},
    {"itemIndex": 2, "command": ["c", [387.86700439453125, 210.21099853515625], [387.86700439453125, 210.88800048828125], [387.59600830078125, 211.15899658203125], [386.9339904785156, 211.15899658203125]]},
    {"itemIndex": 3, "command": ["c", [386.9339904785156, 211.15899658203125], [386.2560119628906, 211.15899658203125], [385.9849853515625, 210.88800048828125], [385.9849853515625, 210.21099853515625]]},
    {"itemIndex": 4, "command": ["c", [385.9849853515625, 210.21099853515625], [385.9849853515625, 209.54800415039062], [386.2560119628906, 209.26300048828125], [386.9339904785156, 209.26300048828125]]}
  ] },
  { "pathIndex": 52289, "seqno": 52289, "boundsPt": [386.4590148925781, 209.73599243164062, 387.3940124511719, 210.68499755859375], "style": "style-4", "roles": ["room-marker-paint-context"], "items": [
    {"itemIndex": 0, "command": ["re", [386.4590148925781, 209.73599243164062, 387.3940124511719, 210.68499755859375], 1]}
  ] },
  { "pathIndex": 52290, "seqno": 52290, "boundsPt": [385.9849853515625, 97.05899047851562, 387.86700439453125, 98.95599365234375], "style": "style-4", "roles": ["room-marker-paint-context"], "items": [
    {"itemIndex": 0, "command": ["re", [386.4590148925781, 97.53298950195312, 387.3940124511719, 98.48199462890625], -1]},
    {"itemIndex": 1, "command": ["c", [386.9339904785156, 97.05899047851562], [387.59600830078125, 97.05899047851562], [387.86700439453125, 97.34298706054688], [387.86700439453125, 98.00698852539062]]},
    {"itemIndex": 2, "command": ["c", [387.86700439453125, 98.00698852539062], [387.86700439453125, 98.68499755859375], [387.59600830078125, 98.95599365234375], [386.9339904785156, 98.95599365234375]]},
    {"itemIndex": 3, "command": ["c", [386.9339904785156, 98.95599365234375], [386.2560119628906, 98.95599365234375], [385.9849853515625, 98.68499755859375], [385.9849853515625, 98.00698852539062]]},
    {"itemIndex": 4, "command": ["c", [385.9849853515625, 98.00698852539062], [385.9849853515625, 97.34298706054688], [386.2560119628906, 97.05899047851562], [386.9339904785156, 97.05899047851562]]}
  ] },
  { "pathIndex": 52291, "seqno": 52291, "boundsPt": [386.4590148925781, 97.53399658203125, 387.3940124511719, 98.48300170898438], "style": "style-4", "roles": ["room-marker-paint-context"], "items": [
    {"itemIndex": 0, "command": ["re", [386.4590148925781, 97.53399658203125, 387.3940124511719, 98.48300170898438], 1]}
  ] },
  { "pathIndex": 52292, "seqno": 52292, "boundsPt": [385.9849853515625, 172.10501098632812, 387.86700439453125, 173.89401245117188], "style": "style-4", "roles": ["room-marker-paint-context"], "items": [
    {"itemIndex": 0, "command": ["re", [386.4590148925781, 172.552001953125, 387.3940124511719, 173.50100708007812], -1]},
    {"itemIndex": 1, "command": ["c", [387.86700439453125, 173.0260009765625], [387.86700439453125, 173.51400756835938], [387.7200012207031, 173.78500366210938], [387.3940124511719, 173.89401245117188]]},
    {"itemIndex": 2, "command": ["l", [387.3940124511719, 173.89401245117188], [387.3940124511719, 173.8389892578125]]},
    {"itemIndex": 3, "command": ["l", [387.3940124511719, 173.8389892578125], [386.33599853515625, 173.8389892578125]]},
    {"itemIndex": 4, "command": ["c", [386.33599853515625, 173.8389892578125], [386.093994140625, 173.70401000976562], [385.9849853515625, 173.44601440429688], [385.9849853515625, 173.0260009765625]]},
    {"itemIndex": 5, "command": ["c", [385.9849853515625, 173.0260009765625], [385.9849853515625, 172.45700073242188], [386.1730041503906, 172.17300415039062], [386.6340026855469, 172.10501098632812]]},
    {"itemIndex": 6, "command": ["l", [386.6340026855469, 172.10501098632812], [387.2300109863281, 172.10501098632812]]},
    {"itemIndex": 7, "command": ["c", [387.2300109863281, 172.10501098632812], [387.6789855957031, 172.18600463867188], [387.86700439453125, 172.45700073242188], [387.86700439453125, 173.0260009765625]]}
  ] },
  { "pathIndex": 52293, "seqno": 52293, "boundsPt": [386.4590148925781, 172.552001953125, 387.3940124511719, 173.50100708007812], "style": "style-4", "roles": ["room-marker-paint-context"], "items": [
    {"itemIndex": 0, "command": ["re", [386.4590148925781, 172.552001953125, 387.3940124511719, 173.50100708007812], 1]}
  ] },
  { "pathIndex": 52294, "seqno": 52294, "boundsPt": [385.9849853515625, 134.37799072265625, 387.86700439453125, 136.12701416015625], "style": "style-3", "roles": ["room-marker-paint-context"], "items": [
    {"itemIndex": 0, "command": ["re", [386.4590148925781, 134.73199462890625, 387.3940124511719, 135.68099975585938], -1]},
    {"itemIndex": 1, "command": ["c", [387.3940124511719, 134.32400512695312], [387.7200012207031, 134.43301391601562], [387.86700439453125, 134.71701049804688], [387.86700439453125, 135.20498657226562]]},
    {"itemIndex": 2, "command": ["c", [387.86700439453125, 135.20498657226562], [387.86700439453125, 135.78799438476562], [387.6650085449219, 136.07199096679688], [387.16400146484375, 136.12701416015625]]},
    {"itemIndex": 3, "command": ["l", [387.16400146484375, 136.12701416015625], [386.7030029296875, 136.12701416015625]]},
    {"itemIndex": 4, "command": ["c", [386.7030029296875, 136.12701416015625], [386.18701171875, 136.07199096679688], [385.9849853515625, 135.78799438476562], [385.9849853515625, 135.20498657226562]]},
    {"itemIndex": 5, "command": ["c", [385.9849853515625, 135.20498657226562], [385.9849853515625, 134.7860107421875], [386.093994140625, 134.51400756835938], [386.33599853515625, 134.37799072265625]]},
    {"itemIndex": 6, "command": ["l", [386.33599853515625, 134.37799072265625], [387.3940124511719, 134.37799072265625]]},
    {"itemIndex": 7, "command": ["l", [387.3940124511719, 134.37799072265625], [387.3940124511719, 134.32400512695312]]}
  ] },
  { "pathIndex": 52295, "seqno": 52295, "boundsPt": [386.4590148925781, 134.72998046875, 387.3940124511719, 135.67898559570312], "style": "style-4", "roles": ["room-marker-paint-context"], "items": [
    {"itemIndex": 0, "command": ["re", [386.4590148925781, 134.72998046875, 387.3940124511719, 135.67898559570312], 1]}
  ] },
  { "pathIndex": 52303, "seqno": 52303, "boundsPt": [452.7497863769531, 128.10519409179688, 458.22479248046875, 133.57919311523438], "style": "style-4", "roles": ["corridor-column-context"], "items": [
    {"itemIndex": 0, "command": ["c", [456.1528015136719, 128.57919311523438], [457.7518005371094, 129.04019165039062], [458.22479248046875, 129.90719604492188], [457.7518005371094, 131.50619506835938]]},
    {"itemIndex": 1, "command": ["c", [457.7518005371094, 131.50619506835938], [457.2908020019531, 133.1191864013672], [456.42279052734375, 133.57919311523438], [454.8247985839844, 133.1191864013672]]},
    {"itemIndex": 2, "command": ["c", [454.8247985839844, 133.1191864013672], [453.2257995605469, 132.64419555664062], [452.7497863769531, 131.79119873046875], [453.2257995605469, 130.17819213867188]]},
    {"itemIndex": 3, "command": ["c", [453.2257995605469, 130.17819213867188], [453.6867980957031, 128.57919311523438], [454.55279541015625, 128.10519409179688], [456.1528015136719, 128.57919311523438]]}
  ] },
  { "pathIndex": 52306, "seqno": 52306, "boundsPt": [444.3490905761719, 116.19358825683594, 444.9320983886719, 117.15558624267578], "style": "style-3", "roles": ["north-vestibule-wall-or-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [444.9320983886719, 116.24758911132812], [444.8100891113281, 117.15558624267578]]},
    {"itemIndex": 1, "command": ["l", [444.8100891113281, 117.15558624267578], [444.3490905761719, 117.08758544921875]]},
    {"itemIndex": 2, "command": ["l", [444.3490905761719, 117.08758544921875], [444.4560852050781, 116.23458862304688]]},
    {"itemIndex": 3, "command": ["l", [444.4560852050781, 116.23458862304688], [444.4560852050781, 116.19358825683594]]},
    {"itemIndex": 4, "command": ["l", [444.4560852050781, 116.19358825683594], [444.9320983886719, 116.24758911132812]]}
  ] },
  { "pathIndex": 52307, "seqno": 52307, "boundsPt": [442.05828857421875, 133.90460205078125, 442.64129638671875, 134.86659240722656], "style": "style-3", "roles": ["north-vestibule-wall-or-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [442.64129638671875, 133.97259521484375], [442.519287109375, 134.86659240722656]]},
    {"itemIndex": 1, "command": ["l", [442.519287109375, 134.86659240722656], [442.05828857421875, 134.81259155273438]]},
    {"itemIndex": 2, "command": ["l", [442.05828857421875, 134.81259155273438], [442.16729736328125, 133.90460205078125]]},
    {"itemIndex": 3, "command": ["l", [442.16729736328125, 133.90460205078125], [442.64129638671875, 133.97259521484375]]}
  ] },
  { "pathIndex": 52308, "seqno": 52308, "boundsPt": [436.01519775390625, 183.12249755859375, 441.48919677734375, 188.59649658203125], "style": "style-4", "roles": ["corridor-column-context"], "items": [
    {"itemIndex": 0, "command": ["c", [439.41619873046875, 183.59649658203125], [441.01519775390625, 184.0574951171875], [441.48919677734375, 184.92449951171875], [441.01519775390625, 186.52349853515625]]},
    {"itemIndex": 1, "command": ["c", [441.01519775390625, 186.52349853515625], [440.54119873046875, 188.12249755859375], [439.68719482421875, 188.59649658203125], [438.0892028808594, 188.12249755859375]]},
    {"itemIndex": 2, "command": ["c", [438.0892028808594, 188.12249755859375], [436.4751892089844, 187.6614990234375], [436.01519775390625, 186.79449462890625], [436.4751892089844, 185.19549560546875]]},
    {"itemIndex": 3, "command": ["c", [436.4751892089844, 185.19549560546875], [436.9501953125, 183.59649658203125], [437.8052062988281, 183.12249755859375], [439.41619873046875, 183.59649658203125]]}
  ] },
  { "pathIndex": 52309, "seqno": 52309, "boundsPt": [433.0872802734375, 114.7431869506836, 433.6702880859375, 115.70518493652344], "style": "style-3", "roles": ["north-vestibule-wall-or-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [433.6702880859375, 114.81118774414062], [433.6702880859375, 114.85218811035156]]},
    {"itemIndex": 1, "command": ["l", [433.6702880859375, 114.85218811035156], [433.5622863769531, 115.70518493652344]]},
    {"itemIndex": 2, "command": ["l", [433.5622863769531, 115.70518493652344], [433.0872802734375, 115.65118408203125]]},
    {"itemIndex": 3, "command": ["l", [433.0872802734375, 115.65118408203125], [433.20928955078125, 114.7431869506836]]},
    {"itemIndex": 4, "command": ["l", [433.20928955078125, 114.7431869506836], [433.6702880859375, 114.81118774414062]]}
  ] },
  { "pathIndex": 52310, "seqno": 52310, "boundsPt": [430.7978820800781, 132.4681854248047, 431.3808898925781, 133.43019104003906], "style": "style-3", "roles": ["north-vestibule-wall-or-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [431.3808898925781, 132.52218627929688], [431.27288818359375, 133.43019104003906]]},
    {"itemIndex": 1, "command": ["l", [431.27288818359375, 133.43019104003906], [430.7978820800781, 133.3621826171875]]},
    {"itemIndex": 2, "command": ["l", [430.7978820800781, 133.3621826171875], [430.9198913574219, 132.4681854248047]]},
    {"itemIndex": 3, "command": ["l", [430.9198913574219, 132.4681854248047], [431.3808898925781, 132.52218627929688]]}
  ] },
  { "pathIndex": 52311, "seqno": 52311, "boundsPt": [425.5538024902344, 112.08741760253906, 430.98779296875, 134.92041015625], "style": "style-3", "roles": ["north-vestibule-wall-or-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [430.98779296875, 112.41241455078125], [430.7308044433594, 114.43141174316406]]},
    {"itemIndex": 1, "command": ["l", [430.7308044433594, 114.43141174316406], [430.6087951660156, 115.326416015625]]},
    {"itemIndex": 2, "command": ["l", [430.6087951660156, 115.326416015625], [428.45379638671875, 132.1564178466797]]},
    {"itemIndex": 3, "command": ["l", [428.45379638671875, 132.1564178466797], [428.3457946777344, 133.0504150390625]]},
    {"itemIndex": 4, "command": ["l", [428.3457946777344, 133.0504150390625], [428.101806640625, 134.92041015625]]},
    {"itemIndex": 5, "command": ["l", [428.101806640625, 134.92041015625], [425.5538024902344, 134.5954132080078]]},
    {"itemIndex": 6, "command": ["l", [425.5538024902344, 134.5954132080078], [425.67578125, 133.66041564941406]]},
    {"itemIndex": 7, "command": ["l", [425.67578125, 133.66041564941406], [425.716796875, 133.44342041015625]]},
    {"itemIndex": 8, "command": ["l", [425.716796875, 133.44342041015625], [425.7027893066406, 133.44342041015625]]},
    {"itemIndex": 9, "command": ["l", [425.7027893066406, 133.44342041015625], [425.9057922363281, 131.79042053222656]]},
    {"itemIndex": 10, "command": ["l", [425.9057922363281, 131.79042053222656], [425.9197998046875, 131.79042053222656]]},
    {"itemIndex": 11, "command": ["l", [425.9197998046875, 131.79042053222656], [425.9468078613281, 131.5734100341797]]},
    {"itemIndex": 12, "command": ["l", [425.9468078613281, 131.5734100341797], [425.9468078613281, 131.54641723632812]]},
    {"itemIndex": 13, "command": ["l", [425.9468078613281, 131.54641723632812], [426.0278015136719, 131.54641723632812]]},
    {"itemIndex": 14, "command": ["l", [426.0278015136719, 131.54641723632812], [426.393798828125, 128.701416015625]]},
    {"itemIndex": 15, "command": ["l", [426.393798828125, 128.701416015625], [426.31280517578125, 128.68740844726562]]},
    {"itemIndex": 16, "command": ["l", [426.31280517578125, 128.68740844726562], [426.31280517578125, 128.66041564941406]]},
    {"itemIndex": 17, "command": ["l", [426.31280517578125, 128.66041564941406], [426.3258056640625, 128.66041564941406]]},
    {"itemIndex": 18, "command": ["l", [426.3258056640625, 128.66041564941406], [426.352783203125, 128.44342041015625]]},
    {"itemIndex": 19, "command": ["l", [426.352783203125, 128.44342041015625], [426.33978271484375, 128.44342041015625]]},
    {"itemIndex": 20, "command": ["l", [426.33978271484375, 128.44342041015625], [426.8277893066406, 124.63541412353516]]},
    {"itemIndex": 21, "command": ["l", [426.8277893066406, 124.63541412353516], [426.9087829589844, 123.9714126586914]]},
    {"itemIndex": 22, "command": ["l", [426.9087829589844, 123.9714126586914], [426.92279052734375, 123.9714126586914]]},
    {"itemIndex": 23, "command": ["l", [426.92279052734375, 123.9714126586914], [426.9497985839844, 123.7544174194336]]},
    {"itemIndex": 24, "command": ["l", [426.9497985839844, 123.7544174194336], [426.935791015625, 123.7544174194336]]},
    {"itemIndex": 25, "command": ["l", [426.935791015625, 123.7544174194336], [427.0037841796875, 123.2264175415039]]},
    {"itemIndex": 26, "command": ["l", [427.0037841796875, 123.2264175415039], [427.3157958984375, 120.84141540527344]]},
    {"itemIndex": 27, "command": ["l", [427.3157958984375, 120.84141540527344], [427.32879638671875, 120.84141540527344]]},
    {"itemIndex": 28, "command": ["l", [427.32879638671875, 120.84141540527344], [427.3558044433594, 120.6244125366211]]},
    {"itemIndex": 29, "command": ["l", [427.3558044433594, 120.6244125366211], [427.3428039550781, 120.6244125366211]]},
    {"itemIndex": 30, "command": ["l", [427.3428039550781, 120.6244125366211], [427.5597839355469, 118.9714126586914]]},
    {"itemIndex": 31, "command": ["l", [427.5597839355469, 118.9714126586914], [427.5867919921875, 118.7544174194336]]},
    {"itemIndex": 32, "command": ["l", [427.5867919921875, 118.7544174194336], [427.5867919921875, 118.7274169921875]]},
    {"itemIndex": 33, "command": ["l", [427.5867919921875, 118.7274169921875], [427.66778564453125, 118.74041748046875]]},
    {"itemIndex": 34, "command": ["l", [427.66778564453125, 118.74041748046875], [428.0337829589844, 115.88141632080078]]},
    {"itemIndex": 35, "command": ["l", [428.0337829589844, 115.88141632080078], [427.9517822265625, 115.86841583251953]]},
    {"itemIndex": 36, "command": ["l", [427.9517822265625, 115.86841583251953], [427.9517822265625, 115.84041595458984]]},
    {"itemIndex": 37, "command": ["l", [427.9517822265625, 115.84041595458984], [427.9657897949219, 115.84041595458984]]},
    {"itemIndex": 38, "command": ["l", [427.9657897949219, 115.84041595458984], [427.9927978515625, 115.6244125366211]]},
    {"itemIndex": 39, "command": ["l", [427.9927978515625, 115.6244125366211], [427.97979736328125, 115.6244125366211]]},
    {"itemIndex": 40, "command": ["l", [427.97979736328125, 115.6244125366211], [428.1947937011719, 113.97041320800781]]},
    {"itemIndex": 41, "command": ["l", [428.1947937011719, 113.97041320800781], [428.20977783203125, 113.97041320800781]]},
    {"itemIndex": 42, "command": ["l", [428.20977783203125, 113.97041320800781], [428.2367858886719, 113.7544174194336]]},
    {"itemIndex": 43, "command": ["l", [428.2367858886719, 113.7544174194336], [428.2237854003906, 113.7544174194336]]},
    {"itemIndex": 44, "command": ["l", [428.2237854003906, 113.7544174194336], [428.4397888183594, 112.08741760253906]]},
    {"itemIndex": 45, "command": ["l", [428.4397888183594, 112.08741760253906], [430.98779296875, 112.41241455078125]]}
  ] },
  { "pathIndex": 52312, "seqno": 52312, "boundsPt": [298.2674255371094, 67.62528991699219, 419.1034240722656, 122.11528778076172], "style": "style-3", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [306.3304138183594, 82.64028930664062], [305.8014221191406, 80.82428741455078]]},
    {"itemIndex": 1, "command": ["l", [305.8014221191406, 80.82428741455078], [304.8934020996094, 81.09529113769531]]},
    {"itemIndex": 2, "command": ["l", [304.8934020996094, 81.09529113769531], [305.42242431640625, 82.8982925415039]]},
    {"itemIndex": 3, "command": ["l", [305.42242431640625, 82.8982925415039], [306.3304138183594, 82.64028930664062]]},
    {"itemIndex": 4, "command": ["l", [299.7033996582031, 79.02229309082031], [299.50042724609375, 78.48028564453125]]},
    {"itemIndex": 5, "command": ["c", [299.50042724609375, 78.48028564453125], [307.87542724609375, 75.2682876586914], [316.34442138671875, 72.97828674316406], [325.19342041015625, 71.52828979492188]]},
    {"itemIndex": 6, "command": ["c", [325.19342041015625, 71.52828979492188], [349.0574035644531, 67.62528991699219], [370.1034240722656, 69.72628784179688], [392.47540283203125, 78.27729034423828]]},
    {"itemIndex": 7, "command": ["c", [392.47540283203125, 78.27729034423828], [392.99041748046875, 78.45329284667969], [393.4914245605469, 78.65628814697266], [394.00640869140625, 78.85929107666016]]},
    {"itemIndex": 8, "command": ["c", [394.00640869140625, 78.85929107666016], [394.1964111328125, 78.94129180908203], [394.3994140625, 79.00828552246094], [394.58941650390625, 79.09028625488281]]},
    {"itemIndex": 9, "command": ["c", [394.58941650390625, 79.09028625488281], [409.6444091796875, 84.7682876586914], [416.1494140625, 93.06128692626953], [418.1134033203125, 109.0242919921875]]},
    {"itemIndex": 10, "command": ["c", [418.1134033203125, 109.0242919921875], [418.5884094238281, 113.23928833007812], [418.8994140625, 117.45329284667969], [419.076416015625, 121.69429016113281]]},
    {"itemIndex": 11, "command": ["c", [419.076416015625, 121.69429016113281], [419.08941650390625, 121.83029174804688], [419.1034240722656, 121.97929382324219], [419.1034240722656, 122.11528778076172]]},
    {"itemIndex": 12, "command": ["l", [419.1034240722656, 122.11528778076172], [417.6664123535156, 121.93829345703125]]},
    {"itemIndex": 13, "command": ["l", [417.6664123535156, 121.93829345703125], [415.4994201660156, 121.7492904663086]]},
    {"itemIndex": 14, "command": ["l", [415.4994201660156, 121.7492904663086], [414.6444091796875, 121.64028930664062]]},
    {"itemIndex": 15, "command": ["l", [414.6444091796875, 121.64028930664062], [414.6444091796875, 121.60028839111328]]},
    {"itemIndex": 16, "command": ["l", [414.6444091796875, 121.60028839111328], [414.6584167480469, 121.5452880859375]]},
    {"itemIndex": 17, "command": ["l", [414.6584167480469, 121.5452880859375], [414.71240234375, 121.13928985595703]]},
    {"itemIndex": 18, "command": ["l", [414.71240234375, 121.13928985595703], [414.71240234375, 121.0712890625]]},
    {"itemIndex": 19, "command": ["l", [414.71240234375, 121.0712890625], [413.77740478515625, 120.94928741455078]]},
    {"itemIndex": 20, "command": ["l", [413.77740478515625, 120.94928741455078], [413.70941162109375, 120.00128936767578]]},
    {"itemIndex": 21, "command": ["l", [413.70941162109375, 120.00128936767578], [412.76141357421875, 120.08229064941406]]},
    {"itemIndex": 22, "command": ["c", [412.76141357421875, 120.08229064941406], [412.76141357421875, 120.00128936767578], [412.7474060058594, 119.9192886352539], [412.7474060058594, 119.83828735351562]]},
    {"itemIndex": 23, "command": ["c", [412.7474060058594, 119.83828735351562], [412.72039794921875, 119.36428833007812], [412.69342041015625, 118.90328979492188], [412.6664123535156, 118.42929077148438]]},
    {"itemIndex": 24, "command": ["c", [412.6664123535156, 118.42929077148438], [412.639404296875, 117.96829223632812], [412.6124267578125, 117.49429321289062], [412.5714111328125, 117.03329467773438]]},
    {"itemIndex": 25, "command": ["c", [412.5714111328125, 117.03329467773438], [412.5444030761719, 116.68128967285156], [412.5303955078125, 116.32829284667969], [412.50543212890625, 115.97628784179688]]},
    {"itemIndex": 26, "command": ["c", [412.50543212890625, 115.97628784179688], [412.49041748046875, 115.93528747558594], [412.49041748046875, 115.90829467773438], [412.49041748046875, 115.86729431152344]]},
    {"itemIndex": 27, "command": ["c", [412.49041748046875, 115.86729431152344], [412.49041748046875, 115.78628540039062], [412.4764099121094, 115.70529174804688], [412.4764099121094, 115.6242904663086]]},
    {"itemIndex": 28, "command": ["c", [412.4764099121094, 115.6242904663086], [412.4634094238281, 115.46128845214844], [412.4504089355469, 115.31228637695312], [412.4364013671875, 115.1492919921875]]},
    {"itemIndex": 29, "command": ["c", [412.4364013671875, 115.1492919921875], [412.4084167480469, 114.83828735351562], [412.38140869140625, 114.53929138183594], [412.35443115234375, 114.22828674316406]]},
    {"itemIndex": 30, "command": ["c", [412.35443115234375, 114.22828674316406], [412.3414306640625, 113.9972915649414], [412.3144226074219, 113.75428771972656], [412.3004150390625, 113.52328491210938]]},
    {"itemIndex": 31, "command": ["c", [412.3004150390625, 113.52328491210938], [412.2734069824219, 113.29328918457031], [412.2593994140625, 113.06228637695312], [412.232421875, 112.83229064941406]]},
    {"itemIndex": 32, "command": ["c", [412.232421875, 112.83229064941406], [412.2054138183594, 112.58828735351562], [412.1924133300781, 112.35829162597656], [412.1664123535156, 112.12728881835938]]},
    {"itemIndex": 33, "command": ["c", [412.1664123535156, 112.12728881835938], [412.15142822265625, 112.00528717041016], [412.1374206542969, 111.89729309082031], [412.1374206542969, 111.7752914428711]]},
    {"itemIndex": 34, "command": ["c", [412.1374206542969, 111.7752914428711], [412.1244201660156, 111.66728973388672], [412.1124267578125, 111.5452880859375], [412.097412109375, 111.42329406738281]]},
    {"itemIndex": 35, "command": ["c", [412.097412109375, 111.42329406738281], [412.0834045410156, 111.31428527832031], [412.0704040527344, 111.19229125976562], [412.0574035644531, 111.08428955078125]]},
    {"itemIndex": 36, "command": ["c", [412.0574035644531, 111.08428955078125], [412.0574035644531, 110.96228790283203], [412.04241943359375, 110.84028625488281], [412.0294189453125, 110.73228454589844]]},
    {"itemIndex": 37, "command": ["c", [412.0294189453125, 110.73228454589844], [412.0154113769531, 110.61029052734375], [412.0024108886719, 110.50128936767578], [411.9884033203125, 110.37928771972656]]},
    {"itemIndex": 38, "command": ["c", [411.9884033203125, 110.37928771972656], [411.97540283203125, 110.25729370117188], [411.96142578125, 110.1492919921875], [411.94842529296875, 110.02729034423828]]},
    {"itemIndex": 39, "command": ["c", [411.94842529296875, 110.02729034423828], [411.9344177246094, 109.9192886352539], [411.9214172363281, 109.79728698730469], [411.90740966796875, 109.68829345703125]]},
    {"itemIndex": 40, "command": ["c", [411.90740966796875, 109.68829345703125], [411.8934326171875, 109.56629180908203], [411.88043212890625, 109.44429016113281], [411.8534240722656, 109.33628845214844]]},
    {"itemIndex": 41, "command": ["c", [411.8534240722656, 109.33628845214844], [411.83941650390625, 109.21428680419922], [411.8274230957031, 109.10528564453125], [411.8124084472656, 108.98429107666016]]},
    {"itemIndex": 42, "command": ["c", [411.8124084472656, 108.98429107666016], [411.7994079589844, 108.87528991699219], [411.7734069824219, 108.75328826904297], [411.7584228515625, 108.6452865600586]]},
    {"itemIndex": 43, "command": ["c", [411.7584228515625, 108.6452865600586], [411.7444152832031, 108.52328491210938], [411.71942138671875, 108.40129089355469], [411.70440673828125, 108.29228973388672]]},
    {"itemIndex": 44, "command": ["c", [411.70440673828125, 108.29228973388672], [411.67742919921875, 108.1702880859375], [411.6634216308594, 108.06228637695312], [411.63641357421875, 107.94029235839844]]},
    {"itemIndex": 45, "command": ["c", [411.63641357421875, 107.94029235839844], [411.59539794921875, 107.71028900146484], [411.555419921875, 107.47929382324219], [411.50042724609375, 107.26329040527344]]},
    {"itemIndex": 46, "command": ["c", [411.50042724609375, 107.26329040527344], [411.4604187011719, 107.03228759765625], [411.4064025878906, 106.80229187011719], [411.3514099121094, 106.5712890625]]},
    {"itemIndex": 47, "command": ["c", [411.3514099121094, 106.5712890625], [411.29742431640625, 106.34129333496094], [411.243408203125, 106.11128997802734], [411.1894226074219, 105.894287109375]]},
    {"itemIndex": 48, "command": ["c", [411.1894226074219, 105.894287109375], [411.12139892578125, 105.66329193115234], [411.0674133300781, 105.43328857421875], [410.9994201660156, 105.21629333496094]]},
    {"itemIndex": 49, "command": ["c", [410.9994201660156, 105.21629333496094], [410.972412109375, 105.12129211425781], [410.9454040527344, 105.02729034423828], [410.91839599609375, 104.93228912353516]]},
    {"itemIndex": 50, "command": ["l", [410.91839599609375, 104.93228912353516], [411.90740966796875, 104.60629272460938]]},
    {"itemIndex": 51, "command": ["l", [411.90740966796875, 104.60629272460938], [411.32440185546875, 102.80429077148438]]},
    {"itemIndex": 52, "command": ["l", [411.32440185546875, 102.80429077148438], [410.3354187011719, 103.12928771972656]]},
    {"itemIndex": 53, "command": ["c", [410.3354187011719, 103.12928771972656], [410.24041748046875, 102.88529205322266], [410.1454162597656, 102.62828826904297], [410.0514221191406, 102.38429260253906]]},
    {"itemIndex": 54, "command": ["c", [410.0514221191406, 102.38429260253906], [409.99639892578125, 102.2212905883789], [409.9294128417969, 102.05928802490234], [409.8614196777344, 101.89628601074219]]},
    {"itemIndex": 55, "command": ["c", [409.8614196777344, 101.89628601074219], [409.7794189453125, 101.69329071044922], [409.6864013671875, 101.50328826904297], [409.6034240722656, 101.30029296875]]},
    {"itemIndex": 56, "command": ["c", [409.6034240722656, 101.30029296875], [409.5084228515625, 101.0702896118164], [409.40142822265625, 100.83928680419922], [409.29241943359375, 100.60929107666016]]},
    {"itemIndex": 57, "command": ["c", [409.29241943359375, 100.60929107666016], [409.0884094238281, 100.17529296875], [408.8854064941406, 99.75528717041016], [408.67041015625, 99.34928894042969]]},
    {"itemIndex": 58, "command": ["c", [408.67041015625, 99.34928894042969], [408.451416015625, 98.92929077148438], [408.2214050292969, 98.52229309082031], [407.992431640625, 98.11628723144531]]},
    {"itemIndex": 59, "command": ["c", [407.992431640625, 98.11628723144531], [407.7474060058594, 97.70928955078125], [407.50341796875, 97.31629180908203], [407.2593994140625, 96.92328643798828]]},
    {"itemIndex": 60, "command": ["c", [407.2593994140625, 96.92328643798828], [407.0024108886719, 96.53028869628906], [406.73040771484375, 96.13729095458984], [406.45941162109375, 95.75828552246094]]},
    {"itemIndex": 61, "command": ["c", [406.45941162109375, 95.75828552246094], [406.18841552734375, 95.37828826904297], [405.9044189453125, 94.9992904663086], [405.62139892578125, 94.63328552246094]]},
    {"itemIndex": 62, "command": ["c", [405.62139892578125, 94.63328552246094], [405.33642578125, 94.26728820800781], [405.03741455078125, 93.90129089355469], [404.72540283203125, 93.54928588867188]]},
    {"itemIndex": 63, "command": ["c", [404.72540283203125, 93.54928588867188], [404.4134216308594, 93.1962890625], [404.1014099121094, 92.84429168701172], [403.7904052734375, 92.50528717041016]]},
    {"itemIndex": 64, "command": ["c", [403.7904052734375, 92.50528717041016], [403.4654235839844, 92.16728973388672], [403.12640380859375, 91.84129333496094], [402.78741455078125, 91.51628875732422]]},
    {"itemIndex": 65, "command": ["c", [402.78741455078125, 91.51628875732422], [402.46240234375, 91.19129180908203], [402.11041259765625, 90.86628723144531], [401.7574157714844, 90.55429077148438]]},
    {"itemIndex": 66, "command": ["c", [401.7574157714844, 90.55429077148438], [401.4053955078125, 90.25628662109375], [401.05340576171875, 89.94429016113281], [400.6874084472656, 89.66028594970703]]},
    {"itemIndex": 67, "command": ["c", [400.6874084472656, 89.66028594970703], [400.3214111328125, 89.36128997802734], [399.94140625, 89.07728576660156], [399.5624084472656, 88.80628967285156]]},
    {"itemIndex": 68, "command": ["c", [399.5624084472656, 88.80628967285156], [399.3594055175781, 88.65728759765625], [399.14239501953125, 88.50828552246094], [398.9254150390625, 88.3722915649414]]},
    {"itemIndex": 69, "command": ["l", [398.9254150390625, 88.3722915649414], [399.5084228515625, 87.50528717041016]]},
    {"itemIndex": 70, "command": ["l", [399.5084228515625, 87.50528717041016], [398.722412109375, 86.97628784179688]]},
    {"itemIndex": 71, "command": ["l", [398.722412109375, 86.97628784179688], [398.139404296875, 87.84429168701172]]},
    {"itemIndex": 72, "command": ["c", [398.139404296875, 87.84429168701172], [397.8414306640625, 87.64028930664062], [397.5294189453125, 87.45128631591797], [397.2184143066406, 87.26129150390625]]},
    {"itemIndex": 73, "command": ["c", [397.2184143066406, 87.26129150390625], [396.8124084472656, 87.03128814697266], [396.4044189453125, 86.80029296875], [395.9984130859375, 86.5702896118164]]},
    {"itemIndex": 74, "command": ["c", [395.9984130859375, 86.5702896118164], [395.7814025878906, 86.46128845214844], [395.57843017578125, 86.35328674316406], [395.37542724609375, 86.25828552246094]]},
    {"itemIndex": 75, "command": ["c", [395.37542724609375, 86.25828552246094], [395.1584167480469, 86.1502914428711], [394.9554138183594, 86.04129028320312], [394.7384033203125, 85.9472885131836]]},
    {"itemIndex": 76, "command": ["c", [394.7384033203125, 85.9472885131836], [394.6294250488281, 85.89228820800781], [394.52142333984375, 85.83828735351562], [394.4264221191406, 85.79728698730469]]},
    {"itemIndex": 77, "command": ["c", [394.4264221191406, 85.79728698730469], [394.31842041015625, 85.7432861328125], [394.2104187011719, 85.70329284667969], [394.1024169921875, 85.6482925415039]]},
    {"itemIndex": 78, "command": ["c", [394.1024169921875, 85.6482925415039], [393.992431640625, 85.59429168701172], [393.8843994140625, 85.55429077148438], [393.77642822265625, 85.51329040527344]]},
    {"itemIndex": 79, "command": ["c", [393.77642822265625, 85.51329040527344], [393.66741943359375, 85.45928955078125], [393.5594177246094, 85.41828918457031], [393.4504089355469, 85.36428833007812]]},
    {"itemIndex": 80, "command": ["c", [393.4504089355469, 85.36428833007812], [393.35540771484375, 85.32328796386719], [393.2474060058594, 85.269287109375], [393.1404113769531, 85.22828674316406]]},
    {"itemIndex": 81, "command": ["c", [393.1404113769531, 85.22828674316406], [393.0303955078125, 85.18828582763672], [392.92242431640625, 85.14729309082031], [392.81341552734375, 85.09329223632812]]},
    {"itemIndex": 82, "command": ["c", [392.81341552734375, 85.09329223632812], [392.7054138183594, 85.05229187011719], [392.597412109375, 85.01129150390625], [392.4884033203125, 84.9712905883789]]},
    {"itemIndex": 83, "command": ["c", [392.4884033203125, 84.9712905883789], [392.38043212890625, 84.91728973388672], [392.2584228515625, 84.87628936767578], [392.1494140625, 84.83528900146484]]},
    {"itemIndex": 84, "command": ["c", [392.1494140625, 84.83528900146484], [392.0414123535156, 84.7952880859375], [391.93341064453125, 84.75428771972656], [391.82440185546875, 84.71328735351562]]},
    {"itemIndex": 85, "command": ["c", [391.82440185546875, 84.71328735351562], [391.7164306640625, 84.65928649902344], [391.607421875, 84.6192855834961], [391.50042724609375, 84.57829284667969]]},
    {"itemIndex": 86, "command": ["c", [391.50042724609375, 84.57829284667969], [391.39239501953125, 84.53729248046875], [391.28240966796875, 84.4972915649414], [391.1744079589844, 84.45629119873047]]},
    {"itemIndex": 87, "command": ["c", [391.1744079589844, 84.45629119873047], [391.0654296875, 84.41529083251953], [390.9573974609375, 84.37528991699219], [390.84942626953125, 84.33428955078125]]},
    {"itemIndex": 88, "command": ["c", [390.84942626953125, 84.33428955078125], [390.74041748046875, 84.29328918457031], [390.6324157714844, 84.25328826904297], [390.5104064941406, 84.21228790283203]]},
    {"itemIndex": 89, "command": ["c", [390.5104064941406, 84.21228790283203], [390.40142822265625, 84.15828704833984], [390.29339599609375, 84.1172866821289], [390.1844177246094, 84.07728576660156]]},
    {"itemIndex": 90, "command": ["c", [390.1844177246094, 84.07728576660156], [389.9684143066406, 83.99529266357422], [389.7524108886719, 83.91429138183594], [389.534423828125, 83.83329010009766]]},
    {"itemIndex": 91, "command": ["c", [389.534423828125, 83.83329010009766], [389.3044128417969, 83.75128936767578], [389.08740234375, 83.6702880859375], [388.87042236328125, 83.58928680419922]]},
    {"itemIndex": 92, "command": ["c", [388.87042236328125, 83.58928680419922], [388.6534118652344, 83.50728607177734], [388.4364013671875, 83.4262924194336], [388.2064208984375, 83.35829162597656]]},
    {"itemIndex": 93, "command": ["c", [388.2064208984375, 83.35829162597656], [387.7744140625, 83.1962890625], [387.3274230957031, 83.03328704833984], [386.89239501953125, 82.88429260253906]]},
    {"itemIndex": 94, "command": ["c", [386.89239501953125, 82.88429260253906], [386.44439697265625, 82.73529052734375], [385.9974060058594, 82.58628845214844], [385.5504150390625, 82.43728637695312]]},
    {"itemIndex": 95, "command": ["c", [385.5504150390625, 82.43728637695312], [385.1164245605469, 82.28829193115234], [384.6714172363281, 82.13928985595703], [384.222412109375, 82.00328826904297]]},
    {"itemIndex": 96, "command": ["c", [384.222412109375, 82.00328826904297], [383.7754211425781, 81.85428619384766], [383.32843017578125, 81.71929168701172], [382.88043212890625, 81.58329010009766]]},
    {"itemIndex": 97, "command": ["c", [382.88043212890625, 81.58329010009766], [382.4874267578125, 81.44828796386719], [382.0814208984375, 81.32628631591797], [381.68841552734375, 81.21729278564453]]},
    {"itemIndex": 98, "command": ["l", [381.68841552734375, 81.21729278564453], [381.972412109375, 80.22828674316406]]},
    {"itemIndex": 99, "command": ["l", [381.972412109375, 80.22828674316406], [381.0654296875, 79.9712905883789]]},
    {"itemIndex": 100, "command": ["l", [381.0654296875, 79.9712905883789], [380.7803955078125, 80.96028900146484]]},
    {"itemIndex": 101, "command": ["l", [380.7803955078125, 80.96028900146484], [380.76641845703125, 80.96028900146484]]},
    {"itemIndex": 102, "command": ["c", [380.76641845703125, 80.96028900146484], [380.5774230957031, 80.89228820800781], [380.3734130859375, 80.83828735351562], [380.1844177246094, 80.78428649902344]]},
    {"itemIndex": 103, "command": ["l", [380.1844177246094, 80.78428649902344], [380.17041015625, 80.78428649902344]]},
    {"itemIndex": 104, "command": ["c", [380.17041015625, 80.78428649902344], [379.9674072265625, 80.7162857055664], [379.764404296875, 80.66229248046875], [379.5604248046875, 80.60729217529297]]},
    {"itemIndex": 105, "command": ["c", [379.5604248046875, 80.60729217529297], [379.31640625, 80.54029083251953], [379.07342529296875, 80.4722900390625], [378.82940673828125, 80.40428924560547]]},
    {"itemIndex": 106, "command": ["c", [378.82940673828125, 80.40428924560547], [377.9214172363281, 80.16028594970703], [377.013427734375, 79.91629028320312], [376.10540771484375, 79.69928741455078]]},
    {"itemIndex": 107, "command": ["c", [376.10540771484375, 79.69928741455078], [374.2894287109375, 79.25228881835938], [372.4604187011719, 78.8462905883789], [370.63043212890625, 78.46629333496094]]},
    {"itemIndex": 108, "command": ["c", [370.63043212890625, 78.46629333496094], [368.78741455078125, 78.10028839111328], [366.94439697265625, 77.7752914428711], [365.0884094238281, 77.49128723144531]]},
    {"itemIndex": 109, "command": ["c", [365.0884094238281, 77.49128723144531], [364.32940673828125, 77.36929321289062], [363.5704040527344, 77.26029205322266], [362.79840087890625, 77.16529083251953]]},
    {"itemIndex": 110, "command": ["l", [362.79840087890625, 77.16529083251953], [362.9344177246094, 76.1492919921875]]},
    {"itemIndex": 111, "command": ["l", [362.9344177246094, 76.1492919921875], [361.9984130859375, 76.02729034423828]]},
    {"itemIndex": 112, "command": ["l", [361.9984130859375, 76.02729034423828], [361.8634033203125, 77.0442886352539]]},
    {"itemIndex": 113, "command": ["c", [361.8634033203125, 77.0442886352539], [361.0904235839844, 76.94928741455078], [360.3044128417969, 76.85428619384766], [359.5184020996094, 76.77229309082031]]},
    {"itemIndex": 114, "command": ["c", [359.5184020996094, 76.77229309082031], [358.5854187011719, 76.66429138183594], [357.66241455078125, 76.58329010009766], [356.7274169921875, 76.50128936767578]]},
    {"itemIndex": 115, "command": ["c", [356.7274169921875, 76.50128936767578], [355.8323974609375, 76.4202880859375], [354.951416015625, 76.35228729248047], [354.0574035644531, 76.31228637695312]]},
    {"itemIndex": 116, "command": ["c", [354.0574035644531, 76.31228637695312], [354.00341796875, 76.29828643798828], [353.96240234375, 76.29828643798828], [353.92242431640625, 76.29828643798828]]},
    {"itemIndex": 117, "command": ["c", [353.92242431640625, 76.29828643798828], [352.9874267578125, 76.24429321289062], [352.05242919921875, 76.19029235839844], [351.1164245605469, 76.16329193115234]]},
    {"itemIndex": 118, "command": ["c", [351.1164245605469, 76.16329193115234], [350.6424255371094, 76.13529205322266], [350.1824035644531, 76.1222915649414], [349.7073974609375, 76.10829162597656]]},
    {"itemIndex": 119, "command": ["c", [349.7073974609375, 76.10829162597656], [349.24639892578125, 76.09529113769531], [348.77239990234375, 76.08129119873047], [348.29840087890625, 76.08129119873047]]},
    {"itemIndex": 120, "command": ["c", [348.29840087890625, 76.08129119873047], [347.83740234375, 76.06829071044922], [347.3634033203125, 76.06829071044922], [346.90240478515625, 76.06829071044922]]},
    {"itemIndex": 121, "command": ["c", [346.90240478515625, 76.06829071044922], [346.42840576171875, 76.05429077148438], [345.9674072265625, 76.05429077148438], [345.493408203125, 76.06829071044922]]},
    {"itemIndex": 122, "command": ["c", [345.493408203125, 76.06829071044922], [345.0334167480469, 76.06829071044922], [344.55841064453125, 76.06829071044922], [344.0834045410156, 76.08129119873047]]},
    {"itemIndex": 123, "command": ["c", [344.0834045410156, 76.08129119873047], [343.6244201660156, 76.09529113769531], [343.1484069824219, 76.09529113769531], [342.68841552734375, 76.10829162597656]]},
    {"itemIndex": 124, "command": ["c", [342.68841552734375, 76.10829162597656], [341.75341796875, 76.13529205322266], [340.81842041015625, 76.1762924194336], [339.8834228515625, 76.23028564453125]]},
    {"itemIndex": 125, "command": ["c", [339.8834228515625, 76.23028564453125], [338.0124206542969, 76.32528686523438], [336.1424255371094, 76.46128845214844], [334.27239990234375, 76.63729095458984]]},
    {"itemIndex": 126, "command": ["c", [334.27239990234375, 76.63729095458984], [334.0154113769531, 76.66429138183594], [333.77142333984375, 76.69129180908203], [333.5154113769531, 76.71829223632812]]},
    {"itemIndex": 127, "command": ["l", [333.5154113769531, 76.71829223632812], [333.4194030761719, 75.60729217529297]]},
    {"itemIndex": 128, "command": ["l", [333.4194030761719, 75.60729217529297], [332.47039794921875, 75.68828582763672]]},
    {"itemIndex": 129, "command": ["l", [332.47039794921875, 75.68828582763672], [332.57940673828125, 76.81328582763672]]},
    {"itemIndex": 130, "command": ["c", [332.57940673828125, 76.81328582763672], [332.37542724609375, 76.84028625488281], [332.1864013671875, 76.85428619384766], [331.982421875, 76.88128662109375]]},
    {"itemIndex": 131, "command": ["l", [331.982421875, 76.88128662109375], [331.9554138183594, 76.88128662109375]]},
    {"itemIndex": 132, "command": ["c", [331.9554138183594, 76.88128662109375], [329.00140380859375, 77.23329162597656], [326.07440185546875, 77.68029022216797], [323.14739990234375, 78.2222900390625]]},
    {"itemIndex": 133, "command": ["c", [323.14739990234375, 78.2222900390625], [322.9034118652344, 78.27729034423828], [322.64642333984375, 78.31729125976562], [322.40240478515625, 78.37129211425781]]},
    {"itemIndex": 134, "command": ["c", [322.40240478515625, 78.37129211425781], [322.3744201660156, 78.37129211425781], [322.347412109375, 78.37129211425781], [322.3354187011719, 78.38529205322266]]},
    {"itemIndex": 135, "command": ["c", [322.3354187011719, 78.38529205322266], [322.1444091796875, 78.4262924194336], [321.9684143066406, 78.45329284667969], [321.7784118652344, 78.4932861328125]]},
    {"itemIndex": 136, "command": ["c", [321.7784118652344, 78.4932861328125], [320.39642333984375, 78.77828979492188], [319.02740478515625, 79.07628631591797], [317.659423828125, 79.40129089355469]]},
    {"itemIndex": 137, "command": ["c", [317.659423828125, 79.40129089355469], [317.21240234375, 79.49629211425781], [316.764404296875, 79.60528564453125], [316.3174133300781, 79.71328735351562]]},
    {"itemIndex": 138, "command": ["c", [316.3174133300781, 79.71328735351562], [316.3044128417969, 79.72728729248047], [316.3044128417969, 79.72728729248047], [316.2914123535156, 79.72728729248047]]},
    {"itemIndex": 139, "command": ["c", [316.2914123535156, 79.72728729248047], [315.82940673828125, 79.83528900146484], [315.3824157714844, 79.95729064941406], [314.9214172363281, 80.07929229736328]]},
    {"itemIndex": 140, "command": ["c", [314.9214172363281, 80.07929229736328], [314.0954284667969, 80.28228759765625], [313.29541015625, 80.51329040527344], [312.46942138671875, 80.7432861328125]]},
    {"itemIndex": 141, "command": ["c", [312.46942138671875, 80.7432861328125], [312.3874206542969, 80.7702865600586], [312.29241943359375, 80.78428649902344], [312.21142578125, 80.81128692626953]]},
    {"itemIndex": 142, "command": ["c", [312.21142578125, 80.81128692626953], [311.7794189453125, 80.93328857421875], [311.357421875, 81.05529022216797], [310.9244079589844, 81.19029235839844]]},
    {"itemIndex": 143, "command": ["c", [310.9244079589844, 81.19029235839844], [310.910400390625, 81.19029235839844], [310.8834228515625, 81.20429229736328], [310.87139892578125, 81.20429229736328]]},
    {"itemIndex": 144, "command": ["c", [310.87139892578125, 81.20429229736328], [310.4244079589844, 81.33928680419922], [309.96240234375, 81.47528839111328], [309.51641845703125, 81.61029052734375]]},
    {"itemIndex": 145, "command": ["c", [309.51641845703125, 81.61029052734375], [309.3794250488281, 81.65129089355469], [309.2574157714844, 81.69229125976562], [309.1234130859375, 81.73229217529297]]},
    {"itemIndex": 146, "command": ["c", [309.1234130859375, 81.73229217529297], [308.48541259765625, 81.93528747558594], [307.8614196777344, 82.13928985595703], [307.22442626953125, 82.34229278564453]]},
    {"itemIndex": 147, "command": ["c", [307.22442626953125, 82.34229278564453], [307.1024169921875, 82.38328552246094], [306.9674072265625, 82.42328643798828], [306.8454284667969, 82.47728729248047]]},
    {"itemIndex": 148, "command": ["c", [306.8454284667969, 82.47728729248047], [305.9504089355469, 82.76229095458984], [305.0704040527344, 83.07428741455078], [304.1894226074219, 83.38529205322266]]},
    {"itemIndex": 149, "command": ["l", [304.1894226074219, 83.38529205322266], [304.94842529296875, 85.4992904663086]]},
    {"itemIndex": 150, "command": ["c", [304.94842529296875, 85.4992904663086], [305.39642333984375, 85.35028839111328], [305.8424072265625, 85.18828582763672], [306.2894287109375, 85.03929138183594]]},
    {"itemIndex": 151, "command": ["c", [306.2894287109375, 85.03929138183594], [306.6014099121094, 84.93029022216797], [306.9134216308594, 84.8222885131836], [307.22442626953125, 84.71328735351562]]},
    {"itemIndex": 152, "command": ["l", [307.22442626953125, 84.71328735351562], [307.22442626953125, 87.92529296875]]},
    {"itemIndex": 153, "command": ["l", [307.22442626953125, 87.92529296875], [307.22442626953125, 94.40328979492188]]},
    {"itemIndex": 154, "command": ["l", [307.22442626953125, 94.40328979492188], [307.22442626953125, 99.33528900146484]]},
    {"itemIndex": 155, "command": ["l", [307.22442626953125, 99.33528900146484], [303.4034118652344, 91.13729095458984]]},
    {"itemIndex": 156, "command": ["l", [303.4034118652344, 91.13729095458984], [305.8564147949219, 89.70028686523438]]},
    {"itemIndex": 157, "command": ["l", [305.8564147949219, 89.70028686523438], [303.4034118652344, 89.70028686523438]]},
    {"itemIndex": 158, "command": ["l", [303.4034118652344, 89.70028686523438], [302.8744201660156, 90.01229095458984]]},
    {"itemIndex": 159, "command": ["l", [302.8744201660156, 90.01229095458984], [299.5544128417969, 82.88429260253906]]},
    {"itemIndex": 160, "command": ["l", [299.5544128417969, 82.88429260253906], [298.2674255371094, 79.5912857055664]]},
    {"itemIndex": 161, "command": ["c", [298.2674255371094, 79.5912857055664], [298.7414245605469, 79.38829040527344], [299.2164001464844, 79.19828796386719], [299.7033996582031, 79.02229309082031]]}
  ] },
  { "pathIndex": 52313, "seqno": 52313, "boundsPt": [412.7611083984375, 120.00131225585938, 413.7781066894531, 121.0173110961914], "style": "style-3", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [413.7101135253906, 120.00131225585938], [413.7781066894531, 120.95030975341797]]},
    {"itemIndex": 1, "command": ["l", [413.7781066894531, 120.95030975341797], [412.8021240234375, 121.0173110961914]]},
    {"itemIndex": 2, "command": ["c", [412.8021240234375, 121.0173110961914], [412.8021240234375, 120.70631408691406], [412.7751159667969, 120.3943099975586], [412.7611083984375, 120.08231353759766]]},
    {"itemIndex": 3, "command": ["l", [412.7611083984375, 120.08231353759766], [413.7101135253906, 120.00131225585938]]}
  ] },
  { "pathIndex": 52314, "seqno": 52314, "boundsPt": [411.81219482421875, 120.08261108398438, 412.80218505859375, 121.08560943603516], "style": "style-3", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["c", [412.7611999511719, 120.08261108398438], [412.7742004394531, 120.39460754394531], [412.80218505859375, 120.70561218261719], [412.80218505859375, 121.01760864257812]]},
    {"itemIndex": 1, "command": ["l", [412.80218505859375, 121.01760864257812], [411.8941955566406, 121.08560943603516]]},
    {"itemIndex": 2, "command": ["l", [411.8941955566406, 121.08560943603516], [411.81219482421875, 120.1506118774414]]},
    {"itemIndex": 3, "command": ["l", [411.81219482421875, 120.1506118774414], [412.7611999511719, 120.08261108398438]]}
  ] },
  { "pathIndex": 52315, "seqno": 52315, "boundsPt": [407.7748107910156, 102.38529968261719, 412.7618103027344, 121.19429779052734], "style": "style-4", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["c", [412.476806640625, 115.62429809570312], [412.476806640625, 115.7052993774414], [412.48980712890625, 115.78730010986328], [412.48980712890625, 115.86830139160156]]},
    {"itemIndex": 1, "command": ["c", [412.48980712890625, 115.86830139160156], [412.48980712890625, 115.9093017578125], [412.48980712890625, 115.93629455566406], [412.50482177734375, 115.9762954711914]]},
    {"itemIndex": 2, "command": ["c", [412.50482177734375, 115.9762954711914], [412.5307922363281, 116.32929992675781], [412.5447998046875, 116.6812973022461], [412.5718078613281, 117.03329467773438]]},
    {"itemIndex": 3, "command": ["c", [412.5718078613281, 117.03329467773438], [412.61181640625, 117.49430084228516], [412.6398010253906, 117.96829986572266], [412.66680908203125, 118.4292984008789]]},
    {"itemIndex": 4, "command": ["c", [412.66680908203125, 118.4292984008789], [412.6938171386719, 118.9032974243164], [412.7207946777344, 119.36429595947266], [412.747802734375, 119.83829498291016]]},
    {"itemIndex": 5, "command": ["c", [412.747802734375, 119.83829498291016], [412.747802734375, 119.92029571533203], [412.7618103027344, 120.00129699707031], [412.7618103027344, 120.0822982788086]]},
    {"itemIndex": 6, "command": ["l", [412.7618103027344, 120.0822982788086], [411.81280517578125, 120.15029907226562]]},
    {"itemIndex": 7, "command": ["l", [411.81280517578125, 120.15029907226562], [411.893798828125, 121.08529663085938]]},
    {"itemIndex": 8, "command": ["l", [411.893798828125, 121.08529663085938], [411.4608154296875, 121.19429779052734]]},
    {"itemIndex": 9, "command": ["c", [411.4608154296875, 121.19429779052734], [411.216796875, 120.16429901123047], [410.8638000488281, 119.16130065917969], [410.40380859375, 118.14529418945312]]},
    {"itemIndex": 10, "command": ["l", [410.40380859375, 118.14529418945312], [410.40380859375, 118.11729431152344]]},
    {"itemIndex": 11, "command": ["l", [410.40380859375, 118.11729431152344], [410.4438171386719, 118.10430145263672]]},
    {"itemIndex": 12, "command": ["l", [410.4438171386719, 118.10430145263672], [410.3898010253906, 117.9822998046875]]},
    {"itemIndex": 13, "command": ["c", [410.3898010253906, 117.9822998046875], [410.36279296875, 117.5752944946289], [410.3358154296875, 117.1552963256836], [410.3088073730469, 116.74929809570312]]},
    {"itemIndex": 14, "command": ["c", [410.3088073730469, 116.74929809570312], [410.2677917480469, 116.28829956054688], [410.2408142089844, 115.81430053710938], [410.1997985839844, 115.34030151367188]]},
    {"itemIndex": 15, "command": ["c", [410.1997985839844, 115.34030151367188], [410.1598205566406, 114.86529541015625], [410.1188049316406, 114.404296875], [410.07781982421875, 113.9302978515625]]},
    {"itemIndex": 16, "command": ["c", [410.07781982421875, 113.9302978515625], [410.0508117675781, 113.7002944946289], [410.0378112792969, 113.456298828125], [410.01080322265625, 113.2262954711914]]},
    {"itemIndex": 17, "command": ["c", [410.01080322265625, 113.2262954711914], [409.9967956542969, 112.99530029296875], [409.9698181152344, 112.75129699707031], [409.94281005859375, 112.52130126953125]]},
    {"itemIndex": 18, "command": ["c", [409.94281005859375, 112.52130126953125], [409.9288024902344, 112.29129791259766], [409.90179443359375, 112.04729461669922], [409.87481689453125, 111.81629943847656]]},
    {"itemIndex": 19, "command": ["c", [409.87481689453125, 111.81629943847656], [409.86181640625, 111.58629608154297], [409.83380126953125, 111.34230041503906], [409.8067932128906, 111.11229705810547]]},
    {"itemIndex": 20, "command": ["c", [409.8067932128906, 111.11229705810547], [409.7528076171875, 110.63729858398438], [409.7127990722656, 110.17630004882812], [409.6448059082031, 109.70230102539062]]},
    {"itemIndex": 21, "command": ["c", [409.6448059082031, 109.70230102539062], [409.6177978515625, 109.47229766845703], [409.5768127441406, 109.24129486083984], [409.5357971191406, 108.99829864501953]]},
    {"itemIndex": 22, "command": ["c", [409.5357971191406, 108.99829864501953], [409.5088195800781, 108.76729583740234], [409.46881103515625, 108.53730010986328], [409.42779541015625, 108.3062973022461]]},
    {"itemIndex": 23, "command": ["c", [409.42779541015625, 108.3062973022461], [409.3738098144531, 108.07630157470703], [409.3327941894531, 107.84629821777344], [409.27880859375, 107.61529541015625]]},
    {"itemIndex": 24, "command": ["c", [409.27880859375, 107.61529541015625], [409.23779296875, 107.37129974365234], [409.1838073730469, 107.14129638671875], [409.12982177734375, 106.92430114746094]]},
    {"itemIndex": 25, "command": ["c", [409.12982177734375, 106.92430114746094], [409.02081298828125, 106.46329498291016], [408.8988037109375, 106.0032958984375], [408.7637939453125, 105.5562973022461]]},
    {"itemIndex": 26, "command": ["c", [408.7637939453125, 105.5562973022461], [408.6278076171875, 105.09529876708984], [408.47882080078125, 104.64830017089844], [408.3298034667969, 104.20030212402344]]},
    {"itemIndex": 27, "command": ["c", [408.3298034667969, 104.20030212402344], [408.1808166503906, 103.7532958984375], [408.00482177734375, 103.3062973022461], [407.82879638671875, 102.87229919433594]]},
    {"itemIndex": 28, "command": ["c", [407.82879638671875, 102.87229919433594], [407.8148193359375, 102.8322982788086], [407.80181884765625, 102.79129791259766], [407.7748107910156, 102.75029754638672]]},
    {"itemIndex": 29, "command": ["l", [407.7748107910156, 102.75029754638672], [410.0508117675781, 102.38529968261719]]},
    {"itemIndex": 30, "command": ["c", [410.0508117675781, 102.38529968261719], [410.14581298828125, 102.6292953491211], [410.2408142089844, 102.88629913330078], [410.3358154296875, 103.13029479980469]]},
    {"itemIndex": 31, "command": ["l", [410.3358154296875, 103.13029479980469], [409.5227966308594, 103.40129852294922]]},
    {"itemIndex": 32, "command": ["l", [409.5227966308594, 103.40129852294922], [410.1058044433594, 105.19029998779297]]},
    {"itemIndex": 33, "command": ["l", [410.1058044433594, 105.19029998779297], [410.9187927246094, 104.93229675292969]]},
    {"itemIndex": 34, "command": ["c", [410.9187927246094, 104.93229675292969], [410.94580078125, 105.02729797363281], [410.9728088378906, 105.12229919433594], [410.99981689453125, 105.21730041503906]]},
    {"itemIndex": 35, "command": ["c", [410.99981689453125, 105.21730041503906], [411.06781005859375, 105.43429565429688], [411.1217956542969, 105.66429901123047], [411.1898193359375, 105.89430236816406]]},
    {"itemIndex": 36, "command": ["c", [411.1898193359375, 105.89430236816406], [411.2438049316406, 106.11129760742188], [411.2978210449219, 106.34230041503906], [411.351806640625, 106.57229614257812]]},
    {"itemIndex": 37, "command": ["c", [411.351806640625, 106.57229614257812], [411.4057922363281, 106.80229949951172], [411.4608154296875, 107.03329467773438], [411.50079345703125, 107.26329803466797]]},
    {"itemIndex": 38, "command": ["c", [411.50079345703125, 107.26329803466797], [411.5548095703125, 107.48030090332031], [411.5957946777344, 107.71029663085938], [411.6368103027344, 107.94129943847656]]},
    {"itemIndex": 39, "command": ["c", [411.6368103027344, 107.94129943847656], [411.663818359375, 108.06330108642578], [411.67681884765625, 108.17129516601562], [411.7048034667969, 108.29329681396484]]},
    {"itemIndex": 40, "command": ["c", [411.7048034667969, 108.29329681396484], [411.7178039550781, 108.40129852294922], [411.74481201171875, 108.52330017089844], [411.7588195800781, 108.64529418945312]]},
    {"itemIndex": 41, "command": ["c", [411.7588195800781, 108.64529418945312], [411.7718200683594, 108.7542953491211], [411.7987976074219, 108.87629699707031], [411.81280517578125, 108.98429870605469]]},
    {"itemIndex": 42, "command": ["c", [411.81280517578125, 108.98429870605469], [411.82781982421875, 109.1063003540039], [411.8398132324219, 109.21429443359375], [411.85382080078125, 109.33629608154297]]},
    {"itemIndex": 43, "command": ["c", [411.85382080078125, 109.33629608154297], [411.88079833984375, 109.44529724121094], [411.893798828125, 109.56729888916016], [411.9078063964844, 109.68930053710938]]},
    {"itemIndex": 44, "command": ["c", [411.9078063964844, 109.68930053710938], [411.9208068847656, 109.79729461669922], [411.934814453125, 109.91929626464844], [411.94781494140625, 110.02729797363281]]},
    {"itemIndex": 45, "command": ["c", [411.94781494140625, 110.02729797363281], [411.9617919921875, 110.14929962158203], [411.9757995605469, 110.25830078125], [411.9888000488281, 110.38029479980469]]},
    {"itemIndex": 46, "command": ["c", [411.9888000488281, 110.38029479980469], [412.0028076171875, 110.5022964477539], [412.01580810546875, 110.61029815673828], [412.0298156738281, 110.7322998046875]]},
    {"itemIndex": 47, "command": ["c", [412.0298156738281, 110.7322998046875], [412.0428161621094, 110.84030151367188], [412.0567932128906, 110.96329498291016], [412.0567932128906, 111.08429718017578]]},
    {"itemIndex": 48, "command": ["c", [412.0567932128906, 111.08429718017578], [412.0697937011719, 111.19329833984375], [412.08380126953125, 111.31529998779297], [412.0978088378906, 111.42329406738281]]},
    {"itemIndex": 49, "command": ["c", [412.0978088378906, 111.42329406738281], [412.1108093261719, 111.54529571533203], [412.12481689453125, 111.66729736328125], [412.1378173828125, 111.77629852294922]]},
    {"itemIndex": 50, "command": ["c", [412.1378173828125, 111.77629852294922], [412.1378173828125, 111.89730072021484], [412.15179443359375, 112.00630187988281], [412.16680908203125, 112.1282958984375]]},
    {"itemIndex": 51, "command": ["c", [412.16680908203125, 112.1282958984375], [412.1918029785156, 112.3582992553711], [412.205810546875, 112.58929443359375], [412.2328186035156, 112.8322982788086]]},
    {"itemIndex": 52, "command": ["c", [412.2328186035156, 112.8322982788086], [412.2597961425781, 113.06330108642578], [412.2738037109375, 113.29329681396484], [412.3008117675781, 113.52429962158203]]},
    {"itemIndex": 53, "command": ["c", [412.3008117675781, 113.52429962158203], [412.3138122558594, 113.7542953491211], [412.3408203125, 113.99829864501953], [412.35479736328125, 114.2282943725586]]},
    {"itemIndex": 54, "command": ["c", [412.35479736328125, 114.2282943725586], [412.3818054199219, 114.54029846191406], [412.4088134765625, 114.83829498291016], [412.4358215332031, 115.15029907226562]]},
    {"itemIndex": 55, "command": ["c", [412.4358215332031, 115.15029907226562], [412.4497985839844, 115.31230163574219], [412.4627990722656, 115.46129608154297], [412.476806640625, 115.62429809570312]]}
  ] },
  { "pathIndex": 52316, "seqno": 52316, "boundsPt": [410.33648681640625, 102.80490112304688, 411.90850830078125, 104.93289947509766], "style": "style-3", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [411.32550048828125, 102.80490112304688], [411.90850830078125, 104.60690307617188]]},
    {"itemIndex": 1, "command": ["l", [411.90850830078125, 104.60690307617188], [410.9175109863281, 104.93289947509766]]},
    {"itemIndex": 2, "command": ["c", [410.9175109863281, 104.93289947509766], [410.8785095214844, 104.7968978881836], [410.8374938964844, 104.66190338134766], [410.7955017089844, 104.53990173339844]]},
    {"itemIndex": 3, "command": ["c", [410.7955017089844, 104.53990173339844], [410.7294921875, 104.30889892578125], [410.6614990234375, 104.09190368652344], [410.593505859375, 103.86190032958984]]},
    {"itemIndex": 4, "command": ["c", [410.593505859375, 103.86190032958984], [410.5115051269531, 103.6448974609375], [410.4444885253906, 103.42790222167969], [410.3634948730469, 103.1978988647461]]},
    {"itemIndex": 5, "command": ["c", [410.3634948730469, 103.1978988647461], [410.3485107421875, 103.1708984375], [410.3485107421875, 103.15689849853516], [410.33648681640625, 103.12989807128906]]},
    {"itemIndex": 6, "command": ["l", [410.33648681640625, 103.12989807128906], [411.32550048828125, 102.80490112304688]]}
  ] },
  { "pathIndex": 52317, "seqno": 52317, "boundsPt": [410.6203918457031, 154.9361114501953, 411.46038818359375, 155.7490997314453], "style": "style-3", "roles": ["east-door-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [411.46038818359375, 154.96310424804688], [411.4064025878906, 155.7490997314453]]},
    {"itemIndex": 1, "command": ["l", [411.4064025878906, 155.7490997314453], [410.6203918457031, 155.69509887695312]]},
    {"itemIndex": 2, "command": ["l", [410.6203918457031, 155.69509887695312], [410.67437744140625, 154.9361114501953]]},
    {"itemIndex": 3, "command": ["l", [410.67437744140625, 154.9361114501953], [411.46038818359375, 154.96310424804688]]}
  ] },
  { "pathIndex": 52318, "seqno": 52318, "boundsPt": [410.4300231933594, 143.26869201660156, 411.2300109863281, 143.60768127441406], "style": "style-3", "roles": ["east-door-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [411.2300109863281, 143.29568481445312], [411.21600341796875, 143.60768127441406]]},
    {"itemIndex": 1, "command": ["l", [411.21600341796875, 143.60768127441406], [410.4300231933594, 143.5806884765625]]},
    {"itemIndex": 2, "command": ["l", [410.4300231933594, 143.5806884765625], [410.4440002441406, 143.26869201660156]]},
    {"itemIndex": 3, "command": ["l", [410.4440002441406, 143.26869201660156], [410.8910217285156, 143.28167724609375]]},
    {"itemIndex": 4, "command": ["l", [410.8910217285156, 143.28167724609375], [411.2300109863281, 143.29568481445312]]}
  ] },
  { "pathIndex": 52319, "seqno": 52319, "boundsPt": [408.3309020996094, 172.4715118408203, 411.1759033203125, 174.99151611328125], "style": "style-3", "roles": ["east-door-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [411.0408935546875, 174.12451171875], [410.9578857421875, 174.99151611328125]]},
    {"itemIndex": 1, "command": ["l", [410.9578857421875, 174.99151611328125], [408.3309020996094, 174.7475128173828]]},
    {"itemIndex": 2, "command": ["l", [408.3309020996094, 174.7475128173828], [408.5458984375, 172.4715118408203]]},
    {"itemIndex": 3, "command": ["l", [408.5458984375, 172.4715118408203], [411.1759033203125, 172.728515625]]},
    {"itemIndex": 4, "command": ["l", [411.1759033203125, 172.728515625], [411.0408935546875, 174.12451171875]]}
  ] },
  { "pathIndex": 52320, "seqno": 52320, "boundsPt": [409.5227966308594, 103.13018798828125, 410.91778564453125, 105.19019317626953], "style": "style-4", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [410.91778564453125, 104.93218994140625], [410.10479736328125, 105.19019317626953]]},
    {"itemIndex": 1, "command": ["l", [410.10479736328125, 105.19019317626953], [409.5227966308594, 103.40119171142578]]},
    {"itemIndex": 2, "command": ["l", [409.5227966308594, 103.40119171142578], [410.33477783203125, 103.13018798828125]]},
    {"itemIndex": 3, "command": ["c", [410.33477783203125, 103.13018798828125], [410.3487854003906, 103.15718841552734], [410.3487854003906, 103.1701889038086], [410.3638000488281, 103.19818878173828]]},
    {"itemIndex": 4, "command": ["c", [410.3638000488281, 103.19818878173828], [410.44378662109375, 103.42819213867188], [410.5107727050781, 103.64518737792969], [410.5937805175781, 103.86219024658203]]},
    {"itemIndex": 5, "command": ["c", [410.5937805175781, 103.86219024658203], [410.6617736816406, 104.09219360351562], [410.727783203125, 104.30918884277344], [410.7957763671875, 104.53919219970703]]},
    {"itemIndex": 6, "command": ["c", [410.7957763671875, 104.53919219970703], [410.8367919921875, 104.66118621826172], [410.8787841796875, 104.79718780517578], [410.91778564453125, 104.93218994140625]]}
  ] },
  { "pathIndex": 52321, "seqno": 52321, "boundsPt": [409.2652893066406, 118.13150787353516, 410.6742858886719, 124.0255126953125], "style": "style-4", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [410.6742858886719, 123.822509765625], [410.6742858886719, 124.0255126953125]]},
    {"itemIndex": 1, "command": ["c", [410.6742858886719, 124.0255126953125], [410.5252990722656, 122.12850952148438], [410.0643005371094, 120.38050842285156], [409.2652893066406, 118.6185073852539]]},
    {"itemIndex": 2, "command": ["l", [409.2652893066406, 118.6185073852539], [409.3052978515625, 118.59150695800781]]},
    {"itemIndex": 3, "command": ["l", [409.3052978515625, 118.59150695800781], [409.83428955078125, 118.37451171875]]},
    {"itemIndex": 4, "command": ["l", [409.83428955078125, 118.37451171875], [410.3892822265625, 118.13150787353516]]},
    {"itemIndex": 5, "command": ["c", [410.3892822265625, 118.13150787353516], [410.4032897949219, 118.13150787353516], [410.4032897949219, 118.1445083618164], [410.4032897949219, 118.1445083618164]]},
    {"itemIndex": 6, "command": ["l", [410.4032897949219, 118.1445083618164], [410.4032897949219, 118.1715087890625]]},
    {"itemIndex": 7, "command": ["c", [410.4032897949219, 118.1715087890625], [410.4302978515625, 118.6455078125], [410.457275390625, 119.10650634765625], [410.4842834472656, 119.58051300048828]]},
    {"itemIndex": 8, "command": ["c", [410.4842834472656, 119.58051300048828], [410.51129150390625, 120.05551147460938], [410.5382995605469, 120.52951049804688], [410.5662841796875, 121.00350952148438]]},
    {"itemIndex": 9, "command": ["c", [410.5662841796875, 121.00350952148438], [410.57928466796875, 121.46450805664062], [410.6062927246094, 121.93850708007812], [410.62030029296875, 122.41351318359375]]},
    {"itemIndex": 10, "command": ["c", [410.62030029296875, 122.41351318359375], [410.64727783203125, 122.88751220703125], [410.6602783203125, 123.36151123046875], [410.6742858886719, 123.822509765625]]}
  ] },
  { "pathIndex": 52322, "seqno": 52322, "boundsPt": [409.83428955078125, 154.8686981201172, 410.6742858886719, 155.7086944580078], "style": "style-3", "roles": ["east-door-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [410.6742858886719, 154.92269897460938], [410.6742858886719, 154.93670654296875]]},
    {"itemIndex": 1, "command": ["l", [410.6742858886719, 154.93670654296875], [410.62030029296875, 155.6947021484375]]},
    {"itemIndex": 2, "command": ["l", [410.62030029296875, 155.6947021484375], [410.62030029296875, 155.7086944580078]]},
    {"itemIndex": 3, "command": ["l", [410.62030029296875, 155.7086944580078], [409.83428955078125, 155.65469360351562]]},
    {"itemIndex": 4, "command": ["l", [409.83428955078125, 155.65469360351562], [409.8882751464844, 154.8686981201172]]},
    {"itemIndex": 5, "command": ["l", [409.8882751464844, 154.8686981201172], [410.6742858886719, 154.92269897460938]]}
  ] },
  { "pathIndex": 52323, "seqno": 52323, "boundsPt": [407.2987976074219, 101.30109405517578, 410.0517883300781, 102.75109100341797], "style": "style-4", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["c", [409.8617858886719, 101.8970947265625], [409.9297790527344, 102.06009674072266], [409.9967956542969, 102.22209167480469], [410.0517883300781, 102.38509368896484]]},
    {"itemIndex": 1, "command": ["l", [410.0517883300781, 102.38509368896484], [407.7747802734375, 102.75109100341797]]},
    {"itemIndex": 2, "command": ["c", [407.7747802734375, 102.75109100341797], [407.62579345703125, 102.38509368896484], [407.4757995605469, 102.03309631347656], [407.2987976074219, 101.6670913696289]]},
    {"itemIndex": 3, "command": ["l", [407.2987976074219, 101.6670913696289], [409.60479736328125, 101.30109405517578]]},
    {"itemIndex": 4, "command": ["c", [409.60479736328125, 101.30109405517578], [409.685791015625, 101.50409698486328], [409.7787780761719, 101.694091796875], [409.8617858886719, 101.8970947265625]]}
  ] },
  { "pathIndex": 52324, "seqno": 52324, "boundsPt": [309.1217041015625, 76.05400848388672, 409.60369873046875, 101.666015625], "style": "style-4", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [331.9556884765625, 76.88101196289062], [331.9826965332031, 76.88101196289062]]},
    {"itemIndex": 1, "command": ["c", [331.9826965332031, 76.88101196289062], [332.1856994628906, 76.85401153564453], [332.3757019042969, 76.84001159667969], [332.57867431640625, 76.8130111694336]]},
    {"itemIndex": 2, "command": ["l", [332.57867431640625, 76.8130111694336], [332.6466979980469, 77.57201385498047]]},
    {"itemIndex": 3, "command": ["l", [332.6466979980469, 77.57201385498047], [333.5816955566406, 77.49101257324219]]},
    {"itemIndex": 4, "command": ["l", [333.5816955566406, 77.49101257324219], [333.5137023925781, 76.71800994873047]]},
    {"itemIndex": 5, "command": ["c", [333.5137023925781, 76.71800994873047], [333.7716979980469, 76.69100952148438], [334.01568603515625, 76.66400909423828], [334.2726745605469, 76.63700866699219]]},
    {"itemIndex": 6, "command": ["c", [334.2726745605469, 76.63700866699219], [336.1427001953125, 76.46101379394531], [338.0126953125, 76.32501220703125], [339.8826904296875, 76.23101043701172]]},
    {"itemIndex": 7, "command": ["c", [339.8826904296875, 76.23101043701172], [340.81768798828125, 76.17601013183594], [341.7516784667969, 76.1360092163086], [342.6886901855469, 76.1090087890625]]},
    {"itemIndex": 8, "command": ["c", [342.6886901855469, 76.1090087890625], [343.148681640625, 76.09500885009766], [343.6236877441406, 76.09500885009766], [344.08367919921875, 76.0820083618164]]},
    {"itemIndex": 9, "command": ["c", [344.08367919921875, 76.0820083618164], [344.5586853027344, 76.06800842285156], [345.0326843261719, 76.06800842285156], [345.4936828613281, 76.06800842285156]]},
    {"itemIndex": 10, "command": ["c", [345.4936828613281, 76.06800842285156], [345.9676818847656, 76.05400848388672], [346.4286804199219, 76.05400848388672], [346.9026794433594, 76.06800842285156]]},
    {"itemIndex": 11, "command": ["c", [346.9026794433594, 76.06800842285156], [347.3636779785156, 76.06800842285156], [347.8376770019531, 76.06800842285156], [348.2986755371094, 76.0820083618164]]},
    {"itemIndex": 12, "command": ["c", [348.2986755371094, 76.0820083618164], [348.7726745605469, 76.0820083618164], [349.2467041015625, 76.09500885009766], [349.70770263671875, 76.1090087890625]]},
    {"itemIndex": 13, "command": ["c", [349.70770263671875, 76.1090087890625], [350.18170166015625, 76.12200927734375], [350.6427001953125, 76.1360092163086], [351.11669921875, 76.16300964355469]]},
    {"itemIndex": 14, "command": ["c", [351.11669921875, 76.16300964355469], [352.05169677734375, 76.19001007080078], [352.9866943359375, 76.24401092529297], [353.92169189453125, 76.29801177978516]]},
    {"itemIndex": 15, "command": ["c", [353.92169189453125, 76.29801177978516], [353.9626770019531, 76.29801177978516], [354.0036926269531, 76.29801177978516], [354.05767822265625, 76.31201171875]]},
    {"itemIndex": 16, "command": ["c", [354.05767822265625, 76.31201171875], [354.9516906738281, 76.35301208496094], [355.83270263671875, 76.42001342773438], [356.7266845703125, 76.50201416015625]]},
    {"itemIndex": 17, "command": ["c", [356.7266845703125, 76.50201416015625], [357.6626892089844, 76.58301544189453], [358.58367919921875, 76.66400909423828], [359.5186767578125, 76.77301025390625]]},
    {"itemIndex": 18, "command": ["c", [359.5186767578125, 76.77301025390625], [360.3046875, 76.85401153564453], [361.0906982421875, 76.94901275634766], [361.8627014160156, 77.04401397705078]]},
    {"itemIndex": 19, "command": ["l", [361.8627014160156, 77.04401397705078], [361.75469970703125, 77.89701080322266]]},
    {"itemIndex": 20, "command": ["l", [361.75469970703125, 77.89701080322266], [362.689697265625, 78.01901245117188]]},
    {"itemIndex": 21, "command": ["l", [362.689697265625, 78.01901245117188], [362.7976989746094, 77.166015625]]},
    {"itemIndex": 22, "command": ["c", [362.7976989746094, 77.166015625], [363.5706787109375, 77.260009765625], [364.3296813964844, 77.36901092529297], [365.08868408203125, 77.49101257324219]]},
    {"itemIndex": 23, "command": ["c", [365.08868408203125, 77.49101257324219], [366.9447021484375, 77.77500915527344], [368.7876892089844, 78.10101318359375], [370.63067626953125, 78.46701049804688]]},
    {"itemIndex": 24, "command": ["c", [370.63067626953125, 78.46701049804688], [372.4596862792969, 78.84600830078125], [374.2896728515625, 79.25201416015625], [376.1056823730469, 79.70001220703125]]},
    {"itemIndex": 25, "command": ["c", [376.1056823730469, 79.70001220703125], [377.013671875, 79.9170150756836], [377.92169189453125, 80.1600112915039], [378.82867431640625, 80.40401458740234]]},
    {"itemIndex": 26, "command": ["c", [378.82867431640625, 80.40401458740234], [379.07269287109375, 80.47201538085938], [379.3166809082031, 80.54000854492188], [379.5606994628906, 80.6080093383789]]},
    {"itemIndex": 27, "command": ["c", [379.5606994628906, 80.6080093383789], [379.763671875, 80.6620101928711], [379.9676818847656, 80.71601104736328], [380.1706848144531, 80.78401184082031]]},
    {"itemIndex": 28, "command": ["l", [380.1706848144531, 80.78401184082031], [380.1846923828125, 80.78401184082031]]},
    {"itemIndex": 29, "command": ["c", [380.1846923828125, 80.78401184082031], [380.3726806640625, 80.8380126953125], [380.57769775390625, 80.89201354980469], [380.7666931152344, 80.96001434326172]]},
    {"itemIndex": 30, "command": ["l", [380.7666931152344, 80.96001434326172], [380.53668212890625, 81.77301025390625]]},
    {"itemIndex": 31, "command": ["l", [380.53668212890625, 81.77301025390625], [381.4447021484375, 82.04401397705078]]},
    {"itemIndex": 32, "command": ["l", [381.4447021484375, 82.04401397705078], [381.6886901855469, 81.21701049804688]]},
    {"itemIndex": 33, "command": ["c", [381.6886901855469, 81.21701049804688], [382.0816955566406, 81.32601165771484], [382.4877014160156, 81.44801330566406], [382.88067626953125, 81.58301544189453]]},
    {"itemIndex": 34, "command": ["c", [382.88067626953125, 81.58301544189453], [383.32769775390625, 81.71900939941406], [383.77569580078125, 81.85401153564453], [384.2226867675781, 82.00301361083984]]},
    {"itemIndex": 35, "command": ["c", [384.2226867675781, 82.00301361083984], [384.669677734375, 82.1390151977539], [385.1156921386719, 82.28800964355469], [385.5506896972656, 82.43701171875]]},
    {"itemIndex": 36, "command": ["c", [385.5506896972656, 82.43701171875], [385.9976806640625, 82.58601379394531], [386.4447021484375, 82.73501586914062], [386.8916931152344, 82.8840103149414]]},
    {"itemIndex": 37, "command": ["c", [386.8916931152344, 82.8840103149414], [387.32568359375, 83.03301239013672], [387.772705078125, 83.19601440429688], [388.2066955566406, 83.3580093383789]]},
    {"itemIndex": 38, "command": ["c", [388.2066955566406, 83.3580093383789], [388.4366760253906, 83.42601013183594], [388.6536865234375, 83.50801086425781], [388.8706970214844, 83.5890121459961]]},
    {"itemIndex": 39, "command": ["c", [388.8706970214844, 83.5890121459961], [389.0876770019531, 83.67001342773438], [389.3036804199219, 83.75101470947266], [389.5346984863281, 83.83301544189453]]},
    {"itemIndex": 40, "command": ["c", [389.5346984863281, 83.83301544189453], [389.7516784667969, 83.91400909423828], [389.96868896484375, 83.99501037597656], [390.1846923828125, 84.07701110839844]]},
    {"itemIndex": 41, "command": ["c", [390.1846923828125, 84.07701110839844], [390.293701171875, 84.11701202392578], [390.40167236328125, 84.15801239013672], [390.51068115234375, 84.2120132446289]]},
    {"itemIndex": 42, "command": ["c", [390.51068115234375, 84.2120132446289], [390.6326904296875, 84.25301361083984], [390.7406921386719, 84.29401397705078], [390.84869384765625, 84.33401489257812]]},
    {"itemIndex": 43, "command": ["c", [390.84869384765625, 84.33401489257812], [390.95770263671875, 84.37501525878906], [391.065673828125, 84.416015625], [391.1746826171875, 84.45600891113281]]},
    {"itemIndex": 44, "command": ["c", [391.1746826171875, 84.45600891113281], [391.2826843261719, 84.49700927734375], [391.39068603515625, 84.5370101928711], [391.49969482421875, 84.57801055908203]]},
    {"itemIndex": 45, "command": ["c", [391.49969482421875, 84.57801055908203], [391.6076965332031, 84.61901092529297], [391.7166748046875, 84.65901184082031], [391.8246765136719, 84.7140121459961]]},
    {"itemIndex": 46, "command": ["c", [391.8246765136719, 84.7140121459961], [391.93267822265625, 84.75401306152344], [392.04168701171875, 84.79501342773438], [392.1496887207031, 84.83601379394531]]},
    {"itemIndex": 47, "command": ["c", [392.1496887207031, 84.83601379394531], [392.2586975097656, 84.87601470947266], [392.38067626953125, 84.9170150756836], [392.4886779785156, 84.97100830078125]]},
    {"itemIndex": 48, "command": ["c", [392.4886779785156, 84.97100830078125], [392.5966796875, 85.01200866699219], [392.7056884765625, 85.05200958251953], [392.8136901855469, 85.09300994873047]]},
    {"itemIndex": 49, "command": ["c", [392.8136901855469, 85.09300994873047], [392.9226989746094, 85.14701080322266], [393.03070068359375, 85.1880111694336], [393.138671875, 85.22901153564453]]},
    {"itemIndex": 50, "command": ["c", [393.138671875, 85.22901153564453], [393.2456970214844, 85.26901245117188], [393.3556823730469, 85.32301330566406], [393.45068359375, 85.364013671875]]},
    {"itemIndex": 51, "command": ["c", [393.45068359375, 85.364013671875], [393.5596923828125, 85.41801452636719], [393.6676940917969, 85.45901489257812], [393.77569580078125, 85.51301574707031]]},
    {"itemIndex": 52, "command": ["c", [393.77569580078125, 85.51301574707031], [393.88470458984375, 85.55401611328125], [393.99267578125, 85.59500885009766], [394.1016845703125, 85.64900970458984]]},
    {"itemIndex": 53, "command": ["c", [394.1016845703125, 85.64900970458984], [394.2096862792969, 85.70301055908203], [394.31768798828125, 85.74301147460938], [394.42669677734375, 85.79801177978516]]},
    {"itemIndex": 54, "command": ["c", [394.42669677734375, 85.79801177978516], [394.5216979980469, 85.8380126953125], [394.62969970703125, 85.89301300048828], [394.7377014160156, 85.94701385498047]]},
    {"itemIndex": 55, "command": ["c", [394.7377014160156, 85.94701385498047], [394.9546813964844, 86.0420150756836], [395.15869140625, 86.15000915527344], [395.37469482421875, 86.25801086425781]]},
    {"itemIndex": 56, "command": ["c", [395.37469482421875, 86.25801086425781], [395.57867431640625, 86.35301208496094], [395.78167724609375, 86.4620132446289], [395.9986877441406, 86.57001495361328]]},
    {"itemIndex": 57, "command": ["c", [395.9986877441406, 86.57001495361328], [396.4046936035156, 86.80001068115234], [396.81170654296875, 87.03101348876953], [397.2176818847656, 87.2610092163086]]},
    {"itemIndex": 58, "command": ["c", [397.2176818847656, 87.2610092163086], [397.5296936035156, 87.45101165771484], [397.8416748046875, 87.6410140991211], [398.1396789550781, 87.84400939941406]]},
    {"itemIndex": 59, "command": ["l", [398.1396789550781, 87.84400939941406], [397.6656799316406, 88.54901123046875]]},
    {"itemIndex": 60, "command": ["l", [397.6656799316406, 88.54901123046875], [398.45068359375, 89.07701110839844]]},
    {"itemIndex": 61, "command": ["l", [398.45068359375, 89.07701110839844], [398.9256896972656, 88.37200927734375]]},
    {"itemIndex": 62, "command": ["c", [398.9256896972656, 88.37200927734375], [399.1427001953125, 88.50801086425781], [399.35870361328125, 88.65701293945312], [399.56268310546875, 88.80601501464844]]},
    {"itemIndex": 63, "command": ["c", [399.56268310546875, 88.80601501464844], [399.9416809082031, 89.07701110839844], [400.3216857910156, 89.36201477050781], [400.68670654296875, 89.6600112915039]]},
    {"itemIndex": 64, "command": ["c", [400.68670654296875, 89.6600112915039], [401.05267333984375, 89.94401550292969], [401.40570068359375, 90.25601196289062], [401.7576904296875, 90.55401611328125]]},
    {"itemIndex": 65, "command": ["c", [401.7576904296875, 90.55401611328125], [402.10968017578125, 90.86601257324219], [402.46270751953125, 91.19100952148438], [402.7876892089844, 91.5160140991211]]},
    {"itemIndex": 66, "command": ["c", [402.7876892089844, 91.5160140991211], [403.1266784667969, 91.84201049804688], [403.4646911621094, 92.1670150756836], [403.7906799316406, 92.50601196289062]]},
    {"itemIndex": 67, "command": ["c", [403.7906799316406, 92.50601196289062], [404.1016845703125, 92.84400939941406], [404.4136962890625, 93.19701385498047], [404.7256774902344, 93.54901123046875]]},
    {"itemIndex": 68, "command": ["c", [404.7256774902344, 93.54901123046875], [405.03668212890625, 93.90101623535156], [405.335693359375, 94.26701354980469], [405.61968994140625, 94.63301086425781]]},
    {"itemIndex": 69, "command": ["c", [405.61968994140625, 94.63301086425781], [405.9046936035156, 94.99900817871094], [406.1886901855469, 95.37801361083984], [406.45867919921875, 95.75801086425781]]},
    {"itemIndex": 70, "command": ["c", [406.45867919921875, 95.75801086425781], [406.7306823730469, 96.13700866699219], [407.0016784667969, 96.53001403808594], [407.25970458984375, 96.92301177978516]]},
    {"itemIndex": 71, "command": ["c", [407.25970458984375, 96.92301177978516], [407.5036926269531, 97.31600952148438], [407.7476806640625, 97.70901489257812], [407.99169921875, 98.11601257324219]]},
    {"itemIndex": 72, "command": ["c", [407.99169921875, 98.11601257324219], [408.2216796875, 98.52201080322266], [408.4516906738281, 98.92901611328125], [408.668701171875, 99.34901428222656]]},
    {"itemIndex": 73, "command": ["c", [408.668701171875, 99.34901428222656], [408.88568115234375, 99.75501251220703], [409.08868408203125, 100.17501068115234], [409.29168701171875, 100.6090087890625]]},
    {"itemIndex": 74, "command": ["c", [409.29168701171875, 100.6090087890625], [409.40069580078125, 100.8390121459961], [409.5076904296875, 101.07000732421875], [409.60369873046875, 101.30001068115234]]},
    {"itemIndex": 75, "command": ["l", [409.60369873046875, 101.30001068115234], [407.2996826171875, 101.666015625]]},
    {"itemIndex": 76, "command": ["c", [407.2996826171875, 101.666015625], [407.28668212890625, 101.63900756835938], [407.272705078125, 101.59800720214844], [407.25970458984375, 101.57101440429688]]},
    {"itemIndex": 77, "command": ["c", [407.25970458984375, 101.57101440429688], [407.0697021484375, 101.15101623535156], [406.8526916503906, 100.71800994873047], [406.63568115234375, 100.3110122680664]]},
    {"itemIndex": 78, "command": ["c", [406.63568115234375, 100.3110122680664], [406.419677734375, 99.8910140991211], [406.1886901855469, 99.47100830078125], [405.9447021484375, 99.06401062011719]]},
    {"itemIndex": 79, "command": ["c", [405.9447021484375, 99.06401062011719], [405.70068359375, 98.65801239013672], [405.4566955566406, 98.2650146484375], [405.1856994628906, 97.87200927734375]]},
    {"itemIndex": 80, "command": ["c", [405.1856994628906, 97.87200927734375], [404.9286804199219, 97.47901153564453], [404.6576843261719, 97.08601379394531], [404.3726806640625, 96.70600891113281]]},
    {"itemIndex": 81, "command": ["c", [404.3726806640625, 96.70600891113281], [404.1016845703125, 96.32701110839844], [403.8036804199219, 95.96101379394531], [403.50567626953125, 95.59501647949219]]},
    {"itemIndex": 82, "command": ["c", [403.50567626953125, 95.59501647949219], [403.20770263671875, 95.22901153564453], [402.89569091796875, 94.8630142211914], [402.5846862792969, 94.52500915527344]]},
    {"itemIndex": 83, "command": ["c", [402.5846862792969, 94.52500915527344], [402.272705078125, 94.17201232910156], [401.94769287109375, 93.82000732421875], [401.60870361328125, 93.49501037597656]]},
    {"itemIndex": 84, "command": ["c", [401.60870361328125, 93.49501037597656], [401.2696838378906, 93.15601348876953], [400.9306945800781, 92.83100891113281], [400.57867431640625, 92.51901245117188]]},
    {"itemIndex": 85, "command": ["c", [400.57867431640625, 92.51901245117188], [400.2266845703125, 92.19401550292969], [399.8736877441406, 91.89601135253906], [399.5076904296875, 91.59801483154297]]},
    {"itemIndex": 86, "command": ["c", [399.5076904296875, 91.59801483154297], [399.1427001953125, 91.29901123046875], [398.7626953125, 91.00101470947266], [398.3836975097656, 90.73001098632812]]},
    {"itemIndex": 87, "command": ["c", [398.3836975097656, 90.73001098632812], [398.0036926269531, 90.44601440429688], [397.6106872558594, 90.17501068115234], [397.2176818847656, 89.9170150756836]]},
    {"itemIndex": 88, "command": ["c", [397.2176818847656, 89.9170150756836], [396.82470703125, 89.6600112915039], [396.43170166015625, 89.40200805664062], [396.02569580078125, 89.17201232910156]]},
    {"itemIndex": 89, "command": ["c", [396.02569580078125, 89.17201232910156], [395.61767578125, 88.92800903320312], [395.1986999511719, 88.69801330566406], [394.7786865234375, 88.48101043701172]]},
    {"itemIndex": 90, "command": ["c", [394.7786865234375, 88.48101043701172], [394.3726806640625, 88.2640151977539], [393.9386901855469, 88.04701232910156], [393.5186767578125, 87.84400939941406]]},
    {"itemIndex": 91, "command": ["c", [393.5186767578125, 87.84400939941406], [393.30169677734375, 87.74900817871094], [393.0846862792969, 87.65401458740234], [392.86767578125, 87.55901336669922]]},
    {"itemIndex": 92, "command": ["c", [392.86767578125, 87.55901336669922], [392.65167236328125, 87.46501159667969], [392.4346923828125, 87.37001037597656], [392.2176818847656, 87.27500915527344]]},
    {"itemIndex": 93, "command": ["c", [392.2176818847656, 87.27500915527344], [391.78369140625, 87.09901428222656], [391.3367004394531, 86.92201232910156], [390.9036865234375, 86.760009765625]]},
    {"itemIndex": 94, "command": ["c", [390.9036865234375, 86.760009765625], [390.6866760253906, 86.66500854492188], [390.4556884765625, 86.58401489257812], [390.23968505859375, 86.50201416015625]]},
    {"itemIndex": 95, "command": ["c", [390.23968505859375, 86.50201416015625], [390.022705078125, 86.42101287841797], [389.79168701171875, 86.34001159667969], [389.57568359375, 86.25801086425781]]},
    {"itemIndex": 96, "command": ["c", [389.57568359375, 86.25801086425781], [389.35870361328125, 86.16400909423828], [389.127685546875, 86.08201599121094], [388.91168212890625, 86.00101470947266]]},
    {"itemIndex": 97, "command": ["c", [388.91168212890625, 86.00101470947266], [388.6947021484375, 85.92001342773438], [388.46368408203125, 85.8380126953125], [388.2476806640625, 85.75701141357422]]},
    {"itemIndex": 98, "command": ["c", [388.2476806640625, 85.75701141357422], [387.7996826171875, 85.59500885009766], [387.36669921875, 85.43201446533203], [386.919677734375, 85.26901245117188]]},
    {"itemIndex": 99, "command": ["c", [386.919677734375, 85.26901245117188], [386.470703125, 85.12001037597656], [386.0246887207031, 84.9580078125], [385.57769775390625, 84.80801391601562]]},
    {"itemIndex": 100, "command": ["c", [385.57769775390625, 84.80801391601562], [385.13067626953125, 84.65901184082031], [384.6836853027344, 84.510009765625], [384.2356872558594, 84.36101531982422]]},
    {"itemIndex": 101, "command": ["c", [384.2356872558594, 84.36101531982422], [383.7886962890625, 84.2120132446289], [383.3416748046875, 84.07701110839844], [382.88067626953125, 83.92800903320312]]},
    {"itemIndex": 102, "command": ["c", [382.88067626953125, 83.92800903320312], [382.4336853027344, 83.7920150756836], [381.9866943359375, 83.64301300048828], [381.52569580078125, 83.50801086425781]]},
    {"itemIndex": 103, "command": ["c", [381.52569580078125, 83.50801086425781], [381.07867431640625, 83.37200927734375], [380.6316833496094, 83.23701477050781], [380.1706848144531, 83.1150131225586]]},
    {"itemIndex": 104, "command": ["c", [380.1706848144531, 83.1150131225586], [379.72369384765625, 82.97901153564453], [379.2626953125, 82.85700988769531], [378.815673828125, 82.72201538085938]]},
    {"itemIndex": 105, "command": ["c", [378.815673828125, 82.72201538085938], [378.35467529296875, 82.60001373291016], [377.8936767578125, 82.47801208496094], [377.4466857910156, 82.35601043701172]]},
    {"itemIndex": 106, "command": ["c", [377.4466857910156, 82.35601043701172], [376.98468017578125, 82.2340087890625], [376.52569580078125, 82.11201477050781], [376.064697265625, 82.00301361083984]]},
    {"itemIndex": 107, "command": ["c", [376.064697265625, 82.00301361083984], [375.61767578125, 81.88101196289062], [375.15667724609375, 81.77301025390625], [374.6956787109375, 81.66500854492188]]},
    {"itemIndex": 108, "command": ["c", [374.6956787109375, 81.66500854492188], [374.2356872558594, 81.55601501464844], [373.7746887207031, 81.44801330566406], [373.3136901855469, 81.3390121459961]]},
    {"itemIndex": 109, "command": ["c", [373.3136901855469, 81.3390121459961], [372.8526916503906, 81.24501037597656], [372.3927001953125, 81.1360092163086], [371.93170166015625, 81.041015625]]},
    {"itemIndex": 110, "command": ["c", [371.93170166015625, 81.041015625], [371.470703125, 80.93301391601562], [371.00970458984375, 80.8380126953125], [370.5476989746094, 80.74301147460938]]},
    {"itemIndex": 111, "command": ["c", [370.5476989746094, 80.74301147460938], [370.0746765136719, 80.64801025390625], [369.61468505859375, 80.56700897216797], [369.1536865234375, 80.47201538085938]]},
    {"itemIndex": 112, "command": ["c", [369.1536865234375, 80.47201538085938], [368.69268798828125, 80.3910140991211], [368.231689453125, 80.29601287841797], [367.7576904296875, 80.21501159667969]]},
    {"itemIndex": 113, "command": ["c", [367.7576904296875, 80.21501159667969], [367.29669189453125, 80.13301086425781], [366.8367004394531, 80.05200958251953], [366.3616943359375, 79.97100830078125]]},
    {"itemIndex": 114, "command": ["c", [366.3616943359375, 79.97100830078125], [365.90167236328125, 79.90301513671875], [365.42669677734375, 79.82201385498047], [364.9666748046875, 79.75401306152344]]},
    {"itemIndex": 115, "command": ["c", [364.9666748046875, 79.75401306152344], [364.50567626953125, 79.67301177978516], [364.03167724609375, 79.60501098632812], [363.5706787109375, 79.5370101928711]]},
    {"itemIndex": 116, "command": ["c", [363.5706787109375, 79.5370101928711], [363.0946960449219, 79.46900939941406], [362.63568115234375, 79.41500854492188], [362.16168212890625, 79.34701538085938]]},
    {"itemIndex": 117, "command": ["c", [362.16168212890625, 79.34701538085938], [361.6866760253906, 79.28001403808594], [361.2266845703125, 79.22501373291016], [360.7516784667969, 79.17101287841797]]},
    {"itemIndex": 118, "command": ["c", [360.7516784667969, 79.17101287841797], [360.2906799316406, 79.11701202392578], [359.8166809082031, 79.0630111694336], [359.3426818847656, 79.0090103149414]]},
    {"itemIndex": 119, "command": ["c", [359.3426818847656, 79.0090103149414], [358.8816833496094, 78.95401000976562], [358.4076843261719, 78.91400909423828], [357.9336853027344, 78.87300872802734]]},
    {"itemIndex": 120, "command": ["c", [357.9336853027344, 78.87300872802734], [357.4726867675781, 78.81901550292969], [356.9967041015625, 78.77801513671875], [356.523681640625, 78.7380142211914]]},
    {"itemIndex": 121, "command": ["c", [356.523681640625, 78.7380142211914], [356.06268310546875, 78.69701385498047], [355.58868408203125, 78.67001342773438], [355.11468505859375, 78.62901306152344]]},
    {"itemIndex": 122, "command": ["c", [355.11468505859375, 78.62901306152344], [354.64068603515625, 78.5880126953125], [354.1796875, 78.5610122680664], [353.7056884765625, 78.53401184082031]]},
    {"itemIndex": 123, "command": ["c", [353.7056884765625, 78.53401184082031], [353.2306823730469, 78.50701141357422], [352.7566833496094, 78.48001098632812], [352.2826843261719, 78.45301055908203]]},
    {"itemIndex": 124, "command": ["c", [352.2826843261719, 78.45301055908203], [351.8216857910156, 78.43901062011719], [351.3476867675781, 78.4120101928711], [350.8726806640625, 78.39900970458984]]},
    {"itemIndex": 125, "command": ["c", [350.8726806640625, 78.39900970458984], [350.398681640625, 78.37200927734375], [349.9246826171875, 78.3580093383789], [349.45068359375, 78.34500885009766]]},
    {"itemIndex": 126, "command": ["c", [349.45068359375, 78.34500885009766], [348.98968505859375, 78.33100891113281], [348.51568603515625, 78.33100891113281], [348.0406799316406, 78.31800842285156]]},
    {"itemIndex": 127, "command": ["c", [348.0406799316406, 78.31800842285156], [347.5666809082031, 78.31800842285156], [347.0926818847656, 78.30400848388672], [346.61767578125, 78.30400848388672]]},
    {"itemIndex": 128, "command": ["c", [346.61767578125, 78.30400848388672], [346.1436767578125, 78.30400848388672], [345.68267822265625, 78.30400848388672], [345.20867919921875, 78.31800842285156]]},
    {"itemIndex": 129, "command": ["c", [345.20867919921875, 78.31800842285156], [344.73468017578125, 78.31800842285156], [344.2596740722656, 78.31800842285156], [343.7846984863281, 78.33100891113281]]},
    {"itemIndex": 130, "command": ["c", [343.7846984863281, 78.33100891113281], [343.3116760253906, 78.34500885009766], [342.8506774902344, 78.3580093383789], [342.3766784667969, 78.37200927734375]]},
    {"itemIndex": 131, "command": ["c", [342.3766784667969, 78.37200927734375], [341.9026794433594, 78.385009765625], [341.42767333984375, 78.39900970458984], [340.95367431640625, 78.42601013183594]]},
    {"itemIndex": 132, "command": ["c", [340.95367431640625, 78.42601013183594], [340.47967529296875, 78.43901062011719], [340.0186767578125, 78.46701049804688], [339.544677734375, 78.49401092529297]]},
    {"itemIndex": 133, "command": ["c", [339.544677734375, 78.49401092529297], [339.0697021484375, 78.52101135253906], [338.595703125, 78.54801177978516], [338.1216735839844, 78.57501220703125]]},
    {"itemIndex": 134, "command": ["c", [338.1216735839844, 78.57501220703125], [337.6606750488281, 78.61601257324219], [337.1866760253906, 78.64301300048828], [336.7117004394531, 78.68301391601562]]},
    {"itemIndex": 135, "command": ["c", [336.7117004394531, 78.68301391601562], [336.2377014160156, 78.71001434326172], [335.7767028808594, 78.75101470947266], [335.30267333984375, 78.80501556396484]]},
    {"itemIndex": 136, "command": ["c", [335.30267333984375, 78.80501556396484], [334.82867431640625, 78.84600830078125], [334.36767578125, 78.88700866699219], [333.8936767578125, 78.94100952148438]]},
    {"itemIndex": 137, "command": ["c", [333.8936767578125, 78.94100952148438], [333.419677734375, 78.98200988769531], [332.95867919921875, 79.0360107421875], [332.48370361328125, 79.09001159667969]]},
    {"itemIndex": 138, "command": ["c", [332.48370361328125, 79.09001159667969], [332.0096740722656, 79.14401245117188], [331.5486755371094, 79.19801330566406], [331.0746765136719, 79.25201416015625]]},
    {"itemIndex": 139, "command": ["c", [331.0746765136719, 79.25201416015625], [330.6136779785156, 79.30701446533203], [330.1396789550781, 79.37400817871094], [329.6786804199219, 79.44200897216797]]},
    {"itemIndex": 140, "command": ["c", [329.6786804199219, 79.44200897216797], [329.2046813964844, 79.49600982666016], [328.7436828613281, 79.56401062011719], [328.2696838378906, 79.64501190185547]]},
    {"itemIndex": 141, "command": ["c", [328.2696838378906, 79.64501190185547], [327.8086853027344, 79.7130126953125], [327.3346862792969, 79.78101348876953], [326.8736877441406, 79.86201477050781]]},
    {"itemIndex": 142, "command": ["c", [326.8736877441406, 79.86201477050781], [326.3996887207031, 79.93001556396484], [325.9386901855469, 80.0110092163086], [325.47869873046875, 80.09300994873047]]},
    {"itemIndex": 143, "command": ["c", [325.47869873046875, 80.09300994873047], [325.0036926269531, 80.17401123046875], [324.543701171875, 80.25501251220703], [324.08270263671875, 80.3370132446289]]},
    {"itemIndex": 144, "command": ["c", [324.08270263671875, 80.3370132446289], [323.6076965332031, 80.41801452636719], [323.1476745605469, 80.51301574707031], [322.6866760253906, 80.6080093383789]]},
    {"itemIndex": 145, "command": ["c", [322.6866760253906, 80.6080093383789], [322.2256774902344, 80.68901062011719], [321.7637023925781, 80.78401184082031], [321.3046875, 80.87901306152344]]},
    {"itemIndex": 146, "command": ["c", [321.3046875, 80.87901306152344], [320.8306884765625, 80.98701477050781], [320.36968994140625, 81.08201599121094], [319.90869140625, 81.17700958251953]]},
    {"itemIndex": 147, "command": ["c", [319.90869140625, 81.17700958251953], [319.44769287109375, 81.2850112915039], [318.9877014160156, 81.39401245117188], [318.5267028808594, 81.50201416015625]]},
    {"itemIndex": 148, "command": ["c", [318.5267028808594, 81.50201416015625], [318.065673828125, 81.59701538085938], [317.6186828613281, 81.71900939941406], [317.1576843261719, 81.82701110839844]]},
    {"itemIndex": 149, "command": ["c", [317.1576843261719, 81.82701110839844], [316.6966857910156, 81.9360122680664], [316.2366943359375, 82.05801391601562], [315.77569580078125, 82.166015625]]},
    {"itemIndex": 150, "command": ["c", [315.77569580078125, 82.166015625], [315.3266906738281, 82.28800964355469], [314.86767578125, 82.4100112915039], [314.40667724609375, 82.53201293945312]]},
    {"itemIndex": 151, "command": ["c", [314.40667724609375, 82.53201293945312], [313.9596862792969, 82.65401458740234], [313.4986877441406, 82.77600860595703], [313.0386962890625, 82.9110107421875]]},
    {"itemIndex": 152, "command": ["c", [313.0386962890625, 82.9110107421875], [312.5906982421875, 83.03301239013672], [312.13067626953125, 83.16901397705078], [311.68267822265625, 83.30400848388672]]},
    {"itemIndex": 153, "command": ["c", [311.68267822265625, 83.30400848388672], [311.2356872558594, 83.44001007080078], [310.77569580078125, 83.57501220703125], [310.32769775390625, 83.71101379394531]]},
    {"itemIndex": 154, "command": ["c", [310.32769775390625, 83.71101379394531], [309.9346923828125, 83.83301544189453], [309.5146789550781, 83.96800994873047], [309.1217041015625, 84.09001159667969]]},
    {"itemIndex": 155, "command": ["l", [309.1217041015625, 84.09001159667969], [309.1217041015625, 81.73200988769531]]},
    {"itemIndex": 156, "command": ["c", [309.1217041015625, 81.73200988769531], [309.2576904296875, 81.69200897216797], [309.37969970703125, 81.65100860595703], [309.5146789550781, 81.61001586914062]]},
    {"itemIndex": 157, "command": ["c", [309.5146789550781, 81.61001586914062], [309.9617004394531, 81.47501373291016], [310.4226989746094, 81.3390121459961], [310.86968994140625, 81.20401000976562]]},
    {"itemIndex": 158, "command": ["c", [310.86968994140625, 81.20401000976562], [310.8836975097656, 81.20401000976562], [310.9106750488281, 81.19001007080078], [310.9226989746094, 81.19001007080078]]},
    {"itemIndex": 159, "command": ["c", [310.9226989746094, 81.19001007080078], [311.3576965332031, 81.05500793457031], [311.7776794433594, 80.93301391601562], [312.2117004394531, 80.8110122680664]]},
    {"itemIndex": 160, "command": ["c", [312.2117004394531, 80.8110122680664], [312.2926940917969, 80.78401184082031], [312.3876953125, 80.77001190185547], [312.46868896484375, 80.74301147460938]]},
    {"itemIndex": 161, "command": ["c", [312.46868896484375, 80.74301147460938], [313.294677734375, 80.51301574707031], [314.095703125, 80.28201293945312], [314.92169189453125, 80.07901000976562]]},
    {"itemIndex": 162, "command": ["c", [314.92169189453125, 80.07901000976562], [315.3826904296875, 79.9570083618164], [315.8296813964844, 79.83501434326172], [316.2906799316406, 79.72701263427734]]},
    {"itemIndex": 163, "command": ["c", [316.2906799316406, 79.72701263427734], [316.3036804199219, 79.72701263427734], [316.3036804199219, 79.72701263427734], [316.31768798828125, 79.7130126953125]]},
    {"itemIndex": 164, "command": ["c", [316.31768798828125, 79.7130126953125], [316.7646789550781, 79.60501098632812], [317.2117004394531, 79.49600982666016], [317.65869140625, 79.40200805664062]]},
    {"itemIndex": 165, "command": ["c", [317.65869140625, 79.40200805664062], [319.0276794433594, 79.07601165771484], [320.3966979980469, 78.77801513671875], [321.7786865234375, 78.49401092529297]]},
    {"itemIndex": 166, "command": ["c", [321.7786865234375, 78.49401092529297], [321.96868896484375, 78.45301055908203], [322.1446838378906, 78.42601013183594], [322.3346862792969, 78.385009765625]]},
    {"itemIndex": 167, "command": ["c", [322.3346862792969, 78.385009765625], [322.3476867675781, 78.37200927734375], [322.37469482421875, 78.37200927734375], [322.4017028808594, 78.37200927734375]]},
    {"itemIndex": 168, "command": ["c", [322.4017028808594, 78.37200927734375], [322.64569091796875, 78.31800842285156], [322.9036865234375, 78.27701568603516], [323.1476745605469, 78.22301483154297]]},
    {"itemIndex": 169, "command": ["c", [323.1476745605469, 78.22301483154297], [326.0746765136719, 77.68101501464844], [329.0016784667969, 77.2330093383789], [331.9556884765625, 76.88101196289062]]}
  ] },
  { "pathIndex": 52325, "seqno": 52325, "boundsPt": [402.7601013183594, 209.28968811035156, 405.89007568359375, 214.60169982910156], "style": "style-5", "roles": ["southeast-transition-white-mask"], "items": [
    {"itemIndex": 0, "command": ["l", [405.8360900878906, 209.7366943359375], [405.8360900878906, 211.8647003173828]]},
    {"itemIndex": 1, "command": ["l", [405.8360900878906, 211.8647003173828], [405.82208251953125, 211.94569396972656]]},
    {"itemIndex": 2, "command": ["l", [405.82208251953125, 211.94569396972656], [405.3620910644531, 214.60169982910156]]},
    {"itemIndex": 3, "command": ["l", [405.3620910644531, 214.60169982910156], [402.7601013183594, 214.1407012939453]]},
    {"itemIndex": 4, "command": ["l", [402.7601013183594, 214.1407012939453], [402.93609619140625, 213.11068725585938]]},
    {"itemIndex": 5, "command": ["l", [402.93609619140625, 213.11068725585938], [403.2210998535156, 211.52569580078125]]},
    {"itemIndex": 6, "command": ["l", [403.2210998535156, 211.52569580078125], [403.2341003417969, 211.40370178222656]]},
    {"itemIndex": 7, "command": ["l", [403.2341003417969, 211.40370178222656], [403.51910400390625, 209.81768798828125]]},
    {"itemIndex": 8, "command": ["l", [403.51910400390625, 209.81768798828125], [403.6141052246094, 209.28968811035156]]},
    {"itemIndex": 9, "command": ["l", [403.6141052246094, 209.28968811035156], [403.6270751953125, 209.28968811035156]]},
    {"itemIndex": 10, "command": ["l", [403.6270751953125, 209.28968811035156], [405.89007568359375, 209.69569396972656]]},
    {"itemIndex": 11, "command": ["l", [405.89007568359375, 209.69569396972656], [405.8360900878906, 209.7366943359375]]}
  ] },
  { "pathIndex": 52339, "seqno": 52339, "boundsPt": [370.9689025878906, 212.97549438476562, 386.2279052734375, 216.05149841308594], "style": "style-3", "roles": ["neighbor-context-excluded"], "items": [
    {"itemIndex": 0, "command": ["l", [386.2279052734375, 212.97549438476562], [385.6448974609375, 216.05149841308594]]},
    {"itemIndex": 1, "command": ["l", [385.6448974609375, 216.05149841308594], [370.9689025878906, 216.05149841308594]]},
    {"itemIndex": 2, "command": ["l", [370.9689025878906, 216.05149841308594], [370.9689025878906, 212.97549438476562]]},
    {"itemIndex": 3, "command": ["l", [370.9689025878906, 212.97549438476562], [386.2279052734375, 212.97549438476562]]}
  ] },
  { "pathIndex": 52340, "seqno": 52340, "boundsPt": [370.9698181152344, 216.05178833007812, 385.64581298828125, 217.94879150390625], "style": "style-3", "roles": ["neighbor-context-excluded"], "items": [
    {"itemIndex": 0, "command": ["l", [385.64581298828125, 216.05178833007812], [385.5508117675781, 216.58079528808594]]},
    {"itemIndex": 1, "command": ["l", [385.5508117675781, 216.58079528808594], [385.27880859375, 217.94879150390625]]},
    {"itemIndex": 2, "command": ["l", [385.27880859375, 217.94879150390625], [372.0408020019531, 217.94879150390625]]},
    {"itemIndex": 3, "command": ["l", [372.0408020019531, 217.94879150390625], [370.9698181152344, 217.94879150390625]]},
    {"itemIndex": 4, "command": ["l", [370.9698181152344, 217.94879150390625], [370.9698181152344, 216.05178833007812]]},
    {"itemIndex": 5, "command": ["l", [370.9698181152344, 216.05178833007812], [385.64581298828125, 216.05178833007812]]}
  ] },
  { "pathIndex": 52352, "seqno": 52352, "boundsPt": [356.9020080566406, 212.97500610351562, 370.1419982910156, 216.05099487304688], "style": "style-4", "roles": ["neighbor-context-excluded"], "items": [
    {"itemIndex": 0, "command": ["re", [356.9020080566406, 212.97500610351562, 370.1419982910156, 216.05099487304688], 1]}
  ] },
  { "pathIndex": 52652, "seqno": 52652, "boundsPt": [368.6069030761719, 251.18191528320312, 399.347900390625, 286.0909118652344], "style": "style-3", "roles": ["neighbor-context-excluded"], "items": [
    {"itemIndex": 0, "command": ["c", [372.3049011230469, 286.0909118652344], [372.3049011230469, 286.0909118652344], [394.0098876953125, 276.16290283203125], [398.99090576171875, 254.76991271972656]]},
    {"itemIndex": 1, "command": ["l", [398.99090576171875, 254.76991271972656], [399.347900390625, 254.04490661621094]]},
    {"itemIndex": 2, "command": ["l", [399.347900390625, 254.04490661621094], [393.1488952636719, 251.18191528320312]]},
    {"itemIndex": 3, "command": ["c", [393.1488952636719, 251.18191528320312], [393.1488952636719, 251.18191528320312], [382.1949157714844, 273.638916015625], [368.6069030761719, 280.7259216308594]]},
    {"itemIndex": 4, "command": ["l", [368.6069030761719, 280.7259216308594], [372.3049011230469, 286.0909118652344]]}
  ] },
  { "pathIndex": 52653, "seqno": 52653, "boundsPt": [385.385009765625, 223.9167022705078, 410.239013671875, 224.13870239257812], "style": "style-6", "roles": ["projected-upper-volume-excluded"], "items": [
    {"itemIndex": 0, "command": ["l", [385.385009765625, 224.13870239257812], [410.239013671875, 223.9167022705078]]}
  ] },
  { "pathIndex": 52654, "seqno": 52654, "boundsPt": [402.76177978515625, 207.19378662109375, 409.6138000488281, 216.05078125], "style": "style-3", "roles": ["southeast-transition-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [406.706787109375, 207.19378662109375], [409.6138000488281, 207.65478515625]]},
    {"itemIndex": 1, "command": ["l", [409.6138000488281, 207.65478515625], [407.6077880859375, 216.05078125]]},
    {"itemIndex": 2, "command": ["l", [407.6077880859375, 216.05078125], [402.76177978515625, 215.03977966308594]]},
    {"itemIndex": 3, "command": ["l", [402.76177978515625, 215.03977966308594], [403.3117980957031, 212.36878967285156]]},
    {"itemIndex": 4, "command": ["l", [403.3117980957031, 212.36878967285156], [405.4367980957031, 212.8597869873047]]},
    {"itemIndex": 5, "command": ["l", [405.4367980957031, 212.8597869873047], [406.706787109375, 207.19378662109375]]}
  ] },
  { "pathIndex": 52655, "seqno": 52655, "boundsPt": [408.3307189941406, 169.848388671875, 414.397705078125, 177.91038513183594], "style": "style-3", "roles": ["east-door-jamb-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [411.2037048339844, 177.723388671875], [411.6017150878906, 175.2163848876953]]},
    {"itemIndex": 1, "command": ["l", [411.6017150878906, 175.2163848876953], [408.3307189941406, 174.9963836669922]]},
    {"itemIndex": 2, "command": ["l", [408.3307189941406, 174.9963836669922], [408.7586975097656, 169.848388671875]]},
    {"itemIndex": 3, "command": ["l", [408.7586975097656, 169.848388671875], [410.4566955566406, 169.98939514160156]]},
    {"itemIndex": 4, "command": ["l", [410.4566955566406, 169.98939514160156], [410.5577087402344, 171.6263885498047]]},
    {"itemIndex": 5, "command": ["l", [410.5577087402344, 171.6263885498047], [414.397705078125, 171.9193878173828]]},
    {"itemIndex": 6, "command": ["l", [414.397705078125, 171.9193878173828], [413.7066955566406, 177.91038513183594]]},
    {"itemIndex": 7, "command": ["l", [413.7066955566406, 177.91038513183594], [411.2037048339844, 177.723388671875]]}
  ] },
  { "pathIndex": 52674, "seqno": 52675, "boundsPt": [410.4494934082031, 118.58920288085938, 419.0664978027344, 140.9011993408203], "style": "style-7", "roles": ["room-wall-paint"], "items": [
    {"itemIndex": 0, "command": ["l", [410.56048583984375, 140.82620239257812], [412.8044738769531, 140.9011993408203]]},
    {"itemIndex": 1, "command": ["l", [412.8044738769531, 140.9011993408203], [412.8804931640625, 140.33120727539062]]},
    {"itemIndex": 2, "command": ["l", [412.8804931640625, 140.33120727539062], [419.0664978027344, 140.44520568847656]]},
    {"itemIndex": 3, "command": ["l", [419.0664978027344, 140.44520568847656], [413.77447509765625, 119.9612045288086]]},
    {"itemIndex": 4, "command": ["l", [413.77447509765625, 119.9612045288086], [410.4494934082031, 118.58920288085938]]},
    {"itemIndex": 5, "command": ["l", [410.4494934082031, 118.58920288085938], [410.5954895019531, 121.7842025756836]]},
    {"itemIndex": 6, "command": ["l", [410.5954895019531, 121.7842025756836], [410.8194885253906, 127.60020446777344]]},
    {"itemIndex": 7, "command": ["l", [410.8194885253906, 127.60020446777344], [410.7135009765625, 137.5072021484375]]},
    {"itemIndex": 8, "command": ["l", [410.7135009765625, 137.5072021484375], [410.56048583984375, 140.82620239257812]]}
  ] },
  { "pathIndex": 52676, "seqno": 52678, "boundsPt": [401.0787048339844, 143.20130920410156, 419.0587158203125, 250.31930541992188], "style": "style-8", "roles": ["projected-upper-volume-excluded"], "items": [
    {"itemIndex": 0, "command": ["c", [401.0787048339844, 250.31930541992188], [405.8186950683594, 239.3433074951172], [418.6777038574219, 204.02630615234375], [419.0587158203125, 143.20130920410156]]}
  ] },
  { "pathIndex": 52677, "seqno": 52679, "boundsPt": [419.06439208984375, 140.44590759277344, 419.0653991699219, 141.80490112304688], "style": "style-9", "roles": ["projected-upper-volume-excluded"], "items": [
    {"itemIndex": 0, "command": ["c", [419.06439208984375, 141.80490112304688], [419.0653991699219, 141.35389709472656], [419.0653991699219, 140.90089416503906], [419.0653991699219, 140.44590759277344]]}
  ] },
  { "pathIndex": 52843, "seqno": 52845, "boundsPt": [428.1955871582031, 113.7527084350586, 428.2236022949219, 113.96670532226562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.1955871582031, 113.96670532226562], [428.2236022949219, 113.7527084350586]]}
  ] },
  { "pathIndex": 52844, "seqno": 52846, "boundsPt": [427.9493103027344, 113.7174072265625, 428.2232971191406, 113.75241088867188], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.2232971191406, 113.75241088867188], [427.9493103027344, 113.7174072265625]]}
  ] },
  { "pathIndex": 52855, "seqno": 52857, "boundsPt": [427.9223937988281, 113.71661376953125, 427.94940185546875, 113.9326171875], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.94940185546875, 113.71661376953125], [427.9223937988281, 113.9326171875]]}
  ] },
  { "pathIndex": 52856, "seqno": 52858, "boundsPt": [427.92291259765625, 113.93161010742188, 428.1949157714844, 113.96661376953125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.92291259765625, 113.93161010742188], [428.1949157714844, 113.96661376953125]]}
  ] },
  { "pathIndex": 52857, "seqno": 52859, "boundsPt": [449.9410095214844, 116.53878784179688, 449.9700012207031, 116.75479125976562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.9700012207031, 116.53878784179688], [449.9410095214844, 116.75479125976562]]}
  ] },
  { "pathIndex": 52858, "seqno": 52860, "boundsPt": [449.9422912597656, 116.75381469726562, 450.2162780761719, 116.788818359375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.9422912597656, 116.75381469726562], [450.2162780761719, 116.788818359375]]}
  ] },
  { "pathIndex": 52859, "seqno": 52861, "boundsPt": [450.2161865234375, 116.57369995117188, 450.24420166015625, 116.7886962890625], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [450.2161865234375, 116.7886962890625], [450.24420166015625, 116.57369995117188]]}
  ] },
  { "pathIndex": 52860, "seqno": 52862, "boundsPt": [449.9700012207031, 116.5386962890625, 450.2439880371094, 116.57369995117188], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [450.2439880371094, 116.57369995117188], [449.9700012207031, 116.5386962890625]]}
  ] },
  { "pathIndex": 52871, "seqno": 52873, "boundsPt": [425.94329833984375, 128.69029235839844, 426.310302734375, 131.54229736328125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.94329833984375, 131.54229736328125], [426.310302734375, 128.69029235839844]]}
  ] },
  { "pathIndex": 52872, "seqno": 52874, "boundsPt": [426.02178955078125, 128.69970703125, 426.3877868652344, 131.55270385742188], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.3877868652344, 128.69970703125], [426.02178955078125, 131.55270385742188]]}
  ] },
  { "pathIndex": 52873, "seqno": 52875, "boundsPt": [425.9427185058594, 131.54318237304688, 426.022705078125, 131.55218505859375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.022705078125, 131.55218505859375], [425.9427185058594, 131.54318237304688]]}
  ] },
  { "pathIndex": 52874, "seqno": 52876, "boundsPt": [426.309814453125, 128.68978881835938, 426.3888244628906, 128.6997833251953], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.309814453125, 128.68978881835938], [426.3888244628906, 128.6997833251953]]}
  ] },
  { "pathIndex": 52875, "seqno": 52877, "boundsPt": [427.5869140625, 115.87200927734375, 427.9529113769531, 118.72500610351562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.5869140625, 118.72500610351562], [427.9529113769531, 115.87200927734375]]}
  ] },
  { "pathIndex": 52876, "seqno": 52878, "boundsPt": [427.6642150878906, 115.88229370117188, 428.03021240234375, 118.73529052734375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.03021240234375, 115.88229370117188], [427.6642150878906, 118.73529052734375]]}
  ] },
  { "pathIndex": 52877, "seqno": 52879, "boundsPt": [427.58599853515625, 118.72489166259766, 427.6650085449219, 118.73489379882812], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.6650085449219, 118.73489379882812], [427.58599853515625, 118.72489166259766]]}
  ] },
  { "pathIndex": 52878, "seqno": 52880, "boundsPt": [427.9519958496094, 115.8717041015625, 428.031005859375, 115.88270568847656], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.9519958496094, 115.8717041015625], [428.031005859375, 115.88270568847656]]}
  ] },
  { "pathIndex": 52879, "seqno": 52881, "boundsPt": [448.6759033203125, 125.03799438476562, 448.8808898925781, 126.6409912109375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.8808898925781, 125.03799438476562], [448.6759033203125, 126.6409912109375]]}
  ] },
  { "pathIndex": 52883, "seqno": 52885, "boundsPt": [448.59759521484375, 125.02800750732422, 448.8025817871094, 126.6300048828125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.59759521484375, 126.6300048828125], [448.8025817871094, 125.02800750732422]]}
  ] },
  { "pathIndex": 52884, "seqno": 52886, "boundsPt": [448.8028869628906, 125.02801513671875, 448.88189697265625, 125.03801727294922], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.8028869628906, 125.02801513671875], [448.88189697265625, 125.03801727294922]]}
  ] },
  { "pathIndex": 52885, "seqno": 52887, "boundsPt": [448.5968017578125, 126.62959289550781, 448.6758117675781, 126.64059448242188], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.6758117675781, 126.64059448242188], [448.5968017578125, 126.62959289550781]]}
  ] },
  { "pathIndex": 52886, "seqno": 52888, "boundsPt": [447.6894836425781, 131.47610473632812, 448.0564880371094, 134.3291015625], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0564880371094, 131.47610473632812], [447.6894836425781, 134.3291015625]]}
  ] },
  { "pathIndex": 52887, "seqno": 52889, "boundsPt": [447.6117858886719, 131.46669006347656, 447.9787902832031, 134.31869506835938], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.6117858886719, 134.31869506835938], [447.9787902832031, 131.46669006347656]]}
  ] },
  { "pathIndex": 52888, "seqno": 52890, "boundsPt": [447.9783935546875, 131.46609497070312, 448.0574035644531, 131.47608947753906], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.9783935546875, 131.46609497070312], [448.0574035644531, 131.47608947753906]]}
  ] },
  { "pathIndex": 52889, "seqno": 52891, "boundsPt": [447.61090087890625, 134.31961059570312, 447.6899108886719, 134.32861328125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.6899108886719, 134.32861328125], [447.61090087890625, 134.31961059570312]]}
  ] },
  { "pathIndex": 52890, "seqno": 52892, "boundsPt": [449.33270263671875, 118.65869140625, 449.6986999511719, 121.51068878173828], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.6986999511719, 118.65869140625], [449.33270263671875, 121.51068878173828]]}
  ] },
  { "pathIndex": 52891, "seqno": 52893, "boundsPt": [449.2554016113281, 118.6483154296875, 449.62139892578125, 121.50131225585938], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.2554016113281, 121.50131225585938], [449.62139892578125, 118.6483154296875]]}
  ] },
  { "pathIndex": 52892, "seqno": 52894, "boundsPt": [449.6206970214844, 118.6488037109375, 449.69970703125, 118.65780639648438], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.6206970214844, 118.6488037109375], [449.69970703125, 118.65780639648438]]}
  ] },
  { "pathIndex": 52893, "seqno": 52895, "boundsPt": [449.2544860839844, 121.502197265625, 449.33349609375, 121.51119995117188], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.33349609375, 121.51119995117188], [449.2544860839844, 121.502197265625]]}
  ] },
  { "pathIndex": 53083, "seqno": 53085, "boundsPt": [427.95599365234375, 115.62759399414062, 427.9830017089844, 115.84259033203125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.95599365234375, 115.84259033203125], [427.9830017089844, 115.62759399414062]]}
  ] },
  { "pathIndex": 53084, "seqno": 53086, "boundsPt": [427.71038818359375, 115.59259033203125, 427.9823913574219, 115.62759399414062], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.9823913574219, 115.62759399414062], [427.71038818359375, 115.59259033203125]]}
  ] },
  { "pathIndex": 53085, "seqno": 53087, "boundsPt": [427.680908203125, 115.59249877929688, 427.70989990234375, 115.80850219726562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.70989990234375, 115.59249877929688], [427.680908203125, 115.80850219726562]]}
  ] },
  { "pathIndex": 53086, "seqno": 53088, "boundsPt": [427.68218994140625, 115.80758666992188, 427.9561767578125, 115.84259033203125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.68218994140625, 115.80758666992188], [427.9561767578125, 115.84259033203125]]}
  ] },
  { "pathIndex": 53087, "seqno": 53089, "boundsPt": [427.55511474609375, 118.75399780273438, 427.5831298828125, 118.968994140625], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.55511474609375, 118.968994140625], [427.5831298828125, 118.75399780273438]]}
  ] },
  { "pathIndex": 53088, "seqno": 53090, "boundsPt": [427.3088073730469, 118.71908569335938, 427.5827941894531, 118.75408935546875], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.5827941894531, 118.75408935546875], [427.3088073730469, 118.71908569335938]]}
  ] },
  { "pathIndex": 53089, "seqno": 53091, "boundsPt": [427.2799072265625, 118.718994140625, 427.30889892578125, 118.93499755859375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.30889892578125, 118.718994140625], [427.2799072265625, 118.93499755859375]]}
  ] },
  { "pathIndex": 53090, "seqno": 53092, "boundsPt": [427.28118896484375, 118.93399047851562, 427.55517578125, 118.968994140625], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.28118896484375, 118.93399047851562], [427.55517578125, 118.968994140625]]}
  ] },
  { "pathIndex": 53091, "seqno": 53093, "boundsPt": [427.314208984375, 120.62991333007812, 427.34222412109375, 120.84490966796875], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.314208984375, 120.84490966796875], [427.34222412109375, 120.62991333007812]]}
  ] },
  { "pathIndex": 53092, "seqno": 53094, "boundsPt": [427.0680236816406, 120.59478759765625, 427.3420104980469, 120.62979125976562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.3420104980469, 120.62979125976562], [427.0680236816406, 120.59478759765625]]}
  ] },
  { "pathIndex": 53093, "seqno": 53095, "boundsPt": [427.0408935546875, 120.59478759765625, 427.0679016113281, 120.810791015625], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.0679016113281, 120.59478759765625], [427.0408935546875, 120.810791015625]]}
  ] },
  { "pathIndex": 53094, "seqno": 53096, "boundsPt": [427.0415954589844, 120.809814453125, 427.3135986328125, 120.84481811523438], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.0415954589844, 120.809814453125], [427.3135986328125, 120.84481811523438]]}
  ] },
  { "pathIndex": 53095, "seqno": 53097, "boundsPt": [426.91461181640625, 123.75479125976562, 426.9416198730469, 123.97079467773438], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.91461181640625, 123.97079467773438], [426.9416198730469, 123.75479125976562]]}
  ] },
  { "pathIndex": 53096, "seqno": 53098, "boundsPt": [426.66900634765625, 123.720703125, 426.9410095214844, 123.75570678710938], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.9410095214844, 123.75570678710938], [426.66900634765625, 123.720703125]]}
  ] },
  { "pathIndex": 53097, "seqno": 53099, "boundsPt": [426.639404296875, 123.72061157226562, 426.66839599609375, 123.93661499023438], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.66839599609375, 123.72061157226562], [426.639404296875, 123.93661499023438]]}
  ] },
  { "pathIndex": 53098, "seqno": 53100, "boundsPt": [426.6405944824219, 123.93560791015625, 426.9145812988281, 123.97061157226562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.6405944824219, 123.93560791015625], [426.9145812988281, 123.97061157226562]]}
  ] },
  { "pathIndex": 53099, "seqno": 53101, "boundsPt": [426.3124084472656, 128.4459991455078, 426.3414001464844, 128.66000366210938], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.3124084472656, 128.66000366210938], [426.3414001464844, 128.4459991455078]]}
  ] },
  { "pathIndex": 53100, "seqno": 53102, "boundsPt": [426.0682067871094, 128.41058349609375, 426.3402099609375, 128.44558715820312], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.3402099609375, 128.44558715820312], [426.0682067871094, 128.41058349609375]]}
  ] },
  { "pathIndex": 53101, "seqno": 53103, "boundsPt": [426.0386962890625, 128.41049194335938, 426.06768798828125, 128.62449645996094], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.06768798828125, 128.41049194335938], [426.0386962890625, 128.62449645996094]]}
  ] },
  { "pathIndex": 53102, "seqno": 53104, "boundsPt": [426.0397033691406, 128.62490844726562, 426.31170654296875, 128.659912109375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.0397033691406, 128.62490844726562], [426.31170654296875, 128.659912109375]]}
  ] },
  { "pathIndex": 53103, "seqno": 53105, "boundsPt": [425.9128112792969, 131.57040405273438, 425.9408264160156, 131.78640747070312], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.9128112792969, 131.78640747070312], [425.9408264160156, 131.57040405273438]]}
  ] },
  { "pathIndex": 53104, "seqno": 53106, "boundsPt": [425.6666259765625, 131.53640747070312, 425.94061279296875, 131.5714111328125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.94061279296875, 131.5714111328125], [425.6666259765625, 131.53640747070312]]}
  ] },
  { "pathIndex": 53105, "seqno": 53107, "boundsPt": [425.6376953125, 131.53640747070312, 425.66668701171875, 131.75140380859375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.66668701171875, 131.53640747070312], [425.6376953125, 131.75140380859375]]}
  ] },
  { "pathIndex": 53106, "seqno": 53108, "boundsPt": [425.6388854980469, 131.75140380859375, 425.9128723144531, 131.78640747070312], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.6388854980469, 131.75140380859375], [425.9128723144531, 131.78640747070312]]}
  ] },
  { "pathIndex": 53107, "seqno": 53109, "boundsPt": [425.6719970703125, 133.44720458984375, 425.70001220703125, 133.66220092773438], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.6719970703125, 133.66220092773438], [425.70001220703125, 133.44720458984375]]}
  ] },
  { "pathIndex": 53108, "seqno": 53110, "boundsPt": [425.42572021484375, 133.41220092773438, 425.69970703125, 133.44720458984375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.69970703125, 133.44720458984375], [425.42572021484375, 133.41220092773438]]}
  ] },
  { "pathIndex": 53109, "seqno": 53111, "boundsPt": [425.3968200683594, 133.41220092773438, 425.4258117675781, 133.62820434570312], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.4258117675781, 133.41220092773438], [425.3968200683594, 133.62820434570312]]}
  ] },
  { "pathIndex": 53110, "seqno": 53112, "boundsPt": [425.39788818359375, 133.627197265625, 425.671875, 133.66220092773438], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.39788818359375, 133.627197265625], [425.671875, 133.66220092773438]]}
  ] },
  { "pathIndex": 53111, "seqno": 53113, "boundsPt": [447.41741943359375, 136.23361206054688, 447.4464111328125, 136.44961547851562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.4464111328125, 136.23361206054688], [447.41741943359375, 136.44961547851562]]}
  ] },
  { "pathIndex": 53112, "seqno": 53114, "boundsPt": [447.4186096191406, 136.44869995117188, 447.6925964355469, 136.48370361328125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.4186096191406, 136.44869995117188], [447.6925964355469, 136.48370361328125]]}
  ] },
  { "pathIndex": 53113, "seqno": 53115, "boundsPt": [447.6925964355469, 136.26870727539062, 447.7206115722656, 136.48370361328125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.6925964355469, 136.48370361328125], [447.7206115722656, 136.26870727539062]]}
  ] },
  { "pathIndex": 53114, "seqno": 53116, "boundsPt": [447.4463195800781, 136.23370361328125, 447.7203063964844, 136.26870727539062], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.7203063964844, 136.26870727539062], [447.4463195800781, 136.23370361328125]]}
  ] },
  { "pathIndex": 53115, "seqno": 53117, "boundsPt": [447.6582946777344, 134.3583984375, 447.6872863769531, 134.57339477539062], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.6872863769531, 134.3583984375], [447.6582946777344, 134.57339477539062]]}
  ] },
  { "pathIndex": 53116, "seqno": 53118, "boundsPt": [447.65948486328125, 134.57339477539062, 447.9334716796875, 134.60739135742188], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.65948486328125, 134.57339477539062], [447.9334716796875, 134.60739135742188]]}
  ] },
  { "pathIndex": 53117, "seqno": 53119, "boundsPt": [447.93341064453125, 134.39378356933594, 447.9604187011719, 134.6077880859375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.93341064453125, 134.6077880859375], [447.9604187011719, 134.39378356933594]]}
  ] },
  { "pathIndex": 53118, "seqno": 53120, "boundsPt": [447.68780517578125, 134.35848999023438, 447.9598083496094, 134.39349365234375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.9598083496094, 134.39349365234375], [447.68780517578125, 134.35848999023438]]}
  ] },
  { "pathIndex": 53119, "seqno": 53121, "boundsPt": [448.0599060058594, 131.23199462890625, 448.0869140625, 131.447998046875], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0869140625, 131.23199462890625], [448.0599060058594, 131.447998046875]]}
  ] },
  { "pathIndex": 53120, "seqno": 53122, "boundsPt": [448.0603942871094, 131.44699096679688, 448.3323974609375, 131.48199462890625], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0603942871094, 131.44699096679688], [448.3323974609375, 131.48199462890625]]}
  ] },
  { "pathIndex": 53121, "seqno": 53123, "boundsPt": [448.3330078125, 131.26699829101562, 448.36199951171875, 131.48199462890625], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.3330078125, 131.48199462890625], [448.36199951171875, 131.26699829101562]]}
  ] },
  { "pathIndex": 53122, "seqno": 53124, "boundsPt": [448.0868225097656, 131.23199462890625, 448.3608093261719, 131.26699829101562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.3608093261719, 131.26699829101562], [448.0868225097656, 131.23199462890625]]}
  ] },
  { "pathIndex": 53141, "seqno": 53143, "boundsPt": [448.6607971191406, 126.64059448242188, 448.6758117675781, 126.7575912475586], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.6758117675781, 126.64059448242188], [448.6607971191406, 126.7575912475586]]}
  ] },
  { "pathIndex": 53142, "seqno": 53144, "boundsPt": [448.6612854003906, 126.7576904296875, 448.93328857421875, 126.79269409179688], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.6612854003906, 126.7576904296875], [448.93328857421875, 126.79269409179688]]}
  ] },
  { "pathIndex": 53143, "seqno": 53145, "boundsPt": [448.9338073730469, 126.57769775390625, 448.9618225097656, 126.79269409179688], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.9338073730469, 126.79269409179688], [448.9618225097656, 126.57769775390625]]}
  ] },
  { "pathIndex": 53144, "seqno": 53146, "boundsPt": [448.6876220703125, 126.54269409179688, 448.96160888671875, 126.57769775390625], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.96160888671875, 126.57769775390625], [448.6876220703125, 126.54269409179688]]}
  ] },
  { "pathIndex": 53145, "seqno": 53147, "boundsPt": [449.0596008300781, 123.41619873046875, 449.0885925292969, 123.6322021484375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.0885925292969, 123.41619873046875], [449.0596008300781, 123.6322021484375]]}
  ] },
  { "pathIndex": 53146, "seqno": 53148, "boundsPt": [449.060791015625, 123.63128662109375, 449.33477783203125, 123.66629028320312], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.060791015625, 123.63128662109375], [449.33477783203125, 123.66629028320312]]}
  ] },
  { "pathIndex": 53147, "seqno": 53149, "boundsPt": [449.3348083496094, 123.451416015625, 449.3628234863281, 123.66641235351562], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.3348083496094, 123.66641235351562], [449.3628234863281, 123.451416015625]]}
  ] },
  { "pathIndex": 53148, "seqno": 53150, "boundsPt": [449.088623046875, 123.41629028320312, 449.36260986328125, 123.4512939453125], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.36260986328125, 123.4512939453125], [449.088623046875, 123.41629028320312]]}
  ] },
  { "pathIndex": 53149, "seqno": 53151, "boundsPt": [449.3005065917969, 121.54098510742188, 449.3294982910156, 121.7549819946289], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.3294982910156, 121.54098510742188], [449.3005065917969, 121.7549819946289]]}
  ] },
  { "pathIndex": 53150, "seqno": 53152, "boundsPt": [449.3017883300781, 121.75540161132812, 449.5757751464844, 121.7904052734375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.3017883300781, 121.75540161132812], [449.5757751464844, 121.7904052734375]]}
  ] },
  { "pathIndex": 53151, "seqno": 53153, "boundsPt": [449.5757141113281, 121.57550048828125, 449.6037292480469, 121.79049682617188], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.5757141113281, 121.79049682617188], [449.6037292480469, 121.57550048828125]]}
  ] },
  { "pathIndex": 53152, "seqno": 53154, "boundsPt": [449.3294982910156, 121.54141235351562, 449.6034851074219, 121.57540893554688], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.6034851074219, 121.57540893554688], [449.3294982910156, 121.54141235351562]]}
  ] },
  { "pathIndex": 53153, "seqno": 53155, "boundsPt": [449.7015075683594, 118.41448974609375, 449.7304992675781, 118.62948608398438], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.7304992675781, 118.41448974609375], [449.7015075683594, 118.62948608398438]]}
  ] },
  { "pathIndex": 53154, "seqno": 53156, "boundsPt": [449.7027893066406, 118.62969970703125, 449.97479248046875, 118.66470336914062], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.7027893066406, 118.62969970703125], [449.97479248046875, 118.66470336914062]]}
  ] },
  { "pathIndex": 53155, "seqno": 53157, "boundsPt": [449.9751892089844, 118.44970703125, 450.0032043457031, 118.66470336914062], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.9751892089844, 118.66470336914062], [450.0032043457031, 118.44970703125]]}
  ] },
  { "pathIndex": 53276, "seqno": 53278, "boundsPt": [449.7311096191406, 118.41458129882812, 450.00311279296875, 118.4495849609375], "style": "style-1", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [450.00311279296875, 118.4495849609375], [449.7311096191406, 118.41458129882812]]}
  ] },
  { "pathIndex": 53917, "seqno": 53919, "boundsPt": [332.9573059082031, 195.37899780273438, 333.0343017578125, 195.3939971923828], "style": "style-10", "roles": ["front-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [333.0343017578125, 195.37899780273438], [332.9573059082031, 195.3939971923828]]}
  ] },
  { "pathIndex": 53918, "seqno": 53920, "boundsPt": [331.84600830078125, 189.18899536132812, 333.03399658203125, 195.37899780273438], "style": "style-10", "roles": ["front-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [331.84600830078125, 189.18899536132812], [333.03399658203125, 195.37899780273438]]}
  ] },
  { "pathIndex": 53919, "seqno": 53921, "boundsPt": [331.76800537109375, 189.18861389160156, 331.8470153808594, 189.20361328125], "style": "style-10", "roles": ["front-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [331.76800537109375, 189.20361328125], [331.8470153808594, 189.18861389160156]]}
  ] },
  { "pathIndex": 53920, "seqno": 53922, "boundsPt": [330.5690002441406, 189.41880798339844, 330.64599609375, 189.43380737304688], "style": "style-10", "roles": ["front-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [330.5690002441406, 189.43380737304688], [330.64599609375, 189.41880798339844]]}
  ] },
  { "pathIndex": 53921, "seqno": 53923, "boundsPt": [330.56939697265625, 189.43438720703125, 331.75738525390625, 195.6243896484375], "style": "style-10", "roles": ["front-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [331.75738525390625, 195.6243896484375], [330.56939697265625, 189.43438720703125]]}
  ] },
  { "pathIndex": 54059, "seqno": 54061, "boundsPt": [331.7563781738281, 195.60919189453125, 331.83538818359375, 195.6241912841797], "style": "style-10", "roles": ["front-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [331.83538818359375, 195.60919189453125], [331.7563781738281, 195.6241912841797]]}
  ] },
  { "pathIndex": 54064, "seqno": 54066, "boundsPt": [409.693603515625, 200.05300903320312, 410.02459716796875, 200.1060028076172], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.693603515625, 200.05300903320312], [410.02459716796875, 200.1060028076172]]}
  ] },
  { "pathIndex": 54065, "seqno": 54067, "boundsPt": [408.89849853515625, 200.10598754882812, 410.0245056152344, 207.13499450683594], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.0245056152344, 200.10598754882812], [408.89849853515625, 207.13499450683594]]}
  ] },
  { "pathIndex": 54066, "seqno": 54068, "boundsPt": [408.1203918457031, 199.98159790039062, 409.24639892578125, 207.01060485839844], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.24639892578125, 199.98159790039062], [408.1203918457031, 207.01060485839844]]}
  ] },
  { "pathIndex": 54067, "seqno": 54069, "boundsPt": [409.7533874511719, 199.66200256347656, 410.08538818359375, 199.71099853515625], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.08538818359375, 199.71099853515625], [409.7533874511719, 199.66200256347656]]}
  ] },
  { "pathIndex": 54068, "seqno": 54070, "boundsPt": [410.80010986328125, 192.42318725585938, 411.1321105957031, 192.47018432617188], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.80010986328125, 192.42318725585938], [411.1321105957031, 192.47018432617188]]}
  ] },
  { "pathIndex": 54069, "seqno": 54071, "boundsPt": [410.0862121582031, 192.47088623046875, 411.1322021484375, 199.7108917236328], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.1322021484375, 192.47088623046875], [410.0862121582031, 199.7108917236328]]}
  ] },
  { "pathIndex": 54070, "seqno": 54072, "boundsPt": [409.305419921875, 192.3583984375, 410.3514099121094, 199.59739685058594], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.3514099121094, 192.3583984375], [409.305419921875, 199.59739685058594]]}
  ] },
  { "pathIndex": 54071, "seqno": 54073, "boundsPt": [410.8544921875, 192.031494140625, 411.1864929199219, 192.07449340820312], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.1864929199219, 192.07449340820312], [410.8544921875, 192.031494140625]]}
  ] },
  { "pathIndex": 54072, "seqno": 54074, "boundsPt": [411.78851318359375, 184.77679443359375, 412.1205139160156, 184.8188018798828], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.78851318359375, 184.77679443359375], [412.1205139160156, 184.8188018798828]]}
  ] },
  { "pathIndex": 54073, "seqno": 54075, "boundsPt": [411.1867980957031, 184.8192138671875, 412.12078857421875, 192.07421875], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.12078857421875, 184.8192138671875], [411.1867980957031, 192.07421875]]}
  ] },
  { "pathIndex": 54074, "seqno": 54076, "boundsPt": [410.4049987792969, 184.71868896484375, 411.3399963378906, 191.97369384765625], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.3399963378906, 184.71868896484375], [410.4049987792969, 191.97369384765625]]}
  ] },
  { "pathIndex": 54075, "seqno": 54077, "boundsPt": [411.8367004394531, 184.38491821289062, 412.1697082519531, 184.42291259765625], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.1697082519531, 184.42291259765625], [411.8367004394531, 184.38491821289062]]}
  ] },
  { "pathIndex": 54076, "seqno": 54078, "boundsPt": [412.1708068847656, 178.21829223632812, 412.8778076171875, 184.4232940673828], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.8778076171875, 178.21829223632812], [412.1708068847656, 184.4232940673828]]}
  ] },
  { "pathIndex": 54077, "seqno": 54079, "boundsPt": [411.38720703125, 178.12899780273438, 412.0942077636719, 184.33399963378906], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.0942077636719, 178.12899780273438], [411.38720703125, 184.33399963378906]]}
  ] },
  { "pathIndex": 54078, "seqno": 54080, "boundsPt": [408.8360900878906, 207.1343994140625, 408.8981018066406, 207.52340698242188], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.8360900878906, 207.52340698242188], [408.8981018066406, 207.1343994140625]]}
  ] },
  { "pathIndex": 54079, "seqno": 54081, "boundsPt": [408.1202697753906, 207.00930786132812, 408.8982849121094, 207.13430786132812], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.8982849121094, 207.13430786132812], [408.1202697753906, 207.00930786132812]]}
  ] },
  { "pathIndex": 54080, "seqno": 54082, "boundsPt": [408.0581970214844, 207.0098876953125, 408.1202087402344, 207.39889526367188], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.1202087402344, 207.0098876953125], [408.0581970214844, 207.39889526367188]]}
  ] },
  { "pathIndex": 54081, "seqno": 54083, "boundsPt": [408.0580139160156, 207.39898681640625, 408.8360290527344, 207.52398681640625], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.0580139160156, 207.39898681640625], [408.8360290527344, 207.52398681640625]]}
  ] },
  { "pathIndex": 54082, "seqno": 54084, "boundsPt": [412.8778076171875, 177.8262939453125, 412.9208068847656, 178.21829223632812], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.8778076171875, 178.21829223632812], [412.9208068847656, 177.8262939453125]]}
  ] },
  { "pathIndex": 54083, "seqno": 54085, "boundsPt": [412.1393737792969, 177.7375946044922, 412.92138671875, 177.82659912109375], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.92138671875, 177.82659912109375], [412.1393737792969, 177.7375946044922]]}
  ] },
  { "pathIndex": 54084, "seqno": 54086, "boundsPt": [412.09417724609375, 177.73721313476562, 412.1391906738281, 178.12921142578125], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.1391906738281, 177.73721313476562], [412.09417724609375, 178.12921142578125]]}
  ] },
  { "pathIndex": 54085, "seqno": 54087, "boundsPt": [412.0942077636719, 178.12899780273438, 412.877197265625, 178.21800231933594], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.0942077636719, 178.12899780273438], [412.877197265625, 178.21800231933594]]}
  ] },
  { "pathIndex": 54086, "seqno": 54088, "boundsPt": [410.027099609375, 199.71429443359375, 410.08709716796875, 200.10330200195312], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.027099609375, 200.10330200195312], [410.08709716796875, 199.71429443359375]]}
  ] },
  { "pathIndex": 54087, "seqno": 54089, "boundsPt": [409.3077087402344, 199.59519958496094, 410.0867004394531, 199.71420288085938], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.0867004394531, 199.71420288085938], [409.3077087402344, 199.59519958496094]]}
  ] },
  { "pathIndex": 54088, "seqno": 54090, "boundsPt": [409.247314453125, 199.59521484375, 409.30731201171875, 199.98521423339844], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.30731201171875, 199.59521484375], [409.247314453125, 199.98521423339844]]}
  ] },
  { "pathIndex": 54089, "seqno": 54091, "boundsPt": [409.2477111816406, 199.98489379882812, 410.0267028808594, 200.10289001464844], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.2477111816406, 199.98489379882812], [410.0267028808594, 200.10289001464844]]}
  ] },
  { "pathIndex": 54090, "seqno": 54092, "boundsPt": [411.1333923339844, 192.0782012939453, 411.1864013671875, 192.46820068359375], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.1333923339844, 192.46820068359375], [411.1864013671875, 192.0782012939453]]}
  ] },
  { "pathIndex": 54091, "seqno": 54093, "boundsPt": [410.4054870605469, 191.97079467773438, 411.1864929199219, 192.07778930664062], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.1864929199219, 192.07778930664062], [410.4054870605469, 191.97079467773438]]}
  ] },
  { "pathIndex": 54092, "seqno": 54094, "boundsPt": [410.35260009765625, 191.9713134765625, 410.4056091308594, 192.36131286621094], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.4056091308594, 191.9713134765625], [410.35260009765625, 192.36131286621094]]}
  ] },
  { "pathIndex": 54093, "seqno": 54095, "boundsPt": [410.3526916503906, 192.36160278320312, 411.1336975097656, 192.46859741210938], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.3526916503906, 192.36160278320312], [411.1336975097656, 192.46859741210938]]}
  ] },
  { "pathIndex": 54094, "seqno": 54096, "boundsPt": [412.1234130859375, 184.42449951171875, 412.1694030761719, 184.81649780273438], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.1234130859375, 184.81649780273438], [412.1694030761719, 184.42449951171875]]}
  ] },
  { "pathIndex": 54095, "seqno": 54097, "boundsPt": [411.3876953125, 184.33059692382812, 412.1697082519531, 184.42559814453125], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.1697082519531, 184.42559814453125], [411.3876953125, 184.33059692382812]]}
  ] },
  { "pathIndex": 54096, "seqno": 54098, "boundsPt": [411.34051513671875, 184.330810546875, 411.38751220703125, 184.72280883789062], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.38751220703125, 184.330810546875], [411.34051513671875, 184.72280883789062]]}
  ] },
  { "pathIndex": 54097, "seqno": 54099, "boundsPt": [411.3399963378906, 184.72189331054688, 412.12298583984375, 184.81689453125], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.3399963378906, 184.72189331054688], [412.12298583984375, 184.81689453125]]}
  ] },
  { "pathIndex": 54098, "seqno": 54100, "boundsPt": [410.4731140136719, 200.17208862304688, 410.8041076660156, 200.22508239746094], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.4731140136719, 200.17208862304688], [410.8041076660156, 200.22508239746094]]}
  ] },
  { "pathIndex": 54099, "seqno": 54101, "boundsPt": [409.67498779296875, 200.22518920898438, 410.8039855957031, 207.2651824951172], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.8039855957031, 200.22518920898438], [409.67498779296875, 207.2651824951172]]}
  ] },
  { "pathIndex": 54100, "seqno": 54102, "boundsPt": [408.8979187011719, 200.10330200195312, 410.0259094238281, 207.13330078125], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.0259094238281, 200.10330200195312], [408.8979187011719, 207.13330078125]]}
  ] },
  { "pathIndex": 54101, "seqno": 54103, "boundsPt": [410.5325012207031, 199.78240966796875, 410.8634948730469, 199.82940673828125], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.8634948730469, 199.82940673828125], [410.5325012207031, 199.78240966796875]]}
  ] },
  { "pathIndex": 54102, "seqno": 54104, "boundsPt": [411.580810546875, 192.52969360351562, 411.9128112792969, 192.5786895751953], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.580810546875, 192.52969360351562], [411.9128112792969, 192.5786895751953]]}
  ] },
  { "pathIndex": 54103, "seqno": 54105, "boundsPt": [410.8638916015625, 192.57809448242188, 411.91290283203125, 199.8291015625], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.91290283203125, 192.57809448242188], [410.8638916015625, 199.8291015625]]}
  ] },
  { "pathIndex": 54104, "seqno": 54106, "boundsPt": [410.0841979980469, 192.46820068359375, 411.1322021484375, 199.71420288085938], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.1322021484375, 192.46820068359375], [410.0841979980469, 199.71420288085938]]}
  ] },
  { "pathIndex": 54105, "seqno": 54107, "boundsPt": [411.63519287109375, 192.13870239257812, 411.9671936035156, 192.18170166015625], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.9671936035156, 192.18170166015625], [411.63519287109375, 192.13870239257812]]}
  ] },
  { "pathIndex": 54106, "seqno": 54108, "boundsPt": [412.5707092285156, 184.87149047851562, 412.9027099609375, 184.9134979248047], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.5707092285156, 184.87149047851562], [412.9027099609375, 184.9134979248047]]}
  ] },
  { "pathIndex": 54107, "seqno": 54109, "boundsPt": [411.9678039550781, 184.91378784179688, 412.9028015136719, 192.1807861328125], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.9028015136719, 184.91378784179688], [411.9678039550781, 192.1807861328125]]}
  ] },
  { "pathIndex": 54108, "seqno": 54110, "boundsPt": [411.185791015625, 184.81649780273438, 412.12078857421875, 192.07749938964844], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.12078857421875, 184.81649780273438], [411.185791015625, 192.07749938964844]]}
  ] },
  { "pathIndex": 54109, "seqno": 54111, "boundsPt": [412.6186828613281, 184.4794921875, 412.9516906738281, 184.51748657226562], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.9516906738281, 184.51748657226562], [412.6186828613281, 184.4794921875]]}
  ] },
  { "pathIndex": 54110, "seqno": 54112, "boundsPt": [412.95208740234375, 178.30230712890625, 413.6611022949219, 184.51730346679688], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [413.6611022949219, 178.30230712890625], [412.95208740234375, 184.51730346679688]]}
  ] },
  { "pathIndex": 54111, "seqno": 54113, "boundsPt": [412.1687927246094, 178.21829223632812, 412.8778076171875, 184.42630004882812], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.8778076171875, 178.21829223632812], [412.1687927246094, 184.42630004882812]]}
  ] },
  { "pathIndex": 54112, "seqno": 54114, "boundsPt": [409.6130065917969, 207.265380859375, 409.6750183105469, 207.65438842773438], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.6130065917969, 207.65438842773438], [409.6750183105469, 207.265380859375]]}
  ] },
  { "pathIndex": 54113, "seqno": 54115, "boundsPt": [408.8971862792969, 207.14041137695312, 409.6752014160156, 207.26541137695312], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.6752014160156, 207.26541137695312], [408.8971862792969, 207.14041137695312]]}
  ] },
  { "pathIndex": 54114, "seqno": 54116, "boundsPt": [408.8351745605469, 207.14028930664062, 408.8971862792969, 207.529296875], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.8971862792969, 207.14028930664062], [408.8351745605469, 207.529296875]]}
  ] },
  { "pathIndex": 54115, "seqno": 54117, "boundsPt": [408.8349914550781, 207.529296875, 409.6130065917969, 207.654296875], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.8349914550781, 207.529296875], [409.6130065917969, 207.654296875]]}
  ] },
  { "pathIndex": 54116, "seqno": 54118, "boundsPt": [413.6611022949219, 177.91030883789062, 413.70611572265625, 178.30230712890625], "style": "style-10", "roles": ["corridor-east-pane-detail", "room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [413.6611022949219, 178.30230712890625], [413.70611572265625, 177.91030883789062]]}
  ] },
  { "pathIndex": 54117, "seqno": 54119, "boundsPt": [412.923095703125, 177.8217010498047, 413.7060852050781, 177.91070556640625], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [413.7060852050781, 177.91070556640625], [412.923095703125, 177.8217010498047]]}
  ] },
  { "pathIndex": 54118, "seqno": 54120, "boundsPt": [412.8777770996094, 177.8212890625, 412.92279052734375, 178.21328735351562], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.92279052734375, 177.8212890625], [412.8777770996094, 178.21328735351562]]}
  ] },
  { "pathIndex": 54119, "seqno": 54121, "boundsPt": [412.8778076171875, 178.2130126953125, 413.6607971191406, 178.30201721191406], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.8778076171875, 178.2130126953125], [413.6607971191406, 178.30201721191406]]}
  ] },
  { "pathIndex": 54120, "seqno": 54122, "boundsPt": [410.8053894042969, 199.83241271972656, 410.8653869628906, 200.222412109375], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.8053894042969, 200.222412109375], [410.8653869628906, 199.83241271972656]]}
  ] },
  { "pathIndex": 54121, "seqno": 54123, "boundsPt": [410.0868835449219, 199.71470642089844, 410.8648986816406, 199.83270263671875], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.8648986816406, 199.83270263671875], [410.0868835449219, 199.71470642089844]]}
  ] },
  { "pathIndex": 54122, "seqno": 54124, "boundsPt": [410.0267028808594, 199.71420288085938, 410.0867004394531, 200.10321044921875], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.0867004394531, 199.71420288085938], [410.0267028808594, 200.10321044921875]]}
  ] },
  { "pathIndex": 54123, "seqno": 54125, "boundsPt": [410.027099609375, 200.10330200195312, 410.80511474609375, 200.22230529785156], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.027099609375, 200.10330200195312], [410.80511474609375, 200.22230529785156]]}
  ] },
  { "pathIndex": 54124, "seqno": 54126, "boundsPt": [411.914306640625, 192.18470764160156, 411.9673156738281, 192.57470703125], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.914306640625, 192.57470703125], [411.9673156738281, 192.18470764160156]]}
  ] },
  { "pathIndex": 54125, "seqno": 54127, "boundsPt": [411.1861877441406, 192.07791137695312, 411.9671936035156, 192.18490600585938], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.9671936035156, 192.18490600585938], [411.1861877441406, 192.07791137695312]]}
  ] },
  { "pathIndex": 54126, "seqno": 54128, "boundsPt": [411.13348388671875, 192.07778930664062, 411.1864929199219, 192.46778869628906], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.1864929199219, 192.07778930664062], [411.13348388671875, 192.46778869628906]]}
  ] },
  { "pathIndex": 54127, "seqno": 54129, "boundsPt": [411.1333923339844, 192.46820068359375, 411.9143981933594, 192.5751953125], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.1333923339844, 192.46820068359375], [411.9143981933594, 192.5751953125]]}
  ] },
  { "pathIndex": 54128, "seqno": 54130, "boundsPt": [412.9056091308594, 184.519287109375, 412.95159912109375, 184.91128540039062], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.9056091308594, 184.91128540039062], [412.95159912109375, 184.519287109375]]}
  ] },
  { "pathIndex": 54129, "seqno": 54131, "boundsPt": [412.169677734375, 184.42510986328125, 412.9516906738281, 184.52011108398438], "style": "style-10", "roles": ["room-southeast-pane-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.9516906738281, 184.52011108398438], [412.169677734375, 184.42510986328125]]}
  ] },
  { "pathIndex": 54178, "seqno": 54180, "boundsPt": [442.923095703125, 187.49639892578125, 442.9610900878906, 187.50839233398438], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.923095703125, 187.49639892578125], [442.9610900878906, 187.50839233398438]]}
  ] },
  { "pathIndex": 54179, "seqno": 54181, "boundsPt": [442.9609069824219, 180.41439819335938, 445.1199035644531, 187.50839233398438], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [445.1199035644531, 180.41439819335938], [442.9609069824219, 187.50839233398438]]}
  ] },
  { "pathIndex": 54180, "seqno": 54182, "boundsPt": [442.9228820800781, 180.4031982421875, 445.0828857421875, 187.49620056152344], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [445.0828857421875, 180.4031982421875], [442.9228820800781, 187.49620056152344]]}
  ] },
  { "pathIndex": 54181, "seqno": 54183, "boundsPt": [442.40838623046875, 187.36468505859375, 442.46337890625, 187.3826904296875], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.40838623046875, 187.36468505859375], [442.46337890625, 187.3826904296875]]}
  ] },
  { "pathIndex": 54182, "seqno": 54184, "boundsPt": [442.8597106933594, 187.50241088867188, 442.9167175292969, 187.52041625976562], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.8597106933594, 187.50241088867188], [442.9167175292969, 187.52041625976562]]}
  ] },
  { "pathIndex": 54183, "seqno": 54185, "boundsPt": [442.3765869140625, 187.33029174804688, 442.4145812988281, 187.34129333496094], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.3765869140625, 187.33029174804688], [442.4145812988281, 187.34129333496094]]}
  ] },
  { "pathIndex": 54184, "seqno": 54186, "boundsPt": [442.4143981933594, 180.2484130859375, 444.5733947753906, 187.34141540527344], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [444.5733947753906, 180.2484130859375], [442.4143981933594, 187.34141540527344]]}
  ] },
  { "pathIndex": 54185, "seqno": 54187, "boundsPt": [442.472412109375, 180.23651123046875, 444.5364074707031, 187.01751708984375], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [444.5364074707031, 180.23651123046875], [442.472412109375, 187.01751708984375]]}
  ] },
  { "pathIndex": 54186, "seqno": 54188, "boundsPt": [445.1189880371094, 169.21359252929688, 448.52899169921875, 180.4145965576172], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [448.52899169921875, 169.21359252929688], [445.1189880371094, 180.4145965576172]]}
  ] },
  { "pathIndex": 54187, "seqno": 54189, "boundsPt": [445.0823974609375, 169.20230102539062, 448.4903869628906, 180.40330505371094], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [448.4903869628906, 169.20230102539062], [445.0823974609375, 180.40330505371094]]}
  ] },
  { "pathIndex": 54188, "seqno": 54190, "boundsPt": [444.57220458984375, 169.04739379882812, 447.9822082519531, 180.24839782714844], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [447.9822082519531, 169.04739379882812], [444.57220458984375, 180.24839782714844]]}
  ] },
  { "pathIndex": 54189, "seqno": 54191, "boundsPt": [444.5360107421875, 169.03619384765625, 447.9440002441406, 180.23619079589844], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [447.9440002441406, 169.03619384765625], [444.5360107421875, 180.23619079589844]]}
  ] },
  { "pathIndex": 54190, "seqno": 54192, "boundsPt": [448.52850341796875, 158.0126953125, 451.9364929199219, 169.2126922607422], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [451.9364929199219, 158.0126953125], [448.52850341796875, 169.2126922607422]]}
  ] },
  { "pathIndex": 54191, "seqno": 54193, "boundsPt": [448.489501953125, 158.00149536132812, 451.8995056152344, 169.2014923095703], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [451.8995056152344, 158.00149536132812], [448.489501953125, 169.2014923095703]]}
  ] },
  { "pathIndex": 54192, "seqno": 54194, "boundsPt": [447.9820251464844, 157.84658813476562, 451.3900146484375, 169.0465850830078], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [451.3900146484375, 157.84658813476562], [447.9820251464844, 169.0465850830078]]}
  ] },
  { "pathIndex": 54193, "seqno": 54195, "boundsPt": [447.94281005859375, 157.83468627929688, 451.3528137207031, 169.0356903076172], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [451.3528137207031, 157.83468627929688], [447.94281005859375, 169.0356903076172]]}
  ] },
  { "pathIndex": 54194, "seqno": 54196, "boundsPt": [451.9375, 146.81100463867188, 455.3454895019531, 158.0120086669922], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [455.3454895019531, 146.81100463867188], [451.9375, 158.0120086669922]]}
  ] },
  { "pathIndex": 54195, "seqno": 54197, "boundsPt": [451.8994140625, 146.7998046875, 455.30841064453125, 157.9998016357422], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [455.30841064453125, 146.7998046875], [451.8994140625, 157.9998016357422]]}
  ] },
  { "pathIndex": 54196, "seqno": 54198, "boundsPt": [451.3910217285156, 146.64511108398438, 454.79901123046875, 157.8461151123047], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [454.79901123046875, 146.64511108398438], [451.3910217285156, 157.8461151123047]]}
  ] },
  { "pathIndex": 54197, "seqno": 54199, "boundsPt": [451.35198974609375, 146.6337890625, 454.7619934082031, 157.8337860107422], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [454.7619934082031, 146.6337890625], [451.35198974609375, 157.8337860107422]]}
  ] },
  { "pathIndex": 54198, "seqno": 54200, "boundsPt": [455.34478759765625, 135.60699462890625, 458.75579833984375, 146.8109893798828], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [458.75579833984375, 135.60699462890625], [455.34478759765625, 146.8109893798828]]}
  ] },
  { "pathIndex": 54199, "seqno": 54201, "boundsPt": [455.3074035644531, 135.59579467773438, 458.7174072265625, 146.79978942871094], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [458.7174072265625, 135.59579467773438], [455.3074035644531, 146.79978942871094]]}
  ] },
  { "pathIndex": 54200, "seqno": 54202, "boundsPt": [454.7981872558594, 135.44088745117188, 458.2091979980469, 146.64488220214844], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [458.2091979980469, 135.44088745117188], [454.7981872558594, 146.64488220214844]]}
  ] },
  { "pathIndex": 54201, "seqno": 54203, "boundsPt": [454.76080322265625, 135.42898559570312, 458.1708068847656, 146.6329803466797], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [458.1708068847656, 135.42898559570312], [454.76080322265625, 146.6329803466797]]}
  ] },
  { "pathIndex": 54208, "seqno": 54210, "boundsPt": [428.8678894042969, 233.684814453125, 428.9058837890625, 233.69581604003906], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.8678894042969, 233.684814453125], [428.9058837890625, 233.69581604003906]]}
  ] },
  { "pathIndex": 54209, "seqno": 54211, "boundsPt": [428.9059143066406, 225.1702880859375, 431.4999084472656, 233.6962890625], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [431.4999084472656, 225.1702880859375], [428.9059143066406, 233.6962890625]]}
  ] },
  { "pathIndex": 54210, "seqno": 54212, "boundsPt": [428.8678894042969, 225.15908813476562, 431.462890625, 233.68508911132812], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [431.462890625, 225.15908813476562], [428.8678894042969, 233.68508911132812]]}
  ] },
  { "pathIndex": 54211, "seqno": 54213, "boundsPt": [428.3529968261719, 233.5531005859375, 428.4079895019531, 233.57110595703125], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.3529968261719, 233.5531005859375], [428.4079895019531, 233.57110595703125]]}
  ] },
  { "pathIndex": 54212, "seqno": 54214, "boundsPt": [428.8042907714844, 233.69009399414062, 428.8612976074219, 233.70809936523438], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.8042907714844, 233.69009399414062], [428.8612976074219, 233.70809936523438]]}
  ] },
  { "pathIndex": 54213, "seqno": 54215, "boundsPt": [428.3211975097656, 233.51800537109375, 428.35919189453125, 233.52999877929688], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.3211975097656, 233.51800537109375], [428.35919189453125, 233.52999877929688]]}
  ] },
  { "pathIndex": 54214, "seqno": 54216, "boundsPt": [428.3594055175781, 225.00421142578125, 430.9533996582031, 233.53021240234375], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [430.9533996582031, 225.00421142578125], [428.3594055175781, 233.53021240234375]]}
  ] },
  { "pathIndex": 54215, "seqno": 54217, "boundsPt": [428.3203125, 229.36129760742188, 429.5863037109375, 233.51730346679688], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [429.5863037109375, 229.36129760742188], [428.3203125, 233.51730346679688]]}
  ] },
  { "pathIndex": 54216, "seqno": 54218, "boundsPt": [431.4989013671875, 213.96939086914062, 434.9089050292969, 225.17039489746094], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [434.9089050292969, 213.96939086914062], [431.4989013671875, 225.17039489746094]]}
  ] },
  { "pathIndex": 54217, "seqno": 54219, "boundsPt": [431.4618835449219, 213.95748901367188, 434.87188720703125, 225.1584930419922], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [434.87188720703125, 213.95748901367188], [431.4618835449219, 225.1584930419922]]}
  ] },
  { "pathIndex": 54218, "seqno": 54220, "boundsPt": [430.9524841308594, 213.80270385742188, 434.36248779296875, 225.0037078857422], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [434.36248779296875, 213.80270385742188], [430.9524841308594, 225.0037078857422]]}
  ] },
  { "pathIndex": 54219, "seqno": 54221, "boundsPt": [434.90789794921875, 202.76779174804688, 438.3179016113281, 213.9687957763672], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [438.3179016113281, 202.76779174804688], [434.90789794921875, 213.9687957763672]]}
  ] },
  { "pathIndex": 54220, "seqno": 54222, "boundsPt": [434.87152099609375, 202.756591796875, 438.2795104980469, 213.9575958251953], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [438.2795104980469, 202.756591796875], [434.87152099609375, 213.9575958251953]]}
  ] },
  { "pathIndex": 54221, "seqno": 54223, "boundsPt": [434.36138916015625, 202.60189819335938, 437.7713928222656, 213.8029022216797], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [437.7713928222656, 202.60189819335938], [434.36138916015625, 213.8029022216797]]}
  ] },
  { "pathIndex": 54222, "seqno": 54224, "boundsPt": [438.31689453125, 191.56631469726562, 441.7268981933594, 202.76731872558594], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [441.7268981933594, 191.56631469726562], [438.31689453125, 202.76731872558594]]}
  ] },
  { "pathIndex": 54223, "seqno": 54225, "boundsPt": [438.27850341796875, 191.55511474609375, 441.6885070800781, 202.75611877441406], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [441.6885070800781, 191.55511474609375], [438.27850341796875, 202.75611877441406]]}
  ] },
  { "pathIndex": 54224, "seqno": 54226, "boundsPt": [437.7702941894531, 191.40020751953125, 441.1802978515625, 202.60121154785156], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [441.1802978515625, 191.40020751953125], [437.7702941894531, 202.60121154785156]]}
  ] },
  { "pathIndex": 54225, "seqno": 54227, "boundsPt": [441.72760009765625, 187.50830078125, 442.96160888671875, 191.5673065185547], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.96160888671875, 187.50830078125], [441.72760009765625, 191.5673065185547]]}
  ] },
  { "pathIndex": 54226, "seqno": 54228, "boundsPt": [442.9236145019531, 187.49630737304688, 442.96160888671875, 187.50830078125], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.96160888671875, 187.50830078125], [442.9236145019531, 187.49630737304688]]}
  ] },
  { "pathIndex": 54227, "seqno": 54229, "boundsPt": [441.6881103515625, 187.49639892578125, 442.923095703125, 191.55540466308594], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.923095703125, 187.49639892578125], [441.6881103515625, 191.55540466308594]]}
  ] },
  { "pathIndex": 54228, "seqno": 54230, "boundsPt": [442.8595886230469, 187.5015869140625, 442.9165954589844, 187.51959228515625], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.9165954589844, 187.51959228515625], [442.8595886230469, 187.5015869140625]]}
  ] },
  { "pathIndex": 54229, "seqno": 54231, "boundsPt": [442.4081115722656, 187.3638916015625, 442.464111328125, 187.38189697265625], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.464111328125, 187.38189697265625], [442.4081115722656, 187.3638916015625]]}
  ] },
  { "pathIndex": 54230, "seqno": 54232, "boundsPt": [441.1799011230469, 187.34149169921875, 442.4148864746094, 191.40049743652344], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.4148864746094, 187.34149169921875], [441.1799011230469, 191.40049743652344]]}
  ] },
  { "pathIndex": 54231, "seqno": 54233, "boundsPt": [442.37689208984375, 187.3304901123047, 442.4148864746094, 187.34149169921875], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [442.4148864746094, 187.34149169921875], [442.37689208984375, 187.3304901123047]]}
  ] },
  { "pathIndex": 54232, "seqno": 54234, "boundsPt": [420.7200012207031, 260.4621887207031, 420.7569885253906, 260.47418212890625], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.7200012207031, 260.4621887207031], [420.7569885253906, 260.47418212890625]]}
  ] },
  { "pathIndex": 54233, "seqno": 54235, "boundsPt": [420.7568054199219, 258.8232116699219, 421.2597961425781, 260.4742126464844], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [421.2597961425781, 258.8232116699219], [420.7568054199219, 260.4742126464844]]}
  ] },
  { "pathIndex": 54234, "seqno": 54236, "boundsPt": [420.72039794921875, 258.81201171875, 421.2214050292969, 260.4630126953125], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [421.2214050292969, 258.81201171875], [420.72039794921875, 260.4630126953125]]}
  ] },
  { "pathIndex": 54235, "seqno": 54237, "boundsPt": [420.20379638671875, 260.3312072753906, 420.2587890625, 260.3492126464844], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.20379638671875, 260.3312072753906], [420.2587890625, 260.3492126464844]]}
  ] },
  { "pathIndex": 54236, "seqno": 54238, "boundsPt": [420.6564025878906, 260.46881103515625, 420.71240234375, 260.48681640625], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.6564025878906, 260.46881103515625], [420.71240234375, 260.48681640625]]}
  ] },
  { "pathIndex": 54237, "seqno": 54239, "boundsPt": [420.1733093261719, 260.29620361328125, 420.2102966308594, 260.30718994140625], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.1733093261719, 260.29620361328125], [420.2102966308594, 260.30718994140625]]}
  ] },
  { "pathIndex": 54238, "seqno": 54240, "boundsPt": [420.2102966308594, 258.6571960449219, 420.7132873535156, 260.3081970214844], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.7132873535156, 258.6571960449219], [420.2102966308594, 260.3081970214844]]}
  ] },
  { "pathIndex": 54239, "seqno": 54241, "boundsPt": [420.1739807128906, 258.6452941894531, 420.67498779296875, 260.2962951660156], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.67498779296875, 258.6452941894531], [420.1739807128906, 260.2962951660156]]}
  ] },
  { "pathIndex": 54240, "seqno": 54242, "boundsPt": [421.259521484375, 247.62240600585938, 424.6675109863281, 258.8233947753906], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [424.6675109863281, 247.62240600585938], [421.259521484375, 258.8233947753906]]}
  ] },
  { "pathIndex": 54241, "seqno": 54243, "boundsPt": [421.22039794921875, 247.61111450195312, 424.6304016113281, 258.8121032714844], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [424.6304016113281, 247.61111450195312], [421.22039794921875, 258.8121032714844]]}
  ] },
  { "pathIndex": 54242, "seqno": 54244, "boundsPt": [420.7127990722656, 247.456298828125, 424.12078857421875, 258.65728759765625], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [424.12078857421875, 247.456298828125], [420.7127990722656, 258.65728759765625]]}
  ] },
  { "pathIndex": 54243, "seqno": 54245, "boundsPt": [420.67388916015625, 247.44509887695312, 424.0838928222656, 258.6451110839844], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [424.0838928222656, 247.44509887695312], [420.67388916015625, 258.6451110839844]]}
  ] },
  { "pathIndex": 54244, "seqno": 54246, "boundsPt": [424.6663818359375, 236.42138671875, 428.0763854980469, 247.6213836669922], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.0763854980469, 236.42138671875], [424.6663818359375, 247.6213836669922]]}
  ] },
  { "pathIndex": 54245, "seqno": 54247, "boundsPt": [424.6293029785156, 236.41018676757812, 428.039306640625, 247.6101837158203], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.039306640625, 236.41018676757812], [424.6293029785156, 247.6101837158203]]}
  ] },
  { "pathIndex": 54246, "seqno": 54248, "boundsPt": [424.1199951171875, 236.25540161132812, 427.5299987792969, 247.4553985595703], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [427.5299987792969, 236.25540161132812], [424.1199951171875, 247.4553985595703]]}
  ] },
  { "pathIndex": 54247, "seqno": 54249, "boundsPt": [424.0828857421875, 236.24349975585938, 427.4928894042969, 247.4445037841797], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [427.4928894042969, 236.24349975585938], [424.0828857421875, 247.4445037841797]]}
  ] },
  { "pathIndex": 54248, "seqno": 54250, "boundsPt": [428.0771789550781, 233.69601440429688, 428.90618896484375, 236.4210205078125], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.90618896484375, 233.69601440429688], [428.0771789550781, 236.4210205078125]]}
  ] },
  { "pathIndex": 54249, "seqno": 54251, "boundsPt": [428.8681945800781, 233.6850128173828, 428.90618896484375, 233.69601440429688], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.90618896484375, 233.69601440429688], [428.8681945800781, 233.6850128173828]]}
  ] },
  { "pathIndex": 54250, "seqno": 54252, "boundsPt": [428.0398864746094, 233.684814453125, 428.8678894042969, 236.4088134765625], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.8678894042969, 233.684814453125], [428.0398864746094, 236.4088134765625]]}
  ] },
  { "pathIndex": 54251, "seqno": 54253, "boundsPt": [428.80419921875, 233.68930053710938, 428.8612060546875, 233.70730590820312], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.8612060546875, 233.70730590820312], [428.80419921875, 233.68930053710938]]}
  ] },
  { "pathIndex": 54252, "seqno": 54254, "boundsPt": [428.35260009765625, 233.55230712890625, 428.4085998535156, 233.5703125], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.4085998535156, 233.5703125], [428.35260009765625, 233.55230712890625]]}
  ] },
  { "pathIndex": 54253, "seqno": 54255, "boundsPt": [427.53070068359375, 233.52999877929688, 428.3597106933594, 236.2550048828125], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.3597106933594, 233.52999877929688], [427.53070068359375, 236.2550048828125]]}
  ] },
  { "pathIndex": 54254, "seqno": 54256, "boundsPt": [428.32171630859375, 233.51800537109375, 428.3597106933594, 233.52999877929688], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.3597106933594, 233.52999877929688], [428.32171630859375, 233.51800537109375]]}
  ] },
  { "pathIndex": 54255, "seqno": 54257, "boundsPt": [427.4931945800781, 233.51800537109375, 428.3211975097656, 236.24301147460938], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [428.3211975097656, 233.51800537109375], [427.4931945800781, 236.24301147460938]]}
  ] },
  { "pathIndex": 54515, "seqno": 54517, "boundsPt": [414.4573974609375, 269.9743957519531, 417.8653869628906, 281.1753845214844], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [417.8653869628906, 269.9743957519531], [414.4573974609375, 281.1753845214844]]}
  ] },
  { "pathIndex": 54516, "seqno": 54518, "boundsPt": [414.41839599609375, 269.96319580078125, 417.8283996582031, 281.1641845703125], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [417.8283996582031, 269.96319580078125], [414.41839599609375, 281.1641845703125]]}
  ] },
  { "pathIndex": 54517, "seqno": 54519, "boundsPt": [413.9101867675781, 269.8077087402344, 417.3201904296875, 281.0086975097656], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [417.3201904296875, 269.8077087402344], [413.9101867675781, 281.0086975097656]]}
  ] },
  { "pathIndex": 54518, "seqno": 54520, "boundsPt": [413.87188720703125, 269.7965087890625, 417.2818908691406, 280.99749755859375], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [417.2818908691406, 269.7965087890625], [413.87188720703125, 280.99749755859375]]}
  ] },
  { "pathIndex": 54519, "seqno": 54521, "boundsPt": [417.864990234375, 260.4740905761719, 420.7569885253906, 269.97509765625], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.7569885253906, 260.4740905761719], [417.864990234375, 269.97509765625]]}
  ] },
  { "pathIndex": 54520, "seqno": 54522, "boundsPt": [420.7200012207031, 260.46209716796875, 420.7569885253906, 260.4740905761719], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.7569885253906, 260.4740905761719], [420.7200012207031, 260.46209716796875]]}
  ] },
  { "pathIndex": 54521, "seqno": 54523, "boundsPt": [417.8280029296875, 260.4621887207031, 420.7200012207031, 269.96319580078125], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.7200012207031, 260.4621887207031], [417.8280029296875, 269.96319580078125]]}
  ] },
  { "pathIndex": 54522, "seqno": 54524, "boundsPt": [420.656005859375, 260.4679870605469, 420.7120056152344, 260.4859924316406], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.7120056152344, 260.4859924316406], [420.656005859375, 260.4679870605469]]}
  ] },
  { "pathIndex": 54523, "seqno": 54525, "boundsPt": [420.2033996582031, 260.3302917480469, 420.2593994140625, 260.3482971191406], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.2593994140625, 260.3482971191406], [420.2033996582031, 260.3302917480469]]}
  ] },
  { "pathIndex": 54524, "seqno": 54526, "boundsPt": [417.31939697265625, 260.3074035644531, 420.21038818359375, 269.80841064453125], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.21038818359375, 260.3074035644531], [417.31939697265625, 269.80841064453125]]}
  ] },
  { "pathIndex": 54525, "seqno": 54527, "boundsPt": [420.17340087890625, 260.2964172363281, 420.21038818359375, 260.3074035644531], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.21038818359375, 260.3074035644531], [420.17340087890625, 260.2964172363281]]}
  ] },
  { "pathIndex": 54526, "seqno": 54528, "boundsPt": [417.28131103515625, 260.29620361328125, 420.1733093261719, 269.7972106933594], "style": "style-10", "roles": ["corridor-east-pane-detail"], "items": [
    {"itemIndex": 0, "command": ["l", [420.1733093261719, 260.29620361328125], [417.28131103515625, 269.7972106933594]]}
  ] },
  { "pathIndex": 54576, "seqno": 54578, "boundsPt": [426.706787109375, 123.15020751953125, 426.7107849121094, 123.189208984375], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.7107849121094, 123.15020751953125], [426.706787109375, 123.189208984375]]}
  ] },
  { "pathIndex": 54577, "seqno": 54579, "boundsPt": [426.710693359375, 123.09188842773438, 426.71868896484375, 123.14988708496094], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.71868896484375, 123.09188842773438], [426.710693359375, 123.14988708496094]]}
  ] },
  { "pathIndex": 54578, "seqno": 54580, "boundsPt": [426.7715148925781, 122.622802734375, 426.7795104980469, 122.68080139160156], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.7795104980469, 122.622802734375], [426.7715148925781, 122.68080139160156]]}
  ] },
  { "pathIndex": 54579, "seqno": 54581, "boundsPt": [426.7795104980469, 122.58380126953125, 426.78350830078125, 122.622802734375], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.78350830078125, 122.58380126953125], [426.7795104980469, 122.622802734375]]}
  ] },
  { "pathIndex": 54634, "seqno": 54636, "boundsPt": [449.0581970214844, 126.01470947265625, 449.0632019042969, 126.0537109375], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.0581970214844, 126.0537109375], [449.0632019042969, 126.01470947265625]]}
  ] },
  { "pathIndex": 54635, "seqno": 54637, "boundsPt": [449.0635070800781, 125.95658874511719, 449.0715026855469, 126.01458740234375], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.0635070800781, 126.01458740234375], [449.0715026855469, 125.95658874511719]]}
  ] },
  { "pathIndex": 54636, "seqno": 54638, "boundsPt": [449.1243896484375, 125.48820495605469, 449.1313781738281, 125.54620361328125], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.1243896484375, 125.54620361328125], [449.1313781738281, 125.48820495605469]]}
  ] },
  { "pathIndex": 54637, "seqno": 54639, "boundsPt": [449.1310119628906, 125.44821166992188, 449.1360168457031, 125.48721313476562], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.1310119628906, 125.48721313476562], [449.1360168457031, 125.44821166992188]]}
  ] },
  { "pathIndex": 54738, "seqno": 54740, "boundsPt": [410.3288879394531, 169.67568969726562, 410.3569030761719, 169.98968505859375], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.3288879394531, 169.98968505859375], [410.3569030761719, 169.67568969726562]]}
  ] },
  { "pathIndex": 54739, "seqno": 54741, "boundsPt": [409.5706787109375, 169.60641479492188, 410.356689453125, 169.6754150390625], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.356689453125, 169.6754150390625], [409.5706787109375, 169.60641479492188]]}
  ] },
  { "pathIndex": 54740, "seqno": 54742, "boundsPt": [409.5435791015625, 169.60659790039062, 409.5705871582031, 169.9196014404297], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.5705871582031, 169.60659790039062], [409.5435791015625, 169.9196014404297]]}
  ] },
  { "pathIndex": 54741, "seqno": 54743, "boundsPt": [409.544189453125, 169.9202880859375, 410.3291931152344, 169.98928833007812], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.544189453125, 169.9202880859375], [410.3291931152344, 169.98928833007812]]}
  ] },
  { "pathIndex": 54742, "seqno": 54744, "boundsPt": [410.55780029296875, 167.07310485839844, 410.5848083496094, 167.3861083984375], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.55780029296875, 167.3861083984375], [410.5848083496094, 167.07310485839844]]}
  ] },
  { "pathIndex": 54743, "seqno": 54745, "boundsPt": [409.7994079589844, 167.0063934326172, 410.58441162109375, 167.0723876953125], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.58441162109375, 167.0723876953125], [409.7994079589844, 167.0063934326172]]}
  ] },
  { "pathIndex": 54744, "seqno": 54746, "boundsPt": [409.7725830078125, 167.005615234375, 409.7995910644531, 167.31961059570312], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.7995910644531, 167.005615234375], [409.7725830078125, 167.31961059570312]]}
  ] },
  { "pathIndex": 54745, "seqno": 54747, "boundsPt": [409.77301025390625, 167.31979370117188, 410.5580139160156, 167.3857879638672], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.77301025390625, 167.31979370117188], [410.5580139160156, 167.3857879638672]]}
  ] },
  { "pathIndex": 54746, "seqno": 54748, "boundsPt": [412.0083923339844, 143.32040405273438, 412.0203857421875, 143.6343994140625], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.0083923339844, 143.6343994140625], [412.0203857421875, 143.32040405273438]]}
  ] },
  { "pathIndex": 54747, "seqno": 54749, "boundsPt": [411.2331237792969, 143.29148864746094, 412.0201110839844, 143.31948852539062], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.0201110839844, 143.31948852539062], [411.2331237792969, 143.29148864746094]]}
  ] },
  { "pathIndex": 54748, "seqno": 54750, "boundsPt": [411.2218017578125, 143.29098510742188, 411.2327880859375, 143.60498046875], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.2327880859375, 143.29098510742188], [411.2218017578125, 143.60498046875]]}
  ] },
  { "pathIndex": 54749, "seqno": 54751, "boundsPt": [411.2221984863281, 143.60598754882812, 412.0082092285156, 143.63499450683594], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.2221984863281, 143.60598754882812], [412.0082092285156, 143.63499450683594]]}
  ] },
  { "pathIndex": 54750, "seqno": 54752, "boundsPt": [410.6252136230469, 154.92039489746094, 410.6722106933594, 155.7073974609375], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.6252136230469, 155.7073974609375], [410.6722106933594, 154.92039489746094]]}
  ] },
  { "pathIndex": 54751, "seqno": 54753, "boundsPt": [409.8869934082031, 154.87359619140625, 410.6730041503906, 154.92059326171875], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.6730041503906, 154.92059326171875], [409.8869934082031, 154.87359619140625]]}
  ] },
  { "pathIndex": 54752, "seqno": 54754, "boundsPt": [409.83990478515625, 154.87298583984375, 409.88690185546875, 155.6599884033203], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.88690185546875, 154.87298583984375], [409.83990478515625, 155.6599884033203]]}
  ] },
  { "pathIndex": 54753, "seqno": 54755, "boundsPt": [409.83929443359375, 155.65969848632812, 410.62530517578125, 155.70669555664062], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.83929443359375, 155.65969848632812], [410.62530517578125, 155.70669555664062]]}
  ] },
  { "pathIndex": 54754, "seqno": 54756, "boundsPt": [409.544189453125, 169.60430908203125, 409.57220458984375, 169.91830444335938], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.544189453125, 169.91830444335938], [409.57220458984375, 169.60430908203125]]}
  ] },
  { "pathIndex": 54755, "seqno": 54757, "boundsPt": [408.7869873046875, 169.53500366210938, 409.5719909667969, 169.60400390625], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.5719909667969, 169.60400390625], [408.7869873046875, 169.53500366210938]]}
  ] },
  { "pathIndex": 54756, "seqno": 54758, "boundsPt": [408.7582092285156, 169.53518676757812, 408.7872009277344, 169.84918212890625], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.7872009277344, 169.53518676757812], [408.7582092285156, 169.84918212890625]]}
  ] },
  { "pathIndex": 54757, "seqno": 54759, "boundsPt": [408.7593994140625, 169.84939575195312, 409.5444030761719, 169.91839599609375], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.7593994140625, 169.84939575195312], [409.5444030761719, 169.91839599609375]]}
  ] },
  { "pathIndex": 54758, "seqno": 54760, "boundsPt": [411.23260498046875, 140.85079956054688, 411.3135986328125, 143.2917938232422], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.3135986328125, 140.85079956054688], [411.23260498046875, 143.2917938232422]]}
  ] },
  { "pathIndex": 54759, "seqno": 54761, "boundsPt": [410.44598388671875, 140.489501953125, 410.5379943847656, 143.2624969482422], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.5379943847656, 140.489501953125], [410.44598388671875, 143.2624969482422]]}
  ] },
  { "pathIndex": 54760, "seqno": 54762, "boundsPt": [409.77301025390625, 167.00621032714844, 409.8000183105469, 167.3192138671875], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.77301025390625, 167.3192138671875], [409.8000183105469, 167.00621032714844]]}
  ] },
  { "pathIndex": 54761, "seqno": 54763, "boundsPt": [409.01458740234375, 166.9396209716797, 409.7995910644531, 167.005615234375], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.7995910644531, 167.005615234375], [409.01458740234375, 166.9396209716797]]}
  ] },
  { "pathIndex": 54762, "seqno": 54764, "boundsPt": [408.9858093261719, 166.93881225585938, 409.0148010253906, 167.25181579589844], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.0148010253906, 166.93881225585938], [408.9858093261719, 167.25181579589844]]}
  ] },
  { "pathIndex": 54763, "seqno": 54765, "boundsPt": [408.9870910644531, 167.25228881835938, 409.7731018066406, 167.3182830810547], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.9870910644531, 167.25228881835938], [409.7731018066406, 167.3182830810547]]}
  ] },
  { "pathIndex": 54764, "seqno": 54766, "boundsPt": [411.2221984863281, 143.2919921875, 411.2331848144531, 143.60598754882812], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.2221984863281, 143.60598754882812], [411.2331848144531, 143.2919921875]]}
  ] },
  { "pathIndex": 54765, "seqno": 54767, "boundsPt": [410.44580078125, 143.2629852294922, 411.2327880859375, 143.29098510742188], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.2327880859375, 143.29098510742188], [410.44580078125, 143.2629852294922]]}
  ] },
  { "pathIndex": 54766, "seqno": 54768, "boundsPt": [410.4333190917969, 143.26260375976562, 410.4453125, 143.57659912109375], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.4453125, 143.26260375976562], [410.4333190917969, 143.57659912109375]]}
  ] },
  { "pathIndex": 54767, "seqno": 54769, "boundsPt": [410.43341064453125, 143.5775146484375, 411.222412109375, 143.6055145263672], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.43341064453125, 143.5775146484375], [411.222412109375, 143.6055145263672]]}
  ] },
  { "pathIndex": 54768, "seqno": 54770, "boundsPt": [408.7872009277344, 169.53448486328125, 409.1202087402344, 169.56448364257812], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.7872009277344, 169.53448486328125], [409.1202087402344, 169.56448364257812]]}
  ] },
  { "pathIndex": 54769, "seqno": 54771, "boundsPt": [409.5729064941406, 167.3192138671875, 409.77191162109375, 169.60520935058594], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.77191162109375, 167.3192138671875], [409.5729064941406, 169.60520935058594]]}
  ] },
  { "pathIndex": 54770, "seqno": 54772, "boundsPt": [408.7880859375, 167.25228881835938, 408.9870910644531, 169.53428649902344], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.9870910644531, 167.25228881835938], [408.7880859375, 169.53428649902344]]}
  ] },
  { "pathIndex": 54771, "seqno": 54773, "boundsPt": [410.5480041503906, 140.17489624023438, 410.5870056152344, 140.1759033203125], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.5870056152344, 140.1759033203125], [410.5480041503906, 140.17489624023438]]}
  ] },
  { "pathIndex": 54772, "seqno": 54774, "boundsPt": [410.5372009277344, 140.17449951171875, 410.5472106933594, 140.48849487304688], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.5472106933594, 140.17449951171875], [410.5372009277344, 140.48849487304688]]}
  ] },
  { "pathIndex": 54773, "seqno": 54775, "boundsPt": [410.5379943847656, 140.489501953125, 410.57598876953125, 140.49050903320312], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.5379943847656, 140.489501953125], [410.57598876953125, 140.49050903320312]]}
  ] },
  { "pathIndex": 54774, "seqno": 54776, "boundsPt": [412.0198974609375, 140.877197265625, 412.10089111328125, 143.31919860839844], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.10089111328125, 140.877197265625], [412.0198974609375, 143.31919860839844]]}
  ] },
  { "pathIndex": 54775, "seqno": 54777, "boundsPt": [411.23260498046875, 140.85079956054688, 411.3135986328125, 143.2917938232422], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.3135986328125, 140.85079956054688], [411.23260498046875, 143.2917938232422]]}
  ] },
  { "pathIndex": 54776, "seqno": 54778, "boundsPt": [409.5719909667969, 169.60519409179688, 409.9049987792969, 169.63519287109375], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.5719909667969, 169.60519409179688], [409.9049987792969, 169.63519287109375]]}
  ] },
  { "pathIndex": 54777, "seqno": 54779, "boundsPt": [410.3568115234375, 167.3861083984375, 410.55780029296875, 169.6761016845703], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.55780029296875, 167.3861083984375], [410.3568115234375, 169.6761016845703]]}
  ] },
  { "pathIndex": 54778, "seqno": 54780, "boundsPt": [409.5729064941406, 167.31979370117188, 409.77191162109375, 169.60479736328125], "style": "style-10", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.77191162109375, 167.31979370117188], [409.5729064941406, 169.60479736328125]]}
  ] },
  { "pathIndex": 54810, "seqno": 54812, "boundsPt": [444.45941162109375, 116.19021606445312, 444.9294128417969, 116.25021362304688], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.9294128417969, 116.25021362304688], [444.45941162109375, 116.19021606445312]]}
  ] },
  { "pathIndex": 54811, "seqno": 54813, "boundsPt": [444.8140869140625, 116.25089263916016, 444.9290771484375, 117.14889526367188], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.8140869140625, 117.14889526367188], [444.9290771484375, 116.25089263916016]]}
  ] },
  { "pathIndex": 54812, "seqno": 54814, "boundsPt": [444.3445129394531, 117.08920288085938, 444.81451416015625, 117.14920043945312], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.3445129394531, 117.08920288085938], [444.81451416015625, 117.14920043945312]]}
  ] },
  { "pathIndex": 54813, "seqno": 54815, "boundsPt": [444.3446044921875, 116.18991088867188, 444.4595947265625, 117.08991241455078], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.4595947265625, 116.18991088867188], [444.3446044921875, 117.08991241455078]]}
  ] },
  { "pathIndex": 54814, "seqno": 54816, "boundsPt": [433.2051086425781, 114.74771118164062, 433.6741027832031, 114.80770874023438], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [433.6741027832031, 114.80770874023438], [433.2051086425781, 114.74771118164062]]}
  ] },
  { "pathIndex": 54815, "seqno": 54817, "boundsPt": [433.5591125488281, 114.80699920654297, 433.6741027832031, 115.70700073242188], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [433.5591125488281, 115.70700073242188], [433.6741027832031, 114.80699920654297]]}
  ] },
  { "pathIndex": 54816, "seqno": 54818, "boundsPt": [433.0906066894531, 115.64691162109375, 433.5596008300781, 115.7069091796875], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [433.0906066894531, 115.64691162109375], [433.5596008300781, 115.7069091796875]]}
  ] },
  { "pathIndex": 54817, "seqno": 54819, "boundsPt": [433.0906982421875, 114.74819946289062, 433.2056884765625, 115.64620208740234], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [433.2056884765625, 114.74819946289062], [433.0906982421875, 115.64620208740234]]}
  ] },
  { "pathIndex": 54818, "seqno": 54820, "boundsPt": [444.9294128417969, 116.25060272216797, 446.9064025878906, 116.50360107421875], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [446.9064025878906, 116.50360107421875], [444.9294128417969, 116.25060272216797]]}
  ] },
  { "pathIndex": 54819, "seqno": 54821, "boundsPt": [444.8143005371094, 117.1493148803711, 446.7912902832031, 117.40231323242188], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [446.7912902832031, 117.40231323242188], [444.8143005371094, 117.1493148803711]]}
  ] },
  { "pathIndex": 54820, "seqno": 54822, "boundsPt": [431.19769287109375, 114.49119567871094, 433.2056884765625, 114.74819946289062], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [433.2056884765625, 114.74819946289062], [431.19769287109375, 114.49119567871094]]}
  ] },
  { "pathIndex": 54821, "seqno": 54823, "boundsPt": [431.0826110839844, 115.38990783691406, 433.0906066894531, 115.64691162109375], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [433.0906066894531, 115.64691162109375], [431.0826110839844, 115.38990783691406]]}
  ] },
  { "pathIndex": 54822, "seqno": 54824, "boundsPt": [430.6131896972656, 115.32919311523438, 431.0821838378906, 115.38919067382812], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [430.6131896972656, 115.32919311523438], [431.0821838378906, 115.38919067382812]]}
  ] },
  { "pathIndex": 54823, "seqno": 54825, "boundsPt": [431.081787109375, 114.4913101196289, 431.19677734375, 115.38931274414062], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [431.081787109375, 115.38931274414062], [431.19677734375, 114.4913101196289]]}
  ] },
  { "pathIndex": 54824, "seqno": 54826, "boundsPt": [430.7279052734375, 114.43069458007812, 431.1968994140625, 114.49069213867188], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [431.1968994140625, 114.49069213867188], [430.7279052734375, 114.43069458007812]]}
  ] },
  { "pathIndex": 54825, "seqno": 54827, "boundsPt": [430.6134948730469, 114.43060302734375, 430.7284851074219, 115.32860565185547], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [430.7284851074219, 114.43060302734375], [430.6134948730469, 115.32860565185547]]}
  ] },
  { "pathIndex": 54826, "seqno": 54828, "boundsPt": [446.7914123535156, 116.50360107421875, 446.9064025878906, 117.40160369873047], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [446.9064025878906, 116.50360107421875], [446.7914123535156, 117.40160369873047]]}
  ] },
  { "pathIndex": 54827, "seqno": 54829, "boundsPt": [446.7912902832031, 117.40231323242188, 447.2602844238281, 117.46231079101562], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [446.7912902832031, 117.40231323242188], [447.2602844238281, 117.46231079101562]]}
  ] },
  { "pathIndex": 54828, "seqno": 54830, "boundsPt": [447.2597961425781, 116.56439971923828, 447.3747863769531, 117.46240234375], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.2597961425781, 117.46240234375], [447.3747863769531, 116.56439971923828]]}
  ] },
  { "pathIndex": 54829, "seqno": 54831, "boundsPt": [446.9059143066406, 116.50381469726562, 447.3749084472656, 116.56381225585938], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.3749084472656, 116.56381225585938], [446.9059143066406, 116.50381469726562]]}
  ] },
  { "pathIndex": 54830, "seqno": 54832, "boundsPt": [428.9259948730469, 132.21249389648438, 430.9169921875, 132.46749877929688], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.9259948730469, 132.21249389648438], [430.9169921875, 132.46749877929688]]}
  ] },
  { "pathIndex": 54831, "seqno": 54833, "boundsPt": [428.8109130859375, 133.11111450195312, 430.8019104003906, 133.36611938476562], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.8109130859375, 133.11111450195312], [430.8019104003906, 133.36611938476562]]}
  ] },
  { "pathIndex": 54832, "seqno": 54834, "boundsPt": [442.05511474609375, 134.80828857421875, 442.5251159667969, 134.8682861328125], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [442.05511474609375, 134.80828857421875], [442.5251159667969, 134.8682861328125]]}
  ] },
  { "pathIndex": 54833, "seqno": 54835, "boundsPt": [442.5248107910156, 133.96859741210938, 442.6398010253906, 134.86859130859375], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [442.5248107910156, 134.86859130859375], [442.6398010253906, 133.96859741210938]]}
  ] },
  { "pathIndex": 54834, "seqno": 54836, "boundsPt": [442.1698913574219, 133.9093017578125, 442.639892578125, 133.96929931640625], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [442.639892578125, 133.96929931640625], [442.1698913574219, 133.9093017578125]]}
  ] },
  { "pathIndex": 54835, "seqno": 54837, "boundsPt": [442.0552062988281, 133.90969848632812, 442.1701965332031, 134.8076934814453], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [442.1701965332031, 133.90969848632812], [442.0552062988281, 134.8076934814453]]}
  ] },
  { "pathIndex": 54836, "seqno": 54838, "boundsPt": [430.80120849609375, 133.36590576171875, 431.27020263671875, 133.4259033203125], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [430.80120849609375, 133.36590576171875], [431.27020263671875, 133.4259033203125]]}
  ] },
  { "pathIndex": 54837, "seqno": 54839, "boundsPt": [431.26971435546875, 132.52809143066406, 431.38470458984375, 133.42608642578125], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [431.26971435546875, 133.42608642578125], [431.38470458984375, 132.52809143066406]]}
  ] },
  { "pathIndex": 54838, "seqno": 54840, "boundsPt": [430.9158020019531, 132.46749877929688, 431.3847961425781, 132.52749633789062], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [431.3847961425781, 132.52749633789062], [430.9158020019531, 132.46749877929688]]}
  ] },
  { "pathIndex": 54839, "seqno": 54841, "boundsPt": [430.8014221191406, 132.46728515625, 430.9164123535156, 133.3652801513672], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [430.9164123535156, 132.46728515625], [430.8014221191406, 133.3652801513672]]}
  ] },
  { "pathIndex": 54840, "seqno": 54842, "boundsPt": [442.639892578125, 133.96929931640625, 444.6358947753906, 134.2252960205078], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [442.639892578125, 133.96929931640625], [444.6358947753906, 134.2252960205078]]}
  ] },
  { "pathIndex": 54841, "seqno": 54843, "boundsPt": [442.5248107910156, 134.86859130859375, 444.52081298828125, 135.12359619140625], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [442.5248107910156, 134.86859130859375], [444.52081298828125, 135.12359619140625]]}
  ] },
  { "pathIndex": 54870, "seqno": 54872, "boundsPt": [428.3424987792969, 133.05099487304688, 428.8114929199219, 133.11099243164062], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.3424987792969, 133.05099487304688], [428.8114929199219, 133.11099243164062]]}
  ] },
  { "pathIndex": 54871, "seqno": 54873, "boundsPt": [428.8109130859375, 132.21311950683594, 428.9259033203125, 133.11111450195312], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.8109130859375, 133.11111450195312], [428.9259033203125, 132.21311950683594]]}
  ] },
  { "pathIndex": 54872, "seqno": 54874, "boundsPt": [428.4570007324219, 132.15249633789062, 428.9259948730469, 132.21249389648438], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.9259948730469, 132.21249389648438], [428.4570007324219, 132.15249633789062]]}
  ] },
  { "pathIndex": 54873, "seqno": 54875, "boundsPt": [428.3426208496094, 132.15240478515625, 428.4576110839844, 133.05039978027344], "style": "style-10", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.4576110839844, 132.15240478515625], [428.3426208496094, 133.05039978027344]]}
  ] },
  { "pathIndex": 54874, "seqno": 54876, "boundsPt": [444.9888000488281, 134.2862091064453, 445.1037902832031, 135.1842041015625], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.9888000488281, 135.1842041015625], [445.1037902832031, 134.2862091064453]]}
  ] },
  { "pathIndex": 54875, "seqno": 54877, "boundsPt": [444.6351013183594, 134.22561645507812, 445.1040954589844, 134.28561401367188], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [445.1040954589844, 134.28561401367188], [444.6351013183594, 134.22561645507812]]}
  ] },
  { "pathIndex": 54876, "seqno": 54878, "boundsPt": [444.5205993652344, 134.22549438476562, 444.6355895996094, 135.1234893798828], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.6355895996094, 134.22549438476562], [444.5205993652344, 135.1234893798828]]}
  ] },
  { "pathIndex": 54877, "seqno": 54879, "boundsPt": [444.5203857421875, 135.1239013671875, 444.9893798828125, 135.18389892578125], "style": "style-10", "roles": ["corridor-east-pane-detail", "north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.5203857421875, 135.1239013671875], [444.9893798828125, 135.18389892578125]]}
  ] },
  { "pathIndex": 55137, "seqno": 55139, "boundsPt": [428.10150146484375, 112.418701171875, 430.98651123046875, 134.92669677734375], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.10150146484375, 134.92669677734375], [430.98651123046875, 112.418701171875]]}
  ] },
  { "pathIndex": 55138, "seqno": 55140, "boundsPt": [428.4364013671875, 112.09069061279297, 430.98638916015625, 112.41769409179688], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [430.98638916015625, 112.41769409179688], [428.4364013671875, 112.09069061279297]]}
  ] },
  { "pathIndex": 55139, "seqno": 55141, "boundsPt": [428.223388671875, 112.09078979492188, 428.4364013671875, 113.75179290771484], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.4364013671875, 112.09078979492188], [428.223388671875, 113.75179290771484]]}
  ] },
  { "pathIndex": 55140, "seqno": 55142, "boundsPt": [428.2232971191406, 113.75241088867188, 428.2322998046875, 113.75241088867188], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.2232971191406, 113.75241088867188], [428.2322998046875, 113.75241088867188]]}
  ] },
  { "pathIndex": 55141, "seqno": 55143, "boundsPt": [428.2055969238281, 113.75311279296875, 428.23260498046875, 113.9691162109375], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.23260498046875, 113.75311279296875], [428.2055969238281, 113.9691162109375]]}
  ] },
  { "pathIndex": 55142, "seqno": 55144, "boundsPt": [428.1950988769531, 113.96710968017578, 428.2060852050781, 113.96810913085938], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.2060852050781, 113.96810913085938], [428.1950988769531, 113.96710968017578]]}
  ] },
  { "pathIndex": 55143, "seqno": 55145, "boundsPt": [427.9825744628906, 113.96670532226562, 428.1955871582031, 115.6277084350586], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [428.1955871582031, 113.96670532226562], [427.9825744628906, 115.6277084350586]]}
  ] },
  { "pathIndex": 55144, "seqno": 55146, "boundsPt": [427.9823913574219, 115.62759399414062, 427.9933776855469, 115.62859344482422], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.9823913574219, 115.62759399414062], [427.9933776855469, 115.62859344482422]]}
  ] },
  { "pathIndex": 55145, "seqno": 55147, "boundsPt": [427.9642028808594, 115.62890625, 427.9931945800781, 115.84490966796875], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.9931945800781, 115.62890625], [427.9642028808594, 115.84490966796875]]}
  ] },
  { "pathIndex": 55146, "seqno": 55148, "boundsPt": [427.9552001953125, 115.8429946899414, 427.9652099609375, 115.843994140625], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.9652099609375, 115.843994140625], [427.9552001953125, 115.8429946899414]]}
  ] },
  { "pathIndex": 55147, "seqno": 55149, "boundsPt": [427.9519958496094, 115.84259033203125, 427.95599365234375, 115.87158966064453], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.95599365234375, 115.84259033203125], [427.9519958496094, 115.87158966064453]]}
  ] },
  { "pathIndex": 55148, "seqno": 55150, "boundsPt": [427.5829162597656, 118.72500610351562, 427.5869140625, 118.7540054321289], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.5869140625, 118.72500610351562], [427.5829162597656, 118.7540054321289]]}
  ] },
  { "pathIndex": 55149, "seqno": 55151, "boundsPt": [427.5827941894531, 118.75408935546875, 427.591796875, 118.75508880615234], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.5827941894531, 118.75408935546875], [427.591796875, 118.75508880615234]]}
  ] },
  { "pathIndex": 55150, "seqno": 55152, "boundsPt": [427.5632019042969, 118.75531005859375, 427.5921936035156, 118.9713134765625], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.5921936035156, 118.75531005859375], [427.5632019042969, 118.9713134765625]]}
  ] },
  { "pathIndex": 55151, "seqno": 55153, "boundsPt": [427.55419921875, 118.96930694580078, 427.564208984375, 118.97030639648438], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.564208984375, 118.97030639648438], [427.55419921875, 118.96930694580078]]}
  ] },
  { "pathIndex": 55152, "seqno": 55154, "boundsPt": [427.34210205078125, 118.968994140625, 427.55511474609375, 120.62999725341797], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.55511474609375, 118.968994140625], [427.34210205078125, 120.62999725341797]]}
  ] },
  { "pathIndex": 55153, "seqno": 55155, "boundsPt": [427.3420104980469, 120.62979125976562, 427.35101318359375, 120.63079071044922], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.3420104980469, 120.62979125976562], [427.35101318359375, 120.63079071044922]]}
  ] },
  { "pathIndex": 55154, "seqno": 55156, "boundsPt": [427.32427978515625, 120.63119506835938, 427.3512878417969, 120.8451919555664], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.3512878417969, 120.63119506835938], [427.32427978515625, 120.8451919555664]]}
  ] },
  { "pathIndex": 55155, "seqno": 55157, "boundsPt": [427.3138122558594, 120.84561157226562, 427.3247985839844, 120.84561157226562], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.3247985839844, 120.84561157226562], [427.3138122558594, 120.84561157226562]]}
  ] },
  { "pathIndex": 55156, "seqno": 55158, "boundsPt": [426.94122314453125, 120.84490966796875, 427.314208984375, 123.75591278076172], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [427.314208984375, 120.84490966796875], [426.94122314453125, 123.75591278076172]]}
  ] },
  { "pathIndex": 55157, "seqno": 55159, "boundsPt": [426.9410095214844, 123.75570678710938, 426.9519958496094, 123.75670623779297], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.9410095214844, 123.75570678710938], [426.9519958496094, 123.75670623779297]]}
  ] },
  { "pathIndex": 55158, "seqno": 55160, "boundsPt": [426.922607421875, 123.75711059570312, 426.95159912109375, 123.97210693359375], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.95159912109375, 123.75711059570312], [426.922607421875, 123.97210693359375]]}
  ] },
  { "pathIndex": 55159, "seqno": 55161, "boundsPt": [426.914794921875, 123.97098541259766, 426.9237976074219, 123.97198486328125], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.9237976074219, 123.97198486328125], [426.914794921875, 123.97098541259766]]}
  ] },
  { "pathIndex": 55160, "seqno": 55162, "boundsPt": [426.339599609375, 123.97079467773438, 426.91461181640625, 128.44580078125], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.91461181640625, 123.97079467773438], [426.339599609375, 128.44580078125]]}
  ] },
  { "pathIndex": 55161, "seqno": 55163, "boundsPt": [426.3402099609375, 128.44558715820312, 426.3511962890625, 128.44558715820312], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.3402099609375, 128.44558715820312], [426.3511962890625, 128.44558715820312]]}
  ] },
  { "pathIndex": 55162, "seqno": 55164, "boundsPt": [426.32171630859375, 128.4462890625, 426.3507080078125, 128.66229248046875], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.3507080078125, 128.4462890625], [426.32171630859375, 128.66229248046875]]}
  ] },
  { "pathIndex": 55163, "seqno": 55165, "boundsPt": [426.3119201660156, 128.6602783203125, 426.3229064941406, 128.66128540039062], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.3229064941406, 128.66128540039062], [426.3119201660156, 128.6602783203125]]}
  ] },
  { "pathIndex": 55164, "seqno": 55166, "boundsPt": [426.3094177246094, 128.66000366210938, 426.3124084472656, 128.69000244140625], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [426.3124084472656, 128.66000366210938], [426.3094177246094, 128.69000244140625]]}
  ] },
  { "pathIndex": 55165, "seqno": 55167, "boundsPt": [425.9403076171875, 131.54229736328125, 425.94329833984375, 131.57130432128906], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.94329833984375, 131.54229736328125], [425.9403076171875, 131.57130432128906]]}
  ] },
  { "pathIndex": 55166, "seqno": 55168, "boundsPt": [425.94061279296875, 131.5714111328125, 425.9496154785156, 131.57241821289062], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.94061279296875, 131.5714111328125], [425.9496154785156, 131.57241821289062]]}
  ] },
  { "pathIndex": 55167, "seqno": 55169, "boundsPt": [425.92071533203125, 131.57269287109375, 425.94970703125, 131.78768920898438], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.94970703125, 131.57269287109375], [425.92071533203125, 131.78768920898438]]}
  ] },
  { "pathIndex": 55168, "seqno": 55170, "boundsPt": [425.9118957519531, 131.78668212890625, 425.9219055175781, 131.78768920898438], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.9219055175781, 131.78768920898438], [425.9118957519531, 131.78668212890625]]}
  ] },
  { "pathIndex": 55169, "seqno": 55171, "boundsPt": [425.6997985839844, 131.78640747070312, 425.9128112792969, 133.44740295410156], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.9128112792969, 131.78640747070312], [425.6997985839844, 133.44740295410156]]}
  ] },
  { "pathIndex": 55170, "seqno": 55172, "boundsPt": [425.69970703125, 133.44720458984375, 425.7087097167969, 133.44821166992188], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.69970703125, 133.44720458984375], [425.7087097167969, 133.44821166992188]]}
  ] },
  { "pathIndex": 55171, "seqno": 55173, "boundsPt": [425.6820068359375, 133.448486328125, 425.7090148925781, 133.66448974609375], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.7090148925781, 133.448486328125], [425.6820068359375, 133.66448974609375]]}
  ] },
  { "pathIndex": 55172, "seqno": 55174, "boundsPt": [425.6715087890625, 133.66259765625, 425.6824951171875, 133.66360473632812], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.6824951171875, 133.66360473632812], [425.6715087890625, 133.66259765625]]}
  ] },
  { "pathIndex": 55173, "seqno": 55175, "boundsPt": [425.5509948730469, 133.66220092773438, 425.6719970703125, 134.60020446777344], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.6719970703125, 133.66220092773438], [425.5509948730469, 134.60020446777344]]}
  ] },
  { "pathIndex": 55174, "seqno": 55176, "boundsPt": [425.551513671875, 134.59991455078125, 428.10150146484375, 134.92691040039062], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [425.551513671875, 134.59991455078125], [428.10150146484375, 134.92691040039062]]}
  ] },
  { "pathIndex": 55175, "seqno": 55177, "boundsPt": [444.7489929199219, 114.55108642578125, 447.63299560546875, 137.05908203125], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.63299560546875, 114.55108642578125], [444.7489929199219, 137.05908203125]]}
  ] },
  { "pathIndex": 55176, "seqno": 55178, "boundsPt": [444.7493896484375, 137.05990600585938, 447.29840087890625, 137.38690185546875], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [444.7493896484375, 137.05990600585938], [447.29840087890625, 137.38690185546875]]}
  ] },
  { "pathIndex": 55177, "seqno": 55179, "boundsPt": [447.298095703125, 136.4488983154297, 447.4190979003906, 137.38690185546875], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.298095703125, 137.38690185546875], [447.4190979003906, 136.4488983154297]]}
  ] },
  { "pathIndex": 55178, "seqno": 55180, "boundsPt": [447.4085998535156, 136.44769287109375, 447.4186096191406, 136.44869995117188], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.4186096191406, 136.44869995117188], [447.4085998535156, 136.44769287109375]]}
  ] },
  { "pathIndex": 55179, "seqno": 55181, "boundsPt": [447.4093933105469, 136.23329162597656, 447.4374084472656, 136.44729614257812], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.4093933105469, 136.44729614257812], [447.4374084472656, 136.23329162597656]]}
  ] },
  { "pathIndex": 55180, "seqno": 55182, "boundsPt": [447.4371032714844, 136.23291015625, 447.44610595703125, 136.23291015625], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.4371032714844, 136.23291015625], [447.44610595703125, 136.23291015625]]}
  ] },
  { "pathIndex": 55181, "seqno": 55183, "boundsPt": [447.4464111328125, 134.5736083984375, 447.659423828125, 136.23361206054688], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.4464111328125, 136.23361206054688], [447.659423828125, 134.5736083984375]]}
  ] },
  { "pathIndex": 55182, "seqno": 55184, "boundsPt": [447.64849853515625, 134.5723876953125, 447.65948486328125, 134.57339477539062], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.65948486328125, 134.57339477539062], [447.64849853515625, 134.5723876953125]]}
  ] },
  { "pathIndex": 55183, "seqno": 55185, "boundsPt": [447.6488037109375, 134.35711669921875, 447.67681884765625, 134.57211303710938], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.6488037109375, 134.57211303710938], [447.67681884765625, 134.35711669921875]]}
  ] },
  { "pathIndex": 55184, "seqno": 55186, "boundsPt": [447.6766052246094, 134.35699462890625, 447.6875915527344, 134.35800170898438], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.6766052246094, 134.35699462890625], [447.6875915527344, 134.35800170898438]]}
  ] },
  { "pathIndex": 55185, "seqno": 55187, "boundsPt": [447.6872863769531, 134.32839965820312, 447.6902770996094, 134.3583984375], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [447.6872863769531, 134.3583984375], [447.6902770996094, 134.32839965820312]]}
  ] },
  { "pathIndex": 55186, "seqno": 55188, "boundsPt": [448.0564880371094, 131.44810485839844, 448.06048583984375, 131.47610473632812], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0564880371094, 131.47610473632812], [448.06048583984375, 131.44810485839844]]}
  ] },
  { "pathIndex": 55187, "seqno": 55189, "boundsPt": [448.0494079589844, 131.44598388671875, 448.0603942871094, 131.44699096679688], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0603942871094, 131.44699096679688], [448.0494079589844, 131.44598388671875]]}
  ] },
  { "pathIndex": 55188, "seqno": 55190, "boundsPt": [448.0497131347656, 131.230712890625, 448.0777282714844, 131.44570922851562], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0497131347656, 131.44570922851562], [448.0777282714844, 131.230712890625]]}
  ] },
  { "pathIndex": 55189, "seqno": 55191, "boundsPt": [448.0776062011719, 131.230712890625, 448.08660888671875, 131.23171997070312], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0776062011719, 131.230712890625], [448.08660888671875, 131.23171997070312]]}
  ] },
  { "pathIndex": 55190, "seqno": 55192, "boundsPt": [448.0869140625, 126.75699615478516, 448.6609191894531, 131.23199462890625], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.0869140625, 131.23199462890625], [448.6609191894531, 126.75699615478516]]}
  ] },
  { "pathIndex": 55191, "seqno": 55193, "boundsPt": [448.6502990722656, 126.7566909790039, 448.6612854003906, 126.7576904296875], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.6612854003906, 126.7576904296875], [448.6502990722656, 126.7566909790039]]}
  ] },
  { "pathIndex": 55192, "seqno": 55194, "boundsPt": [448.6506042480469, 126.63928985595703, 448.6665954589844, 126.75628662109375], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.6506042480469, 126.75628662109375], [448.6665954589844, 126.63928985595703]]}
  ] },
  { "pathIndex": 55193, "seqno": 55195, "boundsPt": [448.8808898925781, 123.63099670410156, 449.0608825683594, 125.03799438476562], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [448.8808898925781, 125.03799438476562], [449.0608825683594, 123.63099670410156]]}
  ] },
  { "pathIndex": 55194, "seqno": 55196, "boundsPt": [449.05078125, 123.63028717041016, 449.060791015625, 123.63128662109375], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.060791015625, 123.63128662109375], [449.05078125, 123.63028717041016]]}
  ] },
  { "pathIndex": 55195, "seqno": 55197, "boundsPt": [449.0516052246094, 123.4149169921875, 449.0796203613281, 123.62991333007812], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.0516052246094, 123.62991333007812], [449.0796203613281, 123.4149169921875]]}
  ] },
  { "pathIndex": 55196, "seqno": 55198, "boundsPt": [449.07940673828125, 123.41488647460938, 449.0884094238281, 123.41588592529297], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.07940673828125, 123.41488647460938], [449.0884094238281, 123.41588592529297]]}
  ] },
  { "pathIndex": 55197, "seqno": 55199, "boundsPt": [449.0885925292969, 121.75519561767578, 449.3016052246094, 123.41619873046875], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.0885925292969, 123.41619873046875], [449.3016052246094, 121.75519561767578]]}
  ] },
  { "pathIndex": 55198, "seqno": 55200, "boundsPt": [449.2917785644531, 121.75440216064453, 449.3017883300781, 121.75540161132812], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.3017883300781, 121.75540161132812], [449.2917785644531, 121.75440216064453]]}
  ] },
  { "pathIndex": 55199, "seqno": 55201, "boundsPt": [449.2925109863281, 121.54000091552734, 449.31951904296875, 121.75399780273438], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.2925109863281, 121.75399780273438], [449.31951904296875, 121.54000091552734]]}
  ] },
  { "pathIndex": 55200, "seqno": 55202, "boundsPt": [449.3190002441406, 121.53970336914062, 449.3299865722656, 121.54070281982422], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.3190002441406, 121.53970336914062], [449.3299865722656, 121.54070281982422]]}
  ] },
  { "pathIndex": 55201, "seqno": 55203, "boundsPt": [449.3294982910156, 121.510986328125, 449.33349609375, 121.54098510742188], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.3294982910156, 121.54098510742188], [449.33349609375, 121.510986328125]]}
  ] },
  { "pathIndex": 55202, "seqno": 55204, "boundsPt": [449.6986999511719, 118.62969207763672, 449.70269775390625, 118.65869140625], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.6986999511719, 118.65869140625], [449.70269775390625, 118.62969207763672]]}
  ] },
  { "pathIndex": 55203, "seqno": 55205, "boundsPt": [449.6918029785156, 118.62870025634766, 449.7027893066406, 118.62969970703125], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.7027893066406, 118.62969970703125], [449.6918029785156, 118.62870025634766]]}
  ] },
  { "pathIndex": 55204, "seqno": 55206, "boundsPt": [449.69219970703125, 118.41329956054688, 449.72021484375, 118.6282958984375], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.69219970703125, 118.6282958984375], [449.72021484375, 118.41329956054688]]}
  ] },
  { "pathIndex": 55205, "seqno": 55207, "boundsPt": [449.7200012207031, 118.41329956054688, 449.7309875488281, 118.41429901123047], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.7200012207031, 118.41329956054688], [449.7309875488281, 118.41429901123047]]}
  ] },
  { "pathIndex": 55206, "seqno": 55208, "boundsPt": [449.7304992675781, 116.75348663330078, 449.9414978027344, 118.41448974609375], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.7304992675781, 118.41448974609375], [449.9414978027344, 116.75348663330078]]}
  ] },
  { "pathIndex": 55207, "seqno": 55209, "boundsPt": [449.9322814941406, 116.75281524658203, 449.9422912597656, 116.75381469726562], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.9422912597656, 116.75381469726562], [449.9322814941406, 116.75281524658203]]}
  ] },
  { "pathIndex": 55208, "seqno": 55210, "boundsPt": [449.9330139160156, 116.53640747070312, 449.9610290527344, 116.75241088867188], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.9330139160156, 116.75241088867188], [449.9610290527344, 116.53640747070312]]}
  ] },
  { "pathIndex": 55209, "seqno": 55211, "boundsPt": [449.9607849121094, 116.53741455078125, 449.96978759765625, 116.53841400146484], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.9607849121094, 116.53741455078125], [449.96978759765625, 116.53841400146484]]}
  ] },
  { "pathIndex": 55210, "seqno": 55212, "boundsPt": [449.9700012207031, 114.8777847290039, 450.1830139160156, 116.53878784179688], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [449.9700012207031, 116.53878784179688], [450.1830139160156, 114.8777847290039]]}
  ] },
  { "pathIndex": 55211, "seqno": 55213, "boundsPt": [447.6332092285156, 114.55089569091797, 450.1831970214844, 114.87789916992188], "style": "style-11", "roles": ["north-vestibule-frame-or-door"], "items": [
    {"itemIndex": 0, "command": ["l", [450.1831970214844, 114.87789916992188], [447.6332092285156, 114.55089569091797]]}
  ] },
  { "pathIndex": 55500, "seqno": 55502, "boundsPt": [410.5802917480469, 167.0706024169922, 410.581298828125, 167.08160400390625], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.5802917480469, 167.08160400390625], [410.581298828125, 167.0706024169922]]}
  ] },
  { "pathIndex": 55501, "seqno": 55503, "boundsPt": [409.7956848144531, 167.01400756835938, 410.5816955566406, 167.07101440429688], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.5816955566406, 167.07101440429688], [409.7956848144531, 167.01400756835938]]}
  ] },
  { "pathIndex": 55502, "seqno": 55504, "boundsPt": [409.7955017089844, 167.01348876953125, 409.7955017089844, 167.01449584960938], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.7955017089844, 167.01348876953125], [409.7955017089844, 167.01348876953125]]},
    {"itemIndex": 1, "command": ["l", [409.7955017089844, 167.01348876953125], [409.7955017089844, 167.01449584960938]]}
  ] },
  { "pathIndex": 55503, "seqno": 55505, "boundsPt": [409.7955017089844, 167.01480102539062, 410.58050537109375, 167.08079528808594], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [409.7955017089844, 167.01480102539062], [410.58050537109375, 167.08079528808594]]}
  ] },
  { "pathIndex": 55504, "seqno": 55506, "boundsPt": [411.4114074707031, 154.9689178466797, 411.4604187011719, 155.75491333007812], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.4114074707031, 155.75491333007812], [411.4604187011719, 154.9689178466797]]}
  ] },
  { "pathIndex": 55505, "seqno": 55507, "boundsPt": [410.67340087890625, 154.93099975585938, 411.46038818359375, 154.968994140625], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.46038818359375, 154.968994140625], [410.67340087890625, 154.93099975585938]]}
  ] },
  { "pathIndex": 55506, "seqno": 55508, "boundsPt": [410.6260070800781, 154.93051147460938, 410.6730041503906, 155.697509765625], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.6730041503906, 154.93051147460938], [410.6260070800781, 155.697509765625]]}
  ] },
  { "pathIndex": 55507, "seqno": 55509, "boundsPt": [410.6252136230469, 155.697509765625, 411.4112243652344, 155.7545166015625], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.6252136230469, 155.697509765625], [411.4112243652344, 155.7545166015625]]}
  ] },
  { "pathIndex": 55508, "seqno": 55510, "boundsPt": [412.01220703125, 143.62771606445312, 412.01220703125, 143.63571166992188], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.01220703125, 143.63571166992188], [412.01220703125, 143.62771606445312]]}
  ] },
  { "pathIndex": 55509, "seqno": 55511, "boundsPt": [411.2252197265625, 143.59710693359375, 412.01220703125, 143.62710571289062], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [412.01220703125, 143.62710571289062], [411.2252197265625, 143.59710693359375]]}
  ] },
  { "pathIndex": 55510, "seqno": 55512, "boundsPt": [411.2247009277344, 143.597412109375, 412.0116882324219, 143.63540649414062], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.2247009277344, 143.597412109375], [412.0116882324219, 143.63540649414062]]}
  ] },
  { "pathIndex": 55511, "seqno": 55513, "boundsPt": [336.0772705078125, 211.6383056640625, 353.5622863769531, 211.6383056640625], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [353.5622863769531, 211.6383056640625], [336.0772705078125, 211.6383056640625]]}
  ] },
  { "pathIndex": 55512, "seqno": 55514, "boundsPt": [334.9136047363281, 211.6383056640625, 334.95159912109375, 211.8363037109375], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [334.9136047363281, 211.6383056640625], [334.95159912109375, 211.8363037109375]]}
  ] },
  { "pathIndex": 55513, "seqno": 55515, "boundsPt": [335.1716003417969, 212.97821044921875, 356.0826110839844, 212.97821044921875], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [335.1716003417969, 212.97821044921875], [356.0826110839844, 212.97821044921875]]}
  ] },
  { "pathIndex": 55515, "seqno": 55517, "boundsPt": [324.2475891113281, 210.2117919921875, 326.13958740234375, 210.2117919921875], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [326.13958740234375, 210.2117919921875], [324.2475891113281, 210.2117919921875]]}
  ] },
  { "pathIndex": 55519, "seqno": 55521, "boundsPt": [326.13958740234375, 142.13560485839844, 326.13958740234375, 203.90859985351562], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [326.13958740234375, 203.90859985351562], [326.13958740234375, 142.13560485839844]]}
  ] },
  { "pathIndex": 55520, "seqno": 55522, "boundsPt": [324.2475891113281, 142.13510131835938, 326.13958740234375, 142.13510131835938], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [326.13958740234375, 142.13510131835938], [324.2475891113281, 142.13510131835938]]}
  ] },
  { "pathIndex": 55521, "seqno": 55523, "boundsPt": [324.2485046386719, 142.13510131835938, 324.2485046386719, 203.90809631347656], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [324.2485046386719, 142.13510131835938], [324.2485046386719, 203.90809631347656]]}
  ] },
  { "pathIndex": 55522, "seqno": 55524, "boundsPt": [324.2485046386719, 203.90859985351562, 326.1405029296875, 203.90859985351562], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [324.2485046386719, 203.90859985351562], [326.1405029296875, 203.90859985351562]]}
  ] },
  { "pathIndex": 55529, "seqno": 55531, "boundsPt": [326.13958740234375, 203.90859985351562, 326.13958740234375, 210.2115936279297], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [326.13958740234375, 203.90859985351562], [326.13958740234375, 210.2115936279297]]}
  ] },
  { "pathIndex": 55854, "seqno": 55856, "boundsPt": [410.3673095703125, 171.91989135742188, 412.6533203125, 171.91989135742188], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.3673095703125, 171.91989135742188], [412.6533203125, 171.91989135742188]]}
  ] },
  { "pathIndex": 55855, "seqno": 55857, "boundsPt": [410.3673095703125, 174.12588500976562, 412.6533203125, 174.12588500976562], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.3673095703125, 174.12588500976562], [412.6533203125, 174.12588500976562]]}
  ] },
  { "pathIndex": 55856, "seqno": 55858, "boundsPt": [411.5107116699219, 171.91989135742188, 411.5107116699219, 174.12588500976562], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.5107116699219, 171.91989135742188], [411.5107116699219, 174.12588500976562]]}
  ] },
  { "pathIndex": 55951, "seqno": 55953, "boundsPt": [326.13958740234375, 89.54959106445312, 335.59259033203125, 89.54959106445312], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [326.13958740234375, 89.54959106445312], [335.59259033203125, 89.54959106445312]]}
  ] },
  { "pathIndex": 55969, "seqno": 55971, "boundsPt": [410.9587097167969, 172.722412109375, 411.1717224121094, 174.99740600585938], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [410.9587097167969, 174.99740600585938], [411.1717224121094, 172.722412109375]]}
  ] },
  { "pathIndex": 55970, "seqno": 55972, "boundsPt": [408.5439147949219, 172.4754180908203, 411.1719055175781, 172.722412109375], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [411.1719055175781, 172.722412109375], [408.5439147949219, 172.4754180908203]]}
  ] },
  { "pathIndex": 55971, "seqno": 55973, "boundsPt": [408.3306884765625, 172.47628784179688, 408.543701171875, 174.75128173828125], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.543701171875, 172.47628784179688], [408.3306884765625, 174.75128173828125]]}
  ] },
  { "pathIndex": 55972, "seqno": 55974, "boundsPt": [408.3305969238281, 174.75119018554688, 410.9585876464844, 174.99818420410156], "style": "style-11", "roles": ["east-door-frame"], "items": [
    {"itemIndex": 0, "command": ["l", [408.3305969238281, 174.75119018554688], [410.9585876464844, 174.99818420410156]]}
  ] },
  { "pathIndex": 55992, "seqno": 55994, "boundsPt": [356.910400390625, 212.97821044921875, 370.1453857421875, 212.97821044921875], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [356.910400390625, 212.97821044921875], [370.1453857421875, 212.97821044921875]]}
  ] },
  { "pathIndex": 55993, "seqno": 55995, "boundsPt": [370.9721984863281, 212.97821044921875, 386.2322082519531, 212.97821044921875], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [370.9721984863281, 212.97821044921875], [386.2322082519531, 212.97821044921875]]}
  ] },
  { "pathIndex": 55994, "seqno": 55996, "boundsPt": [353.5631103515625, 211.6383056640625, 387.8410949707031, 211.6383056640625], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [387.8410949707031, 211.6383056640625], [353.5631103515625, 211.6383056640625]]}
  ] },
  { "pathIndex": 56002, "seqno": 56004, "boundsPt": [362.0556945800781, 89.93341064453125, 387.2476806640625, 89.93341064453125], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [362.0556945800781, 89.93341064453125], [387.2476806640625, 89.93341064453125]]}
  ] },
  { "pathIndex": 56003, "seqno": 56005, "boundsPt": [387.24688720703125, 89.6974105834961, 387.2498779296875, 89.93341064453125], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [387.24688720703125, 89.93341064453125], [387.2498779296875, 89.6974105834961]]}
  ] },
  { "pathIndex": 56004, "seqno": 56006, "boundsPt": [362.0555114746094, 89.69699096679688, 387.24951171875, 89.69699096679688], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [387.24951171875, 89.69699096679688], [362.0555114746094, 89.69699096679688]]}
  ] },
  { "pathIndex": 56005, "seqno": 56007, "boundsPt": [362.0556945800781, 89.69699096679688, 362.0556945800781, 89.93299102783203], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [362.0556945800781, 89.69699096679688], [362.0556945800781, 89.93299102783203]]}
  ] },
  { "pathIndex": 56006, "seqno": 56008, "boundsPt": [353.5426940917969, 89.93341064453125, 362.0556945800781, 89.93341064453125], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [362.0556945800781, 89.93341064453125], [353.5426940917969, 89.93341064453125]]}
  ] },
  { "pathIndex": 56007, "seqno": 56009, "boundsPt": [339.9610900878906, 89.93341064453125, 344.5130920410156, 89.93341064453125], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [344.5130920410156, 89.93341064453125], [339.9610900878906, 89.93341064453125]]}
  ] },
  { "pathIndex": 56008, "seqno": 56010, "boundsPt": [339.9609069824219, 89.6974105834961, 339.9609069824219, 89.93341064453125], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [339.9609069824219, 89.93341064453125], [339.9609069824219, 89.6974105834961]]}
  ] },
  { "pathIndex": 56009, "seqno": 56011, "boundsPt": [339.9609069824219, 89.69699096679688, 362.055908203125, 89.69699096679688], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [339.9609069824219, 89.69699096679688], [362.055908203125, 89.69699096679688]]}
  ] },
  { "pathIndex": 56010, "seqno": 56012, "boundsPt": [352.8517150878906, 89.69699096679688, 352.8517150878906, 89.9169921875], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [352.8517150878906, 89.69699096679688], [352.8517150878906, 89.9169921875]]}
  ] },
  { "pathIndex": 56011, "seqno": 56013, "boundsPt": [385.35589599609375, 211.40231323242188, 385.35589599609375, 211.6383056640625], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [385.35589599609375, 211.6383056640625], [385.35589599609375, 211.40231323242188]]}
  ] },
  { "pathIndex": 56012, "seqno": 56014, "boundsPt": [366.4488830566406, 211.402099609375, 385.35589599609375, 211.402099609375], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [385.35589599609375, 211.402099609375], [366.4488830566406, 211.402099609375]]}
  ] },
  { "pathIndex": 56013, "seqno": 56015, "boundsPt": [366.4490051269531, 211.402099609375, 366.4490051269531, 211.63809204101562], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [366.4490051269531, 211.402099609375], [366.4490051269531, 211.63809204101562]]}
  ] },
  { "pathIndex": 56014, "seqno": 56016, "boundsPt": [337.02301025390625, 211.40231323242188, 337.02301025390625, 211.6383056640625], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [337.02301025390625, 211.6383056640625], [337.02301025390625, 211.40231323242188]]}
  ] },
  { "pathIndex": 56015, "seqno": 56017, "boundsPt": [337.02301025390625, 211.402099609375, 366.4490051269531, 211.402099609375], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [337.02301025390625, 211.402099609375], [366.4490051269531, 211.402099609375]]}
  ] },
  { "pathIndex": 56016, "seqno": 56018, "boundsPt": [385.35589599609375, 211.402099609375, 387.69488525390625, 211.402099609375], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [385.35589599609375, 211.402099609375], [387.69488525390625, 211.402099609375]]}
  ] },
  { "pathIndex": 56017, "seqno": 56019, "boundsPt": [387.6943054199219, 211.402099609375, 387.6943054199219, 211.63809204101562], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [387.6943054199219, 211.402099609375], [387.6943054199219, 211.63809204101562]]}
  ] },
  { "pathIndex": 56018, "seqno": 56020, "boundsPt": [353.48291015625, 211.402099609375, 353.48291015625, 211.60409545898438], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [353.48291015625, 211.402099609375], [353.48291015625, 211.60409545898438]]}
  ] },
  { "pathIndex": 56077, "seqno": 56079, "boundsPt": [304.9515075683594, 78.30740356445312, 410.7655029296875, 140.82640075683594], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["c", [304.9515075683594, 85.50540161132812], [305.3955078125, 85.34539794921875], [305.84051513671875, 85.18840026855469], [306.2864990234375, 85.03340148925781]]},
    {"itemIndex": 1, "command": ["c", [306.2864990234375, 85.03340148925781], [306.7335205078125, 84.87940216064453], [307.1805114746094, 84.72740173339844], [307.6295166015625, 84.57740020751953]]},
    {"itemIndex": 2, "command": ["c", [307.6295166015625, 84.57740020751953], [308.0775146484375, 84.42839813232422], [308.5265197753906, 84.28140258789062], [308.97650146484375, 84.1384048461914]]},
    {"itemIndex": 3, "command": ["c", [308.97650146484375, 84.1384048461914], [309.42449951171875, 83.99340057373047], [309.8755187988281, 83.85240173339844], [310.3275146484375, 83.71240234375]]},
    {"itemIndex": 4, "command": ["c", [310.3275146484375, 83.71240234375], [310.77850341796875, 83.57440185546875], [311.23150634765625, 83.4374008178711], [311.6835021972656, 83.30339813232422]]},
    {"itemIndex": 5, "command": ["c", [311.6835021972656, 83.30339813232422], [312.1365051269531, 83.16940307617188], [312.59051513671875, 83.03939819335938], [313.04449462890625, 82.910400390625]]},
    {"itemIndex": 6, "command": ["c", [313.04449462890625, 82.910400390625], [313.49951171875, 82.78140258789062], [313.9544982910156, 82.65540313720703], [314.40850830078125, 82.53340148925781]]},
    {"itemIndex": 7, "command": ["c", [314.40850830078125, 82.53340148925781], [314.8655090332031, 82.410400390625], [315.322509765625, 82.28939819335938], [315.77850341796875, 82.17140197753906]]},
    {"itemIndex": 8, "command": ["c", [315.77850341796875, 82.17140197753906], [316.23651123046875, 82.05440521240234], [316.69451904296875, 81.93840026855469], [317.1545104980469, 81.82640075683594]]},
    {"itemIndex": 9, "command": ["c", [317.1545104980469, 81.82640075683594], [317.6125183105469, 81.7134017944336], [318.0715026855469, 81.60440063476562], [318.531494140625, 81.49739837646484]]},
    {"itemIndex": 10, "command": ["c", [318.531494140625, 81.49739837646484], [318.9905090332031, 81.3884048461914], [319.4515075683594, 81.2844009399414], [319.91351318359375, 81.18240356445312]]},
    {"itemIndex": 11, "command": ["c", [319.91351318359375, 81.18240356445312], [320.37451171875, 81.08140563964844], [320.8365173339844, 80.9823989868164], [321.29852294921875, 80.8843994140625]]},
    {"itemIndex": 12, "command": ["c", [321.29852294921875, 80.8843994140625], [321.760498046875, 80.78839874267578], [322.2225036621094, 80.69440460205078], [322.6875, 80.60440063476562]]},
    {"itemIndex": 13, "command": ["c", [322.6875, 80.60440063476562], [323.1505126953125, 80.51139831542969], [323.6125183105469, 80.42340087890625], [324.0775146484375, 80.3384017944336]]},
    {"itemIndex": 14, "command": ["c", [324.0775146484375, 80.3384017944336], [324.5425109863281, 80.25340270996094], [325.0085144042969, 80.16940307617188], [325.4735107421875, 80.08940124511719]]},
    {"itemIndex": 15, "command": ["c", [325.4735107421875, 80.08940124511719], [325.9385070800781, 80.00740051269531], [326.4045104980469, 79.93040466308594], [326.8705139160156, 79.85639953613281]]},
    {"itemIndex": 16, "command": ["c", [326.8705139160156, 79.85639953613281], [327.3365173339844, 79.78040313720703], [327.8025207519531, 79.70840454101562], [328.2705078125, 79.639404296875]]},
    {"itemIndex": 17, "command": ["c", [328.2705078125, 79.639404296875], [328.7375183105469, 79.57040405273438], [329.2035217285156, 79.50240325927734], [329.6725158691406, 79.43840026855469]]},
    {"itemIndex": 18, "command": ["c", [329.6725158691406, 79.43840026855469], [330.1405029296875, 79.37440490722656], [330.6094970703125, 79.3124008178711], [331.0765075683594, 79.25440216064453]]},
    {"itemIndex": 19, "command": ["c", [331.0765075683594, 79.25440216064453], [331.5465087890625, 79.19640350341797], [332.0155029296875, 79.139404296875], [332.4835205078125, 79.0864028930664]]},
    {"itemIndex": 20, "command": ["c", [332.4835205078125, 79.0864028930664], [332.9535217285156, 79.03340148925781], [333.42352294921875, 78.9833984375], [333.89251708984375, 78.93440246582031]]},
    {"itemIndex": 21, "command": ["c", [333.89251708984375, 78.93440246582031], [334.3625183105469, 78.88740539550781], [334.83349609375, 78.84239959716797], [335.301513671875, 78.79940032958984]]},
    {"itemIndex": 22, "command": ["c", [335.301513671875, 78.79940032958984], [335.77349853515625, 78.75740051269531], [336.2455139160156, 78.71739959716797], [336.7145080566406, 78.68140411376953]]},
    {"itemIndex": 23, "command": ["c", [336.7145080566406, 78.68140411376953], [337.1855163574219, 78.64440155029297], [337.6575012207031, 78.60940551757812], [338.12750244140625, 78.57839965820312]]},
    {"itemIndex": 24, "command": ["c", [338.12750244140625, 78.57839965820312], [338.5985107421875, 78.54740142822266], [339.07049560546875, 78.51840209960938], [339.5425109863281, 78.49240112304688]]},
    {"itemIndex": 25, "command": ["c", [339.5425109863281, 78.49240112304688], [340.0135192871094, 78.46540069580078], [340.4855041503906, 78.44239807128906], [340.9565124511719, 78.42240142822266]]},
    {"itemIndex": 26, "command": ["c", [340.9565124511719, 78.42240142822266], [341.4284973144531, 78.40240478515625], [341.9015197753906, 78.3843994140625], [342.3735046386719, 78.36940002441406]]},
    {"itemIndex": 27, "command": ["c", [342.3735046386719, 78.36940002441406], [342.8445129394531, 78.35440063476562], [343.3175048828125, 78.34140014648438], [343.7895202636719, 78.33240509033203]]},
    {"itemIndex": 28, "command": ["c", [343.7895202636719, 78.33240509033203], [344.2615051269531, 78.32340240478516], [344.7335205078125, 78.31539916992188], [345.20550537109375, 78.3114013671875]]},
    {"itemIndex": 29, "command": ["c", [345.20550537109375, 78.3114013671875], [345.6784973144531, 78.30740356445312], [346.1495056152344, 78.30740356445312], [346.62249755859375, 78.30740356445312]]},
    {"itemIndex": 30, "command": ["c", [346.62249755859375, 78.30740356445312], [347.09552001953125, 78.30840301513672], [347.5675048828125, 78.31340026855469], [348.0404968261719, 78.32040405273438]]},
    {"itemIndex": 31, "command": ["c", [348.0404968261719, 78.32040405273438], [348.5115051269531, 78.32740020751953], [348.9835205078125, 78.3364028930664], [349.4565124511719, 78.34940338134766]]},
    {"itemIndex": 32, "command": ["c", [349.4565124511719, 78.34940338134766], [349.9275207519531, 78.3624038696289], [350.3995056152344, 78.37640380859375], [350.87249755859375, 78.39340209960938]]},
    {"itemIndex": 33, "command": ["c", [350.87249755859375, 78.39340209960938], [351.3424987792969, 78.41239929199219], [351.81549072265625, 78.43340301513672], [352.2875061035156, 78.45640563964844]]},
    {"itemIndex": 34, "command": ["c", [352.2875061035156, 78.45640563964844], [352.7585144042969, 78.47940063476562], [353.2304992675781, 78.50540161132812], [353.7015075683594, 78.5344009399414]]},
    {"itemIndex": 35, "command": ["c", [353.7015075683594, 78.5344009399414], [354.17352294921875, 78.56340026855469], [354.6445007324219, 78.59439849853516], [355.11651611328125, 78.62940216064453]]},
    {"itemIndex": 36, "command": ["c", [355.11651611328125, 78.62940216064453], [355.58551025390625, 78.66339874267578], [356.0565185546875, 78.70140075683594], [356.52850341796875, 78.74040222167969]]},
    {"itemIndex": 37, "command": ["c", [356.52850341796875, 78.74040222167969], [356.99749755859375, 78.78040313720703], [357.468505859375, 78.82240295410156], [357.93951416015625, 78.86840057373047]]},
    {"itemIndex": 38, "command": ["c", [357.93951416015625, 78.86840057373047], [358.40850830078125, 78.91239929199219], [358.8785095214844, 78.96040344238281], [359.3485107421875, 79.01139831542969]]},
    {"itemIndex": 39, "command": ["c", [359.3485107421875, 79.01139831542969], [359.8175048828125, 79.0614013671875], [360.2864990234375, 79.1144027709961], [360.7565002441406, 79.17140197753906]]},
    {"itemIndex": 40, "command": ["c", [360.7565002441406, 79.17140197753906], [361.2245178222656, 79.22740173339844], [361.6925048828125, 79.2863998413086], [362.1614990234375, 79.34740447998047]]},
    {"itemIndex": 41, "command": ["c", [362.1614990234375, 79.34740447998047], [362.6295166015625, 79.40840148925781], [363.09649658203125, 79.47340393066406], [363.56549072265625, 79.5404052734375]]},
    {"itemIndex": 42, "command": ["c", [363.56549072265625, 79.5404052734375], [364.03350830078125, 79.60639953613281], [364.49951171875, 79.67739868164062], [364.96551513671875, 79.74839782714844]]},
    {"itemIndex": 43, "command": ["c", [364.96551513671875, 79.74839782714844], [365.4324951171875, 79.82240295410156], [365.8995056152344, 79.89640045166016], [366.3634948730469, 79.97340393066406]]},
    {"itemIndex": 44, "command": ["c", [366.3634948730469, 79.97340393066406], [366.83050537109375, 80.05239868164062], [367.2965087890625, 80.13240051269531], [367.7615051269531, 80.21640014648438]]},
    {"itemIndex": 45, "command": ["c", [367.7615051269531, 80.21640014648438], [368.2254943847656, 80.29940032958984], [368.69049072265625, 80.3843994140625], [369.1545104980469, 80.47440338134766]]},
    {"itemIndex": 46, "command": ["c", [369.1545104980469, 80.47440338134766], [369.6184997558594, 80.5624008178711], [370.08251953125, 80.65240478515625], [370.54351806640625, 80.74739837646484]]},
    {"itemIndex": 47, "command": ["c", [370.54351806640625, 80.74739837646484], [371.0065002441406, 80.84140014648438], [371.468505859375, 80.9374008178711], [371.9305114746094, 81.03739929199219]]},
    {"itemIndex": 48, "command": ["c", [371.9305114746094, 81.03739929199219], [372.39251708984375, 81.13639831542969], [372.853515625, 81.2384033203125], [373.31451416015625, 81.34239959716797]]},
    {"itemIndex": 49, "command": ["c", [373.31451416015625, 81.34239959716797], [373.7755126953125, 81.44640350341797], [374.2344970703125, 81.55540466308594], [374.6935119628906, 81.6654052734375]]},
    {"itemIndex": 50, "command": ["c", [374.6935119628906, 81.6654052734375], [375.15350341796875, 81.77439880371094], [375.6125183105469, 81.88740539550781], [376.06951904296875, 82.00340270996094]]},
    {"itemIndex": 51, "command": ["c", [376.06951904296875, 82.00340270996094], [376.5274963378906, 82.11740112304688], [376.9855041503906, 82.23540496826172], [377.4414978027344, 82.35639953613281]]},
    {"itemIndex": 52, "command": ["c", [377.4414978027344, 82.35639953613281], [377.89849853515625, 82.47840118408203], [378.3544921875, 82.60040283203125], [378.80950927734375, 82.72640228271484]]},
    {"itemIndex": 53, "command": ["c", [378.80950927734375, 82.72640228271484], [379.2645263671875, 82.85240173339844], [379.718505859375, 82.98040008544922], [380.1725158691406, 83.1124038696289]]},
    {"itemIndex": 54, "command": ["c", [380.1725158691406, 83.1124038696289], [380.62652587890625, 83.24340057373047], [381.0794982910156, 83.37640380859375], [381.531494140625, 83.5134048461914]]},
    {"itemIndex": 55, "command": ["c", [381.531494140625, 83.5134048461914], [381.9825134277344, 83.65039825439453], [382.4355163574219, 83.78839874267578], [382.885498046875, 83.93040466308594]]},
    {"itemIndex": 56, "command": ["c", [382.885498046875, 83.93040466308594], [383.33551025390625, 84.07140350341797], [383.7855224609375, 84.21640014648438], [384.2335205078125, 84.3634033203125]]},
    {"itemIndex": 57, "command": ["c", [384.2335205078125, 84.3634033203125], [384.6835021972656, 84.5103988647461], [385.1304931640625, 84.6594009399414], [385.5784912109375, 84.8114013671875]]},
    {"itemIndex": 58, "command": ["c", [385.5784912109375, 84.8114013671875], [386.0255126953125, 84.9634017944336], [386.47149658203125, 85.11740112304688], [386.9154968261719, 85.27640533447266]]},
    {"itemIndex": 59, "command": ["c", [386.9154968261719, 85.27640533447266], [387.36151123046875, 85.43340301513672], [387.8074951171875, 85.59339904785156], [388.24951171875, 85.75740051269531]]},
    {"itemIndex": 60, "command": ["c", [388.24951171875, 85.75740051269531], [388.47149658203125, 85.8384017944336], [388.6925048828125, 85.92040252685547], [388.91351318359375, 86.00240325927734]]},
    {"itemIndex": 61, "command": ["c", [388.91351318359375, 86.00240325927734], [389.1335144042969, 86.08540344238281], [389.3544921875, 86.16840362548828], [389.57550048828125, 86.25240325927734]]},
    {"itemIndex": 62, "command": ["c", [389.57550048828125, 86.25240325927734], [389.7965087890625, 86.33440399169922], [390.01751708984375, 86.41840362548828], [390.239501953125, 86.50240325927734]]},
    {"itemIndex": 63, "command": ["c", [390.239501953125, 86.50240325927734], [390.46051025390625, 86.5864028930664], [390.6805114746094, 86.67040252685547], [390.9014892578125, 86.75640106201172]]},
    {"itemIndex": 64, "command": ["c", [390.9014892578125, 86.75640106201172], [391.34149169921875, 86.92739868164062], [391.780517578125, 87.10040283203125], [392.21551513671875, 87.28240203857422]]},
    {"itemIndex": 65, "command": ["c", [392.21551513671875, 87.28240203857422], [392.4355163574219, 87.37139892578125], [392.6514892578125, 87.4634017944336], [392.8684997558594, 87.55840301513672]]},
    {"itemIndex": 66, "command": ["c", [392.8684997558594, 87.55840301513672], [393.0845031738281, 87.65340423583984], [393.29949951171875, 87.75040435791016], [393.51348876953125, 87.84940338134766]]},
    {"itemIndex": 67, "command": ["c", [393.51348876953125, 87.84940338134766], [393.9414978027344, 88.04940032958984], [394.364501953125, 88.25740051269531], [394.7845153808594, 88.47740173339844]]},
    {"itemIndex": 68, "command": ["c", [394.7845153808594, 88.47740173339844], [395.2034912109375, 88.69540405273438], [395.6155090332031, 88.92539978027344], [396.0215148925781, 89.1654052734375]]},
    {"itemIndex": 69, "command": ["c", [396.0215148925781, 89.1654052734375], [396.4284973144531, 89.40540313720703], [396.8294982910156, 89.65640258789062], [397.2245178222656, 89.9164047241211]]},
    {"itemIndex": 70, "command": ["c", [397.2245178222656, 89.9164047241211], [397.61651611328125, 90.17639923095703], [398.0045166015625, 90.44740295410156], [398.385498046875, 90.72840118408203]]},
    {"itemIndex": 71, "command": ["c", [398.385498046875, 90.72840118408203], [398.7645263671875, 91.00740051269531], [399.13848876953125, 91.29540252685547], [399.5045166015625, 91.59539794921875]]},
    {"itemIndex": 72, "command": ["c", [399.5045166015625, 91.59539794921875], [399.8705139160156, 91.89340209960938], [400.2294921875, 92.20140075683594], [400.5794982910156, 92.51640319824219]]},
    {"itemIndex": 73, "command": ["c", [400.5794982910156, 92.51640319824219], [400.9305114746094, 92.83340454101562], [401.27349853515625, 93.1594009399414], [401.6075134277344, 93.49240112304688]]},
    {"itemIndex": 74, "command": ["c", [401.6075134277344, 93.49240112304688], [401.9414978027344, 93.82740020751953], [402.2665100097656, 94.16840362548828], [402.5845031738281, 94.51840209960938]]},
    {"itemIndex": 75, "command": ["c", [402.5845031738281, 94.51840209960938], [402.9014892578125, 94.86840057373047], [403.21051025390625, 95.22540283203125], [403.509521484375, 95.59140014648438]]},
    {"itemIndex": 76, "command": ["c", [403.509521484375, 95.59140014648438], [403.8085021972656, 95.9573974609375], [404.0985107421875, 96.33039855957031], [404.3785095214844, 96.70940399169922]]},
    {"itemIndex": 77, "command": ["c", [404.3785095214844, 96.70940399169922], [404.6595153808594, 97.09040069580078], [404.92950439453125, 97.47640228271484], [405.1925048828125, 97.87039947509766]]},
    {"itemIndex": 78, "command": ["c", [405.1925048828125, 97.87039947509766], [405.4525146484375, 98.2634048461914], [405.7044982910156, 98.66339874267578], [405.94451904296875, 99.07040405273438]]},
    {"itemIndex": 79, "command": ["c", [405.94451904296875, 99.07040405273438], [406.1855163574219, 99.47640228271484], [406.4175109863281, 99.8884048461914], [406.6365051269531, 100.30640411376953]]},
    {"itemIndex": 80, "command": ["c", [406.6365051269531, 100.30640411376953], [406.8575134277344, 100.72340393066406], [407.0664978027344, 101.14640045166016], [407.2665100097656, 101.57440185546875]]},
    {"itemIndex": 81, "command": ["c", [407.2665100097656, 101.57440185546875], [407.4645080566406, 102.00440216064453], [407.6545104980469, 102.4364013671875], [407.8315124511719, 102.87440490722656]]},
    {"itemIndex": 82, "command": ["c", [407.8315124511719, 102.87440490722656], [408.009521484375, 103.3114013671875], [408.17449951171875, 103.75440216064453], [408.3294982910156, 104.20040130615234]]},
    {"itemIndex": 83, "command": ["c", [408.3294982910156, 104.20040130615234], [408.4855041503906, 104.64640045166016], [408.6285095214844, 105.09640502929688], [408.7615051269531, 105.55039978027344]]},
    {"itemIndex": 84, "command": ["c", [408.7615051269531, 105.55039978027344], [408.8955078125, 106.00140380859375], [409.01751708984375, 106.45840454101562], [409.12750244140625, 106.91740417480469]]},
    {"itemIndex": 85, "command": ["c", [409.12750244140625, 106.91740417480469], [409.1824951171875, 107.14839935302734], [409.2344970703125, 107.37840270996094], [409.28350830078125, 107.6083984375]]},
    {"itemIndex": 86, "command": ["c", [409.28350830078125, 107.6083984375], [409.3315124511719, 107.83940124511719], [409.3795166015625, 108.07040405273438], [409.4225158691406, 108.30439758300781]]},
    {"itemIndex": 87, "command": ["c", [409.4225158691406, 108.30439758300781], [409.4645080566406, 108.535400390625], [409.5045166015625, 108.76840209960938], [409.54150390625, 109.00140380859375]]},
    {"itemIndex": 88, "command": ["c", [409.54150390625, 109.00140380859375], [409.5784912109375, 109.23440551757812], [409.61151123046875, 109.46940612792969], [409.64349365234375, 109.70240020751953]]},
    {"itemIndex": 89, "command": ["c", [409.64349365234375, 109.70240020751953], [409.70550537109375, 110.17140197753906], [409.7585144042969, 110.6404037475586], [409.8074951171875, 111.11039733886719]]},
    {"itemIndex": 90, "command": ["c", [409.8074951171875, 111.11039733886719], [409.83251953125, 111.34440612792969], [409.85650634765625, 111.58039855957031], [409.8795166015625, 111.81539916992188]]},
    {"itemIndex": 91, "command": ["c", [409.8795166015625, 111.81539916992188], [409.9014892578125, 112.04940032958984], [409.9255065917969, 112.285400390625], [409.947509765625, 112.51940155029297]]},
    {"itemIndex": 92, "command": ["c", [409.947509765625, 112.51940155029297], [409.97052001953125, 112.75440216064453], [409.99151611328125, 112.9894027709961], [410.01348876953125, 113.22540283203125]]},
    {"itemIndex": 93, "command": ["c", [410.01348876953125, 113.22540283203125], [410.0355224609375, 113.46040344238281], [410.0565185546875, 113.69540405273438], [410.0775146484375, 113.93040466308594]]},
    {"itemIndex": 94, "command": ["c", [410.0775146484375, 113.93040466308594], [410.11749267578125, 114.40040588378906], [410.1595153808594, 114.87039947509766], [410.1965026855469, 115.34239959716797]]},
    {"itemIndex": 95, "command": ["c", [410.1965026855469, 115.34239959716797], [410.2344970703125, 115.8124008178711], [410.2715148925781, 116.2844009399414], [410.30450439453125, 116.75540161132812]]},
    {"itemIndex": 96, "command": ["c", [410.30450439453125, 116.75540161132812], [410.3385009765625, 117.22640228271484], [410.3695068359375, 117.69740295410156], [410.3995056152344, 118.16940307617188]]},
    {"itemIndex": 97, "command": ["c", [410.3995056152344, 118.16940307617188], [410.4305114746094, 118.639404296875], [410.4595031738281, 119.11140441894531], [410.48651123046875, 119.5823974609375]]},
    {"itemIndex": 98, "command": ["c", [410.48651123046875, 119.5823974609375], [410.51251220703125, 120.05439758300781], [410.5364990234375, 120.52540588378906], [410.5615234375, 120.99740600585938]]},
    {"itemIndex": 99, "command": ["c", [410.5615234375, 120.99740600585938], [410.58251953125, 121.46839904785156], [410.6044921875, 121.94039916992188], [410.62152099609375, 122.41239929199219]]},
    {"itemIndex": 100, "command": ["c", [410.62152099609375, 122.41239929199219], [410.6415100097656, 122.88540649414062], [410.65850830078125, 123.35639953613281], [410.67449951171875, 123.82839965820312]]},
    {"itemIndex": 101, "command": ["c", [410.67449951171875, 123.82839965820312], [410.6885070800781, 124.30140686035156], [410.7034912109375, 124.77239990234375], [410.71551513671875, 125.24540710449219]]},
    {"itemIndex": 102, "command": ["c", [410.71551513671875, 125.24540710449219], [410.72650146484375, 125.7174072265625], [410.7355041503906, 126.18840026855469], [410.7434997558594, 126.6613998413086]]},
    {"itemIndex": 103, "command": ["c", [410.7434997558594, 126.6613998413086], [410.7505187988281, 127.1333999633789], [410.75750732421875, 127.60440063476562], [410.760498046875, 128.077392578125]]},
    {"itemIndex": 104, "command": ["c", [410.760498046875, 128.077392578125], [410.7645263671875, 128.55039978027344], [410.7655029296875, 129.02239990234375], [410.7655029296875, 129.493408203125]]},
    {"itemIndex": 105, "command": ["c", [410.7655029296875, 129.493408203125], [410.7655029296875, 129.96640014648438], [410.7645263671875, 130.43939208984375], [410.7615051269531, 130.91140747070312]]},
    {"itemIndex": 106, "command": ["c", [410.7615051269531, 130.91140747070312], [410.760498046875, 131.3824005126953], [410.7565002441406, 131.85540771484375], [410.7505187988281, 132.32839965820312]]},
    {"itemIndex": 107, "command": ["c", [410.7505187988281, 132.32839965820312], [410.74652099609375, 132.80039978027344], [410.74151611328125, 133.27340698242188], [410.7344970703125, 133.74440002441406]]},
    {"itemIndex": 108, "command": ["c", [410.7344970703125, 133.74440002441406], [410.7275085449219, 134.21640014648438], [410.72052001953125, 134.68939208984375], [410.7115173339844, 135.16140747070312]]},
    {"itemIndex": 109, "command": ["c", [410.7115173339844, 135.16140747070312], [410.7034912109375, 135.63339233398438], [410.6925048828125, 136.10540771484375], [410.6815185546875, 136.57839965820312]]},
    {"itemIndex": 110, "command": ["c", [410.6815185546875, 136.57839965820312], [410.6725158691406, 137.05039978027344], [410.6595153808594, 137.52139282226562], [410.6465148925781, 137.99440002441406]]},
    {"itemIndex": 111, "command": ["c", [410.6465148925781, 137.99440002441406], [410.63250732421875, 138.46640014648438], [410.6205139160156, 138.93740844726562], [410.6054992675781, 139.410400390625]]},
    {"itemIndex": 112, "command": ["c", [410.6054992675781, 139.410400390625], [410.59051513671875, 139.8824005126953], [410.57550048828125, 140.35540771484375], [410.5615234375, 140.82640075683594]]}
  ] },
  { "pathIndex": 56078, "seqno": 56080, "boundsPt": [410.56048583984375, 140.82620239257812, 412.8044738769531, 140.9011993408203], "style": "style-11", "roles": ["east-door-frame", "room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [410.56048583984375, 140.82620239257812], [412.8044738769531, 140.9011993408203]]}
  ] },
  { "pathIndex": 56127, "seqno": 56129, "boundsPt": [409.2669982910156, 118.62449645996094, 410.7139892578125, 124.83349609375], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["c", [410.7139892578125, 124.83349609375], [410.6419982910156, 122.62849426269531], [410.177001953125, 120.6344985961914], [409.2669982910156, 118.62449645996094]]}
  ] },
  { "pathIndex": 56128, "seqno": 56130, "boundsPt": [410.39727783203125, 118.11168670654297, 411.9552917480469, 124.81369018554688], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["c", [411.9552917480469, 124.81369018554688], [411.8793029785156, 122.43269348144531], [411.3793029785156, 120.28069305419922], [410.39727783203125, 118.11168670654297]]}
  ] },
  { "pathIndex": 56129, "seqno": 56131, "boundsPt": [409.2663879394531, 118.11151123046875, 410.3963928222656, 118.6235122680664], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [410.3963928222656, 118.11151123046875], [409.2663879394531, 118.6235122680664]]}
  ] },
  { "pathIndex": 56305, "seqno": 56307, "boundsPt": [326.13958740234375, 189.419189453125, 330.6455993652344, 189.419189453125], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [326.13958740234375, 189.419189453125], [330.6455993652344, 189.419189453125]]}
  ] },
  { "pathIndex": 56306, "seqno": 56308, "boundsPt": [326.139404296875, 188.276611328125, 330.4273986816406, 188.276611328125], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [330.4273986816406, 188.276611328125], [326.139404296875, 188.276611328125]]}
  ] },
  { "pathIndex": 56307, "seqno": 56309, "boundsPt": [326.13958740234375, 200.01730346679688, 332.68157958984375, 200.01730346679688], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [326.13958740234375, 200.01730346679688], [332.68157958984375, 200.01730346679688]]}
  ] },
  { "pathIndex": 56308, "seqno": 56310, "boundsPt": [326.1398010253906, 198.87460327148438, 332.4627990722656, 198.87460327148438], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [332.4627990722656, 198.87460327148438], [326.1398010253906, 198.87460327148438]]}
  ] },
  { "pathIndex": 56344, "seqno": 56346, "boundsPt": [411.9552917480469, 124.81439971923828, 411.9552917480469, 128.07440185546875], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [411.9552917480469, 128.07440185546875], [411.9552917480469, 124.81439971923828]]}
  ] },
  { "pathIndex": 56345, "seqno": 56347, "boundsPt": [410.7139892578125, 128.18548583984375, 410.77398681640625, 128.18548583984375], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [410.7139892578125, 128.18548583984375], [410.77398681640625, 128.18548583984375]]}
  ] },
  { "pathIndex": 56400, "seqno": 56402, "boundsPt": [410.4784851074219, 128.18548583984375, 410.7144775390625, 128.18548583984375], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [410.4784851074219, 128.18548583984375], [410.7144775390625, 128.18548583984375]]}
  ] },
  { "pathIndex": 56401, "seqno": 56403, "boundsPt": [410.4784851074219, 124.83749389648438, 410.4784851074219, 128.18649291992188], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [410.4784851074219, 124.83749389648438], [410.4784851074219, 128.18649291992188]]}
  ] },
  { "pathIndex": 56402, "seqno": 56404, "boundsPt": [410.4779968261719, 124.83349609375, 410.7139892578125, 124.83749389648438], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [410.7139892578125, 124.83349609375], [410.4779968261719, 124.83749389648438]]}
  ] },
  { "pathIndex": 56403, "seqno": 56405, "boundsPt": [410.7139892578125, 124.83248901367188, 410.7139892578125, 128.18548583984375], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [410.7139892578125, 128.18548583984375], [410.7139892578125, 124.83248901367188]]}
  ] },
  { "pathIndex": 56529, "seqno": 56531, "boundsPt": [330.9128112792969, 184.74729919433594, 336.0768127441406, 211.6383056640625], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [336.0768127441406, 211.6383056640625], [330.9128112792969, 184.74729919433594]]}
  ] },
  { "pathIndex": 56530, "seqno": 56532, "boundsPt": [329.7698059082031, 184.85629272460938, 330.42681884765625, 188.2762908935547], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [329.7698059082031, 184.85629272460938], [330.42681884765625, 188.2762908935547]]}
  ] },
  { "pathIndex": 56531, "seqno": 56533, "boundsPt": [330.6455993652344, 189.419189453125, 332.46258544921875, 198.87518310546875], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [330.6455993652344, 189.419189453125], [332.46258544921875, 198.87518310546875]]}
  ] },
  { "pathIndex": 56532, "seqno": 56534, "boundsPt": [332.6824035644531, 200.01730346679688, 334.91339111328125, 211.6383056640625], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [332.6824035644531, 200.01730346679688], [334.91339111328125, 211.6383056640625]]}
  ] },
  { "pathIndex": 56533, "seqno": 56535, "boundsPt": [326.1390075683594, 88.40679931640625, 387.2550048828125, 88.40679931640625], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [387.2550048828125, 88.40679931640625], [326.1390075683594, 88.40679931640625]]}
  ] },
  { "pathIndex": 56534, "seqno": 56536, "boundsPt": [336.7372131347656, 89.64810180664062, 387.25421142578125, 89.64810180664062], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [336.7372131347656, 89.64810180664062], [387.25421142578125, 89.64810180664062]]}
  ] },
  { "pathIndex": 56535, "seqno": 56537, "boundsPt": [387.2550048828125, 88.4071044921875, 387.2550048828125, 89.64810180664062], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [387.2550048828125, 89.64810180664062], [387.2550048828125, 88.4071044921875]]}
  ] },
  { "pathIndex": 56536, "seqno": 56538, "boundsPt": [387.3125, 88.43740844726562, 402.2934875488281, 98.618408203125], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["c", [402.2934875488281, 98.618408203125], [399.2674865722656, 91.389404296875], [395.14947509765625, 88.58940887451172], [387.3125, 88.43740844726562]]}
  ] },
  { "pathIndex": 56537, "seqno": 56539, "boundsPt": [387.28912353515625, 88.43728637695312, 387.3131103515625, 89.67828369140625], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [387.3131103515625, 88.43728637695312], [387.28912353515625, 89.67828369140625]]}
  ] },
  { "pathIndex": 56538, "seqno": 56540, "boundsPt": [387.288818359375, 89.67859649658203, 401.1488037109375, 99.09759521484375], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["c", [401.1488037109375, 99.09759521484375], [398.34881591796875, 92.4085922241211], [394.538818359375, 89.81959533691406], [387.288818359375, 89.67859649658203]]}
  ] },
  { "pathIndex": 56539, "seqno": 56541, "boundsPt": [401.1488037109375, 99.09759521484375, 409.3048095703125, 118.58859252929688], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [401.1488037109375, 99.09759521484375], [409.3048095703125, 118.58859252929688]]}
  ] },
  { "pathIndex": 56540, "seqno": 56542, "boundsPt": [409.3045959472656, 118.10858917236328, 410.4495849609375, 118.58859252929688], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [409.3045959472656, 118.58859252929688], [410.4495849609375, 118.10858917236328]]}
  ] },
  { "pathIndex": 56541, "seqno": 56543, "boundsPt": [404.2554016113281, 103.30740356445312, 410.44940185546875, 118.10940551757812], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [410.44940185546875, 118.10940551757812], [404.2554016113281, 103.30740356445312]]}
  ] },
  { "pathIndex": 56542, "seqno": 56544, "boundsPt": [402.2938232421875, 98.61768341064453, 403.8008117675781, 102.22268676757812], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [403.8008117675781, 102.22268676757812], [402.2938232421875, 98.61768341064453]]}
  ] },
  { "pathIndex": 56552, "seqno": 56554, "boundsPt": [326.1399841308594, 211.83551025390625, 334.9519958496094, 211.83551025390625], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [334.9519958496094, 211.83551025390625], [326.1399841308594, 211.83551025390625]]}
  ] },
  { "pathIndex": 56553, "seqno": 56555, "boundsPt": [326.13958740234375, 212.97821044921875, 335.1716003417969, 212.97821044921875], "style": "style-11", "roles": ["room-wall-rail"], "items": [
    {"itemIndex": 0, "command": ["l", [326.13958740234375, 212.97821044921875], [335.1716003417969, 212.97821044921875]]}
  ] },
] as const satisfies readonly GannonGroundSourcePath[];

/** Clockwise room-side native runs; all discontinuities remain explicit. */
export const GANNON_GROUND_ROOM_BOUNDARY_RUNS = [
  {
    "id": "north-inner-wall",
    "items": [
      {
        "pathIndex": 56534,
        "itemIndex": 0,
        "reversed": false,
        "t0": 2.369473139393053e-05,
        "t1": 1
      }
    ],
    "interpretation": "Straight native inner architectural rail, excluding the parallel trim at y=89.697/89.933. Start fraction is the explicitly estimated native-line NW intersection."
  },
  {
    "id": "northeast-small-room-curve",
    "items": [
      {
        "pathIndex": 56538,
        "itemIndex": 0,
        "reversed": true
      },
      {
        "pathIndex": 56539,
        "itemIndex": 0,
        "reversed": false
      }
    ],
    "interpretation": "Inner curve and sloped wall belong to the furnished Gannon enclosure; outer auditorium shell rails are retained only as context."
  },
  {
    "id": "northeast-tangent-return",
    "items": [
      {
        "pathIndex": 56127,
        "itemIndex": 0,
        "reversed": true
      }
    ],
    "interpretation": "Short native tangent curve toward the rear wall; do not substitute the broad upper-volume curve."
  },
  {
    "id": "east-inner-wall-above-door",
    "items": [
      {
        "pathIndex": 56077,
        "itemIndex": 101,
        "reversed": false,
        "t0": 0.7094319430491403,
        "t1": 1
      },
      {
        "pathIndex": 56077,
        "itemIndex": 102,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 103,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 104,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 105,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 106,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 107,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 108,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 109,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 110,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 111,
        "reversed": false
      },
      {
        "pathIndex": 56077,
        "itemIndex": 112,
        "reversed": false
      }
    ],
    "interpretation": "Start fraction is an estimated handoff at the short return endpoint Y. Full native 113-item path remains unchanged; items 0..100 are not Gannon inner-wall geometry."
  },
  {
    "id": "upper-east-frame-return",
    "items": [
      {
        "pathIndex": 54759,
        "itemIndex": 0,
        "reversed": false
      },
      {
        "pathIndex": 52318,
        "itemIndex": 2,
        "reversed": true
      }
    ],
    "interpretation": "Frame lines and upper painted jamb are distinct from the drawn leaf hinge."
  },
  {
    "id": "middle-east-jamb-room-face",
    "items": [
      {
        "pathIndex": 52322,
        "itemIndex": 4,
        "reversed": true
      }
    ],
    "interpretation": "Room-side edge of the opaque central jamb between the two paired openings."
  },
  {
    "id": "lower-east-jamb-room-face",
    "items": [
      {
        "pathIndex": 52655,
        "itemIndex": 2,
        "reversed": true
      },
      {
        "pathIndex": 52655,
        "itemIndex": 1,
        "reversed": true
      },
      {
        "pathIndex": 52655,
        "itemIndex": 0,
        "reversed": true
      }
    ],
    "interpretation": "Later opaque paint controls the lower return. Retain earlier small jamb outlines without interpreting their internal edges as another opening."
  },
  {
    "id": "southeast-room-pane-inner-rails",
    "items": [
      {
        "pathIndex": 54077,
        "itemIndex": 0,
        "reversed": false
      },
      {
        "pathIndex": 54074,
        "itemIndex": 0,
        "reversed": false
      },
      {
        "pathIndex": 54070,
        "itemIndex": 0,
        "reversed": false
      },
      {
        "pathIndex": 54066,
        "itemIndex": 0,
        "reversed": false
      }
    ],
    "interpretation": "Four short room enclosure panes. Parallel inner/outer frame edges, caps and mullions remain in the source paths."
  },
  {
    "id": "southeast-opaque-foot",
    "items": [
      {
        "pathIndex": 52654,
        "itemIndex": 5,
        "reversed": true
      },
      {
        "pathIndex": 52654,
        "itemIndex": 4,
        "reversed": true
      }
    ],
    "interpretation": "Room-side edge of black foot beside the open stepped transition; adjoining white mask 52325 must also be replayed."
  },
  {
    "id": "southeast-step-mouth",
    "items": [
      {
        "pathIndex": 50524,
        "itemIndex": 0,
        "reversed": false
      }
    ],
    "interpretation": "Native cross-section at the lobby/corridor end of the three drawn step bands. This is an open transition, not a leaf or solid wall."
  },
  {
    "id": "south-short-rail",
    "items": [
      {
        "pathIndex": 51974,
        "itemIndex": 0,
        "reversed": true
      }
    ],
    "interpretation": "Thin rail from the step return to the south wall/marker; height and whether it is a guard are not established."
  },
  {
    "id": "south-inner-wall",
    "items": [
      {
        "pathIndex": 52188,
        "itemIndex": 92,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 91,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 90,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 89,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 88,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 87,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 86,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 85,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 84,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 83,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 82,
        "reversed": true
      }
    ],
    "interpretation": "Native fill edge includes its tiny trim jog at items 84..88. Parallel strokes and black paint must not be snapped to one invented survey line."
  },
  {
    "id": "southwest-inner-wall-with-door-conflict",
    "items": [
      {
        "pathIndex": 52188,
        "itemIndex": 81,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 80,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 79,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 78,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 77,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 76,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 75,
        "reversed": true
      }
    ],
    "interpretation": "The fill edge is continuous through the west/front single door location. Keep this conflict explicit; the door is not automatically cut from this wall."
  },
  {
    "id": "west-inner-wall",
    "items": [
      {
        "pathIndex": 52188,
        "itemIndex": 74,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 73,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 72,
        "reversed": true
      }
    ],
    "interpretation": "Long straight front wall of the furnished room, east of the separate full-height partition at x=324.245/326.142."
  },
  {
    "id": "northwest-inner-wall",
    "items": [
      {
        "pathIndex": 52188,
        "itemIndex": 71,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 70,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 69,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 68,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 67,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 66,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 65,
        "reversed": true
      },
      {
        "pathIndex": 52188,
        "itemIndex": 64,
        "reversed": true,
        "t0": 0.003265765765765766,
        "t1": 1
      }
    ],
    "interpretation": "Oblique wall to the native north-west corner; preserves the small source segments and all endpoints. Final fraction stops at that same estimated NW intersection; raw commands are unchanged."
  }
] as const satisfies readonly GannonGroundBoundaryRun[];

/** Consumer junction/portal proposals. No entry here is a native PDF command. */
export const GANNON_GROUND_CLOSURE_ESTIMATES = [
  {
    "afterRun": "north-inner-wall",
    "beforeRun": "northeast-small-room-curve",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 56534,
      "itemIndex": 0,
      "t": 1
    },
    "to": {
      "pathIndex": 56538,
      "itemIndex": 0,
      "t": 1.0
    },
    "gapPt": 0.046125545713679376,
    "nativeCommand": false
  },
  {
    "afterRun": "northeast-small-room-curve",
    "beforeRun": "northeast-tangent-return",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 56539,
      "itemIndex": 0,
      "t": 1.0
    },
    "to": {
      "pathIndex": 56127,
      "itemIndex": 0,
      "t": 1.0
    },
    "gapPt": 0.05214197041919394,
    "nativeCommand": false
  },
  {
    "afterRun": "northeast-tangent-return",
    "beforeRun": "east-inner-wall-above-door",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 56127,
      "itemIndex": 0,
      "t": 0.0
    },
    "to": {
      "pathIndex": 56077,
      "itemIndex": 101,
      "t": 0.7094319430491403
    },
    "gapPt": 0.00960863672639789,
    "nativeCommand": false
  },
  {
    "afterRun": "east-inner-wall-above-door",
    "beforeRun": "upper-east-frame-return",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 56077,
      "itemIndex": 112,
      "t": 1.0
    },
    "to": {
      "pathIndex": 54759,
      "itemIndex": 0,
      "t": 0.0
    },
    "gapPt": 0.33771944016363314,
    "nativeCommand": false
  },
  {
    "afterRun": "upper-east-frame-return",
    "beforeRun": "middle-east-jamb-room-face",
    "kind": "upper-pair-virtual-threshold-estimate",
    "from": {
      "pathIndex": 52318,
      "itemIndex": 2,
      "t": 0.0
    },
    "to": {
      "pathIndex": 52322,
      "itemIndex": 4,
      "t": 1.0
    },
    "gapPt": 11.301002285606197,
    "nativeCommand": false
  },
  {
    "afterRun": "middle-east-jamb-room-face",
    "beforeRun": "lower-east-jamb-room-face",
    "kind": "lower-pair-virtual-threshold-estimate",
    "from": {
      "pathIndex": 52322,
      "itemIndex": 4,
      "t": 0.0
    },
    "to": {
      "pathIndex": 52655,
      "itemIndex": 2,
      "t": 1.0
    },
    "gapPt": 14.234390676536366,
    "nativeCommand": false
  },
  {
    "afterRun": "lower-east-jamb-room-face",
    "beforeRun": "southeast-room-pane-inner-rails",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 52655,
      "itemIndex": 0,
      "t": 0.0
    },
    "to": {
      "pathIndex": 54077,
      "itemIndex": 0,
      "t": 0.0
    },
    "gapPt": 0.9785265631644948,
    "nativeCommand": false
  },
  {
    "afterRun": "southeast-room-pane-inner-rails",
    "beforeRun": "southeast-opaque-foot",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 54066,
      "itemIndex": 0,
      "t": 1.0
    },
    "to": {
      "pathIndex": 52654,
      "itemIndex": 5,
      "t": 1.0
    },
    "gapPt": 1.425424115396351,
    "nativeCommand": false
  },
  {
    "afterRun": "southeast-opaque-foot",
    "beforeRun": "southeast-step-mouth",
    "kind": "open-step-transition-junction-estimate",
    "from": {
      "pathIndex": 52654,
      "itemIndex": 4,
      "t": 0.0
    },
    "to": {
      "pathIndex": 50524,
      "itemIndex": 0,
      "t": 0.0
    },
    "gapPt": 1.1146009797081018,
    "nativeCommand": false
  },
  {
    "afterRun": "southeast-step-mouth",
    "beforeRun": "south-short-rail",
    "kind": "open-step-transition-junction-estimate",
    "from": {
      "pathIndex": 50524,
      "itemIndex": 0,
      "t": 1.0
    },
    "to": {
      "pathIndex": 51974,
      "itemIndex": 0,
      "t": 1.0
    },
    "gapPt": 0.6708751971857405,
    "nativeCommand": false
  },
  {
    "afterRun": "south-short-rail",
    "beforeRun": "south-inner-wall",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 51974,
      "itemIndex": 0,
      "t": 0.0
    },
    "to": {
      "pathIndex": 52188,
      "itemIndex": 92,
      "t": 1.0
    },
    "gapPt": 0.2117387886171479,
    "nativeCommand": false
  },
  {
    "afterRun": "south-inner-wall",
    "beforeRun": "southwest-inner-wall-with-door-conflict",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 52188,
      "itemIndex": 82,
      "t": 0.0
    },
    "to": {
      "pathIndex": 52188,
      "itemIndex": 81,
      "t": 1.0
    },
    "gapPt": 0.0,
    "nativeCommand": false
  },
  {
    "afterRun": "southwest-inner-wall-with-door-conflict",
    "beforeRun": "west-inner-wall",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 52188,
      "itemIndex": 75,
      "t": 0.0
    },
    "to": {
      "pathIndex": 52188,
      "itemIndex": 74,
      "t": 1.0
    },
    "gapPt": 0.0,
    "nativeCommand": false
  },
  {
    "afterRun": "west-inner-wall",
    "beforeRun": "northwest-inner-wall",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 52188,
      "itemIndex": 72,
      "t": 0.0
    },
    "to": {
      "pathIndex": 52188,
      "itemIndex": 71,
      "t": 1.0
    },
    "gapPt": 0.0,
    "nativeCommand": false
  },
  {
    "afterRun": "northwest-inner-wall",
    "beforeRun": "north-inner-wall",
    "kind": "source-junction-gap-estimate",
    "from": {
      "pathIndex": 52188,
      "itemIndex": 64,
      "t": 0.003265765765765766
    },
    "to": {
      "pathIndex": 56534,
      "itemIndex": 0,
      "t": 2.369473139393053e-05
    },
    "gapPt": 0.0,
    "nativeCommand": false,
    "junctionPolicy": "estimated-intersection-of-native-lines-56534.0-and-52188.64",
    "northSelectionT0": 2.369473139393053e-05,
    "westSelectionT0": 0.003265765765765766,
    "rawEndpointMismatchPt": 0.0016337596208891813
  },
  {
    "kind": "pane-mullion-junction-estimate",
    "from": {
      "pathIndex": 54077,
      "itemIndex": 0,
      "t": 1.0
    },
    "to": {
      "pathIndex": 54074,
      "itemIndex": 0,
      "t": 0.0
    },
    "gapPt": 0.3875754520022855,
    "nativeCommand": false
  },
  {
    "kind": "pane-mullion-junction-estimate",
    "from": {
      "pathIndex": 54074,
      "itemIndex": 0,
      "t": 1.0
    },
    "to": {
      "pathIndex": 54070,
      "itemIndex": 0,
      "t": 0.0
    },
    "gapPt": 0.3884190882710161,
    "nativeCommand": false
  },
  {
    "kind": "pane-mullion-junction-estimate",
    "from": {
      "pathIndex": 54070,
      "itemIndex": 0,
      "t": 1.0
    },
    "to": {
      "pathIndex": 54066,
      "itemIndex": 0,
      "t": 0.0
    },
    "gapPt": 0.3887080197923918,
    "nativeCommand": false
  }
] as const;

/** Drawn doors and open steps, with exact command identities and paint conflicts. */
export const GANNON_GROUND_OPENINGS = [
  {
    "id": "gannon-east-upper-pair",
    "assignment": "gannon-to-public-east-corridor",
    "kind": "paired-door",
    "leaves": [
      {
        "id": "north",
        "outline": [
          {
            "pathIndex": 48964,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48965,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48966,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48967,
            "itemIndex": 0,
            "reversed": false
          }
        ],
        "swing": {
          "pathIndex": 48968,
          "itemIndex": 0,
          "reversed": false
        }
      },
      {
        "id": "south",
        "outline": [
          {
            "pathIndex": 48921,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48960,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48961,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48962,
            "itemIndex": 0,
            "reversed": false
          }
        ],
        "swing": {
          "pathIndex": 48963,
          "itemIndex": 0,
          "reversed": false
        }
      }
    ],
    "hingeSpan": [
      {
        "pathIndex": 48964,
        "itemIndex": 0,
        "t": 0
      },
      {
        "pathIndex": 48921,
        "itemIndex": 0,
        "t": 0
      }
    ],
    "opaquePaintPathIndices": [
      52318,
      52317,
      52322,
      52674
    ],
    "framePathIndices": [
      54746,
      54747,
      54748,
      54749,
      54750,
      54751,
      54752,
      54753,
      54758,
      54759,
      54764,
      54765,
      54766,
      54767,
      54771,
      54772,
      54773,
      54774,
      54775,
      55504,
      55505,
      55506,
      55507,
      55508,
      55509,
      55510,
      56078
    ],
    "swingObservation": "Both leaf rectangles and both cubic swings project east into the public corridor. Drawn-open pose does not establish current operation."
  },
  {
    "id": "gannon-east-lower-pair",
    "assignment": "gannon-to-public-east-corridor",
    "kind": "paired-door",
    "leaves": [
      {
        "id": "north",
        "outline": [
          {
            "pathIndex": 48974,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48975,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48976,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48977,
            "itemIndex": 0,
            "reversed": false
          }
        ],
        "swing": {
          "pathIndex": 48978,
          "itemIndex": 0,
          "reversed": false
        }
      },
      {
        "id": "south",
        "outline": [
          {
            "pathIndex": 48969,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48970,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48971,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 48972,
            "itemIndex": 0,
            "reversed": false
          }
        ],
        "swing": {
          "pathIndex": 48973,
          "itemIndex": 0,
          "reversed": false
        }
      }
    ],
    "hingeSpan": [
      {
        "pathIndex": 48974,
        "itemIndex": 0,
        "t": 0
      },
      {
        "pathIndex": 48969,
        "itemIndex": 0,
        "t": 0
      }
    ],
    "opaquePaintPathIndices": [
      52317,
      52322,
      52319,
      52655
    ],
    "framePathIndices": [
      54738,
      54739,
      54740,
      54741,
      54742,
      54743,
      54744,
      54745,
      54750,
      54753,
      54754,
      54755,
      54756,
      54757,
      54760,
      54761,
      54762,
      54763,
      54768,
      54769,
      54770,
      54776,
      54777,
      54778,
      55500,
      55501,
      55502,
      55503,
      55504,
      55507,
      55854,
      55855,
      55856,
      55969,
      55970,
      55971,
      55972
    ],
    "swingObservation": "Both drawn leaf rectangles and swings project east. Later fill 52655 overlaps the lower jamb; retain it in paint order."
  },
  {
    "id": "gannon-front-west-single",
    "assignment": "gannon-to-small-front-alcove-destination-unresolved",
    "kind": "single-door-with-wall-paint-conflict",
    "leaves": [
      {
        "id": "single",
        "outline": [
          {
            "pathIndex": 49042,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 49043,
            "itemIndex": 0,
            "reversed": false
          },
          {
            "pathIndex": 49044,
            "itemIndex": 0,
            "reversed": false
          }
        ],
        "swing": {
          "pathIndex": 49045,
          "itemIndex": 0,
          "reversed": false
        }
      }
    ],
    "hingeSpan": [
      {
        "pathIndex": 49042,
        "itemIndex": 0,
        "t": 0
      },
      {
        "pathIndex": 49045,
        "itemIndex": 0,
        "t": 0
      }
    ],
    "opaquePaintPathIndices": [
      52188
    ],
    "framePathIndices": [
      53917,
      53918,
      53919,
      53920,
      53921,
      54059
    ],
    "swingObservation": "Drawn leaf and arc lie on the furnished room side. Native wall paint and rail continue across the nominal mouth. Official IRB 0318 image independently shows a front single door; no public continuation is established."
  },
  {
    "id": "gannon-southeast-open-steps",
    "assignment": "gannon-back-corner-to-east-corridor-observed-open-transition",
    "kind": "open-stepped-transition",
    "leaves": [],
    "stepCrossSections": [
      {
        "pathIndex": 50527,
        "itemIndex": 0,
        "reversed": false
      },
      {
        "pathIndex": 50537,
        "itemIndex": 0,
        "reversed": false
      },
      {
        "pathIndex": 50534,
        "itemIndex": 0,
        "reversed": false
      },
      {
        "pathIndex": 50524,
        "itemIndex": 0,
        "reversed": false
      }
    ],
    "railPathIndices": [
      50523,
      50524,
      50525,
      50526,
      50527,
      50528,
      50529,
      50530,
      50531,
      50532,
      50533,
      50534,
      50535,
      50536,
      50537,
      50538,
      50539,
      50540,
      50541,
      50542,
      50543,
      50544,
      50545,
      50546,
      50547,
      50627,
      51965,
      51966,
      51967,
      51968,
      51969,
      51970,
      51971,
      51972,
      51973,
      51974,
      51975,
      51979,
      51980,
      51981,
      51982,
      51983,
      51984,
      51985,
      51986,
      51987,
      51988,
      51989,
      51990,
      51991,
      51992,
      51993
    ],
    "opaquePaintPathIndices": [
      52654
    ],
    "whiteMaskPathIndices": [
      52325
    ],
    "swingObservation": "Three drawn bands, with rails on both sides; no leaf or swing across this transition. Ground plan continuity is visible, but section, riser heights, access status and guard function are unresolved."
  },
  {
    "id": "north-exterior-vestibule-outer-pair",
    "assignment": "public-east-corridor-via-north-vestibule-to-exterior",
    "kind": "paired-door",
    "leaves": [
      {
        "id": "west",
        "outline": [
          {
            "pathIndex": 48901,
            "itemIndex": 0,
            "reversed": false
          }
        ],
        "swing": {
          "pathIndex": 48903,
          "itemIndex": 0,
          "reversed": false
        }
      },
      {
        "id": "east",
        "outline": [
          {
            "pathIndex": 48902,
            "itemIndex": 0,
            "reversed": false
          }
        ],
        "swing": {
          "pathIndex": 48904,
          "itemIndex": 0,
          "reversed": false
        }
      }
    ],
    "opaquePaintPathIndices": [
      52311,
      52198,
      52309,
      52306
    ],
    "swingObservation": "Two single native leaf lines and two cubic swings outside the north row. These doors belong to the building entrance, not to the Gannon wall."
  },
  {
    "id": "north-exterior-vestibule-inner-pair",
    "assignment": "public-east-corridor-to-north-vestibule",
    "kind": "paired-door",
    "leaves": [
      {
        "id": "west",
        "outline": [
          {
            "pathIndex": 48928,
            "itemIndex": 0,
            "reversed": false
          }
        ],
        "swing": {
          "pathIndex": 48926,
          "itemIndex": 0,
          "reversed": false
        }
      },
      {
        "id": "east",
        "outline": [
          {
            "pathIndex": 48948,
            "itemIndex": 0,
            "reversed": false
          }
        ],
        "swing": {
          "pathIndex": 48927,
          "itemIndex": 0,
          "reversed": false
        }
      }
    ],
    "opaquePaintPathIndices": [
      52311,
      52198,
      52310,
      52307
    ],
    "swingObservation": "Two native leaf lines and two swings into the vestibule. The corridor below this row is continuous with the lobby."
  }
] as const;

/** Observed plan connectivity; no fitted route, surveyed dimensions or heights. */
export const GANNON_GROUND_PUBLIC_CONNECTION = {
  "kind": "observed-public-plan-connectivity",
  "geographicDirections": "Page east/right and north/up; labels do not provide surveyed bearings.",
  "nodes": [
    "gannon-furnished-room",
    "east-public-corridor",
    "ground-lobby",
    "north-exterior-vestibule",
    "north-exterior"
  ],
  "edges": [
    {
      "from": "gannon-furnished-room",
      "to": "east-public-corridor",
      "openingIds": [
        "gannon-east-upper-pair",
        "gannon-east-lower-pair"
      ],
      "evidence": "Complete leaf/swing and jamb paint on original Ground page."
    },
    {
      "from": "gannon-furnished-room",
      "to": "east-public-corridor",
      "openingIds": [
        "gannon-southeast-open-steps"
      ],
      "evidence": "Observed open stepped transition; public access/elevation unresolved."
    },
    {
      "from": "east-public-corridor",
      "to": "ground-lobby",
      "openingIds": [],
      "evidence": "Open page-south continuation between source auditorium edge and east facade; no transverse solid wall on the source."
    },
    {
      "from": "east-public-corridor",
      "to": "north-exterior-vestibule",
      "openingIds": [
        "north-exterior-vestibule-inner-pair"
      ],
      "evidence": "Inner north building entrance row."
    },
    {
      "from": "north-exterior-vestibule",
      "to": "north-exterior",
      "openingIds": [
        "north-exterior-vestibule-outer-pair"
      ],
      "evidence": "Outer north building entrance row."
    }
  ],
  "eastFacadeInnerBaselineItems": [
    {
      "pathIndex": 49121,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49117,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49113,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49109,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49105,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49101,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49097,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49093,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49089,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49085,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49081,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49077,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49073,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 49129,
      "itemIndex": 0,
      "reversed": false
    }
  ],
  "projectedVolumeItems": [
    {
      "pathIndex": 52653,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 52676,
      "itemIndex": 0,
      "reversed": false
    },
    {
      "pathIndex": 52677,
      "itemIndex": 0,
      "reversed": false
    }
  ],
  "prohibitedInference": "Do not turn dashed upper-volume projection into a Ground corridor barrier, Gannon perimeter, door or service route.",
  "frontAlcove": "Front single door is recorded without a fabricated route to the lobby or neighboring unassigned rooms."
} as const;

/** Native context preserved to prevent false assignment to Gannon. */
export const GANNON_GROUND_ASSIGNMENT_LIMITS = {
  "upperVolume": "Ground dashed curve 52676 and transverse line 52653, including detached south swing 48786/leaf 49010..49013, are not proven Gannon perimeter/doors. Original Level 1 page 8 shows Antonov occupying the larger upper volume.",
  "neighbors": "South block doors 48785/48791 and south corner swing 49014 with leaf 49015..49018 have no Gannon room label. Preserve as unassigned context, with no circulation or room-use model.",
  "outerWall": "Full native room-wall paths also include outer auditorium and support-room geometry; roles on a path do not assign every item to Gannon. Consume the directed boundary refs, not an entire compound path as a room polygon."
} as const;

/* eslint-enable no-loss-of-precision */
