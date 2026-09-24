import { store } from '../store.js';
import { BEST_TIMES, ALGO_INSIGHTS, HOOK_FORMULAS, POST_TYPES } from '../data.js';
import { checkPost, toDu, audienceLabel } from '../generator.js';
import { pillarMix, balanceScore } from '../plan.js';
import { aiEnabled, aiInsights } from '../ai.js';
import { esc, busy, toast, copyText, typeLabel } from '../ui.js';

let aiResult = null;

export function render(el, { navigate }) {
  const s = store.get();
  const mix = pillarMix(s);
  const balance = balanceScore(s);
  const written = s.drafts.filter((d) => d.text.trim().length > 50);
  const scores = written.map((d) => checkPost(d.text, s).score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const typeCounts = POST_TYPES.map((t) => ({ t, n: s.drafts.filter((d) => d.type === t.id).length })).filter((x) => x.n || s.postTypes.includes(x.t.id));
  const maxType = Math.max(1, ...typeCounts.map((x) => x.n));
  const published = s.drafts.filter((d) => d.status === 'veröffentlicht');

  // Häufigste Schwachstellen aus dem Checker
  const weak = {};
  for (const d of written) for (const c of checkPost(d.text, s).checks) if (!c.ok) weak[c.label] = (weak[c.label] || 0) + 1;
  const weakList = Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Lücken
  const gaps = [];
  mix.filter((m) => m.target - m.actual > 0.1 && written.length >= 3).forEach((m) => gaps.push(`„${m.pillar.name}" kommt zu kurz (${Math.round(m.actual * 100)} % statt ${Math.round(m.target * 100)} %).`));
  s.postTypes.filter((id) => !s.drafts.some((d) => d.type === id)).slice(0, 3).forEach((id) => gaps.push(`Noch kein Post vom Typ „${POST_TYPES.find((t) => t.id === id)?.label}“ – probier ihn aus.`));
  if (!s.onboarded) gaps.unshift('Schließe die Strategie ab, um personalisierte Insights zu bekommen.');

  const fillHook = (tpl) => {
    const out = tpl
      .replaceAll('{zahl}', '5').replaceAll('{thema}', s.pillars[0]?.name || 'LinkedIn')
      .replaceAll('{zielgruppe}', audienceLabel(s)).replaceAll('{schmerz}', s.audience.pains[0] || 'zu wenig Zeit')
      .replaceAll('{ziel}', s.audience.goals[0] || 'mehr Kunden').replaceAll('{zeitraum}', '90 Tagen').replaceAll('{zeit}', '2 Jahre');
    return s.voice.address === 'du' ? toDu(out) : out;
  };

  el.innerHTML = `
    <div class="grid g4" style="margin-bottom:20px">
      ${stat('Geschriebene Posts', written.length)}
      ${stat('Veröffentlicht', published.length)}
      ${stat('Ø Post-Score', avg ?? '–')}
      ${stat('Pillar-Balance', balance == null ? '–' : `${balance}%`)}
    </div>

    <div class="grid g2" style="margin-bottom:20px">
      <section class="card">
        <div class="card-head"><h2>Content-Mix vs. Strategie</h2></div>
        ${mix.length ? mix.map((m) => `
          <div class="bar-row"><span class="name" title="${esc(m.pillar.name)}">${esc(m.pillar.name)}</span>
            <div class="bar"><i style="width:${m.actual * 100}%"></i><span class="target" style="left:${m.target * 100}%"></span></div>
            <span class="tiny">${Math.round(m.actual * 100)}%</span></div>`).join('')
          + '<p class="tiny">Balken = tatsächlicher Anteil deiner Entwürfe · Strich = Soll laut Gewichtung</p>'
          : '<p class="muted">Noch keine Pillars festgelegt. <a href="#/strategy">Strategie starten →</a></p>'}
        <h3 style="margin:20px 0 8px">Post-Typen</h3>
        ${typeCounts.length ? typeCounts.map((x) => `
          <div class="bar-row"><span class="name">${esc(x.t.label)}</span>
            <div class="bar"><i style="width:${(x.n / maxType) * 100}%"></i></div><span class="tiny">${x.n}</span></div>`).join('') : '<p class="muted small">Noch keine Daten.</p>'}
      </section>

      <section class="card">
        <div class="card-head"><h2>Was du als Nächstes tun solltest</h2></div>
        ${gaps.length ? `<ul class="checks">${gaps.map((g) => `<li class="warn"><span class="st">!</span><div>${esc(g)}</div></li>`).join('')}</ul>` : '<p class="muted">Dein Mix ist ausgewogen.</p>'}
        ${weakList.length ? `<h3 style="margin:20px 0 8px">Häufigste Schwachstellen</h3>
          <ul class="checks">${weakList.map(([l, n]) => `<li class="bad"><span class="st">✕</span><div>${esc(l)}<small>in ${n} von ${written.length} Posts</small></div></li>`).join('')}</ul>` : ''}
        <div class="row" style="margin-top:20px">
          <button class="btn btn-primary" id="ai-ins">KI-Analyse meiner Strategie</button>
        </div>
        <div id="ai-out">${aiResult ? aiList(aiResult) : ''}</div>
      </section>
    </div>

    <div class="grid g2" style="margin-bottom:20px">
      <section class="card">
        <div class="card-head"><h2>Beste Posting-Zeiten</h2><span class="tiny">Richtwerte für B2B im DACH-Raum</span></div>
        <div class="heat">
          <span></span>${BEST_TIMES.days.map((d) => `<span class="h">${d}</span>`).join('')}
          ${BEST_TIMES.slots.map((slot, si) => `<span class="rl">${slot}</span>${BEST_TIMES.days.map((_, di) => `<span class="c" title="${BEST_TIMES.days[di]} ${slot}" style="opacity:${0.08 + BEST_TIMES.grid[di][si] * 0.23}"></span>`).join('')}`).join('')}
        </div>
        <p class="small muted" style="margin:14px 0 0">Allgemeine Erfahrungswerte: Dienstag bis Donnerstag morgens performen im B2B meist am besten. Teste selbst und beobachte deine eigenen Zahlen in den LinkedIn-Statistiken.</p>
      </section>

      <section class="card">
        <div class="card-head"><h2>Wie der Algorithmus tickt</h2></div>
        <div class="stack" style="gap:12px">
          ${ALGO_INSIGHTS.map((i) => `<div><b>${esc(i.title)}</b><div class="small muted">${esc(i.text)}</div></div>`).join('')}
        </div>
      </section>
    </div>

    <section class="card">
      <div class="card-head"><h2>Hook-Formeln – auf dich zugeschnitten</h2></div>
      <div class="grid g3">
        ${HOOK_FORMULAS.map((f) => `<div class="formula">
          <b>${esc(f.name)}</b>
          <div class="tpl">${esc(fillHook(f.tpl))}</div>
          <div class="row"><span class="tiny">${f.types.map(typeLabel).join(' · ')}</span><span class="spacer"></span>
            <button class="btn btn-sm btn-ghost" data-copy="${esc(fillHook(f.tpl))}">Kopieren</button></div>
        </div>`).join('')}
      </div>
    </section>`;

  el.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => copyText(b.dataset.copy)));
  el.querySelector('#ai-ins').addEventListener('click', async (e) => {
    if (!aiEnabled(s)) { toast('Bitte zuerst einen API-Schlüssel hinterlegen.'); return navigate('#/settings'); }
    const btn = e.currentTarget;
    busy(btn, true, 'Claude analysiert …');
    try {
      aiResult = await aiInsights(s, written);
      el.querySelector('#ai-out').innerHTML = aiList(aiResult);
    } catch (err) {
      toast(`KI-Fehler: ${err.message}`);
    }
    busy(btn, false);
  });
}

const stat = (label, value) => `<div class="card stat"><div class="label">${label}</div><div class="value">${value}</div></div>`;
const aiList = (items) => `<div class="stack" style="gap:12px; margin-top:18px">${items.map((i) => `<div class="card" style="box-shadow:none; padding:14px"><b>${esc(i.title)}</b><div class="small muted">${esc(i.text)}</div></div>`).join('')}</div>`;
