'use strict';

/* === ui/fishing.js — Rybolov minigame === */

FISHING MINIGAME ────────────────────────────────────────── */
var FG = { state:'idle', fishTarget:null, biteTimer:null, barPos:0, barDir:1, playerPos:0.5, catchZonePos:0.4, catchPower:0, animFrame:null, canvas:null, ctx:null, waitTimeout:null, biteTimeout:null };

function openFishing() {
  FG.state = 'idle';
  var overlay = document.getElementById('fishing-overlay');
  if (overlay) overlay.classList.add('show');
  FG.canvas = document.getElementById('fishing-canvas');
  if (!FG.canvas) return;
  FG.ctx = FG.canvas.getContext('2d');
  if (FG.animFrame) cancelAnimationFrame(FG.animFrame);
  drawFishingIdle();
  document.getElementById('fishing-action-btn').textContent = '🎣 Zahoď udicu';
  document.getElementById('fishing-status').textContent = 'Čakáš na záber... Zahoď udicu!';
  InputHandler.on('key:Space', function(){ if(document.getElementById('fishing-overlay').classList.contains('show')) fishingAction(); });
}
function closeFishing() {
  var overlay = document.getElementById('fishing-overlay');
  if (overlay) overlay.classList.remove('show');
  if (FG.animFrame) cancelAnimationFrame(FG.animFrame);
  if (FG.waitTimeout) clearTimeout(FG.waitTimeout);
  if (FG.biteTimeout) clearTimeout(FG.biteTimeout);
  FG.state = 'idle';
  InputHandler.off('key:Space');
}
function fishingAction() {
  if (FG.state === 'idle') {
    FG.state = 'waiting';
    document.getElementById('fishing-action-btn').textContent = '[ ČAKÁM... ]';
    document.getElementById('fishing-status').textContent = 'Udica vo vode. Čakáš...';
    var rnd = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
    FG.fishTarget = rnd;
    var waitTime = 1500 + Math.random() * 4000;
    FG.waitTimeout = setTimeout(function(){
      if (FG.state !== 'waiting') return;
      FG.state = 'biting';
      drawFishingBite();
      document.getElementById('fishing-status').textContent = '!! ZÁBER !! Klikni teraz!';
      FG.biteTimeout = setTimeout(function(){
        if (FG.state === 'biting') {
          FG.state = 'idle';
          drawFishingFail();
          document.getElementById('fishing-status').textContent = 'Ušla ti! Skús znova.';
          document.getElementById('fishing-action-btn').textContent = '🎣 Zahoď znova';
        }
      }, 1200);
      drawFishingWait();
    }, waitTime);
    drawFishingWait();
  } else if (FG.state === 'biting') {
    clearTimeout(FG.biteTimeout);
    FG.state = 'reeling';
    FG.catchPower = 0;
    FG.barPos = 0.3 + Math.random() * 0.4;
    FG.barDir = (Math.random() > 0.5 ? 1 : -1) * GameConfig.FISHING.BAR_SPEED;
    FG.playerPos = 0.5;
    document.getElementById('fishing-action-btn').textContent = '[ DRŽI ] alebo SPACE';
    document.getElementById('fishing-status').textContent = 'Drž lištu nad rybou!';
    FG.animFrame = requestAnimationFrame(reelingLoop);
  } else if (FG.state === 'reeling') {
    FG.playerPos = Math.min(1, FG.playerPos + 0.05);
  }
}
function reelingLoop() {
  if (FG.state !== 'reeling') return;
  FG.barPos += FG.barDir;
  if (FG.barPos > 0.88 || FG.barPos < 0.05) FG.barDir *= -1;
  var overlap = Math.abs(FG.playerPos - FG.barPos) < GameConfig.FISHING.OVERLAP_THRESHOLD;
  if (overlap) FG.catchPower = Math.min(1, FG.catchPower + GameConfig.FISHING.CATCH_INCREASE);
  else         FG.catchPower = Math.max(0, FG.catchPower - GameConfig.FISHING.CATCH_DECREASE);
  FG.playerPos = Math.max(0.01, FG.playerPos - 0.012);
  drawReeling();
  if (FG.catchPower >= 1) {
    FG.state = 'caught';
    if (FG.animFrame) cancelAnimationFrame(FG.animFrame);
    fishCaught(); return;
  }
  FG.animFrame = requestAnimationFrame(reelingLoop);
}
function fishCaught() {
  var ft = FG.fishTarget;
  if (!S.fishCaught[ft.id]) S.fishCaught[ft.id] = 0;
  S.fishCaught[ft.id]++;
  S.income.fish = Object.keys(S.fishCaught).reduce(function(a,id){
    var f = FISH_TYPES.filter(function(x){ return x.id===id; })[0];
    return a + (f ? Math.floor(f.value/10) : 0);
  }, 0);
  Renderer.updateIncome(); Renderer.updateFish();
  var xpGain = Math.max(5, Math.floor(ft.value/3)); gainXP(xpGain);
  S.flex     = Math.min(100, S.flex + 0.5);
  S.hackStat = Math.min(100, S.hackStat + 0.1);
  S.san      = Math.min(100, S.san + 0.5);
  // Rybárčenie tiež zvyšuje hlad
  HungerSystem.tick();
  Renderer.updateStats(); activityAttrBonus('fishing');
  document.getElementById('fishing-status').textContent = 'Chytil si: ' + ft.icon + ' ' + ft.name + ' (' + ft.value + '₿) | XP +' + xpGain;
  document.getElementById('fishing-action-btn').textContent = '[ ZAHOĎ ZNOVA ]';
  addLog('Rybolov: ' + ft.icon + ' ' + ft.name + ' chytená!', 'ok');
  showNotif(ft.icon + ' ' + ft.name + ' — ₿' + ft.value + ' | XP +' + xpGain);
  drawFishCaught(ft); FG.state = 'idle';
}

