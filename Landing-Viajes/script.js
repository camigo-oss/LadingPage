'use strict';

/* ============================================================
   UTILIDADES
============================================================ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function showToast(msg, duration = 2800) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ============================================================
   CURSOR PERSONALIZADO MEJORADO
============================================================ */
(function initCursor() {
  const cursor = $('#cursor');
  const follower = $('#cursor-follower');
  const label = $('#cursor-label');
  if (!cursor || !follower) return;

  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let fx = 0, fy = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
  });

  function animFollower() {
    fx += (cx - fx) * 0.10;
    fy += (cy - fy) * 0.10;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animFollower);
  }
  animFollower();

  const hoverSels = 'a, button, .filtro-btn, .card-btn, .card-fav, .paquete-btn, .radio-opt, .counter-btn, .slider-prev, .slider-next, .slider-dot, .nav-favorites, .hamburger';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSels)) {
      document.body.classList.add('cursor-hover');
      // Mostrar label contextual
      const t = e.target.closest('a, button');
      if (t) {
        const lbl = t.dataset.cursorLabel || '';
        if (label) label.textContent = lbl;
      }
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSels)) {
      document.body.classList.remove('cursor-hover');
      if (label) label.textContent = '';
    }
  });

  // Cursor especial en cards
  $$('.destino-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-gallery');
      if (label) label.textContent = '▶';
    });
    card.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-gallery');
      if (label) label.textContent = '';
    });
  });
})();

/* ============================================================
   NAVBAR
============================================================ */
(function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-link');
  const navLinks = $$('.nav-link[data-section]');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
      ticking = false;
    });
  }, { passive: true });

  let menuOpen = false;
  function toggleMenu(state) {
    menuOpen = state !== undefined ? state : !menuOpen;
    hamburger.classList.toggle('active', menuOpen);
    mobileMenu.classList.toggle('active', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());
  mobileLinks.forEach(l => l.addEventListener('click', () => toggleMenu(false)));

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = $(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    toggleMenu(false);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Active link tracking
  const sections = $$('section[id]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === entry.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  sections.forEach(s => obs.observe(s));
})();

/* ============================================================
   HERO CINEMATOGRÁFICO CON SCROLL KEYFRAMES
   
   La imagen tiene un efecto de parallax + las palabras del
   título se revelan conforme el usuario hace scroll hacia abajo.
   La barra de progreso inferior muestra avance dentro del hero.
============================================================ */
(function initHeroCinematic() {
  const section = $('.hero-section');
  const imgWrap = $('#hero-img-wrap');
  const img = $('#hero-main-img');
  const floatCard = $('#hero-float-card');
  const scrollFill = $('#hero-scroll-fill');
  const colorLayer = $('.hero-layer-color');
  const bgText = $('.hero-bg-text');

  if (!section) return;

  // ---------- Animación de palabras en entrada ----------
  const words = $$('.hero-word');
  words.forEach((w, i) => {
    const delay = parseInt(w.dataset.delay || 0);
    setTimeout(() => {
      w.classList.add('revealed');
    }, 500 + delay);
  });

  // ---------- Animación de contadores ----------
  function animateCounter(el, target, suffix = '') {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      const display = target >= 1000
        ? '+' + start.toLocaleString('es-ES')
        : (start < target ? start : (target === 12 ? '12+' : target.toString()));
      el.textContent = display;
      if (start >= target) clearInterval(timer);
    }, 25);
  }

  let countersStarted = false;
  const statNums = $$('.stat-n[data-target]');
  const heroObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      statNums.forEach(el => {
        const t = parseInt(el.dataset.target);
        animateCounter(el, t);
      });
    }
  }, { threshold: 0.3 });
  if (section) heroObs.observe(section);

  // ---------- Scroll-driven keyframes ----------
  // Secuencia de imágenes para el hero que van cambiando con el scroll
  const heroImages = [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2400&q=90',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=2400&q=90',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=2400&q=90',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2400&q=90',
  ];
  // Preload
  heroImages.forEach(src => { const i = new Image(); i.src = src; });

  let lastImgIdx = 0;
  let isChanging = false;

  function changeHeroImage(idx) {
    if (idx === lastImgIdx || isChanging || !img) return;
    isChanging = true;
    img.style.transition = 'opacity 0.8s ease, transform 0.8s ease, filter 0.8s ease';
    img.style.opacity = '0';
    img.style.transform = 'scale(1.06)';

    setTimeout(() => {
      img.src = heroImages[idx];
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
      lastImgIdx = idx;
      setTimeout(() => { isChanging = false; }, 800);
    }, 400);
  }

  // Scroll handler para efectos en el hero
  let lastScrollY = 0;
  let rafPending = false;

  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const heroH = section.offsetHeight;
      const progress = Math.min(scrollY / heroH, 1); // 0 a 1

      // 1. Barra de progreso
      if (scrollFill) scrollFill.style.width = (progress * 100) + '%';

      // 2. Parallax imagen (se mueve más lento que el scroll)
      if (imgWrap) {
        const parallaxY = scrollY * 0.35;
        imgWrap.style.transform = `translateY(${parallaxY}px)`;
      }

      // 3. Parallax texto de fondo
      if (bgText) {
        bgText.style.transform = `translateY(${scrollY * -0.15}px)`;
      }

      // 4. Tarjeta flotante
      if (floatCard) {
        floatCard.style.transform = `translateY(${scrollY * 0.18}px)`;
        floatCard.style.opacity = Math.max(0, 1 - progress * 3).toString();
      }

      // 5. Color overlay se intensifica
      if (colorLayer) {
        const intensity = 0 + progress * 0.4;
        colorLayer.style.opacity = (1 + intensity).toString();
      }

      // 6. Cambio de imagen según keyframes de scroll
      // Frame 0: 0-20% → imagen 0
      // Frame 1: 20-45% → imagen 1
      // Frame 2: 45-70% → imagen 2
      // Frame 3: 70-100% → imagen 3
      const keyframes = [0, 0.20, 0.45, 0.70];
      let targetIdx = 0;
      for (let i = keyframes.length - 1; i >= 0; i--) {
        if (progress >= keyframes[i]) { targetIdx = i; break; }
      }
      changeHeroImage(targetIdx);

      // 7. Fade out contenido hero
      const heroContent = $('.hero-content-inner');
      if (heroContent) {
        const opacity = Math.max(0, 1 - progress * 2.5);
        heroContent.style.opacity = opacity.toString();
        heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
      }

      lastScrollY = scrollY;
      rafPending = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   GALERÍA EN CARDS — HOVER
   Cada card tiene múltiples imágenes que van rotando 
   automáticamente al pasar el cursor.
