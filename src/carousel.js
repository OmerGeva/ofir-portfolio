const ICONS = {
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C.8 8.2 3 4.5 6.6 4.5c2.1 0 3.5 1.1 4.4 2.5.9-1.4 2.3-2.5 4.4-2.5 3.6 0 5.8 3.7 4.2 7.3C19.5 16.4 12 21 12 21z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.2 6.1L4.5 21l4-1.9c1.1.3 2.3.4 3.5.4 5.5 0 10-3.8 10-8.5S17.5 3 12 3z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 11.2 21 3l-6.6 18.5-3.4-7.6-8.5-2.7z"/></svg>',
  status: '<svg viewBox="0 0 34 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/><rect x="22" y="1" width="11" height="10" rx="3"/></svg>'
};
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Side-card look by distance from the active card: scale, Y-rotation (deg), opacity
const SCALE = [1, 0.6, 0.44, 0.32];
const ROT = [0, 26, 36, 44];
const OPACITY = [1, 0.95, 0.6, 0];

export class Carousel {
  constructor(refs, items, handle, { onSelect, onMeta }) {
    Object.assign(this, refs);
    this.items = items;
    this.handle = handle;
    this.onSelect = onSelect;
    this.onMeta = onMeta;
    this.cards = items.map(it => this.makeCard(it));
  }

  makeCard(it) {
    const c = document.createElement('div');
    c.className = 'card';
    const [c1, c2, c3] = it.palette || ['#E9806A', '#9C86C9', '#FFE6B8'];
    c.style.setProperty('--c1', c1); c.style.setProperty('--c2', c2); c.style.setProperty('--c3', c3);
    c.innerHTML = `
      <div class="scene"><span class="blob b1"></span><span class="blob b2"></span></div>
      <video playsinline loop muted preload="none"></video>
      <div class="ui">
        <div><div class="status"><span>9:41</span>${ICONS.status}</div>
          <div class="top"><span class="plat">${esc(it.platform)}</span><span>${esc(this.handle)}</span></div></div>
        <div class="hook">${(it.hook || []).map(h => `<span>${esc(h)}</span>`).join('')}</div>
        <div class="rail"><div>${ICONS.heart}</div><div>${ICONS.chat}</div><div>${ICONS.send}</div></div>
        <div><div class="cap"><b>${esc(this.handle)}</b>${esc(it.caption)}</div><div class="bar"><i></i></div></div>
      </div>`;
    c.addEventListener('click', () => this.onSelect(this.cards.indexOf(c)));

    const v = c.querySelector('video'), bar = c.querySelector('.bar i');
    if (it.src) {
      v.src = it.src;
      if (it.poster) v.poster = it.poster;
      c.classList.add('has-video');
    }
    v.addEventListener('timeupdate', () => { if (v.duration) bar.style.width = (v.currentTime / v.duration * 100) + '%'; });
    v.addEventListener('loadedmetadata', () => {
      // Orientation comes from the file itself; content.json "format" is only the fallback.
      const long = v.videoWidth > v.videoHeight;
      if ((it.format === 'long') !== long) { it.format = long ? 'long' : 'short'; this.onMeta(); }
    });
    this.float.appendChild(c);
    return c;
  }

  layout(g, cur) {
    const it = this.items[cur], isLong = it.format === 'long';
    const B = Math.max(7, g.pw * 0.034); // bezel thickness, including the metal rim
    let phW = isLong ? g.ph : g.pw, phH = isLong ? g.pw : g.ph;
    if (isLong && phW > g.w * 0.9) { const k = g.w * 0.9 / phW; phW *= k; phH *= k; }
    const rad = Math.min(phW, phH) * 0.15;

    for (const el of [this.phone, this.bezel]) {
      el.style.width = phW + 'px'; el.style.height = phH + 'px'; el.style.borderRadius = rad + 'px';
      el.classList.toggle('landscape', isLong);
      el.style.setProperty('--rim', Math.max(2, g.pw * 0.01) + 'px');
      el.style.setProperty('--iw', g.pw * 0.26 + 'px');
      el.style.setProperty('--ih', g.pw * 0.075 + 'px');
      el.style.setProperty('--it', B + g.pw * 0.02 + 'px');
    }
    // keep the phone's bottom edge hovering just above the plinth
    this.tilt.style.left = g.plinthX + 'px';
    this.tilt.style.top = (g.plinthY - g.ph * 0.07 - phH / 2) + 'px';
    this.shadow.style.left = g.plinthX + 'px';
    this.shadow.style.top = g.plinthY + 'px';
    this.shadow.style.width = phW * (isLong ? 1.05 : 1.35) + 'px';
    this.shadow.style.height = g.plinthW * 0.06 + 'px';

    const scrW = phW - 2 * B, scrH = phH - 2 * B, portW = g.pw - 2 * B, portH = g.ph - 2 * B, n = this.cards.length;
    this.cards.forEach((c, k) => {
      let d = k - cur; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
      const st = c.style, long = this.items[k].format === 'long';
      c.classList.toggle('landscape-card', long);
      if (d === 0) {
        c.classList.add('active');
        st.width = scrW + 'px'; st.height = scrH + 'px'; st.borderRadius = (rad - B) + 'px';
        st.transform = 'translate(-50%,-50%) translate(0px,0px) perspective(900px) rotateY(0deg) scale(1)';
        st.opacity = 1; st.zIndex = 4; st.filter = 'none';
        return;
      }
      c.classList.remove('active');
      const a = Math.min(Math.abs(d), 3), sg = Math.sign(d), s = SCALE[a];
      const bw = long ? portW * 1.45 : portW, bh = long ? bw * 9 / 16 : portH;
      st.width = bw + 'px'; st.height = bh + 'px'; st.borderRadius = '20px';
      const x = sg * (phW / 2 + portW * (0.16 + 0.6 * (a - 1)) + bw * s * 0.36), y = -a * a * 12;
      st.transform = `translate(-50%,-50%) translate(${x}px,${y}px) perspective(900px) rotateY(${sg * ROT[a]}deg) scale(${s})`;
      st.opacity = OPACITY[a]; st.zIndex = 3 - a; st.filter = a >= 2 ? 'blur(1.2px) saturate(.8)' : 'none';
    });
  }

  // Only the active clip plays; neighbours preload so the swap is instant.
  play(cur, soundOn) {
    const n = this.cards.length;
    this.cards.forEach((c, k) => {
      const v = c.querySelector('video');
      if (!v.getAttribute('src')) return;
      const d = Math.min(Math.abs(k - cur), n - Math.abs(k - cur));
      if (d <= 1 && v.preload !== 'auto') v.preload = 'auto';
      if (k === cur) { v.muted = !soundOn; v.play().catch(() => {}); }
      else v.pause();
    });
  }
}
