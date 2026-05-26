(function () {
    'use strict';

    const WeddingApp = {

        config: {
            scenes: [
                'envelope',
                'couple-reveal',
                'hero',
                'countdown',
                'gallery',
                'schedule',
                'theme',
                'location',
                'rsvp',
                'thanks',
                'ending'
            ]
        },

        currentScene: 'envelope',
        envelopeOpened: false,
        _scrollLocked: false,

        async init() {
            console.log('🎊 Wedding App Initializing...');
            await this.waitForReady();

            // ✅ ใช้ CSS class แทน inline style เพื่อความเสถียรบน iOS
            this._lockEnvelope();
            this._initIntersection();
            this._initKeyboard();
            this._initRestartBtn();
            this._initTouchFix(); // ✅ เพิ่ม: แก้ไขปัญหาแตะยากบน iOS

            this._initSceneOnce('envelope');
            console.log('✅ Wedding App Ready!');
        },

        async waitForReady() {
            if (document.readyState === 'loading') {
                await new Promise(r => document.addEventListener('DOMContentLoaded', r));
            }
            if (typeof gsap === 'undefined') {
                await new Promise(r => {
                    const check = () => typeof gsap !== 'undefined' ? r() : setTimeout(check, 50);
                    check();
                });
            }
        },

        /* ───────── iOS Touch Fix (แก้แตะยาก/เลื่อนสะดุด) ───────── */
        _initTouchFix() {
            // ✅ ปิดการบล็อกการเลื่อนบนปุ่ม/ลิงก์ที่ไม่จำเป็น
            document.addEventListener('touchstart', function() {}, { passive: true });
            
            // ✅ ป้องกันการซูมเมื่อแตะดับเบิลบนไอโฟน
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function(event) {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, { passive: false });
        },

        /* ───────── Envelope Lock (iOS-friendly) ───────── */
        _lockEnvelope() {
            this._scrollLocked = true;
            document.body.classList.add('lock-envelope');
            // ✅ ไม่ใช้ style.overflow = hidden โดยตรง เพราะขัดกับ iOS scroll engine
            console.log('🔒 Envelope locked');
        },

        unlockScroll() {
            this.envelopeOpened = true;
            this._scrollLocked = false;
            document.body.classList.remove('lock-envelope');
            
            console.log('🔓 Scroll unlocked');

            // ✅ ใช้ setTimeout 0 ให้ตรงกับ event loop ของ iOS
            setTimeout(() => {
                const scene2 = this._sceneEl('couple-reveal');
                if (!scene2) return;

                // ✅ วิธีที่เสถียรสุดบน iOS: ใช้ scrollIntoView แบบไม่ smooth ก่อน แล้วค่อย smooth
                scene2.scrollIntoView({ behavior: 'auto', block: 'start' });
                
                // ค่อยๆ เลื่อนนุ่มนวลหลังจากนั้น (ถ้าต้องการ)
                setTimeout(() => {
                    if (CSS.supports('scroll-behavior', 'smooth')) {
                        scene2.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
                
                console.log('📜 Jumped to couple-reveal');
            }, 0);
        },

        /* ───────── Intersection Observer (ติดตามซีนปัจจุบัน) ───────── */
        _initIntersection() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // ✅ เพิ่ม threshold ให้สูงขึ้นเพื่อลดการยิงซ้ำบน iOS
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                        const sceneName = entry.target.dataset.scene;
                        if (sceneName && sceneName !== this.currentScene) {
                            this._onSceneEnter(sceneName);
                        }
                    }
                });
            }, {
                threshold: [0.5, 0.6, 0.7], // ✅ Multiple thresholds สำหรับ iOS
                rootMargin: '-10% 0px -10% 0px'
            });

            this.config.scenes.forEach(name => {
                const el = this._sceneEl(name);
                if (el) observer.observe(el);
            });

            this._observer = observer;
        },

        _onSceneEnter(sceneName) {
            const prev = this.currentScene;
            this.currentScene = sceneName;
            document.body.dataset.currentScene = sceneName;

            const prevEl = this._sceneEl(prev);
            const nextEl = this._sceneEl(sceneName);
            if (prevEl) prevEl.classList.remove('scene-active');
            if (nextEl) nextEl.classList.add('scene-active');

            this._initSceneOnce(sceneName);
            console.log(`✅ Scene entered: ${sceneName}`);
        },

        /* ───────── Prevent Scroll Back (iOS-safe version) ───────── */
        _preventBackToEnvelope() {
            const scene2 = this._sceneEl('couple-reveal');
            if (!scene2) return;

            // ✅ ใช้ throttled scroll handler แทนการดักทุกเฟรม
            let ticking = false;
            const floor = scene2.offsetTop;

            window.addEventListener('scroll', () => {
                if (!this.envelopeOpened || !this._scrollLocked) return;
                
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        const current = window.scrollY || document.documentElement.scrollTop;
                        
                        // ✅ เพิ่ม buffer zone 50px เพื่อไม่ให้ขัดกับ native scroll
                        if (current < floor - 50) {
                            // ✅ ใช้ scrollIntoView แทนการตั้งค่าตรงๆ เพื่อความนุ่มนวล
                            scene2.scrollIntoView({ behavior: 'auto', block: 'start' });
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true }); // ✅ passive: true สำคัญมากสำหรับ iOS performance
        },

        /* ───────── Init Scene Once ───────── */
        _initSceneOnce(sceneName) {
            const scene = this._sceneEl(sceneName);
            if (!scene || scene.dataset.inited === 'true') return;
            scene.dataset.inited = 'true';

            const fnName = 'init' + this._pascalCase(sceneName) + 'Scene';
            const fn = window[fnName];
            if (typeof fn === 'function') {
                // ✅ ใช้ requestAnimationFrame แทน setTimeout สำหรับความเสถียรบนมือถือ
                requestAnimationFrame(() => {
                    try { 
                        fn(); 
                        console.log(`✅ ${fnName}()`); 
                    }
                    catch (e) { console.error(`❌ ${fnName}():`, e); }
                });
            }
        },

        /* ───────── Navigation ───────── */
        goToScene(name) {
            const el = this._sceneEl(name);
            if (el) {
                // ✅ ใช้ behavior: 'smooth' เฉพาะเมื่อผู้ใช้กดปุ่ม ไม่ใช่จากการเลื่อน
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },

        nextScene() {
            const idx = this.config.scenes.indexOf(this.currentScene);
            if (idx < this.config.scenes.length - 1) {
                this.goToScene(this.config.scenes[idx + 1]);
            }
        },

        prevScene() {
            if (!this.envelopeOpened) return;
            const idx = this.config.scenes.indexOf(this.currentScene);
            if (idx > 1) {
                this.goToScene(this.config.scenes[idx - 1]);
            }
        },

        /* ───────── Keyboard ───────── */
        _initKeyboard() {
            document.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                switch (e.key) {
                    case 'ArrowDown': case 'PageDown': case ' ':
                        e.preventDefault(); this.nextScene(); break;
                    case 'ArrowUp': case 'PageUp':
                        e.preventDefault(); this.prevScene(); break;
                }
            });
        },

        _initRestartBtn() {
            const btn = document.getElementById('btn-restart');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.goToScene('couple-reveal');
                });
                // ✅ เพิ่ม touch support สำหรับปุ่มบนมือถือ
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.goToScene('couple-reveal');
                });
            }
        },

        /* ───────── Utils ───────── */
        _sceneEl(name) {
            return document.querySelector(`[data-scene="${name}"]`);
        },

        _pascalCase(str) {
            return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
                .replace(/^./, c => c.toUpperCase());
        },

        getCurrentScene() { return this.currentScene; },
        isSceneActive(n) { return this.currentScene === n; },
    };

    window.WeddingApp = WeddingApp;
    window.app = WeddingApp;

    // ✅ ใช้ DOMContentLoaded แทน load เพื่อเริ่มทำงานเร็วขึ้นบนมือถือ
    if (document.readyState !== 'loading') {
        WeddingApp.init();
    } else {
        document.addEventListener('DOMContentLoaded', () => WeddingApp.init());
    }
})();