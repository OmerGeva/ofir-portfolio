// Where the plinth sits in /public/bg.jpg, in source pixels.
// If the background image changes, re-measure these (see CLAUDE.md → "Plinth anchoring").
export const BG = {
  width: 2000,
  height: 1493,
  posX: 0.5,      // must match .bg object-position x
  posY: 0.62,     // must match .bg object-position y
  plinthX: 1005,  // centre of the plinth's top surface
  plinthY: 995,
  plinthHalfW: 397
};

const PHONE_RATIO = 37 / 76; // width / height of a modern iPhone

// Maps the plinth from image space to screen space (object-fit: cover math)
// and sizes the phone so it stands on it with room for the header above.
export function geom(stage) {
  const w = stage.clientWidth, h = stage.clientHeight;
  const s = Math.max(w / BG.width, h / BG.height);
  const ox = (w - BG.width * s) * BG.posX;
  const oy = (h - BG.height * s) * BG.posY;
  const plinthX = ox + BG.plinthX * s;
  const plinthY = oy + BG.plinthY * s;
  const plinthW = BG.plinthHalfW * 2 * s;

  let ph = Math.min(plinthW * 0.95, (plinthY - Math.max(h * 0.13, 92)) / 1.07, 640);
  let pw = ph * PHONE_RATIO;
  const cap = w < 700 ? w * 0.52 : w * 0.3;
  if (pw > cap) { pw = cap; ph = pw / PHONE_RATIO; }

  return { w, h, pw, ph, plinthX, plinthY, plinthW };
}
