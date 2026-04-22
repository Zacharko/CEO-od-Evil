'use strict';

/* ════════════════════════════════════════════════════════════════════
   UI/ENGINE: Shims, kurzy, profesie, herné helpery, save/load, log
   Závislosti: config.js, data/items.js, systems/state.js,
              systems/renderer.js, systems/scene.js, systems/hunger.js
════════════════════════════════════════════════════════════════════ */

BACKWARD-COMPATIBLE GLOBAL SHIMS
   (These bridge the modular API to the original function names so
    all inline HTML onclick="" attributes still work unchanged.)
════════════════════════════════════════════════════════════════════ */
function goTo(id)            { SceneManager.goTo(id); }
function enterLocation(id)   { SceneManager.enterLocation(id); }
function updateStats()       { Renderer.updateStats(); }
function updateMoneyDisplay(){ Renderer.updateMoney(); }
function updateIncomeDisplay(){ Renderer.updateIncome(); }
function updateInventoryPane(){ Renderer.updateInventory(); }
function renderEquipPane()   { Renderer.updateEquip(); }
function updateFishPane()    { Renderer.updateFish(); }
function updateFlags()       { Renderer.updateFlags(); }
function renderShop()        { Renderer.updateShop(); }

/* ════════════════════════════════════════════════════════════════════


function selectJob(jobId) {
  S.job = jobId; S.jobLevel = 0;
  var jdef = JOBS[jobId];
  S.income.job  = jdef.salary[0];
  S.attrRates   = Object.assign({}, jdef.attrRates);
  var jb = document.getElementById('topbar-job');
  jb.textContent = jdef.titles[0]; jb.style.display = '';
  document.getElementById('job-overlay').classList.add('hidden');
  Renderer.updateIncome();
  addLog('Nástup do práce: ' + jdef.titles[0] + ' // CEO Zla Corp.', 'ok');
  showNotif('Vitaj v práci! Plat: ' + jdef.salary[0] + '₿/s');
  goTo('start');
  HungerSystem.init();
}

function checkJobPromotion() {
  if (!S.job || S.jobLevel >= 2) return;
  var threshold = JOB_PROMO_THRESHOLDS[S.jobLevel];
  if (S.money >= threshold) {
    S.jobLevel++;
    var jdef = JOBS[S.job];
    S.income.job = jdef.salary[S.jobLevel];
    Object.keys(S.attrRates).forEach(function(k){
      S.attrRates[k] = jdef.attrRates[k] * (1 + S.jobLevel * 0.5);
    });
    var title = jdef.titles[S.jobLevel];
    document.getElementById('topbar-job').textContent = title;
    addLog('🎉 POVÝŠENIE! Nová pozícia: ' + title, 'ok');
    showNotif('⬆ Povýšenie! ' + title + ' // Plat: ' + S.income.job + '₿/s');
  }
}

function activityAttrBonus(type) {
  if (!S.job) return;
  var jdef  = JOBS[S.job];
  var bonus = jdef.activityBonus[type] || jdef.activityBonus['any'] || {};
  Object.keys(bonus).forEach(function(attr) {
    var val = bonus[attr];
    if (attr === 'str')   S.str      = Math.min(100, S.str    + val);
    if (attr === 'flex')  S.flex     = Math.min(100, S.flex   + val);
    if (attr === 'hack')  S.hackStat = Math.min(100, S.hackStat + val);
    if (attr === 'san')   S.san      = Math.min(100, S.san    + val);
    if (attr === 'hp')    S.hp       = Math.min(100, Math.max(0, S.hp + val));
    if (attr === 'bonus') S.income.bonus += val;
  });
  Renderer.updateStats(); Renderer.updateIncome();
}

/* ── ENGINE HELPERY ───────────────────────────────────────────── */

function hasItem(id) { return S.inventory.indexOf(id) > -1; }

function addItem(id) {
  if (ITEMS[id] && !hasItem(id)) {
    S.inventory.push(id);
    addLog('+ ' + ITEMS[id].name, 'ok');
    Renderer.updateInventory();
    showNotif('Získal si: ' + ITEMS[id].icon + ' ' + ITEMS[id].name);
  }
}

function removeItem(id) {
  var idx = S.inventory.indexOf(id);
  if (idx > -1) { S.inventory.splice(idx,1); Renderer.updateInventory(); }
}

function gainXP(n) {
  S.xp += n;
  var needed = S.level * GameConfig.XP_PER_LEVEL_MULT;
  if (S.xp >= needed) {
    S.level++; S.xp -= needed;
    addLog('LEVEL UP! Teraz level ' + S.level + '.', 'ok');
    showNotif('⬆ Level ' + S.level + '!');
  }
  Renderer.updateStats();
}

