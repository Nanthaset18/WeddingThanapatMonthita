/**
 * Countdown Scene - Clean Background Version
 * Handles: Real-time timer, entry animations, floating particles
 */
(function() {
  'use strict';

  let countdownScene = null;
  const WEDDING_DATE = new Date('2026-07-26T07:00:00+07:00').getTime();
  let intervalId = null;
  let prevValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };

  /**
   * Initialize Countdown Scene
   */
  function initCountdownScene() {
    countdownScene = document.getElementById('countdown-scene');
    if (!countdownScene || countdownScene.dataset.inited === 'true') return;
    
    countdownScene.dataset.inited = 'true';
    console.log('⏳ Countdown Scene Initializing...');

    initCountdownTimer();
    initEntryAnimations();
    initFloatingParticles();
    initParallaxBackground();
    
    console.log('✅ Countdown Scene Ready');
  }

  /**
   * Core Countdown Logic
   */
  function initCountdownTimer() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    function updateTimer() {
      const now = new Date().getTime();
      const distance = Math.max(0, WEDDING_DATE - now);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const newDays = String(days).padStart(2, '0');
      const newHours = String(hours).padStart(2, '0');
      const newMinutes = String(minutes).padStart(2, '0');
      const newSeconds = String(seconds).padStart(2, '0');

      if (daysEl && newDays !== prevValues.days) {
        daysEl.textContent = newDays;
        triggerPulse(daysEl);
        prevValues.days = newDays;
      }
      if (hoursEl && newHours !== prevValues.hours) {
        hoursEl.textContent = newHours;
        triggerPulse(hoursEl);
        prevValues.hours = newHours;
      }
      if (minutesEl && newMinutes !== prevValues.minutes) {
        minutesEl.textContent = newMinutes;
        triggerPulse(minutesEl);
        prevValues.minutes = newMinutes;
      }
      if (secondsEl && newSeconds !== prevValues.seconds) {
        secondsEl.textContent = newSeconds;
        triggerPulse(secondsEl);
        prevValues.seconds = newSeconds;
      }

      if (distance === 0) {
        clearInterval(intervalId);
        updateCelebrationState(daysEl, hoursEl, minutesEl, secondsEl);
      }
    }

    updateTimer();
    intervalId = setInterval(updateTimer, 1000);
  }

  /**
   * Trigger Pulse Animation on Number Change
   */
  function triggerPulse(element) {
    element.classList.add('pulse');
    setTimeout(() => element.classList.remove('pulse'), 300);
  }

  /**
   * Handle Celebration State (When timer hits 0)
   */
  function updateCelebrationState(...els) {
    els.forEach(el => { if (el) el.textContent = '00'; });
    const label = countdownScene?.querySelector('.countdown-label');
    if (label) label.textContent = '🎉 ถึงวันสำคัญแล้ว!';
  }

  /**
   * Entry Animations via Intersection Observer
   */
  function initEntryAnimations() {
    const card = countdownScene?.querySelector('.countdown-card');
    if (!card) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          setTimeout(() => card.classList.add('animate-in'), 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -5% 0px' });

    observer.observe(countdownScene);
  }

  /**
   * Generate Floating Particles
   */
  function initFloatingParticles() {
    const petalsContainer = countdownScene?.querySelector('.countdown-petals');
    if (!petalsContainer) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 8 : 15;
    const colors = [
      'rgba(255,255,255,0.5)',
      'rgba(184,205,222,0.4)',
      'rgba(212,175,55,0.3)'
    ];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'countdown-petal';
      
      const size = 10 + Math.random() * 12;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 12 + 's';
      p.style.animationDuration = (22 + Math.random() * 14) + 's';
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
      
      petalsContainer.appendChild(p);
    }
  }

  /**
   * Parallax Effect on Background (Subtle)
   */
  function initParallaxBackground() {
    const bgImg = countdownScene?.querySelector('.countdown-bg-img');
    if (!bgImg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = countdownScene.getBoundingClientRect();
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
   * Cleanup on page unload
   */
  window.addEventListener('beforeunload', () => {
    if (intervalId) clearInterval(intervalId);
  });

  /**
   * Public API
   */
  window.initCountdownScene = initCountdownScene;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdownScene);
  } else {
    initCountdownScene();
  }
})();