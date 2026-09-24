import { store, uid } from '../store.js';
import { POST_TYPES, POST_TEMPLATES } from '../data.js';
import { localIdeas, toDu } from '../generator.js';
import { createDraft } from '../plan.js';
import { aiEnabled, aiIdeas } from '../ai.js';
import { esc, typeLabel, busy, toast } from '../ui.js';

let filter = { pillarId: '', type: '' };
let fresh = [];
let tab = 'neu';

export function render(el, { navigate }) {
  const s = store.get();
  if (!fresh.length) fresh = localIdeas(s, { ...filter, count: 9 });
  const saved = s.ideas.filter((i) => i.saved);
  const list = tab === 'neu' ? fresh : saved;

  el.innerHTML = `
    <div class="card" style="margin-bottom:20px">
      <div class="row">
        <label class="field" style="min-width:220px">Content-Pillar
          <select id="f-pillar"><option value="">Alle Pillars</option>
            ${s.pillars.map((p) => `<option value="${p.id}" ${filter.pillarId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
          </select></label>
        <label class="field" style="min-width:220px">Post-Typ
          <select id="f-type"><option value="">Alle meine Typen</option>
            ${POST_TYPES.map((t) => `<option value="${t.id}" ${filter.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select></label>
        <span class="spacer"></span>
        <button class="btn" id="gen-local">Aus Vorlagen</button>
        <button class="btn btn-primary" id="gen-ai" ${aiEnabled(s) ? '' : 'title="API-Schlüssel in den Einstellungen hinterlegen"'}>Mit Claude generieren</button>
      </div>
      ${!s.onboarded ? '<p class="small muted" style="margin:12px 0 0">Tipp: Mit abgeschlossener <a href="#/strategy">Strategie</a> werden die Ideen auf Zielgruppe und Pillars zugeschnitten.</p>' : ''}
    </div>

    <div class="tabs">
      <button class="${tab === 'neu' ? 'on' : ''}" data-tab="neu">Vorschläge (${fresh.length})</button>
      <button class="${tab === 'saved' ? 'on' : ''}" data-tab="saved">Gespeichert (${saved.length})</button>
      <button class="${tab === 'vorlagen' ? 'on' : ''}" data-tab="vorlagen">Post-Vorlagen (${POST_TEMPLATES.length})</button>
    </div>

    ${tab === 'vorlagen' ? templateGrid(s, filter.type)
      : list.length ? `<div class="grid g3">${list.map((i) => card(i, s)).join('')}</div>`
      : `<div class="empty"><p>Noch keine gespeicherten Ideen. Speichere Vorschläge mit ☆.</p></div>`}`;

  const rerender = () => render(el, { navigate });
  el.querySelector('#f-pillar').addEventListener('change', (e) => { filter.pillarId = e.target.value; fresh = []; rerender(); });
  el.querySelector('#f-type').addEventListener('change', (e) => { filter.type = e.target.value; fresh = []; rerender(); });
  el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; rerender(); }));
  el.querySelector('#gen-local').addEventListener('click', () => { fresh = localIdeas(s, { ...filter, count: 9 }); tab = 'neu'; rerender(); });
  el.querySelector('#gen-ai').addEventListener('click', async (e) => {
    if (!aiEnabled(s)) { toast('Bitte zuerst einen API-Schlüssel in den Einstellungen hinterlegen.'); return navigate('#/settings'); }
    const btn = e.currentTarget;
    busy(btn, true, 'Claude schreibt Ideen …');
    try {
      const pillar = s.pillars.find((p) => p.id === filter.pillarId);
      const raw = await aiIdeas(s, { pillar, type: filter.type, count: 9 });
      fresh = raw.map((r) => ({
        id: uid(), hook: r.hook, angle: r.angle,
        type: POST_TYPES.some((t) => t.id === r.type) ? r.type : filter.type || 'story',
        pillarId: filter.pillarId || s.pillars.find((p) => p.name === r.pillar)?.id || '',
        source: 'ki', createdAt: Date.now(),
      }));
      tab = 'neu';
      rerender();
    } catch (err) {
      busy(btn, false);
      toast(`KI-Fehler: ${err.message}`);
    }
  });

  el.querySelectorAll('[data-tpl]').forEach((b) =>
    b.addEventListener('click', () => {
      const t = POST_TEMPLATES.find((x) => x.id === b.dataset.tpl);
      const d = createDraft({ text: s.voice.address === 'du' ? toDu(t.text) : t.text, type: t.type, pillarId: filter.pillarId });
      navigate(`#/write?draft=${d.id}`);
    }),
  );

  el.querySelectorAll('[data-save]').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.save;
      store.update((st) => {
        const existing = st.ideas.find((i) => i.id === id);
        if (existing) existing.saved = !existing.saved;
        else st.ideas.unshift({ ...fresh.find((i) => i.id === id), saved: true });
      });
      rerender();
    }),
  );
  el.querySelectorAll('[data-write]').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.write;
      const idea = fresh.find((i) => i.id === id) || s.ideas.find((i) => i.id === id);
      store.update((st) => { if (!st.ideas.some((i) => i.id === id)) st.ideas.unshift({ ...idea, saved: false }); });
      navigate(`#/write?idea=${id}`);
    }),
  );
}

function card(i, s) {
  const pillar = s.pillars.find((p) => p.id === i.pillarId);
  const saved = s.ideas.some((x) => x.id === i.id && x.saved);
  return `<div class="idea-card">
    <div class="meta">${pillar ? `<span class="tag blue">${esc(pillar.name)}</span>` : ''}<span class="tag">${esc(typeLabel(i.type))}</span>${i.source === 'ki' ? '<span class="tag green">KI</span>' : ''}</div>
    <div class="hook">${esc(i.hook)}</div>
    ${i.angle ? `<div class="small muted">${esc(i.angle)}</div>` : ''}
    <div class="row"><button class="link" data-write="${i.id}">Post schreiben →</button><span class="spacer"></span>
      <button class="icon-btn" data-save="${i.id}" title="${saved ? 'Gespeichert' : 'Speichern'}">${saved ? '★' : '☆'}</button></div>
  </div>`;
}

function templateGrid(s, type) {
  const list = POST_TEMPLATES.filter((t) => !type || t.type === type);
  if (!list.length) return '<div class="empty"><p>Keine Vorlage für diesen Post-Typ.</p></div>';
  return `<div class="grid g3">${list.map((t) => `<div class="idea-card">
    <div class="meta"><span class="tag">${esc(typeLabel(t.type))}</span></div>
    <b>${esc(t.name)}</b>
    <div class="small muted tpl-preview">${esc(s.voice.address === 'du' ? toDu(t.text) : t.text)}</div>
    <div><button class="link" data-tpl="${t.id}">Vorlage verwenden →</button></div>
  </div>`).join('')}</div>`;
}
