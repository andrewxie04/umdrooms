/** Solar position for College Park, shared by the 3D scene and the first UI
 * paint. Using one calculation keeps the initial theme aligned with the map. */
const CAMPUS_LAT = 38.9869;
const CAMPUS_LNG = -76.9426;

/** Compact NOAA-style approximation. The UTC calculation is independent of
 * the visitor's device timezone. Azimuth is clockwise from north. */
export function computeSunPosition(date: Date): { elevation: number; azimuth: number } {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);

  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const tst = utcHours * 60 + eqtime + 4 * CAMPUS_LNG;
  const ha = ((tst / 4 - 180) * Math.PI) / 180;
  const lat = (CAMPUS_LAT * Math.PI) / 180;
  const cosZenith =
    Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
  const zenith = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const elevation = 90 - (zenith * 180) / Math.PI;

  const sinZenith = Math.sin(zenith);
  let azimuth = 180;
  if (sinZenith > 1e-6) {
    const cosAz = Math.max(-1, Math.min(1,
      (Math.sin(lat) * cosZenith - Math.sin(decl)) / (Math.cos(lat) * sinZenith),
    ));
    const az = (Math.acos(cosAz) * 180) / Math.PI;
    azimuth = ha > 0 ? (az + 180) % 360 : (540 - az) % 360;
  }
  return { elevation, azimuth };
}
