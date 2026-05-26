/**
 * Thanks Scene - Mobile-Stable Animation & Parallax
 * Features: JS-driven stagger, GPU parallax, scroll-snap compatible, progressive enhancement
 */
(function() {
  'use strict';

  function initThanksScene() {
    const scene = document.getElementById('thanks-scene');
    if (!scene || scene.dataset.inited === 'true') return;
    scene.dataset.inited = 'true';
    console.log('💌 Thanks Scene Initializing...');

    initStaggerAnimation(scene);
    initFloatingPetals(scene);
    initGpuParallax(scene);

    console.log('✅ Thanks Scene Ready');
  }

  /**
   * 1. Reliable Stagger Animation via JS (No CSS > * selector)
   */
  function initStaggerAnimation(scene) {
    const items = scene.querySelectorAll('.data-anim');
    if (items.length === 0) return;

    // Set initial inline delays
    items.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.18}s`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Trigger animation
          items.forEach(el => el.classList.add('in-view'));
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.15, 
      rootMargin: '0px 0px -10% 0px' 
    });

    observer.observe(scene);
  }

  /**
   * 2. GPU-Optimized Parallax (Safe with Scroll-Snap)
   */
  function initGpuParallax(scene) {
    const bg = scene.querySelector('.thanks-bg-img');
    if (!bg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    let inView = false;

    // Track when scene is in viewport
    const viewObs = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) bg.style.transform = 'scale(1.05) translate3d(0,0,0)'; // Reset when out
    }, { threshold: 0.05 });
    viewObs.observe(scene);

    window.addEventListener('scroll', () => {
      if (!ticking && inView) {
        window.requestAnimationFrame(() => {
          const rect = scene.getBoundingClientRect();
          const viewportH = window.innerHeight;
          const progress = Math.min(1, Math.max(0, (viewportH - rect.top) / (viewportH + rect.height)));
          
          // Smooth translateY range: -15px to +15px
          const move = (progress - 0.5) * 30;
          bg.style.transform = `scale(1.05) translate3d(0, ${move}px, 0)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * 3. Floating Petals (Mobile-Optimized Count)
   */
  function initFloatingPetals(container) {
    const petalBox = container.querySelector('.thanks-petals');
    if (!petalBox) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 6 : 10;
    const colors = ['rgba(255,255,255,0.5)', 'rgba(184,205,222,0.35)', 'rgba(212,175,55,0.25)'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'thanks-petal';
      const size = 8 + Math.random() * 10;
      Object.assign(p.style, {
        width: `${size}px`, height: `${size}px`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${18 + Math.random() * 10}s`,
        background: `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]} 0%, transparent 70%)`
      });
      petalBox.appendChild(p);
    }
  }

  // Export
  window.initThanksScene = initThanksScene;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThanksScene);
  } else {
    initThanksScene();
  }
})();