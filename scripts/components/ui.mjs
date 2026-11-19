// Piezas pequeñas: cabeceras de sección, botones y píldoras de navegación.
import { C, svg, esc, r2, cota } from '../lib/svg.mjs';

// Cabecera de plano: número en acento, título en tinta y una cota a todo el ancho.
// Fondo transparente: el README elige la variante clara u oscura con <picture>.
export function sectionHeader({ n, title, tag }) {
  const W = 900;
  const H = 60;
  const body = `
  <text x="0" y="31" font-size="13" font-weight="600" class="mono" fill="${C.accent}">${esc(n)}</text>
  <text x="34" y="32" font-size="24" font-weight="600" letter-spacing="-0.3" fill="${C.ink}">${esc(title)}</text>
  <text x="${W}" y="31" text-anchor="end" font-size="13" fill="${C.muted}">${esc(tag)}</text>
  ${cota({ x1: 0, x2: W, y: 48, draw: true })}
  `;
  return svg({ w: W, h: H, title, desc: `Sección ${n}: ${title}`, body });
}

// Enlace de contacto: caja plana de 1px, etiqueta y flecha de salida en trazo fino.
// `gap` deja aire transparente a la derecha para que la fila llegue justa a los bordes.
export function button({ label, value, w = 290, gap = 0 }) {
  const H = 56;
  const bw = w - gap;
  const body = `
  <rect x="0.5" y="0.5" width="${bw - 1}" height="${H - 1}" rx="2" fill="none" stroke="${C.rule2}"/>
  <text x="16" y="22" font-size="12" fill="${C.muted}">${esc(label)}</text>
  <text x="16" y="41" font-size="15" font-weight="600" fill="${C.ink}">${esc(value)}</text>
  <path d="M${bw - 30} 34 L${bw - 19} 23 M${bw - 27} 23 H${bw - 19} V31" fill="none" stroke="${C.muted}" stroke-width="1" stroke-linecap="square"/>
  `;
  return svg({ w, h: H, title: `${label}: ${value}`, body });
}

// Índice: número mono y etiqueta subrayada, sin cápsula ni color por sección.
export function navPill({ label, n, w = Math.round(label.length * 7.3 + 34) }) {
  const H = 30;
  const body = `
  <text x="2" y="18" font-size="11" class="mono" fill="${C.muted}">${esc(n)}</text>
  <text x="24" y="18" font-size="13" font-weight="500" fill="${C.ink}">${esc(label)}</text>
  <path d="M2 26.5 H${w - 2}" stroke="${C.rule2}"/>
  `;
  return { w, svg: svg({ w, h: H, title: label, body }) };
}

export { r2 };
