/** Original UMD/HDR Level 4 glazing run: ordered native endpoints.
 * Original zero-based pages 11 (west continuation) and 12 (main); top-left
 * origin, +Y down. Page 11 remains in its own frame. For a replay ONLY, subtract
 * 576 from page 11 X before applying fourthGuidePlan or the closed-loop helper.
 * Fractions evaluate exactly to PyMuPDF's native binary coordinates.
 * reversed changes travel direction; points always retain original item order.
 * 195 native lines + one short cubic's endpoint chord (page 11 path 15334).
 * Its complete cubic and the separately drawn black baselines/gray caps/skirt
 * are retained below. Two 1.10 pt transitions and mullion/corner gaps require
 * interpreted joins. This array is not a continuous native PDF path or a
 * surveyed envelope. See docs/research/iribe/fourth-facade-2026-10-03.md.
 */
export const FOURTH_FACADE_SOURCE = [
  // west-tip approach.
  {page: 11, pathIndex: 14002, itemIndex: 0, reversed: false, points: [[13701097 / 32768, 8152315 / 32768], [13901801 / 32768, 7939749 / 32768]]},
  {page: 11, pathIndex: 14063, itemIndex: 0, reversed: false, points: [[6952719 / 16384, 3967951 / 16384], [14042965 / 32768, 15580431 / 65536]]},
  {page: 11, pathIndex: 14059, itemIndex: 0, reversed: false, points: [[7023293 / 16384, 7786385 / 32768], [14184113 / 32768, 15281397 / 65536]]},
  {page: 11, pathIndex: 14055, itemIndex: 0, reversed: false, points: [[7093879 / 16384, 7636871 / 32768], [14325285 / 32768, 14982369 / 65536]]},
  {page: 11, pathIndex: 14051, itemIndex: 0, reversed: false, points: [[7164451 / 16384, 3743675 / 16384], [14466429 / 32768, 57357 / 256]]},
  {page: 11, pathIndex: 14047, itemIndex: 0, reversed: false, points: [[7235037 / 16384, 7337833 / 32768], [912971 / 2048, 7192245 / 32768]]},
  {page: 11, pathIndex: 14043, itemIndex: 0, reversed: false, points: [[3652789 / 8192, 7188405 / 32768], [7374309 / 16384, 7042817 / 32768]]},
  {page: 11, pathIndex: 14006, itemIndex: 0, reversed: false, points: [[7376129 / 16384, 439935 / 2048], [1861215 / 4096, 1723343 / 8192]]},
  {page: 11, pathIndex: 14010, itemIndex: 0, reversed: false, points: [[14893341 / 32768, 1722377 / 8192], [15030803 / 32768, 421495 / 2048]]},
  {page: 11, pathIndex: 14039, itemIndex: 0, reversed: false, points: [[15034443 / 32768, 6740079 / 32768], [15171905 / 32768, 6594491 / 32768]]},
  {page: 11, pathIndex: 14014, itemIndex: 0, reversed: false, points: [[15175529 / 32768, 6590631 / 32768], [15312991 / 32768, 6445043 / 32768]]},
  {page: 11, pathIndex: 14035, itemIndex: 0, reversed: false, points: [[1914579 / 4096, 1610295 / 8192], [7727047 / 16384, 786949 / 4096]]},
  {page: 11, pathIndex: 14018, itemIndex: 0, reversed: false, points: [[15457737 / 32768, 6291751 / 32768], [15595199 / 32768, 6146163 / 32768]]},
  {page: 11, pathIndex: 14022, itemIndex: 0, reversed: false, points: [[487463 / 1024, 6142303 / 32768], [7868139 / 16384, 5996715 / 32768]]},
  {page: 11, pathIndex: 14067, itemIndex: 0, reversed: false, points: [[15739919 / 32768, 2996427 / 16384], [15877381 / 32768, 2923633 / 16384]]},
  {page: 11, pathIndex: 14083, itemIndex: 0, reversed: false, points: [[15881001 / 32768, 5843403 / 32768], [16018463 / 32768, 5697815 / 32768]]},
  {page: 11, pathIndex: 14071, itemIndex: 0, reversed: false, points: [[16022107 / 32768, 5693977 / 32768], [16159569 / 32768, 5548389 / 32768]]},
  {page: 11, pathIndex: 14079, itemIndex: 0, reversed: false, points: [[8081593 / 16384, 2772263 / 16384], [2037581 / 4096, 2699469 / 16384]]},
  {page: 11, pathIndex: 14075, itemIndex: 0, reversed: false, points: [[16304289 / 32768, 2697539 / 16384], [16441751 / 32768, 2624745 / 16384]]},
  {page: 11, pathIndex: 14087, itemIndex: 0, reversed: false, points: [[8222697 / 16384, 5245649 / 32768], [4150883 / 8192, 5078139 / 32768]]},
  // diagonal west.
  {page: 11, pathIndex: 13969, itemIndex: 0, reversed: false, points: [[16636507 / 32768, 5082661 / 32768], [8416983 / 16384, 10538287 / 65536]]},
  {page: 11, pathIndex: 13965, itemIndex: 0, reversed: false, points: [[8418915 / 16384, 5272751 / 32768], [4285373 / 8192, 5559471 / 32768]]},
  {page: 11, pathIndex: 13961, itemIndex: 0, reversed: false, points: [[33487 / 64, 2781541 / 16384], [8724503 / 16384, 2924901 / 16384]]},
  {page: 11, pathIndex: 13957, itemIndex: 0, reversed: false, points: [[4363219 / 8192, 5853413 / 32768], [4400689 / 8192, 5994971 / 32768]]},
  {page: 11, pathIndex: 13953, itemIndex: 0, reversed: false, points: [[4401659 / 8192, 2999291 / 16384], [8878275 / 16384, 1535035 / 8192]]},
  {page: 11, pathIndex: 13949, itemIndex: 0, reversed: false, points: [[8880195 / 16384, 1535937 / 8192], [4516013 / 8192, 1607617 / 8192]]},
  {page: 11, pathIndex: 13945, itemIndex: 0, reversed: false, points: [[9033949 / 16384, 6434079 / 32768], [2296445 / 4096, 6720799 / 32768]]},
  {page: 11, pathIndex: 13941, itemIndex: 0, reversed: false, points: [[4593853 / 8192, 3362205 / 16384], [9262663 / 16384, 429123 / 2048]]},
  {page: 11, pathIndex: 13937, itemIndex: 0, reversed: false, points: [[9264583 / 16384, 3434799 / 16384], [2334885 / 4096, 7011123 / 32768]]},
  {page: 11, pathIndex: 13933, itemIndex: 0, reversed: false, points: [[4670731 / 8192, 1753691 / 8192], [9493293 / 16384, 1825371 / 8192]]},
  // diagonal main.
  {page: 12, pathIndex: 31384, itemIndex: 0, reversed: false, points: [[3714161 / 1048576, 7305095 / 32768], [13431315 / 1048576, 7591815 / 32768]]},
  {page: 12, pathIndex: 31380, itemIndex: 0, reversed: false, points: [[13555257 / 1048576, 3797713 / 16384], [4587861 / 262144, 7736951 / 32768]]},
  {page: 12, pathIndex: 31376, itemIndex: 0, reversed: false, points: [[2309423 / 131072, 7740595 / 32768], [11635785 / 524288, 985265 / 4096]]},
  {page: 12, pathIndex: 31372, itemIndex: 0, reversed: false, points: [[11697861 / 524288, 123215 / 512], [8278219 / 262144, 127695 / 512]]},
  {page: 12, pathIndex: 31368, itemIndex: 0, reversed: false, points: [[8308995 / 262144, 8176091 / 32768], [2684571 / 65536, 8462811 / 32768]]},
  {page: 12, pathIndex: 31364, itemIndex: 0, reversed: false, points: [[10769111 / 262144, 4233211 / 16384], [2992105 / 65536, 2151995 / 8192]]},
  {page: 12, pathIndex: 31360, itemIndex: 0, reversed: false, points: [[5999585 / 131072, 8611591 / 32768], [13198479 / 262144, 8753149 / 32768]]},
  {page: 12, pathIndex: 31356, itemIndex: 0, reversed: false, points: [[6614601 / 131072, 8756753 / 32768], [7829245 / 131072, 9043473 / 32768]]},
  // north-west curve.
  {page: 12, pathIndex: 31508, itemIndex: 0, reversed: false, points: [[15686435 / 262144, 2261671 / 8192], [2319057 / 32768, 9366795 / 32768]]},
  {page: 12, pathIndex: 31504, itemIndex: 0, reversed: false, points: [[567 / 8, 4684869 / 16384], [4963959 / 65536, 1187675 / 4096]]},
  {page: 12, pathIndex: 31500, itemIndex: 0, reversed: false, points: [[4971371 / 65536, 9504401 / 32768], [10593383 / 131072, 9632229 / 32768]]},
  {page: 12, pathIndex: 31496, itemIndex: 0, reversed: false, points: [[10607591 / 131072, 602181 / 2048], [3041247 / 32768, 9916865 / 32768]]},
  {page: 12, pathIndex: 31492, itemIndex: 0, reversed: false, points: [[12178751 / 131072, 9919191 / 32768], [6897893 / 65536, 5089717 / 16384]]},
  {page: 12, pathIndex: 31488, itemIndex: 0, reversed: false, points: [[6905417 / 65536, 5090889 / 16384], [3630901 / 32768, 642927 / 2048]]},
  {page: 12, pathIndex: 31484, itemIndex: 0, reversed: false, points: [[14540289 / 131072, 2572297 / 8192], [15262889 / 131072, 5194991 / 16384]]},
  {page: 12, pathIndex: 31480, itemIndex: 0, reversed: false, points: [[15278631 / 131072, 10392047 / 32768], [4248165 / 32768, 10609397 / 32768]]},
  {page: 12, pathIndex: 31476, itemIndex: 0, reversed: false, points: [[2125947 / 16384, 5305585 / 16384], [9383347 / 65536, 10804731 / 32768]]},
  {page: 12, pathIndex: 31472, itemIndex: 0, reversed: false, points: [[9391525 / 65536, 675405 / 2048], [9776483 / 65536, 10882305 / 32768]]},
  {page: 12, pathIndex: 31468, itemIndex: 0, reversed: false, points: [[9785377 / 65536, 10884009 / 32768], [10173743 / 65536, 5477607 / 16384]]},
  {page: 12, pathIndex: 31464, itemIndex: 0, reversed: false, points: [[5091105 / 32768, 5478341 / 16384], [11097289 / 65536, 11104335 / 32768]]},
  {page: 12, pathIndex: 31460, itemIndex: 0, reversed: false, points: [[694077 / 4096, 11105465 / 32768], [12035057 / 65536, 11227853 / 32768]]},
  {page: 12, pathIndex: 31456, itemIndex: 0, reversed: false, points: [[3010927 / 16384, 11228899 / 32768], [1555959 / 8192, 11273627 / 32768]]},
  {page: 12, pathIndex: 31452, itemIndex: 0, reversed: false, points: [[3114251 / 16384, 5637313 / 16384], [6431467 / 32768, 11314537 / 32768]]},
  {page: 12, pathIndex: 31448, itemIndex: 0, reversed: false, points: [[12871729 / 65536, 1414411 / 4096], [13821149 / 65536, 177959 / 512]]},
  // north long.
  {page: 12, pathIndex: 31816, itemIndex: 0, reversed: false, points: [[6915221 / 32768, 355939 / 1024], [14659079 / 65536, 2860783 / 8192]]},
  {page: 12, pathIndex: 31812, itemIndex: 0, reversed: false, points: [[14669519 / 65536, 11443811 / 32768], [15078529 / 65536, 5735029 / 16384]]},
  {page: 12, pathIndex: 31808, itemIndex: 0, reversed: false, points: [[15089035 / 65536, 358459 / 1024], [15498045 / 65536, 5748435 / 16384]]},
  {page: 12, pathIndex: 31804, itemIndex: 0, reversed: false, points: [[15508511 / 65536, 5748785 / 16384], [2042119 / 8192, 11550621 / 32768]]},
  {page: 12, pathIndex: 31800, itemIndex: 0, reversed: false, points: [[2043437 / 8192, 5775653 / 16384], [134187 / 512, 5802195 / 16384]]},
  {page: 12, pathIndex: 31796, itemIndex: 0, reversed: false, points: [[8593215 / 32768, 5802533 / 16384], [1099715 / 4096, 11631313 / 32768]]},
  {page: 12, pathIndex: 31792, itemIndex: 0, reversed: false, points: [[2200739 / 8192, 5815973 / 16384], [9007461 / 32768, 728633 / 2048]]},
  {page: 12, pathIndex: 31788, itemIndex: 0, reversed: false, points: [[9012691 / 32768, 2914707 / 8192], [4603 / 16, 11711879 / 32768]]},
  {page: 12, pathIndex: 31784, itemIndex: 0, reversed: false, points: [[1179023 / 4096, 2928141 / 8192], [9846437 / 32768, 735353 / 2048]]},
  {page: 12, pathIndex: 31780, itemIndex: 0, reversed: false, points: [[2462919 / 8192, 2941581 / 8192], [10056181 / 32768, 11792571 / 32768]]},
  {page: 12, pathIndex: 31776, itemIndex: 0, reversed: false, points: [[5030707 / 16384, 5896603 / 16384], [10265919 / 32768, 2954855 / 8192]]},
  {page: 12, pathIndex: 31772, itemIndex: 0, reversed: false, points: [[10271149 / 32768, 11820083 / 32768], [5342701 / 16384, 5936567 / 16384]]},
  {page: 12, pathIndex: 31768, itemIndex: 0, reversed: false, points: [[5345321 / 16384, 11873845 / 32768], [11104895 / 32768, 745431 / 2048]]},
  {page: 12, pathIndex: 31764, itemIndex: 0, reversed: false, points: [[5555069 / 16384, 11927585 / 32768], [11314643 / 32768, 1494229 / 4096]]},
  {page: 12, pathIndex: 31760, itemIndex: 0, reversed: false, points: [[11319873 / 32768, 373577 / 1024], [5762189 / 16384, 11980711 / 32768]]},
  {page: 12, pathIndex: 31756, itemIndex: 0, reversed: false, points: [[5764817 / 16384, 374417 / 1024], [5971927 / 16384, 3008607 / 8192]]},
  {page: 12, pathIndex: 31752, itemIndex: 0, reversed: false, points: [[2987275 / 8192, 12035103 / 32768], [12363353 / 32768, 6044077 / 16384]]},
  {page: 12, pathIndex: 31748, itemIndex: 0, reversed: false, points: [[3092149 / 8192, 6044431 / 16384], [12573101 / 32768, 3028761 / 8192]]},
  {page: 12, pathIndex: 31744, itemIndex: 0, reversed: false, points: [[6289177 / 16384, 6057871 / 16384], [12782859 / 32768, 3035481 / 8192]]},
  {page: 12, pathIndex: 31740, itemIndex: 0, reversed: false, points: [[6394043 / 16384, 6071299 / 16384], [13202339 / 32768, 6097841 / 16384]]},
  {page: 12, pathIndex: 31736, itemIndex: 0, reversed: false, points: [[13207581 / 32768, 3049091 / 8192], [13621801 / 32768, 1531181 / 4096]]},
  {page: 12, pathIndex: 31732, itemIndex: 0, reversed: false, points: [[6813527 / 16384, 3062531 / 8192], [13831559 / 32768, 12276371 / 32768]]},
  {page: 12, pathIndex: 31728, itemIndex: 0, reversed: false, points: [[3459203 / 8192, 12277003 / 32768], [14041317 / 32768, 12303185 / 32768]]},
  {page: 12, pathIndex: 31724, itemIndex: 0, reversed: false, points: [[877909 / 2048, 6151941 / 16384], [14460797 / 32768, 12356933 / 32768]]},
  {page: 12, pathIndex: 31720, itemIndex: 0, reversed: false, points: [[7233023 / 16384, 12357619 / 32768], [7440133 / 16384, 12410703 / 32768]]},
  {page: 12, pathIndex: 31716, itemIndex: 0, reversed: false, points: [[465173 / 1024, 6205691 / 16384], [15090041 / 32768, 12437629 / 32768]]},
  {page: 12, pathIndex: 31712, itemIndex: 0, reversed: false, points: [[7547637 / 16384, 1554783 / 4096], [15299779 / 32768, 12464511 / 32768]]},
  {page: 12, pathIndex: 31708, itemIndex: 0, reversed: false, points: [[7652501 / 16384, 1558143 / 4096], [15719255 / 32768, 12518195 / 32768]]},
  {page: 12, pathIndex: 31704, itemIndex: 0, reversed: false, points: [[15724501 / 32768, 391215 / 1024], [8069377 / 16384, 3142991 / 8192]]},
  {page: 12, pathIndex: 31700, itemIndex: 0, reversed: false, points: [[8071997 / 16384, 12572639 / 32768], [16348499 / 32768, 6299443 / 16384]]},
  {page: 12, pathIndex: 31696, itemIndex: 0, reversed: false, points: [[4088433 / 8192, 12599519 / 32768], [16558237 / 32768, 6312883 / 16384]]},
  {page: 12, pathIndex: 31692, itemIndex: 0, reversed: false, points: [[16563487 / 32768, 6313199 / 16384], [4244427 / 8192, 12679449 / 32768]]},
  {page: 12, pathIndex: 31688, itemIndex: 0, reversed: false, points: [[4245745 / 8192, 6340079 / 16384], [1087325 / 2048, 12733209 / 32768]]},
  {page: 12, pathIndex: 31684, itemIndex: 0, reversed: false, points: [[4350613 / 8192, 3183475 / 8192], [8803479 / 16384, 12760147 / 32768]]},
  {page: 12, pathIndex: 31680, itemIndex: 0, reversed: false, points: [[8806103 / 16384, 3190195 / 8192], [2227089 / 4096, 12787027 / 32768]]},
  {page: 12, pathIndex: 31676, itemIndex: 0, reversed: false, points: [[4455487 / 8192, 3196915 / 8192], [2287623 / 4096, 12849067 / 32768]]},
  // east end.
  {page: 12, pathIndex: 31388, itemIndex: 0, reversed: false, points: [[2290729 / 4096, 6434105 / 16384], [9150513 / 16384, 6530951 / 16384]]},
  {page: 12, pathIndex: 31594, itemIndex: 0, reversed: false, points: [[4575087 / 8192, 6533567 / 16384], [4568517 / 8192, 6636049 / 16384]]},
  {page: 12, pathIndex: 31590, itemIndex: 0, reversed: false, points: [[9136705 / 16384, 6638679 / 16384], [9123565 / 16384, 13482387 / 32768]]},
  {page: 12, pathIndex: 31586, itemIndex: 0, reversed: false, points: [[9123227 / 16384, 3371901 / 8192], [9110087 / 16384, 13692633 / 32768]]},
  {page: 12, pathIndex: 31582, itemIndex: 0, reversed: false, points: [[4554883 / 8192, 6848925 / 16384], [4548313 / 8192, 13902879 / 32768]]},
  {page: 12, pathIndex: 31578, itemIndex: 0, reversed: false, points: [[2274073 / 4096, 108657 / 256], [567697 / 1024, 3528265 / 8192]]},
  {page: 12, pathIndex: 31574, itemIndex: 0, reversed: false, points: [[9082819 / 16384, 7059171 / 16384], [9069679 / 16384, 7161653 / 16384]]},
  {page: 12, pathIndex: 31392, itemIndex: 0, reversed: false, points: [[9069347 / 16384, 3582137 / 8192], [9056207 / 16384, 14533577 / 32768]]},
  {page: 12, pathIndex: 31404, itemIndex: 0, reversed: false, points: [[2263971 / 4096, 7269397 / 16384], [1130343 / 2048, 14743823 / 32768]]},
  {page: 12, pathIndex: 31396, itemIndex: 0, reversed: false, points: [[4521205 / 8192, 14749041 / 32768], [4514635 / 8192, 7477035 / 16384]]},
  {page: 12, pathIndex: 31570, itemIndex: 0, reversed: false, points: [[9028937 / 16384, 14959287 / 32768], [9015797 / 16384, 3791079 / 8192]]},
  {page: 12, pathIndex: 31408, itemIndex: 0, reversed: false, points: [[2253869 / 4096, 15169533 / 32768], [281323 / 512, 15374497 / 32768]]},
  {page: 12, pathIndex: 31400, itemIndex: 0, reversed: false, points: [[4501001 / 8192, 15379779 / 32768], [4494431 / 8192, 15584743 / 32768]]},
  {page: 12, pathIndex: 31598, itemIndex: 0, reversed: false, points: [[561783 / 1024, 15589979 / 32768], [2243847 / 4096, 246797 / 512]]},
  {page: 12, pathIndex: 31602, itemIndex: 0, reversed: false, points: [[8975063 / 16384, 15800225 / 32768], [8961923 / 16384, 8002627 / 16384]]},
  {page: 12, pathIndex: 31606, itemIndex: 0, reversed: false, points: [[4480797 / 8192, 16010471 / 32768], [4474227 / 8192, 4053875 / 8192]]},
  {page: 12, pathIndex: 31610, itemIndex: 0, reversed: false, points: [[1118515 / 2048, 16220717 / 32768], [2233745 / 4096, 8212873 / 16384]]},
  {page: 12, pathIndex: 31614, itemIndex: 0, reversed: false, points: [[4467323 / 8192, 8215483 / 16384], [4460753 / 8192, 8317965 / 16384]]},
  {page: 12, pathIndex: 31618, itemIndex: 0, reversed: false, points: [[8921185 / 16384, 4160303 / 8192], [8909683 / 16384, 2102573 / 4096]]},
  // south long.
  {page: 12, pathIndex: 31330, itemIndex: 0, reversed: false, points: [[8899209 / 16384, 4210789 / 8192], [8707123 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31333, itemIndex: 0, reversed: false, points: [[1088061 / 2048, 4210789 / 8192], [8547251 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31336, itemIndex: 0, reversed: false, points: [[4272299 / 8192, 4210789 / 8192], [8387361 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31339, itemIndex: 0, reversed: false, points: [[4192351 / 8192, 4210789 / 8192], [8227465 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31421, itemIndex: 0, reversed: false, points: [[8224809 / 16384, 4210789 / 8192], [2016893 / 4096, 4210789 / 8192]]},
  {page: 12, pathIndex: 31424, itemIndex: 0, reversed: false, points: [[16129835 / 32768, 4210789 / 8192], [247115 / 512, 4210789 / 8192]]},
  {page: 12, pathIndex: 31427, itemIndex: 0, reversed: false, points: [[7905023 / 16384, 4210789 / 8192], [3873893 / 8192, 4210789 / 8192]]},
  {page: 12, pathIndex: 31623, itemIndex: 0, reversed: false, points: [[7745141 / 16384, 4210789 / 8192], [118561 / 256, 4210789 / 8192]]},
  {page: 12, pathIndex: 31626, itemIndex: 0, reversed: false, points: [[15170493 / 32768, 4210789 / 8192], [7428009 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31629, itemIndex: 0, reversed: false, points: [[7425355 / 16384, 4210789 / 8192], [3634059 / 8192, 4210789 / 8192]]},
  {page: 12, pathIndex: 31632, itemIndex: 0, reversed: false, points: [[3632731 / 8192, 4210789 / 8192], [7108225 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31635, itemIndex: 0, reversed: false, points: [[7105577 / 16384, 4210789 / 8192], [1737085 / 4096, 4210789 / 8192]]},
  {page: 12, pathIndex: 31638, itemIndex: 0, reversed: false, points: [[6945687 / 16384, 4210789 / 8192], [3394225 / 8192, 4210789 / 8192]]},
  {page: 12, pathIndex: 31641, itemIndex: 0, reversed: false, points: [[13571585 / 32768, 4210789 / 8192], [6628555 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31644, itemIndex: 0, reversed: false, points: [[13251799 / 32768, 4210789 / 8192], [3234331 / 8192, 4210789 / 8192]]},
  {page: 12, pathIndex: 31647, itemIndex: 0, reversed: false, points: [[808251 / 2048, 4210789 / 8192], [6308771 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31650, itemIndex: 0, reversed: false, points: [[6306113 / 16384, 4210789 / 8192], [1537219 / 4096, 4210789 / 8192]]},
  {page: 12, pathIndex: 31653, itemIndex: 0, reversed: false, points: [[3073115 / 8192, 4210789 / 8192], [5988993 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31656, itemIndex: 0, reversed: false, points: [[5986335 / 16384, 4210789 / 8192], [2914549 / 8192, 4210789 / 8192]]},
  {page: 12, pathIndex: 31659, itemIndex: 0, reversed: false, points: [[11652887 / 32768, 4210789 / 8192], [2834603 / 8192, 4210789 / 8192]]},
  {page: 12, pathIndex: 31662, itemIndex: 0, reversed: false, points: [[11333101 / 32768, 4210789 / 8192], [5509313 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31665, itemIndex: 0, reversed: false, points: [[172083 / 512, 4210789 / 8192], [5349419 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31668, itemIndex: 0, reversed: false, points: [[668347 / 2048, 4210789 / 8192], [5189539 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31671, itemIndex: 0, reversed: false, points: [[5186881 / 16384, 4210789 / 8192], [1257411 / 4096, 4210789 / 8192]]},
  {page: 12, pathIndex: 31818, itemIndex: 0, reversed: false, points: [[1256747 / 4096, 4210789 / 8192], [4869751 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31821, itemIndex: 0, reversed: false, points: [[9734193 / 32768, 4210789 / 8192], [4709859 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31824, itemIndex: 0, reversed: false, points: [[2353601 / 8192, 4210789 / 8192], [4549965 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31827, itemIndex: 0, reversed: false, points: [[568415 / 2048, 4210789 / 8192], [4390083 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31830, itemIndex: 0, reversed: false, points: [[8774851 / 32768, 4210789 / 8192], [1057547 / 4096, 4210789 / 8192]]},
  {page: 12, pathIndex: 31837, itemIndex: 0, reversed: false, points: [[2113767 / 8192, 4210789 / 8192], [16281187 / 65536, 4210789 / 8192]]},
  {page: 12, pathIndex: 31840, itemIndex: 0, reversed: false, points: [[4067641 / 16384, 4210789 / 8192], [15641615 / 65536, 4210789 / 8192]]},
  {page: 12, pathIndex: 31843, itemIndex: 0, reversed: false, points: [[15630985 / 65536, 4210789 / 8192], [3750509 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31846, itemIndex: 0, reversed: false, points: [[14991419 / 65536, 4210789 / 8192], [7181235 / 32768, 4210789 / 8192]]},
  {page: 12, pathIndex: 31849, itemIndex: 0, reversed: false, points: [[7175943 / 32768, 4210789 / 8192], [13722937 / 65536, 4210789 / 8192]]},
  {page: 12, pathIndex: 31852, itemIndex: 0, reversed: false, points: [[13712307 / 65536, 4210789 / 8192], [6541679 / 32768, 4210789 / 8192]]},
  {page: 12, pathIndex: 31855, itemIndex: 0, reversed: false, points: [[13072741 / 65536, 4210789 / 8192], [777737 / 4096, 4210789 / 8192]]},
  {page: 12, pathIndex: 31858, itemIndex: 0, reversed: false, points: [[12433169 / 65536, 4210789 / 8192], [2951055 / 16384, 4210789 / 8192]]},
  {page: 12, pathIndex: 31861, itemIndex: 0, reversed: false, points: [[2948409 / 16384, 4210789 / 8192], [11164687 / 65536, 4210789 / 8192]]},
  {page: 12, pathIndex: 31864, itemIndex: 0, reversed: false, points: [[11154063 / 65536, 4210789 / 8192], [5262557 / 32768, 4210789 / 8192]]},
  {page: 12, pathIndex: 31867, itemIndex: 0, reversed: false, points: [[10514491 / 65536, 4210789 / 8192], [4942771 / 32768, 4210789 / 8192]]},
  {page: 12, pathIndex: 31874, itemIndex: 0, reversed: false, points: [[9874919 / 65536, 4210789 / 8192], [4622985 / 32768, 4210789 / 8192]]},
  {page: 12, pathIndex: 31877, itemIndex: 0, reversed: false, points: [[2308835 / 16384, 4210789 / 8192], [8606391 / 65536, 4210789 / 8192]]},
  {page: 12, pathIndex: 31880, itemIndex: 0, reversed: false, points: [[4297887 / 32768, 4210789 / 8192], [7966825 / 65536, 4210789 / 8192]]},
  {page: 12, pathIndex: 31883, itemIndex: 0, reversed: false, points: [[15912495 / 131072, 4210789 / 8192], [14654597 / 131072, 4210789 / 8192]]},
  {page: 12, pathIndex: 31886, itemIndex: 0, reversed: false, points: [[14633337 / 131072, 4210789 / 8192], [13375439 / 131072, 4210789 / 8192]]},
  {page: 12, pathIndex: 31893, itemIndex: 0, reversed: false, points: [[13354205 / 131072, 4210789 / 8192], [12096307 / 131072, 4210789 / 8192]]},
  {page: 12, pathIndex: 31900, itemIndex: 0, reversed: false, points: [[3018765 / 32768, 4210789 / 8192], [5408581 / 65536, 4210789 / 8192]]},
  {page: 12, pathIndex: 31907, itemIndex: 0, reversed: false, points: [[5397997 / 65536, 4210789 / 8192], [4917487 / 65536, 4210789 / 8192]]},
  // south curve black.
  {page: 12, pathIndex: 36637, itemIndex: 0, reversed: false, points: [[9856457 / 131072, 4201865 / 8192], [1195275 / 16384, 8403419 / 16384]]},
  {page: 12, pathIndex: 36667, itemIndex: 0, reversed: false, points: [[9501409 / 131072, 8403177 / 16384], [4111663 / 65536, 4197353 / 8192]]},
  {page: 12, pathIndex: 36639, itemIndex: 0, reversed: false, points: [[16328557 / 262144, 8394033 / 16384], [3447423 / 65536, 16748351 / 32768]]},
  {page: 12, pathIndex: 36644, itemIndex: 0, reversed: false, points: [[13672749 / 262144, 8372991 / 16384], [11164031 / 262144, 4170939 / 8192]]},
  {page: 12, pathIndex: 36662, itemIndex: 0, reversed: false, points: [[11048609 / 262144, 8340159 / 16384], [1072631 / 32768, 8297921 / 16384]]},
  {page: 12, pathIndex: 36672, itemIndex: 0, reversed: false, points: [[8467933 / 262144, 8295701 / 16384], [3027711 / 131072, 8242535 / 16384]]},
  {page: 12, pathIndex: 36649, itemIndex: 0, reversed: false, points: [[5944797 / 262144, 8239833 / 16384], [14395481 / 1048576, 4088025 / 8192]]},
  {page: 12, pathIndex: 36657, itemIndex: 0, reversed: false, points: [[1745997 / 131072, 8172865 / 16384], [4899891 / 1048576, 8098793 / 16384]]},
  {page: 12, pathIndex: 36654, itemIndex: 0, reversed: false, points: [[8975391 / 2097152, 8095133 / 16384], [-8439359 / 2097152, 2002783 / 4096]]},
  // west curve black.
  {page: 11, pathIndex: 16618, itemIndex: 0, reversed: false, points: [[9365091 / 16384, 16014023 / 32768], [9235379 / 16384, 15827049 / 32768]]},
  {page: 11, pathIndex: 16628, itemIndex: 0, reversed: false, points: [[288423 / 512, 988621 / 2048], [2276709 / 4096, 7806437 / 16384]]},
  {page: 11, pathIndex: 16621, itemIndex: 0, reversed: false, points: [[9101317 / 16384, 1950373 / 4096], [8986269 / 16384, 15380981 / 32768]]},
  {page: 11, pathIndex: 16634, itemIndex: 0, reversed: false, points: [[8981111 / 16384, 7685161 / 16384], [4437119 / 8192, 7566213 / 16384]]},
  {page: 11, pathIndex: 16631, itemIndex: 0, reversed: false, points: [[2217377 / 4096, 472533 / 1024], [8771401 / 16384, 1815 / 4]]},
  // west curve cubic span.
  {page: 11, pathIndex: 15334, itemIndex: 0, reversed: true, points: [[8737713 / 16384, 3693341 / 8192], [2192825 / 4096, 7434343 / 16384]]},
  // west curve black.
  {page: 11, pathIndex: 16625, itemIndex: 0, reversed: false, points: [[8738801 / 16384, 3692975 / 8192], [4339123 / 8192, 14590627 / 32768]]},
  {page: 11, pathIndex: 16637, itemIndex: 0, reversed: false, points: [[8674253 / 16384, 14577903 / 32768], [4312919 / 8192, 14413473 / 32768]]},
  // west return.
  {page: 11, pathIndex: 13897, itemIndex: 0, reversed: false, points: [[269113 / 512, 14435667 / 32768], [2144331 / 4096, 14313377 / 32768]]},
  {page: 11, pathIndex: 13900, itemIndex: 0, reversed: false, points: [[4288017 / 8192, 14308747 / 32768], [8496047 / 16384, 7011751 / 16384]]},
  {page: 11, pathIndex: 13999, itemIndex: 0, reversed: false, points: [[4247381 / 8192, 7009431 / 16384], [8414775 / 16384, 13733617 / 32768]]},
  {page: 11, pathIndex: 13903, itemIndex: 0, reversed: false, points: [[2103375 / 4096, 6864485 / 16384], [16667027 / 32768, 13443725 / 32768]]},
  {page: 11, pathIndex: 13906, itemIndex: 0, reversed: false, points: [[16664455 / 32768, 3359771 / 8192], [16504547 / 32768, 13153839 / 32768]]},
  {page: 11, pathIndex: 13909, itemIndex: 0, reversed: false, points: [[4125483 / 8192, 3287299 / 8192], [16341959 / 32768, 12863951 / 32768]]},
  {page: 11, pathIndex: 13912, itemIndex: 0, reversed: false, points: [[8169703 / 16384, 6429655 / 16384], [16179433 / 32768, 12574065 / 32768]]},
  {page: 11, pathIndex: 13915, itemIndex: 0, reversed: false, points: [[4044215 / 8192, 6284711 / 16384], [2002119 / 4096, 12284177 / 32768]]},
  {page: 11, pathIndex: 13918, itemIndex: 0, reversed: false, points: [[8007169 / 16384, 767471 / 2048], [15854365 / 32768, 11994291 / 32768]]},
  {page: 11, pathIndex: 13921, itemIndex: 0, reversed: false, points: [[3962953 / 8192, 749353 / 2048], [15691839 / 32768, 11704403 / 32768]]},
  {page: 11, pathIndex: 13924, itemIndex: 0, reversed: false, points: [[7844633 / 16384, 2924939 / 8192], [15529293 / 32768, 11414511 / 32768]]},
  {page: 11, pathIndex: 13927, itemIndex: 0, reversed: false, points: [[15526743 / 32768, 5704935 / 16384], [7683385 / 16384, 11124625 / 32768]]},
  {page: 11, pathIndex: 13930, itemIndex: 0, reversed: false, points: [[15364221 / 32768, 5559991 / 16384], [1900531 / 4096, 10834737 / 32768]]},
  {page: 11, pathIndex: 13972, itemIndex: 0, reversed: false, points: [[7600839 / 16384, 676881 / 2048], [15041705 / 32768, 10544851 / 32768]]},
  {page: 11, pathIndex: 13975, itemIndex: 0, reversed: false, points: [[939947 / 2048, 10540227 / 32768], [14879179 / 32768, 2563729 / 8192]]},
  {page: 11, pathIndex: 13978, itemIndex: 0, reversed: false, points: [[14876629 / 32768, 5125171 / 16384], [919791 / 2048, 9965031 / 32768]]},
  {page: 11, pathIndex: 13981, itemIndex: 0, reversed: false, points: [[3678521 / 8192, 9960453 / 32768], [14554111 / 32768, 1209401 / 4096]]},
  {page: 11, pathIndex: 13984, itemIndex: 0, reversed: false, points: [[7275779 / 16384, 1208821 / 4096], [14391585 / 32768, 9385323 / 32768]]},
  {page: 11, pathIndex: 13987, itemIndex: 0, reversed: false, points: [[14389035 / 32768, 9380679 / 32768], [7114531 / 16384, 4547717 / 16384]]},
  {page: 11, pathIndex: 13990, itemIndex: 0, reversed: false, points: [[14226489 / 32768, 9090793 / 32768], [3516629 / 8192, 2201387 / 8192]]},
  {page: 11, pathIndex: 13993, itemIndex: 0, reversed: false, points: [[14063967 / 32768, 8800905 / 32768], [6951997 / 16384, 2128915 / 8192]]},
  {page: 11, pathIndex: 13996, itemIndex: 0, reversed: false, points: [[13901441 / 32768, 8511019 / 32768], [13710469 / 32768, 8170461 / 32768]]},
] as const;

/** Exact original get_drawings() styles for the detail paths below. */
const FOURTH_FACADE_STYLE_0 = {type: "s", color: [0, 0, 0], fill: null, width: 9261023 / 134217728, lineCap: [1, 1, 1], lineJoin: 1, closePath: false, dashes: "[] 0", stroke_opacity: 1, fill_opacity: null, even_odd: null} as const;
const FOURTH_FACADE_STYLE_1 = {type: "s", color: [10133147 / 33554432, 10133147 / 33554432, 10133147 / 33554432], fill: null, width: 9261023 / 134217728, lineCap: [1, 1, 1], lineJoin: 1, closePath: false, dashes: "[] 0", stroke_opacity: 1, fill_opacity: null, even_odd: null} as const;
const FOURTH_FACADE_STYLE_2 = {type: "f", color: null, fill: [15921395 / 16777216, 15921395 / 16777216, 15921395 / 16777216], width: null, lineCap: null, lineJoin: null, closePath: false, dashes: null, stroke_opacity: null, fill_opacity: 1, even_odd: false} as const;
const FOURTH_FACADE_STYLE_3 = {type: "s", color: [10133147 / 33554432, 10133147 / 33554432, 10133147 / 33554432], fill: null, width: 3489661 / 33554432, lineCap: [1, 1, 1], lineJoin: 1, closePath: false, dashes: "[] 0", stroke_opacity: 1, fill_opacity: null, even_odd: null} as const;

/** Supporting original path/style evidence, kept separate from the loop.
 * items preserve every original command/control point and original item order.
 * Gray caps sometimes overlap black lines; adding them all to the loop would
 * double-trace spans. Exterior cubic outlines/skirt fills are not glazing.
 * Door swings on the roof stair landing do not create a hole in this array.
 */
export const FOURTH_FACADE_DETAIL_SOURCE = [
  {page: 12, pathIndex: 36637, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [9856457 / 131072, 4201865 / 8192], [1195275 / 16384, 8403419 / 16384]],
  ]},
  {page: 12, pathIndex: 36667, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [9501409 / 131072, 8403177 / 16384], [4111663 / 65536, 4197353 / 8192]],
  ]},
  {page: 12, pathIndex: 36639, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [16328557 / 262144, 8394033 / 16384], [3447423 / 65536, 16748351 / 32768]],
  ]},
  {page: 12, pathIndex: 36644, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [13672749 / 262144, 8372991 / 16384], [11164031 / 262144, 4170939 / 8192]],
  ]},
  {page: 12, pathIndex: 36662, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [11048609 / 262144, 8340159 / 16384], [1072631 / 32768, 8297921 / 16384]],
  ]},
  {page: 12, pathIndex: 36672, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [8467933 / 262144, 8295701 / 16384], [3027711 / 131072, 8242535 / 16384]],
  ]},
  {page: 12, pathIndex: 36649, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [5944797 / 262144, 8239833 / 16384], [14395481 / 1048576, 4088025 / 8192]],
  ]},
  {page: 12, pathIndex: 36657, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [1745997 / 131072, 8172865 / 16384], [4899891 / 1048576, 8098793 / 16384]],
  ]},
  {page: 12, pathIndex: 36654, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [8975391 / 2097152, 8095133 / 16384], [-8439359 / 2097152, 2002783 / 4096]],
  ]},
  {page: 11, pathIndex: 16618, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [9365091 / 16384, 16014023 / 32768], [9235379 / 16384, 15827049 / 32768]],
  ]},
  {page: 11, pathIndex: 16628, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [288423 / 512, 988621 / 2048], [2276709 / 4096, 7806437 / 16384]],
  ]},
  {page: 11, pathIndex: 16621, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [9101317 / 16384, 1950373 / 4096], [8986269 / 16384, 15380981 / 32768]],
  ]},
  {page: 11, pathIndex: 16634, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [8981111 / 16384, 7685161 / 16384], [4437119 / 8192, 7566213 / 16384]],
  ]},
  {page: 11, pathIndex: 16631, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [2217377 / 4096, 472533 / 1024], [8771401 / 16384, 1815 / 4]],
  ]},
  {page: 11, pathIndex: 16625, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [8738801 / 16384, 3692975 / 8192], [4339123 / 8192, 14590627 / 32768]],
  ]},
  {page: 11, pathIndex: 16637, role: "black lower-curve baseline", style: FOURTH_FACADE_STYLE_0, items: [
    ["l", [8674253 / 16384, 14577903 / 32768], [4312919 / 8192, 14413473 / 32768]],
  ]},
  {page: 11, pathIndex: 15329, role: "separate gray lower-curve cap or span", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [4682507 / 8192, 8007123 / 16384], [4683531 / 8192, 16017031 / 32768], [4684563 / 8192, 16019751 / 32768], [4685587 / 8192, 16022471 / 32768]],
  ]},
  {page: 11, pathIndex: 15330, role: "separate gray lower-curve cap or span", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [4614723 / 8192, 15818159 / 32768], [9235311 / 16384, 15827203 / 32768]],
  ]},
  {page: 11, pathIndex: 15331, role: "separate gray lower-curve cap or span", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [2275307 / 4096, 15603207 / 32768], [9103063 / 16384, 3901621 / 8192], [4552457 / 8192, 15609859 / 32768], [9106749 / 16384, 15613103 / 32768]],
  ]},
  {page: 11, pathIndex: 15332, role: "separate gray lower-curve cap or span", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [8981009 / 16384, 7685251 / 16384], [8982713 / 16384, 15374041 / 32768], [8984433 / 16384, 3844395 / 8192], [4493085 / 8192, 480661 / 1024]],
  ]},
  {page: 11, pathIndex: 15333, role: "separate gray lower-curve cap or span", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [2217349 / 4096, 15121233 / 32768], [8870985 / 16384, 15125001 / 32768], [4436279 / 8192, 15128835 / 32768], [8874147 / 16384, 15132603 / 32768]],
  ]},
  {page: 11, pathIndex: 15334, role: "separate gray lower-curve cap or span", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [8737713 / 16384, 3693341 / 8192], [8748707 / 16384, 14805411 / 32768], [8759913 / 16384, 3709299 / 8192], [2192825 / 4096, 7434343 / 16384]],
  ]},
  {page: 11, pathIndex: 15335, role: "separate gray lower-curve cap or span", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [2168089 / 4096, 7285999 / 16384], [8674257 / 16384, 14578257 / 32768], [4338095 / 8192, 14584515 / 32768], [8678123 / 16384, 7295387 / 16384]],
  ]},
  {page: 12, pathIndex: 34149, role: "separate gray lower-curve cap or overlapping bridge", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [9501409 / 131072, 8403311 / 16384], [2404909 / 32768, 4201803 / 8192], [2434433 / 32768, 8403737 / 16384], [9856221 / 131072, 8403737 / 16384]],
  ]},
  {page: 12, pathIndex: 34150, role: "separate gray lower-curve cap or overlapping bridge", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [16328373 / 262144, 2098541 / 4096], [16367695 / 262144, 8394393 / 16384], [2050877 / 32768, 8394623 / 16384], [2055825 / 32768, 8394819 / 16384]],
  ]},
  {page: 12, pathIndex: 34151, role: "separate gray lower-curve cap or overlapping bridge", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [13672251 / 262144, 4186561 / 8192], [1713881 / 32768, 16747063 / 32768], [6875185 / 131072, 8373925 / 16384], [13789429 / 262144, 16748603 / 32768]],
  ]},
  {page: 12, pathIndex: 34152, role: "separate gray lower-curve cap or overlapping bridge", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [11048059 / 262144, 8340293 / 16384], [5543297 / 131072, 16681733 / 32768], [11124867 / 262144, 16682847 / 32768], [5581701 / 131072, 8341997 / 16384]],
  ]},
  {page: 12, pathIndex: 34153, role: "separate gray lower-curve cap or overlapping bridge", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [8467225 / 262144, 8295835 / 16384], [4252487 / 131072, 2074139 / 4096], [8542985 / 262144, 8297293 / 16384], [8580733 / 262144, 8298047 / 16384]],
  ]},
  {page: 12, pathIndex: 34154, role: "separate gray lower-curve cap or overlapping bridge", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [5944089 / 262144, 2059991 / 4096], [5980789 / 262144, 16481763 / 32768], [12034979 / 524288, 16483565 / 32768], [12108379 / 524288, 16485335 / 32768]],
  ]},
  {page: 12, pathIndex: 34155, role: "separate gray lower-curve cap or overlapping bridge", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [13963677 / 1048576, 16345999 / 32768], [1798937 / 131072, 8176211 / 16384]],
  ]},
  {page: 12, pathIndex: 34156, role: "separate gray lower-curve cap or overlapping bridge", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [8965535 / 2097152, 2023811 / 4096], [9242359 / 2097152, 8096473 / 16384], [9514989 / 2097152, 8097669 / 16384], [9791813 / 2097152, 16197795 / 32768]],
  ]},
  {page: 11, pathIndex: 13889, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [4376853 / 8192, 1860089 / 4096], [2165489 / 4096, 14606051 / 32768]],
  ]},
  {page: 11, pathIndex: 13891, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [4342099 / 8192, 1835273 / 4096], [8699173 / 16384, 7363489 / 16384]],
  ]},
  {page: 11, pathIndex: 13893, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [8660215 / 16384, 7300273 / 16384], [8609097 / 16384, 3606727 / 8192]],
  ]},
  {page: 11, pathIndex: 13895, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [8619871 / 16384, 7236967 / 16384], [539513 / 1024, 14515877 / 32768]],
  ]},
  {page: 12, pathIndex: 31341, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [2469131 / 32768, 263175 / 512], [1192475 / 16384, 1052655 / 2048]],
  ]},
  {page: 12, pathIndex: 31344, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [9514897 / 131072, 4210567 / 8192], [8194609 / 131072, 8412369 / 16384]],
  ]},
  {page: 12, pathIndex: 31346, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [1074561 / 16384, 4208847 / 8192], [583639 / 8192, 4211313 / 8192]],
  ]},
  {page: 12, pathIndex: 31348, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [8167555 / 131072, 4206039 / 8192], [13712359 / 262144, 8391549 / 16384]],
  ]},
  {page: 12, pathIndex: 31351, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [13658567 / 262144, 8391015 / 16384], [5732211 / 131072, 8363785 / 16384]],
  ]},
  {page: 12, pathIndex: 31352, role: "excluded gray outboard curve fragment", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [10437237 / 262144, 8348197 / 16384], [2313021 / 65536, 8327897 / 16384]],
  ]},
  {page: 11, pathIndex: 15310, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [1711763 / 4096, 8152033 / 32768], [4299513 / 8192, 3600403 / 8192]],
  ]},
  {page: 11, pathIndex: 15311, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [8594003 / 16384, 3601803 / 8192], [13683993 / 32768, 8157699 / 32768]],
  ]},
  {page: 11, pathIndex: 15315, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [13688645 / 32768, 8155093 / 32768], [1074537 / 2048, 225073 / 512]],
  ]},
  {page: 11, pathIndex: 15316, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [8599029 / 16384, 3600393 / 8192], [4511327 / 8192, 15912767 / 32768], [9821341 / 16384, 2106053 / 4096], [10687579 / 16384, 2106053 / 4096]],
  ]},
  {page: 11, pathIndex: 15318, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [5343793 / 8192, 8551095 / 16384], [10611777 / 16384, 8547671 / 16384], [1317035 / 2048, 4270411 / 8192], [10461405 / 16384, 8530599 / 16384]],
    ["c", [10461405 / 16384, 8530599 / 16384], [5193265 / 8192, 8520359 / 16384], [5156139 / 8192, 1063347 / 2048], [10238927 / 16384, 8489901 / 16384]],
    ["c", [10238927 / 16384, 8489901 / 16384], [1270699 / 2048, 8473025 / 16384], [5046571 / 8192, 4226453 / 8192], [626369 / 1024, 4214779 / 8192]],
    ["c", [626369 / 1024, 4214779 / 8192], [9950683 / 16384, 2101561 / 4096], [9880641 / 16384, 8379735 / 16384], [9812091 / 16384, 8350211 / 16384]],
    ["c", [9812091 / 16384, 8350211 / 16384], [2435885 / 4096, 16641341 / 32768], [604779 / 1024, 8288099 / 16384], [9611141 / 16384, 2063161 / 4096]],
    ["c", [9611141 / 16384, 2063161 / 4096], [4772909 / 8192, 16434411 / 32768], [1185279 / 2048, 16357701 / 32768], [9420611 / 16384, 16275617 / 32768]],
    ["c", [9420611 / 16384, 16275617 / 32768], [292469 / 512, 8096783 / 16384], [4649685 / 8192, 4026527 / 8192], [1155245 / 2048, 16013637 / 32768]],
    ["c", [1155245 / 2048, 16013637 / 32768], [9184567 / 16384, 7960583 / 16384], [9129353 / 16384, 15823681 / 32768], [2269145 / 4096, 15721641 / 32768]],
    ["c", [2269145 / 4096, 15721641 / 32768], [2256775 / 4096, 15625959 / 32768], [8979751 / 16384, 15526311 / 32768], [4467331 / 8192, 15423027 / 32768]],
    ["c", [4467331 / 8192, 15423027 / 32768], [4444795 / 8192, 15319807 / 32768], [4423389 / 8192, 15212885 / 32768], [1100799 / 2048, 7551409 / 16384]],
    ["c", [1100799 / 2048, 7551409 / 16384], [8766021 / 16384, 14992717 / 32768], [2182019 / 4096, 7439703 / 16384], [8692605 / 16384, 14763341 / 32768]],
    ["c", [8692605 / 16384, 14763341 / 32768], [4328583 / 8192, 3661811 / 8192], [8624283 / 16384, 3632107 / 8192], [4297003 / 8192, 7203609 / 16384]],
  ]},
  {page: 11, pathIndex: 15320, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [2149075 / 4096, 3601159 / 8192], [4510249 / 8192, 3979441 / 8192], [4910117 / 8192, 8427333 / 16384], [5343793 / 8192, 8427333 / 16384]],
  ]},
  {page: 11, pathIndex: 15178, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_2, items: [
    ["c", [8594547 / 16384, 7203761 / 16384], [4509569 / 8192, 15921305 / 32768], [4909601 / 8192, 8429333 / 16384], [10687013 / 16384, 8429333 / 16384]],
    ["l", [10687013 / 16384, 8429333 / 16384], [10687013 / 16384, 2137959 / 4096]],
    ["c", [10687013 / 16384, 2137959 / 4096], [10611319 / 16384, 8548429 / 16384], [5267927 / 8192, 2135395 / 4096], [653803 / 1024, 8531373 / 16384]],
    ["c", [653803 / 1024, 8531373 / 16384], [1298259 / 2048, 8521149 / 16384], [5155877 / 8192, 8507485 / 16384], [10238337 / 16384, 8490691 / 16384]],
    ["c", [10238337 / 16384, 8490691 / 16384], [5082575 / 8192, 4236941 / 8192], [5046317 / 8192, 8453631 / 16384], [10021495 / 16384, 4215117 / 8192]],
    ["c", [10021495 / 16384, 4215117 / 8192], [4975063 / 8192, 8407035 / 16384], [4940059 / 8192, 2095115 / 4096], [9811469 / 16384, 8350903 / 16384]],
    ["c", [9811469 / 16384, 8350903 / 16384], [9743065 / 16384, 8321363 / 16384], [4838003 / 8192, 16577681 / 32768], [1201319 / 2048, 4126701 / 8192]],
    ["c", [1201319 / 2048, 4126701 / 8192], [4772655 / 8192, 8217947 / 16384], [9481675 / 16384, 16359053 / 32768], [9420071 / 16384, 16277231 / 32768]],
    ["c", [9420071 / 16384, 16277231 / 32768], [2339621 / 4096, 8097459 / 16384], [581183 / 1024, 2013453 / 4096], [2310355 / 4096, 16014891 / 32768]],
    ["c", [2310355 / 4096, 16014891 / 32768], [4592071 / 8192, 15922649 / 32768], [9128911 / 16384, 15824935 / 32768], [4537979 / 8192, 15723059 / 32768]],
    ["c", [4537979 / 8192, 15723059 / 32768], [4513313 / 8192, 7813819 / 16384], [8979129 / 16384, 7763815 / 16384], [4467061 / 8192, 3856111 / 8192]],
    ["c", [4467061 / 8192, 3856111 / 8192], [8889115 / 16384, 7660629 / 16384], [2211539 / 4096, 15214401 / 32768], [8805933 / 16384, 15104399 / 32768]],
    ["c", [8805933 / 16384, 15104399 / 32768], [4390351 / 8192, 15035717 / 32768], [8756601 / 16384, 14965725 / 32768], [4366709 / 8192, 58183 / 128]],
    ["c", [4366709 / 8192, 58183 / 128], [8732975 / 16384, 14894389 / 32768], [4366373 / 8192, 14893439 / 32768], [8732517 / 16384, 7446277 / 16384]],
    ["c", [8732517 / 16384, 7446277 / 16384], [136229 / 256, 7425125 / 16384], [8705237 / 16384, 3702003 / 8192], [543253 / 1024, 1845599 / 4096]],
    ["c", [543253 / 1024, 1845599 / 4096], [8656593 / 16384, 3662231 / 8192], [8623645 / 16384, 14529747 / 32768], [8593417 / 16384, 14408833 / 32768]],
    ["l", [8593417 / 16384, 14408833 / 32768], [8594547 / 16384, 7203761 / 16384]],
  ]},
  {page: 12, pathIndex: 33638, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_2, items: [
    ["l", [4451735 / 8192, 2107331 / 4096], [563641 / 1024, 2137961 / 4096]],
    ["l", [563641 / 1024, 2137961 / 4096], [2499631 / 32768, 2137961 / 4096]],
    ["l", [2499631 / 32768, 2137961 / 4096], [2499631 / 32768, 2107331 / 4096]],
    ["l", [2499631 / 32768, 2107331 / 4096], [4451735 / 8192, 2107331 / 4096]],
  ]},
  {page: 12, pathIndex: 33973, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_2, items: [
    ["c", [-13482197 / 262144, 7203761 / 16384], [-6688735 / 262144, 15921305 / 32768], [6112281 / 262144, 8429333 / 16384], [4999315 / 65536, 8429333 / 16384]],
    ["l", [4999315 / 65536, 8429333 / 16384], [4999315 / 65536, 2137959 / 4096]],
    ["c", [4999315 / 65536, 2137959 / 4096], [4696539 / 65536, 8548429 / 16384], [549335 / 8192, 2135395 / 4096], [16378627 / 262144, 8531373 / 16384]],
    ["c", [16378627 / 262144, 8531373 / 16384], [15182201 / 262144, 8521149 / 16384], [13993115 / 262144, 8507485 / 16384], [12818449 / 262144, 8490691 / 16384]],
    ["c", [12818449 / 262144, 8490691 / 16384], [11647451 / 262144, 4236941 / 8192], [10487201 / 262144, 8453631 / 16384], [9348973 / 262144, 4215117 / 8192]],
    ["c", [9348973 / 262144, 4215117 / 8192], [8207073 / 262144, 8407035 / 16384], [7086931 / 262144, 2095115 / 4096], [5988549 / 262144, 8350903 / 16384]],
    ["c", [5988549 / 262144, 8350903 / 16384], [4894097 / 262144, 8321363 / 16384], [3821143 / 262144, 16577681 / 32768], [2773877 / 262144, 4126701 / 8192]],
    ["c", [2773877 / 262144, 4126701 / 8192], [1730019 / 262144, 8217947 / 16384], [177963 / 65536, 16359053 / 32768], [-273809 / 262144, 16277231 / 32768]],
    ["c", [-273809 / 262144, 16277231 / 32768], [-1259209 / 262144, 8097459 / 16384], [-1106051 / 131072, 2013453 / 4096], [-783057 / 65536, 16014891 / 32768]],
    ["c", [-783057 / 65536, 16014891 / 32768], [-4048683 / 262144, 15922649 / 32768], [-2466185 / 131072, 15824935 / 32768], [-1444905 / 65536, 15723059 / 32768]],
    ["c", [-1444905 / 65536, 15723059 / 32768], [-13137871 / 524288, 7813819 / 16384], [-7328891 / 262144, 7763815 / 16384], [-16098001 / 524288, 3856111 / 8192]],
    ["c", [-16098001 / 524288, 3856111 / 8192], [-4384555 / 131072, 7660629 / 16384], [-2364113 / 65536, 15214401 / 32768], [-10100015 / 262144, 15104399 / 32768]],
    ["c", [-10100015 / 262144, 15104399 / 32768], [-10503717 / 262144, 15035717 / 32768], [-10889331 / 262144, 14965725 / 32768], [-1407533 / 32768, 58183 / 128]],
    ["c", [-1407533 / 32768, 58183 / 128], [-5633671 / 131072, 14894389 / 32768], [-2817753 / 65536, 14893439 / 32768], [-5637341 / 131072, 7446277 / 16384]],
    ["c", [-5637341 / 131072, 7446277 / 16384], [-1437057 / 32768, 7425125 / 16384], [-731947 / 16384, 3702003 / 8192], [-5961089 / 131072, 1845599 / 4096]],
    ["c", [-5961089 / 131072, 1845599 / 4096], [-6244729 / 131072, 3662231 / 8192], [-13016629 / 262144, 14529747 / 32768], [-13500285 / 262144, 14408833 / 32768]],
    ["l", [-13500285 / 262144, 14408833 / 32768], [-13482197 / 262144, 7203761 / 16384]],
  ]},
  {page: 12, pathIndex: 34133, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [5001609 / 65536, 8551095 / 16384], [5001609 / 65536, 4214337 / 8192]],
  ]},
  {page: 12, pathIndex: 34136, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [5001609 / 65536, 4213675 / 8192], [4451373 / 8192, 4213675 / 8192]],
  ]},
  {page: 12, pathIndex: 34138, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [5001609 / 65536, 4214341 / 8192], [8903975 / 16384, 4214341 / 8192]],
  ]},
  {page: 12, pathIndex: 34139, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [5001609 / 65536, 8551095 / 16384], [4509323 / 8192, 8551095 / 16384]],
  ]},
  {page: 12, pathIndex: 34141, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["l", [5001609 / 65536, 2106055 / 4096], [8899813 / 16384, 2106055 / 4096]],
  ]},
  {page: 12, pathIndex: 34143, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [-838153 / 16384, 3600393 / 8192], [-13264905 / 524288, 15912767 / 32768], [3073271 / 131072, 2106053 / 4096], [10003179 / 131072, 2106053 / 4096]],
  ]},
  {page: 12, pathIndex: 34144, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [5001609 / 65536, 8551095 / 16384], [2349187 / 32768, 8547671 / 16384], [137387 / 2048, 4270411 / 8192], [8193769 / 131072, 8530599 / 16384]],
    ["c", [8193769 / 131072, 8530599 / 16384], [3797385 / 65536, 8520359 / 16384], [437547 / 8192, 1063347 / 2048], [3206971 / 65536, 8489901 / 16384]],
    ["c", [3206971 / 65536, 8489901 / 16384], [91051 / 2048, 8473025 / 16384], [10495327 / 262144, 4226453 / 8192], [9355525 / 262144, 4214779 / 8192]],
    ["c", [9355525 / 262144, 4214779 / 8192], [8215985 / 262144, 2101561 / 4096], [3547791 / 131072, 8379735 / 16384], [5998509 / 262144, 8350211 / 16384]],
    ["c", [5998509 / 262144, 8350211 / 16384], [4901699 / 262144, 16641341 / 32768], [3828481 / 262144, 8288099 / 16384], [1391657 / 131072, 2063161 / 4096]],
    ["c", [1391657 / 131072, 2063161 / 4096], [54317 / 8192, 16434411 / 32768], [180191 / 65536, 16357701 / 32768], [-33145 / 32768, 16275617 / 32768]],
    ["c", [-33145 / 32768, 16275617 / 32768], [-312705 / 65536, 8096783 / 16384], [-1102513 / 131072, 4026527 / 8192], [-1561789 / 131072, 16013637 / 32768]],
    ["c", [-1561789 / 131072, 16013637 / 32768], [-1010467 / 65536, 7960583 / 16384], [-2462647 / 131072, 15823681 / 32768], [-1442415 / 65536, 15721641 / 32768]],
    ["c", [-1442415 / 65536, 15721641 / 32768], [-3280667 / 131072, 15625959 / 32768], [-3659465 / 131072, 15526311 / 32768], [-4020175 / 131072, 15423027 / 32768]],
    ["c", [-4020175 / 131072, 15423027 / 32768], [-2190377 / 65536, 15319807 / 32768], [-4723245 / 131072, 15212885 / 32768], [-2523169 / 65536, 7551409 / 16384]],
    ["c", [-2523169 / 65536, 7551409 / 16384], [-5369299 / 131072, 14992717 / 32768], [-2836431 / 65536, 7439703 / 16384], [-5956633 / 131072, 14763341 / 32768]],
    ["c", [-5956633 / 131072, 14763341 / 32768], [-6240011 / 131072, 3661811 / 8192], [-6503203 / 131072, 3632107 / 8192], [-421589 / 8192, 7203609 / 16384]],
  ]},
  {page: 12, pathIndex: 34147, role: "excluded continuous outboard outline or gray skirt", style: FOURTH_FACADE_STYLE_1, items: [
    ["c", [-3363537 / 65536, 3601159 / 8192], [-13333955 / 524288, 3979441 / 8192], [1532199 / 65536, 8427333 / 16384], [5001609 / 65536, 8427333 / 16384]],
  ]},
  {page: 12, pathIndex: 40023, role: "roof stair landing door symbol; not a glazing-loop aperture", style: FOURTH_FACADE_STYLE_3, items: [
    ["l", [3171641 / 16384, 4356591 / 16384], [6234689 / 32768, 4282519 / 16384]],
  ]},
  {page: 12, pathIndex: 40024, role: "roof stair landing door symbol; not a glazing-loop aperture", style: FOURTH_FACADE_STYLE_3, items: [
    ["l", [1688141 / 8192, 8413105 / 32768], [6643971 / 32768, 8264961 / 32768]],
  ]},
  {page: 12, pathIndex: 40025, role: "roof stair landing door symbol; not a glazing-loop aperture", style: FOURTH_FACADE_STYLE_3, items: [
    ["c", [6539877 / 32768, 1071113 / 4096], [12860471 / 65536, 4242083 / 16384], [12692829 / 65536, 8483085 / 32768], [1558669 / 8192, 8565037 / 32768]],
  ]},
  {page: 12, pathIndex: 40026, role: "roof stair landing door symbol; not a glazing-loop aperture", style: FOURTH_FACADE_STYLE_3, items: [
    ["c", [3321979 / 16384, 8264945 / 32768], [6532219 / 32768, 8346865 / 32768], [13016007 / 65536, 8427147 / 32768], [6555845 / 32768, 8557203 / 32768]],
  ]},
  {page: 12, pathIndex: 40027, role: "roof stair landing door symbol; not a glazing-loop aperture", style: FOURTH_FACADE_STYLE_3, items: [
    ["l", [5726149 / 32768, 572851 / 2048], [11234981 / 65536, 70449 / 256]],
  ]},
  {page: 12, pathIndex: 40028, role: "roof stair landing door symbol; not a glazing-loop aperture", style: FOURTH_FACADE_STYLE_3, items: [
    ["l", [6135431 / 32768, 2216385 / 8192], [3013419 / 16384, 2179349 / 8192]],
  ]},
  {page: 12, pathIndex: 40029, role: "roof stair landing door symbol; not a glazing-loop aperture", style: FOURTH_FACADE_STYLE_3, items: [
    ["c", [740343 / 4096, 9021335 / 32768], [11626205 / 65536, 8936597 / 32768], [11458563 / 65536, 2233887 / 8192], [5617543 / 32768, 2254367 / 8192]],
  ]},
  {page: 12, pathIndex: 40030, role: "roof stair landing door symbol; not a glazing-loop aperture", style: FOURTH_FACADE_STYLE_3, items: [
    ["c", [1506707 / 8192, 8717399 / 32768], [5915089 / 32768, 8799319 / 32768], [11781747 / 65536, 8879601 / 32768], [5938715 / 32768, 9009657 / 32768]],
  ]},
] as const;

