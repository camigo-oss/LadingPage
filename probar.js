// ========================================
// CONSTANTS
// ========================================
const HERO_FRAME_START = 1000;
const HERO_FRAME_END = 1239;
const HERO_TOTAL_FRAMES = HERO_FRAME_END - HERO_FRAME_START + 1;

const YACHT_FRAME_START = 2000;
const YACHT_FRAME_END = 2049;
const YACHT_TOTAL_FRAMES = YACHT_FRAME_END - YACHT_FRAME_START + 0.05;

const HERO_TEXT_OVERLAYS = [
  { id: 'hero-overlay-1', inStart: 0.32, inEnd: 0.40, outStart: 0.55, outEnd: 0.62 },
  { id: 'hero-overlay-2', inStart: 0.64, inEnd: 0.72, outStart: 0.92, outEnd: 1.0 }
];

const YACHT_TEXT_OVERLAYS = [
  { id: 'yacht-overlay-1', position: 'left', inStart: 0.0, inEnd: 0.08, outStart: 0.15, outEnd: 0.19 },
  { id: 'yacht-overlay-2', position: 'right', inStart: 0.20, inEnd: 0.28, outStart: 0.35, outEnd: 0.39 },
  { id: 'yacht-overlay-3', position: 'left', inStart: 0.40, inEnd: 0.48, outStart: 0.55, outEnd: 0.59 },
  { id: 'yacht-overlay-4', position: 'right', inStart: 0.60, inEnd: 0.68, outStart: 0.75, outEnd: 0.79 },
  { id: 'yacht-overlay-5', position: 'left', inStart: 0.80, inEnd: 0.88, outStart: 0.95, outEnd: 0.99 }
];

// ========================================
// UTILITY FUNCTIONS
// ========================================
function getOpacity(progress, overlay) {
  const fadeIn = Math.min(Math.max((progress - overlay.inStart) / ((overlay.inEnd - overlay.inStart) || 0.01), 0), 1);
  const fadeOut = Math.min(Math.max((overlay.outEnd - progress) / ((overlay.outEnd - overlay.outStart) || 0.01), 0), 1);
  return Math.min(fadeIn, fadeOut);
}

function heroFrameSrc(index) {
  return `sequence-1/sequence-${HERO_FRAME_START + index}.jpg`;

}

function yachtFrameSrc(index) {
  return `sequence-2/sequence-${YACHT_FRAME_START + index}.jpg`;
}

// ========================================
// NAVBAR
// ========================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  hamburger.classList.toggle('active', menuOpen);
  mobileMenu.classList.toggle('active', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Show navbar after hero scroll
function updateNavbar() {
  const heroEl = document.getElementById('fleet');
  if (!heroEl) {
    navbar.classList.add('visible');
    return;
  }
  const rect = heroEl.getBoundingClientRect();
  const scrollable = heroEl.scrollHeight - window.innerHeight;
  const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
  navbar.classList.toggle('visible', progress >= 0.55);
}

// ========================================
// HERO SCROLL SEQUENCE
// ========================================
const heroContainer = document.getElementById('fleet');
const heroCanvas = document.getElementById('hero-canvas');
const heroCtx = heroCanvas.getContext('2d');
const heroLoading = document.getElementById('hero-loading');
const loadingProgress = document.getElementById('loading-progress');
const loadingText = document.getElementById('loading-text');
const scrollIndicator = document.getElementById('scroll-indicator');

const heroImages = [];
let heroLoadedCount = 0;
let heroReady = false;
let heroProgress = 0;

// Preload hero images
for (let i = 0; i < HERO_TOTAL_FRAMES; i++) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = heroFrameSrc(i);
  img.onload = () => {
    heroLoadedCount++;
    const percent = Math.round((heroLoadedCount / HERO_TOTAL_FRAMES) * 100);
    loadingProgress.style.width = percent + '%';
    loadingText.textContent = percent;
    if (heroLoadedCount >= HERO_TOTAL_FRAMES) {
      heroReady = true;
      heroLoading.classList.add('hidden');
    }
  };
  heroImages.push(img);
}

