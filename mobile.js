/* CEO od Zla // §38 Mobile Navigation */
/* global S, gainXP, addLog, addItem, hasItem, showNotif, Renderer, GameConfig, switchView */

'use strict';

/* ════════════════════════════════════════════════════════════════
   MOBILE NAV — stav a config
════════════════════════════════════════════════════════════════ */
var MobileNav = (function() {

  // Zoznam tabov pre ExpandedTopbar
  var TABS_LEFT = [
    { id:'stats',  label:'📊 Štatistiky', fn: function(){ _openLeftPanel('stats'); } },
    { id:'map',    label:'🗺 Mapa',        fn: function(){ _openLeftPanel('map'); } },
    { id:'ops',    label:'📋 Ciele',       fn: function(){ _openLeftPanel('ops'); } },
    { id:'income', label:'💰 Príjem',      fn: function(){ _openLeftPanel('income'); } },
  ];

  var TABS_RIGHT = [
    { id:'items',  label:'🎒 Predmety', fn: function(){ _openRightPanel('items'); } },
    { id:'equip',  label:'⚔️ Výstroj',  fn: function(){ _openRightPanel('equip'); } },
    { id:'fish',   label:'🐟 Ryby',     fn: function(){ _openRightPanel('fish'); } },
    { id:'shop',   label:'🛒 Obchod',   fn: function(){ _openRightPanel('shop'); } },
    { id:'log',    label:'📋 Konzola',  fn: function(){ _openRightPanel('log'); } },
  ];

  var _leftIdx  = 0;
  var _rightIdx = 0;
  var _leftOpen  = false;
  var _rightOpen = false;
  var _closing = false;

  // ── CSS transitions ──────────────────────────────────
  var _TRANS_MS = 220;

  // ── DOM helper ───────────────────────────────────────
  function _el(id) { return document.getElementById(id); }

  // ── Clone obsahu do slide panela ─────────────────────
  function _buildLeftContent(tabId) {
    var content = '';
    switch (tabId) {
      case 'stats':
        var lp = _el('left-scroll');
        content = lp ? lp.innerHTML : '<div style="padding:12px;color:var(--text-dim)">// Štatistiky //</div>';
        break;
      case 'map':
        var mp = _el('sec-map');
        content = mp ? mp.innerHTML : '';
        break;
      case 'ops':
        var op = _el('sec-ops');
        content = op ? op.innerHTML : '';
        break;
      case 'income':
        var ip = _el('sec-income');
        content = ip ? ip.innerHTML : '';
        break;
      default:
        var lp2 = _el('left-scroll');
        content = lp2 ? lp2.innerHTML : '';
    }
    return content;
  }

  function _buildRightContent(tabId) {
    // Konzola / log tab — živý obsah z log-wrap
    if (tabId === 'log') {
      var logWrap = _el('log-wrap');
      var logHtml = logWrap ? logWrap.innerHTML : '<div style="padding:12px;color:var(--text-dim)">// Prázdny log //</div>';
      return '<div style="padding:0">' +
        '<div style="font-family:var(--font-hud);font-size:9px;letter-spacing:2px;color:var(--green3);padding:8px 12px 6px;border-bottom:1px solid var(--border2);text-transform:uppercase">◆ Konzola // Log</div>' +
        '<div style="padding:4px 0;font-size:13px;line-height:1.65">' + logHtml + '</div>' +
        '</div>';
    }
    // Zavolaj switchInvTab aby sa obsah aktualizoval
    if (typeof switchInvTab === 'function') {
      setTimeout(function(){ switchInvTab(tabId); }, 10);
    }
    var rp = _el('right-panel');
    return rp ? rp.innerHTML : '<div style="padding:12px">// Panel //</div>';
  }

  // ── Otvor ľavý slide panel ───────────────────────────
  function _openLeftPanel(tabId) {
    var panel = _el('mobile-left-panel');
    var titleEl = _el('mobile-left-panel-title');
    var contentEl = _el('mobile-left-panel-content');
    if (!panel) return;

    var tab = TABS_LEFT.filter(function(t){ return t.id === tabId; })[0] || TABS_LEFT[0];
    if (titleEl) titleEl.textContent = tab.label;
    if (contentEl) contentEl.innerHTML = _buildLeftContent(tabId);

    _leftOpen = true;
    panel.style.display = 'block';
    // force reflow
    panel.offsetHeight;
    panel.classList.remove('closing');
    panel.classList.add('open');

    // Aktualizuj arrow label
    var lbl = _el('mobile-left-label');
    if (lbl) lbl.textContent = tab.label.replace(/^[^\s]+\s/, '');
    _updateDots('left', TABS_LEFT, _leftIdx);

    // Zavrieť pravý ak je otvorený
    if (_rightOpen) _closeRightPanel(true);
  }

  function _closeLeftPanel(instant) {
    var panel = _el('mobile-left-panel');
    if (!panel) return;
    _leftOpen = false;
    if (instant) {
      panel.classList.remove('open');
      panel.style.display = 'none';
      return;
    }
    panel.classList.add('closing');
    panel.classList.remove('open');
    setTimeout(function(){
      if (!_leftOpen) {
        panel.classList.remove('closing');
        panel.style.display = 'none';
      }
    }, _TRANS_MS);
  }

  // ── Otvor pravý slide panel ──────────────────────────
  function _openRightPanel(tabId) {
    var panel = _el('mobile-right-panel');
    var titleEl = _el('mobile-right-panel-title');
    var contentEl = _el('mobile-right-panel-content');
    if (!panel) return;

    var tab = TABS_RIGHT.filter(function(t){ return t.id === tabId; })[0] || TABS_RIGHT[0];
    if (titleEl) titleEl.textContent = tab.label;

    // switchInvTab aktualizuje pôvodný right panel — potom kopírujeme
    if (tabId !== 'log' && typeof switchInvTab === 'function') switchInvTab(tabId);

    _rightOpen = true;
    panel.style.display = 'block';
    panel.offsetHeight;
    panel.classList.remove('closing');
    panel.classList.add('open');

    // Aktualizuj content po krátkej pauze (switchInvTab potrebuje čas)
    setTimeout(function(){
      if (contentEl) contentEl.innerHTML = _buildRightContent(tabId);
    }, tabId === 'log' ? 0 : 30);

    var lbl = _el('mobile-right-label');
    if (lbl) lbl.textContent = tab.label.replace(/^[^\s]+\s/, '');
    _updateDots('right', TABS_RIGHT, _rightIdx);

    if (_leftOpen) _closeLeftPanel(true);
  }

  function _closeRightPanel(instant) {
    var panel = _el('mobile-right-panel');
    if (!panel) return;
    _rightOpen = false;
    if (instant) {
      panel.classList.remove('open');
      panel.style.display = 'none';
      return;
    }
    panel.classList.add('closing');
    panel.classList.remove('open');
    setTimeout(function(){
      if (!_rightOpen) {
        panel.classList.remove('closing');
        panel.style.display = 'none';
      }
    }, _TRANS_MS);
  }

  // ── Dot indikátory ───────────────────────────────────
  function _updateDots(side, tabs, activeIdx) {
    var dotsWrap = _el('mobile-' + side + '-dots');
    var dotsWrap2 = _el('mobile-' + side + '-dots-main');
    [dotsWrap, dotsWrap2].forEach(function(wrap){
      if (!wrap) return;
      wrap.innerHTML = '';
      tabs.forEach(function(_, i) {
        var d = document.createElement('div');
        d.className = 'arrow-dot' + (i === activeIdx ? ' active' : '');
        wrap.appendChild(d);
      });
    });
  }

  // ── Swipe gesture ────────────────────────────────────
  var _swipeStartX = 0;
  var _swipeStartY = 0;
  function _setupSwipe() {
    document.addEventListener('touchstart', function(e) {
      _swipeStartX = e.touches[0].clientX;
      _swipeStartY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - _swipeStartX;
      var dy = e.changedTouches[0].clientY - _swipeStartY;
      var absDx = Math.abs(dx), absDy = Math.abs(dy);
      // Len horizontálny swipe (absDx > absDy a dost dlhý)
      if (absDx < 50 || absDy > absDx * 0.8) return;
      // Ignoruj ak touch začal v middle 40% (scéna)
      var vw = window.innerWidth;
      if (_swipeStartX > vw * 0.2 && _swipeStartX < vw * 0.8) return;
      if (dx > 0) {
        // Swipe doprava — otvor ľavý panel
        if (_leftOpen) _closeLeftPanel(); else { _leftIdx = (_leftIdx + 1) % TABS_LEFT.length; _openLeftPanel(TABS_LEFT[_leftIdx].id); }
      } else {
        // Swipe doľava — otvor pravý panel
        if (_rightOpen) _closeRightPanel(); else { _rightIdx = (_rightIdx + 1) % TABS_RIGHT.length; _openRightPanel(TABS_RIGHT[_rightIdx].id); }
      }
    }, { passive: true });
  }

  // ── PUBLIC API ───────────────────────────────────────
  function cycleLeft() {
    if (_leftOpen) {
      _leftIdx = (_leftIdx + 1) % TABS_LEFT.length;
      _openLeftPanel(TABS_LEFT[_leftIdx].id);
    } else {
      _openLeftPanel(TABS_LEFT[_leftIdx].id);
    }
    // Aktualizuj arrow label
    var lbl = _el('mobile-left-label-main');
    var tab = TABS_LEFT[_leftIdx];
    if (lbl && tab) lbl.textContent = tab.label.replace(/^[^\s]+\s/, '');
    _updateDots('left', TABS_LEFT, _leftIdx);
  }

  function cycleRight() {
    if (_rightOpen) {
      _rightIdx = (_rightIdx + 1) % TABS_RIGHT.length;
      _openRightPanel(TABS_RIGHT[_rightIdx].id);
    } else {
      _openRightPanel(TABS_RIGHT[_rightIdx].id);
    }
    var lbl = _el('mobile-right-label-main');
    var tab = TABS_RIGHT[_rightIdx];
    if (lbl && tab) lbl.textContent = tab.label.replace(/^[^\s]+\s/, '');
    _updateDots('right', TABS_RIGHT, _rightIdx);
  }

  function showGame() {
    _closeLeftPanel();
    _closeRightPanel();
    // Odstraní highlight zo slide panelov
    var mnG = _el('mnav-game');
    if (mnG) {
      document.querySelectorAll('.mobile-nav-btn').forEach(function(b){ b.classList.remove('active'); });
      mnG.classList.add('active');
    }
  }

  function openShop() {
    _rightIdx = 3; // shop je na indexe 3 (items/equip/fish/shop/log)
    _openRightPanel('shop');
    document.querySelectorAll('.mobile-nav-btn').forEach(function(b){ b.classList.remove('active'); });
    var shopBtn = _el('mnav-shop');
    if (shopBtn) shopBtn.classList.add('active');
  }

  function miniLog() {
    // Otvor log ako riadny pravý panel tab (väčší font, konzistentný štýl)
    _rightIdx = TABS_RIGHT.length - 1; // log je posledný
    _openRightPanel('log');
    // Scroll to bottom po renderi
    setTimeout(function(){
      var panel = _el('mobile-right-panel');
      if (panel) panel.scrollTop = panel.scrollHeight;
    }, 80);
  }

  function closePanel(side) {
    if (side === 'left') _closeLeftPanel();
    else _closeRightPanel();
  }

  // Backdrop tap pre zatváranie panelov
  function _setupBackdrop() {
    document.addEventListener('click', function(e) {
      var lp = _el('mobile-left-panel');
      var rp = _el('mobile-right-panel');
      var la = _el('mobile-left-arrow-main');
      var ra = _el('mobile-right-arrow-main');
      var la2 = _el('mobile-left-arrow');
      var ra2 = _el('mobile-right-arrow');
      var nav = _el('mobile-nav');

      var inLeft  = lp && lp.contains(e.target);
      var inRight = rp && rp.contains(e.target);
      var inLArrow = (la && la.contains(e.target)) || (la2 && la2.contains(e.target));
      var inRArrow = (ra && ra.contains(e.target)) || (ra2 && ra2.contains(e.target));
      var inNav   = nav && nav.contains(e.target);

      if (_leftOpen && !inLeft && !inLArrow && !inNav) _closeLeftPanel();
      if (_rightOpen && !inRight && !inRArrow && !inNav) _closeRightPanel();
    });
  }

  function init() {
    _setupSwipe();
    _setupBackdrop();
    _updateDots('left',  TABS_LEFT,  _leftIdx);
    _updateDots('right', TABS_RIGHT, _rightIdx);
    // Nastav initial arrow labels
    var ll = _el('mobile-left-label-main');
    var rl = _el('mobile-right-label-main');
    var ll2 = _el('mobile-left-label');
    var rl2 = _el('mobile-right-label');
    if (ll) ll.textContent = 'Štat.';
    if (rl) rl.textContent = 'Inv.';
    if (ll2) ll2.textContent = 'Štat.';
    if (rl2) rl2.textContent = 'Inv.';
    console.log('[MobileNav] init OK');
  }

  return {
    init: init,
    cycleLeft: cycleLeft,
    cycleRight: cycleRight,
    showGame: showGame,
    openShop: openShop,
    miniLog: miniLog,
    closePanel: closePanel,
    openLeftPanel: _openLeftPanel,
    openRightPanel: _openRightPanel
  };
})();

