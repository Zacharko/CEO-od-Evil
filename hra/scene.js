'use strict';

/* ════════════════════════════════════════════════════════════
   MODULE 7: SceneManager
   goTo, renderDialogLines, renderChoices, enterLocation
   Závislosti: data/scenes.js (SCENES, SCENE_PHOTOS)
              systems/state.js (S)
              systems/renderer.js (Renderer)
              systems/hunger.js (HungerSystem)
              ui/engine.js (gainXP, addLog, gameOver)
   ════════════════════════════════════════════════════════════ */

var SceneManager = (function() {
  var _typingTimer = null;

  /**
   * Navigate to a scene by ID.
   */
  function goTo(sceneId) {
    if (!SCENES[sceneId]) return;
    S.scene   = sceneId;
    S.visited[sceneId] = true;
    var sc = SCENES[sceneId];

    document.getElementById('scene-loc-name').textContent = sc.name;

    // Scene image / placeholder
    var pdata   = SCENE_PHOTOS[sceneId];
    var photoEl = document.getElementById('scene-photo');
    var badgeEl = document.getElementById('scene-loc-badge');
    var ph      = document.getElementById('scene-placeholder');

    if (pdata) {
      if (ph) ph.style.display = 'none';
      photoEl.style.display = 'block';
      photoEl.onerror = function(){ this.style.display='none'; if(ph) ph.style.display='flex'; };
      photoEl.src = pdata.url;
      badgeEl.textContent = pdata.badge;
    } else {
      if (ph) {
        ph.style.display = 'flex';
        var icon = ph.querySelector('#scene-placeholder-icon');
        var lbl  = ph.querySelector('#scene-placeholder-label');
        if (icon) icon.textContent = sc.art || '🏙️';
        if (lbl)  lbl.textContent  = sc.name || 'Lokácia';
      }
      photoEl.style.display = 'none';
      badgeEl.textContent = sc.name || '';
    }

    if (sc.onEnter) sc.onEnter(S);

    var textEl = document.getElementById('scene-text-wrap');
    renderDialogLines(textEl, (sc.text || []).join('\n'));
    renderChoices(sc.choices || []);

    Renderer.updateStats();
    Renderer.updateInventory();
    Renderer.updateFlags();
  }

  /**
   * Parse text lines into NPC bubbles vs narration blocks,
   * then render into the target element.
   */
  function renderDialogLines(el, text) {
    el.innerHTML = '';
    var lines = text.split('\n');
    var currentNarr = [];
    var currentNPC  = null;
    var fragments   = [];

    function flushNarr() {
      if (currentNarr.length) { fragments.push({ type:'narr', lines: currentNarr.slice() }); currentNarr = []; }
    }
    function flushNPC() {
      if (currentNPC) { fragments.push({ type:'npc', data: currentNPC }); currentNPC = null; }
    }

    lines.forEach(function(line) {
      var trimmed = line.trim();
      var isSpeech = trimmed.startsWith('"') || (trimmed.startsWith("'") && trimmed.length > 2);
      var isSystem = trimmed.startsWith('<i>//') || trimmed.startsWith('// ');
      if (isSpeech || isSystem) {
        flushNarr();
        if (!currentNPC) currentNPC = { lines: [] };
        currentNPC.lines.push(trimmed);
      } else {
        flushNPC();
        if (trimmed !== '') currentNarr.push(trimmed);
        else if (currentNarr.length) currentNarr.push('__BLANK__');
      }
    });
    flushNarr(); flushNPC();

    var frag = document.createDocumentFragment();
    var sc   = SCENES[S.scene] || {};

    fragments.forEach(function(f) {
      if (f.type === 'narr') {
        var div = document.createElement('div'); div.className = 'dialog-narration';
        div.innerHTML = safeHtml(f.lines.filter(function(l){ return l !== '__BLANK__'; }).join('<br>'));
        frag.appendChild(div);
      } else {
        var div = document.createElement('div'); div.className = 'dialog-npc-bubble';
        var npcName = sc.npcName || sc.name || 'NPC';
        var npcImg  = sc.npcImg  || null;
        var art     = sc.art     || '💬';
        div.setAttribute('data-speaker', npcName);
        var avatarSpan = document.createElement('span'); avatarSpan.className = 'npc-avatar';
        if (npcImg) {
          var img = document.createElement('img'); img.src = npcImg; img.alt = npcName;
          img.style.cssText = 'width:32px;height:32px;object-fit:cover;border-radius:50%;border:1px solid var(--green3);filter:sepia(0.3) hue-rotate(80deg) saturate(1.2);';
          img.onerror = function(){ this.style.display='none'; avatarSpan.textContent = art; };
          avatarSpan.appendChild(img);
        } else { avatarSpan.textContent = art; }
        var textDiv = document.createElement('div');
        textDiv.innerHTML = safeHtml(f.data.lines.join('<br>'));
        div.appendChild(avatarSpan); div.appendChild(textDiv);
        frag.appendChild(div);
      }
    });
    var divider = document.createElement('div'); divider.className = 'dialog-divider';
    frag.appendChild(divider);
    el.appendChild(frag);
  }

  /**
   * Build and inject choice buttons.
   */
  function renderChoices(choices) {
    var wrap = document.getElementById('choices-wrap');
    wrap.innerHTML = '<div id="choices-label">// VOĽBY //</div>';
    if (!choices || !choices.length) return;

    var frag = document.createDocumentFragment();
    choices.forEach(function(ch, idx) {
      var btn = document.createElement('button'); btn.className = 'choice-btn';
      var numSpan  = document.createElement('span'); numSpan.className  = 'choice-num'; numSpan.textContent = (idx + 1) + '.';
      var textSpan = document.createElement('span'); textSpan.className = 'choice-text';

      if (ch.action) {
        textSpan.textContent = ch.text;
        btn.appendChild(numSpan); btn.appendChild(textSpan);
        btn.onclick = function(){ handleChoiceAction(ch); };
        frag.appendChild(btn); return;
      }

      var ok = !ch.cond || ch.cond(S);
      var displayText = ch.text.replace(/^\[[A-Z]\]\s*/, '');

      if (!ok) {
        textSpan.innerHTML = displayText + (ch.condFail ? '<span class="choice-fail-hint">⚠ ' + ch.condFail + '</span>' : '');
        btn.appendChild(numSpan); btn.appendChild(textSpan);
        btn.disabled = true;
      } else {
        textSpan.textContent = displayText;
        btn.appendChild(numSpan); btn.appendChild(textSpan);
        (function(choice){
          btn.onclick = function() {
            // DECISION-BASED HUNGER: každá voľba stojí hlad
            var isMajor    = !!(choice.hp && choice.hp < 0) || !!(choice.san && choice.san < -3);
            var isPositive = !!(choice.xp && choice.xp > 0) || !!(choice.san && choice.san > 0);
            var isHarmful  = !!(choice.hp && choice.hp < -5) || !!(choice.san && choice.san < -5);
            HungerSystem.onDecision({ major: isMajor, positive: isPositive, harmful: isHarmful });
            if (choice.hp)  { S.hp  = Math.max(0, S.hp  + choice.hp);  Renderer.updateStats(); }
            if (choice.san) { S.san = Math.max(0, S.san + choice.san); Renderer.updateStats(); }
            if (choice.xp)  gainXP(choice.xp);
            if (S.hp <= 0)  { gameOver(); return; }
            if (S.san <= 0) { gameOver('Psychický kolaps. Myseľ nevydržala nápor LAZARUS protokolu.'); return; }
            goTo(choice.next);
          };
        })(ch);
      }
      frag.appendChild(btn);
    });
    wrap.appendChild(frag);
  }

  function enterLocation(locId) {
    var sceneId = 'loc_' + locId;
    if (!SCENES[sceneId]) { addLog('Lokácia nenájdená: ' + locId, 'warn'); return; }
    goTo(sceneId);
  }

  return { goTo: goTo, renderDialogLines: renderDialogLines, renderChoices: renderChoices, enterLocation: enterLocation };
})();

/* ════════════════════════════════════════════════════════════════════
   ╔══════════════════════════════════════════════════════════════╗
   ║           MODULE 8: GameLoop                                 ║
   ║  requestAnimationFrame loop + delta-time passive tick        ║
   ╚══════════════════════════════════════════════════════════════╝
════════════════════════════════════════════════════════════════════ */