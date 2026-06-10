/**
 * Background Music Controller - Auto-Play Support
 * Handles: Play/Pause, iOS compatibility, volume, user preference, auto-play after envelope open
 */
(function() {
  'use strict';

  const MusicPlayer = {
    audio: null,
    btn: null,
    isPlaying: false,
    volume: 0.5,
    autoPlayAttempted: false,

    init() {
      this.audio = document.getElementById('bg-music');
      this.btn = document.getElementById('music-toggle');
      
      if (!this.audio || !this.btn) {
        console.warn('🎵 Music elements not found');
        return;
      }

      // ตั้งค่าเริ่มต้น
      this.audio.volume = this.volume;
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.load();

      // Event listeners สำหรับปุ่ม
      this.btn.addEventListener('click', () => this.toggle());
      this.btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.toggle();
      }, { passive: false });

      // อัพเดทสถานะจาก audio element
      this.audio.addEventListener('play', () => this.updateState(true));
      this.audio.addEventListener('pause', () => this.updateState(false));
      this.audio.addEventListener('ended', () => this.updateState(false));
      this.audio.addEventListener('error', (e) => {
        console.error('🎵 Audio error:', e);
        this.btn.disabled = true;
        this.btn.title = 'โหลดเพลงไม่สำเร็จ';
        if (typeof Utils !== 'undefined') {
          Utils.showToast('ไม่สามารถเล่นเพลงได้', 'error');
        }
      });

      // โหลดการตั้งค่าที่เคยบันทึกไว้
      this.checkSavedPreference();

      console.log('🎵 Music Player Ready');
    },

    /**
     * ✅ ฟังก์ชันหลัก: เล่นเพลง (เรียกจากภายนอกได้)
     */
    async play() {
      if (!this.audio) return false;
      
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.savePreference(true);
        console.log('🎵 Playing');
        return true;
      } catch (err) {
        console.warn('🎵 Play failed:', err.message);
        // ถ้าเล่นไม่สำเร็จ ให้แสดงปุ่มให้ผู้ใช้กดเอง
        if (this.btn) {
          this.btn.style.display = 'flex';
          this.btn.setAttribute('aria-pressed', 'false');
        }
        if (typeof Utils !== 'undefined') {
          Utils.showToast('กดปุ่ม 🎵 เพื่อเปิดเพลง', 'info');
        }
        return false;
      }
    },

    /**
     * หยุดเพลง
     */
    async pause() {
      if (!this.audio) return false;
      
      try {
        this.audio.pause();
        this.isPlaying = false;
        this.savePreference(false);
        console.log('🎵 Paused');
        return true;
      } catch (err) {
        console.error('🎵 Pause failed:', err);
        return false;
      }
    },

    /**
     * สลับเล่น/หยุด
     */
    async toggle() {
      if (!this.audio || !this.btn) return;

      try {
        if (this.isPlaying) {
          await this.pause();
        } else {
          await this.play();
        }
      } catch (err) {
        console.error('🎵 Toggle failed:', err);
        if (typeof Utils !== 'undefined') {
          Utils.showToast('ไม่สามารถเล่นเพลงได้', 'error');
        }
      }
    },

    /**
     * อัพเดทสถานะปุ่ม
     */
    updateState(playing) {
      this.isPlaying = playing;
      if (this.btn) {
        this.btn.setAttribute('aria-pressed', playing.toString());
        this.btn.title = playing ? 'ปิดเพลง' : 'เปิดเพลงประกอบ';
        
        const tooltip = this.btn.querySelector('.music-tooltip');
        if (tooltip) {
          tooltip.textContent = playing ? 'ปิดเพลง' : 'เปิดเพลงประกอบ';
        }
      }
    },

    /**
     * บันทึกการตั้งค่าผู้ใช้
     */
    savePreference(playing) {
      try {
        localStorage.setItem('wedding-music', playing ? '1' : '0');
      } catch (e) {
        // ข้ามถ้า localStorage ไม่พร้อม
      }
    },

    /**
     * โหลดการตั้งค่าที่เคยบันทึกไว้
     */
    checkSavedPreference() {
      try {
        const saved = localStorage.getItem('wedding-music');
        if (saved === '1') {
          // ผู้ใช้เคยเปิดเพลงไว้ → แสดงปุ่มว่า "พร้อมเล่น"
          if (this.btn) {
            this.btn.setAttribute('aria-pressed', 'true');
            this.btn.title = 'กดเพื่อเล่นเพลง';
          }
        }
      } catch (e) {
        // ข้ามถ้าอ่านไม่ได้
      }
    },

    /**
     * ตั้งระดับเสียง
     */
    setVolume(level) {
      if (this.audio) {
        this.volume = Math.max(0, Math.min(1, level));
        this.audio.volume = this.volume;
      }
    },

    /**
     * ✅ ฟังก์ชันสำหรับเรียกจาก envelope.js เพื่อเล่นอัตโนมัติหลังเปิดซอง
     */
    async playAfterEnvelopeOpen() {
      // ตรวจสอบว่าเคยพยายามเล่นอัตโนมัติแล้วหรือยัง (ป้องกันเล่นซ้ำ)
      if (this.autoPlayAttempted) return false;
      this.autoPlayAttempted = true;

      // เล่นเพลงทันที (ผู้ใช้เพิ่งแตะซอง = มี user interaction)
      const success = await this.play();
      
      // ถ้าเล่นสำเร็จ → ทำให้ปุ่มดูเนียนขึ้น (จางลงเล็กน้อย)
      if (success && this.btn) {
        setTimeout(() => {
          this.btn.style.opacity = '0.7';
          this.btn.style.transform = 'scale(0.95)';
          this.btn.title = 'เพลงกำลังเล่น - กดเพื่อปิด';
        }, 2000);
      }
      
      return success;
    },

    /**
     * แสดงปุ่มเพลง (เรียกเมื่อต้องการให้ปุ่มกลับมาชัดเจน)
     */
    showButton() {
      if (this.btn) {
        this.btn.style.opacity = '1';
        this.btn.style.transform = 'scale(1)';
      }
    }
  };

  // ✅ เริ่มต้นเมื่อพร้อม
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MusicPlayer.init());
  } else {
    MusicPlayer.init();
  }

  // ✅ ทำให้เรียกจากภายนอกได้
  window.MusicPlayer = MusicPlayer;
})();