// ============================================================
// main.js - Portafolio UGC Daniela Orbe
// ============================================================

// ---------- Utilidades ----------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const siteRootUrl = () => {
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/share\/\d+(?:\/(?:index\.html)?)?\/?$/, '/');
  if (!url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/[^/]+$/, '') || '/';
  }
  return url;
};

const dataFileUrl = (file) => new URL(file, siteRootUrl()).toString();

const homePageUrl = () => {
  const root = siteRootUrl();
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  return isLocal ? new URL('index.local.html', root).toString() : root.toString();
};

// ---------- Navbar scroll ----------
const navbar = document.getElementById('navbar');
const onScroll = () => {
  if (!navbar) return;
  if (window.scrollY > 20) navbar.classList.add('nav-scrolled');
  else navbar.classList.remove('nav-scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Menú móvil ----------
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

const closeMenu = () => {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.classList.add('hidden-menu');
  menuBtn.setAttribute('aria-expanded', 'false');
};
const openMenu = () => {
  if (!mobileMenu || !menuBtn) return;
  mobileMenu.classList.remove('hidden-menu');
  menuBtn.setAttribute('aria-expanded', 'true');
};

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = !mobileMenu.classList.contains('hidden-menu');
    if (isOpen) closeMenu();
    else openMenu();
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

document.addEventListener('click', (event) => {
  if (navbar && !navbar.contains(event.target)) closeMenu();
});

const navSectionLinks = document.querySelectorAll('#navbar ul a[href^="#"]');
const navHashBySectionId = {
  inicio: '#inicio',
  'sobre-mi': '#sobre-mi',
  portfolio: '#portfolio',
  galeria: '#portfolio',
  servicios: '#servicios',
  contacto: '#contacto',
};
const navSections = Object.keys(navHashBySectionId)
  .map((id) => document.getElementById(id))
  .filter(Boolean);

let currentNavHash = '';
let navLockedFromClick = false;
let navClickTimer;

const setActiveNav = (hash) => {
  if (!hash || hash === currentNavHash) return;
  currentNavHash = hash;
  navSectionLinks.forEach((link) => {
    if (link.getAttribute('href') === hash) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

const unlockNavFromClick = () => {
  navLockedFromClick = false;
  window.removeEventListener('scrollend', unlockNavFromClick);
  clearTimeout(navClickTimer);
};

const syncNavFromScroll = () => {
  if (navLockedFromClick || !navSections.length) return;

  const marker = (navbar?.offsetHeight || 80) + 16;
  let nextHash = '#inicio';

  navSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= marker) {
      nextHash = navHashBySectionId[section.id];
    }
  });

  setActiveNav(nextHash);
};

navSectionLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLockedFromClick = true;
    setActiveNav(link.getAttribute('href'));
    window.removeEventListener('scrollend', unlockNavFromClick);
    window.addEventListener('scrollend', unlockNavFromClick, { once: true });
    clearTimeout(navClickTimer);
    navClickTimer = setTimeout(unlockNavFromClick, 1500);
  });
});

window.addEventListener('scroll', syncNavFromScroll, { passive: true });
syncNavFromScroll();

// ---------- Animación reveal ----------
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealElements = (root = document) => {
  const els = root.querySelectorAll('.reveal:not(.visible)');
  if (prefersReducedMotion) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => observer.observe(el));
};

revealElements();

// ---------- Iframe helper ----------
const createVideoIframe = (src, title, eager) => {
  const iframe = document.createElement('iframe');
  iframe.className = 'absolute inset-0 w-full h-full border-0';
  iframe.src = src;
  iframe.title = title;
  iframe.setAttribute(
    'allow',
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
  );
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('loading', eager ? 'eager' : 'lazy');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  return iframe;
};

const extractYouTubeId = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url, 'https://youtube.com');
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      return parsed.pathname.split('/').filter(Boolean)[0] || '';
    }
    const fromPath = parsed.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{6,})/);
    if (fromPath) return fromPath[1];
    return parsed.searchParams.get('v') || '';
  } catch {
    return '';
  }
};

