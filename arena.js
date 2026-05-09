/* ═══════════════════════════════════════════════════════════════════
   ARENA.JS  —  CEO Zla // Operácia LAZARUS  [PIXEL ART OVERHAUL v3]
   Podzemná aréna pod Prievidzou.

   Závisí na: S, gainXP, addLog, showNotif, Renderer (z hlavného HTML)

   §A1.  CSS — pixel art theme, CRT, scanlines, animácie
   §A2.  HTML overlay inject
   §A3.  Dáta — súperi, akcie, upgrady, loot
   §A4.  State — ArenaState
   §A5.  Sprite renderer — Canvas pixel art engine
   §A6.  Core fight engine
   §A7.  UI Renderer
   §A8.  Reward screen
   §A9.  Public API — ArenaSystem
═══════════════════════════════════════════════════════════════════ */

var ArenaSystem = (function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     §A1. CSS
  ══════════════════════════════════════════════════════ */
  var CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono:wght@400&display=swap');

/* ── Root vars ─────────────────────────────────────── */
#arena-overlay {
  --green:  #39ff14;
  --green2: #22c55e;
  --green3: #16a34a;
  --gold:   #facc15;
  --red:    #ef4444;
  --red2:   #dc2626;
  --blue:   #38bdf8;
  --purple: #a855f7;
  --bg:     #04080400;
  --bg2:    #060c06;
  --bg3:    #0a130a;
  --bg4:    #0f1a0f;
  --border: #1a3a1a;
  --border2:#112211;
  --text:   #7feba0;
  --text2:  #4aaa64;
  --text3:  #2a6a3a;
  --font-px:'Press Start 2P', monospace;
  --font-mo:'Share Tech Mono', monospace;
}

/* ── Overlay shell ──────────────────────────────────── */
#arena-overlay {
  display:none; position:fixed; inset:0; z-index:900;
  background:#040804;
  flex-direction:column; overflow:hidden;
  font-family:var(--font-mo);
  color:var(--text);
  image-rendering:pixelated;
}
#arena-overlay.show { display:flex; }

/* CRT scanlines */
#arena-overlay::before {
  content:''; position:absolute; inset:0; z-index:999; pointer-events:none;
  background:repeating-linear-gradient(
    0deg,
    transparent 0px, transparent 2px,
    rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px
  );
}
/* CRT vignette */
#arena-overlay::after {
  content:''; position:absolute; inset:0; z-index:998; pointer-events:none;
  background:radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.75) 100%);
}

/* ── Header ─────────────────────────────────────────── */
#arena-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:8px 16px;
  background:var(--bg2);
  border-bottom:2px solid var(--border);
  flex-shrink:0; position:relative; z-index:10;
}
#arena-logo {
  font-family:var(--font-px); font-size:8px; letter-spacing:3px;
  color:var(--gold);
  text-shadow:0 0 14px rgba(250,204,21,0.9), 0 0 40px rgba(250,204,21,0.3);
  animation:logoPulse 3s ease-in-out infinite;
}
@keyframes logoPulse {
  0%,100%{ text-shadow:0 0 10px rgba(250,204,21,0.6); }
  50%{ text-shadow:0 0 24px rgba(250,204,21,1), 0 0 60px rgba(250,204,21,0.4); }
}
#arena-hdr-right { display:flex; align-items:center; gap:14px; }
.hdr-stat {
  font-family:var(--font-px); font-size:6px; color:var(--text3); letter-spacing:2px;
}
.hdr-stat .hv { color:var(--gold); }
#arena-close-btn {
  background:transparent; border:1px solid var(--border);
  color:var(--text3); font-family:var(--font-px); font-size:6px;
  letter-spacing:2px; padding:5px 10px; cursor:pointer; transition:all 0.12s;
}
#arena-close-btn:hover { border-color:var(--red2); color:var(--red2); }

/* ── Main layout ────────────────────────────────────── */
#arena-body { display:flex; flex:1; overflow:hidden; }
#arena-left  { flex:1; min-width:0; display:flex; flex-direction:column; overflow-y:auto; }
#arena-right {
  width:260px; flex-shrink:0; border-left:2px solid var(--border);
  display:flex; flex-direction:column; background:var(--bg2);
}

/* ── Section label ──────────────────────────────────── */
.px-section {
  font-family:var(--font-px); font-size:6px; letter-spacing:3px;
  color:var(--text3); text-transform:uppercase;
  padding:0 0 5px; border-bottom:1px solid var(--border2); margin-bottom:8px;
}

/* ════════════════════════════════════════════════════
   ROSTER PANEL
════════════════════════════════════════════════════ */
#arena-roster-wrap {
  display:flex; flex-direction:column; gap:0;
  flex:1; overflow:hidden;
}
#arena-roster-inner {
  flex:1; overflow-y:auto; padding:14px 14px 0;
  display:flex; flex-direction:column; gap:6px;
}
#arena-roster-inner::-webkit-scrollbar { width:3px; }
#arena-roster-inner::-webkit-scrollbar-thumb { background:var(--border); }

.roster-card {
  background:var(--bg3); border:1px solid var(--border);
  padding:10px 12px; cursor:pointer; transition:all 0.12s;
  display:flex; align-items:center; gap:10px; position:relative;
}
.roster-card::before,.roster-card::after {
  content:''; position:absolute;
  width:6px; height:6px; border-style:solid; border-color:inherit;
}
.roster-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
.roster-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }
.roster-card:hover:not(.locked) { border-color:var(--gold); background:rgba(250,204,21,0.04); }
.roster-card.locked { opacity:0.35; cursor:not-allowed; }
.roster-portrait {
  width:48px; height:48px; object-fit:cover; flex-shrink:0;
  border:1px solid var(--border); image-rendering:pixelated;
  filter:saturate(0.7) contrast(1.2);
}
.roster-info { flex:1; min-width:0; }
.roster-name {
  font-family:var(--font-px); font-size:6px; letter-spacing:2px;
  color:var(--text); text-transform:uppercase; margin-bottom:4px;
}
.roster-sub { font-size:9px; color:var(--text3); letter-spacing:1px; margin-bottom:3px; }
.roster-lore { font-size:8px; color:var(--text3); font-style:italic; }
.roster-diff {
  font-family:var(--font-px); font-size:6px; letter-spacing:1px;
  flex-shrink:0; text-align:center;
}
.diff-easy   { color:var(--green2); }
.diff-medium { color:#fbbf24; }
.diff-hard   { color:var(--red); }
.diff-boss   { color:var(--purple); text-shadow:0 0 8px rgba(168,85,247,0.7); animation:logoPulse 2s infinite; }

/* Bet row */
#arena-bet-row {
  padding:10px 14px; border-top:1px solid var(--border2);
  display:flex; align-items:center; gap:6px; flex-shrink:0;
  background:var(--bg2);
}
.bet-label { font-family:var(--font-px); font-size:6px; color:var(--text3); letter-spacing:2px; flex-shrink:0; }
#arena-bet-val { font-family:var(--font-px); font-size:11px; color:var(--gold); min-width:60px; text-align:center; }
.bet-btn {
  background:transparent; border:1px solid var(--border);
  color:var(--text3); font-family:var(--font-px); font-size:6px;
  padding:4px 7px; cursor:pointer; transition:all 0.1s;
}
.bet-btn:hover { border-color:var(--gold); color:var(--gold); }

/* ════════════════════════════════════════════════════
   FIGHT PANEL — Stage
════════════════════════════════════════════════════ */
#arena-fight-wrap { display:none; flex-direction:column; flex:1; }
#arena-fight-wrap.show { display:flex; }

#arena-stage-area {
  padding:14px 14px 8px;
  background:var(--bg);
  background-image:
    radial-gradient(circle, rgba(22,163,74,0.025) 1px, transparent 1px),
    linear-gradient(180deg, transparent 80%, rgba(22,163,74,0.04) 100%);
  background-size:10px 10px, 100% 100%;
  position:relative; flex-shrink:0;
}

/* Fighter grid */
#arena-fighters-row {
  display:grid; grid-template-columns:1fr 56px 1fr; gap:0; align-items:start;
}

/* Fighter card */
.fx-card {
  background:var(--bg2); border:1px solid var(--border);
  padding:10px; display:flex; flex-direction:column; gap:5px;
  position:relative;
}
.fx-card::before,.fx-card::after {
  content:''; position:absolute; width:7px; height:7px;
  border-style:solid; border-color:inherit;
}
.fx-card::before { top:-1px; left:-1px; border-width:2px 0 0 2px; }
.fx-card::after  { bottom:-1px; right:-1px; border-width:0 2px 2px 0; }
.fx-card.player { border-color:var(--green3); }
.fx-card.enemy  { border-color:var(--red2); }

.fx-name {
  font-family:var(--font-px); font-size:6px; letter-spacing:2px;
  text-transform:uppercase; padding-bottom:5px; border-bottom:1px solid var(--border2);
}
.fx-card.player .fx-name { color:var(--green); }
.fx-card.enemy  .fx-name { color:var(--red); }

/* Sprite area */
.fx-sprite-wrap {
  display:flex; justify-content:center; align-items:flex-end;
  height:90px; position:relative; overflow:visible;
}
.fx-sprite-canvas {
  image-rendering:pixelated; image-rendering:crisp-edges;
  display:block;
}
@keyframes idleBob {
  0%,100%{ transform:translateY(0); }
  50%{ transform:translateY(-3px); }
}
@keyframes atkShake {
  0%,100%{ transform:translateX(0) scaleX(1); }
  20%{ transform:translateX(7px) scaleX(1.05); }
  60%{ transform:translateX(-3px) scaleX(0.97); }
}
@keyframes hurtShake {
  0%,100%{ transform:translateX(0); }
  25%{ transform:translateX(-6px); }
  75%{ transform:translateX(4px); }
}
@keyframes deathFall {
  0%{ transform:translateY(0) rotate(0deg); opacity:1; }
  100%{ transform:translateY(20px) rotate(-30deg); opacity:0; }
}
.fx-sprite-wrap.idle { animation:idleBob 1.8s ease-in-out infinite; }
.fx-sprite-wrap.idle.enemy-idle { animation-duration:2.2s; }
.fx-sprite-wrap.atk  { animation:atkShake 0.28s ease; }
.fx-sprite-wrap.hurt { animation:hurtShake 0.22s ease; }
.fx-sprite-wrap.dead { animation:deathFall 0.6s ease forwards; }

