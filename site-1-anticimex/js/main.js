/* ============================================================
   A&C Soluciones Agrícolas y Urbanas — main.js
   Vanilla JS — no frameworks (except Swiper loaded via CDN)
   ============================================================ */

'use strict';

/* ============================================================
   UTILITY: Safe querySelector with null guard
   ============================================================ */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. STICKY NAVBAR — transparent → white on scroll
   ============================================================ */
(function initNavbar() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 40;

  function updateNavbar() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Run on load (in case page is refreshed mid-scroll)
  updateNavbar();

  // Throttled scroll handler
  let rafId = null;
  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateNavbar();
      rafId = null;
    });
  }, { passive: true });
})();

/* ============================================================
   2. HAMBURGER MENU — mobile drawer
   ============================================================ */
(function initHamburger() {
  const hamburger   = qs('#hamburger');
  const mobileMenu  = qs('#mobile-menu');
  const menuOverlay = qs('#menu-overlay');
  const mobileLinks = qsa('#mobile-menu a');

  if (!hamburger || !mobileMenu || !menuOverlay) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  menuOverlay.addEventListener('click', closeMenu);

  // Close on nav link click
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
})();

/* ============================================================
   3. SWIPER — Reviews slider
   ============================================================ */
(function initSwiper() {
  // Wait for Swiper to be available
  function tryInit() {
    if (typeof Swiper === 'undefined') {
      setTimeout(tryInit, 100);
      return;
    }

    new Swiper('#reviews-swiper', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 24,
      grabCursor: true,
      autoplay: {
        delay: 5500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 32,
        },
      },
      a11y: {
        prevSlideMessage: 'Reseña anterior',
        nextSlideMessage: 'Siguiente reseña',
      },
    });
  }

  tryInit();
})();

/* ============================================================
   4. WHATSAPP FAB — auto-hide when footer is visible
   ============================================================ */
(function initWhatsAppFAB() {
  const fab    = qs('#whatsapp-fab');
  const footer = qs('#footer');

  if (!fab || !footer) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fab.classList.add('hidden');
        } else {
          fab.classList.remove('hidden');
        }
      });
    },
    { threshold: 0.15 }
  );

  observer.observe(footer);
})();

/* ============================================================
   5. SCROLL REVEAL — IntersectionObserver
   ============================================================ */
(function initScrollReveal() {
  // Skip if user prefers reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // Immediately reveal all elements
    qsa('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  qsa('.reveal').forEach(el => observer.observe(el));
})();

/* ============================================================
   6. SMOOTH SCROLL — anchor links
   ============================================================ */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = qs(targetId);
    if (!target) return;

    e.preventDefault();

    const navbar  = qs('#navbar');
    const offset  = navbar ? navbar.offsetHeight : 0;
    const top     = target.getBoundingClientRect().top + window.scrollY - offset - 8;

    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ============================================================
   7. NAVBAR ACTIVE STATE — highlight current section
   ============================================================ */
(function initNavHighlight() {
  const sections = qsa('section[id]');
  const navLinks = qsa('.navbar-nav a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const navbar = qs('#navbar');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    {
      threshold: 0.3,
      rootMargin: `-${navbar ? navbar.offsetHeight : 72}px 0px 0px 0px`,
    }
  );

  sections.forEach(section => observer.observe(section));
})();

/* ============================================================
   8. FORM / BUTTON feedback (future-proof for contact forms)
   ============================================================ */
(function initButtonFeedback() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn || btn.tagName === 'A') return;

    // Ripple effect
    const ripple = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    ripple.style.cssText = `
      position:absolute;
      width:${size}px;
      height:${size}px;
      left:${x}px;
      top:${y}px;
      background:rgba(255,255,255,0.3);
      border-radius:50%;
      transform:scale(0);
      animation:ripple 500ms ease-out forwards;
      pointer-events:none;
    `;

    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });

  // Inject ripple keyframe once
  if (!qs('#ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = '@keyframes ripple { to { transform:scale(2.5); opacity:0; } }';
    document.head.appendChild(style);
  }
})();