============================================================ */
(function initCardGalleries() {
  const cards = $$('.destino-card');

  cards.forEach(card => {
    const imgs = $$('.card-img', card);
    const dotsWrap = $('.card-gallery-dots', card);
    if (!imgs.length) return;

    // Crear dots
    imgs.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dotsWrap?.appendChild(dot);
    });

    let currentIdx = 0;
    let galleryTimer = null;
    let isHovering = false;

    function getDots() { return $$('.gallery-dot', card); }

    function goToImg(idx) {
      const prev = imgs[currentIdx];
      const next = imgs[idx];

      prev.classList.remove('card-img-active');
      prev.classList.add('card-img-leaving');
      setTimeout(() => prev.classList.remove('card-img-leaving'), 550);

      next.classList.add('card-img-active');

      // Actualizar dots
      const dots = getDots();
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));

      currentIdx = idx;
    }

    function startGallery() {
      if (imgs.length <= 1) return;
      galleryTimer = setInterval(() => {
        if (!isHovering) return;
        const next = (currentIdx + 1) % imgs.length;
        goToImg(next);
      }, 900); // Cambio cada 900ms
    }

    function stopGallery() {
      clearInterval(galleryTimer);
      // Volver a la imagen inicial suavemente
      setTimeout(() => {
        if (!isHovering) {
          goToImg(0);
        }
      }, 200);
    }

    card.addEventListener('mouseenter', () => {
      isHovering = true;
      startGallery();
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      stopGallery();
    });

    // Click en dots para ir a imagen
    dotsWrap?.addEventListener('click', e => {
      const dot = e.target.closest('.gallery-dot');
      if (!dot) return;
      const idx = getDots().indexOf(dot);
      if (idx >= 0) goToImg(idx);
    });
  });
})();

