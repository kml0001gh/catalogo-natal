#!/usr/bin/env python3
"""Genera los iconos de la página (para "Adicionar ao ecrã principal").

Uso:  python3 scripts/make-icons.py
Salida: assets/icons/icon-192.png, icon-512.png, apple-touch-icon.png (180 px)

Dibujo: fondo crema con esquinas suaves y dos alianzas doradas entrelazadas.
Requisitos: pip install pillow
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "icons"
CREMA = (247, 242, 234)
DOURADO = (168, 137, 79)


def draw(size: int, rounded: bool) -> Image.Image:
    s = 4  # supersampling para bordes suaves
    W = size * s
    im = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    radius = int(W * 0.22) if rounded else 0
    d.rounded_rectangle((0, 0, W - 1, W - 1), radius=radius, fill=CREMA)
    r = int(W * 0.21)
    w = max(2, int(W * 0.055))
    cx1, cy1 = int(W * 0.42), int(W * 0.54)
    cx2, cy2 = int(W * 0.58), int(W * 0.46)
    for cx, cy in ((cx1, cy1), (cx2, cy2)):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=DOURADO, width=w)
    return im.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    draw(192, rounded=False).save(OUT / "icon-192.png", optimize=True)
    draw(512, rounded=False).save(OUT / "icon-512.png", optimize=True)
    # iOS recorta las esquinas él mismo: fondo opaco sin redondear.
    draw(180, rounded=False).convert("RGB").save(OUT / "apple-touch-icon.png", optimize=True)
    for f in sorted(OUT.iterdir()):
        print(f"{f.name:<24}{f.stat().st_size // 1024:3d} KB")


if __name__ == "__main__":
    main()
