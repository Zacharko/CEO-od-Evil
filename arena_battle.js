/* ═══════════════════════════════════════════════════════════════════
   ARENA_BATTLE.JS  v4  —  CEO Zla // Operácia LAZARUS
   Ultimate Visual Overhaul — S&S/Punch Club, keyframe anims, pre-baked BG

   Svetlá aréna, detailné sprite animácie, particle efekty,
   screen shake, hit stop, action lines, combo counter, blur trails.

   API (rovnaké ako v1):
     ArenaBattle.init(canvasId)
     ArenaBattle.startFight(playerState, enemyDef)
     ArenaBattle.triggerPlayerAttack(type)
     ArenaBattle.triggerEnemyAttack(type)
     ArenaBattle.triggerPlayerHurt(dmg)
     ArenaBattle.triggerEnemyHurt(dmg, crit)
     ArenaBattle.triggerSpecial(type)
     ArenaBattle.triggerPlayerDeath()
     ArenaBattle.triggerEnemyDeath()
     ArenaBattle.triggerVictory()
     ArenaBattle.updateBars(pHp,pMax,eHp,eMax,pStam,pStamMax,pArmor,eArmor)
     ArenaBattle.stop()
═══════════════════════════════════════════════════════════════════ */

var ArenaBattle = (function () {
'use strict';

/* ════════════════════════════════════════════════════════════════
   PALETY — svetlé, sýte, Punch Club štýl
════════════════════════════════════════════════════════════════ */
var PAL = {
  player: {
    skin:'#e8b48a', skin2:'#c8845a', skin3:'#a86030',
    hair:'#2a1400', stubble:'#8a6040',
    shirt:'#1e3a6e', shirt2:'#152a52', shirt3:'#0e1e3a',
    jacket:'#2a4a8e', jacket2:'#1e3a6e',
    pants:'#2a2a4a', pants2:'#1a1a3a',
    boot:'#1a0e0a', boot2:'#2a1a14',
    belt:'#5a3a14', buckle:'#c8a020',
    aug:'#00ff88', aug2:'#00cc66', augGlow:'rgba(0,255,136,0.6)',
    blood:'#cc2020',
    outline:'#0a0808',
  },
  ferko: {
    skin:'#d4946a', skin2:'#b4744a', skin3:'#944a2a',
    hair:'#1a0a00', shirt:'#4a2a14', shirt2:'#3a1a0a',
    jacket:'#5a3a1a', jacket2:'#4a2a0a',
    pants:'#1a0e0a', pants2:'#120a06',
    boot:'#0e0806', boot2:'#1a100c',
    belt:'#3a2010', buckle:'#8a6010',
    aug:'#ff4444', aug2:'#cc2222', augGlow:'rgba(255,68,68,0.6)',
    blood:'#cc2020',
  },
  mec: {
    skin:'#b8845a', skin2:'#987040', skin3:'#785030',
    hair:'#0a0a0a', shirt:'#1a2a40', shirt2:'#101e30',
    jacket:'#1e3a5a', jacket2:'#142a48',
    pants:'#141e2a', pants2:'#0e1820',
    boot:'#0a0e14', boot2:'#141820',
    belt:'#202a38', buckle:'#4080c0',
    aug:'#40c0ff', aug2:'#2090d0', augGlow:'rgba(64,192,255,0.6)',
    blood:'#cc2020',
  },
  oravec: {
    skin:'#c8a478', skin2:'#a88458', skin3:'#886438',
    hair:'#383838', shirt:'#2a2040', shirt2:'#1e1430',
    jacket:'#382a5a', jacket2:'#281e48',
    pants:'#201828', pants2:'#181020',
    boot:'#100c18', boot2:'#1a1420',
    belt:'#281a40', buckle:'#9060e0',
    aug:'#c060ff', aug2:'#9030d0', augGlow:'rgba(192,96,255,0.6)',
    blood:'#cc2020',
  },
  bane: {
    skin:'#909898', skin2:'#707878', skin3:'#505858',
    hair:'#0a0a0a', shirt:'#101420', shirt2:'#0a0e18',
    jacket:'#141c2a', jacket2:'#0e1420',
    pants:'#0c1018', pants2:'#080c14',
    boot:'#080a10', boot2:'#0c0e14',
    belt:'#181c28', buckle:'#e04040',
    aug:'#ff3030', aug2:'#cc1010', augGlow:'rgba(255,48,48,0.6)',
    blood:'#cc2020',
  },
  daedalus: {
    skin:'#485860', skin2:'#384850', skin3:'#283840',
    hair:'#202830', shirt:'#101820', shirt2:'#0c1018',
    jacket:'#141e28', jacket2:'#0e1820',
    pants:'#0c1418', pants2:'#081014',
    boot:'#080c10', boot2:'#0c1014',
    belt:'#101820', buckle:'#40c0ff',
    aug:'#40c0ff', aug2:'#2090d0', augGlow:'rgba(64,192,255,0.8)',
    blood:'#304850',
  },
};

/* ════════════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════════════ */
var C, CTX, W, H, RAF_ID;
var _bgCache = null, _bgDirty = true;  /* pre-rendered static background */
var SC = 5; /* sprite scale — 5px per game pixel */

var S = {
  t: 0,
  /* Screen effects */
  shake:    { x:0, y:0, dur:0, str:0, rotStr:0 },
  flash:    { a:0, col:'#fff' },
  hitStop:  0,   /* frames frozen */
  slowMo:   0,   /* frames in 0.4× speed */
  /* Zoom/punch */
  zoom:     { val:1, tx:0, ty:0, dur:0 },
  /* Background */
  bg:       { torchT:0, crowdT:0, dustT:0 },
  /* Fighters */
  player:   null,
  enemy:    null,
  /* Particles */
  particles:[],
  floats:   [],
  impacts:  [],
  actionLines: [],  /* speed lines on hit */
  trails:   [],     /* motion blur trails */
  /* Combat state */
  combo:    { count:0, timer:0, who:'' },
  /* HP bar tween */
  pHpDisp:  100, eHpDisp:  100,
};

/* ── Fighter template ── */
function _makeFighter(x, y, palKey, isEnemy) {
  return {
    x: x, y: y,
    pal: PAL[palKey] || PAL.ferko,
    palKey: palKey,
    isEnemy: isEnemy,
    /* Animation */
    anim: 'idle',  /* idle|walk|atk|atk_h|atk_bleed|hurt|block|dead|taunt|ko_fall */
    animT: 0,
    frame: 0,      /* animation frame index */
    facing: isEnemy ? -1 : 1,
    /* Position offsets */
    ox: 0,         /* horizontal offset (lunge, knockback) */
    oy: 0,         /* vertical offset (jump) */
    squash: 1,     /* y scale for squash/stretch */
    stretch: 1,    /* x scale */
    /* Stats */
    hp: 100, maxHp: 100,
    stam: 100, maxStam: 100,
    armor: 0,
    /* Visual state */
    hitFlash: 0,   /* white flash frames after hit */
    hpDispPct: 1,  /* tweened HP display */
    portrait: null,
    /* Death state */
    deathT: 0,
    /* Shake offset for hurt */
    hurtOx: 0,
  };
}

/* ════════════════════════════════════════════════════════════════
   INIT & PUBLIC API
════════════════════════════════════════════════════════════════ */
function init(canvasId) {
  C = document.getElementById(canvasId);
  if (!C) return;
  CTX = C.getContext('2d');
  CTX.imageSmoothingEnabled = false;
  _resize();
  window.addEventListener('resize', _resize);
  if (RAF_ID) cancelAnimationFrame(RAF_ID);
  _loop();
}

function _resize() {
  if (!C) return;
  W = C.clientWidth  || 600;
  H = C.clientHeight || 260;
  C.width  = W;
  C.height = H;
  if (CTX) CTX.imageSmoothingEnabled = false;
  _bgDirty = true;  /* invalidate bg cache on resize */
  if (S.player && S.enemy) {
    S.player.x = Math.round(W * 0.25);
    S.player.y = Math.round(H * 0.80);
    S.enemy.x  = Math.round(W * 0.75);
    S.enemy.y  = Math.round(H * 0.80);
  }
}

function startFight(playerState, enemyDef) {
  var gs = playerState || {};
  S.t = 0;
  S.shake    = { x:0, y:0, dur:0, str:0 };
  S.flash    = { a:0, col:'#fff' };
  S.hitStop  = 0; S.slowMo = 0;
  S.particles= []; S.floats = []; S.impacts = [];
  S.actionLines = []; S.trails = [];
  S.combo    = { count:0, timer:0, who:'' };
  S.pHpDisp  = gs.hp || 80;
  S.eHpDisp  = enemyDef.hp || 55;

  var palKey = (enemyDef.id || 'ferko').replace(/_.*$/, '');

  S.player = _makeFighter(Math.round(W * 0.25), Math.round(H * 0.80), 'player', false);
  S.player.hp     = gs.hp    || 80;
  S.player.maxHp  = gs.maxHp || 100;
  S.player.stam   = gs.stam  || 100;
  S.player.maxStam= gs.maxStam || 100;
  S.player.armor  = gs.armor || 0;

  S.enemy = _makeFighter(Math.round(W * 0.75), Math.round(H * 0.80), palKey, true);
  S.enemy.hp    = enemyDef.hp    || 55;
  S.enemy.maxHp = enemyDef.maxHp || 55;
  S.enemy.armor = enemyDef.armor || 8;

  /* Load portrait */
  if (enemyDef.portrait) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () { S.enemy.portrait = img; };
    img.onerror = function () { S.enemy.portrait = null; };
    img.src = enemyDef.portrait;
  }

  /* Entrance animations */
  setTimeout(function () { _doTaunt(S.player); }, 400);
}

function stop() {
  S.hitStop = 0;
  if (RAF_ID) { cancelAnimationFrame(RAF_ID); RAF_ID = null; }
}

function updateBars(pHp, pMax, eHp, eMax, pStam, pStamMax, pArmor, eArmor) {
  if (!S.player || !S.enemy) return;
  S.player.hp  = pHp;  S.player.maxHp  = pMax;
  S.player.stam= pStam !== undefined ? pStam : S.player.stam;
  S.player.maxStam = pStamMax !== undefined ? pStamMax : S.player.maxStam;
  S.player.armor = pArmor !== undefined ? pArmor : S.player.armor;
  S.enemy.hp   = eHp;  S.enemy.maxHp   = eMax;
  S.enemy.armor= eArmor !== undefined ? eArmor : S.enemy.armor;
}

/* ── Trigger functions ── */
function triggerPlayerAttack(type) {
  if (!S.player) return;
  var animName = (type === 'heavy' || type === 'atk_h') ? 'atk_h'
               : (type === 'bleed' || type === 'atk_bleed') ? 'atk_bleed' : 'atk';
  S.player.anim  = animName;
  S.player.animT = 0;
  S.player.pose  = 'windup';
}

function triggerEnemyAttack(type) {
  if (!S.enemy) return;
  var animName = (type === 'heavy' || type === 'atk_h') ? 'atk_h' : 'atk';
  S.enemy.anim  = animName;
  S.enemy.animT = 0;
  S.enemy.pose  = 'windup';
}

function triggerPlayerHurt(dmg) {
  if (!S.player) return;
  _doHurt(S.player, dmg, false);
  _screenShake(4, 280);
  _flash('#ff2020', 0.35);
  _spawnBlood(S.player.x + S.player.ox, S.player.y - _SH() * 0.5, 14, '#cc2020');
  _spawnFloat('-' + dmg, S.player.x, S.player.y - _SH() * 1.1, '#ff6060', 16);
}

function triggerEnemyHurt(dmg, crit) {
  if (!S.enemy) return;
  _doHurt(S.enemy, dmg, crit);
  _screenShake(crit ? 7 : 3, crit ? 380 : 200);
  if (crit) { _flash('#fff', 0.4); S.hitStop = 6; }
  _spawnBlood(S.enemy.x + S.enemy.ox, S.enemy.y - _SH() * 0.55, crit ? 24 : 12, '#cc2020');
  _spawnImpact(S.enemy.x + S.enemy.ox, S.enemy.y - _SH() * 0.65, crit ? '#ffcc00' : '#fff');
  _spawnFloat((crit ? '⚡' : '') + dmg, S.enemy.x, S.enemy.y - _SH() * 1.1, crit ? '#ffcc00' : '#80ff80', crit ? 22 : 16);
  if (crit) _spawnActionLines(S.enemy.x, S.enemy.y - _SH() * 0.5);
  /* Combo counter */
  if (S.combo.who === 'player') {
    S.combo.count++;
    S.combo.timer = 90;
    if (S.combo.count >= 3) {
      _spawnFloat(S.combo.count + 'x COMBO!', S.enemy.x, S.enemy.y - _SH() * 1.5, '#ffcc00', 18);
    }
  } else {
    S.combo = { count:1, timer:90, who:'player' };
  }
}

function triggerSpecial(type) {
  var col = type === 'hack' ? '#40c0ff' : type === 'burn' ? '#ff8000' : type === 'heal' ? '#00ff88' : '#c060ff';
  _flash(col, 0.35);
  _screenShake(4, 350);
  var tx = S.enemy ? S.enemy.x : W/2;
  var ty = S.enemy ? S.enemy.y - _SH()*0.5 : H/2;
  _spawnExplosion(tx, ty, col, 28);
  rings.push({x:tx, y:ty, r:0, maxR:60, col:col, life:1, thick:3});
}

function triggerPlayerDeath() {
  if (!S.player) return;
  S.player.anim = 'ko_fall';
  S.player.animT = 0;
  S.player.deathT = 0;
  _screenShake(12, 700);
  _flash('#800000', 0.6);
  _spawnExplosion(S.player.x, S.player.y - _SH() * 0.5, '#cc2020', 40);
  S.slowMo = 30;
}

function triggerEnemyDeath() {
  if (!S.enemy) return;
  S.enemy.anim = 'ko_fall';
  S.enemy.animT = 0;
  S.enemy.deathT = 0;
  _screenShake(10, 600);
  _flash('#ffcc00', 0.5);
  S.hitStop = 10;
  setTimeout(function () {
    _spawnExplosion(S.enemy.x, S.enemy.y - _SH() * 0.5, '#ffcc00', 50);
    _spawnFloat('K.O.!', S.enemy.x, S.enemy.y - _SH() * 1.6, '#ffcc00', 28);
  }, 150);
}

function triggerVictory() {
  _screenShake(5, 500);
  _flash('#00ff88', 0.35);
  if (S.player) _doTaunt(S.player);
  var colors = ['#ffcc00', '#00ff88', '#40c0ff', '#ff8000', '#ffffff'];
  for (var i = 0; i < 8; i++) {
    (function (ii) {
      setTimeout(function () {
        var x = W * (0.1 + Math.random() * 0.8);
        var y = H * (0.1 + Math.random() * 0.5);
        _spawnExplosion(x, y, colors[Math.floor(Math.random() * colors.length)], 25);
      }, ii * 180);
    })(i);
  }
}

/* ════════════════════════════════════════════════════════════════
   INTERNAL FIGHT ACTIONS
════════════════════════════════════════════════════════════════ */
function _SH() { return 14 * SC; } /* sprite height in px */

function _doAttack(attacker, target, type) {
  attacker.anim  = type;
  attacker.animT = 0;
  attacker.frame = 0;
  /* Squash on windup */
  attacker.squash  = 0.85;
  attacker.stretch = 1.2;
  /* Trail */
  _addTrail(attacker);
}

function _doHurt(fighter, dmg, crit) {
  if (fighter.anim === 'ko_fall') return;
  fighter.anim     = crit ? 'stagger' : 'hurt';
  fighter.animT    = 0;
  fighter.pose     = 'hurt';
  fighter.hitFlash = crit ? 14 : 7;
  /* Knockback — toward own side */
  var dir = fighter.isEnemy ? 1 : -1;
  fighter.ox = dir * (crit ? 22 : 12);
  fighter.squash  = crit ? 1.32 : 1.22;
  fighter.stretch = crit ? 0.70 : 0.82;
}

function _doTaunt(fighter) {
  fighter.anim  = 'taunt';
  fighter.animT = 0;
}

/* ════════════════════════════════════════════════════════════════
   MAIN LOOP
════════════════════════════════════════════════════════════════ */
function _loop() {
  RAF_ID = requestAnimationFrame(_loop);
  /* Hit stop — freeze frame */
  if (S.hitStop > 0) { S.hitStop--; return; }
  /* Slow motion */
  if (S.slowMo > 0) {
    S.slowMo--;
    if (S.t % 3 !== 0) { _renderOnly(); return; }
  }
  S.t++;
  _update();
  _renderOnly();
}

function _update() {
  var t = S.t;
  /* BG timers */
  S.bg.torchT = (S.bg.torchT + 1) % 360;
  S.bg.crowdT = (S.bg.crowdT + 0.5) % 360;
  S.bg.dustT  = (S.bg.dustT  + 0.8) % W;
  /* Shake decay */
  if (S.shake.dur > 0) {
    S.shake.dur -= 16;
    var st = S.shake.str * (S.shake.dur / 500);
    S.shake.x = (Math.random() - 0.5) * st * 2;
    S.shake.y = (Math.random() - 0.5) * st * 0.6;
  } else { S.shake.x = 0; S.shake.y = 0; }
  /* Flash */
  if (S.flash.a > 0) S.flash.a = Math.max(0, S.flash.a - 0.05);
  /* Combo timer */
  if (S.combo.timer > 0) { S.combo.timer--; if (S.combo.timer === 0) S.combo.count = 0; }
  /* Update fighters */
  if (S.player) _updateFighter(S.player);
  if (S.enemy)  _updateFighter(S.enemy);
  /* HP display tween */
  if (S.player) S.pHpDisp = _lerp(S.pHpDisp, S.player.hp, 0.12);
  if (S.enemy)  S.eHpDisp = _lerp(S.eHpDisp, S.enemy.hp,  0.12);
  /* Particles */
  S.particles   = S.particles.filter(_tickParticle);
  S.floats      = S.floats.filter(_tickFloat);
  S.impacts     = S.impacts.filter(_tickImpact);
  S.actionLines = S.actionLines.filter(_tickAL);
  rings = rings.filter(function(r){ r.r += r.maxR*0.05; r.life -= 0.07; return r.life > 0; });
  S.trails      = S.trails.filter(function (tr) { tr.life -= 0.08; return tr.life > 0; });
}

function _lerp(a, b, t) { return a + (b - a) * t; }

/* ── Fighter animation state machine ── 
   f.pose = string used by _drawSprite for arm/face/leg pose
   Poses: 'idle'|'windup'|'strike'|'strike_h'|'recover'|'hurt'|'dead'|'taunt'
   f.walkCycle = 0-3, cycles during idle
   f.bob = 0 or 1 (idle breath offset)
*/
function _updateFighter(f) {
  f.animT++;
  var t = f.animT;
  var dir = f.isEnemy ? 1 : -1; /* positive ox = move right */

  /* Spring decay */
  f.squash  = _lerp(f.squash,  1, 0.20);
  f.stretch = _lerp(f.stretch, 1, 0.20);
  if (f.anim !== 'atk' && f.anim !== 'atk_h' && f.anim !== 'atk_bleed') {
    f.ox = _lerp(f.ox, 0, 0.16);
  }
  f.oy = _lerp(f.oy, 0, 0.14);
  if (f.hitFlash > 0) f.hitFlash--;

  switch (f.anim) {

    case 'idle':
      f.pose      = 'idle';
      f.walkCycle = Math.floor(t / 18) % 4;
      f.bob       = Math.floor(t / 36) % 2;
      f.oy        = Math.sin(t * 0.038) * 2.5;
      f.squash    = 1 + Math.sin(t * 0.038) * 0.018; /* subtle breath */
      break;

    /* ── NORMAL STRIKE ── */
    case 'atk':
      if (t < 5) {
        /* Windup: pull back, squash down */
        f.pose    = 'windup';
        f.ox      = dir * 6;    /* pull toward own side */
        f.squash  = _lerp(f.squash,  0.80, 0.35);
        f.stretch = _lerp(f.stretch, 1.22, 0.35);
        f.oy      = -2;
      } else if (t < 11) {
        /* Strike: punch forward */
        f.pose    = 'strike';
        f.ox      = _lerp(f.ox, -dir * 18, 0.55); /* lunge toward enemy */
        f.squash  = _lerp(f.squash,  1.18, 0.45);
        f.stretch = _lerp(f.stretch, 0.82, 0.45);
        f.oy      = 1;
      } else if (t < 22) {
        /* Recover */
        f.pose    = 'recover';
        f.ox      = _lerp(f.ox, 0, 0.28);
        f.oy      = 0;
      } else {
        f.anim = 'idle'; f.animT = 0; f.pose = 'idle';
      }
      break;

    /* ── HEAVY STRIKE ── */
    case 'atk_h':
      if (t < 4) {
        /* Load up */
        f.pose    = 'windup';
        f.ox      = dir * 5;
        f.squash  = _lerp(f.squash,  0.85, 0.28);
        f.stretch = _lerp(f.stretch, 1.18, 0.28);
        f.oy      = -1;
      } else if (t < 10) {
        /* Deep coil */
        f.pose    = 'windup';
        f.ox      = _lerp(f.ox, dir * 10, 0.32);
        f.squash  = _lerp(f.squash,  0.68, 0.32);
        f.stretch = _lerp(f.stretch, 1.42, 0.32);
        f.oy      = -5;
      } else if (t < 18) {
        /* Smash forward */
        f.pose    = 'strike_h';
        f.ox      = _lerp(f.ox, -dir * 26, 0.52);
        f.squash  = _lerp(f.squash,  1.30, 0.50);
        f.stretch = _lerp(f.stretch, 0.70, 0.50);
        f.oy      = _lerp(f.oy, 3, 0.4);
      } else if (t < 32) {
        /* Recover */
        f.pose    = 'recover';
        f.ox      = _lerp(f.ox, 0, 0.22);
        f.oy      = _lerp(f.oy, 0, 0.22);
      } else {
        f.anim = 'idle'; f.animT = 0; f.pose = 'idle';
      }
      break;

    /* ── BLEED / QUICK STAB ── */
    case 'atk_bleed':
      if (t < 4) {
        f.pose = 'windup';
        f.ox   = dir * 4;
        f.squash  = _lerp(f.squash,  0.88, 0.3);
        f.stretch = _lerp(f.stretch, 1.12, 0.3);
      } else if (t < 8) {
        /* First stab */
        f.pose = 'strike';
        f.ox   = _lerp(f.ox, -dir * 12, 0.55);
        f.squash  = _lerp(f.squash,  1.1, 0.45);
        f.stretch = _lerp(f.stretch, 0.9, 0.45);
      } else if (t < 12) {
        /* Pull back between stabs */
        f.pose = 'windup';
        f.ox   = _lerp(f.ox, dir * 3, 0.3);
      } else if (t < 16) {
        /* Second stab */
        f.pose = 'strike';
        f.ox   = _lerp(f.ox, -dir * 10, 0.55);
      } else if (t < 26) {
        f.pose = 'recover';
        f.ox   = _lerp(f.ox, 0, 0.25);
      } else {
        f.anim = 'idle'; f.animT = 0; f.pose = 'idle';
      }
      break;

    case 'hurt':
      f.pose    = 'hurt';
      f.squash  = _lerp(f.squash,  1.22, 0.3);
      f.stretch = _lerp(f.stretch, 0.82, 0.3);
      f.ox      = _lerp(f.ox, 0, 0.14);
      if (t > 20) { f.anim = 'idle'; f.animT = 0; f.pose = 'idle'; }
      break;

    case 'stagger':
      f.pose    = 'hurt';
      /* Stagger wobble */
      f.ox      = Math.sin(t * 0.7) * 7 * Math.max(0, 1 - t/28);
      f.squash  = _lerp(f.squash,  1.15, 0.25);
      f.stretch = _lerp(f.stretch, 0.88, 0.25);
      if (t > 30) { f.anim = 'idle'; f.animT = 0; f.pose = 'idle'; }
      break;

    case 'taunt':
      f.pose = 'taunt';
      f.oy   = Math.sin(t * 0.2) * 3;
      if (t > 40) { f.anim = 'idle'; f.animT = 0; f.pose = 'idle'; }
      break;

    case 'ko_fall':
      f.pose = 'dead';
      f.deathT++;
      if (f.deathT < 22) {
        f.oy = -Math.sin(f.deathT / 22 * Math.PI) * 24;
        f.ox = _lerp(f.ox, -dir * 36, 0.09);
      }
      f.squash  = Math.max(0.08, _lerp(f.squash,  0.22, 0.048));
      f.stretch = Math.max(0.10, _lerp(f.stretch, 3.60, 0.040));
      /* Alpha fade after flat */
      if (f.deathT > 30) f.alpha = Math.max(0, (f.alpha||1) - 0.012);
      break;
  }
}

/* ── Particle tick ── */
function _tickParticle(p) {
  p.x += p.vx; p.y += p.vy;
  p.vy += p.grav || 0.35;
  p.vx *= 0.94;
  p.life -= p.decay;
  if (p.rot !== undefined) p.rot += p.rotV || 0;
  return p.life > 0;
}
function _tickFloat(f) {
  f.y -= f.spd || 1.4;
  f.life -= 0.024;
  f.sc = Math.min(f.sc + 0.07, 1.4);
  return f.life > 0;
}
function _tickImpact(i) { i.r += 4; i.life -= 0.09; return i.life > 0; }
function _tickAL(al) { al.life -= 0.06; return al.life > 0; }

/* ════════════════════════════════════════════════════════════════
   RENDER
════════════════════════════════════════════════════════════════ */
function _renderOnly() {
  CTX.save();
  CTX.translate(Math.round(S.shake.x), Math.round(S.shake.y));

  _drawBg();
  _drawCrowd();
  _drawGroundLayer();
  _drawTrails();

  if (S.player) _drawFighterShadow(S.player);
  if (S.enemy)  _drawFighterShadow(S.enemy);

  /* Action lines behind fighters */
  _drawActionLines();

  if (S.player) _drawFighter(S.player);
  if (S.enemy)  _drawFighter(S.enemy);

  _drawParticles();
  _drawImpacts();
  _drawFloats();
  _drawHUD();
  _drawScanlines();

  if (S.flash.a > 0) {
    CTX.globalAlpha = S.flash.a;
    CTX.fillStyle   = S.flash.col;
    CTX.fillRect(0, 0, W, H);
    CTX.globalAlpha = 1;
  }

  CTX.restore();
}

/* ════════════════════════════════════════════════════════════════
   BACKGROUND — bright arena, stone walls, torches, crowd
════════════════════════════════════════════════════════════════ */
function _drawBg() {
  var t = S.bg.torchT;

  /* Sky — warm amber arena atmosphere */
  var sky = CTX.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#2a1a08');
  sky.addColorStop(0.4, '#3a2010');
  sky.addColorStop(1, '#4a2a14');
  CTX.fillStyle = sky;
  CTX.fillRect(0, 0, W, H * 0.55);

  /* Arena floor — bright sandy stone */
  var floor = CTX.createLinearGradient(0, H * 0.52, 0, H);
  floor.addColorStop(0, '#c8a060');
  floor.addColorStop(0.3, '#b89050');
  floor.addColorStop(0.7, '#a07840');
  floor.addColorStop(1, '#886030');
  CTX.fillStyle = floor;
  CTX.fillRect(0, H * 0.52, W, H * 0.48);

  /* Stone wall tiles in background */
  var wallY = H * 0.08;
  var wallH = H * 0.48;
  CTX.fillStyle = '#3a2a18';
  CTX.fillRect(0, wallY, W, wallH);
  /* Tile pattern */
  var tileW = Math.round(W / 16);
  var tileH = 18;
  for (var ty = 0; ty < wallH; ty += tileH) {
    var offset = Math.floor(ty / tileH) % 2 === 0 ? 0 : tileW * 0.5;
    for (var tx = -tileW; tx < W + tileW; tx += tileW) {
      var bx2 = Math.round(tx + offset);
      var by2 = Math.round(wallY + ty);
      CTX.fillStyle = 'rgba(255,220,160,0.04)';
      CTX.fillRect(bx2 + 1, by2 + 1, tileW - 2, tileH - 2);
      CTX.strokeStyle = 'rgba(0,0,0,0.3)';
      CTX.lineWidth = 1;
      CTX.strokeRect(bx2 + 0.5, by2 + 0.5, tileW - 1, tileH - 1);
    }
  }

  /* Arena rim / top ledge */
  var rimY = H * 0.07;
  var rimGrad = CTX.createLinearGradient(0, rimY, 0, rimY + 14);
  rimGrad.addColorStop(0, '#6a4a28');
  rimGrad.addColorStop(1, '#3a2010');
  CTX.fillStyle = rimGrad;
  CTX.fillRect(0, rimY, W, 14);
  /* Rim highlight */
  CTX.fillStyle = 'rgba(255,200,100,0.25)';
  CTX.fillRect(0, rimY, W, 2);
  CTX.fillStyle = 'rgba(0,0,0,0.4)';
  CTX.fillRect(0, rimY + 12, W, 2);

  /* TORCHES — left and right sides */
  _drawTorch(W * 0.08, H * 0.12, t);
  _drawTorch(W * 0.92, H * 0.12, t + 40);
  _drawTorch(W * 0.22, H * 0.09, t + 80);
  _drawTorch(W * 0.78, H * 0.09, t + 120);

  /* Floor shadow under arena wall */
  var wallShadow = CTX.createLinearGradient(0, H * 0.52, 0, H * 0.62);
  wallShadow.addColorStop(0, 'rgba(0,0,0,0.45)');
  wallShadow.addColorStop(1, 'rgba(0,0,0,0)');
  CTX.fillStyle = wallShadow;
  CTX.fillRect(0, H * 0.52, W, H * 0.1);

  /* Floor tiles / cracks */
  CTX.save();
  CTX.globalAlpha = 0.15;
  CTX.strokeStyle = '#6a4000';
  CTX.lineWidth = 1;
  /* Horizontal lines */
  for (var fy = H * 0.58; fy < H; fy += 22) {
    CTX.beginPath(); CTX.moveTo(0, fy); CTX.lineTo(W, fy); CTX.stroke();
  }
  /* Perspective vertical lines */
  var vp = W / 2;
  for (var fx = -6; fx <= 6; fx++) {
    var fxPx = vp + fx * (W / 5);
    CTX.beginPath();
    CTX.moveTo(fxPx, H * 0.56);
    CTX.lineTo(vp + fx * W * 2.5, H + 200);
    CTX.stroke();
  }
  CTX.restore();

  /* Banners / flags on sides */
  _drawBanner(W * 0.05, H * 0.12, '#8a1a1a', '#facc15');
  _drawBanner(W * 0.95, H * 0.12, '#1a4a8a', '#facc15');

  /* Torch glow on floor */
  var torchGlow = CTX.createRadialGradient(W*0.08, H*0.55, 10, W*0.08, H*0.55, 120);
  torchGlow.addColorStop(0, 'rgba(255,160,40,' + (0.12 + Math.sin(t * 0.2) * 0.04) + ')');
  torchGlow.addColorStop(1, 'rgba(255,160,40,0)');
  CTX.fillStyle = torchGlow;
  CTX.fillRect(0, H * 0.4, W * 0.3, H * 0.6);
  var torchGlowR = CTX.createRadialGradient(W*0.92, H*0.55, 10, W*0.92, H*0.55, 120);
  torchGlowR.addColorStop(0, 'rgba(255,160,40,' + (0.12 + Math.sin(t * 0.2 + 1) * 0.04) + ')');
  torchGlowR.addColorStop(1, 'rgba(255,160,40,0)');
  CTX.fillStyle = torchGlowR;
  CTX.fillRect(W * 0.7, H * 0.4, W * 0.3, H * 0.6);

  /* Center light from above */
  var centerLight = CTX.createRadialGradient(W/2, 0, 10, W/2, 0, H * 0.9);
  centerLight.addColorStop(0, 'rgba(255,220,160,0.18)');
  centerLight.addColorStop(0.5, 'rgba(255,180,80,0.06)');
  centerLight.addColorStop(1, 'rgba(0,0,0,0)');
  CTX.fillStyle = centerLight;
  CTX.fillRect(0, 0, W, H);
}

function _drawTorch(x, y, t) {
  var flicker = Math.sin(t * 0.3) * 0.4 + Math.sin(t * 0.7) * 0.2 + 0.8;
  var flicker2 = Math.sin(t * 0.5 + 1) * 0.3 + 0.85;

  /* Bracket */
  CTX.fillStyle = '#4a3010';
  CTX.fillRect(x - 3, y + 6, 6, 14);
  /* Torch head */
  CTX.fillStyle = '#6a4020';
  CTX.fillRect(x - 4, y + 4, 8, 7);

  /* Glow halo */
  var halo = CTX.createRadialGradient(x, y, 0, x, y, 38 * flicker);
  halo.addColorStop(0, 'rgba(255,180,40,' + (0.45 * flicker) + ')');
  halo.addColorStop(0.4, 'rgba(255,120,20,' + (0.18 * flicker) + ')');
  halo.addColorStop(1, 'rgba(255,80,0,0)');
  CTX.fillStyle = halo;
  CTX.fillRect(x - 40, y - 40, 80, 80);

  /* Flame layers */
  /* Outer flame */
  CTX.save();
  CTX.globalAlpha = 0.7 * flicker;
  CTX.fillStyle = '#ff6000';
  var fh = 16 * flicker;
  _drawFlame(x, y, fh, 7);
  /* Inner flame */
  CTX.globalAlpha = 0.85 * flicker2;
  CTX.fillStyle = '#ffcc00';
  _drawFlame(x, y, fh * 0.65, 4);
  /* Core */
  CTX.globalAlpha = 0.95;
  CTX.fillStyle = '#ffffcc';
  _drawFlame(x, y, fh * 0.3, 2.5);
  CTX.restore();
}

function _drawFlame(cx, cy, h, w) {
  var t = S.bg.torchT;
  CTX.beginPath();
  CTX.moveTo(cx - w * 0.5, cy);
  CTX.quadraticCurveTo(cx - w * 0.8 + Math.sin(t * 0.4) * 2, cy - h * 0.5, cx + Math.sin(t * 0.3) * 1.5, cy - h);
  CTX.quadraticCurveTo(cx + w * 0.8 + Math.sin(t * 0.5) * 2, cy - h * 0.5, cx + w * 0.5, cy);
  CTX.closePath();
  CTX.fill();
}

function _drawBanner(x, y, col1, col2) {
  var bw = 12, bh = 28;
  /* Pole */
  CTX.fillStyle = '#6a5030';
  CTX.fillRect(x - 1, y - 4, 2, bh + 6);
  /* Banner cloth */
  CTX.fillStyle = col1;
  CTX.fillRect(x, y, bw, bh);
  /* Stripe */
  CTX.fillStyle = col2;
  CTX.fillRect(x, y + bh * 0.4, bw, 4);
  /* Shadow */
  CTX.fillStyle = 'rgba(0,0,0,0.3)';
  CTX.fillRect(x + bw - 2, y, 2, bh);
}

function _drawCrowd() {
  /* Simplified animated crowd silhouettes behind rim */
  var ct = S.bg.crowdT;
  var crowdY = H * 0.04;
  /* Dark crowd area */
  CTX.fillStyle = 'rgba(20,10,4,0.6)';
  CTX.fillRect(0, crowdY, W, H * 0.05);
  /* Individual crowd heads */
  CTX.save();
  var colors = ['#2a1808', '#3a2010', '#4a2818', '#1a1008'];
  for (var i = 0; i < 40; i++) {
    var cx = (i * 47 + 13) % W;
    var bob = Math.sin(ct * 0.04 + i * 0.7) * 3;
    var h2  = 6 + Math.floor(i % 3) * 2;
    CTX.fillStyle = colors[i % colors.length];
    CTX.beginPath();
    CTX.ellipse(cx, crowdY + bob + 4, 5, h2, 0, 0, Math.PI * 2);
    CTX.fill();
  }
  /* Crowd excitement flashes on action */
  if (S.combo.count >= 3) {
    CTX.globalAlpha = 0.15 * Math.sin(S.t * 0.3);
    CTX.fillStyle = '#ffcc00';
    CTX.fillRect(0, crowdY, W, H * 0.06);
  }
  CTX.restore();
}

function _drawGroundLayer() {
  /* Arena center circle — like Punch Club's ring */
  var cx = W / 2, cy = H * 0.72;
  CTX.save();
  CTX.globalAlpha = 0.2;
  CTX.strokeStyle = '#c8a060';
  CTX.lineWidth = 2;
  CTX.beginPath();
  CTX.ellipse(cx, cy, W * 0.28, H * 0.08, 0, 0, Math.PI * 2);
  CTX.stroke();
  /* Inner circle */
  CTX.globalAlpha = 0.1;
  CTX.beginPath();
  CTX.ellipse(cx, cy, W * 0.14, H * 0.04, 0, 0, Math.PI * 2);
  CTX.stroke();
  CTX.restore();

  /* Bloodstains on ground (subtle) */
  CTX.save();
  CTX.globalAlpha = 0.15;
  CTX.fillStyle = '#8a2020';
  CTX.beginPath(); CTX.ellipse(W * 0.38, H * 0.76, 14, 5, -0.2, 0, Math.PI * 2); CTX.fill();
  CTX.beginPath(); CTX.ellipse(W * 0.65, H * 0.80, 10, 4, 0.3, 0, Math.PI * 2); CTX.fill();
  CTX.restore();

  /* Dust particles floating */
  CTX.save();
  var dt = S.bg.dustT;
  CTX.globalAlpha = 0.12;
  CTX.fillStyle = '#c8a060';
  for (var di = 0; di < 6; di++) {
    var dx = (di * 113 + dt * 0.6) % W;
    var dy2 = H * 0.62 + Math.sin(dt * 0.03 + di * 1.4) * H * 0.04;
    var ds = 1 + Math.sin(dt * 0.05 + di) * 0.5;
    CTX.beginPath(); CTX.arc(dx, dy2, ds, 0, Math.PI * 2); CTX.fill();
  }
  CTX.restore();
}

/* ════════════════════════════════════════════════════════════════
   FIGHTER SHADOW
════════════════════════════════════════════════════════════════ */
function _drawFighterShadow(f) {
  var fx = f.x + f.ox;
  var fy = f.y;
  var sw = _SH() * 0.55 * f.stretch;
  var sh = _SH() * 0.08 * f.squash;
  CTX.save();
  CTX.globalAlpha = 0.35;
  var sg = CTX.createRadialGradient(fx, fy + 4, 2, fx, fy + 4, sw);
  sg.addColorStop(0, 'rgba(0,0,0,0.7)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  CTX.fillStyle = sg;
  CTX.beginPath();
  CTX.ellipse(fx, fy + 4, sw, sh, 0, 0, Math.PI * 2);
  CTX.fill();
  CTX.restore();
}

/* ════════════════════════════════════════════════════════════════
   FIGHTER SPRITE RENDERER
   Scale = SC (5px per game pixel)
   Sprite: 16w × 14h game pixels = 80×70 CSS pixels
   Origin: (cx, cy) = foot center
════════════════════════════════════════════════════════════════ */
function _drawFighter(f) {
  var cx = f.x + f.ox;
  var cy = f.y + f.oy;
  var pal = f.pal;
  var t = S.t;
  var s = SC;

  CTX.save();

  /* Alpha (for KO fade) */
  if (f.alpha !== undefined && f.alpha < 1) CTX.globalAlpha = Math.max(0, f.alpha);

  /* Flip for enemy */
  if (f.isEnemy) {
    CTX.translate(cx * 2, 0);
    CTX.scale(-1, 1);
  }

  /* Squash/stretch at feet pivot */
  CTX.translate(cx, cy);
  CTX.scale(f.stretch, f.squash);
  CTX.translate(-cx, -cy);

  /* Hit flash — white overlay */
  var useFlash = f.hitFlash > 0 && Math.floor(f.hitFlash / 2) % 2 === 0;

  /* Aug glow pulse */
  var augPulse = 0.5 + Math.sin(t * 0.12) * 0.3;
  var glowGrad = CTX.createRadialGradient(cx, cy - _SH() * 0.4, 2, cx, cy - _SH() * 0.4, 36);
  glowGrad.addColorStop(0, pal.aug.replace(')', ',' + (0.2 * augPulse) + ')').replace('rgb', 'rgba'));
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  CTX.fillStyle = glowGrad;
  CTX.globalAlpha = 0.8;
  CTX.fillRect(cx - 40, cy - _SH(), 80, _SH() + 4);
  CTX.globalAlpha = 1;

  /* Draw sprite using pose string — not frame numbers */
  _drawSprite(CTX, cx, cy, pal, f.pose || 'idle', f.walkCycle || 0, f.bob || 0, t, s, useFlash);

  /* KO fall — tilt */
  if (f.anim === 'ko_fall') {
    /* Already handled via squash/stretch — add darkness */
    CTX.globalAlpha = Math.min(0.6, f.deathT * 0.02);
    CTX.fillStyle = '#000';
    CTX.fillRect(cx - 8*s, cy - 14*s, 16*s, 14*s);
    CTX.globalAlpha = 1;
  }

  CTX.restore();

  /* Aug eye glow (outside squash transform) */
  if (f.anim !== 'ko_fall' && augPulse > 0.3) {
    var eyeFlicker = Math.sin(t * 0.18 + (f.isEnemy ? 2 : 0)) > 0;
    if (eyeFlicker) {
      var eyeFlip = f.isEnemy ? -1 : 1;
      var ex1 = cx + eyeFlip * (-1) * s;
      var ex2 = cx + eyeFlip * 2 * s;
      var ey  = cy - 11 * s;
      CTX.save();
      CTX.globalAlpha = 0.9;
      CTX.fillStyle = pal.aug;
      CTX.fillRect(ex1, ey, s, s);
      CTX.fillRect(ex2, ey, s, s);
      CTX.globalAlpha = 0.4;
      CTX.fillRect(ex1 - s, ey - s, s*3, s*3);
      CTX.fillRect(ex2 - s, ey - s, s*3, s*3);
      CTX.restore();
    }
  }

  /* Portrait chip top-right for enemy */
  if (f.isEnemy && f.portrait && f.anim !== 'ko_fall') {
    _drawPortrait(f.portrait, pal.aug);
  }
}

/* ── Pixel sprite drawing ── 
   Uses f.pose (string) not frame numbers:
   pose: 'idle'|'windup'|'strike'|'strike_h'|'recover'|'hurt'|'dead'|'taunt'
   f.bob (0|1), f.walkCycle (0-3) for idle leg animation
*/
function _drawSprite(ctx, cx, cy, pal, pose, walkCycle, bob, t, s, flash) {
  var bx = cx - 8 * s;
  var by = cy - 14 * s;
  function p(px, py, col) {
    ctx.fillStyle = flash ? '#ffffff' : col;
    ctx.fillRect(bx + px * s, by + py * s, s, s);
  }
  function row(py, xs, col) { xs.forEach(function(x){ p(x,py,col); }); }

  pose = pose || 'idle';
  bob  = bob  || 0;
  var atk    = (pose === 'strike');
  var atkH   = (pose === 'strike_h');
  var windup = (pose === 'windup');
  var hurt   = (pose === 'hurt');
  var dead   = (pose === 'dead');
  var taunt  = (pose === 'taunt');

  /* ── HEAD ── */
  /* Hair */
  row(0+bob, [6,7,8,9], pal.hair);
  row(1+bob, [5,6,7,8,9,10], pal.hair);
  /* Face */
  row(2+bob, [5,6,7,8,9,10], pal.skin);
  /* Brow / expression */
  if (hurt || dead) {
    p(5, 3+bob, pal.skin); p(6, 3+bob, pal.skin2); p(7, 3+bob, pal.skin);
    p(8, 3+bob, pal.skin); p(9, 3+bob, pal.skin2); p(10, 3+bob, pal.skin);
    /* Grimace */
    row(5+bob, [6,7,8,9], pal.skin);
    p(6, 5+bob, '#cc2020'); p(7, 5+bob, '#ffffff'); p(8, 5+bob, '#ffffff'); p(9, 5+bob, '#cc2020');
  } else if (atk || atkH) {
    row(3+bob, [5,6,7,8,9,10], pal.skin);
    p(5, 3+bob, pal.skin2); p(10, 3+bob, pal.skin2);
    row(4+bob, [5,6,7,8,9,10], pal.skin);
    p(5, 4+bob, pal.skin3); p(10, 4+bob, pal.skin3);
    row(5+bob, [6,7,8,9], pal.skin);
    /* Gritted teeth */
    p(6, 5+bob, '#e8c090'); p(7, 5+bob, '#ffffff'); p(8, 5+bob, '#ffffff'); p(9, 5+bob, '#e8c090');
  } else if (taunt) {
    row(3+bob, [5,6,7,8,9,10], pal.skin);
    p(5, 3+bob, pal.skin2); p(10, 3+bob, pal.skin2);
    row(4+bob, [5,6,7,8,9,10], pal.skin);
    row(5+bob, [6,7,8,9], pal.skin);
    /* Grin */
    p(6, 5+bob, pal.skin2); p(7, 5+bob, '#e8d0b0'); p(8, 5+bob, '#e8d0b0'); p(9, 5+bob, pal.skin2);
  } else {
    /* Neutral / recover */
    row(3+bob, [5,6,7,8,9,10], pal.skin);
    p(5, 3+bob, pal.skin2); p(10, 3+bob, pal.skin2);
    row(4+bob, [5,6,7,8,9,10], pal.skin);
    row(5+bob, [6,7,8,9], pal.skin);
    p(7, 5+bob, pal.skin2); p(8, 5+bob, pal.skin2);
  }
  /* Aug eyes — drawn separately with flicker */
  row(5+bob, [5,10], pal.skin2);
  /* Chin */
  row(6+bob, [6,7,8,9], pal.skin);
  p(6, 6+bob, pal.skin2); p(9, 6+bob, pal.skin2);

  /* ── NECK ── */
  p(7, 7+bob, pal.skin); p(8, 7+bob, pal.skin);

  /* ── TORSO ── */
  /* Jacket shoulders */
  row(7+bob, [4,5,6,7,8,9,10,11], pal.jacket);
  row(8+bob, [4,5,6,7,8,9,10,11], pal.jacket);
  row(9+bob, [4,5,6,7,8,9,10,11], pal.jacket2);
  row(10+bob, [4,5,6,7,8,9,10,11], pal.jacket2 || pal.shirt);
  /* Shirt stripe center */
  p(7, 8+bob, pal.shirt); p(8, 8+bob, pal.shirt);
  p(7, 9+bob, pal.aug); p(8, 9+bob, pal.aug);   /* aug chest stripe */
  /* Belt */
  row(10, [5,6,7,8,9,10], pal.belt || '#5a3a14');
  p(8, 10, pal.buckle || '#c8a020');

  /* ── ARMS (vary by pose) ── */
  if (atk) {
    /* Extended punch — right arm fully stretched forward */
    p(3, 7+bob, pal.jacket); p(2, 7+bob, pal.skin); p(1, 7+bob, pal.skin);
    p(0, 7+bob, pal.skin2); p(0, 8+bob, pal.skin3);
    p(3, 8+bob, pal.skin);
  } else if (atkH) {
    /* Overhead smash — arm raised above head */
    p(5, 5+bob, pal.jacket); p(4, 4+bob, pal.skin); p(3, 3+bob, pal.skin);
    p(3, 2+bob, pal.skin2); p(2, 2+bob, pal.skin3);
    p(4, 7+bob, pal.jacket);
    /* Energy fist glow */
    ctx.save(); ctx.globalAlpha = 0.7; ctx.fillStyle = pal.aug;
    ctx.fillRect(bx - s, by + 2*s, s*3, s*2);
    ctx.globalAlpha = 0.25; ctx.fillRect(bx - s*2, by + s, s*5, s*4);
    ctx.restore();
  } else if (windup) {
    /* Arms pulled back / loaded */
    p(3, 7+bob, pal.jacket);
    p(3, 8+bob, pal.skin);
    p(2, 9+bob, pal.skin);
    p(2, 10+bob, pal.aug);  /* aug wrist */
  }
  /* Left arm */
  if (atk || atkH) {
    /* Guard arm — pulled up slightly during attack */
    p(12, 7+bob, pal.jacket); p(13, 7+bob, pal.skin); p(14, 7+bob, pal.skin2);
    p(13, 8+bob, pal.skin); p(14, 9+bob, pal.aug2 || pal.aug);
  } else {
    p(12, 7+bob, pal.jacket);
    p(12, 8+bob, pal.skin);
    p(13, 9+bob, pal.skin);
    p(13, 10+bob, pal.aug2 || pal.aug);
  }

  /* ── LEGS (walk cycle) ── */
  var lf = frame % 4;
  if (lf === 0 || dead) {
    /* Stance — feet together */
    row(11, [5,6,7,8,9,10], pal.pants);
    row(12, [5,6,7,8,9,10], pal.pants);
    row(13, [4,5,6,8,9,10], pal.boot);
    row(13, [7], pal.boot2 || pal.boot);
  } else if (lf === 1) {
    /* Step right */
    row(11, [5,6,7,8,9,10], pal.pants);
    row(12, [4,5,6,7], pal.pants);
    row(12, [9,10,11], pal.pants);
    row(13, [3,4,5,6], pal.boot);
    row(13, [9,10,11], pal.boot);
  } else if (lf === 2) {
    /* Neutral */
    row(11, [5,6,7,8,9,10], pal.pants);
    row(12, [5,6,7,8,9,10], pal.pants);
    row(13, [5,6,7,9,10,11], pal.boot);
  } else {
    /* Step left */
    row(11, [5,6,7,8,9,10], pal.pants);
    row(12, [5,6,7,8], pal.pants);
    row(12, [10,11,12], pal.pants);
    row(13, [5,6,7], pal.boot);
    row(13, [10,11,12,13], pal.boot);
  }
}

/* ── Portrait chip ── */
function _drawPortrait(img, glowCol) {
  var px = W - 60, py = 8, pw = 46, ph = 46;
  CTX.save();
  CTX.globalAlpha = 0.25;
  CTX.fillStyle = glowCol;
  CTX.fillRect(px - 3, py - 3, pw + 6, ph + 6);
  CTX.globalAlpha = 0.88;
  CTX.drawImage(img, px, py, pw, ph);
  CTX.globalAlpha = 0.15;
  for (var sl = py; sl < py + ph; sl += 3) {
    CTX.fillStyle = '#000'; CTX.fillRect(px, sl, pw, 1);
  }
  CTX.globalAlpha = 1;
  CTX.strokeStyle = glowCol;
  CTX.lineWidth   = 2;
  CTX.strokeRect(px, py, pw, ph);
  /* Corner accents */
  CTX.fillStyle = glowCol;
  CTX.fillRect(px - 2, py - 2, 6, 2); CTX.fillRect(px - 2, py - 2, 2, 6);
  CTX.fillRect(px + pw - 4, py - 2, 6, 2); CTX.fillRect(px + pw + 2, py - 2, 2, 6);
  CTX.fillRect(px - 2, py + ph, 6, 2); CTX.fillRect(px - 2, py + ph - 4, 2, 6);
  CTX.fillRect(px + pw - 4, py + ph, 6, 2); CTX.fillRect(px + pw + 2, py + ph - 4, 2, 6);
  CTX.restore();
}

/* ════════════════════════════════════════════════════════════════
   EFFECTS
════════════════════════════════════════════════════════════════ */
/* Action lines — speed lines radiating from impact point */
function _spawnActionLines(x, y) {
  for (var i = 0; i < 12; i++) {
    var angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
    var len   = 30 + Math.random() * 50;
    S.actionLines.push({
      x: x, y: y,
      dx: Math.cos(angle) * len,
      dy: Math.sin(angle) * len,
      life: 1, thick: 1 + Math.random() * 2,
    });
  }
}
function _drawActionLines() {
  S.actionLines.forEach(function (al) {
    CTX.save();
    CTX.globalAlpha = al.life * 0.7;
    CTX.strokeStyle = '#fff';
    CTX.lineWidth   = al.thick;
    CTX.beginPath();
    CTX.moveTo(al.x, al.y);
    CTX.lineTo(al.x + al.dx * al.life, al.y + al.dy * al.life);
    CTX.stroke();
    CTX.restore();
  });
}

/* Trails — motion blur */
function _addTrail(f) {
  S.trails.push({ x: f.x + f.ox, y: f.y + f.oy, life: 1 });
}
function _drawTrails() {
  S.trails.forEach(function (tr) {
    CTX.save();
    CTX.globalAlpha = tr.life * 0.18;
    CTX.fillStyle = '#c8a060';
    CTX.fillRect(tr.x - 4*SC, tr.y - 14*SC, 16*SC, 14*SC);
    CTX.restore();
  });
}

/* Blood particles */
function _spawnBlood(x, y, count, col) {
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 2 + Math.random() * 5;
    S.particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      grav: 0.4, decay: 0.025 + Math.random() * 0.02,
      life: 0.9 + Math.random() * 0.3,
      col: col, size: Math.random() > 0.4 ? 4 : 2,
    });
  }
}

