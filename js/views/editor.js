import { store } from '../store.js';
import { POST_TYPES, VIRAL_POSTS, HOOK_FORMULAS, POST_STRUCTURES, POST_TEMPLATES } from '../data.js';
import { checkPost, localDraft, skeletonFromViral, toUnicode, localIdeas, toDu } from '../generator.js';
import { aiEnabled, writePrompt, rewritePrompt, hooksPrompt, adaptPrompt } from '../ai.js';
import { assist } from '../assist.js';
import { createDraft } from '../plan.js';
import { findDailyPost } from '../daily.js';
import { esc, copyText, toast, toLocalInput, openModal, typeLabel } from '../ui.js';

let device = 'mobile';
// Merkt sich, ob ein frisch aus einer Idee erstellter Entwurf automatisch per KI ausformuliert werden soll.
let autogenId = null;
const session = { get: () => autogenId, set: (v) => { autogenId = v; } };
let expanded = false;

const AI_ACTIONS = [
  ['Hook schärfen', 'Mach die erste Zeile stärker und neugieriger. Der Rest bleibt fast gleich.'],
  ['Kürzen', 'Kürze den Post um etwa ein Drittel, ohne die Kernaussage zu verlieren.'],
  ['Mehr Storytelling', 'Baue eine konkrete Szene oder persönliche Erfahrung ein (mit [Platzhaltern] für echte Details).'],
  ['Besser lesbar', 'Kürzere Sätze, mehr Absätze, bessere Scanbarkeit auf dem Handy.'],
  ['Stärkerer CTA', 'Formuliere das Ende mit einer klaren, leicht zu beantwortenden Frage oder Handlungsaufforderung neu.'],
  ['Rechtschreibung', 'Korrigiere nur Rechtschreibung, Grammatik und Zeichensetzung. Ändere sonst nichts.'],
];

