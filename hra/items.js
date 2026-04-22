'use strict';

/* ════════════════════════════════════════════════════════════════════
   DATA: Items, Shop, Fish, Fleet, Kurzy, Semienka, Recepty, Profesie
   Závislosti: config.js (GameConfig), systems/state.js (S), systems/renderer.js (Renderer)
════════════════════════════════════════════════════════════════════ */

/* ── PREDMETY ─────────────────────────────────────────────────────── */
var ITEMS = {
  baterka:      { name:'Baterka',              desc:'Prenosné svietidlo. Potrebná do jaskyne.',         icon:'🔦', usable:false },
  keycard:      { name:'Keycard OMEGA',         desc:'Duplikát prístupu do bunkra LAZARUS.',             icon:'💳', usable:false },
  spis:         { name:'Spis OMEGA',            desc:'Dôverná dokumentácia operácie LAZARUS.',           icon:'📁', usable:false },
  medkit:       { name:'Lekárnička',            desc:'Obnoví 30 HP. Jednorazová.',                       icon:'🩹', usable:true,
    onUse: function(){ S.hp = Math.min(100, S.hp+30); Renderer.updateStats(); addLog('Medkit: HP +30','ok'); removeItem('medkit'); }
  },
  flask:        { name:'Fľaša whisky',          desc:'Obnoví 20 SAN. Jednorazová.',                      icon:'🥃', usable:true,
    onUse: function(){ S.san = Math.min(100, S.san+20); Renderer.updateStats(); addLog('Whisky: SAN +20','ok'); removeItem('flask'); }
  },
  noze:         { name:'Záchranný nôž',         desc:'Nástroj pre núdzové situácie.',                    icon:'🔪', usable:false },
  alobal:       { name:'Alobalová čiapka',       desc:'Blokuje LAZARUS frekvencie? SAN +5.',              icon:'🧢', usable:false },
  plynomaska:   { name:'Plynová maska',          desc:'Ochrana dýchacích ciest. SAN +3.',                 icon:'😷', usable:false },
  gas_mask_pro: { name:'Profi plynová maska',    desc:'Trieda CBRN. SAN +8.',                             icon:'🪖', usable:false },
  cap_alobal:   { name:'Vojenská čiapka + alobal',desc:'Dvojitá ochrana. SAN +5.',                       icon:'🪖', usable:false },
  visor_tech:   { name:'Tech vizír',             desc:'Augmentovaná realita. HCK +10.',                   icon:'🥽', usable:false },
  kevlar_vest:  { name:'Kevlarová vesta',         desc:'Ballistická ochrana. HP +20.',                    icon:'🦺', usable:false },
  trench_coat:  { name:'Trenčkot',               desc:'Psychologická obrna. SAN +10.',                    icon:'🧥', usable:false },
  cargo_pants:  { name:'Cargo nohavice',          desc:'Extra vrecká. Inventár +5 slotov.',               icon:'👖', usable:false },
  pants_suit:   { name:'Nohavice od obleku',      desc:'Charizma +. SAN +3.',                             icon:'👔', usable:false },
  weapon_baton: { name:'Teleskopický obušok',     desc:'Pouličná zbraň. SIL +15.',                        icon:'🏏', usable:false },
  weapon_glock: { name:'Glock 19',               desc:'Hladká rana. SIL +25.',                           icon:'🔫', usable:false },
  weapon_taser: { name:'Taser',                  desc:'Nenásilné riešenie. OHY +5.',                      icon:'⚡', usable:false },
  hack_pwnbox:  { name:'PwnBox',                 desc:'Hardvérový hacking nástroj. HCK +15, +50₿/s',     icon:'💻', usable:false },
  neural_link:  { name:'Neurálny prepoj',         desc:'Priamy mozog-sieť most. HCK +30.',                icon:'🧠', usable:false },
  detektor:     { name:'EMF detektor',            desc:'Merá LAZARUS frekvencie. HCK +3.',                icon:'📡', usable:false },
  mata_list:    { name:'Mätový list',             desc:'Upokojujúci účinok. SAN +5.',                     icon:'🌿', usable:true,
    onUse: function(){ S.san = Math.min(100, S.san+5); Renderer.updateStats(); addLog('Mäta: SAN +5','ok'); removeItem('mata_list'); }
  },
  hrib_magicky: { name:'Magický hríb',            desc:'Neobyčajné vidiny. SAN ±15.',                     icon:'🍄', usable:true,
    onUse: function(){ var delta=Math.random()>0.5?15:-15; S.san=Math.min(100,Math.max(0,S.san+delta)); Renderer.updateStats(); addLog('Hríb: SAN '+(delta>0?'+':'')+delta,'warn'); removeItem('hrib_magicky'); }
  },
};

/* ── BONUSY VÝSTROJA ─────────────────────────────────────────────── */
var EQUIP_BONUSES = {
  cap_alobal:   { san: 5,        label:'SAN +5' },
  visor_tech:   { hackStat: 10,  label:'HCK +10' },
  gas_mask_pro: { san: 8,        label:'SAN +8' },
  plynomaska:   { san: 3,        label:'SAN +3' },
  kevlar_vest:  { hp: 20,        label:'HP +20' },
  trench_coat:  { san: 10,       label:'SAN +10' },
  cargo_pants:  {                  label:'Inventár +5' },
  pants_suit:   { san: 3,        label:'SAN +3' },
  weapon_baton: { str: 15,       label:'SIL +15' },
  weapon_glock: { str: 25,       label:'SIL +25' },
  weapon_taser: { flex: 5,       label:'OHY +5' },
  hack_pwnbox:  { hackStat: 15,  label:'HCK +15' },
  neural_link:  { hackStat: 30,  label:'HCK +30' },
  detektor:     { hackStat: 3,   label:'HCK +3' },
};

