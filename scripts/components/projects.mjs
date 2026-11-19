// Tarjetas de proyectos: una destacada con un log de requests y cuatro compactas.
// Marco fino, índice P-0x, stack en texto plano y lenguajes como cota en tonos de tinta.
import { C, svg, esc, r2, wrap, textLines } from '../lib/svg.mjs';
import { featured, projects, profile } from '../data.mjs';

const tones = () => [C.muted, C.faint, C.rule2, C.rule];

// Lenguajes como una cota: línea de 2px por segmento entre dos remates, leyenda debajo.
function langBar({ x, y, w, langs, note }) {
  const T = tones();
  let cx = x;
  let bar = `<path d="M${x + 0.5} ${y - 3} V${y + 5} M${x + w - 0.5} ${y - 3} V${y + 5}" stroke="${C.rule2}"/>`;
  let legend = '';
  let lx = x;
  langs.forEach(([name, pct], i) => {
    const seg = (w * pct) / 100;
    const col = T[i % T.length];
    const gapR = i < langs.length - 1 ? 3 : 0;
    bar += `<rect x="${r2(cx)}" y="${y}" width="${r2(Math.max(seg - gapR, 2))}" height="2" fill="${col}"/>`;
    cx += seg;
    const custom = note && name === 'JSON';
    const label = custom ? note : `${name} ${pct}%`;
    const text = custom ? esc(note) : `${esc(name)} <tspan class="mono">${pct}%</tspan>`;
    legend += `<rect x="${r2(lx)}" y="${y + 17}" width="10" height="2" fill="${col}"/><text x="${r2(lx + 16)}" y="${y + 22}" font-size="11.5" fill="${C.muted}">${text}</text>`;
    lx += label.length * 6.4 + 34;
  });
  return `
  <g class="in" style="animation-delay:.3s">${bar}
  ${legend}</g>`;
}