function resizeHeroCanvas() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  heroCanvas.width = window.innerWidth * dpr;
  heroCanvas.height = window.innerHeight * dpr;
  heroCanvas.style.width = window.innerWidth + 'px';
  heroCanvas.style.height = window.innerHeight + 'px';
  heroCtx.scale(dpr, dpr);
}

function drawHeroFrame() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const idx = Math.min(Math.floor(heroProgress * (HERO_TOTAL_FRAMES - 1)), HERO_TOTAL_FRAMES - 1);
  const img = heroImages[idx];

  if (img && img.complete && img.naturalWidth > 0) {
    heroCtx.clearRect(0, 0, w, h);
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    heroCtx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh);
  }

  // Text-driven overlay
  let maxOpacity = 0;
  HERO_TEXT_OVERLAYS.forEach(overlay => {
    const opacity = getOpacity(heroProgress, overlay);
    if (opacity > maxOpacity) maxOpacity = opacity;
    const el = document.getElementById(overlay.id);
    if (el) {
      el.style.opacity = opacity;
      el.style.transform = `translateY(${(1 - opacity) * 15}px)`;
    }
  });

  if (maxOpacity > 0) {
    heroCtx.fillStyle = `rgba(0,0,0,${0.25 * maxOpacity})`;
    heroCtx.fillRect(0, 0, w, h);

    const grad = heroCtx.createLinearGradient(0, h * 0.7, 0, h);
    grad.addColorStop(0, `rgba(5,5,5,0)`);
    grad.addColorStop(1, `rgba(5,5,5,${0.85 * maxOpacity})`);
    heroCtx.fillStyle = grad;
    heroCtx.fillRect(0, 0, w, h);
  }

  // Scroll indicator
  scrollIndicator.classList.toggle('hidden', heroProgress >= 0.04 || !heroReady);
}

function updateHeroProgress() {
  if (!heroContainer) return;
  const rect = heroContainer.getBoundingClientRect();
  const scrollable = heroContainer.scrollHeight - window.innerHeight;
  heroProgress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
}

// ========================================
// YACHT MORPH SEQUENCE
// ========================================
const yachtContainer = document.querySelector('.yacht-morph');
const yachtCanvas = document.getElementById('yacht-canvas');
const yachtCtx = yachtCanvas.getContext('2d');
const yachtLoading = document.getElementById('yacht-loading');
const yachtLoadingProgress = document.getElementById('yacht-loading-progress');

const yachtImages = [];
let yachtLoadedCount = 0;
let yachtReady = false;
let yachtProgress = 0;

// Preload yacht images
for (let i = 0; i < YACHT_TOTAL_FRAMES; i++) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = yachtFrameSrc(i);
  img.onload = img.onerror = () => {
    yachtLoadedCount++;
    if (yachtLoadedCount % 10 === 0 || yachtLoadedCount === YACHT_TOTAL_FRAMES) {
      const percent = Math.round((yachtLoadedCount / YACHT_TOTAL_FRAMES) * 100);
      yachtLoadingProgress.style.width = percent + '%';
    }
    if (yachtLoadedCount >= YACHT_TOTAL_FRAMES) {
      yachtReady = true;
      yachtLoading.classList.add('hidden');
    }
  };
  yachtImages.push(img);
}

function resizeYachtCanvas() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  yachtCanvas.width = window.innerWidth * dpr;
  yachtCanvas.height = window.innerHeight * dpr;
  yachtCanvas.style.width = window.innerWidth + 'px';
  yachtCanvas.style.height = window.innerHeight + 'px';
  yachtCtx.scale(dpr, dpr);
}

