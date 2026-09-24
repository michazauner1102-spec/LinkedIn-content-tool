// Statische Wissensbasis: Nischen, Pillar-Vorschläge, Post-Typen, Hook-Formeln,
// Beispiel-Posts (fiktiv) und Richtwerte für Insights.

export const NICHES = [
  { id: 'immobilien', label: 'Immobilien & Makler' },
  { id: 'ki', label: 'KI & Automatisierung' },
  { id: 'sales', label: 'Sales & B2B-Vertrieb' },
  { id: 'marketing', label: 'Marketing & Personal Branding' },
  { id: 'consulting', label: 'Beratung & Freelancing' },
  { id: 'leadership', label: 'Leadership & Unternehmertum' },
  { id: 'recruiting', label: 'HR & Recruiting' },
  { id: 'finance', label: 'Finanzen & Steuern' },
];

export const PILLAR_SUGGESTIONS = {
  immobilien: ['Markt-Updates & Preise', 'Verkäufer-Tipps', 'Käufer-Wissen', 'Hinter den Kulissen', 'Kundenstories & Referenzen', 'Digitalisierung im Maklerbüro', 'Recht & Energieausweis'],
  ki: ['KI-Tools im Alltag', 'Automatisierungs-Workflows', 'Case Studies & Zeitersparnis', 'Mythen über KI', 'Datenschutz & DSGVO', 'Prompt-Tipps', 'Zukunft der Arbeit'],
  sales: ['Prospecting & Kaltakquise', 'Einwandbehandlung', 'Sales-Mindset', 'Deals & Learnings', 'Tools & Tech-Stack', 'Pipeline & KPIs'],
  marketing: ['Content-Strategie', 'Personal Branding', 'Copywriting', 'Analytics & Wachstum', 'Kampagnen-Breakdowns', 'Community-Aufbau'],
  consulting: ['Expertise & Frameworks', 'Kundenerfolge', 'Pricing & Angebote', 'Selbstständigkeit & Learnings', 'Methoden & Tools', 'Meinungen zur Branche'],
  leadership: ['Führung & Teamkultur', 'Unternehmer-Learnings', 'Produktivität', 'Fehler & Scheitern', 'Vision & Strategie', 'Persönliche Geschichten'],
  recruiting: ['Employer Branding', 'Bewerbungstipps', 'Arbeitsmarkt-Trends', 'Interview-Insights', 'Unternehmenskultur', 'Remote & New Work'],
  finance: ['Finanzwissen einfach erklärt', 'Steuer-Tipps', 'Investieren', 'Fehler vermeiden', 'Unternehmensfinanzen', 'Mythen & Fakten'],
};

export const AUDIENCE_PRESETS = {
  immobilien: {
    who: 'Inhaber und Teamleiter von Maklerbüros (2–20 Mitarbeitende) im DACH-Raum',
    pains: ['Zu wenig Zeit für Akquise', 'Repetitive Admin-Aufgaben', 'Abhängigkeit von Portalen', 'Schwache Google-Bewertungen', 'Leads werden nicht nachverfolgt'],
    goals: ['Mehr Eigentümer-Mandate', 'Prozesse automatisieren', 'Regionale Sichtbarkeit', 'Planbarer Umsatz'],
  },
  ki: {
    who: 'Geschäftsführer und Teamleads im Mittelstand, die KI pragmatisch einsetzen wollen',
    pains: ['Unklar, wo man anfangen soll', 'Angst vor Datenschutz-Problemen', 'Zu viele Tools', 'Keine Zeit für Experimente'],
    goals: ['Stunden pro Woche einsparen', 'Wettbewerbsvorteil', 'Team befähigen', 'Messbare Ergebnisse'],
  },
  sales: {
    who: 'SDRs, Account Executives und Vertriebsleiter im B2B',
    pains: ['Niedrige Antwortquoten', 'Lange Sales-Zyklen', 'Ghosting nach dem Angebot', 'Zu wenig qualifizierte Leads'],
    goals: ['Mehr Termine', 'Höhere Abschlussquote', 'Quote erreichen', 'Eigene Marke aufbauen'],
  },
};

export const GENERIC_PAINS = ['Zu wenig Zeit', 'Zu wenig Leads', 'Fehlendes Know-how', 'Zu hohe Kosten', 'Unklare Strategie', 'Keine Sichtbarkeit'];
export const GENERIC_GOALS = ['Mehr Kunden', 'Mehr Sichtbarkeit', 'Zeit sparen', 'Expertenstatus', 'Umsatz steigern', 'Bessere Prozesse'];