export function render(el, { navigate, params }) {
  let s = store.get();

  // Einstieg über Parameter → Entwurf anlegen und auf ?draft= umleiten
  if (params.get('new')) {
    const d = createDraft({});
    return navigate(`#/write?draft=${d.id}`, true);
  }
  if (params.get('idea')) {
    const idea = s.ideas.find((i) => i.id === params.get('idea'));
    if (idea) {
      const d = createDraft({ text: localDraft(s, idea), pillarId: idea.pillarId, type: idea.type, ideaHook: idea.hook, ideaAngle: idea.angle });
      if (aiEnabled(s)) session.set(d.id);
      return navigate(`#/write?draft=${d.id}`, true);
    }
  }
  if (params.get('viral')) {
    const id = params.get('viral');
    const post = VIRAL_POSTS.find((p) => p.id === id) || s.swipe.find((p) => p.id === id) || findDailyPost(id);
    if (post) {
      const d = createDraft({ text: skeletonFromViral({ why: [], type: 'howto', ...post }, s), type: post.type || '', viralId: post.id, viralSource: { text: post.text, why: post.why || [], type: post.type || '' } });
      return navigate(`#/write?draft=${d.id}`, true);
    }
  }

  let draft = s.drafts.find((d) => d.id === params.get('draft'));
  if (!draft) {
    const recent = s.drafts[0];
    if (recent) return navigate(`#/write?draft=${recent.id}`, true);
    const d = createDraft({});
    return navigate(`#/write?draft=${d.id}`, true);
  }
  const viral = draft.viralSource || (draft.viralId ? VIRAL_POSTS.find((p) => p.id === draft.viralId) || s.swipe.find((p) => p.id === draft.viralId) : null);

  el.innerHTML = `
    <div class="editor">
      <div class="stack">
        <div class="card">
          <div class="grid g3" style="margin-bottom:14px">
            <label class="field">Content-Pillar
              <select id="pillar"><option value="">– ohne –</option>
                ${s.pillars.map((p) => `<option value="${p.id}" ${draft.pillarId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
              </select></label>
            <label class="field">Post-Typ
              <select id="ptype"><option value="">– ohne –</option>
                ${POST_TYPES.map((t) => `<option value="${t.id}" ${draft.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
              </select></label>
            <label class="field">Geplant für
              <input type="datetime-local" id="when" value="${toLocalInput(draft.scheduledAt)}"></label>
          </div>
          ${draft.type && POST_STRUCTURES[draft.type] ? `<p class="tiny" style="margin:0 0 12px">Struktur für ${esc(typeLabel(draft.type))}: ${POST_STRUCTURES[draft.type].map(esc).join(' → ')}</p>` : ''}
          <div class="toolbar">
            <button class="btn btn-sm" data-fmt="bold" title="Markierten Text fett (Unicode)"><b>B</b></button>
            <button class="btn btn-sm" data-fmt="italic" title="Markierten Text kursiv (Unicode)"><i>I</i></button>
            <button class="btn btn-sm" data-ins="→ ">→</button>
            <button class="btn btn-sm" data-ins="• ">•</button>
            <span class="spacer"></span>
            <button class="btn btn-sm" id="tpls">Vorlage einfügen</button>
            <button class="btn btn-sm" id="hooks">Hook-Ideen</button>
          </div>
          <textarea class="post" id="text" placeholder="Schreib deinen Post … Die erste Zeile ist der Hook.">${esc(draft.text)}</textarea>
          <div class="counter"><span id="count"></span><span>Automatisch gespeichert</span></div>

          <div class="row" style="margin-top:16px">
            <button class="btn btn-primary" id="ai-write">${draft.ideaHook ? 'Mit Claude ausformulieren' : 'Mit Claude schreiben'}</button>
            ${viral ? `<button class="btn btn-primary" id="ai-viral">Für meine Nische umschreiben</button>` : ''}
            <div style="position:relative">
              <button class="btn" id="ai-menu">KI-Überarbeitung ▾</button>
              <div id="ai-list" class="card" style="display:none; position:absolute; z-index:10; top:44px; left:0; padding:6px; width:240px">
                ${AI_ACTIONS.map(([l], i) => `<button class="btn btn-ghost" style="width:100%; justify-content:flex-start" data-ai="${i}">${l}</button>`).join('')}
              </div>
            </div>
            <span class="spacer"></span>
            <button class="btn" id="copy">Kopieren</button>
            <button class="btn ${draft.status === 'veröffentlicht' ? '' : 'btn-primary'}" id="publish">${draft.status === 'veröffentlicht' ? '✓ Veröffentlicht' : 'Als veröffentlicht markieren'}</button>
          </div>
          <div class="row" style="margin-top:10px">
            <a class="btn btn-ghost btn-sm" href="#/write?new=1">+ Neuer Post</a>
            <a class="btn btn-ghost btn-sm" href="#/gallery">Grafik dazu erstellen</a>
            <span class="spacer"></span>
            <button class="btn btn-ghost btn-sm btn-danger" id="del">Löschen</button>
          </div>
        </div>
      </div>

      <div class="stack">
        <div class="card">
          <div class="card-head"><h3>Vorschau</h3>
            <div class="seg"><button data-dev="mobile" class="${device === 'mobile' ? 'on' : ''}">Mobil</button><button data-dev="desktop" class="${device === 'desktop' ? 'on' : ''}">Desktop</button></div></div>
          <div id="preview"></div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Post-Checker</h3></div>
          <div id="checker"></div>
        </div>
      </div>
    </div>`;

  const ta = el.querySelector('#text');
  const save = (patch) => {
    store.update((st) => {
      const d = st.drafts.find((x) => x.id === draft.id);
      Object.assign(d, patch, { updatedAt: Date.now() });
    });
    s = store.get();
    draft = s.drafts.find((d) => d.id === draft.id);
  };

  const refresh = () => {
    renderPreview(el.querySelector('#preview'), ta.value, s);
    renderChecker(el.querySelector('#checker'), ta.value, s);
    el.querySelector('#count').textContent = `${ta.value.length} / 3.000 Zeichen · ${ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0} Wörter`;
  };
  let t;
  ta.addEventListener('input', () => {
    refresh();
    clearTimeout(t);
    t = setTimeout(() => save({ text: ta.value }), 300);
  });
  refresh();

  const setText = (text) => {
    ta.value = text;
    save({ text });
    refresh();
  };

  el.querySelector('#pillar').addEventListener('change', (e) => save({ pillarId: e.target.value }));
  el.querySelector('#ptype').addEventListener('change', (e) => { save({ type: e.target.value }); render(el, { navigate, params }); });
  el.querySelector('#when').addEventListener('change', (e) => {
    const ts = e.target.value ? new Date(e.target.value).getTime() : null;
    save({ scheduledAt: ts, status: draft.status === 'veröffentlicht' ? draft.status : ts ? 'geplant' : 'entwurf' });
    toast(ts ? 'Im Kalender eingeplant' : 'Termin entfernt');
  });

  el.querySelectorAll('[data-dev]').forEach((b) => b.addEventListener('click', () => {
    device = b.dataset.dev;
    el.querySelectorAll('[data-dev]').forEach((x) => x.classList.toggle('on', x === b));
    refresh();
  }));

  el.querySelectorAll('[data-fmt]').forEach((b) => b.addEventListener('click', () => {
    const { selectionStart: a, selectionEnd: z } = ta;
    if (a === z) return toast('Erst Text markieren');
    setText(ta.value.slice(0, a) + toUnicode(ta.value.slice(a, z), b.dataset.fmt) + ta.value.slice(z));
  }));
  el.querySelectorAll('[data-ins]').forEach((b) => b.addEventListener('click', () => {
    const pos = ta.selectionStart;
    setText(ta.value.slice(0, pos) + b.dataset.ins + ta.value.slice(pos));
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + b.dataset.ins.length;
  }));

  el.querySelector('#copy').addEventListener('click', () => copyText(ta.value));
  el.querySelector('#publish').addEventListener('click', () => {
    const published = draft.status === 'veröffentlicht';
    save({ status: published ? (draft.scheduledAt ? 'geplant' : 'entwurf') : 'veröffentlicht', publishedAt: published ? null : Date.now() });
    if (!published) copyText(ta.value);
    render(el, { navigate, params });
  });
  el.querySelector('#del').addEventListener('click', () => {
    if (!confirm('Diesen Entwurf wirklich löschen?')) return;
    store.update((st) => { st.drafts = st.drafts.filter((d) => d.id !== draft.id); });
    navigate('#/calendar');
  });

  // KI: mit API-Schlüssel direkt, sonst als Prompt zum Kopieren in Claude
  const aiRun = (btn, label, prompt, title = label.replace(' …', '')) =>
    assist(s, prompt, {
      title,
      btn,
      busyLabel: label,
      onResult: (text) => {
        setText(text);
        toast('Fertig');
      },
    });

  const writeBtn = el.querySelector('#ai-write');
  const doWrite = () => {
    const firstLine = ta.value.split('\n').find((l) => l.trim() && !/^\[.*\]$/.test(l.trim()));
    const pillarName = s.pillars.find((p) => p.id === draft.pillarId)?.name;
    aiRun(writeBtn, 'Claude schreibt …', writePrompt(s, {
      hook: draft.ideaHook || firstLine || `Ein starker Post zum Thema „${pillarName || 'meine Expertise'}“`,
      angle: draft.ideaAngle, type: draft.type, pillarName,
    }), 'Post mit Claude schreiben');
  };
  writeBtn.addEventListener('click', doWrite);
  if (aiEnabled(s) && session.get() === draft.id) {
    session.set(null);
    doWrite();
  }

  const viralBtn = el.querySelector('#ai-viral');
  viralBtn?.addEventListener('click', () => aiRun(viralBtn, 'Für meine Nische umschreiben …', adaptPrompt(s, { why: [], ...viral })));

  const menu = el.querySelector('#ai-list');
  el.querySelector('#ai-menu').addEventListener('click', () => { menu.style.display = menu.style.display === 'none' ? 'block' : 'none'; });
  el.querySelectorAll('[data-ai]').forEach((b) => b.addEventListener('click', () => {
    menu.style.display = 'none';
    if (!ta.value.trim()) return toast('Erst etwas schreiben');
    const [label, instruction] = AI_ACTIONS[Number(b.dataset.ai)];
    aiRun(el.querySelector('#ai-menu'), `${label} …`, rewritePrompt(s, ta.value, instruction));
  }));

  el.querySelector('#tpls').addEventListener('click', () => {
    const list = POST_TEMPLATES.filter((t) => !draft.type || t.type === draft.type);
    const shown = list.length ? list : POST_TEMPLATES;
    const m = openModal(`
      <div class="modal-head"><h2>Post-Vorlage einfügen</h2><button class="icon-btn" data-close>✕</button></div>
      <p class="muted small" style="margin-top:0">${draft.type && list.length ? `Passend zum Post-Typ „${esc(typeLabel(draft.type))}“. ` : ''}Ersetzt den aktuellen Text. [Platzhalter] danach ausfüllen.</p>
      <div class="hook-list">${shown.map((t) => `<button class="hook-item" data-t="${t.id}"><b>${esc(t.name)}</b><br><span class="small muted">${esc(t.text.split('\n')[0])}</span></button>`).join('')}</div>`, { narrow: true });
    m.el.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
      const t = POST_TEMPLATES.find((x) => x.id === b.dataset.t);
      setText(s.voice.address === 'du' ? toDu(t.text) : t.text);
      if (!draft.type) save({ type: t.type });
      m.close();
    }));
  });

  const showHooks = (hooks, fromClaude) => {
    const m = openModal(`
      <div class="modal-head"><h2>Hook-Ideen</h2><button class="icon-btn" data-close>✕</button></div>
      <p class="muted small" style="margin-top:0">Klicke auf einen Hook, um die erste Zeile zu ersetzen.</p>
      <div class="hook-list">${hooks.map((h, i) => `<button class="hook-item" data-h="${i}">${esc(h)}</button>`).join('')}</div>
      ${!fromClaude ? '<div class="row" style="margin-top:14px"><button class="btn" id="hooks-claude">Hooks mit Claude zu meinem Text</button></div>' : ''}
      <h3 style="margin:20px 0 8px">Hook-Formeln</h3>
      <div class="chips">${HOOK_FORMULAS.map((f) => `<span class="tag" title="${esc(f.tpl)}">${esc(f.name)}</span>`).join('')}</div>`, { narrow: true });
    m.el.querySelectorAll('[data-h]').forEach((b) => b.addEventListener('click', () => {
      const lines = ta.value.split('\n');
      const idx = lines.findIndex((l) => l.trim());
      if (idx >= 0) lines[idx] = hooks[Number(b.dataset.h)];
      else lines.unshift(hooks[Number(b.dataset.h)]);
      setText(lines.join('\n'));
      m.close();
    }));
    m.el.querySelector('#hooks-claude')?.addEventListener('click', () => {
      if (ta.value.trim().length < 40) return toast('Schreib zuerst ein paar Sätze – dann passen die Hooks zum Inhalt.');
      m.close();
      assist(s, hooksPrompt(s, ta.value), {
        title: 'Hook-Ideen von Claude',
        btn: el.querySelector('#hooks'),
        busyLabel: 'Hooks …',
        onResult: (list) => showHooks(list.map(String), true),
      });
    });
  };

  el.querySelector('#hooks').addEventListener('click', () => {
    showHooks(localIdeas(s, { pillarId: draft.pillarId, type: draft.type, count: 6 }).map((i) => i.hook), false);
  });
}

