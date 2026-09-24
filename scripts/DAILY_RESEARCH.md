# Tägliche Recherche: virale LinkedIn-Posts

Diese Anleitung führt die tägliche Routine aus. Ziel: `data/viral-daily.json` mit **echten, aktuellen** LinkedIn-Posts ergänzen, die überdurchschnittlich gut laufen.

## Regeln

- **Nichts erfinden.** Nur Posts aufnehmen, die du per Websuche gefunden und deren Seite du geöffnet hast. Autor, Text und URL müssen von der Quelle stammen.
- `text`: der Post-Text wörtlich (bei sehr langen Posts die ersten ~1.200 Zeichen, Zeilenumbrüche erhalten).
- `likes`, `comments`, `reposts`: nur eintragen, wenn die Zahl auf der Seite oder im Suchergebnis sichtbar ist – sonst `null`.
- `url`: die öffentliche Post-URL (`https://www.linkedin.com/posts/...` oder `.../feed/update/...`), ohne Tracking-Parameter.
- Keine privaten Personen bloßstellen, keine Posts mit sensiblen persönlichen Daten.
- Bevorzugt deutschsprachige Posts aus dem DACH-Raum; englische nur, wenn deutlich viral und übertragbar (`"language": "en"`).

## Ablauf

1. `git pull` auf dem Branch `claude/taplio-linkedin-tool-7w9ef7`.
2. Pro Nische mit der Websuche suchen, z. B.
   `site:linkedin.com/posts Immobilienmakler`, `site:linkedin.com/posts "KI" Automatisierung Mittelstand`,
   `site:linkedin.com/posts Vertrieb Kaltakquise`, `site:linkedin.com/posts Personal Branding`.
   Zeitraum: letzte 7 Tage bevorzugen. Suchbegriffe täglich variieren.
3. Treffer öffnen (Web-Fetch), Text, Autor, Headline und sichtbare Zahlen übernehmen.
4. Ziel pro Lauf: **Immobilien & Makler 6–8**, **KI & Automatisierung 6–8**, alle anderen Nischen je **2–3**. Lieber weniger als erfundene.
5. Jeden Post einordnen:
   - `niche`: `immobilien | ki | sales | marketing | consulting | leadership | recruiting | finance`
   - `type`: `story | howto | listicle | hottake | casestudy | carousel | mythfact | lessons | behindscenes | beforeafter | poll | framework`
   - `why`: 2–4 kurze Gründe, warum der Post funktioniert (z. B. „Zahl im Hook“, „Persönliche Szene“, „Klare Liste“, „Frage als CTA“).
6. Neue Einträge **oben** in `posts` einfügen, `foundAt` = heutiges Datum, `updatedAt` = jetzt (ISO). Bestehende Einträge nicht löschen – das Skript entfernt alte automatisch.
7. `node scripts/validate-viral.mjs` ausführen. Fehler beheben, bis es durchläuft.
8. Commit `Daily viral posts JJJJ-MM-TT` und `git push origin claude/taplio-linkedin-tool-7w9ef7`.

## Format eines Eintrags

```json
{
  "id": "d-2026-09-24-1",
  "foundAt": "2026-09-24",
  "niche": "immobilien",
  "type": "casestudy",
  "author": "Vorname Nachname",
  "role": "Headline laut Profil",
  "url": "https://www.linkedin.com/posts/...",
  "text": "Wörtlicher Post-Text …",
  "likes": 842,
  "comments": 97,
  "reposts": null,
  "postedAt": "2026-09-21",
  "language": "de",
  "why": ["Ergebnis mit Zahl im Hook", "Nummerierte Schritte", "Frage als CTA"]
}
```
