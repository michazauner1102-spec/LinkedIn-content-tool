// Canvas-Renderer für die Grafik-Galerie + minimaler PDF-Export für Carousels.

import { THEMES, FORMATS } from './data.js';

const FONT = '"Inter", "Helvetica Neue", Arial, sans-serif';

export function renderGraphic(canvas, tpl, opts) {
  const theme = THEMES.find((t) => t.id === opts.theme) || THEMES[0];
  const fmt = FORMATS.find((f) => f.id === opts.format) || FORMATS[0];
  canvas.width = fmt.w;
  canvas.height = fmt.h;
  const ctx = canvas.getContext('2d');
  const W = fmt.w;
  const H = fmt.h;
  const P = Math.round(W * 0.08);
  const f = opts.fields;

  // Hintergrund
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, theme.bg);
  g.addColorStop(1, theme.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const scale = Math.min(W, H) / 1080;
  const footerH = opts.author ? Math.round(110 * scale) : 0;
  const area = { x: P, y: P, w: W - 2 * P, h: H - 2 * P - footerH };

  const R = RENDERERS[tpl.id] || RENDERERS.quote;
  R(ctx, { W, H, P, area, theme, f, scale });

  if (opts.author) drawFooter(ctx, { W, H, P, theme, scale, author: opts.author, handle: opts.handle });
  if (opts.page) {
    ctx.fillStyle = theme.muted;
    ctx.font = `600 ${28 * scale}px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(opts.page, W - P, P * 0.55);
    ctx.textAlign = 'left';
  }
}

function drawFooter(ctx, { W, H, P, theme, scale, author, handle }) {
  const y = H - P - 70 * scale;
  const r = 34 * scale;
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.arc(P + r, y + r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.bg;
  ctx.font = `800 ${30 * scale}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = author
    .split(/\s+/)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  ctx.fillText(initials, P + r, y + r + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.fg;
  ctx.font = `700 ${30 * scale}px ${FONT}`;
  ctx.fillText(author, P + 2 * r + 20 * scale, y + r - 4 * scale);
  if (handle) {
    ctx.fillStyle = theme.muted;
    ctx.font = `500 ${24 * scale}px ${FONT}`;
    ctx.fillText(handle, P + 2 * r + 20 * scale, y + r + 28 * scale);
  }
}

// Zeilenumbruch mit automatischer Schriftgrößen-Anpassung
function wrap(ctx, text, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) {
    if (!para.trim()) {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        out.push(line);
        line = word;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

function fitText(ctx, text, { maxW, maxH, weight = 800, start = 90, min = 28, lh = 1.18 }) {
  let size = start;
  let lines;
  while (size >= min) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    lines = wrap(ctx, text, maxW);
    if (lines.length * size * lh <= maxH) break;
    size -= 2;
  }
  return { size, lines, lh: size * lh, height: lines.length * size * lh };
}

function drawLines(ctx, lines, x, y, lh, align = 'left') {
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  ctx.textAlign = 'left';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function pill(ctx, text, x, y, theme, scale) {
  ctx.font = `700 ${26 * scale}px ${FONT}`;
  const w = ctx.measureText(text).width + 44 * scale;
  const h = 52 * scale;
  ctx.fillStyle = theme.accent;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = theme.bg;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 22 * scale, y + h / 2 + 1);
  ctx.textBaseline = 'top';
  return h;
}

const items = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

const RENDERERS = {
  quote(ctx, { area, theme, f, scale }) {
    ctx.fillStyle = theme.accent;
    ctx.font = `900 ${260 * scale}px Georgia, serif`;
    ctx.textBaseline = 'top';
    ctx.fillText('“', area.x - 10 * scale, area.y - 60 * scale);
    const top = area.y + 170 * scale;
    ctx.fillStyle = theme.fg;
    const t = fitText(ctx, f.title, { maxW: area.w, maxH: area.h - 200 * scale, start: 84 * scale, min: 30 * scale });
    drawLines(ctx, t.lines, area.x, top, t.lh);
    if (f.subtitle) {
      ctx.fillStyle = theme.muted;
      ctx.font = `600 ${34 * scale}px ${FONT}`;
      ctx.fillText(`— ${f.subtitle}`, area.x, top + t.height + 30 * scale);
    }
  },

  stat(ctx, { area, theme, f, scale }) {
    ctx.fillStyle = theme.accent;
    const big = fitText(ctx, f.title, { maxW: area.w, maxH: area.h * 0.5, weight: 900, start: 300 * scale, min: 80 * scale, lh: 1.0 });
    const sub = (() => {
      ctx.fillStyle = theme.fg;
      return fitText(ctx, f.subtitle, { maxW: area.w, maxH: area.h * 0.4, weight: 600, start: 56 * scale, min: 26 * scale, lh: 1.3 });
    })();
    const total = big.height + 40 * scale + sub.height;
    const y0 = area.y + (area.h - total) / 2;
    ctx.fillStyle = theme.accent;
    ctx.font = `900 ${big.size}px ${FONT}`;
    drawLines(ctx, big.lines, area.x, y0, big.lh);
    ctx.fillStyle = theme.fg;
    ctx.font = `600 ${sub.size}px ${FONT}`;
    drawLines(ctx, sub.lines, area.x, y0 + big.height + 40 * scale, sub.lh);
  },

  list(ctx, { area, theme, f, scale }) {
    ctx.fillStyle = theme.fg;
    const t = fitText(ctx, f.title, { maxW: area.w, maxH: area.h * 0.3, start: 72 * scale, min: 34 * scale });
    drawLines(ctx, t.lines, area.x, area.y, t.lh);
    const list = items(f.items);
    const top = area.y + t.height + 50 * scale;
    const rowH = Math.min(120 * scale, (area.h - t.height - 50 * scale) / Math.max(list.length, 1));
    const fs = Math.min(42 * scale, rowH * 0.42);
    list.forEach((it, i) => {
      const y = top + i * rowH;
      const box = fs * 1.3;
      ctx.fillStyle = theme.accent;
      roundRect(ctx, area.x, y, box, box, box * 0.25);
      ctx.fill();
      ctx.strokeStyle = theme.bg;
      ctx.lineWidth = 6 * scale;
      ctx.beginPath();
      ctx.moveTo(area.x + box * 0.25, y + box * 0.52);
      ctx.lineTo(area.x + box * 0.43, y + box * 0.7);
      ctx.lineTo(area.x + box * 0.77, y + box * 0.3);
      ctx.stroke();
      ctx.fillStyle = theme.fg;
      ctx.font = `600 ${fs}px ${FONT}`;
      ctx.textBaseline = 'middle';
      ctx.fillText(it, area.x + box + 28 * scale, y + box / 2, area.w - box - 28 * scale);
      ctx.textBaseline = 'top';
    });
  },

  mythfact(ctx, { area, theme, f, scale }) {
    const half = (area.h - 30 * scale) / 2;
    [['MYTHOS', f.title, 0.14], ['FAKT', f.subtitle, 0.28]].forEach(([label, text, alpha], i) => {
      const y = area.y + i * (half + 30 * scale);
      ctx.fillStyle = i === 0 ? `rgba(127,127,127,${alpha})` : theme.accent;
      roundRect(ctx, area.x, y, area.w, half, 28 * scale);
      ctx.fill();
      ctx.fillStyle = i === 0 ? theme.fg : theme.bg;
      ctx.font = `800 ${30 * scale}px ${FONT}`;
      ctx.textBaseline = 'top';
      ctx.fillText(i === 0 ? `✕  ${label}` : `✓  ${label}`, area.x + 40 * scale, y + 36 * scale);
      const t = fitText(ctx, text, { maxW: area.w - 80 * scale, maxH: half - 130 * scale, weight: i === 0 ? 700 : 800, start: 58 * scale, min: 26 * scale });
      if (i === 0) {
        ctx.save();
        ctx.globalAlpha = 0.85;
      }
      drawLines(ctx, t.lines, area.x + 40 * scale, y + 100 * scale, t.lh);
      if (i === 0) ctx.restore();
    });
  },

  beforeafter(ctx, { area, theme, f, scale }) {
    const colW = (area.w - 40 * scale) / 2;
    [['VORHER', f.title], ['NACHHER', f.subtitle]].forEach(([label, text], i) => {
      const x = area.x + i * (colW + 40 * scale);
      ctx.fillStyle = i === 0 ? 'rgba(127,127,127,.16)' : theme.accent;
      roundRect(ctx, x, area.y, colW, area.h, 28 * scale);
      ctx.fill();
      ctx.fillStyle = i === 0 ? theme.muted : theme.bg;
      ctx.font = `800 ${30 * scale}px ${FONT}`;
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + 36 * scale, area.y + 40 * scale);
      ctx.fillStyle = i === 0 ? theme.fg : theme.bg;
      const t = fitText(ctx, text, { maxW: colW - 72 * scale, maxH: area.h - 200 * scale, start: 60 * scale, min: 24 * scale });
      drawLines(ctx, t.lines, x + 36 * scale, area.y + (area.h - t.height) / 2, t.lh);
    });
    ctx.fillStyle = theme.fg;
    ctx.beginPath();
    const cx = area.x + colW + 20 * scale;
    const cy = area.y + area.h / 2;
    ctx.arc(cx, cy, 40 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = theme.bg;
    ctx.font = `900 ${44 * scale}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('→', cx, cy + 2);
    ctx.textAlign = 'left';
  },

  framework(ctx, { area, theme, f, scale }) {
    ctx.fillStyle = theme.fg;
    const t = fitText(ctx, f.title, { maxW: area.w, maxH: area.h * 0.25, start: 76 * scale, min: 34 * scale });
    drawLines(ctx, t.lines, area.x, area.y, t.lh);
    const list = items(f.items);
    const top = area.y + t.height + 50 * scale;
    const gap = 24 * scale;
    const rowH = (area.h - t.height - 50 * scale - gap * (list.length - 1)) / Math.max(list.length, 1);
    list.forEach((it, i) => {
      const y = top + i * (rowH + gap);
      ctx.fillStyle = 'rgba(127,127,127,.14)';
      roundRect(ctx, area.x, y, area.w, rowH, 24 * scale);
      ctx.fill();
      ctx.fillStyle = theme.accent;
      ctx.font = `900 ${Math.min(rowH * 0.55, 90 * scale)}px ${FONT}`;
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1).padStart(2, '0'), area.x + 36 * scale, y + rowH / 2);
      ctx.fillStyle = theme.fg;
      ctx.font = `700 ${Math.min(rowH * 0.32, 50 * scale)}px ${FONT}`;
      ctx.fillText(it, area.x + 170 * scale, y + rowH / 2, area.w - 200 * scale);
    });
    ctx.textBaseline = 'top';
  },

  hottake(ctx, { area, theme, f, scale }) {
    let y = area.y;
    if (f.subtitle) y += pill(ctx, `🔥 ${f.subtitle}`, area.x, y, theme, scale) + 50 * scale;
    ctx.fillStyle = theme.fg;
    const t = fitText(ctx, f.title, { maxW: area.w, maxH: area.y + area.h - y, weight: 900, start: 130 * scale, min: 40 * scale, lh: 1.08 });
    drawLines(ctx, t.lines, area.x, y + (area.y + area.h - y - t.height) / 2, t.lh);
  },

  tweet(ctx, { area, theme, f, scale, W }) {
    const cardH = area.h * 0.8;
    const y = area.y + (area.h - cardH) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,.18)';
    ctx.shadowBlur = 40 * scale;
    roundRect(ctx, area.x, y, area.w, cardH, 32 * scale);
    ctx.fill();
    ctx.shadowBlur = 0;
    const px = area.x + 48 * scale;
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(px + 36 * scale, y + 84 * scale, 36 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${32 * scale}px ${FONT}`;
    ctx.textBaseline = 'top';
    ctx.fillText(f.subtitle || 'Ihr Name', px + 96 * scale, y + 52 * scale);
    ctx.fillStyle = '#64748b';
    ctx.font = `500 ${24 * scale}px ${FONT}`;
    ctx.fillText('LinkedIn · 1 Std.', px + 96 * scale, y + 94 * scale);
    ctx.fillStyle = '#0f172a';
    const t = fitText(ctx, f.title, { maxW: area.w - 96 * scale, maxH: cardH - 260 * scale, weight: 500, start: 52 * scale, min: 24 * scale, lh: 1.35 });
    drawLines(ctx, t.lines, px, y + 170 * scale, t.lh);
    ctx.fillStyle = '#64748b';
    ctx.font = `500 ${24 * scale}px ${FONT}`;
    ctx.fillText('👍 ❤️ 💡  1.024 · 87 Kommentare', px, y + cardH - 70 * scale);
    void W;
  },

  dodont(ctx, { area, theme, f, scale }) {
    ctx.fillStyle = theme.fg;
    const t = fitText(ctx, f.title, { maxW: area.w, maxH: area.h * 0.22, start: 70 * scale, min: 32 * scale });
    drawLines(ctx, t.lines, area.x, area.y, t.lh);
    const top = area.y + t.height + 44 * scale;
    const h = area.y + area.h - top;
    const colW = (area.w - 30 * scale) / 2;
    [['✓ DO', items(f.items), theme.accent], ['✕ DON’T', items(f.items2), 'rgba(127,127,127,.18)']].forEach(([label, list, bg], i) => {
      const x = area.x + i * (colW + 30 * scale);
      ctx.fillStyle = bg;
      roundRect(ctx, x, top, colW, h, 24 * scale);
      ctx.fill();
      ctx.fillStyle = i === 0 ? theme.bg : theme.fg;
      ctx.font = `900 ${36 * scale}px ${FONT}`;
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + 30 * scale, top + 30 * scale);
      let yy = top + 100 * scale;
      for (const it of list) {
        const r = fitText(ctx, it, { maxW: colW - 60 * scale, maxH: 200 * scale, weight: 600, start: 34 * scale, min: 20 * scale, lh: 1.25 });
        drawLines(ctx, r.lines, x + 30 * scale, yy, r.lh);
        yy += r.height + 26 * scale;
      }
    });
  },

  cover(ctx, { area, theme, f, scale }) {
    ctx.fillStyle = theme.accent;
    ctx.fillRect(area.x, area.y, 120 * scale, 14 * scale);
    ctx.fillStyle = theme.fg;
    const t = fitText(ctx, f.title, { maxW: area.w, maxH: area.h * 0.7, weight: 900, start: 120 * scale, min: 40 * scale, lh: 1.06 });
    drawLines(ctx, t.lines, area.x, area.y + (area.h - t.height) / 2 - 30 * scale, t.lh);
    if (f.subtitle) {
      ctx.fillStyle = theme.accent;
      ctx.font = `800 ${40 * scale}px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(f.subtitle, area.x + area.w, area.y + area.h);
      ctx.textAlign = 'left';
    }
  },

  timeline(ctx, { area, theme, f, scale }) {
    ctx.fillStyle = theme.fg;
    const t = fitText(ctx, f.title, { maxW: area.w, maxH: area.h * 0.22, start: 72 * scale, min: 32 * scale });
    drawLines(ctx, t.lines, area.x, area.y, t.lh);
    const list = items(f.items);
    const top = area.y + t.height + 60 * scale;
    const step = (area.y + area.h - top) / Math.max(list.length, 1);
    const lx = area.x + 30 * scale;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 6 * scale;
    ctx.beginPath();
    ctx.moveTo(lx, top + 20 * scale);
    ctx.lineTo(lx, top + step * (list.length - 1) + 20 * scale);
    ctx.stroke();
    list.forEach((it, i) => {
      const y = top + i * step;
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.arc(lx, y + 20 * scale, 20 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme.fg;
      ctx.font = `700 ${Math.min(44 * scale, step * 0.4)}px ${FONT}`;
      ctx.textBaseline = 'middle';
      ctx.fillText(it, lx + 60 * scale, y + 20 * scale, area.w - 100 * scale);
    });
    ctx.textBaseline = 'top';
  },

  question(ctx, { area, theme, f, scale, W }) {
    ctx.fillStyle = theme.accent;
    ctx.font = `900 ${220 * scale}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('?', W / 2, area.y);
    ctx.fillStyle = theme.fg;
    const t = fitText(ctx, f.title, { maxW: area.w, maxH: area.h * 0.5, weight: 800, start: 80 * scale, min: 32 * scale });
    drawLines(ctx, t.lines, W / 2, area.y + 280 * scale, t.lh, 'center');
    if (f.subtitle) {
      ctx.fillStyle = theme.muted;
      ctx.font = `600 ${36 * scale}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(f.subtitle, W / 2, area.y + 320 * scale + t.height);
    }
    ctx.textAlign = 'left';
  },
};

export function downloadCanvas(canvas, name) {
  const a = document.createElement('a');
  a.download = `${name}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

// Minimaler PDF-Writer: jede Seite = ein JPEG in Seitengröße (LinkedIn-Dokument-Post).
export function canvasesToPdf(canvases) {
  const enc = new TextEncoder();
  const chunks = [];
  let length = 0;
  const offsets = [];
  const push = (data) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };
  const obj = (n, body) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
    body();
    push('\nendobj\n');
  };

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const n = canvases.length;
  const pageIds = canvases.map((_, i) => 3 + i * 3);
  obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => push(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${n} >>`));

  canvases.forEach((c, i) => {
    const pid = 3 + i * 3;
    const w = c.width;
    const h = c.height;
    const b64 = c.toDataURL('image/jpeg', 0.92).split(',')[1];
    const bin = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
    const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
    obj(pid, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${pid + 2} 0 R >> >> /Contents ${pid + 1} 0 R >>`));
    obj(pid + 1, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    obj(pid + 2, () => {
      push(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bin.length} >>\nstream\n`);
      push(bin);
      push('\nendstream');
    });
  });

  const total = 3 + n * 3;
  const xref = length;
  let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) x += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  push(x);
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}
