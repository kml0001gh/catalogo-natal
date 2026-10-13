#!/usr/bin/env bash
# Redimensiona y comprime las fotos de las piezas a 800×800 (recorte
# cuadrado centrado) y ~60–80 KB cada una.
#
# Uso:
#   1. Copia las fotos originales en assets/pecas/originais/ con el nombre
#      final (aliancas.jpg, pulseira-prata.jpg, ...). Vale .jpg, .jpeg,
#      .png o .heic.
#   2. bash scripts/optimize-images.sh
#   3. Las versiones optimizadas quedan en assets/pecas/<nombre>.jpg
#
# Usa ImageMagick (magick) si está instalado; si no, sips, que viene con
# macOS. Ajusta QUALITY si alguna foto sale muy pesada.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets/pecas/originais"
DST="$ROOT/assets/pecas"
SIZE=800
QUALITY=72
MAX_KB=90

if [ ! -d "$SRC" ]; then
  echo "No existe $SRC. Crea la carpeta y pon ahí las fotos originales." >&2
  exit 1
fi

shopt -s nullglob nocaseglob
files=("$SRC"/*.jpg "$SRC"/*.jpeg "$SRC"/*.png "$SRC"/*.heic)
if [ ${#files[@]} -eq 0 ]; then
  echo "No hay fotos en $SRC." >&2
  exit 1
fi

for f in "${files[@]}"; do
  name="$(basename "${f%.*}")"
  out="$DST/$name.jpg"

  if command -v magick >/dev/null 2>&1; then
    magick "$f" -auto-orient -gravity center -extent 1:1 \
      -resize "${SIZE}x${SIZE}" -strip -interlace Plane -quality "$QUALITY" "$out"
  else
    # sips: leer dimensiones, recortar al lado menor (centrado), escalar, comprimir.
    w=$(sips -g pixelWidth  "$f" | awk '/pixelWidth/ {print $2}')
    h=$(sips -g pixelHeight "$f" | awk '/pixelHeight/ {print $2}')
    side=$(( w < h ? w : h ))
    # Dos pasos: sips aplica el reescalado antes del recorte si van juntos.
    sips -s format jpeg -c "$side" "$side" "$f" --out "$out" >/dev/null
    sips -s format jpeg -s formatOptions "$QUALITY" -z "$SIZE" "$SIZE" "$out" >/dev/null
  fi

  kb=$(( $(stat -f %z "$out") / 1024 ))
  flag=""
  [ "$kb" -gt "$MAX_KB" ] && flag="  <-- pesa más de ${MAX_KB} KB, baja QUALITY"
  printf '%-28s %4d KB%s\n' "$name.jpg" "$kb" "$flag"
done

echo "Listo. Comprueba el resultado en el navegador."
