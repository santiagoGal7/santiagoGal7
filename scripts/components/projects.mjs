// Tarjetas de proyectos: una destacada con "requests en vivo" y cuatro compactas.
import { C, svg, esc, r2, panel, chipRow, wrap, textLines } from '../lib/svg.mjs';
import { featured, projects, LANG_COLORS, profile } from '../data.mjs';
import { ICONS } from './ui.mjs';

const METHOD = { GET: C.green, POST: C.blue, PATCH: C.amber, PUT: C.violet, DELETE: C.red };

function langBar({ x, y, w, langs, note }) {
  let cx = x;
  let bar = '';
  let legend = '';
  let lx = x;
  langs.forEach(([name, pct], i) => {
    const seg = (w * pct) / 100;
    const col = LANG_COLORS[name] || C.dim;
    bar += `<rect x="${r2(cx)}" y="${y}" width="${r2(Math.max(seg - (i < langs.length - 1 ? 2 : 0), 2))}" height="6" fill="${col}"/>`;
    cx += seg;
    const label = note && name === 'JSON' ? note : `${name} ${pct}%`;
    legend += `<circle cx="${r2(lx + 4)}" cy="${y + 22}" r="4" fill="${col}"/><text x="${r2(lx + 13)}" y="${y + 26}" font-size="10.5" class="mono" fill="${C.sub}">${esc(label)}</text>`;
    lx += label.length * 6.3 + 30;
  });
  return `
  <clipPath id="lb-${x}-${y}"><rect x="${x}" y="${y}" width="${w}" height="6" rx="3"/></clipPath>
  <g clip-path="url(#lb-${x}-${y})"><rect x="${x}" y="${y}" width="${w}" height="6" fill="${C.line}"/>${bar}
    <rect x="${x}" y="${y}" width="60" height="6" fill="url(#lb-shine)" class="lbshine"/></g>
  ${legend}`;
}

const SHARED_DEFS = `
  <linearGradient id="lb-shine" x1="0" x2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset="0.5" stop-color="#fff" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>`;

const sharedCss = (w) => `
  .lbshine { animation: lbs 3.6s ease-in-out infinite; }
  @keyframes lbs { 0% { transform: translateX(-80px); } 70%,100% { transform: translateX(${w}px); } }
  .float { animation: float 5s ease-in-out infinite; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
`;

function iconBox({ x, y, s, color, icon }) {
  return `
  <g class="float">
    <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.28}" fill="${color}" fill-opacity="0.14" stroke="${color}" stroke-opacity="0.55"/>
    <g transform="translate(${x + (s - 24 * (s / 46)) / 2} ${y + (s - 24 * (s / 46)) / 2}) scale(${r2(s / 46)})" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
  </g>`;
}

// Borde degradado que gira alrededor de la tarjeta.
function spinBorder({ id, w, h, color, rx = 18, dur = 8 }) {
  return {
    defs: `
  <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="${h}">
    <stop offset="0" stop-color="${color}" stop-opacity="0.9"/>
    <stop offset="0.35" stop-color="${C.line}" stop-opacity="0.6"/>
    <stop offset="0.65" stop-color="${C.line}" stop-opacity="0.6"/>
    <stop offset="1" stop-color="${C.violet}" stop-opacity="0.8"/>
    <animateTransform attributeName="gradientTransform" type="rotate" from="0 ${w / 2} ${h / 2}" to="360 ${w / 2} ${h / 2}" dur="${dur}s" repeatCount="indefinite"/>
  </linearGradient>`,
    svg: `<rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" rx="${rx}" fill="none" stroke="url(#${id})" stroke-width="1.5"/>`,
  };
}

