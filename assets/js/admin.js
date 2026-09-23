// ============================================================
// admin.js - Lista de videos y enlaces para compartir (OG)
// ============================================================

const SESSION_KEY = "ugc-admin-unlocked";
const MAX_PIN_ATTEMPTS = 5;

const pinGate = document.getElementById("pin-gate");
const pinForm = document.getElementById("pin-form");
const pinInput = document.getElementById("pin-input");
const pinError = document.getElementById("pin-error");
const pinSubmit = document.getElementById("pin-submit");
const adminApp = document.getElementById("admin-app");
const videoRows = document.getElementById("video-rows");
const emptyState = document.getElementById("empty-state");
const logoutBtn = document.getElementById("logout-btn");
const setupMessage = document.getElementById("setup-message");

let pinAttempts = 0;

const adminConfig = () => window.UGC_ADMIN || {};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sha256Hex = async (text) => {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const setHidden = (element, isHidden) => {
  if (!element) return;
  element.classList.toggle("admin-hidden", isHidden);
  element.toggleAttribute("hidden", isHidden);
};

const showError = (message) => {
  if (!pinError) return;
  pinError.textContent = message;
  setHidden(pinError, !message);
};

const unlockAdmin = () => {
  sessionStorage.setItem(SESSION_KEY, "1");
  pinAttempts = 0;
  setHidden(pinGate, true);
  setHidden(adminApp, false);
  loadVideos();
};

const lockAdmin = () => {
  sessionStorage.removeItem(SESSION_KEY);
  setHidden(adminApp, true);
  setHidden(pinGate, false);
  if (pinInput) {
    pinInput.disabled = false;
    pinInput.value = "";
    pinInput.focus();
  }
  if (pinSubmit) pinSubmit.disabled = false;
  pinAttempts = 0;
  showError("");
};

const siteUrl = () => {
  const configured = String(adminConfig().siteUrl || "").replace(/\/+$/, "");
  if (configured) return configured;
  const { origin, pathname } = window.location;
  return pathname.includes("/admin") ? origin + pathname.replace(/\/admin\/?.*$/, "") : origin;
};

const shareUrlFor = (videoId) => `${siteUrl()}/share/${videoId}/`;

const thumbnailFor = (video) => {
  if (video.thumbnail) return video.thumbnail.startsWith("http") ? video.thumbnail : `../${video.thumbnail}`;
  return "";
};

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  field.remove();
};

const bindCopyButtons = () => {
  videoRows?.querySelectorAll("[data-copy-url]").forEach((button) => {
    button.addEventListener("click", async () => {
      const url = button.getAttribute("data-copy-url");
      if (!url) return;
      const original = button.textContent;
      try {
        await copyText(url);
        button.textContent = "Copiado";
        button.disabled = true;
        setTimeout(() => {
          button.textContent = original;
          button.disabled = false;
        }, 1600);
      } catch {
        button.textContent = "Error";
        setTimeout(() => {
          button.textContent = original;
        }, 1600);
      }
    });
  });
};

const renderVideos = (videos) => {
  const shareable = videos.filter((video) => video.comingSoon !== true);
  if (!videoRows) return;

  if (shareable.length === 0) {
    videoRows.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;
  videoRows.innerHTML = shareable
    .map((video) => {
      const url = shareUrlFor(video.id);
      const previewHref = `../share/${video.id}/`;
      const thumb = thumbnailFor(video);
      const thumbCell = thumb
        ? `<img src="${escapeHtml(thumb)}" alt="" class="w-12 h-[85px] object-cover rounded-lg bg-cream" width="48" height="85" />`
        : `<div class="w-12 h-[85px] rounded-lg bg-cream"></div>`;
      return `
        <tr class="border-b border-champ/30 last:border-0 align-top">
          <td class="py-4 pl-6 pr-4">${thumbCell}</td>
          <td class="py-4 pr-4 font-display font-semibold text-sm leading-snug">${escapeHtml(video.title || "")}</td>
          <td class="py-4 pr-4 text-sm text-muted max-w-xs">${escapeHtml(video.subtitle || "")}</td>
          <td class="py-4 pr-4 text-sm text-muted whitespace-nowrap">${escapeHtml(video.category || "")}</td>
          <td class="py-4 pr-4 text-sm text-muted capitalize">${escapeHtml(video.platform || "")}</td>
          <td class="py-4 pr-6">
            <div class="flex flex-col items-stretch gap-2 min-w-[10rem]">
              <button type="button" data-copy-url="${escapeHtml(url)}"
                class="inline-flex items-center justify-center bg-ink text-white text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                Copiar enlace
              </button>
              <a href="${escapeHtml(previewHref)}" target="_blank" rel="noopener noreferrer"
                 class="text-center text-xs font-medium text-muted underline decoration-rose-blush underline-offset-4 hover:text-ink">
                Abrir
              </a>
            </div>
          </td>
        </tr>`;
    })
    .join("");

  bindCopyButtons();
};

const loadVideos = async () => {
  if (!videoRows) return;
  try {
    let response = await fetch("../data/videos.local.json");
    if (!response.ok) response = await fetch("../data/videos.json");
    if (!response.ok) throw new Error("No se pudo cargar videos.json");
    const data = await response.json();
    renderVideos(data.videos || []);
  } catch (error) {
    console.error(error);
    videoRows.innerHTML = `
      <tr>
        <td colspan="6" class="py-10 text-center text-sm text-muted">
          No se pudo cargar la lista de videos. Abre /admin/ desde un servidor local.
        </td>
      </tr>`;
  }
};

const initGate = () => {
  const pinHash = String(adminConfig().pinHash || "");

  if (!pinHash) {
    if (pinForm) pinForm.hidden = true;
    if (setupMessage) {
      setupMessage.hidden = false;
      setupMessage.textContent =
        "Configura ADMIN_PIN en .env (local) o como GitHub Secret (producción) y vuelve a generar el sitio.";
    }
    return;
  }

  if (sessionStorage.getItem(SESSION_KEY) === "1") {
    unlockAdmin();
    return;
  }

  pinInput?.focus();
};

pinForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const expected = String(adminConfig().pinHash || "");
  if (!expected) return;

  if (pinAttempts >= MAX_PIN_ATTEMPTS) {
    showError("Demasiados intentos. Recarga la página.");
    if (pinSubmit) pinSubmit.disabled = true;
    if (pinInput) pinInput.disabled = true;
    return;
  }

  const candidate = (pinInput?.value || "").trim();
  if (!candidate) {
    showError("Escribe el PIN.");
    return;
  }

  try {
    const hash = await sha256Hex(candidate);
    if (hash === expected) {
      unlockAdmin();
      return;
    }
  } catch {
    showError("Este navegador no puede validar el PIN. Usa HTTPS o localhost.");
    return;
  }

  pinAttempts += 1;
  const remaining = MAX_PIN_ATTEMPTS - pinAttempts;
  showError(remaining > 0 ? `PIN incorrecto. Te quedan ${remaining} intento${remaining === 1 ? "" : "s"}.` : "Demasiados intentos. Recarga la página.");
  if (remaining <= 0) {
    if (pinSubmit) pinSubmit.disabled = true;
    if (pinInput) pinInput.disabled = true;
  }
  if (pinInput) {
    pinInput.value = "";
    pinInput.focus();
  }
});

logoutBtn?.addEventListener("click", lockAdmin);

initGate();
