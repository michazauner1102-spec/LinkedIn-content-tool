import { store, uid } from '../store.js';
import { VIRAL_POSTS, NICHES, POST_TYPES } from '../data.js';
import { esc, fmtNum, typeLabel, copyText, openModal, toast } from '../ui.js';
import { getDaily, loadDaily, fmtDate } from '../daily.js';

let tab = 'daily';
let q = '';
let niche = null;
let type = '';
let sort = 'likes';
const open = new Set();

export function analyze(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  const first = lines[0] || '';
  const last = lines[lines.length - 1] || '';
  const out = [];
  if (/\d/.test(first)) out.push('Zahl im Hook');
  if (first.split(/\s+/).length <= 12) out.push('Kurzer Hook');
  if (/^[„"«]/.test(first)) out.push('Zitat-Einstieg');
  if (/unpopulär|niemand|hör(en Sie)? auf|falsch|mythos/i.test(first)) out.push('Kontroverse / Pattern-Interrupt');
  if (lines.filter((l) => /^(\d+[.)]|→|•|-|✅|[0-9]️⃣)/.test(l.trim())).length >= 3) out.push('Liste / Schritte');
  if (lines.length && lines.reduce((a, l) => a + l.length, 0) / lines.length < 60) out.push('Kurze Zeilen');
  if (/\?\s*$/.test(last)) out.push('Frage als CTA');
  if (/kommentier|speicher|teil|♻️/i.test(last)) out.push('Handlungsaufforderung');
  if (/\b(ich|mir|mein)\b/i.test(text)) out.push('Persönliche Perspektive');
  return out.slice(0, 5);
}

export function render(el, { navigate }) {
  const s = store.get();
  if (niche === null) niche = s.profile.niche || '';

  const daily = getDaily();
  if (daily === undefined) loadDaily().then(() => { if (el.isConnected) render(el, { navigate }); });
  const dailyPosts = daily?.posts || [];
  const source = tab === 'lib' ? VIRAL_POSTS : tab === 'swipe' ? s.swipe : dailyPosts;
  const list = source
    .filter((p) => !niche || p.niche === niche)
    .filter((p) => !type || p.type === type)
    .filter((p) => !q || `${p.text} ${p.author}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (tab === 'daily' ? (b.foundAt || '').localeCompare(a.foundAt || '') : 0) || (b[sort] || 0) - (a[sort] || 0));

  el.innerHTML = `
    <div class="tabs">
      <button class="${tab === 'daily' ? 'on' : ''}" data-tab="daily">Täglich neu (${dailyPosts.length})</button>
      <button class="${tab === 'lib' ? 'on' : ''}" data-tab="lib">Beispiel-Vorlagen (${VIRAL_POSTS.length})</button>
      <button class="${tab === 'swipe' ? 'on' : ''}" data-tab="swipe">Mein Swipe-File (${s.swipe.length})</button>
    </div>
    <div class="card" style="margin-bottom:18px">
      <div class="row">
        <input type="search" id="q" placeholder="Suchen nach Stichwort, Hook, Autor …" value="${esc(q)}" style="max-width:340px">
        <select id="type" style="max-width:220px"><option value="">Alle Post-Typen</option>
          ${POST_TYPES.map((t) => `<option value="${t.id}" ${type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}</select>
        <select id="sort" style="max-width:200px">
          <option value="likes" ${sort === 'likes' ? 'selected' : ''}>Meiste Reaktionen</option>
          <option value="comments" ${sort === 'comments' ? 'selected' : ''}>Meiste Kommentare</option>
          <option value="reposts" ${sort === 'reposts' ? 'selected' : ''}>Meiste Reposts</option>
        </select>
        <span class="spacer"></span>
        <button class="btn btn-primary" id="add">+ Post zum Swipe-File</button>
      </div>
      <div class="chips" style="margin-top:14px">
        <button class="chip ${!niche ? 'on' : ''}" data-niche="">Alle Nischen</button>
        ${NICHES.map((n) => `<button class="chip ${niche === n.id ? 'on' : ''}" data-niche="${n.id}">${n.label}</button>`).join('')}
      </div>
      ${tab === 'daily' ? `<p class="tiny" style="margin:12px 0 0">Echte LinkedIn-Posts, jeden Morgen per Web-Recherche gesucht und analysiert. ${daily?.updatedAt ? `Zuletzt aktualisiert: ${esc(fmtDate(daily.updatedAt))}.` : ''} Zahlen stammen aus der öffentlichen Ansicht und können abweichen.</p>` : ''}
      ${tab === 'lib' ? '<p class="tiny" style="margin:12px 0 0">Die Bibliothek enthält fiktive Beispiel-Posts, die bewährte virale Muster veranschaulichen. Echte Fundstücke aus deinem Feed legst du im Swipe-File ab – sie werden automatisch analysiert.</p>' : ''}
    </div>

    ${list.length ? `<div class="masonry">${list.map((p) => card(p, tab, daily?.latest)).join('')}</div>` : `
      <div class="empty"><p>${
        tab === 'daily' ? (daily === undefined ? 'Lade die Posts von heute …' : dailyPosts.length ? 'Keine Posts für diese Filter – wähle „Alle Nischen“.' : 'Noch keine Posts aus der täglichen Recherche vorhanden.')
        : tab === 'lib' ? 'Keine Posts für diese Filter.' : 'Sammle Posts, die dich inspirieren: Text aus LinkedIn kopieren und hier einfügen.'}</p></div>`}`;

  const rerender = () => render(el, { navigate });
  el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; rerender(); }));
  el.querySelectorAll('[data-niche]').forEach((b) => b.addEventListener('click', () => { niche = b.dataset.niche; rerender(); }));
  const qi = el.querySelector('#q');
  qi.addEventListener('input', () => {
    q = qi.value;
    const pos = qi.selectionStart;
    rerender();
    const n = el.querySelector('#q');
    n.focus();
    n.setSelectionRange(pos, pos);
  });
  el.querySelector('#type').addEventListener('change', (e) => { type = e.target.value; rerender(); });
  el.querySelector('#sort').addEventListener('change', (e) => { sort = e.target.value; rerender(); });
  el.querySelector('#add').addEventListener('click', () => addModal(s, rerender));

  el.querySelectorAll('[data-expand]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.expand;
    open.has(id) ? open.delete(id) : open.add(id);
    rerender();
  }));
  el.querySelectorAll('[data-use]').forEach((b) => b.addEventListener('click', () => navigate(`#/write?viral=${b.dataset.use}`)));
  el.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => copyText(source.find((p) => p.id === b.dataset.copy).text)));
  el.querySelectorAll('[data-keep]').forEach((b) => b.addEventListener('click', () => {
    const p = source.find((x) => x.id === b.dataset.keep);
    store.update((st) => {
      if (!st.swipe.some((x) => x.url && x.url === p.url)) st.swipe.unshift({ ...p, id: `s${uid()}`, own: true });
    });
    toast('Im Swipe-File gespeichert');
  }));
  el.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    store.update((st) => { st.swipe = st.swipe.filter((p) => p.id !== b.dataset.del); });
    rerender();
  }));
}