function activateOp(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    var dot = el.querySelector('.op-dot');
    if (dot) dot.classList.add('active');
  }
  S.flags[id] = true;
}

function handleChoiceAction(ch) {
  if (ch.action === 'openFishing') openFishing();
  if (ch.action === 'openShop') switchInvTab('shop');
}

/* ── LOG ──────────────────────────────────────────────────────── */
function addLog(msg, cls) {
  var wrap = document.getElementById('log-wrap');
  if (!wrap) return;
  var line = document.createElement('div');
  line.className = 'log-line' + (cls ? ' '+cls : '');
  line.textContent = '> ' + msg;
  wrap.appendChild(line);
  while (wrap.children.length > GameConfig.LOG_MAX_LINES) wrap.removeChild(wrap.firstChild);
  wrap.scrollTop = wrap.scrollHeight;
}

/* ── NOTIFICATIONS ────────────────────────────────────────────── */
var _notifTimer = null;
function showNotif(msg) {
  var el = document.getElementById('notif');
  if (!el) return;
  el.textContent = '> ' + msg;
  el.classList.add('show');
  if (_notifTimer) clearTimeout(_notifTimer);
  _notifTimer = setTimeout(function(){ el.classList.remove('show'); }, GameConfig.NOTIF_DURATION_MS);
}

/* ── VIEW SWITCHING ───────────────────────────────────────────── */
function switchView(v) {
  document.querySelectorAll('#topbar-tabs .tab-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('#left-nav .sidenav-btn').forEach(function(b){ b.classList.remove('active'); });
  var tabs = document.querySelectorAll('#topbar-tabs .tab-btn');
  var sideBtn = document.querySelector('#left-nav .sidenav-btn[data-view="'+v+'"]');
  if (sideBtn) sideBtn.classList.add('active');
  ['uni-overlay','gym-overlay','boats-overlay','hq-overlay','garden-overlay'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.classList.remove('show');
  });
  var tMap = { game:0, fish:1, boats:2, garden:3, uni:4, gym:5, hq:6, shop:7 };
  if (tMap[v] !== undefined && tabs[tMap[v]]) tabs[tMap[v]].classList.add('active');
  if (v==='fish')   { openFishing(); }
  if (v==='boats')  { document.getElementById('boats-overlay').classList.add('show'); renderBoatsOverlay(); }
  if (v==='garden') { document.getElementById('garden-overlay').classList.add('show'); openGarden(); }
  if (v==='uni')    { document.getElementById('uni-overlay').classList.add('show'); renderTrainingView('uni'); }
  if (v==='gym')    { document.getElementById('gym-overlay').classList.add('show'); renderTrainingView('gym'); }
  if (v==='hq')     { document.getElementById('hq-overlay').classList.add('show'); openHQ(); }
  if (v==='shop')   { switchInvTab('shop'); }
}

function switchInvTab(tab) {
  document.querySelectorAll('.inv-tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.inv-pane').forEach(function(p){ p.classList.remove('active'); });
  var tabMap = { items:'inv-pane-items', equip:'inv-pane-equip', fish:'inv-pane-fish', shop:'inv-pane-shop' };
  var pane = document.getElementById(tabMap[tab]); if (pane) pane.classList.add('active');
  var tabEls = document.querySelectorAll('.inv-tab');
  var idx = { items:0, equip:1, fish:2, shop:3 };
  if (tabEls[idx[tab]]) tabEls[idx[tab]].classList.add('active');
  if (tab==='fish')  Renderer.updateFish();
  if (tab==='shop')  Renderer.updateShop();
  if (tab==='equip') Renderer.updateEquip();
}

function toggleSection(id) {
  var body = document.getElementById(id); if (!body) return;
  var toggle = document.getElementById('toggle-' + id);
  body.classList.toggle('collapsed');
  if (toggle) toggle.textContent = body.classList.contains('collapsed') ? '▶' : '▼';
}

/* ── GAME OVER / WIN ─────────────────────────────────────────── */
function gameOver(msg) {
  document.getElementById('go-text').textContent = msg || 'Agent bol kompromitovaný. Operácia zlyhala.';
  document.getElementById('gameover-overlay').classList.add('show');
  GameLoop.stop();
}
function winGame() {
  document.getElementById('win-overlay').classList.add('show');
  GameLoop.stop();
}

/* ── SAVE / LOAD ─────────────────────────────────────────────── */