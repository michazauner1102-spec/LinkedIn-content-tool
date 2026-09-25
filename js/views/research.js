import { store } from '../store.js';
import { GRAPHIC_TEMPLATES, VISUALS } from '../data.js';
import { findSimilar, localSuggestion, normalizeResult } from '../research.js';
import { skeletonFromViral } from '../generator.js';
import { aiEnabled, researchPrompt } from '../ai.js';
import { assist, promptModal } from '../assist.js';
import { getDaily, loadDaily } from '../daily.js';
import { renderGraphic } from '../graphics.js';
import { graphicDesignPrompt } from '../designprompt.js';
import { createDraft } from '../plan.js';
import { openTemplateLater } from './gallery.js';
import { esc, fmtNum, typeLabel, toast } from '../ui.js';

const EXAMPLES = ['KI im Maklerbüro', 'Google-Bewertungen', 'Eigentümer-Akquise', 'Kaltakquise per E-Mail', 'Preise erhöhen'];

export function render(el, { navigate, params }) {
  let s = store.get();
  const r = s.research || {};
  const daily = getDaily();
  if (daily === undefined) loadDaily().then(() => { if (el.isConnected && !r.result) render(el, { navigate, params }); });

  // Thema aus der URL (z. B. vom Dashboard) direkt recherchieren
  const qTopic = params?.get('q');
  if (qTopic && qTopic !== r.topic) {
    history.replaceState(null, '', '#/research');
    return runLocal(qTopic.trim(), el, navigate);
  }

  const result = r.result;
  const tpl = result && (GRAPHIC_TEMPLATES.find((t) => t.id === result.graphic.template) || GRAPHIC_TEMPLATES[0]);
  const visual = result && VISUALS.find((v) => v.id === result.graphic.visual);

  el.innerHTML = `
    <section class="card research-hero">
      <h2>Worüber willst du posten?</h2>
      <p class="muted small" style="margin:4px 0 16px">Gib ein Thema ein. Du bekommst ähnliche Beiträge, die gut performen – und Vorschläge für Struktur, Hooks und Grafik.</p>
      <form id="rq" class="row research-form">
        <input type="search" id="topic" placeholder="z. B. KI im Maklerbüro, Google-Bewertungen, Preise erhöhen …" value="${esc(r.topic || '')}" autocomplete="off">
        <button class="btn btn-primary">Recherchieren</button>
      </form>
      <div class="chips" style="margin-top:12px">
        ${[...new Set([...(r.history || []), ...EXAMPLES])].slice(0, 7).map((t) => `<button class="chip" data-topic="${esc(t)}">${esc(t)}</button>`).join('')}
      </div>
    </section>

    ${result ? `
    <div class="row" style="margin:22px 0 12px; align-items:flex-end">
      <div><div class="tiny">Ergebnis für</div><h2 style="margin:2px 0 0; font-size:22px">„${esc(r.topic)}“</h2></div>
      <span class="tag ${result.source === 'claude' ? 'blue' : ''}">${result.source === 'claude' ? 'Claude-Websuche' : 'Aus deiner Sammlung'}</span>
      <span class="spacer"></span>
      <button class="btn ${result.source === 'claude' ? '' : 'btn-primary'}" id="live">${aiEnabled(s) ? 'Live im Web recherchieren' : 'Prompt für Live-Recherche'}</button>
    </div>

    <div class="research-grid">
      <section class="card">
        <div class="card-head"><h3>Ähnliche Beiträge, die gut performen</h3><span class="tiny">${result.posts.length} gefunden</span></div>
        ${result.posts.length ? `<div class="stack" style="gap:12px">${result.posts.map((p, i) => `
          <div class="similar">
            <div class="row" style="justify-content:space-between; flex-wrap:nowrap; align-items:flex-start">
              <div style="min-width:0"><b>${esc(p.author || 'Unbekannt')}</b>
                <div class="tiny">${esc(sourceLabel(p))}${p.likes != null ? ` · ${fmtNum(p.likes)} Reaktionen` : ''}${p.comments != null ? ` · ${fmtNum(p.comments)} Kommentare` : ''}</div></div>
              <span class="tag">${esc(typeLabel(p.type))}</span>
            </div>
            <div class="excerpt">${esc(p.text)}</div>
            ${(p.why || []).length ? `<div class="why">${p.why.slice(0, 4).map((w) => `<span class="tag blue">${esc(w)}</span>`).join('')}</div>` : ''}
            <div class="row" style="gap:12px">
              <button class="link" data-use="${i}">Als Vorlage nutzen →</button>
              ${/^https:\/\//.test(p.url || '') ? `<a class="tiny" href="${esc(p.url)}" target="_blank" rel="noopener">Original ↗</a>` : ''}
            </div>
          </div>`).join('')}</div>`
          : `<p class="muted small">Keine ähnlichen Beiträge in deiner Sammlung. Starte die Live-Recherche, um echte Beispiele im Web zu finden.</p>`}
      </section>

      <div class="stack">
        <section class="card">
          <div class="card-head"><h3>Empfohlene Struktur</h3><span class="tag blue">${esc(typeLabel(result.structure.type))}</span></div>
          ${result.pattern ? `<p class="small muted" style="margin-top:0">${esc(result.pattern)}</p>` : ''}
          <ol class="steps">${result.structure.steps.map((st) => `<li>${esc(st)}</li>`).join('')}</ol>
          ${result.hooks.length ? `<h3 style="margin:18px 0 8px; font-size:15px">Hook-Varianten</h3>
          <div class="hook-list">${result.hooks.map((h, i) => `<label class="hook-item hook-pick"><input type="radio" name="hook" value="${i}" ${i === 0 ? 'checked' : ''}> ${esc(h)}</label>`).join('')}</div>` : ''}
          <div class="row" style="margin-top:16px"><button class="btn btn-primary" id="write">Post mit dieser Struktur schreiben</button></div>
        </section>

        <section class="card">
          <div class="card-head"><h3>Empfohlene Grafik</h3><span class="tag blue">${esc(visual?.label || tpl.name)}</span></div>
          <div class="research-graphic">
            <canvas id="gpreview"></canvas>
            <div class="stack" style="gap:10px">
              <b>${esc(tpl.name)}</b>
              ${result.graphic.why ? `<p class="small muted" style="margin:0">${esc(result.graphic.why)}</p>` : ''}
              <button class="btn btn-primary" id="g-edit">In der Galerie bearbeiten</button>
              <button class="btn" id="g-prompt">Prompt für Claude Design</button>
            </div>
          </div>
        </section>
      </div>
    </div>` : ''}`;

  const go = (topic) => {
    topic = String(topic || '').trim();
    if (!topic) return toast('Bitte ein Thema eingeben.');
    runLocal(topic, el, navigate);
  };
  el.querySelector('#rq').addEventListener('submit', (e) => { e.preventDefault(); go(el.querySelector('#topic').value); });
  el.querySelectorAll('[data-topic]').forEach((b) => b.addEventListener('click', () => go(b.dataset.topic)));
  if (!result) {
    el.querySelector('#topic').focus();
    return;
  }

  renderGraphic(el.querySelector('#gpreview'), tpl, {
    theme: s.graphicPrefs.theme, format: s.graphicPrefs.format, fields: result.graphic.fields, author: '', handle: '',
  });

  el.querySelector('#live').addEventListener('click', (e) => {
    assist(s, researchPrompt(s, r.topic), {
      title: 'Live-Recherche mit Claude',
      btn: e.currentTarget,
      busyLabel: 'Claude sucht im Web … (bis zu 2 Min.)',
      onResult: (raw) => {
        const res = normalizeResult(raw, r.topic);
        store.update((st) => { st.research = { ...st.research, result: res }; });
        render(el, { navigate, params });
        toast(res.posts.length ? `${res.posts.length} Beiträge gefunden` : 'Keine passenden Beiträge gefunden – Empfehlungen basieren auf Best Practices');
      },
    });
  });

  el.querySelectorAll('[data-use]').forEach((b) => b.addEventListener('click', () => {
    const p = result.posts[Number(b.dataset.use)];
    const d = createDraft({
      text: skeletonFromViral({ why: [], type: 'howto', ...p }, s),
      type: p.type || '',
      viralId: p.id,
      viralSource: { text: p.text, why: p.why || [], type: p.type || '' },
    });
    navigate(`#/write?draft=${d.id}`);
  }));

  el.querySelector('#write').addEventListener('click', () => {
    const idx = Number(el.querySelector('input[name=hook]:checked')?.value || 0);
    const hook = result.hooks[idx] || r.topic;
    const body = result.structure.steps.slice(1).map((st) => `[${st}]`).join('\n\n');
    const d = createDraft({ text: `${hook}\n\n${body}`, type: result.structure.type, ideaHook: hook, ideaAngle: `Thema: ${r.topic}. Struktur: ${result.structure.steps.join(' → ')}` });
    navigate(`#/write?draft=${d.id}`);
  });

  el.querySelector('#g-edit').addEventListener('click', () => {
    openTemplateLater(tpl.id, result.graphic.fields);
    navigate('#/gallery');
  });
  el.querySelector('#g-prompt').addEventListener('click', () => {
    promptModal({
      title: 'Grafik mit Claude Design',
      text: graphicDesignPrompt(s, tpl, result.graphic.fields),
      hint: 'Design-Briefing für die empfohlene Grafik. Kopieren und in Claude Design einfügen.',
    });
  });
}

function sourceLabel(p) {
  return { daily: 'Tägliche Recherche', swipe: 'Swipe-File', example: 'Beispiel (fiktiv)', web: 'Websuche' }[p.source] || '';
}

function runLocal(topic, el, navigate) {
  const s = store.get();
  const matches = findSimilar(topic, { daily: getDaily(), swipe: s.swipe });
  const result = { ...localSuggestion(s, topic, matches), topic };
  store.update((st) => {
    const hist = [topic, ...((st.research?.history) || []).filter((t) => t.toLowerCase() !== topic.toLowerCase())].slice(0, 6);
    st.research = { topic, result, history: hist };
  });
  render(el, { navigate });
}
