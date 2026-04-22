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

function getCourseLevel(id)   { return COURSE_STATE[id] ? (COURSE_STATE[id].level || 0) : 0; }
function isEnrolled(id)       { return COURSE_STATE[id] && COURSE_STATE[id].enrolled; }
function getCourseCost(c)     { return Math.floor(c.cost * Math.pow(c.levelMult || 1.8, getCourseLevel(c.id))); }
function getCourseTotalRate(c){ return c.ratePerSec * (getCourseLevel(c.id) || 0); }

function enrollCourse(id, pool) {
  var course = pool.filter(function(c){ return c.id===id; })[0]; if (!course) return;
  var cost = getCourseCost(course);
  if (S.money < cost) { showNotif('Nedostatok kreditov!'); return; }
  if (!COURSE_STATE[id]) COURSE_STATE[id] = { enrolled: false, level: 0, progress: 0 };
  S.money -= cost; Renderer.updateMoney();
  var cs = COURSE_STATE[id]; cs.enrolled = true; cs.level = (cs.level||0) + 1;
  addLog('Zapísaný: ' + course.name + ' (úroveň ' + cs.level + ')', 'ok');
  showNotif('📚 ' + course.name);
  renderTrainingView('uni'); renderTrainingView('gym');
}

function unenrollCourse(id) {
  if (!COURSE_STATE[id]) return;
  COURSE_STATE[id].enrolled = false;
  addLog('Kurz pozastavený.','warn');
  renderTrainingView('uni'); renderTrainingView('gym');
}

function renderTrainingView(type) {
  var pool = type === 'uni' ? UNI_COURSES : GYM_COURSES;
  var gridId = type === 'uni' ? 'uni-courses-grid' : 'gym-courses-grid';
  var grid = document.getElementById(gridId); if (!grid) return;
  var html = '';
  pool.forEach(function(course) {
    var cs = COURSE_STATE[course.id] || { enrolled:false, level:0, progress:0 };
    var lvl = cs.level || 0; var enrolled = cs.enrolled; var maxed = lvl >= course.maxLevel;
    var cost = getCourseCost(course); var canEnroll = !enrolled && S.money >= cost && !maxed;
    var rate = lvl > 0 ? getCourseTotalRate(course) : 0; var pct = cs.progress || 0;
    var blocked = false;
    if (course.requires) {
      var sv = course.stat==='hackStat'?S.hackStat:(course.stat==='str'?S.str:(course.stat==='flex'?S.flex:S.san));
      if (sv < course.requires) blocked = true;
    }
    html += '<div class="course-card ' + (enrolled?'active-course':'') + '">';
    html += '<div class="course-icon">' + course.icon + '</div>';
    html += '<div class="course-name">' + course.name + '</div>';
    html += '<div class="course-desc">' + course.desc + '</div>';
    html += '<div class="course-stats"><span class="course-stat">' + course.statLabel + '</span>';
    if (course.incomeBonus) html += '<span class="course-stat">+' + course.incomeBonus + '₿/s</span>';
    if (course.requires) html += '<span class="course-stat" style="color:' + (blocked?'var(--danger)':'var(--green3)') + '">' + course.stat.replace('hackStat','HCK').replace('str','SIL').replace('flex','OHY').replace('san','SAN') + ' ' + course.requires + '+ req</span>';
    html += '</div>';
    html += '<div class="course-cost">Úroveň: ' + lvl + '/' + course.maxLevel;
    if (!maxed) html += ' | ₿' + cost.toLocaleString('sk'); else html += ' | MAX';
    if (rate > 0) html += ' | +' + rate.toFixed(3) + '/s';
    html += '</div>';
    if (lvl > 0) html += '<div class="course-progress-wrap"><div class="course-progress-bar" id="cprog-' + course.id + '" style="width:' + pct + '%"></div></div>';
    if (blocked) html += '<button class="course-btn" disabled>[ LOCKED — ' + course.requires + ' req ]</button>';
    else if (maxed) html += '<button class="course-btn enrolled">[ MAX LEVEL ✓ ]</button>';
    else if (enrolled) html += '<button class="course-btn enrolled" onclick="unenrollCourse(\'' + course.id + '\')">[ AKTÍVNY — PAUZA ]</button>';
    else html += '<button class="course-btn" ' + (canEnroll?'':'disabled') + ' onclick="enrollCourse(\'' + course.id + '\',' + (type==='uni'?'UNI_COURSES':'GYM_COURSES') + ')">' + (canEnroll?'[ ZAPÍSAŤ — ₿' + cost.toLocaleString('sk') + ' ]':'[ ₿' + cost.toLocaleString('sk') + ' ]') + '</button>';
    html += '</div>';
  });
  grid.innerHTML = html;
}