const getYouTubeId = (video) => video.youtubeId || extractYouTubeId(video.videoUrl);

const extractTikTokVideoId = (url) => {
  if (!url) return '';
  const match = String(url).match(/\/video\/(\d+)/);
  return match ? match[1] : '';
};

const getInstagramEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url, 'https://www.instagram.com');
    const match = parsed.pathname.match(/^\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!match) return '';
    const kind = match[1] === 'reels' ? 'reel' : match[1];
    return `https://www.instagram.com/${kind}/${match[2]}/embed/`;
  } catch {
    return '';
  }
};

const getFacebookEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url, 'https://www.facebook.com');
    const path = parsed.pathname.replace(/\/$/, '');
    let href = `https://www.facebook.com${path}`;

    const reel = path.match(/^\/(?:reel|reels)\/(\d+)$/);
    const uploaded = path.match(/\/videos\/(\d+)$/);
    const share = path.match(/^\/share\/([rv])\/([^/]+)$/);
    const watchId = parsed.searchParams.get('v');

    if (reel) href = `https://www.facebook.com/reel/${reel[1]}`;
    else if (uploaded) href = `https://www.facebook.com/watch/?v=${uploaded[1]}`;
    else if (watchId) href = `https://www.facebook.com/watch/?v=${watchId}`;
    else if (share) href = `https://www.facebook.com/share/${share[1]}/${share[2]}`;

    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=0&width=267`;
  } catch {
    return '';
  }
};

const getVimeoEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url, 'https://vimeo.com');
    const match = parsed.pathname.match(/\/(\d+)/);
    if (!match) return '';
    const videoId = match[1];
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0`;
  } catch {
    return '';
  }
};

// ---------- Renderizado de videos ----------
const galleryGrid = document.getElementById('gallery-grid');
const filterContainer = document.getElementById('gallery-filters');
let allVideos = [];
let activeCategory = 'Todos';
let activePlatform = 'Todas';

const getVideoThumbnail = (video) => {
  if (video.thumbnail) return video.thumbnail;
  const youtubeId = getYouTubeId(video);
  if (video.platform === 'youtube' && youtubeId) {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }
  return '';
};

const isComingSoon = (video) => video.comingSoon === true;

const createComingSoonCard = (video) => {
  const article = document.createElement('article');
  article.className = 'video-card reveal';
  article.dataset.comingSoon = 'true';
  if (video.id != null) article.dataset.videoId = String(video.id);
  article.innerHTML = `
    <div class="relative aspect-[9/16] rounded-2xl overflow-hidden border-2 border-dashed border-champ/50 bg-cream/50 flex flex-col items-center justify-center p-6 text-center">
      <div class="w-14 h-14 rounded-full bg-champ/30 grid place-items-center mb-4" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5A5A5A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <h3 class="font-display font-semibold text-sm text-muted">${video.title || 'Video próximamente'}</h3>
      <p class="mt-2 text-xs text-muted/70 leading-relaxed">
        ${video.subtitle || 'Más contenido en camino. Sígueme en redes para ver mi trabajo actual.'}
      </p>
    </div>`;
  return article;
};

