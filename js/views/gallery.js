import { store, uid } from '../store.js';
import { GRAPHIC_TEMPLATES, THEMES, FORMATS, VISUALS, NICHES } from '../data.js';
import { renderGraphic, downloadCanvas, canvasesToPdf } from '../graphics.js';
import { esc, openModal, toast, fmtNum } from '../ui.js';
import { getDaily, loadDaily } from '../daily.js';
import { postImages } from './viral.js';
import { promptModal } from '../assist.js';
import { graphicDesignPrompt, carouselDesignPrompt, referenceDesignPrompt } from '../designprompt.js';

let tab = 'templates';
let selected = 0;
let visualFilter = '';

const tplById = (id) => GRAPHIC_TEMPLATES.find((t) => t.id === id) || GRAPHIC_TEMPLATES[0];

function optsFor(s, fields, extra = {}) {
  const g = s.graphicPrefs;
  return {
    theme: g.theme,
    format: g.format,
    fields,
    author: g.showAuthor ? s.profile.name || 'Dein Name' : '',
    handle: g.handle || [s.profile.role, s.profile.company].filter(Boolean).join(' · '),
    ...extra,
  };
}

export function render(el, { navigate, params }) {
  if (params?.get('tab') === 'viral') {
    tab = 'viral';
    history.replaceState(null, '', '#/gallery');
  }
  const s = store.get();
  const g = s.graphicPrefs;
  const daily = getDaily();
  if (daily === undefined) loadDaily().then(() => { if (el.isConnected) render(el, { navigate }); });
  const refs = collectRefs(s, daily);

  el.innerHTML = `
    <div class="tabs">
      <button class="${tab === 'templates' ? 'on' : ''}" data-tab="templates">Grafik-Vorlagen</button>
      <button class="${tab === 'viral' ? 'on' : ''}" data-tab="viral">Aus viralen Posts (${refs.length})</button>
      <button class="${tab === 'carousel' ? 'on' : ''}" data-tab="carousel">Carousel-Builder (${s.carousel.slides.length})</button>
    </div>
    <div class="card" style="margin-bottom:18px">
      <div class="row" style="gap:18px">
        <div><div class="tiny" style="margin-bottom:6px">Farbwelt</div>
          <div class="swatches">${THEMES.map((t) => `<button class="swatch ${g.theme === t.id ? 'on' : ''}" title="${t.name}" data-theme="${t.id}" style="background:linear-gradient(135deg, ${t.bg}, ${t.bg2}); box-shadow: inset 0 0 0 6px ${t.bg}, inset 0 0 0 9px ${t.accent}"></button>`).join('')}</div></div>
        <label class="field" style="min-width:220px">Format
          <select id="fmt">${FORMATS.map((f) => `<option value="${f.id}" ${g.format === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}</select></label>
        <label class="field" style="min-width:240px">Untertitel im Footer
          <input type="text" id="handle" value="${esc(g.handle)}" placeholder="${esc([s.profile.role, s.profile.company].filter(Boolean).join(' · ') || 'z. B. Gründer · Firma')}"></label>
        <label class="row small" style="gap:6px; margin-top:18px"><input type="checkbox" id="showAuthor" ${g.showAuthor ? 'checked' : ''}> Name im Footer anzeigen</label>
      </div>
    </div>
    <div id="tab-body"></div>`;

  const rerender = () => render(el, { navigate });
  el.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; rerender(); }));
  el.querySelectorAll('[data-theme]').forEach((b) => b.addEventListener('click', () => { store.update((st) => { st.graphicPrefs.theme = b.dataset.theme; }); rerender(); }));
  el.querySelector('#fmt').addEventListener('change', (e) => { store.update((st) => { st.graphicPrefs.format = e.target.value; }); rerender(); });
  el.querySelector('#handle').addEventListener('change', (e) => { store.update((st) => { st.graphicPrefs.handle = e.target.value; }); rerender(); });
  el.querySelector('#showAuthor').addEventListener('change', (e) => { store.update((st) => { st.graphicPrefs.showAuthor = e.target.checked; }); rerender(); });

  const body = el.querySelector('#tab-body');
  if (tab === 'templates') templates(body, s, rerender);
  else if (tab === 'viral') viralRefs(body, s, refs, daily, rerender);
  else carousel(body, s, rerender);
}

// Alle Bilder aus der täglichen Recherche und dem Swipe-File
function collectRefs(s, daily) {
  const posts = [...(daily?.posts || []).map((p) => ({ ...p, source: 'daily' })), ...s.swipe.map((p) => ({ ...p, source: 'swipe' }))];
  const seen = new Set();
  const refs = [];
  for (const post of posts) {
    for (const img of postImages(post)) {
      if (seen.has(img.url)) continue;
      seen.add(img.url);
      refs.push({ post, img, visual: VISUALS.find((v) => v.id === post.visual) || VISUALS.find((v) => v.id === 'other') });
    }
  }
  return refs;
}

function viralRefs(body, s, refs, daily, rerender) {
  const used = VISUALS.filter((v) => refs.some((r) => r.visual.id === v.id));
  const list = refs.filter((r) => !visualFilter || r.visual.id === visualFilter);
  body.innerHTML = `
    <p class="muted small" style="margin:0 0 12px">Grafiken und Bilder aus viralen Posts – aus der täglichen Recherche und deinem Swipe-File. Sie gehören den jeweiligen Urhebern: nutze sie als Inspiration und baue sie mit einer eigenen Vorlage oder mit Claude Design im eigenen Stil nach.</p>
    ${used.length > 1 ? `<div class="chips" style="margin-bottom:16px"><button class="chip ${!visualFilter ? 'on' : ''}" data-vf="">Alle</button>${used.map((v) => `<button class="chip ${visualFilter === v.id ? 'on' : ''}" data-vf="${v.id}">${esc(v.label)}</button>`).join('')}</div>` : ''}
    ${list.length ? `<div class="ref-grid">${list.map((r, i) => `
      <div class="ref-item" data-ref="${i}">
        <img src="${esc(r.img.url)}" alt="${esc(r.img.alt || r.visual.label)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.ref-item').remove()">
        <div class="cap">
          <div class="row" style="gap:6px"><span class="tag blue">${esc(r.visual.label)}</span>${r.post.source === 'swipe' ? '<span class="tag">Swipe-File</span>' : ''}</div>
          <div class="small"><b>${esc(r.post.author || 'Unbekannt')}</b>${NICHES.find((n) => n.id === r.post.niche) ? ` · ${esc(NICHES.find((n) => n.id === r.post.niche).label)}` : ''}${r.post.likes != null ? ` · ${fmtNum(r.post.likes)} Reaktionen` : ''}</div>
          <div class="row" style="gap:6px">
            ${r.visual.tpl ? `<button class="btn btn-sm" data-ref-tpl="${i}">Eigene Vorlage</button>` : ''}
            <button class="btn btn-sm" data-ref-prompt="${i}">Prompt für Claude Design</button>
          </div>
          ${/^https:\/\//.test(r.post.url || '') ? `<a class="tiny" href="${esc(r.post.url)}" target="_blank" rel="noopener">Original auf LinkedIn ↗</a>` : ''}
        </div>
      </div>`).join('')}</div>`
      : `<div class="empty"><p>${daily === undefined ? 'Lade Grafiken …' : 'Noch keine Grafiken vorhanden. Sie kommen aus der täglichen Recherche – oder lade im Swipe-File (Virale Posts) eigene Screenshots hoch.'}</p>
        <a class="btn" href="#/viral">Zu den viralen Posts</a></div>`}`;

  body.querySelectorAll('[data-vf]').forEach((b) => b.addEventListener('click', () => { visualFilter = b.dataset.vf; rerender(); }));
  body.querySelectorAll('[data-ref-tpl]').forEach((b) => b.addEventListener('click', () => {
    const r = list[Number(b.dataset.refTpl)];
    const tpl = tplById(r.visual.tpl);
    editModal(s, tpl, { ...tpl.fields }, rerender);
  }));
  body.querySelectorAll('[data-ref-prompt]').forEach((b) => b.addEventListener('click', () => {
    const r = list[Number(b.dataset.refPrompt)];
    designModal(referenceDesignPrompt(s, r.post, r.img, r.visual), 'Nachbauen mit Claude Design');
  }));
}

function templates(body, s, rerender) {
  body.innerHTML = `
    <p class="muted small" style="margin:0 0 14px">Die Grafik-Formate, die auf LinkedIn am häufigsten genutzt werden. Klicke auf eine Vorlage, passe den Text an und lade sie als PNG herunter.</p>
    <div class="gallery">
      ${GRAPHIC_TEMPLATES.map((t) => `<div class="g-item" data-open="${t.id}" tabindex="0"><canvas data-thumb="${t.id}"></canvas>
        <div class="cap"><b>${esc(t.name)}</b><small>${esc(t.desc)}</small></div></div>`).join('')}
    </div>`;
  body.querySelectorAll('[data-thumb]').forEach((c) => {
    const t = tplById(c.dataset.thumb);
    renderGraphic(c, t, optsFor(s, t.fields));
  });
  body.querySelectorAll('[data-open]').forEach((it) => {
    const go = () => editModal(s, tplById(it.dataset.open), { ...tplById(it.dataset.open).fields }, rerender);
    it.addEventListener('click', go);
    it.addEventListener('keydown', (e) => e.key === 'Enter' && go());
  });
}

// Feldbeschriftungen je Vorlage: [Titel, Untertitel, Punkte, Punkte 2]
const LABELS = {
  mythfact: ['Mythos', 'Fakt'],
  beforeafter: ['Vorher', 'Nachher'],
  stat: ['Zahl', 'Erklärung'],
  tweet: ['Post-Text', 'Name im Post'],
  quote: ['Zitat', 'Quelle (optional)'],
  dodont: ['Titel', '', 'Do’s', 'Don’ts'],
  kpis: ['Titel', '', 'Kennzahlen – je Zeile: Wert|Beschriftung'],
  compare: ['Titel', 'Spaltenköpfe: A|B', 'Zeilen – je Zeile: Kriterium|A|B'],
  testimonial: ['Zitat des Kunden', 'Name / Firma'],
  tip: ['Tipp', 'Label'],
  announcement: ['Titel', 'Datum · Ort', 'Handlungsaufforderung'],
  progress: ['Titel', '', 'Balken – je Zeile: Beschriftung|Prozent'],
  faq: ['Frage', 'Antwort'],
  lesson: ['Zeitraum / Zahl', 'Erkenntnis'],
  ctaslide: ['Titel', '', 'Aufforderungen'],
};

function fieldInputs(tpl, fields) {
  const f = tpl.fields;
  const [lt = 'Titel / Haupttext', ls = 'Untertitel', li = 'Punkte', li2 = 'Punkte 2'] = (LABELS[tpl.id] || []).map((x) => x || undefined);
  const parts = [`<label class="field">${esc(lt)}<textarea data-f="title" rows="3">${esc(fields.title ?? '')}</textarea></label>`];
  if ('subtitle' in f) parts.push(`<label class="field">${esc(ls)}<textarea data-f="subtitle" rows="2">${esc(fields.subtitle ?? '')}</textarea></label>`);
  if ('items' in f) parts.push(`<label class="field">${esc(li)} <span class="hint">Ein Eintrag pro Zeile</span><textarea data-f="items" rows="5">${esc(fields.items ?? '')}</textarea></label>`);
  if ('items2' in f) parts.push(`<label class="field">${esc(li2)} <span class="hint">Ein Eintrag pro Zeile</span><textarea data-f="items2" rows="4">${esc(fields.items2 ?? '')}</textarea></label>`);
  return parts.join('');
}

function editModal(s, tpl, fields, rerender) {
  const m = openModal(`
    <div class="modal-head"><h2>${esc(tpl.name)}</h2><button class="icon-btn" data-close>✕</button></div>
    <div class="g-editor">
      <div class="stack">${fieldInputs(tpl, fields)}
        <div class="row">
          <button class="btn btn-primary" id="dl">PNG herunterladen</button>
          <button class="btn" id="to-car">+ Zum Carousel</button>
          <button class="btn" id="cd-prompt">Prompt für Claude Design</button>
        </div>
        <p class="tiny">Tipp: Grafik + Post-Text zusammen posten. Das Bild stoppt den Scroll, der Text liefert den Kontext.</p>
      </div>
      <div><canvas id="cv"></canvas></div>
    </div>`);
  const cv = m.el.querySelector('#cv');
  const draw = () => renderGraphic(cv, tpl, optsFor(s, fields));
  m.el.querySelectorAll('[data-f]').forEach((inp) => inp.addEventListener('input', () => { fields[inp.dataset.f] = inp.value; draw(); }));
  m.el.querySelector('#dl').addEventListener('click', () => downloadCanvas(cv, `postlab-${tpl.id}`));
  m.el.querySelector('#cd-prompt').addEventListener('click', () => {
    m.close();
    designModal(graphicDesignPrompt(s, tpl, fields), 'Grafik mit Claude Design');
  });
  m.el.querySelector('#to-car').addEventListener('click', () => {
    store.update((st) => st.carousel.slides.push({ id: uid(), tpl: tpl.id, fields: { ...fields } }));
    toast('Zum Carousel hinzugefügt');
    m.close();
    rerender();
  });
  draw();
}

const STARTER = [
  { tpl: 'cover', fields: { title: '5 Fehler, die Sie auf LinkedIn Reichweite kosten', subtitle: 'Wischen →' } },
  { tpl: 'mythfact', fields: { title: 'Mehr Hashtags = mehr Reichweite', subtitle: '3 passende Hashtags reichen völlig. Mehr wirkt wie Spam.' } },
  { tpl: 'list', fields: { title: 'Ein guter Hook …', items: 'hat maximal 14 Wörter\nweckt Neugier\nspricht ein Problem an\nsteht allein in der ersten Zeile' } },
  { tpl: 'stat', fields: { title: '60 Min.', subtitle: 'In der ersten Stunde entscheidet sich, wie weit ein Post ausgespielt wird.' } },
  { tpl: 'ctaslide', fields: { title: 'Welchen Fehler machen Sie noch?', items: 'Speichern für später\nTeilen mit Ihrem Team\nFolgen für mehr Tipps' } },
];

function carousel(body, s, rerender) {
  const slides = s.carousel.slides;
  if (selected >= slides.length) selected = Math.max(0, slides.length - 1);
  const cur = slides[selected];
  const pageOpts = (i) => (s.carousel.pageNumbers ? { page: `${i + 1}/${slides.length}` } : {});

  body.innerHTML = `
    <div class="card">
      <div class="card-head"><h2>Carousel-Builder</h2>
        <div class="row">
          <label class="row small" style="gap:6px"><input type="checkbox" id="pn" ${s.carousel.pageNumbers ? 'checked' : ''}> Seitenzahlen</label>
          ${slides.length ? '<button class="btn" id="car-prompt">Prompt für Claude Design</button><button class="btn" id="pngs">Alle als PNG</button><button class="btn btn-primary" id="pdf">Als PDF exportieren</button>' : ''}
        </div></div>
      <p class="muted small" style="margin-top:0">LinkedIn-Carousels werden als PDF-Dokument hochgeladen. Empfohlen: Hochformat 1080×1350, 5–10 Slides, Cover mit großem Versprechen, letzte Slide mit CTA.</p>
      <div class="slides">
        ${slides.map((sl, i) => `<div class="slide-thumb ${i === selected ? 'on' : ''}" data-sel="${i}"><span class="num">${i + 1}</span><canvas data-sl="${i}"></canvas></div>`).join('')}
        <button class="slide-add" id="add-slide">+ Slide</button>
      </div>
      ${!slides.length ? `<div class="empty"><p>Noch keine Slides. Starte mit einer Vorlage oder füge Grafiken aus der Galerie hinzu.</p>
        <button class="btn btn-primary" id="starter">Beispiel-Carousel laden</button></div>` : ''}
    </div>
    ${cur ? `
    <div class="card" style="margin-top:18px">
      <div class="g-editor">
        <div class="stack">
          <label class="field">Layout
            <select id="sl-tpl">${GRAPHIC_TEMPLATES.map((t) => `<option value="${t.id}" ${cur.tpl === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}</select></label>
          ${fieldInputs(tplById(cur.tpl), cur.fields)}
          <div class="row">
            <button class="btn btn-sm" data-mv="-1" ${selected === 0 ? 'disabled' : ''}>← Nach vorn</button>
            <button class="btn btn-sm" data-mv="1" ${selected === slides.length - 1 ? 'disabled' : ''}>Nach hinten →</button>
            <button class="btn btn-sm" id="dup">Duplizieren</button>
            <button class="btn btn-sm btn-danger" id="rm">Löschen</button>
          </div>
        </div>
        <div><canvas id="cv"></canvas></div>
      </div>
    </div>` : ''}`;

  const drawThumbs = () => body.querySelectorAll('[data-sl]').forEach((c) => {
    const i = Number(c.dataset.sl);
    const sl = slides[i];
    renderGraphic(c, tplById(sl.tpl), optsFor(s, sl.fields, pageOpts(i)));
  });
  drawThumbs();

  const save = () => store.update((st) => { st.carousel.slides = slides; });

  body.querySelector('#pn')?.addEventListener('change', (e) => { store.update((st) => { st.carousel.pageNumbers = e.target.checked; }); rerender(); });
  body.querySelectorAll('[data-sel]').forEach((b) => b.addEventListener('click', () => { selected = Number(b.dataset.sel); rerender(); }));
  body.querySelector('#add-slide').addEventListener('click', () => {
    const base = cur ? tplById(cur.tpl) : tplById('list');
    slides.push({ id: uid(), tpl: base.id, fields: { ...base.fields } });
    selected = slides.length - 1;
    save();
    rerender();
  });
  body.querySelector('#starter')?.addEventListener('click', () => {
    store.update((st) => {
      st.carousel.slides = STARTER.map((x) => ({ id: uid(), tpl: x.tpl, fields: { ...x.fields } }));
      st.graphicPrefs.format = 'portrait';
    });
    selected = 0;
    rerender();
  });

  if (cur) {
    const cv = body.querySelector('#cv');
    const draw = () => {
      renderGraphic(cv, tplById(cur.tpl), optsFor(s, cur.fields, pageOpts(selected)));
      const thumb = body.querySelector(`[data-sl="${selected}"]`);
      renderGraphic(thumb, tplById(cur.tpl), optsFor(s, cur.fields, pageOpts(selected)));
    };
    draw();
    body.querySelectorAll('[data-f]').forEach((inp) => inp.addEventListener('input', () => { cur.fields[inp.dataset.f] = inp.value; save(); draw(); }));
    body.querySelector('#sl-tpl').addEventListener('change', (e) => {
      const t = tplById(e.target.value);
      cur.tpl = t.id;
      cur.fields = { ...t.fields, title: cur.fields.title || t.fields.title };
      save();
      rerender();
    });
    body.querySelectorAll('[data-mv]').forEach((b) => b.addEventListener('click', () => {
      const to = selected + Number(b.dataset.mv);
      [slides[selected], slides[to]] = [slides[to], slides[selected]];
      selected = to;
      save();
      rerender();
    }));
    body.querySelector('#dup').addEventListener('click', () => {
      slides.splice(selected + 1, 0, { id: uid(), tpl: cur.tpl, fields: { ...cur.fields } });
      selected += 1;
      save();
      rerender();
    });
    body.querySelector('#rm').addEventListener('click', () => {
      slides.splice(selected, 1);
      save();
      rerender();
    });
  }

  const fullCanvases = () => slides.map((sl, i) => {
    const c = document.createElement('canvas');
    renderGraphic(c, tplById(sl.tpl), optsFor(s, sl.fields, pageOpts(i)));
    return c;
  });
  body.querySelector('#car-prompt')?.addEventListener('click', () => {
    designModal(carouselDesignPrompt(s, slides, tplById, s.carousel.pageNumbers), 'Carousel mit Claude Design');
  });
  body.querySelector('#pdf')?.addEventListener('click', () => {
    const blob = canvasesToPdf(fullCanvases());
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'postlab-carousel.pdf';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast('PDF erstellt – auf LinkedIn als „Dokument" hochladen');
  });
  body.querySelector('#pngs')?.addEventListener('click', () => {
    fullCanvases().forEach((c, i) => setTimeout(() => downloadCanvas(c, `postlab-slide-${i + 1}`), i * 250));
  });
}

function designModal(text, title) {
  promptModal({
    title,
    text,
    hint: 'Design-Briefing mit Format, Farben, Texten und Layout. Kopieren und in Claude Design einfügen – Claude gestaltet die Grafik danach frei aus.',
  });
}
