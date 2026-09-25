import { store } from '../store.js';
import { MODELS, aiRewrite } from '../ai.js';
import { esc, toast, busy } from '../ui.js';

export function render(el, { navigate }) {
  const s = store.get();
  el.innerHTML = `
    <div class="stack" style="max-width:820px">
      <section class="card">
        <h2>KI-Schreibassistent (Claude)</h2>
        <p class="muted small">Optional. <b>Ohne Schlüssel</b> zeigt dir die App bei jeder KI-Funktion den fertigen Prompt – kopieren, in Claude einfügen, Antwort zurück in die App übernehmen. <b>Mit Schlüssel</b> schreibt Claude Posts, Ideen, Hooks und Analysen direkt in der App.</p>
        <div class="grid g2" style="margin-top:14px">
          <label class="field">Anthropic API-Schlüssel <span class="hint">Wird nur in diesem Browser gespeichert und direkt an api.anthropic.com gesendet.</span>
            <input type="password" id="key" value="${esc(s.settings.apiKey)}" placeholder="sk-ant-…" autocomplete="off"></label>
          <label class="field">Modell <span class="hint">&nbsp;</span>
            <select id="model">${MODELS.map((m) => `<option value="${m.id}" ${s.settings.model === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}</select></label>
        </div>
        <div class="row" style="margin-top:14px">
          <button class="btn btn-primary" id="save">Speichern</button>
          <button class="btn" id="test">Verbindung testen</button>
          <a class="small" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">API-Schlüssel erstellen ↗</a>
        </div>
        <p class="tiny" style="margin-top:14px">Hinweis: Der Schlüssel liegt im localStorage deines Browsers. Nutze die App nur auf deinem eigenen Gerät und setze in der Anthropic-Konsole ein Ausgabenlimit.</p>
      </section>

      <section class="card">
        <h2>Daten</h2>
        <p class="muted small">Alle Daten (Strategie, Entwürfe, Swipe-File) bleiben lokal in deinem Browser. Exportiere regelmäßig ein Backup.</p>
        <div class="row" style="margin-top:12px">
          <button class="btn" id="export">Backup exportieren</button>
          <label class="btn">Backup importieren<input type="file" id="import" accept="application/json" hidden></label>
          <span class="spacer"></span>
          <button class="btn btn-danger" id="reset">Alles zurücksetzen</button>
        </div>
      </section>

      <section class="card">
        <h2>Darstellung</h2>
        <div class="chips" style="margin-top:12px">
          ${[['light', 'Hell (Weiß/Grau)'], ['dark', 'Dunkel (Schwarz)']].map(([v, l]) => `<button class="chip ${(localTheme() || 'light') === v ? 'on' : ''}" data-theme="${v}">${l}</button>`).join('')}
        </div>
      </section>
    </div>`;

  el.querySelector('#save').addEventListener('click', () => {
    store.update((st) => {
      st.settings.apiKey = el.querySelector('#key').value.trim();
      st.settings.model = el.querySelector('#model').value;
    });
    toast('Gespeichert');
  });
  el.querySelector('#test').addEventListener('click', async (e) => {
    store.update((st) => {
      st.settings.apiKey = el.querySelector('#key').value.trim();
      st.settings.model = el.querySelector('#model').value;
    });
    if (!store.get().settings.apiKey) return toast('Bitte zuerst einen Schlüssel eintragen.');
    const btn = e.currentTarget;
    busy(btn, true, 'Teste …');
    try {
      await aiRewrite(store.get(), 'Hallo LinkedIn', 'Antworte nur mit dem Wort OK.');
      toast('Verbindung funktioniert');
    } catch (err) {
      toast(`Fehler: ${err.message}`);
    }
    busy(btn, false);
  });
  el.querySelector('#export').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([store.exportJSON()], { type: 'application/json' }));
    a.download = `postlab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  });
  el.querySelector('#import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      store.importJSON(await file.text());
      toast('Backup importiert');
      navigate('#/dashboard');
    } catch {
      toast('Datei konnte nicht gelesen werden');
    }
  });
  el.querySelector('#reset').addEventListener('click', () => {
    if (!confirm('Strategie, Entwürfe, Ideen und Swipe-File löschen? (Der API-Schlüssel bleibt erhalten.)')) return;
    store.reset();
    toast('Zurückgesetzt');
    navigate('#/strategy');
  });
  el.querySelectorAll('[data-theme]').forEach((b) => b.addEventListener('click', () => {
    applyTheme(b.dataset.theme);
    render(el, { navigate });
  }));
}

function localTheme() {
  try { return localStorage.getItem('postlab:theme'); } catch { return null; }
}

export function applyTheme(v) {
  try { v ? localStorage.setItem('postlab:theme', v) : null; } catch { /* ignore */ }
  const t = v ?? localTheme();
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
