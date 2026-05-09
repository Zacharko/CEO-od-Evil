/* ═══════════════════════════════════════════════════════════════════
   ARENA.JS  —  CEO Zla // Operácia LAZARUS
   Podzemná aréna pod Prievidzou. Turn-based combat s frakciovými
   súpermi, apázkami, bet systémom a XP odmenami.

   Závisí na: S, gainXP, addLog, showNotif, Renderer (z hlavného HTML)
   Načíta sa lazy — len keď hráč klikne "⚔ Aréna" v topbare.

   §A1.  CSS inject
   §A2.  HTML overlay inject
   §A3.  Dáta — súperi, zbrane, perky
   §A4.  State — ArenaState
   §A5.  Core fight engine
   §A6.  Renderer — UI updates
   §A7.  Public API — ArenaSystem
═══════════════════════════════════════════════════════════════════ */

var ArenaSystem = (function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     §A1. CSS — injektujeme do <head> pri prvom načítaní
  ══════════════════════════════════════════════════════ */
  var CSS = `
  /* ── Arena overlay ─────────────────────────────────── */
  #arena-overlay {
    display: none; position: fixed; inset: 0; z-index: 900;
    background: var(--bg-glass, rgba(8,13,8,0.97));
    flex-direction: column; overflow: hidden;
    font-family: var(--font-body, 'Share Tech Mono', monospace);
    color: var(--text, #7feba0);
  }
  #arena-overlay.show { display: flex; }

  /* ── Header ─────────────────────────────────────────── */
  #arena-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 18px; border-bottom: 1px solid var(--border, #2a5a2a);
    background: var(--bg2, #0b120b); flex-shrink: 0;
  }
  #arena-title {
    font-family: var(--font-hud, 'Orbitron', monospace);
    font-size: 15px; font-weight: 900; letter-spacing: 4px;
    color: var(--gold, #facc15);
    text-shadow: 0 0 14px rgba(250,204,21,0.5);
    text-transform: uppercase;
  }
  #arena-close-btn {
    background: transparent; border: 1px solid var(--border, #2a5a2a);
    color: var(--text-dim, #5a9a5a); font-family: var(--font-hud, monospace);
    font-size: 10px; letter-spacing: 2px; padding: 4px 12px;
    cursor: pointer; transition: all 0.15s;
  }
  #arena-close-btn:hover { border-color: var(--red2, #e74c3c); color: var(--red2, #e74c3c); }

  /* ── Layout: dve stĺpce + log ───────────────────────── */
  #arena-body {
    display: flex; flex: 1; overflow: hidden; gap: 0;
  }

  /* ── Ľavý panel — súboj ─────────────────────────────── */
  #arena-fight-panel {
    flex: 1; min-width: 0; display: flex; flex-direction: column;
    overflow-y: auto; padding: 18px 20px; gap: 16px;
  }

  /* ── Pravý panel — log + výber ──────────────────────── */
  #arena-side-panel {
    width: 280px; flex-shrink: 0; border-left: 1px solid var(--border, #2a5a2a);
    display: flex; flex-direction: column; overflow: hidden;
  }

  /* ── Sekcní label ───────────────────────────────────── */
  .arena-section-label {
    font-family: var(--font-hud, monospace); font-size: 9px;
    letter-spacing: 3px; color: var(--text-muted, #3a6a3a);
    text-transform: uppercase; padding: 0 0 6px;
    border-bottom: 1px solid var(--border2, #1a3a1a); margin-bottom: 10px;
  }

  /* ── Dva fighters side by side ──────────────────────── */
  #arena-fighters {
    display: flex; gap: 14px; align-items: flex-start;
  }
  .arena-fighter {
    flex: 1; background: var(--bg3, #0f170f);
    border: 1px solid var(--border, #2a5a2a);
    padding: 14px; position: relative;
  }
  .arena-fighter.player { border-color: var(--green3, #16a34a); }
  .arena-fighter.enemy  { border-color: var(--red, #c0392b); }

  .fighter-name {
    font-family: var(--font-hud, monospace); font-size: 11px;
    font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 10px;
  }
  .arena-fighter.player .fighter-name { color: var(--green, #39ff14); }
  .arena-fighter.enemy  .fighter-name { color: var(--red2, #e74c3c);  }

  .fighter-portrait {
    width: 100%; height: 90px; object-fit: cover;
    border: 1px solid var(--border, #2a5a2a); margin-bottom: 10px;
    display: block;
    filter: sepia(0.3) hue-rotate(60deg);
  }
  .arena-fighter.enemy .fighter-portrait {
    filter: sepia(0.4) hue-rotate(320deg) saturate(1.3);
  }

  /* HP / shield bars */
  .arena-stat-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .arena-stat-label {
    font-size: 9px; letter-spacing: 1px; color: var(--text-muted, #3a6a3a);
    width: 30px; flex-shrink: 0; text-transform: uppercase;
  }
  .arena-bar-wrap {
    flex: 1; height: 8px; background: var(--bg, #080d08);
    border: 1px solid var(--border2, #1a3a1a); overflow: hidden;
  }
  .arena-bar {
    height: 100%; transition: width 0.4s ease;
  }
  .arena-bar.hp    { background: linear-gradient(90deg, #7f1d1d, #f87171); }
  .arena-bar.armor { background: linear-gradient(90deg, #1e3a5f, #38bdf8); }
  .arena-bar.stam  { background: linear-gradient(90deg, #1a3a1a, #4ade80); }
  .arena-stat-val {
    font-size: 10px; min-width: 28px; text-align: right;
    color: var(--text-bright, #d8f8e0);
  }

  /* Status efekty na fighterovi */
  .fighter-status-row {
    display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px; min-height: 18px;
  }
  .status-chip {
    font-size: 8px; letter-spacing: 1px; padding: 1px 5px;
    border: 1px solid; text-transform: uppercase;
  }
  .status-chip.stun    { color: #fbbf24; border-color: #fbbf24; }
  .status-chip.bleed   { color: #f87171; border-color: #f87171; }
  .status-chip.armor   { color: #38bdf8; border-color: #38bdf8; }
  .status-chip.regen   { color: #4ade80; border-color: #4ade80; }
  .status-chip.enrage  { color: #ef4444; border-color: #ef4444; }

  /* ── VS badge ───────────────────────────────────────── */
  #arena-vs-badge {
    flex-shrink: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 0 8px; gap: 6px;
  }
  .arena-vs-text {
    font-family: var(--font-hud, monospace); font-size: 16px; font-weight: 900;
    color: var(--gold, #facc15); letter-spacing: 3px;
    text-shadow: 0 0 20px rgba(250,204,21,0.7);
  }
  .arena-round-badge {
    font-size: 8px; letter-spacing: 2px; color: var(--text-dim, #5a9a5a);
    text-transform: uppercase;
  }

  /* ── Akcie hráča ───────────────────────────────────── */
  #arena-actions {
    display: flex; flex-wrap: wrap; gap: 8px;
  }
  .arena-action-btn {
    flex: 1; min-width: 120px;
    background: var(--bg3, #0f170f); border: 1px solid var(--border, #2a5a2a);
    color: var(--text, #7feba0); font-family: var(--font-body, monospace);
    font-size: 11px; letter-spacing: 1px; padding: 10px 12px;
    cursor: pointer; transition: all 0.15s; text-align: left;
  }
  .arena-action-btn:hover:not(:disabled) {
    border-color: var(--green3, #16a34a); color: var(--green, #39ff14);
    background: rgba(57,255,20,0.05);
  }
  .arena-action-btn:disabled {
    opacity: 0.35; cursor: not-allowed;
  }
  .arena-action-btn .act-name {
    display: block; font-weight: 700; font-size: 12px; margin-bottom: 3px;
  }
  .arena-action-btn .act-desc {
    display: block; font-size: 9px; color: var(--text-dim, #5a9a5a);
    letter-spacing: 0.5px;
  }
  .arena-action-btn.cooldown {
    border-color: var(--border2, #1a3a1a); opacity: 0.5;
  }

  /* ── Výsledkový float text ─────────────────────────── */
  @keyframes floatUp {
    0%   { opacity: 1; transform: translateY(0); }
    80%  { opacity: 0.8; }
    100% { opacity: 0; transform: translateY(-40px); }
  }
  .dmg-float {
    position: absolute; font-family: var(--font-hud, monospace);
    font-size: 18px; font-weight: 900; pointer-events: none;
    animation: floatUp 0.9s ease forwards; z-index: 10;
    letter-spacing: 2px;
  }
  .dmg-float.player-hit { color: #f87171; top: 40px; left: 50%; }
  .dmg-float.enemy-hit  { color: #4ade80; top: 40px; left: 50%; }
  .dmg-float.miss       { color: var(--text-dim, #5a9a5a); top: 40px; left: 40%; font-size: 12px; }

  /* ── Bojový log ─────────────────────────────────────── */
  #arena-log-wrap {
    flex: 1; overflow-y: auto; padding: 10px 12px;
    display: flex; flex-direction: column; gap: 3px;
    background: var(--bg-panel, #090e09);
  }
  #arena-log-wrap::-webkit-scrollbar { width: 4px; }
  #arena-log-wrap::-webkit-scrollbar-thumb { background: var(--border, #2a5a2a); }
  .arena-log-line {
    font-size: 10px; letter-spacing: 0.5px; line-height: 1.5;
    border-left: 2px solid transparent; padding-left: 6px;
  }
  .arena-log-line.hit-p   { color: #4ade80; border-color: var(--green3, #16a34a); }
  .arena-log-line.hit-e   { color: #f87171; border-color: var(--red, #c0392b); }
  .arena-log-line.miss    { color: var(--text-muted, #3a6a3a); }
  .arena-log-line.system  { color: var(--gold, #facc15); border-color: rgba(250,204,21,0.4); }
  .arena-log-line.crit    { color: #fbbf24; font-weight: 700; }

  /* ── Roaster panel (výber protivníka) ───────────────── */
  #arena-roster {
    flex: 1; overflow-y: auto; padding: 10px 12px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .roster-card {
    background: var(--bg3, #0f170f); border: 1px solid var(--border, #2a5a2a);
    padding: 10px 12px; cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 10px;
  }
  .roster-card:hover {
    border-color: var(--gold, #facc15);
    background: rgba(250,204,21,0.04);
  }
  .roster-card.locked { opacity: 0.4; cursor: not-allowed; }
  .roster-card.locked:hover { border-color: var(--border, #2a5a2a); background: var(--bg3, #0f170f); }
  .roster-card-portrait {
    width: 40px; height: 40px; object-fit: cover; flex-shrink: 0;
    border: 1px solid var(--border, #2a5a2a);
    filter: sepia(0.3) hue-rotate(320deg) saturate(1.2);
  }
  .roster-card-info { flex: 1; min-width: 0; }
  .roster-card-name {
    font-family: var(--font-hud, monospace); font-size: 10px;
    letter-spacing: 2px; color: var(--text-bright, #d8f8e0); text-transform: uppercase;
    margin-bottom: 3px;
  }
  .roster-card-sub {
    font-size: 9px; color: var(--text-muted, #3a6a3a); letter-spacing: 1px;
  }
  .roster-card-diff {
    font-family: var(--font-hud, monospace); font-size: 9px;
    letter-spacing: 1px; text-transform: uppercase; flex-shrink: 0;
  }
  .diff-easy   { color: #4ade80; }
  .diff-medium { color: #fbbf24; }
  .diff-hard   { color: #ef4444; }
  .diff-boss   { color: var(--purple, #a855f7); text-shadow: 0 0 8px rgba(168,85,247,0.6); }

  /* ── Bet panel ─────────────────────────────────────── */
  #arena-bet-row {
    padding: 10px 12px; border-top: 1px solid var(--border2, #1a3a1a);
    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  }
  .bet-label {
    font-size: 9px; letter-spacing: 2px; color: var(--text-muted, #3a6a3a);
    text-transform: uppercase; flex-shrink: 0;
  }
  #arena-bet-val {
    font-family: var(--font-hud, monospace); font-size: 13px;
    color: var(--gold, #facc15); min-width: 50px; text-align: center;
  }
  .bet-btn {
    background: transparent; border: 1px solid var(--border, #2a5a2a);
    color: var(--text-dim, #5a9a5a); font-family: var(--font-hud, monospace);
    font-size: 10px; padding: 3px 8px; cursor: pointer; transition: all 0.12s;
  }
  .bet-btn:hover { border-color: var(--gold, #facc15); color: var(--gold, #facc15); }

  /* ── Výsledok ───────────────────────────────────────── */
  #arena-result-overlay {
    display: none; position: absolute; inset: 0;
    background: rgba(8,13,8,0.92); z-index: 50;
    flex-direction: column; align-items: center; justify-content: center;
    gap: 16px;
  }
  #arena-result-overlay.show { display: flex; }
  #arena-result-title {
    font-family: var(--font-hud, monospace); font-size: 28px; font-weight: 900;
    letter-spacing: 6px; text-transform: uppercase;
  }
  #arena-result-title.win  { color: var(--green, #39ff14); text-shadow: 0 0 30px rgba(57,255,20,0.7); }
  #arena-result-title.lose { color: var(--red2, #e74c3c);  text-shadow: 0 0 30px rgba(231,76,60,0.7); }
  #arena-result-sub {
    font-size: 12px; color: var(--text-dim, #5a9a5a); letter-spacing: 2px; text-align: center;
  }
  .arena-result-btn {
    background: transparent; border: 1px solid var(--green3, #16a34a);
    color: var(--green, #39ff14); font-family: var(--font-hud, monospace);
    font-size: 11px; letter-spacing: 3px; padding: 10px 24px;
    cursor: pointer; transition: all 0.15s;
  }
  .arena-result-btn:hover { background: rgba(57,255,20,0.08); letter-spacing: 4px; }

  /* ══════════════════════════════════════════════════════
     REWARD & UPGRADE PANEL
  ══════════════════════════════════════════════════════ */

  /* ── Reward overlay (celá obrazovka po výhre) ─────── */
  #arena-reward-overlay {
    display: none; position: fixed; inset: 0; z-index: 950;
    background: rgba(4,8,4,0.97);
    flex-direction: column; align-items: center; justify-content: flex-start;
    overflow-y: auto; padding: 0;
    font-family: var(--font-body, 'Share Tech Mono', monospace);
  }
  #arena-reward-overlay.show { display: flex; }

  /* ── Reward header ─────────────────────────────────── */
  #reward-header {
    width: 100%; padding: 18px 24px 14px;
    border-bottom: 1px solid var(--border, #2a5a2a);
    background: var(--bg2, #0b120b);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  #reward-title {
    font-family: var(--font-hud, 'Orbitron', monospace);
    font-size: 13px; font-weight: 900; letter-spacing: 5px;
    color: var(--gold, #facc15);
    text-shadow: 0 0 20px rgba(250,204,21,0.6);
  }
  #reward-enemy-badge {
    font-size: 9px; letter-spacing: 2px; color: var(--text-muted, #3a6a3a);
  }

  /* ── Reward body ───────────────────────────────────── */
  #reward-body {
    display: flex; gap: 0; width: 100%; flex: 1; min-height: 0;
  }

  /* ── Ľavá kolona: stats + loot ─────────────────────── */
  #reward-left {
    flex: 1; min-width: 0; padding: 20px 22px; display: flex;
    flex-direction: column; gap: 18px; overflow-y: auto;
    border-right: 1px solid var(--border2, #1a3a1a);
  }

  /* ── Rewards summary box ───────────────────────────── */
  #reward-summary {
    background: var(--bg3, #0f170f); border: 1px solid var(--border, #2a5a2a);
    padding: 16px;
  }
  .reward-summary-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 6px 0; border-bottom: 1px solid var(--border2, #1a3a1a);
  }
  .reward-summary-row:last-child { border-bottom: none; }
  .reward-summary-label {
    font-size: 9px; letter-spacing: 2px; color: var(--text-muted, #3a6a3a);
    text-transform: uppercase;
  }
  .reward-summary-val {
    font-family: var(--font-hud, monospace); font-size: 13px; font-weight: 700;
    color: var(--gold, #facc15);
  }
  .reward-summary-val.green { color: var(--green, #39ff14); }
  .reward-summary-val.red   { color: var(--red2, #e74c3c); }

  /* ── XP bar ────────────────────────────────────────── */
  #reward-xp-section { }
  .reward-xp-label {
    font-size: 9px; letter-spacing: 3px; color: var(--text-muted, #3a6a3a);
    text-transform: uppercase; margin-bottom: 8px;
    display: flex; justify-content: space-between;
  }
  .reward-xp-bar-wrap {
    height: 12px; background: var(--bg, #080d08);
    border: 1px solid var(--border, #2a5a2a); overflow: hidden; position: relative;
  }
  .reward-xp-bar-old {
    height: 100%; background: linear-gradient(90deg, #1a3a5f, #2563eb);
    position: absolute; top: 0; left: 0; transition: none;
  }
  .reward-xp-bar-gain {
    height: 100%; background: linear-gradient(90deg, #15803d, #4ade80);
    position: absolute; top: 0; transition: width 1.2s ease;
  }
  @keyframes xpPulse {
    0%,100% { box-shadow: 0 0 4px rgba(74,222,128,0.4); }
    50%      { box-shadow: 0 0 16px rgba(74,222,128,0.9); }
  }
  .reward-xp-bar-gain.anim { animation: xpPulse 1s ease; }

  /* ── LEVEL UP banner ───────────────────────────────── */
  #reward-levelup {
    display: none;
    background: linear-gradient(135deg, rgba(250,204,21,0.08), rgba(250,204,21,0.02));
    border: 1px solid var(--gold, #facc15);
    padding: 14px 16px; text-align: center;
  }
  #reward-levelup.show { display: block; }
  #reward-levelup-text {
    font-family: var(--font-hud, monospace); font-size: 18px; font-weight: 900;
    letter-spacing: 6px; color: var(--gold, #facc15);
    text-shadow: 0 0 30px rgba(250,204,21,0.8);
    text-transform: uppercase; margin-bottom: 4px;
  }
  @keyframes goldGlow {
    0%,100% { text-shadow: 0 0 20px rgba(250,204,21,0.6); }
    50%      { text-shadow: 0 0 50px rgba(250,204,21,1), 0 0 80px rgba(250,204,21,0.4); }
  }
  #reward-levelup.show #reward-levelup-text { animation: goldGlow 1.5s ease infinite; }
  #reward-levelup-sub {
    font-size: 9px; letter-spacing: 2px; color: var(--text-dim, #5a9a5a);
  }

  /* ── Loot items ────────────────────────────────────── */
  #reward-loot { }
  .loot-item {
    display: flex; align-items: center; gap: 10px; padding: 8px 10px;
    background: var(--bg3, #0f170f); border: 1px solid var(--border2, #1a3a1a);
    margin-bottom: 6px; cursor: default;
  }
  .loot-item-icon { font-size: 18px; flex-shrink: 0; width: 28px; text-align: center; }
  .loot-item-info { flex: 1; min-width: 0; }
  .loot-item-name {
    font-size: 10px; letter-spacing: 1px; color: var(--text-bright, #d8f8e0);
    margin-bottom: 2px;
  }
  .loot-item-desc { font-size: 8px; color: var(--text-muted, #3a6a3a); letter-spacing: 0.5px; }
  .loot-item-rarity {
    font-size: 8px; letter-spacing: 2px; font-family: var(--font-hud, monospace);
    flex-shrink: 0;
  }
  .rarity-common   { color: var(--text-dim, #5a9a5a); }
  .rarity-uncommon { color: #4ade80; }
  .rarity-rare     { color: #38bdf8; }
  .rarity-epic     { color: #a855f7; text-shadow: 0 0 8px rgba(168,85,247,0.5); }

  /* ── Pravá kolona: UPGRADE POSTAVY ─────────────────── */
  #reward-right {
    width: 320px; flex-shrink: 0; padding: 20px 18px;
    display: flex; flex-direction: column; gap: 14px;
    overflow-y: auto;
  }

  .reward-section-label {
    font-family: var(--font-hud, monospace); font-size: 9px;
    letter-spacing: 3px; color: var(--text-muted, #3a6a3a);
    text-transform: uppercase; padding-bottom: 6px;
    border-bottom: 1px solid var(--border2, #1a3a1a); margin-bottom: 4px;
  }

  /* Upgrade karty */
  #reward-upgrades {
    display: flex; flex-direction: column; gap: 8px;
  }
  .upgrade-card {
    background: var(--bg3, #0f170f); border: 1px solid var(--border, #2a5a2a);
    padding: 12px 14px; cursor: pointer; transition: all 0.18s;
    position: relative; overflow: hidden;
  }
  .upgrade-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: var(--green3, #16a34a);
    transition: background 0.18s;
  }
  .upgrade-card:hover:not(.selected):not(.used) {
    border-color: var(--green3, #16a34a);
    background: rgba(22,163,74,0.06);
  }
  .upgrade-card:hover:not(.selected):not(.used)::before {
    background: var(--green, #39ff14);
  }
  .upgrade-card.selected {
    border-color: var(--gold, #facc15);
    background: rgba(250,204,21,0.06);
  }
  .upgrade-card.selected::before { background: var(--gold, #facc15); }
  .upgrade-card.used {
    opacity: 0.4; cursor: not-allowed;
  }
  .upgrade-card-header {
    display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
  }
  .upgrade-card-icon { font-size: 16px; }
  .upgrade-card-name {
    font-family: var(--font-hud, monospace); font-size: 10px; font-weight: 700;
    letter-spacing: 2px; color: var(--text-bright, #d8f8e0); text-transform: uppercase;
    flex: 1;
  }
  .upgrade-card-cost {
    font-size: 9px; letter-spacing: 1px; color: var(--gold, #facc15);
    flex-shrink: 0;
  }
  .upgrade-card-desc {
    font-size: 9px; color: var(--text-dim, #5a9a5a); letter-spacing: 0.5px; line-height: 1.5;
  }
  .upgrade-card-effect {
    margin-top: 5px; font-size: 9px; letter-spacing: 1px;
    color: var(--green, #39ff14); font-family: var(--font-hud, monospace);
  }

  /* Confirm upgrade btn */
  #reward-upgrade-confirm {
    background: transparent; border: 1px solid var(--green3, #16a34a);
    color: var(--green, #39ff14); font-family: var(--font-hud, monospace);
    font-size: 11px; letter-spacing: 3px; padding: 12px; width: 100%;
    cursor: pointer; transition: all 0.15s; display: none;
    text-transform: uppercase;
  }
  #reward-upgrade-confirm.show { display: block; }
  #reward-upgrade-confirm:hover { background: rgba(57,255,20,0.08); letter-spacing: 4px; }
  #reward-upgrade-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Current stats mini-display */
  #reward-current-stats {
    background: var(--bg3, #0f170f); border: 1px solid var(--border2, #1a3a1a);
    padding: 10px 12px; display: flex; flex-direction: column; gap: 5px;
  }
  .stat-mini-row {
    display: flex; align-items: center; gap: 8px;
  }
  .stat-mini-label {
    font-size: 8px; letter-spacing: 2px; color: var(--text-muted, #3a6a3a);
    width: 60px; flex-shrink: 0; text-transform: uppercase;
  }
  .stat-mini-bar-wrap {
    flex: 1; height: 5px; background: var(--bg, #080d08);
    border: 1px solid var(--border2, #1a3a1a); overflow: hidden;
  }
  .stat-mini-bar {
    height: 100%; transition: width 0.6s ease;
  }
  .stat-mini-bar.str  { background: linear-gradient(90deg, #7f1d1d, #ef4444); }
  .stat-mini-bar.flex { background: linear-gradient(90deg, #1a3a5f, #38bdf8); }
  .stat-mini-bar.hack { background: linear-gradient(90deg, #1e1a3f, #a855f7); }
  .stat-mini-bar.hp   { background: linear-gradient(90deg, #1a3a1a, #4ade80); }
  .stat-mini-val {
    font-family: var(--font-hud, monospace); font-size: 10px; font-weight: 700;
    color: var(--text-bright, #d8f8e0); min-width: 28px; text-align: right;
    transition: color 0.4s;
  }
  .stat-mini-val.upgraded { color: var(--gold, #facc15); }
  .stat-mini-delta {
    font-size: 8px; color: var(--green, #39ff14); min-width: 20px;
    font-family: var(--font-hud, monospace);
  }

  /* Close / continue row */
  #reward-footer {
    display: flex; gap: 10px; flex-shrink: 0; margin-top: auto;
    padding-top: 12px; border-top: 1px solid var(--border2, #1a3a1a);
  }
  .reward-footer-btn {
    flex: 1; background: transparent; border: 1px solid var(--border, #2a5a2a);
    color: var(--text-dim, #5a9a5a); font-family: var(--font-hud, monospace);
    font-size: 10px; letter-spacing: 2px; padding: 10px;
    cursor: pointer; transition: all 0.15s; text-transform: uppercase;
  }
  .reward-footer-btn:hover { border-color: var(--green3, #16a34a); color: var(--green, #39ff14); }
  .reward-footer-btn.primary {
    border-color: var(--gold, #facc15); color: var(--gold, #facc15);
  }
  .reward-footer-btn.primary:hover { background: rgba(250,204,21,0.06); }

  /* ── Mobile ─────────────────────────────────────────── */
  @media (max-width: 640px) {
    #reward-body { flex-direction: column; }
    #reward-right { width: 100%; border-top: 1px solid var(--border2); }
  }

  /* ── Stats bar pod fightermi ─────────────────────────── */
  #arena-fight-stats {
    display: flex; gap: 16px; font-size: 10px;
    color: var(--text-dim, #5a9a5a); letter-spacing: 1px;
    padding: 8px 0; border-top: 1px solid var(--border2, #1a3a1a);
    border-bottom: 1px solid var(--border2, #1a3a1a);
  }
  .fight-stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .fight-stat-val  { color: var(--text-bright, #d8f8e0); font-weight: 700; font-size: 12px; }

  /* ── Mobile responsive ───────────────────────────────── */
  @media (max-width: 640px) {
    #arena-body { flex-direction: column; }
    #arena-side-panel { width: 100%; height: 200px; border-left: none; border-top: 1px solid var(--border, #2a5a2a); }
    #arena-fighters { flex-direction: column; }
    .arena-fighter { flex: none; }
  }
  `;

  /* ══════════════════════════════════════════════════════
     §A3. DÁT A — Súperi, akcie, perky
  ══════════════════════════════════════════════════════ */

  // Akcie hráča
  var PLAYER_ACTIONS = [
    {
      id: 'strike',
      name: '⚡ Úder',
      desc: 'Rýchly úder. Vždy dostiahne.',
      cost: 0,          // stamina cost
      cooldown: 0,
      fn: function(ps, es) {
        var base = 8 + Math.floor(ps.str * 0.4);
        var roll = Math.random();
        var isCrit = roll > 0.82;
        var dmg = isCrit ? Math.floor(base * 1.7) : base;
        dmg = Math.max(1, dmg - Math.floor(es.armor * 0.3));
        return { dmg: dmg, crit: isCrit, miss: false, effect: null, stam: -6, msg: isCrit ? 'KRITICKÝ ÚDER' : 'Úder' };
      }
    },
    {
      id: 'heavy',
      name: '🔨 Ťažký úder',
      desc: 'Silný, ale pomalší. 30% šanca na omráčenie.',
      cost: 12,
      cooldown: 0,
      fn: function(ps, es) {
        var base = 18 + Math.floor(ps.str * 0.7);
        var miss = Math.random() < 0.18;
        if (miss) return { dmg: 0, crit: false, miss: true, effect: null, stam: -12, msg: 'Minul' };
        var dmg = Math.max(2, base - Math.floor(es.armor * 0.5));
        var stun = Math.random() < 0.30;
        return { dmg: dmg, crit: false, miss: false, effect: stun ? 'stun' : null, stam: -12, msg: stun ? 'OMRÁČENIE!' : 'Ťažký úder' };
      }
    },
    {
      id: 'dodge',
      name: '💨 Úskok',
      desc: 'Zvyšuje vyhnutie na 1 kolo. Obnoví staminu.',
      cost: 0,
      cooldown: 2,
      fn: function(ps, es) {
        return { dmg: 0, crit: false, miss: false, effect: 'dodge', stam: +18, msg: 'Úskok — pripravuješ sa' };
      }
    },
    {
      id: 'bleed',
      name: '🗡 Krvácanie',
      desc: 'Malý dmg, ale spôsobí krvácanie na 3 kolá.',
      cost: 8,
      cooldown: 3,
      fn: function(ps, es) {
        var base = 5 + Math.floor(ps.flex * 0.3);
        var miss = Math.random() < 0.12;
        if (miss) return { dmg: 0, crit: false, miss: true, effect: null, stam: -8, msg: 'Minul — príliš rýchlo' };
        return { dmg: base, crit: false, miss: false, effect: 'bleed', stam: -8, msg: 'Zranil — začína krvácať' };
      }
    },
    {
      id: 'hack_blind',
      name: '💻 Hack — Zaslepenie',
      desc: 'Hackuješ jeho augment. Šanca na zaslepenie (miss↑).',
      cost: 15,
      cooldown: 4,
      fn: function(ps, es) {
        if ((ps.hackStat || 0) < 20) {
          return { dmg: 0, crit: false, miss: true, effect: null, stam: -15, msg: 'HCK príliš nízky — zlyhal' };
        }
        var success = Math.random() < (0.3 + (ps.hackStat - 20) * 0.01);
        if (!success) return { dmg: 0, crit: false, miss: true, effect: null, stam: -15, msg: 'Hack zlyhal' };
        return { dmg: 0, crit: false, miss: false, effect: 'blind', stam: -15, msg: 'Augment hacknutý — zaslepený!' };
      }
    },
    {
      id: 'medpatch',
      name: '💉 Med-patch',
      desc: 'Ošetrenie — obnoví HP. 1× za zápas.',
      cost: 0,
      cooldown: 99,  // len raz
      fn: function(ps, es) {
        var heal = 25 + Math.floor(ps.level * 3);
        return { dmg: 0, crit: false, miss: false, effect: 'heal', healAmt: heal, stam: -5, msg: 'Med-patch — HP +' + heal };
      }
    },
  ];

  // Súperi
  var ENEMIES = [
    {
      id: 'ferko_stokár',
      name: 'Ferko',
      faction: 'Stokári',
      title: 'Strážca skladu',
      portrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      difficulty: 'easy',
      level: 1,
      hp: 55, maxHp: 55,
      armor: 8,
      str: 14, flex: 8, speed: 7,
      reward: { xp: 30, money: 80 },
      betMultiplier: 1.5,
      unlockFlag: null,  // vždy dostupný
      lore: 'Dvadsaťpäť rokov. LED na augmente bliká červene — relaxovaný. Dnes nie.',
      tactics: ['strike', 'heavy'],
      ai: function(es, ps) {
        // Jednoduchý AI — preferuje strike, pri nízkom HP heavy
        if (es.hp < es.maxHp * 0.3) return 'heavy';
        return Math.random() < 0.6 ? 'strike' : 'heavy';
      }
    },
    {
      id: 'securitár_mec',
      name: 'Securitár M.E.C.',
      faction: 'M.E.C.',
      title: 'Korporátna bezpečnosť',
      portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      difficulty: 'medium',
      level: 3,
      hp: 80, maxHp: 80,
      armor: 18,
      str: 20, flex: 14, speed: 11,
      reward: { xp: 70, money: 180 },
      betMultiplier: 2.0,
      unlockFlag: 'mec_scan_1',
      lore: 'Plnú výstroj, brnenie GEN-4. Dostáva plat trikrát ako ty. Nehovorí prečo tu je.',
      tactics: ['strike', 'heavy', 'armor_up'],
      ai: function(es, ps) {
        if (es.hp < es.maxHp * 0.5 && !es._usedArmorUp) {
          es._usedArmorUp = true;
          return 'armor_up';
        }
        return Math.random() < 0.5 ? 'heavy' : 'strike';
      }
    },
    {
      id: 'oravec_lab',
      name: 'Dr. Oravec',
      faction: 'FRI / LAZARUS',
      title: 'Výskumný vedúci B7',
      portrait: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      difficulty: 'hard',
      level: 6,
      hp: 65, maxHp: 65,
      armor: 5,
      str: 12, flex: 28, speed: 20,
      reward: { xp: 150, money: 400 },
      betMultiplier: 3.0,
      unlockFlag: 'oravec_stopa',
      lore: 'Nepovie ti nič. Nie preto, že odmietne — ale preto, že ťa zmlátí skôr.',
      tactics: ['bleed', 'dodge', 'hack_stun'],
      ai: function(es, ps) {
        if (es.hp < es.maxHp * 0.4) return 'bleed';
        if (Math.random() < 0.35) return 'dodge';
        return 'hack_stun';
      }
    },
    {
      id: 'bane_enforcer',
      name: 'Bane Corp. Enforcer',
      faction: 'Bane Corp.',
      title: 'Korporátny likvidátor',
      portrait: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      difficulty: 'hard',
      level: 8,
      hp: 110, maxHp: 110,
      armor: 22,
      str: 32, flex: 18, speed: 14,
      reward: { xp: 220, money: 600 },
      betMultiplier: 3.5,
      unlockFlag: 'banecorp_siete',
      lore: 'Plná augmentácia. Pracovná zmluva na desať rokov. Pozrite na oči — tam nie je nič.',
      tactics: ['heavy', 'enrage', 'strike'],
      ai: function(es, ps) {
        if (!es._enraged && es.hp < es.maxHp * 0.45) {
          es._enraged = true;
          return 'enrage';
        }
        if (es._enraged) return Math.random() < 0.7 ? 'heavy' : 'strike';
        return Math.random() < 0.4 ? 'heavy' : 'strike';
      }
    },
    {
      id: 'daedalus_test',
      name: 'DAEDALUS v4.1',
      faction: '// SIMULÁCIA',
      title: 'Taktický protokol',
      portrait: 'https://raw.githubusercontent.com/Zacharko/CEO-od-Evil/main/public/images/hra/daedalus.jpg',
      difficulty: 'boss',
      level: 12,
      hp: 90, maxHp: 90,
      armor: 0,
      str: 25, flex: 40, speed: 30,
      reward: { xp: 400, money: 1000 },
      betMultiplier: 5.0,
      unlockFlag: 'daedalus_trust_known',
      lore: '"Toto je test. Neuráčaj sa — len analyzujem tvoje reakcie." — Daedalus. Klameš seba ak mu verš.',
      tactics: ['bleed', 'hack_stun', 'dodge', 'predict'],
      ai: function(es, ps) {
        // Daedalus predikuje tvoju akciu — mierne cheatuje
        var actions = ['bleed', 'hack_stun', 'dodge'];
        var last = ArenaState.lastPlayerAction;
        if (last === 'dodge') return 'hack_stun';
        if (last === 'heavy') return 'dodge';
        if (last === 'bleed') return 'strike';
        return actions[Math.floor(Math.random() * actions.length)];
      }
    },
  ];

  // Enemy akcie (pre AI výpočet)
  var ENEMY_ACTIONS = {
    strike:    function(es, ps) {
      var dmg = Math.max(1, (6 + Math.floor(es.str * 0.35)) - Math.floor(ps.armorCur * 0.3));
      return { dmg: dmg, effect: null, msg: 'Úder' };
    },
    heavy:     function(es, ps) {
      var miss = Math.random() < 0.15;
      if (miss) return { dmg: 0, effect: null, msg: 'Minul' };
      var dmg = Math.max(2, (14 + Math.floor(es.str * 0.6)) - Math.floor(ps.armorCur * 0.5));
      return { dmg: dmg, effect: null, msg: 'Ťažký úder' };
    },
    bleed:     function(es, ps) {
      var dmg = 4 + Math.floor(es.flex * 0.2);
      return { dmg: dmg, effect: 'bleed', msg: 'Bodnutie — krvácanie' };
    },
    dodge:     function(es, ps) {
      return { dmg: 0, effect: 'e_dodge', msg: 'Vyhol sa' };
    },
    hack_stun: function(es, ps) {
      var success = Math.random() < 0.45;
      if (!success) return { dmg: 2, effect: null, msg: 'Hack zlyhal' };
      return { dmg: 0, effect: 'p_stun', msg: 'Hack — omráčenie!' };
    },
    armor_up:  function(es, ps) {
      return { dmg: 0, effect: 'e_armor', msg: 'Aktivuje štít' };
    },
    enrage:    function(es, ps) {
      return { dmg: 0, effect: 'e_enrage', msg: 'ENRAGE — STR zdvojnásobená!' };
    },
    predict:   function(es, ps) {
      var dmg = 10 + Math.floor(es.flex * 0.4);
      return { dmg: dmg, effect: null, msg: 'Predikovaný pohyb — kontruje' };
    },
  };

  /* ══════════════════════════════════════════════════════
     §A3b. UPGRADE & LOOT DATA
  ══════════════════════════════════════════════════════ */

  // Upgrade karty — ponúknuté po výhre, hráč vyberá jednu
  var UPGRADES = [
    {
      id: 'str_boost',
      name: 'Svalová augmentácia',
      icon: '💪',
      desc: 'Subkutánne vlákna GEN-2. Zvyšuje silu úderov.',
      effect: '+3 STR',
      cost: 0,  // zadarmo (z odmien)
      apply: function(gs) { gs.str = (gs.str || 10) + 3; },
      preview: { stat: 'str', delta: 3 },
      minDifficulty: 'easy',
    },
    {
      id: 'flex_boost',
      name: 'Reflex chip',
      icon: '⚡',
      desc: 'Neurálny čip akceleruje motoriku. +3 FLEX.',
      effect: '+3 FLEX',
      cost: 0,
      apply: function(gs) { gs.flex = (gs.flex || 10) + 3; },
      preview: { stat: 'flex', delta: 3 },
      minDifficulty: 'easy',
    },
    {
      id: 'hp_boost',
      name: 'Regeneračné nano-boty',
      icon: '🩸',
      desc: 'Nano-boty opravujú tkanivo rýchlejšie. +20 MAX HP.',
      effect: '+20 Max HP',
      cost: 0,
      apply: function(gs) { gs.maxHp = (gs.maxHp || 100) + 20; gs.hp = Math.min(gs.hp || 50, gs.maxHp); },
      preview: { stat: 'hp', delta: 20 },
      minDifficulty: 'easy',
    },
    {
      id: 'hack_boost',
      name: 'Neural-hack rozhranie',
      icon: '💻',
      desc: 'Upgradovaný hack protokol. Zvyšuje efektivitu hackovania.',
      effect: '+5 HACK',
      cost: 0,
      apply: function(gs) { gs.hackStat = (gs.hackStat || 10) + 5; },
      preview: { stat: 'hack', delta: 5 },
      minDifficulty: 'medium',
    },
    {
      id: 'str_major',
      name: 'Titanové implantáty',
      icon: '🔩',
      desc: 'Kĺbové zosilnenie z tungsténovej zliatiny. Masívny nárast sily.',
      effect: '+6 STR',
      cost: 0,
      apply: function(gs) { gs.str = (gs.str || 10) + 6; },
      preview: { stat: 'str', delta: 6 },
      minDifficulty: 'hard',
    },
    {
      id: 'flex_major',
      name: 'Prediktívny pohyb',
      icon: '🌀',
      desc: 'DAEDALUS-odvozený algoritmus. Predvída pohyb súpera.',
      effect: '+6 FLEX',
      cost: 0,
      apply: function(gs) { gs.flex = (gs.flex || 10) + 6; },
      preview: { stat: 'flex', delta: 6 },
      minDifficulty: 'hard',
    },
    {
      id: 'hp_major',
      name: 'Biocell Matrix',
      icon: '❤️',
      desc: 'Organická bunková matrix zdvojnásobí kapacitu HP. Drahé. Stojí to za to.',
      effect: '+40 Max HP',
      cost: 0,
      apply: function(gs) { gs.maxHp = (gs.maxHp || 100) + 40; },
      preview: { stat: 'hp', delta: 40 },
      minDifficulty: 'boss',
    },
    {
      id: 'all_minor',
      name: 'Systémová kalibrácia',
      icon: '⚙️',
      desc: 'Celkové vyladenie všetkých augmentácií. Malý nárast všetkého.',
      effect: '+1 STR, +1 FLEX, +1 HACK, +5 HP',
      cost: 0,
      apply: function(gs) {
        gs.str = (gs.str || 10) + 1;
        gs.flex = (gs.flex || 10) + 1;
        gs.hackStat = (gs.hackStat || 10) + 1;
        gs.maxHp = (gs.maxHp || 100) + 5;
      },
      preview: { stat: 'str', delta: 1 },
      minDifficulty: 'easy',
    },
  ];

  // Loot pool — náhodné predmety/informácie po boji
  var LOOT_POOL = [
    { id: 'medkit',    icon: '💉', name: 'Med-kit GEN-1', desc: 'Núdzová sada. HP +20 okamžite.', rarity: 'common',
      apply: function(gs) { gs.hp = Math.min(gs.maxHp || 100, (gs.hp || 50) + 20); } },
    { id: 'credchip',  icon: '💳', name: 'Kredičný čip', desc: 'Prepálený kreditný čip. +50 ₿ bonus.', rarity: 'common',
      apply: function(gs) { gs.money = (gs.money || 0) + 50; } },
    { id: 'info_frag', icon: '📁', name: 'Dátový fragment', desc: 'Šifrovaný log. Možno niečo odhalí.', rarity: 'uncommon',
      apply: function(gs) { gs.flags = gs.flags || {}; gs.flags['arena_data_found'] = true; } },
    { id: 'stim',      icon: '💊', name: 'Combat Stim', desc: 'Adrenalínový booster. Budúci boj: +15% dmg.', rarity: 'uncommon',
      apply: function(gs) { gs.flags = gs.flags || {}; gs.flags['arena_stim_ready'] = true; } },
    { id: 'aug_part',  icon: '🔧', name: 'Aug komponent', desc: 'Náhradný diel. Možno niekde použiteľný.', rarity: 'rare',
      apply: function(gs) { gs.flags = gs.flags || {}; gs.flags['aug_part_' + Date.now()] = true; } },
    { id: 'black_key', icon: '🗝️', name: 'Čierny kľúč', desc: 'Prístupový kľúč neznámeho pôvodu. LAZARUS?', rarity: 'epic',
      apply: function(gs) { gs.flags = gs.flags || {}; gs.flags['black_key_found'] = true; } },
  ];

  // Pomocná funkcia — XP na ďalší level (exponenciálna krivka)
  function _xpForNextLevel(level) {
    return Math.floor(100 * Math.pow(1.45, level - 1));
  }

  // Výber upgradov pre danú obtiažnosť
  function _pickUpgrades(difficulty) {
    var diffOrder = ['easy', 'medium', 'hard', 'boss'];
    var diffIdx = diffOrder.indexOf(difficulty);
    var available = UPGRADES.filter(function(u) {
      return diffOrder.indexOf(u.minDifficulty) <= diffIdx;
    });
    // Shuffle
    for (var i = available.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = available[i]; available[i] = available[j]; available[j] = tmp;
    }
    return available.slice(0, 3);
  }

  // Výber lootu
  function _rollLoot(difficulty) {
    var diffOrder = ['easy', 'medium', 'hard', 'boss'];
    var diffIdx = diffOrder.indexOf(difficulty);
    var loot = [];
    // Základný loot — vždy
    if (Math.random() < 0.6 + diffIdx * 0.1) {
      loot.push(LOOT_POOL[Math.floor(Math.random() * 2)]); // common
    }
    // Uncommon / rare pri vyššej obtiažnosti
    if (diffIdx >= 1 && Math.random() < 0.5) {
      loot.push(LOOT_POOL[2 + Math.floor(Math.random() * 2)]);
    }
    if (diffIdx >= 2 && Math.random() < 0.35) {
      loot.push(LOOT_POOL[4]);
    }
    if (diffIdx >= 3 && Math.random() < 0.25) {
      loot.push(LOOT_POOL[5]);
    }
    return loot;
  }


  var ArenaState = {
    phase: 'roster',    // 'roster' | 'fight' | 'result' | 'reward'
    enemy: null,
    bet: 0,
    round: 0,
    playerFight: null,  // { hp, maxHp, stam, maxStam, armorCur, statuses, ... }
    enemyFight: null,
    cooldowns: {},
    lastPlayerAction: null,
    won: null,
    log: [],
    wins: 0,
    losses: 0,
    // Reward state
    rewardUpgrades: [],       // 3 upgrade karty ponúknuté
    rewardLoot: [],           // loot items získané
    rewardSelectedUpgrade: null, // id vybraného upgradu
    rewardApplied: false,     // či bol upgrade potvrdený
  };

  /* ══════════════════════════════════════════════════════
     §A5. Core engine
  ══════════════════════════════════════════════════════ */

  function _buildPlayerFight() {
    var gs = window.S || {};
    return {
      hp:       gs.hp || 50,
      maxHp:    Math.max(gs.hp || 50, 100),
      stam:     100,
      maxStam:  100,
      armorCur: 0,       // arena brnenie (nie HP)
      str:      gs.str || 10,
      flex:     gs.flex || 10,
      hackStat: gs.hackStat || 10,
      level:    gs.level || 1,
      statuses: {},      // { bleed: 3, stun: 1, dodge: 1, ... }
    };
  }

  function _buildEnemyFight(template) {
    return {
      id:       template.id,
      hp:       template.hp,
      maxHp:    template.maxHp,
      armor:    template.armor,
      str:      template.str,
      flex:     template.flex,
      speed:    template.speed,
      statuses: {},
      ai:       template.ai,
      tactics:  template.tactics,
      _enraged: false,
      _usedArmorUp: false,
    };
  }

  function _logLine(msg, cls) {
    ArenaState.log.push({ msg: msg, cls: cls || 'system' });
    _refreshLog();
  }

  function _tickStatuses(fighter, isPlayer) {
    var msgs = [];
    var st = fighter.statuses;

    // Krvácanie
    if (st.bleed > 0) {
      var bdmg = 5;
      fighter.hp = Math.max(0, fighter.hp - bdmg);
      st.bleed--;
      msgs.push({ msg: (isPlayer ? 'Krvácaním: −' : 'Súper krváca: −') + bdmg + ' HP', cls: isPlayer ? 'hit-e' : 'hit-p' });
    }
    // Omráčenie vyprší
    if (st.stun > 0) { st.stun--; }
    // Dodge vyprší
    if (st.dodge > 0) { st.dodge--; }
    // Enemy dodge
    if (st.e_dodge > 0) { st.e_dodge--; }
    // Regen
    if (st.regen > 0) {
      var ramt = 8;
      fighter.hp = Math.min(fighter.maxHp, fighter.hp + ramt);
      st.regen--;
      msgs.push({ msg: 'Regen: +' + ramt + ' HP', cls: 'hit-p' });
    }

    return msgs;
  }

  function _applyEffect(effect, target, source, amt) {
    var t = target.statuses;
    switch (effect) {
      case 'stun':    t.stun  = (t.stun  || 0) + 1; break;
      case 'bleed':   t.bleed = (t.bleed || 0) + 3; break;
      case 'dodge':   target.statuses.dodge = 2; break;
      case 'blind':   t.blind = (t.blind || 0) + 2; break;
      case 'heal':    target.hp = Math.min(target.maxHp, target.hp + (amt || 25)); break;
      case 'regen':   t.regen = (t.regen || 0) + 3; break;
      case 'e_dodge': target.statuses.e_dodge = 1; break;
      case 'e_armor': target.armor = Math.min(60, target.armor + 15); break;
      case 'e_enrage':target.str = Math.floor(target.str * 1.7); break;
      case 'p_stun':  source.statuses.stun = (source.statuses.stun || 0) + 1; break;
    }
  }

  function _doPlayerTurn(actionId) {
    if (ArenaState.phase !== 'fight') return;
    var ps = ArenaState.playerFight;
    var es = ArenaState.enemyFight;
    var act = PLAYER_ACTIONS.find(function(a){ return a.id === actionId; });
    if (!act) return;

    // Cooldown check
    var cd = ArenaState.cooldowns[actionId] || 0;
    if (cd > 0) return;

    // Stun check
    if (ps.statuses.stun > 0) {
      _logLine('// Omráčený — kolo preskočené //', 'miss');
      _doEnemyTurn();
      return;
    }

    // Stamina check
    if (ps.stam < Math.abs(act.cost || 0)) {
      _logLine('// Nedostatok staminy //', 'miss');
      return;
    }

    ArenaState.lastPlayerAction = actionId;
    ArenaState.round++;

    // Tick statuses at start of round
    var sTicks = _tickStatuses(ps, true).concat(_tickStatuses(es, false));
    sTicks.forEach(function(l){ _logLine(l.msg, l.cls); });

    // Player action
    var result = act.fn(ps, es);

    // Stam update
    ps.stam = Math.max(0, Math.min(ps.maxStam, ps.stam + (result.stam || 0)));

    // Apply player damage / effect
    if (!result.miss) {
      if (result.dmg > 0) {
        // Dodge check — enemy
        if (es.statuses.e_dodge > 0) {
          _logLine('Súper sa vyhol!', 'miss');
        } else {
          es.hp = Math.max(0, es.hp - result.dmg);
          var cls = result.crit ? 'crit' : 'hit-p';
          _logLine((result.crit ? '⚡ KRIT! ' : '') + result.msg + ': −' + result.dmg + ' HP', cls);
          _floatDmg(result.dmg, 'enemy-hit', result.crit);
        }
      }
      if (result.effect) {
        _applyEffect(result.effect, es, ps, result.healAmt);
        if (result.effect === 'heal') {
          _logLine(result.msg, 'hit-p');
          _floatDmg('+' + result.healAmt, 'player-hit', false, true);
        } else if (result.effect === 'dodge') {
          _logLine(result.msg, 'system');
        } else {
          _logLine(result.msg, 'hit-p');
        }
      }
      if (result.msg && !result.effect && result.dmg === 0) {
        _logLine(result.msg, 'miss');
      }
    } else {
      _logLine('// ' + result.msg + ' //', 'miss');
      _floatDmg('MISS', 'miss');
    }

    // Set cooldown
    if (act.cooldown > 0) ArenaState.cooldowns[actionId] = act.cooldown + 1;

    // Tick cooldowns
    Object.keys(ArenaState.cooldowns).forEach(function(k){
      if (ArenaState.cooldowns[k] > 0) ArenaState.cooldowns[k]--;
    });

    // Check enemy dead
    if (es.hp <= 0) {
      _endFight(true);
      return;
    }

    // Enemy turn
    _doEnemyTurn();

    _refreshFightUI();
    _checkFightEnd();
  }

  function _doEnemyTurn() {
    var ps = ArenaState.playerFight;
    var es = ArenaState.enemyFight;

    // Enemy stun
    if (es.statuses.stun > 0) {
      _logLine('// Súper omráčený — preskakuje //', 'system');
      return;
    }

    // Pick AI action
    var aiActionId = es.ai(es, ps);
    var eact = ENEMY_ACTIONS[aiActionId] || ENEMY_ACTIONS.strike;
    var eresult = eact(es, ps);

    if (eresult.dmg > 0) {
      // Player dodge check
      if (ps.statuses.dodge > 0) {
        _logLine('Vyhol si sa útoku súpera!', 'hit-p');
        ps.statuses.dodge--;
        return;
      }
      // Player blind penalty
      var missChance = ps.statuses.blind ? 0.35 : 0;
      if (Math.random() < missChance) {
        _logLine('// Súper minul (blind) //', 'miss');
        return;
      }
      ps.hp = Math.max(0, ps.hp - eresult.dmg);
      _logLine('Súper: ' + eresult.msg + ' — −' + eresult.dmg + ' HP', 'hit-e');
      _floatDmg(eresult.dmg, 'player-hit');
    }

    if (eresult.effect) {
      _applyEffect(eresult.effect, es, ps, 0);
      _logLine('Súper: ' + eresult.msg, 'system');
    }

    if (!eresult.dmg && !eresult.effect) {
      _logLine('Súper: ' + eresult.msg, 'miss');
    }

    // Tick blind
    if (ps.statuses.blind > 0) ps.statuses.blind--;
  }

  function _checkFightEnd() {
    var ps = ArenaState.playerFight;
    var es = ArenaState.enemyFight;
    if (ps.hp <= 0) { _endFight(false); return; }
    if (es.hp <= 0) { _endFight(true);  return; }
  }

  function _endFight(won) {
    ArenaState.phase = 'result';
    ArenaState.won   = won;

    var enemy = ArenaState.enemy;
    var bet   = ArenaState.bet;
    var gs    = window.S;

    if (won) {
      ArenaState.wins++;
      var xpGain    = enemy.reward.xp;
      var moneyGain = enemy.reward.money + Math.floor(bet * enemy.betMultiplier);

      // Apply money immediately
      if (gs) { gs.money = (gs.money || 0) + moneyGain; }
      if (typeof window.Renderer !== 'undefined' && Renderer.updateMoney) Renderer.updateMoney();
      if (typeof window.addLog   === 'function') addLog('Aréna: Výhra vs ' + enemy.name + '. +' + xpGain + 'XP, +₿' + moneyGain, 'ok');
      if (typeof window.showNotif === 'function') showNotif('⚔ Výhra! +₿' + moneyGain + ' · +' + xpGain + ' XP');

      // Store win flag
      if (gs) { gs.flags = gs.flags || {}; gs.flags['arena_win_' + enemy.id] = true; }

      // Roll loot & upgrades — show reward screen
      ArenaState.rewardUpgrades = _pickUpgrades(enemy.difficulty);
      ArenaState.rewardLoot     = _rollLoot(enemy.difficulty);
      ArenaState.rewardSelectedUpgrade = null;
      ArenaState.rewardApplied  = false;

      // Apply loot immediately (passive items)
      ArenaState.rewardLoot.forEach(function(item) {
        if (gs && item.apply) item.apply(gs);
      });

      _showResult(true, '+' + xpGain + ' XP   +₿' + moneyGain);

      // After short delay, open reward overlay
      setTimeout(function() {
        _openRewardScreen(xpGain, moneyGain, enemy);
      }, 1200);

    } else {
      ArenaState.losses++;
      var hpPenalty  = 15;
      var moneyLoss  = Math.floor(bet * 0.5);
      if (gs) {
        gs.hp    = Math.max(1, (gs.hp || 0) - hpPenalty);
        gs.money = Math.max(0, (gs.money || 0) - moneyLoss);
      }
      if (typeof window.Renderer !== 'undefined') {
        if (Renderer.updateStats) Renderer.updateStats();
        if (Renderer.updateMoney) Renderer.updateMoney();
      }
      if (typeof window.addLog === 'function') addLog('Aréna: Prehra vs ' + enemy.name + '. HP −' + hpPenalty + ', ₿ −' + moneyLoss, 'warn');
      _showResult(false, 'HP −' + hpPenalty + '   ₿ −' + moneyLoss);
    }
  }

  /* ══════════════════════════════════════════════════════
     §A5b. REWARD SCREEN
  ══════════════════════════════════════════════════════ */

  function _openRewardScreen(xpGain, moneyGain, enemy) {
    var overlay = document.getElementById('arena-reward-overlay');
    if (!overlay) return;

    var gs = window.S || {};
    var currentXp = gs.xp || 0;
    var currentLevel = gs.level || 1;
    var xpBefore = currentXp;

    // Apply XP now
    var leveledUp = false;
    var newLevel = currentLevel;
    if (typeof window.gainXP === 'function') {
      gainXP(xpGain);
    } else if (gs) {
      gs.xp = (gs.xp || 0) + xpGain;
    }
    var xpAfter = gs.xp || 0;
    if (gs.level && gs.level > currentLevel) {
      leveledUp = true;
      newLevel = gs.level;
    }

    // Build HTML
    var lootHtml = ArenaState.rewardLoot.length
      ? ArenaState.rewardLoot.map(function(item) {
          return '<div class="loot-item">' +
            '<div class="loot-item-icon">' + item.icon + '</div>' +
            '<div class="loot-item-info">' +
              '<div class="loot-item-name">' + item.name + '</div>' +
              '<div class="loot-item-desc">' + item.desc + '</div>' +
            '</div>' +
            '<div class="loot-item-rarity rarity-' + item.rarity + '">' + item.rarity.toUpperCase() + '</div>' +
          '</div>';
        }).join('')
      : '<div style="font-size:9px;color:var(--text-muted);letter-spacing:1px">// Žiadny loot //' + '</div>';

    var xpForNext = _xpForNextLevel(leveledUp ? newLevel : currentLevel);
    var xpBarOldPct = Math.min(100, (xpBefore / xpForNext) * 100);
    var xpBarNewPct = Math.min(100, (xpAfter  / xpForNext) * 100);
    if (leveledUp) { xpBarOldPct = 0; xpBarNewPct = Math.min(100, ((xpAfter - 0) / _xpForNextLevel(newLevel)) * 100); }

    var upgradeHtml = ArenaState.rewardUpgrades.map(function(u) {
      return '<div class="upgrade-card" id="upg-' + u.id + '" onclick="ArenaSystem.selectUpgrade(\'' + u.id + '\')">' +
        '<div class="upgrade-card-header">' +
          '<div class="upgrade-card-icon">' + u.icon + '</div>' +
          '<div class="upgrade-card-name">' + u.name + '</div>' +
        '</div>' +
        '<div class="upgrade-card-desc">' + u.desc + '</div>' +
        '<div class="upgrade-card-effect">' + u.effect + '</div>' +
      '</div>';
    }).join('');

    // Current stats
    var statRows = [
      { label: 'STR',  val: gs.str || 10,      max: 60, cls: 'str',  key: 'str' },
      { label: 'FLEX', val: gs.flex || 10,     max: 60, cls: 'flex', key: 'flex' },
      { label: 'HACK', val: gs.hackStat || 10, max: 60, cls: 'hack', key: 'hackStat' },
      { label: 'MAX HP',val: gs.maxHp || 100,  max: 300, cls: 'hp',  key: 'maxHp' },
    ].map(function(r) {
      return '<div class="stat-mini-row">' +
        '<div class="stat-mini-label">' + r.label + '</div>' +
        '<div class="stat-mini-bar-wrap"><div class="stat-mini-bar ' + r.cls + '" id="statbar-' + r.key + '" style="width:' + Math.min(100,(r.val/r.max)*100) + '%"></div></div>' +
        '<div class="stat-mini-val" id="statval-' + r.key + '">' + r.val + '</div>' +
        '<div class="stat-mini-delta" id="statdelta-' + r.key + '"></div>' +
      '</div>';
    }).join('');

    overlay.innerHTML =
      '<div id="reward-header">' +
        '<div id="reward-title">// POST-FIGHT ODMENA //</div>' +
        '<div id="reward-enemy-badge">VS. ' + enemy.name.toUpperCase() + ' · ' + enemy.faction.toUpperCase() + '</div>' +
      '</div>' +

      '<div id="reward-body">' +

        // LEFT
        '<div id="reward-left">' +

          // Summary
          '<div class="reward-section-label">VÝSLEDKY ZÁPASU</div>' +
          '<div id="reward-summary">' +
            '<div class="reward-summary-row"><span class="reward-summary-label">XP ZÍSKANÉ</span><span class="reward-summary-val green">+' + xpGain + ' XP</span></div>' +
            '<div class="reward-summary-row"><span class="reward-summary-label">KREDITY</span><span class="reward-summary-val">+₿' + moneyGain + '</span></div>' +
            '<div class="reward-summary-row"><span class="reward-summary-label">STÁVKA</span><span class="reward-summary-val">' + (bet > 0 ? '₿' + bet + ' × ' + enemy.betMultiplier : '—') + '</span></div>' +
            '<div class="reward-summary-row"><span class="reward-summary-label">KOLÁ</span><span class="reward-summary-val">' + ArenaState.round + '</span></div>' +
          '</div>' +

          // XP bar
          '<div class="reward-section-label">PROGRES — LEVEL ' + (leveledUp ? newLevel : currentLevel) + '</div>' +
          '<div id="reward-xp-section">' +
            '<div class="reward-xp-label">' +
              '<span>XP: ' + xpAfter + '</span>' +
              '<span>NEXT: ' + xpForNext + '</span>' +
            '</div>' +
            '<div class="reward-xp-bar-wrap">' +
              '<div class="reward-xp-bar-old" id="reward-xpbar-old" style="width:' + xpBarOldPct + '%"></div>' +
              '<div class="reward-xp-bar-gain" id="reward-xpbar-gain" style="width:' + xpBarOldPct + '%"></div>' +
            '</div>' +
          '</div>' +

          // Level up
          '<div id="reward-levelup" class="' + (leveledUp ? 'show' : '') + '">' +
            '<div id="reward-levelup-text">⚡ LEVEL UP — ' + newLevel + ' ⚡</div>' +
            '<div id="reward-levelup-sub">Augmentácie odomknuté · Štatistiky zvýšené</div>' +
          '</div>' +

          // Loot
          '<div class="reward-section-label">LOOT</div>' +
          '<div id="reward-loot">' + lootHtml + '</div>' +

        '</div>' + // /reward-left

        // RIGHT — upgrades
        '<div id="reward-right">' +

          '<div class="reward-section-label">ŠTATISTIKY POSTAVY</div>' +
          '<div id="reward-current-stats">' + statRows + '</div>' +

          '<div class="reward-section-label" style="margin-top:4px">VYBER UPGRADE</div>' +
          '<div style="font-size:8px;color:var(--text-muted);letter-spacing:1px;margin-bottom:8px">// Vyber jedno vylepšenie postavy. Nezvratné. //</div>' +
          '<div id="reward-upgrades">' + upgradeHtml + '</div>' +

          '<button id="reward-upgrade-confirm" onclick="ArenaSystem.confirmUpgrade()">✓ POTVRDIŤ UPGRADE</button>' +

          '<div id="reward-footer">' +
            '<button class="reward-footer-btn" onclick="ArenaSystem.closeReward()">↵ Späť do arény</button>' +
            '<button class="reward-footer-btn primary" onclick="ArenaSystem.closeRewardToMap()">✕ Zavrieť</button>' +
          '</div>' +

        '</div>' + // /reward-right

      '</div>'; // /reward-body

    overlay.classList.add('show');

    // Animate XP bar after short delay
    setTimeout(function() {
      var gainBar = document.getElementById('reward-xpbar-gain');
      if (gainBar) {
        gainBar.style.width = xpBarNewPct + '%';
        gainBar.classList.add('anim');
      }
    }, 300);
  }

  function _updateStatPreviews(upgradeId) {
    var gs = window.S || {};
    // Reset all
    ['str','flex','hackStat','maxHp'].forEach(function(k) {
      var valEl = document.getElementById('statval-' + k);
      var deltaEl = document.getElementById('statdelta-' + k);
      if (valEl) { valEl.textContent = gs[k] || (k === 'maxHp' ? 100 : 10); valEl.classList.remove('upgraded'); }
      if (deltaEl) deltaEl.textContent = '';
    });

    if (!upgradeId) return;
    var upg = UPGRADES.find(function(u){ return u.id === upgradeId; });
    if (!upg || !upg.preview) return;

    var k = upg.preview.stat === 'hp' ? 'maxHp' : (upg.preview.stat === 'hack' ? 'hackStat' : upg.preview.stat);
    var valEl = document.getElementById('statval-' + k);
    var deltaEl = document.getElementById('statdelta-' + k);
    if (valEl) {
      valEl.textContent = (gs[k] || (k === 'maxHp' ? 100 : 10)) + upg.preview.delta;
      valEl.classList.add('upgraded');
    }
    if (deltaEl) deltaEl.textContent = '+' + upg.preview.delta;
  }



  /* ══════════════════════════════════════════════════════
     §A6. UI Renderer
  ══════════════════════════════════════════════════════ */

  function _renderRoster() {
    var gs = window.S || {};
    var flags = gs.flags || {};
    var html = '';

    ENEMIES.forEach(function(e) {
      var locked = e.unlockFlag && !flags[e.unlockFlag];
      var diffClass = 'diff-' + e.difficulty;
      var diffLabel = { easy: 'ĽAHKÝ', medium: 'STREDNÝ', hard: 'ŤAŽKÝ', boss: '// BOSS //' }[e.difficulty] || e.difficulty.toUpperCase();

      html += '<div class="roster-card ' + (locked ? 'locked' : '') + '" ' +
        (!locked ? 'onclick="ArenaSystem.startFight(\'' + e.id + '\')"' : '') + '>' +
        '<img class="roster-card-portrait" src="' + e.portrait + '" alt="' + e.name + '" onerror="this.style.display=\'none\'">' +
        '<div class="roster-card-info">' +
          '<div class="roster-card-name">' + e.name + '</div>' +
          '<div class="roster-card-sub">' + e.faction + ' · ' + e.title + '</div>' +
          '<div class="roster-card-sub" style="margin-top:3px;font-style:italic;color:var(--text-muted)">' +
            (locked ? '🔒 Odomkni v príbehu' : e.lore.substring(0, 55) + '…') +
          '</div>' +
        '</div>' +
        '<div class="roster-card-diff ' + diffClass + '">' + diffLabel + '</div>' +
        '</div>';
    });

    var rosterEl = document.getElementById('arena-roster');
    if (rosterEl) rosterEl.innerHTML = html;

    // Switch panels
    var fightPanel = document.getElementById('arena-fight-content');
    var rosterPanel = document.getElementById('arena-roster-content');
    if (fightPanel)  fightPanel.style.display  = 'none';
    if (rosterPanel) rosterPanel.style.display = 'flex';

    // Update stats
    _updateFightStats();
  }

  function _renderFight() {
    var fightPanel  = document.getElementById('arena-fight-content');
    var rosterPanel = document.getElementById('arena-roster-content');
    if (fightPanel)  fightPanel.style.display  = 'flex';
    if (rosterPanel) rosterPanel.style.display = 'none';

    _refreshFightUI();
    _updateActionButtons();
  }

  function _refreshFightUI() {
    var ps = ArenaState.playerFight;
    var es = ArenaState.enemyFight;
    if (!ps || !es) return;

    // Player bars
    _setBar('arena-p-hp-bar',    ps.hp,       ps.maxHp);
    _setVal('arena-p-hp-val',    ps.hp + '/' + ps.maxHp);
    _setBar('arena-p-stam-bar',  ps.stam,     ps.maxStam);
    _setVal('arena-p-stam-val',  Math.floor(ps.stam));
    _setBar('arena-p-armor-bar', ps.armorCur, 50);
    _setVal('arena-p-armor-val', Math.floor(ps.armorCur));
    _setStatuses('arena-p-statuses', ps.statuses);

    // Enemy bars
    _setBar('arena-e-hp-bar',    es.hp,    es.maxHp);
    _setVal('arena-e-hp-val',    es.hp + '/' + es.maxHp);
    _setBar('arena-e-armor-bar', es.armor, 60);
    _setVal('arena-e-armor-val', Math.floor(es.armor));
    _setStatuses('arena-e-statuses', es.statuses);

    // Round counter
    var roundEl = document.getElementById('arena-round-num');
    if (roundEl) roundEl.textContent = 'KOLO ' + ArenaState.round;

    _updateActionButtons();
  }

  function _setBar(id, cur, max) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.width = Math.max(0, Math.min(100, (cur / max) * 100)) + '%';
  }

  function _setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function _setStatuses(id, statuses) {
    var el = document.getElementById(id);
    if (!el) return;
    var html = '';
    var labels = {
      stun: ['STUN', 'stun'], bleed: ['BLEED', 'bleed'], dodge: ['DODGE', 'armor'],
      regen: ['REGEN', 'regen'], blind: ['BLIND', 'stun'], e_dodge: ['DODGE', 'armor'],
      e_enrage: ['ENRAGE', 'enrage']
    };
    Object.keys(statuses).forEach(function(k) {
      if (!statuses[k]) return;
      var l = labels[k] || [k.toUpperCase(), 'system'];
      html += '<span class="status-chip ' + l[1] + '">' + l[0] + (statuses[k] > 1 ? ' ×' + statuses[k] : '') + '</span>';
    });
    el.innerHTML = html;
  }

  function _updateActionButtons() {
    PLAYER_ACTIONS.forEach(function(act) {
      var btn = document.getElementById('arena-act-' + act.id);
      if (!btn) return;
      var cd  = ArenaState.cooldowns[act.id] || 0;
      var ps  = ArenaState.playerFight;
      var stamOk = ps && ps.stam >= Math.abs(act.cost || 0);
      btn.disabled = cd > 0 || !stamOk || ArenaState.phase !== 'fight';
      if (cd > 0) {
        btn.classList.add('cooldown');
        btn.querySelector('.act-desc').textContent = 'Cooldown: ' + cd + ' kolo';
      } else {
        btn.classList.remove('cooldown');
        btn.querySelector('.act-desc').textContent = act.desc;
      }
    });
  }

  function _refreshLog() {
    var wrap = document.getElementById('arena-log-wrap');
    if (!wrap) return;
    var last = ArenaState.log.slice(-40);
    wrap.innerHTML = last.map(function(l) {
      return '<div class="arena-log-line ' + l.cls + '">' + _escH(l.msg) + '</div>';
    }).join('');
    wrap.scrollTop = wrap.scrollHeight;
  }

  function _updateFightStats() {
    var winsEl   = document.getElementById('arena-stat-wins');
    var lossesEl = document.getElementById('arena-stat-losses');
    if (winsEl)   winsEl.textContent   = ArenaState.wins;
    if (lossesEl) lossesEl.textContent = ArenaState.losses;
  }

  function _floatDmg(val, cls, crit, isHeal) {
    // Float over the appropriate fighter card
    var targetId = cls === 'enemy-hit' ? 'arena-enemy-card' : 'arena-player-card';
    var target = document.getElementById(targetId);
    if (!target) return;
    var span = document.createElement('span');
    span.className = 'dmg-float ' + cls;
    span.textContent = (isHeal ? '+' : (typeof val === 'number' ? '-' : '')) + val;
    if (crit) span.style.color = '#fbbf24';
    target.style.position = 'relative';
    target.appendChild(span);
    setTimeout(function(){ if (span.parentNode) span.parentNode.removeChild(span); }, 950);
  }

  function _showResult(won, subtitle) {
    var overlay = document.getElementById('arena-result-overlay');
    var title   = document.getElementById('arena-result-title');
    var sub     = document.getElementById('arena-result-sub');
    if (!overlay || !title) return;
    title.className = won ? 'win' : 'lose';
    title.textContent = won ? '// VÝHRA //' : '// PREHRA //';
    if (sub) sub.textContent = subtitle || '';
    overlay.classList.add('show');
    _updateFightStats();
  }

  function _updateBetDisplay() {
    var el = document.getElementById('arena-bet-val');
    if (el) el.textContent = '₿ ' + ArenaState.bet;
  }

  function _escH(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ══════════════════════════════════════════════════════
     §A2. HTML inject (volaný pri prvom open())
  ══════════════════════════════════════════════════════ */
  var _injected = false;

  function _inject() {
    if (_injected) return;
    _injected = true;

    // CSS
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // HTML overlay
    var div = document.createElement('div');
    div.id = 'arena-overlay';
    div.innerHTML = `
      <!-- Header -->
      <div id="arena-header">
        <div id="arena-title">⚔ ARÉNA // PODZEMNÝ RING</div>
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:9px;letter-spacing:2px;color:var(--text-muted)">
            W:<span id="arena-stat-wins">0</span>
            &nbsp;L:<span id="arena-stat-losses">0</span>
          </div>
          <button id="arena-close-btn" onclick="ArenaSystem.close()">✕ ZAVRIEŤ</button>
        </div>
      </div>

      <!-- Body -->
      <div id="arena-body">

        <!-- Ľavý panel: súboj -->
        <div id="arena-fight-panel">

          <!-- Výber súpera -->
          <div id="arena-roster-content" style="display:flex;flex-direction:column;gap:14px">
            <div class="arena-section-label">VÝBER PROTIVNÍKA</div>
            <div id="arena-roster"></div>
            <!-- Bet -->
            <div id="arena-bet-row">
              <span class="bet-label">STÁVKA</span>
              <button class="bet-btn" onclick="ArenaSystem.setBet(-50)">−50</button>
              <button class="bet-btn" onclick="ArenaSystem.setBet(-10)">−10</button>
              <div id="arena-bet-val">₿ 0</div>
              <button class="bet-btn" onclick="ArenaSystem.setBet(+10)">+10</button>
              <button class="bet-btn" onclick="ArenaSystem.setBet(+50)">+50</button>
              <button class="bet-btn" onclick="ArenaSystem.setBet(+100)">+100</button>
            </div>
          </div>

          <!-- Aktívny súboj -->
          <div id="arena-fight-content" style="display:none;flex-direction:column;gap:14px;position:relative">

            <!-- Result overlay (absolute over fight) -->
            <div id="arena-result-overlay">
              <div id="arena-result-title">// VÝHRA //</div>
              <div id="arena-result-sub"></div>
              <div style="display:flex;gap:10px">
                <button class="arena-result-btn" onclick="ArenaSystem.backToRoster()">⟵ Roster</button>
                <button class="arena-result-btn" onclick="ArenaSystem.rematch()" style="border-color:var(--gold);color:var(--gold)">↺ Znova</button>
              </div>
            </div>

            <!-- Round info -->
            <div class="arena-section-label" id="arena-round-num">KOLO 0</div>

            <!-- Fighters -->
            <div id="arena-fighters">
              <!-- Player -->
              <div class="arena-fighter player" id="arena-player-card">
                <div class="fighter-name">// TY //</div>
                <div class="arena-stat-row">
                  <span class="arena-stat-label">HP</span>
                  <div class="arena-bar-wrap"><div class="arena-bar hp" id="arena-p-hp-bar" style="width:100%"></div></div>
                  <span class="arena-stat-val" id="arena-p-hp-val">100/100</span>
                </div>
                <div class="arena-stat-row">
                  <span class="arena-stat-label">STAM</span>
                  <div class="arena-bar-wrap"><div class="arena-bar stam" id="arena-p-stam-bar" style="width:100%"></div></div>
                  <span class="arena-stat-val" id="arena-p-stam-val">100</span>
                </div>
                <div class="arena-stat-row">
                  <span class="arena-stat-label">ARMOR</span>
                  <div class="arena-bar-wrap"><div class="arena-bar armor" id="arena-p-armor-bar" style="width:0%"></div></div>
                  <span class="arena-stat-val" id="arena-p-armor-val">0</span>
                </div>
                <div class="fighter-status-row" id="arena-p-statuses"></div>
              </div>

              <!-- VS -->
              <div id="arena-vs-badge">
                <div class="arena-vs-text">VS</div>
                <div class="arena-round-badge" id="arena-round-num-2"></div>
              </div>

              <!-- Enemy -->
              <div class="arena-fighter enemy" id="arena-enemy-card">
                <div class="fighter-name" id="arena-enemy-name">SÚPER</div>
                <img class="fighter-portrait" id="arena-enemy-portrait" src="" alt="súper">
                <div class="arena-stat-row">
                  <span class="arena-stat-label">HP</span>
                  <div class="arena-bar-wrap"><div class="arena-bar hp" id="arena-e-hp-bar" style="width:100%"></div></div>
                  <span class="arena-stat-val" id="arena-e-hp-val">100/100</span>
                </div>
                <div class="arena-stat-row">
                  <span class="arena-stat-label">ARMOR</span>
                  <div class="arena-bar-wrap"><div class="arena-bar armor" id="arena-e-armor-bar" style="width:0%"></div></div>
                  <span class="arena-stat-val" id="arena-e-armor-val">0</span>
                </div>
                <div class="fighter-status-row" id="arena-e-statuses"></div>
              </div>
            </div>

            <!-- Fight stats -->
            <div id="arena-fight-stats">
              <div class="fight-stat-item">
                <span class="fight-stat-val" id="arena-stat-wins-f">0</span>
                <span style="font-size:9px">VÝHRY</span>
              </div>
              <div class="fight-stat-item">
                <span class="fight-stat-val" id="arena-stat-losses-f">0</span>
                <span style="font-size:9px">PREHRY</span>
              </div>
              <div class="fight-stat-item">
                <span class="fight-stat-val" id="arena-stat-round">0</span>
                <span style="font-size:9px">KOLO</span>
              </div>
            </div>

            <!-- Akcie hráča -->
            <div class="arena-section-label">AKCIE</div>
            <div id="arena-actions">
              ${PLAYER_ACTIONS.map(function(act){
                return '<button class="arena-action-btn" id="arena-act-' + act.id + '" onclick="ArenaSystem.doAction(\'' + act.id + '\')">' +
                  '<span class="act-name">' + act.name + '</span>' +
                  '<span class="act-desc">' + act.desc + '</span>' +
                  '</button>';
              }).join('')}
            </div>

          </div><!-- /arena-fight-content -->

        </div><!-- /arena-fight-panel -->

        <!-- Pravý panel: log -->
        <div id="arena-side-panel">
          <div style="padding:10px 12px 6px;border-bottom:1px solid var(--border2);flex-shrink:0">
            <div class="arena-section-label" style="border:none;margin:0;padding:0">BOJOVÝ LOG</div>
          </div>
          <div id="arena-log-wrap">
            <div class="arena-log-line system">// Vyber protivníka a začni zápas //</div>
          </div>
        </div>

      </div><!-- /arena-body -->
    `;
    document.body.appendChild(div);

    // Reward overlay (separate, higher z-index)
    var rewardDiv = document.createElement('div');
    rewardDiv.id = 'arena-reward-overlay';
    document.body.appendChild(rewardDiv);
  }

  /* ══════════════════════════════════════════════════════
     §A7. Public API
  ══════════════════════════════════════════════════════ */
  return {

    open: function() {
      _inject();
      var overlay = document.getElementById('arena-overlay');
      if (overlay) overlay.classList.add('show');
      ArenaState.phase = 'roster';
      _renderRoster();
      _logLine('// Aréna otvorená. Vyber protivníka. //', 'system');
    },

    close: function() {
      var overlay = document.getElementById('arena-overlay');
      if (overlay) overlay.classList.remove('show');
      // Sync HP back to game
      var gs = window.S;
      if (gs && ArenaState.playerFight) {
        // HP changes already applied in _endFight
      }
    },

    startFight: function(enemyId) {
      var template = ENEMIES.find(function(e){ return e.id === enemyId; });
      if (!template) return;

      // Check locked
      var flags = (window.S && window.S.flags) || {};
      if (template.unlockFlag && !flags[template.unlockFlag]) return;

      // Check bet vs money
      var gs = window.S || {};
      if (ArenaState.bet > 0 && (gs.money || 0) < ArenaState.bet) {
        if (typeof showNotif === 'function') showNotif('Nedostatok kreditov na stávku!');
        return;
      }

      // Deduct bet
      if (ArenaState.bet > 0 && gs.money !== undefined) {
        gs.money -= ArenaState.bet;
        if (typeof Renderer !== 'undefined' && Renderer.updateMoney) Renderer.updateMoney();
      }

      ArenaState.enemy       = template;
      ArenaState.phase       = 'fight';
      ArenaState.round       = 0;
      ArenaState.cooldowns   = {};
      ArenaState.lastPlayerAction = null;
      ArenaState.playerFight = _buildPlayerFight();
      ArenaState.enemyFight  = _buildEnemyFight(template);
      ArenaState.log         = [];

      // Update enemy UI
      var nameEl = document.getElementById('arena-enemy-name');
      var portEl = document.getElementById('arena-enemy-portrait');
      if (nameEl) nameEl.textContent = template.name + ' // ' + template.faction;
      if (portEl) portEl.src = template.portrait;

      // Hide result overlay
      var res = document.getElementById('arena-result-overlay');
      if (res) res.classList.remove('show');

      _logLine('⚔ ZÁPAS: ' + template.name + ' vs. Ty', 'system');
      _logLine('// ' + template.lore + ' //', 'miss');
      _logLine('Stávka: ₿' + ArenaState.bet, 'system');

      _renderFight();
    },

    doAction: function(actionId) {
      if (ArenaState.phase !== 'fight') return;
      _doPlayerTurn(actionId);
    },

    backToRoster: function() {
      ArenaState.phase = 'roster';
      var res = document.getElementById('arena-result-overlay');
      if (res) res.classList.remove('show');
      _renderRoster();
      _logLine('// Späť na roster //', 'system');
    },

    rematch: function() {
      if (!ArenaState.enemy) { this.backToRoster(); return; }
      this.startFight(ArenaState.enemy.id);
    },

    setBet: function(delta) {
      var gs = window.S || {};
      var maxBet = gs.money || 0;
      ArenaState.bet = Math.max(0, Math.min(maxBet, ArenaState.bet + delta));
      _updateBetDisplay();
    },

    selectUpgrade: function(upgradeId) {
      if (ArenaState.rewardApplied) return;

      ArenaState.rewardSelectedUpgrade = upgradeId;

      // Visual feedback — mark selected card
      ArenaState.rewardUpgrades.forEach(function(u) {
        var card = document.getElementById('upg-' + u.id);
        if (card) card.classList.toggle('selected', u.id === upgradeId);
      });

      // Show confirm button
      var btn = document.getElementById('reward-upgrade-confirm');
      if (btn) btn.classList.add('show');

      // Preview stat changes
      _updateStatPreviews(upgradeId);
    },

    confirmUpgrade: function() {
      if (ArenaState.rewardApplied) return;
      var upgradeId = ArenaState.rewardSelectedUpgrade;
      if (!upgradeId) return;

      var upg = UPGRADES.find(function(u){ return u.id === upgradeId; });
      if (!upg) return;

      var gs = window.S;
      if (gs && upg.apply) upg.apply(gs);

      ArenaState.rewardApplied = true;

      // Lock all cards
      ArenaState.rewardUpgrades.forEach(function(u) {
        var card = document.getElementById('upg-' + u.id);
        if (card && u.id !== upgradeId) { card.classList.add('used'); }
      });

      // Disable confirm btn
      var btn = document.getElementById('reward-upgrade-confirm');
      if (btn) { btn.textContent = '✓ UPGRADE APLIKOVANÝ'; btn.disabled = true; }

      // Refresh renderer
      if (typeof window.Renderer !== 'undefined') {
        if (Renderer.updateStats) Renderer.updateStats();
        if (Renderer.updateMoney) Renderer.updateMoney();
      }

      // Confirm stat preview
      _updateStatPreviews(upgradeId);

      if (typeof window.showNotif === 'function') showNotif('✓ ' + upg.name + ' aplikovaná!');
      if (typeof window.addLog   === 'function') addLog('Upgrade: ' + upg.name + ' — ' + upg.effect, 'ok');
    },

    closeReward: function() {
      var overlay = document.getElementById('arena-reward-overlay');
      if (overlay) overlay.classList.remove('show');
      this.backToRoster();
    },

    closeRewardToMap: function() {
      var overlay = document.getElementById('arena-reward-overlay');
      if (overlay) overlay.classList.remove('show');
      this.close();
    },

  };
})();
