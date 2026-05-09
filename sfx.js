/* CEO od Zla // §40 SoundFX */
/* global S, gainXP, addLog, addItem, hasItem, showNotif, Renderer, GameConfig, switchView */

var SoundFX = (function() {
  var ctx = null;
  var masterGain = null;
  var STORAGE_KEY = 'lazarus_sfx_v1';
  var state = {
    volume: 0.4,
    muted:  false,
    initialized: false
  };

  function _init() {
    if (state.initialized) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = state.muted ? 0 : state.volume;
      masterGain.connect(ctx.destination);
      state.initialized = true;
    } catch(e) {
      console.warn('[SoundFX] Web Audio not available:', e);
    }
  }
  function _load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (typeof s.volume === 'number') state.volume = s.volume;
        if (typeof s.muted === 'boolean') state.muted = s.muted;
      }
    } catch(e) {}
  }
  function _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: state.volume, muted: state.muted })); } catch(e){}
  }

  // ── Sound primitives (low-level building blocks) ─────
  function _beep(freq, dur, type, gain, attack, release) {
    if (!ctx) return;
    type = type || 'sine';
    gain = gain != null ? gain : 0.3;
    attack = attack != null ? attack : 0.005;
    release = release != null ? release : 0.05;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    var t0 = ctx.currentTime;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.01);
  }
  function _slide(fromHz, toHz, dur, type, gain) {
    if (!ctx) return;
    type = type || 'sawtooth';
    gain = gain != null ? gain : 0.2;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type;
    var t0 = ctx.currentTime;
    osc.frequency.setValueAtTime(fromHz, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, toHz), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.01);
  }
  function _noise(dur, gain, hp) {
    if (!ctx) return;
    gain = gain != null ? gain : 0.1;
    var bufferSize = Math.floor(ctx.sampleRate * dur);
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i/bufferSize);
    var src = ctx.createBufferSource();
    src.buffer = buffer;
    var g = ctx.createGain();
    g.gain.value = gain;
    var filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hp || 800;
    src.connect(filter); filter.connect(g); g.connect(masterGain);
    src.start(ctx.currentTime);
  }

  // ── Sound presets ───────────────────────────────────
  var SOUNDS = {
    click:       function(){ _beep(880, 0.04, 'square', 0.18, 0.001, 0.04); },
    hover:       function(){ _beep(1200, 0.025, 'sine', 0.08, 0.001, 0.025); },
    confirm:     function(){ _slide(600, 1200, 0.12, 'square', 0.15); },
    cancel:      function(){ _slide(800, 300, 0.15, 'triangle', 0.18); },
    error:       function(){ _beep(150, 0.15, 'sawtooth', 0.25); _beep(140, 0.18, 'square', 0.15); },
    success:     function(){
                    _beep(523.25, 0.08, 'square', 0.18);  // C5
                    setTimeout(function(){ _beep(659.25, 0.08, 'square', 0.18); }, 80);  // E5
                    setTimeout(function(){ _beep(783.99, 0.16, 'square', 0.18); }, 160); // G5
                  },
    sceneChange: function(){
                    _noise(0.15, 0.05, 600);
                    _slide(1800, 600, 0.18, 'sawtooth', 0.1);
                  },
    sceneOpen:   function(){
                    _slide(400, 800, 0.25, 'sine', 0.08);
                  },
    levelUp:     function(){
                    _beep(523.25, 0.1, 'square', 0.2);
                    setTimeout(function(){ _beep(659.25, 0.1, 'square', 0.2); }, 100);
                    setTimeout(function(){ _beep(783.99, 0.1, 'square', 0.2); }, 200);
                    setTimeout(function(){ _beep(1046.5, 0.3, 'square', 0.2); }, 300);
                  },
    coin:        function(){
                    _beep(1318.5, 0.08, 'square', 0.18);
                    setTimeout(function(){ _beep(1567.98, 0.16, 'square', 0.18); }, 80);
                  },
    factionJoin: function(){
                    _slide(200, 800, 0.4, 'sawtooth', 0.12);
                    setTimeout(function(){
                      _beep(523.25, 0.1, 'square', 0.18);
                      setTimeout(function(){ _beep(659.25, 0.1, 'square', 0.18); }, 100);
                      setTimeout(function(){ _beep(987.77, 0.25, 'square', 0.22); }, 200);
                    }, 350);
                  },
    hackTick:    function(){ _beep(2400, 0.015, 'square', 0.06); },
    hackBoom:    function(){
                    _noise(0.08, 0.15, 200);
                    _slide(80, 200, 0.3, 'sawtooth', 0.18);
                  },
    gameOver:    function(){
                    _slide(440, 80, 1.2, 'sawtooth', 0.2);
                  },
    money:       function(){ _beep(880, 0.04, 'square', 0.12); _beep(1320, 0.08, 'square', 0.1); },
    notif:       function(){ _beep(1200, 0.04, 'sine', 0.12); _beep(1500, 0.06, 'sine', 0.1); },
    questAccept: function(){
                    _beep(440, 0.08, 'square', 0.16);
                    setTimeout(function(){ _beep(660, 0.16, 'square', 0.18); }, 80);
                  },
    mapOpen:     function(){
                    _slide(300, 1200, 0.3, 'sine', 0.1);
                  },
    mapTravel:   function(){
                    _noise(0.2, 0.06, 1000);
                    _slide(800, 200, 0.4, 'sawtooth', 0.08);
                  }
  };

  // ── Public API ──────────────────────────────────────
  function play(name) {
    if (state.muted || state.volume <= 0) return;
    if (!state.initialized) _init();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    var fn = SOUNDS[name];
    if (fn) try { fn(); } catch(e){ console.warn('[SoundFX]', name, e); }
  }
  function setVolume(v) {
    state.volume = Math.max(0, Math.min(1, v));
    if (state.volume > 0) state.muted = false;
    if (masterGain) masterGain.gain.value = state.muted ? 0 : state.volume;
    _save();
  }
  function mute(){ state.muted = true; if (masterGain) masterGain.gain.value = 0; _save(); }
  function unmute(){ state.muted = false; if (masterGain) masterGain.gain.value = state.volume; _save(); }
  function toggle(){ state.muted ? unmute() : mute(); }
  function isMuted(){ return state.muted; }
  function getVolume(){ return state.volume; }

  // ── Init: po prvom user gesture (browser policy) ────
  function init() {
    _load();
    var unlock = function(){
      _init();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
    document.addEventListener('click', unlock, true);
    document.addEventListener('keydown', unlock, true);
    document.addEventListener('touchstart', unlock, true);
  }

  // ── Auto-bind klikov a hoverov na všetky tlačidlá ───
  function autoBind() {
    // Click sounds — všetky tlačidlá v hre
    document.addEventListener('click', function(e){
      var btn = e.target.closest('button, .choice-btn, .nav-card, .faction-card-btn, .stocks-btn, .deal-action-btn, .bj-btn, .slots-spin-btn, .city-loc');
      if (!btn) return;
      // Špecifické tlačidlá majú vlastný zvuk
      if (btn.classList.contains('city-loc')) return; // map travel sound zaznie v CityMap
      if (btn.classList.contains('deal-action-btn')) { play('confirm'); return; }
      if (btn.classList.contains('slots-spin-btn')) { play('hackTick'); return; }
      if (btn.classList.contains('bj-btn')) { play('click'); return; }
      // Default
      play('click');
    }, true);

    // Hover sounds — iba na výraznejších elementoch (príliš veľa hover sounds = annoying)
    var lastHoverTime = 0;
    document.addEventListener('mouseenter', function(e){
      if (!e.target || !e.target.matches) return;
      if (!e.target.matches('.choice-btn, .nav-card, .faction-card, .city-loc')) return;
      var now = Date.now();
      if (now - lastHoverTime < 50) return;  // throttle
      lastHoverTime = now;
      play('hover');
    }, true);

    // Click ripple effect
    document.addEventListener('click', function(e){
      var r = document.createElement('div');
      r.className = 'click-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(function(){ r.remove(); }, 500);
    });
  }

  return {
    init: init,
    autoBind: autoBind,
    play: play,
    setVolume: setVolume,
    getVolume: getVolume,
    mute: mute,
    unmute: unmute,
    toggle: toggle,
    isMuted: isMuted
  };
})();

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){
    SoundFX.init();
    setTimeout(function(){ SoundFX.autoBind(); }, 500);
  });
} else {
  SoundFX.init();
  setTimeout(function(){ SoundFX.autoBind(); }, 500);
}
