// LNK Design Touch — Visual Upgrades
// Scroll animations, custom cursor, ripple buttons, parallax, counters

(() => {
  'use strict';

  // ===== 1. SCROLL REVEAL ANIMATIONS =====
  function initScrollReveal() {
    const els = document.querySelectorAll('.lnk-reveal');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lnk-reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
  }

  // ===== 2. CUSTOM CURSOR =====
  function initCustomCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cursor = document.createElement('div');
    cursor.className = 'lnk-cursor';
    document.body.appendChild(cursor);
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    const interactive = document.querySelectorAll('a, button, [role="button"], .filter, .portfolio-card-button, input, textarea, select');
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('lnk-cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('lnk-cursor-hover'));
    });
  }

  // ===== 3. RIPPLE BUTTONS =====
  function initRipple() {
    const buttons = document.querySelectorAll('.button, .lnk-btn, .filter, .cta-btn');
    buttons.forEach(btn => {
      btn.classList.add('lnk-ripple');
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'lnk-ripple-effect';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ===== 4. PARALLAX LÉGER =====
  function initParallax() {
    const parallaxEls = document.querySelectorAll('.lnk-parallax');
    if (!parallaxEls.length) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxEls.forEach(el => {
          const speed = parseFloat(el.dataset.parallaxSpeed) || 0.05;
          el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  // ===== 5. COUNTER ANIMATION =====
  function initCounters() {
    const counters = document.querySelectorAll('.lnk-counter[data-target]');
    if (!counters.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = (target % 1 !== 0) ? 1 : 0;
    const duration = 1500;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = current.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(update);
  }

  // Theme state, persistence, logo switching and theme-toggle interaction are owned
  // exclusively by js/navigation.js. Keeping this module theme-agnostic prevents
  // duplicate handlers and double-toggle regressions on the homepage.
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initCustomCursor();
    initRipple();
    initParallax();
    initCounters();
  });
})();
