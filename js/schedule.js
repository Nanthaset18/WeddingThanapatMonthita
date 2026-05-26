/**
 * Schedule Scene - Clean & Bold Version
 * Handles: Staggered entry, image optimization, touch UX, floating particles
 */
(function() {
  'use strict';

  function initScheduleScene() {
    const scene = document.getElementById('schedule-scene');
    if (!scene || scene.dataset.inited === 'true') return;
    
    scene.dataset.inited = 'true';
    console.log('📅 Schedule Scene Initializing...');

    initScrollAnimations(scene);
    initImageOptimization(scene);
    initFloatingPetals(scene);
    initParallaxBackground(scene);
    initTouchUX(scene);

    console.log('✅ Schedule Scene Ready');
  }

  /**
   * Intersection Observer สำหรับ Staggered Entry
   */
  function initScrollAnimations(scene) {
    const items = scene.querySelectorAll('.timeline-item');
    if (items.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

    items.forEach(item => observer.observe(item));
    
    // Trigger header animation
    const header = scene.querySelector('.section-header');
    if (header) {
      const headerObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          header.classList.add('animate-in');
          headerObs.disconnect();
        }
      }, { threshold: 0.5 });
      headerObs.observe(header);
    }
  }

  /**
   * Optimize Image Icons
   */
  function initImageOptimization(scene) {
    const icons = scene.querySelectorAll('.timeline-icon img');
    icons.forEach(img => {
      img.addEventListener('error', function() {
        this.style.display = 'none';
        this.parentElement.innerHTML = '<span style="font-size:32px;">📷</span>';
        this.parentElement.style.background = 'rgba(212,175,55,0.15)';
      });
      
      if ('loading' in HTMLImageElement.prototype) {
        img.loading = 'lazy';
      }
    });
  }

  /**
   * Generate Floating Particles
   */
  function initFloatingPetals(container) {
    const petalsContainer = container.querySelector('.schedule-petals');
    if (!petalsContainer) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 15;
    const colors = ['rgba(255,255,255,0.5)', 'rgba(184,205,222,0.4)', 'rgba(212,175,55,0.3)'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'schedule-petal';
      
      const size = 10 + Math.random() * 12;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 10 + 's';
      p.style.animationDuration = (22 + Math.random() * 14) + 's';
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
      
      petalsContainer.appendChild(p);
    }
  }

  /**
   * Parallax Effect on Background
   */
  function initParallaxBackground() {
    const bgImg = document.querySelector('.schedule-bg-img');
    if (!bgImg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scene = document.getElementById('schedule-scene');
          const rect = scene.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (inView) {
            const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            const move = progress * 15 - 5;
            bgImg.style.transform = `scale(1) translate3d(0, ${move}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Mobile Touch & Scroll Optimization
   */
  function initTouchUX(scene) {
    const timeline = scene.querySelector('.timeline');
    if (timeline) {
      timeline.style.touchAction = 'pan-y';
      timeline.style.webkitOverflowScrolling = 'touch';
    }

    scene.querySelectorAll('.timeline-item').forEach(el => {
      el.style.webkitTapHighlightColor = 'transparent';
      el.style.userSelect = 'none';
    });
  }

  /**
   * Public API
   */
  window.initScheduleScene = initScheduleScene;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScheduleScene);
  } else {
    initScheduleScene();
  }
})();