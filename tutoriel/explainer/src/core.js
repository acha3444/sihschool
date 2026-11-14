/* ============================================================================
   Sihscool explainer — moteur commun (caméra, curseur, frappe, calques, son)
   seek(t) est une fonction pure du temps : aucune animation CSS, aucun timer.
   ============================================================================ */

// ── Aides mathématiques ──────────────────────────────────────────────────────
function spring(t, w = 14, z = 0.82) {
  if (t <= 0) return 0;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => (x = clamp(x), x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => (x = clamp(x), 1 - Math.pow(1 - x, 3));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const kf = keys => t => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [a, va] = keys[i - 1], [b, vb, e = ease] = keys[i]; if (t <= b) return lerp(va, vb, e((t - a) / (b - a))); } return keys[keys.length - 1][1]; };
const rng = s => () => (s = (s + 0x6D2B79F5) | 0, s = Math.imul(s ^ (s >>> 15), 1 | s), s ^= s + Math.imul(s ^ (s >>> 7), 61 | s), ((s ^ (s >>> 14)) >>> 0) / 4294967296);
const pop = (t, t0) => spring(t - t0, 16, 0.9);       // apparition douce (sans rebond visible)

const W = 1920, H = 1080;
const SFX = [];                       // [type, time, opts]
const sfx = (type, time, opts = {}) => SFX.push([type, time, opts]);

// ── Calques et caméra ────────────────────────────────────────────────────────
const LAYERS = [];
let stageEl, layersEl;

function layer(a, b, html, fn, opt = {}) {
  const el = document.createElement('div');
  el.className = 'layer';
  el.innerHTML = `<div class="cam">${html}</div>`;
  layersEl.appendChild(el);
  const L = { a, b, el, cam: el.firstChild, fn, fi: opt.fadeIn ?? 0.4, fo: opt.fadeOut ?? 0.4, k: {} };
  el.querySelectorAll('[data-k]').forEach(n => (L.k[n.dataset.k] = n));
  LAYERS.push(L);
  if (opt.whoosh !== false && a > 0.2) sfx('whoosh', a - 0.05);
  return L;
}
function setCam(L, cx, cy, s) {
  L.cam.style.transform = `translate(${W / 2}px,${H / 2}px) scale(${s}) translate(${-cx}px,${-cy}px)`;
}
const show = (el, o) => { el.style.opacity = o; el.style.visibility = o <= 0.001 ? 'hidden' : 'visible'; };
const tr = (el, x = 0, y = 0, s = 1) => { el.style.transform = `translate(${x}px,${y}px) scale(${s})`; };

// ── Frappe au clavier ────────────────────────────────────────────────────────
function typed(full, t, t0, cps = 24, ticks = true, L) {
  const n = clamp(Math.floor((t - t0) * cps), 0, full.length);
  return full.slice(0, n);
}
function typeTicks(time0, text, cps = 24) {      // petits bruits de touche
  for (let i = 0; i < text.length; i += 2) sfx('tick', time0 + i / cps, { v: 0.5 + ((i * 7) % 5) / 10 });
}
const caretOn = (t, t0) => t >= t0 && Math.floor((t - t0) * 2.2) % 2 === 0;

