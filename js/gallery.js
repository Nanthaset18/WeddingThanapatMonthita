/**
 * Gallery Scene - Clean Background Version
 * Features: Touch swipe, progress bar, auto-play, dots, keyboard nav
 */
(function() {
  'use strict';

  let galleryScene = null;
  let slidesContainer = null;
  let slides = [];
  let dotsContainer = null;
  let progressBar = null;
  let prevBtn = null;
  let nextBtn = null;
  
  let currentIndex = 0;
  let totalSlides = 0;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = null;
  let autoPlayTimer = null;
  let progressTimer = null;
  const SLIDE_DURATION = 5000; // 5 วินาทีต่อรูป

  /**
   * Initialize Gallery
   */
  function initGalleryScene() {
    galleryScene = document.getElementById('gallery-scene');
    if (!galleryScene || galleryScene.dataset.inited === 'true') return;
    
    galleryScene.dataset.inited = 'true';
    console.log('🖼️ Gallery Scene Initializing...');

    slidesContainer = document.getElementById('gallery-slides');
    if (!slidesContainer) return;

    slides = slidesContainer.querySelectorAll('.gallery-slide');
    totalSlides = slides.length;
    if (totalSlides === 0) return;

    dotsContainer = document.getElementById('gallery-dots');
    progressBar = document.getElementById('gallery-progress');
    prevBtn = galleryScene.querySelector('.gallery-prev');
    nextBtn = galleryScene.querySelector('.gallery-next');

    setupDOM();
    initTouch();
    initControls();
    initAutoPlay();
    initPetals();
    initEntryAnimation();
    initParallaxBackground();

    console.log('✅ Gallery Scene Ready');
  }

  /**
   * Setup DOM Elements (Dots, Active State, Progress)
   */
  function setupDOM() {
    if (dotsContainer && dotsContainer.children.length === 0) {
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = `gallery-dot${i === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `ไปภาพที่ ${i + 1}`);
        dot.setAttribute('tabindex', '0');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }

    updateSlideState(0);
    updateProgress(0);
  }

  /**
   * Update Slide State (Active, Caption, Dots)
   */
  function updateSlideState(index) {
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
    const offset = -currentIndex * 100;
    
    slidesContainer.style.transform = `translateX(${offset}%)`;
    
    slides.forEach((slide, i) => slide.classList.toggle('active', i === currentIndex));
    
    document.querySelectorAll('.gallery-dot').forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    
    updateProgress(0);
    resetAutoPlay();
  }

  /**
   * Update Progress Bar
   */
  function updateProgress(percent) {
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
  }

  /**
   * Touch/Swipe Handling (Mobile Optimized)
   */
  function initTouch() {
    slidesContainer.addEventListener('touchstart', startDrag, { passive: true });
    slidesContainer.addEventListener('touchmove', drag, { passive: false });
    slidesContainer.addEventListener('touchend', endDrag);
    
    slidesContainer.addEventListener('mousedown', startDrag);
    slidesContainer.addEventListener('mousemove', drag);
    slidesContainer.addEventListener('mouseup', endDrag);
    slidesContainer.addEventListener('mouseleave', endDrag);

    slidesContainer.addEventListener('dragstart', e => e.preventDefault());
  }

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  function startDrag(e) {
    isDragging = true;
    startX = getPositionX(e);
    prevTranslate = slidesContainer.getBoundingClientRect().width * (-currentIndex);
    currentTranslate = prevTranslate;
    cancelAutoPlay();
    slidesContainer.style.transition = 'none';
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentX = getPositionX(e);
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
    
    const maxTranslate = 20;
    const minTranslate = -(totalSlides - 1) * slidesContainer.getBoundingClientRect().width - 20;
    if (currentTranslate > maxTranslate) currentTranslate = maxTranslate + (currentTranslate - maxTranslate) * 0.3;
    if (currentTranslate < minTranslate) currentTranslate = minTranslate + (currentTranslate - minTranslate) * 0.3;
    
    slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    slidesContainer.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    const movedBy = currentTranslate - prevTranslate;
    const threshold = slidesContainer.getBoundingClientRect().width * 0.2;
    
    if (movedBy < -threshold && currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    } else if (movedBy > threshold && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(currentIndex);
    }
    resetAutoPlay();
  }

  /**
   * Navigation
   */
  function goToSlide(index) {
    updateSlideState(index);
  }

  function nextSlide() {
    goToSlide(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0);
  }

  function prevSlide() {
    goToSlide(currentIndex > 0 ? currentIndex - 1 : totalSlides - 1);
  }

  /**
   * Auto Play & Progress
   */
  function initAutoPlay() {
    startAutoPlay();
    
    galleryScene.addEventListener('mouseenter', cancelAutoPlay);
    galleryScene.addEventListener('mouseleave', resetAutoPlay);
    galleryScene.addEventListener('touchstart', cancelAutoPlay, { passive: true });
    galleryScene.addEventListener('touchend', resetAutoPlay);
  }

  function startAutoPlay() {
    cancelAutoPlay();
    let elapsed = 0;
    const step = 50;
    
    progressTimer = setInterval(() => {
      elapsed += step;
      const percent = (elapsed / SLIDE_DURATION) * 100;
      updateProgress(Math.min(percent, 100));
      
      if (elapsed >= SLIDE_DURATION) {
        nextSlide();
        elapsed = 0;
      }
    }, step);
  }

  function cancelAutoPlay() {
    clearInterval(progressTimer);
    progressTimer = null;
    updateProgress(0);
  }

  function resetAutoPlay() {
    cancelAutoPlay();
    startAutoPlay();
  }

  /**
   * Controls & Keyboard
   */
  function initControls() {
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    slidesContainer.setAttribute('tabindex', '0');
    slidesContainer.setAttribute('role', 'region');
    slidesContainer.setAttribute('aria-roledescription', 'carousel');
    slidesContainer.setAttribute('aria-label', 'แกลเลอรี่ภาพความทรงจำ');
    
    slidesContainer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
    });
  }

  /**
   * Background Petals
   */
  function initPetals() {
    const container = galleryScene.querySelector('.gallery-petals');
    if (!container) return;
    
    const count = window.innerWidth < 768 ? 8 : 12;
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'gallery-petal';
      petal.style.left = Math.random() * 100 + '%';
      petal.style.animationDelay = Math.random() * 10 + 's';
      petal.style.animationDuration = (20 + Math.random() * 12) + 's';
      petal.style.width = (12 + Math.random() * 12) + 'px';
      petal.style.height = petal.style.width;
      
      const colors = ['rgba(255,255,255,0.6)', 'rgba(184,205,222,0.4)', 'rgba(212,175,55,0.3)'];
      petal.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]} 0%, transparent 70%)`;
      
      container.appendChild(petal);
    }
  }

  /**
   * Entry Animation
   */
  function initEntryAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const header = galleryScene.querySelector('.section-header');
          if (header) setTimeout(() => header.classList.add('animate-in'), 150);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(galleryScene);
  }

  /**
   * Parallax Effect on Background
   */
  function initParallaxBackground() {
    const bgImg = galleryScene?.querySelector('.gallery-bg-img');
    if (!bgImg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = galleryScene.getBoundingClientRect();
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

  // Cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAutoPlay();
    else resetAutoPlay();
  });

  /**
   * Public API
   */
  window.initGalleryScene = initGalleryScene;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryScene);
  } else {
    initGalleryScene();
  }

})();