/* ════════════════════════════════════════════════════════════════
   GLOBAL MOBILE HANDLER FUNCTIONS (volané z HTML onclick)
════════════════════════════════════════════════════════════════ */

function mobileCycleLeft()  { MobileNav.cycleLeft(); }
function mobileCycleRight() { openInvDrawer(); }
function mobileShowGame()   { MobileNav.showGame(); }
function mobileMiniStats()  { MobileNav.openLeftPanel('stats'); }
function mobileMiniLog()    { MobileNav.miniLog(); }
function mobileOpenShop()   { MobileNav.openShop(); }
function mobileClosePanel(side) { MobileNav.closePanel(side); }

/* mobileArrow — volané zo side arrow buttons */
function mobileArrow(side) {
  if (side === 'left') MobileNav.cycleLeft();
  else MobileNav.cycleRight();
}

/* mobileTabSwitch — volané z expanded topbar buttons */
function mobileTabSwitch(view) {
  if (view === 'game') {
    MobileNav.showGame();
    return;
  }
  if (typeof switchView === 'function') switchView(view);
}

/* mobileTopbarToggle — toggle expanded topbar */
function mobileTopbarToggle() {
  var exp = document.getElementById('mobile-topbar-expand');
  if (!exp) return;
  exp.classList.toggle('show');
}

/* ════════════════════════════════════════════════════════════════
   HAZARD QUICK ACCESS — vždy dostupný (z bottom nav alebo scény)
   Pridá 🎲 Hazard tlačidlo do mobile-nav ak je hra PLAYING
════════════════════════════════════════════════════════════════ */
(function() {
  function _injectHazardBtn() {
    var nav = document.getElementById('mobile-nav');
    if (!nav) return;
    if (document.getElementById('mnav-hazard')) return; // already added
    var btn = document.createElement('button');
    btn.className = 'mobile-nav-btn';
    btn.id = 'mnav-hazard';
    btn.innerHTML = '🎲<span>Hazard</span>';
    btn.onclick = function() {
      // Otvor hazard výber
      _showHazardPicker();
    };
    // Vloží pred Log tlačidlo
    var logBtn = document.getElementById('mnav-right');
    if (logBtn) nav.insertBefore(btn, logBtn);
    else nav.appendChild(btn);
  }

  function _showHazardPicker() {
    // Zatvor existujúce overlays
    var panel = document.getElementById('mobile-right-panel');
    var titleEl = document.getElementById('mobile-right-panel-title');
    var contentEl = document.getElementById('mobile-right-panel-content');
    if (!panel) {
      // Fallback — priamo otvoriť blackjack
      if (typeof openBlackjack === 'function') openBlackjack();
      return;
    }
    if (titleEl) titleEl.textContent = '🎲 Hazard // Miki Bar';
    if (contentEl) {
      contentEl.innerHTML =
        '<div style="padding:16px;display:flex;flex-direction:column;gap:12px">' +
          '<div style="font-family:var(--font-hud);font-size:10px;color:var(--green3);letter-spacing:2px;margin-bottom:4px">// HAZARDNÉ HRY //</div>' +
          '<div style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:8px">' +
            'Lucia pokrčí ramenami.<br>"Všetky zisky naše — všetky straty tvoje."' +
          '</div>' +
          '<button onclick="mobileHazardBJ()" style="width:100%;background:linear-gradient(180deg,rgba(250,204,21,0.12),rgba(250,204,21,0.04));border:1px solid var(--gold);color:var(--gold);font-family:var(--font-body);font-size:13px;font-weight:700;letter-spacing:2px;padding:14px;cursor:pointer;text-transform:uppercase">🃏 Blackjack</button>' +
          '<button onclick="mobileHazardSlots()" style="width:100%;background:linear-gradient(180deg,rgba(57,255,20,0.1),rgba(57,255,20,0.03));border:1px solid var(--green3);color:var(--green);font-family:var(--font-body);font-size:13px;font-weight:700;letter-spacing:2px;padding:14px;cursor:pointer;text-transform:uppercase">🎰 Slot Machine</button>' +
          '<div style="font-size:9px;color:var(--text-muted);font-family:var(--font-mono);text-align:center;margin-top:4px">// Casino Prievidza 2077 //</div>' +
        '</div>';
    }
    // Otvor panel
    panel.style.display = 'block';
    panel.offsetHeight;
    panel.classList.remove('closing');
    panel.classList.add('open');
  }

  // Globálne funkcie pre hazard buttons v paneli
  window.mobileHazardBJ = function() {
    // Zavrieť slide panel
    var panel = document.getElementById('mobile-right-panel');
    if (panel) { panel.classList.remove('open'); panel.style.display = 'none'; }
    if (typeof openBlackjack === 'function') openBlackjack();
  };
  window.mobileHazardSlots = function() {
    var panel = document.getElementById('mobile-right-panel');
    if (panel) { panel.classList.remove('open'); panel.style.display = 'none'; }
    if (typeof openSlots === 'function') openSlots();
  };

  // Injektuj hazard tlačidlo keď sa hra spustí
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(_injectHazardBtn, 500);
    });
  } else {
    setTimeout(_injectHazardBtn, 500);
  }

  // Taktiež injektuj keď sa spustí nová hra alebo sa načíta save
  var _origNew = window.newGame;
  if (typeof _origNew === 'function') {
    window.newGame = function() {
      _origNew.apply(this, arguments);
      setTimeout(_injectHazardBtn, 300);
    };
  }
})();

