/* CEO od Zla // §34 FactionsSystem */
/* global S, gainXP, addLog, addItem, hasItem, showNotif, Renderer, GameConfig, switchView */

var FactionsSystem = (function() {

  // ── Konfigurácia ─────────────────────────────────────
  var INCOME_PER_FACTION = 10;   // 10₿/s per joined faction
  var REP_INITIAL_JOIN   = 5;    // počiatočná rep po join
  var REP_MAX            = 100;
  var REP_PER_QUEST      = 15;
  var REP_PER_MINIGAME   = 1;
  var REP_PER_TALK       = 2;

  var FACTIONS = {
    stokari: {
      id:        'stokari',
      name:      'STOKÁRI',
      icon:      '💀',
      color:     '#ef4444',
      colorClass:'fac-stokari',
      tag:       'Pouliční · Drogy · Low-tech',
      banner:    'https://images.unsplash.com/photo-1565536421961-15ddc36c6e02?w=800&auto=format&fit=crop',
      desc:      'Mladí, hladní, lacné augmenty Gentech B2. Predávajú drogy, vlámu sa kamkoľvek. Garáže na okraji Píly sú ich diera. Loyalita rodiny.',
      location:  'fac_stokari_garaze',
      minigame:  'street_deal',
      questTitle:'Vyber dlžobu od dílera',
      bonusText: '+10₿/s · Prístup k Street Deal'
    },
    hackers: {
      id:        'hackers',
      name:      'HACKERI',
      icon:      '💻',
      color:     '#22d3ee',
      colorClass:'fac-hackers',
      tag:       'FIT · Exploity · Whitepapery',
      banner:    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
      desc:      'Oravec a jeho sieť v Lab B7. Nelegálny audit, leakovanie, exploit-ako-služba. Niekto to volá aktivizmus, niekto terorizmus. Oni — práca.',
      location:  'fac_hackers_lab',
      minigame:  'terminal_ops',
      questTitle:'Hackni FIT a uprav známky',
      bonusText: '+10₿/s · +1 hackStat za minihru'
    },
    ceo: {
      id:        'ceo',
      name:      'CEO',
      icon:      '🎩',
      color:     '#facc15',
      colorClass:'fac-ceo',
      tag:       'Penthouse · Burza · Politika',
      banner:    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=900&auto=format&fit=crop',
      desc:      'Sieť Tomáša a Bartóka. Politici ktorých vlastnia, banky ktoré rozumejú, kasína ktoré preprajú. Penthouse na Top Cafe — výhľad na všetko.',
      location:  'fac_ceo_penthouse',
      minigame:  'stocks',
      questTitle:'Vydieranie politika · Pranie peňazí',
      bonusText: '+10₿/s · Prístup k Penthouse + Stocks'
    },
    rybari: {
      id:        'rybari',
      name:      'RYBÁRI',
      icon:      '🐟',
      color:     '#4ade80',
      colorClass:'fac-rybari',
      tag:       'Mŕtve Rameno · Tichá sieť',
      banner:    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop',
      desc:      'Starí robotníci, dôchodcovia, fero-50-y. Mŕtve Rameno je viac ako rybačka. Tichá sieť informácií. Vidia veci ktoré štát nevidí.',
      location:  'fac_rybari_rameno',
      minigame:  'fishing',
      questTitle:'Pavlíkov vrak v rieke',
      bonusText: '+10₿/s · +25% predaj rýb'
    }
  };

  // ── DOM refs (lazy) ─────────────────────────────────
  function _grid()    { return document.getElementById('factions-grid'); }
  function _overlay() { return document.getElementById('factions-overlay'); }
  function _miniList(){ return document.getElementById('factions-mini-list'); }

  // ── Helpers ─────────────────────────────────────────
  function _ensureState() {
    if (!S.factions) {
      S.factions = {
        discovered:{}, joined:{},
        rep:{ stokari:0, hackers:0, ceo:0, rybari:0 },
        quests:{}, minigameStats:{ stokari:0, hackers:0, ceo:0, rybari:0 }
      };
    }
    if (!S.factions.rep) S.factions.rep = { stokari:0, hackers:0, ceo:0, rybari:0 };
    if (!S.factions.discovered) S.factions.discovered = {};
    if (!S.factions.joined) S.factions.joined = {};
    if (!S.factions.quests) S.factions.quests = {};
    if (!S.factions.minigameStats) S.factions.minigameStats = { stokari:0, hackers:0, ceo:0, rybari:0 };
  }

  function _joinedCount() {
    _ensureState();
    return Object.keys(S.factions.joined).filter(function(k){ return S.factions.joined[k]; }).length;
  }

  function getFactionsIncome() {
    return _joinedCount() * INCOME_PER_FACTION;
  }

  // ── DISCOVER & UNLOCK ────────────────────────────────
  function discover(facId, customMsg) {
    _ensureState();
    if (!FACTIONS[facId]) return;
    if (S.factions.discovered[facId]) return; // already
    S.factions.discovered[facId] = true;
    _showUnlockPopup(facId, customMsg);
    addLog('FRAKCIA odomknutá: ' + FACTIONS[facId].name + '.', 'ok');
    _setTabPending(true);
    renderMiniList();
  }

  function _showUnlockPopup(facId, customMsg) {
    var fac = FACTIONS[facId]; if (!fac) return;
    var pop = document.getElementById('faction-unlock-popup');
    var t = document.getElementById('faction-unlock-title');
    var m = document.getElementById('faction-unlock-msg');
    if (!pop) return;
    var defaultMsg = {
      stokari: 'Garáže na okraji Píly. Stokárska diera. Choď tam až budeš pripravený zájsť hlbšie.',
      hackers: 'Lab B7 na FIT. Oravec čaká. Tichý vstup, žiadny záznam.',
      ceo:     'Penthouse na vrchu Top Cafe. Tomáš pozýva — kúpiť si miesto pri stole.',
      rybari:  'Mŕtve Rameno. Lucia ťa odporučila. Fero ťa očakáva pri ohni.'
    };
    t.textContent = fac.icon + '  ' + fac.name;
    m.textContent = customMsg || defaultMsg[facId] || fac.desc;
    pop.style.borderLeftColor = fac.color;
    pop.style.boxShadow = '0 4px 24px rgba(0,0,0,0.7), 0 0 24px ' + fac.color + '40';
    pop.classList.add('show');
    clearTimeout(pop._t);
    pop._t = setTimeout(function(){ pop.classList.remove('show'); }, 8000);
  }

  function _setTabPending(on) {
    var tab = document.querySelector('.tab-btn[data-tab="factions"]');
    if (!tab) return;
    tab.classList.toggle('has-pending', !!on);
  }

  // ── JOIN ─────────────────────────────────────────────
  function join(facId) {
    _ensureState();
    if (!FACTIONS[facId]) return;
    if (S.factions.joined[facId]) return; // už člen
    S.factions.joined[facId] = true;
    if (S.factions.rep[facId] < REP_INITIAL_JOIN) S.factions.rep[facId] = REP_INITIAL_JOIN;
    if (!S.factions.discovered[facId]) S.factions.discovered[facId] = true;
    addLog('Pridal si sa k frakcii: ' + FACTIONS[facId].name + '. Príjem +' + INCOME_PER_FACTION + '₿/s.', 'ok');
    showNotif('⚔ JOIN: ' + FACTIONS[facId].name + ' (+' + INCOME_PER_FACTION + '₿/s)');
    if (typeof SoundFX !== 'undefined') SoundFX.play('factionJoin');
    _refreshIncomeRow();
    renderMiniList();
    if (typeof Renderer !== 'undefined') Renderer.updateIncome();
    if (typeof saveGame === 'function') try { saveGame(); } catch(e){}
  }

  function leave(facId) {
    _ensureState();
    if (!S.factions.joined[facId]) return;
    if (!confirm('Naozaj chceš opustiť frakciu ' + FACTIONS[facId].name + '? Stratíš pasívny príjem aj reputáciu.')) return;
    S.factions.joined[facId] = false;
    S.factions.rep[facId] = Math.floor(S.factions.rep[facId] / 2);
    addLog('Opustil si frakciu: ' + FACTIONS[facId].name + '.', 'warn');
    _refreshIncomeRow();
    renderMiniList();
    renderWindow();
    if (typeof Renderer !== 'undefined') Renderer.updateIncome();
  }

  // ── REPUTATION ──────────────────────────────────────
  function addRep(facId, amount, reason) {
    _ensureState();
    if (!FACTIONS[facId]) return;
    var prev = S.factions.rep[facId] || 0;
    var next = Math.max(0, Math.min(REP_MAX, prev + amount));
    S.factions.rep[facId] = next;
    var diff = next - prev;
    if (diff !== 0) {
      var sign = diff > 0 ? '+' : '';
      addLog('Reputácia ' + FACTIONS[facId].name + ': ' + sign + diff + (reason ? ' (' + reason + ')' : '') + ' → ' + next + '/100.', diff > 0 ? 'ok' : 'warn');
    }
    renderMiniList();
    if (_overlay() && _overlay().classList.contains('show')) renderWindow();
  }

  // ── QUESTS ──────────────────────────────────────────
  function activateQuest(facId, questId) {
    _ensureState();
    var key = facId + ':' + questId;
    if (S.factions.quests[key] && S.factions.quests[key].done) return false;
    S.factions.quests[key] = S.factions.quests[key] || { active:true, progress:0, done:false };
    S.factions.quests[key].active = true;
    return true;
  }
  function completeQuest(facId, questId) {
    _ensureState();
    var key = facId + ':' + questId;
    var q = S.factions.quests[key];
    if (!q) return;
    if (q.done) return;
    q.done = true; q.active = false;
    addRep(facId, REP_PER_QUEST, 'quest');
    showNotif('✓ Quest splnený · ' + FACTIONS[facId].name + ' +' + REP_PER_QUEST + ' rep');
  }
  function getActiveQuest(facId) {
    _ensureState();
    var keys = Object.keys(S.factions.quests);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.indexOf(facId + ':') !== 0) continue;
      var q = S.factions.quests[k];
      if (q.active && !q.done) return { id: k.split(':')[1], data: q };
      if (q.done) return { id: k.split(':')[1], data: q };
    }
    return null;
  }

  // ── MINIGAME RESULT HOOK ─────────────────────────────
  function onMinigameSuccess(facId, payload) {
    _ensureState();
    payload = payload || {};
    S.factions.minigameStats[facId] = (S.factions.minigameStats[facId] || 0) + 1;
    addRep(facId, REP_PER_MINIGAME, 'minihra');
    if (payload.money) { S.money += payload.money; if (typeof Renderer !== 'undefined') Renderer.updateMoney(); }
    if (payload.xp)    { gainXP(payload.xp); }
    if (payload.hackStat && facId === 'hackers') { S.hackStat = Math.min(100, S.hackStat + payload.hackStat); if (typeof Renderer !== 'undefined') Renderer.updateStats(); }
  }

  // ── INCOME ROW ──────────────────────────────────────
  function _refreshIncomeRow() {
    var row = document.getElementById('inc-factions-row');
    var val = document.getElementById('inc-factions');
    var income = getFactionsIncome();
    if (!row || !val) return;
    if (income > 0) {
      row.style.display = '';
      val.textContent = '+' + income + '/s';
    } else {
      row.style.display = 'none';
    }
  }

  // ── MINI LIST (left sidebar panel) ───────────────────
  function renderMiniList() {
    _ensureState();
    var el = _miniList();
    if (!el) return;
    var html = '';
    Object.keys(FACTIONS).forEach(function(id){
      var fac = FACTIONS[id];
      var disc = !!S.factions.discovered[id];
      var join_ = !!S.factions.joined[id];
      var rep = S.factions.rep[id] || 0;
      var classes = 'faction-mini-row ' + fac.colorClass;
      if (!disc) classes += ' locked';
      if (join_) classes += ' joined';
      var name = disc ? fac.name : '???';
      var repTxt = disc ? rep : '—';
      html += '<div class="' + classes + '" onclick="FactionsSystem.openWindow()">' +
                '<span class="faction-mini-icon">' + (disc ? fac.icon : '🔒') + '</span>' +
                '<span class="faction-mini-name ' + (join_ ? 'joined':'') + '">' + name + '</span>' +
                '<div class="faction-mini-bar">' +
                  '<div class="faction-mini-bar-fill" style="width:' + (disc ? rep : 0) + '%;background:' + fac.color + '"></div>' +
                '</div>' +
                '<span class="faction-mini-rep">' + repTxt + '</span>' +
              '</div>';
    });
    el.innerHTML = html;
  }

  // ── MAIN WINDOW ─────────────────────────────────────
  function openWindow() {
    _ensureState();
    renderWindow();
    var ov = _overlay();
    if (ov) ov.classList.add('show');
    _setTabPending(false);
  }
  function closeWindow() {
    var ov = _overlay();
    if (ov) ov.classList.remove('show');
  }

  function renderWindow() {
    _ensureState();
    var grid = _grid();
    if (!grid) return;
    var html = '';
    Object.keys(FACTIONS).forEach(function(id){
      html += _renderCard(id);
    });
    grid.innerHTML = html;
  }

  function _renderCard(id) {
    var fac = FACTIONS[id];
    var disc = !!S.factions.discovered[id];
    var join_ = !!S.factions.joined[id];
    var rep  = S.factions.rep[id] || 0;
    var miniWins = S.factions.minigameStats[id] || 0;
    var quest = getActiveQuest(id);
    var incomeContrib = join_ ? INCOME_PER_FACTION : 0;

    var cls = 'faction-card';
    if (!disc) cls += ' locked';
    if (join_) cls += ' joined';

    var questHtml = '';
    if (join_) {
      if (quest) {
        var doneClass = quest.data.done ? 'done' : '';
        var icon = quest.data.done ? '✓' : '◆';
        var status = quest.data.done ? ' [SPLNENÝ]' : ' [AKTÍVNY]';
        questHtml = '<div class="faction-card-quest ' + doneClass + '">' +
                      '<span class="faction-card-quest-icon">' + icon + '</span> ' +
                      '<span>' + fac.questTitle + status + '</span>' +
                    '</div>';
      } else {
        questHtml = '<div class="faction-card-quest">' +
                      '<span class="faction-card-quest-icon">◇</span> ' +
                      '<span>Quest: ' + fac.questTitle + ' [DOSTUPNÝ]</span>' +
                    '</div>';
      }
    }

    var actions = '';
    if (!disc) {
      actions = ''; // locked overlay handles
    } else if (!join_) {
      actions =
        '<button class="faction-card-btn primary ' + fac.colorClass + '" ' +
          'onclick="FactionsSystem.travelTo(\'' + id + '\')">▶ NAVŠTÍVIŤ HUB</button>' +
        '<button class="faction-card-btn ' + fac.colorClass + '" ' +
          'onclick="FactionsSystem.quickJoin(\'' + id + '\')">⚔ JOIN (10₿/s)</button>';
    } else {
      actions =
        '<button class="faction-card-btn primary ' + fac.colorClass + '" ' +
          'onclick="FactionsSystem.travelTo(\'' + id + '\')">▶ NAVŠTÍVIŤ HUB</button>' +
        '<button class="faction-card-btn ' + fac.colorClass + '" ' +
          'onclick="FactionsSystem.openMinigame(\'' + id + '\')">🎯 MINIHRA</button>' +
        '<button class="faction-card-btn" style="color:#888;border-color:#444" ' +
          'onclick="FactionsSystem.leave(\'' + id + '\')">✕ Opustiť frakciu</button>';
    }

    return '' +
      '<div class="' + cls + '">' +
        '<div class="faction-card-banner" style="background-image:url(\'' + fac.banner + '\')">' +
          '<div class="faction-card-banner-icon ' + fac.colorClass + '">' + (disc ? fac.icon : '🔒') + '</div>' +
          '<div class="faction-card-banner-name ' + fac.colorClass + '">' + fac.name + '</div>' +
        '</div>' +
        '<div class="faction-card-body">' +
          '<div class="faction-card-tag">' + fac.tag + '</div>' +
          '<div class="faction-card-desc">' + fac.desc + '</div>' +
          questHtml +
          '<div class="faction-card-rep-row">' +
            '<span class="faction-card-rep-label">REP</span>' +
            '<div class="faction-card-rep-bar">' +
              '<div class="faction-card-rep-fill" style="width:' + rep + '%;background:' + fac.color + '"></div>' +
            '</div>' +
            '<span class="faction-card-rep-num ' + fac.colorClass + '">' + rep + '</span>' +
          '</div>' +
          '<div class="faction-card-stats">' +
            '<div class="faction-card-stat"><span class="faction-card-stat-label">Príjem</span><span class="faction-card-stat-val">+' + incomeContrib + '₿/s</span></div>' +
            '<div class="faction-card-stat"><span class="faction-card-stat-label">Minihry</span><span class="faction-card-stat-val">' + miniWins + '</span></div>' +
          '</div>' +
          '<div class="faction-card-actions">' + actions + '</div>' +
        '</div>' +
      '</div>';
  }

  // ── ACTIONS ─────────────────────────────────────────
  function travelTo(facId) {
    var fac = FACTIONS[facId]; if (!fac) return;
    closeWindow();
    if (typeof goTo === 'function') goTo(fac.location);
  }

  function quickJoin(facId) {
    join(facId);
    renderWindow();
    travelTo(facId);
  }

  function openMinigame(facId) {
    closeWindow();
    var minigame = FACTIONS[facId].minigame;
    if (minigame === 'fishing' && typeof openFishing === 'function') {
      openFishing();
    } else if (minigame === 'street_deal' && typeof StreetDealMinigame !== 'undefined') {
      StreetDealMinigame.open();
    } else if (minigame === 'terminal_ops' && typeof TerminalOpsMinigame !== 'undefined') {
      TerminalOpsMinigame.open();
    } else if (minigame === 'stocks' && typeof StocksMinigame !== 'undefined') {
      StocksMinigame.open();
    } else {
      showNotif('🎯 Minihra bude dostupná v ďalšej etape');
    }
  }

  // ── AUTO-DISCOVERY HOOK (volá sa pri scéna onEnter) ─
  // Mapuje existujúce flagy na frakcie. Volá sa z renderScene wrappera.
  var DISCOVERY_TRIGGERS = {
    stokari_prvykontakt: 'stokari',  // Ferko @ priemyselná štvrť
    stokari_jantar:      'stokari',
    stokari_vnem:        'stokari',
    oravec_stopa:        'hackers',   // Lucia spomne Oravca
    melisko_kontakt:     'ceo',       // Mike Melišek = network into CEO
    miki_navstiveny:     'rybari',    // Lucia v Miki bare = rybári hint
    lucia_rep_plus:      'rybari',
    tomas_stopa:         'ceo'
  };
  function checkDiscoveryFromFlags() {
    _ensureState();
    Object.keys(DISCOVERY_TRIGGERS).forEach(function(flagName){
      if (S.flags && S.flags[flagName]) {
        var facId = DISCOVERY_TRIGGERS[flagName];
        if (!S.factions.discovered[facId]) {
          discover(facId);
        }
      }
    });
  }

  // ── INIT ────────────────────────────────────────────
  function init() {
    _ensureState();
    renderMiniList();
    _refreshIncomeRow();
    // Skontroluj ci uz nieco neunlocknute z minulosti
    checkDiscoveryFromFlags();
  }

  // ── PUBLIC ──────────────────────────────────────────
  return {
    FACTIONS: FACTIONS,
    init: init,
    join: join,
    leave: leave,
    discover: discover,
    addRep: addRep,
    activateQuest: activateQuest,
    completeQuest: completeQuest,
    getActiveQuest: getActiveQuest,
    onMinigameSuccess: onMinigameSuccess,
    getFactionsIncome: getFactionsIncome,
    openWindow: openWindow,
    closeWindow: closeWindow,
    renderWindow: renderWindow,
    renderMiniList: renderMiniList,
    travelTo: travelTo,
    quickJoin: quickJoin,
    openMinigame: openMinigame,
    checkDiscoveryFromFlags: checkDiscoveryFromFlags
  };
})();