// Canvas drawing
function drawFishingIdle() {
  var c=FG.ctx, w=FG.canvas.width, h=FG.canvas.height;
  c.clearRect(0,0,w,h);
  var g=c.createLinearGradient(0,0,0,h); g.addColorStop(0,'#020d14'); g.addColorStop(1,'#010a0e');
  c.fillStyle=g; c.fillRect(0,0,w,h);
  c.strokeStyle='rgba(34,211,238,0.07)';
  for(var i=0;i<5;i++){ c.beginPath(); c.ellipse(w/2,h*0.6+i*8,40+i*20,8+i*3,0,0,Math.PI*2); c.stroke(); }
  c.strokeStyle='rgba(74,222,128,0.3)'; c.lineWidth=1; c.beginPath(); c.moveTo(w/2,0); c.lineTo(w/2,h*0.55); c.stroke();
  c.fillStyle='#ef4444'; c.beginPath(); c.arc(w/2,h*0.55,5,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(74,222,128,0.45)'; c.font='10px Share Tech Mono'; c.textAlign='center';
  c.fillText('// Nitrická rieka — zvláštne ticho //',w/2,h-12);
}
function drawFishingWait() {
  if (FG.state!=='waiting' && FG.state!=='biting') return;
  var c=FG.ctx, w=FG.canvas.width, h=FG.canvas.height;
  c.clearRect(0,0,w,h);
  var g=c.createLinearGradient(0,0,0,h); g.addColorStop(0,'#020d14'); g.addColorStop(1,'#010a0e');
  c.fillStyle=g; c.fillRect(0,0,w,h);
  var t=Date.now()/500, bobY=h*0.55+Math.sin(t)*4;
  c.strokeStyle='rgba(74,222,128,0.4)'; c.lineWidth=1; c.beginPath(); c.moveTo(w/2,10); c.lineTo(w/2,bobY); c.stroke();
  c.fillStyle='#ef4444'; c.beginPath(); c.arc(w/2,bobY,5,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(34,211,238,0.6)'; c.font='10px Share Tech Mono'; c.textAlign='center'; c.fillText('čakáš...',w/2,h-12);
  FG.animFrame=requestAnimationFrame(drawFishingWait);
}
function drawFishingBite() {
  var c=FG.ctx, w=FG.canvas.width, h=FG.canvas.height;
  c.clearRect(0,0,w,h);
  var t=(Date.now()/200)%1;
  c.fillStyle='rgba(239,68,68,'+(0.3+t*0.4)+')'; c.fillRect(0,0,w,h);
  c.fillStyle='#010a0e'; c.fillRect(2,2,w-4,h-4);
  c.fillStyle='#ef4444'; c.font='bold 24px Orbitron,monospace'; c.textAlign='center'; c.fillText('!! ZÁBER !!',w/2,h/2);
  c.fillStyle='rgba(239,68,68,0.7)'; c.font='10px Share Tech Mono'; c.fillText('klikni TERAZ!',w/2,h/2+22);
}
function drawFishingFail() {
  var c=FG.ctx, w=FG.canvas.width, h=FG.canvas.height;
  c.clearRect(0,0,w,h); c.fillStyle='#010a0e'; c.fillRect(0,0,w,h);
  c.fillStyle='rgba(239,68,68,0.5)'; c.font='14px Orbitron'; c.textAlign='center'; c.fillText('UŠLA TI...',w/2,h/2);
}
function drawReeling() {
  var c=FG.ctx, w=FG.canvas.width, h=FG.canvas.height;
  c.clearRect(0,0,w,h); c.fillStyle='#010a0e'; c.fillRect(0,0,w,h);
  c.fillStyle='rgba(34,211,238,0.6)'; c.font='9px Share Tech Mono'; c.textAlign='left'; c.fillText('// DRŽI lištu nad rybou //',8,16);
  var bX=20, bW=w-40;
  c.fillStyle='rgba(255,255,255,0.05)'; c.fillRect(bX,45,bW,22);
  c.strokeStyle='rgba(255,255,255,0.1)'; c.strokeRect(bX,45,bW,22);
  c.font='18px serif'; c.textAlign='left';
  c.fillText(FG.fishTarget?FG.fishTarget.icon:'🐟', bX+FG.barPos*bW-11, 63);
  c.fillStyle='rgba(74,222,128,0.07)'; c.fillRect(bX,90,bW,22);
  c.strokeStyle='rgba(74,222,128,0.18)'; c.strokeRect(bX,90,bW,22);
  var pX=bX+FG.playerPos*bW, zW=bW*GameConfig.FISHING.CATCH_ZONE_WIDTH;
  c.fillStyle='rgba(57,255,20,0.32)'; c.fillRect(pX-zW/2,90,zW,22);
  c.strokeStyle='#39ff14'; c.lineWidth=2; c.beginPath(); c.moveTo(pX,90); c.lineTo(pX,112); c.stroke();
  var ov=Math.abs(FG.playerPos-FG.barPos)<GameConfig.FISHING.OVERLAP_THRESHOLD;
  c.fillStyle=ov?'rgba(57,255,20,0.8)':'rgba(239,68,68,0.6)';
  c.font='9px Share Tech Mono'; c.textAlign='center';
  c.fillText(ov?'// CATCHING //':'// ALIGN! //',w/2,135);
  c.fillStyle='rgba(255,255,255,0.05)'; c.fillRect(bX,148,bW,10);
  var pct=FG.catchPower, pcol=pct>0.7?'#39ff14':pct>0.4?'#facc15':'#ef4444';
  c.fillStyle=pcol; c.fillRect(bX,148,bW*pct,10);
  c.strokeStyle='rgba(255,255,255,0.1)'; c.strokeRect(bX,148,bW,10);
  c.fillStyle='rgba(255,255,255,0.35)'; c.font='8px Share Tech Mono';
  c.fillText('CATCH POWER',w/2,172);
  c.fillStyle='rgba(74,222,128,0.4)';
  c.fillText('[ DRŽI TLAČIDLO ] alebo [ SPACE ] = ísť hore',w/2,190);
}
function drawFishCaught(ft) {
  var c=FG.ctx, w=FG.canvas.width, h=FG.canvas.height;
  c.clearRect(0,0,w,h);
  var g=c.createLinearGradient(0,0,0,h); g.addColorStop(0,'#020d14'); g.addColorStop(1,'#010a0e');
  c.fillStyle=g; c.fillRect(0,0,w,h);
  c.font='48px serif'; c.textAlign='center'; c.fillText(ft.icon,w/2,h/2-10);
  c.fillStyle='#39ff14'; c.font='14px Orbitron'; c.fillText(ft.name,w/2,h/2+20);
  c.fillStyle='#facc15'; c.font='11px Share Tech Mono'; c.fillText('₿'+ft.value,w/2,h/2+38);
}

/* ──