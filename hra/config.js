'use strict';

/* ════════════════════════════════════════════════════════════════════
   MODULE 1: GameConfig
   Všetky magické čísla na jednom mieste. Ak chceš niečo vyvážiť,
   zmeň to tu — nie hlboko v kóde.
════════════════════════════════════════════════════════════════════ */
var GameConfig = {
  SAVE_KEY:              'ceozla-lazarus-v4',
  TARGET_FPS:            60,
  TICK_INTERVAL_MS:      1000,      // pasívny príjem / atribútový tick
  GARDEN_TICK_MS:        1000,
  NOTIF_DURATION_MS:     2800,
  LOG_MAX_LINES:         30,
  FLOAT_TEXT_DURATION:   900,

  // Prahy povýšenia (míľniky v peniazoch)
  JOB_PROMO_THRESHOLDS:  [8000, 40000],

  // Level-up XP vzorec: level * XP_PER_LEVEL_MULT
  XP_PER_LEVEL_MULT:     80,

  // Rybolov
  FISHING: {
    BAR_SPEED:           0.012,
    CATCH_INCREASE:      0.018,
    CATCH_DECREASE:      0.008,
    OVERLAP_THRESHOLD:   0.12,
    CATCH_ZONE_WIDTH:    0.22,
  },

  // Záhradka
  GARDEN_PLOTS:          9,

  // Lode cookie-clicker inflácia
  BOAT_PRICE_INFLATION:  1.35,
};
