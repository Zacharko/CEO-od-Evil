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

/* ── DRUHY RÝB ───────────────────────────────────────────────────── */
var FISH_TYPES = [
  { id:'kapor',  name:'Kapor',           icon:'🐟', value:25,  desc:'Bežný sladkovodný. Celkom chutný.' },
  { id:'stuka',  name:'Šťuka',           icon:'🐠', value:60,  desc:'Agresívny predátor. Vzácnejší.' },
  { id:'sumec',  name:'Sumec',           icon:'🐡', value:110, desc:'Nočný lovec. Ťažký záber.' },
  { id:'pstruh', name:'Pstruh potočný',  icon:'🦈', value:85,  desc:'Čistá voda. Rýchly.' },
  { id:'bester', name:'Bester (hybrid)', icon:'🐋', value:200, desc:'Rare hybrid. Veľký záber.' },
  { id:'hazmat', name:'Hazmat ryba',     icon:'☢️', value:400, desc:'Nečakaná mutácia z Nitry. Pozor!' },
];

/* ── FLOTILA LODÍ ────────────────────────────────────────────────── */
var FLEET_BOATS = [
  { id:'fishing_rod',  name:'Rybársky prút',    icon:'🎣', baseIncome:2,   baseCost:150,  upgrades:[
    { id:'better_hook', name:'Lepší háčik',  desc:'+1₿/s',   incomeBonus:1,   cost:400 },
    { id:'pro_line',    name:'Pro vlasec',   desc:'+3₿/s',   incomeBonus:3,   cost:900 },
  ]},
  { id:'rowboat',      name:'Riečny čln',       icon:'🚣', baseIncome:8,   baseCost:800,  upgrades:[
    { id:'oars_upgrade',name:'Lepšie veslá',    desc:'+4₿/s',  incomeBonus:4,   cost:1500 },
    { id:'sonar_basic', name:'Základný sonar',  desc:'+10₿/s', incomeBonus:10,  cost:4000 },
  ]},
  { id:'motorboat',    name:'Motorový čln',      icon:'⛵', baseIncome:30,  baseCost:4000, upgrades:[
    { id:'turbo_engine',name:'Turbo motor',     desc:'+15₿/s', incomeBonus:15,  cost:10000 },
    { id:'fish_finder', name:'Fish finder',     desc:'+30₿/s', incomeBonus:30,  cost:25000 },
  ]},
  { id:'trawler',      name:'Rybársky trawler',  icon:'🚢', baseIncome:100, baseCost:18000,upgrades:[
    { id:'big_nets',    name:'Veľké siete',      desc:'+50₿/s', incomeBonus:50,  cost:45000 },
    { id:'crew_bonus',  name:'Extra posádka',    desc:'+100₿/s',incomeBonus:100, cost:100000 },
  ]},
  { id:'factory_ship', name:'Rybárska továreň',  icon:'🏭', baseIncome:400, baseCost:80000,upgrades:[
    { id:'processing',  name:'Spracovateľ',      desc:'+200₿/s',incomeBonus:200, cost:180000 },
    { id:'fleet_ai',    name:'Fleet AI',          desc:'+400₿/s',incomeBonus:400, cost:400000 },
  ]},
];

/* ── KURZY — UNIVERZITA ──────────────────────────────────────────── */
var UNI_COURSES = [
  { id:'intro_hacking',     name:'Intro to Hacking',        icon:'💻', desc:'Základy sieťovej bezpečnosti.',   stat:'hackStat', ratePerSec:0.015, cost:500,  maxLevel:5, levelMult:1.8, statLabel:'HCK +0.015/s' },
  { id:'advanced_exploit',  name:'Advanced Exploitation',   icon:'🔓', desc:'Buffer overflows, zero-days.',    stat:'hackStat', ratePerSec:0.04,  cost:2000, maxLevel:5, levelMult:1.8, statLabel:'HCK +0.04/s',  requires:20 },
  { id:'ghost_protocol',    name:'Ghost Protocol',          icon:'👻', desc:'Neviditeľnosť v sieti.',           stat:'hackStat', ratePerSec:0.08,  cost:8000, maxLevel:3, levelMult:2.2, statLabel:'HCK +0.08/s',  requires:50 },
  { id:'psych_stability',   name:'Psychologická odolnosť',  icon:'🧠', desc:'Mentálna odolnosť. SAN regen.',   stat:'san',      ratePerSec:0.02,  cost:800,  maxLevel:5, levelMult:1.6, statLabel:'SAN +0.02/s' },
  { id:'crisis_management', name:'Crisis Management',       icon:'⚠️', desc:'Riadenie kríz. SAN + HP.',        stat:'san',      ratePerSec:0.03,  cost:3000, maxLevel:4, levelMult:1.9, statLabel:'SAN +0.03/s',  secondStat:'hp', secondRate:0.01, requires:30 },
  { id:'fintech',           name:'Fintech a Krypto',        icon:'₿',  desc:'Blockchain investície. +Príjem.', stat:'hackStat', ratePerSec:0.01,  cost:1500, maxLevel:5, levelMult:1.7, statLabel:'HCK +0.01/s',  incomeBonus:5 },
];

