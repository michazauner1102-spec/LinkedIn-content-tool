// Einheitlicher Weg zu Claude: mit API-Schlüssel direkt per API,
// ohne Schlüssel als Prompt zum Kopieren (claude.ai) – die Antwort wird hier wieder eingefügt.

import { aiEnabled, runPrompt, promptAsText, parseJSONArray, parseJSONObject } from './ai.js';
import { esc, openModal, copyText, busy, toast } from './ui.js';

const CLAUDE_URL = 'https://claude.ai/new';

export async function assist(s, prompt, { title = 'Prompt für Claude', btn, busyLabel, onResult }) {
  if (aiEnabled(s)) {
    busy(btn, true, busyLabel);
    try {
      onResult(await runPrompt(s, prompt));
    } catch (err) {
      toast(`KI-Fehler: ${err.message}`);
    } finally {
      busy(btn, false);
    }
    return;
  }
  promptModal({
    title,
    text: promptAsText(prompt),
    hint: prompt.web
      ? 'Kein API-Schlüssel hinterlegt. Kopiere den Prompt in Claude (Websuche aktivieren) und füge die Antwort unten ein.'
      : 'Kein API-Schlüssel hinterlegt. Kopiere den Prompt, füge ihn in Claude ein und übernimm die Antwort unten.',
    answer: {
      placeholder: prompt.json ? 'Antwort von Claude hier einfügen (das JSON) …' : 'Antwort von Claude hier einfügen …',
      apply: (raw) => onResult(prompt.json === 'object' ? parseJSONObject(raw) : prompt.json ? parseJSONArray(raw) : raw.trim()),
    },
  });
}

// Prompt-Fenster; ohne `answer` nur zum Kopieren (z. B. für Claude Design)
export function promptModal({ title, text, hint, answer, openLabel = 'Claude öffnen ↗', openUrl = CLAUDE_URL }) {
  const m = openModal(`
    <div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Schließen">✕</button></div>
    ${hint ? `<p class="muted small" style="margin-top:0">${esc(hint)}</p>` : ''}
    <label class="field">Prompt
      <textarea id="pm-prompt" rows="12" readonly>${esc(text)}</textarea></label>
    <div class="row" style="margin:12px 0 4px">
      <button class="btn btn-primary" id="pm-copy">Prompt kopieren</button>
      <a class="btn" id="pm-open" href="${esc(openUrl)}" target="_blank" rel="noopener">${esc(openLabel)}</a>
      <span class="tiny">Tipp: „Claude öffnen“ kopiert den Prompt automatisch mit.</span>
    </div>
    ${answer ? `
      <label class="field" style="margin-top:16px">Antwort von Claude
        <textarea id="pm-answer" rows="8" placeholder="${esc(answer.placeholder)}"></textarea></label>
      <div class="row" style="margin-top:12px"><span class="spacer"></span>
        <button class="btn" data-close>Abbrechen</button>
        <button class="btn btn-primary" id="pm-apply">Antwort übernehmen</button></div>` : ''}`, { narrow: true });

  const copy = () => copyText(text).catch(() => {
    const ta = m.el.querySelector('#pm-prompt');
    ta.focus();
    ta.select();
  });
  m.el.querySelector('#pm-copy').addEventListener('click', copy);
  m.el.querySelector('#pm-open').addEventListener('click', copy);
  m.el.querySelector('#pm-apply')?.addEventListener('click', () => {
    const raw = m.el.querySelector('#pm-answer').value;
    if (!raw.trim()) return toast('Bitte zuerst die Antwort von Claude einfügen.');
    try {
      answer.apply(raw);
      m.close();
      toast('Übernommen');
    } catch (err) {
      toast(`Antwort konnte nicht übernommen werden: ${err.message}`);
    }
  });
  return m;
}
