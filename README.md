# Ourivesaria Roque · Catálogo de Natal 2026 (demo)

Landing estática de demostración para enseñar al dueño de la joyería cómo quedaría un catálogo de Natal con sus piezas. Se abre en el móvil al escanear un QR impreso en un folleto.

- **No es una tienda online**: sin precios, sin carrito, sin cuentas. El único canal es WhatsApp (por pieza, por servicio, vale-prenda y lista de piezas guardadas).
- **Qué incluye (v2)**: catálogo con filtros, "Ideias de prenda" (para ela / ele / bebé), peças guardadas con envío por WhatsApp, lightbox con partilhar, serviço de Natal, 8 serviços con pedido de orçamento, bloque "A loja", mapa estático con "Como chegar", botón "Ligar", "Avalie-nos no Google", horário con "Aberto agora", barra inferior fija en móvil, instalable en el ecrã principal, versión imprimible y datos estructurados (JSON-LD) para Google.
- Un solo `index.html` + CSS y JS vanilla, sin build. Pensada para 390 px de ancho; en escritorio se centra a 720 px.
- `noindex, nofollow`: no debe aparecer en Google. No la enlaces desde ningún sitio.
- Sin cookies ni banners. Las visitas se cuentan con Cloudflare Web Analytics (opcional, ver abajo).

## Ver en local

```bash
cd relojeria
python3 -m http.server 8000
```

Abre http://localhost:8000. Para verla en el móvil dentro de la misma wifi, usa la IP del Mac (`ipconfig getifaddr en0`) en vez de `localhost`.

## Fotos de las piezas

Van en `assets/pecas/` con **exactamente** estos nombres. Mientras falte una foto, la tarjeta muestra un placeholder crema con un motivo de la categoría; nunca un icono roto.

La demo ya lleva 8 fotos de archivo de Pexels (licencia Pexels: uso comercial libre, sin atribución obligatoria). Son de muestra: la idea es sustituirlas por fotos de las piezas reales de la tienda.

| Fichero | Foto de Pexels usada |
|---|---|
| `aliancas.jpg` | https://www.pexels.com/photo/265856/ |
| `pulseira-prata.jpg` | https://www.pexels.com/photo/34549909/ |
| `fio-prata.jpg` | https://www.pexels.com/photo/12427695/ |
| `brincos-filigrana.jpg` | https://www.pexels.com/photo/34010223/ |
| `anel-ouro.jpg` | https://www.pexels.com/photo/2849742/ |
| `relogio-senhora.jpg` | https://www.pexels.com/photo/14808296/ |
| `relogio-homem.jpg` | https://www.pexels.com/photo/1697570/ |
| `cruz-ouro.jpg` | https://www.pexels.com/photo/9173459/ |
| `assets/loja.jpg` (bloque "A loja") | https://www.pexels.com/photo/30904849/ · alternativa con montra de ouro: https://www.pexels.com/photo/7314460/ |

Si quieres buscar otras:

| Fichero | Pieza | Términos de búsqueda (Unsplash / Pexels) |
|---|---|---|
| `aliancas.jpg` | Alianças em ouro | `gold wedding bands white background`, `two gold rings close up`, `matte gold wedding rings` |
| `pulseira-prata.jpg` | Pulseira de prata | `silver bracelet white background`, `sterling silver chain bracelet`, `silver bracelet macro` |
| `fio-prata.jpg` | Fio de prata com medalha | `silver necklace pendant white background`, `silver medal necklace`, `silver chain with pendant` |
| `brincos-filigrana.jpg` | Brincos em filigrana | `gold filigree earrings`, `portuguese filigree jewelry`, `gold earrings traditional close up` |
| `anel-ouro.jpg` | Anel em ouro com pedra | `gold ring gemstone white background`, `gold ring with stone macro`, `solitaire gold ring` |
| `relogio-senhora.jpg` | Relógio Citizen de senhora | `women's steel watch white background`, `ladies wristwatch minimal`, `small steel bracelet watch` |
| `relogio-homem.jpg` | Relógio Citizen de homem | `men's classic watch white background`, `steel dress watch close up`, `analog wristwatch product photo` |
| `cruz-ouro.jpg` | Cruz em ouro | `gold cross pendant white background`, `small gold cross necklace`, `gold crucifix pendant macro` |

Busca fotos con fondo claro o blanco para que encajen con el fondo crema. Comprueba la licencia de cada una (Unsplash License / Pexels License permiten uso comercial sin atribución).

### Optimizar las fotos

Copia los originales en `assets/pecas/originais/` con el nombre final y ejecuta:

```bash
pip install pillow
python3 scripts/optimize-images.py
```