export const POST_TYPES = [
  { id: 'story', label: 'Persönliche Story', icon: '📖', desc: 'Erlebnis → Wendepunkt → Learning. Baut Vertrauen auf.', reach: 5, trust: 5, leads: 3 },
  { id: 'howto', label: 'How-to / Anleitung', icon: '🛠️', desc: 'Schritt-für-Schritt-Lösung für ein konkretes Problem.', reach: 4, trust: 4, leads: 4 },
  { id: 'listicle', label: 'Listicle', icon: '📋', desc: '"7 Dinge, die …" – leicht konsumierbar, hohe Speicherrate.', reach: 5, trust: 3, leads: 3 },
  { id: 'hottake', label: 'Hot Take / Meinung', icon: '🔥', desc: 'Kontroverse These, die Diskussion auslöst.', reach: 5, trust: 3, leads: 2 },
  { id: 'casestudy', label: 'Case Study', icon: '📈', desc: 'Ausgangslage → Maßnahme → Ergebnis mit Zahlen.', reach: 3, trust: 5, leads: 5 },
  { id: 'carousel', label: 'Carousel (PDF)', icon: '🎠', desc: 'Mehrseitiges Dokument – ideal für Frameworks.', reach: 4, trust: 4, leads: 4 },
  { id: 'mythfact', label: 'Mythos vs. Fakt', icon: '⚖️', desc: 'Räumt mit Irrtümern Ihrer Branche auf.', reach: 4, trust: 4, leads: 3 },
  { id: 'lessons', label: 'Lessons Learned', icon: '🎓', desc: 'Was X Jahre / ein Fehler dich gelehrt haben.', reach: 4, trust: 5, leads: 3 },
  { id: 'behindscenes', label: 'Hinter den Kulissen', icon: '🎬', desc: 'Einblick in Alltag, Team, Prozesse.', reach: 3, trust: 5, leads: 2 },
  { id: 'beforeafter', label: 'Vorher / Nachher', icon: '🔄', desc: 'Transformation sichtbar machen.', reach: 4, trust: 4, leads: 5 },
  { id: 'poll', label: 'Umfrage / Frage', icon: '📊', desc: 'Community einbinden, Meinungen sammeln.', reach: 3, trust: 2, leads: 2 },
  { id: 'framework', label: 'Framework / Modell', icon: '🧩', desc: 'Eigene Methode mit Namen – macht dich zitierbar.', reach: 4, trust: 5, leads: 4 },
];

export const TONES = ['Nahbar', 'Direkt', 'Humorvoll', 'Analytisch', 'Inspirierend', 'Provokant', 'Ruhig & sachlich', 'Motivierend'];

export const CTA_GOALS = [
  { id: 'engagement', label: 'Kommentare & Diskussion' },
  { id: 'leads', label: 'Leads / Erstgespräche' },
  { id: 'follow', label: 'Follower gewinnen' },
  { id: 'dm', label: 'DMs / Kommentarwort' },
  { id: 'traffic', label: 'Traffic auf Website/Newsletter' },
];

// Hook-Formeln mit Platzhaltern: {zahl} {thema} {zielgruppe} {schmerz} {ziel} {zeit}
export const HOOK_FORMULAS = [
  { id: 'number', name: 'Zahl + Versprechen', tpl: '{zahl} Dinge über {thema}, die {zielgruppe} zu spät lernen:', types: ['listicle', 'lessons', 'carousel'] },
  { id: 'contrarian', name: 'Gegen den Strom', tpl: 'Unpopuläre Meinung: {thema} wird völlig überschätzt.', types: ['hottake', 'mythfact'] },
  { id: 'mistake', name: 'Fehler-Geständnis', tpl: 'Ich habe {zeit} lang den gleichen Fehler bei {thema} gemacht.', types: ['story', 'lessons'] },
  { id: 'result', name: 'Ergebnis zuerst', tpl: 'Von „{schmerz}“ zu „{ziel}“ in {zeitraum}. So lief es ab:', types: ['casestudy', 'beforeafter'] },
  { id: 'howto', name: 'So geht’s', tpl: 'So lösen Sie „{schmerz}“ in 3 Schritten – ohne neues Tool:', types: ['howto', 'framework', 'carousel'] },
  { id: 'question', name: 'Direkte Frage', tpl: 'Ehrliche Frage an alle {zielgruppe}: Warum ist {thema} immer noch so kompliziert?', types: ['poll', 'hottake'] },
  { id: 'myth', name: 'Mythos entlarven', tpl: '„{thema} ist nur was für Große." – Falsch. Hier ist der Beweis:', types: ['mythfact', 'casestudy'] },
  { id: 'story', name: 'Szenen-Einstieg', tpl: 'Dienstag, 7:43 Uhr. Das Telefon klingelt. Ein Kunde mit „{schmerz}“.', types: ['story', 'behindscenes'] },
  { id: 'nobody', name: 'Niemand sagt dir …', tpl: 'Niemand sagt {zielgruppe}, dass {thema} so einfach sein kann.', types: ['lessons', 'howto', 'hottake'] },
  { id: 'stop', name: 'Hör auf mit …', tpl: 'Hören Sie auf, bei {thema} alles manuell zu machen. Es kostet Sie jede Woche Stunden.', types: ['hottake', 'howto'] },
  { id: 'framework', name: 'Benanntes Framework', tpl: 'Das 3-S-Prinzip für {thema} (das ich jedem {zielgruppe}-Kunden zeige):', types: ['framework', 'carousel'] },
  { id: 'behind', name: 'Blick hinter die Kulissen', tpl: 'So sieht {thema} bei uns wirklich aus (kein Hochglanz):', types: ['behindscenes', 'story'] },
];

