/* ============================================================================
   VIDÉO 1 — ESPACE ENSEIGNANTE (≈ 69 s, 1920×1080)
   Feuille de temps (voix ElevenLabs « Alice ») :
    0.0  « Espace enseignante » apparaît, puis bandeau de marque      whoosh
    1.0  VOIX e1 Bienvenue…
    6.3  Phrase « Tout votre enseignement. Simplement. »             surlignage
   10.6  VOIX e2 Connexion   — 12.2 carte de connexion, frappe e-mail, mot de passe, 1re connexion
   19.6  VOIX e3 Groupe      — 21.1 fenêtre groupe, nom, jour, horaire, lien Zoom, carte créée
   28.6  VOIX e4 Lien        — 30.2 lien d'inscription, envoi WhatsApp, 3 élèves arrivent
   38.2  VOIX e5 Devoir      — 39.6 devoir, consigne, vocal enregistré, envoyé
   47.0  VOIX e6 Correction  — 48.6 écoute de la récitation, Valider, commentaire
   54.8  VOIX e7 Annonces / mot de passe — annonce publiée, nouveau mot de passe
   62.2  VOIX e8 « Sih School. Vos cours d'arabe, simplement. »  — 66.0 carte de fin  chime
   ============================================================================ */
const VIDEO = { w: 1920, h: 1080, duration: 69 };
window.VIDEO = VIDEO;