/** Counts describe this reviewed Level 4 source, independently of Level 2. */
export const FOURTH_FACADE_PROVENANCE = {
  sourceUrl: 'https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf',
  pdfSha256: 'c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474',
  sourcePages: [11, 12],
  pageSizePt: [576, 576],
  coordinateOrigin: 'top-left',
  sourceYDirection: 'down',
  coordinateEncoding: 'exact native binary values as integer fractions',
  continuationPageIndex: 11,
  mainPageIndex: 12,
  continuationReplayXShiftPt: -576,
  nativeSourceBaselineCount: 196,
  sourceCountByPage: {11: 60, 12: 136},
  nativeLineCount: 195,
  grayLineCount: 179,
  blackLineCount: 16,
  nativeCubicSpanCount: 1,
  supportingPathCount: 66,
  supportingCommandCount: 123,
  cubicSpan: {page: 11, pathIndex: 15334, itemIndex: 0, representation: 'native endpoint chord'},
  maximumCubicChordDeviationPt: 0.01102496919412292,
  completeOrderedSourceRun: true,
  nativeContinuousClosedPath: false,
  needsInterpretedJoins: true,
  helperMaximumIntersectionExtensionPt: 2,
  maximumObservedEndpointGapPt: 1.101616673609595,
  interpretationLimits: [
    'Two gray/black transitions close approximately 1.10 pt lateral source offsets.',
    'The short cubic span uses an endpoint chord in the line-only glazing helper.',
    'Mullion/corner joins are inferred; roof landing door symbols are separate.',
  ],
  surveyedEnvelope: false,
} as const;
