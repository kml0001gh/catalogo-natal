#!/usr/bin/env python3
"""Genera el QR del folleto a partir de la URL final de la página.

Uso:
    python3 scripts/make-qr.py https://catalogo-natal.pages.dev

Salida (en la carpeta actual):
    qr-folheto.png  (1200×1200 px aprox., fondo blanco, para imprenta)
    qr-folheto.svg  (vectorial, escala sin pérdida)

Parámetros de impresión:
- Corrección de errores H (30 %): aguanta manchas, doblez o un logo encima.
- Zona de silencio de 4 módulos, el mínimo que exige la norma ISO 18004.
- A 2,5 cm de lado, una URL de ~30 caracteres con corrección H sale en
  versión 4 (33 módulos + margen = 41): cada módulo mide ~0,6 mm, por
  encima del mínimo legible (~0,4 mm). Cada carácter de más puede subir
  la versión y encoger los módulos; por eso conviene un subdominio corto.
  El script avisa si el módulo baja de 0,5 mm.

Requisitos: pip install qrcode pillow
"""

import sys

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H
    from qrcode.image.svg import SvgPathImage
except ImportError:
    sys.exit("Falta la librería 'qrcode'. Instala con:  pip install qrcode pillow")

try:
    from PIL import Image  # noqa: F401  (solo para comprobar que está)
except ImportError:
    sys.exit("Falta 'pillow'. Instala con:  pip install qrcode pillow")

TARGET_PX = 1200          # lado aproximado del PNG
BORDER_MODULES = 4        # zona de silencio (mínimo ISO)


def main() -> None:
    if len(sys.argv) != 2 or not sys.argv[1].startswith(("http://", "https://")):
        sys.exit("Uso: python3 scripts/make-qr.py https://url-final-de-la-pagina")
    url = sys.argv[1].strip()

    qr = qrcode.QRCode(
        version=None,                      # mínima versión que quepa
        error_correction=ERROR_CORRECT_H,
        border=BORDER_MODULES,
    )
    qr.add_data(url)
    qr.make(fit=True)

    modules = qr.modules_count
    total = modules + 2 * BORDER_MODULES
    box = max(1, round(TARGET_PX / total))
    qr.box_size = box

    png = qr.make_image(fill_color="black", back_color="white")
    png.save("qr-folheto.png")

    svg = qr.make_image(image_factory=SvgPathImage)
    svg.save("qr-folheto.svg")

    side_px = total * box
    module_mm = 25.0 / total
    print(f"URL:               {url} ({len(url)} caracteres)")
    print(f"Versión QR:        {qr.version} ({modules}×{modules} módulos, corrección H)")
    print(f"PNG:               qr-folheto.png ({side_px}×{side_px} px)")
    print(f"SVG:               qr-folheto.svg")
    print(f"Impreso a 2,5 cm:  módulo de {module_mm:.2f} mm "
          f"({'OK' if module_mm >= 0.5 else 'JUSTO: acorta la URL'})")
    if len(url) > 40:
        print("Aviso: la URL es larga; un subdominio más corto da un QR más legible.")


if __name__ == "__main__":
    main()