function renderPreview(box, text, s) {
  const name = s.profile.name || 'Dein Name';
  const sub = [s.profile.role, s.profile.company].filter(Boolean).join(' · ') || 'Deine Headline';
  const limit = device === 'mobile' ? 140 : 210;
  const lineLimit = device === 'mobile' ? 3 : 3;
  let shown = text;
  let truncated = false;
  if (!expanded) {
    const lines = text.split('\n');
    let acc = '';
    let count = 0;
    for (const l of lines) {
      if (count >= lineLimit || acc.length + l.length > limit) { truncated = true; break; }
      acc += (count ? '\n' : '') + l;
      count++;
    }
    if (!truncated && acc.length < text.length) truncated = true;
    if (truncated) shown = acc.length ? acc : text.slice(0, limit);
  }
  box.innerHTML = `
    <div class="li-preview ${device}">
      <div class="li-head">
        <div><div class="li-name">${esc(name)} · 1.</div><div class="li-sub">${esc(sub)}</div><div class="li-sub">Jetzt</div></div></div>
      <div class="li-text">${esc(shown) || '<span style="color:#999">Hier erscheint die Vorschau …</span>'}${truncated ? '<span class="more" data-more>… mehr</span>' : ''}${expanded && text.length > limit ? ' <span class="more" data-more>weniger</span>' : ''}</div>
      <div class="li-actions"><span>Gefällt mir</span><span>Kommentieren</span><span>Reposten</span><span>Senden</span></div>
    </div>
    <p class="tiny" style="text-align:center; margin:10px 0 0">Alles vor „… mehr" muss neugierig machen – das sehen Leser im Feed.</p>`;
  box.querySelectorAll('[data-more]').forEach((m) => m.addEventListener('click', () => { expanded = !expanded; renderPreview(box, text, s); }));
}

function renderChecker(box, text, s) {
  const { score, checks } = checkPost(text, s);
  const color = 'var(--primary)';
  const verdict = !text.trim() ? 'Noch leer' : score >= 75 ? 'Bereit zum Posten' : score >= 50 ? 'Fast da – ein paar Feinschliffe' : 'Noch Luft nach oben';
  box.innerHTML = `
    <div class="score"><div class="ring" style="--v:${score}; --c:${color}"><span>${score}</span></div>
      <div><b>${verdict}</b><div class="small muted">Bewertet Hook, Lesbarkeit, Länge, CTA & Reichweiten-Faktoren.</div></div></div>
    <ul class="checks">
      ${checks.map((c) => `<li class="${c.ok ? 'ok' : c.warn ? 'warn' : 'bad'}"><span class="st">${c.ok ? '✓' : c.warn ? '!' : '✕'}</span><div>${esc(c.label)}<small>${esc(c.tip)}</small></div></li>`).join('')}
    </ul>`;
}
