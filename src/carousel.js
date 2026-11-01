const YT_ORIGIN = 'https://www.youtube-nocookie.com';
const YT_CONTROLS_MS = 4000; // how long YouTube keeps its controls up after playback starts
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Side-card look by distance from the active card: scale, Y-rotation (deg), opacity
const SCALE = [1, 0.6, 0.44, 0.32];
const ROT = [0, 26, 36, 44];
const OPACITY = [1, 0.95, 0.6, 0];

export class Carousel {
  constructor(refs, items, { onSelect, onMeta }) {
    Object.assign(this, refs);
    this.items = items;
    this.onSelect = onSelect;
    this.onMeta = onMeta;
    this.cards = items.map(it => this.makeCard(it));
    // Reveal a YouTube player only once it has played long enough for its controls to fade,
    // and hide it again on pause or end, so none of YouTube's own UI ever shows.
    window.addEventListener('message', e => {
      if (e.origin !== YT_ORIGIN) return;
      let state;
      try { state = JSON.parse(e.data)?.info?.playerState; } catch { return; }
      if (state == null) return;
      const c = this.cards.find(c => c.querySelector('iframe')?.contentWindow === e.source);
      if (!c) return;
      if (state !== 1 && state !== 3) this.hideYouTube(c);
      else if (!c.ytReveal && !c.classList.contains('yt-playing')) {
        c.ytReveal = setTimeout(() => { c.classList.add('yt-playing'); c.ytReveal = null; }, YT_CONTROLS_MS);
      }
    });
  }

  hideYouTube(c) {
    clearTimeout(c.ytReveal); c.ytReveal = null;
    c.classList.remove('yt-playing');
  }

  makeCard(it) {
    const c = document.createElement('div');
    c.className = 'card';
    const [c1, c2, c3] = it.palette || ['#E9806A', '#9C86C9', '#FFE6B8'];
    c.style.setProperty('--c1', c1); c.style.setProperty('--c2', c2); c.style.setProperty('--c3', c3);
    c.innerHTML = `
      <div class="scene"><span class="blob b1"></span><span class="blob b2"></span></div>
      <video playsinline loop muted preload="none"></video>
      <div class="ui"><div class="hook">${(it.hook || []).map(h => `<span>${esc(h)}</span>`).join('')}</div></div>`;
    c.addEventListener('click', () => this.onSelect(this.cards.indexOf(c)));

    const v = c.querySelector('video');
    if (it.src) {
      v.src = it.src;
      if (it.poster) v.poster = it.poster;
      c.classList.add('has-video');
    } else if (it.youtube) {
      c.classList.add('has-yt');
      c.style.setProperty('--thumb', `url(https://i.ytimg.com/vi/${encodeURIComponent(it.youtube)}/hqdefault.jpg)`);
    }
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
    let phW = isLong ? g.ph : g.pw, phH = isLong ? g.pw : g.ph;
    if (isLong && phW > g.w * 0.9) { const k = g.w * 0.9 / phW; phW *= k; phH *= k; }
    const U = Math.max(phW, phH) / 80, B = U * 1.25, rad = U * 6.666; // 1em of phone, bezel thickness, corner

    for (const el of [this.phone, this.bezel]) {
      el.style.width = phW + 'px'; el.style.height = phH + 'px'; el.style.borderRadius = rad + 'px';
      el.classList.toggle('landscape', isLong);
      el.style.fontSize = U + 'px';
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
      const d = Math.min(Math.abs(k - cur), n - Math.abs(k - cur));
      if (this.items[k].youtube && !this.items[k].src) return this.playYouTube(c, this.items[k], d, k === cur, soundOn);
      if (!v.getAttribute('src')) return;
      if (d <= 1 && v.preload !== 'auto') v.preload = 'auto';
      if (k === cur) { v.muted = !soundOn; v.play().catch(() => {}); }
      else v.pause();
    });
  }

  // YouTube clips: players exist only near the active card; further ones show the thumbnail.
  playYouTube(c, it, d, active, soundOn) {
    let f = c.querySelector('iframe');
    if (d > 1) { f?.remove(); this.hideYouTube(c); return; }
    const send = () => {
      if (!f.isConnected) return;
      f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: it.id }), YT_ORIGIN);
      const cmd = (func) => f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), YT_ORIGIN);
      cmd(c.ytSound ? 'unMute' : 'mute');
      cmd(c.ytActive ? 'playVideo' : 'pauseVideo');
    };
    c.ytActive = active; c.ytSound = soundOn;
    if (f) { send(); return; }

    const id = encodeURIComponent(it.youtube);
    f = document.createElement('iframe');
    f.src = `${YT_ORIGIN}/embed/${id}?enablejsapi=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0&origin=${encodeURIComponent(location.origin)}`;
    f.title = it.title;
    f.allow = 'autoplay; encrypted-media';
    f.tabIndex = -1;
    // the player ignores commands sent before it has finished booting
    f.addEventListener('load', () => [0, 600, 1500].forEach(ms => setTimeout(send, ms)));
    c.insertBefore(f, c.querySelector('.ui'));
  }
}