export function featuredCard() {
  const W = 900;
  const H = 300;
  const f = featured;
  const border = spinBorder({ id: 'fb', w: W, h: H, color: C.blue, dur: 10 });

  const px = 532;
  const py = 22;
  const pw = W - px - 22;
  const rowH = 30;
  const step = 0.7;
  const cycle = r2(step * f.endpoints.length);

  let rows = '';
  f.endpoints.forEach(([m, path], i) => {
    const y = py + 44 + i * rowH;
    const col = METHOD[m];
    const status = m === 'POST' && !path.includes('login') && !path.includes('refresh') && !path.includes('reports') ? '201' : '200';
    rows += `
    <g>
      <rect x="${px + 8}" y="${y}" width="${pw - 16}" height="${rowH - 4}" rx="7" fill="${col}" class="rowhl" style="animation-delay:${r2(i * step)}s"/>
      <rect x="${px + 14}" y="${y + 5}" width="48" height="16" rx="4" fill="${col}" fill-opacity="0.16"/>
      <text x="${px + 38}" y="${y + 17}" text-anchor="middle" font-size="9.5" font-weight="700" class="mono" fill="${col}">${m}</text>
      <text x="${px + 70}" y="${y + 17}" font-size="10" class="mono" fill="${C.text}">${esc(path)}</text>
      <text x="${px + pw - 14}" y="${y + 17}" text-anchor="end" font-size="10" class="mono" fill="${C.green}" >${status}</text>
    </g>`;
  });

  const css = `
    ${sharedCss(440)}
    .rowhl { opacity: 0; animation: rowhl ${cycle}s linear infinite; }
    @keyframes rowhl { 0% { opacity: .16; } ${r2(100 / f.endpoints.length)}% { opacity: 0; } 100% { opacity: 0; } }
    .live { animation: live 1.6s ease-in-out infinite; }
    @keyframes live { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
  `;

  const lines = wrap(f.text, 64);
  const body = `
  ${panel({ x: 0, y: 0, w: W, h: H, rx: 20, stroke: 'none' })}
  ${border.svg}
  ${iconBox({ x: 26, y: 26, s: 54, color: C.blue, icon: ICONS.ticket })}
  <g>
    <rect x="96" y="28" width="104" height="22" rx="11" fill="${C.amber}" fill-opacity="0.12" stroke="${C.amber}" stroke-opacity="0.5"/>
    <text x="148" y="43" text-anchor="middle" font-size="10.5" class="mono" fill="${C.amber}" letter-spacing="1">★ DESTACADO</text>
  </g>
  <text x="96" y="76" font-size="26" font-weight="800" fill="${C.text}">${esc(f.title)}</text>
  <text x="28" y="112" font-size="11" class="mono" fill="${C.dim}">${esc(profile.user)}/<tspan fill="${C.sub}">${esc(f.repo)}</tspan></text>
  ${textLines({ x: 28, y: 140, lines, size: 13.5, lh: 1.55 })}
  ${chipRow({ x: 28, y: 196, labels: f.tags.slice(0, 4), color: C.blue, size: 10.5, gap: 6 })}
  ${chipRow({ x: 28, y: 224, labels: f.tags.slice(4), color: C.violet, size: 10.5, gap: 6 })}
  ${langBar({ x: 28, y: 262, w: 470, langs: [['C#', 100]] })}

  <rect x="${px}" y="${py}" width="${pw}" height="${H - 2 * py}" rx="14" fill="${C.bg0}" stroke="${C.line}"/>
  <circle cx="${px + 18}" cy="${py + 20}" r="4" fill="${C.green}" class="live"/>
  <text x="${px + 30}" y="${py + 24}" font-size="11" class="mono" fill="${C.sub}">requests en vivo</text>
  <text x="${px + pw - 14}" y="${py + 24}" text-anchor="end" font-size="10.5" class="mono" fill="${C.dim}">localhost:5000</text>
  <path d="M${px} ${py + 36} H${px + pw}" stroke="${C.line}"/>
  ${rows}
  `;

  return svg({
    w: W,
    h: H,
    title: `${f.title} — proyecto destacado`,
    desc: `${f.text} Tecnologías: ${f.tags.join(', ')}.`,
    defs: SHARED_DEFS + border.defs,
    css,
    body,
  });
}

export function projectCard(p, i) {
  const W = 440;
  const H = 256;
  const border = spinBorder({ id: `pb${i}`, w: W, h: H, color: p.color, dur: 9 + i });
  const lines = wrap(p.text, 52);
  const labels = p.demo ? [{ label: '● demo en vivo', color: C.green }, ...p.tags.map((t) => ({ label: t }))] : p.tags;
  const body = `
  ${panel({ x: 0, y: 0, w: W, h: H, rx: 18, stroke: 'none' })}
  ${border.svg}
  ${iconBox({ x: 22, y: 22, s: 46, color: p.color, icon: ICONS[p.icon] })}
  <text x="82" y="42" font-size="18" font-weight="700" fill="${C.text}">${esc(p.title)}</text>
  <text x="82" y="62" font-size="10.5" class="mono" fill="${C.dim}">${esc(p.repo.length > 40 ? p.repo.slice(0, 38) + '…' : p.repo)}</text>
  <path d="M${W - 36} 30 l8 -8 M${W - 36} 22 h8 v8" fill="none" stroke="${C.sub}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  ${textLines({ x: 22, y: 102, lines, size: 13, lh: 1.5 })}
  ${chipRow({ x: 22, y: 166, labels, color: p.color, size: 10.5, gap: 6, maxW: W - 44 })}
  ${langBar({ x: 22, y: 210, w: W - 44, langs: p.langs, note: p.langNote })}
  `;
  return svg({
    w: W,
    h: H,
    title: p.title,
    desc: `${p.text} Tecnologías: ${p.tags.join(', ')}.`,
    defs: SHARED_DEFS + border.defs,
    css: sharedCss(W),
    body,
  });
}

export function projectCards() {
  return projects.map((p, i) => ({ slug: p.slug, svg: projectCard(p, i) }));
}
