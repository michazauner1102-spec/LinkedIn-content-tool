import { store, uid } from '../store.js';
import { NICHES, PILLAR_SUGGESTIONS, AUDIENCE_PRESETS, GENERIC_PAINS, GENERIC_GOALS, POST_TYPES, TONES, CTA_GOALS } from '../data.js';
import { esc, toast } from '../ui.js';

const STEPS = ['Profil', 'Zielgruppe', 'Content-Pillars', 'Post-Typen', 'Tonalität'];
let step = 0;

export function render(el, { navigate }) {
  const s = store.get();
  el.innerHTML = `
    <div class="onb">
      <div class="stepper">
        ${STEPS.map((name, i) => `<button class="step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}" data-step="${i}"><span class="n">${i < step ? '✓' : i + 1}</span>${name}</button>`).join('')}
      </div>
      <div class="card">${[profile, audience, pillars, types, voice][step](s)}
        <div class="row" style="margin-top:28px">
          ${step > 0 ? '<button class="btn" data-nav="-1">← Zurück</button>' : ''}
          <span class="spacer"></span>
          ${step < STEPS.length - 1
            ? '<button class="btn btn-primary" data-nav="1">Weiter →</button>'
            : '<button class="btn btn-primary" data-finish>✓ Strategie speichern</button>'}
        </div>
      </div>
    </div>`;

  const rerender = () => render(el, { navigate });

  el.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => { step = Number(b.dataset.step); rerender(); }));
  el.querySelectorAll('[data-nav]').forEach((b) =>
    b.addEventListener('click', () => {
      const dir = Number(b.dataset.nav);
      if (dir > 0 && !validate(s)) return;
      step += dir;
      rerender();
      window.scrollTo(0, 0);
    }),
  );
  el.querySelector('[data-finish]')?.addEventListener('click', () => {
    if (!validate(s)) return;
    store.update((st) => { st.onboarded = true; });
    step = 0;
    toast('Strategie gespeichert – los geht’s!');
    navigate('#/dashboard');
  });

  // Einfache Text-/Select-Felder: data-bind="profile.name"
  el.querySelectorAll('[data-bind]').forEach((inp) =>
    inp.addEventListener('input', () => {
      const [group, key] = inp.dataset.bind.split('.');
      store.update((st) => { st[group][key] = inp.type === 'number' ? Number(inp.value) : inp.value; });
    }),
  );

  // Chip-Listen: data-toggle="audience.pains" data-value="…"
  el.querySelectorAll('[data-toggle]').forEach((c) =>
    c.addEventListener('click', () => {
      const [group, key] = c.dataset.toggle.split('.');
      const v = c.dataset.value;
      store.update((st) => {
        const arr = group === 'root' ? st[key] : st[group][key];
        const i = arr.indexOf(v);
        i >= 0 ? arr.splice(i, 1) : arr.push(v);
      });
      rerender();
    }),
  );

  // Einzelauswahl: data-pick="voice.address" data-value="du"
  el.querySelectorAll('[data-pick]').forEach((c) =>
    c.addEventListener('click', () => {
      const [group, key] = c.dataset.pick.split('.');
      store.update((st) => { st[group][key] = c.dataset.value; });
      rerender();
    }),
  );

  // Eigene Chips hinzufügen
  el.querySelectorAll('[data-add]').forEach((form) =>
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = form.querySelector('input');
      const v = inp.value.trim();
      if (!v) return;
      const [group, key] = form.dataset.add.split('.');
      store.update((st) => { if (!st[group][key].includes(v)) st[group][key].push(v); });
      rerender();
    }),
  );

  // Nische wählen
  el.querySelector('#niche')?.addEventListener('change', (e) => {
    store.update((st) => { st.profile.niche = e.target.value; });
    rerender();
  });

  el.querySelector('[data-preset]')?.addEventListener('click', () => {
    const p = AUDIENCE_PRESETS[s.profile.niche];
    store.update((st) => {
      st.audience.who = p.who;
      st.audience.pains = [...new Set([...st.audience.pains, ...p.pains])];
      st.audience.goals = [...new Set([...st.audience.goals, ...p.goals])];
    });
    rerender();
  });

  // Pillars
  el.querySelectorAll('[data-pillar-suggest]').forEach((c) =>
    c.addEventListener('click', () => {
      const name = c.dataset.pillarSuggest;
      store.update((st) => {
        const i = st.pillars.findIndex((p) => p.name === name);
        if (i >= 0) st.pillars.splice(i, 1);
        else if (st.pillars.length < 6) st.pillars.push({ id: uid(), name, weight: 2 });
        else toast('Maximal 6 Pillars – Fokus schlägt Vielfalt.');
      });
      rerender();
    }),
  );
  el.querySelector('#pillar-add')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = e.target.querySelector('input').value.trim();
    if (!v) return;
    store.update((st) => { if (st.pillars.length < 6) st.pillars.push({ id: uid(), name: v, weight: 2 }); });
    rerender();
  });
  el.querySelectorAll('[data-pillar-name]').forEach((inp) =>
    inp.addEventListener('input', () => store.update((st) => { st.pillars.find((p) => p.id === inp.dataset.pillarName).name = inp.value; })),
  );
  el.querySelectorAll('[data-pillar-weight]').forEach((sel) =>
    sel.addEventListener('change', () => { store.update((st) => { st.pillars.find((p) => p.id === sel.dataset.pillarWeight).weight = Number(sel.value); }); rerender(); }),
  );
  el.querySelectorAll('[data-pillar-del]').forEach((b) =>
    b.addEventListener('click', () => { store.update((st) => { st.pillars = st.pillars.filter((p) => p.id !== b.dataset.pillarDel); }); rerender(); }),
  );
}