/* Explosion particles */
function _spawnExplosion(x, y, col, count) {
  var cols = [col, '#fff', '#ffcc80'];
  for (var i = 0; i < count; i++) {
    var a = Math.random() * Math.PI * 2;
    var sp = 2 + Math.random() * 8;
    S.particles.push({
      x: x + (Math.random() - 0.5) * 24,
      y: y + (Math.random() - 0.5) * 24,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
      grav: 0.2, decay: 0.016 + Math.random() * 0.018,
      life: 1,
      col: cols[Math.floor(Math.random() * cols.length)],
      size: Math.floor(Math.random() * 4 + 2) * 2,
    });
  }
  S.impacts.push({ x:x, y:y, r:8, col:col, life:1 });
  S.impacts.push({ x:x, y:y, r:4, col:'#fff', life:0.75 });
}

/* Impact ring */
function _spawnImpact(x, y, col) {
  S.impacts.push({ x:x, y:y, r:5, col:col, life:1 });
  for (var i = 0; i < 8; i++) {
    var a = (i/8)*Math.PI*2;
    S.particles.push({
      x:x, y:y, vx:Math.cos(a)*5, vy:Math.sin(a)*5-1,
      grav:0.3, decay:0.06, life:0.9,
      col:col, size:4,
    });
  }
}