/* ── SCENE PHOTOS ── */

var JOBS = {
  thug: {
    name: 'THUG',
    titles:    ['Pouličný vymáhač', 'Bos okresu', 'Don Prievidze'],
    salary:    [45, 120, 280],          // ↓ z 158/316/632 — pomalší progres
    attrRates: { hp:0.01, san:-0.008, str:0.03, flex:0.005, hack:0.00 },
    // Thugs sú fyzicky aktívni — rozhodnutia ich stoja viac hladu
    hungerRate: 1.3,
    decisionHungerMult: 1.2,            // +20% hlad za každú voľbu
    activityBonus: { combat:{ str:2, hp:-5 }, fishing:{ flex:1 } }
  },
  hacker: {
    name: 'HACKER',
    titles:    ['Script Kiddie', 'Elite Hacker', 'Ghost // Root'],
    salary:    [45, 120, 280],
    attrRates: { hp:0.00, san:0.01, str:0.00, flex:0.00, hack:0.05 },
    // Hackeri sedia — fyzický hlad miernejší, ale psychický tlak väčší
    hungerRate: 0.7,
    decisionHungerMult: 0.9,
    sanDecisionMult: 1.3,               // +30% SAN opotrebenie za rozhodnutia
    activityBonus: { fishing:{ san:1 }, hacking:{ hack:3 } }
  },
  zastupca: {
    name: 'ZÁSTUPCA CEO',
    titles:    ['Asistent riaditeľa', 'Riaditeľ operácií', 'CEO Zla'],
    salary:    [45, 120, 280],
    attrRates: { hp:0.005, san:0.015, str:0.00, flex:0.01, hack:0.00 },
    // CEO — vyvážený, ale každé zlé rozhodnutie ho stojí SAN
    hungerRate: 1.0,
    decisionHungerMult: 1.0,
    activityBonus: { fishing:{ san:2, flex:1 }, any:{ bonus:1 } }
  }
};

var JOB_PROMO_THRESHOLDS = [8000, 40000]; // ↑ z 5000/25000 — ťažšie povýšenie

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
function saveGame() {
  try {
    var saveData = {
      S: S,
      FLEET_STATE:  FLEET_STATE,
      COURSE_STATE: COURSE_STATE,
      HQ_COOLDOWNS: HQ_COOLDOWNS,
      version: '2.1'
    };
    localStorage.setItem(GameConfig.SAVE_KEY, JSON.stringify(saveData));
    addLog('Hra uložená.','ok');
    showNotif('💾 Hra uložená.');
  } catch(e) { addLog('Chyba pri ukladaní.','warn'); }
}

function loadGame() {
  try {
    var raw = localStorage.getItem(GameConfig.SAVE_KEY);
    if (!raw) { addLog('Žiadny save nenájdený.','warn'); return; }
    var saved = JSON.parse(raw);
    S = saved.S || saved;
    if (saved.FLEET_STATE)  FLEET_STATE  = saved.FLEET_STATE;
    if (saved.COURSE_STATE) COURSE_STATE = saved.COURSE_STATE;
    if (saved.HQ_COOLDOWNS) HQ_COOLDOWNS = saved.HQ_COOLDOWNS;
    // Migrácia: pridaj hunger ak chýba
    if (S.hunger === undefined || S.hunger === null) S.hunger = 100;
    if (!S.income)       S.income    = { job:0, hack:0, fish:0, bonus:0, boats:0 };
    if (!S.income.boats) S.income.boats = 0;
    if (!S.fishCaught)   S.fishCaught= {};
    if (!S.attrRates)    S.attrRates = { hp:0, san:0, str:0, flex:0, hack:0 };
    if (!S.equipped)     S.equipped  = { head:null, body:null, pants:null, weapon:null, special:null, feet:null };
    if (!S.hqUpgrades)   S.hqUpgrades= {};
    if (!S.hqUnlocked)   S.hqUnlocked= {};
    if (!S.hqPassive)    S.hqPassive = { hp:0, san:0, hack:0, str:0 };
    if (!S.garden)       S.garden    = { plots: Array(9).fill(null) };
    if (S.str      === undefined) S.str      = 10;
    if (S.flex     === undefined) S.flex     = 10;
    if (S.hackStat === undefined) S.hackStat = 10;
    recalcFleetIncome();
    addLog('Hra načítaná.','ok');
    showNotif('📂 Hra načítaná.');
    if (S.job) {
      var jb = document.getElementById('topbar-job');
      jb.textContent = JOBS[S.job].titles[S.jobLevel||0];
      jb.style.display = '';
      document.getElementById('job-overlay').classList.add('hidden');
    }
    goTo(S.scene);
    Renderer.updateMoney();
    Renderer.updateIncome();
    Renderer.updateAll();
    HungerSystem.init();
    StateMachine.transition(StateMachine.STATES.PLAYING);
    GameLoop.start();
  } catch(e) {
    addLog('Chyba pri načítaní: ' + e.message,'warn');
  }
}