function drawYachtFrame() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  yachtCtx.fillStyle = '#050505';
  yachtCtx.fillRect(0, 0, w, h);

  const idx = Math.min(Math.floor(yachtProgress * (YACHT_TOTAL_FRAMES - 1)), YACHT_TOTAL_FRAMES - 1);
  const img = yachtImages[idx];

  if (img && img.naturalWidth > 0) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const imgRatio = iw / ih;
    const canvasRatio = w / h;
    let dw, dh, dx, dy;
    if (canvasRatio > imgRatio) {
      dw = w;
      dh = w / imgRatio;
      dx = 0;
      dy = (h - dh) / 2;
    } else {
      dh = h;
      dw = h * imgRatio;
      dx = (w - dw) / 2;
      dy = 0;
    }
    yachtCtx.drawImage(img, dx, dy, dw, dh);
  }

  // Vignette
  const vg = yachtCtx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
  vg.addColorStop(0, 'rgba(5,5,5,0)');
  vg.addColorStop(1, 'rgba(5,5,5,0.5)');
  yachtCtx.fillStyle = vg;
  yachtCtx.fillRect(0, 0, w, h);

  // Text overlays
  YACHT_TEXT_OVERLAYS.forEach(overlay => {
    const opacity = getOpacity(yachtProgress, overlay);
    const el = document.getElementById(overlay.id);
    if (el) {
      el.style.opacity = opacity;
      el.style.transform = `translateY(${(1 - opacity) * 30}px)`;
    }
  });

  // Stats
  const statsOpacity = Math.min(Math.max((yachtProgress - 0.78) / 0.10, 0), 1);
  const statsLeft = document.getElementById('yacht-stats-left');
  const statsRight = document.getElementById('yacht-stats-right');
  if (statsLeft) {
    statsLeft.style.opacity = statsOpacity;
    statsLeft.style.transform = `translateY(${(1 - statsOpacity) * 20}px)`;
  }
  if (statsRight) {
    statsRight.style.opacity = statsOpacity;
    statsRight.style.transform = `translateY(${(1 - statsOpacity) * 20}px)`;
  }
}

function updateYachtProgress() {
  if (!yachtContainer) return;
  const rect = yachtContainer.getBoundingClientRect();
  const scrollable = yachtContainer.scrollHeight - window.innerHeight;
  yachtProgress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function animateOnScroll() {
  const elements = document.querySelectorAll('[data-animate]:not(.animate-in)');
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('animate-in');

      // Animate counters
      const counters = el.querySelectorAll('[data-count]');
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const suffix = counter.dataset.suffix || '';
        animateCounter(counter, target, suffix);
      });
    }
  });
}

function animateCounter(el, target, suffix) {
  const duration = 1800;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ========================================
// GLOBE VIDEO
// ========================================
const globeVideo = document.getElementById('globe-video');
if (globeVideo) {
  globeVideo.addEventListener('canplay', () => {
    globeVideo.classList.add('loaded');
  });
  globeVideo.play().catch(() => { });
}

// ========================================
// FORM HANDLING
// ========================================
const charterForm = document.getElementById('charter-form');
const formSuccess = document.getElementById('form-success');
const formReset = document.getElementById('form-reset');

if (charterForm) {
  charterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    charterForm.classList.add('hidden');
    formSuccess.classList.add('visible');
  });
}

if (formReset) {
  formReset.addEventListener('click', () => {
    formSuccess.classList.remove('visible');
    charterForm.classList.remove('hidden');
    charterForm.reset();
  });
}

// ========================================
// FOOTER YEAR
// ========================================
document.getElementById('year').textContent = new Date().getFullYear();

// ========================================
// MAIN LOOP & EVENTS
// ========================================
function onScroll() {
  updateNavbar();
  updateHeroProgress();
  updateYachtProgress();
  animateOnScroll();
}

function onResize() {
  resizeHeroCanvas();
  resizeYachtCanvas();
}

function animate() {
  drawHeroFrame();
  drawYachtFrame();
  requestAnimationFrame(animate);
}

// Initialize
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onResize);

resizeHeroCanvas();
resizeYachtCanvas();
onScroll();
animate();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});