/* Float text */
function _spawnFloat(text, x, y, col, sz) {
  S.floats.push({
    text: String(text),
    x: x + (Math.random() - 0.5) * 22,
    y: y,
    col: col || '#fff',
    sz: sz  || 14,
    sc: 0.4, life: 1,
    spd: 1.2 + Math.random() * 0.4,
  });
}

/* Draw particles */
function _drawParticles() {
  S.particles.forEach(function (p) {
    CTX.save();
    CTX.globalAlpha = p.life;
    CTX.fillStyle   = p.col;
    CTX.fillRect(Math.round(p.x/2)*2, Math.round(p.y/2)*2, p.size, p.size);
    CTX.restore();
  });
}

/* Draw impacts */
function _drawImpacts() {
  S.impacts.forEach(function (i) {
    CTX.save();
    CTX.globalAlpha = i.life * 0.75;
    CTX.strokeStyle = i.col;
    CTX.lineWidth   = 3;
    CTX.beginPath(); CTX.arc(i.x, i.y, i.r, 0, Math.PI * 2); CTX.stroke();
    CTX.restore();
  });
}

/* Draw float texts */
function _drawFloats() {
  S.floats.forEach(function (f) {
    CTX.save();
    CTX.globalAlpha = Math.min(1, f.life * 1.8);
    var fs = Math.floor(f.sz * f.sc);
    if (fs < 6) { CTX.restore(); return; }
    CTX.font = 'bold ' + fs + 'px "Press Start 2P", monospace';
    CTX.textAlign = 'center';
    CTX.lineWidth = 5;
    CTX.strokeStyle = '#000';
    CTX.strokeText(f.text, f.x, f.y);
    CTX.fillStyle = f.col;
    CTX.fillText(f.text, f.x, f.y);
    CTX.restore();
  });
}

