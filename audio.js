/* CEO od Zla // §35 AudioController */
/* global S, gainXP, addLog, addItem, hasItem, showNotif, Renderer, GameConfig, switchView */

/**
 * AudioController — riadi background music (homebase.mp3 loop)
 */
var AudioController = (function() {
  var STORAGE_KEY = 'lazarus_audio_v1';
  var audio       = null;
  var slider      = null;
  var label       = null;
  var btn         = null;
  var wave        = null;
  var overlay     = null;
  var state = {
    volume:   0.35,   // 0..1
    muted:    false,
    started:  false   // user už spustil audio (autoplay unlocked)
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (typeof s.volume === 'number') state.volume = Math.max(0, Math.min(1, s.volume));
        if (typeof s.muted === 'boolean') state.muted = s.muted;
      }
    } catch (e) { /* localStorage may be blocked */ }
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        volume: state.volume, muted: state.muted
      }));
    } catch (e) {}
  }

  function applyVolume() {
    if (!audio) return;
    audio.volume = state.muted ? 0 : state.volume;
  }

  function updateUI() {
    if (slider) {
      slider.value = Math.round(state.volume * 100);
      // Background fill for slider track
      var pct = state.muted ? 0 : Math.round(state.volume * 100);
      slider.style.backgroundSize = pct + '% 100%';
    }
    if (label) {
      label.textContent = state.muted ? 'MUTE' : (Math.round(state.volume * 100) + '%');
    }
    if (btn) {
      var icon = '🔊';
      if (state.muted || state.volume === 0) icon = '🔇';
      else if (state.volume < 0.33) icon = '🔈';
      else if (state.volume < 0.66) icon = '🔉';
      btn.textContent = icon;
      btn.classList.toggle('muted', state.muted || state.volume === 0);
      var playing = audio && !audio.paused && !state.muted && state.volume > 0;
      btn.classList.toggle('playing', !!playing);
      if (wave) wave.classList.toggle('paused', !playing);
    }
  }

  function tryPlay() {
    if (!audio) return;
    var p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(function() {
        state.started = true;
        if (overlay) overlay.classList.remove('show');
        updateUI();
      }).catch(function() {
        // autoplay blocked → ukážeme overlay
        if (!state.started && !state.muted) showOverlay();
      });
    }
  }

  function showOverlay() {
    if (overlay) overlay.classList.add('show');
  }

  /** Public API */
  return {
    init: function() {
      audio   = document.getElementById('bg-music');
      slider  = document.getElementById('volume-slider');
      label   = document.getElementById('volume-label');
      btn     = document.getElementById('audio-toggle-btn');
      wave    = document.getElementById('audio-wave');
      overlay = document.getElementById('audio-init-overlay');
      if (!audio) return;

      load();
      applyVolume();
      updateUI();

      // Skús automaticky spustiť — väčšinou padne na autoplay-policy,
      // ale ak používateľ ostane na záložke a klikne hocikde,
      // odchytíme to nižšie cez first-click handler.
      tryPlay();

      // Backup: prvý klik kdekoľvek odomkne audio
      var unlock = function() {
        if (!state.started && audio.paused && !state.muted) {
          tryPlay();
        }
        if (state.started) {
          document.removeEventListener('click', unlock, true);
          document.removeEventListener('keydown', unlock, true);
          document.removeEventListener('touchstart', unlock, true);
        }
      };
      document.addEventListener('click', unlock, true);
      document.addEventListener('keydown', unlock, true);
      document.addEventListener('touchstart', unlock, true);

      audio.addEventListener('play',  updateUI);
      audio.addEventListener('pause', updateUI);
      audio.addEventListener('ended', updateUI);
      audio.addEventListener('error', function(){
        // Skús fallback z GitHub raw URL
        console.warn('[Audio] failed to load homebase.mp3 from primary source, trying fallback');
      });
    },

    setVolume: function(v) {
      var n = Math.max(0, Math.min(100, parseFloat(v) || 0));
      state.volume = n / 100;
      // Pri pohybe slidera automaticky odznieš mute ak nie je 0
      if (n > 0 && state.muted) state.muted = false;
      if (n === 0) state.muted = true;
      applyVolume();
      // Ak je hudba paused a používateľ posunul slider hore, skús prehrať
      if (audio && audio.paused && !state.muted && state.volume > 0 && state.started) {
        tryPlay();
      }
      updateUI();
      save();
    },

    toggle: function() {
      state.muted = !state.muted;
      if (state.muted) {
        if (audio) audio.pause();
      } else {
        if (state.volume === 0) state.volume = 0.35;
        applyVolume();
        tryPlay();
      }
      applyVolume();
      updateUI();
      save();
    },

    /** Volané z audio-init-overlay */
    userStart: function() {
      state.muted = false;
      applyVolume();
      tryPlay();
      if (overlay) overlay.classList.remove('show');
      updateUI();
    }
  };
})();

// Init audio system po načítaní DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){ AudioController.init(); });
} else {
  AudioController.init();
}