function build() {
  // ── 0. Ouverture ───────────────────────────────────────────────────────────
  const L0 = layer(0, 2.5, `<div class="center"><div class="word" data-k="w">Espace enseignante</div></div>`, (t) => {
    const k = easeOut(seg(t, 0.25, 1.0));
    L0.k.w.style.opacity = k; L0.k.w.style.transform = `translateY(${(1 - k) * 12}px) scale(${0.96 + k * 0.04})`;
    setCam(L0, 960, 540, 1 + t * 0.02);
  }, { fadeIn: 0, whoosh: false });

  brandScene(2.2, 6.6, `<div class="center"><div data-k="name">${LOGO(150)}</div><div class="chip y" data-k="sub" style="font-size:22px;padding:8px 22px">Espace enseignante</div></div>`, (t) => {
    const L = LAYERS[LAYERS.length - 1];
  });
  const LB = LAYERS[LAYERS.length - 1];
  const fnB = LB.fn;
  LB.fn = (t, el, T) => {
    fnB(t, el, T);
    const k = pop(t, 0.5), k2 = pop(t, 1.0);
    LB.k.name.style.opacity = clamp(k); LB.k.name.style.transform = `scale(${0.9 + 0.1 * k})`;
    LB.k.sub.style.opacity = clamp(k2); LB.k.sub.style.transform = `translateY(${(1 - k2) * 16}px)`;
  };

  titleScene(6.4, 10.6, [['Tout votre enseignement. ', false], ['Simplement.', true]]);

  // ── 1. Connexion ───────────────────────────────────────────────────────────
  titleScene(10.4, 12.6, [['Connectez-vous ', false], ['en un instant.', true]], { pill: 'Étape 1 · Connexion' });
  const EMAIL = 'enseignante@exemple.com';
  const L1 = layer(12.4, 19.7, `${SKY}
    <div class="card" data-k="card" style="left:670px;top:200px;width:580px;height:610px">
      <div data-k="pA" style="position:absolute;inset:0;padding:44px 46px">
        <div style="text-align:center;font-size:34px;font-weight:800">Bienvenue sur Sihscool</div>
        <div class="muted" style="text-align:center;margin:6px 0 18px">Espace de suivi pour l'apprentissage de l'arabe</div>
        ${label('Adresse e-mail *')}${field('email', 'nom@exemple.com', { icon: 'mail' })}
        ${label('Mot de passe *')}${field('pwd', '••••••••', { icon: 'lock' })}
        <div class="btn" data-k="go" style="margin-top:30px">Accéder à mon espace →</div>
      </div>
      <div data-k="pB" style="position:absolute;inset:0;padding:40px 46px;text-align:center">
        <div style="width:78px;height:78px;border-radius:24px;background:#FFE15C;margin:0 auto 14px;display:flex;align-items:center;justify-content:center">${ic('key', 38)}</div>
        <div style="font-size:32px;font-weight:800">Première connexion</div>
        <div class="muted" style="margin:6px 0 10px">Choisissez votre mot de passe personnel.</div>
        <div style="text-align:left">${label('Nouveau mot de passe')}${field('n1', '••••••••', { icon: 'lock' })}${label('Confirmez')}${field('n2', '••••••••', { icon: 'lock' })}</div>
        <div class="btn" data-k="save" style="margin-top:28px">Enregistrer mon mot de passe</div>
      </div>
      <div data-k="ok" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#FFF6E3;border-radius:24px">
        <div class="okbig">${ic('check', 48)}</div><div style="font-size:30px;font-weight:800">Mot de passe enregistré !</div><div class="muted">Bienvenue dans votre espace.</div>
      </div>
    </div>${cursorHTML()}`, (t) => {
    const em = P(L1, 'email'), pw = P(L1, 'pwd'), go = P(L1, 'go'), n1 = P(L1, 'n1'), n2 = P(L1, 'n2'), sv = P(L1, 'save'), card = P(L1, 'card');
    const cx = kf([[0, card.cx], [0.9, card.cx], [1.7, em.cx], [2.5, em.cx], [3.0, pw.cx], [3.6, card.cx], [4.6, card.cx], [5.1, n1.cx], [6.2, card.cx]])(t);
    const cy = kf([[0, card.cy], [0.9, card.cy], [1.7, em.cy], [2.5, em.cy], [3.0, pw.cy], [3.6, card.cy], [4.6, card.cy], [5.1, (n1.cy + n2.cy) / 2], [6.2, card.cy]])(t);
    const s = kf([[0, 1.05], [0.9, 1.1], [1.7, 1.9], [3.0, 1.9], [3.6, 1.15], [4.6, 1.15], [5.1, 1.6], [6.2, 1.15], [7.3, 1.2]])(t);
    setCam(L1, cx, cy, s);
    setField(L1, 'email', typed(EMAIL, t, 1.25, 22), t, t > 1.05 && t < 2.55, { since: 1.05 });
    setField(L1, 'pwd', typed('xxxxxxxxx', t, 2.75, 16), t, t > 2.6 && t < 3.6, { password: true, since: 2.6 });
    setField(L1, 'n1', typed('xxxxxxxxx', t, 4.85, 18), t, t > 4.7 && t < 5.4, { password: true, since: 4.7 });
    setField(L1, 'n2', typed('xxxxxxxxx', t, 5.5, 18), t, t > 5.35 && t < 6.0, { password: true, since: 5.35 });
    const swap = ease(seg(t, 4.0, 4.4)), done = ease(seg(t, 6.55, 6.85));
    show(L1.k.pA, 1 - swap); show(L1.k.pB, swap * (1 - done)); show(L1.k.ok, done);
    L1.k.ok.firstElementChild.style.transform = `scale(${0.6 + 0.4 * pop(t, 6.6)})`;
    L1.k.go.style.transform = `scale(${t > 3.7 && t < 3.95 ? 0.97 : 1})`;
    drawCursor(L1, t, [[0.7, card.x + card.w + 120, card.y + card.h - 40], [1.05, em.x + 60, em.cy], [2.55, em.x + 300, em.cy + 40], [2.6, pw.x + 80, pw.cy],
      [3.75, go.cx, go.cy], [4.7, n1.x + 80, n1.cy], [5.35, n2.x + 80, n2.cy], [6.3, sv.cx, sv.cy], [7.3, sv.cx + 140, sv.cy + 90]], [1.05, 2.62, 3.8, 4.72, 5.37, 6.35], s);
  });
  clickSfx(L1, [1.05, 2.62, 3.8, 4.72, 5.37, 6.35]); typeTicks(12.4 + 1.25, EMAIL, 22); sfx('pop', 12.4 + 4.1); sfx('done', 12.4 + 6.6);

  // ── 2. Groupe + Zoom ───────────────────────────────────────────────────────
  titleScene(19.4, 21.5, [['Créez votre ', false], ['groupe', true], ['.', false]], { pill: 'Étape 2 · Groupes & Zoom' });
  const GNOM = 'Nourania Enfants', GH = '14:00 - 15:00', GZ = 'https://zoom.us/j/1234567890';
  const L2 = layer(21.3, 28.9, `${SKY}${appWin('Groupes & Zoom', `
      <div class="row" style="justify-content:space-between"><div class="ctitle">${ic('layers', 26)}Mes groupes</div><div class="btn sm" data-k="newg">${ic('plus', 18)}Créer un nouveau groupe</div></div>
      <div class="card" data-k="gcard" style="left:32px;top:84px;width:620px;padding:24px 26px;box-sizing:border-box">
        <div class="row"><span class="chip y">NOURANIA</span><span class="chip">0 élève</span></div>
        <div style="font-size:28px;font-weight:800;margin:10px 0 2px">Nourania Enfants</div>
        <div class="muted row" style="gap:8px">${ic('cal', 18)}Mercredi · 14:00 - 15:00</div>
        <div class="zoomrow" style="margin-top:16px"><span class="row" style="gap:8px">${ic('video', 20)}zoom.us/j/1234567890</span><span class="btn sm" style="height:38px">Tester Zoom</span></div>
      </div>`)}
    <div class="veil" data-k="veil"></div>
    <div class="modal" data-k="modal" style="left:610px;top:150px;width:700px">
      <div class="ctitle">${ic('layers', 26)}Créer un nouveau groupe</div>
      ${label('Nom du groupe *')}${field('nom', 'Ex : Nourania Débutants')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div>${label('Jour du cours *')}${field('jour', 'Choisir…', { icon: 'cal' })}</div><div>${label('Horaire *')}${field('heure', 'Ex : 14:00 - 15:00', { icon: 'clock' })}</div></div>
      ${label('Lien de la salle Zoom')}${field('zoom', 'https://zoom.us/j/…', { icon: 'video' })}
      <div class="btn" data-k="create" style="margin-top:26px">Créer la classe</div>
    </div>${cursorHTML()}`, (t) => {
    const mo = P(L2, 'modal'), nb = P(L2, 'newg'), nom = P(L2, 'nom'), jo = P(L2, 'jour'), he = P(L2, 'heure'), zo = P(L2, 'zoom'), cr = P(L2, 'create'), gc = P(L2, 'gcard'), app = P(L2, 'app');
    const cx = kf([[0, 960], [0.5, 960], [1.2, mo.cx], [3.2, mo.cx], [3.9, zo.cx], [5.0, zo.cx], [5.6, 960], [6.3, gc.cx], [7.6, gc.cx]])(t);
    const cy = kf([[0, 540], [0.5, 540], [1.2, mo.cy - 40], [3.2, mo.cy - 40], [3.9, zo.cy - 30], [5.0, zo.cy - 30], [5.6, 540], [6.3, gc.cy], [7.6, gc.cy]])(t);
    const s = kf([[0, 1.0], [0.5, 1.0], [1.2, 1.45], [3.2, 1.45], [3.9, 1.9], [5.0, 1.9], [5.6, 1.0], [6.3, 1.55], [7.6, 1.6]])(t);
    setCam(L2, cx, cy, s);
    const mOpen = pop(t, 0.75), mClose = ease(seg(t, 5.25, 5.55));
    show(L2.k.veil, clamp(mOpen) * (1 - mClose)); show(L2.k.modal, clamp(mOpen) * (1 - mClose));
    L2.k.modal.style.transform = `translateY(${(1 - mOpen) * 30}px) scale(${0.96 + 0.04 * clamp(mOpen)})`;
    setField(L2, 'nom', typed(GNOM, t, 1.35, 24), t, t > 1.2 && t < 2.15, { since: 1.2 });
    setField(L2, 'jour', t > 2.45 ? 'Mercredi' : '', t, t > 2.3 && t < 2.6);
    setField(L2, 'heure', typed(GH, t, 2.85, 24), t, t > 2.7 && t < 3.55, { since: 2.7 });
    setField(L2, 'zoom', typed(GZ, t, 3.85, 26), t, t > 3.7 && t < 5.0, { since: 3.7 });
    const g = pop(t, 5.6); show(L2.k.gcard, clamp(g)); L2.k.gcard.style.transform = `translateY(${(1 - g) * 26}px)`;
    drawCursor(L2, t, [[0.15, 1500, 860], [0.5, nb.cx, nb.cy], [1.2, nom.x + 70, nom.cy], [2.3, jo.x + 90, jo.cy], [2.7, he.x + 90, he.cy], [3.7, zo.x + 90, zo.cy], [4.95, cr.cx, cr.cy], [6.1, gc.x + gc.w - 120, gc.y + gc.h + 60]], [0.52, 1.22, 2.32, 2.72, 3.72, 5.0], s);
  });
  clickSfx(L2, [0.52, 1.22, 2.32, 2.72, 3.72, 5.0]); typeTicks(21.3 + 1.35, GNOM); typeTicks(21.3 + 2.85, GH); typeTicks(21.3 + 3.85, GZ, 26); sfx('done', 21.3 + 5.6);

  // ── 3. Lien d'inscription ─────────────────────────────────────────────────
  titleScene(28.4, 30.5, [['Un lien pour ', false], ['toutes les familles', true], ['.', false]], { pill: 'Étape 3 · Inscriptions' });
  const URL = 'app.sihschool.com/inscription/K7M2QX';
  const eleves = [['Y', 'Yasmine Benali', 'Parent : Fatima Benali'], ['A', 'Adam Benali', 'Parent : Fatima Benali'], ['S', 'Sara Kaci', 'Parent : Nadia Kaci']];
  const L3 = layer(30.3, 38.3, `${SKY}
    <div class="card" data-k="gc" style="left:200px;top:120px;width:820px;height:840px;padding:34px 36px;box-sizing:border-box">
      <div class="row"><span class="chip y">NOURANIA</span><span class="chip" data-k="cnt">0 élève</span></div>
      <div style="font-size:34px;font-weight:800;margin:10px 0 2px">Nourania Enfants</div>
      <div class="muted row" style="gap:8px;font-size:19px">${ic('cal', 20)}Mercredi · 14:00 - 15:00</div>
      <div class="lienbox" data-k="lien" style="margin-top:22px">
        <div class="row" style="font-weight:800;font-size:18px;gap:8px">${ic('link', 20)}Lien d'inscription pour les familles</div>
        <div class="mono" style="font-size:19px;margin:10px 0 14px">${URL}</div>
        <div class="row"><span class="btn sm">${ic('copy', 18)}Copier le lien</span><span class="btn sm w" data-k="wa">${ic('chat', 18)}WhatsApp</span></div>
      </div>
      <div style="font-weight:800;font-size:16px;letter-spacing:.06em;text-transform:uppercase;color:#4A5487;margin:26px 0 12px">Élèves inscrits</div>
      <div data-k="list" style="position:relative;height:290px">
        ${eleves.map((e, i) => `<div class="card white row" data-k="e${i}" style="position:absolute;left:0;right:0;top:${i * 96}px;padding:14px 18px;border-radius:22px"><div class="avatar">${e[0]}</div><div><div style="font-weight:800;font-size:20px">${e[1]}</div><div class="muted" style="font-size:15px">${e[2]}</div></div><span class="grow"></span><span class="chip g">${ic('check', 14)}Inscrit</span></div>`).join('')}
      </div>
    </div>
    <div class="chatp" data-k="chat" style="left:1110px;top:170px;width:600px;height:740px">
      <div class="chath"><div class="avatar">${ic('users', 22)}</div><div><div>Parents · Nourania Enfants</div><div style="font-size:14px;opacity:.8;font-weight:600">groupe de discussion</div></div></div>
      <div class="bubble" data-k="msg" style="right:22px;top:120px">Assalamu alaykum ! Pour inscrire votre enfant au cours Nourania Enfants (mercredi 14h), c'est ici :<br><span class="ln">${URL}</span></div>
      <div class="bubble in" data-k="r1" style="left:22px;top:330px">Merci ! C'est fait pour Yasmine et Adam</div>
      <div class="bubble in" data-k="r2" style="left:22px;top:420px">Inscrite aussi, merci beaucoup !</div>
    </div>${cursorHTML()}`, (t) => {
    const li = P(L3, 'lien'), wa = P(L3, 'wa'), ch = P(L3, 'chat'), ls = P(L3, 'list');
    const cx = kf([[0, li.cx], [1.3, li.cx], [2.1, ch.cx], [3.4, ch.cx], [4.1, ls.cx], [6.0, ls.cx], [6.8, 960]])(t);
    const cy = kf([[0, li.cy], [1.3, li.cy], [2.1, ch.cy - 60], [3.4, ch.cy - 60], [4.1, ls.cy], [6.0, ls.cy], [6.8, 540]])(t);
    const s = kf([[0, 1.55], [1.3, 1.6], [2.1, 1.25], [3.4, 1.25], [4.1, 1.45], [6.0, 1.45], [6.8, 1.0], [8, 1.02]])(t);
    setCam(L3, cx, cy, s);
    const m = pop(t, 1.9); show(L3.k.msg, clamp(m)); L3.k.msg.style.transform = `translateY(${(1 - m) * 24}px) scale(${0.95 + 0.05 * clamp(m)})`;
    const r1 = pop(t, 3.0), r2 = pop(t, 5.1);
    show(L3.k.r1, clamp(r1)); L3.k.r1.style.transform = `translateY(${(1 - r1) * 20}px)`;
    show(L3.k.r2, clamp(r2)); L3.k.r2.style.transform = `translateY(${(1 - r2) * 20}px)`;
    let n = 0;
    [4.3, 4.85, 5.4].forEach((at, i) => { const k = pop(t, at); if (t >= at) n = i + 1; show(L3.k['e' + i], clamp(k)); L3.k['e' + i].style.transform = `translateX(${(1 - k) * -40}px)`; });
    L3.k.cnt.textContent = `${n} élève${n > 1 ? 's' : ''}`;
    L3.k.cnt.className = n ? 'chip g' : 'chip';
    drawCursor(L3, t, [[0.2, li.x + li.w + 80, li.y + li.h + 80], [0.9, wa.cx, wa.cy], [2.0, wa.cx + 260, wa.cy + 160]], [0.95], s);
  });
  clickSfx(L3, [0.95]); sfx('pop', 30.3 + 1.9); sfx('pop', 30.3 + 3.0); [4.3, 4.85, 5.4].forEach(a => sfx('done', 30.3 + a)); sfx('pop', 30.3 + 5.1);

  // ── 4. Devoir en vocal ─────────────────────────────────────────────────────
  titleScene(38.0, 40.0, [['Un devoir… ', false], ['en vocal', true], ['.', false]], { pill: 'Étape 4 · Devoirs' });
  const DT = 'Leçon 1 : alif, ba, ta', DC = 'Écoute mon vocal, puis lis les trois lettres à voix haute.';
  const L4 = layer(39.8, 47.6, `${SKY}${appWin('Devoirs', `<div class="ctitle">${ic('book', 26)}Devoirs & exercices</div>
      <div class="card" data-k="dcard" style="left:32px;top:64px;width:760px;padding:24px 28px;box-sizing:border-box">
        <div class="row" style="justify-content:space-between"><span class="chip y">NOURANIA ENFANTS</span><span class="chip g">${ic('check', 14)}Envoyé</span></div>
        <div style="font-size:28px;font-weight:800;margin:10px 0 4px">${DT}</div>
        <div class="muted" style="font-size:18px">${DC}</div>
        <div class="player" style="margin-top:14px"><div class="playb">${ic('play', 18)}</div>${waveBars('w3', 44)}<span class="mono" style="font-size:16px">00:04</span></div>
        <div class="row" style="margin-top:14px"><span class="chip">${ic('mic', 14)}Récitations reçues : 0 / 3</span></div>
      </div>`)}
    <div class="veil" data-k="veil"></div>
    <div class="modal" data-k="modal" style="left:560px;top:96px;width:800px">
      <div class="ctitle">${ic('book', 26)}Donner un devoir au groupe</div>
      ${label('Groupe')}<div class="field">${ic('layers', 18, 'fi')}Nourania Enfants (Mercredi · 14:00 - 15:00)</div>
      ${label('Titre du devoir *')}${field('titre', 'Ex : Leçon 3 et récitation')}
      ${label('Consigne *')}${field('cons', 'Écrivez la consigne…', { cls: 'area' })}
      ${label('Consigne vocale (modèle de prononciation)')}
      <div style="position:relative;height:70px" data-k="recz">
        <div class="btn w" data-k="mic" style="position:absolute;inset:0">${ic('mic', 22)}Appuyer pour enregistrer avec le micro</div>
        <div class="player rec" data-k="rec" style="position:absolute;inset:0;border-color:#F5B5AF;background:#FFF1F0"><div class="playb" data-k="stop" style="background:#E5483D;color:#fff">${ic('stop', 18)}</div>${waveBars('w1', 40)}<span class="mono" data-k="tm" style="color:#E5483D;font-size:18px">00:00</span></div>
        <div class="player" data-k="ready" style="position:absolute;inset:0"><div class="playb">${ic('play', 18)}</div>${waveBars('w2', 40)}<span class="chip g">${ic('check', 14)}Prêt</span></div>
      </div>
      <div class="btn" data-k="send" style="margin-top:24px">${ic('send', 20)}Envoyer le devoir au groupe</div>
    </div>
    <div class="toast" data-k="toast" style="left:1010px;top:860px"><span class="ok">${ic('check', 18)}</span>Devoir envoyé aux 3 élèves du groupe</div>${cursorHTML()}`, (t) => {
    const mo = P(L4, 'modal'), ti = P(L4, 'titre'), co = P(L4, 'cons'), rz = P(L4, 'recz'), se = P(L4, 'send');
    const cx = kf([[0, mo.cx], [0.3, ti.cx], [1.6, co.cx], [3.3, rz.cx], [5.4, rz.cx], [5.9, mo.cx], [6.4, 960]])(t);
    const cy = kf([[0, mo.cy], [0.3, ti.cy + 40], [1.6, co.cy], [3.3, rz.cy - 20], [5.4, rz.cy - 20], [5.9, mo.cy], [6.4, 540]])(t);
    const s = kf([[0, 1.25], [0.3, 1.6], [1.6, 1.6], [3.3, 1.9], [5.4, 1.9], [5.9, 1.2], [6.4, 1.0], [7.8, 1.03]])(t);
    setCam(L4, cx, cy, s);
    const close = ease(seg(t, 6.1, 6.4));
    show(L4.k.veil, 1 - close); show(L4.k.modal, 1 - close);
    setField(L4, 'titre', typed(DT, t, 0.45, 24), t, t > 0.3 && t < 1.45, { since: 0.3 });
    setField(L4, 'cons', typed(DC, t, 1.6, 36), t, t > 1.45 && t < 3.3, { since: 1.45 });
    const recOn = t >= 3.55 && t < 5.25, ready = t >= 5.25;
    show(L4.k.mic, !recOn && !ready ? 1 : 0); show(L4.k.rec, recOn ? 1 : 0); show(L4.k.ready, ready ? 1 : 0);
    if (recOn) { setWave(L4, 'w1', t, 'live'); L4.k.tm.textContent = `00:0${Math.min(9, Math.floor(t - 3.55))}`; }
    setWave(L4, 'w2', t, 'static', 0);
    setWave(L4, 'w3', t, 'static', 0);
    const dc = pop(t, 6.5); show(L4.k.dcard, clamp(dc)); L4.k.dcard.style.transform = `translateY(${(1 - dc) * 26}px)`;
    const to = pop(t, 6.45); show(L4.k.toast, clamp(to)); L4.k.toast.style.transform = `translateY(${(1 - to) * 30}px)`;
    drawCursor(L4, t, [[0.1, ti.x + ti.w + 60, ti.cy + 60], [0.3, ti.x + 60, ti.cy], [1.45, co.x + 60, co.y + 30], [3.5, rz.cx, rz.cy], [5.2, rz.x + 26, rz.cy], [5.95, se.cx, se.cy], [6.9, se.cx + 160, se.cy + 120]], [0.32, 1.47, 3.55, 5.22, 6.0], s);
  });
  clickSfx(L4, [0.32, 1.47, 3.55, 5.22, 6.0]); typeTicks(39.8 + 0.45, DT); typeTicks(39.8 + 1.6, DC, 36); sfx('done', 39.8 + 6.45);

  // ── 5. Correction ──────────────────────────────────────────────────────────
  titleScene(46.8, 48.8, [['Écoutez. ', false], ['Encouragez.', true]], { pill: 'Étape 5 · Corrections' });
  const COM = 'Très bien Yasmine, bravo !';
  const L5 = layer(48.6, 55.2, `${SKY}${appWin('Devoirs', `
      <div class="card" style="left:32px;top:0;right:32px;padding:26px 30px">
        <div class="row" style="justify-content:space-between"><div><div class="chip y" style="margin-bottom:8px">NOURANIA ENFANTS</div><div style="font-size:28px;font-weight:800">Leçon 1 : alif, ba, ta</div></div>
          <span class="chip" style="font-size:16px;padding:8px 16px">${ic('mic', 16)}Récitations reçues : 1 / 3</span></div>
        <div class="card white" data-k="row" style="position:relative;margin-top:22px;padding:22px 24px;border-radius:24px">
          <div class="row"><div class="avatar">Y</div><div style="font-weight:800;font-size:22px">Yasmine Benali</div><span class="grow"></span>
            <span class="chip o" data-k="st1">${ic('clock', 14)}En attente d'écoute</span><span class="chip g" data-k="st2" style="position:absolute;right:24px">${ic('star', 14)}Validé</span></div>
          <div class="player" style="margin-top:16px"><div class="playb" data-k="pl">${ic('play', 18)}</div>${waveBars('w', 54)}<span class="mono" data-k="tm" style="font-size:17px">00:00 / 00:05</span></div>
          <div class="row" style="margin-top:16px"><span class="btn sm w" data-k="val">${ic('star', 16)}Valider</span><span class="btn sm w">À réviser</span>
            ${field('com', 'Remarque pour l\'élève (prononciation, encouragements)…', { style: 'flex:1;height:46px' })}<span class="btn sm" data-k="save">Enregistrer</span></div>
        </div>
      </div>`)}${cursorHTML()}`, (t) => {
    const rw = P(L5, 'row'), pl = P(L5, 'pl'), va = P(L5, 'val'), cm = P(L5, 'com'), sv = P(L5, 'save');
    const cx = kf([[0, rw.cx], [5.0, rw.cx], [5.7, 960]])(t), cy = kf([[0, rw.cy], [5.0, rw.cy], [5.7, 520]])(t);
    const s = kf([[0, 1.35], [0.4, 1.5], [5.0, 1.55], [5.7, 1.1], [6.6, 1.12]])(t);
    setCam(L5, cx, cy, s);
    const prog = seg(t, 0.6, 2.6);
    setWave(L5, 'w', t, 'static', prog);
    L5.k.tm.textContent = `00:0${Math.floor(prog * 5)} / 00:05`;
    const ok = t >= 2.85;
    L5.k.val.className = ok ? 'btn sm green' : 'btn sm w';
    setField(L5, 'com', typed(COM, t, 3.35, 24), t, t > 3.2 && t < 4.6, { since: 3.2 });
    const done = pop(t, 4.85); show(L5.k.st1, 1 - clamp(done)); show(L5.k.st2, clamp(done)); L5.k.st2.style.transform = `scale(${0.7 + 0.3 * clamp(done)})`;
    drawCursor(L5, t, [[0.1, pl.cx + 120, pl.cy + 90], [0.45, pl.cx, pl.cy], [2.75, va.cx, va.cy], [3.15, cm.x + 80, cm.cy], [4.65, sv.cx, sv.cy], [5.8, sv.cx + 120, sv.cy + 90]], [0.5, 2.85, 3.2, 4.75], s);
  });
  clickSfx(L5, [0.5, 2.85, 3.2, 4.75]); typeTicks(48.6 + 3.35, COM); sfx('done', 48.6 + 4.85);

  // ── 6. Annonces + mot de passe ─────────────────────────────────────────────
  const AT = 'Cours de mercredi', AX = 'Pensez au cahier et à un crayon.';
  const L6 = layer(55.0, 62.4, `${SKY}
    <div class="card" data-k="ann" style="left:150px;top:150px;width:760px;padding:30px 34px;box-sizing:border-box">
      <div class="ctitle">${ic('mega', 26)}Publier une annonce</div>
      ${label('Titre du message *')}${field('at', 'Ex : Rappel pour samedi')}
      ${label('Message *')}${field('ax', 'Écrivez votre message aux familles…', { cls: 'area', style: 'height:90px' })}
      <div class="row" style="justify-content:flex-end;margin-top:20px"><span class="btn" data-k="pub">${ic('send', 20)}Publier</span></div>
    </div>
    <div class="card white" data-k="posted" style="left:150px;top:690px;width:760px;padding:22px 30px;box-sizing:border-box">
      <div class="row" style="justify-content:space-between"><div style="font-size:24px;font-weight:800">${AT}</div><span class="chip g">${ic('check', 14)}Publiée</span></div>
      <div class="muted" style="font-size:19px;margin-top:4px">${AX}</div></div>
    <div class="card" data-k="acc" style="left:1010px;top:250px;width:760px;padding:30px 34px;box-sizing:border-box">
      <div class="row"><div class="avatar" style="width:60px;height:60px;font-size:26px">F</div><div><div style="font-size:26px;font-weight:800">Fatima Benali</div><div class="muted">Parent de Yasmine et Adam</div></div></div>
      <div class="row" style="margin-top:22px"><span class="btn w" data-k="np">${ic('key', 20)}Nouveau mot de passe</span></div>
    </div>
    <div class="card white" data-k="pw" style="left:1010px;top:560px;width:760px;padding:28px 34px;box-sizing:border-box;border:3px solid #FFE15C">
      <div class="row" style="font-size:22px;font-weight:800;gap:10px"><span class="okbig" style="width:40px;height:40px;border-width:2px">${ic('check', 22)}</span>Nouveau mot de passe temporaire</div>
      <div class="row" style="margin:18px 0"><span class="mono" style="font-size:34px;background:#FFE15C;padding:8px 22px;border-radius:999px">SIH-482913</span></div>
      <span class="btn sm green">${ic('chat', 18)}Envoyer sur WhatsApp</span>
    </div>${cursorHTML()}`, (t) => {
    const an = P(L6, 'ann'), at = P(L6, 'at'), ax = P(L6, 'ax'), pb = P(L6, 'pub'), ac = P(L6, 'acc'), np = P(L6, 'np'), pw = P(L6, 'pw');
    const cx = kf([[0, an.cx], [2.9, an.cx], [3.4, an.cx], [4.2, ac.cx], [5.3, ac.cx], [5.9, pw.cx], [6.8, pw.cx], [7.4, 960]])(t);
    const cy = kf([[0, an.cy + 40], [2.9, an.cy + 40], [3.4, an.cy + 160], [4.2, ac.cy + 120], [5.3, ac.cy + 120], [5.9, pw.cy], [6.8, pw.cy], [7.4, 540]])(t);
    const s = kf([[0, 1.45], [2.9, 1.5], [3.4, 1.35], [4.2, 1.45], [5.3, 1.45], [5.9, 1.75], [6.8, 1.75], [7.4, 1.0]])(t);
    setCam(L6, cx, cy, s);
    setField(L6, 'at', typed(AT, t, 0.45, 24), t, t > 0.3 && t < 1.25, { since: 0.3 });
    setField(L6, 'ax', typed(AX, t, 1.35, 34), t, t > 1.25 && t < 2.5, { since: 1.25 });
    const po = pop(t, 2.95); show(L6.k.posted, clamp(po)); L6.k.posted.style.transform = `translateY(${(1 - po) * 30}px)`;
    const p2 = pop(t, 5.05); show(L6.k.pw, clamp(p2)); L6.k.pw.style.transform = `translateY(${(1 - p2) * 30}px) scale(${0.96 + 0.04 * clamp(p2)})`;
    drawCursor(L6, t, [[0.1, at.x + at.w + 40, at.cy + 70], [0.3, at.x + 70, at.cy], [1.25, ax.x + 70, ax.y + 30], [2.7, pb.cx, pb.cy], [4.6, np.cx, np.cy], [5.6, np.cx + 220, np.cy + 140]], [0.32, 1.27, 2.75, 4.75], s);
  });
  clickSfx(L6, [0.32, 1.27, 2.75, 4.75]); typeTicks(55 + 0.45, AT); typeTicks(55 + 1.35, AX, 34); sfx('done', 55 + 2.95); sfx('done', 55 + 5.05);

  // ── 7. Conclusion + carte de fin ───────────────────────────────────────────
  const LC = brandScene(62.2, 66.3, `<div class="center"><div data-k="n">${LOGO(70)}</div><div class="big-line" data-k="l">Vos cours d'arabe, <span class="hl" data-k="h">simplement</span>.</div></div>`, null);
  const fC = LC.fn;
  LC.fn = (t, el, T) => {
    fC(t, el, T);
    const a = pop(t, 0.35), b = pop(t, 0.7);
    LC.k.n.style.opacity = clamp(a); LC.k.l.style.opacity = clamp(b); LC.k.l.style.transform = `translateY(${(1 - b) * 20}px) scale(${1 + t * 0.012})`;
    LC.k.h.style.backgroundSize = `${ease(seg(t, 1.4, 2.0)) * 100}% 78%`;
  };
  const LE = brandScene(66.1, 69, `<div class="center"><div data-k="n">${LOGO(150)}</div><div class="url" data-k="u">app.sihschool.com</div></div>`, null, { sweep: false, fadeOut: 0.6 });
  const fE = LE.fn;
  LE.fn = (t, el, T) => {
    fE(t, el, T);
    const a = pop(t, 0.2), b = pop(t, 0.6);
    LE.k.n.style.opacity = clamp(a); LE.k.n.style.transform = `scale(${0.94 + 0.06 * a})`;
    LE.k.u.style.opacity = clamp(b); LE.k.u.style.transform = `translateY(${(1 - b) * 14}px)`;
  };
  sfx('chime', 66.3);
}
