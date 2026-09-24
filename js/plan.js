// Wochenplan & Content-Mix-Berechnungen.

import { store, uid } from './store.js';
import { startOfWeek, addDays, sameDay } from './ui.js';

const DAY_SETS = {
  1: [1],
  2: [1, 3],
  3: [1, 2, 3],
  4: [0, 1, 2, 3],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export function weekPlan(s, weekStart = startOfWeek()) {
  const n = Math.min(7, Math.max(1, Number(s.voice.perWeek) || 3));
  const days = DAY_SETS[n];
  const pillars = s.pillars.length ? s.pillars : [{ id: '', name: 'Freies Thema', weight: 1 }];
  const types = s.postTypes.length ? s.postTypes : ['story', 'howto', 'listicle'];
  const totalW = pillars.reduce((a, p) => a + (Number(p.weight) || 1), 0);
  const assigned = Object.fromEntries(pillars.map((p) => [p.id, 0]));
  const weekOffset = Math.round((weekStart - startOfWeek(new Date(2024, 0, 1))) / (7 * 864e5));

  return days.map((dayIdx, i) => {
    const date = addDays(weekStart, dayIdx);
    // Pillar mit dem größten Defizit gegenüber dem Soll wählen
    let best = pillars[0];
    let bestGap = -Infinity;
    for (const p of pillars) {
      const gap = ((Number(p.weight) || 1) / totalW) * (i + 1) - assigned[p.id];
      if (gap > bestGap) {
        bestGap = gap;
        best = p;
      }
    }
    assigned[best.id] += 1;
    const type = types[(i + weekOffset) % types.length];
    const post = s.drafts.find((d) => d.scheduledAt && sameDay(new Date(d.scheduledAt), date));
    return { date, pillar: best, type, post };
  });
}

export function pillarMix(s) {
  const relevant = s.drafts.filter((d) => d.pillarId);
  const total = relevant.length;
  const totalW = s.pillars.reduce((a, p) => a + (Number(p.weight) || 1), 0) || 1;
  return s.pillars.map((p) => {
    const count = relevant.filter((d) => d.pillarId === p.id).length;
    return {
      pillar: p,
      count,
      actual: total ? count / total : 0,
      target: (Number(p.weight) || 1) / totalW,
    };
  });
}

export function balanceScore(s) {
  const mix = pillarMix(s);
  if (!mix.length || !mix.some((m) => m.count)) return null;
  const dev = mix.reduce((a, m) => a + Math.abs(m.actual - m.target), 0) / 2;
  return Math.round((1 - dev) * 100);
}

export function createDraft(partial) {
  const d = {
    id: uid(),
    text: '',
    pillarId: '',
    type: '',
    status: 'entwurf',
    scheduledAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...partial,
  };
  store.update((s) => s.drafts.unshift(d));
  return d;
}
