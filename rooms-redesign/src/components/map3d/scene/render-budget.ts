// Bound GPU work on large Retina displays while keeping small screens sharp.
const MAX_RENDER_PIXELS = 3_000_000;

export function campusPixelRatio(width: number, height: number, deviceRatio: number): number {
  return Math.min(2, Math.max(1, deviceRatio || 1),
    Math.sqrt(MAX_RENDER_PIXELS / Math.max(1, width * height)));
}

// Camera input / focus flights stay at 60 Hz; ambient traffic runs at 30 Hz.
export function campusFrameInterval(moving: boolean): number {
  return 1000 / (moving ? 60 : 30);
}

// Keep room-list gestures ahead of decorative map work. Camera gestures and
// explicit changes (selection, resize, theme) must still paint immediately.
export function deferAmbientFrame(now: number, browseUntil: number, moving: boolean, dirty: boolean): boolean {
  return now < browseUntil && !moving && !dirty;
}
