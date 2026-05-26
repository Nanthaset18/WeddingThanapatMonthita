/**
 * Location Scene - Clean & Simple Version
 * Handles: Entry animation, clipboard copy, parallax background
 */
(function() {
  'use strict';

  function initLocationScene() {
    const scene = document.getElementById('location-scene');
    if (!scene || scene.dataset.inited === 'true') return;
    
    scene.dataset.inited = 'true';
    console.log('📍 Location Scene Initializing...');

    initEntryAnimation(scene);
    initFloatingPetals(scene);
    initCopyAddress(scene);
    initParallaxBackground(scene);

    console.log('✅ Location Scene Ready');
  }

  /**
   * Entry Animation with Intersection Observer
   */
  function initEntryAnimation(scene) {
    const card = scene.querySelector('.location-card');
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
    const petalsContainer = container.querySelector('.location-petals');
    if (!petalsContainer) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 15;
    const colors = ['rgba(255,255,255,0.5)', 'rgba(184,205,222,0.4)', 'rgba(212,175,55,0.3)'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'location-petal';
      
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
   * Copy Address to Clipboard
   */
  function initCopyAddress(scene) {
    const btn = scene.querySelector('#copy-address-btn');
    if (!btn) return;
    
    const addressEl = scene.querySelector('.full-address');
    const addressText = addressEl 
      ? Array.from(addressEl.querySelectorAll('span')).map(el => el.textContent.trim()).join(', ')
      : '47/7 หมู่ 4 ต.คลองสอง อ.คลองหลวง จ.ปทุมธานี 12120';

    const handleClick = async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(addressText);
        } else {
          const ta = document.createElement('textarea');
          ta.value = addressText;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }

        // Visual feedback
        const originalIcon = btn.querySelector('.btn-icon')?.textContent;
        const originalText = btn.querySelector('.btn-text')?.textContent;
        
        if (btn.querySelector('.btn-icon')) {
          btn.querySelector('.btn-icon').textContent = '✅';
        }
        if (btn.querySelector('.btn-text')) {
          btn.querySelector('.btn-text').textContent = 'คัดลอกแล้ว!';
        }
        btn.classList.add('copied');
        
        if (typeof Utils !== 'undefined') {
          Utils.showToast('คัดลอกที่อยู่เรียบร้อยแล้ว', 'success');
        }
        
        setTimeout(() => {
          if (btn.querySelector('.btn-icon') && originalIcon) {
            btn.querySelector('.btn-icon').textContent = originalIcon;
          }
          if (btn.querySelector('.btn-text') && originalText) {
            btn.querySelector('.btn-text').textContent = originalText;
          }
          btn.classList.remove('copied');
        }, 2000);
        
      } catch (err) {
        console.error('Copy failed:', err);
        if (typeof Utils !== 'undefined') {
          Utils.showToast('คัดลอกไม่สำเร็จ', 'error');
        }
      }
    };

    btn.addEventListener('click', handleClick);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); handleClick(); }, { passive: false });
  }

  /**
   * Parallax Effect on Background
   */
  function initParallaxBackground() {
    const bgImg = document.querySelector('.location-bg-img');
    if (!bgImg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scene = document.getElementById('location-scene');
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
  window.initLocationScene = initLocationScene;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocationScene);
  } else {
    initLocationScene();
  }
})();