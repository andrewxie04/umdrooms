# Other campus building model research

This note records the evidence used for the native Three.js models in
`src/components/map3d/scene/landmarks/buildings/`. `public/campus-data.json`
was checked for every exact `id` / `umdCode` pair below. UMD Facilities pages
establish building identity, dates and use; they do **not** establish exact
facade colors, roof heights or equipment placement. Roof layout observations
come from the local 2023 MD iMAP aerial in this directory, sourced from
https://mdgeodata.md.gov/imagery/rest/services/SixInch/SixInchImagery/ImageServer.
The aerial is a design reference only and is never rendered by the site.
All meter heights, colors and small roof components in the models are visual
approximations, not surveyed dimensions or an assertion of exact materials.

## ANS — Animal Sciences/Agricultural Engineering

- **Identity:** `relation/20447083`, `umdCode: ANS` in the baked campus data.
- **Verified:** UMD Facilities lists building 142, built in 1970. UMD repeatedly
  identifies an Animal Sciences courtyard; UMD also documents a green facade
  on the south side. Sources: https://facilities.umd.edu/node/369 ;
  https://today.umd.edu/a-peek-inside-ecological-engineer-dave-tilleys-office ;
  https://sustainability.umd.edu/about/sustainability-fund/grant-recipients
- **Mapped geometry / aerial observation:** the baked ANS relation has one
  mapped courtyard hole, also visible from above. The model extrudes the
  supplied hole with the outer ring, preserves the flat-roofed wings and adds
  one restrained green facade strip. The 13.2 m wall height is approximate.

## ARC — Architecture Building

- **Identity:** `way/23587113`, `umdCode: ARC`.
- **Verified:** UMD Facilities lists building 145, built in 1972; the School
  identifies its two-floor Great Space. Sources:
  https://facilities.umd.edu/info-resources/building-inventory?page=5 ;
  https://arch.umd.edu/about/news-and-events/news/come-feel-and-make-noise ;
  https://arch.umd.edu/visit-us
- **Aerial observation:** long north block with repeated shed-like roof bands
  linked to a smaller south volume. These become three simple native sloped
  planes and a lower roof. Brick/concrete tones, glazing and roof rises are
  approximate; the model does not claim a measured roof section.

## ASY — Parren J. Mitchell Art-Sociology Building

- **Identity:** `way/23543523`, `umdCode: ASY`.
- **Verified:** UMD Facilities lists building 146, built in 1976; the Art
  Department documents galleries, light-filled studios and sculpture shops.
  Sources: https://facilities.umd.edu/node/373 ;
  https://art.umd.edu/facilities-tour ;
  https://arhu.umd.edu/about/facilities
- **Aerial observation:** bent mass with a longer western roof and a taller,
  pale eastern roof section. The roof zones and small service forms reflect
  the aerial. Their exact heights and surface colors are approximate.

## ATL — Atlantic Building

- **Identity check:** `way/23579495` has `umdCode: ATL` and name `Atlantic` in
  `campus-data.json`. The separate room metadata point for ATL is west of this
  mapped footprint; nearby Jull Hall is **not** ATL. UMD Facilities identifies
  building 224 as Atlantic, constructed 1963, renovated 1996. Sources:
  https://facilities.umd.edu/node/409 ; https://maps.umd.edu/
- **Aerial observation:** long science block with distinct end roof areas,
  an inset center and rooftop equipment. The model uses those broad masses.
  Rooftop placement and 17.6 m wall height are approximate.

## CCC — Cambridge Community Center

- **Identity:** `way/23547135`, `umdCode: CCC`.
- **Verified:** UMD Facilities identifies building 097, built in 1962, as an
  auxiliary/community facility. Source: https://facilities.umd.edu/node/338
- **Aerial observation:** low broad flat roof, central raised roof feature and
  south entrance projection. The model uses a low flat mass with one roof
  enclosure. Its exact material tones and height are approximate.

## PAC — Clarice Smith Performing Arts Center