const createVideoCard = (video) => {
  if (isComingSoon(video)) return createComingSoonCard(video);

  const article = document.createElement('article');
  article.className = 'video-card reveal';
  article.dataset.category = video.category || '';
  article.dataset.platform = video.platform || '';
  if (video.id != null) article.dataset.videoId = String(video.id);

  const thumbnailSrc = getVideoThumbnail(video);
  const ariaText = 'Reproducir';

  // Badge de plataforma
  const platformBadge = video.platform.charAt(0).toUpperCase() + video.platform.slice(1);

  // Construir el contenido del botón según la plataforma
  let buttonContent = '';

  if (video.platform === 'youtube') {
    const youtubeId = getYouTubeId(video);
    buttonContent = `
      <button type="button" class="video-embed absolute inset-0 w-full h-full"
        data-platform="youtube"
        data-youtube-id="${youtubeId}"
        data-video-url="${video.videoUrl || ''}"
        aria-label="${ariaText}: ${video.title}">
        ${thumbnailSrc ? `<img src="${thumbnailSrc}" alt="" class="absolute inset-0 w-full h-full object-cover" width="480" height="360" loading="lazy" onerror="this.remove()" />` : ''}
        <span class="play-overlay">
          <span class="w-14 h-14 bg-white/90 rounded-full grid place-items-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0A0A0A"><path d="M8 5v14l11-7z"/></svg>
          </span>
        </span>
      </button>`;
  } else if (video.platform === 'tiktok' || video.platform === 'instagram' || video.platform === 'facebook') {
    buttonContent = `
      <button type="button" class="video-embed absolute inset-0 w-full h-full"
        data-platform="${video.platform}"
        data-video-url="${video.videoUrl || ''}"
        aria-label="${ariaText}: ${video.title}">
        ${thumbnailSrc ? `<img src="${thumbnailSrc}" alt="" class="absolute inset-0 w-full h-full object-cover" width="480" height="360" loading="lazy" onerror="this.remove()" />` : ''}
        <span class="play-overlay">
          <span class="w-14 h-14 bg-white/90 rounded-full grid place-items-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0A0A0A"><path d="M8 5v14l11-7z"/></svg>
          </span>
        </span>
      </button>`;
  } else if (video.platform === 'vimeo') {
    buttonContent = `
      <button type="button" class="video-embed absolute inset-0 w-full h-full"
        data-platform="vimeo"
        data-video-url="${video.videoUrl || ''}"
        aria-label="${ariaText}: ${video.title}">
        ${thumbnailSrc ? `<img src="${thumbnailSrc}" alt="" class="absolute inset-0 w-full h-full object-cover" width="480" height="360" loading="lazy" onerror="this.remove()" />` : ''}
        <span class="play-overlay">
          <span class="w-14 h-14 bg-white/90 rounded-full grid place-items-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0A0A0A"><path d="M8 5v14l11-7z"/></svg>
          </span>
        </span>
      </button>`;
  }

  article.innerHTML = `
    <div class="relative aspect-[9/16] rounded-2xl overflow-hidden bg-cream shadow-sm card-lift">
      ${buttonContent}
      ${video.category ? `<span class="absolute top-3 left-3 z-10 pointer-events-none bg-ink/70 backdrop-blur text-white text-[11px] font-medium px-2.5 py-1 rounded-full">${video.category}</span>` : ''}
      <span class="absolute top-3 right-3 z-10 pointer-events-none bg-white/80 backdrop-blur text-ink text-[10px] font-medium px-2 py-0.5 rounded-full">
        ${platformBadge}
      </span>
    </div>
    <h3 class="mt-3 font-display font-semibold text-sm leading-snug line-clamp-2">
      ${video.title}
    </h3>
    <p class="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted/80">
      ${video.subtitle}
    </p>`;

  return article;
};

// ---------- Filtros ----------
const getCategories = (videos) => {
  const cats = [...new Set(videos.filter((v) => !isComingSoon(v) && v.category).map((v) => v.category))];
  return ['Todos', ...cats.sort()];
};

const getPlatforms = (videos) => {
  const plats = [...new Set(videos.filter((v) => !isComingSoon(v) && v.platform).map((v) => v.platform))];
  return ['Todas', ...plats.sort()];
};