/* ── SLOTY VÝSTROJA ──────────────────────────────────────────────── */
var ITEM_EQUIP_SLOT = {
  cap_alobal:'head', visor_tech:'head', gas_mask_pro:'head', plynomaska:'head',
  kevlar_vest:'body', trench_coat:'body',
  cargo_pants:'pants', pants_suit:'pants',
  weapon_baton:'weapon', weapon_glock:'weapon', weapon_taser:'weapon',
  hack_pwnbox:'special', neural_link:'special', detektor:'special',
  keycard:'feet', baterka:'feet',
};

/* ── OBCHOD ──────────────────────────────────────────────────────── */
var SHOP_ITEMS = [
  { id:'cap_alobal',       name:'Alobalová čiapka',        icon:'🪖', price:100,   desc:'SAN +5 | Blokuje LAZARUS signály',       category:'head' },
  { id:'visor_tech',       name:'Tech vizír',              icon:'🥽', price:2000,  desc:'HCK +10 | Augmentovaná realita',         category:'head' },
  { id:'gas_mask_pro',     name:'Profi plynová maska',     icon:'😷', price:800,   desc:'SAN +8 | Trieda CBRN ochrana',           category:'head' },
  { id:'plynomaska',       name:'Štandardná plynová maska',icon:'😷', price:350,   desc:'SAN +3 | Základná ochrana',              category:'head' },
  { id:'kevlar_vest',      name:'Kevlarová vesta',         icon:'🦺', price:1500,  desc:'HP +20 | Balistická ochrana IIIA',       category:'body' },
  { id:'trench_coat',      name:'Trenčkot',                icon:'🧥', price:600,   desc:'SAN +10 | Psychologická ochrana',        category:'body' },
  { id:'cargo_pants',      name:'Cargo nohavice',          icon:'👖', price:200,   desc:'Inventár +5 slotov',                     category:'pants' },
  { id:'pants_suit',       name:'Nohavice od obleku',      icon:'👔', price:450,   desc:'SAN +3 | Charizma boost',                category:'pants' },
  { id:'baterka',          name:'Taktická baterka',        icon:'🔦', price:80,    desc:'Potrebná pre jaskyne',                   category:'items' },
  { id:'medkit',           name:'Lekárnička',              icon:'🩹', price:150,   desc:'HP +30 | Jednorazová',                   category:'items' },
  { id:'flask',            name:'Fľaša whisky',            icon:'🥃', price:120,   desc:'SAN +20 | Jednorazová',                  category:'items' },
  { id:'noze',             name:'Záchranný nôž',           icon:'🔪', price:90,    desc:'Núdzový nástroj',                        category:'items' },
  { id:'detektor',         name:'EMF detektor',            icon:'📡', price:400,   desc:'HCK +3 | Meranie LAZARUS frekvencií',   category:'items' },
  { id:'weapon_baton',     name:'Teleskopický obušok',     icon:'🏏', price:300,   desc:'SIL +15 | Pouličná zbraň',               category:'weapon' },
  { id:'weapon_glock',     name:'Glock 19',                icon:'🔫', price:2500,  desc:'SIL +25 | Licencovaná sidearm',          category:'weapon' },
  { id:'weapon_taser',     name:'Taser',                   icon:'⚡', price:700,   desc:'OHY +5 | Nenásilná možnosť',             category:'weapon' },
  { id:'hack_pwnbox',      name:'PwnBox',                  icon:'💻', price:3000,  desc:'HCK +15 | +50₿/s pasívne',              category:'special' },
  { id:'neural_link',      name:'Neurálny prepoj',         icon:'🧠', price:8000,  desc:'HCK +30 | Endgame item',                category:'special' },
  // Lode (cookie clicker kategória)
  { id:'boat_fishing_rod', name:'Rybársky prút',           icon:'🎣', price:100,   desc:'+5₿/s | Základný prút',  boatIncome:5,   flexRate:0.01, category:'boats' },
  { id:'boat_rowboat',     name:'Riečny čln',              icon:'🚣', price:500,   desc:'+20₿/s | Malý čln',      boatIncome:20,  flexRate:0.02, category:'boats' },
  { id:'boat_motor',       name:'Motorový čln',            icon:'⛵', price:2000,  desc:'+80₿/s | Motorový',      boatIncome:80,  flexRate:0.05, category:'boats' },
  { id:'boat_trawler',     name:'Rybársky trawler',        icon:'🚢', price:8000,  desc:'+300₿/s | Trawler',      boatIncome:300, flexRate:0.1,  category:'boats' },
  { id:'boat_factory',     name:'Rybárska továreň',        icon:'🏭', price:35000, desc:'+1200₿/s | Fabrika',     boatIncome:1200,flexRate:0.2,  category:'boats' },
];