function card(p, tab, latest) {
  const isOpen = open.has(p.id);
  const nicheLabel = NICHES.find((n) => n.id === p.niche)?.label;
  const metric = (v, label) => (v == null ? '' : `<span>${fmtNum(v)} ${label}</span>`);
  return `<div class="card viral-card">
    <div class="row" style="flex-wrap:nowrap; align-items:flex-start">
      <div style="min-width:0; flex:1"><div style="font-weight:600">${esc(p.author || 'Unbekannt')}</div><div class="tiny">${esc(p.role || nicheLabel || '')}</div></div>
      ${tab === 'daily' && p.foundAt === latest ? '<span class="tag blue">Neu</span>' : ''}</div>
    <div class="text ${isOpen ? '' : 'clamp'}">${esc(p.text)}</div>
    ${p.text.split('\n').length > 7 || p.text.length > 400 ? `<button class="btn btn-ghost btn-sm" style="align-self:flex-start" data-expand="${p.id}">${isOpen ? 'Weniger' : '… mehr anzeigen'}</button>` : ''}
    <div class="metrics">${metric(p.likes, 'Reaktionen')}${metric(p.comments, 'Kommentare')}${metric(p.reposts, 'Reposts')}<span>${esc(typeLabel(p.type))}</span>${tab === 'daily' && nicheLabel ? `<span>${esc(nicheLabel)}</span>` : ''}</div>
    ${(p.why || []).length ? `<div><div class="tiny" style="margin-bottom:6px">Warum es funktioniert</div><div class="why">${p.why.map((w) => `<span class="tag blue">${esc(w)}</span>`).join('')}</div></div>` : ''}
    ${p.note ? `<div class="small muted">Notiz: ${esc(p.note)}</div>` : ''}
    ${/^https:\/\//.test(p.url || '') ? `<div class="tiny">${p.foundAt ? `Gefunden am ${esc(fmtDate(p.foundAt))} · ` : ''}<a href="${esc(p.url)}" target="_blank" rel="noopener">Original auf LinkedIn ansehen ↗</a></div>` : ''}
    <div class="row">
      <button class="link" data-use="${p.id}">Als Vorlage nutzen →</button><span class="spacer"></span>
      ${tab === 'daily' ? `<button class="btn btn-sm btn-ghost" data-keep="${p.id}">Merken</button>` : ''}
      <button class="btn btn-sm btn-ghost" data-copy="${p.id}">Kopieren</button>
      ${tab === 'swipe' ? `<button class="btn btn-sm btn-ghost btn-danger" data-del="${p.id}">Entfernen</button>` : ''}
    </div>
  </div>`;
}

