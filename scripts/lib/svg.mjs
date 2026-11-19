// Sistema de diseño compartido por todos los SVG del perfil.
// Los SVG se cargan dentro de <img> en GitHub: nada de JS ni fuentes externas.
// Las animaciones usan CSS (@keyframes) y SMIL, que sí funcionan en ese contexto.

export const C = {
  bg0: '#050816',
  bg1: '#0A1128',
  panel: '#0C142B',
  panel2: '#111B38',
  line: '#1D2A4D',
  text: '#E6EDF3',
  sub: '#A3B0C6',
  dim: '#5F6C88',
  blue: '#58A6FF',
  blueDeep: '#1C7ED6',
  cyan: '#22D3EE',
  violet: '#A78BFA',
  purple: '#8B5CF6',
  pink: '#F472B6',
  green: '#3FB950',
  amber: '#FBBF24',
  orange: '#FB923C',
  red: '#F87171',
};

export const FONT = {
  sans: "'Segoe UI', -apple-system, BlinkMacSystemFont, Inter, 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Cascadia Code', 'SF Mono', ui-monospace, Menlo, Consolas, 'Liberation Mono', monospace",
};

// Ancho medio de un carácter monoespaciado respecto al tamaño de fuente.
// Se fuerza con textLength para que el cursor y las máscaras de tipeo cuadren.
export const MONO_RATIO = 0.6;

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const r2 = (n) => Math.round(n * 100) / 100;

const BASE_CSS = `
  text { font-family: ${FONT.sans}; }
  .mono { font-family: ${FONT.mono}; }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; }
  }
`;

// Degradados y filtros que reutilizan casi todos los componentes.
export const COMMON_DEFS = `
  <linearGradient id="g-bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.bg0}"/>
    <stop offset="1" stop-color="${C.bg1}"/>
  </linearGradient>
  <linearGradient id="g-panel" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.panel2}"/>
    <stop offset="1" stop-color="${C.panel}"/>
  </linearGradient>
  <linearGradient id="g-brand" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${C.blue}"/>
    <stop offset="0.5" stop-color="${C.cyan}"/>
    <stop offset="1" stop-color="${C.violet}"/>
  </linearGradient>
  <linearGradient id="g-stroke" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.blue}" stop-opacity="0.55"/>
    <stop offset="0.5" stop-color="${C.line}" stop-opacity="0.9"/>
    <stop offset="1" stop-color="${C.violet}" stop-opacity="0.55"/>
  </linearGradient>
  <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="f-soft" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="8"/>
  </filter>
`;