function validate(s) {
  if (step === 0 && !s.profile.name.trim()) return toast('Bitte gib deinen Namen an.'), false;
  if (step === 1 && !s.audience.who.trim() && !s.audience.label?.trim()) return toast('Beschreibe kurz deine Zielgruppe.'), false;
  if (step === 2 && s.pillars.length < 2) return toast('Wähle mindestens 2 Content-Pillars.'), false;
  if (step === 3 && s.postTypes.length < 2) return toast('Wähle mindestens 2 Post-Typen.'), false;
  return true;
}

const chip = (bind, value, on) => `<button class="chip ${on ? 'on' : ''}" data-toggle="${bind}" data-value="${esc(value)}">${on ? '✓ ' : ''}${esc(value)}</button>`;

function profile(s) {
  return `
    <h2>Wer postet hier?</h2>
    <p class="muted" style="margin:0 0 22px">Diese Infos fließen in jede Idee und jeden KI-Entwurf ein.</p>
    <div class="grid g2">
      <label class="field">Name<input type="text" data-bind="profile.name" value="${esc(s.profile.name)}" placeholder="z. B. Micha Zauner"></label>
      <label class="field">Rolle / Position<input type="text" data-bind="profile.role" value="${esc(s.profile.role)}" placeholder="z. B. Gründer & Berater"></label>
      <label class="field">Unternehmen<input type="text" data-bind="profile.company" value="${esc(s.profile.company)}" placeholder="z. B. smartConsulting"></label>
      <label class="field">Nische
        <select id="niche"><option value="">– bitte wählen –</option>
          ${NICHES.map((n) => `<option value="${n.id}" ${s.profile.niche === n.id ? 'selected' : ''}>${n.label}</option>`).join('')}
        </select></label>
    </div>
    <label class="field" style="margin-top:16px">Dein Angebot in einem Satz <span class="hint">Was verkaufst du, und welches Ergebnis bekommt der Kunde?</span>
      <textarea data-bind="profile.offer" rows="2" placeholder="z. B. Ich automatisiere repetitive Aufgaben für Maklerbüros mit KI – DSGVO-konform.">${esc(s.profile.offer)}</textarea></label>`;
}