// ── Hooks: volaj checkDiscoveryFromFlags po každej scéne ──
(function(){
  // Wrap goTo aby po vstupe do scény skontroloval discovery
  if (typeof goTo === 'function') {
    var _origGoTo = goTo;
    window.goTo = function(sceneId) {
      var r = _origGoTo.apply(this, arguments);
      try { FactionsSystem.checkDiscoveryFromFlags(); } catch(e){}
      return r;
    };
  }
  // Wrap loadGame aby po načítaní obnovil mini list a income
  if (typeof loadGame === 'function') {
    var _origLoad = loadGame;
    window.loadGame = function() {
      _origLoad.apply(this, arguments);
      try { FactionsSystem.init(); } catch(e){}
    };
  }
  // Wrap newGame aby pri novej hre resetol UI
  if (typeof newGame === 'function') {
    var _origNew = newGame;
    window.newGame = function() {
      _origNew.apply(this, arguments);
      try { FactionsSystem.init(); } catch(e){}
    };
  }
})();

// ── Hook: do GameLoop._tick — pridaj faction income ──
(function(){
  // Patch existujúci tick: mokrý monkey-patch GameLoop start/stop nestačí, lebo total
  // sa počíta inline. Riešime to tak, že pri každom poskočení S.money pripočítame
  // faction income cez interval (1s) — bezpečné, nevyžaduje úpravu pôvodnej logiky.
  var lastFactionTick = Date.now();
  setInterval(function(){
    if (typeof S === 'undefined' || !S.factions) return;
    if (typeof StateMachine === 'undefined') return;
    if (!StateMachine.is(StateMachine.STATES.PLAYING)) return;
    var now = Date.now();
    if (now - lastFactionTick < 950) return; // ~1s
    lastFactionTick = now;
    var inc = FactionsSystem.getFactionsIncome();
    if (inc > 0) {
      S.money += inc;
      if (typeof Renderer !== 'undefined') {
        Renderer.updateMoney();
        // refresh income display every ~5 ticks
        if (Math.random() < 0.2) Renderer.updateIncome();
      }
    }
  }, 1000);
})();

// ── Init po DOM ready ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){ try { FactionsSystem.init(); } catch(e){ console.warn('[Factions] init err:', e); } }, 200);
  });
} else {
  setTimeout(function(){ try { FactionsSystem.init(); } catch(e){ console.warn('[Factions] init err:', e); } }, 200);
}
