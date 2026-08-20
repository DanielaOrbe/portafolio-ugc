const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const navbar = document.getElementById('navbar');
const onScroll = () => {
  if (window.scrollY > 20) navbar.classList.add('nav-scrolled');
  else navbar.classList.remove('nav-scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

const closeMenu = () => {
  mobileMenu.classList.add('hidden-menu');
  menuBtn.setAttribute('aria-expanded', 'false');
};
const openMenu = () => {
  mobileMenu.classList.remove('hidden-menu');
  menuBtn.setAttribute('aria-expanded', 'true');
};

menuBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = !mobileMenu.classList.contains('hidden-menu');
  if (isOpen) closeMenu();
  else openMenu();
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

document.addEventListener('click', (event) => {
  if (!navbar.contains(event.target)) closeMenu();
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
}

document.querySelectorAll('.video-embed').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.youtubeId;
    if (!id) return;

    const iframe = document.createElement('iframe');
    iframe.className = 'absolute inset-0 w-full h-full';
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    iframe.title = (btn.getAttribute('aria-label') || 'Video').replace(/^Reproducir:\s*/i, '');
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
    );
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'eager');
    btn.replaceWith(iframe);
  });
});