function audience(s) {
  const pains = [...new Set([...(AUDIENCE_PRESETS[s.profile.niche]?.pains || GENERIC_PAINS), ...s.audience.pains])];
  const goals = [...new Set([...(AUDIENCE_PRESETS[s.profile.niche]?.goals || GENERIC_GOALS), ...s.audience.goals])];
  return `
    <div class="row"><h2>Für wen schreibst du?</h2><span class="spacer"></span>
      ${AUDIENCE_PRESETS[s.profile.niche] ? '<button class="btn btn-sm" data-preset>Vorschlag für meine Nische</button>' : ''}</div>
    <p class="muted" style="margin:4px 0 22px">Je genauer die Zielgruppe, desto relevanter die Posts. Schreib für eine Person, nicht für alle.</p>
    <div class="grid g2">
      <label class="field">Kurzbezeichnung <span class="hint">So wird die Zielgruppe in Hooks genannt</span>
        <input type="text" data-bind="audience.label" value="${esc(s.audience.label || '')}" placeholder="z. B. Makler"></label>
      <label class="field">Typische Einwände <span class="hint">optional</span>
        <input type="text" data-bind="audience.objections" value="${esc(s.audience.objections)}" placeholder="z. B. „KI ist zu teuer“, „Datenschutz“"></label>
    </div>
    <label class="field" style="margin-top:16px">Beschreibung der Zielgruppe
      <textarea data-bind="audience.who" rows="2" placeholder="z. B. Inhaber von Maklerbüros mit 2–20 Mitarbeitenden im DACH-Raum">${esc(s.audience.who)}</textarea></label>
    <h3 style="margin:24px 0 10px">Schmerzpunkte</h3>
    <div class="chips">${pains.map((p) => chip('audience.pains', p, s.audience.pains.includes(p))).join('')}</div>
    <form class="row" data-add="audience.pains" style="margin-top:10px"><input type="text" placeholder="Eigenen Schmerzpunkt hinzufügen" style="max-width:360px"><button class="btn btn-sm">+ Hinzufügen</button></form>
    <h3 style="margin:24px 0 10px">Ziele & Wünsche</h3>
    <div class="chips">${goals.map((p) => chip('audience.goals', p, s.audience.goals.includes(p))).join('')}</div>
    <form class="row" data-add="audience.goals" style="margin-top:10px"><input type="text" placeholder="Eigenes Ziel hinzufügen" style="max-width:360px"><button class="btn btn-sm">+ Hinzufügen</button></form>`;
}

function pillars(s) {
  const suggestions = PILLAR_SUGGESTIONS[s.profile.niche] || Object.values(PILLAR_SUGGESTIONS).flat().slice(0, 12);
  const names = s.pillars.map((p) => p.name);
  const totalW = s.pillars.reduce((a, p) => a + p.weight, 0) || 1;
  return `
    <h2>Deine Content-Pillars</h2>
    <p class="muted" style="margin:4px 0 22px">3–5 Themenfelder, zu denen du wiederkehrend postest. Sie machen dich wiedererkennbar und verhindern leere Seiten.</p>
    <h3 style="margin-bottom:10px">Vorschläge${s.profile.niche ? ' für deine Nische' : ''}</h3>
    <div class="chips">${suggestions.map((n) => `<button class="chip ${names.includes(n) ? 'on' : ''}" data-pillar-suggest="${esc(n)}">${names.includes(n) ? '✓ ' : '+ '}${esc(n)}</button>`).join('')}</div>
    <form id="pillar-add" class="row" style="margin-top:10px"><input type="text" placeholder="Eigenen Pillar hinzufügen" style="max-width:360px"><button class="btn btn-sm">+ Hinzufügen</button></form>
    <h3 style="margin:26px 0 10px">Deine Auswahl & Gewichtung</h3>
    ${s.pillars.length ? `<div class="stack" style="gap:10px">
      ${s.pillars.map((p) => `
        <div class="pillar-row">
          <input type="text" data-pillar-name="${p.id}" value="${esc(p.name)}">
          <select data-pillar-weight="${p.id}">
            ${[[1, 'Selten'], [2, 'Normal'], [3, 'Oft'], [4, 'Sehr oft']].map(([v, l]) => `<option value="${v}" ${p.weight === v ? 'selected' : ''}>${l} · ${Math.round((p.weight / totalW) * 100)}%</option>`).join('')}
          </select>
          <button class="icon-btn" data-pillar-del="${p.id}" aria-label="Entfernen">✕</button>
        </div>`).join('')}
    </div>` : '<p class="muted small">Noch keine Pillars gewählt.</p>'}`;
}

