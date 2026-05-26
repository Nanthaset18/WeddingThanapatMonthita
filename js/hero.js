/**
 * Hero Scene - Minimal Gallery & Scroll
 * Handles animations, gallery interactions, and decorative effects
 */
(function() {
  'use strict';

  let heroScene = null;
  let galleryTrack = null;
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  /**
   * Initialize Hero Scene
   */
  function initHeroScene() {
    heroScene = document.getElementById('hero-scene');
    if (!heroScene || heroScene.dataset.inited === 'true') return;
    
    heroScene.dataset.inited = 'true';
    console.log('💒 Hero Scene Initializing...');

    // Initialize components
    initBackgroundEffects();
    initGallery();
    initScrollIndicator();
    initEntryAnimations();
    
    console.log('✅ Hero Scene Ready');
  }

  /**
   * Create Floating Background Effects
   */
  function initBackgroundEffects() {
    // Create floating petals
    const petalsContainer = document.createElement('div');
    petalsContainer.className = 'hero-petals';
    
    const petalCount = window.innerWidth < 768 ? 8 : 15;
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('div');
      petal.className = 'hero-petal';
      
      // Random properties
      petal.style.left = Math.random() * 100 + '%';
      petal.style.animationDelay = Math.random() * 10 + 's';
      petal.style.animationDuration = (15 + Math.random() * 10) + 's';
      petal.style.width = (15 + Math.random() * 10) + 'px';
      petal.style.height = petal.style.width;
      
      // Random color variation
      const colors = [
        'rgba(255,255,255,0.8)',
        'rgba(184,205,222,0.6)',
        'rgba(212,175,55,0.4)',
        'rgba(255,218,193,0.5)'
      ];
      petal.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]} 0%, transparent 70%)`;
      
      petalsContainer.appendChild(petal);
    }
    heroScene.appendChild(petalsContainer);

    // Create sparkle dots
    const sparklesContainer = document.createElement('div');
    sparklesContainer.className = 'hero-sparkles';
    
    const sparkleCount = window.innerWidth < 768 ? 12 : 25;
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'hero-sparkle';
      
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 3 + 's';
      sparkle.style.animationDuration = (2 + Math.random() * 2) + 's';
      
      sparklesContainer.appendChild(sparkle);
    }
    heroScene.appendChild(sparklesContainer);

    // Add decorative corners
    const decorTL = document.createElement('div');
    decorTL.className = 'hero-decor-corner tl';
    heroScene.appendChild(decorTL);
    
    const decorBR = document.createElement('div');
    decorBR.className = 'hero-decor-corner br';
    heroScene.appendChild(decorBR);

    // Add top ornament
    const decorTop = document.createElement('div');
    decorTop.className = 'hero-decor-top';
    decorTop.innerHTML = '✦ ✦ ✦';
    heroScene.appendChild(decorTop);
  }

  /**
   * Initialize Gallery Swipe Functionality
   */
  function initGallery() {
    galleryTrack = document.getElementById('hero-gallery-track');
    if (!galleryTrack) return;

    // Mouse events
    galleryTrack.addEventListener('mousedown', startDrag);
    galleryTrack.addEventListener('mousemove', drag);
    galleryTrack.addEventListener('mouseup', endDrag);
    galleryTrack.addEventListener('mouseleave', endDrag);
    
    // Touch events (with passive: true for performance)
    galleryTrack.addEventListener('touchstart', startDrag, { passive: true });
    galleryTrack.addEventListener('touchmove', drag, { passive: false });
    galleryTrack.addEventListener('touchend', endDrag);
    
    // Keyboard navigation for accessibility
    galleryTrack.setAttribute('tabindex', '0');
    galleryTrack.setAttribute('role', 'region');
    galleryTrack.setAttribute('aria-label', 'แกลเลอรี่ภาพบ่าวสาว เลื่อนซ้ายขวาเพื่อดูภาพเพิ่มเติม');
    
    galleryTrack.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        galleryTrack.scrollBy({ left: -280, behavior: 'smooth' });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        galleryTrack.scrollBy({ left: 280, behavior: 'smooth' });
      }
    });

    // Prevent image drag
    const images = galleryTrack.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
      img.style.pointerEvents = 'none'; // Let clicks pass to container
    });
  }

  /**
   * Drag/Touch Handlers for Gallery
   */
  function startDrag(e) {
    isDragging = true;
    startX = getPositionX(e);
    scrollLeft = galleryTrack.scrollLeft;
    
    galleryTrack.style.scrollBehavior = 'auto'; // Disable smooth scroll during drag
    galleryTrack.style.cursor = 'grabbing';
    
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = getPositionX(e) - startX;
    galleryTrack.scrollLeft = scrollLeft - x;
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    
    galleryTrack.style.scrollBehavior = 'smooth'; // Re-enable smooth scroll
    galleryTrack.style.cursor = 'grab';
  }

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  /**
   * Initialize Scroll Indicator
   */
  function initScrollIndicator() {
    const indicator = document.getElementById('hero-scroll-cue');
    if (!indicator) return;
    
    // Click to scroll to next scene
    indicator.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof WeddingApp !== 'undefined') {
        WeddingApp.nextScene();
      }
    });

    // Keyboard support
    indicator.setAttribute('tabindex', '0');
    indicator.setAttribute('role', 'button');
    indicator.setAttribute('aria-label', 'เลื่อนลงเพื่อชมรายละเอียดถัดไป');
    
    indicator.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof WeddingApp !== 'undefined') {
          WeddingApp.nextScene();
        }
      }
    });
  }

  /**
   * Initialize Entry Animations using Intersection Observer
   */
  function initEntryAnimations() {
    const elements = [
      { selector: '.hero-gallery', class: 'animate-in' },
      { selector: '.gallery-hint', class: 'animate-in' },
      { selector: '.scroll-indicator', class: 'animate-in' }
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          // Trigger animations with stagger
          elements.forEach(({ selector, class: className }, index) => {
            const el = heroScene?.querySelector(selector);
            if (el) {
              setTimeout(() => {
                el.classList.add(className);
              }, index * 200);
            }
          });
          
          // Unobserve after triggering
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    });

    observer.observe(heroScene);
  }

  /**
   * Handle Window Resize
   */
  function handleResize() {
    // Re-initialize background effects count if needed
    const petals = heroScene?.querySelector('.hero-petals');
    const sparkles = heroScene?.querySelector('.hero-sparkles');
    
    if (window.innerWidth < 768) {
      // Mobile: reduce particle count for performance
      if (petals && petals.children.length > 8) {
        while (petals.children.length > 8) {
          petals.removeChild(petals.lastChild);
        }
      }
      if (sparkles && sparkles.children.length > 12) {
        while (sparkles.children.length > 12) {
          sparkles.removeChild(sparkles.lastChild);
        }
      }
    }
  }

  // Debounced resize handler
  window.addEventListener('resize', Utils?.debounce ? 
    Utils.debounce(handleResize, 200) : handleResize
  );

  /**
   * Public API
   */
  window.initHeroScene = initHeroScene;
  
  // Auto-init if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroScene);
  } else {
    initHeroScene();
  }
  
})();