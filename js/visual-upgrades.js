// LNK Design Touch — Visual Upgrades
// Scroll animations, custom cursor, ripple buttons, preloader, marquee, parallax, counters

(() => {
  'use strict';

  // ===== 1. PRELOADER =====
  function initPreloader() {
    const preloader = document.getElementById('lnk-preloader');
    if (!preloader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('lnk-preloader-done');
        setTimeout(() => preloader.remove(), 600);
      }, 400);
    });
    // Fallback: hide after 2s max
    setTimeout(() => {
      if (preloader.parentNode) {
        preloader.classList.add('lnk-preloader-done');
        setTimeout(() => preloader.remove(), 600);
      }
    }, 2000);
  }

  // ===== 2. SCROLL REVEAL ANIMATIONS =====
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

  // ===== 3. CUSTOM CURSOR =====
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
    // Hover effect on interactive elements
    const interactive = document.querySelectorAll('a, button, [role="button"], .filter, .portfolio-card-button, input, textarea, select');
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('lnk-cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('lnk-cursor-hover'));
    });
  }

  // ===== 4. RIPPLE BUTTONS =====
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

  // ===== 5. PARALLAX LÉGER =====
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

  // ===== 6. THEME TOGGLE (Dark/Light Mode) =====
  function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('lnk-theme');
    
    // Preference: Saved > System Preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = savedTheme || systemTheme;
    
    // Apply initial theme
    html.setAttribute('data-theme', currentTheme);
    
    if (themeToggle) {
      themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentTheme = html.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('lnk-theme', newTheme);
        
        // Update logos immediately
        updateLogos(newTheme);
        
        // Re-initialize icons to switch sun/moon
        if (window.lucide) window.lucide.createIcons();
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('lnk-theme-changed', { detail: newTheme }));
        
        console.log('Theme switched to:', newTheme);
      });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('lnk-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        document.dispatchEvent(new CustomEvent('lnk-theme-changed', { detail: newTheme }));
      }
    });

    // Logo Auto-Switching
    function updateLogos(theme) {
      const logos = document.querySelectorAll('.brand-logo, .footer-logo img');
      logos.forEach(img => {
        const src = img.getAttribute('src');
        if (theme === 'dark') {
          img.setAttribute('src', src.replace('-dark.svg', '-light.svg'));
        } else {
          img.setAttribute('src', src.replace('-light.svg', '-dark.svg'));
        }
      });
    }

    // Initial logo state
    updateLogos(currentTheme);

    // Update on theme change
    document.addEventListener('lnk-theme-changed', (e) => {
      updateLogos(e.detail);
    });
  }

  // ===== 7. COUNTER ANIMATION =====
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
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = current.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(update);
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    // Preloader completely removed from HTML and JS initialization
    initTheme();
    initScrollReveal();
    initCustomCursor();
    initRipple();
    initParallax();
    initCounters();
  });
})();
