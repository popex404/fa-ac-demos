/**
 * main.js — A&C Soluciones Agrícolas y Urbanas
 * Vanilla JS only — no frameworks or dependencies
 * Works gracefully without JS (progressive enhancement)
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. STICKY NAVBAR — changes bg on scroll
     ───────────────────────────────────────── */
  var navbar = document.getElementById('navbar');

  if (navbar) {
    var SCROLL_THRESHOLD = 60; // px before navbar bg appears

    function handleNavbarScroll() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        navbar.classList.add('navbar--scrolled');
      } else {
        navbar.classList.remove('navbar--scrolled');
      }
    }

    // Run once on load in case page is pre-scrolled
    handleNavbarScroll();

    // Throttle scroll handler for performance
    var scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        window.requestAnimationFrame(function () {
          handleNavbarScroll();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     2. SMOOTH SCROLL for anchor nav links
        (CSS scroll-behavior handles most cases,
         but this adds cross-browser reliability
         and accounts for sticky navbar offset)
     ───────────────────────────────────────── */
  var navbarHeight = navbar ? navbar.offsetHeight : 72;

  function getNavbarHeight() {
    return navbar ? navbar.offsetHeight : 72;
  }

  function smoothScrollToTarget(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;

    var targetTop = target.getBoundingClientRect().top + window.scrollY;
    var offset = getNavbarHeight() + 8; // 8px breathing room
    var destination = targetTop - offset;

    window.scrollTo({
      top: destination,
      behavior: 'smooth'
    });
  }

  // Intercept clicks on all in-page anchor links
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href || href === '#') return;

    var targetId = href.slice(1); // remove leading '#'
    var target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    smoothScrollToTarget(targetId);

    // Update URL hash without jumping
    if (history.pushState) {
      history.pushState(null, '', href);
    }
  });

  /* ─────────────────────────────────────────
     3. SECTION REVEAL ANIMATION
        Fade-in sections as they enter viewport
        Uses IntersectionObserver for performance
     ───────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    // Add initial hidden state via JS (progressive enhancement)
    var revealTargets = document.querySelectorAll(
      '.pain__card, .solution__card, .proof__service-card, .proof__badge, .testimonial-card, .value-stack__item, .guarantee__card'
    );

    revealTargets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // Stagger siblings by their index in the parent
          var siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
          var index = siblings.indexOf(el);
          var delay = Math.min(index * 80, 320); // cap at 320ms

          setTimeout(function () {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);

          revealObserver.unobserve(el);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ─────────────────────────────────────────
     4. WHATSAPP FAB — hide when footer visible
        Avoids overlapping footer contact info
     ───────────────────────────────────────── */
  var whatsappFab = document.querySelector('.whatsapp-fab');
  var footer = document.querySelector('.footer');

  if (whatsappFab && footer && 'IntersectionObserver' in window) {
    var footerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          whatsappFab.style.opacity = '0';
          whatsappFab.style.pointerEvents = 'none';
          whatsappFab.setAttribute('aria-hidden', 'true');
        } else {
          whatsappFab.style.opacity = '1';
          whatsappFab.style.pointerEvents = '';
          whatsappFab.removeAttribute('aria-hidden');
        }
      });
    }, { threshold: 0.1 });

    whatsappFab.style.transition = 'opacity 0.3s ease';
    footerObserver.observe(footer);
  }

  /* ─────────────────────────────────────────
     5. ACTIVE NAV HIGHLIGHT (optional UX)
        Tracks current section on scroll
     ───────────────────────────────────────── */
  var sections = document.querySelectorAll('section[id]');

  if (sections.length && 'IntersectionObserver' in window) {
    var activeSection = '';

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activeSection = entry.target.id;
        }
      });
    }, {
      rootMargin: '-40% 0px -40% 0px'
    });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ─────────────────────────────────────────
     6. PHONE NUMBER CLICK TRACKING
        Console log for analytics integration
        Replace with your analytics event if needed
     ───────────────────────────────────────── */
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="tel:"]');
    if (!link) return;
    // EDITAR: replace console.log with your analytics call, e.g. gtag or fbq
    console.log('[A&C Analytics] Phone CTA clicked:', link.href);
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="https://wa.me"]');
    if (!link) return;
    // EDITAR: replace console.log with your analytics call, e.g. gtag or fbq
    console.log('[A&C Analytics] WhatsApp CTA clicked:', link.href);
  });

})();