// Parte una lista en líneas sin dejar el separador colgando al inicio de la siguiente.
function listLines(items, max, sep = ', ') {
  const lines = [];
  let cur = '';
  for (const t of items) {
    const next = cur ? cur + sep + t : t;
    if (next.length > max && cur) {
      lines.push(cur + sep.trimEnd());
      cur = t;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

const arrow = (x, y) =>
  `<path d="M${x} ${y + 9} L${x + 9} ${y} M${x + 1} ${y} H${x + 9} V${y + 8}" fill="none" stroke="${C.muted}" stroke-width="1" stroke-linecap="square"/>`;

export function featuredCard() {
  const W = 900;
  const H = 300;
  const f = featured;

  const px = 520;
  const py = 20;
  const pw = W - px - 20;
  const rowH = 30;
  const step = 0.7;
  const cycle = r2(step * f.endpoints.length);

  let rows = '';
  f.endpoints.forEach(([m, path], i) => {
    const y = py + 44 + i * rowH;
    const status = m === 'POST' && !path.includes('login') && !path.includes('refresh') && !path.includes('reports') ? '201' : '200';
    rows += `
    <g>
      <text x="${px + 16}" y="${y + 17}" font-size="11" font-weight="600" class="mono" fill="${C.muted}">${m}</text>
      <text x="${px + 66}" y="${y + 17}" font-size="11" class="mono" fill="${C.ink}">${esc(path)}</text>
      <text x="${px + pw - 14}" y="${y + 17}" text-anchor="end" font-size="11" class="mono" fill="${C.muted}">${status}</text>
      <g class="rowhl" style="animation-delay:${r2(i * step)}s">
        <rect x="${px + 1}" y="${y}" width="${pw - 2}" height="${rowH - 4}" fill="${C.ink}" fill-opacity="0.06"/>
        <rect x="${px + 1}" y="${y}" width="2" height="${rowH - 4}" fill="${C.accent}"/>
        <text x="${px + pw - 14}" y="${y + 17}" text-anchor="end" font-size="11" class="mono" fill="${C.ok}">${status}</text>
      </g>
    </g>`;
  });

  const css = `
    .rowhl { opacity: 0; animation: rowhl ${cycle}s steps(1, end) infinite; }
    @keyframes rowhl { 0% { opacity: 1; } ${r2(100 / f.endpoints.length)}% { opacity: 0; } 100% { opacity: 0; } }
    .live { animation: live 1.6s ease-in-out infinite; }
    @keyframes live { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
  `;

  const lines = wrap(f.text, 60);
  const stackLines = listLines(f.tags, 60);
  const body = `
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="2" fill="none" stroke="${C.rule2}"/>
  <g class="in">
    <text x="26" y="40" font-size="11" class="mono" fill="${C.faint}">P-01</text>
    <text x="64" y="40" font-size="12" fill="${C.muted}">Proyecto destacado</text>
    <text x="24" y="84" font-size="28" font-weight="700" letter-spacing="-0.6" fill="${C.ink}">${esc(f.title)}</text>
    <text x="26" y="108" font-size="11" class="mono" fill="${C.faint}">${esc(profile.user)}/<tspan fill="${C.muted}">${esc(f.repo)}</tspan></text>
  </g>
  <g class="in" style="animation-delay:.12s">
    ${textLines({ x: 26, y: 140, lines, size: 13.5, lh: 1.55 })}
    <path d="M26 ${196.5} H${px - 34}" stroke="${C.rule}"/>
    ${textLines({ x: 26, y: 218, lines: stackLines, size: 12.5, lh: 1.55, fill: C.ink })}
  </g>
  ${langBar({ x: 26, y: 254, w: px - 60, langs: [['C#', 100]] })}

  <rect x="${px + 0.5}" y="${py + 0.5}" width="${pw - 1}" height="${H - 2 * py - 1}" rx="2" fill="${C.ink}" fill-opacity=".025" stroke="${C.rule2}"/>
  <circle cx="${px + 18}" cy="${py + 19}" r="3" fill="${C.ok}" class="live"/>
  <text x="${px + 30}" y="${py + 23}" font-size="11" class="mono" fill="${C.ink}">requests</text>
  <text x="${px + pw - 14}" y="${py + 23}" text-anchor="end" font-size="11" class="mono" fill="${C.muted}">localhost:5000</text>
  <path d="M${px + 1} ${py + 36.5} H${px + pw - 1}" stroke="${C.rule}"/>
  ${rows}
  `;

  return svg({
    w: W,
    h: H,
    title: `${f.title} — proyecto destacado`,
    desc: `${f.text} Tecnologías: ${f.tags.join(', ')}.`,
    css,
    body,
  });
}

// Las tarjetas van de dos en dos: cada SVG lleva medio canal de aire a su lado
// para que el par llegue justo a los bordes sin espacios entre imágenes.
const H_CARD = 256;

export function projectCard(p, i) {
  const W = 446;
  const CW = 440;
  const off = i % 2 ? W - CW : 0;
  const lines = wrap(p.text, 54);
  const body = `
  <g transform="translate(${off} 0)">
  <rect x="0.5" y="0.5" width="${CW - 1}" height="${H_CARD - 1}" rx="2" fill="none" stroke="${C.rule2}"/>
  <g class="in" style="animation-delay:${r2(i * 0.06)}s">
    <text x="22" y="34" font-size="11" class="mono" fill="${C.faint}">P-0${i + 2}</text>
    ${p.demo ? `<text x="64" y="34" font-size="12" fill="${C.muted}">demo en vivo</text>` : ''}
    ${arrow(CW - 34, 24)}
    <text x="22" y="66" font-size="18" font-weight="600" letter-spacing="-0.3" fill="${C.ink}">${esc(p.title)}</text>
    <text x="22" y="86" font-size="11" class="mono" fill="${C.faint}">${esc(p.repo.length > 44 ? p.repo.slice(0, 42) + '…' : p.repo)}</text>
    ${textLines({ x: 22, y: 116, lines, size: 13, lh: 1.5 })}
    <text x="22" y="190" font-size="12.5" fill="${C.ink}">${esc(p.tags.join(', '))}</text>
  </g>
  ${langBar({ x: 22, y: 214, w: CW - 44, langs: p.langs, note: p.langNote })}
  </g>
  `;
  return svg({
    w: W,
    h: H_CARD,
    title: p.title,
    desc: `${p.text} Tecnologías: ${p.tags.join(', ')}.`,
    body,
  });
}

export function projectCards() {
  return projects.map((p, i) => ({ slug: p.slug, svg: projectCard(p, i) }));
}
