import { store } from '../store.js';
import { checkPost } from '../generator.js';
import { weekPlan, createDraft } from '../plan.js';
import { esc, typeLabel, startOfWeek, addDays, sameDay, DAY_NAMES } from '../ui.js';

let weekOffset = 0;
let statusFilter = 'alle';

export function render(el, { navigate }) {
  const s = store.get();
  const ws = addDays(startOfWeek(), weekOffset * 7);
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const plan = weekPlan(s, ws);
  const today = new Date();
  const fmt = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
  const drafts = s.drafts.filter((d) => statusFilter === 'alle' || d.status === statusFilter);

  el.innerHTML = `
    <div class="card" style="margin-bottom:20px">
      <div class="card-head">
        <h2>Content-Kalender</h2>
        <div class="row">
          <button class="btn btn-sm" data-w="-1">←</button>
          <button class="btn btn-sm" data-w="0">Diese Woche</button>
          <button class="btn btn-sm" data-w="1">→</button>
          <span class="small muted">${fmt(days[0])} – ${fmt(days[6])}</span>
        </div>
      </div>
      <div class="cal">
        ${days.map((d) => {
          const posts = s.drafts.filter((p) => p.scheduledAt && sameDay(new Date(p.scheduledAt), d)).sort((a, b) => a.scheduledAt - b.scheduledAt);
          const slot = plan.find((p) => sameDay(p.date, d));
          return `<div class="cal-day ${sameDay(d, today) ? 'today' : ''}">
            <div class="dh"><span>${DAY_NAMES[(d.getDay() + 6) % 7]} ${d.getDate()}.</span>${slot && !posts.length ? '<span title="Laut Wochenplan">geplant</span>' : ''}</div>
            ${posts.map((p) => `<div class="cal-post ${p.status === 'veröffentlicht' ? 'published' : ''}" data-open="${p.id}">
              <div class="t">${new Date(p.scheduledAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
              ${esc((p.text.split('\n').find((l) => l.trim()) || 'Leerer Entwurf').slice(0, 70))}</div>`).join('')}
            ${slot && !posts.length ? `<button class="btn btn-sm btn-ghost" style="margin-top:auto; white-space:normal; text-align:left" data-slot="${d.toISOString()}">+ ${esc(slot.pillar.name)}<br><span class="tiny">${esc(typeLabel(slot.type))}</span></button>`
              : `<button class="btn btn-sm btn-ghost" style="margin-top:auto" data-slot="${d.toISOString()}">+ Post</button>`}
          </div>`;
        }).join('')}
      </div>
      <p class="tiny" style="margin:12px 0 0">„geplant“ = Vorschlag aus deinem Wochenplan (${s.voice.perWeek} Posts/Woche). LinkedIn-Posting erfolgt manuell: Text kopieren und als veröffentlicht markieren.</p>
    </div>

    <div class="card">
      <div class="card-head"><h2>Alle Entwürfe</h2>
        <div class="chips">${['alle', 'entwurf', 'geplant', 'veröffentlicht'].map((f) => `<button class="chip ${statusFilter === f ? 'on' : ''}" data-f="${f}">${f[0].toUpperCase() + f.slice(1)}</button>`).join('')}</div></div>
      ${drafts.length ? drafts.map((d) => {
        const pillar = s.pillars.find((p) => p.id === d.pillarId);
        const score = d.text.trim() ? checkPost(d.text, s).score : 0;
        return `<div class="draft-row">
                    <div class="txt"><p><b>${esc(d.text.split('\n').find((l) => l.trim()) || 'Leerer Entwurf')}</b></p>
            <div class="row small muted" style="gap:8px; margin-top:4px">
              <span class="tag ${d.status === 'veröffentlicht' ? 'green' : d.status === 'geplant' ? 'blue' : ''}">${esc(d.status)}</span>
              ${pillar ? `<span>${esc(pillar.name)}</span>` : ''}
              ${d.scheduledAt ? `<span>${new Date(d.scheduledAt).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}</span>` : ''}
              <span>Score ${score}</span></div></div>
          <a class="btn btn-sm" href="#/write?draft=${d.id}">Bearbeiten</a>
        </div>`;
      }).join('') : '<div class="empty"><p>Noch keine Entwürfe.</p><a class="btn btn-primary" href="#/write?new=1">Ersten Post schreiben</a></div>'}
    </div>`;

  const rerender = () => render(el, { navigate });
  el.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => {
    const v = Number(b.dataset.w);
    weekOffset = v === 0 ? 0 : weekOffset + v;
    rerender();
  }));
  el.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { statusFilter = b.dataset.f; rerender(); }));
  el.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => navigate(`#/write?draft=${b.dataset.open}`)));
  el.querySelectorAll('[data-slot]').forEach((b) => b.addEventListener('click', () => {
    const d = new Date(b.dataset.slot);
    const slot = plan.find((p) => sameDay(p.date, d));
    d.setHours(8, 30, 0, 0);
    const draft = createDraft({ scheduledAt: +d, status: 'geplant', pillarId: slot?.pillar.id || '', type: slot?.type || '' });
    navigate(`#/write?draft=${draft.id}`);
  }));
}