function addModal(s, done) {
  const m = openModal(`
    <div class="modal-head"><h2>Post zum Swipe-File hinzufügen</h2><button class="icon-btn" data-close>✕</button></div>
    <form id="f" class="stack">
      <label class="field">Post-Text <span class="hint">Aus LinkedIn kopieren und einfügen</span><textarea name="text" rows="8" required></textarea></label>
      <div class="grid g2">
        <label class="field">Autor<input type="text" name="author" placeholder="Name des Creators"></label>
        <label class="field">Reaktionen<input type="number" name="likes" min="0" placeholder="z. B. 850"></label>
        <label class="field">Kommentare<input type="number" name="comments" min="0"></label>
        <label class="field">Reposts<input type="number" name="reposts" min="0"></label>
        <label class="field">Nische<select name="niche">${NICHES.map((n) => `<option value="${n.id}" ${s.profile.niche === n.id ? 'selected' : ''}>${n.label}</option>`).join('')}</select></label>
        <label class="field">Post-Typ<select name="type">${POST_TYPES.map((t) => `<option value="${t.id}">${t.label}</option>`).join('')}</select></label>
      </div>
      <label class="field">Notiz <span class="hint">Was gefällt dir daran?</span><input type="text" name="note"></label>
      <div class="row"><span class="spacer"></span><button type="button" class="btn" data-close>Abbrechen</button><button class="btn btn-primary">Speichern & analysieren</button></div>
    </form>`, { narrow: true });
  m.el.querySelector('#f').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    store.update((st) => st.swipe.unshift({
      id: `s${uid()}`, own: true, author: f.author.trim(), text: f.text.trim(), niche: f.niche, type: f.type, note: f.note.trim(),
      likes: Number(f.likes) || 0, comments: Number(f.comments) || 0, reposts: Number(f.reposts) || 0, why: analyze(f.text),
    }));
    tab = 'swipe';
    m.close();
    toast('Im Swipe-File gespeichert');
    done();
  });
}
