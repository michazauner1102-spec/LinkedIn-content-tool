# Postlab – LinkedIn Content Studio

Ein an Taplio angelehntes Content-Tool für LinkedIn-Posts – auf Deutsch, ohne Build-Schritt, läuft komplett im Browser.

## Funktionen

| Bereich | Was es kann |
|---|---|
| **Strategie** (Onboarding) | 5 Schritte: Profil & Nische → Zielgruppe (Schmerzpunkte, Ziele, Einwände) → Content-Pillars mit Gewichtung → Post-Typen (12 Formate mit Reichweite/Vertrauen/Leads-Profil) → Tonalität, Ansprache (du/Sie), Emojis, Ziel, Posts pro Woche |
| **Dashboard** | Kennzahlen, „Post-Ideen für dich“, virale Posts der eigenen Nische, Wochenplan (Pillar- und Typ-Rotation nach Gewichtung), Content-Mix Ist vs. Soll, Insight des Tages |
| **Post-Ideen** | Ideen je Pillar und Post-Typ – aus Hook-Formeln + Zielgruppendaten oder per Claude; speicherbar |
| **Editor** | LinkedIn-Vorschau (Mobil/Desktop mit „… mehr“-Umbruch), Unicode-Fett/Kursiv, Hook-Ideen, **Post-Checker** mit Score (Hook, Länge, Absätze, Satzlänge, CTA, Links, Hashtags, Emojis, Ansprache), KI-Überarbeitung, Terminplanung |
| **Entwürfe & Kalender** | Wochenansicht mit Plan-Vorschlägen, Status (Entwurf/geplant/veröffentlicht) |
| **Virale Posts** | **Täglich neu:** echte LinkedIn-Posts aus einer täglichen Web-Recherche (`data/viral-daily.json`, siehe unten); Bibliothek mit 20 Beispiel-Posts (fiktive Autoren, bewährte Muster); eigenes **Swipe-File** mit automatischer Struktur-Analyse |
| **Insights** | Content-Mix vs. Strategie, Lücken & häufigste Schwachstellen, beste Posting-Zeiten (Richtwerte), Algorithmus-Wissen, personalisierte Hook-Formeln, KI-Strategieanalyse |
| **Post-Vorlagen** | 16 Textvorlagen zum Ausfüllen (Fehler-Geständnis, Anleitung, Listicle, Case Study, Mythos/Fakt, Framework …) – unter Post-Ideen oder direkt im Editor |
| **Grafik-Galerie** | 24 häufig genutzte LinkedIn-Grafiken (u. a. Zitat, Statistik, Checkliste, Mythos/Fakt, Vorher/Nachher, Framework, Hot Take, Post-Screenshot, Do/Don’t, Carousel-Cover, Timeline, Top 3, Kennzahlen, Vergleich, Kundenstimme, Prozent-Balken, Frage & Antwort, Carousel-Endslide), 9 Farbwelten, 3 Formate, PNG-Download; **Carousel-Builder** mit PDF-Export für LinkedIn-Dokumente |

## Starten

Die App braucht nur einen statischen Webserver (ES-Module funktionieren nicht über `file://`):

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Oder das Repository auf Vercel, Netlify oder GitHub Pages deployen – es gibt keinen Build-Schritt.

## KI-Schreibassistent (optional)

Unter **Einstellungen** einen Anthropic-API-Schlüssel hinterlegen. Dann schreibt Claude komplette Posts, Ideen, Hooks, Umschreibungen viraler Vorlagen und Strategie-Analysen – mit dem Kontext aus deiner Strategie.

- Standardmodell: `claude-opus-5` (wählbar: `claude-sonnet-5`, `claude-haiku-4-5`)
- Bei Opus 5 ist `fallbacks: "default"` aktiv: lehnt ein Sicherheitsklassifikator eine Anfrage ab, übernimmt serverseitig automatisch ein Ersatzmodell.
- Der Aufruf erfolgt über das offizielle Anthropic-JS-SDK direkt aus dem Browser (`dangerouslyAllowBrowser`). Der Schlüssel liegt nur im `localStorage` – nutze die App auf deinem eigenen Gerät und setze ein Ausgabenlimit in der Anthropic-Konsole. Für einen Mehrbenutzer-Betrieb sollten die Aufrufe über ein eigenes Backend laufen.

**Ohne Schlüssel (Prompt-Modus):** Jede KI-Funktion (Post schreiben, umschreiben, Hooks, Ideen, Strategie-Analyse) zeigt den fertigen Prompt mit deinem Strategie-Kontext. Kopieren, in Claude einfügen und die Antwort zurück in die App übernehmen. In der Grafik-Galerie und im Carousel-Builder erzeugt „Prompt für Claude Design“ ein komplettes Design-Briefing (Format, Farben, Texte, Layout).

## Tägliche virale Posts

Eine tägliche Routine (Claude Code) recherchiert jeden Morgen per Websuche aktuelle, gut laufende LinkedIn-Posts je Nische, ordnet sie ein und schreibt sie nach `data/viral-daily.json`. Die Anleitung dafür steht in [`scripts/DAILY_RESEARCH.md`](scripts/DAILY_RESEARCH.md); `node scripts/validate-viral.mjs` prüft die Datei, entfernt Duplikate und Einträge älter als 21 Tage. Es werden nur gefundene Posts mit Link aufgenommen – nichts wird erfunden.

## Daten

Alle Daten bleiben lokal im Browser. Backup-Export/-Import unter **Einstellungen**.

## Struktur

```
index.html          App-Shell
css/styles.css      Design (hell/dunkel, responsiv)
js/app.js           Router & Navigation
js/data.js          Nischen, Pillars, Post-Typen, Hook-Formeln, Beispiel-Posts, Richtwerte
js/store.js         localStorage-Zustand
js/generator.js     Ideen/Entwürfe ohne KI, Post-Checker, Unicode-Formatierung
js/ai.js            Claude-Anbindung
js/graphics.js      Canvas-Renderer der Grafiken + PDF-Export
js/plan.js          Wochenplan & Content-Mix
js/views/*.js       Seiten
```
