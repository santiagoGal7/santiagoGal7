// Stack como tabla periódica: 32 "elementos" en 6 familias.
// La familia va como código de dos letras en cada celda; las de uso diario llevan borde de tinta.
import { C, svg, esc, r2 } from '../lib/svg.mjs';
import { elements, families } from '../data.mjs';

const CODES = { backend: 'BE', quality: 'QA', data: 'DB', frontend: 'FE', ai: 'IA', devops: 'OP' };

export function stack() {
  const W = 900;
  const cols = 10;
  const tw = 84;
  const th = 84;
  const gap = 6;
  const x0 = 0;
  const y0 = 1;
  const H = y0 + 4 * th + 3 * gap + 34;

  // Posiciones: fila 1 solo columnas 0 y 9; el resto, filas completas.
  const slots = [[0, 0], [0, 9]];
  for (let r = 1; r < 4; r++) for (let c = 0; c < cols; c++) slots.push([r, c]);

  const css = `
    .pop { animation: pop .28s ease-out backwards; transform-box: fill-box; transform-origin: center; }
    @keyframes pop { from { opacity: 0; transform: scale(.94); } }
  `;

  let body = '';
  elements.forEach((el, i) => {
    const [r, c] = slots[i];
    const x = r2(x0 + c * (tw + gap));
    const y = r2(y0 + r * (th + gap));
    const core = !!el.core;
    const name = el.name;
    const fs = name.length > 12 ? 9 : 10;
    const fit = name.length * fs * 0.52 > tw - 16 ? ` textLength="${tw - 16}" lengthAdjust="spacingAndGlyphs"` : '';
    body += `
  <g class="pop" style="animation-delay:${r2(0.02 * i)}s">
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${tw - 1}" height="${th - 1}" rx="2" fill="none" stroke="${core ? C.ink : C.rule2}"/>
    <text x="${x + 8}" y="${y + 17}" font-size="10.5" class="mono" fill="${C.faint}">${i + 1}</text>
    <text x="${x + tw - 8}" y="${y + 17}" text-anchor="end" font-size="10.5" class="mono" fill="${C.faint}">${CODES[el.fam]}</text>
    <text x="${x + 8}" y="${y + 52}" font-size="26" font-weight="600" letter-spacing="-0.5" fill="${C.ink}">${esc(el.sym)}</text>
    <text x="${x + 8}" y="${y + 71}" font-size="${fs}" fill="${C.muted}"${fit}>${esc(name)}</text>
  </g>`;
  });

  // Cabecera en el hueco de la primera fila: título y leyenda de familias en texto plano.
  const hx = x0 + tw + gap + 14;
  const hw = 8 * tw + 7 * gap - 28;
  const fams = Object.entries(families);
  const colW = hw / 3;
  const legend = fams
    .map(([k, f], i) => {
      const lx = r2(hx + (i % 3) * colW);
      const ly = y0 + 56 + Math.floor(i / 3) * 18;
      return `<text x="${lx}" y="${ly}" font-size="11.5"><tspan class="mono" fill="${C.faint}">${CODES[k]}</tspan><tspan dx="8" fill="${C.muted}">${esc(f.label)}</tspan></text>`;
    })
    .join('\n    ');
  body += `
  <g class="in">
    <text x="${hx}" y="${y0 + 26}" font-size="19" font-weight="600" letter-spacing="-0.3" fill="${C.ink}">Tabla periódica de mi stack</text>
    <text x="${hx + hw}" y="${y0 + 26}" text-anchor="end" font-size="12" fill="${C.muted}">${elements.length} elementos en ${fams.length} familias</text>
    <path d="M${hx} ${y0 + 37.5} H${hx + hw}" stroke="${C.rule}"/>
    ${legend}
  </g>
  <g class="in" style="animation-delay:.7s">
    <rect x="${x0 + 0.5}" y="${H - 20.5}" width="15" height="15" rx="2" fill="none" stroke="${C.ink}"/>
    <text x="${x0 + 24}" y="${H - 8}" font-size="11.5" fill="${C.muted}">uso diario</text>
    <text x="${W}" y="${H - 8}" text-anchor="end" font-size="11.5" fill="${C.muted}">número, familia, símbolo y nombre</text>
  </g>
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
