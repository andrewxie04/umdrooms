/** Camera poses shared by the map controls and the renderer. Keeping these
 * lightweight lets the room browser become interactive while Three.js loads. */
export const HOME_VIEW = {
  lat: 38.9865,
  lng: -76.9442,
  zoom: 16.7,
  pitch: 43,
  bearing: -18,
};

export const HOME_VIEW_2D = {
  lat: 38.9865,
  lng: -76.9442,
  zoom: 15.95,
  pitch: 90,
  bearing: 0,
};
