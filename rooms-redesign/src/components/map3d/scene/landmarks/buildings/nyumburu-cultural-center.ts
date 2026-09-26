import * as THREE from 'three';
import type { LandmarkModule } from '../types';

// References: UMD's front/rear photographs show the brick arcade, glazed
// entries, and red/gold/black patterned masonry above the north doors:
// https://nyumburu.umd.edu/the-center
// UMD Facilities identifies this as Building 232 and shows its portico:
// https://facilities.umd.edu/node/415
// The 2023 MD iMAP aerial shows the pale west roof beside a gray hipped east
// roof with two dark triangular lights:
// https://mdgeodata.md.gov/imagery/rest/services/SixInch/SixInchImagery/ImageServer
export const landmark: LandmarkModule = {
  id: 'way/23543883',
  spec: {
    name: 'Nyumburu Cultural Center',
    color: 0x855044,
    accent: 0xc6a466,
    height: 9.2,
  },
  maxHeight: 12.65,
  build({ pts, helpers }) {
    const parts: THREE.BufferGeometry[] = [];
    const bounds = helpers.bboxOf(pts);
    const east = (t: number) => bounds.minX + t * (bounds.maxX - bounds.minX);
    const north = (t: number) => bounds.minY + t * (bounds.maxY - bounds.minY);
    const brick = new THREE.Color(0x855044);
    const darkBrick = new THREE.Color(0x643a35);
    const sandBrick = new THREE.Color(0xb89a6e);
    const goldBrick = new THREE.Color(0xd3a74e);
    const blackBrick = new THREE.Color(0x383230);
    const concrete = new THREE.Color(0xc4b7a1);
    const glass = new THREE.Color(0x334a50);
    const mullion = new THREE.Color(0xc3c0b4);
    const flatRoof = new THREE.Color(0xbeb6a5);
    const metalRoof = new THREE.Color(0x777c7d);
    const roofLight = new THREE.Color(0x343f45);
    const add = (geometry: THREE.BufferGeometry, shade: THREE.Color) =>
      parts.push(helpers.withColor(geometry, shade));

    // All positions are in the mapped ring's east/north frame. Each detail
    // slightly intersects its supporting wall, rather than sitting clear of it.
    const box = (
      x0: number, x1: number, y0: number, y1: number,
      n0: number, n1: number, shade: THREE.Color,
    ) => {
      const geometry = new THREE.BoxGeometry(x1 - x0, y1 - y0, n1 - n0);
      geometry.translate((x0 + x1) / 2, (y0 + y1) / 2, -(n0 + n1) / 2);
      add(geometry, shade);
    };
    const roofFace = (
      vertices: Array<[number, number, number]>, shade: THREE.Color,
    ) => {
      const coordinates: number[] = [];
      for (let i = 1; i < vertices.length - 1; i++) {
        for (const vertex of [vertices[0], vertices[i], vertices[i + 1]]) {
          coordinates.push(vertex[0], vertex[2], -vertex[1]);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(coordinates, 3));
      geometry.computeVertexNormals();
      add(geometry, shade);
    };

    // The OSM outline includes a south-projecting west end. Its lower, pale
    // flat-roofed wing remains distinct from the higher east pavilion.
    add(helpers.extrudeFootprint(pts, 5.7), brick);
    box(east(.035), east(.41), 5.70, 5.86, north(.23), north(.958), flatRoof);
    box(east(.035), east(.345), 5.70, 5.86, north(.035), north(.23), flatRoof);
    box(east(.025), east(.44), 5.70, 6.08, north(.956), north(.975), darkBrick);
    box(east(.42), east(.44), 5.70, 6.08, north(.23), north(.96), darkBrick);

    // Main pavilion sits within the right-hand portion of the mapped ring.
    // The slim brick parapet is below the metal eave and joins the arcade.
    const southWall = (x: number) => pts[0].y
      + (x - pts[0].x) * (pts[5].y - pts[0].y) / (pts[5].x - pts[0].x);
    const xWest = east(.435);
    const xEast = east(.97);
    const nSouth = southWall(xEast) + .16;
    const nNorth = north(.98);
    const mainRing = [
      new THREE.Vector2(xWest, southWall(xWest) + .08),
      new THREE.Vector2(xEast, southWall(xEast) + .08),
      new THREE.Vector2(xEast, nNorth), new THREE.Vector2(xWest, nNorth),
    ];
    add(helpers.extrudeFootprint(mainRing, 3.5).translate(0, 5.7, 0), brick);
    box(xWest, xEast, 8.87, 9.25, nSouth, nSouth + .32, darkBrick);
    box(xWest, xEast, 8.87, 9.25, nNorth - .32, nNorth, darkBrick);

    // Four connected planes form the broad gray hip in the aerial. The ridge
    // runs north/south; the two darker triangular roof lights lie flush on
    // the eastern slope rather than hovering above it.
    const eave = 9.20;
    const ridge = 12.55;
    const xRidge = east(.705);
    const ridgeSouth = north(.355);
    const ridgeNorth = north(.845);
    roofFace([[xWest, nSouth, eave], [xEast, nSouth, eave],
      [xRidge, ridgeSouth, ridge]], metalRoof);
    roofFace([[xEast, nSouth, eave], [xEast, nNorth, eave],
      [xRidge, ridgeNorth, ridge], [xRidge, ridgeSouth, ridge]], metalRoof);
    roofFace([[xEast, nNorth, eave], [xWest, nNorth, eave],
      [xRidge, ridgeNorth, ridge]], new THREE.Color(0x666d70));
    roofFace([[xWest, nNorth, eave], [xWest, nSouth, eave],
      [xRidge, ridgeSouth, ridge], [xRidge, ridgeNorth, ridge]],
    new THREE.Color(0x888b89));
    const slopeY = (x: number) => eave + (xEast - x) / (xEast - xRidge) * (ridge - eave);
    for (const middle of [.54, .74]) {
      const near = north(middle - .045);
      const far = north(middle + .045);
      const inner = east(.825);
      const outer = east(.925);
      roofFace([[inner, north(middle), slopeY(inner) + .025],
        [outer, near, slopeY(outer) + .025],
        [outer, far, slopeY(outer) + .025]], roofLight);
    }

    // South-facing public front: a brick portico with deep, regular piers,
    // dark glazed doors and sidelights under a continuous concrete lintel.
    // The pier backs cross the mapped south wall (which slopes slightly).
    box(east(.46), east(.955), 5.70, 6.12,
      southWall(east(.46)) - .42, southWall(east(.955)) + .24, concrete);
    for (const t of [.46, .585, .71, .835, .955]) {
      const front = southWall(east(t));
      box(east(t) - .34, east(t) + .34, .12, 5.82,
        front - .42, front + .25, brick);
      box(east(t) - .39, east(t) + .39, 5.25, 5.48,
        front - .45, front + .28, sandBrick);
    }
    for (const [a, b] of [[.482, .563], [.607, .688], [.732, .813], [.857, .933]]) {
      const front = southWall((east(a) + east(b)) / 2);
      box(east(a), east(b), .76, 4.73, front - .14, front + .1, glass);
      box((east(a) + east(b)) / 2 - .05, (east(a) + east(b)) / 2 + .05,
        .76, 4.73, front - .19, front + .12, mullion);
      box(east(a), east(b), 4.70, 4.83, front - .08, front + .31, mullion);
    }
    // A restrained brick rhythm above the arcade mirrors its solid piers.
    for (let i = 0; i < 9; i++) {
      const x = east(.48 + i * .055);
      const front = southWall(x);
      box(x, x + .34, 7.15, 8.08, front - .08, front + .16, sandBrick);
    }

    // North/rear entrance: broad glass doors beneath a horizontal band of
    // red, black, and gold diamond masonry documented in UMD's photo.
    const rear = north(.985);
    box(east(.635), east(.82), .18, 3.95, rear - .13, rear + .08, glass);
    box(east(.727) - .055, east(.727) + .055, .18, 3.95,
      rear + .05, rear + .18, mullion);
    box(east(.62), east(.835), 3.92, 4.14, rear - .17, rear + .2, mullion);
    box(east(.585), east(.87), 5.48, 5.74, rear - .16, rear + .21, concrete);
    for (let i = 0; i < 11; i++) {
      const x0 = east(.585 + i * .026);
      const x1 = east(.585 + (i + 1) * .026);
      for (let row = 0; row < 3; row++) {
        const shade = (i + row) % 4 === 0 ? goldBrick
          : (i - row + 12) % 4 === 0 ? blackBrick : darkBrick;
        box(x0, x1, 4.32 + row * .36, 4.60 + row * .36,
          rear - .11, rear + .11, shade);
      }
    }
    // The rest of the rear wall has sparse, vertically proportioned lights.
    for (const t of [.475, .535, .89, .94]) {
      box(east(t), east(t + .026), 6.28, 8.12,
        rear - .16, rear + .08, glass);
      box(east(t) - .07, east(t + .026) + .07, 8.07, 8.22,
        rear - .14, rear + .13, sandBrick);
    }

    // West wing: paired low windows meet its wall; the main east elevation
    // carries a quieter second-floor row below the roof eave.
    for (const t of [.08, .16, .24, .32]) {
      box(east(t), east(t + .043), 1.22, 3.62,
        north(.012), north(.025), glass);
    }
    for (const t of [.40, .54, .68, .82]) {
      box(xEast - .1, xEast + .08, 5.96, 7.68,
        north(t), north(t + .045), glass);
      box(xEast - .12, xEast + .12, 7.64, 7.79,
        north(t) - .06, north(t + .045) + .06, concrete);
    }
    return parts;
  },
};
