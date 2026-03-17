/**
 * AYC MiP — main.js
 * Vanilla JS: navbar scroll, hamburger drawer, count-up, FAQ accordion,
 * scroll reveal, dropdown, WhatsApp FAB auto-hide near footer.
 */

(function () {
  'use strict';

  /* ============================================================
     NAVBAR SCROLL SHADOW
     ============================================================ */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ============================================================
     DESKTOP DROPDOWN — keyboard/click toggle support
     ============================================================ */
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown__trigger');
    if (!trigger) return;

    // Toggle on click for accessibility
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      // Close all first
      dropdowns.forEach((d) => d.classList.remove('open'));
      if (!isOpen) dropdown.classList.add('open');
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    dropdowns.forEach((d) => d.classList.remove('open'));
  });

  /* ============================================================
     HAMBURGER + MOBILE DRAWER
     ============================================================ */
  const hamburger = document.querySelector('.hamburger');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerOverlay = drawer && drawer.querySelector('.mobile-drawer__overlay');
  const drawerCloseBtn = drawer && drawer.querySelector('.mobile-drawer__close-btn');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (hamburger) hamburger.classList.add('open');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    document.body.style.overflow = '';
    if (hamburger) hamburger.classList.remove('open');
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (drawer && drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Close drawer when any link is clicked
  if (drawer) {
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });
  }

  /* ============================================================
     MOBILE DROPDOWN IN DRAWER
     ============================================================ */
  const mobTriggers = document.querySelectorAll('.mob-dropdown-trigger');
  mobTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      if (!content) return;
      const isOpen = content.classList.contains('open');
      trigger.classList.toggle('open', !isOpen);
      content.classList.toggle('open', !isOpen);
    });
  });

  /* ============================================================
     COUNT-UP ANIMATION (IntersectionObserver)
     ============================================================ */
  const counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    const target = el.getAttribute('data-count');
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const numericTarget = parseFloat(target);
    const isInt = Number.isInteger(numericTarget);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericTarget * eased;
      el.textContent = prefix + (isInt ? Math.round(current) : current.toFixed(1)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            animateCounter(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  /* ============================================================
     FAQ ACCORDION
     ============================================================ */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const header = item.querySelector('.faq-item__header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close all
      faqItems.forEach((fi) => fi.classList.remove('active'));
      // Open clicked if was not active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  /* ============================================================
     SCROLL REVEAL (IntersectionObserver)
     ============================================================ */
  const revealEls = document.querySelectorAll('.fade-in, .stagger-children');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ============================================================
     FLOATING WHATSAPP FAB — auto-hide near footer
     ============================================================ */
  const waFab = document.querySelector('.wa-fab');
  const footer = document.querySelector('.footer');

  if (waFab && footer) {
    const fabObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            waFab.classList.add('hidden');
          } else {
            waFab.classList.remove('hidden');
          }
        });
      },
      { threshold: 0.1 }
    );
    fabObserver.observe(footer);
  }

})();