/* ════════════════════════════════════════════════════════════════
   MIKI BAR — hazard garanciový hook
   Ak hráč ide do loc_miki, loc_miki_hazard scén,
   skontroluj že casino overlay je správne nad ostatnými prvkami
════════════════════════════════════════════════════════════════ */
(function() {
  // Oprav Casino overlay z-index pre mobile
  var style = document.createElement('style');
  style.textContent = [
    '@media (max-width:768px) {',
    '  #casino-overlay { z-index: 9000 !important; padding-top: 38px; }',
    '  #casino-panel { max-height: calc(100dvh - 42px - 52px); overflow-y: auto; width: 96%; }',
    '  .mobile-slide-panel { transition: transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease; }',
    '  .mobile-slide-panel.open { display: block !important; }',
    '  /* Bottom nav max 6 buttons */',
    '  #mobile-nav { display: none; height: 52px; overflow: hidden; }',
    '  @media (max-width: 768px) { #mobile-nav { display: flex; } }',
    '  #mobile-nav .mobile-nav-btn { flex: 1; min-width: 0; font-size: 8px; }',
    '  #mobile-nav .mobile-nav-btn span { font-size: 7px; letter-spacing: 0; }',
    '}',
    /* Plynulejší slot transition pre slide panels */
    '.mobile-slide-panel {',
    '  will-change: transform, opacity;',
    '  backface-visibility: hidden;',
    '}',
  ].join('\n');
  document.head.appendChild(style);
})();

/* ════════════════════════════════════════════════════════════════
   JOB CARDS — dot indikátory pre mobile scroll
════════════════════════════════════════════════════════════════ */
(function() {
  function _initJobDots() {
    var wrap = document.getElementById('job-cards-wrap');
    if (!wrap) return;
    var cards = wrap.querySelectorAll('.job-card');
    var dots  = [
      document.getElementById('jdot-0'),
      document.getElementById('jdot-1'),
      document.getElementById('jdot-2')
    ];
    if (!dots[0]) return;

    function _updateDots() {
      var scrollLeft = wrap.scrollLeft;
      var cardWidth  = cards[0] ? (cards[0].offsetWidth + 12) : 272; // 12 = gap
      var idx = Math.round(scrollLeft / cardWidth);
      idx = Math.max(0, Math.min(idx, dots.length - 1));
      dots.forEach(function(d, i) {
        if (!d) return;
        d.classList.toggle('active', i === idx);
      });
    }

    wrap.addEventListener('scroll', _updateDots, { passive: true });
    // Tap na dot = scroll na kartu
    dots.forEach(function(d, i) {
      if (!d) return;
      d.addEventListener('click', function() {
        var cardWidth = cards[0] ? (cards[0].offsetWidth + 12) : 272;
        wrap.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(_initJobDots, 200); });
  } else {
    setTimeout(_initJobDots, 200);
  }
})();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){ MobileNav.init(); }, 100);
  });
} else {
  setTimeout(function(){ MobileNav.init(); }, 100);
}
// ── AGENT PANEL ────────────────────────────────────────────────
function openAgentPanel() {
  var panel = document.getElementById('agent-panel');
  var backdrop = document.getElementById('agent-backdrop');
  if (!panel) return;
  _syncAgentStats();
  switchAgentTab('stats');
  backdrop.style.display = 'block';
  panel.style.pointerEvents = 'all';
  panel.style.transform = 'translateX(0)';
}
function closeAgentPanel() {
  var panel = document.getElementById('agent-panel');
  var backdrop = document.getElementById('agent-backdrop');
  if (!panel) return;
  panel.style.transform = 'translateX(100%)';
  panel.style.pointerEvents = 'none';
  backdrop.style.display = 'none';
}
function switchAgentTab(tab) {
  document.querySelectorAll('.agent-tab').forEach(function(t){ t.classList.remove('active'); });
  var tabIdx = {stats:0,items:1,equip:2}[tab];
  var tabs = document.querySelectorAll('.agent-tab');
  if (tabs[tabIdx]) tabs[tabIdx].classList.add('active');
  ['stats','items','equip'].forEach(function(id){
    var pane = document.getElementById('agent-pane-'+id);
    if (pane) { pane.style.display = (id===tab) ? 'block' : 'none'; pane.classList.toggle('active', id===tab); }
  });
  if (tab==='items') _renderAgentItems();
  if (tab==='equip') _renderAgentEquip();
  if (tab==='stats') _syncAgentStats();
}
function _syncAgentStats() {
  if (typeof S === 'undefined') return;
  var pairs = [
    ['ag-bar-hp','ag-val-hp', Math.min(100,S.hp||0)],
    ['ag-bar-san','ag-val-san', Math.min(100,S.san||0)],
    ['ag-bar-xp','ag-val-xp', S.xp||0],
    ['ag-bar-str','ag-val-str', Math.min(100,S.str||0)],
    ['ag-bar-flex','ag-val-flex', Math.min(100,S.flex||0)],
    ['ag-bar-hack','ag-val-hack', Math.min(100,S.hackStat||0)],
    ['ag-bar-hunger','ag-val-hunger', Math.min(100,S.hunger||0)],
  ];
  pairs.forEach(function(p){
    var bar = document.getElementById(p[0]);
    var val = document.getElementById(p[1]);
    if (bar) bar.style.width = p[2]+'%';
    if (val) val.textContent = Math.floor(p[2]);
  });
  var lvl = document.getElementById('ag-val-level');
  if (lvl) lvl.textContent = S.level||1;
  var xpBar = document.getElementById('ag-bar-xp');
  if (xpBar && S.level > 0) {
    var xpPct = Math.min(100, Math.round((S.xp||0) / (S.level * (typeof GameConfig!=='undefined'?GameConfig.XP_PER_LEVEL_MULT:100)) * 100));
    xpBar.style.width = xpPct+'%';
  }
}
function _renderAgentItems() {
  var body = document.getElementById('agent-items-body');
  if (!body || typeof S==='undefined') return;
  if (!S.inventory || S.inventory.length===0) {
    body.innerHTML='<div class="inv-empty">// prázdny inventár //</div>'; return;
  }
  // Reuse existing inv render logic
  var src = document.getElementById('inv-items-body');
  body.innerHTML = src ? src.innerHTML : '<div class="inv-empty">// prázdny //</div>';
}
function _renderAgentEquip() {
  var body = document.getElementById('agent-equip-body');
  if (!body) return;
  var src = document.getElementById('inv-ppane-equip');
  body.innerHTML = src ? src.innerHTML : '<div class="inv-empty">// prázdno //</div>';
}

