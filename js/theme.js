/**
 * Theme Scene - Clean Background Version
 * Handles: Entry animation, floating particles, color swatch interactions
 */
(function() {
  'use strict';

  function initThemeScene() {
    const scene = document.getElementById('theme-scene');
    if (!scene || scene.dataset.inited === 'true') return;
    
    scene.dataset.inited = 'true';
    console.log('🎨 Theme Scene Initializing...');

    initEntryAnimation(scene);
    initFloatingPetals(scene);
    initSwatchInteractions(scene);
    initParallaxBackground(scene);

    console.log('✅ Theme Scene Ready');
  }

  /**
   * Entry Animation with Intersection Observer
   */
  function initEntryAnimation(scene) {
    const card = scene.querySelector('.theme-card');
    const header = scene.querySelector('.section-header');
    
    if (!card) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate header first
          if (header) {
            setTimeout(() => header.classList.add('animate-in'), 100);
          }
          
          // Then animate card
          setTimeout(() => {
            card.classList.add('animate-in');
            
            // Stagger animation for color swatches
            const swatches = card.querySelectorAll('.color-swatch');
            swatches.forEach((swatch, index) => {
              setTimeout(() => {
                swatch.style.opacity = '0';
                swatch.style.transform = 'scale(0.8) translateY(20px)';
                
                setTimeout(() => {
                  swatch.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                  swatch.style.opacity = '1';
                  swatch.style.transform = 'scale(1) translateY(0)';
                }, 50);
              }, 300 + (index * 100));
            });
          }, 200);
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    observer.observe(scene);
  }

  /**
   * Generate Floating Petals
   */
  function initFloatingPetals(container) {
    const petalsContainer = container.querySelector('.theme-petals');
    if (!petalsContainer) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 15;
    const colors = ['rgba(255,255,255,0.5)', 'rgba(184,205,222,0.4)', 'rgba(212,175,55,0.3)'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'theme-petal';
      
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
   * Color Swatch Interactions (Click to copy hex code)
   */
  function initSwatchInteractions(scene) {
    const swatches = scene.querySelectorAll('.color-swatch');
    
    swatches.forEach(swatch => {
      swatch.setAttribute('role', 'button');
      swatch.setAttribute('aria-pressed', 'false');
      swatch.setAttribute('tabindex', '0');
      
      const hexCode = swatch.querySelector('.color-label')?.textContent || '';
      
      // Click/Tap handler
      const handleInteraction = (e) => {
        if (e.type === 'touchstart') {
          e.preventDefault();
        }
        
        // Visual feedback
        swatch.style.transform = 'scale(1.3) translateY(-10px)';
        swatch.style.boxShadow = '0 15px 40px rgba(212, 175, 55, 0.4)';
        
        // Copy to clipboard
        if (hexCode) {
          navigator.clipboard.writeText(hexCode).then(() => {
            // Show success feedback
            const originalLabel = swatch.querySelector('.color-label');
            if (originalLabel) {
              const originalText = originalLabel.textContent;
              originalLabel.textContent = '✓ Copied!';
              originalLabel.style.background = '#2ecc71';
              originalLabel.style.color = '#fff';
              
              setTimeout(() => {
                originalLabel.textContent = originalText;
                originalLabel.style.background = '';
                originalLabel.style.color = '';
              }, 1500);
            }
            
            // Show toast notification if Utils exists
            if (typeof Utils !== 'undefined') {
              Utils.showToast(`คัดลอกสี ${hexCode} แล้ว`, 'success');
            }
          }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = hexCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (typeof Utils !== 'undefined') {
              Utils.showToast(`คัดลอกสี ${hexCode} แล้ว`, 'success');
            }
          });
        }
        
        setTimeout(() => {
          swatch.style.transform = '';
          swatch.style.boxShadow = '';
        }, 300);
      };
      
      swatch.addEventListener('click', handleInteraction);
      swatch.addEventListener('touchstart', handleInteraction, { passive: false });
      
      // Keyboard support
      swatch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleInteraction(e);
        }
      });
      
      // Focus styles
      swatch.addEventListener('focus', () => {
        swatch.style.outline = '3px solid var(--gold, #d4af37)';
        swatch.style.outlineOffset = '4px';
      });
      
      swatch.addEventListener('blur', () => {
        swatch.style.outline = '';
        swatch.style.outlineOffset = '';
      });
    });
  }

  /**
   * Parallax Effect on Background
   */
  function initParallaxBackground() {
    const bgImg = document.querySelector('.theme-bg-img');
    if (!bgImg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scene = document.getElementById('theme-scene');
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
   * Public API
   */
  window.initThemeScene = initThemeScene;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeScene);
  } else {
    initThemeScene();
  }
})();