const renderFilters = (videos) => {
  if (!filterContainer) return;

  const realVideos = videos.filter((v) => !isComingSoon(v));
  const categories = getCategories(videos);
  const platforms = getPlatforms(videos);
  const uniqueCategoryCount = categories.length - 1;
  const uniquePlatformCount = platforms.length - 1;
  const showCategory = realVideos.length > 5 && uniqueCategoryCount > 1;
  const showPlatform = realVideos.length > 5 && uniquePlatformCount > 1;

  if (!showCategory && !showPlatform) {
    filterContainer.innerHTML = '';
    filterContainer.hidden = true;
    activeCategory = 'Todos';
    activePlatform = 'Todas';
    return;
  }

  filterContainer.hidden = false;

  const categoryRow = showCategory
    ? `<div class="flex flex-wrap items-center justify-center gap-2${showPlatform ? ' mb-4' : ''}">
      <span class="text-xs font-medium text-muted mr-1">Categoría:</span>
      ${categories
        .map(
          (cat) =>
            `<button type="button" class="filter-btn filter-category px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              cat === 'Todos'
                ? 'bg-ink text-white'
                : 'bg-cream text-muted hover:bg-rose-soft hover:text-ink'
            }" data-filter-type="category" data-value="${cat}">${cat}</button>`
        )
        .join('')}
    </div>`
    : '';

  const platformRow = showPlatform
    ? `<div class="flex flex-wrap items-center justify-center gap-2">
      <span class="text-xs font-medium text-muted mr-1">Plataforma:</span>
      ${platforms
        .map(
          (plat) =>
            `<button type="button" class="filter-btn filter-platform px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              plat === 'Todas'
                ? 'bg-ink text-white'
                : 'bg-cream text-muted hover:bg-rose-soft hover:text-ink'
            }" data-filter-type="platform" data-value="${plat}">${plat.charAt(0).toUpperCase() + plat.slice(1)}</button>`
        )
        .join('')}
    </div>`
    : '';

  filterContainer.innerHTML = `${categoryRow}${platformRow}`;

  if (!showCategory) activeCategory = 'Todos';
  if (!showPlatform) activePlatform = 'Todas';

  filterContainer.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.filterType;
      const value = btn.dataset.value;

      if (type === 'category') {
        activeCategory = value;
        filterContainer.querySelectorAll('.filter-category').forEach((b) => {
          b.className = b.className.replace('bg-ink text-white', 'bg-cream text-muted');
        });
        btn.className = btn.className.replace('bg-cream text-muted', 'bg-ink text-white');
      } else if (type === 'platform') {
        activePlatform = value;
        filterContainer.querySelectorAll('.filter-platform').forEach((b) => {
          b.className = b.className.replace('bg-ink text-white', 'bg-cream text-muted');
        });
        btn.className = btn.className.replace('bg-cream text-muted', 'bg-ink text-white');
      }

      renderGallery();
    });
  });
};

// ---------- Renderizado de la galería ----------
const renderGallery = () => {
  if (!galleryGrid) return;

  const soonVideos = allVideos.filter(isComingSoon);
  const filtered = allVideos.filter((v) => {
    if (isComingSoon(v)) return false;
    const matchCat = activeCategory === 'Todos' || v.category === activeCategory;
    const matchPlat = activePlatform === 'Todas' || v.platform === activePlatform;
    return matchCat && matchPlat;
  });
  const showSoon = activeCategory === 'Todos' && activePlatform === 'Todas';
  const cards = showSoon ? [...filtered, ...soonVideos] : filtered;

  galleryGrid.innerHTML = '';

  if (cards.length === 0) {
    galleryGrid.innerHTML = `
      <div class="w-full text-center py-12">
        <p class="text-muted text-sm">No hay videos para esta selección.</p>
      </div>`;
    return;
  }

  cards.forEach((video) => {
    galleryGrid.appendChild(createVideoCard(video));
  });

  revealElements(galleryGrid);

  // Re-vincular eventos de video
  bindVideoEvents();
  focusSharedVideo();
};

const getSharedVideoId = () => {
  const match = window.location.pathname.match(/\/share\/(\d+)(?:\/(?:index\.html)?)?$/);
  return match ? match[1] : '';
};

const focusSharedVideo = () => {
  const id = getSharedVideoId();
  if (!id || !galleryGrid) return;
  const card = galleryGrid.querySelector(`[data-video-id="${id}"]`);
  if (!card) return;
  card.classList.add('video-card-shared');
};

const getVideoEmbedSrc = (video) => {
  const platform = video.platform;
  if (platform === 'youtube') {
    const id = getYouTubeId(video);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1` : '';
  }
  if (platform === 'tiktok') {
    const id = extractTikTokVideoId(video.videoUrl);
    return id ? `https://www.tiktok.com/player/v1/${id}?music_info=0&description=0&autoplay=1` : '';
  }
  if (platform === 'instagram') return getInstagramEmbedUrl(video.videoUrl);
  if (platform === 'facebook') return getFacebookEmbedUrl(video.videoUrl);
  if (platform === 'vimeo') return getVimeoEmbedUrl(video.videoUrl);
  return '';
};

