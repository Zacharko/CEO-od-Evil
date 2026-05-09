/* CEO od Zla // §37 CityMap */
/* global S, gainXP, addLog, addItem, hasItem, showNotif, Renderer, GameConfig, switchView */

var CityMap = (function() {

  // ── Lokácie na mape ──────────────────────────────────
  // x, y v 1200x700 viewBox · color = primárna farba glow-u
  var LOCATIONS = [
    // === CENTRUM ===
    { id:'centrum',   x:550, y:290, w:80, h:55, scene:'start',
      name:'CENTRUM', emoji:'🌃', color:'#39ff14', big:true,
      desc:'Námestie Slobody. 03:47. Tichá ulica.', faction:null },
    { id:'namestie',  x:550, y:200, w:70, h:45, scene:'loc_namestie',
      name:'NÁMESTIE', emoji:'⛪', color:'#22d3ee',
      desc:'Námestie — 5G veža stojí tu.', faction:null },
    { id:'posta',     x:430, y:240, w:60, h:40, scene:'posta',
      name:'POŠTA', emoji:'📮', color:'#22d3ee',
      desc:'Pošta — Druid ti tu nechal informácie.', faction:null },
    { id:'miki',      x:380, y:340, w:65, h:42, scene:'loc_miki',
      name:'MIKI BAR', emoji:'🍺', color:'#a855f7',
      desc:'Miki Bar — Lucia, hudba, dym.', faction:null },
    { id:'jantar',    x:640, y:210, w:65, h:42, scene:'loc_jantar',
      name:'JANTÁR', emoji:'🟡', color:'#facc15',
      desc:'Jantár Club — kde sa stretáva CEO sieť.', faction:'ceo' },
    { id:'stanica',   x:650, y:360, w:70, h:45, scene:'loc_stanica',
      name:'STANICA', emoji:'🚉', color:'#94a3b8',
      desc:'Hlavná stanica — vstup do mesta.', faction:null },

    // === SEVER ===
    { id:'fri',       x:260, y:130, w:70, h:48, scene:'loc_fri',
      name:'FIT/FRI', emoji:'💻', color:'#22d3ee',
      desc:'Fakulta IT. Oravec. Lab B7.', faction:'hackers' },
    { id:'korzo',     x:430, y:130, w:65, h:42, scene:'loc_korzo',
      name:'KORZO OC', emoji:'🏬', color:'#fb923c',
      desc:'Obchodné centrum — jedlo, obchody.', faction:null },
    { id:'squash',    x:310, y:220, w:60, h:38, scene:'loc_squash',
      name:'SQUASH', emoji:'🏓', color:'#4ade80',
      desc:'Squash centrum — tréning.', faction:null },

    // === JUH ===
    { id:'zagorska',  x:420, y:490, w:70, h:45, scene:'loc_zagorska',
      name:'GYM', emoji:'🏋️', color:'#f97316',
      desc:'Gym Zagorská — silový tréning.', faction:null },
    { id:'terasy',    x:550, y:500, w:65, h:42, scene:'loc_terasy',
      name:'TERASY', emoji:'🌿', color:'#4ade80',
      desc:'Terasy — SAN +5, výhľad na mesto.', faction:null },
    { id:'lesopark',  x:660, y:480, w:65, h:42, scene:'loc_lesopark',
      name:'LESOPARK', emoji:'🌲', color:'#22c55e',
      desc:'Lesopark — ticho, stopy v tráve.', faction:null },
    { id:'domov',     x:760, y:390, w:65, h:42, scene:'loc_domov',
      name:'ZÁKLADŇA', emoji:'🏠', color:'#39ff14',
      desc:'Tvoja základňa — odpočinok, HQ.', faction:null },
    { id:'pila',      x:250, y:460, w:80, h:50, scene:'fac_stokari_garaze',
      name:'PÍLA · GARÁŽE', emoji:'🏚', color:'#ef4444',
      desc:'Stokárske garáže. Karina + Ferko.', faction:'stokari' },

    // === BOJNICE / OKOLIE ===
    { id:'bojnice',   x:820, y:180, w:75, h:48, scene:'loc_bojnice',
      name:'BOJNICE', emoji:'🏰', color:'#a78bfa',
      desc:'Bojnický zámok — tajné tunely?', faction:null },
    { id:'biotech',   x:180, y:280, w:70, h:45, scene:'loc_biotech',
      name:'NEMOCNICA', emoji:'🏥', color:'#ef4444',
      desc:'Nemocnica — Bane Corp. biotech.', faction:null },

    // === FRAKCIE ===
    { id:'topcafe',   x:870, y:120, w:90, h:55, scene:'fac_ceo_penthouse',
      name:'TOP CAFE', emoji:'🏙', color:'#facc15', big:true,
      desc:'CEO Penthouse na vrchu Top Cafe.', faction:'ceo' },
    { id:'mrtve',     x:940, y:400, w:80, h:50, scene:'fac_rybari_rameno',
      name:'MŔTVE RAMENO', emoji:'🐟', color:'#4ade80',
      desc:'Rybári hub. Starý Fero pri ohni.', faction:'rybari' },
    { id:'michal',    x:830, y:290, w:75, h:48, scene:'michal_penthouse_vstup',
      name:'BOJNICKÁ 17', emoji:'🌃', color:'#22d3ee',
      desc:'Michala penthouse — vstup.', faction:null },

    // === VZDIALENÉ ===
    { id:'banovce',   x:70,  y:190, w:80, h:50, scene:'loc_banovce',
      name:'BÁNOVCE 5G', emoji:'📡', color:'#a855f7',
      desc:'Bánovce — 5G Sektor 7.', faction:null },
    { id:'vtacnik',   x:70,  y:460, w:80, h:50, scene:'banovce_cesta',
      name:'VTÁČNIK', emoji:'⛰', color:'#84cc16',
      desc:'Cesta cez Vtáčnik.', faction:null }
  ];

  // ── Routes between locations (lines on map) ──────────
  var ROUTES = [
    ['centrum','namestie'], ['centrum','posta'], ['centrum','miki'],
    ['centrum','jantar'], ['centrum','stanica'], ['centrum','terasy'],
    ['namestie','jantar'], ['namestie','korzo'], ['posta','miki'],
    ['fri','korzo'], ['fri','squash'], ['fri','banovce'],
    ['squash','centrum'], ['korzo','centrum'],
    ['zagorska','terasy'], ['terasy','lesopark'], ['lesopark','domov'],
    ['domov','stanica'], ['domov','michal'],
    ['pila','zagorska'], ['pila','vtacnik'],
    ['jantar','topcafe'], ['topcafe','bojnice'], ['topcafe','michal'],
    ['miki','mrtve'], ['mrtve','stanica'],
    ['biotech','fri'], ['biotech','centrum'],
    ['banovce','vtacnik']
  ];

  // ── DOM refs ─────────────────────────────────────────
  var _dom = {};
  function _cacheDom() {
    _dom = {
      overlay:  document.getElementById('city-map-overlay'),
      svg:      document.getElementById('city-map-svg'),
      tooltip:  document.getElementById('city-tooltip'),
      money:    document.getElementById('city-map-money'),
      hp:       document.getElementById('city-map-hp'),
      san:      document.getElementById('city-map-san'),
      time:     document.getElementById('city-map-time')
    };
  }

  // ── Render: draw routes + locations ──────────────────
  function _locById(id) {
    for (var i = 0; i < LOCATIONS.length; i++) if (LOCATIONS[i].id === id) return LOCATIONS[i];
    return null;
  }

  function _renderSvg() {
    var svg = _dom.svg; if (!svg) return;
    var html = '';

    // Decorative circle outline of "city limits"
    html += '<defs>' +
      '<radialGradient id="cityGlow" cx="50%" cy="50%">' +
        '<stop offset="0%" stop-color="#39ff14" stop-opacity="0.15"/>' +
        '<stop offset="60%" stop-color="#39ff14" stop-opacity="0.05"/>' +
        '<stop offset="100%" stop-color="#39ff14" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<filter id="glow">' +
        '<feGaussianBlur stdDeviation="3" result="b"/>' +
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
    '</defs>';

    // City glow ellipse
    html += '<ellipse cx="600" cy="350" rx="520" ry="280" fill="url(#cityGlow)"/>';

    // River (Mŕtve Rameno area decoration)
    html += '<path d="M 800 350 Q 870 380 920 460 Q 970 520 1050 540" stroke="#22d3ee" stroke-width="4" fill="none" opacity="0.3" stroke-dasharray="2 2"/>';

    // Routes (lines between locations)
    ROUTES.forEach(function(route){
      var a = _locById(route[0]), b = _locById(route[1]);
      if (!a || !b) return;
      var ax = a.x + (a.w||0)/2, ay = a.y + (a.h||0)/2;
      var bx = b.x + (b.w||0)/2, by = b.y + (b.h||0)/2;
      html += '<line class="city-route" x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="#39ff14" stroke-width="1"/>';
    });

    // Locations
    LOCATIONS.forEach(function(loc){
      var fx = loc.x, fy = loc.y, fw = loc.w, fh = loc.h;
      var cx = fx + fw/2, cy = fy + fh/2;
      var faction = loc.faction;
      var factionMark = '';
      if (faction && S.factions && S.factions.discovered && S.factions.discovered[faction]) {
        var joined = S.factions.joined && S.factions.joined[faction];
        var icon = joined ? '✓' : '◆';
        factionMark = '<text x="' + (fx + fw - 8) + '" y="' + (fy + 12) + '" class="city-loc-faction-marker" style="color:' + loc.color + '">' + icon + '</text>';
      }
      html +=
        '<g class="city-loc" data-id="' + loc.id + '" data-scene="' + loc.scene + '" style="color:' + loc.color + '"' +
            ' onclick="CityMap.travel(\'' + loc.id + '\')"' +
            ' onmouseenter="CityMap.showTooltip(event,\'' + loc.id + '\')"' +
            ' onmouseleave="CityMap.hideTooltip()">' +
          // Outer glow rectangle
          '<rect class="city-loc-glow" x="' + (fx-4) + '" y="' + (fy-4) + '" width="' + (fw+8) + '" height="' + (fh+8) + '" ' +
                'fill="none" stroke="' + loc.color + '" stroke-width="1" opacity="0.3"/>' +
          // Main rect
          '<rect class="city-loc-rect" x="' + fx + '" y="' + fy + '" width="' + fw + '" height="' + fh + '" ' +
                'fill="rgba(5,8,16,0.8)" stroke="' + loc.color + '" stroke-width="2" filter="url(#glow)"/>' +
          // Emoji
          '<text class="city-loc-emoji" x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" dominant-baseline="middle">' + loc.emoji + '</text>' +
          // Label below the box
          '<text class="city-loc-label" x="' + cx + '" y="' + (fy + fh + 14) + '" text-anchor="middle">' + loc.name + '</text>' +
          factionMark +
        '</g>';
    });

    svg.innerHTML = html;
  }

  function _updateStats() {
    if (typeof S === 'undefined') return;
    if (_dom.money) _dom.money.textContent = (S.money | 0).toLocaleString('sk');
    if (_dom.hp)    _dom.hp.textContent    = Math.round(S.hp || 0);
    if (_dom.san)   _dom.san.textContent   = Math.round(S.san || 0);
    if (_dom.time)  _dom.time.textContent  = (S.time || '03:47');
  }

  // ── Tooltip handling ─────────────────────────────────
  function showTooltip(event, locId) {
    var loc = _locById(locId);
    if (!loc) return;
    var tt = _dom.tooltip; if (!tt) return;
    var factionTxt = '';
    if (loc.faction && S.factions && S.factions.discovered && S.factions.discovered[loc.faction]) {
      var rep = S.factions.rep[loc.faction] || 0;
      var fname = ({stokari:'Stokári',hackers:'Hackeri',ceo:'CEO',rybari:'Rybári'})[loc.faction];
      factionTxt = '<div class="tt-faction" style="color:' + loc.color + '">⚔ ' + fname + ' · REP ' + rep + '/100</div>';
    }
    tt.innerHTML =
      '<div class="tt-name" style="color:' + loc.color + '">' + loc.emoji + '  ' + loc.name + '</div>' +
      '<div class="tt-desc">' + loc.desc + '</div>' +
      factionTxt;
    tt.style.borderColor = loc.color;
    tt.style.left = (event.clientX + 14) + 'px';
    tt.style.top  = (event.clientY + 14) + 'px';
    tt.classList.add('show');
  }
  function hideTooltip() {
    if (_dom.tooltip) _dom.tooltip.classList.remove('show');
  }

  // ── Travel to location ───────────────────────────────
  function travel(locId) {
    var loc = _locById(locId);
    if (!loc) return;
    if (typeof SFX !== 'undefined') SFX.navigate();
    // Zatvori mapu a naviguj
    close();
    if (typeof goTo === 'function') goTo(loc.scene);
  }

  function open() {
    _cacheDom();
    if (!_dom.overlay) return;
    _renderSvg();
    _updateStats();
    _dom.overlay.classList.add('show');
    if (typeof SoundFX !== 'undefined') SoundFX.play('mapOpen');
  }
  function close() {
    if (_dom && _dom.overlay) _dom.overlay.classList.remove('show');
    hideTooltip();
  }

  // ── ESC closes map ──────────────────────────────────
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && _dom.overlay && _dom.overlay.classList.contains('show')) {
      close();
    }
  });

  return {
    open: open, close: close,
    travel: travel,
    showTooltip: showTooltip,
    hideTooltip: hideTooltip,
    LOCATIONS: LOCATIONS
  };
})();
