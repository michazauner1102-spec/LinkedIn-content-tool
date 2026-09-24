// Regelbasierte Ideen-/Entwurfs-Generierung (funktioniert ohne KI-Schlüssel)
// und der Post-Checker.

import { HOOK_FORMULAS, POST_STRUCTURES, POST_TYPES } from './data.js';
import { uid } from './store.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const ZAHLEN = ['3', '5', '7'];
const ZEITEN = ['3 Jahre', '6 Monate', '2 Jahre', 'ein Jahr']; // für „… lang“
const ZEITRAEUME = ['90 Tagen', '6 Monaten', '30 Tagen', '12 Wochen']; // für „in …“

export function audienceLabel(s) {
  return s.audience.label || s.audience.who.split(/[,(]/)[0].trim() || 'Ihre Zielgruppe';
}

export function toDu(text) {
  return text
    .replace(/Hören Sie auf/g, 'Hör auf')
    .replace(/Speichern Sie sich/g, 'Speicher dir')
    .replace(/Speichern Sie/g, 'Speicher')
    .replace(/Teilen Sie/g, 'Teile')
    .replace(/lösen Sie/g, 'löst du')
    .replace(/kostet Sie/g, 'kostet dich')
    .replace(/sagt Ihnen/g, 'sagt dir')
    .replace(/\bIhnen\b/g, 'dir')
    .replace(/\bIhre\b/g, 'deine')
    .replace(/\bIhren\b/g, 'deinen')
    .replace(/\bIhrem\b/g, 'deinem')
    .replace(/\bIhrer\b/g, 'deiner')
    .replace(/\bIhr\b/g, 'dein')
    .replace(/\bSie\b/g, 'du');
}

function fill(tpl, s, pillar) {
  const pains = s.audience.pains.length ? s.audience.pains : ['zu wenig Zeit'];
  const goals = s.audience.goals.length ? s.audience.goals : ['mehr Kunden'];
  let out = tpl
    .replaceAll('{zahl}', pick(ZAHLEN))
    .replaceAll('{thema}', pillar?.name || 'LinkedIn')
    .replaceAll('{zielgruppe}', audienceLabel(s))
    .replaceAll('{schmerz}', pick(pains))
    .replaceAll('{ziel}', pick(goals))
    .replaceAll('{zeitraum}', pick(ZEITRAEUME))
    .replaceAll('{zeit}', pick(ZEITEN));
  if (s.voice.address === 'du') out = toDu(out);
  return out;
}

const ANGLES = {
  story: 'Erzähle eine echte Situation mit einem Kunden oder aus deinem Alltag und das Learning daraus.',
  howto: 'Zeige eine konkrete Anleitung, die deine Zielgruppe heute umsetzen kann.',
  listicle: 'Sammle die wichtigsten Punkte kompakt als Liste – leicht zu speichern.',
  hottake: 'Vertrete eine klare Meinung, der nicht jeder zustimmt, und begründe sie.',
  casestudy: 'Zeige Ausgangslage, Vorgehen und Ergebnis mit echten Zahlen.',
  carousel: 'Baue ein Carousel mit Cover, 4–6 Inhalts-Slides und CTA.',
  mythfact: 'Stelle 3 verbreitete Irrtümer den Fakten gegenüber.',
  lessons: 'Teile, was du über die Zeit gelernt hast – ehrlich und konkret.',
  behindscenes: 'Gib einen ungeschönten Einblick in deinen Arbeitsalltag.',
  beforeafter: 'Mach eine Transformation sichtbar: Vorher, Veränderung, Nachher.',
  poll: 'Stelle eine einfache Frage mit 3–4 Antwortoptionen.',
  framework: 'Gib deiner Methode einen Namen und erkläre die Bausteine.',
};

export function localIdeas(s, { pillarId = '', type = '', count = 6 } = {}) {
  const pillars = s.pillars.length ? s.pillars : [{ id: '', name: 'LinkedIn-Wachstum', weight: 1 }];
  const types = s.postTypes.length ? s.postTypes : POST_TYPES.map((t) => t.id);
  const ideas = [];
  const seen = new Set();
  let guard = 0;
  while (ideas.length < count && guard++ < 80) {
    const pillar = pillarId ? pillars.find((p) => p.id === pillarId) : weightedPick(pillars);
    const t = type || pick(types);
    const formulas = HOOK_FORMULAS.filter((f) => f.types.includes(t));
    const formula = pick(formulas.length ? formulas : HOOK_FORMULAS);
    const hook = fill(formula.tpl, s, pillar);
    if (seen.has(hook)) continue;
    seen.add(hook);
    ideas.push({
      id: uid(),
      pillarId: pillar?.id || '',
      type: t,
      hook,
      angle: ANGLES[t] || '',
      formula: formula.name,
      source: 'vorlage',
      createdAt: Date.now(),
    });
  }
  return ideas;
}

function weightedPick(pillars) {
  const total = pillars.reduce((a, p) => a + (Number(p.weight) || 1), 0);
  let r = Math.random() * total;
  for (const p of pillars) {
    r -= Number(p.weight) || 1;
    if (r <= 0) return p;
  }
  return pillars[0];
}

const CTAS = {
  engagement: 'Wie sehen Sie das? Ich freue mich auf Ihre Meinung in den Kommentaren.',
  leads: 'Wenn Sie das für Ihr Unternehmen umsetzen wollen: Schreiben Sie mir eine Nachricht.',
  follow: 'Folgen Sie mir für mehr Beiträge zu diesem Thema.',
  dm: 'Kommentieren Sie „INFO" und ich schicke Ihnen die Vorlage.',
  traffic: 'Den ausführlichen Leitfaden finden Sie im ersten Kommentar.',
};

export function localDraft(s, idea) {
  const steps = POST_STRUCTURES[idea.type] || POST_STRUCTURES.howto;
  const body = steps
    .slice(1)
    .map((step) => `[${step}]`)
    .join('\n\n');
  let cta = CTAS[s.voice.ctaGoal] || CTAS.engagement;
  if (s.voice.address === 'du') cta = toDu(cta);
  return `${idea.hook}\n\n${body}\n\n${cta}`;
}

export function skeletonFromViral(post, s) {
  const steps = POST_STRUCTURES[post.type] || POST_STRUCTURES.howto;
  const first = post.text.split('\n')[0];
  return `${first}\n\n${steps.slice(1).map((x) => `[${x}]`).join('\n\n')}\n\n— Struktur übernommen von einem Beispiel-Post (${post.why.join(', ')}). Ersetze die Platzhalter durch deine eigenen Inhalte.`;
}

// ---------- Post-Checker ----------

const EMOJI_RE = /\p{Extended_Pictographic}/gu;

export function checkPost(text, s) {
  const t = text.trim();
  const lines = t.split('\n');
  const firstLine = lines.find((l) => l.trim()) || '';
  const hookWords = firstLine.trim().split(/\s+/).filter(Boolean).length;
  const chars = t.length;
  const paragraphs = t.split(/\n\s*\n/).filter((p) => p.trim());
  const longParas = paragraphs.filter((p) => p.length > 280).length;
  const hashtags = (t.match(/#[\p{L}\d_]+/gu) || []).length;
  const emojis = (t.match(EMOJI_RE) || []).length;
  const hasLink = /https?:\/\//i.test(t);
  const lastPara = paragraphs[paragraphs.length - 1] || '';
  const hasCTA = /\?|kommentier|schreib|folg|speicher|teil|nachricht|dm|link|meinung|👇/i.test(lastPara);
  const sentences = t.split(/[.!?]+\s/).filter((x) => x.trim());
  const avgWords = sentences.length ? t.split(/\s+/).length / sentences.length : 0;
  const foldText = t.slice(0, 210);
  const usesSie = /\b(Sie|Ihnen|Ihr)\b/.test(t);
  const usesDu = /\b(du|dir|dich|dein)\b/i.test(t);

  const checks = [
    {
      label: 'Hook (erste Zeile) kurz & stark',
      ok: hookWords > 0 && hookWords <= 14,
      warn: hookWords > 14 && hookWords <= 20,
      tip: hookWords === 0 ? 'Beginne mit einer starken ersten Zeile.' : `${hookWords} Wörter – ideal sind 6–14.`,
      weight: 20,
    },
    {
      label: 'Neugier vor dem „…mehr"',
      ok: foldText.split('\n').filter((l) => l.trim()).length >= 2 && firstLine.length <= 120,
      tip: 'Nutze die ersten ~200 Zeichen für Hook + Spannungsbogen, getrennt durch Zeilenumbrüche.',
      weight: 10,
    },
    {
      label: 'Ideale Länge (800–2.000 Zeichen)',
      ok: chars >= 800 && chars <= 2000,
      warn: (chars >= 400 && chars < 800) || (chars > 2000 && chars <= 3000),
      tip: `${chars} Zeichen. Maximal erlaubt sind 3.000.`,
      weight: 12,
    },
    {
      label: 'Luftige Absätze',
      ok: paragraphs.length >= 4 && longParas === 0,
      warn: longParas === 1,
      tip: longParas ? `${longParas} Absatz/Absätze über 280 Zeichen – aufteilen.` : 'Mehr Absätze und Weißraum machen Posts auf dem Handy lesbarer.',
      weight: 12,
    },
    {
      label: 'Kurze Sätze',
      ok: avgWords > 0 && avgWords <= 16,
      warn: avgWords > 16 && avgWords <= 22,
      tip: `Ø ${avgWords.toFixed(1)} Wörter pro Satz – ideal unter 16.`,
      weight: 10,
    },
    {
      label: 'Call-to-Action am Ende',
      ok: hasCTA,
      tip: 'Beende den Post mit einer Frage oder klaren Aufforderung.',
      weight: 14,
    },
    {
      label: 'Keine externen Links im Text',
      ok: !hasLink,
      tip: 'Links bremsen oft die Reichweite – besser in den ersten Kommentar.',
      weight: 8,
    },
    {
      label: 'Hashtags (0–3)',
      ok: hashtags <= 3,
      warn: hashtags > 3 && hashtags <= 5,
      tip: `${hashtags} Hashtags.`,
      weight: 5,
    },
    {
      label: 'Emoji-Einsatz passend',
      ok: s.voice.emojis === 'keine' ? emojis === 0 : s.voice.emojis === 'wenig' ? emojis <= 6 : emojis <= 15,
      tip: `${emojis} Emojis – deine Vorgabe: ${s.voice.emojis}.`,
      weight: 4,
    },
    {
      label: `Ansprache: „${s.voice.address === 'du' ? 'Du' : 'Sie'}"`,
      ok: s.voice.address === 'du' ? !usesSie || usesDu : !usesDu || usesSie,
      tip: 'Achte auf eine einheitliche Ansprache laut deiner Strategie.',
      weight: 5,
    },
  ];

  if (/\[[^\]]+\]/.test(t)) {
    checks.unshift({ label: 'Platzhalter ausgefüllt', ok: false, tip: 'Es sind noch [Platzhalter] im Text.', weight: 0 });
  }

  let score = 0;
  const totalWeight = checks.reduce((a, c) => a + c.weight, 0);
  for (const c of checks) score += c.ok ? c.weight : c.warn ? c.weight / 2 : 0;
  return { score: t ? Math.round((score / totalWeight) * 100) : 0, checks, chars };
}

// Unicode-Formatierung (LinkedIn unterstützt kein Markdown)
const BOLD_A = 0x1d5d4; // 𝗔
const BOLD_a = 0x1d5ee; // 𝗮
const BOLD_0 = 0x1d7ec; // 𝟬
const ITAL_A = 0x1d608; // 𝘈
const ITAL_a = 0x1d622; // 𝘢

export function toUnicode(text, style) {
  return [...text]
    .map((ch) => {
      const c = ch.codePointAt(0);
      if (c >= 65 && c <= 90) return String.fromCodePoint((style === 'bold' ? BOLD_A : ITAL_A) + c - 65);
      if (c >= 97 && c <= 122) return String.fromCodePoint((style === 'bold' ? BOLD_a : ITAL_a) + c - 97);
      if (style === 'bold' && c >= 48 && c <= 57) return String.fromCodePoint(BOLD_0 + c - 48);
      const umlauts = { ä: 'ä', ö: 'ö', ü: 'ü', Ä: 'Ä', Ö: 'Ö', Ü: 'Ü' };
      if (umlauts[ch]) return toUnicode(umlauts[ch][0], style) + '̈';
      return ch;
    })
    .join('');
}
