// Themen-Recherche ohne KI: ähnliche Posts aus Tages-Feed, Beispielen und Swipe-File finden
// und daraus Struktur- und Grafik-Vorschläge ableiten.

import { VIRAL_POSTS, POST_TYPES, POST_STRUCTURES, HOOK_FORMULAS, VISUALS, GRAPHIC_TEMPLATES } from './data.js';
import { audienceLabel, toDu } from './generator.js';

const STOP = new Set('der die das und oder mit für von auf aus bei ein eine einer eines den dem des im in ist sind wie was wer wir ihr sie ich du zu zum zur als auch nicht noch mehr so man am an es um über unter nach vor bis durch ohne gegen'.split(' '));

// Grafik-Vorschlag je Post-Typ, wenn die gefundenen Posts keine Bildinfo haben
const TYPE_TO_TPL = {
  story: 'quote', howto: 'framework', listicle: 'list', hottake: 'hottake', casestudy: 'kpis', carousel: 'cover',
  mythfact: 'mythfact', lessons: 'lesson', behindscenes: 'tweet', beforeafter: 'beforeafter', poll: 'question', framework: 'framework',
};

// Einfache Heuristik für den Post-Typ aus dem Thema selbst
const TOPIC_HINTS = [
  [/fehler|falsch|vermeiden|nicht mehr/i, 'lessons'],
  [/mythos|mythen|irrtum|wahrheit/i, 'mythfact'],
  [/tipps?|wie |anleitung|schritte?|so geht/i, 'howto'],
  [/zahlen|ergebnis|prozent|%|case|fallstudie|kunde/i, 'casestudy'],
  [/vorher|nachher|transformation/i, 'beforeafter'],
  [/meinung|unpopulär|überschätzt|hot take/i, 'hottake'],
  [/checkliste|liste|\d+ (dinge|gründe|tools)/i, 'listicle'],
  [/framework|modell|methode|prinzip/i, 'framework'],
  [/umfrage|frage an/i, 'poll'],
  [/alltag|hinter den kulissen|einblick/i, 'behindscenes'],
];

export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP.has(w))
    .map((w) => w.slice(0, 6)); // grober Wortstamm: „automatisierung“ ≈ „automatisieren“
}

