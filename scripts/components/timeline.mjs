// Línea de tiempo con un cometa que la recorre y enciende cada hito.
import { C, svg, esc, r2 } from '../lib/svg.mjs';
import { timeline } from '../data.mjs';

export function timelineSvg() {
  const W = 900;
  const H = 240;
  const x0 = 80;
  const x1 = 820;
  const ly = 125;
  const n = timeline.length;
  const step = (x1 - x0) / (n - 1);
  const travel = 6; // segundos que tarda el cometa
  const cycle = 9;
  const L = x1 - x0;
  const palette = [C.blue, C.cyan, C.violet, C.amber, C.green, C.pink, C.blue, C.green];

  const css = `
    .draw { stroke-dasharray: ${L}; animation: draw ${cycle}s cubic-bezier(.45,0,.55,1) infinite; }
    @keyframes draw { 0% { stroke-dashoffset: ${L}; } ${r2((travel / cycle) * 100)}% { stroke-dashoffset: 0; } 92% { stroke-dashoffset: 0; opacity: 1; } 100% { stroke-dashoffset: 0; opacity: 0; } }
    .lit { animation: lit ${cycle}s ease-out infinite; opacity: 0; transform-box: fill-box; transform-origin: center; }
    @keyframes lit { 0% { opacity: 0; transform: scale(.6); } 3% { opacity: 1; transform: scale(1.5); } 12% { opacity: .9; transform: scale(1); } 92% { opacity: .9; } 100% { opacity: 0; } }
    .ring { animation: ring 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes ring { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(3.2); opacity: 0; } }
  `;

  const defs = `
    <linearGradient id="tl" gradientUnits="userSpaceOnUse" x1="${x0}" y1="0" x2="${x1}" y2="0">
      <stop offset="0" stop-color="${C.blue}"/>
      <stop offset="0.5" stop-color="${C.violet}"/>
      <stop offset="1" stop-color="${C.green}"/>
    </linearGradient>
    <path id="tlp" d="M${x0} ${ly} H${x1}"/>
  `;

  let nodes = '';
  timeline.forEach((e, i) => {
    const x = r2(x0 + i * step);
    const col = e.now ? C.green : palette[i % palette.length];
    const up = i % 2 === 0;
    const delay = r2((i / (n - 1)) * travel * 0.96);
    const [dY, tY, sY, c1, c2] = up ? [50, 72, 90, 98, 116] : [170, 192, 210, 134, 152];
    nodes += `
  <g>
    <path d="M${x} ${c1} V${c2}" stroke="${col}" stroke-opacity="0.45" stroke-dasharray="2 3"/>
    <text x="${x}" y="${dY}" text-anchor="middle" font-size="10.5" class="mono" fill="${col}" letter-spacing="1">${esc(e.date)}</text>
    <text x="${x}" y="${tY}" text-anchor="middle" font-size="13" font-weight="700" fill="${C.text}">${esc(e.title)}</text>
    <text x="${x}" y="${sY}" text-anchor="middle" font-size="10.5" class="mono" fill="${C.sub}">${esc(e.sub)}</text>
    <circle cx="${x}" cy="${ly}" r="8" fill="${C.bg0}" stroke="${col}" stroke-opacity="0.6" stroke-width="1.5"/>
    <circle cx="${x}" cy="${ly}" r="8" fill="${col}" fill-opacity="0.25" stroke="${col}" stroke-width="2" class="lit" style="animation-delay:${delay}s"/>
    <circle cx="${x}" cy="${ly}" r="3" fill="${col}"/>
    ${e.now ? `<circle cx="${x}" cy="${ly}" r="6" fill="none" stroke="${col}" stroke-width="1.5" class="ring"/>` : ''}
  </g>`;
  });

  const body = `
  <path d="M${x0 - 40} ${ly} H${x1 + 40}" stroke="${C.line}" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round"/>
  <path d="M${x0} ${ly} H${x1}" stroke="${C.line}" stroke-width="2"/>
  <path d="M${x0} ${ly} H${x1}" stroke="url(#tl)" stroke-width="3" stroke-linecap="round" class="draw"/>
  ${nodes}
  <g>
    <circle r="10" fill="${C.cyan}" opacity="0.35" filter="url(#f-soft)"/>
    <circle r="4" fill="#fff" filter="url(#f-glow)"/>
    <animateMotion dur="${cycle}s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;${r2(travel / cycle)};1" calcMode="spline" keySplines="0.45 0 0.55 1;0 0 1 1">
      <mpath xlink:href="#tlp"/>
    </animateMotion>
  </g>
  `;

  return svg({
    w: W,
    h: H,
    title: 'Trayectoria',
    desc: timeline.map((e) => `${e.date}: ${e.title} (${e.sub})`).join('. '),
    defs,
    css,
    body,
  });
}
