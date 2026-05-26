/**
 * RSVP Scene - Combined Version with Google Form Link
 * Handles: QR expand, copy account, entry animation, floating particles
 */
(function() {
  'use strict';

  function initRsvpScene() {
    const scene = document.getElementById('rsvp-scene');
    if (!scene || scene.dataset.inited === 'true') return;
    
    scene.dataset.inited = 'true';
    console.log('💌 RSVP Scene Initializing...');

    initEntryAnimation(scene);
    initFloatingPetals(scene);
    initCopyAccount(scene);
    initQRTapExpand(scene);
    initSuccessMessage(scene);
    initParallaxBackground(scene);

    console.log('✅ RSVP Scene Ready');
  }

  /**
   * Entry Animation with Intersection Observer
   */
  function initEntryAnimation(scene) {
    const card = scene.querySelector('.rsvp-card');
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
    const petalsContainer = container.querySelector('.rsvp-petals');
    if (!petalsContainer) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 15;
    const colors = ['rgba(255,255,255,0.5)', 'rgba(184,205,222,0.4)', 'rgba(212,175,55,0.3)'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'rsvp-petal';
      
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
   * Copy Account Number to Clipboard
   */
  function initCopyAccount(scene) {
    const btn = scene.querySelector('#copy-account-btn');
    if (!btn) return;
    
    const accountEl = scene.querySelector('#account-number');
    const accountText = accountEl?.textContent.trim() || 'XXX-XXX-XXXX';

    const handleClick = async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(accountText);
        } else {
          const ta = document.createElement('textarea');
          ta.value = accountText;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }

        // Visual feedback
        const originalText = btn.textContent;
        btn.classList.add('copied');
        btn.textContent = '✅ คัดลอกแล้ว!';
        
        if (typeof Utils !== 'undefined') {
          Utils.showToast('คัดลอกเลขบัญชีเรียบร้อยแล้ว', 'success');
        }
        
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.textContent = originalText;
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
   * QR Tap to Expand
   */
  function initQRTapExpand(scene) {
    const wrapper = scene.querySelector('#qr-wrapper');
    if (!wrapper) return;

    const toggle = () => {
      wrapper.classList.toggle('active');
      if (wrapper.classList.contains('active')) {
        wrapper.style.transform = 'scale(1.15)';
        wrapper.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
      } else {
        wrapper.style.transform = '';
        wrapper.style.boxShadow = '';
      }
    };

    wrapper.addEventListener('click', toggle);
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  /**
   * Success Message Handling
   */
  function initSuccessMessage(scene) {
    const successMsg = scene.querySelector('#rsvp-success');
    const backBtn = scene.querySelector('#rsvp-back');
    
    if (backBtn && successMsg) {
      backBtn.addEventListener('click', () => {
        successMsg.classList.remove('show');
      });
    }
  }

  /**
   * Parallax Effect on Background
   */
  function initParallaxBackground() {
    const bgImg = document.querySelector('.rsvp-bg-img');
    if (!bgImg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scene = document.getElementById('rsvp-scene');
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
  window.initRsvpScene = initRsvpScene;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRsvpScene);
  } else {
    initRsvpScene();
  }
})();