const ensureVideoModal = () => {
  let modal = document.getElementById('video-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'video-modal';
  modal.className = 'video-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'video-modal-title');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <button type="button" class="video-modal-close" aria-label="Cerrar video">&times;</button>
    <div class="video-modal-dialog">
      <div id="video-modal-player" class="video-modal-player"></div>
      <div class="video-modal-meta">
        <h2 id="video-modal-title" class="font-display font-semibold text-white text-base md:text-lg leading-snug"></h2>
        <p id="video-modal-subtitle" class="text-sm text-white/70 mt-1 leading-relaxed"></p>
      </div>
    </div>`;
  document.body.appendChild(modal);
  return modal;
};

const closeVideoModal = () => {
  const modal = document.getElementById('video-modal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  const player = document.getElementById('video-modal-player');
  if (player) player.innerHTML = '';
  if (!lightbox?.classList.contains('active')) {
    document.body.style.overflow = '';
  }
  if (getSharedVideoId()) {
    window.location.replace(homePageUrl());
  }
};

const openVideoModal = (video) => {
  const modal = ensureVideoModal();
  const player = document.getElementById('video-modal-player');
  const titleEl = document.getElementById('video-modal-title');
  const subtitleEl = document.getElementById('video-modal-subtitle');
  if (!player) return;

  player.innerHTML = '';
  if (titleEl) titleEl.textContent = video.title || '';
  if (subtitleEl) subtitleEl.textContent = video.subtitle || '';

  const embedSrc = getVideoEmbedSrc(video);
  if (embedSrc) {
    player.appendChild(createVideoIframe(embedSrc, video.title || 'Video', true));
  } else if (video.videoUrl) {
    player.innerHTML = `
      <div class="video-modal-fallback">
        <a href="${video.videoUrl}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center justify-center bg-white text-ink font-display font-semibold px-5 py-3 rounded-full">
          Ver video
        </a>
      </div>`;
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.video-modal-close')?.focus();
};

let shareModalBound = false;
const bindVideoModalEvents = () => {
  if (shareModalBound) return;
  const modal = ensureVideoModal();
  shareModalBound = true;

  modal.querySelector('.video-modal-close')?.addEventListener('click', closeVideoModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeVideoModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!modal.classList.contains('active')) return;
    event.stopImmediatePropagation();
    closeVideoModal();
  });
};

let shareModalOpened = false;
const maybeOpenSharedVideo = () => {
  if (shareModalOpened) return;
  const id = getSharedVideoId();
  if (!id) return;
  const video = allVideos.find((item) => String(item.id) === id && !isComingSoon(item));
  if (!video) return;
  shareModalOpened = true;
  bindVideoModalEvents();
  openVideoModal(video);
  focusSharedVideo();
};

// ---------- Eventos de video ----------
const unloadPlatformEmbeds = (platform, keepBtn) => {
  if (!galleryGrid) return;
  galleryGrid.querySelectorAll(`.video-embed[data-platform="${platform}"] iframe`).forEach((frame) => {
    if (keepBtn && keepBtn.contains(frame)) return;
    frame.remove();
  });
};

const bindVideoEvents = () => {
  galleryGrid.querySelectorAll('.video-embed').forEach((btn) => {
    btn.addEventListener('click', () => {
      const platform = btn.dataset.platform;
      const title = (btn.getAttribute('aria-label') || 'Video').replace(/^Reproducir:\s*/i, '');

      if (platform === 'youtube') {
        const id = btn.dataset.youtubeId || extractYouTubeId(btn.dataset.videoUrl);
        if (!id) return;
        btn.replaceWith(createVideoIframe(
          `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
          title,
          true
        ));
        return;
      }

      if (platform === 'tiktok') {
        if (btn.querySelector('iframe')) return;
        const id = extractTikTokVideoId(btn.dataset.videoUrl);
        if (!id) {
          if (btn.dataset.videoUrl) {
            window.open(btn.dataset.videoUrl, '_blank', 'noopener,noreferrer');
          }
          return;
        }
        unloadPlatformEmbeds('tiktok', btn);
        btn.appendChild(
          createVideoIframe(
            `https://www.tiktok.com/player/v1/${id}?music_info=0&description=0&autoplay=1`,
            title,
            true
          )
        );
        return;
      }

      if (platform === 'instagram' || platform === 'facebook') {
        if (btn.querySelector('iframe')) return;
        const embedUrl = platform === 'instagram'
          ? getInstagramEmbedUrl(btn.dataset.videoUrl)
          : getFacebookEmbedUrl(btn.dataset.videoUrl);
        if (!embedUrl) {
          if (btn.dataset.videoUrl) {
            window.open(btn.dataset.videoUrl, '_blank', 'noopener,noreferrer');
          }
          return;
        }
        unloadPlatformEmbeds(platform, btn);
        btn.appendChild(createVideoIframe(embedUrl, title, true));
        return;
      }

      if (platform === 'vimeo') {
        if (btn.querySelector('iframe')) return;
        const embedUrl = getVimeoEmbedUrl(btn.dataset.videoUrl);
        if (!embedUrl) {
          if (btn.dataset.videoUrl) {
            window.open(btn.dataset.videoUrl, '_blank', 'noopener,noreferrer');
          }
          return;
        }
        unloadPlatformEmbeds('vimeo', btn);
        btn.appendChild(createVideoIframe(embedUrl, title, true));
        return;
      }
    });
  });
};

