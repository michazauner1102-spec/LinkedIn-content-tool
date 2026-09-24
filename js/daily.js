// Täglich per Web-Recherche aktualisierte virale Posts (data/viral-daily.json).
// Die Datei wird von einer täglichen Routine gepflegt und mit der App ausgeliefert.

let cache; // undefined = noch nicht geladen, null = nicht verfügbar
let pending;

export function getDaily() {
  return cache;
}

export function loadDaily() {
  if (pending) return pending;
  const day = new Date().toISOString().slice(0, 10);
  pending = fetch(`data/viral-daily.json?d=${day}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      const posts = Array.isArray(json?.posts) ? json.posts.filter((p) => p && p.text && p.url) : [];
      const latest = posts.reduce((a, p) => (p.foundAt > a ? p.foundAt : a), '');
      cache = { updatedAt: json?.updatedAt || null, latest, posts };
      return cache;
    })
    .catch(() => {
      cache = null;
      return null;
    });
  return pending;
}

export function findDailyPost(id) {
  return cache?.posts.find((p) => p.id === id) || null;
}

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(+d) ? iso : d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}
