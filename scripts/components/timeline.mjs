// Trayectoria: un eje con hitos cuadrados, fechas en mono y una cota con la duración total.
// Se dibuja una vez; el hito actual es el único en color de acento.
import { C, svg, esc, r2, wrap, cota } from '../lib/svg.mjs';
import { timeline } from '../data.mjs';

const months = (d) => {
  const [y, m] = d.split('-').map(Number);
  return y * 12 + m;
};

export function timelineSvg() {
  const W = 900;
  const H = 186;
  const x0 = 6;
  const n = timeline.length;
  const step = Math.floor((W - x0 - 118) / (n - 1)); // la última columna de texto cabe entera
  const xl = x0 + (n - 1) * step;
  const ay = 56; // eje

  let nodes = '';
  timeline.forEach((e, i) => {
    const x = x0 + i * step;
    const now = !!e.now;
    const title = wrap(e.title, 14);
    const sub = wrap(e.sub, 17);
    const sy = 84 + title.length * 17 + 4;
    nodes += `
  <g class="in" style="animation-delay:${r2(0.15 + i * 0.06)}s">
    <text x="${x - 3}" y="40" font-size="11" class="mono" fill="${now ? C.accent : C.muted}">${esc(e.date)}</text>
    <rect x="${x - (now ? 4 : 3)}" y="${ay - (now ? 4 : 3)}" width="${now ? 8 : 6}" height="${now ? 8 : 6}" fill="${now ? C.accent : C.ink}"/>
    <path d="M${x + 0.5} ${ay + 7} V${ay + 13}" stroke="${C.rule2}"/>
    ${title.map((l, k) => `<text x="${x - 3}" y="${84 + k * 17}" font-size="13.5" font-weight="600" fill="${C.ink}">${esc(l)}</text>`).join('')}
    ${sub.map((l, k) => `<text x="${x - 3}" y="${sy + k * 16}" font-size="12" fill="${C.muted}">${esc(l)}</text>`).join('')}
  </g>`;
  });

  const span = months(timeline[n - 1].date) - months(timeline[0].date);
  const cy = H - 14;

  const body = `
  <path d="M0 ${ay + 0.5} H${xl}" stroke="${C.rule2}" pathLength="1" class="draw"/>
  <path d="M${xl + 8} ${ay + 0.5} H${W}" stroke="${C.rule2}" stroke-dasharray="2 4"/>
  ${nodes}
  ${cota({ x1: x0, x2: xl, y: cy, draw: true, delay: 0.5 })}
  <text x="${r2((x0 + xl) / 2)}" y="${cy - 7}" text-anchor="middle" font-size="11" class="mono" fill="${C.muted}">${span} meses</text>
  `;

  return svg({
    w: W,
    h: H,
    title: 'Trayectoria',
    desc: timeline.map((e) => `${e.date}: ${e.title} (${e.sub})`).join('. '),
    body,
  });
}