/* ============================================================
   FILTROS DE DESTINOS
============================================================ */
(function initFiltros() {
  const btns = $$('.filtro-btn');
  const cards = $$('.destino-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtro = btn.dataset.filtro;

      cards.forEach((card, i) => {
        const match = filtro === 'all' || card.dataset.tipo === filtro;
        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        if (!match) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => card.classList.add('hidden'), 350);
        } else {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50 + i * 40);
        }
      });
    });
  });
})();

/* ============================================================
   FAVORITOS
============================================================ */
const FAVORITES_KEY = 'viajes_estelares_fav_v2';
function getFavorites() { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; } catch { return []; } }
function saveFavorites(arr) { try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr)); } catch {} }

const destinoData = {
  cancun:      { name: 'Cancún',          img: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=120&q=60', price: '$1.299' },
  bali:        { name: 'Bali',            img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=120&q=60', price: '$1.599' },
  maldivas:    { name: 'Maldivas',        img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=120&q=60', price: '$2.999' },
  alpes:       { name: 'Alpes Suizos',    img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=120&q=60', price: '$1.899' },
  patagonia:   { name: 'Patagonia',       img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=120&q=60', price: '$2.499' },
  'nueva-york':{ name: 'Nueva York',      img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=120&q=60', price: '$1.199' },
  roma:        { name: 'Roma',            img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=120&q=60', price: '$999'   },
  safari:      { name: 'Safari en África',img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=120&q=60', price: '$3.299' }
};

(function initFavorites() {
  const panel     = $('#favoritos-panel');
  const panelBody = $('#fav-panel-body');
  const navFavBtn = $('#nav-favorites');
  const favCount  = $('#favorites-count');
  const closeBtn  = $('#fav-panel-close');
  const favBtns   = $$('.card-fav');

  function refreshFavBtns() {
    const favs = getFavorites();
    favBtns.forEach(btn => btn.classList.toggle('saved', favs.includes(btn.dataset.id)));
    const n = favs.length;
    favCount.textContent = n;
    favCount.classList.toggle('visible', n > 0);
  }

  function renderPanel() {
    const favs = getFavorites();
    if (!favs.length) { panelBody.innerHTML = '<p class="fav-empty">Aún no has guardado ningún destino.</p>'; return; }
    panelBody.innerHTML = favs.map(id => {
      const d = destinoData[id];
      if (!d) return '';
      return `<div class="fav-item" data-id="${id}">
        <img class="fav-item-img" src="${d.img}" alt="${d.name}">
        <div class="fav-item-info"><div class="fav-item-name">${d.name}</div><div class="fav-item-price">desde ${d.price}</div></div>
        <button class="fav-item-remove" data-remove="${id}" aria-label="Eliminar">×</button>
      </div>`;
    }).join('');
    panelBody.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        saveFavorites(getFavorites().filter(f => f !== btn.dataset.remove));
        refreshFavBtns(); renderPanel();
        showToast('Destino eliminado de favoritos');
      });
    });
  }

  favBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const id = btn.dataset.id;
      let favs = getFavorites();
      const isSaved = favs.includes(id);
      if (isSaved) { favs = favs.filter(f => f !== id); showToast('Eliminado de favoritos'); }
      else { favs.push(id); showToast(`✦ ${destinoData[id]?.name} guardado en favoritos`); }
      saveFavorites(favs); refreshFavBtns();
    });
  });

  navFavBtn.addEventListener('click', () => { renderPanel(); panel.classList.toggle('open'); });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  document.addEventListener('click', e => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !navFavBtn.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
  refreshFavBtns();
})();

/* ============================================================
   TESTIMONIOS SLIDER
============================================================ */
(function initSlider() {
  const track    = $('#testimonios-track');
  const dotsWrap = $('#slider-dots');
  const prevBtn  = $('#slider-prev');
  const nextBtn  = $('#slider-next');
  if (!track) return;

  const cards = $$('.testimonio-card', track);
  let current = 0;
  let autoplayTimer;
  let isDragging = false, startX = 0, startTranslate = 0;

  function getPerPage() {
    if (window.innerWidth >= 900) return 3;
    if (window.innerWidth >= 600) return 2;
    return 1;
  }
  function totalPages() { return Math.ceil(cards.length / getPerPage()); }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalPages(); i++) {
      const d = document.createElement('button');
      d.className = 'slider-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Página ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, totalPages() - 1));
    const perPage = getPerPage();
    const cardEl = cards[0];
    const cardW = cardEl.getBoundingClientRect().width;
    const gap = 24;
    track.style.transform = `translateX(-${current * perPage * (cardW + gap)}px)`;
    $$('.slider-dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === current));
    resetAutoplay();
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => goTo((current + 1) % totalPages()), 5500);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  window.addEventListener('resize', () => { buildDots(); goTo(0); }, { passive: true });
  buildDots();
  resetAutoplay();

  // Touch/swipe
  track.addEventListener('touchstart', e => {
    isDragging = true;
    startX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  });
})();

/* ============================================================
   FORMULARIO MULTI-STEP
============================================================ */
(function initMultiStep() {
  const form     = $('#reserva-form');
  const success  = $('#form-success');
  const resetBtn = $('#form-reset');
  if (!form) return;

  const stepEls = $$('.form-step');
  const panels  = $$('.form-panel');
  let currentStep = 1;
  const counters = { adultos: 2, ninos: 0 };

  $$('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target, op = btn.dataset.op;
      if (op === '+') counters[target] = Math.min(counters[target] + 1, 12);
      if (op === '-') counters[target] = Math.max(counters[target] - 1, 0);
      const el = $(`#val-${target}`);
      if (el) el.textContent = counters[target];
    });
  });

  const rangeInput = $('#presupuesto-range');
  const rangeVal   = $('#range-val');
  if (rangeInput && rangeVal) {
    rangeInput.addEventListener('input', () => {
      rangeVal.textContent = '$' + Number(rangeInput.value).toLocaleString('es-ES');
    });
  }

  function goToStep(n) {
    currentStep = n;
    panels.forEach((p, i) => p.classList.toggle('active', i + 1 === n));
    stepEls.forEach((s, i) => {
      s.classList.toggle('active', i + 1 === n);
      s.classList.toggle('done', i + 1 < n);
    });
  }

  function validateStep(n) {
    if (n === 1) {
      const dest = $('#destino-input'), fIda = $('#fecha-ida'), fVue = $('#fecha-vuelta');
      if (!dest.value) { dest.focus(); showToast('Por favor selecciona un destino'); return false; }
      if (!fIda.value) { fIda.focus(); showToast('Indica la fecha de ida'); return false; }
      if (!fVue.value) { fVue.focus(); showToast('Indica la fecha de vuelta'); return false; }
    }
    if (n === 3) {
      const nombre = $('#nombre'), email = $('#email');
      if (!nombre.value.trim()) { nombre.focus(); showToast('Introduce tu nombre'); return false; }
      if (!email.value.includes('@')) { email.focus(); showToast('Email no válido'); return false; }
    }
    return true;
  }

  $('#step1-next')?.addEventListener('click', () => { if (validateStep(1)) goToStep(2); });
  $('#step2-back')?.addEventListener('click', () => goToStep(1));
  $('#step2-next')?.addEventListener('click', () => { if (validateStep(2)) goToStep(3); });
  $('#step3-back')?.addEventListener('click', () => goToStep(2));

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep(3)) return;
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.textContent = 'Enviando…';
    submitBtn.disabled = true;
    setTimeout(() => {
      panels.forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
      $('.form-steps').style.display = 'none';
      success.classList.add('visible');
      showToast('¡Solicitud enviada con éxito! ✦');
    }, 900);
  });

  resetBtn?.addEventListener('click', () => {
    success.classList.remove('visible');
    panels.forEach(p => p.style.display = '');
    $('.form-steps').style.display = '';
    form.reset();
    goToStep(1);
    counters.adultos = 2; counters.ninos = 0;
    $('#val-adultos').textContent = '2';
    $('#val-ninos').textContent   = '0';
    if (rangeVal) rangeVal.textContent = '$1.500';
    const submitBtn = form.querySelector('.btn-submit');
    if (submitBtn) { submitBtn.textContent = 'Enviar solicitud ✦'; submitBtn.disabled = false; }
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('.card-btn[data-destino], .paquete-btn[data-paquete]');
    if (!btn) return;
    const destino = btn.dataset.destino;
    const paquete = btn.dataset.paquete;
    setTimeout(() => {
      if (destino) {
        const sel = $('#destino-input');
        if (sel) for (const opt of sel.options) { if (opt.text.startsWith(destino)) { sel.value = opt.value; break; } }
      }
      if (paquete) {
        const sel = $('#paquete-input');
        if (sel) for (const opt of sel.options) { if (opt.text.startsWith(paquete)) { sel.value = opt.value; break; } }
      }
    }, 400);
  });
})();