// ── LEFT PANEL TEXTOVÁ MAPA ─────────────────────────────────────
function renderLeftTextMap() {
  var body = document.getElementById('left-textmap-body');
  if (!body || typeof TEXT_MAP_LOCS==='undefined') return;
  // Ak je prázdny — renderuj
  if (body.innerHTML.trim() !== '') { _refreshCurrentMarker(); return; }
  var html = '';
  TEXT_MAP_LOCS.forEach(function(loc){
    if (loc.section) {
      html += '<div class="ltm-section">'+loc.section+'</div>'; return;
    }
    var isCurrent = (typeof S!=='undefined' && S.scene===loc.scene);
    html += '<button onclick="goTo(\''+loc.scene+'\')" style="'+
      (isCurrent?'background:rgba(57,255,20,0.12);':'')+'">' +
      '<span style="font-size:16px;width:22px;text-align:center;flex-shrink:0">'+loc.icon+'</span>'+
      '<span style="font-family:var(--font-body);font-size:11px;color:'+(isCurrent?'var(--green)':'var(--text-bright)')+';flex:1;letter-spacing:0.3px">'+loc.name+'</span>'+
      (isCurrent?'<span style="font-family:var(--font-hud);font-size:8px;color:var(--green);letter-spacing:1px">◆ TU</span>':'')+
      '</button>';
  });
  body.innerHTML = html;
}
function _refreshCurrentMarker() {
  // Aktualizuje ◆ TU indikátor bez plného re-renderu
  var body = document.getElementById('left-textmap-body');
  if (!body) return;
  body.querySelectorAll('button').forEach(function(btn){
    var scene = btn.onclick && btn.onclick.toString().match(/goTo\('([^']+)'\)/);
    if (!scene) return;
    var isCurrent = (typeof S!=='undefined' && S.scene===scene[1]);
    btn.style.background = isCurrent ? 'rgba(57,255,20,0.12)' : '';
    var nameSpan = btn.querySelector('span:nth-child(2)');
    if (nameSpan) nameSpan.style.color = isCurrent ? 'var(--green)' : 'var(--text-bright)';
    var marker = btn.querySelector('span:nth-child(3)');
    if (isCurrent && !marker) {
      var m = document.createElement('span');
      m.style.cssText = 'font-family:var(--font-hud);font-size:8px;color:var(--green);letter-spacing:1px';
      m.textContent = '◆ TU'; btn.appendChild(m);
    } else if (!isCurrent && marker) { marker.remove(); }
  });
}
function closeLeftPanel() {
  // Zatvori left panel kliknutím mimo (zavrie hover)
  var panel = document.getElementById('left-panel');
  if (panel) { panel.style.opacity='0'; panel.style.pointerEvents='none'; panel.style.transform='translateX(-100%)';
    setTimeout(function(){ panel.style.opacity=''; panel.style.pointerEvents=''; panel.style.transform=''; },300); }
}

// ── AMBIENT SOUND SYSTEM ─────────────────────────────────────────
var AmbientSound = (function(){
  var _ctx = null;
  var _current = null;  // aktívny ambient node
  var _gainNode = null;
  var _section = null;

  function _ac() {
    if (!_ctx) try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    if (_ctx && _ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  function _stopCurrent(fade) {
    if (!_gainNode) return;
    var g = _gainNode;
    var f = fade || 1.0;
    try {
      g.gain.setValueAtTime(g.gain.value, _ctx.currentTime);
      g.gain.linearRampToValueAtTime(0, _ctx.currentTime + f);
      setTimeout(function(){
        try { g.disconnect(); } catch(e){}
      }, (f + 0.1) * 1000);
    } catch(e){}
    _gainNode = null;
    _current = null;
  }

  // Dronový oscilator s LFO moduláciou
  function _drone(freq1, freq2, vol, lfoRate, lfoDepth) {
    var c = _ac(); if (!c) return null;
    var master = c.createGain();
    master.gain.setValueAtTime(0, c.currentTime);
    master.gain.linearRampToValueAtTime(vol, c.currentTime + 2.5);
    master.connect(c.destination);

    // Dva oscilátory s jemným detune
    [0, 1].forEach(function(i){
      var osc = c.createOscillator();
      var g   = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i===0 ? freq1 : freq2, c.currentTime);
      g.gain.value = 0.5;
      osc.connect(g); g.connect(master);
      osc.start();

      // LFO — jemné vibrato
      var lfo = c.createOscillator();
      var lfoGain = c.createGain();
      lfo.frequency.value = lfoRate + (i * 0.07);
      lfoGain.gain.value  = lfoDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
    });

    // Sub bass
    var sub = c.createOscillator();
    var subG = c.createGain();
    sub.type = 'sine'; sub.frequency.value = freq1 / 2;
    subG.gain.value = 0.15;
    sub.connect(subG); subG.connect(master);
    sub.start();

    return master;
  }

  // Pulzujúci ping pre loading
  function _startLoadingPulse() {
    var c = _ac(); if (!c) return;
    var master = c.createGain();
    master.gain.setValueAtTime(0, c.currentTime);
    master.gain.linearRampToValueAtTime(0.06, c.currentTime + 0.5);
    master.connect(c.destination);
    _gainNode = master;

    // Opakovacia funkcia — ping každé 1.4s
    var t = c.currentTime + 0.5;
    function schedulePing() {
      if (!_gainNode || _gainNode !== master) return;
      var osc = c.createOscillator();
      var env = c.createGain();
      osc.type = 'sine'; osc.frequency.value = 880;
      env.gain.setValueAtTime(0.08, t);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(env); env.connect(master);
      osc.start(t); osc.stop(t + 0.35);
      // Druhý harmonický
      var osc2 = c.createOscillator();
      var env2 = c.createGain();
      osc2.type = 'sine'; osc2.frequency.value = 1320;
      env2.gain.setValueAtTime(0.04, t + 0.05);
      env2.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      osc2.connect(env2); env2.connect(master);
      osc2.start(t + 0.05); osc2.stop(t + 0.3);
      t += 1.4;
      setTimeout(schedulePing, 1350);
    }
    schedulePing();
  }

  // Glitch burst pre cinematic
  function glitchBurst() {
    var c = _ac(); if (!c) return;
    // Krátky noise burst
    var buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
    var src = c.createBufferSource();
    src.buffer = buf;
    var dist = c.createWaveShaper();
    var curve = new Float32Array(256);
    for (var j=0;j<256;j++) { var x=j*2/256-1; curve[j]=x<0?-1:1; }
    dist.curve = curve;
    var g = c.createGain(); g.gain.value = 0.15;
    src.connect(dist); dist.connect(g); g.connect(c.destination);
    src.start(); src.stop(c.currentTime + 0.05);

    // Pitch sweep down
    var sw = c.createOscillator();
    var sg = c.createGain();
    sw.type = 'sawtooth'; sw.frequency.setValueAtTime(800, c.currentTime);
    sw.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.3);
    sg.gain.setValueAtTime(0.1, c.currentTime);
    sg.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.3);
    sw.connect(sg); sg.connect(c.destination);
    sw.start(); sw.stop(c.currentTime + 0.32);
  }

  return {
    // Sekcia menu — hlboký drone v A1 (55Hz) + E2 (82Hz)
    menu: function(){
      if (_section === 'menu') return;
      _stopCurrent(1.5);
      _section = 'menu';
      setTimeout(function(){
        _gainNode = _drone(55, 82.4, 0.07, 0.12, 3);
      }, 200);
    },

    // Loading — pulzujúci ping
    loading: function(){
      if (_section === 'loading') return;
      _stopCurrent(0.8);
      _section = 'loading';
      setTimeout(function(){ _startLoadingPulse(); }, 300);
    },

    // Hra — drone vyšší, napätejší (D2=73Hz, A2=110Hz)
    game: function(){
      if (_section === 'game') return;
      _stopCurrent(2.0);
      _section = 'game';
      setTimeout(function(){
        _gainNode = _drone(73.4, 110, 0.04, 0.08, 2);
      }, 500);
    },

    // Glitch burst pri cinematic
    glitch: glitchBurst,

    stop: function(){ _stopCurrent(1.5); _section = null; },
    getSection: function(){ return _section; }
  };
})();

