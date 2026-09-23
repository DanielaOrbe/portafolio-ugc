#!/usr/bin/env python3
"""Genera páginas /share/{id}/ (Open Graph por video) y admin/config.js."""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import urlparse

OG_WIDTH = 1200
OG_HEIGHT = 630
OG_BACKGROUND = (247, 241, 238)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html", required=True, help="HTML ya procesado (index.html o index.local.html)")
    parser.add_argument("--videos", required=True, help="JSON de videos")
    parser.add_argument("--site-url", default="", help="URL pública del sitio, sin barra final")
    parser.add_argument("--admin-pin", default="", help="PIN en texto plano; se guarda solo el hash")
    parser.add_argument("--share-dir", default="share")
    parser.add_argument("--admin-dir", default="admin")
    return parser.parse_args()


def load_videos(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get("videos") or []


def is_coming_soon(video: dict) -> bool:
    return video.get("comingSoon") is True


def escape_attr(value: str) -> str:
    return html.escape(value or "", quote=True)


def replace_meta_property(html_text: str, prop: str, content: str) -> str:
    pattern = rf'(<meta\s+property="{re.escape(prop)}"\s+content=")[^"]*(")'
    updated, count = re.subn(pattern, rf"\g<1>{content}\g<2>", html_text, count=1)
    if count != 1:
        raise SystemExit(f'No se encontró <meta property="{prop}">')
    return updated


def replace_meta_name(html_text: str, name: str, content: str) -> str:
    pattern = rf'(<meta\s+name="{re.escape(name)}"\s+content=")[^"]*(")'
    updated, count = re.subn(pattern, rf"\g<1>{content}\g<2>", html_text, count=1)
    if count != 1:
        raise SystemExit(f'No se encontró <meta name="{name}">')
    return updated


def replace_canonical(html_text: str, url: str) -> str:
    pattern = r'(<link\s+rel="canonical"\s+href=")[^"]*(")'
    updated, count = re.subn(pattern, rf"\g<1>{url}\g<2>", html_text, count=1)
    if count != 1:
        raise SystemExit("No se encontró <link rel=\"canonical\">")
    return updated


def replace_title(html_text: str, title: str) -> str:
    updated, count = re.subn(r"<title>[^<]*</title>", f"<title>{title}</title>", html_text, count=1)
    if count != 1:
        raise SystemExit("No se encontró <title>")
    return updated


def insert_after_og_image(html_text: str, extra_tags: str) -> str:
    marker = '<meta property="og:image"'
    index = html_text.find(marker)
    if index == -1:
        return html_text
    line_end = html_text.find("\n", index)
    if line_end == -1:
        return html_text + extra_tags
    return html_text[: line_end + 1] + extra_tags + html_text[line_end + 1 :]


def insert_share_head(html_text: str, site_url: str) -> str:
    snippet = (
        "<head>\n"
        '  <base href="../../" />\n'
        '  <meta name="googlebot" content="noindex, nofollow" />'
    )
    if "<base " in html_text:
        return html_text
    if "<head>" not in html_text:
        raise SystemExit("No se encontró <head>")
    html_text = html_text.replace("<head>", snippet, 1)
    html_text = html_text.replace(
        '<html lang="es">',
        '<html lang="es" prefix="og: https://ogp.me/ns#">',
        1,
    )
    return html_text


def extract_youtube_id(video: dict) -> str:
    youtube_id = str(video.get("youtubeId") or "").strip()
    if youtube_id:
        return youtube_id
    url = str(video.get("videoUrl") or "")
    if not url:
        return ""
    try:
        parsed = urlparse(url)
    except ValueError:
        return ""
    host = parsed.netloc.replace("www.", "")
    if host == "youtu.be":
        return parsed.path.strip("/").split("/")[0] if parsed.path else ""
    match = re.search(r"/(?:shorts|embed|live|v)/([A-Za-z0-9_-]{6,})", parsed.path)
    if match:
        return match.group(1)
    query = parsed.query
    found = re.search(r"(?:^|&)v=([A-Za-z0-9_-]{6,})", query)
    return found.group(1) if found else ""


def absolute_url(site_url: str, path: str) -> str:
    value = (path or "").strip()
    if not value:
        return ""
    if value.startswith("http://") or value.startswith("https://"):
        return value
    value = value.lstrip("./")
    if not site_url:
        return value
    return f"{site_url.rstrip('/')}/{value}"


def thumbnail_url(video: dict, site_url: str) -> str:
    thumb = str(video.get("thumbnail") or "").strip()
    if thumb:
        return absolute_url(site_url, thumb)
    if str(video.get("platform") or "").lower() == "youtube":
        youtube_id = extract_youtube_id(video)
        if youtube_id:
            return f"https://i.ytimg.com/vi/{youtube_id}/hqdefault.jpg"
    return ""


def share_page_url(site_url: str, video_id: str) -> str:
    path = f"share/{video_id}/"
    if not site_url:
        return f"/{path}"
    return f"{site_url.rstrip('/')}/{path}"


def make_og_jpeg(source: Path, dest: Path) -> bool:
    try:
        from PIL import Image
    except ImportError:
        print("Aviso: instala Pillow para generar JPEG de vista previa (pip install pillow).", file=sys.stderr)
        return False
    try:
        image = Image.open(source)
        image = image.convert("RGBA")
        canvas = Image.new("RGB", (OG_WIDTH, OG_HEIGHT), OG_BACKGROUND)
        ratio = min(OG_WIDTH / image.width, OG_HEIGHT / image.height)
        size = (max(1, int(image.width * ratio)), max(1, int(image.height * ratio)))
        resized = image.resize(size, Image.Resampling.LANCZOS)
        x = (OG_WIDTH - size[0]) // 2
        y = (OG_HEIGHT - size[1]) // 2
        canvas.paste(resized, (x, y), resized)
        dest.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(dest, "JPEG", quality=88, optimize=True)
        return True
    except Exception as error:
        print(f"Aviso: no se pudo generar {dest}: {error}", file=sys.stderr)
        return False


def local_thumbnail_path(video: dict) -> Path | None:
    thumb = str(video.get("thumbnail") or "").strip()
    if not thumb or thumb.startswith("http://") or thumb.startswith("https://"):
        return None
    path = Path(thumb.lstrip("./"))
    return path if path.is_file() else None


def og_image_for(video: dict, site_url: str, page_dir: Path, video_id: str) -> tuple[str, str, str, str]:
    """Devuelve url, mime, width, height."""
    local_thumb = local_thumbnail_path(video)
    jpeg_path = page_dir / "og.jpg"
    if local_thumb and make_og_jpeg(local_thumb, jpeg_path):
        return (
            share_page_url(site_url, video_id).rstrip("/") + "/og.jpg",
            "image/jpeg",
            str(OG_WIDTH),
            str(OG_HEIGHT),
        )
    image = thumbnail_url(video, site_url)
    mime = "image/webp" if image.lower().endswith(".webp") else "image/jpeg"
    if image.lower().endswith(".png"):
        mime = "image/png"
    return image, mime, "", ""


def build_share_html(source_html: str, video: dict, site_url: str, image: str, image_mime: str, image_w: str, image_h: str) -> str:
    video_id = str(video.get("id"))
    title = str(video.get("title") or "Daniela Orbe · Creadora UGC").strip()
    description = str(video.get("subtitle") or "").strip()
    page_url = share_page_url(site_url, video_id)

    html_text = insert_share_head(source_html, site_url)
    html_text = replace_title(html_text, escape_attr(title))
    html_text = replace_canonical(html_text, escape_attr(page_url))
    html_text = replace_meta_name(html_text, "description", escape_attr(description))
    html_text = replace_meta_property(html_text, "og:url", escape_attr(page_url))
    html_text = replace_meta_property(html_text, "og:title", escape_attr(title))
    html_text = replace_meta_property(html_text, "og:description", escape_attr(description))
    html_text = replace_meta_name(html_text, "twitter:title", escape_attr(title))
    html_text = replace_meta_name(html_text, "twitter:description", escape_attr(description))

    if image:
        html_text = replace_meta_property(html_text, "og:image", escape_attr(image))
        html_text = replace_meta_property(html_text, "og:image:alt", escape_attr(title))
        html_text = replace_meta_name(html_text, "twitter:image", escape_attr(image))
        html_text = replace_meta_name(html_text, "twitter:image:alt", escape_attr(title))
        extras = [
            f'  <meta property="og:image:secure_url" content="{escape_attr(image)}" />\n',
            f'  <meta property="og:site_name" content="Daniela Orbe" />\n',
        ]
        if image_mime:
            extras.append(f'  <meta property="og:image:type" content="{escape_attr(image_mime)}" />\n')
        if image_w and image_h:
            extras.append(f'  <meta property="og:image:width" content="{escape_attr(image_w)}" />\n')
            extras.append(f'  <meta property="og:image:height" content="{escape_attr(image_h)}" />\n')
        html_text = insert_after_og_image(html_text, "".join(extras))

    return html_text


def generate_share_pages(source_html: str, videos: list[dict], site_url: str, share_dir: Path) -> int:
    if share_dir.exists():
        shutil.rmtree(share_dir)
    share_dir.mkdir(parents=True)

    written = 0
    for video in videos:
        if is_coming_soon(video):
            continue
        video_id = video.get("id")
        if video_id is None or str(video_id).strip() == "":
            print("Aviso: se omitió un video sin id.", file=sys.stderr)
            continue
        video_id = str(video_id)
        page_dir = share_dir / video_id
        page_dir.mkdir(parents=True)
        image, mime, width, height = og_image_for(video, site_url, page_dir, video_id)
        html_text = build_share_html(source_html, video, site_url, image, mime, width, height)
        (page_dir / "index.html").write_text(html_text, encoding="utf-8")
        written += 1
    return written


def write_admin_config(admin_dir: Path, site_url: str, admin_pin: str) -> None:
    admin_dir.mkdir(parents=True, exist_ok=True)
    pin = (admin_pin or "").strip()
    config = {
        "siteUrl": (site_url or "").rstrip("/"),
        "pinHash": hashlib.sha256(pin.encode("utf-8")).hexdigest() if pin else "",
    }
    (admin_dir / "config.js").write_text(
        "window.UGC_ADMIN = " + json.dumps(config, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    html_path = Path(args.html)
    videos_path = Path(args.videos)

    if not html_path.is_file():
        raise SystemExit(f"No existe el HTML: {html_path}")
    if not videos_path.is_file():
        raise SystemExit(f"No existe el JSON de videos: {videos_path}")

    source_html = html_path.read_text(encoding="utf-8")
    videos = load_videos(videos_path)
    count = generate_share_pages(source_html, videos, args.site_url, Path(args.share_dir))
    write_admin_config(Path(args.admin_dir), args.site_url, args.admin_pin)

    print(f"✅ {count} páginas de compartir en {args.share_dir}/")
    print(f"✅ {args.admin_dir}/config.js generado")
    if not args.site_url:
        print("Aviso: SITE_URL vacío; og:image puede no ser absoluta.", file=sys.stderr)
    if not (args.admin_pin or "").strip():
        print("Aviso: ADMIN_PIN vacío; /admin/ pedirá configurarlo.", file=sys.stderr)


if __name__ == "__main__":
    main()