/* ============================================================
   COUNTDOWN PROMOCIÓN
============================================================ */
(function initCountdown() {
  const cdDays = $('#cd-days'), cdHours = $('#cd-hours'), cdMins = $('#cd-mins');
  if (!cdDays) return;
  const now = new Date();
  const target = new Date(now.getFullYear(), 5, 30, 23, 59, 59);
  if (now > target) target.setFullYear(target.getFullYear() + 1);
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const diff = target - new Date();
    if (diff <= 0) { cdDays.textContent = cdHours.textContent = cdMins.textContent = '00'; return; }
    cdDays.textContent  = pad(Math.floor(diff / 86400000));
    cdHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    cdMins.textContent  = pad(Math.floor((diff % 3600000) / 60000));
  }
  tick();
  setInterval(tick, 30000);
})();

/* ============================================================
   ANIMACIONES DE SCROLL (IntersectionObserver)
============================================================ */
(function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  $$('[data-animate]').forEach(el => obs.observe(el));

  // Cards con stagger por índice
  const cards = $$('.destino-card');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 60}ms`;
    obs.observe(card);
  });

  // Otros elementos auto
  const autoEls = [
    ...$$('.paquete-card'),
    ...$$('.testimonio-card'),
    ...$$('.exp-item'),
    ...$$('.reservas-info'),
  ];
  autoEls.forEach(el => {
    if (!el.hasAttribute('data-animate')) {
      el.setAttribute('data-animate', '');
      obs.observe(el);
    }
  });
})();

/* ============================================================
   AÑO EN FOOTER
============================================================ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

console.log('✦ Viajes Estelares v2 — cargado');

/* ============================================================
   ANIMACIÓN GSAP ZOOM-THROUGH (ScrollTrigger)
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Asegúrate de registrar el plugin primero
  gsap.registerPlugin(ScrollTrigger);

  const zoomWrapper = document.querySelector('.zoom-wrapper');
  const zoomBgImg = document.querySelector('.zoom-background img');
  const zoomText = document.querySelector('.zoom-text');

  // Creamos un Timeline para encadenar las animaciones con el scroll
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".zoom-section",
      start: "top top", // Empieza cuando el top de la sección toca el top del viewport
      end: "+=3000",    // Cuanto más grande sea este valor, más lento y suave será el efecto de zoom (necesitas hacer más scroll)
      scrub: 1,         // scrub: 1 le da un ligero 'suavizado' (smoothing) de 1 segundo para que siga tu ratón de forma fluida
      pin: true,        // Fija la pantalla, impidiendo que baje hasta que acabe la animación
    }
  });

  // Paso 1: Hacemos desaparecer el texto de "Tu viaje empieza aquí" rápidamente
  tl.to(zoomText, {
    opacity: 0,
    y: 50,
    duration: 0.1
  }, 0); // El "0" indica que arranca en el segundo 0 del timeline

  // Paso 2: Escalar todo el marco hasta que la ventana de avión sea más grande que el monitor.
  // Un scale de 30 a 40 suele ser suficiente para que el "agujero" de 320px llene pantallas 4k.
  tl.to(zoomWrapper, {
    scale: 35, 
    ease: "power2.in", // Acelera el zoom a medida que entras, dándole un efecto de gravedad o velocidad final
    duration: 1
  }, 0);

  // Paso 3 (Opcional): Animamos también la imagen de fondo para revelar sus colores al entrar
  tl.to(zoomBgImg, {
    filter: "brightness(1)",
    scale: 1.1, // Un ligero zoom interior al paisaje para dar efecto parallax
    duration: 1
  }, 0);
});
// (Este es el paso 2 que ya tenías)
  tl.to(zoomWrapper, {
    scale: 35, 
    ease: "power2.in",
    duration: 1
  }, 0);

  // NUEVO: Paso 4 - Hacer que la información aparezca AL FINAL del zoom
  const infoRevelada = document.querySelector('.info-revelada');
  if (infoRevelada) {
    tl.to(infoRevelada, {
      opacity: 1,
      y: -20, // Pequeño efecto de subida
      duration: 0.3
    }, 0.8); // Empieza en el segundo 0.8 (casi cuando termina el zoom de 1 segundo)
  }