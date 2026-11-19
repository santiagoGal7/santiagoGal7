// Sistema de diseño compartido por todos los SVG del perfil.
// Los SVG se cargan dentro de <img> en GitHub: nada de JS ni fuentes externas.
// Las animaciones usan CSS (@keyframes) y SMIL, que sí funcionan en ese contexto.
//
// Dirección "Plano": tinta sobre papel y un solo color de señal, como un juego de
// planos técnicos. Cada asset se genera dos veces (tema oscuro y claro) y el README
// elige con <picture>, así que el fondo es transparente y se integra con GitHub.

export const THEMES = {
  dark: {
    paper: '#15140F',
    paper2: '#1D1B16',
    ink: '#ECE6D9',
    muted: '#A8A193',
    faint: '#8C8577',
    rule: '#3A372F',
    rule2: '#55503F',
    accent: '#F2762E',
    accentInk: '#1A0D04',
    ok: '#6CBF8E',
    err: '#E8664F',
  },
  light: {
    paper: '#F7F4EC',
    paper2: '#EFEAE0',
    ink: '#1E1C18',
    muted: '#5F5A50',
    faint: '#7A7365',
    rule: '#DDD7CA',
    rule2: '#B9B1A0',
    accent: '#C2410C',
    accentInk: '#FFFFFF',
    ok: '#1E7A4C',
    err: '#B42318',
  },
};

// Paleta activa. Los componentes la leen al renderizar, nunca al importar.
export const C = { ...THEMES.dark };
export let THEME = 'dark';

export function setTheme(name) {
  if (!THEMES[name]) throw new Error(`Tema desconocido: ${name}`);
  THEME = name;
  Object.assign(C, THEMES[name]);
}

export const FONT = {
  sans: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
  mono: "ui-monospace, 'Cascadia Mono', 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
};

// Ancho medio de un carácter monoespaciado respecto al tamaño de fuente.
// Se fuerza con textLength para que el cursor y las máscaras de tipeo cuadren.
export const MONO_RATIO = 0.6;

// Curva de salida común para todo lo que entra en escena.
export const EASE = 'cubic-bezier(.16,1,.3,1)';

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const r2 = (n) => Math.round(n * 100) / 100;

// .draw: el trazo se dibuja una vez (requiere pathLength="1").
// .in: aparece una vez con un desplazamiento corto.
// El estado final vive en los atributos: sin animación se ve todo completo.
const baseCss = () => `
  text { font-family: ${FONT.sans}; }
  .mono { font-family: ${FONT.mono}; }
  .draw { stroke-dasharray: 1; animation: draw 1.1s ${EASE} backwards; }
  @keyframes draw { from { stroke-dashoffset: 1; } }
  .in { animation: in .7s ${EASE} backwards; }
  @keyframes in { from { opacity: 0; transform: translateY(6px); } }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; }
  }
`;

// Patrones de dibujo técnico: rayado a 45° y retícula fina.
const commonDefs = () => `
  <pattern id="p-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <path d="M0 0 V6" stroke="${C.rule2}" stroke-width="1"/>
  </pattern>
  <pattern id="p-hatch-a" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <path d="M0 0 V5" stroke="${C.accent}" stroke-width="1.2"/>
  </pattern>
  <pattern id="p-grid" width="12" height="12" patternUnits="userSpaceOnUse">
    <path d="M12 0 H0 V12" fill="none" stroke="${C.rule}" stroke-width="0.6"/>
  </pattern>
`;

export function svg({ w, h, title, desc = '', defs = '', css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
  <title id="t">${esc(title)}</title>
  <desc id="d">${esc(desc || title)}</desc>
  <style>${baseCss()}${css}</style>
  <defs>${commonDefs()}${defs}</defs>
${body}
</svg>
`;
}

// Caja plana para objetos reales (terminal, log, tarjetas). Radio 2 o 4, trazo 1px.
export function panel({ x = 0, y = 0, w, h, rx = 2, stroke = C.rule2, fill = C.paper }) {
  return `
  <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
}

// Etiqueta de texto mono con borde fino. accent=true solo para el dato principal.
export function chip({ x, y, label, accent = false, size = 11, padX = 7, h = 20 }) {
  const w = Math.round(label.length * size * MONO_RATIO + padX * 2);
  const color = accent ? C.accent : C.muted;
  return {
    w,
    svg: `
  <g>
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="2" fill="none" stroke="${accent ? C.accent : C.rule2}"/>
    <text x="${x + padX}" y="${r2(y + h / 2 + size * 0.36)}" font-size="${size}" fill="${color}" class="mono">${esc(label)}</text>
  </g>`,
  };
}

export function chipRow({ x, y, labels, gap = 6, maxW = Infinity, ...rest }) {
  let cx = x;
  let out = '';
  for (const item of labels) {
    const { label, accent } = typeof item === 'string' ? { label: item } : item;
    const c = chip({ x: cx, y, label, accent: accent ?? rest.accent, ...rest });
    if (cx + c.w - x > maxW) break;
    out += c.svg;
    cx += c.w + gap;
  }
  return out;
}

// Cota: línea de medida con remates verticales en los extremos.
export function cota({ x1, x2, y, tick = 8, color = C.rule2, draw = false, delay = 0 }) {
  const anim = draw ? ` pathLength="1" class="draw" style="animation-delay:${delay}s"` : '';
  return `
  <path d="M${x1 + 0.5} ${y - tick / 2} V${y + tick / 2} M${x2 - 0.5} ${y - tick / 2} V${y + tick / 2}" stroke="${color}"/>
  <path d="M${x1} ${y + 0.5} H${x2}" stroke="${color}"${anim}/>`;
}

// Cruz de registro para esquinas de plano.
export function cross(x, y, s = 5, color = C.rule2) {
  return `<path d="M${x - s} ${y} H${x + s} M${x} ${y - s} V${y + s}" stroke="${color}"/>`;
}

// Cajetín: tabla de una fila con celdas [etiqueta, valor], alineada a la derecha en (x2, y).
// Con `base` se apoya sobre una línea que corre desde x = base hasta el cajetín.
export function titleBlock({ x2, y, cells, h = 40, base }) {
  const widths = cells.map(([k, v]) => Math.round(Math.max(k.length * 11 * 0.55, v.length * 12.5 * 0.56) + 22));
  const total = widths.reduce((a, b) => a + b, 0);
  let x = x2 - total;
  let out = base === undefined ? '' : `<path d="M${base} ${y + h - 0.5} H${x}" stroke="${C.rule2}"/>`;
  out += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${total - 1}" height="${h - 1}" fill="none" stroke="${C.rule2}"/>`;
  cells.forEach(([k, v], i) => {
    if (i) out += `<path d="M${x + 0.5} ${y} V${y + h}" stroke="${C.rule2}"/>`;
    out += `<text x="${x + 10}" y="${y + 15}" font-size="11" fill="${C.muted}">${esc(k)}</text>`;
    out += `<text x="${x + 10}" y="${y + 31}" font-size="12.5" font-weight="500" fill="${C.ink}">${esc(v)}</text>`;
    x += widths[i];
  });
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

export function textLines({ x, y, lines, size = 13, lh = 1.5, fill = C.muted, cls = '', anchor = 'start', weight }) {
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
  cursorColor = C.accent,
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
  <text x="${x}" y="${y}" font-size="${size}" class="mono" fill="${p.fill || C.ink}" textLength="${r2(L * cw)}" lengthAdjust="spacingAndGlyphs" mask="url(#${id}-m${i})">${esc(p.text)}</text>`;
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