/* Pixel HP bars */
.px-bar-lbl {
  font-family:var(--font-px); font-size:5px; color:var(--text3);
  letter-spacing:2px; text-transform:uppercase; margin-bottom:2px;
}
.px-bar-out {
  height:8px; background:var(--bg); border:1px solid var(--border2);
  position:relative; overflow:hidden;
}
.px-bar-out::after {
  content:''; position:absolute; inset:0; pointer-events:none; z-index:2;
  background:repeating-linear-gradient(
    90deg, transparent 0,
    transparent calc(100%/20 - 1px),
    rgba(0,0,0,0.45) calc(100%/20 - 1px),
    rgba(0,0,0,0.45) calc(100%/20)
  );
}
.px-bar-fill {
  height:100%; transition:width 0.35s steps(20,end); position:relative;
}
.px-bar-fill.hp-high {
  background:linear-gradient(180deg,#4ade80 0%,#16a34a 55%,#14532d 100%);
}
.px-bar-fill.hp-mid {
  background:linear-gradient(180deg,#fbbf24 0%,#d97706 55%,#92400e 100%);
}
.px-bar-fill.hp-low {
  background:linear-gradient(180deg,#f87171 0%,#dc2626 55%,#7f1d1d 100%);
  animation:hpBlink 0.6s step-end infinite;
}
@keyframes hpBlink { 0%,100%{opacity:1;} 50%{opacity:0.55;} }
.px-bar-fill.stam  { background:linear-gradient(180deg,#38bdf8 0%,#0284c7 55%,#075985 100%); }
.px-bar-fill.armor { background:linear-gradient(180deg,#c084fc 0%,#7c3aed 55%,#4c1d95 100%); }
.px-bar-val {
  font-family:var(--font-px); font-size:5px; color:var(--text2);
  text-align:right; margin-top:1px;
}

/* Status chips */
.fx-status-row { display:flex; gap:3px; flex-wrap:wrap; min-height:12px; margin-top:2px; }
.px-chip {
  font-family:var(--font-px); font-size:5px; padding:2px 4px;
  border:1px solid; letter-spacing:1px;
  animation:chipBlink 1s step-end infinite;
}
@keyframes chipBlink { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
.px-chip.stun   { color:#fbbf24; border-color:#fbbf24; }
.px-chip.bleed  { color:#f87171; border-color:#f87171; }
.px-chip.dodge  { color:#38bdf8; border-color:#38bdf8; }
.px-chip.regen  { color:#4ade80; border-color:#4ade80; }
.px-chip.enrage { color:#ef4444; border-color:#ef4444; animation-duration:0.3s; }
.px-chip.blind  { color:#c084fc; border-color:#c084fc; }

/* VS badge */
#arena-vs {
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; gap:6px; padding:0 4px;
}
#arena-vs-text {
  font-family:var(--font-px); font-size:13px; color:var(--gold);
  text-shadow:0 0 20px rgba(250,204,21,1);
  animation:logoPulse 2s ease-in-out infinite;
}
#arena-vs-round {
  font-family:var(--font-px); font-size:5px; color:var(--text3);
  letter-spacing:2px; text-align:center; line-height:1.8;
}
#arena-vs-bolt { font-size:16px; color:var(--gold); }

/* Ground glow */
#arena-ground-glow {
  height:3px; margin:6px 8px 0;
  background:linear-gradient(90deg,transparent 5%,var(--green3) 30%,var(--green) 50%,var(--green3) 70%,transparent 95%);
  animation:gGlow 2.2s ease-in-out infinite;
}
@keyframes gGlow { 0%,100%{opacity:0.2;} 50%{opacity:0.65;} }

/* DMG floats */
@keyframes floatUp {
  0%  { opacity:1; transform:translateY(0) scale(1); }
  20% { opacity:1; transform:translateY(-10px) scale(1.35); }
  100%{ opacity:0; transform:translateY(-52px) scale(0.8); }
}
.dmg-float {
  position:absolute; font-family:var(--font-px); font-size:9px;
  pointer-events:none; z-index:50;
  left:50%; top:24px; transform:translateX(-50%);
  white-space:nowrap;
  text-shadow:2px 2px 0 #000, -1px -1px 0 #000;
  animation:floatUp 0.85s cubic-bezier(0.2,0.8,0.3,1) forwards;
}
.dmg-float.pdmg { color:#f87171; }
.dmg-float.edmg { color:#4ade80; }
.dmg-float.crit { color:#facc15; font-size:12px; }
.dmg-float.miss { color:var(--text3); font-size:6px; }
.dmg-float.heal { color:#4ade80; }

/* ── Fight stats bar ──────────────────────────────── */
#arena-fight-stats {
  display:flex; gap:0; background:var(--bg2);
  border-top:1px solid var(--border2); border-bottom:1px solid var(--border2);
  flex-shrink:0;
}
.fstat {
  flex:1; display:flex; flex-direction:column; align-items:center;
  padding:5px 4px; border-right:1px solid var(--border2);
}
.fstat:last-child { border-right:none; }
.fstat-val { font-family:var(--font-px); font-size:8px; color:var(--gold); }
.fstat-lbl { font-size:7px; color:var(--text3); letter-spacing:1px; margin-top:2px; }

/* ── Action buttons ─────────────────────────────── */
#arena-actions {
  display:grid; grid-template-columns:repeat(3,1fr); gap:5px;
  padding:10px 12px;
  background:var(--bg2); border-bottom:1px solid var(--border2);
  flex-shrink:0;
}
.px-action-btn {
  background:var(--bg); border:1px solid var(--border);
  color:var(--text); font-family:var(--font-px); font-size:5px;
  letter-spacing:1px; padding:8px 5px; cursor:pointer;
  transition:all 0.1s; text-align:center; position:relative;
  line-height:2; text-transform:uppercase;
}
/* Pixel corner cuts */
.px-action-btn::before,.px-action-btn::after {
  content:''; position:absolute; width:4px; height:4px; background:var(--bg);
}
.px-action-btn::before { top:0; left:0; }
.px-action-btn::after  { bottom:0; right:0; }
.px-action-btn:hover:not(:disabled) {
  border-color:var(--green3); color:var(--green);
  background:rgba(57,255,20,0.06);
  text-shadow:0 0 8px rgba(57,255,20,0.5);
}
.px-action-btn:active:not(:disabled) { transform:scale(0.96); }
.px-action-btn:disabled { opacity:0.28; cursor:not-allowed; }
.px-action-btn.on-cd { border-color:var(--border2); color:var(--text3); }
.abt-icon { display:block; font-size:10px; margin-bottom:3px; }
.abt-desc { display:block; font-size:4px; color:var(--text3); margin-top:2px; letter-spacing:0.5px; }
.abt-cd   { display:block; font-size:4px; color:var(--red); margin-top:2px; }

/* ── Ticker ─────────────────────────────────────── */
#arena-ticker {
  background:var(--bg2); border-top:1px solid var(--border2);
  padding:4px 10px; font-size:7px; color:var(--text3); letter-spacing:1px;
  overflow:hidden; white-space:nowrap; flex-shrink:0;
}
#arena-ticker-inner { display:inline-block; animation:tickerScroll 20s linear infinite; }
@keyframes tickerScroll { from{transform:translateX(100%);} to{transform:translateX(-100%);} }

/* ════════════════════════════════════════════════════
   RESULT OVERLAY (inside fight area)
════════════════════════════════════════════════════ */
#arena-result {
  display:none; position:absolute; inset:0; z-index:200;
  background:rgba(2,5,2,0.95);
  flex-direction:column; align-items:center; justify-content:center; gap:16px;
}
#arena-result.show { display:flex; }
#result-particles-canvas {
  position:absolute; inset:0; width:100%; height:100%; pointer-events:none;
}
#arena-result-title {
  font-family:var(--font-px); font-size:18px; letter-spacing:5px;
  text-transform:uppercase; position:relative; z-index:1;
}
#arena-result-title.win {
  color:var(--green);
  text-shadow:0 0 30px rgba(57,255,20,0.9);
  animation:winGlow 1s ease-in-out infinite;
}
#arena-result-title.lose {
  color:var(--red);
  text-shadow:0 0 20px rgba(239,68,68,0.8);
  animation:winGlow 1s ease-in-out infinite;
}
@keyframes winGlow {
  0%,100%{ opacity:1; }
  50%{ opacity:0.65; }
}
#arena-result-sub {
  font-size:9px; color:var(--text3); letter-spacing:2px;
  text-align:center; line-height:2.2; position:relative; z-index:1;
}
.res-btn {
  background:transparent; border:1px solid var(--green3); color:var(--green);
  font-family:var(--font-px); font-size:7px; letter-spacing:3px;
  padding:10px 22px; cursor:pointer; transition:all 0.15s;
  position:relative; z-index:1;
}
.res-btn:hover { background:rgba(57,255,20,0.08); letter-spacing:4px; }
.res-btn.gold { border-color:var(--gold); color:var(--gold); }

/* ════════════════════════════════════════════════════
   FIGHT LOG (right panel)
════════════════════════════════════════════════════ */
#arena-log-header {
  padding:8px 10px 6px; border-bottom:1px solid var(--border2); flex-shrink:0;
}
#arena-log-title { font-family:var(--font-px); font-size:6px; color:var(--text3); letter-spacing:3px; }
#arena-log-scroll {
  flex:1; overflow-y:auto; padding:6px 8px;
  display:flex; flex-direction:column; gap:2px;
}
#arena-log-scroll::-webkit-scrollbar { width:3px; }
#arena-log-scroll::-webkit-scrollbar-thumb { background:var(--border); }
.log-line {
  font-size:8px; letter-spacing:0.5px; line-height:1.5;
  border-left:2px solid transparent; padding-left:5px;
  animation:logIn 0.15s ease;
}
@keyframes logIn { from{opacity:0;transform:translateX(-4px);} to{opacity:1;transform:none;} }
.log-line.p { color:#4ade80; border-color:var(--green3); }
.log-line.e { color:#f87171; border-color:var(--red2); }
.log-line.s { color:var(--gold); border-color:rgba(250,204,21,0.4); }
.log-line.m { color:var(--text3); }
.log-line.c { color:#fbbf24; font-weight:700; border-color:#fbbf24; }

/* ════════════════════════════════════════════════════
   REWARD OVERLAY
════════════════════════════════════════════════════ */
#arena-reward-overlay {
  display:none; position:fixed; inset:0; z-index:950;
  background:#020502; flex-direction:column; overflow-y:auto;
  font-family:var(--font-mo); color:var(--text);
}
#arena-reward-overlay.show { display:flex; }
#arena-reward-overlay::before {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px);
}

#rw-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; background:var(--bg2);
  border-bottom:2px solid var(--border); flex-shrink:0; position:relative; z-index:1;
}
#rw-title { font-family:var(--font-px); font-size:9px; letter-spacing:4px; color:var(--gold);
  text-shadow:0 0 16px rgba(250,204,21,0.7); }
#rw-enemy-badge { font-size:8px; letter-spacing:2px; color:var(--text3); }

#rw-body { display:flex; flex:1; position:relative; z-index:1; }

#rw-left {
  flex:1; min-width:0; padding:18px 20px;
  display:flex; flex-direction:column; gap:16px; overflow-y:auto;
  border-right:1px solid var(--border2);
}
#rw-right {
  width:300px; flex-shrink:0; padding:18px 16px;
  display:flex; flex-direction:column; gap:12px; overflow-y:auto;
}

.rw-section { font-family:var(--font-px); font-size:7px; letter-spacing:3px;
  color:var(--text3); padding-bottom:5px;
  border-bottom:1px solid var(--border2); margin-bottom:4px; }

/* Summary box */
#rw-summary { background:var(--bg3); border:1px solid var(--border); padding:12px; }
.rw-sum-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:5px 0; border-bottom:1px solid var(--border2);
}
.rw-sum-row:last-child { border-bottom:none; }
.rw-sum-lbl { font-size:8px; letter-spacing:1px; color:var(--text3); }
.rw-sum-val { font-family:var(--font-px); font-size:10px; font-weight:700; color:var(--gold); }
.rw-sum-val.green { color:var(--green); }
.rw-sum-val.red   { color:var(--red); }

/* XP bar */
.rw-xp-labels { display:flex; justify-content:space-between;
  font-size:8px; color:var(--text3); margin-bottom:5px; }
