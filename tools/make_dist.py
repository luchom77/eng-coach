"""Copy only the files the phone needs into dist/ (this is the folder you upload to a web host).

Run:  python3 tools/make_dist.py
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
FILES = ["index.html", "style.css", "engine.js", "app.js", "sw.js", "manifest.webmanifest",
         "data/bank.js", "icons/icon-192.png", "icons/icon-512.png"]

# every file the service worker caches must exist, or offline install would fail
sw = (ROOT / "sw.js").read_text(encoding="utf-8")
cached = re.findall(r"'\./([^']+)'", sw)
missing = [f for f in cached if f and f not in FILES]
assert not missing, f"sw.js caches files that make_dist does not copy: {missing}"

if DIST.exists():
    shutil.rmtree(DIST)
for rel in FILES:
    src = ROOT / rel
    if not src.exists():
        raise SystemExit(f"Missing {rel}. Run tools/build_bank.py and tools/make_icons.py first.")
    (DIST / rel).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, DIST / rel)
print(f"dist/ ready with {len(FILES)} files:", ", ".join(FILES))
