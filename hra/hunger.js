'use strict';

/* ════════════════════════════════════════════════════════════
   MODULE: HungerSystem
   Fyzický hlad klesá pri ROZHODNUTIACH (nie čase).
   Psychická sanita klesá pasívne časom + pri voľbách.
   Závislosti: systems/state.js (S), systems/renderer.js (Renderer)
              ui/engine.js (addLog, gameOver)
   ════════════════════════════════════════════════════════════ */

var HungerSystem = (function() {

  // ── Konfigurácia (data-driven, meniť tu) ──────────────────────
  var CONFIG = {
    // FYZICKÝ HLAD — klesá pri rozhodnutiach, nie čase
    DECAY_PER_DECISION: 7,    // Hlad klesá o X za každú voľbu hráča
    DECAY_PER_MAJOR:    12,   // Hlad klesá viac za "náročné" rozhodnutia (hp/san efekty)
    DECAY_PER_ACTION:   4,    // Klesá za akcie (fishing klik, HQ aktivita)
    STARVING_HP_DMGE:   0.08, // HP strata/s keď hunger = 0 (zredukované — per tick)
    HUNGRY_THRESHOLD:   30,   // Pod tým si "hladný"
    STARVING_THRESHOLD: 10,   // Pod tým si "vyhladovaný" — HP damage

    // PSYCHICKÁ SANITY — riadená časom AJ rozhodnutiami
    SAN_TICK_DECAY:     0.04, // SAN klesá/s pasívne (pomalšie ako predtým)
    SAN_TICK_REGEN:     0.02, // SAN regen/s keď sýty (>80 hunger)
    SAN_DECISION_HIT:   2,    // SAN strata za každé morálne ťažké rozhodnutie (hp<0 choice)
    SAN_DECISION_BOOST: 1,    // SAN zisk za každé pozitívne rozhodnutie (xp voľby)
    SAN_HUNGRY_MULT:    1.5,  // Násobič SAN straty keď hladný

    // HP regen
    HP_REGEN_FULL:      0.015, // HP regen/s keď sýty
    MAX_HUNGER:         100,
  };

  // ── Stavy hladu pre UI display ────────────────────────────────
  var HUNGER_STATES = [
    { min: 80, label: 'Sýty',          color: '#39ff14', icon: '🟢', effect: '+HP regen, +SAN' },
    { min: 55, label: 'Dobre',         color: '#4ade80', icon: '🟡', effect: 'Normálne' },
    { min: 35, label: 'Hladný',        color: '#f59e0b', icon: '🟠', effect: '-SAN zrýchlená' },
    { min: 10, label: 'Veľmi hladný',  color: '#ef4444', icon: '🔴', effect: '-SAN + -HP pomaly' },
    { min:  0, label: 'Vyhladovaný!',  color: '#dc2626', icon: '💀', effect: '-HP každý tick!' },
  ];

  // ── Interný counter rozhodnutí (reset pri jedle) ──────────────
  var _decisionSinceEat = 0;

  /**
   * Vráti aktuálny stav hladu na základe hodnoty.
   */
  function getState(hunger) {
    for (var i = 0; i < HUNGER_STATES.length; i++) {
      if (hunger >= HUNGER_STATES[i].min) return HUNGER_STATES[i];
    }
    return HUNGER_STATES[HUNGER_STATES.length - 1];
  }

  /**
   * Volaný pri každom rozhodnutí hráča (voľba v scéne).
   * @param {object} opts - { major: bool, positive: bool }
   */
  function onDecision(opts) {
    if (!S.hunger && S.hunger !== 0) S.hunger = 100;
    opts = opts || {};

    // Fyzický hlad klesá podľa náročnosti rozhodnutia
    var decay = opts.major ? CONFIG.DECAY_PER_MAJOR : CONFIG.DECAY_PER_DECISION;
    S.hunger = Math.max(0, S.hunger - decay);
    _decisionSinceEat++;

    // Psychická sanita — rozhodnutia majú psychický dopad
    if (opts.positive) {
      S.san = Math.min(100, S.san + CONFIG.SAN_DECISION_BOOST);
    }
    if (opts.harmful) {
      // Morálne ťažké rozhodnutia ničia psychiku
      var sanHit = CONFIG.SAN_DECISION_HIT * (S.hunger < CONFIG.HUNGRY_THRESHOLD ? CONFIG.SAN_HUNGRY_MULT : 1);
      S.san = Math.max(0, S.san - sanHit);
    }

    _applyHungerEffects();
    _renderHungerBar();
    Renderer.updateStats();
  }

  /**
   * Akcia (fishing, HQ) — menší hlad decay.
   */
  function onAction() {
    if (!S.hunger && S.hunger !== 0) S.hunger = 100;
    S.hunger = Math.max(0, S.hunger - CONFIG.DECAY_PER_ACTION);
    _applyHungerEffects();
    _renderHungerBar();
    Renderer.updateStats();
  }

  /**
   * Hlavný tick — volaný každú sekundu.
   * HLAD tu UŽ NEKLESÁ — len aplikuje pasívne efekty.
   * SAN klesá miernym tempom pasívne.
   */
  function tick() {
    if (!S.hunger && S.hunger !== 0) S.hunger = 100;

    var h = S.hunger;

    // Pasívna SAN degradácia (psychické opotrebenie)
    if (h < CONFIG.HUNGRY_THRESHOLD) {
      // Hladný → SAN klesá rýchlejšie
      S.san = Math.max(0, S.san - CONFIG.SAN_TICK_DECAY * CONFIG.SAN_HUNGRY_MULT);
    } else if (h >= 80) {
      // Sýty → HP regen + malý SAN regen
      S.hp  = Math.min(100, S.hp  + CONFIG.HP_REGEN_FULL);
      S.san = Math.min(100, S.san + CONFIG.SAN_TICK_REGEN);
    } else {
      // Normálny stav — veľmi mierny pasívny SAN tick
      S.san = Math.max(0, S.san - CONFIG.SAN_TICK_DECAY * 0.5);
    }

    _applyHungerEffects();
    _renderHungerBar();
    Renderer.updateStats();
  }

  /**
   * Aplikuje efekty podľa stavu hladu (HP damage pri vyhladovaní).
   */
  function _applyHungerEffects() {
    var h = S.hunger;
    if (h <= 0) {
      S.hp = Math.max(0, S.hp - CONFIG.STARVING_HP_DMGE);
      if (S.hp <= 0) {
        addLog('💀 Zomrel si od hladu. Operácia zlyhala.', 'err');
        gameOver('Vyhladovanie. Telo zlyhalo. Operácia LAZARUS ukončená.');
      }
    }
  }

  /**
   * Nakŕmenie — zvýši hunger o amount.
   * @param {number} amount - Koľko sýtosti pridať (0-100)
   */
  function eat(amount) {
    if (!amount || amount <= 0) return;
    var before = S.hunger || 0;
    S.hunger = Math.min(CONFIG.MAX_HUNGER, before + amount);
    _decisionSinceEat = 0; // reset decision counter po jedle

    _renderHungerBar();

    // Bonus za plné najedenie — psychický efekt sýtosti
    if (S.hunger >= 90) {
      S.san = Math.min(100, S.san + 4);
      addLog('Najedený do sýtosti! SAN +4. Psychika stabilizovaná.', 'ok');
    } else if (before < CONFIG.HUNGRY_THRESHOLD && S.hunger >= CONFIG.HUNGRY_THRESHOLD) {
      // Zastavenie hladu — úľava
      S.san = Math.min(100, S.san + 2);
      addLog('Hlad ustupuje. SAN +2.', 'ok');
    }
    Renderer.updateStats();
  }

  /**
   * Render hunger bar do DOM (left panel + mobile).
   */
  function _renderHungerBar() {
    var h   = S.hunger || 0;
    var st  = getState(h);
    var pct = Math.round(h);

    // Main hunger bar
    var bar = document.getElementById('bar-hunger');
    var val = document.getElementById('val-hunger');
    var ico = document.getElementById('hunger-state-icon');
    if (bar) bar.style.width = pct + '%';
    if (bar) {
      // Farba sa mení dynamicky
      if (h > 70)      bar.style.background = 'linear-gradient(90deg, #14532d, #16a34a, #4ade80)';
      else if (h > 30) bar.style.background = 'linear-gradient(90deg, #78350f, #d97706, #fbbf24)';
      else             bar.style.background = 'linear-gradient(90deg, #450a0a, #dc2626, #ef4444)';
    }
    if (val) val.textContent = Math.floor(h);
    if (ico) ico.textContent = st.icon;

    // Topbar hunger chip (malý indicator)
    var chip = document.getElementById('topbar-hunger-chip');
    if (chip) {
      chip.textContent = st.icon + ' ' + st.label;
      chip.style.color = st.color;
      // Blink pri hladnom stave
      if (h <= CONFIG.HUNGRY_THRESHOLD) {
        chip.style.animation = 'hungerBlink 1s ease-in-out infinite alternate';
      } else {
        chip.style.animation = 'none';
      }
    }

    // Hunger warning overlay — zobrazí sa keď vyhladovaný
    var warn = document.getElementById('hunger-warning');
    if (warn) {
      if (h <= CONFIG.STARVING_THRESHOLD) {
        warn.classList.add('show');
        warn.textContent = '💀 VYHLADOVANÝ — HP klesá! Zjedz niečo pred ďalšou voľbou!';
      } else if (h <= CONFIG.HUNGRY_THRESHOLD) {
        warn.classList.add('show');
        warn.textContent = '⚠ Hladný — každá voľba stojí viac. SAN nestabilná.';
      } else {
        warn.classList.remove('show');
      }
    }
  }

  /** Inicializácia — render pri štarte */
  function init() {
    if (!S.hunger && S.hunger !== 0) S.hunger = 100;
    _renderHungerBar();
  }

  return { tick: tick, eat: eat, onDecision: onDecision, onAction: onAction, getState: getState, init: init, CONFIG: CONFIG };
})();

/* ═══════════════════════════════════════════════════════════════════