// ── HOOK AMBIENT DO STAVOV ────────────────────────────────────────
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    // Menu ambient — po načítaní menu (keď je viditeľné)
    var origShowMenu = window.showMainMenu;
    window.showMainMenu = function(){
      if(origShowMenu) origShowMenu.apply(this, arguments);
      setTimeout(function(){ AmbientSound.menu(); }, 500);
    };

    // Loading sequence — spusti loading ambient
    // Hook na loading bar animáciu
    var lo = document.getElementById('loading-overlay');
    if (lo) {
      var obs = new MutationObserver(function(m){
        m.forEach(function(mut){
          if (mut.target.classList.contains('done')) {
            AmbientSound.menu();
            obs.disconnect();
          }
        });
      });
      obs.observe(lo, { attributes:true, attributeFilter:['class'] });
      // Spusti loading ping keď sa začne loading
      setTimeout(function(){ AmbientSound.loading(); }, 100);
    }

    // Hra ambient — keď hráč klikne nová/načítať
    var newBtn = document.getElementById('menu-new-btn');
    var loadBtn = document.getElementById('menu-load-btn');
    if (newBtn) newBtn.addEventListener('click', function(){
      AmbientSound.stop();
      // Glitch bursts počas cinematicu
      setTimeout(function(){ AmbientSound.glitch(); }, 400);
      setTimeout(function(){ AmbientSound.glitch(); }, 900);
      setTimeout(function(){ AmbientSound.glitch(); }, 2100);
      setTimeout(function(){ AmbientSound.glitch(); }, 3200);
      // Hra ambient po cinematicu
      setTimeout(function(){ AmbientSound.game(); }, 4500);
    });
    if (loadBtn) loadBtn.addEventListener('click', function(){
      AmbientSound.stop();
      setTimeout(function(){ AmbientSound.game(); }, 2000);
    });

    // Ak je hráč už v hre (refresh)
    setTimeout(function(){
      if (typeof StateMachine !== 'undefined' &&
          StateMachine.is && StateMachine.is(StateMachine.STATES && StateMachine.STATES.PLAYING)) {
        AmbientSound.game();
      }
    }, 1000);
  });
})();

// ── QUEST SYSTEM ─────────────────────────────────────────────────
var QuestSystem = (function(){
  // Definície questov — title, desc, icon, reward, check fn
  var _defs = {};
  var _popupTimer = null;

  function activate(def) {
    _defs[def.id] = def;
    if (!S.flags) S.flags = {};
    if (S.flags['quest_active_' + def.id]) return; // už aktívny
    S.flags['quest_active_' + def.id] = true;
    // Popup notifikácia
    _showPopup('📋', 'NOVÝ QUEST', def.title, def.desc, def.reward, false);
    updateTracker();
    if (typeof SFX !== 'undefined') {
      SFX.choicePositive();
      setTimeout(function(){ SFX.choicePositive(); }, 200);
    }
  }

  function complete(id) {
    if (!S.flags) S.flags = {};
    S.flags['quest_done_' + id] = true;
    S.flags['quest_active_' + id] = false;
    var def = _defs[id] || {};
    _showPopup('✅', 'QUEST SPLNENÝ', def.title || id, def.desc || '', def.reward || '', true);
    updateTracker();
    if (typeof SFX !== 'undefined') SFX.levelUp();
  }

  function isDone(id) {
    return !!(S.flags && S.flags['quest_done_' + id]);
  }
  function isActive(id) {
    return !!(S.flags && S.flags['quest_active_' + id]);
  }

  function _showPopup(icon, label, title, desc, reward, done) {
    var p = document.getElementById('quest-popup');
    if (!p) return;
    if (_popupTimer) clearTimeout(_popupTimer);
    document.getElementById('quest-popup-icon').textContent  = icon;
    document.getElementById('quest-popup-label').textContent = label;
    document.getElementById('quest-popup-title').textContent = title || '';
    document.getElementById('quest-popup-desc').textContent  = desc  || '';
    document.getElementById('quest-popup-reward').textContent = reward ? ('▲ ' + reward) : '';
    p.style.borderColor = done ? 'var(--green)' : 'var(--cyan)';
    p.classList.add('show');
    _popupTimer = setTimeout(function(){ p.classList.remove('show'); }, 5000);
  }

  function updateTracker() {
    var list = document.getElementById('quest-tracker-list');
    if (!list || !S.flags) return;
    var html = '';
    // Zbierame všetky aktívne a splnené questy
    var allIds = Object.keys(_defs);
    // Pridáme aj questy čo možno neboli cez activate() ale sú v flags
    Object.keys(S.flags).forEach(function(k){
      if (k.indexOf('quest_active_') === 0 || k.indexOf('quest_done_') === 0) {
        var id = k.replace('quest_active_','').replace('quest_done_','');
        if (allIds.indexOf(id) === -1) allIds.push(id);
      }
    });
    allIds.forEach(function(id){
      var def = _defs[id] || { title: id, icon: '📋', giver: '?', desc: '', reward: '' };
      var done   = isDone(id);
      var active = isActive(id);
      if (!active && !done) return;
      var progress = '';
      if (active && def.progress) progress = def.progress();
      html += '<div class="quest-item ' + (done ? 'done' : 'active') + '">' +
        '<div class="quest-item-giver">' + (def.icon||'📋') + ' ' + (def.giver||'') + '</div>' +
        '<div class="quest-item-title">' + (def.title||id) + '</div>' +
        (progress ? '<div class="quest-item-progress">Priebeh: <span>' + progress + '</span></div>' : '') +
        (done ? '<div class="quest-item-progress" style="color:var(--green)">✓ Splnený</div>' :
                '<div class="quest-item-progress">' + (def.reward||'') + '</div>') +
        '</div>';
    });
    if (!html) html = '<div style="color:var(--text-dim);font-size:11px;padding:4px 0;font-family:var(--font-mono)">// žiadne aktívne questy //</div>';
    list.innerHTML = html;
  }

  // Obnov defs po načítaní (S sa mení)
  function restoreDefs() {
    // Predregistruj known questy
    [
      { id:'michal_usbc', giver:'Michal', title:'USB-C kábel pre Michala',
        desc:'Kúp USB-C data-bridge kábel v Korzo OC (120₿) a prines ho Michalovi.',
        icon:'🔌', reward:'+200₿ · +40 XP',
        check: function(){ return hasItem('usbc_kabel'); } },
      { id:'rybari_ryby', giver:'Fero (Rybári)', title:'3 ryby pre Fera',
        desc:'Chyť 3 ryby v minihre a doprines ich Ferovi osobne.',
        icon:'🐟', reward:'Starý prút (equip) · +30 XP · +10 rep',
        check: function(){ return (S.flags['rybari_ryby_caught']||0) >= 3; },
        progress: function(){ return (S.flags['rybari_ryby_caught']||0) + '/3'; } },
    ].forEach(function(d){ _defs[d.id] = d; });
  }

  document.addEventListener('DOMContentLoaded', function(){
    restoreDefs();
    setTimeout(updateTracker, 500);
  });

  return { activate: activate, complete: complete, isDone: isDone, isActive: isActive, updateTracker: updateTracker, restoreDefs: restoreDefs };
})();

// ── FISHING HOOK — počítanie rýb pre quest ────────────────────────
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      // Patch addFishCaught ak existuje, inak patch cez fishing button
      var origOpenFishing = window.openFishing;
      if (!origOpenFishing) return;
      // Hook na fishing catch event — hľadáme kde sa fish pridáva
      var origAddFish = window.addFishCaught;
      if (typeof origAddFish === 'function') {
        window.addFishCaught = function(fish){
          origAddFish.apply(this, arguments);
          if (QuestSystem.isActive('rybari_ryby') && !QuestSystem.isDone('rybari_ryby')) {
            S.flags['rybari_ryby_caught'] = (S.flags['rybari_ryby_caught']||0) + 1;
            var cnt = S.flags['rybari_ryby_caught'];
            showNotif('🐟 Ryba pre Fera: ' + cnt + '/3');
            QuestSystem.updateTracker();
            if (cnt >= 3) showNotif('✅ Máš 3 ryby — choď k Ferovi na Mŕtve Rameno!');
          }
        };
      } else {
        // Fallback — monitoruj S.fishCaught zmeny každé 2s
        var _lastTotal = 0;
        setInterval(function(){
          if (!QuestSystem.isActive('rybari_ryby') || QuestSystem.isDone('rybari_ryby')) return;
          var total = 0;
          if (S.fishCaught) Object.keys(S.fishCaught).forEach(function(k){ total += S.fishCaught[k]||0; });
          if (total > _lastTotal) {
            var gained = total - _lastTotal;
            _lastTotal = total;
            var prev = S.flags['rybari_ryby_caught']||0;
            S.flags['rybari_ryby_caught'] = Math.min(3, prev + gained);
            var cnt = S.flags['rybari_ryby_caught'];
            showNotif('🐟 Ryba pre Fera: ' + cnt + '/3');
            QuestSystem.updateTracker();
            if (cnt >= 3) showNotif('✅ Máš 3 ryby — vráť sa k Ferovi!');
          }
        }, 2000);
      }
    }, 400);
  });
})();