Recorta a cuadrado, redimensiona a 800×800 y comprime empezando en calidad 72 y bajando hasta que cada foto pese ≤ 90 KB. Si alguna no baja ni a calidad 50 (fondos con mucho grano), el script lo avisa: mejor buscar otra foto. Con las 8 actuales la página entera pesa unos 400 KB (HTML + CSS + JS son 24 KB).

## Configuración (número de WhatsApp, teléfono, Google, redes)

Todo está al principio de `assets/app.js`:

| Constante | Qué es | Valor actual |
|---|---|---|
| `WA_NUMBER` | WhatsApp, formato internacional sin `+` | `351963499241` (el del autor; cambiar por el de la tienda) |
| `PHONE` | Teléfono fijo para el botón "Ligar" | `+351261324959` (dato público de la empresa; confirmar) |
| `GOOGLE_PLACE_ID` | Place ID de la ficha de Google Maps | vacío → el botón "Avalie-nos" abre una búsqueda por nombre |
| `INSTAGRAM`, `FACEBOOK` | URLs de redes; si están vacías no se muestran | vacías |
| `HORARIO` | Horario por día en minutos; alimenta "Aberto agora" y la fila "hoje" | placeholder |

Los `href` del HTML llevan los valores ya resueltos para que la página funcione sin JavaScript: si cambias el número o el teléfono, haz también un buscar-y-reemplazar en `index.html` (y en el JSON-LD del `<head>`).

Mensajes que se abren en WhatsApp:
- Por pieza: `Olá, vi o catálogo de Natal da Ourivesaria Roque e gostava de saber mais sobre: {nome da peça}.`
- Piezas guardadas: `… gostava de saber mais sobre estas peças: A, B e C.`
- Por servicio: `… gostava de pedir um orçamento para: {serviço}.`
- Vale-prenda: `… gostava de pedir um vale-prenda.`
- Genérico (bloque final, contacto, barra inferior y pie): `Olá, vi a demonstração do catálogo de Natal.`

## Ligar la página con Google Maps (Perfil de Empresa)

La página ya lleva datos estructurados `JewelryStore` (nombre, dirección, teléfono, horario, coordenadas) en el `<head>`. Para que Google la asocie a la ficha de la tienda:

1. **Reclamar o actualizar la ficha** en https://business.google.com con el mismo nombre, dirección y teléfono que aparecen en la página (deben coincidir letra por letra).
2. En la ficha, poner esta URL en **Sitio web**. Añadir las piezas en **Produtos** (sin precio o con "Contactar") y una **Publicação** de Natal con el enlace y el QR.
3. Activar el botón de **chat / WhatsApp** de la ficha con el mismo número.
4. Obtener el **Place ID** con el buscador oficial: https://developers.google.com/maps/documentation/places/web-service/place-id (sección "Place ID Finder"). Pegarlo en `GOOGLE_PLACE_ID`: el botón "Avalie-nos no Google" pasará a abrir directamente el formulario de reseña.
5. Al pasar a producción (dominio propio, fotos reales), **quitar** la línea `<meta name="robots" content="noindex, nofollow">` de `index.html`. Mientras sea demo, debe quedarse.
6. Opcional: código postal en el JSON-LD (`postalCode`) cuando lo confirmen.

El mapa de la sección "Onde estamos" es una imagen estática generada desde OpenStreetMap (no carga nada de Google ni pone cookies). Para regenerarlo, por ejemplo si cambian las coordenadas:

```bash
python3 scripts/make-map.py                 # geocodifica la dirección
python3 scripts/make-map.py --lat 39.09198 --lon -9.25951
```

Los iconos para "Adicionar ao ecrã principal" se generan con `python3 scripts/make-icons.py`.

## Generar el QR del folleto

```bash
pip install qrcode pillow
python3 scripts/make-qr.py https://URL-FINAL
```

Genera `qr-folheto.png` (~1200 px, para imprenta) y `qr-folheto.svg` (vectorial) con corrección de errores H y zona de silencio de 4 módulos. El script imprime el tamaño de módulo que resulta al imprimir a 2,5 cm; si avisa que la URL es larga, usa un subdominio más corto. Imprime siempre el QR sobre fondo blanco o crema muy claro y no lo reduzcas por debajo de 2 cm.

## Contador de visitas (opcional, sin cookies)

1. En el panel de Cloudflare: **Analytics & Logs → Web Analytics → Add a site**. Escribe el dominio final y copia el token del snippet.
2. En `index.html`, al final del `<body>`, descomenta el bloque del beacon y sustituye `TOKEN_AQUI` por el token.

