/** Source plan boundaries around the curved intermediate atrium landing.
 * Original UMD/HDR guide pages 6 and 8, top-left PDF points, six decimals.
 * No fitted circle, physical elevations, or measured guard thicknesses.
 * The Level 1 below-floor projection is partial and differs from the Ground
 * cubic. Keep it as comparison evidence, not a second registration or a
 * continuation silently stitched into Ground's contours. See the review.
 */
import type { AtriumOpeningSourceSegment } from './atrium-opening-trace';

export const ATRIUM_MIDDLE_PROVENANCE = {
 sourceUrl: 'https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf',
 pdfSha256: 'c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474',
 primaryPageIndex: 6, contextPageIndex: 8,
 curveTolerancePt: .01,
 elevationVerified: false,
} as const;

export const ATRIUM_MIDDLE_OUTER_SOURCE = [
 {pathIndex:50420,itemIndex:0,op:"l",reversed:false,points:[[175.279907,420.610718],[172.958908,426.235718]]},
 {pathIndex:50404,itemIndex:0,op:"c",reversed:false,points:[[172.958694,426.236206],[166.546692,441.7742],[176.638687,459.161194],[193.312698,461.298218]]},
 {pathIndex:50418,itemIndex:0,op:"l",reversed:false,points:[[193.311905,461.298584],[245.417908,467.975586]]},
 {pathIndex:50441,itemIndex:0,op:"l",reversed:false,points:[[245.417694,467.974792],[253.5457,404.542786]]},
 {pathIndex:50415,itemIndex:0,op:"l",reversed:false,points:[[253.5457,404.543793],[224.826706,400.8638]]},
 {pathIndex:50440,itemIndex:0,op:"l",reversed:false,points:[[224.826401,400.863586],[223.116394,413.601593]]},
] as const satisfies readonly AtriumOpeningSourceSegment[];

export const ATRIUM_MIDDLE_INNER_SOURCE = [
 {pathIndex:50421,itemIndex:0,op:"c",reversed:false,points:[[190.563293,422.68042],[189.808289,423.950409],[189.109299,425.253418],[188.465286,426.584412]]},
 {pathIndex:50411,itemIndex:0,op:"c",reversed:false,points:[[188.465805,426.584412],[187.487808,428.605408],[186.648804,430.667419],[185.938812,432.794403]]},
 {pathIndex:50409,itemIndex:0,op:"c",reversed:false,points:[[185.938202,432.7948],[183.531204,440.002808],[185.489197,443.995789],[192.663208,446.502808]]},
 {pathIndex:50407,itemIndex:0,op:"c",reversed:false,points:[[192.663498,446.503418],[201.633499,449.637421],[210.509491,451.167419],[220.011505,451.213409]]},
 {pathIndex:50442,itemIndex:0,op:"l",reversed:true,points:[[224.778595,414.008484],[220.009598,451.213501]]},
 {pathIndex:50439,itemIndex:0,op:"c",reversed:false,points:[[224.778595,414.008484],[224.225601,413.867493],[223.672592,413.732483],[223.115601,413.601471]]},
] as const satisfies readonly AtriumOpeningSourceSegment[];

export const ATRIUM_MIDDLE_LEVEL1_CONTEXT_SOURCE = [
 {pathIndex:86871,itemIndex:0,op:"l",reversed:false,points:[[163.533493,419.004883],[161.249496,424.539886]]},
 {pathIndex:86863,itemIndex:0,op:"c",reversed:false,points:[[161.249603,424.5401],[156.940598,434.983093],[158.137604,442.202087],[165.588608,450.691101]]},
 {pathIndex:86864,itemIndex:0,op:"c",reversed:false,points:[[165.684692,450.8013],[166.000687,451.157288],[166.325699,451.502289],[166.661697,451.841309]]},
 {pathIndex:86865,itemIndex:0,op:"c",reversed:false,points:[[166.8591,452.035583],[167.166107,452.339569],[167.482101,452.632568],[167.804108,452.918579]]},
 {pathIndex:86866,itemIndex:0,op:"c",reversed:false,points:[[168.109207,453.185394],[168.404205,453.436401],[168.702209,453.682404],[169.008209,453.921387]]},
 {pathIndex:86867,itemIndex:0,op:"c",reversed:false,points:[[169.485397,454.284393],[169.741394,454.476379],[170.002396,454.661407],[170.266403,454.843384]]},
 {pathIndex:86868,itemIndex:0,op:"c",reversed:false,points:[[170.873596,455.246582],[171.104599,455.393585],[171.336594,455.537567],[171.568604,455.677582]]},
 {pathIndex:86872,itemIndex:0,op:"c",reversed:false,points:[[176.714798,424.459412],[176.643799,424.599426],[176.57579,424.742401],[176.507797,424.882416]]},
 {pathIndex:86870,itemIndex:0,op:"c",reversed:false,points:[[176.507706,424.88269],[175.8367,426.2677],[175.231705,427.67569],[174.688705,429.114685]]},
 {pathIndex:86869,itemIndex:0,op:"c",reversed:false,points:[[182.494995,445.106995],[189.785995,447.462982],[197.056992,448.755005],[204.712997,449.054993]]},
] as const satisfies readonly AtriumOpeningSourceSegment[];