// ── ITEM DEFINÍCIE — prut bonus ───────────────────────────────────
// Patch getFishingBonus — prut v special slotu dáva +30%
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      // Fishing bonus hook
      var origClick = window.clickerFish;
      if (typeof origClick === 'function') {
        window.clickerFish = function(){
          // Prut bonus — aplikuje sa v fishing minihre
          origClick.apply(this, arguments);
        };
      }
      // Registruj prut do item databázy ak existuje
      if (typeof ITEM_DB !== 'undefined') {
        ITEM_DB['fero_prut'] = { name:'Ferov prút 🎣', desc:'Starý bambusový prút. +30% šanca chytenia ryby.', slot:'special', bonus:{ fishing: 0.3 } };
        ITEM_DB['usbc_kabel'] = { name:'USB-C kábel 🔌', desc:'Data-bridge chip. Michal ho potrebuje pre Uzol 7.', slot:null };
      }
    }, 300);
  });
})();

// ── SETTINGS MODULE ──────────────────────────────────────────────
var Settings = (function(){

  // ── i18n strings ─────────────────────────────────────────────
  var I18N = {
    sk: {
      // Topbar
      topbar_title:   'CEO ZLA',
      choices_label:  '// VOĽBY //',
      // Left panel
      sec_stats:      'Štatistiky',
      sec_income:     'Pasívny príjem',
      sec_factions:   'Frakcie // Lojalita',
      sec_ops:        'Operačné ciele',
      sec_quests:     '📋 Questy',
      sec_textmap:    '🗺 Mapa // Lokácie',
      // Tabs
      tab_agent:      '🕵 Agent',
      tab_map:        '⌖ Mapa',
      tab_op:         '⚡ Operácia',
      tab_gym:        '💪 Gym',
      tab_hq:         '🏠 Základňa',
      tab_shop:       '🛒 Obchod',
      tab_hack:       '💻 Hack',
      tab_factions:   '⚔ Frakcie',
      // Inv panel
      inv_items:      '🎒 Predmety',
      inv_equip:      '⚔️ Výstroj',
      inv_fish:       '🐟 Ryby',
      inv_shop:       '🛒 Obchod',
      inv_log:        '📋 Log',
      // Settings
      set_music:      '🔊 Hudba',
      set_textsize:   '🔡 Veľkosť textu',
      set_typewriter: '⌨️ Typewriter efekt',
      set_tw_fast:    'Rýchly',
      set_tw_slow:    'Pomalý',
      set_tw_off:     'Vyp.',
      set_scanlines:  '📺 Scanlines',
      set_brightness: '🌙 Jas obrazovky',
      set_notif:      '🔔 Notifikácie',
      set_save:       '💾 Save súbor',
      set_export:     '📋 Exportovať save',
      set_import:     '📥 Importovať save',
      set_savegame:   '💾 Uložiť hru',
      set_loadgame:   '📂 Načítať hru',
      set_mainmenu:   '🏠 Hlavné menu',
      // Menu
      menu_new:       '[ NOVÁ HRA ]',
      menu_load:      '[ NAČÍTAŤ ULOŽENÚ ]',
      // Notifs
      notif_save:     '💾 Hra uložená',
      notif_export:   '📋 Save skopírovaný do schránky',
      notif_import_ok:'✅ Save importovaný',
      notif_import_err:'❌ Neplatný save súbor',
      notif_brightness:'🌙 Jas:',
    },
    en: {
      topbar_title:   'CEO OF EVIL',
      choices_label:  '// CHOICES //',
      sec_stats:      'Statistics',
      sec_income:     'Passive Income',
      sec_factions:   'Factions // Loyalty',
      sec_ops:        'Operational Goals',
      sec_quests:     '📋 Quests',
      sec_textmap:    '🗺 Map // Locations',
      tab_agent:      '🕵 Agent',
      tab_map:        '⌖ Map',
      tab_op:         '⚡ Operation',
      tab_gym:        '💪 Gym',
      tab_hq:         '🏠 HQ',
      tab_shop:       '🛒 Shop',
      tab_hack:       '💻 Hack',
      tab_factions:   '⚔ Factions',
      inv_items:      '🎒 Items',
      inv_equip:      '⚔️ Equipment',
      inv_fish:       '🐟 Fish',
      inv_shop:       '🛒 Shop',
      inv_log:        '📋 Log',
      set_music:      '🔊 Music',
      set_textsize:   '🔡 Text Size',
      set_typewriter: '⌨️ Typewriter Effect',
      set_tw_fast:    'Fast',
      set_tw_slow:    'Slow',
      set_tw_off:     'Off',
      set_scanlines:  '📺 Scanlines',
      set_brightness: '🌙 Screen Brightness',
      set_notif:      '🔔 Notifications',
      set_save:       '💾 Save File',
      set_export:     '📋 Export Save',
      set_import:     '📥 Import Save',
      set_savegame:   '💾 Save Game',
      set_loadgame:   '📂 Load Game',
      set_mainmenu:   '🏠 Main Menu',
      menu_new:       '[ NEW GAME ]',
      menu_load:      '[ LOAD SAVE ]',
      notif_save:     '💾 Game Saved',
      notif_export:   '📋 Save copied to clipboard',
      notif_import_ok:'✅ Save imported',
      notif_import_err:'❌ Invalid save file',
      notif_brightness:'🌙 Brightness:',
    }
  };

  var _lang        = localStorage.getItem('cfg_lang')        || 'sk';
  var _fontSize    = localStorage.getItem('cfg_fontSize')    || 'medium';
  var _typewriter  = localStorage.getItem('cfg_typewriter')  || 'fast';
  var _scanlines   = localStorage.getItem('cfg_scanlines')   !== 'off';
  var _brightness  = parseInt(localStorage.getItem('cfg_brightness') || '100');
  var _notif       = localStorage.getItem('cfg_notif')       !== 'off';

  // ── Apply on load ─────────────────────────────────────────────
  function init() {
    _applyFontSize(_fontSize);
    _applyTypewriter(_typewriter);
    _applyScanlines(_scanlines);
    _applyBrightness(_brightness);
    _applyLang(_lang);
    _syncUI();
  }

  // ── Font size ─────────────────────────────────────────────────
  function setFontSize(size) {
    _fontSize = size;
    localStorage.setItem('cfg_fontSize', size);
    _applyFontSize(size);
    _syncUI();
  }
  function _applyFontSize(size) {
    var map = { small:'13px', medium:'16px', large:'20px' };
    document.documentElement.style.setProperty('--scene-fs', map[size] || '16px');
    // Aj choice buttons
    var s2 = { small:'11px', medium:'13px', large:'16px' };
    document.documentElement.style.setProperty('--choice-fs', s2[size] || '13px');
  }

  // ── Typewriter ────────────────────────────────────────────────
  function setTypewriter(mode) {
    _typewriter = mode;
    localStorage.setItem('cfg_typewriter', mode);
    _applyTypewriter(mode);
    _syncUI();
  }
  function _applyTypewriter(mode) {
    if (typeof Typewriter !== 'undefined' && typeof Typewriter.setDelay === 'function') {
      if (mode === 'fast') Typewriter.setDelay(18);
      else if (mode === 'slow') Typewriter.setDelay(55);
      else Typewriter.setDelay(0);
    }
  }

  // ── Scanlines ─────────────────────────────────────────────────
  function toggleScanlines() {
    _scanlines = !_scanlines;
    localStorage.setItem('cfg_scanlines', _scanlines ? 'on' : 'off');
    _applyScanlines(_scanlines);
    _syncUI();
  }
  function _applyScanlines(on) {
    document.body.classList.toggle('no-scanlines', !on);
  }

  // ── Brightness ────────────────────────────────────────────────
  function setBrightness(val) {
    _brightness = parseInt(val);
    localStorage.setItem('cfg_brightness', _brightness);
    _applyBrightness(_brightness);
    document.getElementById('brightness-label').textContent = _brightness + '%';
  }
  function _applyBrightness(val) {
    document.body.style.filter = val < 100 ? 'brightness(' + (val/100) + ')' : '';
    var sl = document.getElementById('brightness-slider');
    if (sl) sl.value = val;
    var lb = document.getElementById('brightness-label');
    if (lb) lb.textContent = val + '%';
  }

  // ── Notifikácie ───────────────────────────────────────────────
  function toggleNotif() {
    _notif = !_notif;
    localStorage.setItem('cfg_notif', _notif ? 'on' : 'off');
    _syncUI();
  }
  function isNotifEnabled() { return _notif; }

  // ── Export / Import save ──────────────────────────────────────
  function exportSave() {
    var key = 'ceoZlaSave';
    var data = localStorage.getItem(key);
    if (!data) { showNotif('❌ Žiadny save'); return; }
    try {
      navigator.clipboard.writeText(data).then(function(){
        showNotif(t('notif_export'));
      }).catch(function(){
        // Fallback — textarea
        var ta = document.createElement('textarea');
        ta.value = data; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showNotif(t('notif_export'));
      });
    } catch(e) { showNotif('❌ Export zlyhal'); }
  }

  function importSave() {
    var input = prompt('📥 Vlož save JSON:');
    if (!input) return;
    try {
      var parsed = JSON.parse(input);
      if (!parsed.scene && !parsed.hp) throw new Error('invalid');
      localStorage.setItem('ceoZlaSave', input);
      showNotif(t('notif_import_ok'));
      setTimeout(function(){ loadGame(); }, 500);
    } catch(e) {
      showNotif(t('notif_import_err'));
    }
  }

  // ── Language ──────────────────────────────────────────────────
  function setLang(lang) {
    _lang = lang;
    localStorage.setItem('cfg_lang', lang);
    _applyLang(lang);
    _syncUI();
  }
  function t(key) { return (I18N[_lang] && I18N[_lang][key]) || (I18N['sk'][key]) || key; }
  function _applyLang(lang) {
    var s = I18N[lang] || I18N['sk'];
    // i18n data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if (s[key]) el.textContent = s[key];
    });
    // Specific elements
    _setText('topbar-title',     s.topbar_title);
    _setText('choices-label',    s.choices_label);
    // Left panel headers
    _setPanelHeader('sec-stats',   s.sec_stats);
    _setPanelHeader('sec-income',  s.sec_income);
    _setPanelHeader('sec-factions',s.sec_factions);
    _setPanelHeader('sec-ops',     s.sec_ops);
    _setPanelHeader('sec-quests',  s.sec_quests);
    _setPanelHeader('sec-textmap', s.sec_textmap);
    // Topbar tabs
    _setTabText('tab_op',      s.tab_op);
    _setTabText('tab_agent',   s.tab_agent);
    _setTabText('tab_map',     s.tab_map);
    _setTabText('tab_gym',     s.tab_gym);
    _setTabText('tab_hq',      s.tab_hq);
    _setTabText('tab_shop',    s.tab_shop);
    _setTabText('tab_hack',    s.tab_hack);
    _setTabText('tab_factions',s.tab_factions);
    // Inv tabs
    _setInvTab(0, s.inv_items);
    _setInvTab(1, s.inv_equip);
    _setInvTab(2, s.inv_fish);
    _setInvTab(3, s.inv_shop);
    _setInvTab(4, s.inv_log);
    // Menu buttons
    var nb = document.getElementById('menu-new-btn');
    if (nb) nb.textContent = s.menu_new;
    var lb = document.getElementById('menu-load-btn');
    if (lb) lb.textContent = s.menu_load;
    // Settings btn title
    var sb = document.getElementById('settings-btn');
    if (sb) sb.title = lang === 'en' ? 'Settings' : 'Nastavenia';
    // choices-label live
    var cl = document.getElementById('choices-label');
    if (cl) cl.textContent = s.choices_label;
    // Quest tracker empty text — rebuildne sa automaticky
    document.documentElement.lang = lang;
  }
  function _setText(id, val) {
    if (!val) return;
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function _setPanelHeader(bodyId, text) {
    if (!text) return;
    var body = document.getElementById(bodyId);
    if (!body) return;
    var header = body.previousElementSibling;
    if (!header) return;
    var title = header.querySelector('.panel-header-title');
    if (title) title.textContent = text;
  }
  function _setTabText(dataId, text) {
    if (!text) return;
    var tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(function(t){
      // Match by current text content pattern
      if (t.getAttribute('data-lang-id') === dataId) t.textContent = text;
    });
  }
  function _setInvTab(idx, text) {
    if (!text) return;
    var tabs = document.querySelectorAll('.inv-ptab');
    if (tabs[idx]) tabs[idx].textContent = text;
  }

  // ── Sync UI state (buttons active/inactive) ───────────────────
  function _syncUI() {
    // Font size
    ['small','medium','large'].forEach(function(s){
      var btn = document.getElementById('fs-' + s);
      if (btn) btn.classList.toggle('active', s === _fontSize);
    });
    // Typewriter
    ['fast','slow','off'].forEach(function(s){
      var btn = document.getElementById('tw-' + s);
      if (btn) btn.classList.toggle('active', s === _typewriter);
    });
    // Scanlines
    var slBtn = document.getElementById('scanlines-toggle');
    if (slBtn) {
      slBtn.textContent = _scanlines ? 'ON' : 'OFF';
      slBtn.classList.toggle('off', !_scanlines);
    }
    // Notif
    var nBtn = document.getElementById('notif-toggle');
    if (nBtn) {
      nBtn.textContent = _notif ? 'ON' : 'OFF';
      nBtn.classList.toggle('off', !_notif);
    }
    // Lang
    ['sk','en'].forEach(function(l){
      var btn = document.getElementById('lang-' + l);
      if (btn) btn.classList.toggle('active', l === _lang);
    });
  }

  return { init:init, setFontSize:setFontSize, setTypewriter:setTypewriter,
           toggleScanlines:toggleScanlines, setBrightness:setBrightness,
           toggleNotif:toggleNotif, isNotifEnabled:isNotifEnabled,
           exportSave:exportSave, importSave:importSave,
           setLang:setLang, t:t };
})();

