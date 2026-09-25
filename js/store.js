// Lokaler Zustand im Browser (localStorage). Alles bleibt auf dem eigenen Gerät.

const KEY = 'postlab:v1';

const DEFAULT_STATE = {
  profile: { name: '', role: '', company: '', niche: '', offer: '' },
  audience: { who: '', pains: [], goals: [], objections: '' },
  pillars: [], // { id, name, weight }
  postTypes: [], // ids aus POST_TYPES
  voice: { address: 'Sie', tones: [], perWeek: 3, emojis: 'wenig', ctaGoal: 'engagement', language: 'Deutsch' },
  onboarded: false,
  ideas: [], // { id, pillarId, type, hook, angle, saved, createdAt }
  drafts: [], // { id, text, pillarId, type, status, scheduledAt, createdAt, updatedAt }
  swipe: [], // eigene gesammelte Posts: { id, author, text, niche, type, note, likes }
  graphicPrefs: { theme: 'blue', format: 'square', showAuthor: false, handle: '', v: 2 },
  carousel: { slides: [], pageNumbers: true },
  research: { topic: '', result: null, history: [] },
  settings: { apiKey: '', model: 'claude-opus-5' },
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    // v2: Namens-Stempel auf Grafiken ist nicht mehr voreingestellt
    if (parsed.graphicPrefs && parsed.graphicPrefs.v !== 2) Object.assign(parsed.graphicPrefs, { showAuthor: false, v: 2 });
    return deepMerge(structuredClone(DEFAULT_STATE), parsed);
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function deepMerge(base, extra) {
  for (const [k, v] of Object.entries(extra || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      base[k] = deepMerge(base[k], v);
    } else {
      base[k] = v;
    }
  }
  return base;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Speicher nicht verfügbar (privater Modus) – App läuft trotzdem im Arbeitsspeicher weiter.
  }
}

export const store = {
  get: () => state,
  update(fn) {
    fn(state);
    persist();
    listeners.forEach((l) => l(state));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  exportJSON: () => JSON.stringify(state, null, 2),
  importJSON(json) {
    state = deepMerge(structuredClone(DEFAULT_STATE), JSON.parse(json));
    persist();
    listeners.forEach((l) => l(state));
  },
  reset() {
    const keepSettings = state.settings;
    state = structuredClone(DEFAULT_STATE);
    state.settings = keepSettings;
    persist();
    listeners.forEach((l) => l(state));
  },
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
