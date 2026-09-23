#!/bin/bash
# ============================================================
# build.sh - Genera archivos locales con datos reales desde .env
# ============================================================
# Uso: bash build.sh
# Resultado: index.local.html
# La galería se edita en data/videos.json (producción) y data/videos.local.json (local)

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar que existe .env
if [ ! -f .env ]; then
  echo -e "${RED}Error: No se encontró el archivo .env${NC}"
  echo "Copia .env-example como .env y edita tus datos:"
  echo "  cp .env-example .env"
  exit 1
fi

echo -e "${YELLOW}Generando archivos locales desde .env...${NC}"

# Cargar variables del .env
set -a
source .env
set +a

# Verificar variables obligatorias
if [ -z "$CONTACT_EMAIL" ]; then
  echo -e "${RED}Error: CONTACT_EMAIL no está definido en .env${NC}"
  exit 1
fi

SITE_URL="${SITE_URL%/}"
PROFILE_IMAGE_PATH="${PROFILE_IMAGE_PATH#./}"
PROFILE_IMAGE_PATH="${PROFILE_IMAGE_PATH#/}"
if [[ "$PROFILE_IMAGE_PATH" == http://* || "$PROFILE_IMAGE_PATH" == https://* ]]; then
  OG_IMAGE_URL="$PROFILE_IMAGE_PATH"
else
  OG_IMAGE_URL="${SITE_URL}/${PROFILE_IMAGE_PATH}"
fi

if [ -z "$SITE_URL" ]; then
  echo -e "${YELLOW}Aviso: SITE_URL no está definido. og:url, canonical y og:image no serán absolutos.${NC}"
  echo "  Añade SITE_URL=https://tu-usuario.github.io/tu-repo en .env"
fi

facebook_value="${FACEBOOK_USERNAME_ID#@}"
facebook_value="${facebook_value%/}"
if [[ "$facebook_value" == http://* || "$facebook_value" == https://* ]]; then
  FACEBOOK_URL="$facebook_value"
elif [[ "$facebook_value" == *facebook.com/* || "$facebook_value" == *facebook.com ]]; then
  FACEBOOK_URL="https://${facebook_value#//}"
elif [[ "$facebook_value" =~ ^[0-9]+$ ]]; then
  FACEBOOK_URL="https://www.facebook.com/profile.php?id=${facebook_value}"
elif [ -n "$facebook_value" ]; then
  FACEBOOK_URL="https://www.facebook.com/${facebook_value}"
else
  FACEBOOK_URL="https://www.facebook.com/"
fi

# ========== index.local.html ==========
cp index.html index.local.html

# Contacto
sed -i "s|{{CONTACT_EMAIL}}|${CONTACT_EMAIL}|g" index.local.html
sed -i "s|{{WHATSAPP_NUMBER}}|${WHATSAPP_NUMBER}|g" index.local.html

# Redes sociales
sed -i "s|{{TIKTOK_USERNAME}}|${TIKTOK_USERNAME}|g" index.local.html
sed -i "s|{{INSTAGRAM_USERNAME}}|${INSTAGRAM_USERNAME}|g" index.local.html
sed -i "s|{{FACEBOOK_URL}}|${FACEBOOK_URL}|g" index.local.html

# Sitio público (Open Graph / canónica)
sed -i "s|{{SITE_URL}}|${SITE_URL}|g" index.local.html
sed -i "s|{{OG_IMAGE_URL}}|${OG_IMAGE_URL}|g" index.local.html

# Foto de perfil (ruta relativa en la página)
sed -i "s|{{PROFILE_IMAGE_PATH}}|${PROFILE_IMAGE_PATH}|g" index.local.html

# Analytics
sed -i "s|{{GOATCOUNTER_CODE}}|${GOATCOUNTER_CODE}|g" index.local.html

# Páginas /share/{id}/ (Open Graph por video) y admin/config.js
VIDEOS_JSON="data/videos.json"
if [ -f data/videos.local.json ]; then
  VIDEOS_JSON="data/videos.local.json"
fi
python3 -m pip install --user pillow >/dev/null 2>&1 || true
python3 scripts/generate_pages.py \
  --html index.local.html \
  --videos "$VIDEOS_JSON" \
  --site-url "${SITE_URL:-}" \
  --admin-pin "${ADMIN_PIN:-}"

# ========== data/videos.local.json ==========
# Copia de trabajo local (gitignored). Si ya existe, no se pisa.
if [ -f data/videos.json ]; then
  mkdir -p data
  if [ -f data/videos.local.json ]; then
    echo -e "${YELLOW}data/videos.local.json ya existe: se deja igual.${NC}"
    echo "  Para GitHub Pages, edita data/videos.json (ese sí se sube al repo)."
    echo "  Si quieres regenerarlo desde videos.json, bórralo y vuelve a ejecutar build.sh."
  else
    cp data/videos.json data/videos.local.json
    echo -e "${GREEN}✅ data/videos.local.json generado${NC}"
  fi
fi

# ========== data/images.local.json ==========
if [ -f data/images.json ]; then
  mkdir -p data
  if [ -f data/images.local.json ]; then
    echo -e "${YELLOW}data/images.local.json ya existe: se deja igual.${NC}"
    echo "  Para GitHub Pages, edita data/images.json (ese sí se sube al repo)."
    echo "  Si quieres regenerarlo desde images.json, bórralo y vuelve a ejecutar build.sh."
  else
    cp data/images.json data/images.local.json
    echo -e "${GREEN}✅ data/images.local.json generado${NC}"
  fi
fi

echo -e "${GREEN}✅ index.local.html generado correctamente${NC}"
echo ""
echo "Para previsualizar (con servidor local):"
echo -e "  ${GREEN}python3 -m http.server 8081${NC}"
echo -e "  Portafolio: ${GREEN}http://127.0.0.1:8081/index.local.html${NC}"
echo -e "  Admin:      ${GREEN}http://127.0.0.1:8081/admin/${NC}"
