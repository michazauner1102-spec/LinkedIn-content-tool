// Prüft und bereinigt data/viral-daily.json.
// - verwirft ungültige Einträge (fehlende Pflichtfelder, keine LinkedIn-URL, unbekannte Nische/Typ)
// - entfernt Duplikate (gleiche URL) und Einträge älter als 21 Tage
// - sortiert nach Funddatum und Reaktionen
// Aufruf: node scripts/validate-viral.mjs   (Exit-Code 1, wenn keine gültigen Posts übrig bleiben)

import { readFileSync, writeFileSync } from 'node:fs';
import { NICHES, POST_TYPES } from '../js/data.js';

const FILE = new URL('../data/viral-daily.json', import.meta.url);
const MAX_AGE_DAYS = 21;
const niches = new Set(NICHES.map((n) => n.id));
const types = new Set(POST_TYPES.map((t) => t.id));

const raw = JSON.parse(readFileSync(FILE, 'utf8'));
const input = Array.isArray(raw.posts) ? raw.posts : [];
const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 864e5).toISOString().slice(0, 10);
const seen = new Set();
const problems = [];
const num = (v) => (v == null || v === '' ? null : Number.isFinite(Number(v)) ? Math.round(Number(v)) : null);

const posts = [];
for (const [i, p] of input.entries()) {
  const why = (msg) => problems.push(`#${i} (${p?.url || 'ohne URL'}): ${msg}`);
  if (!p || typeof p !== 'object') { why('kein Objekt'); continue; }
  const url = String(p.url || '').trim().split('?')[0];
  if (!/^https:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/(posts|feed\/update|pulse)\//.test(url)) { why('keine LinkedIn-Post-URL'); continue; }
  if (seen.has(url)) { why('Duplikat'); continue; }
  if (!p.author || String(p.text || '').trim().length < 80) { why('Autor oder Text fehlt / zu kurz'); continue; }
  if (!niches.has(p.niche)) { why(`unbekannte Nische "${p.niche}"`); continue; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.foundAt || '')) { why('foundAt fehlt (JJJJ-MM-TT)'); continue; }
  if (p.foundAt < cutoff) continue;
  seen.add(url);
  posts.push({
    id: p.id || `d-${p.foundAt}-${posts.length}`,
    foundAt: p.foundAt,
    niche: p.niche,
    type: types.has(p.type) ? p.type : 'story',
    author: String(p.author).trim(),
    role: String(p.role || '').trim(),
    url,
    text: String(p.text).trim(),
    likes: num(p.likes),
    comments: num(p.comments),
    reposts: num(p.reposts),
    postedAt: p.postedAt || null,
    language: p.language || 'de',
    why: Array.isArray(p.why) ? p.why.map(String).slice(0, 5) : [],
  });
}

posts.sort((a, b) => b.foundAt.localeCompare(a.foundAt) || (b.likes || 0) - (a.likes || 0));
const out = { updatedAt: raw.updatedAt || new Date().toISOString(), posts };
writeFileSync(FILE, JSON.stringify(out, null, 2) + '\n');

const perNiche = Object.fromEntries(NICHES.map((n) => [n.id, posts.filter((p) => p.niche === n.id).length]));
console.log(`Gültige Posts: ${posts.length} (verworfen: ${problems.length})`);
console.log('Pro Nische:', perNiche);
if (problems.length) console.log('Verworfen:\n  ' + problems.join('\n  '));
if (!posts.length) process.exit(1);
