'use strict';

/* === ui/boats.js — Flotila a clicker === */

FLEET / BOATS ───────────────────────────────────────────── */
var clickerFishCount = 0;
var clickerPerClick  = 1;

function getBoatPrice(boat) {
  var fs = FLEET_STATE[boat.id];
  return Math.floor(boat.baseCost * Math.pow(GameConfig.BOAT_PRICE_INFLATION, fs && fs.owned ? 1 : 0));
}
function getBoatIncome(boat) {
  var fs = FLEET_STATE[boat.id]; if (!fs || !fs.owned) return 0;
  var base = boat.baseIncome;
  if (fs.upgrades) { boat.upgrades.forEach(function(u){ if(fs.upgrades[u.id]) base += u.incomeBonus; }); }
  return base;
}
function recalcFleetIncome() {
  var total = 0;
  FLEET_BOATS.forEach(function(b){ total += getBoatIncome(b); });
  S.income.boats = total;
  Renderer.updateIncome();
}
function updateClickerStats() {
  var cpc = document.getElementById('clicker-per-click');
  var ctf = document.getElementById('clicker-total-fish');
  var cps = document.getElementById('clicker-passive');
  if (cpc) cpc.textContent = '+' + clickerPerClick + '₿';
  if (ctf) ctf.textContent = clickerFishCount;
  if (cps) cps.textContent = (S.income.boats||0) + '₿/s';
}
function updateClickerBoatEmoji() {
  var owned = FLEET_BOATS.filter(function(b){ return FLEET_STATE[b.id] && FLEET_STATE[b.id].owned; });
  if (owned.length > 0) {
    var best = owned[owned.length-1];
    document.getElementById('clicker-boat-emoji').textContent = best.icon;
  }
}
function boatClick(e) {
  var earned = clickerPerClick;
  S.money += earned; clickerFishCount++;
  Renderer.updateMoney();
  S.flex = Math.min(100, S.flex + 0.05);
  S.san  = Math.min(100, S.san  + 0.02);
  // Každých 5 klikov = malý hunger decay (rybolov je fyzická aktivita)
  if (clickerFishCount % 5 === 0) HungerSystem.onAction();
  Renderer.updateStats();
  var fl = document.createElement('div');
  fl.className = 'fish-float';
  fl.textContent = '+' + earned + '₿';
  fl.style.left = (e.clientX - 20) + 'px';
  fl.style.top  = (e.clientY - 20) + 'px';
  document.body.appendChild(fl);
  setTimeout(function(){ if(fl.parentNode) fl.parentNode.removeChild(fl); }, GameConfig.FLOAT_TEXT_DURATION);
  updateClickerStats();
}
function buyFleetBoat(boatId) {
  var boat = FLEET_BOATS.filter(function(b){ return b.id===boatId; })[0]; if (!boat) return;
  var price = getBoatPrice(boat);
  if (S.money < price) { showNotif('Nedostatok kreditov!'); return; }
  if (!FLEET_STATE[boatId]) FLEET_STATE[boatId] = { owned:false, upgrades:{}, priceMultiplier:1 };
  S.money -= price; Renderer.updateMoney();
  FLEET_STATE[boatId].owned = true;
  recalcFleetIncome();
  addLog('Kúpil si loď: ' + boat.icon + ' ' + boat.name, 'ok');
  showNotif(boat.icon + ' ' + boat.name + ' sa plavila na more!');
  updateClickerBoatEmoji();
  renderBoatsOverlay();
}
function upgradeFleetBoat(boatId, upgId) {
  var boat = FLEET_BOATS.filter(function(b){ return b.id===boatId; })[0]; if (!boat) return;
  var upg  = boat.upgrades.filter(function(u){ return u.id===upgId; })[0]; if (!upg) return;
  var fs = FLEET_STATE[boatId]; if (!fs || !fs.owned) return;
  if (fs.upgrades && fs.upgrades[upgId]) return;
  if (S.money < upg.cost) { showNotif('Nedostatok kreditov!'); return; }
  S.money -= upg.cost; Renderer.updateMoney();
  if (!fs.upgrades) fs.upgrades = {};
  fs.upgrades[upgId] = true;
  recalcFleetIncome();
  addLog('Vylepšenie: ' + upg.name + ' na ' + boat.name, 'ok');
  showNotif('⬆ ' + upg.name);
  renderBoatsOverlay();
}
function renderBoatsOverlay() {
  var grid = document.getElementById('boats-fleet-grid'); if (!grid) return;
  var html = '';
  FLEET_BOATS.forEach(function(boat) {
    var fs = FLEET_STATE[boat.id] || { owned:false, upgrades:{}, priceMultiplier:1 };
    var owned = fs.owned; var price = getBoatPrice(boat); var income = getBoatIncome(boat);
    var canBuy = !owned && S.money >= price;
    html += '<div class="boat-card '+(owned?'owned':'')+'">';
    html += '<div class="boat-card-top">';
    html += '<div class="boat-img-wrap"'+(owned?' onclick="boatClick(event)"':'')+' style="cursor:'+(owned?'pointer':'default')+'">';
    html += '<span style="font-size:36px">'+boat.icon+'</span>';
    if(owned) html += '<div class="boat-click-label">KLIKNI!</div>';
    html += '</div>';
    html += '<div class="boat-info"><div class="boat-name">'+boat.icon+' '+boat.name+'</div>';
    html += '<div class="boat-desc">'+boat.desc+'</div>';
    if(owned) html += '<div class="boat-income-badge">+'+income+'₿/s</div>';
    html += '</div></div>';
    if(owned){
      html += '<div class="boat-upgrades">';
      boat.upgrades.forEach(function(u){
        var uOwned = fs.upgrades && fs.upgrades[u.id]; var canU = !uOwned && S.money>=u.cost;
        html += '<div class="boat-upgrade-row"><div><div class="boat-upg-name">'+u.name+' <span style="color:var(--text-dim);font-size:11px">— '+u.desc+'</span></div>';
        html += '<div style="font-size:8px;color:var(--gold)">+'+u.incomeBonus+'₿/s | ₿'+u.cost.toLocaleString('sk')+'</div></div><div>';
        if(uOwned) html += '<span style="color:var(--green3);font-size:8px">✓ AKTÍVNE</span>';
        else html += '<button class="boat-upg-btn"'+(canU?'':'disabled')+' onclick="upgradeFleetBoat(\''+boat.id+'\',\''+u.id+'\')">'+(canU?'[ KÚPIŤ ]':'[ ₿'+u.cost+' ]')+'</button>';
        html += '</div></div>';
      });
      html += '</div>';
    }
    var btnTxt = owned ? '✓ VLASTNÍŠ (ďalšia: ₿'+Math.floor(price)+')' : (canBuy?'[ KÚP ZA ₿'+price.toLocaleString('sk')+' ]':'[ NEDOSTATOK: ₿'+price.toLocaleString('sk')+' ]');
    html += '<button class="boat-buy-btn '+(owned?'owned-btn':'')+'" '+(owned||canBuy?'':'disabled')+' onclick="buyFleetBoat(\''+boat.id+'\')">'+btnTxt+'</button>';
    html += '</div>';
  });
  grid.innerHTML = html;
  updateClickerStats();
}

/* ──