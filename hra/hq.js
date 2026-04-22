'use strict';

/* === ui/hq.js — Základňa (HQ) === */

HQ STUB ─────────────────────────────────────────────────── */
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

/* ──