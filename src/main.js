import './styles.css';
import content from './content.json';
import { geom } from './scene.js';
import { Carousel } from './carousel.js';
import { bindInput } from './input.js';
import { startDust } from './dust.js';

const $ = id => document.getElementById(id);
const stage = $('stage');
const items = content.items;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');

let cur = 0, soundOn = false, G = null, inAbout = false;

const carousel = new Carousel(
  { float: $('float'), tilt: $('tilt'), phone: $('phone'), bezel: $('bezel'), shadow: $('pshadow') },
  items,
  { onSelect: k => { if (k !== cur) go(k); }, onMeta: () => { layout(); render(); } }
);

function layout() { if (G) carousel.layout(G, cur); }
function resize() {
  G = geom(stage);
  for (const k of ['iw', 'ih', 'ox', 'oy', 'shift']) stage.style.setProperty('--' + k, G[k] + 'px');
  layout();
}
const playCurrent = () => carousel.play(cur, soundOn && !inAbout);

// The camera moves along the panorama in CSS; #about selects which spot it rests on.
function setView() {
  inAbout = location.hash === '#about';
  $('app').classList.toggle('about', inAbout);
  $('about-area').inert = !inAbout;
  playCurrent();
}

function render() {
  const it = items[cur];
  $('caption').innerHTML =
    `<span class="c-brand">${it.brand}</span><span class="c-title">${it.title}</span>` +
    `<span class="c-meta">${[it.platform, it.role, it.views && `${it.views} views`].filter(Boolean).join(' · ')}</span>`;
  const w = $('word'), word = it.format === 'long' ? 'long form' : it.platform.toLowerCase();
  if (w.textContent !== word) {
    w.classList.add('out');
    setTimeout(() => { w.textContent = word; w.classList.remove('out'); }, 260);
  }
  $('nums').querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', k === cur));
}

function go(n) {
  cur = (n + items.length) % items.length;
  layout(); render(); playCurrent();
}

$('nums').innerHTML = items.map((it, k) =>
  `<li><button type="button" data-k="${k}" aria-label="${it.title}">${pad(k + 1)}</button></li>`).join('');
$('nums').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(+b.dataset.k); });

$('sound').addEventListener('click', () => {
  soundOn = !soundOn;
  $('sound').setAttribute('aria-pressed', soundOn);
  $('sound').textContent = soundOn ? 'sound on' : 'sound off';
  playCurrent();
});

const step = n => { if (!inAbout) go(cur + n); };
bindInput(stage, $('tilt'), { next: () => step(1), prev: () => step(-1) }, reduceMotion);
startDust($('dust'), stage, reduceMotion);
new ResizeObserver(resize).observe(stage);
addEventListener('hashchange', setView);

resize(); render(); setView();

// the first layout must land in place, not animate in from the cards' unset transforms
void stage.offsetWidth;
stage.classList.remove('boot');

// Entrance: hold on the sky until the scene has loaded (never past 2.5s), then tilt down to the plinth.
const root = document.documentElement;
if (root.classList.contains('intro')) {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const loaded = document.querySelector('.ground').decode().catch(() => {});
  Promise.race([Promise.all([loaded, wait(800)]), wait(2500)]).then(() => {
    root.classList.replace('intro', 'arriving');
    setTimeout(() => root.classList.remove('arriving'), 2600);
  });
}
