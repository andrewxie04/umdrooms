# Family Garden doorway registration — 2026-10-04

## Original source review

The original [HDR / UMD building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), PDF page index **8** (printed page 9), shows a double door in the glazing immediately west of the native north stair. The full page and an enlarged unannotated crop were rendered from `/tmp/iribe-reference/guide.pdf` and inspected. SHA-256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Coordinates below are original 576 × 576 PDF points, top-left origin, downward Y. Path/item indices are zero-based PyMuPDF drawing indices.

| Source command | Hinge | Open leaf tip |
| --- | --- | --- |
| page 8, path 85396, item 0, line | `[259.4578857421875, 357.8536071777344]` | `[258.6988830566406, 363.77459716796875]` |
| page 8, path 85395, item 0, line | `[271.2991943359375, 359.3712158203125]` | `[270.5422058105469, 365.293212890625]` |

Paths 85394 and 85393 are the corresponding swing cubics. Their meeting points are approximately `[265.3786, 358.6124]`, agreeing with the line-derived hinge midpoint **`[265.3785400390625, 358.61241149902344]`**. Adjacent glazing paths 85530/85532 end near `[259.22, 357.24]`; paths 85526/85528 start near `[271.68, 358.83]`. The facade baseline and door-symbol hinges are distinct drawn offsets; this is not surveyed hardware geometry.

The coarse former 2× garden entrance anchor `[537,718]` was not the exact drawn midpoint. Its replacement is `[530.757080078125,717.2248229980469]`.

## Correction and retained estimates

The obsolete independent wayfinding fit placed the threshold at world `[-13.235619039225224,-14.678011895089508]`, equivalent to native PDF `[305.2920647437947,361.3342917072621]`. Its positive-X crossing approach entered the newly registered stair area rather than the drawn garden entrance. The native stair is anchored near NW `[279,363]` / NE `[328,368]`; the drawn garden door is beside its west end.

The source hinge midpoint now uses `firstGuidePlan`, matching the stair and Antonov registration. `FAMILY_GARDEN_NATIVE_DOOR` is world **`[-13.144529496088978,-8.431515380658972]`**. `FAMILY_GARDEN_DOOR` is its projection onto the existing Level 1 facade: **`[-13.375409760544304,-8.436686544938329]`**. The projection is **0.230938168 m**, with inverse native coordinates `[265.533634638084,357.1416602816266]`. The modeled entrance moved 6.242891 m from its obsolete fit.

The source-traced west facade ends at native `[222.316696,352.584320]`; its remaining straight continuation to the fitted north corner is still an estimate. This bounded correction places the opening on that existing continuation and records the offset explicitly. It does not assert that this continuation is the exact drawn facade. The outer terrace returns and landscape interpolation remain fitted estimates; the five existing native theater-side anchors and Antonov edge are retained.

The existing builders still use an estimated **1.8 m** aperture and **0.85 m** open leaves. The source lines register to a **1.864200 m** hinge separation and **0.932156 / 0.932272 m** leaf lengths at the estimated metric scale. The builders' existing leaf orientation uses the older `MAIN_FOOTPRINT`; exact native jamb/leaf rendering is outside this layout-block patch. The unchanged full source lines and swing paths remain available for that separate refinement. No shaft wall, stair, structural column, collision radius, clearance threshold or test expectation was changed.

Only the Family Garden subsection of `src/components/interior/iribe/layout.ts` was edited for runtime behavior. `family-garden-layout.ts` was not edited. This review supersedes only the older garden entrance fit in the Antonov integration notes.

## Focused verification and parent handoff

Command: `npx vitest run src/components/interior/iribe/circulation.test.ts -t 'first-floor family garden' --testTimeout=30000 --reporter=json --outputFile=/tmp/iribe-reference/family-garden-door-final-results.json`.

**4 passed, 0 failed, 487 skipped**: bed containment outside Antonov, maples in beds, corridor/terrace doorway round trip, and all planter/outer-guard approaches with return paths. The planter route took **14.515 s** under the explicit 30 s timeout. The initial default-timeout selection reported the old doorway collision and a separate planter-route timeout. This report does not claim a full-suite or default-timeout pass.

TypeScript: `npx tsc -p tsconfig.app.json --noEmit --incremental false` passed. Targeted ESLint and `git diff --check` passed. A snapshot comparison confirmed no edits outside the owned layout block and no change to `family-garden-layout.ts`; the five retained native theater-side anchors differ from `firstGuidePlan` by at most **1.78e-15 m**.

An independent headless evaluation used the actual all-floor models and `walkStep3`, unchanged **0.24 m** body radius and **0.26 m** required route clearance. It walked along the drawn door normal through both the modeled threshold and original registered hinge midpoint, plus two ±0.35 m lateral approaches, in both directions: **8 traversals passed**, minimum clearance **0.525063 m**, maximum endpoint/height error **4.15e-14 m**. The modeled threshold is outside the stair opening. The old test's corridor approach is approximately native `[304.499,370.906]`, inside that opening.

The drawn inward leaf normal is world `[0.9989956312815694,0.04480768550526405]`. A meaningful corridor → threshold → terrace crossing at Level 1 is:

```ts
const path: Position[] = [
  [-11.876916313621951, 6.5, -8.369475016680433],
  [-13.375409760544304, 6.5, -8.436686544938329],
  [-14.973802770594816, 6.5, -8.508378841746751],
];
```

Corresponding original-frame positions are `[264.312268359,366.669554782]`, `[265.533634638,357.141660282]`, `[266.836425336,346.978572814]`. Equivalently use `FAMILY_GARDEN_DOOR + normal * 1.5`, the threshold, and `FAMILY_GARDEN_DOOR - normal * 1.6`. The existing axis-aligned test also passes; it was not edited.

Artifacts: `/tmp/iribe-reference/family-garden-door-handoff.json` contains exact native/source/model positions and all traversal results; `family-garden-door-native-paths.json` retains the original nearby commands; `family-garden-door-page8-original.png` and `family-garden-door-page8-context.png` retain the original visual review. No build, commit or push was performed.