function newGame() {
  S = {
    scene:'start', hp:100, san:100, hunger:100,
    xp:0, level:1, money:150,
    job:null, jobLevel:0, str:10, flex:10, hackStat:10,
    inventory:[], fishCaught:{},
    income:{ job:0, hack:0, fish:0, bonus:0, boats:0 },
    attrRates:{ hp:0, san:0, str:0, flex:0, hack:0 },
    equipped:{ head:null, body:null, pants:null, weapon:null, special:null, feet:null },
    hqUpgrades:{}, hqUnlocked:{}, hqPassive:{ hp:0, san:0, hack:0, str:0 },
    garden:{ plots: Array(9).fill(null) }, gardenIncome:0,
    flags:{}, visited:{}
  };
  FLEET_STATE = {}; COURSE_STATE = {}; HQ_COOLDOWNS = {};
  clickerFishCount = 0; clickerPerClick = 1;
  document.getElementById('gameover-overlay').classList.remove('show');
  document.getElementById('win-overlay').classList.remove('show');
  document.getElementById('log-wrap').innerHTML = '';
  document.querySelectorAll('.op-flag').forEach(function(el){
    el.classList.remove('active');
    var dot=el.querySelector('.op-dot'); if(dot) dot.classList.remove('active');
  });
  var jb = document.getElementById('topbar-job'); jb.textContent='---'; jb.style.display='none';
  Renderer.updateMoney(); Renderer.updateIncome(); Renderer.updateStats(); Renderer.updateShop();
  HungerSystem.init();
  document.getElementById('job-overlay').classList.remove('hidden');
  GameLoop.start();
  StateMachine.transition(StateMachine.STATES.PLAYING);
}

function showMainMenu() {
  GameLoop.stop();
  document.getElementById('main-menu').classList.add('visible');
  StateMachine.transition(StateMachine.STATES.MAIN_MENU);
}

