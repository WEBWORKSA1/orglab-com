"""Generates social/OG images (PNG) at build time. Requires Pillow."""
from PIL import Image, ImageDraw, ImageFont
import pathlib
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)
def font(name, size):
    for base in ("/usr/share/fonts/truetype/dejavu/", "/usr/share/fonts/dejavu/"):
        try: return ImageFont.truetype(base + name, size)
        except OSError: pass
    return ImageFont.load_default()
W, H = 1200, 630
im = Image.new("RGB", (W, H), "#0e3b2e"); d = ImageDraw.Draw(im)
for x in range(0, W, 40): d.line([(x, 0), (x, H)], fill="#14483a")
for y in range(0, H, 40): d.line([(0, y), (W, y)], fill="#14483a")
d.ellipse([850, -200, 1400, 350], fill="#1d6b52")
serif = font("DejaVuSerif-Bold.ttf", 104)
d.text((80, 150), "Org", font=serif, fill="white")
d.text((80 + d.textlength("Org", font=serif), 150), "Lab", font=serif, fill="#b7e35a")
d.text((84, 290), "The Organic Lab", font=font("DejaVuSans.ttf", 40), fill="#cfe0d4")
d.text((84, 380), "Independent testing · Free tools · Certification quotes", font=font("DejaVuSans-Bold.ttf", 30), fill="#b7e35a")
d.text((84, 520), "orglab.com", font=font("DejaVuSans.ttf", 40), fill="white")
im.save(OUT / "og.png", optimize=True)
ic = Image.new("RGB", (512, 512), "#0e3b2e"); d = ImageDraw.Draw(ic)
d.text((256, 256), "OL", font=font("DejaVuSerif-Bold.ttf", 150), fill="#b7e35a", anchor="mm")
ic.save(OUT / "icon-512.png")
print("images written")
