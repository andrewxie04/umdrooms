# Other visible hand-modeled landmarks

The local `campus-aerial-wide.jpg` and `campus-aerial-core.jpg` were used only to compare footprint and roof massing. Their source and bounds are in `campus-aerial.SOURCE.txt` (Maryland MD iMAP, https://mdgeodata.md.gov/imagery/rest/services/SixInch/SixInchImagery/ImageServer). No imagery is rendered by the map. All geometry below is native Three.js.

Dimensions in the models are illustrative unless an official source supplies them. OSM footprint IDs identify the map geometry; the cited pages establish building identity or visible features, not exact model measurements.

## Stamp Student Union — `stamp-student-union.ts`

- **Verified:** UMD's [building page](https://calendar.umd.edu/place/campusLocationBuildings/stamp-student-union) shows the columned front entrance. The [Stamp facilities exterior photograph](https://stamp.umd.edu/about_us/facilities) shows red-brown brick, pale trim, shallow dark roof planes, and a low arched entrance wing. The [Stamp brochure](https://stamp.umd.edu/sites/default/files/2021-08/EGS_Brochure_2021.pdf) also shows the brick exterior and pale entrance columns.
- **Modeled:** Retained stepped brick wings and columned portico; added a dark recessed entrance plane to make the opening visible beneath the columns. Changed the tan brick and exposed brick-colored wing roofs to deeper red-brown walls and dark roof caps; modeled four glazed arches and a low hipped roof on the eastern frontage.
- **Approximate:** Wing heights, column spacing, entry glazing extent, roof penthouse, cornice sizes, and arcade arch count/spacing are visual simplifications of the OSM footprint and university photograph, not published architectural measurements.

## Memorial Chapel — `memorial-chapel.ts`

- **Verified:** UMD's [Memorial Chapel page](https://stamp.umd.edu/visit/memorial_chapel) identifies the 1952 chapel and shows its distinctive steeple. [Maryland Today](https://today.umd.edu/what-it-takes-memorial-chapel-weddings) explicitly describes a brick exterior. [UMD's directions](https://stamp.umd.edu/visit/memorial_chapel/directions_and_parking) place the front entrance by Regents Drive and the garden entrance at the back.
- **Modeled:** Brick nave and tower, gable and pale belfry/spire. Moved the steeple and columned entrance to the east, Regents Drive end of the mapped footprint and shortened the nave roof to meet it.
- **Approximate:** Gable rise, tower proportions, belt course, and 27.2 m apex are map-scale estimates. The belt course is a simplified visual separation, not a documented dimension.

## SECU Stadium — `secu-stadium.ts`

- **Verified:** The [Maryland Athletics facility page](https://umterps.com/facilities/secu-stadium/1) locates Tyser Tower on the south rim and gives its five-tier, 90 ft high, 160 ft long form. It places the 120 ft by 54 ft video board in the west end zone and describes the north upper deck.
- **Reference view:** [UMD Police's October 2024 stadium aerial](https://umpd.umd.edu/sites/default/files/2025-08/SECUStadium_Aerial_10312024_EK_0506__DAM.jpg) shows the dominant sloped north upper deck, lighter seating and red aisle breaks, the brick/glass Tyser Tower along the south sideline, green striped turf, a red midfield M, and Maryland-flag colors in the end zone.
- **Modeled:** Tyser Tower now occupies its own mapped footprint (`way/25215513`), so the stadium no longer adds a second overlapping tower. Its 27.4 m maximum, brick body, dark suite glazing, pale piers and roofline are separate native Three.js meshes. The west board, open stepped bowl, fine seat-row grooves and aisle breaks are native geometry.
- **Field correction:** The former field was a small D-shaped patch inside the west bowl. The current native Three.js turf is a full 120-by-53⅓-yard rectangle, including end zones, aligned with the two straight sides of the mapped seating band. [NCAA's field rules](https://www.ncaa.org/championships/playing-rules/football-playing-rules/) establish the playing dimensions; UMD identifies the venue surface as FieldTurf. Turf bands, field lines, the red M, goalposts and simplified flag-pattern end zones are geometry, never an image overlay.
- **Grandstand correction:** The broad north and west seating band rises in nine native 3D terraces from the inner bowl toward the mapped outer rim. Narrow red aisle breaks now cross the lower bowl, while ten elevated strips, red aisle marks and a long cross-aisle distinguish the taller north upper deck visible in the UMD aerial. Row counts, aisle spacing and riser dimensions are illustrative.
- **Approximate:** Tower glazing layout, seating tier geometry, field center and painted design, screen support, and the mapping of the source's board dimensions into the simplified block are inferred from the OSM footprint and aerial. The board is modeled as a dark mass, without image content.

## XFINITY Center — `xfinity-center.ts`

- **Verified:** [Maryland Athletics](https://umterps.com/facilities/xfinity-center/8) confirms the arena and shows exterior views; its [game-day guide](https://umterps.com/sports/2020/1/15/xfinity-center-info-guide) identifies the southeast main public gate and other corner entrances.
- **Modeled:** Replaced three visibly stacked roof blocks with a continuous, low faceted roof and retained four corner entrance masses. A small rooftop mechanical drum keeps the aerial silhouette legible.
- **Approximate:** Octagonal cut, roof heights/curvature, drum size, material colors, and pavilion dimensions are map-scale interpretations of official exterior images and the local aerial, not published measurements.

## Eppley Recreation Center — `eppley-recreation-center.ts`

- **Verified:** UMD [Facilities Management](https://facilities.umd.edu/node/316) and [Residential Facilities](https://drf.umd.edu/facilities) show the center's exterior; [RecWell's brochure](https://recwell.umd.edu/sites/default/files/2021-08/FacilitiesBrochure.pdf) identifies the large recreation complex.
- **Modeled:** Shifted the wall material toward the brick visible in UMD's exterior imagery. The existing lower connected wings, glazed pool volume, and field-house roof zones remain.
- **Approximate:** Seven gables, rooflights, exact zone boundaries and heights are inferred from the OSM footprint and local aerial; official sources checked do not establish those counts or measurements.

## The Hotel at UMD — `the-hotel-umd.ts`

- **Verified:** [Maryland Today](https://today.umd.edu/staying-power-c84e059f-eebe-47b6-8ae9-4361a3d41591) states that the hotel has ten stories. The hotel's [room page](https://www.thehotelumd.com/university-view-rooms/) describes floor-to-ceiling windows, and its [artwork statement](https://www.thehotelumd.com/content/uploads/2024/07/HUMD-Artwork-Statement.pdf) documents a glass entrance canopy bearing the Maryland flag.
- **Modeled:** Preserved the tower over a lower podium and horizontal glass bands; changed the entrance canopy material from dark opaque to glass. No flag graphic or image is used.
- **Approximate:** Podium/tower setback, 32 m roof height, floor spacing, band proportions, and canopy placement are visual estimates, not building plans.

## Physical Sciences Complex — `physical-sciences-complex.ts`

- **Verified:** [UMD CMNS](https://cmns.umd.edu/index.php/news-events/news/great-science-happens-here-physical-sciences-complex-opens-its-doors) describes a multi-story elliptical **glass cone**, with irregular panes and selected red panels producing a checkerboard effect. [UMD Sustainability](https://sustainability.umd.edu/buildings) notes its green roof.
- **Modeled:** Corrected the model ID to the Physical Sciences Complex relation in the local campus data, preserved its mapped inner courtyard, and placed the tapered glass oculus within that opening. The neighboring IPST building remains a separate footprint.
- **Approximate:** Cone ellipse, taper, pane pattern, and heights are stylized. The UMD sources establish the visible form, while the local OSM relation supplies the plan outline.

## Main Administration Building — `main-administration.ts`

- **Verified:** [UMD Facilities Management](https://facilities.umd.edu/node/322) identifies the Thomas V. Miller Jr. Administration Building, constructed in 1940. [UMD's visit page](https://umd.edu/visit) shows it closing the east end of McKeldin Mall; the page's campus photo is a reference for the traditional facade.
- **Modeled:** The existing file already has a brick body, west-facing white colonnade, triangular pediment, hipped roof, and entrance bays. This file is an untracked in-progress file in the shared working tree, so it was inspected and left intact to respect concurrent ownership.
- **Approximate:** Roof rise, six-column spacing, height, and door placement are model approximations. The cited facilities page does not supply these dimensions.

## Cole Field House / Jones-Hill House — `cole-field-house.ts`

- **Verified:** [Maryland Athletics](https://static.umterps.com/custompages/buildingchampions/cole.html) identifies the revitalized and expanded Cole Field House; [Maryland Athletics' dedication page](https://umterps.com/news/2021/9/3/terrapin-athletics-jones-hill-house-home-of-maryland-football-officially-dedicated) confirms Jones-Hill House is part of the project. The [project's exterior cladding supplier](https://metalwerksusa.com/portfolio/cole-field-house-university-of-maryland-college-park-md/) documents the renovation. The north glass frontage facing the stadium is described in the [project account](https://mpower.maryland.edu/university-of-maryland-merging-football-science-and-education-into-cole-field-house/).
- **Modeled:** Retained the broad barrel vault and brick base; added a restrained mullion rhythm to the north glazed arch.
- **Approximate:** Vault span, 20 m apex, station spacing, and mullion count derive from the OSM footprint and map-scale modeling. They are not source-supplied dimensions.

## Yahentamitsi Dining Hall — `yahentamitsi-dining-hall.ts`

- **Verified:** The [architect's project photos](https://ayerssaintgross.com/work/project/yahentamitsi-dining-hall/) show the low brick mass, long two-story glazed front and side, fine vertical mullions, and a thin dark roof projection. [Maryland Today](https://today.umd.edu/a-new-recipe-for-success) describes the floor-to-ceiling glass and balcony overlooking athletics facilities.
- **Modeled:** Kept the mapped L-shaped footprint, added a pale roof, glazing and mullions along the Stadium Drive and plaza faces, a dark projecting roof/canopy, an eastern brick entrance section, and a low rooftop screen. All visible features are native Three.js geometry.
- **Approximate:** Glazing extents, canopy projection, screen placement, and 8.24–10.15 m heights are map-scale interpretations of the photographs and aerial; neither source provides exact facade or roof dimensions.

## South Campus Dining Hall — `south-campus-dining-hall.ts`

- **Verified:** UMD [Facilities Management's exterior photo](https://facilities.umd.edu/node/283) shows the connected two-story red-brick and pale facade sections, entry steps, and green entrance canopy. [Dining Services' front-door image](https://dining.umd.edu/hours/dining-halls/south-campus) confirms the green sloped metal canopy above glazed doors. UMD [documents a rooftop community garden](https://sustainability.umd.edu/about/sustainability-fund/grant-recipients).
- **Modeled:** Replaced the generic extrusion with a brick shell, pale eastern facade, repeated window bays, two glazed entries, the pitched green canopy, low steps, rooftop planting zone, and a small roof enclosure. The mapped footprint stays intact, and the geometry is native Three.js.
- **Approximate:** Exact facade boundaries, window spacing, canopy slope, roof equipment, garden extent, steps, and heights are visual map-scale estimates; the cited sources do not specify their measurements.

## 251 North Dining Hall — `251-north-dining-hall.ts`

- **Verified:** [UMD Dining Services' exterior image](https://dining.umd.edu/hours/dining-halls/251-north) shows a low red-brown brick wall, shallow dark roof edge, tall multi-pane windows with pale surrounds, and a recessed entrance in a broad pale frame. [UMD Student Affairs](https://studentaffairs.umd.edu/student-life/dining-housing) also identifies the brick 251 North entrance. The Dining Services marker falls inside the unnamed mapped `way/23899291` footprint, 11 m from its centroid, amid the Denton, Easton, and Elkton halls.
- **Modeled:** Registered that previously generic footprint as 251 North and added the brick shell, dark inset roof, pale parapet, framed glass window bays, and recessed-looking main doorway. The facade details follow the angled map edge in native Three.js geometry.
- **Approximate:** Entrance side, window and door spacing, roof height, and trim sizes are visual interpretations of the official photographs and local aerial. The sources do not provide measured elevations or an entrance coordinate.
# Denton Community residence halls (Denton, Easton, Elkton)

- [UMD Resident Life's Denton Community page](https://reslife.umd.edu/explore-halls/residence-halls/denton-community) identifies the three traditional high-rise halls, 251 North, and the community layout. Its exterior photographs show red/brown brick towers with small, regular rectangular windows and pale stone entrance surrounds. Elkton's photographed ground floor has arched pale-trimmed openings.
- Individual [Denton](https://drf.umd.edu/facilities/residence-halls-communities/denton-hall), [Easton](https://drf.umd.edu/facilities/residence-halls-communities/easton-hall), and [Elkton](https://drf.umd.edu/facilities/residence-halls-communities/elkton-hall) facilities pages provide building-specific photos and construction information. Denton was built in 1964; the other halls have closely related forms.
- The 3D models use each OSM footprint and tagged height (Denton/Elkton 26.4 m, Easton 29.7 m). Brick tones, shallow pale ground plinths, stone coping, dark flat roof surfaces, roof housings, and courtyard-facing glazed entries reflect the official exterior views. Elkton additionally gets pale arched-ground-floor surrounds. Exact window/door placement and roof mechanical layout remain approximations; the photographs are not full measured elevations.
# Ellicott Community residence halls (Ellicott, Hagerstown, La Plata)

- [UMD Resident Life's Ellicott Community page](https://reslife.umd.edu/explore-halls/residence-halls/ellicott-community) identifies the three towers and shows exterior photos. Ellicott's brick facade rises over a broad pale-stone, multi-door ground floor. Hagerstown also has a pale lower register. La Plata's photo shows a central light-stone entry and prominent steps.
- The individual Residential Facilities pages for [Ellicott](https://drf.umd.edu/facilities/residence-halls-communities/ellicott-hall), [Hagerstown](https://drf.umd.edu/facilities/residence-halls-communities/hagerstown-hall), and [La Plata](https://drf.umd.edu/facilities/residence-halls-communities/la-plata-hall) supply building-specific views and confirm their use as traditional residence halls. The [2026 residential facilities report](https://drf.umd.edu/about-us/2026-annual-report) describes upcoming window and climate-control upgrades to Ellicott and Hagerstown, so the current exterior photos remain the model's visual reference rather than assuming completed changes.
- The custom meshes follow their separate mapped footprints and heights: Ellicott 29.7 m, Hagerstown 19.8 m, and La Plata 33 m. The ground-floor stone, door count, roof trim and La Plata steps are stylized from the photos. The precise mechanical equipment and door positions are approximated.
