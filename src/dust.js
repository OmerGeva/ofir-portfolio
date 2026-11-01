// Warm dust motes drifting up through the sunlight. Static frame when reduced motion is on.
export function startDust(canvas, stage, reduceMotion) {
  const x = canvas.getContext('2d');
  let P = [], W = 0, H = 0;

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = stage.clientWidth; H = stage.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    P = Array.from({ length: Math.round(W / 28) }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.8,
      r: 0.6 + Math.random() * 1.8, v: 0.08 + Math.random() * 0.25, p: Math.random() * 6
    }));
  }
  size();
  new ResizeObserver(size).observe(stage);

  function tick(t) {
    x.clearRect(0, 0, W, H);
    for (const d of P) {
      d.y -= d.v; d.x += Math.sin(t / 3000 + d.p) * 0.15;
      if (d.y < -5) { d.y = H * 0.8; d.x = Math.random() * W; }
      x.fillStyle = `rgba(255,250,235,${0.25 + 0.4 * Math.abs(Math.sin(t / 1400 + d.p))})`;
      x.beginPath(); x.arc(d.x, d.y, d.r, 0, Math.PI * 2); x.fill();
    }
    if (!reduceMotion && !document.hidden) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduceMotion) requestAnimationFrame(tick); });
}
