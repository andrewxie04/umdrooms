/** Camera poses shared by the map controls and the renderer. Keeping these
 * lightweight lets the room browser become interactive while Three.js loads. */
// Campus-wide framing matched to the selected reference view. The renderer
// offsets this focus into the space beside the room browser at each width.
export const HOME_VIEW = {
  lat: 38.986570,
  lng: -76.941653,
  zoom: 15.78,
  pitch: 41.76,
  bearing: -18.14,
};

export const HOME_VIEW_2D = {
  lat: 38.986570,
  lng: -76.941653,
  zoom: 15.95,
  pitch: 90,
  bearing: 0,
};
