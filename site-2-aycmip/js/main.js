/**
 * AYCmip.cl — main.js
 * Vanilla JS only: navbar scroll, hamburger drawer, counter animation,
 * accordion, scroll reveal, FAQ, FAB tooltip.
 */

(function () {
  'use strict';

  /* ============================================================
     NAVBAR — scroll shadow + hamburger drawer
     ============================================================ */
  const navbar        = document.getElementById('navbar');
  const hamburger     = document.getElementById('hamburgerBtn');
  const drawer        = document.getElementById('navDrawer');
  const overlay       = document.getElementById('navOverlay');
  const drawerLinks   = document.querySelectorAll('.navbar__drawer-links a, .navbar__drawer-actions a');

  // Scroll shadow
  function onScroll() {
    if (window.scrollY > 12) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Open / close drawer
  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (drawer.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  overlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  // Keyboard: close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  /* ============================================================
     COUNTER ANIMATION
     ============================================================ */
  function animateCounter(el, target, duration, suffix) {
    var start     = 0;
    var startTime = null;
    var isFloat   = target !== Math.floor(target);

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed  = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      var ease     = 1 - Math.pow(1 - progress, 3);
      var current  = start + (target - start) * ease;

      if (isFloat) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.floor(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  var counterItems = document.querySelectorAll('[data-counter]');
  var countersStarted = false;

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;

    counterItems.forEach(function (el) {
      var target   = parseFloat(el.dataset.counter);
      var suffix   = el.dataset.suffix || '';
      var duration = parseInt(el.dataset.duration || '1800', 10);
      animateCounter(el, target, duration, suffix);
    });
  }

  if (counterItems.length > 0) {
    var statsSection = document.getElementById('stats');

    if ('IntersectionObserver' in window && statsSection) {
      var statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startCounters();
            statsObserver.disconnect();
          }
        });
      }, { threshold: 0.25 });

      statsObserver.observe(statsSection);
    } else {
      // Fallback: start immediately
      startCounters();
    }
  }

  /* ============================================================
     ACCORDION
     ============================================================ */
  var accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(function (item) {
    var header = item.querySelector('.accordion-header');

    header.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      // Close all
      accordionItems.forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('is-open');
        header.setAttribute('aria-expanded', 'true');
      }
    });

    // Keyboard: Space / Enter already trigger click on button
  });

  /* ============================================================
     SCROLL REVEAL (IntersectionObserver)
     ============================================================ */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length > 0) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ============================================================
     MARQUEE — duplicate nodes for seamless loop
     ============================================================ */
  var marqueeTrack = document.querySelector('.hero__marquee-track');
  if (marqueeTrack) {
    // We already have 2 copies in HTML; ensure there are enough
    // The CSS animation uses translateX(-50%) on a 2-copy track
    // Nothing extra needed in JS — CSS handles it.
  }

  /* ============================================================
     SMOOTH SCROLL for anchor links
     ============================================================ */
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href === '#') return;

      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var navH = navbar ? navbar.getBoundingClientRect().height : 94;
        var targetTop = target.getBoundingClientRect().top + window.scrollY - navH;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     ACTIVE NAV LINK on scroll
     ============================================================ */
  var sections     = document.querySelectorAll('section[id]');
  var navLinksList = document.querySelectorAll('.navbar__links a[href^="#"]');

  function updateActiveLink() {
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      if (
        section.offsetTop <= scrollPos &&
        section.offsetTop + section.offsetHeight > scrollPos
      ) {
        navLinksList.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + section.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

})();
