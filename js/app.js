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
        envelopeOpened: false,  // ✅ ติดตามว่าเปิดซองแล้วหรือยัง

        async init() {
            console.log('🎊 Wedding App Initializing...');
            await this.waitForReady();

            this._lockEnvelope();        // ✅ ล็อค scroll ไว้ก่อน
            this._initIntersection();    // ✅ ติดตามว่าอยู่ซีนไหน
            this._initKeyboard();
            this._initRestartBtn();

            // ✅ Init ซีน 1 ทันที
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

        /* ───────── Envelope Lock ───────── */
        _lockEnvelope() {
            document.body.classList.add('lock-envelope');
            document.body.style.overflow = 'hidden';
            console.log('🔒 Envelope locked');
        },

        // ✅ เรียกจาก envelope.js เมื่อเปิดซองแล้ว
        unlockScroll() {
    this.envelopeOpened = true;
    document.body.classList.remove('lock-envelope');
    document.body.classList.remove('no-scroll');
    document.body.style.overflow = '';
    document.body.style.height = '';

    console.log('🔓 Scroll unlocked');

    // ✅ รอให้ browser repaint เสร็จก่อน (setTimeout 0 แทน rAF)
    setTimeout(() => {
        const scene2 = this._sceneEl('couple-reveal');
        if (!scene2) return;

        // ✅ วิธีที่แน่นอนที่สุด: set scrollTop ตรงๆ แทน scrollIntoView
        const top = scene2.offsetTop;
        document.documentElement.scrollTop = top;
        document.body.scrollTop = top; // Safari
        
        console.log('📜 Jumped to couple-reveal, offsetTop:', top);
    }, 50);
},

        /* ───────── Intersection Observer (ติดตามซีนปัจจุบัน) ───────── */
        _initIntersection() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        const sceneName = entry.target.dataset.scene;
                        if (sceneName && sceneName !== this.currentScene) {
                            this._onSceneEnter(sceneName);
                        }
                    }
                });
            }, {
                threshold: 0.1,
                root: null
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

            // ✅ อัปเดต active class
            const prevEl = this._sceneEl(prev);
            const nextEl = this._sceneEl(sceneName);
            if (prevEl) prevEl.classList.remove('scene-active');
            if (nextEl) nextEl.classList.add('scene-active');

            // ✅ Init scene ครั้งแรกที่เข้า
            this._initSceneOnce(sceneName);

            console.log(`✅ Scene entered: ${sceneName}`);
        },

        /* ───────── Prevent Scroll Back to Envelope ───────── */
        _preventBackToEnvelope() {
    // ✅ ใช้ scroll event ตรวจ แทน IntersectionObserver
    // เพราะ IO ยิงตอนโหลดหน้าด้วย ทำให้สับสน
    const scene1 = this._sceneEl('envelope');
    const scene2 = this._sceneEl('couple-reveal');
    if (!scene1 || !scene2) return;

    window.addEventListener('scroll', () => {
        if (!this.envelopeOpened) return;
        
        // ถ้า scroll position น้อยกว่า offsetTop ของซีน 2 = กำลังจะกลับซีน 1
        const floor = scene2.offsetTop;
        const current = window.scrollY || document.documentElement.scrollTop;
        
        if (current < floor - 10) {
            document.documentElement.scrollTop = floor;
            document.body.scrollTop = floor;
        }
    }, { passive: true });
},

        /* ───────── Init Scene Once ───────── */
        _initSceneOnce(sceneName) {
            const scene = this._sceneEl(sceneName);
            if (!scene || scene.dataset.inited === 'true') return;
            scene.dataset.inited = 'true';

            const fnName = 'init' + this._pascalCase(sceneName) + 'Scene';
            const fn = window[fnName];
            if (typeof fn === 'function') {
                setTimeout(() => {
                    try { fn(); console.log(`✅ ${fnName}()`); }
                    catch (e) { console.error(`❌ ${fnName}():`, e); }
                }, 100);
            }
        },

        /* ───────── Navigation (ยังใช้ได้สำหรับ keyboard/button) ───────── */
        goToScene(name) {
            const el = this._sceneEl(name);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        },

        nextScene() {
            const idx = this.config.scenes.indexOf(this.currentScene);
            if (idx < this.config.scenes.length - 1) {
                this.goToScene(this.config.scenes[idx + 1]);
            }
        },

        prevScene() {
            if (!this.envelopeOpened) return; // ✅ ห้ามกลับซีน 1
            const idx = this.config.scenes.indexOf(this.currentScene);
            // ✅ floor ที่ซีน 2 (index 1)
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
                    // ✅ restart = กลับซีน 2 (ไม่ใช่ซีน 1)
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

    if (document.readyState === 'complete') {
        WeddingApp.init();
    } else {
        window.addEventListener('load', () => WeddingApp.init());
    }
})();