/* ── KURZY — GYM ─────────────────────────────────────────────────── */
var GYM_COURSES = [
  { id:'boxing',      name:'Box',                  icon:'🥊', desc:'Priama sila a reflexy. SIL+',     stat:'str',  ratePerSec:0.025, cost:400,  maxLevel:5, levelMult:1.7, statLabel:'SIL +0.025/s' },
  { id:'crossfit',    name:'CrossFit',             icon:'💪', desc:'Všestranná kondícia. OHY + SIL.', stat:'flex', ratePerSec:0.02,  cost:600,  maxLevel:5, levelMult:1.7, statLabel:'OHY +0.02/s',  secondStat:'hp', secondRate:0.008 },
  { id:'parkour',     name:'Parkour',              icon:'🤸', desc:'Mestský pohyb. OHY+',              stat:'flex', ratePerSec:0.04,  cost:1200, maxLevel:4, levelMult:1.9, statLabel:'OHY +0.04/s',  requires:25 },
  { id:'meditation',  name:'Meditácia',            icon:'🧘', desc:'Vnútorný pokoj. SAN+',              stat:'san',  ratePerSec:0.015, cost:300,  maxLevel:5, levelMult:1.5, statLabel:'SAN +0.015/s' },
  { id:'hp_recovery', name:'Regeneračný tréning',  icon:'💊', desc:'HP regen protokol.',                stat:'hp',   ratePerSec:0.015, cost:700,  maxLevel:5, levelMult:1.7, statLabel:'HP +0.015/s' },
];

/* ── SEMIENKA — ZÁHRADKA ─────────────────────────────────────────── */
var GARDEN_SEEDS = [
  { id:'paradajka', name:'Paradajka', emoji:'🍅', cost:50,  time:120, reward:100, income:0.1,  hunger:25, item:null },
  { id:'mata',      name:'Mäta',      emoji:'🌿', cost:30,  time:90,  reward:60,  income:0.08, hunger:8,  item:'mata_list' },
  { id:'cibuľa',    name:'Cibuľka',   emoji:'🧅', cost:25,  time:60,  reward:45,  income:0.05, hunger:12, item:null },
  { id:'cesnak',    name:'Cesnak',    emoji:'🧄', cost:40,  time:100, reward:75,  income:0.08, hunger:10, item:null },
  { id:'jahoda',    name:'Jahoda',    emoji:'🍓', cost:80,  time:180, reward:160, income:0.2,  hunger:30, item:null },
  { id:'hrib',      name:'Hríb',      emoji:'🍄', cost:130, time:240, reward:280, income:0.3,  hunger:35, item:'hrib_magicky' },
  { id:'jablko',    name:'Jabloň',    emoji:'🍎', cost:200, time:360, reward:450, income:0.5,  hunger:45, item:null },
  { id:'slnecnica', name:'Slnečnica', emoji:'🌻', cost:65,  time:150, reward:130, income:0.15, hunger:18, item:null },
];

/* ── RECEPTY — KUCHYŇA ───────────────────────────────────────────── */
var RECIPES = {
  vajicka:   { name:'Vajíčka',         icon:'🍳', cost:0,  hunger:35, hp:5,  san:0,  str:0 },
  cestoviny: { name:'Cestoviny',        icon:'🍝', cost:30, hunger:60, hp:0,  san:5,  str:0 },
  steak:     { name:'Steak',           icon:'🥩', cost:80, hunger:80, hp:15, san:0,  str:1 },
  polievka:  { name:'Domáca polievka', icon:'🍲', cost:20, hunger:50, hp:0,  san:10, str:0 },
};

/* ── PROFESIE ─────────────────────────────────────────────────────── */
var JOBS = {
  thug: {
    name: 'THUG',
    titles:    ['Pouličný vymáhač', 'Bos okresu', 'Don Prievidze'],
    salary:    [45, 120, 280],
    attrRates: { hp:0.01, san:-0.008, str:0.03, flex:0.005, hack:0.00 },
    hungerRate: 1.3,
    decisionHungerMult: 1.2,
    activityBonus: { combat:{ str:2, hp:-5 }, fishing:{ flex:1 } }
  },
  hacker: {
    name: 'HACKER',
    titles:    ['Script Kiddie', 'Elite Hacker', 'Ghost // Root'],
    salary:    [45, 120, 280],
    attrRates: { hp:0.00, san:0.01, str:0.00, flex:0.00, hack:0.05 },
    hungerRate: 0.7,
    decisionHungerMult: 0.9,
    sanDecisionMult: 1.3,
    activityBonus: { fishing:{ san:1 }, hacking:{ hack:3 } }
  },
  zastupca: {
    name: 'ZÁSTUPCA CEO',
    titles:    ['Asistent riaditeľa', 'Riaditeľ operácií', 'CEO Zla'],
    salary:    [45, 120, 280],
    attrRates: { hp:0.005, san:0.015, str:0.00, flex:0.01, hack:0.00 },
    hungerRate: 1.0,
    decisionHungerMult: 1.0,
    activityBonus: { fishing:{ san:2, flex:1 }, any:{ bonus:1 } }
  }
};

var JOB_PROMO_THRESHOLDS = [8000, 40000];
