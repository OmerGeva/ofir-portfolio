// Scroll, swipe, arrow keys, and a gentle mouse tilt on the whole phone group.
export function bindInput(stage, tilt, { next, prev }, reduceMotion) {
  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
  });

  let last = 0;
  stage.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 8) return;
    e.preventDefault();
    const t = Date.now();
    if (t - last < 750) return; // one clip per gesture, including trackpad momentum
    last = t;
    d > 0 ? next() : prev();
  }, { passive: false });

  let sx = null, sy = null;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
  });

  if (reduceMotion) return;
  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `rotateY(${dx * 10}deg) rotateX(${-dy * 7}deg)`;
  });
  stage.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
}