export const POST_STRUCTURES = {
  story: ['Hook: konkrete Szene', 'Kontext: was war das Problem?', 'Wendepunkt', 'Learning in 1 Satz', 'Frage an die Community'],
  howto: ['Hook: Problem + Versprechen', 'Schritt 1', 'Schritt 2', 'Schritt 3', 'Ergebnis / Beweis', 'CTA'],
  listicle: ['Hook mit Zahl', 'Punkt 1–7 (je 1–2 Zeilen)', 'Bonus-Punkt', 'Welcher Punkt fehlt? (CTA)'],
  hottake: ['These (1 Satz)', 'Warum die meisten es anders sehen', '3 Argumente', 'Einschränkung / Nuance', 'Siehst du das anders?'],
  casestudy: ['Ergebnis-Hook mit Zahl', 'Ausgangslage', 'Was wir gemacht haben (3 Punkte)', 'Ergebnis in Zahlen', 'Was du übernehmen kannst', 'CTA'],
  carousel: ['Cover: großes Versprechen', 'Problem-Slide', '3–6 Inhalts-Slides', 'Zusammenfassung', 'CTA-Slide'],
  mythfact: ['Mythos-Hook', 'Mythos 1 → Fakt', 'Mythos 2 → Fakt', 'Mythos 3 → Fakt', 'Fazit + Frage'],
  lessons: ['Hook: Zeitraum + Erkenntnis', 'Lesson 1', 'Lesson 2', 'Lesson 3', 'Die wichtigste Lesson', 'Frage'],
  behindscenes: ['Hook: "So sieht es wirklich aus"', 'Einblick / Moment', 'Warum wir das so machen', 'Was Kunden davon haben', 'Einladung'],
  beforeafter: ['Hook: Vorher → Nachher', 'Vorher (Schmerz)', 'Die Veränderung', 'Nachher (Ergebnis)', 'Wie du dahin kommst'],
  poll: ['Kontext (2 Sätze)', 'Die Frage', 'Antwortoptionen', 'Warum mich das interessiert'],
  framework: ['Hook: Framework-Name', 'Warum es das braucht', 'Baustein 1', 'Baustein 2', 'Baustein 3', 'So wendest du es an'],
};

