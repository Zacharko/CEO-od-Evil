'use strict';

/* ═══ SYSTEMS: save.js — saveGame, loadGame, newGame ═══
   Závislosti: config.js, systems/state.js, systems/renderer.js
              systems/gameloop.js, systems/hunger.js, data/jobs.js */

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
