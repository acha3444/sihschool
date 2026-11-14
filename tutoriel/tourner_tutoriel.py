"""
Tourne la vidéo tutoriel Sihscool de A à Z sur l'appli en MODE DÉMO (local).

Prérequis : `npm run demo` lancé (http://localhost:5175).
Usage : python3 tutoriel/tourner_tutoriel.py
Sortie : tutoriel/brut/*.webm (assemblé ensuite par assembler.sh)
"""
import base64
import re
import shutil
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright, Page, Locator

BASE = "http://localhost:5175"
OUT = Path(__file__).parent / "brut"
W, H = 1280, 720

# Comptes et mots de passe de TEST (mode démo local uniquement)
DIRECTION = ("direction@demo.test", "demo1234")
PROF_EMAIL = "siham@demo.test"
PROF_MDP = "Siham-2026"
PARENT_EMAIL = "fatima@demo.test"
PARENT_MDP = "Fatima-2026"

OVERLAY_JS = r"""
(() => {
  if (window.__tuto) return;
  window.__tuto = true;
  const css = `
    #tuto-cursor{position:fixed;z-index:2147483647;width:26px;height:26px;margin:-4px 0 0 -4px;pointer-events:none;
      transition:transform .08s;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
    #tuto-cursor.down{transform:scale(.8)}
    #tuto-ring{position:fixed;z-index:2147483646;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
      border:3px solid #FFC400;pointer-events:none;opacity:0;transition:opacity .35s, transform .35s;transform:scale(.4)}
    #tuto-ring.on{opacity:1;transform:scale(1)}
    #tuto-cap{pointer-events:none;position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:2147483645;max-width:1060px;
      background:rgba(20,30,90,.92);color:#fff;font:700 24px/1.35 'Baloo 2',system-ui,sans-serif;padding:14px 26px;
      border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,.25);text-align:center;opacity:0;transition:opacity .3s}
    #tuto-cap.on{opacity:1}
    #tuto-cap b{color:#FFE15C}
    #tuto-step{position:fixed;top:16px;left:50%;transform:translateX(-50%);pointer-events:none;z-index:2147483645;background:#FFE15C;color:#1B2A7A;
      font:800 16px/1 'Baloo 2',system-ui,sans-serif;padding:9px 16px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.15);display:none}
    #tuto-card{position:fixed;inset:0;z-index:2147483640;display:none;align-items:center;justify-content:center;flex-direction:column;
      gap:18px;background:linear-gradient(160deg,#1B2A7A,#3B4BB0);color:#fff;font-family:'Baloo 2',system-ui,sans-serif;text-align:center;padding:40px}
    #tuto-card h1{font-size:64px;font-weight:800;margin:0;line-height:1.1;color:#fff !important}
    #tuto-card p{font-size:28px;font-weight:600;margin:0;opacity:.92;max-width:900px;color:#fff !important}
    #tuto-card .pill{background:#FFE15C;color:#1B2A7A;font-weight:800;font-size:20px;padding:8px 20px;border-radius:999px}
  `;
  const install = () => {
    if (document.getElementById('tuto-cap')) return;
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const cur = document.createElement('div'); cur.id = 'tuto-cursor';
    cur.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 2l7 19 2.5-7.5L20 11z" fill="#fff" stroke="#1B2A7A" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const ring = document.createElement('div'); ring.id = 'tuto-ring';
    const cap = document.createElement('div'); cap.id = 'tuto-cap';
    const step = document.createElement('div'); step.id = 'tuto-step';
    const card = document.createElement('div'); card.id = 'tuto-card';
    document.body.append(cur, ring, cap, step, card);
    const pos = JSON.parse(sessionStorage.getItem('tuto-pos') || '[640,400]');
    cur.style.left = pos[0] + 'px'; cur.style.top = pos[1] + 'px';
    document.addEventListener('mousemove', e => {
      cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
      sessionStorage.setItem('tuto-pos', JSON.stringify([e.clientX, e.clientY]));
    }, true);
    document.addEventListener('mousedown', e => {
      cur.classList.add('down'); ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
      ring.classList.add('on'); setTimeout(() => ring.classList.remove('on'), 380);
    }, true);
    document.addEventListener('mouseup', () => cur.classList.remove('down'), true);
    const s = sessionStorage.getItem('tuto-stepname'); if (s) { step.textContent = s; step.style.display = 'block'; }
  };
  window.__cap = (html) => { install(); const c = document.getElementById('tuto-cap');
    if (!html) { c.classList.remove('on'); return; } c.innerHTML = html; c.classList.add('on'); };
  window.__step = (t) => { install(); sessionStorage.setItem('tuto-stepname', t || '');
    const s = document.getElementById('tuto-step'); s.textContent = t; s.style.display = t ? 'block' : 'none'; };
  window.__card = (html) => { install(); const c = document.getElementById('tuto-card');
    if (!html) { c.style.display = 'none'; return; } c.innerHTML = html; c.style.display = 'flex'; };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
"""