// ── Curseur (flèche macOS) ───────────────────────────────────────────────────
const CURSOR_SVG = `<svg viewBox="0 0 28 28" width="34" height="34"><path d="M5 3 L5 23 L10.2 18.3 L13.6 26 L17 24.5 L13.7 17 L20.6 17 Z" fill="#111" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
function cursorHTML() { return `<div class="ripple" data-k="ripple"></div><div class="cursor" data-k="cursor">${CURSOR_SVG}</div>`; }
/* keys : [[temps, x, y], ...] ; clicks : [temps, ...] (temps locaux du calque) */
function drawCursor(L, t, keys, clicks = [], scaleFix = 1) {
  const c = L.k.cursor, r = L.k.ripple;
  let x = keys[0][1], y = keys[0][2];
  for (let i = 1; i < keys.length; i++) {
    const [a, xa, ya] = keys[i - 1], [b, xb, yb] = keys[i];
    if (t >= a) {
      const k = ease(seg(t, a, b));
      const d = Math.hypot(xb - xa, yb - ya);
      x = lerp(xa, xb, k);
      y = lerp(ya, yb, k) - Math.sin(Math.PI * k) * Math.min(60, d * 0.12);   // trajectoire en courbe douce
    }
  }
  let press = 1, rip = -1, rx = x, ry = y;
  for (const ct of clicks) {
    const d = t - ct;
    if (d > -0.1 && d < 0.18) press = Math.min(press, 1 - 0.16 * Math.sin(Math.PI * clamp((d + 0.1) / 0.28)));
    if (d >= 0 && d < 0.55) { rip = d / 0.55; rx = x; ry = y; }
  }
  const vis = clamp(seg(t, keys[0][0] - 0.3, keys[0][0]));
  c.style.opacity = vis;
  c.style.transform = `translate(${x - 6}px,${y - 4}px) scale(${press / scaleFix})`;
  if (rip >= 0) {
    r.style.opacity = (1 - rip) * 0.55;
    r.style.transform = `translate(${rx}px,${ry}px) scale(${(0.3 + rip * 1.2) / scaleFix})`;
  } else r.style.opacity = 0;
}
function clickSfx(L, clicks) { clicks.forEach(c => sfx('click', L.a + c)); }

// ── Phrase-titre : poussée de caméra + surlignage ────────────────────────────
/* parts : [['texte normal ', false], ['mot clé', true], ...] */
function titleScene(a, b, parts, opt = {}) {
  const words = [];
  let html = '';
  parts.forEach(([txt, hl], pi) => {
    const ws = txt.split(/(\s+)/).filter(s => s.length);
    const inner = ws.map(w => (/^\s+$/.test(w) ? w : `<span class="w" data-w="${words.push(w) - 1}">${w}</span>`)).join('');
    html += hl ? `<span class="hl" data-k="hl${pi}">${inner}</span>` : inner;
  });
  const pill = opt.pill ? `<div class="chap" data-k="pill">${opt.pill}</div>` : '';
  const L = layer(a, b, `<div class="title-wrap" data-k="wrap">${pill}<div class="title" data-k="title">${html}</div></div>`, (t, el) => {
    if (!L.target) { const w = L.k.title.offsetWidth; L.target = clamp(1380 / w, 1.5, 3.2); }
    const s = kf([[0, 1], [0.25, 1], [1.5, L.target], [b - a, L.target * 1.04, x => x]])(t);
    setCam(L, 960, 540, s);
    el.querySelectorAll('.w').forEach(n => {
      const i = +n.dataset.w, k = easeOut(seg(t, 0.12 + i * 0.09, 0.42 + i * 0.09));
      n.style.opacity = k; n.style.transform = `translateY(${(1 - k) * 14}px)`;
    });
    if (L.k.pill) { const k = easeOut(seg(t, 0, 0.35)); show(L.k.pill, k); }
    parts.forEach(([, hl], pi) => { if (hl) L.k['hl' + pi].style.backgroundSize = `${ease(seg(t, 1.25, 1.85)) * 100}% 100%`; });
  }, opt);
  return L;
}

// ── Fond de marque : bandes de soie (dessiné une fois) ───────────────────────
let BRAND_IMG = null;
function makeBrandCanvas() {
  const c = document.createElement('canvas'); c.width = 2600; c.height = 1600;
  const g = c.getContext('2d');
  const base = g.createLinearGradient(0, 0, 2600, 1600);
  base.addColorStop(0, '#FFFFFF'); base.addColorStop(0.45, '#DCEEFB'); base.addColorStop(1, '#A9D8F5');
  g.fillStyle = base; g.fillRect(0, 0, 2600, 1600);
  const R = rng(7);
  g.filter = 'blur(46px)';
  for (let i = 0; i < 9; i++) {
    g.save();
    g.translate(200 + i * 300, 800); g.rotate(-0.62);
    const band = g.createLinearGradient(-160, 0, 160, 0);
    const col = i % 3 === 1 ? '255,225,92' : i % 3 === 2 ? '205,189,242' : '255,255,255';
    const al = i % 3 === 1 ? 0.32 : 0.55;
    band.addColorStop(0, `rgba(${col},0)`); band.addColorStop(0.5, `rgba(${col},${al})`); band.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = band; g.fillRect(-160 - R() * 40, -1400, 320 + R() * 120, 2800);
    g.restore();
  }
  const sun = g.createRadialGradient(2050, 330, 0, 2050, 330, 520);
  sun.addColorStop(0, 'rgba(255,225,92,0.75)'); sun.addColorStop(1, 'rgba(255,225,92,0)');
  g.filter = 'none'; g.fillStyle = sun; g.fillRect(0, 0, 2600, 1600);
  return c.toDataURL('image/jpeg', 0.92);
}
function brandScene(a, b, inner, fn, opt = {}) {
  const L = layer(a, b, `<div class="brand-bg"><img data-k="silk" src="${BRAND_IMG}"></div>${inner}`, (t, el, T) => {
    const k = ease(seg(t, 0, 0.9));
    L.k.silk.parentNode.style.clipPath = opt.sweep === false ? 'none' : `inset(0 ${(1 - k) * 100}% 0 0)`;
    L.k.silk.style.transform = `translate(${-340 + Math.sin(T * 0.18) * 110}px, ${-250 + Math.cos(T * 0.15) * 55}px)`;
    setCam(L, 960, 540, 1);
    fn && fn(t, el, T);
  }, opt);
  return L;
}

// ── Lecture de la page ───────────────────────────────────────────────────────
function seek(t) {
  t = clamp(t, 0, VIDEO.duration);
  for (const L of LAYERS) {
    const vis = t >= L.a && t <= L.b;
    if (!vis) { if (L.el.style.display !== 'none') L.el.style.display = 'none'; continue; }
    L.el.style.display = 'block';
    const o = Math.min(L.fi ? seg(t, L.a, L.a + L.fi) : 1, L.fo ? 1 - seg(t, L.b - L.fo, L.b) : 1);
    L.el.style.opacity = o;
    const bl = (1 - o) * 12;
    L.el.style.filter = bl > 0.4 ? `blur(${bl.toFixed(1)}px)` : 'none';
    L.fn(t - L.a, L.el, t);
  }
}
window.seek = seek;

// ── Son : voix ElevenLabs + musique synthétisée + bruitages ─────────────────
const b64ToBuf = b64 => { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; };

window.buildAudio = async function (ctx) {
  const dur = VIDEO.duration, sr = ctx.sampleRate;
  const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const music = ctx.createGain(); music.connect(master);
  const fx = ctx.createGain(); fx.gain.value = 0.55; fx.connect(master);

  // Voix
  const voiceBus = ctx.createGain(); voiceBus.gain.value = 1.0; voiceBus.connect(master);
  const spans = [];
  for (const v of VOIX) {
    const buf = await ctx.decodeAudioData(b64ToBuf(v.b64));
    const s = ctx.createBufferSource(); s.buffer = buf; s.connect(voiceBus); s.start(v.t);
    spans.push([v.t, v.t + buf.duration]);
  }

  // Musique : niveau baissé pendant la voix (ducking)
  const g = music.gain; g.setValueAtTime(0.0, 0); g.linearRampToValueAtTime(0.5, 1.2);
  for (const [a, b] of spans) { g.setTargetAtTime(0.2, a - 0.25, 0.12); g.setTargetAtTime(0.42, b + 0.15, 0.4); }
  g.setTargetAtTime(0.0, dur - 1.6, 0.5);

  const noise = (() => { const b = ctx.createBuffer(1, sr * 2, sr), d = b.getChannelData(0), R = rng(99); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; return b; })();
  const BPM = 100, beat = 60 / BPM, bar = beat * 4;
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  // D – A – Bm – G  (doux, lumineux)
  const prog = [[50, 57, 62, 66, 69], [45, 57, 61, 64, 69], [47, 54, 59, 62, 66], [43, 55, 59, 62, 67]];
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(music);
  const nBars = Math.ceil(dur / bar);
  for (let i = 0; i < nBars; i++) {
    const t0 = i * bar, ch = prog[i % 4];
    // nappe
    ch.forEach((m, j) => {
      for (const det of [-6, 6]) {
        const o = ctx.createOscillator(); o.type = j === 0 ? 'sine' : 'triangle'; o.frequency.value = midi(m); o.detune.value = det;
        const e = ctx.createGain(); const lvl = j === 0 ? 0.05 : 0.018;
        e.gain.setValueAtTime(0, t0); e.gain.linearRampToValueAtTime(lvl, t0 + 0.6); e.gain.setValueAtTime(lvl, t0 + bar - 0.5); e.gain.linearRampToValueAtTime(0, t0 + bar + 0.3);
        o.connect(e); e.connect(lp); o.start(t0); o.stop(t0 + bar + 0.4);
      }
    });
    // arpège en croches (piano doux)
    for (let s = 0; s < 8; s++) {
      const tn = t0 + s * beat / 2, m = ch[1 + ((s * 3) % 4)] + 12;
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = midi(m);
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = midi(m) * 2;
      const e = ctx.createGain(); e.gain.setValueAtTime(0, tn); e.gain.linearRampToValueAtTime(0.035, tn + 0.008); e.gain.exponentialRampToValueAtTime(0.0008, tn + 0.9);
      const e2 = ctx.createGain(); e2.gain.value = 0.18;
      o.connect(e); o2.connect(e2); e2.connect(e); e.connect(music); o.start(tn); o2.start(tn); o.stop(tn + 1); o2.stop(tn + 1);
    }
    // percussions légères après l'ouverture
    if (t0 > 5 && t0 < dur - 4) {
      for (const bt of [0, 2]) {
        const tk = t0 + bt * beat, o = ctx.createOscillator(), e = ctx.createGain();
        o.frequency.setValueAtTime(110, tk); o.frequency.exponentialRampToValueAtTime(45, tk + 0.18);
        e.gain.setValueAtTime(0.16, tk); e.gain.exponentialRampToValueAtTime(0.001, tk + 0.25);
        o.connect(e); e.connect(music); o.start(tk); o.stop(tk + 0.3);
      }
      for (let s = 0; s < 4; s++) {
        const th = t0 + (s + 0.5) * beat, n = ctx.createBufferSource(); n.buffer = noise;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
        const e = ctx.createGain(); e.gain.setValueAtTime(0.022, th); e.gain.exponentialRampToValueAtTime(0.0005, th + 0.07);
        n.connect(hp); hp.connect(e); e.connect(music); n.start(th, (s * 0.37) % 1.5); n.stop(th + 0.08);
      }
    }
  }

  // Bruitages
  for (const [type, t, o] of SFX) {
    if (t < 0 || t > dur) continue;
    if (type === 'click') {
      const n = ctx.createBufferSource(); n.buffer = noise; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 1.2;
      const e = ctx.createGain(); e.gain.setValueAtTime(0.5, t); e.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      n.connect(bp); bp.connect(e); e.connect(fx); n.start(t, 0.3); n.stop(t + 0.05);
      const o2 = ctx.createOscillator(), e2 = ctx.createGain(); o2.frequency.value = 1800;
      e2.gain.setValueAtTime(0.06, t); e2.gain.exponentialRampToValueAtTime(0.001, t + 0.05); o2.connect(e2); e2.connect(fx); o2.start(t); o2.stop(t + 0.06);
    } else if (type === 'tick') {
      const n = ctx.createBufferSource(); n.buffer = noise; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 4200 + (o.v || 0.5) * 1500; bp.Q.value = 2;
      const e = ctx.createGain(); e.gain.setValueAtTime(0.12 * (o.v || 0.6), t); e.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      n.connect(bp); bp.connect(e); e.connect(fx); n.start(t, (t * 0.31) % 1.8); n.stop(t + 0.035);
    } else if (type === 'whoosh') {
      const n = ctx.createBufferSource(); n.buffer = noise; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8;
      bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(2600, t + 0.35);
      const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(0.09, t + 0.18); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      n.connect(bp); bp.connect(e); e.connect(fx); n.start(t, 0.5); n.stop(t + 0.55);
    } else if (type === 'pop' || type === 'done') {
      const f = type === 'done' ? [1318, 1760] : [880];
      f.forEach((fr, i) => { const o2 = ctx.createOscillator(), e = ctx.createGain(); o2.type = 'sine'; o2.frequency.value = fr; const ti = t + i * 0.09;
        e.gain.setValueAtTime(0, ti); e.gain.linearRampToValueAtTime(0.07, ti + 0.01); e.gain.exponentialRampToValueAtTime(0.0005, ti + 0.5); o2.connect(e); e.connect(fx); o2.start(ti); o2.stop(ti + 0.55); });
    } else if (type === 'chime') {
      [1174.7, 1568, 2349.3].forEach((fr, i) => { const o2 = ctx.createOscillator(), e = ctx.createGain(); o2.type = 'sine'; o2.frequency.value = fr; const ti = t + i * 0.12;
        e.gain.setValueAtTime(0, ti); e.gain.linearRampToValueAtTime(0.08, ti + 0.01); e.gain.exponentialRampToValueAtTime(0.0005, ti + 2.2); o2.connect(e); e.connect(fx); o2.start(ti); o2.stop(ti + 2.3); });
    }
  }
};

// ── Démarrage, aperçu, lecture ───────────────────────────────────────────────
function boot(build) {
  stageEl = document.getElementById('stage'); layersEl = document.getElementById('layers');
  BRAND_IMG = makeBrandCanvas();
  build();
  const render = location.search.includes('render');
  if (!render) {
    const fit = () => { const s = Math.min(innerWidth / W, (innerHeight - 70) / H); stageEl.style.transform = `scale(${s})`; };
    addEventListener('resize', fit); fit();
    document.getElementById('ctrl').style.display = 'flex';
    const sc = document.getElementById('scrub'); sc.max = VIDEO.duration; sc.step = 0.01;
    let buf, ac, src, startAt = 0, offset = 0, playing = false;
    async function play() {
      ac ??= new AudioContext();
      if (!buf) { const off = new OfflineAudioContext(2, Math.ceil(48000 * VIDEO.duration), 48000); await buildAudio(off); buf = await off.startRendering(); }
      src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination);
      src.start(0, offset % VIDEO.duration); startAt = ac.currentTime; playing = true;
    }
    function pause() { if (!playing) return; offset += ac.currentTime - startAt; src.stop(); playing = false; }
    const now = () => (playing ? (offset + ac.currentTime - startAt) % VIDEO.duration : offset);
    document.getElementById('play').onclick = () => (playing ? pause() : play());
    sc.oninput = () => { const was = playing; pause(); offset = +sc.value; if (was) play(); };
    (function loop() { const t = now(); seek(t); sc.value = t; document.getElementById('time').textContent = t.toFixed(2) + ' s'; requestAnimationFrame(loop); })();
  } else seek(0);
}
