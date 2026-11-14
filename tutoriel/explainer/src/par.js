/* ============================================================================
   VIDÉO 2 — ESPACE PARENTS & ÉLÈVES (≈ 66 s, 1920×1080, sur téléphone)
   Feuille de temps (voix ElevenLabs « Alice ») :
    0.0  « Espace familles », bandeau de marque                      whoosh
    0.9  VOIX p1 Bienvenue…            4.8 « Les cours d'arabe, dans votre poche. »
    8.4  VOIX p2 Inscription — lien reçu, formulaire, e-mail, mot de passe, enfant, « Je m'inscris moi-même »
   21.2  VOIX p3 Espace — jour et heure du cours, « Rejoindre sur Zoom », appel
   30.6  VOIX p4 Annonces de l'enseignante
   34.6  VOIX p5 Devoirs — consigne + vocal de la maîtresse
   39.8  VOIX p6 Réciter au micro, envoyer
   45.0  VOIX p7 Retour : validé + commentaire
   51.6  VOIX p8 Mot de passe oublié
   59.0  VOIX p9 « Apprendre l'arabe avec joie et douceur. »  — 62.7 carte de fin  chime
   ============================================================================ */
const VIDEO = { w: 1920, h: 1080, duration: 66 };
window.VIDEO = VIDEO;

const PHX = 740, PHY = 90;            // position du téléphone (440 × 900)
const pHead = `<div class="row" style="justify-content:space-between;margin-bottom:12px">${LOGO(24)}<span class="chip" style="font-size:12px">${ic('user', 12)}Fatima</span></div>`;