- **Identity:** `way/23547877`, `umdCode: PAC` (present in the current bake).
- **Verified:** The Clarice describes six main venues, with the Grand Pavilion
  serving as the main entrance/town square. UMD describes ten interconnected
  structures and multiple outdoor courts. The [Clarice visit page](https://theclarice.umd.edu/visit-us) shows substantial red-brown brick theatre masses, dark roof planes and lit glazed links; the [UMD Arboretum's daylight exterior view](https://arboretum.umd.edu/academics/tours-talks/clarice-self-guided-tour) confirms the brick front with pale sections.
  Sources: https://theclarice.umd.edu/visit-us/venues ;
  https://arboretum.umd.edu/clarice ;
  https://terp.umd.edu/a-silver-anniversary-for-the-gold-standard-in-performing-arts
- **Mapped geometry / aerial observation:** the PAC footprint has one mapped
  courtyard hole, retained by the main mass. Above the fragmented low wings
  are a rounded main hall, tall theatre block and repeated roof bands. The
  model's drum, fly tower and pavilion are retained; narrow roof monitors
  break up its music wing. The model now uses brick for the low village and
  theatre blocks, a dark roof plate, pale concert-hall and trim sections,
  and blue-gray glass for the curved entrance. Locations, exact material
  colors and heights are visual approximations.

## ESJ — Edward St. John Learning and Teaching Center

- **Identity:** `way/476961971`, `umdCode: ESJ`.
- **Verified:** UMD describes a traditional red-brick exterior, a modern
  interior and a hillside building with the historic columned entrance toward
  McKeldin Mall. Sources:
  https://today.umd.edu/building-commitment-learning-and-teaching-466f9cc8-fe50-44e1-84c8-00fb04062458 ;
  https://pdc-svpaap1.umd.edu/esj/building.html ;
  https://facilities.umd.edu/node/411
- **Aerial observation:** large north teaching roof, lower south terrace and
  narrower east arm. The existing stepped roof/gable model was refined with
  a compact pale entrance pier pair. Roof elevations and pier sizes are
  approximate.

## KNI — Knight Hall

- **Identity:** `way/25202315`, `umdCode: KNI`.
- **Verified:** UMD Facilities lists building 417, constructed 2010. Merrill
  College documents large glass expanses, an efficient curtain wall and
  sunshades. UMD's facilities plan shows brick and glass at the entrance.
  Sources: https://facilities.umd.edu/node/533 ;
  https://merrill.umd.edu/schedule-a-visit ;
  https://facilities.umd.edu/sites/default/files/2023-01/UMD%20Master%20Plan%202011-2030_0.pdf
- **Aerial observation:** L-shaped footprint opens to the southeast court.
  The model keeps that void, with glass/sunshade bands on its inner faces.
  Band positions, brick tone and height are approximate.

## SPH — School of Public Health Building

- **Identity:** `way/23545670`, `umdCode: SPH`.
- **Verified:** UMD Facilities identifies building 255, constructed 1973 and
  renovated 2010; a School of Public Health photo shows a brick exterior.
  Sources: https://facilities.umd.edu/node/435 ;
  https://sph.umd.edu/news/ceejh-announces-2023-environmental-justice-scholars-climate-justice-fellows
- **Aerial observation:** very long mass with several differently colored
  flat roof zones, darker in the west and lighter in the east. The model
  separates these volumes. The exact roofing material, service enclosures
  and elevations are approximate; roof color does not date a renovation.

## SQH — Susquehanna Hall

- **Identity:** `way/23937386`, `umdCode: SQH`.
- **Verified:** UMD Facilities lists building 233, constructed 1991; a UMD
  department directions page describes it as four stories. Sources:
  https://facilities.umd.edu/node/416 ;
  https://www.grace.umd.edu/~richb/symp.html
- **Aerial observation:** compact rectangular flat roof with two separate
  rooftop structures. The model renders those simple masses. Brick/roof
  tones and 15.4 m wall height are approximations.

## TWS — Tawes Hall

- **Identity:** `way/23543131`, `umdCode: TWS`.
- **Verified:** UMD Facilities lists building 141, constructed 1965 and
  renovated 2016. UMD identifies it as a former performing arts venue and
  current home of English/American Studies. Sources:
  https://facilities.umd.edu/node/368 ;
  https://arhu.umd.edu/about/facilities ;
  https://today.umd.edu/whatever-happened-to-tawes-theatre
- **Aerial observation:** a broad low former performance mass and a long
  eastern wing with light pitched roof sections. These remain distinct in
  the model. Gable rise and all wall heights are approximate.

## TMH — Thurgood Marshall Hall

- **Identity:** `way/958049551`, `umdCode: TMH`.
- **Verified:** UMD School of Public Policy describes the soaring glass wall
  toward Chapel Lawn/Baltimore Avenue and a top-floor reading room with
  rooftop terrace. SustainableUMD documents white reflective roofing and a
  green roof. Sources:
  https://dgi.umd.edu/news/architectural-excellence-takes-center-stage-thurgood-marshall-hall ;
  https://sustainability.umd.edu/buildings ;
  https://sustainability.umd.edu/green-building-tour
- **Aerial observation:** three-arm footprint with light roof. The model keeps
  the plan, white roof, small planted terrace zone and south glass bands.
  Terrace size, facade band layout and 19.2 m wall height are approximations.

## VMH — Van Munching Hall

- **Identity:** `way/24006939`, `umdCode: VMH`.
- **Verified:** UMD Facilities identifies building 039, built in 1992 and
  renovated in 2011. Smith School documents its atrium and west-wing
  courtyard entrance; the campus location page describes adjacent masonry,
  a clock tower and landscaped gateway *outside* the hall. Sources:
  https://facilities.umd.edu/node/294 ;
  https://www.rhsmith.umd.edu/about/location ;
  https://networth.rhsmith.umd.edu/sites/default/files/_docs/Smith%20IT%20-%20WEPA%20VMH%20Printing%20Locations.pdf ;
  https://www.rhsmith.umd.edu/about/reimagining-van-munching-hall
- **Aerial observation:** long east bar, irregular west courtyards and two
  rounded roof bays. The model retains the mapped cutouts and adds only small
  roof caps for the round bays. The cap radii, roof tones and 24.2 m wall
  height are approximations. The separate gateway clock tower is not modeled
  as part of VMH.