/* ════════════════════════════════════════════════════════════════
   IN-SCENE HUD — HP bars above fighters
════════════════════════════════════════════════════════════════ */
function _drawHUD() {
  if (!S.player || !S.enemy) return;
  var bw = 70, bh = 7, bpad = 4;

  /* Player HP bar */
  var px = S.player.x + S.player.ox - bw/2;
  var py = S.player.y - _SH() - 18;
  _drawHpBar(px, py, bw, bh, S.pHpDisp, S.player.maxHp, '#00ff88', '#00aa55', true);

  /* Enemy HP bar */
  var ex = S.enemy.x + S.enemy.ox - bw/2;
  var ey = S.enemy.y - _SH() - 18;
  _drawHpBar(ex, ey, bw, bh, S.eHpDisp, S.enemy.maxHp, '#ff4444', '#aa1111', false);

  /* Combo counter */
  if (S.combo.count >= 2 && S.combo.timer > 0) {
    var alpha = Math.min(1, S.combo.timer / 20);
    CTX.save();
    CTX.globalAlpha = alpha;
    CTX.font = 'bold 11px "Press Start 2P", monospace';
    CTX.textAlign = 'center';
    CTX.strokeStyle = '#000'; CTX.lineWidth = 4;
    CTX.strokeText(S.combo.count + '×', W / 2, H * 0.18);
    CTX.fillStyle = S.combo.count >= 5 ? '#ff4444' : S.combo.count >= 3 ? '#ffcc00' : '#fff';
    CTX.fillText(S.combo.count + '×', W / 2, H * 0.18);
    CTX.font = 'bold 6px "Press Start 2P", monospace';
    CTX.fillStyle = '#ccc';
    CTX.fillText('COMBO', W / 2, H * 0.18 + 14);
    CTX.restore();
  }
}

