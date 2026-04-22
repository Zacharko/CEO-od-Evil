'use strict';

/* === ui/garden.js — Záhradka === */

var GARDEN_SEEDS = [
  { id:'paradajka', name:'Paradajka',  emoji:'🍅', cost:50,  time:120, reward:100, income:0.1, hunger:25, item:null },
  { id:'mata',      name:'Mäta',       emoji:'🌿', cost:30,  time:90,  reward:60,  income:0.08,hunger:8,  item:'mata_list' },
  { id:'cibuľa',    name:'Cibuľka',    emoji:'🧅', cost:25,  time:60,  reward:45,  income:0.05,hunger:12, item:null },
  { id:'cesnak',    name:'Cesnak',     emoji:'🧄', cost:40,  time:100, reward:75,  income:0.08,hunger:10, item:null },
  { id:'jahoda',    name:'Jahoda',     emoji:'🍓', cost:80,  time:180, reward:160, income:0.2, hunger:30, item:null },
  { id:'hrib',      name:'Hríb',       emoji:'🍄', cost:130, time:240, reward:280, income:0.3, hunger:35, item:'hrib_magicky' },
  { id:'jablko',    name:'Jabloň',     emoji:'🍎', cost:200, time:360, reward:450, income:0.5, hunger:45, item:null },
  { id:'slnecnica', name:'Slnečnica',  emoji:'🌻', cost:65,  time:150, reward:130, income:0.15,hunger:18, item:null },
];

if (!S.garden) S.garden = { plots: Array(GameConfig.GARDEN_PLOTS).fill(null) };

