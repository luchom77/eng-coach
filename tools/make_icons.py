"""Generate the app icons (needs Pillow):  python3 tools/make_icons.py"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "icons"
OUT.mkdir(exist_ok=True)


def make(size: int) -> None:
    img = Image.new("RGB", (size, size), "#1d4ed8")  # full-bleed so Android can mask it freely
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default(size=int(size * 0.34))
    draw.text((size / 2, size / 2), "EC", font=font, fill="white", anchor="mm")
    # small gear-like ring as a motif, kept inside the central safe zone
    r = size * 0.30
    draw.ellipse((size / 2 - r, size / 2 - r, size / 2 + r, size / 2 + r), outline="white", width=max(2, size // 48))
    img.save(OUT / f"icon-{size}.png")


for s in (192, 512):
    make(s)
print("icons written to", OUT)
