/**
 * Utility Functions
 * Helper functions used across the application
 */

const Utils = {
  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success, error, info)
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 3000);
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('คัดลอกเรียบร้อยแล้ว', 'success');
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('คัดลอกเรียบร้อยแล้ว', 'success');
      return true;
    }
  },

  /**
   * Create floating petals
   * @param {HTMLElement} container - Container element
   * @param {number} count - Number of petals
   */
  createFloatingPetals(container, count = 15) {
    if (!container) return;

    const colors = [
      'rgba(255, 255, 255, 0.6)',
      'rgba(184, 205, 222, 0.5)',
      'rgba(255, 182, 193, 0.5)',
      'rgba(255, 218, 185, 0.5)'
    ];

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      petal.style.left = Math.random() * 100 + '%';
      petal.style.animationDelay = Math.random() * 15 + 's';
      petal.style.animationDuration = (12 + Math.random() * 10) + 's';

      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      petal.style.background = `radial-gradient(circle, ${randomColor} 0%, transparent 70%)`;

      const size = 15 + Math.random() * 20;
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';

      container.appendChild(petal);
    }
  },

  /**
   * Create sparkles effect
   * @param {HTMLElement} container - Container element
   * @param {number} count - Number of sparkles
   */
  createSparkles(container, count = 30) {
    if (!container) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        const angle = (Math.PI * 2 * i) / count;
        const radius = 200 + Math.random() * 100;
        const x = 250 + Math.cos(angle) * radius;
        const y = 250 + Math.sin(angle) * radius;

        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.width = (5 + Math.random() * 10) + 'px';
        sparkle.style.height = sparkle.style.width;

        container.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1000);
      }, i * 50);
    }
  },

  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean}
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Format date to Thai format
   * @param {Date|string} date - Date to format
   * @returns {string}
   */
  formatThaiDate(date) {
    const d = new Date(date);
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const days = [
      'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
    ];

    const dayName = days[d.getDay()];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543; // Convert to Buddhist Era

    return `${dayName}ที่ ${day} ${month} พ.ศ. ${year}`;
  },

  /**
   * Play sound effect
   * @param {string} type - Type of sound
   */
  playSound(type) {
    const sounds = {
      open: new Audio('assets/sounds/open.mp3'),
      pop: new Audio('assets/sounds/pop.mp3'),
      whoosh: new Audio('assets/sounds/whoosh.mp3')
    };

    if (sounds[type]) {
      sounds[type].volume = 0.4;
      sounds[type].play().catch(() => {
        // Ignore error if audio not found or autoplay blocked
      });
    }
  }
};

// Make Utils available globally
window.Utils = Utils;