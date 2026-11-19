// Piezas pequeñas: cabeceras de sección, botones y píldoras de navegación.
import { C, svg, esc, r2, MONO_RATIO } from '../lib/svg.mjs';

// Barra oscura propia: se lee igual en el tema claro y en el oscuro de GitHub.
export function sectionHeader({ n, title, tag }) {
  const W = 900;
  const H = 64;
  const titleW = title.length * 12.4;
  const lineX = Math.round(Math.min(92 + titleW + 24, 640));
  const tagText = `// ${tag}`;
  const tagW = tagText.length * 12 * MONO_RATIO;
  const lineW = Math.round(W - 22 - tagW - 18 - lineX);
  const css = `
    .sweep { animation: sweep 4.5s cubic-bezier(.6,0,.4,1) infinite; }
    @keyframes sweep { 0% { transform: translateX(-140px); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateX(${lineW}px); opacity: 0; } }
    .num { animation: hue 6s ease-in-out infinite; }
    @keyframes hue { 0%,100% { opacity: 1; } 50% { opacity: .65; } }
  `;
  const defs = `
    <linearGradient id="hl" x1="0" x2="1">
      <stop offset="0" stop-color="${C.blue}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${C.line}" stop-opacity="0.4"/>
    </linearGradient>
    <linearGradient id="sw" x1="0" x2="1">
      <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${C.cyan}"/>
      <stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="lc"><rect x="${lineX}" y="27" width="${lineW}" height="10"/></clipPath>
  `;
  const body = `
  <rect x="1" y="4" width="${W - 2}" height="56" rx="14" fill="url(#g-panel)" stroke="url(#g-stroke)"/>
  <rect x="12" y="13" width="62" height="38" rx="10" fill="${C.bg0}" stroke="${C.line}"/>
  <text x="43" y="38.5" text-anchor="middle" font-size="18" font-weight="700" class="mono num" fill="url(#g-brand)">${esc(n)}</text>
  <text x="92" y="40" font-size="22" font-weight="700" fill="${C.text}">${esc(title)}</text>
  <rect x="${lineX}" y="31.25" width="${lineW}" height="1.5" fill="url(#hl)"/>
  <g clip-path="url(#lc)"><rect x="${lineX}" y="30.25" width="140" height="3.5" rx="2" fill="url(#sw)" class="sweep"/></g>
  <text x="${W - 22}" y="36" text-anchor="end" font-size="12" class="mono" fill="${C.dim}">${esc(tagText)}</text>
  `;
  return svg({ w: W, h: H, title, desc: `Sección ${n}: ${title}`, defs, css, body });
}

// Botón de contacto con brillo que recorre el borde.
export function button({ label, value, icon, color = C.blue, w = 290 }) {
  const H = 64;
  const css = `
    .shine { animation: shine 3.8s ease-in-out infinite; }
    @keyframes shine { 0% { transform: translateX(-120px) skewX(-20deg); } 60%,100% { transform: translateX(${w + 60}px) skewX(-20deg); } }
    .ring { animation: ring 2.4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes ring { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(1.7); opacity: 0; } }
  `;
  const defs = `
    <clipPath id="bc"><rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="16"/></clipPath>
    <linearGradient id="bs" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}"/>
      <stop offset="1" stop-color="${C.violet}" stop-opacity="0.6"/>
    </linearGradient>
  `;
  const body = `
  <rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="16" fill="url(#g-panel)" stroke="url(#bb)" stroke-width="1.5"/>
  <g clip-path="url(#bc)"><rect x="0" y="-10" width="70" height="${H + 20}" fill="url(#bs)" class="shine"/></g>
  <circle cx="34" cy="${H / 2}" r="17" fill="${color}" fill-opacity="0.14"/>
  <circle cx="34" cy="${H / 2}" r="17" fill="none" stroke="${color}" stroke-opacity="0.6" class="ring"/>
  <g transform="translate(22 ${H / 2 - 12})" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
  <text x="64" y="27" font-size="11" class="mono" fill="${C.dim}" letter-spacing="1.5">${esc(label.toUpperCase())}</text>
  <text x="64" y="47" font-size="15" font-weight="600" fill="${C.text}">${esc(value)}</text>
  <path d="M${w - 34} 26 l6 6 -6 6" fill="none" stroke="${C.sub}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  `;
  return svg({ w, h: H, title: `${label}: ${value}`, defs, css, body });
}

// Iconos de trazo (24x24) dibujados a mano.
export const ICONS = {
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ticket: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
  scan: '<path d="M13 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21H11"/><path d="M13 3l5 5h-5z"/><path d="M8 9h3M8 12.5h5"/><circle cx="16" cy="16" r="3"/><path d="M18.2 18.2L21 21"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 5.7-5.7a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  bot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4"/><circle cx="12" cy="3.5" r="1"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/><path d="M9.5 16.5h5M2 12v3M22 12v3"/>',
  bed: '<path d="M3 19V6M3 14h18v5M21 14a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="11.5" r="1.8"/>',
  db: '<ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  flow: '<rect x="3" y="4" width="6" height="5" rx="1.5"/><rect x="15" y="4" width="6" height="5" rx="1.5"/><rect x="9" y="15" width="6" height="5" rx="1.5"/><path d="M6 9v3h12V9M12 12v3"/>',
  rocket: '<path d="M12 15l-3-3c1.5-4.5 4.5-8 9.5-8.5C18 8.5 14.5 11.5 12 15z"/><path d="M9 12l-3.5.5L4 15l4 .5M12 15l-.5 3.5L9 20l-.5-4"/><circle cx="14.5" cy="9" r="1.3"/>',
};

export function navPill({ label, color = C.blue }) {
  const w = Math.round(label.length * 7.2 + 40);
  const H = 34;
  const css = `
    .dot { animation: d 2.2s ease-in-out infinite; }
    @keyframes d { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
  `;
  const body = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${H - 1}" rx="${H / 2}" fill="${C.panel}" stroke="${color}" stroke-opacity="0.45"/>
  <circle cx="17" cy="${H / 2}" r="3.5" fill="${color}" class="dot"/>
  <text x="28" y="${H / 2 + 4.5}" font-size="12.5" font-weight="600" fill="${C.text}">${esc(label)}</text>
  `;
  return { w, svg: svg({ w, h: H, title: label, css, body }) };
}

export { r2 };
