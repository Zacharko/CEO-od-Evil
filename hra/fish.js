'use strict';

/* ════════════════════════════════════════════════════════════════════
   DATA: fish.js — Druhy rýb, flotila lodí
   Závislosti: config.js (GameConfig)
════════════════════════════════════════════════════════════════════ */

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