// Baut Design-Briefings für Claude Design aus einer Grafik-Vorlage oder einem Carousel.

import { THEMES, FORMATS, NICHES } from './data.js';
import { audienceLabel } from './generator.js';

const LAYOUT = {
  quote: 'Großes Anführungszeichen oben links in der Akzentfarbe, darunter das Zitat sehr groß und fett, die Quelle klein darunter.',
  stat: 'Eine riesige Zahl in der Akzentfarbe als Blickfang, die Erklärung darunter in mittlerer Größe.',
  list: 'Titel oben, darunter eine Checkliste: jeder Punkt mit einem gefüllten Häkchen-Kästchen in der Akzentfarbe.',
  mythfact: 'Zwei gestapelte, abgerundete Felder: oben „Mythos“ gedämpft mit ✕, unten „Fakt“ als Akzentfläche mit ✓.',
  beforeafter: 'Zwei Spalten: links „Vorher“ gedämpft, rechts „Nachher“ als Akzentfläche, dazwischen ein runder Pfeil.',
  framework: 'Titel oben, darunter nummerierte Bausteine (01, 02, 03) als gleich hohe, abgerundete Zeilen; Nummern groß in der Akzentfarbe.',
  hottake: 'Kleines Label als Pill in der Akzentfarbe oben, darunter die Aussage riesig und sehr fett über fast die ganze Fläche.',
  tweet: 'Weiße, abgerundete Karte mit Schatten im Stil eines Social-Media-Posts: Name, „vor 1 Std.“, Post-Text, dezente Reaktionszeile.',
  dodont: 'Titel oben, darunter zwei Spalten: „Do“ als Akzentfläche, „Don’t“ gedämpft, jeweils mit kurzen Punkten.',
  cover: 'Titelseite: sehr große, fette Titelzeile, kurzer Akzentbalken oben links, „Wischen →“ unten rechts in der Akzentfarbe.',
  timeline: 'Titel oben, darunter eine vertikale Linie in der Akzentfarbe mit Punkten; neben jedem Punkt eine Etappe.',
  question: 'Großes Fragezeichen in der Akzentfarbe oben mittig, darunter die Frage zentriert und groß, Aufforderung klein darunter.',
  numbered: 'Titel oben, darunter drei Zeilen mit sehr großen Ziffern (1, 2, 3) in der Akzentfarbe und dem Text daneben.',
  kpis: 'Titel oben, darunter gleich große Kacheln: links die Zahl groß in der Akzentfarbe, rechts die Beschriftung.',
  compare: 'Titel oben, darunter eine Tabelle: erste Spalte Kriterium, zwei Spalten für die Optionen, Kopfzeile als Akzentfläche.',
  testimonial: 'Fünf Sterne in der Akzentfarbe oben, darunter das Kundenzitat groß in Anführungszeichen, Name und Firma klein darunter.',
  tip: 'Label „Tipp des Tages“ als Pill oben, darunter der Tipp groß und fett.',
  mistakes: 'Titel oben, darunter eine Liste: jeder Fehler mit einem runden ✕-Symbol in der Akzentfarbe.',
  announcement: 'Pill „Ankündigung“ oben, großer Titel, Datum und Ort in der Akzentfarbe, Handlungsaufforderung klein unten.',
  progress: 'Titel oben, darunter horizontale Balken mit Beschriftung links und Prozentwert rechts; gefüllter Anteil in der Akzentfarbe.',
  faq: 'Große Buchstaben „F“ und „A“ in der Akzentfarbe links, daneben die Frage (fett) und darunter die Antwort.',
  lesson: 'Zeitraum oder Zahl riesig in der Akzentfarbe, die Erkenntnis darunter fett.',
  ctaslide: 'Letzte Carousel-Slide: große Frage als Titel, darunter die Aufforderungen als breite Pill-Buttons in der Akzentfarbe.',
};

const FIELD_LABELS = {
  title: 'Titel / Haupttext',
  subtitle: 'Untertitel',
  items: 'Punkte',
  items2: 'Punkte (zweite Spalte)',
};

function fieldLines(fields) {
  return Object.entries(fields)
    .filter(([, v]) => String(v || '').trim())
    .map(([k, v]) => {
      const lines = String(v).split('\n').map((x) => x.replace(/\|/g, ' – ').trim()).filter(Boolean);
      return lines.length > 1
        ? `- ${FIELD_LABELS[k] || k}:\n${lines.map((l) => `    • ${l}`).join('\n')}`
        : `- ${FIELD_LABELS[k] || k}: ${lines[0]}`;
    })
    .join('\n');
}

function styleBlock(s, prefs) {
  const theme = THEMES.find((t) => t.id === prefs.theme) || THEMES[0];
  const fmt = FORMATS.find((f) => f.id === prefs.format) || FORMATS[0];
  const niche = NICHES.find((n) => n.id === s.profile.niche)?.label;
  const author = prefs.showAuthor ? [s.profile.name, prefs.handle || [s.profile.role, s.profile.company].filter(Boolean).join(' · ')].filter(Boolean).join(' – ') : '';
  return {
    fmt,
    text: `Format: ${fmt.w} × ${fmt.h} px (${fmt.name.split(' ')[0]}), für LinkedIn.
Farben: Hintergrund ${theme.bg} mit sanftem Verlauf zu ${theme.bg2}, Text ${theme.fg}, Akzent ${theme.accent}.
Typografie: moderne, kräftige Sans-Serif (z. B. Inter), starker Größenkontrast zwischen Titel und Fließtext, linksbündig.
${[niche && `Branche: ${niche}.`, (s.audience.label || s.audience.who) && `Zielgruppe: ${audienceLabel(s)}.`].filter(Boolean).join(' ')}
${author ? `Absender dezent unten links als Text (kein Logo): ${author}.` : 'Kein Absender, kein Name, kein Logo.'}`,
  };
}

const RULES = `Regeln:
- Texte exakt so übernehmen (Rechtschreibung nicht ändern).
- Keine Logos, keine Stock-Icons, keine Emojis, keine Fotos.
- Viel Weißraum, mindestens 8 % Rand; alles muss auf dem Handy lesbar sein (Fließtext mindestens ca. 28 px bei 1080 px Breite).
- Nur die angegebenen Farben verwenden.`;

export function graphicDesignPrompt(s, tpl, fields) {
  const { text } = styleBlock(s, s.graphicPrefs);
  return `Erstelle eine LinkedIn-Grafik im Stil „${tpl.name}“ (${tpl.desc.replace(/\.$/, '')}).

${text}

Layout: ${LAYOUT[tpl.id] || tpl.desc}

Inhalt:
${fieldLines(fields)}

${RULES}

Liefere das fertige Design, exportierbar als PNG.`;
}

export function carouselDesignPrompt(s, slides, tplById, pageNumbers) {
  const { text } = styleBlock(s, s.graphicPrefs);
  const list = slides
    .map((sl, i) => {
      const tpl = tplById(sl.tpl);
      return `Slide ${i + 1} von ${slides.length} – ${tpl.name}
Layout: ${LAYOUT[tpl.id] || tpl.desc}
${fieldLines(sl.fields)}`;
    })
    .join('\n\n');
  return `Erstelle ein LinkedIn-Carousel (Dokument-Post) mit ${slides.length} Slides. Alle Slides im gleichen Design-System, damit sie als Serie wirken.

${text}
${pageNumbers ? 'Seitenzahl klein oben rechts auf jeder Slide (z. B. „2/5“).' : 'Keine Seitenzahlen.'}

${list}

${RULES}

Liefere alle Slides im gleichen Format, exportierbar als PDF (eine Slide pro Seite).`;
}
