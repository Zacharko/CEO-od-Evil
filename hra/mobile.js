'use strict';

/* === ui/mobile.js — Mobilný panel === */

MOBILE PANEL ────────────────────────────────────────────── */
var _mobileActivePanel = null;
function mobilePanel(name) {
  ['stats','map','inv','log'].forEach(function(p){
    var el = document.getElementById('mobile-'+p+'-panel');
    if (el) el.classList.remove('open');
  });
  if (!name || name === _mobileActivePanel) { _mobileActivePanel = null; return; }
  _mobileActivePanel = name;
  var panel = document.getElementById('mobile-'+name+'-panel'); if (!panel) return;
  if (name === 'stats') {
    var src = document.getElementById('left-scroll');
    panel.innerHTML = '<button class="mobile-panel-close" onclick="mobilePanel(null)">✕ Zavrieť</button>';
    if (src) panel.appendChild(src.cloneNode(true));
  } else if (name === 'map') {
    var src2 = document.getElementById('sec-map');
    panel.innerHTML = '<button class="mobile-panel-close" onclick="mobilePanel(null)">✕ Zavrieť</button>';
    if (src2) panel.appendChild(src2.cloneNode(true));
  } else if (name === 'inv') {
    panel.innerHTML = '<button class="mobile-panel-close" onclick="mobilePanel(null)">✕ Zavrieť</button>';
    var rp = document.getElementById('right-panel');
    if (rp) panel.appendChild(rp.cloneNode(true));
  } else if (name === 'log') {
    panel.innerHTML = '<button class="mobile-panel-close" onclick="mobilePanel(null)">✕ Zavrieť</button>';
    var lw = document.getElementById('log-wrap');
    if (lw) { var clone = lw.cloneNode(true); clone.style.maxHeight='none'; panel.appendChild(clone); }
  }
  panel.classList.add('open');
}

/* ══════════════════════════════════════════════════════════════════