function openGarden() {
  if (!S.garden) S.garden = { plots: Array(GameConfig.GARDEN_PLOTS).fill(null) };
  renderGardenGrid(); renderGardenShop();
}
function renderGardenGrid() {
  var grid = document.getElementById('garden-grid'); if (!grid) return;
  grid.innerHTML = '';
  for (var i = 0; i < GameConfig.GARDEN_PLOTS; i++) {
    var plot = S.garden.plots[i];
    var div = document.createElement('div');
    if (!plot) {
      div.className = 'garden-plot empty';
      div.innerHTML = '<div class="garden-plot-emoji">🟫</div><div class="garden-plot-name">Prázdny záhon</div><div class="garden-plot-status">Klikni pre výsadbu</div>';
      (function(idx){ div.onclick = function(){ gardenOpenSeedPicker(idx); }; })(i);
    } else {
      var seed = GARDEN_SEEDS.find(function(s){ return s.id === plot.seedId; });
      var now = Date.now();
      var elapsed = (now - plot.plantedAt) / 1000;
      var ready = elapsed >= seed.time;
      div.className = 'garden-plot' + (ready ? ' ready' : ' growing');
      var timeLeft = ready ? 'HOTOVÉ!' : formatGardenTime(seed.time - elapsed);
      div.innerHTML = '<div class="garden-plot-emoji">'+(ready?seed.emoji:'🌱')+'</div><div class="garden-plot-name">'+seed.name+'</div><div class="garden-plot-timer">'+timeLeft+'</div><div class="garden-plot-status">'+(ready?'Klikni pre zber':'+'+seed.income+'₿/s')+'</div>';
      if (ready) { (function(idx, sd){ div.onclick = function(){ gardenHarvest(idx, sd); }; })(i, seed); }
    }
    grid.appendChild(div);
  }
}
function formatGardenTime(secs) {
  secs = Math.max(0, Math.ceil(secs));
  var m = Math.floor(secs/60), s = secs%60;
  return (m>0?m+'m ':'') + s + 's';
}
function gardenOpenSeedPicker(plotIdx) {
  var picker = document.createElement('div');
  picker.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:2000;display:flex;align-items:center;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg3);border:1px solid var(--green3);padding:24px;min-width:340px;max-width:500px;max-height:80vh;overflow-y:auto;';
  box.innerHTML = '<div style="font-family:var(--font-hud);font-size:13px;letter-spacing:3px;color:var(--green);margin-bottom:16px;">🌱 VYBER SEMENO</div>';
  GARDEN_SEEDS.forEach(function(seed) {
    var canAfford = S.money >= seed.cost;
    var btn = document.createElement('button');
    btn.style.cssText = 'display:flex;width:100%;align-items:center;gap:12px;background:var(--bg);border:1px solid var(--border);color:'+(canAfford?'var(--text)':'var(--text-dim)')+';padding:8px 12px;margin-bottom:6px;cursor:'+(canAfford?'pointer':'not-allowed')+';font-family:var(--font-body);font-size:12px;letter-spacing:1px;text-align:left;';
    btn.innerHTML = '<span style="font-size:22px">'+seed.emoji+'</span><span style="flex:1">'+seed.name+'<br><span style="font-size:10px;color:var(--text-dim)">⏱ '+formatGardenTime(seed.time)+' • +'+seed.income+'₿/s • Výnos: '+seed.reward+'₿ • 🍽 Hlad -'+seed.hunger+'</span></span><span style="color:var(--gold);font-size:11px">'+seed.cost+'₿</span>';
    if (canAfford) {
      btn.onmouseover = function(){ this.style.borderColor='var(--green3)'; };
      btn.onmouseout  = function(){ this.style.borderColor='var(--border)'; };
      btn.onclick = function(){ gardenPlant(plotIdx, seed.id); document.body.removeChild(picker); };
    }
    box.appendChild(btn);
  });
  var cancel = document.createElement('button');
  cancel.textContent = '✕ Zrušiť';
  cancel.style.cssText = 'background:transparent;border:1px solid var(--border);color:var(--text-dim);padding:6px 16px;cursor:pointer;font-family:var(--font-body);font-size:11px;letter-spacing:1px;margin-top:8px;';
  cancel.onclick = function(){ document.body.removeChild(picker); };
  box.appendChild(cancel);
  picker.appendChild(box);
  document.body.appendChild(picker);
}
function gardenPlant(plotIdx, seedId) {
  var seed = GARDEN_SEEDS.find(function(s){ return s.id === seedId; });
  if (S.money < seed.cost) { addLog('Nedostatok peňazí pre výsadbu.','warn'); return; }
  S.money -= seed.cost;
  S.garden.plots[plotIdx] = { seedId: seedId, plantedAt: Date.now() };
  if (!S.gardenIncome) S.gardenIncome = 0;
  S.gardenIncome += seed.income;
  Renderer.updateMoney();
  addLog('Vysadil si '+seed.emoji+' '+seed.name+' za '+seed.cost+'₿.','ok');
  renderGardenGrid(); saveGame();
}
function gardenHarvest(plotIdx, seed) {
  S.money += seed.reward;
  // Zber ovocia/zeleniny tiež nasýti agenta!
  if (seed.hunger) { HungerSystem.eat(seed.hunger); addLog(seed.emoji+' '+seed.name+': Hlad -'+seed.hunger+' (zjedol si čerstvú úrodu!)','ok'); }
  if (seed.item) addItem(seed.item);
  gainXP(5);
  if (S.gardenIncome) S.gardenIncome = Math.max(0, S.gardenIncome - seed.income);
  S.garden.plots[plotIdx] = null;
  Renderer.updateMoney();
  addLog('Zozbierané '+seed.emoji+' '+seed.name+' → +'+seed.reward+'₿'+(seed.item?' + predmet!':'') + '.','ok');
  renderGardenGrid(); saveGame();
}
function gardenHarvestAll() {
  for (var i = 0; i < GameConfig.GARDEN_PLOTS; i++) {
    var plot = S.garden.plots[i]; if (!plot) continue;
    var seed = GARDEN_SEEDS.find(function(s){ return s.id === plot.seedId; });
    if (!seed) continue;
    var elapsed = (Date.now() - plot.plantedAt) / 1000;
    if (elapsed >= seed.time) gardenHarvest(i, seed);
  }
}
function renderGardenShop() {
  var shop = document.getElementById('garden-seed-shop'); if (!shop) return;
  shop.innerHTML = '';
  GARDEN_SEEDS.forEach(function(seed) {
    var btn = document.createElement('button');
    btn.className = 'garden-seed-btn';
    btn.innerHTML = '<span style="font-size:20px">'+seed.emoji+'</span><span>'+seed.name+'<br><span style="font-size:10px;color:var(--text-dim)">⏱ '+formatGardenTime(seed.time)+' • Výnos: '+seed.reward+'₿ • 🍽 '+seed.hunger+'</span></span><span class="seed-cost">'+seed.cost+'₿</span>';
    btn.title = 'Pasívny príjem: +'+seed.income+'₿/s';
    shop.appendChild(btn);
  });
}

/* ──