export function svg({ w, h, title, desc = '', defs = '', css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
  <title id="t">${esc(title)}</title>
  <desc id="d">${esc(desc || title)}</desc>
  <style>${BASE_CSS}${css}</style>
  <defs>${COMMON_DEFS}${defs}</defs>
${body}
</svg>
`;
}

// Panel "glass" con borde degradado y brillo superior.
export function panel({ x = 0, y = 0, w, h, rx = 18, stroke = 'url(#g-stroke)', fill = 'url(#g-panel)' }) {
  return `
  <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>
  <path d="M${x + rx} ${y + 1.5} H${x + w - rx}" stroke="#FFFFFF" stroke-opacity="0.08"/>`;
}

// Chip de texto (pill). Devuelve { svg, w } para poder encadenar.
export function chip({ x, y, label, color = C.blue, size = 11, padX = 10, h = 22, mono = true }) {
  const w = Math.round(label.length * size * (mono ? MONO_RATIO : 0.56) + padX * 2);
  return {
    w,
    svg: `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-opacity="0.45"/>
    <text x="${x + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-size="${size}" fill="${color}" class="${mono ? 'mono' : ''}">${esc(label)}</text>
  </g>`,
  };
}

export function chipRow({ x, y, labels, gap = 8, maxW = Infinity, ...rest }) {
  let cx = x;
  let out = '';
  for (const item of labels) {
    const { label, color } = typeof item === 'string' ? { label: item } : item;
    const c = chip({ x: cx, y, label, color: color || rest.color, ...rest });
    if (cx + c.w - x > maxW) break;
    out += c.svg;
    cx += c.w + gap;
  }
  return out;
}

// Parte un texto en líneas según un ancho aproximado en caracteres.
export function wrap(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur += ' ' + w;
    }
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

export function textLines({ x, y, lines, size = 13, lh = 1.5, fill = C.sub, cls = '', anchor = 'start', weight }) {
  return lines
    .map(
      (l, i) =>
        `<text x="${x}" y="${r2(y + i * size * lh)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}"${cls ? ` class="${cls}"` : ''}${weight ? ` font-weight="${weight}"` : ''}>${esc(l)}</text>`,
    )
    .join('\n  ');
}

// Animación de tipeo con SMIL (calcMode discreto) sobre una máscara.
// Varias frases comparten ciclo y se escriben/borran por turnos.
// Devuelve { defs, body } para insertar en el SVG.
export function typewriter({
  id,
  x,
  y,
  size,
  phrases, // [{ text, fill }]
  cycle, // segundos
  typeStep = 0.07,
  deleteStep = 0.025,
  hold = 1.8,
  cursorColor = C.cyan,
}) {
  const cw = size * MONO_RATIO;
  const slot = cycle / phrases.length;
  let defs = '';
  let body = '';
  const cursorEvents = [];

  phrases.forEach((p, i) => {
    const L = p.text.length;
    const start = i * slot + 0.15;
    const events = [[0, 0]];
    for (let c = 1; c <= L; c++) events.push([start + c * typeStep, c * cw]);
    const delStart = start + L * typeStep + hold;
    for (let c = 1; c <= L; c++) events.push([delStart + c * deleteStep, (L - c) * cw]);
    const norm = events
      .filter(([t]) => t < cycle)
      .map(([t, w]) => [t / cycle, w])
      .sort((a, b) => a[0] - b[0]);
    // keyTimes deben ser estrictamente crecientes
    const clean = [];
    for (const e of norm) {
      if (clean.length && Math.abs(clean[clean.length - 1][0] - e[0]) < 1e-6) clean[clean.length - 1] = e;
      else clean.push(e);
    }
    const values = clean.map(([, w]) => r2(w)).join(';');
    const keyTimes = clean.map(([t]) => t.toFixed(5)).join(';');
    defs += `
  <mask id="${id}-m${i}" maskUnits="userSpaceOnUse">
    <rect x="${x}" y="${y - size * 1.1}" height="${size * 1.6}" width="0" fill="#fff">
      <animate attributeName="width" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" values="${values}" keyTimes="${keyTimes}"/>
    </rect>
  </mask>`;
    body += `
  <text x="${x}" y="${y}" font-size="${size}" class="mono" fill="${p.fill || C.text}" textLength="${r2(L * cw)}" lengthAdjust="spacingAndGlyphs" mask="url(#${id}-m${i})">${esc(p.text)}</text>`;
    for (const [t, w] of clean) if (t > 0) cursorEvents.push([t, w]);
  });

  cursorEvents.sort((a, b) => a[0] - b[0]);
  const ce = [[0, 0], ...cursorEvents];
  const cvals = ce.map(([, w]) => r2(x + w + 1)).join(';');
  const ckeys = ce.map(([t]) => t.toFixed(5)).join(';');
  body += `
  <rect x="${x + 1}" y="${y - size * 0.85}" width="${r2(size * 0.55)}" height="${r2(size * 1.05)}" fill="${cursorColor}" class="blink">
    <animate attributeName="x" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" values="${cvals}" keyTimes="${ckeys}"/>
  </rect>`;

  return { defs, body };
}

export const BLINK_CSS = `
  .blink { animation: blink 1.05s steps(1, end) infinite; }
  @keyframes blink { 0%, 55% { opacity: 1; } 56%, 100% { opacity: 0; } }
`;

// Pequeño generador pseudoaleatorio determinista (mismo SVG en cada build).
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
