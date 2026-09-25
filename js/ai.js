// KI-Anbindung über das offizielle Anthropic TypeScript/JS SDK (direkt im Browser).
// Der API-Schlüssel wird nur lokal gespeichert und direkt an api.anthropic.com gesendet.

import { POST_TYPES, POST_STRUCTURES, CTA_GOALS } from './data.js';
import { audienceLabel } from './generator.js';

export const MODELS = [
  { id: 'claude-opus-5', name: 'Claude Opus 5 (empfohlen)' },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5 (schneller, günstiger)' },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5 (am schnellsten)' },
];

const SDK_URLS = ['https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk/+esm', 'https://esm.sh/@anthropic-ai/sdk'];
let clientCache = { key: null, client: null };

async function loadSdk() {
  let lastErr;
  for (const url of SDK_URLS) {
    try {
      return await import(url);
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`Anthropic SDK konnte nicht geladen werden (${lastErr?.message || 'Netzwerk'}).`);
}

async function getClient(apiKey) {
  if (clientCache.key === apiKey && clientCache.client) return clientCache.client;
  const mod = await loadSdk();
  const Anthropic = mod.default || mod.Anthropic;
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  clientCache = { key: apiKey, client };
  return client;
}

export function aiEnabled(s) {
  return Boolean(s.settings.apiKey && s.settings.apiKey.trim());
}

function strategyContext(s) {
  const typeLabels = s.postTypes.map((id) => POST_TYPES.find((t) => t.id === id)?.label).filter(Boolean);
  const cta = CTA_GOALS.find((c) => c.id === s.voice.ctaGoal)?.label;
  return [
    `Autor: ${s.profile.name || 'unbekannt'}${s.profile.role ? `, ${s.profile.role}` : ''}${s.profile.company ? ` bei ${s.profile.company}` : ''}.`,
    s.profile.offer ? `Angebot: ${s.profile.offer}` : '',
    `Nische: ${s.profile.niche || 'nicht angegeben'}.`,
    `Zielgruppe: ${s.audience.who || audienceLabel(s)}.`,
    s.audience.pains.length ? `Schmerzpunkte der Zielgruppe: ${s.audience.pains.join('; ')}.` : '',
    s.audience.goals.length ? `Ziele der Zielgruppe: ${s.audience.goals.join('; ')}.` : '',
    s.audience.objections ? `Typische Einwände: ${s.audience.objections}.` : '',
    s.pillars.length ? `Content-Pillars: ${s.pillars.map((p) => p.name).join('; ')}.` : '',
    typeLabels.length ? `Bevorzugte Post-Typen: ${typeLabels.join('; ')}.` : '',
    `Tonalität: ${s.voice.tones.join(', ') || 'nahbar, klar'}. Ansprache: „${s.voice.address}". Emojis: ${s.voice.emojis}. Sprache: ${s.voice.language}.`,
    cta ? `Hauptziel der Posts: ${cta}.` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

const STYLE_RULES = `Regeln für LinkedIn-Posts:
- Erste Zeile ist der Hook: 6–14 Wörter, konkret, weckt Neugier. Die ersten ~200 Zeichen müssen vor dem „…mehr" fesseln.
- Kurze Absätze (1–3 Zeilen), viel Weißraum, kurze Sätze.
- Kein Markdown (LinkedIn rendert es nicht). Listen mit →, Zahlen oder Emojis.
- 800–1.800 Zeichen, außer der Post-Typ verlangt weniger.
- Keine externen Links im Text, höchstens 3 Hashtags am Ende (oder keine).
- Ende mit einer klaren Frage oder Handlungsaufforderung passend zum Hauptziel.
- Erfinde keine konkreten Kundennamen. Wo echte Zahlen oder Erlebnisse des Autors nötig sind, setze [Platzhalter in eckigen Klammern].`;

async function ask(s, system, user) {
  const client = await getClient(s.settings.apiKey.trim());
  const model = s.settings.model || 'claude-opus-5';
  const params = {
    model,
    max_tokens: 16000,
    system,
    messages: [{ role: 'user', content: user }],
  };
  if (model !== 'claude-haiku-4-5') params.output_config = { effort: 'medium' };

  let response;
  if (model === 'claude-opus-5') {
    // Bei einer Ablehnung durch Sicherheitsklassifikatoren übernimmt serverseitig ein Ersatzmodell.
    response = await client.beta.messages.create({
      ...params,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
  } else {
    response = await client.messages.create(params);
  }

  if (response.stop_reason === 'refusal') {
    throw new Error('Die Anfrage wurde vom Modell abgelehnt. Bitte formuliere sie anders.');
  }
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

export function parseJSONArray(text) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('Antwort konnte nicht gelesen werden – es fehlt die JSON-Liste.');
  return JSON.parse(text.slice(start, end + 1));
}

// ---------- Prompt-Bausteine (werden per API gesendet oder im Prompt-Modus angezeigt) ----------

export function ideasPrompt(s, { pillar, type, count = 6 }) {
  const typeIds = POST_TYPES.map((t) => t.id).join(', ');
  return {
    json: true,
    system: `Du bist ein erfahrener LinkedIn-Ghostwriter und Content-Stratege für den DACH-Raum.\n\n${strategyContext(s)}`,
    user: `Erstelle ${count} frische, konkrete Post-Ideen.
${pillar ? `Alle Ideen zum Content-Pillar „${pillar.name}“.` : 'Verteile die Ideen über die Content-Pillars.'}
${type ? `Post-Typ für alle Ideen: ${type}.` : 'Nutze die bevorzugten Post-Typen.'}

Jede Idee braucht einen fertig formulierten Hook (erste Zeile) und einen Satz zum Blickwinkel/Inhalt.
Antworte ausschließlich mit einem JSON-Array ohne weiteren Text im Format:
[{"hook": "...", "angle": "...", "type": "<eine von: ${typeIds}>", "pillar": "<exakter Pillar-Name>"}]`,
  };
}

export function writePrompt(s, { hook, angle, type, pillarName }) {
  const structure = POST_STRUCTURES[type]?.join(' → ') || '';
  return {
    system: `Du bist ein erfahrener LinkedIn-Ghostwriter.\n\n${strategyContext(s)}\n\n${STYLE_RULES}`,
    user: `Schreibe einen vollständigen LinkedIn-Post.
Hook: ${hook}
Blickwinkel: ${angle || '-'}
Post-Typ: ${POST_TYPES.find((t) => t.id === type)?.label || type || '-'}${structure ? ` (Struktur: ${structure})` : ''}
Content-Pillar: ${pillarName || '-'}

Gib nur den Post-Text zurück, ohne Einleitung oder Kommentar.`,
  };
}

export function rewritePrompt(s, text, instruction) {
  return {
    system: `Du bist ein erfahrener LinkedIn-Editor.\n\n${strategyContext(s)}\n\n${STYLE_RULES}`,
    user: `Überarbeite diesen LinkedIn-Post. Aufgabe: ${instruction}

Gib nur den überarbeiteten Post-Text zurück, ohne Einleitung.

--- POST ---
${text}`,
  };
}

export function hooksPrompt(s, text) {
  return {
    json: true,
    system: `Du bist Experte für LinkedIn-Hooks.\n\n${strategyContext(s)}`,
    user: `Schlage 5 alternative erste Zeilen (Hooks) für diesen Post vor, jeweils mit einer anderen Hook-Formel (z. B. Zahl, Gegenthese, Szene, Ergebnis, Frage).
Antworte ausschließlich mit einem JSON-Array von Strings.

--- POST ---
${text}`,
  };
}

export function adaptPrompt(s, post) {
  return {
    system: `Du bist ein erfahrener LinkedIn-Ghostwriter.\n\n${strategyContext(s)}\n\n${STYLE_RULES}`,
    user: `Hier ist ein Post, dessen Struktur gut funktioniert${(post.why || []).length ? ` (Gründe: ${post.why.join(', ')})` : ''}.
Übernimm NUR die Struktur und Mechanik – nicht den Inhalt oder Formulierungen – und schreibe einen neuen, eigenständigen Post für meine Nische und Zielgruppe.

Gib nur den neuen Post-Text zurück.

--- VORLAGE ---
${post.text}`,
  };
}

export function insightsPrompt(s, drafts) {
  const sample = drafts
    .slice(0, 12)
    .map((d, i) => `#${i + 1} (${d.type || '-'}): ${d.text.slice(0, 400)}`)
    .join('\n\n');
  return {
    json: true,
    system: `Du bist ein LinkedIn-Content-Stratege.\n\n${strategyContext(s)}`,
    user: `Analysiere meine Strategie${drafts.length ? ' und meine letzten Entwürfe' : ''} und gib mir 5 konkrete, umsetzbare Insights: Was fehlt im Content-Mix, welche Themen würden bei meiner Zielgruppe besonders ziehen, welche Hooks sollte ich testen?
Antworte ausschließlich mit einem JSON-Array: [{"title": "...", "text": "..."}]
${sample ? `\n--- ENTWÜRFE ---\n${sample}` : ''}`,
  };
}

// Ein Prompt als ein zusammenhängender Text zum Einfügen in Claude (claude.ai)
export function promptAsText({ system, user }) {
  return `${system}\n\n---\n\n${user}`;
}

// Prompt per API ausführen; bei JSON-Prompts wird die Liste geparst
export async function runPrompt(s, prompt) {
  const raw = await ask(s, prompt.system, prompt.user);
  return prompt.json ? parseJSONArray(raw) : raw;
}

export const aiIdeas = (s, opts) => runPrompt(s, ideasPrompt(s, opts));
export const aiWritePost = (s, opts) => runPrompt(s, writePrompt(s, opts));
export const aiRewrite = (s, text, instruction) => runPrompt(s, rewritePrompt(s, text, instruction));
export const aiHooks = (s, text) => runPrompt(s, hooksPrompt(s, text));
export const aiAdaptViral = (s, post) => runPrompt(s, adaptPrompt(s, post));
export const aiInsights = (s, drafts) => runPrompt(s, insightsPrompt(s, drafts));

export { strategyContext };
