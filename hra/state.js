'use strict';

/* ════════════════════════════════════════════════════════════════════
   MODULE 2: StateMachine
   Spravuje: LOADING → MAIN_MENU → PLAYING → GAME_OVER → WIN
════════════════════════════════════════════════════════════════════ */
var StateMachine = (function() {
  var STATES = { LOADING:'LOADING', MAIN_MENU:'MAIN_MENU', PLAYING:'PLAYING', GAME_OVER:'GAME_OVER', WIN:'WIN' };
  var _current = STATES.LOADING;
  var _listeners = {};

  function on(state, fn) {
    if (!_listeners[state]) _listeners[state] = [];
    _listeners[state].push(fn);
  }

  function transition(newState) {
    var old = _current;
    _current = newState;
    if (_listeners[newState]) _listeners[newState].forEach(function(fn){ fn(old); });
  }

  function is(state)  { return _current === state; }
  function current()  { return _current; }

  return { STATES:STATES, on:on, transition:transition, is:is, current:current };
})();

/* ════════════════════════════════════════════════════════════════════
   MODULE 3: ObjectPool
   Recyklovateľné DOM elementy — zabraňuje GC skokom
════════════════════════════════════════════════════════════════════ */
var ObjectPool = (function() {
  var _pools = {};

  function acquire(tag, cls) {
    var key = tag + ':' + cls;
    if (!_pools[key]) _pools[key] = [];
    var el = _pools[key].pop();
    if (!el) { el = document.createElement(tag); el.className = cls; }
    return el;
  }

  function release(el) {
    var key = el.tagName.toLowerCase() + ':' + el.className;
    el.innerHTML = ''; el.textContent = '';
    el.removeAttribute('style'); el.removeAttribute('disabled');
    if (!_pools[key]) _pools[key] = [];
    _pools[key].push(el);
  }

  return { acquire:acquire, release:release };
})();

/* ════════════════════════════════════════════════════════════════════
   MODULE 4: AssetLoader
   Prednačíta obrázky s cache, fallback a progress callbackom
════════════════════════════════════════════════════════════════════ */
var AssetLoader = (function() {
  var _cache = {};
  var _pending = 0, _total = 0;
  var _onProgress = null, _onComplete = null;

  function preload(urls, onProgress, onComplete) {
    _onProgress = onProgress; _onComplete = onComplete;
    var unique = urls.filter(function(u,i){ return urls.indexOf(u)===i; });
    _total = unique.length; _pending = unique.length;
    if (_total === 0) { if (_onComplete) _onComplete(); return; }
    unique.forEach(function(url) {
      if (_cache[url]) { _done(); return; }
      var img = new Image();
      img.onload  = function(){ _cache[url] = img; _done(); };
      img.onerror = function(){ _cache[url] = null; _done(); };
      img.src = url;
    });
  }

  function _done() {
    _pending--;
    var loaded = _total - _pending;
    if (_onProgress) _onProgress(loaded, _total);
    if (_pending === 0 && _onComplete) _onComplete();
  }

  function get(url) { return _cache[url] || null; }

  return { preload:preload, get:get };
})();

/* ════════════════════════════════════════════════════════════════════
   MODULE 5: InputHandler
   Zjednocuje klávesnicu, touch a click udalosti
════════════════════════════════════════════════════════════════════ */
var InputHandler = (function() {
  var _handlers = {};
  var _keyState = {};

  function init() {
    document.addEventListener('keydown', function(e) {
      _keyState[e.code] = true;
      var h = _handlers['key:' + e.code];
      if (h) h(e);
    });
    document.addEventListener('keyup', function(e) {
      _keyState[e.code] = false;
    });
    document.addEventListener('touchstart', function(e) {
      var h = _handlers['touch:start']; if (h) h(e);
    }, { passive: true });
    document.addEventListener('touchend', function(e) {
      var h = _handlers['touch:end']; if (h) h(e);
    }, { passive: true });
  }

  function on(type, fn)  { _handlers[type] = fn; }
  function off(type)     { delete _handlers[type]; }
  function isDown(code)  { return !!_keyState[code]; }

  return { init:init, on:on, off:off, isDown:isDown };
})();

/* ════════════════════════════════════════════════════════════════════
   HERNÝ STAV (S)
   Inicializovaný na null — newGame() / loadGame() ho naplní.
   Exportovaný ako globálna premenná (var S) pre kompatibilitu.
════════════════════════════════════════════════════════════════════ */
var S = null;

/* Pomocné runtime stavy (nie sú súčasťou save) */
var FLEET_STATE  = {};
var COURSE_STATE = {};
var HQ_COOLDOWNS = {};