export function findSimilar(topic, { daily, swipe }) {
  const terms = [...new Set(tokenize(topic))];
  if (!terms.length) return [];
  const pool = [
    ...(daily?.posts || []).map((p) => ({ ...p, source: 'daily' })),
    ...swipe.map((p) => ({ ...p, source: 'swipe' })),
    ...VIRAL_POSTS.map((p) => ({ ...p, source: 'example' })),
  ];
  return pool
    .map((p) => {
      const words = new Set(tokenize(`${p.text} ${(p.why || []).join(' ')} ${p.role || ''}`));
      const hits = terms.filter((t) => words.has(t)).length;
      return { post: p, score: hits / terms.length };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || (b.post.likes || 0) - (a.post.likes || 0))
    .slice(0, 8);
}

const weightedTop = (items) => {
  const m = new Map();
  for (const [key, w] of items) if (key) m.set(key, (m.get(key) || 0) + w);
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
};

export function localSuggestion(s, topic, matches) {
  const w = (p) => 1 + Math.log10(1 + (p.likes || 0));
  const hinted = TOPIC_HINTS.find(([re]) => re.test(topic))?.[1];
  const type = weightedTop(matches.map((m) => [m.post.type, w(m.post) * m.score])) || hinted || s.postTypes[0] || 'howto';
  const visualId = weightedTop(matches.filter((m) => m.post.visual).map((m) => [m.post.visual, w(m.post)]));
  const visual = VISUALS.find((v) => v.id === visualId);
  const tplId = (visual?.tpl) || TYPE_TO_TPL[type] || 'quote';
  const tpl = GRAPHIC_TEMPLATES.find((t) => t.id === tplId) || GRAPHIC_TEMPLATES[0];
  const why = weightedTop(matches.flatMap((m) => (m.post.why || []).map((x) => [x, w(m.post)])));
  const whyList = [...new Set(matches.flatMap((m) => m.post.why || []))].slice(0, 5);

  const fill = (tplText) => {
    const out = tplText
      .replaceAll('{zahl}', '5').replaceAll('{thema}', topic).replaceAll('{zielgruppe}', audienceLabel(s))
      .replaceAll('{schmerz}', s.audience.pains[0] || 'zu wenig Zeit').replaceAll('{ziel}', s.audience.goals[0] || 'mehr Kunden')
      .replaceAll('{zeitraum}', '90 Tagen').replaceAll('{zeit}', '2 Jahre');
    return s.voice.address === 'du' ? toDu(out) : out;
  };
  // Formeln mit {thema} bevorzugen, damit jeder Hook das eingegebene Thema aufgreift
  const withTopic = (f) => f.tpl.includes('{thema}');
  const ordered = [
    ...HOOK_FORMULAS.filter((f) => f.types.includes(type) && withTopic(f)),
    ...HOOK_FORMULAS.filter((f) => !f.types.includes(type) && withTopic(f)),
  ];
  const hooks = [...new Set(ordered.map((f) => fill(f.tpl)))].slice(0, 3);
  const typeLabel = POST_TYPES.find((t) => t.id === type)?.label || type;

  return {
    source: 'lokal',
    posts: matches.map((m) => m.post),
    pattern: matches.length
      ? `Die ähnlichsten Posts sind vor allem „${typeLabel}“-Posts${why ? `; häufigster Erfolgsfaktor: ${why}` : ''}.${whyList.length > 1 ? ` Weitere Muster: ${whyList.filter((x) => x !== why).slice(0, 3).join(', ')}.` : ''}`
      : `Keine ähnlichen Posts in deiner Sammlung gefunden – Vorschlag basiert auf bewährten Mustern für „${typeLabel}“. Für echte Beispiele aus dem Web nutze die Live-Recherche.`,
    structure: { type, steps: (POST_STRUCTURES[type] || POST_STRUCTURES.howto).map((st, i) => (i === 0 ? `${st}: ${hooks[0]}` : st)) },
    hooks,
    graphic: {
      visual: visual?.id || null,
      template: tpl.id,
      why: visual ? `Die erfolgreichsten ähnlichen Posts nutzen „${visual.label}“.` : `Passt zum Post-Typ „${typeLabel}“.`,
      fields: { ...tpl.fields, title: graphicTitle(tpl.id, topic, hooks[0]) },
    },
  };
}

function graphicTitle(tplId, topic, hook) {
  const t = topic.charAt(0).toUpperCase() + topic.slice(1);
  return {
    list: `5 Dinge zu ${t}`, numbered: `Die 3 wichtigsten Punkte zu ${t}`, mistakes: `4 Fehler bei ${t}`,
    framework: `Mein Framework für ${t}`, cover: hook, hottake: hook, quote: hook, question: `Wie gehen Sie mit ${t} um?`,
    kpis: `Ergebnisse: ${t}`, progress: `${t} in Zahlen`, compare: `${t}: Vorher vs. heute`, timeline: `${t} in 5 Schritten`,
  }[tplId] || t;
}

// KI-Ergebnis in dieselbe Form bringen und absichern
export function normalizeResult(raw, topic) {
  const typeOk = (t) => POST_TYPES.some((x) => x.id === t);
  const tpl = GRAPHIC_TEMPLATES.find((t) => t.id === raw?.graphic?.template)
    || GRAPHIC_TEMPLATES.find((t) => t.id === VISUALS.find((v) => v.id === raw?.graphic?.visual)?.tpl)
    || GRAPHIC_TEMPLATES[0];
  const fields = { ...tpl.fields };
  for (const k of Object.keys(fields)) if (typeof raw?.graphic?.fields?.[k] === 'string' && raw.graphic.fields[k].trim()) fields[k] = raw.graphic.fields[k];
  return {
    source: 'claude',
    posts: (Array.isArray(raw?.posts) ? raw.posts : [])
      .filter((p) => p && /^https:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\//.test(p.url || ''))
      .map((p, i) => ({
        id: `r-${Date.now()}-${i}`, author: String(p.author || 'Unbekannt'), url: p.url, text: String(p.excerpt || p.text || ''),
        likes: Number.isFinite(p.likes) ? p.likes : null, comments: Number.isFinite(p.comments) ? p.comments : null,
        type: typeOk(p.type) ? p.type : 'story', visual: VISUALS.some((v) => v.id === p.visual) ? p.visual : null,
        why: Array.isArray(p.why) ? p.why.map(String).slice(0, 4) : [], source: 'web',
      })),
    pattern: String(raw?.pattern || ''),
    structure: {
      type: typeOk(raw?.structure?.type) ? raw.structure.type : 'howto',
      steps: Array.isArray(raw?.structure?.steps) ? raw.structure.steps.map(String) : POST_STRUCTURES.howto,
    },
    hooks: Array.isArray(raw?.hooks) ? raw.hooks.map(String).slice(0, 5) : [],
    graphic: { visual: raw?.graphic?.visual || null, template: tpl.id, why: String(raw?.graphic?.why || ''), fields },
    topic,
  };
}
