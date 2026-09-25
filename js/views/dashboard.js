import { store } from '../store.js';
import { VIRAL_POSTS, ALGO_INSIGHTS, NICHES } from '../data.js';
import { localIdeas, checkPost } from '../generator.js';
import { aiEnabled, aiIdeas } from '../ai.js';
import { weekPlan, pillarMix, balanceScore, createDraft } from '../plan.js';
import { esc, typeLabel, fmtNum, startOfWeek, addDays, DAY_NAMES, busy, toast } from '../ui.js';
import { uid } from '../store.js';
import { getDaily, loadDaily } from '../daily.js';

let dashIdeas = null;

export function render(el, { navigate }) {
  const s = store.get();
  if (!dashIdeas) dashIdeas = localIdeas(s, { count: 3 });

  const weekStart = startOfWeek();
  const weekEnd = addDays(weekStart, 7);
  const scheduledThisWeek = s.drafts.filter((d) => d.scheduledAt && d.scheduledAt >= +weekStart && d.scheduledAt < +weekEnd);
  const scored = s.drafts.filter((d) => d.text.trim().length > 50);
  const avgScore = scored.length ? Math.round(scored.reduce((a, d) => a + checkPost(d.text, s).score, 0) / scored.length) : null;
  const balance = balanceScore(s);
  const plan = weekPlan(s);
  const done = plan.filter((p) => p.post).length;
  const nicheLabel = NICHES.find((n) => n.id === s.profile.niche)?.label;
  const daily = getDaily();
  if (daily === undefined) loadDaily().then(() => { if (el.isConnected) render(el, { navigate }); });
  const byNiche = (arr) => arr.filter((p) => !s.profile.niche || p.niche === s.profile.niche);
  const dailyPosts = daily?.posts || [];
  const fromDaily = (byNiche(dailyPosts).length >= 3 ? byNiche(dailyPosts) : dailyPosts)
    .slice().sort((a, b) => (b.foundAt || '').localeCompare(a.foundAt || '') || (b.likes || 0) - (a.likes || 0));
  const examples = byNiche(VIRAL_POSTS).length >= 3 ? byNiche(VIRAL_POSTS) : VIRAL_POSTS;
  const isLive = fromDaily.length >= 3;
  const viralShow = (isLive ? fromDaily : examples.slice().sort((a, b) => b.likes - a.likes)).slice(0, 3);
  const insight = ALGO_INSIGHTS[new Date().getDate() % ALGO_INSIGHTS.length];

  el.innerHTML = `
    ${!s.onboarded ? `
      <div class="banner">
        <div><div class="t">Schließe deine Content-Strategie ab</div>
        <div class="small muted">Lege Content-Pillars, Zielgruppe und Post-Typen fest – dann werden alle Vorschläge auf dich zugeschnitten.</div></div>
        <a class="btn" href="#/strategy">Jetzt starten</a>
      </div>` : ''}

    <div class="layout-dash">
      <div class="stack">
        <div class="grid g4">
          ${stat('Entwürfe', s.drafts.filter((d) => d.status !== 'veröffentlicht').length, '<a href="#/calendar">Alle ansehen →</a>')}
          ${stat('Geplant diese Woche', `${scheduledThisWeek.length}/${s.voice.perWeek}`, '<a href="#/calendar">Kalender →</a>')}
          ${stat('Ø Post-Score', avgScore ?? '–', avgScore == null ? '<a href="#/write?new=1">Ersten Post schreiben →</a>' : 'aus dem Post-Checker')}
          ${stat('Pillar-Balance', balance == null ? '–' : `${balance}%`, balance == null ? 'noch keine Daten' : '<a href="#/insights">Details →</a>')}
        </div>

        <section class="card">
          <div class="card-head">
            <h2>Post-Ideen für dich</h2>
            <button class="btn btn-ghost" data-act="new-ideas">Neue Ideen</button>
          </div>
          <div class="grid g3" id="dash-ideas">
            ${dashIdeas.map((i) => ideaCard(i, s)).join('')}
          </div>
        </section>

        <section class="card">
          <div class="card-head">
            <h2>Virale Posts${nicheLabel ? ` in „${esc(nicheLabel)}"` : ''}</h2>
            <a class="btn btn-ghost" href="#/viral">Alle ansehen →</a>
          </div>
          <div class="grid g3">
            ${viralShow.map((p) => `
              <div class="creator">
                <div class="who"><div><div class="name">${esc(p.author)}</div><div class="tiny">${esc(p.role)}</div></div></div>
                <div class="excerpt">${esc(p.text)}</div>
                <div class="metrics">${p.likes != null ? `<span>${fmtNum(p.likes)} Reaktionen</span>` : ''}${p.comments != null ? `<span>${fmtNum(p.comments)} Kommentare</span>` : ''}</div>
                <div><button class="link" data-act="use-viral" data-id="${p.id}">Als Vorlage nutzen →</button></div>
              </div>`).join('')}
          </div>
          <p class="tiny" style="margin:12px 0 0">${isLive ? 'Echte Posts aus der täglichen Web-Recherche.' : 'Beispiel-Posts mit fiktiven Autoren – sie zeigen bewährte Strukturen. Echte Posts erscheinen, sobald die tägliche Recherche gelaufen ist.'}</p>
        </section>
      </div>

      <aside class="stack">
        <section class="card">
          <div class="card-head"><h2>Dein Wochenplan</h2><a class="icon-btn" href="#/calendar" aria-label="Kalender">→</a></div>
          <div class="card" style="padding:14px 16px; box-shadow:none">
            <div class="row" style="justify-content:space-between"><b>Wochenfortschritt</b><span class="small muted">${done}/${plan.length} Posts geplant</span></div>
            <div class="progress" style="margin-top:10px"><i style="width:${plan.length ? (done / plan.length) * 100 : 0}%"></i></div>
          </div>
          <div style="margin-top:6px">
            ${plan.map((p, i) => `
              <div class="plan-day">
                <div class="d ${p.post ? 'done' : ''}">${DAY_NAMES[(p.date.getDay() + 6) % 7]}<br>${p.date.getDate()}.</div>
                <div class="info"><b>${esc(p.pillar.name)}</b><span class="small muted">${esc(typeLabel(p.type))}</span></div>
                ${p.post
                  ? `<a class="btn btn-sm" href="#/write?draft=${p.post.id}">Öffnen</a>`
                  : `<button class="btn btn-sm" data-act="plan-write" data-i="${i}">Schreiben</button>`}
              </div>`).join('')}
          </div>
        </section>

        ${s.pillars.length ? `
        <section class="card">
          <div class="card-head"><h3>Content-Mix</h3><span class="tiny">Balken = Ist · Strich = Soll</span></div>
          ${pillarMix(s).map((m) => `
            <div class="bar-row"><span class="name" title="${esc(m.pillar.name)}">${esc(m.pillar.name)}</span>
              <div class="bar"><i style="width:${m.actual * 100}%"></i><span class="target" style="left:${m.target * 100}%"></span></div>
              <span class="tiny">${m.count}</span></div>`).join('')}
        </section>` : ''}

        <section class="card">
          <div class="card-head"><h3>Insight des Tages</h3><a class="icon-btn" href="#/insights">→</a></div>
          <b>${esc(insight.title)}</b>
          <p class="muted small" style="margin:6px 0 0">${esc(insight.text)}</p>
        </section>

        ${!aiEnabled(s) ? `
        <div class="banner info" style="margin:0">
          <div><div class="t">Claude ohne API-Schlüssel nutzen</div><div class="small muted">Bei jeder KI-Funktion bekommst du den fertigen Prompt zum Kopieren in Claude. Mit Schlüssel läuft alles direkt in der App.</div></div>
          <a class="btn btn-sm" href="#/settings">Einrichten</a>
        </div>` : ''}
      </aside>
    </div>`;

  el.querySelector('[data-act="new-ideas"]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (aiEnabled(s)) {
      busy(btn, true, 'Claude denkt nach …');
      try {
        const raw = await aiIdeas(s, { count: 3 });
        dashIdeas = raw.slice(0, 3).map((r) => ({
          id: uid(), hook: r.hook, angle: r.angle, type: r.type,
          pillarId: s.pillars.find((p) => p.name === r.pillar)?.id || '', source: 'ki', createdAt: Date.now(),
        }));
      } catch (err) {
        toast(`KI-Fehler: ${err.message}`);
        dashIdeas = localIdeas(s, { count: 3 });
      }
    } else {
      dashIdeas = localIdeas(s, { count: 3 });
    }
    render(el, { navigate });
  });

  el.querySelectorAll('[data-act="gen-post"]').forEach((b) =>
    b.addEventListener('click', () => {
      const idea = dashIdeas.find((i) => i.id === b.dataset.id);
      store.update((st) => st.ideas.unshift({ ...idea, saved: true }));
      navigate(`#/write?idea=${idea.id}`);
    }),
  );

  el.querySelectorAll('[data-act="use-viral"]').forEach((b) =>
    b.addEventListener('click', () => navigate(`#/write?viral=${b.dataset.id}`)),
  );

  el.querySelectorAll('[data-act="plan-write"]').forEach((b) =>
    b.addEventListener('click', () => {
      const p = plan[Number(b.dataset.i)];
      const when = new Date(p.date);
      when.setHours(8, 30, 0, 0);
      const d = createDraft({ pillarId: p.pillar.id, type: p.type, scheduledAt: +when, status: 'geplant' });
      navigate(`#/write?draft=${d.id}`);
    }),
  );
}

function stat(label, value, sub) {
  return `<div class="card stat"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div>`;
}

function ideaCard(i, s) {
  const pillar = s.pillars.find((p) => p.id === i.pillarId);
  return `<div class="idea-card">
    <div class="meta">${pillar ? `<span class="tag blue">${esc(pillar.name)}</span>` : ''}<span class="tag">${esc(typeLabel(i.type))}</span></div>
    <div class="hook">${esc(i.hook)}</div>
    <div><button class="link" data-act="gen-post" data-id="${i.id}">Post generieren →</button></div>
  </div>`;
}