class Tuto:
    def __init__(self, page: Page):
        self.p = page
        self.mouse = [W / 2, H / 2]

    # ─── Mise en scène
    def wait(self, s: float):
        self.p.wait_for_timeout(int(s * 1000))

    def cap(self, html: str, secs: float = 3.2):
        self.p.evaluate("h => window.__cap(h)", html)
        self.wait(secs)

    def nocap(self):
        self.p.evaluate("() => window.__cap('')")

    def step(self, name: str):
        self.p.evaluate("t => window.__step(t)", name)

    def card(self, title: str, sub: str = "", pill: str = "", secs: float = 3.5):
        self.nocap()
        html = (f'<span class="pill">{pill}</span>' if pill else "") + f"<h1>{title}</h1>" + (f"<p>{sub}</p>" if sub else "")
        self.p.evaluate("h => window.__card(h)", html)
        self.wait(secs)
        self.p.evaluate("() => window.__card('')")

    # ─── Actions visibles
    def move_to(self, loc: Locator):
        try:
            loc.scroll_into_view_if_needed(timeout=3000)
        except Exception:
            pass
        box = loc.bounding_box(timeout=10000)
        if not box:
            return
        x, y = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
        dist = ((x - self.mouse[0]) ** 2 + (y - self.mouse[1]) ** 2) ** 0.5
        self.p.mouse.move(x, y, steps=max(12, int(dist / 18)))
        self.mouse = [x, y]
        self.wait(0.25)

    def click(self, loc: Locator, pause: float = 0.7):
        loc = loc.first
        loc.wait_for(state="visible", timeout=10000)
        self.move_to(loc)
        self.p.mouse.click(*self.mouse)
        self.wait(pause)

    def type(self, loc: Locator, text: str, delay: int = 45):
        loc = loc.first
        self.click(loc, pause=0.2)
        loc.fill("")
        loc.press_sequentially(text, delay=delay)
        self.wait(0.3)

    def btn(self, name, exact=False) -> Locator:
        return self.p.get_by_role("button", name=name, exact=exact)

    # ─── Parcours communs
    def login(self, email: str, mdp: str):
        self.type(self.p.locator('input[type="email"]'), email)
        self.type(self.p.locator('input[type="password"]'), mdp)
        self.click(self.btn(re.compile("Accéder")), pause=2.0)

    def first_login_password(self, new_mdp: str):
        self.p.get_by_text("Première Connexion").wait_for(state="visible", timeout=15000)
        self.wait(0.6)
        modal = self.p.locator("form").filter(has_text="Confirmez votre nouveau mot de passe")
        inputs = modal.locator('input[type="password"]')
        self.cap("Première connexion : chacun choisit <b>son propre mot de passe</b>.", 3)
        self.type(inputs.nth(0), new_mdp)
        self.type(inputs.nth(1), new_mdp)
        self.click(self.btn(re.compile("Enregistrer mon mot de passe")), pause=0.6)
        self.nocap()
        self.wait(1.6)

    def logout(self):
        self.click(self.btn("Déconnexion"), pause=1.8)

    def temp_password_from_page(self) -> str:
        self.wait(0.5)
        m = re.search(r"SIH-\d{6}", self.p.locator("body").inner_text())
        if not m:
            raise RuntimeError("Mot de passe temporaire introuvable à l'écran")
        return m.group(0)


