'use strict';

/* === main.js — Bootstrap, inicializácia === */

HUNGER SYSTEM INJECTION INTO GAMELOOP TICK
   (Patch do existujúceho GameLoop._tick — volaný každú sekundu)
══════════════════════════════════════════════════════════════════ */
// Patch GameLoop — pridáme HungerSystem.tick() do existujúceho loopa
// Robíme to bezpečne cez wrapper po inicializácii
var _originalGameLoopStart = GameLoop.start;
GameLoop.start = function() {
  _originalGameLoopStart();
  // Hunger tick hook je priamo vo _tick() nižšie cez monkey-patch
};

/* ══════════════════════════════════════════════════════════════════
   BOOTSTRAP — Inicializácia hry
══════════════════════════════════════════════════════════════════ */

// Opraviť _tick aby obsahoval hunger
// GameLoop._tick je privátny — musíme ho rozšíriť cez setInterval
// (GameLoop.start() používa rAF loop s akumulátorom, takže tick je pri 1s)
// Pridáme hunger ako sekundárny interval:
var _hungerTickInterval = null;

function _startHungerTick() {
  if (_hungerTickInterval) clearInterval(_hungerTickInterval);
  _hungerTickInterval = setInterval(function(){
    if (!StateMachine.is(StateMachine.STATES.PLAYING)) return;
    HungerSystem.tick();
  }, GameConfig.TICK_INTERVAL_MS);
}

// ── State Machine transitions ────────────────────────────────────
StateMachine.on(StateMachine.STATES.PLAYING, function() {
  _startHungerTick();
});

StateMachine.on(StateMachine.STATES.MAIN_MENU, function() {
  if (_hungerTickInterval) { clearInterval(_hungerTickInterval); _hungerTickInterval = null; }
});

// ── Loading Sequence ─────────────────────────────────────────────
(function initLoadingSequence() {
  var bar    = document.getElementById('loading-bar');
  var status = document.getElementById('loading-status');
  var steps  = [
    [10,  '// INICIALIZÁCIA MODULOV //'],
    [25,  '// NAČÍTAVANIE SCÉN //'],
    [40,  '// KALIBRÚJEM LAZARUS FREKVENCIE //'],
    [60,  '// AKTIVUJEM DECISION-HUNGER SYSTÉM //'],
    [75,  '// PRÍPRAVA PRIEVIDZE //'],
    [90,  '// FINALIZÁCIA //'],
    [100, '// OPERÁCIA LAZARUS PRIPRAVENÁ //'],
  ];
  var i = 0;
  function nextStep() {
    if (i >= steps.length) {
      setTimeout(function(){
        var ls = document.getElementById('loading-screen');
        if (ls) ls.classList.add('hidden');
        document.getElementById('main-menu').classList.add('visible');
        StateMachine.transition(StateMachine.STATES.MAIN_MENU);
      }, 400);
      return;
    }
    var s = steps[i++];
    if (bar) bar.style.width = s[0] + '%';
    if (status) status.textContent = s[1];
    setTimeout(nextStep, 180 + Math.random() * 200);
  }
  setTimeout(nextStep, 300);
})();

// ── Menu Buttons ────────────────────────────────────────────────
document.getElementById('menu-new-btn').onclick = function() {
  document.getElementById('main-menu').classList.remove('visible');
  newGame();
};
document.getElementById('menu-load-btn').onclick = function() {
  document.getElementById('main-menu').classList.remove('visible');
  loadGame();
};

// ── Input Handler Init ───────────────────────────────────────────
InputHandler.init();

// ── Initial render ───────────────────────────────────────────────
Renderer.updateMoney();
Renderer.updateIncome();
Renderer.updateStats();
Renderer.updateShop();
HungerSystem.init();

// Helper
function escH(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function safeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'\x01').replace(/>/g,'\x02')
    .replace(/\x01b\x02([\s\S]*?)\x01\/b\x02/g,'<b>$1</b>')
    .replace(/\x01i\x02([\s\S]*?)\x01\/i\x02/g,'<i>$1</i>')
    .replace(/\x01/g,'&lt;').replace(/\x02/g,'&gt;');
}