function build() {
  // ── Ouverture ──────────────────────────────────────────────────────────────
  const L0 = layer(0, 2.4, `<div class="center"><div class="word" data-k="w">Espace parents & élèves</div></div>`, (t) => {
    const k = easeOut(seg(t, 0.25, 1.0));
    L0.k.w.style.opacity = k; L0.k.w.style.transform = `translateY(${(1 - k) * 12}px) scale(${0.96 + k * 0.04})`;
    setCam(L0, 960, 540, 1 + t * 0.02);
  }, { fadeIn: 0, whoosh: false });

  const LB = brandScene(2.1, 5.1, `<div class="center"><div data-k="name">${LOGO(150)}</div><div class="chip y" data-k="sub" style="font-size:22px;padding:8px 22px">Parents & élèves</div></div>`, null);
  const fB = LB.fn;
  LB.fn = (t, el, T) => {
    fB(t, el, T);
    const k = pop(t, 0.45), k2 = pop(t, 0.9);
    LB.k.name.style.opacity = clamp(k); LB.k.name.style.transform = `scale(${0.9 + 0.1 * k})`;
    LB.k.sub.style.opacity = clamp(k2); LB.k.sub.style.transform = `translateY(${(1 - k2) * 16}px)`;
  };

  titleScene(4.9, 8.5, [["Les cours d'arabe, ", false], ['dans votre poche', true], ['.', false]]);

  // ── 1. Inscription par le lien ─────────────────────────────────────────────
  const LINK = 'app.sihschool.com/inscription/K7M2QX';
  const L1 = layer(8.3, 21.1, `${SKY}${phone(`
      <div data-k="sA" style="position:absolute;inset:0;background:#ECE5DD">
        <div class="chath" style="padding-top:44px;height:118px;box-sizing:border-box;font-size:17px"><div class="avatar" style="width:38px;height:38px">${ic('users', 18)}</div><div>Parents · Nourania Enfants</div></div>
        <div class="bubble in" style="left:16px;top:150px;max-width:330px;font-size:16px">Assalamu alaykum ! Pour inscrire votre enfant au cours Nourania Enfants, c'est ici :<br><span class="ln" data-k="ln">${LINK}</span></div>
      </div>
      <div data-k="sB" style="position:absolute;inset:0;background:linear-gradient(180deg,#A9D8F5,#CDE9FA)">
        <div class="scr" data-k="scrB">${pHead}
          <div class="pcard" style="text-align:center">
            <div style="font-size:24px;font-weight:800">Inscription à Sihscool</div>
            <div class="chip y" style="margin-top:8px;font-size:13px">${ic('cal', 13)}Nourania Enfants · Mercredi 14:00</div>
            <div class="seg2" style="margin-top:14px"><div class="segb on">J'inscris mon enfant</div><div class="segb" data-k="adulte">Je m'inscris moi-même</div></div>
            <div style="text-align:left">
              ${label('Votre prénom *')}${field('pre', 'Prénom')}
              ${label('E-mail *')}${field('em', 'nom@exemple.com', { icon: 'mail' })}
              ${label('Mot de passe *')}${field('pw', '6 caractères min.', { icon: 'lock' })}
              <div style="font-weight:800;font-size:15px;margin:16px 0 0 6px">Votre enfant</div>
              ${label('Prénom *')}${field('enf', 'Prénom de l\'enfant')}
            </div>
            <div class="btn" data-k="go" style="margin-top:18px">${ic('user', 18)}Créer mon compte</div>
          </div>
        </div>
        <div data-k="okB" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:linear-gradient(180deg,#A9D8F5,#CDE9FA)">
          <div class="okbig">${ic('check', 48)}</div><div style="font-size:28px;font-weight:800">Compte créé !</div><div class="muted">Bienvenue Fatima</div></div>
      </div>`, { x: PHX, y: PHY })}
    <div class="ring" data-k="ring" style="position:absolute;border:4px solid #FFC400;border-radius:20px;box-shadow:0 0 0 8px rgba(255,225,92,.35)"></div>
    ${cursorHTML()}`, (t) => {
    const scroll = kf([[0, 0], [6.3, 0], [6.8, -250], [8.4, -250], [8.9, 0], [11.0, 0], [11.4, -250]])(t);
    L1.k.scrB.style.transform = `translateY(${scroll}px)`;
    const Q = k => { const p = P(L1, k); if (k !== 'ln' && k !== 'adulte' || k === 'adulte') { p.y += k === 'ln' ? 0 : scroll; p.cy += k === 'ln' ? 0 : scroll; } return p; };
    const ln = P(L1, 'ln'), pre = Q('pre'), em = Q('em'), pw = Q('pw'), enf = Q('enf'), go = Q('go'), ad = Q('adulte');
    const ph = { cx: PHX + 220, cy: PHY + 450 };
    const cx = kf([[0, ph.cx], [12.8, ph.cx]])(t);
    const cy = kf([[0, ph.cy], [1.9, ph.cy], [2.6, em.cy], [6.2, em.cy], [6.9, enf.cy], [8.3, enf.cy], [9.0, ad.cy + 60], [11.0, ad.cy + 60], [11.6, ph.cy], [12.8, ph.cy]])(t);
    const s = kf([[0, 1.0], [1.0, 1.15], [1.9, 1.0], [2.6, 1.55], [6.2, 1.55], [6.9, 1.6], [8.3, 1.6], [9.0, 1.7], [11.0, 1.7], [11.6, 1.05], [12.8, 1.08]])(t);
    setCam(L1, cx, cy, s);
    const sw = ease(seg(t, 1.7, 2.1));
    L1.k.sA.style.transform = `translateX(${-sw * 120}px)`; show(L1.k.sA, 1 - sw);
    L1.k.sB.style.transform = `translateX(${(1 - sw) * 440}px)`;
    setField(L1, 'pre', typed('Fatima', t, 2.55, 20), t, t > 2.4 && t < 3.55, { since: 2.4 });
    setField(L1, 'em', typed('fatima@exemple.com', t, 3.75, 24), t, t > 3.6 && t < 5.15, { since: 3.6 });
    setField(L1, 'pw', typed('xxxxxxxx', t, 5.35, 16), t, t > 5.2 && t < 6.2, { password: true, since: 5.2 });
    setField(L1, 'enf', typed('Yasmine', t, 7.15, 20), t, t > 7.0 && t < 8.3, { since: 7.0 });
    const rg = clamp(seg(t, 9.3, 9.6)) * (1 - seg(t, 10.8, 11.1));
    const pulse = 1 + 0.03 * Math.sin((t - 9.3) * 6);
    L1.k.ring.style.left = `${ad.x - 8}px`; L1.k.ring.style.top = `${ad.y - 8}px`; L1.k.ring.style.width = `${ad.w + 16}px`; L1.k.ring.style.height = `${ad.h + 16}px`;
    L1.k.ring.style.opacity = rg; L1.k.ring.style.transform = `scale(${pulse})`;
    const ok = ease(seg(t, 12.0, 12.3)); show(L1.k.okB, ok); L1.k.okB.firstElementChild.style.transform = `scale(${0.6 + 0.4 * pop(t, 12.05)})`;
    drawCursor(L1, t, [[0.5, ln.cx + 60, ln.cy + 120], [1.3, ln.cx, ln.cy], [2.4, pre.x + 60, pre.cy], [3.6, em.x + 60, em.cy], [5.2, pw.x + 60, pw.cy], [7.0, enf.x + 60, enf.cy],
      [9.25, ad.cx, ad.cy], [11.7, go.cx, go.cy], [12.6, go.cx + 80, go.cy + 80]], [1.35, 2.42, 3.62, 5.22, 7.02, 11.75], s);
  });
  clickSfx(L1, [1.35, 2.42, 3.62, 5.22, 7.02, 11.75]); typeTicks(8.3 + 3.75, 'fatima@exemple.com'); sfx('whoosh', 8.3 + 1.7); sfx('done', 8.3 + 12.05);

  // ── 2. Espace famille : Zoom et annonces ──────────────────────────────────
  const L2 = layer(20.9, 34.3, `${SKY}${phone(`
      <div class="scr" data-k="scr">${pHead}
        <div style="font-size:26px;font-weight:800;margin:4px 0 10px">Espace famille</div>
        <div class="pcard row" style="padding:12px 14px"><div class="avatar" style="width:40px;height:40px;font-size:17px">Y</div><div><div style="font-weight:800">Yasmine Benali</div><div class="muted" style="font-size:13px">Nourania Enfants</div></div></div>
        <div class="ptabs"><div class="ptab on">${ic('video', 14)}Cours & annonces</div><div class="ptab">${ic('book', 14)}Devoirs (1)</div></div>
        <div class="pcard" data-k="seance" style="border-color:#FFE15C">
          <div class="chip y" style="font-size:11px">${ic('video', 12)}PROCHAINE SÉANCE EN DIRECT</div>
          <div style="font-size:24px;font-weight:800;margin:8px 0 2px">Nourania Enfants</div>
          <div class="row muted" style="gap:6px;font-size:16px">${ic('cal', 16)}Tous les mercredis à <b style="color:#1B2A7A">14:00</b></div>
          <div class="btn" data-k="zoom" style="margin-top:14px">${ic('video', 20)}Rejoindre sur Zoom</div>
        </div>
        <div class="pcard" data-k="ann">
          <div class="row" style="font-weight:800;font-size:17px;gap:8px">${ic('mega', 18)}Dernières annonces</div>
          <div class="card white" style="position:relative;margin-top:10px;padding:12px 14px;border-radius:16px;border-width:2px">
            <div style="font-weight:800">Cours de mercredi</div><div class="muted" style="font-size:14px">Pensez au cahier et à un crayon.</div></div>
          <div class="card white" style="position:relative;margin-top:8px;padding:12px 14px;border-radius:16px;border-width:2px">
            <div style="font-weight:800">Bienvenue !</div><div class="muted" style="font-size:14px">Les devoirs arrivent chaque semaine ici.</div></div>
        </div>
      </div>
      <div class="call" data-k="call">
        <div class="tile"><div class="avatar">S</div><span>Siham · enseignante</span></div><div class="tile"><div class="avatar" style="background:#CDBDF2">Y</div><span>Yasmine</span></div>
        <div class="tile"><div class="avatar" style="background:#BDE8B7">A</div><span>Adam</span></div><div class="tile"><div class="avatar" style="background:#FFD9B3">K</div><span>Karim</span></div>
        <div class="callbar"><i></i><i></i><i class="end"></i></div>
        <div style="position:absolute;top:24px;left:0;right:0;text-align:center;color:#fff;font-weight:800;font-size:15px">Cours en direct · Nourania Enfants</div>
      </div>`, { x: PHX, y: PHY })}${cursorHTML()}`, (t) => {
    const scroll = kf([[0, 0], [9.6, 0], [10.4, -300]])(t);
    L2.k.scr.style.transform = `translateY(${scroll}px)`;
    const se = P(L2, 'seance'), zo = P(L2, 'zoom'), an = P(L2, 'ann');
    zo.cy += scroll; se.cy += scroll; an.cy += scroll;
    const ph = { cx: PHX + 220, cy: PHY + 450 };
    const cy = kf([[0, ph.cy], [1.4, ph.cy], [2.4, se.cy], [5.7, se.cy], [6.2, zo.cy - 40], [6.9, ph.cy], [9.4, ph.cy], [10.6, an.cy], [13.4, an.cy]])(t);
    const s = kf([[0, 1.0], [1.4, 1.02], [2.4, 1.75], [5.7, 1.75], [6.2, 1.85], [6.9, 1.05], [9.4, 1.05], [10.6, 1.65], [13.4, 1.7]])(t);
    setCam(L2, ph.cx, cy, s);
    L2.k.zoom.style.transform = `scale(${t > 6.35 && t < 6.6 ? 0.96 : 1 + 0.025 * Math.max(0, Math.sin((t - 4.6) * 5)) * (t > 4.6 && t < 6.3 ? 1 : 0)})`;
    const call = ease(seg(t, 6.75, 7.1)) * (1 - ease(seg(t, 9.3, 9.6)));
    show(L2.k.call, call); L2.k.call.style.transform = `scale(${0.94 + 0.06 * call})`;
    drawCursor(L2, t, [[3.0, zo.cx + 90, zo.cy + 110], [6.3, zo.cx, zo.cy], [7.0, zo.cx + 120, zo.cy + 140]], [6.4], s);
  });
  clickSfx(L2, [6.4]); sfx('pop', 20.9 + 6.8); sfx('whoosh', 20.9 + 9.7);

  // ── 3. Devoirs : écouter, réciter, retour ─────────────────────────────────
  titleScene(34.1, 36.1, [['Les devoirs, ', false], ['à voix haute', true], ['.', false]]);
  const L3 = layer(35.9, 51.5, `${SKY}${phone(`
      <div class="scr" data-k="scr">${pHead}
        <div class="ptabs"><div class="ptab">${ic('video', 14)}Cours & annonces</div><div class="ptab on" data-k="tab">${ic('book', 14)}Devoirs (1)</div></div>
        <div class="pcard" data-k="lecon">
          <div class="chip" style="font-size:11px">EXERCICE</div>
          <div style="font-size:22px;font-weight:800;margin:6px 0 4px">Leçon 1 : alif, ba, ta</div>
          <div class="arabic" style="font-size:64px;text-align:center;line-height:1.5;letter-spacing:14px;color:#1B2A7A">ا ب ت</div>
          <div class="muted" style="font-size:15px">Écoute mon vocal, puis lis les trois lettres à voix haute.</div>
          <div style="font-weight:800;font-size:13px;margin:12px 0 6px">Modèle de l'enseignante</div>
          <div class="player" data-k="pl" style="padding:8px 10px;gap:10px"><div class="playb" style="width:36px;height:36px">${ic('play', 15)}</div>${waveBars('m', 24)}</div>
        </div>
        <div class="pcard" data-k="recz">
          <div style="font-weight:800;font-size:14px;margin-bottom:8px" class="row">${ic('mic', 15)}Votre récitation</div>
          <div style="position:relative;height:56px">
            <div class="btn w" data-k="mic" style="position:absolute;inset:0;font-size:15px">${ic('mic', 18)}Appuyez pour réciter</div>
            <div class="player rec" data-k="rec" style="position:absolute;inset:0;padding:6px 10px;border-color:#F5B5AF;background:#FFF1F0"><div class="playb" data-k="stop" style="width:36px;height:36px;background:#E5483D;color:#fff">${ic('stop', 14)}</div>${waveBars('w', 22)}<span class="mono" data-k="tm" style="color:#E5483D;font-size:14px">00:00</span></div>
            <div class="player" data-k="ready" style="position:absolute;inset:0;padding:6px 10px"><div class="playb" style="width:36px;height:36px">${ic('play', 14)}</div>${waveBars('w2', 22)}</div>
          </div>
          <div class="btn" data-k="send" style="margin-top:12px;font-size:15px">${ic('send', 17)}Envoyer à la maîtresse</div>
          <div style="position:relative;height:40px;margin-top:12px">
            <span class="chip o" data-k="st1" style="position:absolute;left:0;top:4px">${ic('clock', 13)}En attente d'écoute</span>
            <span class="chip g" data-k="st2" style="position:absolute;left:0;top:4px;font-size:15px">${ic('star', 14)}Validé par l'enseignante !</span>
          </div>
          <div class="card white" data-k="com" style="position:relative;margin-top:8px;padding:12px 14px;border-radius:16px;border:2px solid #BDE8B7">
            <div style="font-weight:800;font-size:13px;color:#1E7E44">Retour de l'enseignante</div><div style="font-weight:700">« Très bien Yasmine, bravo ! »</div></div>
        </div>
      </div>`, { x: PHX, y: PHY })}
    <div data-k="spark" style="position:absolute;left:0;top:0">${Array.from({ length: 8 }, (_, i) => `<div style="position:absolute;color:#FFC400">${ic('star', 16 + (i % 3) * 6)}</div>`).join('')}</div>
    ${cursorHTML()}`, (t) => {
    const scroll = kf([[0, 0], [3.9, 0], [4.5, -330], [9.4, -330], [9.9, -420]])(t);
    L3.k.scr.style.transform = `translateY(${scroll}px)`;
    const Q = k => { const p = P(L3, k); p.y += scroll; p.cy += scroll; return p; };
    const tab = Q('tab'), le = Q('lecon'), pl = Q('pl'), rz = Q('recz'), mic = Q('mic'), snd = Q('send'), st = Q('st2'), com = Q('com');
    const ph = { cx: PHX + 220, cy: PHY + 450 };
    const cy = kf([[0, ph.cy], [0.8, ph.cy], [1.5, le.cy], [3.9, le.cy], [4.6, mic.cy + 40], [8.4, mic.cy + 40], [9.9, (st.cy + com.cy) / 2], [15.6, (st.cy + com.cy) / 2]])(t);
    const s = kf([[0, 1.0], [0.8, 1.02], [1.5, 1.6], [3.9, 1.6], [4.6, 1.75], [8.4, 1.75], [9.9, 1.9], [15.6, 1.95]])(t);
    setCam(L3, ph.cx, cy, s);
    setWave(L3, 'm', t, 'static', seg(t, 1.7, 3.7));
    const recOn = t >= 4.75 && t < 6.75, ready = t >= 6.75;
    show(L3.k.mic, !recOn && !ready ? 1 : 0); show(L3.k.rec, recOn ? 1 : 0); show(L3.k.ready, ready ? 1 : 0);
    if (recOn) { setWave(L3, 'w', t, 'live'); L3.k.tm.textContent = `00:0${Math.floor(t - 4.75)}`; }
    setWave(L3, 'w2', t, 'static', 0);
    show(L3.k.send, ready ? 1 : 0.35);
    const s1 = pop(t, 7.7), s2 = pop(t, 9.75), c = pop(t, 10.3);
    show(L3.k.st1, clamp(s1) * (1 - clamp(s2))); show(L3.k.st2, clamp(s2)); L3.k.st2.style.transform = `scale(${0.7 + 0.3 * clamp(s2)})`;
    show(L3.k.com, clamp(c)); L3.k.com.style.transform = `translateY(${(1 - c) * 20}px)`;
    // petites étoiles autour du badge « Validé »
    const sp = L3.k.spark.children, k = seg(t, 9.75, 11.2);
    for (let i = 0; i < sp.length; i++) {
      const a = (i / sp.length) * Math.PI * 2, r = 40 + 90 * easeOut(k);
      sp[i].style.transform = `translate(${st.x + 110 + Math.cos(a) * r * 1.6}px,${st.cy + Math.sin(a) * r}px) rotate(${k * 90}deg)`;
      sp[i].style.opacity = k > 0 && k < 1 ? Math.sin(Math.PI * k) : 0;
    }
    drawCursor(L3, t, [[0.1, tab.cx + 80, tab.cy + 80], [0.35, tab.cx, tab.cy], [1.6, pl.x + 28, pl.cy], [4.7, mic.cx, mic.cy], [6.7, mic.x + 30, mic.cy], [7.45, snd.cx, snd.cy], [8.4, snd.cx + 90, snd.cy + 90]], [0.4, 1.65, 4.75, 6.75, 7.5], s);
  });
  clickSfx(L3, [0.4, 1.65, 4.75, 6.75, 7.5]); sfx('pop', 35.9 + 7.7); sfx('done', 35.9 + 9.75);

  // ── 4. Mot de passe oublié ─────────────────────────────────────────────────
  const L4 = layer(51.3, 58.9, `${SKY}${phone(`
      <div class="scr">
        <div style="text-align:center;margin:30px 0 16px">${LOGO(40)}</div>
        <div class="pcard" style="position:relative;height:470px">
          <div data-k="pA" style="position:absolute;inset:18px">
            <div style="font-size:24px;font-weight:800;text-align:center">Bienvenue sur Sihscool</div>
            ${label('Adresse e-mail *')}${field('e1', 'nom@exemple.com', { icon: 'mail' })}
            <div class="row" style="justify-content:space-between">${label('Mot de passe *')}<span data-k="fg" style="font-weight:800;font-size:13px;margin-top:10px;text-decoration:underline">Mot de passe oublié ?</span></div>
            ${field('p1', '••••••••', { icon: 'lock' })}
            <div class="btn" style="margin-top:22px">Accéder à mon espace</div>
          </div>
          <div data-k="pB" style="position:absolute;inset:18px">
            <div style="font-size:24px;font-weight:800;text-align:center">Mot de passe oublié</div>
            <div class="muted" style="text-align:center;font-size:15px;margin-top:6px">Recevez un lien pour en choisir un nouveau.</div>
            ${label('Votre e-mail *')}${field('e2', 'nom@exemple.com', { icon: 'mail' })}
            <div class="btn" data-k="rec" style="margin-top:20px">${ic('mail', 18)}Recevoir le lien</div>
            <div data-k="okm" class="row" style="margin-top:18px;padding:12px 14px;border-radius:16px;background:#EAF7E8;border:2px solid #BDE8B7;color:#1E7E44;font-weight:800;font-size:15px">${ic('check', 18)}E-mail envoyé ! Regardez votre boîte de réception.</div>
          </div>
        </div>
      </div>`, { x: PHX, y: PHY })}
    <div class="card white" data-k="alt" style="left:1250px;top:420px;width:470px;padding:24px 26px;box-sizing:border-box">
      <div class="row" style="gap:12px"><div class="avatar" style="background:#1F7A5A;color:#fff">${ic('chat', 22)}</div><div style="font-weight:800;font-size:21px">Ou demandez à l'enseignante</div></div>
      <div class="muted" style="font-size:18px;margin-top:8px">Elle vous crée un nouveau mot de passe en un clic, et vous l'envoie sur WhatsApp.</div>
    </div>${cursorHTML()}`, (t) => {
    const fg = P(L4, 'fg'), e2 = P(L4, 'e2'), rc = P(L4, 'rec');
    const ph = { cx: PHX + 220, cy: PHY + 450 };
    const cx = kf([[0, ph.cx], [4.6, ph.cx], [5.4, 1235], [7.6, 1235]])(t);
    const cy = kf([[0, ph.cy], [0.6, ph.cy], [1.3, fg.cy + 30], [3.9, fg.cy + 60], [5.4, 520], [7.6, 520]])(t);
    const s = kf([[0, 1.0], [0.6, 1.02], [1.3, 1.6], [3.9, 1.6], [5.4, 1.22], [7.6, 1.26]])(t);
    setCam(L4, cx, cy, s);
    const sw = ease(seg(t, 1.75, 2.05)); show(L4.k.pA, 1 - sw); show(L4.k.pB, sw);
    setField(L4, 'e1', '', t, false); setField(L4, 'p1', '', t, false);
    setField(L4, 'e2', typed('fatima@exemple.com', t, 2.35, 24), t, t > 2.2 && t < 3.2, { since: 2.2 });
    const ok = pop(t, 3.75); show(L4.k.okm, clamp(ok)); L4.k.okm.style.transform = `translateY(${(1 - ok) * 14}px)`;
    const al = pop(t, 5.0); show(L4.k.alt, clamp(al)); L4.k.alt.style.transform = `translateX(${(1 - al) * 40}px)`;
    drawCursor(L4, t, [[0.4, fg.cx + 70, fg.cy + 90], [1.5, fg.cx, fg.cy], [2.2, e2.x + 50, e2.cy], [3.4, rc.cx, rc.cy], [4.3, rc.cx + 90, rc.cy + 90]], [1.55, 2.22, 3.45], s);
  });
  clickSfx(L4, [1.55, 2.22, 3.45]); typeTicks(51.3 + 2.35, 'fatima@exemple.com'); sfx('done', 51.3 + 3.75); sfx('pop', 51.3 + 5.0);

  // ── Conclusion + carte de fin ──────────────────────────────────────────────
  const LC = brandScene(58.8, 62.9, `<div class="center"><div data-k="n">${LOGO(70)}</div><div class="big-line" data-k="l">Apprendre l'arabe avec <span class="hl" data-k="h">joie et douceur</span>.</div></div>`, null);
  const fC = LC.fn;
  LC.fn = (t, el, T) => {
    fC(t, el, T);
    const a = pop(t, 0.35), b = pop(t, 0.7);
    LC.k.n.style.opacity = clamp(a); LC.k.l.style.opacity = clamp(b); LC.k.l.style.transform = `translateY(${(1 - b) * 20}px) scale(${1 + t * 0.012})`;
    LC.k.h.style.backgroundSize = `${ease(seg(t, 1.6, 2.2)) * 100}% 78%`;
  };
  const LE = brandScene(62.8, 66, `<div class="center"><div data-k="n">${LOGO(150)}</div><div class="url" data-k="u">app.sihschool.com</div></div>`, null, { sweep: false, fadeOut: 0.6 });
  const fE = LE.fn;
  LE.fn = (t, el, T) => {
    fE(t, el, T);
    const a = pop(t, 0.2), b = pop(t, 0.6);
    LE.k.n.style.opacity = clamp(a); LE.k.n.style.transform = `scale(${0.94 + 0.06 * a})`;
    LE.k.u.style.opacity = clamp(b); LE.k.u.style.transform = `translateY(${(1 - b) * 14}px)`;
  };
  sfx('chime', 63.0);
}
