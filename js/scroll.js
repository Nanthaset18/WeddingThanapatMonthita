(function () {
    'use strict';

    // ✅ scroll.js ทำแค่ Lenis smooth scroll
    // Scene navigation ย้ายไปที่ app.js + CSS scroll-snap แล้ว
    
    const ScrollManager = {
        init() {
            // Lenis ไม่ compatible กับ scroll-snap ดีนัก
            // ใช้ CSS scroll-behavior: smooth แทน
            console.log('✅ ScrollManager: using native smooth scroll');
        },
        
        scrollTo(target) {
            const el = typeof target === 'string' ? document.querySelector(target) : target;
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    window.ScrollManager = ScrollManager;
    document.addEventListener('DOMContentLoaded', () => ScrollManager.init());
})();