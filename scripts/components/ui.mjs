// Piezas pequeñas: cabeceras de sección, botones y píldoras de navegación.
import { C, svg, esc, r2 } from '../lib/svg.mjs';

// Lápiz por sección: naranja, azul, ocre y verde se repiten en orden.
export const sectionTone = (n) => [C.accent, C.blue, C.ochre, C.ok][(Number(n) - 1) % 4];

// Cabecera como marca de corte de un plano: círculo partido con el número arriba y
// la mitad inferior rellena, línea de corte (trazo y punto) y flecha de vista al final.
export function sectionHeader({ n, title, tag }) {
  const W = 900;
  const H = 72;
  const tone = sectionTone(n);
  const cx = 21;
  const cy = 46;
  const r = 20;
  const body = `
  <defs>
    <clipPath id="cut-${n}">
      <rect x="0" y="${cy - 12}" width="${W}" height="24">
        <animate attributeName="width" values="0;${W}" keyTimes="0;1" dur="1.2s" begin=".15s" calcMode="spline" keySplines=".16 1 .3 1" fill="freeze"/>
      </rect>
    </clipPath>
  </defs>
  <g class="in">
    <path d="M${cx - r} ${cy} A${r} ${r} 0 0 0 ${cx + r} ${cy} Z" fill="${tone}"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 0.5}" fill="none" stroke="${C.ink}"/>
    <path d="M${cx - r} ${cy + 0.5} H${cx + r}" stroke="${C.ink}"/>
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="12" font-weight="600" class="mono" fill="${C.ink}">${esc(n)}</text>
    <text x="${cx + r + 12}" y="${cy - 10}" font-size="26" font-weight="600" letter-spacing="-0.4" fill="${C.ink}">${esc(title)}</text>
    <text x="${W - 26}" y="${cy - 11}" text-anchor="end" font-size="13" fill="${C.muted}">${esc(tag)}</text>
  </g>
  <g clip-path="url(#cut-${n})">
    <path d="M${cx + r + 8} ${cy + 0.5} H${W - 18}" stroke="${tone}" stroke-dasharray="18 4 3 4"/>
    <path d="M${W - 18} ${cy + 0.5} H${W}" stroke="${tone}"/>
    <path d="M${W - 16} ${cy} L${W} ${cy} L${W - 8} ${cy - 13} Z" fill="${tone}"/>
  </g>
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

// Índice: número mono con el lápiz de su sección y etiqueta subrayada, sin cápsula.
export function navPill({ label, n, w = Math.round(label.length * 7.3 + 34) }) {
  const H = 30;
  const body = `
  <text x="2" y="18" font-size="11" font-weight="600" class="mono" fill="${sectionTone(n)}">${esc(n)}</text>
  <text x="24" y="18" font-size="13" font-weight="500" fill="${C.ink}">${esc(label)}</text>
  <path d="M2 26.5 H${w - 2}" stroke="${C.rule2}"/>
  `;
  return { w, svg: svg({ w, h: H, title: label, body }) };
}

export { r2 };
