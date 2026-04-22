'use strict';

/* ═══ UI: training.js — Kurzy (Uni + Gym) ═══
   Závislosti: data/jobs.js (UNI_COURSES, GYM_COURSES)
              systems/state.js (S, COURSE_STATE)
              systems/renderer.js (Renderer) */

var COURSE_STATE = {};

function getCourseLevel(id)   { return COURSE_STATE[id] ? (COURSE_STATE[id].level || 0) : 0; }
function isEnrolled(id)       { return COURSE_STATE[id] && COURSE_STATE[id].enrolled; }
function getCourseCost(c)     { return Math.floor(c.cost * Math.pow(c.levelMult || 1.8, getCourseLevel(c.id))); }
function getCourseTotalRate(c){ return c.ratePerSec * (getCourseLevel(c.id) || 0); }

function enrollCourse(id, pool) {
  var course = pool.filter(function(c){ return c.id===id; })[0]; if (!course) return;
  var cost = getCourseCost(course);
  if (S.money < cost) { showNotif('Nedostatok kreditov!'); return; }
  if (!COURSE_STATE[id]) COURSE_STATE[id] = { enrolled: false, level: 0, progress: 0 };
  S.money -= cost; Renderer.updateMoney();
  var cs = COURSE_STATE[id]; cs.enrolled = true; cs.level = (cs.level||0) + 1;
  addLog('Zapísaný: ' + course.name + ' (úroveň ' + cs.level + ')', 'ok');
  showNotif('📚 ' + course.name);
  renderTrainingView('uni'); renderTrainingView('gym');
}

function unenrollCourse(id) {
  if (!COURSE_STATE[id]) return;
  COURSE_STATE[id].enrolled = false;
  addLog('Kurz pozastavený.','warn');
  renderTrainingView('uni'); renderTrainingView('gym');
}

function renderTrainingView(type) {
  var pool = type === 'uni' ? UNI_COURSES : GYM_COURSES;
  var gridId = type === 'uni' ? 'uni-courses-grid' : 'gym-courses-grid';
  var grid = document.getElementById(gridId); if (!grid) return;
  var html = '';
  pool.forEach(function(course) {
    var cs = COURSE_STATE[course.id] || { enrolled:false, level:0, progress:0 };
    var lvl = cs.level || 0; var enrolled = cs.enrolled; var maxed = lvl >= course.maxLevel;
    var cost = getCourseCost(course); var canEnroll = !enrolled && S.money >= cost && !maxed;
    var rate = lvl > 0 ? getCourseTotalRate(course) : 0; var pct = cs.progress || 0;
    var blocked = false;
    if (course.requires) {
      var sv = course.stat==='hackStat'?S.hackStat:(course.stat==='str'?S.str:(course.stat==='flex'?S.flex:S.san));
      if (sv < course.requires) blocked = true;
    }
    html += '<div class="course-card ' + (enrolled?'active-course':'') + '">';
    html += '<div class="course-icon">' + course.icon + '</div>';
    html += '<div class="course-name">' + course.name + '</div>';
    html += '<div class="course-desc">' + course.desc + '</div>';
    html += '<div class="course-stats"><span class="course-stat">' + course.statLabel + '</span>';
    if (course.incomeBonus) html += '<span class="course-stat">+' + course.incomeBonus + '₿/s</span>';
    if (course.requires) html += '<span class="course-stat" style="color:' + (blocked?'var(--danger)':'var(--green3)') + '">' + course.stat.replace('hackStat','HCK').replace('str','SIL').replace('flex','OHY').replace('san','SAN') + ' ' + course.requires + '+ req</span>';
    html += '</div>';
    html += '<div class="course-cost">Úroveň: ' + lvl + '/' + course.maxLevel;
    if (!maxed) html += ' | ₿' + cost.toLocaleString('sk'); else html += ' | MAX';
    if (rate > 0) html += ' | +' + rate.toFixed(3) + '/s';
    html += '</div>';
    if (lvl > 0) html += '<div class="course-progress-wrap"><div class="course-progress-bar" id="cprog-' + course.id + '" style="width:' + pct + '%"></div></div>';
    if (blocked) html += '<button class="course-btn" disabled>[ LOCKED — ' + course.requires + ' req ]</button>';
    else if (maxed) html += '<button class="course-btn enrolled">[ MAX LEVEL ✓ ]</button>';
    else if (enrolled) html += '<button class="course-btn enrolled" onclick="unenrollCourse(\'' + course.id + '\')">[ AKTÍVNY — PAUZA ]</button>';
    else html += '<button class="course-btn" ' + (canEnroll?'':'disabled') + ' onclick="enrollCourse(\'' + course.id + '\',' + (type==='uni'?'UNI_COURSES':'GYM_COURSES') + ')">' + (canEnroll?'[ ZAPÍSAŤ — ₿' + cost.toLocaleString('sk') + ' ]':'[ ₿' + cost.toLocaleString('sk') + ' ]') + '</button>';
    html += '</div>';
  });
  grid.innerHTML = html;
}

/* ── SCENE PHOTOS ── */