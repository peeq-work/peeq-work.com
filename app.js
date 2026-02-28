/* ═══════════════════════════════════════════════════
   PEEQ.WORK — app.js
   Theme system · Lenis scroll · Animations · Nav
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── THEME SYSTEM ────────────────────────────────

  // Auto-detect day/night: 6am–6pm = geometry, 6pm–6am = ocean
  let currentTheme = 'geometry';
  let userOverride = false;

  function detectAutoTheme() {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'geometry' : 'ocean';
  }

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeDots();
  }

  function updateThemeDots() {
    // All dots across nav, mobile, footer
    document.querySelectorAll('.theme-dot--geometry').forEach(dot => {
      dot.setAttribute('aria-pressed', currentTheme === 'geometry' ? 'true' : 'false');
    });
    document.querySelectorAll('.theme-dot--ocean').forEach(dot => {
      dot.setAttribute('aria-pressed', currentTheme === 'ocean' ? 'true' : 'false');
    });
  }

  function initTheme() {
    applyTheme(detectAutoTheme());
  }

  // Wire up ALL theme dots (nav, mobile menu, footer)
  function bindThemeToggles() {
    document.querySelectorAll('.theme-dot--geometry').forEach(btn => {
      btn.addEventListener('click', () => {
        userOverride = true;
        applyTheme('geometry');
      });
    });
    document.querySelectorAll('.theme-dot--ocean').forEach(btn => {
      btn.addEventListener('click', () => {
        userOverride = true;
        applyTheme('ocean');
      });
    });
  }

  initTheme();

  // ── LENIS SMOOTH SCROLL ──────────────────────────
  let lenis;

  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      orientation: 'vertical',
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ── NAVIGATION ──────────────────────────────────
  const nav = document.getElementById('nav');
  let lastScrollY = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    lastScrollY = scrollY;
  }

  // Active nav link tracking
  const sections = ['vision', 'future', 'audience', 'programs', 'pathways', 'about', 'contact'];
  const navLinks = document.querySelectorAll('.nav__link');

  function updateActiveNav() {
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= 120) current = id;
    });
    navLinks.forEach(link => {
      const section = link.getAttribute('data-section');
      if (section === current) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  // ── MOBILE MENU ──────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  function openMobileMenu() {
    mobileMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  hamburger && hamburger.addEventListener('click', openMobileMenu);
  mobileClose && mobileClose.addEventListener('click', closeMobileMenu);
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // ── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────
  function bindAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -80, duration: 1.2 });
        } else {
          const offset = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      });
    });
  }

  // ── SCROLL REVEAL (IntersectionObserver) ────────
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal-up');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(item => observer.observe(item));
  }

  // ── HERO PARALLAX (subtle, CSS-driven) ───────────
  function initHeroParallax() {
    const heroBg = document.querySelector('.hero__bg');
    if (!heroBg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const factor = 0.025; // very subtle
          heroBg.style.transform = `translateY(${scrollY * factor}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── SCROLL EVENT AGGREGATOR ──────────────────────
  window.addEventListener('scroll', () => {
    handleNavScroll();
    updateActiveNav();
  }, { passive: true });

  // ── INIT ON DOM READY ────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    bindAnchorLinks();
    bindThemeToggles();
    initScrollReveal();
    initHeroParallax();
    initHeroDotEffect();
    handleNavScroll();
    updateActiveNav();

    // Re-run reveal check after a short delay for elements already in view
    setTimeout(() => {
      document.querySelectorAll('.reveal-up:not(.is-visible)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
          el.classList.add('is-visible');
        }
      });
    }, 200);
  });

  // ── INTERACTIVE HERO DOT EFFECT ────────────────────
  function initHeroDotEffect() {
    const dot = document.getElementById('heroDot');
    const heroSub = document.getElementById('heroSub');
    const triggerZone = document.getElementById('heroTriggerZone');
    if (!dot) return;

    // Create particles container on the dot
    const particles = document.createElement('div');
    particles.className = 'hero__dot-particles';
    dot.appendChild(particles);

    // Create shockwave element on the dot
    const shockwave = document.createElement('div');
    shockwave.className = 'hero__shockwave';
    dot.appendChild(shockwave);

    // ── Progressive de-blur state ──
    let blurLevel = 3;
    if (heroSub) heroSub.setAttribute('data-blur', blurLevel);

    // Collect all trigger elements
    const triggers = [dot];
    if (triggerZone) triggers.push(triggerZone);
    if (heroSub) triggers.push(heroSub);

    let isHovering = false;

    function handleEnter() {
      if (isHovering) return;
      isHovering = true;

      // Once golden, no more sparkle / particles / shockwave
      if (dot.classList.contains('is-golden')) {
        if (heroSub) heroSub.classList.add('is-hovering');
        return;
      }

      dot.classList.add('is-sparkling');
      createParticles(particles);
      fireShockwave(shockwave);
      if (heroSub) heroSub.classList.add('is-hovering');
    }

    function handleLeave(e) {
      // Only leave if mouse exits ALL trigger elements
      // Check if relatedTarget is inside any trigger
      for (const t of triggers) {
        if (t.contains(e.relatedTarget)) return;
      }
      isHovering = false;

      // Progress the blur level down (less blurry each cycle)
      if (blurLevel > 0) {
        blurLevel--;
        if (heroSub) heroSub.setAttribute('data-blur', blurLevel);
      }

      // If fully de-blurred, lock the dot golden permanently
      if (blurLevel === 0) {
        dot.classList.add('is-golden');
        dot.classList.remove('is-sparkling');
      } else {
        // Un-sparkle the dot (with small delay for grace)
        setTimeout(() => {
          if (!isHovering) {
            dot.classList.remove('is-sparkling');
          }
        }, 300);
      }

      // Remove hovering class so resting blur takes over
      if (heroSub) heroSub.classList.remove('is-hovering');
    }

    // Bind enter/leave to all trigger elements
    triggers.forEach(el => {
      el.addEventListener('mouseenter', handleEnter);
      el.addEventListener('mouseleave', handleLeave);
    });

    // Mobile: tap to cycle through one step
    function handleTap() {
      // Once golden, taps are inert
      if (dot.classList.contains('is-golden')) return;

      dot.classList.add('is-sparkling');
      createParticles(particles);
      fireShockwave(shockwave);
      if (heroSub) heroSub.classList.add('is-hovering');

      setTimeout(() => {
        if (heroSub) heroSub.classList.remove('is-hovering');
        if (blurLevel > 0) {
          blurLevel--;
          if (heroSub) heroSub.setAttribute('data-blur', blurLevel);
        }
        // If fully de-blurred, lock golden; otherwise remove sparkle
        if (blurLevel === 0) {
          dot.classList.add('is-golden');
          dot.classList.remove('is-sparkling');
        } else {
          dot.classList.remove('is-sparkling');
        }
      }, 1500);
    }

    dot.addEventListener('click', handleTap);
    if (triggerZone) {
      triggerZone.addEventListener('click', handleTap);
    }
  }

  function fireShockwave(el) {
    // Reset and replay the shockwave animation
    el.classList.remove('is-active');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('is-active');
    // Clean up after animation ends
    setTimeout(() => el.classList.remove('is-active'), 1000);
  }

  function createParticles(container) {
    // Clear existing particles
    container.innerHTML = '';
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'hero__dot-particle';
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4 - 0.2);
      const dist = 18 + Math.random() * 22;
      p.style.setProperty('--px', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--py', Math.sin(angle) * dist + 'px');
      p.style.animationDelay = (Math.random() * 0.15) + 's';
      container.appendChild(p);
    }
  }

})();