// ── Init Settings po DOM ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function(){ Settings.init(); });

// ── Patch showNotif — respektuje notif toggle ─────────────────────
(function(){
  var _orig = window.showNotif;
  window.showNotif = function(msg, dur){
    if (!Settings.isNotifEnabled()) return;
    if (_orig) _orig(msg, dur);
  };
})();

// ── Patch Typewriter — pridaj setDelay ────────────────────────────
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      if (typeof Typewriter !== 'undefined' && !Typewriter.setDelay) {
        Typewriter.setDelay = function(ms){
          Typewriter._delay = ms;
        };
        // Patch type() aby používal _delay
        var _origType = Typewriter.type;
        Typewriter.type = function(el, html){
          if (Typewriter._delay === 0) {
            el.innerHTML = html; return Promise.resolve();
          }
          return _origType.call(Typewriter, el, html);
        };
      }
    }, 200);
  });
})();

// ── Scanlines OFF CSS ─────────────────────────────────────────────
// (vložíme inline style tag pre no-scanlines triedu)
(function(){
  var style = document.createElement('style');
  style.textContent = 'body.no-scanlines::after { display:none !important; }';
  document.head.appendChild(style);
})();

// ── Tab buttons — pridaj data-lang-id atribúty ───────────────────
document.addEventListener('DOMContentLoaded', function(){
  var tabs = document.querySelectorAll('.tab-btn');
  var langIds = ['tab_op','tab_agent','tab_map','tab_gym','tab_hq','tab_shop','tab_hack','tab_factions'];
  tabs.forEach(function(t, i){ if (langIds[i]) t.setAttribute('data-lang-id', langIds[i]); });
});
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    var btn  = document.getElementById('settings-btn');
    var drop = document.getElementById('settings-dropdown');
    if (!btn || !drop) return;
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      drop.classList.toggle('open');
    });
    document.addEventListener('click', function(e){
      if (!drop.contains(e.target) && e.target !== btn) drop.classList.remove('open');
    });
  });
})();