function types(s) {
  return `
    <h2>Welche Post-Typen passen zu dir?</h2>
    <p class="muted" style="margin:4px 0 22px">Wähle 3–6 Formate. Der Wochenplan rotiert automatisch zwischen ihnen.</p>
    <div class="type-grid">
      ${POST_TYPES.map((t) => {
        const on = s.postTypes.includes(t.id);
        return `<div class="type-opt ${on ? 'on' : ''}" data-toggle="root.postTypes" data-value="${t.id}" role="checkbox" aria-checked="${on}" tabindex="0">
          <div><b>${on ? '✓ ' : ''}${t.label}</b><small>${t.desc}</small>
          <div class="dots"><span>Reichweite ${'●'.repeat(t.reach)}${'○'.repeat(5 - t.reach)}</span><span>Vertrauen ${'●'.repeat(t.trust)}${'○'.repeat(5 - t.trust)}</span><span>Leads ${'●'.repeat(t.leads)}${'○'.repeat(5 - t.leads)}</span></div></div>
        </div>`;
      }).join('')}
    </div>`;
}

function voice(s) {
  const pickBtn = (bind, value, label, cur) => `<button class="chip ${cur === value ? 'on' : ''}" data-pick="${bind}" data-value="${value}">${label}</button>`;
  return `
    <h2>Tonalität & Rhythmus</h2>
    <p class="muted" style="margin:4px 0 22px">So klingen deine Posts – und so oft erscheinen sie.</p>
    <h3 style="margin-bottom:10px">Ansprache</h3>
    <div class="chips">${pickBtn('voice.address', 'Sie', 'Sie (förmlich)', s.voice.address)}${pickBtn('voice.address', 'du', 'du (locker)', s.voice.address)}</div>
    <h3 style="margin:22px 0 10px">Tonalität <span class="tiny">(bis zu 3)</span></h3>
    <div class="chips">${TONES.map((t) => chip('voice.tones', t, s.voice.tones.includes(t))).join('')}</div>
    <h3 style="margin:22px 0 10px">Emojis</h3>
    <div class="chips">${['keine', 'wenig', 'viele'].map((v) => pickBtn('voice.emojis', v, v[0].toUpperCase() + v.slice(1), s.voice.emojis)).join('')}</div>
    <h3 style="margin:22px 0 10px">Hauptziel deiner Posts</h3>
    <div class="chips">${CTA_GOALS.map((c) => pickBtn('voice.ctaGoal', c.id, c.label, s.voice.ctaGoal)).join('')}</div>
    <div class="grid g2" style="margin-top:22px">
      <label class="field">Posts pro Woche <span class="hint">Empfehlung: 3 – Konsistenz schlägt Menge</span>
        <input type="number" min="1" max="7" data-bind="voice.perWeek" value="${esc(s.voice.perWeek)}"></label>
      <label class="field">Sprache <input type="text" data-bind="voice.language" value="${esc(s.voice.language)}"></label>
    </div>`;
}
