#!/usr/bin/env python3
"""Genera un mapa estático (sin cookies ni scripts de terceros) con la
posición de la tienda, a partir de teselas de OpenStreetMap.

Uso:
    python3 scripts/make-map.py                      # geocodifica la dirección
    python3 scripts/make-map.py --lat 39.0917 --lon -9.2585   # coordenadas a mano

Salida: assets/mapa.jpg (760×460, ~60–90 KB) con un pin dorado y la
atribución obligatoria "© OpenStreetMap contributors".

Las teselas se descargan una sola vez, aquí; la página sirve la imagen.
Requisitos: pip install pillow
"""

import argparse
import io
import json
import math
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "mapa.jpg"
ADDRESS = "Rua Serpa Pinto 28A, Torres Vedras, Portugal"
UA = "catalogo-natal-demo/1.0 (static map generator; one-off download)"
ZOOM = 17
W, H = 760, 460
DOURADO = (168, 137, 79)
TINTA = (43, 37, 32)


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        return urllib.request.urlopen(req, timeout=30).read()
    except Exception:  # noqa: BLE001  (p. ej. Python sin certificados raíz)
        import subprocess
        r = subprocess.run(["curl", "-sSL", "--max-time", "30", "-A", UA, url], capture_output=True)
        if r.returncode != 0:
            raise RuntimeError(r.stderr.decode(errors="ignore").strip() or "curl falhou")
        return r.stdout


def geocode(q: str):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": q, "format": "json", "limit": 1})
    data = json.loads(fetch(url))
    if not data:
        sys.exit(f"Nominatim no encontró: {q}. Pasa --lat/--lon a mano.")
    return float(data[0]["lat"]), float(data[0]["lon"]), data[0].get("display_name", "")


def deg2pix(lat, lon, z):
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n * 256
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n * 256
    return x, y


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lat", type=float)
    ap.add_argument("--lon", type=float)
    a = ap.parse_args()
    if a.lat is None or a.lon is None:
        lat, lon, name = geocode(ADDRESS)
        print(f"Geocodificado: {lat:.5f}, {lon:.5f}  ({name[:70]})")
    else:
        lat, lon = a.lat, a.lon

    px, py = deg2pix(lat, lon, ZOOM)
    x0, y0 = px - W / 2, py - H / 2
    tx0, ty0 = int(x0 // 256), int(y0 // 256)
    tx1, ty1 = int((x0 + W) // 256), int((y0 + H) // 256)
    canvas = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256), (240, 236, 228))
    try:
        for tx in range(tx0, tx1 + 1):
            for ty in range(ty0, ty1 + 1):
                tile = Image.open(io.BytesIO(fetch(f"https://tile.openstreetmap.org/{ZOOM}/{tx}/{ty}.png"))).convert("RGB")
                canvas.paste(tile, ((tx - tx0) * 256, (ty - ty0) * 256))
    except Exception as e:  # noqa: BLE001
        sys.exit(f"No se pudieron descargar las teselas ({e}). La página mostrará el placeholder.")

    im = canvas.crop((int(x0 - tx0 * 256), int(y0 - ty0 * 256), int(x0 - tx0 * 256) + W, int(y0 - ty0 * 256) + H))
    # Tono cálido suave para que case con la página
    im = Image.blend(im, Image.new("RGB", im.size, (247, 242, 234)), 0.12)

    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    # Pin: círculo + punta
    d.polygon([(cx, cy + 4), (cx - 14, cy - 18), (cx + 14, cy - 18)], fill=DOURADO)
    d.ellipse((cx - 16, cy - 44, cx + 16, cy - 12), fill=DOURADO, outline=(255, 255, 255), width=3)
    d.ellipse((cx - 6, cy - 34, cx + 6, cy - 22), fill=(255, 255, 255))
    # Atribución
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 13)
    except Exception:  # noqa: BLE001
        font = ImageFont.load_default()
    txt = "© OpenStreetMap contributors"
    tw = d.textlength(txt, font=font)
    d.rectangle((W - tw - 14, H - 22, W, H), fill=(255, 255, 255))
    d.text((W - tw - 7, H - 19), txt, fill=TINTA, font=font)

    im.save(OUT, "JPEG", quality=70, optimize=True, progressive=True)
    print(f"Guardado {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
