/**
 * main.js — A&C Soluciones Agrícolas y Urbanas
 * Vanilla JS only — no frameworks or dependencies
 * Works gracefully without JS (progressive enhancement)
 * Mobile-first: all interactions optimised for touch & phone
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
        CSS scroll-behavior handles most cases;
        this adds cross-browser reliability and
        accounts for sticky navbar offset
     ───────────────────────────────────────── */
  function getNavbarHeight() {
    return navbar ? navbar.offsetHeight : 72;
  }

  function smoothScrollToTarget(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;

    var targetTop = target.getBoundingClientRect().top + window.scrollY;
    var offset = getNavbarHeight() + 8; // 8px breathing room
    var destination = Math.max(0, targetTop - offset);

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
        Staggered fade-in as elements enter viewport
        Uses IntersectionObserver for performance
     ───────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var revealSelectors = [
      '.pain__card',
      '.solution__card',
      '.solution__segment',
      '.proof__stat',
      '.proof__service-card',
      '.proof__badge',
      '.testimonial-card',
      '.value-stack__item',
      '.guarantee__card',
      '.hero__trust-item'
    ].join(', ');

    var revealTargets = document.querySelectorAll(revealSelectors);

    revealTargets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition = 'opacity 0.52s ease, transform 0.52s ease';
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        // Stagger siblings by index within their parent
        var siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        var index = siblings.indexOf(el);
        var delay = Math.min(index * 75, 300); // cap at 300ms

        setTimeout(function () {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);

        revealObserver.unobserve(el);
      });
    }, {
      threshold: 0.10,
      rootMargin: '0px 0px -36px 0px'
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
    }, { threshold: 0.10 });

    footerObserver.observe(footer);
  }

  /* ─────────────────────────────────────────
     5. ACTIVE SECTION TRACKING
        Tracks current section in viewport —
        available for analytics or future nav highlighting
     ───────────────────────────────────────── */
  var sections = document.querySelectorAll('section[id]');
  var activeSection = '';

  if (sections.length && 'IntersectionObserver' in window) {
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
     6. STATS COUNTER ANIMATION
        Counts up numbers in .proof__stat-number
        when stats row enters the viewport
     ───────────────────────────────────────── */
  function animateCounter(el, target, suffix, duration) {
    var start = 0;
    var startTime = null;
    var isNumeric = !isNaN(parseInt(target, 10));

    if (!isNumeric) {
      // Non-numeric stat like "24/7" — just reveal it
      el.style.opacity = '1';
      return;
    }

    var numTarget = parseInt(target, 10);

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * numTarget);

      el.textContent = current + (suffix || '');

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = numTarget + (suffix || '');
      }
    }

    window.requestAnimationFrame(step);
  }

  var statsRow = document.querySelector('.proof__stats');
  var statNumbers = document.querySelectorAll('.proof__stat-number');

  if (statsRow && statNumbers.length && 'IntersectionObserver' in window) {
    var statsDone = false;

    var statsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !statsDone) {
          statsDone = true;
          statNumbers.forEach(function (el) {
            var raw = el.textContent.trim();
            // Extract numeric prefix and any suffix like '+' or '/'
            var match = raw.match(/^(\d+)(.*)$/);
            if (match) {
              animateCounter(el, match[1], match[2], 1600);
            }
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.30 });

    statsObserver.observe(statsRow);
  }

  /* ─────────────────────────────────────────
     7. CONVERSION TRACKING — phone & WhatsApp
        Replace console.log with your analytics
        call (e.g. gtag or fbq) when ready
     ───────────────────────────────────────── */
  document.addEventListener('click', function (event) {
    // Phone click
    var phoneLink = event.target.closest('a[href^="tel:"]');
    if (phoneLink) {
      // EDITAR: replace with your analytics event
      // Example: gtag('event', 'phone_click', { event_category: 'CTA' });
      console.log('[A&C Analytics] Phone CTA clicked:', phoneLink.href);
      return;
    }

    // WhatsApp click
    var waLink = event.target.closest('a[href^="https://wa.me"]');
    if (waLink) {
      // EDITAR: replace with your analytics event
      // Example: gtag('event', 'whatsapp_click', { event_category: 'CTA' });
      console.log('[A&C Analytics] WhatsApp CTA clicked:', waLink.href);
    }
  });

  /* ─────────────────────────────────────────
     8. TOUCH FEEDBACK — immediate visual tap
        response on mobile for all buttons
        Adds .is-tapped class briefly on touch
     ───────────────────────────────────────── */
  if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function (event) {
      var btn = event.target.closest('.btn');
      if (!btn) return;

      btn.classList.add('is-tapped');
      setTimeout(function () {
        btn.classList.remove('is-tapped');
      }, 200);
    }, { passive: true });
  }

})();