// ── WEB AUDIO SFX ENGINE ──────────────────────────────────────────
var SFX = (function(){
  var _ctx = null;
  function _ac() {
    if (!_ctx) {
      try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    }
    // Resume if suspended (browser autoplay policy)
    if (_ctx && _ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  // Generic beep: freq Hz, type, duration s, volume 0-1, decay shape
  function _beep(freq, type, dur, vol, attack) {
    var c = _ac(); if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, c.currentTime);
    vol = vol || 0.12;
    attack = attack || 0.005;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.start(c.currentTime);
    o.stop(c.currentTime + dur + 0.02);
  }

  function _noise(dur, vol) {
    var c = _ac(); if (!c) return;
    var buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i=0;i<data.length;i++) data[i]=(Math.random()*2-1);
    var src = c.createBufferSource();
    src.buffer = buf;
    var g = c.createGain();
    var f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 800;
    src.connect(f); f.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(vol||0.04, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.start(); src.stop(c.currentTime + dur + 0.01);
  }

  return {
    // UI klik — krátky synth tick
    click: function(){ _beep(880,'square',0.04,0.08,0.002); },

    // Navigácia / prechod scény
    navigate: function(){
      _beep(440,'square',0.03,0.07,0.002);
      setTimeout(function(){ _beep(660,'square',0.04,0.06,0.002); },40);
    },

    // Voľba — neutrálna
    choice: function(){ _beep(523,'square',0.05,0.1,0.003); },

    // Voľba — pozitívna (HP/XP gain)
    choicePositive: function(){
      _beep(523,'square',0.04,0.09,0.002);
      setTimeout(function(){ _beep(784,'square',0.06,0.08,0.002); },60);
    },

    // Voľba — negatívna (HP/SAN loss)
    choiceNegative: function(){
      _beep(220,'sawtooth',0.08,0.1,0.003);
      setTimeout(function(){ _beep(180,'sawtooth',0.1,0.07,0.002); },50);
    },

    // Typewriter tick — ultra jemný
    type: function(){ _beep(1200+(Math.random()*200),'square',0.008,0.02,0.001); },

    // Hover na button
    hover: function(){ _beep(1000,'sine',0.02,0.03,0.001); },

    // Uložiť / načítať
    save: function(){
      [0,80,160].forEach(function(d,i){
        setTimeout(function(){ _beep(440+i*220,'square',0.06,0.08,0.003); },d);
      });
    },

    // Error / varovanie
    error: function(){ _beep(150,'sawtooth',0.15,0.12,0.005); },

    // Level up
    levelUp: function(){
      [523,659,784,1047].forEach(function(f,i){
        setTimeout(function(){ _beep(f,'square',0.12,0.1,0.005); },i*80);
      });
    },

    // Panel open
    panelOpen: function(){ _beep(660,'square',0.04,0.06,0.002); setTimeout(function(){ _beep(880,'square',0.03,0.05); },35); },

    // Noise burst (combat/damage)
    damage: function(){ _noise(0.08,0.08); setTimeout(function(){ _beep(180,'sawtooth',0.1,0.08); },30); },

    // Boot / init
    boot: function(){
      [220,330,440,550,660].forEach(function(f,i){
        setTimeout(function(){ _beep(f,'square',0.06,0.05,0.003); },i*60);
      });
    }
  };
})();

// ── TYPEWRITER ENGINE ─────────────────────────────────────────────
var Typewriter = (function(){
  var _queue    = [];   // {el, html, resolve}
  var _running  = false;
  var _skip     = false;
  var CHAR_DELAY = 18;  // ms/znak

  // Stripuje HTML tagy pre counting, renderuje HTML na konci
  function _stripTags(html) { var d=document.createElement('div'); d.innerHTML=html; return d.textContent; }

  function _typeText(el, rawHtml, done) {
    var plain = _stripTags(rawHtml);
    var cur   = 0;
    _skip     = false;
    // Zdedí farbu od bubble, žiadne biele pozadie
    el.style.color      = 'inherit';
    el.style.background = 'transparent';
    el.innerHTML        = '';

    function skipFn() { _skip = true; }
    el.addEventListener('click', skipFn, { once: true });
    var wrap = document.getElementById('scene-text-wrap');
    if (wrap) wrap.addEventListener('click', skipFn, { once: true });

    function tick() {
      if (_skip || cur >= plain.length) {
        el.innerHTML = rawHtml;
        done && done();
        return;
      }
      cur++;
      el.innerHTML = plain.substring(0, cur) + '<span class="tw-cursor"></span>';
      if (cur % 3 === 0) SFX.type();
      var ch  = plain[cur-1];
      var dly = (ch==='.' || ch==='!' || ch==='?') ? CHAR_DELAY*6 :
                (ch===',' || ch===';')              ? CHAR_DELAY*3 : CHAR_DELAY;
      setTimeout(tick, dly);
    }
    tick();
  }

  function _process() {
    if (_running || !_queue.length) return;
    _running = true;
    var item = _queue.shift();
    _typeText(item.el, item.html, function(){
      _running = false;
      if (item.resolve) item.resolve();
      _process();
    });
  }

  return {
    type: function(el, html) {
      return new Promise(function(resolve){
        _queue.push({ el:el, html:html, resolve:resolve });
        _process();
      });
    },
    skip: function(){ _skip = true; },
    flush: function(){ _queue = []; _running = false; _skip = true; }
  };
})();

// ── SFXS NA UI EVENTY ────────────────────────────────────────────
(function(){
  document.addEventListener('DOMContentLoaded', function(){

    // Hover zvuk na všetky buttony (okrem micro tlačidiel)
    document.addEventListener('mouseover', function(e){
      var btn = e.target.closest('button:not(.top-micro-btn):not(#audio-toggle-btn)');
      if (btn && !btn.disabled) SFX.hover();
    });

    // Klik zvuk
    document.addEventListener('mousedown', function(e){
      var btn = e.target.closest('button');
      if (btn && !btn.disabled) SFX.click();
    });

    // Sidenav — panelOpen zvuk
    document.querySelectorAll('.sidenav-btn').forEach(function(btn){
      btn.addEventListener('click', function(){ SFX.panelOpen(); });
    });

    // Settings gear rotate CSS
    var settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.style.transition = 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), color 0.15s, background 0.15s';
      settingsBtn.addEventListener('click', function(){
        this.style.transform = this.style.transform === 'rotate(90deg)' ? 'rotate(0deg)' : 'rotate(90deg)';
      });
    }

    // Boot zvuk pri štarte hry (s oneskorením)
    setTimeout(function(){ SFX.boot(); }, 800);
  });
})();

// ── PATCH renderDialogLines — TYPEWRITER ─────────────────────────
(function(){
  // Po načítaní hry patchujeme SceneManager.renderDialogLines
  // aby NPC bubliny typovalo znak po znak
  var _orig = null;
  function _patch() {
    if (typeof SceneManager === 'undefined') { setTimeout(_patch, 100); return; }
    _orig = SceneManager.renderDialogLines;
    SceneManager.renderDialogLines = function(el, text) {
      // Najprv zavolaj pôvodný render (vytvorí DOM)
      _orig.call(SceneManager, el, text);
      // Potom na každú NPC bublinu aplikuj typewriter
      var bubbles = el.querySelectorAll('.dialog-npc-bubble > div');
      if (!bubbles.length) return;
      // Spusti navigate zvuk
      SFX.navigate();
      // Typewrite každú bublinu postupne
      var delay = 0;
      bubbles.forEach(function(div, i){
        var rawHtml = div.innerHTML;
        div.innerHTML = '';
        setTimeout(function(){
          Typewriter.type(div, rawHtml);
        }, delay);
        delay += 80; // krátka medzera medzi bublinami
      });
    };
  }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(_patch, 200); });
})();

// ── PATCH choice onclick — SFX podľa typu ────────────────────────
(function(){
  var _origRender = null;
  function _patchChoices() {
    if (typeof SceneManager === 'undefined') { setTimeout(_patchChoices, 150); return; }
    var origRenderChoices = SceneManager.renderChoices;
    SceneManager.renderChoices = function(choices) {
      origRenderChoices.call(SceneManager, choices);
      // Pridaj SFX na každý choice btn
      var wrap = document.getElementById('choices-wrap');
      if (!wrap) return;
      wrap.querySelectorAll('.choice-btn:not(:disabled)').forEach(function(btn, i){
        var ch = choices && choices[i];
        var origClick = btn.onclick;
        btn.onclick = function(e){
          if (ch && (ch.hp < 0 || ch.san < -3)) SFX.choiceNegative();
          else if (ch && (ch.xp > 0 || ch.san > 0)) SFX.choicePositive();
          else SFX.choice();
          if (origClick) origClick.call(btn, e);
        };
      });
    };
  }
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(_patchChoices, 250); });
})();

// ── PATCH gainXP — levelUp SFX ───────────────────────────────────
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      if (typeof gainXP !== 'undefined') {
        var _gxp = gainXP;
        window.gainXP = function(amount){
          var prevLevel = (typeof S !== 'undefined') ? S.level : 0;
          _gxp(amount);
          if (typeof S !== 'undefined' && S.level > prevLevel) SFX.levelUp();
        };
      }
    }, 300);
  });
})();

// ── SAVE/LOAD SFX ────────────────────────────────────────────────
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      if (typeof saveGame !== 'undefined') {
        var _save = saveGame;
        window.saveGame = function(){ SFX.save(); _save(); };
      }
    }, 400);
  });
})();