.rw-xp-out {
  height:12px; background:var(--bg); border:1px solid var(--border2); position:relative; overflow:hidden;
}
.rw-xp-out::after {
  content:''; position:absolute; inset:0; z-index:2; pointer-events:none;
  background:repeating-linear-gradient(90deg,transparent 0,transparent calc(100%/30 - 1px),rgba(0,0,0,0.4) calc(100%/30 - 1px),rgba(0,0,0,0.4) calc(100%/30));
}
.rw-xp-old {
  height:100%; background:linear-gradient(180deg,#2563eb,#1e40af);
  position:absolute; top:0; left:0;
}
.rw-xp-gain {
  height:100%; background:linear-gradient(180deg,#4ade80,#16a34a);
  position:absolute; top:0; transition:width 1.4s steps(30,end);
}
@keyframes xpPulse { 0%,100%{box-shadow:0 0 4px rgba(74,222,128,0.3);} 50%{box-shadow:0 0 18px rgba(74,222,128,0.9);} }
.rw-xp-gain.anim { animation:xpPulse 1s ease; }

/* Level-up banner */
#rw-levelup { display:none; border:1px solid var(--gold); padding:12px; text-align:center; background:rgba(250,204,21,0.04); }
#rw-levelup.show { display:block; }
#rw-levelup-text { font-family:var(--font-px); font-size:14px; letter-spacing:5px; color:var(--gold);
  text-shadow:0 0 30px rgba(250,204,21,1); text-transform:uppercase;
  margin-bottom:4px; animation:winGlow 1.3s ease-in-out infinite; }
#rw-levelup-sub { font-size:8px; color:var(--text3); letter-spacing:2px; }

/* Loot items */
.rw-loot-item {
  display:flex; align-items:center; gap:8px; padding:7px 9px;
  background:var(--bg3); border:1px solid var(--border2); margin-bottom:5px;
}
.rw-loot-icon { font-size:16px; flex-shrink:0; width:24px; text-align:center; }
.rw-loot-info { flex:1; min-width:0; }
.rw-loot-name { font-size:9px; color:var(--text); margin-bottom:2px; }
.rw-loot-desc { font-size:8px; color:var(--text3); }
.rw-loot-rar  { font-family:var(--font-px); font-size:5px; flex-shrink:0; letter-spacing:1px; }
.rar-common   { color:var(--text3); }
.rar-uncommon { color:var(--green2); }
.rar-rare     { color:var(--blue); }
.rar-epic     { color:var(--purple); text-shadow:0 0 8px rgba(168,85,247,0.6); }

/* Current stats panel */
#rw-stats { background:var(--bg3); border:1px solid var(--border2); padding:10px 12px; display:flex; flex-direction:column; gap:5px; }
.stat-mini-row { display:flex; align-items:center; gap:8px; }
.stat-mini-lbl { font-family:var(--font-px); font-size:5px; color:var(--text3); width:50px; flex-shrink:0; letter-spacing:1px; }
.stat-mini-bar-out { flex:1; height:5px; background:var(--bg); border:1px solid var(--border2); overflow:hidden; }
.stat-mini-bar { height:100%; transition:width 0.6s ease; }
.stat-mini-bar.str  { background:linear-gradient(90deg,#7f1d1d,#ef4444); }
.stat-mini-bar.flex { background:linear-gradient(90deg,#1a3a5f,#38bdf8); }
.stat-mini-bar.hack { background:linear-gradient(90deg,#3b0764,#a855f7); }
.stat-mini-bar.hp   { background:linear-gradient(90deg,#14532d,#4ade80); }
.stat-mini-val { font-family:var(--font-px); font-size:6px; color:var(--text); min-width:26px; text-align:right; transition:color 0.4s; }
.stat-mini-val.upgraded { color:var(--gold); }
.stat-mini-delta { font-family:var(--font-px); font-size:5px; color:var(--green); min-width:18px; }

/* Upgrade cards */
#rw-upgrades { display:flex; flex-direction:column; gap:6px; }
.rw-upg-card {
  background:var(--bg3); border:1px solid var(--border);
  padding:10px 12px; cursor:pointer; transition:all 0.15s; position:relative;
}
.rw-upg-card::before {
  content:''; position:absolute; left:0; top:0; bottom:0;
  width:3px; background:var(--green3); transition:background 0.15s;
}
.rw-upg-card:hover:not(.used) { border-color:var(--green3); background:rgba(22,163,74,0.06); }
.rw-upg-card.selected { border-color:var(--gold); background:rgba(250,204,21,0.05); }
.rw-upg-card.selected::before { background:var(--gold); }
.rw-upg-card.used { opacity:0.35; cursor:not-allowed; }
.rw-upg-head { display:flex; align-items:center; gap:7px; margin-bottom:5px; }
.rw-upg-icon { font-size:14px; }
.rw-upg-name { font-family:var(--font-px); font-size:6px; letter-spacing:2px; color:var(--text); flex:1; }
.rw-upg-desc { font-size:8px; color:var(--text3); line-height:1.5; }
.rw-upg-effect { font-family:var(--font-px); font-size:6px; color:var(--green); margin-top:4px; letter-spacing:1px; }

#rw-confirm-btn {
  display:none; background:transparent; border:1px solid var(--green3);
  color:var(--green); font-family:var(--font-px); font-size:7px;
  letter-spacing:3px; padding:11px; width:100%; cursor:pointer;
  transition:all 0.15s; text-transform:uppercase; margin-top:4px;
}
#rw-confirm-btn.show { display:block; }
#rw-confirm-btn:hover:not(:disabled) { background:rgba(57,255,20,0.08); }
#rw-confirm-btn:disabled { opacity:0.4; cursor:not-allowed; }

#rw-footer {
  display:flex; gap:8px; padding-top:10px;
  border-top:1px solid var(--border2); margin-top:auto; flex-shrink:0;
}
.rw-foot-btn {
  flex:1; background:transparent; border:1px solid var(--border);
  color:var(--text3); font-family:var(--font-px); font-size:6px;
  letter-spacing:2px; padding:9px; cursor:pointer; transition:all 0.15s;
}
.rw-foot-btn:hover { border-color:var(--green3); color:var(--green); }
.rw-foot-btn.gold { border-color:var(--gold); color:var(--gold); }

/* ── Mobile ─────────────────────────────────────── */
@media(max-width:640px){
  #arena-body { flex-direction:column; }
  #arena-right { width:100%; height:180px; border-left:none; border-top:2px solid var(--border); }
  #arena-fighters-row { gap:6px; }
  #arena-actions { grid-template-columns:repeat(2,1fr); }
  #rw-body { flex-direction:column; }
  #rw-right { width:100%; }
}
`;

  /* ══════════════════════════════════════════════════════
     §A3. DATA — súperi, akcie, upgrady, loot
  ══════════════════════════════════════════════════════ */

  var PLAYER_ACTIONS = [
    {
      id:'strike', name:'⚡ Úder', icon:'⚡',
      desc:'STR+0.4 · vždy zasahuje', cost:0, cooldown:0,
      fn:function(ps,es){
        var base=8+Math.floor(ps.str*0.4);
        var crit=Math.random()>0.82;
        var dmg=Math.max(1,(crit?Math.floor(base*1.7):base)-Math.floor(es.armor*0.3));
        return {dmg:dmg,crit:crit,miss:false,effect:null,stam:-5,msg:crit?'KRITICKÝ ÚDER':'Úder'};
      }
    },
    {
      id:'heavy', name:'🔨 Ťažký', icon:'🔨',
      desc:'18+STR·miss18%·30%stun', cost:12, cooldown:0,
      fn:function(ps,es){
        if(Math.random()<0.18) return {dmg:0,crit:false,miss:true,effect:null,stam:-12,msg:'Minul'};
        var dmg=Math.max(2,(18+Math.floor(ps.str*0.7))-Math.floor(es.armor*0.5));
        var stun=Math.random()<0.30;
        return {dmg:dmg,crit:false,miss:false,effect:stun?'stun':null,stam:-12,msg:stun?'OMRÁČENIE!':'Ťažký úder'};
      }
    },
    {
      id:'dodge', name:'💨 Úskok', icon:'💨',
      desc:'+18STAM · dodge 2 kolá', cost:0, cooldown:2,
      fn:function(ps,es){
        return {dmg:0,crit:false,miss:false,effect:'dodge',stam:+18,msg:'Úskok — pripravuješ sa'};
      }
    },
    {
      id:'bleed', name:'🗡 Krvácanie', icon:'🗡',
      desc:'bleed×3 · FLEX+0.3', cost:8, cooldown:3,
      fn:function(ps,es){
        if(Math.random()<0.12) return {dmg:0,crit:false,miss:true,effect:null,stam:-8,msg:'Minul'};
        var dmg=5+Math.floor(ps.flex*0.3);
        return {dmg:dmg,crit:false,miss:false,effect:'bleed',stam:-8,msg:'Zranil — začína krvácať'};
      }
    },
    {
      id:'hack_blind', name:'💻 Hack', icon:'💻',
      desc:'blind×2 · HACK≥20', cost:15, cooldown:4,
      fn:function(ps,es){
        if((ps.hackStat||0)<20) return {dmg:0,crit:false,miss:true,effect:null,stam:-15,msg:'HACK príliš nízky'};
        var ok=Math.random()<(0.3+(ps.hackStat-20)*0.01);
        if(!ok) return {dmg:0,crit:false,miss:true,effect:null,stam:-15,msg:'Hack zlyhal'};
        return {dmg:0,crit:false,miss:false,effect:'blind',stam:-15,msg:'Augment hacknutý!'};
      }
    },
    {
      id:'medpatch', name:'💉 Med-patch', icon:'💉',
      desc:'+HP · 1× za zápas', cost:0, cooldown:99,
      fn:function(ps,es){
        var heal=25+Math.floor(ps.level*3);
        return {dmg:0,crit:false,miss:false,effect:'heal',healAmt:heal,stam:-5,msg:'Med-patch: HP +'+heal};
      }
    },
  ];

  var ENEMIES = [
    {
      id:'ferko_stokar', name:'Ferko', faction:'Stokári',
      title:'Strážca skladu',
      portrait:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      difficulty:'easy', level:1, hp:55, maxHp:55, armor:8,
      str:14, flex:8, speed:7,
      reward:{xp:30,money:80}, betMultiplier:1.5, unlockFlag:null,
      lore:'Dvadsaťpäť rokov. LED na augmente bliká červene.',
      tactics:['strike','heavy'],
      ai:function(es,ps){ return es.hp<es.maxHp*0.3?'heavy':(Math.random()<0.6?'strike':'heavy'); }
    },
    {
      id:'securitar_mec', name:'Securitár M.E.C.', faction:'M.E.C.',
      title:'Korporátna bezpečnosť',
      portrait:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      difficulty:'medium', level:3, hp:80, maxHp:80, armor:18,
      str:20, flex:14, speed:11,
      reward:{xp:70,money:180}, betMultiplier:2.0, unlockFlag:'mec_scan_1',
      lore:'Plná výstroj, brnenie GEN-4. Dostáva plat trikrát ako ty.',
      tactics:['strike','heavy','armor_up'],
      ai:function(es,ps){ if(es.hp<es.maxHp*0.5&&!es._usedArmor){es._usedArmor=true;return 'armor_up';} return Math.random()<0.5?'heavy':'strike'; }
    },
    {
      id:'oravec_lab', name:'Dr. Oravec', faction:'FRI / LAZARUS',
      title:'Výskumný vedúci B7',
      portrait:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      difficulty:'hard', level:6, hp:65, maxHp:65, armor:5,
      str:12, flex:28, speed:20,
      reward:{xp:150,money:400}, betMultiplier:3.0, unlockFlag:'oravec_stopa',
      lore:'Nepovie ti nič. Nie preto, že odmietne — ale preto, že ťa zmlátí skôr.',
      tactics:['bleed','dodge','hack_stun'],
      ai:function(es,ps){ if(es.hp<es.maxHp*0.4)return 'bleed'; if(Math.random()<0.35)return 'dodge'; return 'hack_stun'; }
    },
    {
      id:'bane_enforcer', name:'Bane Corp. Enforcer', faction:'Bane Corp.',
      title:'Korporátny likvidátor',
      portrait:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      difficulty:'hard', level:8, hp:110, maxHp:110, armor:22,
      str:32, flex:18, speed:14,
      reward:{xp:220,money:600}, betMultiplier:3.5, unlockFlag:'banecorp_siete',
      lore:'Plná augmentácia. Pracovná zmluva na desať rokov.',
      tactics:['heavy','enrage','strike'],
      ai:function(es,ps){
        if(!es._enraged&&es.hp<es.maxHp*0.45){es._enraged=true;return 'enrage';}
        return es._enraged?(Math.random()<0.7?'heavy':'strike'):(Math.random()<0.4?'heavy':'strike');
      }
    },
    {
      id:'daedalus_test', name:'DAEDALUS v4.1', faction:'// SIMULÁCIA',
      title:'Taktický protokol',
      portrait:'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
      difficulty:'boss', level:12, hp:90, maxHp:90, armor:0,
      str:25, flex:40, speed:30,
      reward:{xp:400,money:1000}, betMultiplier:5.0, unlockFlag:'daedalus_trust_known',
      lore:'"Toto je test. Analyzujem tvoje reakcie." — Klamár.',
      tactics:['bleed','hack_stun','dodge','predict'],
      ai:function(es,ps){
        var last=ArenaState.lastPlayerAction;
        if(last==='dodge')return 'hack_stun';
        if(last==='heavy')return 'dodge';
        if(last==='bleed')return 'strike';
        return ['bleed','hack_stun','dodge'][Math.floor(Math.random()*3)];
      }
    },
  ];

  var ENEMY_ACTIONS = {
    strike:function(es,ps){ var d=Math.max(1,(6+Math.floor(es.str*0.35))-Math.floor(ps.armorCur*0.3)); return {dmg:d,effect:null,msg:'Úder'}; },
    heavy:function(es,ps){ if(Math.random()<0.15)return {dmg:0,effect:null,msg:'Minul'}; var d=Math.max(2,(14+Math.floor(es.str*0.6))-Math.floor(ps.armorCur*0.5)); return {dmg:d,effect:null,msg:'Ťažký úder'}; },
    bleed:function(es,ps){ var d=4+Math.floor(es.flex*0.2); return {dmg:d,effect:'bleed',msg:'Bodnutie — krvácanie'}; },
    dodge:function(es,ps){ return {dmg:0,effect:'e_dodge',msg:'Vyhol sa'}; },
    hack_stun:function(es,ps){ if(!Math.random()<0.45)return {dmg:2,effect:null,msg:'Hack zlyhal'}; return {dmg:0,effect:'p_stun',msg:'Hack — omráčenie!'}; },
    armor_up:function(es,ps){ return {dmg:0,effect:'e_armor',msg:'Aktivuje štít'}; },
    enrage:function(es,ps){ return {dmg:0,effect:'e_enrage',msg:'ENRAGE — STR ×1.7!'}; },
    predict:function(es,ps){ var d=10+Math.floor(es.flex*0.4); return {dmg:d,effect:null,msg:'Predikovaný pohyb'}; },
  };

  /* Upgrades */
  var UPGRADES = [
    { id:'str3', name:'Svalová augmentácia', icon:'💪', desc:'Subkutánne vlákna GEN-2. Sila úderov rastie.', effect:'+3 STR', minDiff:'easy',
      apply:function(gs){gs.str=(gs.str||10)+3;}, preview:{key:'str',delta:3} },
    { id:'flex3', name:'Reflex chip', icon:'⚡', desc:'Neurálny čip akceleruje motoriku.', effect:'+3 FLEX', minDiff:'easy',
      apply:function(gs){gs.flex=(gs.flex||10)+3;}, preview:{key:'flex',delta:3} },
    { id:'hp20', name:'Regeneračné nano-boty', icon:'🩸', desc:'Nano-boty opravujú tkanivo. +20 MAX HP.', effect:'+20 MAX HP', minDiff:'easy',
      apply:function(gs){gs.maxHp=(gs.maxHp||100)+20;}, preview:{key:'maxHp',delta:20} },
    { id:'allminor', name:'Systémová kalibrácia', icon:'⚙️', desc:'Vyladenie všetkých augmentácií. +1 všetkého.', effect:'+1 STR FLEX HACK  +5 HP', minDiff:'easy',
      apply:function(gs){gs.str=(gs.str||10)+1;gs.flex=(gs.flex||10)+1;gs.hackStat=(gs.hackStat||10)+1;gs.maxHp=(gs.maxHp||100)+5;}, preview:{key:'str',delta:1} },
    { id:'hack5', name:'Neural-hack rozhranie', icon:'💻', desc:'Upgradovaný hack protokol. HACK efektivita.', effect:'+5 HACK', minDiff:'medium',
      apply:function(gs){gs.hackStat=(gs.hackStat||10)+5;}, preview:{key:'hackStat',delta:5} },
    { id:'str6', name:'Titanové implantáty', icon:'🔩', desc:'Kĺbové zosilnenie z tungsténovej zliatiny.', effect:'+6 STR', minDiff:'hard',
      apply:function(gs){gs.str=(gs.str||10)+6;}, preview:{key:'str',delta:6} },
    { id:'flex6', name:'Prediktívny pohyb', icon:'🌀', desc:'DAEDALUS-odvozený algoritmus. Predvída pohyby.', effect:'+6 FLEX', minDiff:'hard',
      apply:function(gs){gs.flex=(gs.flex||10)+6;}, preview:{key:'flex',delta:6} },
    { id:'hp40', name:'Biocell Matrix', icon:'❤️', desc:'Organická bunková matrix. Masívny HP boost.', effect:'+40 MAX HP', minDiff:'boss',
      apply:function(gs){gs.maxHp=(gs.maxHp||100)+40;}, preview:{key:'maxHp',delta:40} },
  ];

  var LOOT_POOL = [
    { icon:'💉', name:'Med-kit GEN-1', desc:'Núdzová sada. HP +20 okamžite.', rarity:'common',
      apply:function(gs){gs.hp=Math.min(gs.maxHp||100,(gs.hp||50)+20);} },
    { icon:'💳', name:'Kredičný čip', desc:'Prepálený čip. +50 ₿ bonus.', rarity:'common',
      apply:function(gs){gs.money=(gs.money||0)+50;} },
    { icon:'📁', name:'Dátový fragment', desc:'Šifrovaný log. Možno niečo odhalí.', rarity:'uncommon',
      apply:function(gs){gs.flags=gs.flags||{};gs.flags.arena_data_found=true;} },
    { icon:'💊', name:'Combat Stim', desc:'Adrenalínový booster. Budúci boj +15% dmg.', rarity:'uncommon',
      apply:function(gs){gs.flags=gs.flags||{};gs.flags.arena_stim_ready=true;} },
    { icon:'🔧', name:'Aug komponent', desc:'Náhradný diel. Možno niekde použiteľný.', rarity:'rare',
      apply:function(gs){gs.flags=gs.flags||{};gs.flags['aug_part_'+Date.now()]=true;} },
    { icon:'🗝️', name:'Čierny kľúč', desc:'Prístupový kľúč neznámeho pôvodu. LAZARUS?', rarity:'epic',
      apply:function(gs){gs.flags=gs.flags||{};gs.flags.black_key_found=true;} },
  ];

  /* ══════════════════════════════════════════════════════
     §A4. STATE
  ══════════════════════════════════════════════════════ */
  var ArenaState = {
    phase:'roster',
    enemy:null, bet:0, round:0,
    playerFight:null, enemyFight:null,
    cooldowns:{}, lastPlayerAction:null,
    won:null, log:[], wins:0, losses:0,
    totalDmg:0,
    rewardUpgrades:[], rewardLoot:[],
    rewardSelected:null, rewardApplied:false,
  };

  /* ══════════════════════════════════════════════════════
     §A5. SPRITE RENDERER — Canvas pixel art engine
  ══════════════════════════════════════════════════════ */
  var _spriteTimer = null;
  var _spriteFrame = 0;
  var _spriteTick  = 0;

  /* Palettes */
  var PAL_PLAYER = {
    sk:'#d4956a', sk2:'#c07850', hair:'#1a0800', jk:'#1a2a4a', jk2:'#0f1a30',
    shirt:'#0f2035', aug:'#39ff14', aug2:'#22c55e', pants:'#0a150a', boot:'#080808',
    belt:'#3a2a10',
  };
  var PAL_ENEMIES = {
    ferko:   { sk:'#d08868', hair:'#221208', jk:'#2a1a10', pants:'#100800', aug:'#ef4444', boot:'#080808' },
    mec:     { sk:'#b87850', hair:'#080808', jk:'#1a2030', pants:'#101520', aug:'#38bdf8', boot:'#101010' },
    oravec:  { sk:'#c8a880', hair:'#303030', jk:'#202030', pants:'#181828', aug:'#a855f7', boot:'#0a0a12' },
    bane:    { sk:'#989898', hair:'#080808', jk:'#101820', pants:'#0a1018', aug:'#ef4444', boot:'#080808' },
    daedalus:{ sk:'#404848', hair:'#202828', jk:'#101818', pants:'#0c1414', aug:'#38bdf8', boot:'#080c0c' },
  };

  function _px(ctx, x, y, col, sc) {
    ctx.fillStyle = col;
    ctx.fillRect(x*sc, y*sc, sc, sc);
  }

  function _drawFighter(ctx, pal, frame, flip, W, H) {
    ctx.clearRect(0, 0, W, H);
    var sc = 3;
    var bob = (frame % 2 === 0) ? 0 : 1;
    /* offX so mirrored enemies look right */
    var ox = flip ? 1 : 0;

    if (flip) {
      ctx.save();
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
    }

    /* Head */
    _px(ctx,7,0+bob,pal.hair,sc); _px(ctx,8,0+bob,pal.hair,sc);
    _px(ctx,6,1+bob,pal.hair,sc); _px(ctx,7,1+bob,pal.sk,sc); _px(ctx,8,1+bob,pal.sk,sc); _px(ctx,9,1+bob,pal.hair,sc);
    _px(ctx,5,2+bob,pal.sk,sc); _px(ctx,6,2+bob,pal.sk,sc); _px(ctx,7,2+bob,pal.sk,sc); _px(ctx,8,2+bob,pal.sk,sc); _px(ctx,9,2+bob,pal.sk,sc); _px(ctx,10,2+bob,pal.sk,sc);
    _px(ctx,5,3+bob,pal.sk,sc); _px(ctx,6,3+bob,pal.aug,sc); _px(ctx,7,3+bob,pal.sk,sc); _px(ctx,8,3+bob,pal.sk,sc); _px(ctx,9,3+bob,pal.aug,sc); _px(ctx,10,3+bob,pal.sk,sc);
    _px(ctx,6,4+bob,pal.sk,sc); _px(ctx,7,4+bob,pal.sk,sc); _px(ctx,8,4+bob,pal.sk,sc); _px(ctx,9,4+bob,pal.sk,sc);
    _px(ctx,7,5+bob,pal.sk,sc); _px(ctx,8,5+bob,pal.sk,sc);

    /* Torso */
    _px(ctx,5,6+bob,pal.jk,sc); _px(ctx,6,6+bob,pal.jk,sc); _px(ctx,7,6+bob,pal.aug,sc); _px(ctx,8,6+bob,pal.aug,sc); _px(ctx,9,6+bob,pal.jk,sc); _px(ctx,10,6+bob,pal.jk,sc);
    _px(ctx,4,7+bob,pal.jk,sc); _px(ctx,5,7+bob,pal.jk,sc); _px(ctx,6,7+bob,pal.jk,sc); _px(ctx,7,7+bob,pal.shirt,sc); _px(ctx,8,7+bob,pal.shirt,sc); _px(ctx,9,7+bob,pal.jk,sc); _px(ctx,10,7+bob,pal.jk,sc); _px(ctx,11,7+bob,pal.jk,sc);
    _px(ctx,4,8+bob,pal.jk,sc); _px(ctx,5,8+bob,pal.jk,sc); _px(ctx,6,8+bob,pal.jk,sc); _px(ctx,7,8+bob,pal.shirt,sc); _px(ctx,8,8+bob,pal.shirt,sc); _px(ctx,9,8+bob,pal.jk,sc); _px(ctx,10,8+bob,pal.jk,sc); _px(ctx,11,8+bob,pal.jk,sc);
    if(pal.belt){ _px(ctx,5,9+bob,pal.belt,sc); _px(ctx,6,9+bob,pal.belt,sc); _px(ctx,7,9+bob,pal.belt,sc); _px(ctx,8,9+bob,pal.belt,sc); _px(ctx,9,9+bob,pal.belt,sc); _px(ctx,10,9+bob,pal.belt,sc); }

    /* Arms */
    _px(ctx,3,6+bob,pal.jk,sc); _px(ctx,3,7+bob,pal.sk,sc); _px(ctx,3,8+bob,pal.sk,sc); _px(ctx,2,8+bob,pal.aug,sc);
    _px(ctx,12,6+bob,pal.jk,sc); _px(ctx,12,7+bob,pal.sk,sc); _px(ctx,12,8+bob,pal.sk,sc); _px(ctx,13,8+bob,pal.aug,sc);

    /* Legs — walk cycle on odd frames */
    if (frame % 2 === 0) {
      _px(ctx,5,10,pal.pants,sc); _px(ctx,6,10,pal.pants,sc); _px(ctx,7,10,pal.pants,sc); _px(ctx,8,10,pal.pants,sc); _px(ctx,9,10,pal.pants,sc); _px(ctx,10,10,pal.pants,sc);
      _px(ctx,5,11,pal.pants,sc); _px(ctx,6,11,pal.pants,sc); _px(ctx,8,11,pal.pants,sc); _px(ctx,9,11,pal.pants,sc);
      _px(ctx,4,12,pal.boot,sc); _px(ctx,5,12,pal.boot,sc); _px(ctx,6,12,pal.boot,sc); _px(ctx,8,12,pal.boot,sc); _px(ctx,9,12,pal.boot,sc); _px(ctx,10,12,pal.boot,sc);
    } else {
      _px(ctx,4,10,pal.pants,sc); _px(ctx,5,10,pal.pants,sc); _px(ctx,6,10,pal.pants,sc); _px(ctx,8,11,pal.pants,sc); _px(ctx,9,11,pal.pants,sc); _px(ctx,10,11,pal.pants,sc); _px(ctx,11,11,pal.pants,sc);
      _px(ctx,3,12,pal.boot,sc); _px(ctx,4,12,pal.boot,sc); _px(ctx,5,12,pal.boot,sc); _px(ctx,9,12,pal.boot,sc); _px(ctx,10,12,pal.boot,sc); _px(ctx,11,12,pal.boot,sc);
    }

    if (flip) ctx.restore();
  }

  function _getPalForEnemy(id) {
    var key = id.split('_')[0];
    return PAL_ENEMIES[key] || PAL_ENEMIES.ferko;
  }

  function _startSpriteLoop() {
    if (_spriteTimer) return;
    _spriteTimer = setInterval(function() {
      _spriteTick++;
      if (_spriteTick % 18 === 0) { _spriteFrame = (_spriteFrame + 1) % 4; }
      _renderSprites();
    }, 80);
  }

  function _stopSpriteLoop() {
    if (_spriteTimer) { clearInterval(_spriteTimer); _spriteTimer = null; }
  }

  function _renderSprites() {
    var pc = document.getElementById('arena-player-canvas');
    var ec = document.getElementById('arena-enemy-canvas');
    if (pc) _drawFighter(pc.getContext('2d'), PAL_PLAYER, _spriteFrame, false, pc.width, pc.height);
    if (ec && ArenaState.enemy) {
      var pal = _getPalForEnemy(ArenaState.enemy.id);
      _drawFighter(ec.getContext('2d'), pal, _spriteFrame, true, ec.width, ec.height);
    }
  }

  /* ══════════════════════════════════════════════════════
     §A6. CORE FIGHT ENGINE
  ══════════════════════════════════════════════════════ */
  function _buildPlayerFight() {
    var gs = window.S || {};
    return {
      hp:      gs.hp || 50,
      maxHp:   Math.max(gs.hp || 50, gs.maxHp || 100),
      stam:    100, maxStam:100,
      armorCur:0,
      str:     gs.str || 10,
      flex:    gs.flex || 10,
      hackStat:gs.hackStat || 10,
      level:   gs.level || 1,
      statuses:{},
    };
  }

  function _buildEnemyFight(t) {
    return {
      id:t.id, hp:t.hp, maxHp:t.maxHp, armor:t.armor,
      str:t.str, flex:t.flex, speed:t.speed,
      statuses:{}, ai:t.ai, _enraged:false, _usedArmor:false,
    };
  }

  function _tickStatuses(fighter, isPlayer) {
    var msgs = [];
    var st = fighter.statuses;
    if (st.bleed > 0) {
      var bd = 5; fighter.hp = Math.max(0, fighter.hp - bd); st.bleed--;
      msgs.push({ msg:(isPlayer?'Krvácanie: −':'Súper krváca: −')+bd+' HP', cls:isPlayer?'e':'p' });
    }
    if (st.stun  > 0) st.stun--;
    if (st.dodge > 0) st.dodge--;
    if (st.e_dodge>0) st.e_dodge--;
    if (st.regen > 0) {
      var ra = 8; fighter.hp = Math.min(fighter.maxHp, fighter.hp + ra); st.regen--;
      msgs.push({ msg:'Regen: +'+ra+' HP', cls:'p' });
    }
    return msgs;
  }

  function _applyEffect(effect, target, source, amt) {
    var t = target.statuses;
    switch (effect) {
      case 'stun':    t.stun   = (t.stun   || 0) + 1; break;
      case 'bleed':   t.bleed  = (t.bleed  || 0) + 3; break;
      case 'dodge':   t.dodge  = 2; break;
      case 'blind':   t.blind  = (t.blind  || 0) + 2; break;
      case 'heal':    target.hp = Math.min(target.maxHp, target.hp + (amt || 25)); break;
      case 'regen':   t.regen  = (t.regen  || 0) + 3; break;
      case 'e_dodge': t.e_dodge = 1; break;
      case 'e_armor': target.armor = Math.min(60, target.armor + 15); break;
      case 'e_enrage':target.str = Math.floor(target.str * 1.7); break;
      case 'p_stun':  source.statuses.stun = (source.statuses.stun || 0) + 1; break;
    }
  }

  function _doPlayerTurn(actionId) {
    if (ArenaState.phase !== 'fight') return;
    var ps  = ArenaState.playerFight;
    var es  = ArenaState.enemyFight;
    var act = PLAYER_ACTIONS.find(function(a){ return a.id === actionId; });
    if (!act) return;
    var cd = ArenaState.cooldowns[actionId] || 0;
    if (cd > 0) return;
    if (ps.statuses.stun > 0) {
      _log('// Omráčený — kolo preskočené //', 'm');
      _doEnemyTurn(); return;
    }
    if (ps.stam < Math.abs(act.cost || 0)) { _log('// Nedostatok staminy //', 'm'); return; }

    ArenaState.lastPlayerAction = actionId;
    ArenaState.round++;

    var ticks = _tickStatuses(ps, true).concat(_tickStatuses(es, false));
    ticks.forEach(function(l){ _log(l.msg, l.cls); });

    var result = act.fn(ps, es);
    ps.stam = Math.max(0, Math.min(ps.maxStam, ps.stam + (result.stam || 0)));

    if (!result.miss) {
      if (result.dmg > 0) {
        if (es.statuses.e_dodge > 0) { _log('Súper sa vyhol!', 'm'); }
        else {
          es.hp = Math.max(0, es.hp - result.dmg);
          ArenaState.totalDmg += result.dmg;
          _log((result.crit ? '⚡ KRIT! ' : '') + result.msg + ': −' + result.dmg + ' HP', result.crit ? 'c' : 'p');
          _floatDmg(result.dmg, 'enemy', result.crit ? 'crit' : 'edmg');
          _triggerAnimation('player', 'atk');
          _triggerAnimation('enemy',  'hurt');
        }
      }
      if (result.effect) {
        _applyEffect(result.effect, es, ps, result.healAmt);
        if (result.effect === 'heal') { _log(result.msg, 'p'); _floatDmg('+'+result.healAmt, 'player', 'heal'); }
        else if (result.effect === 'dodge') { _log(result.msg, 's'); }
        else { _log(result.msg, 'p'); }
      }
    } else {
      _log('// ' + result.msg + ' //', 'm');
      _floatDmg('MISS', 'enemy', 'miss');
      _triggerAnimation('player', 'atk');
    }

    if (act.cooldown > 0) ArenaState.cooldowns[actionId] = act.cooldown + 1;
    Object.keys(ArenaState.cooldowns).forEach(function(k){ if (ArenaState.cooldowns[k] > 0) ArenaState.cooldowns[k]--; });

    if (es.hp <= 0) { _endFight(true); return; }
    _doEnemyTurn();
    _refreshFightUI();
    if (ps.hp <= 0) _endFight(false);
  }

  function _doEnemyTurn() {
    var ps = ArenaState.playerFight;
    var es = ArenaState.enemyFight;
    if (es.statuses.stun > 0) { _log('// Súper omráčený //', 's'); return; }
    var aiId  = es.ai(es, ps);
    var eact  = ENEMY_ACTIONS[aiId] || ENEMY_ACTIONS.strike;
    var res   = eact(es, ps);
    if (res.dmg > 0) {
      if (ps.statuses.dodge > 0) { _log('Vyhol si sa!', 'p'); ps.statuses.dodge--; return; }
      if (ps.statuses.blind && Math.random() < 0.35) { _log('// Súper minul (blind) //', 'm'); return; }
      ps.hp = Math.max(0, ps.hp - res.dmg);
      _log('Súper: ' + res.msg + ' — −' + res.dmg + ' HP', 'e');
      _floatDmg(res.dmg, 'player', 'pdmg');
      _triggerAnimation('enemy',  'atk');
      _triggerAnimation('player', 'hurt');
    }
    if (res.effect) { _applyEffect(res.effect, es, ps, 0); _log('Súper: ' + res.msg, 's'); }
    if (!res.dmg && !res.effect) _log('Súper: ' + res.msg, 'm');
    if (ps.statuses.blind > 0) ps.statuses.blind--;
  }

  function _endFight(won) {
    ArenaState.phase = 'result';
    ArenaState.won   = won;
    var enemy = ArenaState.enemy;
    var gs    = window.S;

    if (won) {
      ArenaState.wins++;
      var xpGain    = enemy.reward.xp;
      var moneyGain = enemy.reward.money + Math.floor(ArenaState.bet * enemy.betMultiplier);
      if (gs) { gs.money = (gs.money || 0) + moneyGain; }
      if (typeof Renderer !== 'undefined' && Renderer.updateMoney) Renderer.updateMoney();
      if (typeof addLog   === 'function') addLog('Aréna: Výhra vs ' + enemy.name + '. +' + xpGain + 'XP, +₿' + moneyGain, 'ok');
      if (typeof showNotif === 'function') showNotif('⚔ Výhra! +₿' + moneyGain + ' · +' + xpGain + ' XP');
      if (gs) { gs.flags = gs.flags || {}; gs.flags['arena_win_' + enemy.id] = true; }

      ArenaState.rewardUpgrades = _pickUpgrades(enemy.difficulty);
      ArenaState.rewardLoot     = _rollLoot(enemy.difficulty);
      ArenaState.rewardSelected = null;
      ArenaState.rewardApplied  = false;
      ArenaState.rewardLoot.forEach(function(item){ if (gs && item.apply) item.apply(gs); });

      _showResultOverlay(true, '+' + xpGain + ' XP   +₿' + moneyGain);
      setTimeout(function(){ _openRewardScreen(xpGain, moneyGain, enemy); }, 1400);
    } else {
      ArenaState.losses++;
      var pen = 15, loss = Math.floor(ArenaState.bet * 0.5);
      if (gs) { gs.hp = Math.max(1, (gs.hp || 0) - pen); gs.money = Math.max(0, (gs.money || 0) - loss); }
      if (typeof Renderer !== 'undefined') { if (Renderer.updateStats) Renderer.updateStats(); if (Renderer.updateMoney) Renderer.updateMoney(); }
      if (typeof addLog === 'function') addLog('Aréna: Prehra vs ' + enemy.name + '. HP −' + pen, 'warn');
      _showResultOverlay(false, 'HP −' + pen + '   ₿ −' + loss);
      /* Kill sprite animation on death */
      var sw = document.getElementById('arena-player-sw');
      if (sw) { sw.className = 'fx-sprite-wrap dead'; }
    }
    _updateStatsBar();
  }

  /* ══════════════════════════════════════════════════════
     §A7. UI RENDERER
  ══════════════════════════════════════════════════════ */
  function _log(msg, cls) {
    ArenaState.log.push({ msg: msg, cls: cls || 's' });
    var wrap = document.getElementById('arena-log-scroll');
    if (!wrap) return;
    wrap.innerHTML = ArenaState.log.slice(-50).map(function(l){
      return '<div class="log-line ' + l.cls + '">' + _esc(l.msg) + '</div>';
    }).join('');
    wrap.scrollTop = wrap.scrollHeight;
  }

  function _floatDmg(val, target, cls) {
    var cardId = target === 'enemy' ? 'arena-enemy-card' : 'arena-player-card';
    var card   = document.getElementById(cardId);
    if (!card) return;
    var el = document.createElement('div');
    el.className = 'dmg-float ' + cls;
    el.textContent = (cls === 'edmg' || cls === 'pdmg') ? '-' + val : (cls === 'heal' ? '+' + val : String(val));
    card.style.position = 'relative';
    card.appendChild(el);
    setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 900);
  }

  function _triggerAnimation(who, anim) {
    var swId = who === 'player' ? 'arena-player-sw' : 'arena-enemy-sw';
    var sw   = document.getElementById(swId);
    if (!sw) return;
    var idleCls = who === 'enemy' ? 'fx-sprite-wrap idle enemy-idle' : 'fx-sprite-wrap idle';
    sw.className = 'fx-sprite-wrap ' + anim;
    clearTimeout(sw._animTimer);
    sw._animTimer = setTimeout(function(){ sw.className = idleCls; }, anim === 'atk' ? 320 : 280);
  }

  function _setBar(id, cur, max) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.width = Math.max(0, Math.min(100, (cur / max) * 100)) + '%';
    /* HP colour class */
    if (el.classList.contains('hp-high') || el.classList.contains('hp-mid') || el.classList.contains('hp-low')) {
      var pct = cur / max;
      el.className = 'px-bar-fill ' + (pct > 0.5 ? 'hp-high' : pct > 0.25 ? 'hp-mid' : 'hp-low');
    }
  }
  function _setVal(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  function _setStatuses(id, statuses) {
    var el = document.getElementById(id);
    if (!el) return;
    var labels = { stun:['STUN','stun'], bleed:['BLEED','bleed'], dodge:['DODGE','dodge'],
      regen:['REGEN','regen'], blind:['BLIND','blind'], e_dodge:['DODGE','dodge'], e_enrage:['ENRAGE','enrage'] };
    el.innerHTML = Object.keys(statuses).filter(function(k){ return statuses[k]; }).map(function(k){
      var l = labels[k] || [k.toUpperCase(), 'stun'];
      return '<span class="px-chip ' + l[1] + '">' + l[0] + (statuses[k] > 1 ? ' ×' + statuses[k] : '') + '</span>';
    }).join('');
  }

  function _refreshFightUI() {
    var ps = ArenaState.playerFight;
    var es = ArenaState.enemyFight;
    if (!ps || !es) return;
    _setBar('arena-p-hp-bar', ps.hp, ps.maxHp);
    _setVal('arena-p-hp-val', ps.hp + '/' + ps.maxHp);
    _setBar('arena-p-stam-bar', ps.stam, ps.maxStam);
    _setVal('arena-p-stam-val', Math.floor(ps.stam));
    _setBar('arena-p-armor-bar', ps.armorCur, 50);
    _setVal('arena-p-armor-val', Math.floor(ps.armorCur));
    _setStatuses('arena-p-statuses', ps.statuses);
    _setBar('arena-e-hp-bar', es.hp, es.maxHp);
    _setVal('arena-e-hp-val', es.hp + '/' + es.maxHp);
    _setBar('arena-e-armor-bar', es.armor, 60);
    _setVal('arena-e-armor-val', Math.floor(es.armor));
    _setStatuses('arena-e-statuses', es.statuses);
    _setVal('arena-vs-round', 'KOLO\n' + ArenaState.round);
    _updateActionButtons();
    _updateStatsBar();
  }

  function _updateActionButtons() {
    var ps = ArenaState.playerFight;
    PLAYER_ACTIONS.forEach(function(act) {
      var btn = document.getElementById('arena-act-' + act.id);
      if (!btn) return;
      var cd = ArenaState.cooldowns[act.id] || 0;
      var stamOk = ps && ps.stam >= Math.abs(act.cost || 0);
      var disabled = cd > 0 || !stamOk || ArenaState.phase !== 'fight';
      btn.disabled = disabled;
      var desc = btn.querySelector('.abt-desc');
      var cdEl = btn.querySelector('.abt-cd');
      if (cd > 0) {
        btn.classList.add('on-cd');
        if (desc) desc.style.display = 'none';
        if (cdEl) { cdEl.style.display = 'block'; cdEl.textContent = 'CD: ' + cd + ' kolo'; }
      } else {
        btn.classList.remove('on-cd');
        if (desc) desc.style.display = 'block';
        if (cdEl) cdEl.style.display = 'none';
      }
    });
  }

  function _updateStatsBar() {
    _setVal('arena-fs-wins',   ArenaState.wins);
    _setVal('arena-fs-losses', ArenaState.losses);
    _setVal('arena-fs-round',  ArenaState.round);
    _setVal('arena-fs-dmg',    ArenaState.totalDmg);
    _setVal('arena-fs-bet',    '₿' + ArenaState.bet);
    _setVal('arena-hdr-w',     ArenaState.wins);
    _setVal('arena-hdr-l',     ArenaState.losses);
  }

  function _showResultOverlay(won, sub) {
    var ov = document.getElementById('arena-result');
    var ti = document.getElementById('arena-result-title');
    var sb = document.getElementById('arena-result-sub');
    if (!ov || !ti) return;
    ti.className = won ? 'win' : 'lose';
    ti.textContent = won ? '⚡ VÝHRA ⚡' : '☠ PREHRA ☠';
    if (sb) sb.textContent = sub || '';
    ov.classList.add('show');
    if (won) _spawnParticles();
    _updateStatsBar();
  }

  function _spawnParticles() {
    var c = document.getElementById('arena-particles-canvas');
    if (!c) return;
    var ctx = c.getContext('2d');
    var pw = c.offsetWidth || 600;
    var ph = c.offsetHeight || 400;
    c.width = pw; c.height = ph;
    var parts = [];
    var cols = ['#facc15','#39ff14','#f87171','#38bdf8','#ffffff','#a855f7'];
    for (var i = 0; i < 80; i++) {
      parts.push({ x:Math.random()*pw, y:Math.random()*ph*0.6,
        vx:(Math.random()-0.5)*5, vy:Math.random()*4+1,
        sz:Math.floor(Math.random()*4+2)*2,
        col:cols[Math.floor(Math.random()*cols.length)],
        life:1, decay:Math.random()*0.018+0.008 });
    }
    (function loop() {
      ctx.clearRect(0,0,pw,ph);
      parts.forEach(function(p){
        ctx.fillStyle = p.col; ctx.globalAlpha = p.life;
        ctx.fillRect(Math.round(p.x/2)*2, Math.round(p.y/2)*2, p.sz, p.sz);
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= p.decay;
      });
      ctx.globalAlpha = 1;
      parts = parts.filter(function(p){ return p.life > 0; });
      if (parts.length) requestAnimationFrame(loop);
    })();
  }

  function _renderRoster() {
    var gs    = window.S || {};
    var flags = gs.flags || {};
    var html  = '';
    ENEMIES.forEach(function(e) {
      var locked  = e.unlockFlag && !flags[e.unlockFlag];
      var diffMap = { easy:'ĽAHKÝ', medium:'STREDNÝ', hard:'ŤAŽKÝ', boss:'// BOSS //' };
      html += '<div class="roster-card ' + (locked ? 'locked' : '') + '" ' +
        (!locked ? 'onclick="ArenaSystem.startFight(\'' + e.id + '\')"' : '') + '>' +
        '<img class="roster-portrait" src="' + e.portrait + '" alt="" onerror="this.style.display=\'none\'">' +
        '<div class="roster-info">' +
          '<div class="roster-name">' + e.name + '</div>' +
          '<div class="roster-sub">' + e.faction + ' · ' + e.title + '</div>' +
          '<div class="roster-lore">' + (locked ? '🔒 Odomkni v príbehu' : e.lore.substring(0,58) + '…') + '</div>' +
        '</div>' +
        '<div class="roster-diff diff-' + e.difficulty + '">' + (diffMap[e.difficulty] || e.difficulty.toUpperCase()) + '</div>' +
      '</div>';
    });
    var el = document.getElementById('arena-roster-inner');
    if (el) el.innerHTML = html;
    _showPanel('roster');
    _updateBetDisplay();
  }

  function _showPanel(panel) {
    var roster = document.getElementById('arena-roster-wrap');
    var fight  = document.getElementById('arena-fight-wrap');
    if (roster) roster.style.display = panel === 'roster' ? 'flex' : 'none';
    if (fight)  fight.classList.toggle('show', panel === 'fight');
  }

  function _renderFight() {
    _showPanel('fight');
    _refreshFightUI();
  }

  function _updateBetDisplay() {
    var el = document.getElementById('arena-bet-val');
    if (el) el.textContent = '₿ ' + ArenaState.bet;
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ══════════════════════════════════════════════════════
     §A8. REWARD SCREEN
  ══════════════════════════════════════════════════════ */
  function _xpForLevel(lv) { return Math.floor(100 * Math.pow(1.45, lv - 1)); }

  function _pickUpgrades(diff) {
    var order = ['easy','medium','hard','boss'];
    var idx   = order.indexOf(diff);
    var avail = UPGRADES.filter(function(u){ return order.indexOf(u.minDiff) <= idx; });
    for (var i = avail.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = avail[i]; avail[i] = avail[j]; avail[j] = t;
    }
    return avail.slice(0, 3);
  }

  function _rollLoot(diff) {
    var order = ['easy','medium','hard','boss'];
    var idx   = order.indexOf(diff);
    var loot  = [];
    if (Math.random() < 0.65 + idx * 0.08) loot.push(LOOT_POOL[Math.floor(Math.random() * 2)]);
    if (idx >= 1 && Math.random() < 0.52)  loot.push(LOOT_POOL[2 + Math.floor(Math.random() * 2)]);
    if (idx >= 2 && Math.random() < 0.38)  loot.push(LOOT_POOL[4]);
    if (idx >= 3 && Math.random() < 0.28)  loot.push(LOOT_POOL[5]);
    return loot;
  }

  function _openRewardScreen(xpGain, moneyGain, enemy) {
    var ov = document.getElementById('arena-reward-overlay');
    if (!ov) return;

    var gs         = window.S || {};
    var lvBefore   = gs.level || 1;
    var xpBefore   = gs.xp   || 0;
    if (typeof gainXP === 'function') gainXP(xpGain);
    else if (gs) gs.xp = (gs.xp || 0) + xpGain;
    var xpAfter    = gs.xp   || 0;
    var lvAfter    = gs.level || 1;
    var leveledUp  = lvAfter > lvBefore;
    var xpNext     = _xpForLevel(lvAfter);

    var xpOldPct   = Math.min(100, (xpBefore / _xpForLevel(lvBefore)) * 100);
    var xpNewPct   = Math.min(100, (xpAfter  / xpNext) * 100);
    if (leveledUp) { xpOldPct = 0; }

    /* Loot html */
    var lootHtml = ArenaState.rewardLoot.length
      ? ArenaState.rewardLoot.map(function(it){
          return '<div class="rw-loot-item"><div class="rw-loot-icon">'+it.icon+'</div>'+
            '<div class="rw-loot-info"><div class="rw-loot-name">'+it.name+'</div>'+
            '<div class="rw-loot-desc">'+it.desc+'</div></div>'+
            '<div class="rw-loot-rar rar-'+it.rarity+'">'+it.rarity.toUpperCase()+'</div></div>';
        }).join('')
      : '<div style="font-size:8px;color:var(--text3)">// Žiadny loot //</div>';

    /* Upgrade html */
    var upgHtml = ArenaState.rewardUpgrades.map(function(u){
      return '<div class="rw-upg-card" id="rwupg-'+u.id+'" onclick="ArenaSystem.selectUpgrade(\''+u.id+'\')">' +
        '<div class="rw-upg-head"><div class="rw-upg-icon">'+u.icon+'</div>' +
        '<div class="rw-upg-name">'+u.name+'</div></div>' +
        '<div class="rw-upg-desc">'+u.desc+'</div>' +
        '<div class="rw-upg-effect">'+u.effect+'</div>' +
      '</div>';
    }).join('');

    /* Stats rows */
    var statDefs = [
      { lbl:'STR',    key:'str',     max:60,  cls:'str' },
      { lbl:'FLEX',   key:'flex',    max:60,  cls:'flex' },
      { lbl:'HACK',   key:'hackStat',max:60,  cls:'hack' },
      { lbl:'MAX HP', key:'maxHp',   max:300, cls:'hp'   },
    ];
    var statsHtml = statDefs.map(function(s){
      var v = gs[s.key] || (s.key==='maxHp'?100:10);
      return '<div class="stat-mini-row">' +
        '<div class="stat-mini-lbl">'+s.lbl+'</div>' +
        '<div class="stat-mini-bar-out"><div class="stat-mini-bar '+s.cls+'" id="rwbar-'+s.key+'" style="width:'+Math.min(100,v/s.max*100)+'%"></div></div>' +
        '<div class="stat-mini-val" id="rwval-'+s.key+'">'+v+'</div>' +
        '<div class="stat-mini-delta" id="rwdelta-'+s.key+'"></div>' +
      '</div>';
    }).join('');

    ov.innerHTML =
      '<div id="rw-header">' +
        '<div id="rw-title">// POST-FIGHT ODMENA //</div>' +
        '<div id="rw-enemy-badge">VS. ' + enemy.name.toUpperCase() + ' · ' + enemy.faction.toUpperCase() + '</div>' +
      '</div>' +
      '<div id="rw-body">' +
        '<div id="rw-left">' +
          '<div class="rw-section">VÝSLEDKY</div>' +
          '<div id="rw-summary">' +
            '<div class="rw-sum-row"><span class="rw-sum-lbl">XP ZÍSKANÉ</span><span class="rw-sum-val green">+'+xpGain+' XP</span></div>' +
            '<div class="rw-sum-row"><span class="rw-sum-lbl">KREDITY</span><span class="rw-sum-val">+₿'+moneyGain+'</span></div>' +
            '<div class="rw-sum-row"><span class="rw-sum-lbl">STÁVKA</span><span class="rw-sum-val">'+(ArenaState.bet>0?'₿'+ArenaState.bet+' × '+enemy.betMultiplier:'—')+'</span></div>' +
            '<div class="rw-sum-row"><span class="rw-sum-lbl">KOLÁ</span><span class="rw-sum-val">'+ArenaState.round+'</span></div>' +
            '<div class="rw-sum-row"><span class="rw-sum-lbl">TOTAL DMG</span><span class="rw-sum-val red">'+ArenaState.totalDmg+'</span></div>' +
          '</div>' +
          '<div class="rw-section">XP — LEVEL '+lvAfter+'</div>' +
          '<div style="margin-bottom:4px"><div class="rw-xp-labels"><span>XP: '+xpAfter+'</span><span>NEXT: '+xpNext+'</span></div>' +
          '<div class="rw-xp-out">' +
            '<div class="rw-xp-old" id="rw-xpbar-old" style="width:'+xpOldPct+'%"></div>' +
            '<div class="rw-xp-gain" id="rw-xpbar-gain" style="width:'+xpOldPct+'%"></div>' +
          '</div></div>' +
          '<div id="rw-levelup" class="'+(leveledUp?'show':'')+'"><div id="rw-levelup-text">⚡ LEVEL UP — '+lvAfter+' ⚡</div><div id="rw-levelup-sub">Augmentácie odomknuté</div></div>' +
          '<div class="rw-section">LOOT</div>' +
          '<div>'+lootHtml+'</div>' +
        '</div>' +
        '<div id="rw-right">' +
          '<div class="rw-section">ŠTATISTIKY</div>' +
          '<div id="rw-stats">'+statsHtml+'</div>' +
          '<div class="rw-section" style="margin-top:10px">VYBER UPGRADE</div>' +
          '<div style="font-size:8px;color:var(--text3);letter-spacing:1px;margin-bottom:8px">// Jedno vylepšenie. Nezvratné. //</div>' +
          '<div id="rw-upgrades">'+upgHtml+'</div>' +
          '<button id="rw-confirm-btn" onclick="ArenaSystem.confirmUpgrade()">✓ POTVRDIŤ UPGRADE</button>' +
          '<div id="rw-footer">' +
            '<button class="rw-foot-btn" onclick="ArenaSystem.closeReward()">⟵ Späť do arény</button>' +
            '<button class="rw-foot-btn gold" onclick="ArenaSystem.closeRewardExit()">✕ Zavrieť</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    ov.classList.add('show');
    setTimeout(function(){
      var g = document.getElementById('rw-xpbar-gain');
      if (g) { g.style.width = xpNewPct + '%'; g.classList.add('anim'); }
    }, 400);
  }

  function _updateStatPreviews(upgradeId) {
    var gs = window.S || {};
    var keyMap = { str:'str', flex:'flex', hack:'hackStat', hp:'maxHp' };
    ['str','flex','hackStat','maxHp'].forEach(function(k){
      var vEl = document.getElementById('rwval-'+k);
      var dEl = document.getElementById('rwdelta-'+k);
      if (vEl) { vEl.textContent = gs[k] || (k==='maxHp'?100:10); vEl.classList.remove('upgraded'); }
      if (dEl) dEl.textContent = '';
    });
    if (!upgradeId) return;
    var upg = UPGRADES.find(function(u){ return u.id === upgradeId; });
    if (!upg || !upg.preview) return;
    var k = upg.preview.key;
    var vEl = document.getElementById('rwval-'+k);
    var dEl = document.getElementById('rwdelta-'+k);
    if (vEl) { vEl.textContent = (gs[k]||(k==='maxHp'?100:10)) + upg.preview.delta; vEl.classList.add('upgraded'); }
    if (dEl) dEl.textContent = '+' + upg.preview.delta;
  }

  /* ══════════════════════════════════════════════════════
     §A2. HTML INJECT
  ══════════════════════════════════════════════════════ */
  var _injected = false;

  function _inject() {
    if (_injected) return;
    _injected = true;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    /* Main overlay */
    var div = document.createElement('div');
    div.id  = 'arena-overlay';
    div.innerHTML = `
      <div id="arena-header">
        <div id="arena-logo">⚔ ARÉNA // LAZARUS</div>
        <div id="arena-hdr-right">
          <div class="hdr-stat">W:<span class="hv" id="arena-hdr-w">0</span> L:<span class="hv" id="arena-hdr-l">0</span></div>
          <div class="hdr-stat" style="color:var(--gold)">₿<span id="arena-hdr-money">—</span></div>
          <button id="arena-close-btn" onclick="ArenaSystem.close()">✕ EXIT</button>
        </div>
      </div>

      <div id="arena-body">
        <div id="arena-left">

          <!-- ═══ ROSTER ═══ -->
          <div id="arena-roster-wrap" style="display:flex;flex-direction:column;flex:1;overflow:hidden">
            <div id="arena-roster-inner" style="flex:1;overflow-y:auto;padding:12px 12px 0;display:flex;flex-direction:column;gap:6px"></div>
            <div id="arena-bet-row">
              <span class="bet-label">STÁVKA</span>
              <button class="bet-btn" onclick="ArenaSystem.setBet(-100)">−100</button>
              <button class="bet-btn" onclick="ArenaSystem.setBet(-50)">−50</button>
              <button class="bet-btn" onclick="ArenaSystem.setBet(-10)">−10</button>
              <div id="arena-bet-val">₿ 0</div>
              <button class="bet-btn" onclick="ArenaSystem.setBet(+10)">+10</button>
              <button class="bet-btn" onclick="ArenaSystem.setBet(+50)">+50</button>
              <button class="bet-btn" onclick="ArenaSystem.setBet(+100)">+100</button>
            </div>
          </div>

          <!-- ═══ FIGHT ═══ -->
          <div id="arena-fight-wrap">
            <div id="arena-stage-area">
              <div id="arena-result" style="position:absolute;inset:0;display:none;z-index:200;background:rgba(2,5,2,0.95);flex-direction:column;align-items:center;justify-content:center;gap:16px">
                <canvas id="arena-particles-canvas" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"></canvas>
                <div id="arena-result-title" style="font-family:var(--font-px);font-size:18px;letter-spacing:5px;z-index:1">// VÝHRA //</div>
                <div id="arena-result-sub" style="font-size:9px;color:var(--text3);letter-spacing:2px;text-align:center;line-height:2.2;z-index:1"></div>
                <div style="display:flex;gap:10px;z-index:1">
                  <button class="res-btn" onclick="ArenaSystem.backToRoster()">⟵ ROSTER</button>
                  <button class="res-btn gold" onclick="ArenaSystem.rematch()">↺ ZNOVA</button>
                </div>
              </div>

              <div id="arena-fighters-row">
                <!-- PLAYER -->
                <div class="fx-card player" id="arena-player-card">
                  <div class="fx-name">// TY //</div>
                  <div class="fx-sprite-wrap idle" id="arena-player-sw">
                    <canvas id="arena-player-canvas" class="fx-sprite-canvas" width="54" height="78"></canvas>
                  </div>
                  <div class="px-bar-lbl">HP</div>
                  <div class="px-bar-out"><div class="px-bar-fill hp-high" id="arena-p-hp-bar" style="width:100%"></div></div>
                  <div class="px-bar-val" id="arena-p-hp-val">—/—</div>
                  <div class="px-bar-lbl">STAM</div>
                  <div class="px-bar-out"><div class="px-bar-fill stam" id="arena-p-stam-bar" style="width:100%"></div></div>
                  <div class="px-bar-val" id="arena-p-stam-val">100</div>
                  <div class="px-bar-lbl">ARMOR</div>
                  <div class="px-bar-out"><div class="px-bar-fill armor" id="arena-p-armor-bar" style="width:0%"></div></div>
                  <div class="px-bar-val" id="arena-p-armor-val">0</div>
                  <div class="fx-status-row" id="arena-p-statuses"></div>
                </div>

                <!-- VS -->
                <div id="arena-vs">
                  <div id="arena-vs-bolt">⚡</div>
                  <div id="arena-vs-text">VS</div>
                  <div id="arena-vs-round" style="font-family:var(--font-px);font-size:5px;color:var(--text3);letter-spacing:2px;text-align:center;line-height:1.8">KOLO<br>0</div>
                </div>

                <!-- ENEMY -->
                <div class="fx-card enemy" id="arena-enemy-card">
                  <div class="fx-name" id="arena-enemy-name">SÚPER</div>
                  <div class="fx-sprite-wrap idle enemy-idle" id="arena-enemy-sw">
                    <canvas id="arena-enemy-canvas" class="fx-sprite-canvas" width="54" height="78"></canvas>
                  </div>
                  <div class="px-bar-lbl">HP</div>
                  <div class="px-bar-out"><div class="px-bar-fill hp-high" id="arena-e-hp-bar" style="width:100%"></div></div>
                  <div class="px-bar-val" id="arena-e-hp-val">—/—</div>
                  <div class="px-bar-lbl">ARMOR</div>
                  <div class="px-bar-out"><div class="px-bar-fill armor" id="arena-e-armor-bar" style="width:0%"></div></div>
                  <div class="px-bar-val" id="arena-e-armor-val">0</div>
                  <div class="fx-status-row" id="arena-e-statuses"></div>
                </div>
              </div>

              <div id="arena-ground-glow"></div>
            </div><!-- /stage -->

            <div id="arena-fight-stats">
              <div class="fstat"><div class="fstat-val" id="arena-fs-wins">0</div><div class="fstat-lbl">VÝHRY</div></div>
              <div class="fstat"><div class="fstat-val" id="arena-fs-losses">0</div><div class="fstat-lbl">PREHRY</div></div>
              <div class="fstat"><div class="fstat-val" id="arena-fs-round">0</div><div class="fstat-lbl">KOLO</div></div>
              <div class="fstat"><div class="fstat-val" id="arena-fs-dmg" style="color:var(--red)">0</div><div class="fstat-lbl">DMG</div></div>
              <div class="fstat"><div class="fstat-val" id="arena-fs-bet" style="color:var(--gold)">₿0</div><div class="fstat-lbl">STÁVKA</div></div>
            </div>

            <div id="arena-actions">
              ${PLAYER_ACTIONS.map(function(a){
                return '<button class="px-action-btn" id="arena-act-'+a.id+'" onclick="ArenaSystem.doAction(\''+a.id+'\')">' +
                  '<span class="abt-icon">'+a.icon+'</span>' +
                  a.name + '<br>' +
                  '<span class="abt-desc">'+a.desc+'</span>' +
                  '<span class="abt-cd" style="display:none"></span>' +
                '</button>';
              }).join('')}
            </div>

            <div id="arena-ticker">
              <div id="arena-ticker-inner">
                &nbsp;&nbsp;⚔ ARÉNA LAZARUS v3.0 — PIXEL OVERHAUL &nbsp;|&nbsp; UNDERGROUD RING — PRIEVIDZA DISTRICT 7 &nbsp;|&nbsp; TIP: Hack-blind funguje len s HACK≥20 &nbsp;|&nbsp; DAEDALUS: "Analyzujem tvoje pohyby..." &nbsp;|&nbsp; Hláška od Ferka: "Dnes nie." &nbsp;|&nbsp; Loot odomknutý po každej výhre. Upgrady sú nezvratné. &nbsp;&nbsp;
              </div>
            </div>

          </div><!-- /fight-wrap -->
        </div><!-- /left -->

        <!-- ═══ RIGHT LOG ═══ -->
        <div id="arena-right">
          <div id="arena-log-header">
            <div id="arena-log-title">// BOJOVÝ LOG //</div>
          </div>
          <div id="arena-log-scroll">
            <div class="log-line s">// Aréna otvorená. Vyber súpera. //</div>
          </div>
        </div>

      </div><!-- /body -->
    `;
    document.body.appendChild(div);

    /* Reward overlay — separate */
    var rDiv = document.createElement('div');
    rDiv.id  = 'arena-reward-overlay';
    document.body.appendChild(rDiv);
  }

  /* ══════════════════════════════════════════════════════
     §A9. PUBLIC API
  ══════════════════════════════════════════════════════ */
  return {

    open: function() {
      _inject();
      var ov = document.getElementById('arena-overlay');
      if (ov) ov.classList.add('show');
      ArenaState.phase = 'roster';
      _renderRoster();
      _log('// Aréna otvorená. Vyber protivníka. //', 's');
      _startSpriteLoop();
      /* Sync money display */
      var gs = window.S || {};
      var m  = document.getElementById('arena-hdr-money');
      if (m) m.textContent = gs.money || 0;
    },

    close: function() {
      var ov = document.getElementById('arena-overlay');
      if (ov) ov.classList.remove('show');
      _stopSpriteLoop();
    },

    startFight: function(enemyId) {
      var template = ENEMIES.find(function(e){ return e.id === enemyId; });
      if (!template) return;
      var gs    = window.S || {};
      var flags = gs.flags || {};
      if (template.unlockFlag && !flags[template.unlockFlag]) return;
      if (ArenaState.bet > 0 && (gs.money || 0) < ArenaState.bet) {
        if (typeof showNotif === 'function') showNotif('Nedostatok kreditov na stávku!');
        return;
      }
      if (ArenaState.bet > 0) {
        gs.money = Math.max(0, (gs.money || 0) - ArenaState.bet);
        if (typeof Renderer !== 'undefined' && Renderer.updateMoney) Renderer.updateMoney();
      }

      ArenaState.enemy     = template;
      ArenaState.phase     = 'fight';
      ArenaState.round     = 0;
      ArenaState.cooldowns = {};
      ArenaState.totalDmg  = 0;
      ArenaState.lastPlayerAction = null;
      ArenaState.playerFight = _buildPlayerFight();
      ArenaState.enemyFight  = _buildEnemyFight(template);
      ArenaState.log         = [];

      /* Update enemy UI */
      var nameEl = document.getElementById('arena-enemy-name');
      if (nameEl) nameEl.textContent = template.name + ' // ' + template.faction;

      /* Hide old result */
      var res = document.getElementById('arena-result');
      if (res) { res.classList.remove('show'); res.style.display = 'none'; res.style.display = ''; }

      _log('⚔ ZÁPAS: ' + template.name + ' vs. Ty', 's');
      _log('// ' + template.lore + ' //', 'm');
      _log('Stávka: ₿' + ArenaState.bet, 'm');

      _renderFight();
      /* Draw enemy sprite immediately */
      var ec = document.getElementById('arena-enemy-canvas');
      if (ec) _drawFighter(ec.getContext('2d'), _getPalForEnemy(template.id), 0, true, ec.width, ec.height);
      var pc = document.getElementById('arena-player-canvas');
      if (pc) _drawFighter(pc.getContext('2d'), PAL_PLAYER, 0, false, pc.width, pc.height);
    },

    doAction: function(actionId) {
      if (ArenaState.phase !== 'fight') return;
      _doPlayerTurn(actionId);
    },

    backToRoster: function() {
      var res = document.getElementById('arena-result');
      if (res) res.classList.remove('show');
      ArenaState.phase = 'roster';
      _renderRoster();
      _log('// Späť na roster //', 's');
    },

    rematch: function() {
      if (!ArenaState.enemy) { this.backToRoster(); return; }
      this.startFight(ArenaState.enemy.id);
    },

    setBet: function(delta) {
      var gs  = window.S || {};
      var max = gs.money || 0;
      ArenaState.bet = Math.max(0, Math.min(max, ArenaState.bet + delta));
      _updateBetDisplay();
    },

    selectUpgrade: function(upgradeId) {
      if (ArenaState.rewardApplied) return;
      ArenaState.rewardSelected = upgradeId;
      ArenaState.rewardUpgrades.forEach(function(u){
        var c = document.getElementById('rwupg-' + u.id);
        if (c) c.classList.toggle('selected', u.id === upgradeId);
      });
      var btn = document.getElementById('rw-confirm-btn');
      if (btn) btn.classList.add('show');
      _updateStatPreviews(upgradeId);
    },

    confirmUpgrade: function() {
      if (ArenaState.rewardApplied) return;
      var id  = ArenaState.rewardSelected;
      if (!id) return;
      var upg = UPGRADES.find(function(u){ return u.id === id; });
      if (!upg) return;
      var gs = window.S;
      if (gs && upg.apply) upg.apply(gs);
      ArenaState.rewardApplied = true;
      ArenaState.rewardUpgrades.forEach(function(u){
        var c = document.getElementById('rwupg-' + u.id);
        if (c && u.id !== id) c.classList.add('used');
      });
      var btn = document.getElementById('rw-confirm-btn');
      if (btn) { btn.textContent = '✓ UPGRADE APLIKOVANÝ'; btn.disabled = true; }
      if (typeof Renderer !== 'undefined') { if (Renderer.updateStats) Renderer.updateStats(); if (Renderer.updateMoney) Renderer.updateMoney(); }
      _updateStatPreviews(id);
      if (typeof showNotif === 'function') showNotif('✓ ' + upg.name + ' — ' + upg.effect);
      if (typeof addLog   === 'function') addLog('Upgrade: ' + upg.name + ' — ' + upg.effect, 'ok');
    },

    closeReward: function() {
      var ov = document.getElementById('arena-reward-overlay');
      if (ov) ov.classList.remove('show');
      this.backToRoster();
    },

    closeRewardExit: function() {
      var ov = document.getElementById('arena-reward-overlay');
      if (ov) ov.classList.remove('show');
      this.close();
    },

  };

})();
