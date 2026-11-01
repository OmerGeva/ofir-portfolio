// Where things sit in the /public/bg.jpg panorama, in source pixels.
// If the background image changes, re-measure these (see CLAUDE.md → "Plinth anchoring").
export const BG = {
  width: 2500,    // the first 500px mirror the original image's left edge so the plinth can centre
  height: 848,
  posY: 0.62,     // only matters on screens wider than the panorama
  plinthX: 1059,   // centre of the plinth's top surface
  plinthY: 570,
  plinthHalfW: 221,
  aboutX: 2140    // the bench, which the camera frames in the about area
};

const PHONE_RATIO = 37 / 76; // width / height of a modern iPhone

// Fits the panorama to the screen, finds the two camera positions along it (the plinth and the
// bench), and sizes the phone so it stands on the plinth with room for the header above.
export function geom(stage) {
  const w = stage.clientWidth, h = stage.clientHeight;
  const s = Math.max(w / (BG.plinthX * 2), h / BG.height); // also wide enough to centre the plinth
  const iw = BG.width * s, ih = BG.height * s;
  const pan = x => Math.min(0, Math.max(w - iw, x));
  const ox = pan(w / 2 - BG.plinthX * s);
  const oy = (h - ih) * BG.posY;
  const shift = pan(w * (w < 700 ? 0.5 : 0.68) - BG.aboutX * s) - ox;
  const plinthX = ox + BG.plinthX * s;
  const plinthY = oy + BG.plinthY * s;
  const plinthW = BG.plinthHalfW * 2 * s;

  let ph = Math.min(plinthW * 0.95, (plinthY - Math.max(h * 0.13, 92)) / 1.07, 640);
  let pw = ph * PHONE_RATIO;
  const cap = w < 700 ? w * 0.52 : w * 0.3;
  if (pw > cap) { pw = cap; ph = pw / PHONE_RATIO; }

  return { w, h, pw, ph, plinthX, plinthY, plinthW, iw, ih, ox, oy, shift };
}