// Fiktive Beispiel-Posts, die typische virale Strukturen veranschaulichen.
// Autoren und Zahlen sind erfunden – sie dienen als Vorlage, nicht als echte Daten.
export const VIRAL_POSTS = [
  {
    id: 'v1', niche: 'immobilien', type: 'casestudy', hook: 'result', author: 'Lena Brandt', role: 'Inhaberin · Maklerbüro (Beispiel)', likes: 1240, comments: 186, reposts: 42,
    text: `Von 3 auf 11 Eigentümer-Mandate pro Monat.\n\nOhne Portal-Budget zu erhöhen.\n\nDas haben wir in 90 Tagen geändert:\n\n1️⃣ Jede Bewertungsanfrage bekommt innerhalb von 5 Minuten eine Antwort – automatisiert.\n2️⃣ Nach jedem Verkauf fragen wir aktiv nach einer Google-Bewertung.\n3️⃣ Einmal pro Woche ein ehrlicher Markt-Post auf LinkedIn.\n\nDas Ergebnis:\n→ 4,9 Sterne statt 4,2\n→ 38 % mehr Anfragen aus der Region\n→ 11 Mandate im letzten Monat\n\nNichts davon ist Raketenwissenschaft.\nEs ist Konsequenz.\n\nWelchen der 3 Punkte setzt ihr schon um?`,
    why: ['Ergebnis mit Zahl im Hook', 'Nummerierte Schritte', 'Zahlen als Beweis', 'Einfache Frage als CTA'],
  },
  {
    id: 'v2', niche: 'immobilien', type: 'mythfact', hook: 'myth', author: 'Tobias Keller', role: 'Immobilienmakler (Beispiel)', likes: 860, comments: 144, reposts: 31,
    text: `„Im Moment verkauft sich doch nichts."\n\nDas höre ich jede Woche. Stimmt nur nicht.\n\nMythos: Käufer sind komplett weg.\nFakt: Sie sind da – aber sie vergleichen genauer.\n\nMythos: Der Preis regelt alles.\nFakt: Die Präsentation regelt den Preis.\n\nMythos: Ein Portal-Inserat reicht.\nFakt: 60 % unserer Käufer kamen über Empfehlung und Social Media.\n\nDer Markt ist nicht tot.\nEr ist anspruchsvoller geworden.\n\nWelchen Mythos hört ihr am häufigsten?`,
    why: ['Zitat als Hook', 'Mythos/Fakt-Rhythmus', 'Kurze Zeilen', 'Community-Frage'],
  },
  {
    id: 'v3', niche: 'immobilien', type: 'behindscenes', hook: 'behind', author: 'Sarah Wendt', role: 'Teamleiterin Vertrieb (Beispiel)', likes: 540, comments: 72, reposts: 8,
    text: `So sieht ein „Traumjob Makler" um 6:40 Uhr wirklich aus:\n\n☕ Kaffee im Auto vor der ersten Besichtigung\n📱 14 ungelesene Nachrichten von Interessenten\n📄 Ein Energieausweis, der immer noch fehlt\n🔑 Und ein Schlüssel, der nicht passt.\n\nIch liebe diesen Job trotzdem.\n\nWeil am Ende eine Familie ihr erstes Zuhause bekommt.\n\nWas ist der unglamouröseste Teil eures Jobs?`,
    why: ['Ehrlicher Einblick', 'Emoji-Liste für Scanbarkeit', 'Emotionaler Umschwung', 'Relatable Frage'],
  },
  {
    id: 'v4', niche: 'ki', type: 'howto', hook: 'stop', author: 'Jonas Richter', role: 'Automatisierungs-Berater (Beispiel)', likes: 2130, comments: 412, reposts: 96,
    text: `Hören Sie auf, E-Mails manuell zu sortieren.\n\nEs kostet Ihr Team 5 Stunden pro Woche.\n\nSo automatisieren Sie es in 20 Minuten:\n\nSchritt 1: Legen Sie 4 Kategorien fest (Anfrage, Rechnung, Termin, Sonstiges).\nSchritt 2: Lassen Sie jede neue Mail von einer KI klassifizieren.\nSchritt 3: Leiten Sie jede Kategorie automatisch weiter.\n\nWichtig: Personenbezogene Daten nur mit einem DSGVO-konformen Anbieter verarbeiten.\n\nErgebnis bei einem Kunden:\n→ 4,5 Std. pro Woche gespart\n→ Antwortzeit von 26 auf 3 Std.\n\nKommentieren Sie „WORKFLOW" und ich schicke Ihnen die Vorlage.`,
    why: ['Imperativ-Hook', 'Kosten des Problems quantifiziert', 'Klare Schritte', 'Kommentarwort-CTA (Lead-Magnet)'],
  },
  {
    id: 'v5', niche: 'ki', type: 'hottake', hook: 'contrarian', author: 'Mira Hoffmann', role: 'CTO · SaaS (Beispiel)', likes: 3480, comments: 690, reposts: 120,
    text: `Unpopuläre Meinung:\n\nDie meisten Unternehmen brauchen keine KI-Strategie.\n\nSie brauchen eine Prozess-Strategie.\n\nKI auf einen chaotischen Prozess zu setzen, macht das Chaos nur schneller.\n\nBevor Sie ein einziges Tool kaufen:\n→ Schreiben Sie Ihren Prozess auf.\n→ Streichen Sie jeden unnötigen Schritt.\n→ Automatisieren Sie erst dann den Rest.\n\nKI ist ein Verstärker. Kein Ersatz für Klarheit.\n\nSeht ihr das anders?`,
    why: ['Kontroverse These', 'Einzeilige Absätze', 'Merksatz am Ende', 'Offene Diskussion'],
  },
  {
    id: 'v6', niche: 'ki', type: 'listicle', hook: 'number', author: 'David Lorenz', role: 'KI-Trainer (Beispiel)', likes: 1890, comments: 233, reposts: 210,
    text: `7 KI-Prompts, die mir jede Woche 6 Stunden sparen:\n\n1. „Fasse dieses Meeting in 5 Bulletpoints + To-dos zusammen."\n2. „Schreibe 3 Varianten dieser E-Mail: kurz, freundlich, bestimmt."\n3. „Finde die 3 größten Risiken in diesem Angebot."\n4. „Erkläre das einem 12-Jährigen."\n5. „Welche Fragen würde ein skeptischer Kunde stellen?"\n6. „Mach aus diesen Notizen einen LinkedIn-Post."\n7. „Was fehlt in diesem Plan?"\n\n♻️ Teilen, wenn es jemandem hilft.\n\nWelcher Prompt fehlt?`,
    why: ['Zahl + Nutzen im Hook', 'Sofort anwendbar', 'Hohe Speicherrate', 'Repost-CTA'],
  },
  {
    id: 'v7', niche: 'sales', type: 'story', hook: 'mistake', author: 'Nina Albers', role: 'Head of Sales (Beispiel)', likes: 2760, comments: 318, reposts: 54,
    text: `Ich habe 3 Jahre lang den gleichen Fehler im Vertrieb gemacht.\n\nIch habe gepitcht, bevor ich gefragt habe.\n\nDann kam das Gespräch mit einem Einkaufsleiter, der nach 4 Minuten sagte:\n„Sie wissen gar nicht, was unser Problem ist, oder?"\n\nEr hatte recht.\n\nSeitdem gilt für mich:\n→ 70 % zuhören\n→ 20 % nachfragen\n→ 10 % präsentieren\n\nMeine Abschlussquote hat sich seitdem fast verdoppelt.\n\nWas war euer teuerster Sales-Fehler?`,
    why: ['Fehler-Geständnis', 'Dialog-Moment', 'Einfache Regel', 'Ergebnis + Frage'],
  },
  {
    id: 'v8', niche: 'sales', type: 'framework', hook: 'framework', author: 'Marco Weiss', role: 'Sales-Coach (Beispiel)', likes: 1320, comments: 165, reposts: 88,
    text: `Das 3-F-Prinzip für Einwände (funktioniert bei „zu teuer" genauso wie bei „kein Bedarf"):\n\n𝗙𝗲𝗲𝗹 – „Verstehe ich total."\n𝗙𝗲𝗹𝘁 – „Das hat Kunde X am Anfang auch gedacht."\n𝗙𝗼𝘂𝗻𝗱 – „Dann hat er festgestellt, dass …"\n\nWarum es funktioniert:\nEs nimmt den Druck raus, bevor Sie argumentieren.\n\nSpeichern Sie sich das für Ihr nächstes Gespräch.`,
    why: ['Benanntes Framework', 'Fettschrift (Unicode)', 'Kurz & merkbar', 'Speicher-CTA'],
  },
  {
    id: 'v9', niche: 'marketing', type: 'lessons', hook: 'number', author: 'Clara Neumann', role: 'Brand Strategist (Beispiel)', likes: 2240, comments: 276, reposts: 73,
    text: `365 Tage LinkedIn. 5 Learnings, die ich gern früher gewusst hätte:\n\n1. Die erste Zeile entscheidet über 80 % der Reichweite.\n2. Konsistenz schlägt Kreativität.\n3. Kommentare bei anderen bringen mehr als eigene Posts (am Anfang).\n4. Persönliche Geschichten > perfekte Tipps.\n5. Niemand interessiert sich für dein Produkt. Alle für ihr Problem.\n\nVon 400 auf 12.000 Follower.\nOhne Werbebudget.\n\nWelche Lesson würdest du ergänzen?`,
    why: ['Zeitraum als Autorität', 'Nummerierte Learnings', 'Social Proof am Ende', 'Ergänzungs-Frage'],
  },
  {
    id: 'v10', niche: 'marketing', type: 'beforeafter', hook: 'result', author: 'Felix Braun', role: 'Copywriter (Beispiel)', likes: 980, comments: 121, reposts: 40,
    text: `Vorher: „Wir bieten innovative Lösungen für Ihr Business."\nNachher: „Wir füllen Ihren Kalender mit Erstgesprächen – in 30 Tagen."\n\nGleiches Unternehmen. Gleiche Leistung.\n\nAber nur einer der beiden Sätze verkauft.\n\nDer Unterschied:\n→ konkret statt abstrakt\n→ Ergebnis statt Leistung\n→ Zeitrahmen statt Versprechen\n\nPostet eure Headline in die Kommentare – ich gebe Feedback.`,
    why: ['Vorher/Nachher-Kontrast', 'Sofortiger Aha-Moment', 'Interaktions-Angebot'],
  },
  {
    id: 'v11', niche: 'consulting', type: 'hottake', hook: 'contrarian', author: 'Katrin Vogel', role: 'Unternehmensberaterin (Beispiel)', likes: 1570, comments: 402, reposts: 22,
    text: `Stundensätze sind das Dümmste, was Berater sich je ausgedacht haben.\n\nSie bestrafen Sie dafür, dass Sie schneller werden.\n\nIch habe vor 2 Jahren auf Paketpreise umgestellt.\n\n→ Weniger Diskussionen\n→ Zufriedenere Kunden\n→ 40 % mehr Umsatz bei weniger Stunden\n\nDer Kunde kauft ein Ergebnis. Nicht Ihre Zeit.\n\nStundensatz oder Paket – was nutzt ihr?`,
    why: ['Provokanter Einstieg', 'Persönlicher Beweis', 'Klare Entweder-oder-Frage'],
  },
  {
    id: 'v12', niche: 'leadership', type: 'story', hook: 'story', author: 'Paul Schneider', role: 'Geschäftsführer (Beispiel)', likes: 4120, comments: 520, reposts: 140,
    text: `Freitag, 17:52 Uhr. Meine beste Mitarbeiterin kündigt.\n\nNicht wegen des Gehalts.\nNicht wegen eines anderen Angebots.\n\nSondern weil ich in 2 Jahren nie gefragt habe, wo sie hin will.\n\nDas hat wehgetan.\n\nSeitdem führe ich jeden Monat ein 20-Minuten-Gespräch mit jedem im Team. Nur eine Frage:\n„Was brauchst du, um nächstes Jahr stolz auf deine Arbeit zu sein?"\n\nSeitdem hat niemand mehr gekündigt.\n\nWann habt ihr euer Team das zuletzt gefragt?`,
    why: ['Szenen-Hook mit Uhrzeit', 'Verletzlichkeit', 'Konkrete Routine', 'Reflexions-Frage'],
  },
  {
    id: 'v13', niche: 'recruiting', type: 'listicle', hook: 'nobody', author: 'Anja Roth', role: 'Talent Acquisition Lead (Beispiel)', likes: 1680, comments: 204, reposts: 190,
    text: `Niemand sagt Bewerbern, worauf Recruiter in den ersten 6 Sekunden schauen:\n\n1. Aktuelle Position + Zeitraum\n2. Ergebnisse in Zahlen (nicht Aufgaben!)\n3. Lücken – und ob sie erklärt sind\n4. Passt der Titel zur Stelle?\n5. Ist der Lebenslauf lesbar (1–2 Seiten)?\n\nDas war’s.\nKein Recruiter liest Ihr Anschreiben zuerst.\n\nTeilen Sie das mit jemandem, der gerade sucht. ♻️`,
    why: ['Insider-Wissen', 'Überraschende Zahl', 'Repost-CTA mit Nutzen'],
  },
  {
    id: 'v14', niche: 'finance', type: 'mythfact', hook: 'myth', author: 'Stefan Maier', role: 'Steuerberater (Beispiel)', likes: 890, comments: 98, reposts: 64,
    text: `„Das kann ich doch alles von der Steuer absetzen!"\n\nDer teuerste Satz, den Selbstständige sagen.\n\nMythos: Absetzen heißt geschenkt.\nFakt: Sie sparen nur Ihren Steuersatz – den Rest zahlen Sie selbst.\n\nMythos: Ein Firmenwagen lohnt sich immer.\nFakt: Rechnen Sie Fahrtenbuch vs. 1 %-Regelung vorher durch.\n\nMythos: Belege kann man später sammeln.\nFakt: Ohne Beleg kein Abzug.\n\nWelchen Satz hört ihr am häufigsten?`,
    why: ['Zitat-Hook', 'Kostenaspekt', 'Mythos/Fakt-Rhythmus'],
  },
  {
    id: 'v15', niche: 'immobilien', type: 'howto', hook: 'howto', author: 'Lena Brandt', role: 'Inhaberin · Maklerbüro (Beispiel)', likes: 720, comments: 88, reposts: 36,
    text: `So bekommen Sie als Maklerbüro 10 neue Google-Bewertungen im Monat – ohne unangenehm nachzufragen:\n\n1. Fragen Sie im Moment der größten Freude (Schlüsselübergabe).\n2. Schicken Sie den Link direkt per WhatsApp – nicht per Mail.\n3. Erinnern Sie genau einmal, nach 3 Tagen, automatisiert.\n\nBonus: Antworten Sie auf JEDE Bewertung. Auch auf die schlechten.\n\nGoogle-Bewertungen sind das neue Schaufenster.\n\nWie viele Bewertungen habt ihr aktuell?`,
    why: ['Konkretes Ergebnis', 'Einwand vorweggenommen', 'Bonus-Tipp'],
  },
  {
    id: 'v16', niche: 'ki', type: 'casestudy', hook: 'result', author: 'Jonas Richter', role: 'Automatisierungs-Berater (Beispiel)', likes: 1450, comments: 260, reposts: 45,
    text: `12 Stunden Exposé-Arbeit pro Woche → 2 Stunden.\n\nSo lief das Projekt mit einem Maklerbüro (6 Mitarbeitende):\n\nAusgangslage:\nJedes Exposé wurde von Hand geschrieben. 90 Minuten pro Objekt.\n\nWas wir gebaut haben:\n→ Objektdaten aus dem CRM\n→ KI schreibt den ersten Entwurf\n→ Makler prüft & ergänzt (15 Min.)\n\nErgebnis nach 6 Wochen:\n✅ 10 Stunden pro Woche frei\n✅ Einheitliche Qualität\n✅ Mehr Zeit für Besichtigungen\n\nDer Mensch bleibt im Loop. Die Routine nicht.\n\nWelche Aufgabe würdet ihr zuerst automatisieren?`,
    why: ['Vorher→Nachher-Zahl', 'Strukturierte Case Study', 'Einwand „KI ersetzt Menschen" entkräftet'],
  },
  {
    id: 'v17', niche: 'sales', type: 'poll', hook: 'question', author: 'Nina Albers', role: 'Head of Sales (Beispiel)', likes: 430, comments: 310, reposts: 5,
    text: `Ehrliche Frage an alle im B2B-Vertrieb:\n\nWas funktioniert 2026 bei euch am besten für neue Termine?\n\n📞 Kaltakquise am Telefon\n✉️ Personalisierte E-Mails\n💬 LinkedIn-DMs\n🤝 Empfehlungen\n\nIch sammle die Antworten und teile die Auswertung nächste Woche.`,
    why: ['Niedrige Hürde zum Kommentieren', 'Versprechen einer Auswertung', 'Folge-Post eingebaut'],
  },
  {
    id: 'v18', niche: 'consulting', type: 'framework', hook: 'framework', author: 'Katrin Vogel', role: 'Unternehmensberaterin (Beispiel)', likes: 1110, comments: 97, reposts: 150,
    text: `Das KLAR-Modell, mit dem ich jedes Projekt starte:\n\nK – Kontext: Was ist wirklich das Problem?\nL – Lösungsraum: Welche 3 Optionen gibt es?\nA – Auswahl: Was bringt 80 % Wirkung mit 20 % Aufwand?\nR – Rhythmus: Wer prüft wann den Fortschritt?\n\nDauert 45 Minuten.\nSpart Wochen.\n\nSpeichern und beim nächsten Kick-off ausprobieren.`,
    why: ['Akronym-Framework', 'Kontrast Aufwand/Nutzen', 'Speicher-CTA'],
  },
  {
    id: 'v19', niche: 'leadership', type: 'lessons', hook: 'number', author: 'Paul Schneider', role: 'Geschäftsführer (Beispiel)', likes: 2890, comments: 301, reposts: 230,
    text: `10 Jahre Unternehmer. 6 Dinge, die ich heute anders machen würde:\n\n1. Früher delegieren – nicht erst, wenn es brennt.\n2. Preise früher erhöhen.\n3. Schlechte Kunden schneller verabschieden.\n4. Weniger Meetings, mehr Entscheidungen.\n5. Gesundheit nicht als Puffer nutzen.\n6. Öfter „Nein" sagen.\n\nNummer 5 hat mich am meisten gekostet.\n\nWelche würdet ihr unterschreiben?`,
    why: ['Erfahrung als Autorität', 'Eine Lesson hervorgehoben', 'Zustimmungs-Frage'],
  },
  {
    id: 'v20', niche: 'marketing', type: 'carousel', hook: 'howto', author: 'Clara Neumann', role: 'Brand Strategist (Beispiel)', likes: 1960, comments: 140, reposts: 310,
    text: `So schreiben Sie Hooks, die niemand überscrollt (Carousel 👇)\n\n8 Formeln, die ich seit 2 Jahren nutze – mit Beispielen aus echten Posts.\n\nSpeichern Sie sich das Dokument für Ihren nächsten Post.\n\n📌 Slide 7 ist mein Favorit.`,
    why: ['Kurzer Begleittext zum Carousel', 'Neugier auf eine Slide', 'Speicher-CTA'],
  },
];

