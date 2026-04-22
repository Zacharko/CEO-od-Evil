'use strict';

/* ════════════════════════════════════════════════════════════
   MODULE 6: Renderer
   Batch DOM updates. Dirty-flag system pre minimalizáciu reflow.
   Závislosti: data/items.js (ITEMS, FISH_TYPES, SHOP_ITEMS, EQUIP_BONUSES, ITEM_EQUIP_SLOT)
              systems/state.js (S)
   ════════════════════════════════════════════════════════════ */

var Renderer = (function() {
  var _dirty = {
    stats:    false,
    money:    false,
    income:   false,
    inventory:false,
    shop:     false,
    equip:    false,
    fish:     false,
    flags:    false,
  };
  var _rafId = null;

  /** Mark a section as needing re-render. */
  function markDirty(section) {
    _dirty[section] = true;
    if (!_rafId) _rafId = requestAnimationFrame(_flush);
  }

  function _flush() {
    _rafId = null;
    if (_dirty.stats)    { _renderStats();    _dirty.stats    = false; }
    if (_dirty.money)    { _renderMoney();    _dirty.money    = false; }
    if (_dirty.income)   { _renderIncome();   _dirty.income   = false; }
    if (_dirty.inventory){ _renderInventory();_dirty.inventory= false; }
    if (_dirty.shop)     { _renderShop();     _dirty.shop     = false; }
    if (_dirty.equip)    { _renderEquip();    _dirty.equip    = false; }
    if (_dirty.fish)     { _renderFish();     _dirty.fish     = false; }
    if (_dirty.flags)    { _renderFlags();    _dirty.flags    = false; }
  }

  /* ── Internal render functions ───────────────────────────────── */
  function _renderStats() {
    var hpBar = document.getElementById('bar-hp');
    if (!hpBar) return;
    hpBar.style.width   = Math.min(100, S.hp) + '%';
    hpBar.className     = 'stat-bar hp' + (S.hp < 30 ? ' red' : '');
    document.getElementById('val-hp').textContent    = Math.floor(S.hp);
    document.getElementById('bar-san').style.width   = Math.min(100,S.san) + '%';
    document.getElementById('val-san').textContent   = Math.floor(S.san);
    var xpPct = S.level > 0 ? Math.min(100, Math.round(S.xp / (S.level * GameConfig.XP_PER_LEVEL_MULT) * 100)) : 0;
    document.getElementById('bar-xp').style.width    = xpPct + '%';
    document.getElementById('val-xp').textContent    = S.xp;
    document.getElementById('val-level').textContent = S.level;
    document.getElementById('bar-str').style.width   = Math.min(100,S.str) + '%';
    document.getElementById('val-str').textContent   = Math.floor(S.str);
    document.getElementById('bar-flex').style.width  = Math.min(100,S.flex) + '%';
    document.getElementById('val-flex').textContent  = Math.floor(S.flex);
    document.getElementById('bar-hack').style.width  = Math.min(100,S.hackStat) + '%';
    document.getElementById('val-hack').textContent  = Math.floor(S.hackStat);
  }

  function _renderMoney() {
    var el = document.getElementById('topbar-money');
    if (el) el.textContent = '₿ ' + S.money.toLocaleString('sk');
  }

  function _renderIncome() {
    var total = S.income.job + S.income.hack + S.income.fish + S.income.bonus + (S.income.boats||0);
    var ids = { job:'inc-job', hack:'inc-hack', fish:'inc-fish', boats:'inc-boats', bonus:'inc-bonus' };
    Object.keys(ids).forEach(function(k) {
      var el = document.getElementById(ids[k]);
      if (el) el.textContent = '+' + (S.income[k]||0) + '/s';
    });
    var tot = document.getElementById('inc-total');
    if (tot) tot.textContent = '+' + total + '/s';
  }

  function _renderInventory() {
    var body = document.getElementById('inv-items-body');
    if (!body) return;
    if (S.inventory.length === 0) {
      body.innerHTML = '<div class="inv-empty">// prázdny inventár //</div>'; return;
    }
    // Use DocumentFragment for batch append
    var frag = document.createDocumentFragment();
    S.inventory.forEach(function(id) {
      var it = ITEMS[id]; if (!it) return;
      var card = document.createElement('div'); card.className = 'item-card';
      var header = document.createElement('div'); header.className = 'item-card-header';
      header.innerHTML = '<span class="item-card-icon">' + it.icon + '</span><span class="item-card-name">' + escH(it.name) + '</span>';
      var desc = document.createElement('div'); desc.className = 'item-card-desc'; desc.textContent = it.desc;
      card.appendChild(header); card.appendChild(desc);
      if (it.usable) {
        var btn = document.createElement('button'); btn.className = 'item-card-use';
        btn.textContent = '⚡ Použiť';
        (function(itemId){ btn.onclick = function(){ useItem(itemId); }; })(id);
        card.appendChild(btn);
      }
      frag.appendChild(card);
    });
    body.innerHTML = '';
    body.appendChild(frag);
  }

  function _renderFish() {
    var body = document.getElementById('inv-fish-body');
    if (!body) return;
    var keys = Object.keys(S.fishCaught);
    if (keys.length === 0) { body.innerHTML = '<div class="inv-empty">// žiadne ryby //</div>'; return; }
    var total = 0;
    var frag = document.createDocumentFragment();
    keys.forEach(function(id) {
      var ft = FISH_TYPES.filter(function(f){ return f.id===id; })[0]; if (!ft) return;
      var qty = S.fishCaught[id]; var val = qty * ft.value; total += val;
      var card = document.createElement('div'); card.className = 'item-card';
      card.innerHTML = '<div class="item-card-header"><span class="item-card-icon">' + ft.icon + '</span><span class="item-card-name">' + escH(ft.name) + '</span><span class="item-card-qty">x' + qty + '</span></div><div class="item-card-desc">' + escH(ft.desc) + ' — ₿' + ft.value + '/ks</div>';
      frag.appendChild(card);
    });
    var sellBtn = document.createElement('button');
    sellBtn.className = 'item-card-use'; sellBtn.style.cssText = 'width:100%;margin:8px 0;';
    sellBtn.textContent = '💰 Predaj všetky: ' + total + '₿';
    sellBtn.onclick = sellAllFish;
    body.innerHTML = '';
    body.appendChild(frag);
    body.appendChild(sellBtn);
  }

  function _renderShop() {
    var body = document.getElementById('shop-body');
    if (!body) return;
    var sections = {
      head:    { label:'🪖 Hlava', html:'' },
      body:    { label:'🦺 Telo', html:'' },
      items:   { label:'🎒 Výbava', html:'' },
      pants:   { label:'👖 Nohavice', html:'' },
      weapon:  { label:'⚔️ Zbrane', html:'' },
      special: { label:'✨ Špeciálne', html:'' },
      boats:   { label:'⛵ Lode', html:'' },
    };
    SHOP_ITEMS.forEach(function(si) {
      var owned  = hasItem(si.id);
      var isEquippable = !!ITEM_EQUIP_SLOT[si.id];
      var equipSlot = ITEM_EQUIP_SLOT[si.id];
      var isEquipped = owned && isEquippable && S.equipped && S.equipped[equipSlot] === si.id;
      var btnTxt, btnAttr, btnOnclick;
      if (owned && isEquippable) {
        if (isEquipped) { btnTxt = '✓ Nasadené — zložiť'; btnAttr = ''; btnOnclick = 'onclick="unequipSlot(\'' + equipSlot + '\')"'; }
        else { btnTxt = '⊕ Nasadiť'; btnAttr = ''; btnOnclick = 'onclick="equipItem(\'' + si.id + '\')"'; }
      } else if (owned) { btnTxt = '✓ Už vlastníš'; btnAttr = 'disabled'; btnOnclick = ''; }
      else if (S.money < si.price) { btnTxt = '₿ Nedostatok'; btnAttr = 'disabled'; btnOnclick = ''; }
      else { btnTxt = '🛒 Kúpiť'; btnAttr = ''; btnOnclick = 'onclick="buyItem(\'' + si.id + '\')"'; }
      var equipBadge = isEquipped ? ' <span style="font-size:9px;color:var(--green3)">[NASADENÉ]</span>' : '';
      var card = '<div class="shop-item"><div class="shop-item-header"><div style="display:flex;align-items:center;gap:8px;flex:1"><span class="shop-item-icon">' + si.icon + '</span><span class="shop-item-name">' + escH(si.name) + equipBadge + '</span></div><span class="shop-item-price">₿' + si.price.toLocaleString('sk') + '</span></div><div class="shop-item-desc">' + escH(si.desc) + '</div><button class="shop-buy-btn" ' + btnAttr + ' ' + btnOnclick + '>' + btnTxt + '</button></div>';
      if (sections[si.category]) sections[si.category].html += card;
    });
    var out = '';
    Object.keys(sections).forEach(function(k){ if (!sections[k].html) return; out += '<div class="shop-section-label">' + sections[k].label + '</div>' + sections[k].html; });
    body.innerHTML = out;
  }

  function _renderEquip() {
    ensureEquipped();
    var slots = ['head','body','pants','weapon','special','feet'];
    slots.forEach(function(slot) {
      var id = S.equipped[slot];
      var slotEl  = document.getElementById('eqslot-' + slot);
      var nameEl  = document.getElementById('eqslot-' + slot + '-name');
      if (!slotEl) return;
      if (id) {
        var it = ITEMS[id] || {};
        slotEl.textContent = it.icon || '?';
        slotEl.className   = 'eq-slot filled';
        if (nameEl) nameEl.textContent = it.name || id;
      } else {
        slotEl.textContent = '';
        slotEl.className   = 'eq-slot';
        if (nameEl) nameEl.textContent = '—';
      }
    });
    // Bonus list
    var bonusList = document.getElementById('equip-bonuses-list');
    if (bonusList) {
      var bonusHtml = '';
      slots.forEach(function(slot) {
        var id = S.equipped[slot]; if (!id) return;
        var b = EQUIP_BONUSES[id]; if (!b || !b.label) return;
        var it = ITEMS[id] || {};
        bonusHtml += '<div class="equip-bonus-row"><span>' + (it.icon||'') + ' ' + escH(it.name||id) + '</span><span style="color:var(--green3)">' + b.label + '</span></div>';
      });
      bonusList.innerHTML = bonusHtml || '<div class="inv-empty">// Žiadne bonusy //</div>';
    }
    // Available equippables list
    var avail = document.getElementById('equip-available-list');
    if (avail) {
      var availHtml = '';
      S.inventory.forEach(function(id) {
        if (!ITEM_EQUIP_SLOT[id]) return;
        var it = ITEMS[id] || {}; var slot = ITEM_EQUIP_SLOT[id];
        var isEq = S.equipped && S.equipped[slot] === id;
        availHtml += '<button class="equip-avail-btn" onclick="' + (isEq ? "unequipSlot('" + slot + "')" : "equipItem('" + id + "')") + '">' + (it.icon||'') + ' ' + escH(it.name||id) + '<span style="font-size:9px;color:' + (isEq?'var(--green3)':'var(--text-muted)') + ';margin-left:auto">' + (isEq?'✓ Nasadené':'⊕ Nasadiť') + '</span></button>';
      });
      avail.innerHTML = availHtml || '<div style="color:var(--text-muted);font-size:10px;padding:8px;font-family:var(--font-mono)">// Žiadne nasaditeľné predmety //</div>';
    }
  }

  function _renderFlags() {
    Object.keys(S.flags).forEach(function(k) {
      if (!S.flags[k]) return;
      var el = document.getElementById(k); if (!el) return;
      el.classList.add('active');
      var dot = el.querySelector('.op-dot'); if (dot) dot.classList.add('active');
    });
  }

  /* ── Public API ── */
  function updateStats()    { markDirty('stats'); }
  function updateMoney()    { markDirty('money'); }
  function updateIncome()   { markDirty('income'); }
  function updateInventory(){ markDirty('inventory'); }
  function updateShop()     { markDirty('shop'); }
  function updateEquip()    { markDirty('equip'); }
  function updateFish()     { markDirty('fish'); }
  function updateFlags()    { markDirty('flags'); }
  function updateAll() {
    Object.keys(_dirty).forEach(function(k){ _dirty[k] = true; });
    if (!_rafId) _rafId = requestAnimationFrame(_flush);
  }

  return {
    updateStats: updateStats, updateMoney: updateMoney, updateIncome: updateIncome,
    updateInventory: updateInventory, updateShop: updateShop, updateEquip: updateEquip,
    updateFish: updateFish, updateFlags: updateFlags, updateAll: updateAll,
  };
})();

/* ════════════════════════════════════════════════════════════════════
   ╔══════════════════════════════════════════════════════════════╗
   ║           MODULE 7: SceneManager                             ║
   ║  goTo, renderDialogLines, renderChoices, enterLocation        ║
   ╚══════════════════════════════════════════════════════════════╝
════════════════════════════════════════════════════════════════════ */