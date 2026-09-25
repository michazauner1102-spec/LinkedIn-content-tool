import { store } from './store.js';
import { esc } from './ui.js';
import { NICHES } from './data.js';
import * as dashboard from './views/dashboard.js';
import * as onboarding from './views/onboarding.js';
import * as ideas from './views/ideas.js';
import * as editor from './views/editor.js';
import * as calendar from './views/calendar.js';
import * as viral from './views/viral.js';
import * as insights from './views/insights.js';
import * as gallery from './views/gallery.js';
import * as settings from './views/settings.js';
import * as research from './views/research.js';

const ROUTES = {
  dashboard: { view: dashboard, title: (s) => `Willkommen zurück${s.profile.name ? `, ${s.profile.name}` : ''}`, label: 'Dashboard' },
  research: { view: research, title: () => 'Themen-Recherche', label: 'Themen-Recherche' },
  strategy: { view: onboarding, title: () => 'Content-Strategie', label: 'Strategie' },
  write: { view: editor, title: () => 'Post schreiben', label: 'Schreiben', group: 'write' },
  calendar: { view: calendar, title: () => 'Entwürfe & Kalender', label: 'Entwürfe & Kalender', group: 'write' },
  ideas: { view: ideas, title: () => 'Post-Ideen', label: 'Post-Ideen' },
  viral: { view: viral, title: () => 'Virale Posts', label: 'Virale Posts' },
  insights: { view: insights, title: () => 'Insights', label: 'Insights' },
  gallery: { view: gallery, title: () => 'Grafik-Galerie', label: 'Grafik-Galerie' },
  settings: { view: settings, title: () => 'Einstellungen', label: 'Einstellungen' },
};

const NAV = ['dashboard', 'research', 'strategy', 'write', 'calendar', 'ideas', 'viral', 'insights', 'gallery'];

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  return { name: ROUTES[path] ? path : 'dashboard', params: new URLSearchParams(query) };
}

function navigate(hash, replace = false) {
  if (replace) {
    history.replaceState(null, '', hash);
    route();
  } else if (location.hash === hash) {
    route();
  } else {
    location.hash = hash;
  }
}

function renderShell(name) {
  const s = store.get();
  document.getElementById('nav').innerHTML = NAV.map((key) => {
    const r = ROUTES[key];
    const extra = key === 'strategy' && !s.onboarded ? '<span class="badge tag" style="background:var(--warn-bg);color:var(--warn-text)">offen</span>' : '';
    return `<a href="#/${key}${key === 'write' ? '' : ''}" class="${name === key ? 'active' : ''}">${r.label}${extra}</a>`;
  }).join('');

  const niche = NICHES.find((n) => n.id === s.profile.niche)?.label;
  document.getElementById('sidebar-foot').innerHTML = `
    <a class="nav-set" href="#/settings" style="display:flex;gap:12px;padding:10px 12px;border-radius:10px;color:var(--text-2);${name === 'settings' ? 'background:var(--primary-soft);color:var(--primary);font-weight:600' : ''}">Einstellungen</a>
    <div class="user">
      <div style="min-width:0"><div style="font-weight:600">${esc(s.profile.name || 'Gast')}</div><div class="tiny">${esc(niche || 'Keine Nische gewählt')}</div></div></div>`;

  document.getElementById('page-title').textContent = ROUTES[name].title(s);
  document.title = `${ROUTES[name].label} · Postlab`;
}

function route() {
  const { name, params } = parseHash();
  if (!location.hash) {
    const s = store.get();
    return navigate(s.onboarded ? '#/dashboard' : '#/strategy', true);
  }
  renderShell(name);
  document.getElementById('sidebar').classList.remove('open');
  const el = document.getElementById('view');
  el.innerHTML = '';
  ROUTES[name].view.render(el, { navigate, params });
  window.scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-action="toggle-nav"]')) document.getElementById('sidebar').classList.toggle('open');
});

// Sidebar & Titel aktuell halten, wenn sich z. B. der Name im Onboarding ändert
store.subscribe(() => renderShell(parseHash().name));

settings.applyTheme();
window.addEventListener('hashchange', route);
route();