// Richtwerte (allgemeine Erfahrungswerte, keine Live-Daten)
export const BEST_TIMES = {
  days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  slots: ['7–9 Uhr', '9–11 Uhr', '11–13 Uhr', '13–15 Uhr', '15–17 Uhr', '17–19 Uhr', '19–21 Uhr'],
  // 0–4 Intensität
  grid: [
    [3, 3, 2, 1, 1, 1, 1],
    [4, 4, 3, 2, 2, 1, 1],
    [4, 4, 3, 2, 2, 1, 1],
    [4, 3, 3, 2, 1, 1, 1],
    [3, 2, 2, 1, 1, 0, 0],
    [1, 1, 1, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 1, 2],
  ],
};

export const ALGO_INSIGHTS = [
  { title: 'Die ersten 60–90 Minuten zählen', text: 'Frühe Kommentare signalisieren Relevanz. Planen Sie nach dem Posten 30 Minuten ein, um auf jeden Kommentar zu antworten.' },
  { title: 'Hook vor dem „…mehr"', text: 'Auf dem Handy sind nur ca. 2–3 Zeilen sichtbar. Alles Wichtige muss in die ersten ~200 Zeichen.' },
  { title: 'Links kosten Reichweite', text: 'Externe Links im Post-Text bremsen oft die Ausspielung. Besser: Link im ersten Kommentar oder „Kommentarwort"-Mechanik.' },
  { title: 'Verweildauer ist ein Signal', text: 'Carousels und gut strukturierte Texte halten Leser länger. Kurze Absätze und Weißraum helfen.' },
  { title: 'Kommentare > Likes', text: 'Ein durchdachter Kommentar wiegt deutlich mehr als ein Like. Stellen Sie am Ende eine Frage, die leicht zu beantworten ist.' },
  { title: 'Hashtags sind Nebensache', text: '0–3 relevante Hashtags genügen. Zu viele wirken wie Spam.' },
  { title: 'Konsistenz schlägt Viralität', text: '3 Posts pro Woche über 3 Monate bringen mehr als ein viraler Treffer. Der Algorithmus belohnt regelmäßige Creator.' },
  { title: 'Engagement bei anderen', text: '10–20 durchdachte Kommentare pro Woche bei Creators Ihrer Nische erhöhen Profilbesuche spürbar.' },
];

