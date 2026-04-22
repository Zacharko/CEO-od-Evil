'use strict';

/* ════════════════════════════════════════════════════════════════════
   DATA: jobs.js — Profesie, kurzy (Uni + Gym), prahy povýšenia
   Závislosti: config.js (GameConfig)
════════════════════════════════════════════════════════════════════ */

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