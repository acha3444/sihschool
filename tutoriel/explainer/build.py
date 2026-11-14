"""Assemble les vidéos explicatives en fichiers HTML autonomes (polices + voix intégrées).
Usage : python3 build.py   →   enseignante.html, parents.html
"""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
b64 = lambda p: base64.b64encode((ROOT / p).read_bytes()).decode()

# Moments où chaque passage de voix démarre (secondes)
VIDEOS = {
    "enseignante": {
        "titre": "Espace enseignante",
        "scenes": "ens.js",
        "voix": [("e1-intro", 1.0), ("e2-connexion", 10.6), ("e3-groupe", 19.6), ("e4-lien", 28.6),
                 ("e5-devoir", 38.2), ("e6-correction", 47.0), ("e7-annonces", 54.8), ("e8-fin", 62.2)],
    },
    "parents": {
        "titre": "Espace parents et élèves",
        "scenes": "par.js",
        "voix": [("p1-intro", 0.9), ("p2-inscription", 8.4), ("p3-zoom", 21.2), ("p4-annonces", 30.6),
                 ("p5-devoir", 34.6), ("p6-reciter", 39.8), ("p7-retour", 45.0), ("p8-mdp", 51.6), ("p9-fin", 59.0)],
    },
}

css = (SRC / "style.css").read_text()
css = (css.replace("__BALOO_LATIN__", b64("fonts/baloo-latin.woff2"))
          .replace("__BALOO_EXT__", b64("fonts/baloo-latinext.woff2"))
          .replace("__NASKH__", b64("fonts/naskh.woff2")))
core = (SRC / "core.js").read_text()
ui = (SRC / "ui.js").read_text()

for name, v in VIDEOS.items():
    scenes = SRC / v["scenes"]
    if not scenes.exists():
        print("(ignoré, pas encore écrit)", name)
        continue
    voix = [{"t": t, "b64": b64(f"voix/{vid}.mp3")} for vid, t in v["voix"]]
    html = f"""<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Sihscool – {v['titre']}</title>
<style>{css}</style></head>
<body><div id="stage"><div id="layers"></div></div>
<div id="ctrl"><button id="play">Lecture / Pause</button><input id="scrub" type="range" min="0" value="0"><span id="time">0.00 s</span></div>
<script>
{core}
{ui}
const VOIX = {json.dumps(voix)};
{scenes.read_text()}
boot(build);
</script></body></html>"""
    (ROOT / f"{name}.html").write_text(html)
    print("OK", name + ".html", round(len(html) / 1e6, 2), "Mo")
