'use strict';

/* ════════════════════════════════════════════════════════════
   MODULE 8: GameLoop
   requestAnimationFrame loop + delta-time pasívny tick
   Závislosti: config.js (GameConfig)
              systems/state.js (S, FLEET_STATE, COURSE_STATE)
              systems/renderer.js (Renderer)
              ui/training.js (UNI_COURSES, GYM_COURSES, COURSE_STATE, getCourseTotalRate)
              ui/hq.js (hqPassiveTick)
   ════════════════════════════════════════════════════════════ */

var GameLoop = (function() {
  var _lastTime = 0;
  var _accumulator = 0;  // ms accumulated since last tick
  var _isRunning = false;
  var _rafId = null;

  /** Start the main game loop. */
  function start() {
    if (_isRunning) return;
    _isRunning = true;
    _lastTime  = performance.now();
    _rafId = requestAnimationFrame(_loop);
  }

  function stop() {
    _isRunning = false;
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  }

  function _loop(now) {
    if (!_isRunning) return;
    var delta = now - _lastTime;
    _lastTime = now;

    // Clamp delta to avoid spiral-of-death after tab switch
    if (delta > 5000) delta = GameConfig.TICK_INTERVAL_MS;

    _accumulator += delta;

    // Fixed 1-second tick for passive systems
    while (_accumulator >= GameConfig.TICK_INTERVAL_MS) {
      _accumulator -= GameConfig.TICK_INTERVAL_MS;
      _tick();
    }

    _rafId = requestAnimationFrame(_loop);
  }

  /** The fixed 1-second simulation tick. */
  function _tick() {
    if (!StateMachine.is(StateMachine.STATES.PLAYING)) return;

    // Passive income
    var total = S.income.job + S.income.hack + S.income.fish + S.income.bonus + (S.income.boats||0);
    S.money += total;
    Renderer.updateMoney();

    // Active courses
    var allCourses = UNI_COURSES.concat(GYM_COURSES);
    allCourses.forEach(function(course) {
      var cs = COURSE_STATE[course.id]; if (!cs || !cs.enrolled) return;
      var rate = getCourseTotalRate(course);
      if (course.stat === 'hackStat') S.hackStat = Math.min(100, S.hackStat + rate);
      if (course.stat === 'str')      S.str      = Math.min(100, S.str      + rate);
      if (course.stat === 'flex')     S.flex     = Math.min(100, S.flex     + rate);
      if (course.stat === 'san')      S.san      = Math.min(100, S.san      + rate);
      if (course.stat === 'hp')       S.hp       = Math.min(100, S.hp       + rate);
      if (course.secondStat) {
        if (course.secondStat === 'san') S.san = Math.min(100, S.san + course.secondRate);
        if (course.secondStat === 'hp')  S.hp  = Math.min(100, S.hp  + course.secondRate);
      }
      if (course.incomeBonus && !cs._incomeApplied) { S.income.hack += course.incomeBonus * cs.level; cs._incomeApplied = true; Renderer.updateIncome(); }
      if (!cs.progress) cs.progress = 0;
      cs.progress = (cs.progress + 1.5) % 100;
      var pbar = document.getElementById('cprog-' + course.id);
      if (pbar) pbar.style.width = cs.progress + '%';
    });

    // HQ passive regen
    hqPassiveTick();

    // Garden passive income
    if (S.gardenIncome) { S.money += S.gardenIncome; Renderer.updateMoney(); }

    // Job attribute rates
    if (S.job) {
      var r = S.attrRates;
      if (r.hp)   S.hp       = Math.min(100, Math.max(0, S.hp       + r.hp));
      if (r.san)  S.san      = Math.min(100, Math.max(0, S.san      + r.san));
      if (r.str)  S.str      = Math.min(100, S.str      + r.str);
      if (r.flex) S.flex     = Math.min(100, S.flex     + r.flex);
      if (r.hack) S.hackStat = Math.min(100, S.hackStat + r.hack);
      checkJobPromotion();
    }

    Renderer.updateStats();

    // Clock update
    var now = new Date();
    var clockEl = document.getElementById('topbar-clock');
    if (clockEl) clockEl.textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');

    // Garden grid refresh (only if overlay visible)
    var gardenOverlay = document.getElementById('garden-overlay');
    if (gardenOverlay && gardenOverlay.classList.contains('show')) renderGardenGrid();
  }

  return { start: start, stop: stop };
})();

/* ════════════════════════════════════════════════════════════════════