No instala cookies ni requiere banner de consentimiento. Si despliegas en Cloudflare Pages puedes activarlo directamente desde el proyecto (Settings → Web Analytics) sin tocar el HTML.

## Despliegue

**Estado actual**: desplegada en GitHub Pages desde el repo `kml0001gh/catalogo-natal` (rama `main`, raíz).
URL: https://kml0001gh.github.io/catalogo-natal/ · Cada `git push` a `main` redespliega en 1–7 minutos.
El QR del folleto (`qr-folheto.png` / `.svg`) apunta a esa URL; si cambias de dominio, vuelve a generarlo.

Nombres de proyecto / subdominio sugeridos (cortos, neutros, sin el nombre de la tienda):
`catalogo-natal` · `montra-tv` · `prendas-natal`

### Opción A: Cloudflare Pages (recomendada)

1. Sube el repositorio a GitHub (privado vale).
2. En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, elige el repo.
3. Configuración de build: *Framework preset* = None, *Build command* vacío, *Build output directory* = `/`.
4. Deploy. La página queda en `https://<nombre-proyecto>.pages.dev`.
5. Subdominio corto propio: en el proyecto, **Custom domains → Set up a custom domain** y escribe, por ejemplo, `natal.tudominio.pt`. Si el dominio está en Cloudflare, el CNAME se crea solo; si no, añade un CNAME `natal → <nombre-proyecto>.pages.dev` en tu DNS.

Cada `git push` a `main` redespliega automáticamente.

### Opción B: GitHub Pages

1. En el repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
2. La página queda en `https://<usuario>.github.io/<repo>/`.
3. Subdominio propio: en **Custom domain** escribe `natal.tudominio.pt`, y en tu DNS crea un CNAME `natal → <usuario>.github.io`. Activa *Enforce HTTPS* cuando el certificado esté listo (unos minutos).

En ambas opciones no hay build: el directorio de publicación es la raíz del repo.

## Pendiente de confirmar con la tienda

- [ ] **Horario**: el del pie es un placeholder (`Seg–Sex 9:30–13:00 · 15:00–19:00 · Sáb 9:30–13:00`).
- [ ] **Dirección**: confirmar `Rua Serpa Pinto 28A` y añadir código postal si lo quieren.
- [ ] **Piezas y descripciones**: las 8 son de ejemplo; sustituir por piezas reales y fotos propias.
- [ ] **Relojes**: si quieren mostrar precio en los relojes (en la demo no hay precios en ninguna pieza).
- [ ] **Número de WhatsApp** definitivo de la tienda (ahora apunta al del autor).
- [ ] **Teléfono fijo** 261 324 959 (sacado de un directorio público de empresas).
- [ ] **Serviços**: cuáles ofrecen realmente. "Compra de ouro" y "Avaliação de peças" son los más dudosos.
- [ ] **Serviço de Natal**: embrulho gratuito, vale-prenda, reservas hasta el 24, gravação con un día de antecedência.
- [ ] **Métodos de pago** (Multibanco, MB WAY, dinheiro) y la frase "há mais de 20 anos".
- [ ] **Foto de la loja** real para sustituir `assets/loja.jpg` (hoy es una foto de archivo de un ourives trabajando): copia la tuya como `assets/pecas/originais/loja.jpg` y corre el optimizador; sale recortada a 760×460.
- [ ] **Texto de "A loja"**: confirmar los años, que trabajan ouro e prata en la propia tienda y que son revendedores Citizen.
- [ ] **Redes sociales** (Instagram/Facebook) si las tienen.
- [ ] **Place ID** de Google y si quieren pedir reseñas.
- [ ] **Etiquetas** "Novidade" / "Mais procurado": qué piezas las llevan (atributo `badge` en las tarjetas).
- [ ] **Para quem** (atributo `data-para` de cada pieza: `ela`, `ele`, `bebe`).
- [ ] Si quieren mantener la banda "Exemplo de demonstração" o quitarla al pasar a producción.

## Estructura

```
index.html               página completa (funciona sin JS)
assets/style.css
assets/app.js            configuración + interactividad
assets/pecas/            fotos optimizadas (800×800 .jpg)
assets/pecas/originais/  originales (ignorado por git)
assets/mapa.jpg          mapa estático (OpenStreetMap)
assets/loja.jpg          foto del bloque "A loja" (de archivo; sustituir por la real)
assets/icons/            iconos para el ecrã principal
manifest.webmanifest     hace la página instalable
scripts/make-qr.py
scripts/optimize-images.py
scripts/make-map.py
scripts/make-icons.py
preview-mobile.png       captura a 390 px
```
