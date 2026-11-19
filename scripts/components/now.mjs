// "Ahora mismo": una tabla de frentes de trabajo como las de un plano,
// con columnas de estado, frente, descripción y stack separadas por reglas finas.
import { C, svg, esc, r2, wrap, textLines } from '../lib/svg.mjs';
import { now as items } from '../data.mjs';

const sentence = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const COLS = [
  [0, 'Estado'],
  [150, 'Frente'],
  [330, 'Qué hago'],
  [722, 'Stack'],
];

export function nowCards() {
  const W = 900;
  const headH = 38;
  const rowH = 66;
  const H = headH + items.length * rowH;

  let body = `
  <path d="M0 0.5 H${W}" stroke="${C.rule2}" pathLength="1" class="draw"/>
  <g class="in">
    ${COLS.map(([x, t]) => `<text x="${x}" y="24" font-size="12" fill="${C.muted}">${t}</text>`).join('')}
  </g>
  <path d="M0 ${headH - 0.5} H${W}" stroke="${C.rule}"/>`;

  items.forEach((it, i) => {
    const top = headH + i * rowH;
    const main = i === 0;
    const last = i === items.length - 1;
    body += `
  <g class="in" style="animation-delay:${r2(0.1 + i * 0.08)}s">
    <text x="0" y="${top + 28}" font-size="13" font-weight="${main ? 600 : 400}" fill="${main ? C.ink : C.muted}">${esc(sentence(it.status))}</text>
    <text x="150" y="${top + 29}" font-size="17" font-weight="600" letter-spacing="-0.2" fill="${C.ink}">${esc(it.title)}</text>
    ${textLines({ x: 330, y: top + 28, lines: wrap(it.text, 52), size: 14, lh: 1.45, fill: C.muted })}
    <text x="722" y="${top + 28}" font-size="13" fill="${C.muted}">${it.tags.map(esc).join(', ')}</text>
  </g>
  <path d="M0 ${top + rowH - 0.5} H${W}" stroke="${last ? C.rule2 : C.rule}"/>`;
  });

  return svg({
    w: W,
    h: H,
    title: 'Ahora mismo',
    desc: items.map((i) => `${i.title}: ${i.text}`).join(' '),
    body,
  });
}