/* ── HQ STUB ─────────────────────────────────────────────────── */
var HQ_COOLDOWNS = {};
function openHQ() { renderHQView('main'); }
function hqSwitchTab(tab) {
  document.querySelectorAll('.hq-tab-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('.hq-view').forEach(function(v){ v.classList.remove('active'); });
  var btn = document.getElementById('hq-tab-'+tab);
  var view = document.getElementById('hq-view-'+tab);
  if (btn) btn.classList.add('active');
  if (view) view.classList.add('active');
  if (tab === 'garden') renderHQGardenView();
  if (tab === 'main')   renderHQView('main');
  if (tab === 'train')  renderHQView('train');
}
function hqSelectSubRoom(room) {
  var detailEl = document.getElementById('main-room-detail');
  var titleEl  = document.getElementById('main-room-title');
  if (!detailEl) return;
  var rooms = {
    spalna: {
      title: '🛏️ SPÁLŇA',
      html: '<div class="hq-section-label">AKTIVITY</div>' +
        '<button class="hq-activity-btn" onclick="hqSleep()">😴 Spánok (HP +30, SAN +20, Hlad -10) <span style="color:var(--text-muted);font-size:10px">60s CD</span></button>' +
        '<button class="hq-activity-btn" onclick="hqRest()">🛌 Oddych (HP +10) <span style="color:var(--text-muted);font-size:10px">30s CD</span></button>'
    },
    kancelaria: {
      title: '💻 KANCELÁRIA',
      html: '<div class="hq-section-label">AKTIVITY</div>' +
        '<button class="hq-activity-btn" onclick="hqWork()">💰 Pracovať z domu (+income bonus)</button>' +
        '<button class="hq-activity-btn" onclick="hqStudy()">📚 Študovať (HCK +2)</button>'
    },
    kuchyna: {
      title: '🍳 KUCHYŇA',
      html: '<div class="hq-section-label">VARENIE (RPG Jedlo)</div>' +
        '<button class="hq-activity-btn" onclick="hqCook(\'vajicka\')">🍳 Vajíčka (Hlad +35, HP +5) — ZADARMO</button>' +
        '<button class="hq-activity-btn" onclick="hqCook(\'cestoviny\')">🍝 Cestoviny (Hlad +60, SAN +5) — 30₿</button>' +
        '<button class="hq-activity-btn" onclick="hqCook(\'steak\')">🥩 Steak (Hlad +80, HP +15, SIL +1) — 80₿</button>' +
        '<button class="hq-activity-btn" onclick="hqCook(\'polievka\')">🍲 Domáca polievka (Hlad +50, SAN +10) — 20₿</button>' +
        '<div style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);margin-top:8px">// Varenie doma = najlacnejší spôsob najesť sa //'
    },
  };
  var r = rooms[room] || rooms.spalna;
  if (titleEl) titleEl.textContent = r.title;
  detailEl.innerHTML = r.html;
  // Highlight active room
  ['spalna','kancelaria','kuchyna'].forEach(function(rn){
    var el = document.getElementById('main-room-'+rn);
    if (el) el.style.border = rn === room ? '2px solid var(--green3)' : '2px solid transparent';
  });
}

function hqSleep() {
  var now = Date.now();
  if (HQ_COOLDOWNS.sleep && now - HQ_COOLDOWNS.sleep < 60000) {
    showNotif('Ešte nie si unavený. (60s CD)'); return;
  }
  S.hp  = Math.min(100, S.hp  + 30);
  S.san = Math.min(100, S.san + 20);
  HungerSystem.eat(-10); // Spánok trochu zvyšuje hlad pocit (nespálené kalórie)
  HQ_COOLDOWNS.sleep = now;
  Renderer.updateStats();
  gainXP(5);
  addLog('Spánok: HP +30, SAN +20.', 'ok');
  showNotif('😴 Oddych v spálni!');
}

function hqRest() {
  var now = Date.now();
  if (HQ_COOLDOWNS.rest && now - HQ_COOLDOWNS.rest < 30000) {
    showNotif('Odpočíval si pred chvíľou. (30s CD)'); return;
  }
  S.hp = Math.min(100, S.hp + 10);
  HQ_COOLDOWNS.rest = now;
  Renderer.updateStats();
  addLog('Krátky odpočinok: HP +10.', 'ok');
  showNotif('🛌 HP +10');
}

function hqWork() {
  S.income.bonus = (S.income.bonus||0) + 2;
  Renderer.updateIncome();
  addLog('Práca z domu: +2₿/s bonus.', 'ok');
  showNotif('💰 Bonus príjem +2₿/s!');
}

function hqStudy() {
  S.hackStat = Math.min(100, S.hackStat + 2);
  Renderer.updateStats();
  gainXP(10);
  addLog('Štúdium: HCK +2.', 'ok');
  showNotif('📚 HCK +2!');
}

// ── RPG VARENIE ──────────────────────────────────────────────────
var RECIPES = {
  vajicka:   { name:'Vajíčka',            icon:'🍳', cost:0,  hunger:35, hp:5,  san:0,  str:0 },
  cestoviny: { name:'Cestoviny',          icon:'🍝', cost:30, hunger:60, hp:0,  san:5,  str:0 },
  steak:     { name:'Steak',             icon:'🥩', cost:80, hunger:80, hp:15, san:0,  str:1 },
  polievka:  { name:'Domáca polievka',    icon:'🍲', cost:20, hunger:50, hp:0,  san:10, str:0 },
};

function hqCook(recipeId) {
  var r = RECIPES[recipeId]; if (!r) return;
  if (S.money < r.cost) { showNotif('Nedostatok surovín/kreditov! (' + r.cost + '₿)'); return; }
  S.money -= r.cost;
  HungerSystem.eat(r.hunger);
  if (r.hp)  S.hp  = Math.min(100, S.hp  + r.hp);
  if (r.san) S.san = Math.min(100, S.san + r.san);
  if (r.str) S.str = Math.min(100, S.str + r.str);
  Renderer.updateMoney(); Renderer.updateStats();
  gainXP(5);
  addLog(r.icon + ' ' + r.name + ': Hlad +' + r.hunger + (r.hp?' HP +'+r.hp:'') + (r.san?' SAN +'+r.san:'') + (r.str?' SIL +'+r.str:'') + (r.cost?' -'+r.cost+'₿':'') + '.', 'ok');
  showNotif(r.icon + ' ' + r.name + ' uvarené!');
  // Re-render kuchyňa
  hqSelectSubRoom('kuchyna');
}

function renderHQView(tab) { /* visual canvas rendering optional */ }
function renderHQGardenView() { renderGardenGrid(); renderGardenShop(); }
function hqPassiveTick() {
  if (S.hqPassive) {
    if (S.hqPassive.hp)  S.hp  = Math.min(100, S.hp  + S.hqPassive.hp);
    if (S.hqPassive.san) S.san = Math.min(100, S.san + S.hqPassive.san);
    if (S.hqPassive.hack)S.hackStat = Math.min(100, S.hackStat + S.hqPassive.hack);
    if (S.hqPassive.str) S.str = Math.min(100, S.str + S.hqPassive.str);
  }
}

/* ── FLEET / BOATS ───────────────────────────────────────────── */