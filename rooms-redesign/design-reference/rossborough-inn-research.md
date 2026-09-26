# Rossborough Inn model references

The Inn is represented by two adjacent OSM building footprints in `public/campus-data.json`: `way/23988920` (long north-south block) and `way/1499355407` (westward lower wing). Both receive native Three.js geometry. No photograph or map overlay is shown in the site.

## Observed details

- [UMD Facilities building 080](https://facilities.umd.edu/node/325) and its [exterior photograph](https://facilities.umd.edu/sites/default/files/UMDBuildings/080.jpg) show red brick, pale window trim, dark pitched roofing, dormers, a chimney and a low wall by the approach.
- The [UMD Historic Preservation Program study](https://drum.lib.umd.edu/items/48828c4a-c961-4fe6-9a71-a77eb17fcde7) describes the surviving east facade, the 1938–39 restoration, gabled brick wings, Flemish bond, louvred shutters, pedimented dormers and six-over-six sash. The model follows the *current* gabled form, not the earlier mansard-and-porch arrangement.
- The [UMD campus history exhibition](https://exhibitions.lib.umd.edu/macmil/letb) cautions that renovations changed the original exterior substantially.

## Geometry choices and limits

The walls follow each mapped footprint; the long gable and lower wing roof are simplified surfaces aligned to each footprint's dominant edge. The east entry has a dark inset, pale frame and steps. Repeated white sash, green shutters and dormers convey the documented elevations. The two footprint parts are modeled separately because the source data splits the complex, but they read as one building in the map. Exact roof pitch, window locations, shutter size, chimney position and heights are visual approximations, not measured reconstruction. The foreground curved wall is omitted pending surveyed geometry.
