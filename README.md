# Portafolio UGC — Daniela Orbe

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)

**Un portafolio UGC listo para marcas: mobile-first, sin frameworks y desplegable a GitHub Pages en minutos.**

Clonas el repo, rellenas tu `.env` y dos JSON (videos e imágenes). El sitio se arma solo: galerías, embeds, lightbox y contacto. Pensado para que una marca lo abra desde el celular y entienda tu trabajo en segundos.

🔗 **[Ver demo en vivo](https://tu-usuario.github.io/tu-repo)** ← reemplaza `tu-usuario` y `tu-repo`

---

## Tabla de contenidos

- [Qué resuelve](#-qué-resuelve)
- [Características](#-características)
- [Inicio rápido](#-inicio-rápido)
- [Uso](#-uso)
- [Personalizar contenido](#-personalizar-contenido)
- [Despliegue](#-despliegue)
- [Variables de entorno](#-variables-de-entorno)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Stack](#-stack)
- [Personalización visual](#-personalización-visual)
- [Analytics](#-analytics-goatcounter)
- [Solución de problemas](#-solución-de-problemas)
- [Licencia](#-licencia)

---

## Qué resuelve

Las marcas revisan portfolios desde el celular. Este proyecto es una **plantilla estática** para creadoras UGC:

| Sin esto | Con esto |
|---|---|
| Un Google Drive o un perfil de TikTok difícil de presentar | Una landing con videos 9:16, fotos y tarifas |
| Editar HTML cada vez que subes un reel | Editar un JSON y recargar |
| Datos personales en el repo | `.env` local + GitHub Secrets en producción |
| Node, npm y un build complejo | HTML, Tailwind CDN y un `build.sh` |

No hay backend ni base de datos. El contenido vive en JSON; el contacto y las redes se inyectan en el HTML al construir.

---

## Características

- Diseño **100% responsivo** (mobile-first), paleta rosa pastel / champán y negro
- Galería de videos UGC en **9:16** (YouTube / Shorts, TikTok, Instagram Reels, Facebook Reels y Vimeo)
- Clic en la tarjeta: el player se embebe en el mismo recuadro (no abre otra pestaña)
- Miniaturas en `assets/images/thumbnail/`
- Filtros de categoría y plataforma solo cuando hay más de 5 videos reales y hay más de una categoría o plataforma
- Galería de imágenes con mosaico mixto (vertical, cuadrado, horizontal) y **lightbox**
- Filtros por categoría y plataforma, alimentados desde JSON
- Tarjeta **Video próximamente** para anunciar contenido nuevo
- Sección de servicios, proceso de trabajo y herramientas
- Datos personales **fuera del repo** (`.env` gitignored)
- Analytics con [GoatCounter](https://goatcounter.com/) (sin cookies)
- Deploy automático con GitHub Actions → GitHub Pages

---

## Inicio rápido

### Requisitos

- [Git](https://git-scm.com/)
- Bash (macOS, Linux o WSL)
- Un servidor HTTP estático: `python3` (incluido en la mayoría de sistemas) **o** cualquier alternativa (`npx serve`, VS Code Live Server, etc.)
- Un navegador

> **Importante:** no abras el HTML como archivo (`file://`). La galería carga JSON con `fetch()`, y el navegador lo bloquea sin un servidor local.

### 1. Clonar

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

### 2. Configurar datos personales

```bash
cp .env-example .env
```

Edita `.env` (valores de ejemplo; usa los tuyos, **sin `@` ni URLs** en los usuarios):

```env
CONTACT_EMAIL=tu_correo@gmail.com
WHATSAPP_NUMBER=521234567890
TIKTOK_USERNAME=tu_usuario_tiktok
INSTAGRAM_USERNAME=tu_usuario_instagram
FACEBOOK_USERNAME_ID=tu_usuario_facebook
SITE_URL=https://tu-usuario.github.io/tu-repo
PROFILE_IMAGE_PATH=assets/images/tu-foto.webp
GOATCOUNTER_CODE=tu_codigo
```

### 3. Generar el HTML local

```bash
bash build.sh
```

Esto crea `index.local.html` con tus datos. Si no existen, también copia `data/videos.json` → `data/videos.local.json` y `data/images.json` → `data/images.local.json`. **Si esos `.local.json` ya existen, no los pisa.**

### 4. Servir y abrir

```bash
python3 -m http.server 8081
```

Abre [http://127.0.0.1:8081/index.local.html](http://127.0.0.1:8081/index.local.html).

Si el puerto está ocupado (`Address already in use`), usa otro:

```bash
python3 -m http.server 8082
```

---

## Uso

Con el servidor corriendo, esto es lo que puedes hacer de inmediato:

1. **Navegar el portafolio** — hero, videos, fotos, servicios y contacto. En móvil, abre el menú hamburguesa.
2. **Filtrar la galería** — si hay más de 5 videos y más de una categoría o plataforma, aparecen los botones. *Todos* / *Todas* muestra también la tarjeta *Video próximamente*.
3. **Reproducir un video** — clic en YouTube, TikTok, Instagram, Facebook o Vimeo: el player se embebe en el recuadro 9:16.
4. **Abrir el lightbox** — clic en cualquier imagen: flechas, `Escape` para cerrar, clic fuera de la foto, contador `1 / N`.
5. **Probar contacto** — los botones de email y WhatsApp usan los valores de tu `.env`.

### Añadir un video en 30 segundos

Edita `data/videos.local.json` y agrega un objeto dentro de `"videos"`:

```json
{
  "id": 5,
  "title": "Unboxing de skincare",
  "subtitle": "Belleza",
  "category": "Belleza",
  "platform": "youtube",
  "videoUrl": "https://youtube.com/shorts/wtMQkdv_1BY",
  "thumbnail": "assets/images/thumbnail/youtube-1.jpg"
}
```

Recarga el navegador (sin volver a ejecutar `build.sh`). El video aparece en la galería.

Para producción, copia el mismo objeto a `data/videos.json` y haz push a `main`.

### Flujo local vs producción

```
Local                         Producción (GitHub Pages)
─────────────────────────     ────────────────────────────
.env          → build.sh      GitHub Secrets → deploy.yml
index.local.html              index.html (ya reemplazado)
videos.local.json  (prioridad) videos.json
images.local.json  (prioridad) images.json
```

El JS intenta primero `*.local.json`. Si no existe (como en Pages), usa `*.json`.

---

## Personalizar contenido

### Foto de perfil

1. Coloca tu imagen en `assets/images/` (por ejemplo `daniela-orbe-profile.webp`).
2. Actualiza `PROFILE_IMAGE_PATH` en `.env`.
3. Ejecuta `bash build.sh` otra vez.

### Videos

| Archivo | Cuándo usarlo |
|---|---|
| `data/videos.local.json` | Lo editas en local. Gitignored. `build.sh` no lo sobrescribe si ya existe. |
| `data/videos.json` | El que se sube al repo y se publica en GitHub Pages. |
| `data/videos.example.json` | Plantilla de referencia (YouTube, TikTok, Instagram, Facebook, Vimeo, *coming soon*). |

**Campos**

| Campo | Obligatorio | Descripción |
|---|---|---|
| `id` | Sí | Número único |
| `title` | Sí | Título bajo la tarjeta |
| `subtitle` | Sí | Texto corto (categoría visual o formato) |
| `category` | En videos reales | Filtro (`Belleza`, `Storytime`, `Tecnologia`, `Lifestyle`, …) |
| `platform` | En videos reales | `youtube`, `tiktok`, `instagram`, `facebook` o `vimeo` |
| `youtubeId` | YouTube (opcional) | Solo el ID. Si pegas `videoUrl`, no hace falta |
| `videoUrl` | YouTube / TikTok / Instagram / Facebook / Vimeo | URL completa (Shorts, reel, share, `watch?v=`, `youtu.be`, `vimeo.com/ID`) |
| `thumbnail` | Recomendado | Portada en `assets/images/thumbnail/`. YouTube puede omitirse |
| `comingSoon` | Placeholder | `true` para la tarjeta **Video próximamente** |

#### Miniaturas

Guarda las portadas en **`assets/images/thumbnail/`** (no sueltas en `assets/images/`).

1. Crea la carpeta si no existe: `assets/images/thumbnail/`
2. Pon el archivo (`tiktok-1.jpg`, `instagram-1.jpg`, `facebook-1.jpg`, `youtube-1.jpg`, `vimeo-1.jpg`, …)
3. En el JSON usa esa ruta, por ejemplo `"thumbnail": "assets/images/thumbnail/tiktok-1.jpg"`

Si falta el archivo, la tarjeta se ve vacía hasta que carga el player. En YouTube, si no pones `thumbnail`, se usa sola la miniatura de YouTube.

#### YouTube y Shorts

Pega la URL en `videoUrl` (Shorts, `watch?v=` o `youtu.be`) o usa `youtubeId`:

```json
{
  "id": 1,
  "title": "Unboxing y primeras impresiones",
  "subtitle": "Gadget inteligente",
  "category": "Tecnologia",
  "platform": "youtube",
  "videoUrl": "https://youtube.com/shorts/wtMQkdv_1BY",
  "thumbnail": "assets/images/thumbnail/youtube-1.jpg"
}
```

#### TikTok

Compartir → Copiar enlace → `videoUrl`. Al clic, el player 9:16 se embebe en la tarjeta.

```json
{
  "id": 2,
  "title": "Storytime en carretera",
  "subtitle": "Storytime",
  "category": "Storytime",
  "platform": "tiktok",
  "videoUrl": "https://www.tiktok.com/@tu_usuario/video/1234567890123456789",
  "thumbnail": "assets/images/thumbnail/tiktok-1.jpg"
}
```

#### Instagram Reels

Compartir → Copiar enlace → `videoUrl`. El reel tiene que ser público. Al clic, el embed se abre en la tarjeta (Instagram puede mostrar su propia barra o pedir un segundo play).

```json
{
  "id": 3,
  "title": "Demo de app",
  "subtitle": "App móvil",
  "category": "Tecnologia",
  "platform": "instagram",
  "videoUrl": "https://www.instagram.com/reel/ABC123DEF/",
  "thumbnail": "assets/images/thumbnail/instagram-1.jpg"
}
```

#### Facebook Reels / videos

Compartir → Copiar enlace. Sirve un `share/r/...` o la URL del reel (`facebook.com/reel/ID`). El video tiene que ser **público**.

```json
{
  "id": 4,
  "title": "Reel de producto",
  "subtitle": "Lifestyle",
  "category": "Lifestyle",
  "platform": "facebook",
  "videoUrl": "https://www.facebook.com/reel/2932841807054988",
  "thumbnail": "assets/images/thumbnail/facebook-1.jpg"
}
```

Si el embed sale en blanco, abre el reel en Facebook, copia la URL de la barra (`facebook.com/reel/...`) y usa esa.

#### Vimeo

Pega la URL del video en `videoUrl` (`vimeo.com/ID` o `player.vimeo.com/video/ID`). El video tiene que ser **público** y permitir embed. Al clic, el player se abre en la tarjeta.

```json
{
  "id": 5,
  "title": "Campaña de producto",
  "subtitle": "UGC",
  "category": "Lifestyle",
  "platform": "vimeo",
  "videoUrl": "https://vimeo.com/123456789",
  "thumbnail": "assets/images/thumbnail/vimeo-1.jpg"
}
```

Pon una miniatura propia: Vimeo no genera portada automática como YouTube.

#### Video próximamente

No hace falta `platform` ni URL:

```json
{
  "id": 6,
  "title": "Video próximamente",
  "subtitle": "Nuevo contenido en camino. Sígueme en redes para no perdértelo.",
  "comingSoon": true
}
```

Se muestra al final cuando los filtros están en *Todos*. Cuando el video esté listo, quita `comingSoon` y agrega `platform` + `videoUrl` o `youtubeId`.

Los filtros de categoría y plataforma **no se muestran** con 5 videos o menos, ni si todos son la misma categoría y la misma plataforma.

### Imágenes

| Archivo | Cuándo usarlo |
|---|---|
| `data/images.local.json` | Edición local (gitignored). `build.sh` no lo pisa si ya existe. |
| `data/images.json` | Producción / GitHub Pages. |
| `data/images.example.json` | Plantilla de referencia. |

| Campo | Obligatorio | Descripción |
|---|---|---|
| `id` | Sí | Número único |
| `title` | Sí | Título al pasar el mouse (puede ir vacío `""`) |
| `category` | Sí | Filtro (`UGC`, `Lifestyle`, `Detrás de cámaras`, …) |
| `aspect` | Sí | `vertical` (3:4), `horizontal` (4:3) o `square` (1:1) |
| `src` | Sí | Ruta local o URL externa |
| `alt` | Sí | Texto alternativo |

```json
{
  "id": 1,
  "title": "Proyecto UGC para marca de skincare",
  "category": "UGC",
  "aspect": "vertical",
  "src": "assets/images/gallery/proyecto-skincare.jpg",
  "alt": "Contenido UGC creado para marca de cuidado de la piel"
}
```

`src` también acepta URLs externas (CDN de Instagram, etc.). Coloca los archivos locales en `assets/images/gallery/`.

Después de editar un `*.local.json`, recarga el navegador. Para Pages, copia los mismos ítems al `*.json` de producción y haz push.

---

## Despliegue

Cada push a `main` dispara GitHub Actions (`deploy.yml`): reemplaza los `{{PLACEHOLDERS}}` de `index.html` con **GitHub Secrets** y publica el sitio en Pages. `data/videos.json` y `data/images.json` se despliegan tal cual.

### Secrets

En el repo: **Settings → Secrets and variables → Actions → New repository secret**. Crea uno por cada variable:

| Secret | Valor |
|---|---|
| `CONTACT_EMAIL` | Correo de contacto |
| `WHATSAPP_NUMBER` | WhatsApp con código de país (ej. `521234567890`) |
| `TIKTOK_USERNAME` | Usuario de TikTok **sin** `@` |
| `INSTAGRAM_USERNAME` | Usuario de Instagram **sin** `@` |
| `FACEBOOK_USERNAME_ID` | Usuario, ID numérico o URL. El build usa `profile.php?id=` solo si es un número. |
| `PROFILE_IMAGE_PATH` | Ruta relativa de la foto (ej. `assets/images/tu-foto.webp`). No uses una URL completa. |
| `GOATCOUNTER_CODE` | Código de GoatCounter ([goatcounter.com](https://goatcounter.com/)) |

`SITE_URL` no hace falta como Secret: el workflow la arma como `https://<usuario>.github.io/<repo>`. Si usas dominio propio, crea la variable de Actions `SITE_URL` (Settings → Secrets and variables → Actions → Variables).

### Activar GitHub Pages

GitHub Pages **no lee** los secrets en el navegador. Solo el workflow de Actions sustituye `{{CONTACT_EMAIL}}` (y el resto de placeholders) **antes** de publicar. Por eso el Source tiene que ser Actions, no una rama.

1. Sube el repo a GitHub y haz push de `main`.
2. Crea los **Repository secrets** (tabla de arriba):
   **Settings → Secrets and variables → Actions → pestaña Secrets → New repository secret**.
   - Usa **Repository secrets**, no Variables y no secrets del environment `github-pages`.
   - El nombre debe coincidir exactamente (`CONTACT_EMAIL`, no `contact_email`).
3. **Settings → Pages**
   - **Source:** GitHub Actions
   - **No** elijas *Deploy from a branch*. Esa opción publica el `index.html` crudo del repo y en el sitio se verá `{{CONTACT_EMAIL}}` en vez del correo.
4. Guarda. En **Actions** espera a que **Build & Deploy** termine en verde.
5. Si creaste o cambiaste un secret **después** del último deploy, vuelve a correr el workflow: **Actions → Build & Deploy → Run workflow** (o un push nuevo a `main`). Crear el secret no actualiza el sitio por sí solo.

La URL quedará en `https://<usuario>.github.io/<repo>/`. Recarga forzada (`Ctrl+Shift+R`) la primera vez.

---

## Variables de entorno

El `.env` **nunca se sube** (está en `.gitignore`). En CI se usan Secrets con los mismos nombres.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `CONTACT_EMAIL` | Correo de contacto | `danielaorbe98@gmail.com` |
| `WHATSAPP_NUMBER` | WhatsApp con código de país | `521234567890` |
| `TIKTOK_USERNAME` | Usuario TikTok, sin `@` | `danielaorbe` |
| `INSTAGRAM_USERNAME` | Usuario Instagram, sin `@` | `danielaorbe` |
| `FACEBOOK_USERNAME_ID` | Usuario, ID numérico o URL de Facebook | `daniela.orbe` o `61593834029133` |
| `SITE_URL` | URL pública, sin barra final | `https://tu-usuario.github.io/tu-repo` |
| `PROFILE_IMAGE_PATH` | Ruta relativa de la foto de perfil | `assets/images/tu-foto.webp` |
| `GOATCOUNTER_CODE` | Código GoatCounter, sin `@` ni URLs | `tu_codigo` |

Los videos y las fotos **no van en `.env`**. Se editan en los JSON de `data/`.

---

## Estructura del proyecto

```
├── .env                      # Tus datos reales (gitignored)
├── .env-example              # Plantilla para crear .env
├── .github/workflows/deploy.yml
├── assets/
│   ├── css/style.css         # Gradientes, animaciones, lightbox
│   ├── images/
│   │   ├── gallery/          # Fotos del mosaico
│   │   └── thumbnail/        # Portadas de videos (tiktok-1.jpg, …)
│   └── js/main.js            # Navbar, galerías, lightbox, embeds
├── build.sh                  # Genera index.local.html; no pisa *.local.json
├── data/
│   ├── images.json           # Galería de producción (sí se sube)
│   ├── images.local.json     # Galería local (gitignored)
│   ├── images.example.json   # Ejemplo de estructura
│   ├── videos.json           # Videos de producción (sí se sube)
│   ├── videos.local.json     # Videos locales (gitignored)
│   └── videos.example.json   # Ejemplo de estructura
├── index.html                # Plantilla con {{PLACEHOLDERS}}
├── LICENSE
└── README.md
```

| Archivo | Rol |
|---|---|
| `index.html` | Plantilla. En local, `build.sh` genera `index.local.html`. En CI, se reescribe in-place. |
| `build.sh` | Lee `.env`, sustituye placeholders. Solo crea `*.local.json` si aún no existen. |
| `.env` | Contacto, redes, foto, analytics. |

---

## Stack

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica |
| Tailwind CSS (CDN) | Utilidades y diseño responsivo |
| CSS | Gradientes, animaciones, lightbox |
| JavaScript vanilla | Navbar, scroll-reveal, galerías, embeds |
| Google Fonts | Inter (cuerpo) y Poppins (títulos) |
| GitHub Actions | CI/CD hacia GitHub Pages |
| GoatCounter | Analytics privacy-first (~3.5 KB, sin cookies) |

---

## Personalización visual

Colores en la config de Tailwind dentro de `index.html`:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        base: '#FAFAFA',
        rose: { soft: '#F5D9DE', blush: '#E8B4BC' },
        champ: '#E7C9A8',
        ink: '#0A0A0A',
        muted: '#5A5A5A',
      }
    }
  }
}
```

Tras cambiar colores o la plantilla HTML, vuelve a ejecutar `bash build.sh` para refrescar `index.local.html`.

---

## Analytics (GoatCounter)

[GoatCounter](https://goatcounter.com/) es open source y privacy-first: sin cookies (no hace falta banner), script ~3.5 KB, dashboard con pageviews, referrers, países y dispositivos. Gratis para sitios no comerciales.

1. Crea una cuenta en [goatcounter.com](https://goatcounter.com/)
2. Copia tu código de tracking (ej. `tu_codigo`)
3. Ponlo en `.env` como `GOATCOUNTER_CODE=tu_codigo`
4. `bash build.sh`
5. El mismo valor como Secret `GOATCOUNTER_CODE` en GitHub

Dashboard: `https://TU-CODIGO.goatcounter.com`

---

## Solución de problemas

| Síntoma | Qué hacer |
|---|---|
| Galería vacía o error en consola al abrir el HTML | Estás en `file://`. Sirve con `python3 -m http.server 8081` y abre `index.local.html`. |
| `Error: No se encontró el archivo .env` | `cp .env-example .env` y rellena al menos `CONTACT_EMAIL`. |
| Cambié `.env` pero el sitio no cambia | `bash build.sh` de nuevo; el navegador lee `index.local.html`, no `index.html`. |
| Cambié el JSON y no veo el video | Recarga forzada (`Ctrl+Shift+R`). Confirma que editaste `videos.local.json` en local. |
| `build.sh` no actualiza mis videos | Es intencional: no pisa `*.local.json`. Edítalos a mano, o bórralos y vuelve a ejecutar el script para copiarlos desde producción. |
| `Address already in use` | Cambia el puerto: `python3 -m http.server 8082`. |
| Pages desplegó pero salen `{{CONTACT_EMAIL}}` | 1) Source de Pages debe ser **GitHub Actions**, no *Deploy from a branch*. 2) Los valores van en **Repository secrets** (no Variables ni secrets de `github-pages`). 3) Tras crear o cambiar un secret, vuelve a correr **Build & Deploy**. |
| Al compartir no sale la foto | `og:image` debe ser absoluta. En local define `SITE_URL` y corre `bash build.sh`. En Pages, `PROFILE_IMAGE_PATH` del Secret tiene que ser una ruta relativa (`assets/images/...`). |
| La tarjeta de video se ve vacía / 404 de imagen | Falta el archivo de `thumbnail`. Créalo en `assets/images/thumbnail/` o, en YouTube, quita el campo para usar la portada de YouTube. |
| Instagram o Facebook en blanco | El reel debe ser público. En Facebook prefiere `facebook.com/reel/ID` antes que `share/r/...`. |
| Vimeo en blanco o no reproduce | `platform` tiene que ser `"vimeo"` y `videoUrl` la URL del video (`vimeo.com/123456789`). El video debe ser público y permitir embed. Recarga forzada. |
| YouTube Short no reproduce | `platform` tiene que ser `"youtube"` y `videoUrl` la URL del Short (`youtube.com/shorts/...`). Recarga forzada. |
| La página se ve en blanco | Error de JS. Abre la consola (`F12`). Recarga forzada (`Ctrl+Shift+R`). |

---

## Contacto

**Daniela Orbe** — Creadora de contenido UGC

- 📧 [danielaorbe98@gmail.com](mailto:danielaorbe98@gmail.com)
- 🎵 [TikTok](https://www.tiktok.com/@soy_danielaorbe)
- 📸 [Instagram](https://www.instagram.com/soy.danielaorbe)

---

## Licencia

MIT. Ver [LICENSE](LICENSE).

---

Desarrollado con 🤍 por **Daniela Orbe**