function _drawHpBar(x, y, w, h, cur, max, colHi, colLo, isPlayer) {
  var pct = Math.max(0, Math.min(1, cur / max));
  var col = pct > 0.5 ? colHi : pct > 0.25 ? '#ffcc00' : '#ff2020';

  /* Background */
  CTX.fillStyle = 'rgba(0,0,0,0.7)';
  CTX.fillRect(x - 1, y - 1, w + 2, h + 2);

  /* Fill */
  CTX.fillStyle = col;
  CTX.fillRect(x, y, Math.round(w * pct), h);

  /* Segments */
  CTX.fillStyle = 'rgba(0,0,0,0.35)';
  for (var i = 1; i < 10; i++) {
    CTX.fillRect(x + Math.round(w * i / 10), y, 1, h);
  }

  /* Shine on top */
  CTX.save();
  CTX.globalAlpha = 0.3;
  CTX.fillStyle = '#fff';
  CTX.fillRect(x, y, Math.round(w * pct), 2);
  CTX.restore();

  /* Low HP pulse */
  if (pct < 0.25 && Math.floor(S.t / 8) % 2 === 0) {
    CTX.save();
    CTX.globalAlpha = 0.5;
    CTX.fillStyle = '#ff2020';
    CTX.fillRect(x, y, Math.round(w * pct), h);
    CTX.restore();
  }
}