export const GRAPHIC_TEMPLATES = [
  { id: 'quote', name: 'Zitat-Karte', desc: 'Starkes Statement mit Namen – hoher Wiedererkennungswert.', fields: { title: '„Kunden kaufen keine Leistung. Sie kaufen ein Ergebnis."', subtitle: '' } },
  { id: 'stat', name: 'Statistik-Highlight', desc: 'Eine große Zahl + Kontext. Perfekt für Case Studies.', fields: { title: '10 Std.', subtitle: 'weniger Admin-Arbeit pro Woche durch einen einzigen Workflow' } },
  { id: 'list', name: 'Checkliste', desc: 'Punkte zum Abhaken – wird oft gespeichert.', fields: { title: '5 Dinge vor jedem Verkaufsgespräch', items: 'Ziel des Kunden kennen\nEntscheider klären\nBudget-Rahmen erfragen\nEinwände vorbereiten\nNächsten Schritt festlegen' } },
  { id: 'mythfact', name: 'Mythos vs. Fakt', desc: 'Zweigeteilt – räumt Irrtümer auf.', fields: { title: 'KI ist nur was für Konzerne.', subtitle: 'Die meisten Automatisierungen kosten weniger als eine Stunde Arbeitszeit pro Monat.' } },
  { id: 'beforeafter', name: 'Vorher / Nachher', desc: 'Transformation auf einen Blick.', fields: { title: 'Exposé von Hand: 90 Min.', subtitle: 'Mit KI-Entwurf: 15 Min.' } },
  { id: 'framework', name: 'Framework (3 Schritte)', desc: 'Nummerierte Schritte / Ihr eigenes Modell.', fields: { title: 'Das 3-S-Prinzip', items: 'Sichtbar werden\nSystematisieren\nSkalieren' } },
  { id: 'hottake', name: 'Hot Take', desc: 'Große, provokante Typo – stoppt den Scroll.', fields: { title: 'Ihr CRM ist kein Problem. Ihr Prozess schon.', subtitle: 'Unpopuläre Meinung' } },
  { id: 'tweet', name: 'Post-Screenshot', desc: 'Sieht aus wie ein Social-Post – sehr beliebt auf LinkedIn.', fields: { title: 'Die beste Automatisierung ist die, die man nicht bemerkt.\n\nSie läuft einfach.', subtitle: '' } },
  { id: 'dodont', name: 'Do / Don’t', desc: 'Zwei Spalten: richtig vs. falsch.', fields: { title: 'Kaltakquise per E-Mail', items: 'Personalisierte erste Zeile\nKonkreter Nutzen\nEine klare Frage', items2: 'Firmenvorstellung zuerst\n3 Links im Text\n„Hätten Sie kurz Zeit?"' } },
  { id: 'cover', name: 'Carousel-Cover', desc: 'Titelseite für ein PDF-Carousel.', fields: { title: '7 Workflows, die jedes Maklerbüro braucht', subtitle: 'Wischen →' } },
  { id: 'timeline', name: 'Prozess / Timeline', desc: 'Ablauf in Etappen.', fields: { title: 'Vom Lead zum Mandat', items: 'Anfrage (Tag 0)\nAntwort in 5 Min.\nErstgespräch (Tag 2)\nBewertung vor Ort (Tag 5)\nMandat (Tag 10)' } },
  { id: 'question', name: 'Frage an die Community', desc: 'Große Frage – fördert Kommentare.', fields: { title: 'Welche Aufgabe würden Sie sofort automatisieren?', subtitle: 'Antwort in die Kommentare 👇' } },
];