def run():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    with sync_playwright() as pw:
        chrome = Path.home() / "Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
        browser = pw.chromium.launch(
            executable_path=str(chrome) if chrome.exists() else None,
            args=["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--lang=fr-FR", "--window-size=1280,807"]  # 807 = 720 px de page + cadre de la fenêtre
        )
        ctx = browser.new_context(
            no_viewport=True,
            locale="fr-FR",
            permissions=["microphone", "clipboard-read", "clipboard-write"],
        )
        ctx.add_init_script(OVERLAY_JS)
        page = ctx.new_page()
        page.on("dialog", lambda d: d.accept())

        # Capture des images directement depuis Chrome (screencast)
        frames_dir = OUT / "images"
        frames_dir.mkdir()
        frames = []
        cdp = ctx.new_cdp_session(page)

        def on_frame(ev):
            n = len(frames)
            path = frames_dir / f"f{n:05d}.jpg"
            path.write_bytes(base64.b64decode(ev["data"]))
            frames.append((ev["metadata"]["timestamp"], path.name))
            try:
                cdp.send("Page.screencastFrameAck", {"sessionId": ev["sessionId"]})
            except Exception:
                pass

        cdp.on("Page.screencastFrame", on_frame)

        def start_capture():
            cdp.send("Page.startScreencast", {"format": "jpeg", "quality": 88, "maxWidth": W, "maxHeight": H, "everyNthFrame": 1})
        t = Tuto(page)
        try:
            scenario(t, page, start_capture)
        except Exception:
            page.screenshot(path=str(OUT / "erreur.png"))
            ctx.close()
            browser.close()
            raise

        page.wait_for_timeout(500)
        cdp.send("Page.stopScreencast")
        ctx.close()
        browser.close()

        # Liste ffmpeg : chaque image reste affichée jusqu'à la suivante
        lines = []
        for k, (ts, name) in enumerate(frames):
            dur = (frames[k + 1][0] - ts) if k + 1 < len(frames) else 1.0
            lines.append(f"file 'images/{name}'\nduration {max(dur, 0.001):.4f}")
        lines.append(f"file 'images/{frames[-1][1]}'")
        (OUT / "images.txt").write_text("\n".join(lines) + "\n")
        print("OK", len(frames), "images,", round(frames[-1][0] - frames[0][0], 1), "secondes")


