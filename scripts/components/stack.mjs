// Stack como tabla periódica: 32 "elementos" en 6 familias,
// con una onda de luz que recorre la tabla en diagonal.
import { C, svg, esc, r2, chipRow } from '../lib/svg.mjs';
import { elements, families } from '../data.mjs';

export function stack() {
  const W = 900;
  const cols = 10;
  const tw = 80;
  const th = 86;
  const gap = 6;
  const x0 = (W - (cols * tw + (cols - 1) * gap)) / 2;
  const y0 = 8;
  const H = y0 + 4 * th + 3 * gap + 40;

  // Posiciones: fila 1 solo columnas 0 y 9; el resto, filas completas.
  const slots = [[0, 0], [0, 9]];
  for (let r = 1; r < 4; r++) for (let c = 0; c < cols; c++) slots.push([r, c]);

  const css = `
    .wave { animation: wave 5.5s ease-in-out infinite; opacity: 0; }
    @keyframes wave { 0%, 100% { opacity: 0; } 12% { opacity: 1; } 30% { opacity: 0; } }
    .core { animation: core 3.2s ease-in-out infinite; }
    @keyframes core { 0%,100% { opacity: .35; } 50% { opacity: .9; } }
    .in { animation: pop .6s cubic-bezier(.2,.9,.3,1.3) both; transform-box: fill-box; transform-origin: center; }
    @keyframes pop { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }
  `;

  let body = '';
  elements.forEach((el, i) => {
    const [r, c] = slots[i];
    const x = r2(x0 + c * (tw + gap));
    const y = r2(y0 + r * (th + gap));
    const col = families[el.fam].color;
    const delay = r2(c * 0.13 + r * 0.2);
    const name = el.name;
    const fit = name.length > 12 ? ` textLength="${tw - 12}" lengthAdjust="spacingAndGlyphs"` : '';
    body += `
  <g class="in" style="animation-delay:${r2(0.03 * i)}s">
    ${el.core ? `<rect x="${x - 2}" y="${y - 2}" width="${tw + 4}" height="${th + 4}" rx="13" fill="${col}" opacity="0.35" filter="url(#f-soft)" class="core" style="animation-delay:${delay}s"/>` : ''}
    <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="11" fill="${C.panel}"/>
    <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="11" fill="${col}" fill-opacity="${el.core ? 0.14 : 0.07}" stroke="${col}" stroke-opacity="${el.core ? 0.85 : 0.35}"/>
    <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="11" fill="${col}" fill-opacity="0.12" stroke="${col}" stroke-width="1.5" class="wave" style="animation-delay:${delay}s"/>
    <text x="${x + 8}" y="${y + 15}" font-size="9.5" class="mono" fill="${C.dim}">${i + 1}</text>
    ${el.core ? `<text x="${x + tw - 8}" y="${y + 15}" text-anchor="end" font-size="9" fill="${col}">★</text>` : ''}
    <text x="${r2(x + tw / 2)}" y="${y + 52}" text-anchor="middle" font-size="27" font-weight="700" fill="${col}">${esc(el.sym)}</text>
    <text x="${r2(x + tw / 2)}" y="${y + 73}" text-anchor="middle" font-size="9.5" fill="${C.sub}"${fit}>${esc(name)}</text>
  </g>`;
  });

  // Cabecera en el hueco de la primera fila
  const hx = r2(x0 + tw + gap);
  const hw = 8 * tw + 7 * gap;
  const legend = Object.values(families).map((f) => ({ label: f.label, color: f.color }));
  body += `
  <g class="in">
    <rect x="${hx}" y="${y0}" width="${hw}" height="${th}" rx="11" fill="${C.panel}" stroke="url(#g-stroke)"/>
    <text x="${hx + 18}" y="${y0 + 32}" font-size="19" font-weight="700" fill="${C.text}">Tabla periódica de mi stack</text>
    <text x="${hx + hw - 18}" y="${y0 + 31}" text-anchor="end" font-size="11" class="mono" fill="${C.dim}">${elements.length} elementos · ${legend.length} familias</text>
    ${chipRow({ x: hx + 18, y: y0 + 48, labels: legend, size: 10, h: 22, padX: 9, gap: 6 })}
  </g>
  <text x="${x0}" y="${H - 12}" font-size="11" class="mono" fill="${C.dim}"><tspan fill="${C.amber}">★</tspan> uso diario · el brillo marca el núcleo del stack</text>
  <text x="${W - x0}" y="${H - 12}" text-anchor="end" font-size="11" class="mono" fill="${C.dim}">estado: en constante reacción</text>
  `;

  return svg({
    w: W,
    h: H,
    title: 'Stack tecnológico como tabla periódica',
    desc: Object.entries(families)
      .map(([k, f]) => `${f.label}: ${elements.filter((e) => e.fam === k).map((e) => e.name).join(', ')}.`)
      .join(' '),
    css,
    body,
  });
}
