/**
 * Couple Reveal Scene - Clean Background Version
 * Handles: Entry animations, floating petals
 */
(function() {
  'use strict';

  function initCoupleRevealScene() {
    const scene = document.getElementById('couple-reveal-scene');
    if (!scene || scene.dataset.inited === 'true') return;
    
    scene.dataset.inited = 'true';
    console.log('💑 Couple Reveal Scene Initializing...');

    initEntryAnimation(scene);
    initFloatingPetals(scene);

    console.log('✅ Couple Reveal Scene Ready');
  }

  /**
   * Staggered Entry Animation
   */
  function initEntryAnimation(scene) {
    const content = scene.querySelector('.reveal-content');
    if (!content) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          setTimeout(() => {
            content.classList.add('animate-in');
          }, 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -5% 0px' });

    observer.observe(scene);
  }

  /**
   * Generate Floating Petals
   */
  function initFloatingPetals(container) {
    const petalsContainer = container.querySelector('.reveal-petals');
    if (!petalsContainer) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 15;
    const colors = [
      'rgba(184, 205, 222, 0.4)',
      'rgba(212, 175, 55, 0.3)',
      'rgba(255, 182, 193, 0.35)',
      'rgba(255, 255, 255, 0.5)'
    ];

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'reveal-petal';
      
      const size = 12 + Math.random() * 14;
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.left = Math.random() * 100 + '%';
      petal.style.animationDelay = Math.random() * 12 + 's';
      petal.style.animationDuration = (22 + Math.random() * 14) + 's';
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      petal.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
      
      petalsContainer.appendChild(petal);
    }
  }

  window.initCoupleRevealScene = initCoupleRevealScene;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoupleRevealScene);
  } else {
    initCoupleRevealScene();
  }
})();