def scenario(t: "Tuto", page: Page, start_capture):

    # Démo propre
    page.goto(f"{BASE}/login?reset")
    page.wait_for_load_state("networkidle")
    page.goto(f"{BASE}/login")
    page.wait_for_load_state("networkidle")
    page.evaluate("() => window.__cap('')")  # installe les calques du tutoriel
    t.p.evaluate("h => window.__card(h)", "<h1>Sihscool</h1>")
    page.wait_for_timeout(1000)
    start_capture()

    # ── INTRO
    t.card("Sihscool", "Tutoriel complet : comptes, groupes, devoirs en vocal et liens Zoom", "TUTORIEL", 4.5)
    t.card("Les 3 espaces", "Direction · Enseignante · Parents et élèves", "", 3.5)

    # ── 1. DIRECTION
    t.card("1. Espace Direction", "Créer le compte de l'enseignante", "ÉTAPE 1", 3)
    t.step("Direction")
    t.cap("Tout le monde se connecte au même endroit : <b>app.sihschool.com</b>", 3.2)
    t.cap("La direction se connecte avec son e-mail et son mot de passe.", 2.5)
    t.login(*DIRECTION)
    t.cap("Voici l'espace Direction. Les onglets sont en haut.", 3.2)
    t.click(t.btn(re.compile("^Enseignantes")))
    t.cap("Onglet <b>Enseignantes</b> : on crée le compte de l'enseignante.", 2.8)
    t.click(t.btn("Ajouter une enseignante"))
    t.type(page.get_by_placeholder("Ex: Fatima"), "Siham")
    t.type(page.get_by_placeholder("fatima@exemple.com"), PROF_EMAIL)
    t.type(page.get_by_placeholder("06 12 34 56 78"), "06 12 34 56 78")
    t.click(t.btn(re.compile("Créer le compte")), pause=1.5)
    prof_tmp = t.temp_password_from_page()
    t.cap("Le compte est créé avec un <b>mot de passe temporaire</b>.", 3.5)
    t.click(t.btn(re.compile("Copier l'invitation")))
    t.cap("On copie le message et on l'envoie à l'enseignante sur <b>WhatsApp</b>.", 3.5)
    page.keyboard.press("Escape")
    close = page.get_by_role("button", name=re.compile("Fermer"))
    if close.count():
        t.click(close.last, pause=0.8)
    t.nocap()
    t.logout()

    # ── 2. ENSEIGNANTE
    t.card("2. Espace Enseignante", "Groupes, liens Zoom, élèves et devoirs", "ÉTAPE 2", 3)
    t.step("Enseignante")
    t.cap("L'enseignante se connecte avec l'identifiant reçu sur WhatsApp.", 2.5)
    t.login(PROF_EMAIL, prof_tmp)
    t.first_login_password(PROF_MDP)
    t.cap("Bienvenue ! Son espace a 4 onglets : <b>Devoirs</b>, <b>Élèves & comptes</b>, <b>Groupes & Zoom</b>, <b>Annonces</b>.", 4)

    # Groupe + Zoom
    t.click(t.btn(re.compile("Groupes & Zoom")))
    t.cap("D'abord, on crée un groupe avec son jour, son horaire et son <b>lien Zoom</b>.", 3)
    t.click(t.btn(re.compile("Créer un nouveau groupe")))
    t.type(page.get_by_placeholder("Ex : Nourania Débutants - Mercredi A"), "Nourania Enfants")
    t.type(page.get_by_placeholder(re.compile("Ex : 14:00")), "14:00 - 15:00")
    t.type(page.get_by_placeholder("https://zoom.us/j/..."), "https://zoom.us/j/1234567890", delay=25)
    t.cap("Le lien Zoom sera affiché aux parents et aux élèves du groupe.", 2.5)
    t.click(t.btn("Créer la classe"), pause=1.8)
    t.cap("Le groupe est prêt, avec son bouton Zoom.", 2.8)

    # Inscription élève + parent
    t.click(t.btn(re.compile("Élèves & comptes")))
    t.cap("Onglet <b>Élèves & comptes</b> : on inscrit un élève.", 2.6)
    t.click(t.btn("Inscrire un élève"))
    form = page.locator("form").filter(has_text="Inscrire un élève")
    t.cap("Pour un enfant, on crée aussi le <b>compte du parent</b>.", 2.6)
    inputs = form.locator("input")
    t.type(inputs.nth(0), "Yasmine")
    t.type(inputs.nth(1), "Benali")
    sel = form.locator("select").first
    t.move_to(sel)
    sel.select_option(index=1)
    t.wait(0.6)
    t.type(inputs.nth(2), "Fatima")
    t.type(inputs.nth(3), "Benali")
    t.type(inputs.nth(4), PARENT_EMAIL)
    t.type(inputs.nth(5), "06 98 76 54 32")
    t.click(t.btn("Valider l'inscription"), pause=1.6)
    parent_tmp = t.temp_password_from_page()
    t.cap("Le message avec les identifiants du parent est prêt : on l'envoie sur <b>WhatsApp</b>.", 3.8)
    t.click(t.btn("Copier le message"))
    t.click(page.get_by_role("button", name="Fermer"))
    t.cap("Yasmine est inscrite dans le groupe Nourania Enfants.", 2.8)

    # Devoir avec vocal
    t.click(t.btn(re.compile("^Devoirs")))
    t.cap("Onglet <b>Devoirs</b> : on donne un devoir au groupe.", 2.6)
    t.click(t.btn(re.compile("Donner un devoir")))
    t.type(page.get_by_placeholder(re.compile("Exercice Nourania")), "Leçon 1 : alif, ba, ta")
    t.type(page.get_by_placeholder(re.compile("^Exemple")), "Écoute mon vocal, puis lis les trois lettres à voix haute et envoie ton enregistrement.", delay=20)
    t.cap("On peut ajouter un <b>vocal</b> : appuyer sur le micro, parler, puis terminer.", 3)
    t.click(t.btn(re.compile("Appuyer pour enregistrer")), pause=0.4)
    t.cap("🎙️ Enregistrement en cours...", 3)
    t.click(t.btn(re.compile("Terminer l'enregistrement")), pause=1)
    t.cap("Le vocal est prêt. On peut l'écouter avant d'envoyer.", 2.6)
    t.click(t.btn("Envoyer le devoir au groupe"), pause=1.8)
    t.cap("Le devoir est envoyé à tous les élèves du groupe.", 2.8)

    # Annonce
    t.click(t.btn(re.compile("^Annonces")))
    t.cap("Onglet <b>Annonces</b> : un message pour les familles.", 2.4)
    t.click(t.btn(re.compile("Publier une annonce")))
    t.type(page.get_by_placeholder(re.compile("Rappel matériel")), "Cours de mercredi")
    t.type(page.get_by_placeholder(re.compile("Écrivez votre message")), "Pensez à préparer le cahier et un crayon. À mercredi in shaa Allah !", delay=20)
    t.click(t.btn("Publier", exact=True), pause=1.6)
    t.nocap()
    t.logout()

    # ── 3. PARENT
    t.card("3. Espace Parents", "Zoom, annonces et réponse en vocal", "ÉTAPE 3", 3)
    t.step("Parent")
    t.cap("Le parent se connecte avec les identifiants reçus sur WhatsApp.", 2.5)
    t.login(PARENT_EMAIL, parent_tmp)
    t.first_login_password(PARENT_MDP)
    t.cap("Ici : le jour et l'heure du cours, et le bouton <b>Rejoindre sur Zoom</b>.", 3.6)
    zoom = page.get_by_role("link", name=re.compile("Rejoindre sur Zoom"))
    if zoom.count():
        t.move_to(zoom.first)
        t.wait(1.2)
    page.mouse.wheel(0, 380)
    t.cap("En dessous, les <b>annonces</b> de l'enseignante.", 2.8)
    page.mouse.wheel(0, -380)
    t.click(t.btn(re.compile("^Devoirs")))
    t.cap("Onglet <b>Devoirs</b> : la consigne et le vocal de l'enseignante.", 3.2)
    rec = t.btn(re.compile("Appuyer pour enregistrer"))
    t.move_to(rec.first)
    t.cap("L'enfant récite au micro...", 1.6)
    t.click(rec, pause=0.4)
    t.cap("🎙️ Yasmine récite sa leçon...", 3)
    t.click(t.btn(re.compile("Terminer l'enregistrement")), pause=1)
    t.click(t.btn(re.compile("Envoyer ma récitation")), pause=1.8)
    t.cap("C'est envoyé ! La maîtresse va écouter et répondre.", 3)
    t.nocap()
    t.logout()

    # ── 4. CORRECTION
    t.card("4. Corriger les vocaux", "L'enseignante écoute et répond", "ÉTAPE 4", 3)
    t.step("Enseignante")
    t.login(PROF_EMAIL, PROF_MDP)
    t.click(t.btn(re.compile("Récitations des élèves")), pause=1)
    t.cap("Sous chaque devoir : les <b>récitations reçues</b>. On les écoute ici.", 3.4)
    t.click(t.btn(re.compile("Valider")))
    t.type(page.get_by_placeholder(re.compile("Remarque pour l'élève")), "Très bien Yasmine, bravo ! 🌟")
    t.click(t.btn("Enregistrer", exact=True), pause=1.5)
    t.cap("La correction est envoyée à la famille.", 2.6)

    # Mot de passe oublié
    t.click(t.btn(re.compile("Élèves & comptes")))
    t.cap("Un parent a oublié son mot de passe ? Bouton <b>Nouveau mot de passe</b>.", 3)
    t.click(t.btn(re.compile("Nouveau mot de passe")), pause=1.5)
    parent_tmp2 = t.temp_password_from_page()
    t.cap("Un nouveau mot de passe temporaire est créé, à envoyer sur WhatsApp.", 3.2)
    t.click(page.get_by_role("button", name="Fermer"))
    t.cap("Et chacun peut changer son mot de passe avec le bouton <b>Mot de passe</b> en haut.", 3)
    t.click(t.btn(re.compile("Mot de passe")), pause=1.2)
    t.wait(1.5)
    t.click(page.get_by_role("button", name="Fermer"), pause=0.6)
    t.nocap()
    t.logout()

    # ── 5. RETOUR PARENT
    t.card("5. Le retour au parent", "Nouveau mot de passe et correction", "ÉTAPE 5", 3)
    t.step("Parent")
    t.cap("Fatima se connecte avec le <b>nouveau mot de passe temporaire</b> reçu.", 2.8)
    t.login(PARENT_EMAIL, parent_tmp2)
    t.first_login_password(PARENT_MDP)
    t.nocap()
    t.click(t.btn(re.compile("^Devoirs")), pause=1)
    valide = page.get_by_text(re.compile("Validé par l'enseignante")).first
    valide.wait_for(state="visible", timeout=10000)
    valide.evaluate("el => el.scrollIntoView({behavior: 'smooth', block: 'center'})")
    t.wait(1.2)
    t.move_to(valide)
    t.cap("Le parent voit la réponse : <b>Validé</b>, avec le message de l'enseignante.", 4.5)
    t.nocap()
    t.wait(0.5)
    t.step("")
    t.nocap()

    t.card("C'est tout !", "app.sihschool.com", "SIHSCOOL", 4)


if __name__ == "__main__":
    try:
        run()
    except Exception as e:  # message clair si une étape échoue
        print("ERREUR :", e, file=sys.stderr)
        raise
