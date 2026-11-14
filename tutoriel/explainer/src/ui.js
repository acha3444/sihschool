/* Composants d'interface Sihscool redessinés (vectoriels, propres) */

const ICON = {
  video: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4"/>',
  play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  mega: '<path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1z" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
};
const ic = (name, size = 20, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;

const LOGO = (size = 30) => `<span class="logo" style="font-size:${size}px"><i class="sun"></i>Sihscool</span>`;

// Fond ciel de l'appli (grand, pour supporter les mouvements de caméra)
const SKY = `<div class="sky"></div>`;

// Fenêtre de l'appli côté enseignante
function appWin(tab, content, opt = {}) {
  const tabs = [['book', 'Devoirs'], ['users', 'Élèves & comptes'], ['layers', 'Groupes & Zoom'], ['mega', 'Annonces']]
    .map(([i, n]) => `<div class="tab ${n === tab ? 'on' : ''}">${ic(i, 18)}${n}</div>`).join('');
  return `<div class="app" data-k="app" style="left:${opt.x ?? 240}px;top:${opt.y ?? 110}px;width:${opt.w ?? 1440}px;height:${opt.h ?? 860}px">
    <div class="app-head">${LOGO(28)}<span class="badge">${ic('book', 14)}Enseignante</span><span class="grow"></span>
      <span class="who">Siham</span><span class="pillw">${ic('key', 15)}Mot de passe</span><span class="pillw">Déconnexion</span></div>
    <div class="app-hello"><div class="h1">Bonjour Siham</div></div>
    <div class="tabs">${tabs}</div>
    <div class="app-body">${content}</div>
  </div>`;
}

// Champ de formulaire
const field = (k, ph, opt = {}) => `<div class="field ${opt.cls || ''}" data-k="${k}" style="${opt.style || ''}">${opt.icon ? ic(opt.icon, 18, 'fi') : ''}<span class="val" data-k="${k}V"></span><span class="caret" data-k="${k}C"></span><span class="ph" data-k="${k}P">${ph}</span></div>`;
const label = txt => `<div class="lbl">${txt}</div>`;

/* Met à jour un champ : texte tapé, curseur clignotant, placeholder, focus */
function setField(L, k, txt, t, focus, opt = {}) {
  const v = L.k[k + 'V'], c = L.k[k + 'C'], p = L.k[k + 'P'], f = L.k[k];
  const shown = opt.password ? '•'.repeat(txt.length) : txt;
  if (v.textContent !== shown) v.textContent = shown;
  v.classList.toggle('dots', !!opt.password);
  p.style.display = txt.length ? 'none' : 'inline';
  c.style.display = focus && caretOn(t, opt.since ?? 0) ? 'inline-block' : 'none';
  f.classList.toggle('on', !!focus);
}

// Position d'un élément dans l'espace « monde » (indépendante des transformations)
function P(L, k) {
  let el = L.k[k], x = 0, y = 0;
  const w = el.offsetWidth, h = el.offsetHeight;
  while (el && el !== L.cam) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

// Barres d'onde sonore
const waveBars = (k, n = 32) => `<div class="wave" data-k="${k}">${Array.from({ length: n }, () => '<i></i>').join('')}</div>`;
function setWave(L, k, t, mode, progress = 0) {
  const bars = L.k[k].children;
  for (let i = 0; i < bars.length; i++) {
    let h;
    if (mode === 'live') h = 0.25 + 0.75 * Math.abs(Math.sin(t * 9 + i * 0.7) * Math.sin(t * 4.3 + i * 1.9));
    else h = 0.3 + 0.7 * Math.abs(Math.sin(i * 1.37) * Math.cos(i * 0.61));
    bars[i].style.height = `${Math.round(h * 100)}%`;
    bars[i].classList.toggle('done', mode !== 'live' && i / bars.length < progress);
  }
}

// Téléphone (côté parents)
function phone(screen, opt = {}) {
  return `<div class="phone" data-k="phone" style="left:${opt.x ?? 740}px;top:${opt.y ?? 90}px">
    <div class="screen" data-k="screen"><div class="status"><span>9:41</span><span class="isl"></span><span class="bat"></span></div>${screen}</div></div>`;
}
