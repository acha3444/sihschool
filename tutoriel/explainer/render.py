"""Rend une page seek(t) en MP4 (flou de mouvement + bande son de la page).
  python3 render.py page.html out.mp4 [fps=30] [sous-images=2] [workers=6]
  python3 render.py page.html planche.png --stills 0.5,1.2,3
"""
import asyncio
import base64
import math
import subprocess
import sys
import time
from pathlib import Path

from playwright.async_api import async_playwright

CHROME = Path.home() / "Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"


def run(args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


async def main():
    html, out = sys.argv[1], sys.argv[2]
    url = Path(html).resolve().as_uri() + "?render"
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=str(CHROME) if CHROME.exists() else None,
                                           args=["--allow-file-access-from-files"])

        async def open_page(V):
            page = await browser.new_page(viewport={"width": V["w"], "height": V["h"]}, device_scale_factor=1)
            await page.goto(url)
            await page.wait_for_function("window.VIDEO && typeof window.seek === 'function'")
            bad = await page.evaluate("""async () => { await Promise.all([...document.fonts].map(f => f.load().catch(() => {})));
              await document.fonts.ready; return [...document.fonts].filter(f => f.status !== 'loaded').map(f => f.family); }""")
            if bad:
                print("ATTENTION polices non chargées :", set(bad))
            return page

        probe = await browser.new_page()
        await probe.goto(url)
        await probe.wait_for_function("window.VIDEO && typeof window.seek === 'function'")
        V = await probe.evaluate("window.VIDEO")
        await probe.close()

        async def shot(page, t):
            await page.evaluate("t => window.seek(t)", t)
            return await page.screenshot(type="jpeg", quality=93)

        if sys.argv[3:4] == ["--stills"]:
            page = await open_page(V)
            times = [float(x) for x in sys.argv[4].split(",")]
            d = Path(out + ".frames"); d.mkdir(exist_ok=True)
            for i, t in enumerate(times):
                (d / f"{i:03d}.jpg").write_bytes(await shot(page, t))
            await browser.close()
            cols = min(3, len(times)); rows = math.ceil(len(times) / cols)
            run(["-framerate", "1", "-i", f"{d}/%03d.jpg", "-vf", f"scale=960:-1,tile={cols}x{rows}:padding=6:color=gray", "-frames:v", "1", out])
            for f in d.iterdir():
                f.unlink()
            d.rmdir()
            print("planche ->", out)
            return

        fps = int(sys.argv[3]) if len(sys.argv) > 3 else 30
        sub = max(1, int(sys.argv[4])) if len(sys.argv) > 4 else 2
        workers = max(1, int(sys.argv[5])) if len(sys.argv) > 5 else 6
        N = round(V["duration"] * fps)
        base = out[:-4] if out.endswith(".mp4") else out
        silent = base + "_silent.mp4"
        vf = ["-vf", f"tmix=frames={sub},select='eq(mod(n\\,{sub})\\,{sub - 1})',setpts=N/({fps}*TB)"] if sub > 1 else []
        per = math.ceil(N / workers)
        t0 = time.time(); done = [0]

        async def worker(w):
            a, b = w * per, min(N, (w + 1) * per)
            if a >= b:
                return None
            seg = f"{base}_seg{w}.mp4"
            page = await open_page(V)
            ff = await asyncio.create_subprocess_exec("ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(fps * sub), "-i", "-", *vf,
                                                      "-r", str(fps), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-preset", "medium", seg,
                                                      stdin=asyncio.subprocess.PIPE)
            for f in range(a, b):
                for s in range(sub):
                    buf = await shot(page, (f + ((s / sub) * 0.5 if sub > 1 else 0)) / fps)
                    ff.stdin.write(buf)
                    await ff.stdin.drain()
                done[0] += 1
                if done[0] % 60 == 0:
                    print(f"\r{done[0]}/{N} images  {time.time() - t0:.0f}s", end="", flush=True)
            ff.stdin.close(); await ff.wait(); await page.close()
            return seg

        segs = [s for s in await asyncio.gather(*[worker(w) for w in range(workers)]) if s]
        lst = base + "_segs.txt"
        Path(lst).write_text("\n".join(f"file '{Path(s).resolve()}'" for s in segs))
        run(["-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", silent])
        for s in segs:
            Path(s).unlink()
        Path(lst).unlink()
        print(f"\nvidéo -> {silent}  ({time.time() - t0:.0f}s)")

        page = await open_page(V)
        b64 = await page.evaluate("""async (dur) => {
          const sr = 48000, ctx = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
          await window.buildAudio(ctx);
          const b = await ctx.startRendering(), L = b.getChannelData(0), R = b.getChannelData(b.numberOfChannels > 1 ? 1 : 0);
          const i16 = new Int16Array(L.length * 2);
          for (let i = 0; i < L.length; i++) { i16[2*i] = Math.max(-1, Math.min(1, L[i])) * 32767; i16[2*i+1] = Math.max(-1, Math.min(1, R[i])) * 32767; }
          const u8 = new Uint8Array(i16.buffer); let s = '';
          for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
          return btoa(s); }""", V["duration"])
        pcm = base + ".pcm"
        Path(pcm).write_bytes(base64.b64decode(b64))
        run(["-i", silent, "-f", "s16le", "-ar", "48000", "-ac", "2", "-i", pcm, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
             "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out])
        Path(pcm).unlink()
        print("avec son ->", out)
        await browser.close()


asyncio.run(main())
