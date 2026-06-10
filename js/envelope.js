/**
 * Envelope Scene - Image Background Version
 * Handles: Opening animation, sparkles, petals, scene transition, auto-play music
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initEnvelope();
  });

  function initEnvelope() {
    console.log('🎁 Envelope Scene Loaded');

    const envelopeScene = document.getElementById('envelope-scene');
    const container     = document.getElementById('envelope-container');
    const envelope      = document.getElementById('envelope');
    const seal          = document.getElementById('wax-seal');
    const popup         = document.getElementById('couple-photo-popup');
    const hint          = document.getElementById('tap-hint');
    const sparkles      = document.getElementById('sparkles');
    const bgImg         = envelopeScene?.querySelector('.envelope-bg-img');

    if (!envelopeScene || !container) {
      console.error('❌ Required elements not found!');
      return;
    }

    let isOpen = false;

    // ── Parallax Effect on Background Image (Subtle) ──
    if (bgImg) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking && envelopeScene.getBoundingClientRect().top < window.innerHeight) {
          window.requestAnimationFrame(() => {
            const rect = envelopeScene.getBoundingClientRect();
            const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
            const move = progress * 15 - 5;
            bgImg.style.transform = `scale(1.08) translate3d(0, ${move}px, 0)`;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    // ── Create Floating Petals ──
    function createPetals() {
      const petalsContainer = envelopeScene.querySelector('.floating-petals');
      if (!petalsContainer) return;

      const colors = [
        'rgba(255,255,255,0.55)',
        'rgba(212,175,55,0.40)',
        'rgba(180,210,255,0.45)',
        'rgba(255,180,180,0.38)',
      ];

      for (let i = 0; i < 20; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDelay = Math.random() * 16 + 's';
        petal.style.animationDuration = (14 + Math.random() * 10) + 's';
        const color = colors[Math.floor(Math.random() * colors.length)];
        petal.style.background = `radial-gradient(circle, ${color} 0%, transparent 72%)`;
        const size = 14 + Math.random() * 16;
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        petalsContainer.appendChild(petal);
      }
    }

    // ── Open Envelope Animation ──
    function openEnvelope(e) {
      if (e) {
        if (e.type === 'touchstart') e.stopPropagation();
        else { e.preventDefault(); e.stopPropagation(); }
      }
      if (isOpen) return;
      isOpen = true;
      console.log('✅ Envelope opened!');

      // Hide hint
      if (hint) {
        hint.style.transition = 'opacity 0.3s ease';
        hint.style.opacity = '0';
        setTimeout(() => { hint.style.display = 'none'; }, 300);
      }

      // Open flap
      if (envelope) envelope.classList.add('open');

      // Hide seal
      if (seal) {
        seal.style.transition = 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        seal.style.transform = 'scale(0) rotate(35deg)';
        seal.style.opacity = '0';
      }

      // Fade out envelope
      setTimeout(() => {
        if (envelope) envelope.classList.add('opened');
      }, 420);

      // Show couple photo popup
      setTimeout(() => { showBigCouplePhoto(); }, 620);

      // ✅ ✅ ✅ เล่นเพลงอัตโนมัติหลังเปิดซอง ✅ ✅ ✅
      setTimeout(() => {
        if (typeof MusicPlayer !== 'undefined' && typeof MusicPlayer.playAfterEnvelopeOpen === 'function') {
          MusicPlayer.playAfterEnvelopeOpen()
            .then(success => {
              if (success) {
                console.log('🎵 Music auto-played after envelope open');
              }
            })
            .catch(err => {
              console.warn('🎵 Auto-play error:', err);
            });
        }
      }, 1000); // รอ 1 วินาทีให้รูปเด้งมาก่อน

      // Go to next scene
      setTimeout(() => { goToNextScene(); }, 3600);
    }

    // ── Show Big Couple Photo Popup ──
    function showBigCouplePhoto() {
      if (!popup) return;
      const popupText = popup.querySelector('.popup-text');

      popup.classList.add('show');
      popup.style.opacity = '1';
      popup.style.pointerEvents = 'auto';
      
      // ✅ แก้ไข: ลบ translate(-50%, -50%) ออก เพราะใช้ inset:0 + flexbox แล้ว
      popup.style.transform = 'scale(0.95)';
      
      void popup.offsetWidth; // Force reflow
      
      popup.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease';
      popup.style.transform = 'scale(1)';

      createSparkles(sparkles);

      if (popupText) {
        setTimeout(() => { popupText.classList.add('show'); }, 320);
      }

      playSound('pop');
    }

    // ── Create Sparkles Effect ──
    function createSparkles(container) {
      if (!container) return;
      container.innerHTML = '';
      const count = 30;
      
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const sparkle = document.createElement('div');
          sparkle.className = 'sparkle';
          const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
          const radius = 100 + Math.random() * 200;
          const x = 50 + Math.cos(angle) * (radius / 10);
          const y = 50 + Math.sin(angle) * (radius / 10);
          
          sparkle.style.left = x + '%';
          sparkle.style.top = y + '%';
          const sz = (6 + Math.random() * 10) + 'px';
          sparkle.style.width = sz;
          sparkle.style.height = sz;
          sparkle.style.animationDelay = (Math.random() * 0.3) + 's';
          
          container.appendChild(sparkle);
          setTimeout(() => sparkle.remove(), 1300);
        }, i * 28);
      }
    }

    // ── Go to Next Scene ──
    function goToNextScene() {
      if (window.hasGoneToNextScene) return;
      window.hasGoneToNextScene = true;
      console.log('🚀 goToNextScene called');

      if (typeof WeddingApp !== 'undefined') {
        WeddingApp.unlockScroll();
        WeddingApp._preventBackToEnvelope();
      } else {
        setTimeout(() => {
          if (typeof WeddingApp !== 'undefined') {
            WeddingApp.unlockScroll();
            WeddingApp._preventBackToEnvelope();
          }
        }, 300);
      }
    }

    // ── Play Sound Effect ──
    function playSound(type) {
      const map = {
        pop: 'assets/sounds/pop.mp3',
        whoosh: 'assets/sounds/whoosh.mp3',
      };
      if (!map[type]) return;
      const audio = new Audio(map[type]);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }

    // ── Event Listeners ──
    envelopeScene.addEventListener('click', openEnvelope);
    envelopeScene.addEventListener('touchstart', function (e) {
      e.stopPropagation();
      openEnvelope(e);
    }, { passive: true });

    container.addEventListener('click', openEnvelope);
    container.addEventListener('touchstart', function (e) {
      e.stopPropagation();
      openEnvelope(e);
    }, { passive: true });

    if (seal) {
      seal.addEventListener('click', function (e) {
        e.stopPropagation();
        openEnvelope(e);
      });
      seal.addEventListener('touchstart', function (e) {
        e.stopPropagation();
        openEnvelope(e);
      }, { passive: true });
    }

    if (container) {
      container.setAttribute('tabindex', '0');
      container.setAttribute('role', 'button');
      container.setAttribute('aria-label', 'แตะเพื่อเปิดคำเชิญ');
      container.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEnvelope(e);
        }
      });
    }

    // Initialize
    createPetals();
    console.log('✅ Envelope Scene ready — Click anywhere to open!');
  }
  
})();