export const THEMES = [
  { id: 'white', name: 'Weiß', bg: '#ffffff', bg2: '#f4f4f4', fg: '#0a0a0a', accent: '#0a0a0a', muted: 'rgba(10,10,10,.6)' },
  { id: 'grey', name: 'Hellgrau', bg: '#ededed', bg2: '#e0e0e0', fg: '#0a0a0a', accent: '#0a0a0a', muted: 'rgba(10,10,10,.6)' },
  { id: 'black', name: 'Schwarz', bg: '#0a0a0a', bg2: '#1c1c1c', fg: '#ffffff', accent: '#ffffff', muted: 'rgba(255,255,255,.7)' },
  { id: 'blue', name: 'Blau', bg: '#1d4ed8', bg2: '#3b82f6', fg: '#ffffff', accent: '#fde047', muted: 'rgba(255,255,255,.75)' },
  { id: 'night', name: 'Nacht', bg: '#0f172a', bg2: '#1e293b', fg: '#f8fafc', accent: '#38bdf8', muted: 'rgba(248,250,252,.7)' },
  { id: 'paper', name: 'Papier', bg: '#faf7f2', bg2: '#f1ebe0', fg: '#1c1917', accent: '#c2410c', muted: 'rgba(28,25,23,.65)' },
  { id: 'mint', name: 'Mint', bg: '#ecfdf5', bg2: '#d1fae5', fg: '#064e3b', accent: '#059669', muted: 'rgba(6,78,59,.7)' },
  { id: 'coral', name: 'Koralle', bg: '#fff1ee', bg2: '#ffe0d8', fg: '#431407', accent: '#ea580c', muted: 'rgba(67,20,7,.7)' },
  { id: 'violet', name: 'Violett', bg: '#4c1d95', bg2: '#7c3aed', fg: '#ffffff', accent: '#fbcfe8', muted: 'rgba(255,255,255,.75)' },
];

export const FORMATS = [
  { id: 'square', name: 'Quadrat 1080×1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Hochformat 1080×1350', w: 1080, h: 1350 },
  { id: 'landscape', name: 'Querformat 1200×627', w: 1200, h: 627 },
];
