#!/usr/bin/env python3
"""Redimensiona y comprime las fotos de las piezas a 800×800 (recorte
cuadrado centrado) y ~60–90 KB cada una.

Uso:
  1. Copia las fotos originales en assets/pecas/originais/ con el nombre
     final (aliancas.jpg, pulseira-prata.jpg, ...). Vale .jpg, .jpeg, .png,
     .webp o .heic (HEIC solo si está instalado pillow-heif).
  2. python3 scripts/optimize-images.py
  3. Las versiones optimizadas quedan en assets/pecas/<nombre>.jpg

Empieza en calidad 72 y baja de 6 en 6 hasta cumplir MAX_KB (mínimo 50).

Requisitos: pip install pillow
"""

import io
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Falta 'pillow'. Instala con:  pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "pecas" / "originais"
DST = ROOT / "assets" / "pecas"
SIZE = 800
QUALITY = 72
MIN_QUALITY = 50
MAX_KB = 90
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


def main() -> None:
    if not SRC.is_dir():
        sys.exit(f"No existe {SRC}. Crea la carpeta y pon ahí las fotos originales.")
    files = sorted(p for p in SRC.iterdir() if p.suffix.lower() in EXTS)
    if not files:
        sys.exit(f"No hay fotos en {SRC}.")

    try:
        import pillow_heif  # noqa: F401
        pillow_heif.register_heif_opener()
    except ImportError:
        pass

    total = 0
    for f in files:
        im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        im = ImageOps.fit(im, (SIZE, SIZE), Image.LANCZOS, centering=(0.5, 0.5))
        q = QUALITY
        while True:
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=q, optimize=True, progressive=True, subsampling=2)
            kb = len(buf.getvalue()) // 1024
            if kb <= MAX_KB or q <= MIN_QUALITY:
                break
            q -= 6
        out = DST / (f.stem + ".jpg")
        out.write_bytes(buf.getvalue())
        total += kb
        flag = f"  <-- sigue por encima de {MAX_KB} KB a calidad {q}; busca otra foto" if kb > MAX_KB else ""
        print(f"{out.name:<28}{kb:4d} KB  (calidad {q}){flag}")

    print(f"Total fotos: {total} KB. Listo; comprueba el resultado en el navegador.")


if __name__ == "__main__":
    main()
