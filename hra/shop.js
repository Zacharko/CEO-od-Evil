'use strict';

/* === ui/shop.js — Obchod, výstroj, predmety === */

EQUIP SYSTEM ────────────────────────────────────────────── */
var EQUIP_BONUSES = {
  cap_alobal:   { san: 5,        label:'SAN +5' },
  visor_tech:   { hackStat: 10,  label:'HCK +10' },
  gas_mask_pro: { san: 8,        label:'SAN +8' },
  plynomaska:   { san: 3,        label:'SAN +3' },
  kevlar_vest:  { hp: 20,        label:'HP +20' },
  trench_coat:  { san: 10,       label:'SAN +10' },
  cargo_pants:  {                 label:'Inventár +5' },
  pants_suit:   { san: 3,        label:'SAN +3' },
  weapon_baton: { str: 15,       label:'SIL +15' },
  weapon_glock: { str: 25,       label:'SIL +25' },
  weapon_taser: { flex: 5,       label:'OHY +5' },
  hack_pwnbox:  { hackStat: 15,  label:'HCK +15' },
  neural_link:  { hackStat: 30,  label:'HCK +30' },
  detektor:     { hackStat: 3,   label:'HCK +3' },
};
var ITEM_EQUIP_SLOT = {
  cap_alobal:'head', visor_tech:'head', gas_mask_pro:'head', plynomaska:'head',
  kevlar_vest:'body', trench_coat:'body',
  cargo_pants:'pants', pants_suit:'pants',
  weapon_baton:'weapon', weapon_glock:'weapon', weapon_taser:'weapon',
  hack_pwnbox:'special', neural_link:'special', detektor:'special',
  keycard:'feet', baterka:'feet',
};
function ensureEquipped() {
  if (!S.equipped) S.equipped = { head:null, body:null, pants:null, weapon:null, special:null, feet:null };
}
function applyEquipBonus(id, sign) {
  var b = EQUIP_BONUSES[id]; if (!b) return;
  if (b.san)      S.san      = Math.min(100, Math.max(0, S.san      + sign*b.san));
  if (b.str)      S.str      = Math.min(100, Math.max(0, S.str      + sign*b.str));
  if (b.flex)     S.flex     = Math.min(100, Math.max(0, S.flex     + sign*b.flex));
  if (b.hackStat) S.hackStat = Math.min(100, Math.max(0, S.hackStat + sign*b.hackStat));
  if (b.hp)       S.hp       = Math.min(100, Math.max(0, S.hp       + sign*b.hp));
  Renderer.updateStats();
}
function equipItem(id) {
  ensureEquipped();
  var slot = ITEM_EQUIP_SLOT[id]; if (!slot) { addLog('Tento predmet sa nedá nasadiť.','warn'); return; }
  if (!hasItem(id)) { addLog('Predmet nemáš v inventári.','warn'); return; }
  if (S.equipped[slot]) applyEquipBonus(S.equipped[slot], -1);
  S.equipped[slot] = id; applyEquipBonus(id, +1);
  var it = ITEMS[id] || {};
  addLog('Nasadil si: ' + (it.icon||'') + ' ' + (it.name||id), 'ok');
  showNotif('Nasadené: ' + (it.icon||'⚙') + ' ' + (it.name||id));
  Renderer.updateEquip(); Renderer.updateShop(); Renderer.updateInventory();
}
function unequipSlot(slot) {
  ensureEquipped();
  var id = S.equipped[slot]; if (!id) return;
  applyEquipBonus(id, -1); S.equipped[slot] = null;
  var it = ITEMS[id] || {};
  addLog('Zložil si: ' + (it.name||id), 'ok');
  Renderer.updateEquip(); Renderer.updateShop();
}
function eqSlotClick(slot) {
  ensureEquipped();
  if (S.equipped[slot]) unequipSlot(slot);
}
function buyItem(id) {
  var si = SHOP_ITEMS.filter(function(s){ return s.id===id; })[0]; if (!si) return;
  if (S.money < si.price) { addLog('Nedostatok kreditov.','warn'); return; }
  if (hasItem(id))        { addLog('Tento predmet už vlastníš.','warn'); return; }
  S.money -= si.price; Renderer.updateMoney();
  if (si.category === 'boats') {
    S.inventory.push(id);
    S.income.boats   = (S.income.boats||0) + (si.boatIncome||0);
    S.attrRates.flex = (S.attrRates.flex||0) + (si.flexRate||0);
    Renderer.updateIncome(); Renderer.updateStats();
    addLog('Kúpil si: ' + si.icon + ' ' + si.name + ' — +'+(si.boatIncome||0)+'₿/s', 'ok');
    showNotif(si.icon + ' ' + si.name); Renderer.updateShop(); return;
  }
  addItem(id);
  addLog('Kúpil si: ' + si.name + ' za ₿' + si.price, 'ok');
  Renderer.updateShop();
}
function useItem(id) {
  var it = ITEMS[id]; if (!it || !it.usable || !hasItem(id)) return;
  if (it.onUse) it.onUse(); else addLog('Predmet použitý.','ok');
  Renderer.updateInventory();
}
function sellAllFish() {
  var total = 0;
  Object.keys(S.fishCaught).forEach(function(id) {
    var ft = FISH_TYPES.filter(function(f){ return f.id===id; })[0];
    if (ft) total += S.fishCaught[id] * ft.value;
  });
  if (!total) { addLog('Nič na predaj.','warn'); return; }
  S.money += total; S.fishCaught = {};
  Renderer.updateMoney(); Renderer.updateFish();
  addLog('Ryby predané za ₿' + total + '.', 'ok');
  showNotif('Predal si ryby za ₿' + total + '!');
}

/* ──