// ---------- Cargar videos desde JSON ----------
const loadVideos = async () => {
  try {
    // Intentar data/videos.local.json primero (generado por build.sh en local)
    // Si no existe, usar data/videos.json (procesado por GitHub Actions en producción)
    let response = await fetch(dataFileUrl('data/videos.local.json'));
    if (!response.ok) response = await fetch(dataFileUrl('data/videos.json'));
    if (!response.ok) throw new Error('No se pudo cargar videos.json');

    const data = await response.json();
    allVideos = data.videos || [];

    renderFilters(allVideos);
    renderGallery();
    maybeOpenSharedVideo();
  } catch (error) {
    console.error('Error cargando videos:', error);
    if (!galleryGrid) return;
    galleryGrid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-muted text-sm">Error cargando el contenido. Intenta de nuevo más tarde.</p>
      </div>`;
  }
};

// ============================================================
// Galería de imágenes + Lightbox
// ============================================================

const imageGrid = document.getElementById('image-grid');
const imageFilterContainer = document.getElementById('image-filters');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxCounter = document.getElementById('lightbox-counter');
let allImages = [];
let filteredImages = [];
let activeImageCategory = 'Todas';
let currentLightboxIndex = 0;

const loadImageData = async () => {
  try {
    let response = await fetch(dataFileUrl('data/images.local.json'));
    if (!response.ok) response = await fetch(dataFileUrl('data/images.json'));
    if (!response.ok) throw new Error('No se pudo cargar images.json');

    const data = await response.json();
    allImages = data.images || [];
    filteredImages = [...allImages];

    renderImageFilters();
    renderImageGallery();
  } catch (error) {
    console.error('Error cargando imágenes:', error);
    if (imageGrid) {
      imageGrid.className = 'text-center py-12';
      imageGrid.innerHTML = `
        <p class="text-muted text-sm">Error cargando imágenes. Intenta de nuevo más tarde.</p>`;
    }
  }
};

const getImageCategories = (images) => {
  const cats = [...new Set(images.filter((img) => img.category).map((img) => img.category))];
  return ['Todas', ...cats.sort()];
};

const renderImageFilters = () => {
  if (!imageFilterContainer) return;

  const categories = getImageCategories(allImages);

  imageFilterContainer.innerHTML = `
    <div class="flex flex-wrap items-center justify-center gap-2">
      <span class="text-xs font-medium text-muted mr-1">Categoría:</span>
      ${categories
        .map(
          (cat) =>
            `<button type="button" class="image-filter-btn px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              cat === 'Todas'
                ? 'bg-ink text-white'
                : 'bg-cream text-muted hover:bg-champ hover:text-ink'
            }" data-category="${cat}">${cat}</button>`
        )
        .join('')}
    </div>`;

  imageFilterContainer.querySelectorAll('.image-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeImageCategory = btn.dataset.category;

      imageFilterContainer.querySelectorAll('.image-filter-btn').forEach((b) => {
        b.className = b.className.replace('bg-ink text-white', 'bg-cream text-muted');
      });
      btn.className = btn.className.replace('bg-cream text-muted', 'bg-ink text-white');

      filteredImages = activeImageCategory === 'Todas'
        ? [...allImages]
        : allImages.filter((img) => img.category === activeImageCategory);

      renderImageGallery();
    });
  });
};

const getAspectClass = (aspect) => {
  switch (aspect) {
    case 'vertical': return 'aspect-[3/4]';
    case 'horizontal': return 'aspect-[4/3]';
    case 'square':
    default: return 'aspect-square';
  }
};

const createImageCard = (image, index) => {
  const article = document.createElement('article');
  article.className = 'image-card break-inside-avoid reveal cursor-pointer group';
  article.dataset.category = image.category || '';
  article.dataset.index = index;

  article.innerHTML = `
    <div class="relative ${getAspectClass(image.aspect)} rounded-2xl overflow-hidden bg-cream shadow-sm">
      <img
        src="${image.src}"
        alt="${image.alt || image.title}"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        width="480"
        height="360"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <span class="absolute top-3 left-3 z-10 pointer-events-none bg-ink/70 backdrop-blur text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
        ${image.category}
      </span>
      <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p class="font-display font-semibold text-sm text-white leading-snug line-clamp-2">
          ${image.title}
        </p>
      </div>
    </div>`;

  article.addEventListener('click', () => openLightbox(index));

  return article;
};

const renderImageGallery = () => {
  if (!imageGrid) return;

  imageGrid.innerHTML = '';

  if (filteredImages.length === 0) {
    imageGrid.className = 'text-center py-12';
    imageGrid.innerHTML = `
      <p class="text-muted text-sm">No hay imágenes para esta selección.</p>`;
    return;
  }

  imageGrid.className = 'columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4';

  filteredImages.forEach((image, index) => {
    imageGrid.appendChild(createImageCard(image, index));
  });

  revealElements(imageGrid);
};

// ---------- Lightbox ----------
const openLightbox = (index) => {
  if (!lightbox || !filteredImages[index]) return;

  currentLightboxIndex = index;
  updateLightboxContent();

  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  lightbox.querySelector('.lightbox-close').focus();
};

const closeLightbox = () => {
  if (!lightbox) return;

  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Devolver foco al elemento que abrió el lightbox
  const trigger = imageGrid.querySelector(`[data-index="${currentLightboxIndex}"]`);
  if (trigger) trigger.focus();
};

const updateLightboxContent = () => {
  const image = filteredImages[currentLightboxIndex];
  if (!image) return;

  lightboxImg.src = image.src;
  lightboxImg.alt = image.alt || image.title;
  lightboxTitle.textContent = image.title;
  lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${filteredImages.length}`;
};

const navigateLightbox = (direction) => {
  currentLightboxIndex += direction;

  if (currentLightboxIndex < 0) {
    currentLightboxIndex = filteredImages.length - 1;
  } else if (currentLightboxIndex >= filteredImages.length) {
    currentLightboxIndex = 0;
  }

  updateLightboxContent();
};

// Event listeners del lightbox
if (lightbox) {
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigateLightbox(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': navigateLightbox(-1); break;
      case 'ArrowRight': navigateLightbox(1); break;
    }
  });
}

// ---------- Init ----------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    loadImageData();
  });
} else {
  loadVideos();
  loadImageData();
}