/* ── CRT scanlines (lighter than before) ── */
function _drawScanlines() {
  CTX.save();
  CTX.globalAlpha = 0.05;
  CTX.fillStyle = '#000';
  for (var sy = 0; sy < H; sy += 4) CTX.fillRect(0, sy, W, 2);
  /* Vignette — softer */
  CTX.globalAlpha = 1;
  var vig = CTX.createRadialGradient(W/2, H/2, H*0.35, W/2, H/2, H*0.9);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.45)');
  CTX.fillStyle = vig;
  CTX.fillRect(0, 0, W, H);
  CTX.restore();
}

/* ── Screen effects ── */
function _screenShake(str, dur) {
  if (str > S.shake.str || S.shake.dur < dur / 2) {
    S.shake.str = str; S.shake.dur = dur;
  }
}
function _flash(col, a) { S.flash.col = col; S.flash.a = a; }

/* ════════════════════════════════════════════════════════════════
   EXPOSE
════════════════════════════════════════════════════════════════ */
return {
  init:                init,
  stop:                stop,
  startFight:          startFight,
  updateBars:          updateBars,
  triggerPlayerAttack: triggerPlayerAttack,
  triggerEnemyAttack:  triggerEnemyAttack,
  triggerPlayerHurt:   triggerPlayerHurt,
  triggerEnemyHurt:    triggerEnemyHurt,
  triggerSpecial:      triggerSpecial,
  triggerPlayerDeath:  triggerPlayerDeath,
  triggerEnemyDeath:   triggerEnemyDeath,
  triggerVictory:      triggerVictory,
  spawnFloat:          _spawnFloat,
};

})();
