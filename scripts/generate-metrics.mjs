// Métricas en vivo generadas desde la API GraphQL de GitHub.
// Las ejecuta un workflow a diario y publica los SVG en la rama `metrics`.
// Uso local: GITHUB_TOKEN=$(gh auth token) node scripts/generate-metrics.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { C, svg, esc, r2, setTheme, FONT, MONO_RATIO, EASE } from './lib/svg.mjs';

const TOKEN = process.env.GITHUB_TOKEN;
const LOGIN = process.env.GH_LOGIN || 'santiagoGal7';
const OUT = process.env.OUT_DIR || 'dist/metrics';

if (!TOKEN) {
  console.error('Falta GITHUB_TOKEN');
  process.exit(1);
}

const QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    pullRequests { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      totalCount
      nodes {
        name
        stargazerCount
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount weekday } }
      }
    }
  }
}`;

async function gql(query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'profile-metrics',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
  return json.data;
}

// ---------- datos ----------

const to = new Date();
const from = new Date(to);
from.setUTCFullYear(from.getUTCFullYear() - 1);

const { user } = await gql(QUERY, { login: LOGIN, from: from.toISOString(), to: to.toISOString() });
const cc = user.contributionsCollection;
const weeks = cc.contributionCalendar.weeks;
const days = weeks.flatMap((w) => w.contributionDays);

let current = 0;
{
  let i = days.length - 1;
  if (i >= 0 && days[i].contributionCount === 0) i--; // hoy todavía cuenta
  while (i >= 0 && days[i].contributionCount > 0) {
    current++;
    i--;
  }
}
let longest = 0;
{
  let run = 0;
  for (const d of days) {
    run = d.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
}
const activeDays = days.filter((d) => d.contributionCount > 0).length;
const total = cc.contributionCalendar.totalContributions;

const weekday = [0, 0, 0, 0, 0, 0, 0];
for (const d of days) weekday[d.weekday] += d.contributionCount;

const weekly = weeks.map((w) => ({
  start: w.contributionDays[0].date,
  total: w.contributionDays.reduce((s, d) => s + d.contributionCount, 0),
}));

const repos = user.repositories.nodes;
const stars = repos.reduce((s, r) => s + r.stargazerCount, 0);
const langMap = new Map();
for (const r of repos) {
  for (const e of r.languages.edges) {
    const cur = langMap.get(e.node.name) || { name: e.node.name, size: 0, repos: 0, color: e.node.color };
    cur.size += e.size;
    cur.repos += 1;
    langMap.set(e.node.name, cur);
  }
}
const langs = [...langMap.values()].sort((a, b) => b.size - a.size);

const stats = {
  total,
  commits: cc.totalCommitContributions,
  prs: user.pullRequests.totalCount,
  repos: user.repositories.totalCount,
  stars,
  activeDays,
  current,
  longest,
  followers: user.followers.totalCount,
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fmtDate = (d) => {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(d)
    .split('-');
  return `${Number(p[2])} ${MESES[Number(p[1]) - 1]} ${p[0]}`;
};
const updated = fmtDate(to);

// ---------- piezas ----------

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const fmt = (n) => Number(n).toLocaleString('es-CO');
const dec = (n) => n.toFixed(1).replace('.', ',');
const shortDate = (iso) => `${Number(iso.slice(8, 10))} ${MESES[Number(iso.slice(5, 7)) - 1]}`;

// Contador tipo odómetro: cada dígito es una tira 0-9 (x2) que rueda una vez hasta su valor.
// El valor final va en el estilo en línea, así se ve correcto aunque no haya animación.
function odometer({ id, x, y, value, size = 34, fill = C.ink, delay = 0 }) {
  const str = fmt(value);
  const cw = size * MONO_RATIO;
  const lh = size * 1.2;
  const w = str.length * cw;
  let cols = '';
  [...str].forEach((ch, k) => {
    const cx = r2(x + k * cw + cw / 2);
    if (/\d/.test(ch)) {
      const d = Number(ch);
      let strip = '';
      for (let j = 0; j < 20; j++) strip += `<text x="${cx}" y="${r2(y + j * lh)}" text-anchor="middle">${j % 10}</text>`;
      cols += `<g class="roll" style="transform:translateY(${r2(-(10 + d) * lh)}px);animation-delay:${r2(delay + k * 0.05)}s">${strip}</g>`;
    } else {
      cols += `<text x="${cx}" y="${y}" text-anchor="middle">${esc(ch)}</text>`;
    }
  });
  return `
  <clipPath id="${id}"><rect x="${r2(x - 2)}" y="${r2(y - size * 0.95)}" width="${r2(w + 4)}" height="${r2(size * 1.25)}"/></clipPath>
  <g clip-path="url(#${id})" font-size="${size}" font-weight="600" class="odo" fill="${fill}">${cols}</g>`;
}

const ROLL_CSS = `
  .odo text { font-family: ${FONT.mono}; }
  .roll { animation: roll .9s ${EASE} backwards; }
  @keyframes roll { from { transform: translateY(0); } }
`;

// Cabecera de hoja: título a la izquierda, contexto en texto plano a la derecha y una regla.
function head({ w, title, right }) {
  return `
  <text x="0" y="20" font-size="12.5" fill="${C.muted}">${esc(title)}</text>
  <text x="${w}" y="20" text-anchor="end" font-size="12" fill="${C.muted}">${esc(right)}</text>
  <path d="M0 30.5 H${w}" stroke="${C.rule}"/>`;
}

// Las dos hojas de media columna miden 446: 440 de contenido y 6 de canal hacia el centro,
// así el par llena el ancho sin espacios entre imágenes.
const HALF = 446;
const half = (body, off) => `<g transform="translate(${off} 0)">${body}</g>`;

// ---------- overview.svg ----------
// Tira de cifras sobre reglas: siete columnas, sin cajas ni iconos.

function overview() {
  const W = 900;
  const H = 180;
  const pct = (a, b) => Math.round((a / Math.max(b, 1)) * 100);
  const kpis = [
    ['Contribuciones', stats.total, 'últimos 12 meses'],
    ['Commits', stats.commits, `${pct(stats.commits, stats.total)}% del total`],
    ['Pull requests', stats.prs, 'creados en total'],
    ['Repos públicos', stats.repos, 'propios, sin forks'],
    stats.stars >= 10 ? ['Estrellas', stats.stars, 'en repos públicos'] : ['Lenguajes', langs.length, 'en repos públicos'],
    ['Días activos', stats.activeDays, `${pct(stats.activeDays, 365)}% del año`],
    stats.current > 0
      ? ['Racha actual', stats.current, `días, récord ${stats.longest}`]
      : ['Racha récord', stats.longest, 'días seguidos'],
  ];
  const colW = W / kpis.length;

  let cols = '';
  kpis.forEach(([label, value, sub], i) => {
    const x0 = r2(i * colW);
    const x = i ? r2(x0 + 14) : 0;
    if (i) cols += `<path d="M${x0 + 0.5} 46 V134" stroke="${C.rule}"/>`;
    cols += `
  <g class="in" style="animation-delay:${r2(i * 0.05)}s">
    <text x="${x}" y="60" font-size="12" fill="${C.muted}">${esc(label)}</text>
    <text x="${x}" y="128" font-size="11" fill="${C.faint}">${esc(sub)}</text>
  </g>
  ${odometer({ id: `o${i}`, x, y: 102, value, size: 30, delay: 0.1 + i * 0.06 })}`;
  });

  const body = `
  ${head({ w: W, title: 'Actividad en GitHub', right: `@${LOGIN}, datos en vivo` })}
  ${cols}
  <path d="M0 148.5 H${W}" stroke="${C.rule}"/>
  <text x="0" y="172" font-size="12" fill="${C.muted}">Fuente: API GraphQL de GitHub. Se regenera cada día; última vez el ${esc(updated)}.</text>
  `;

  return svg({
    w: W,
    h: H,
    title: 'Actividad en GitHub, últimos 12 meses',
    desc: kpis.map(([l, v, s]) => `${l}: ${fmt(v)} (${s})`).join('. ') + `. Actualizado el ${updated}.`,
    css: ROLL_CSS,
    body,
  });
}

// ---------- languages.svg ----------
// Barra apilada en tonos de tinta con escala, y una lista con guías punteadas.

function languages() {
  const W = 440;
  const H = 290;
  const sum = langs.reduce((s, l) => s + l.size, 0) || 1;
  const rows = langs
    .slice(0, 6)
    .map((l) => ({ name: l.name, pct: (l.size / sum) * 100, note: `${l.repos} ${l.repos === 1 ? 'repo' : 'repos'}` }));
  const rest = langs.slice(6);
  if (rest.length) {
    rows.push({
      name: 'Otros',
      pct: (rest.reduce((s, l) => s + l.size, 0) / sum) * 100,
      note: `${rest.length} lenguajes`,
    });
  }
  const fills = [C.ink, C.muted, C.faint, C.rule2, C.rule, 'url(#p-hatch)', 'url(#p-hatch)'];

  // Barra: cada tramo mide al menos 2px y el total se reescala al ancho.
  const by = 52;
  const raw = rows.map((r) => Math.max((W * r.pct) / 100, 2));
  const k = W / raw.reduce((a, b) => a + b, 0);
  let cx = 0;
  let bar = '';
  rows.forEach((r, i) => {
    const w = raw[i] * k;
    const gap = i < rows.length - 1 ? 2 : 0;
    const hatch = fills[i].startsWith('url');
    bar += `<rect x="${r2(cx)}" y="${by}" width="${r2(Math.max(w - gap, 1))}" height="14" fill="${fills[i]}"${hatch ? ` stroke="${C.rule2}"` : ''} class="seg" style="animation-delay:${r2(0.1 + i * 0.06)}s"/>`;
    cx += w;
  });
  let scale = '';
  [0, 25, 50, 75, 100].forEach((p) => {
    const x = r2((W * p) / 100);
    const tx = p === 0 ? 0.5 : p === 100 ? W - 0.5 : x + 0.5;
    const anchor = p === 0 ? 'start' : p === 100 ? 'end' : 'middle';
    scale += `<path d="M${tx} ${by + 18} V${by + 22}" stroke="${C.rule2}"/>`;
    scale += `<text x="${x}" y="${by + 34}" text-anchor="${anchor}" font-size="11" class="mono" fill="${C.faint}">${p}${p === 100 ? ' %' : ''}</text>`;
  });

  let list = '';
  rows.forEach((r, i) => {
    const y = 124 + i * 24;
    const hatch = fills[i].startsWith('url');
    const nameEnd = 18 + r.name.length * 7.4 + 8;
    list += `
  <g class="in" style="animation-delay:${r2(0.2 + i * 0.04)}s">
    <rect x="0.5" y="${y - 8.5}" width="8" height="8" fill="${fills[i]}"${hatch ? ` stroke="${C.rule2}"` : ''}/>
    <text x="18" y="${y}" font-size="13" fill="${C.ink}">${esc(r.name)}</text>
    <path d="M${r2(nameEnd)} ${y - 3.5} H${W - 132}" stroke="${C.rule2}" stroke-dasharray="1 3"/>
    <text x="${W - 70}" y="${y}" text-anchor="end" font-size="12" class="mono" fill="${i === 0 ? C.accent : C.ink}">${dec(r.pct)}%</text>
    <text x="${W}" y="${y}" text-anchor="end" font-size="12" fill="${C.muted}">${esc(r.note)}</text>
  </g>`;
  });

  const css = `
    .seg { animation: seg .7s ${EASE} backwards; transform-box: fill-box; transform-origin: left center; }
    @keyframes seg { from { transform: scaleX(0); } }
  `;
  const body = `
  ${head({ w: W, title: 'Lenguajes', right: `por bytes, ${langs.length} en ${stats.repos} repos` })}
  ${bar}
  ${scale}
  ${list}
  `;
  return svg({
    w: HALF,
    h: H,
    title: 'Lenguajes más usados en mis repos públicos',
    desc: rows.map((r) => `${r.name}: ${dec(r.pct)}%`).join(', ') + '.',
    css,
    body: half(body, 0),
  });
}

// ---------- rhythm.svg ----------
// Barras de sección rayada por día de la semana; el día más activo, en acento.

function rhythm() {
  const W = 440;
  const H = 290;
  const order = [1, 2, 3, 4, 5, 6, 0];
  const max = Math.max(...weekday, 1);
  const best = weekday.indexOf(Math.max(...weekday));
  const base = 222;
  const top = 74;
  const slot = W / 7;
  const bw = 34;

  let bars = '';
  order.forEach((d, k) => {
    const v = weekday[d];
    const isBest = d === best && v > 0;
    const x = r2(k * slot + (slot - bw) / 2);
    const cxm = r2(k * slot + slot / 2);
    const h = r2(((base - top) * v) / max);
    const delay = r2(0.1 + k * 0.04);
    if (h > 0) {
      bars += isBest
        ? `<rect x="${x}" y="${r2(base - h)}" width="${bw}" height="${h}" fill="url(#p-hatch-a)" stroke="${C.accent}" class="bar" style="animation-delay:${delay}s"/>`
        : `<rect x="${r2(x + 0.5)}" y="${r2(base - h + 0.5)}" width="${bw - 1}" height="${r2(Math.max(h - 0.5, 0.5))}" fill="url(#p-hatch)" stroke="${C.muted}" class="bar" style="animation-delay:${delay}s"/>`;
    }
    const weight = isBest ? ' font-weight="600"' : '';
    bars += `
  <text x="${cxm}" y="${r2(base - h - 8)}" text-anchor="middle" font-size="11" class="mono in" fill="${isBest ? C.ink : C.muted}"${weight} style="animation-delay:${r2(0.4 + k * 0.04)}s">${fmt(v)}</text>
  <text x="${cxm}" y="${base + 20}" text-anchor="middle" font-size="11.5" fill="${isBest ? C.ink : C.muted}"${weight}>${DIAS_CORTOS[d]}</text>`;
  });

  const avg = stats.activeDays ? dec(stats.total / stats.activeDays) : '0';
  const css = `
    .bar { animation: bar .7s ${EASE} backwards; transform-box: fill-box; transform-origin: center bottom; }
    @keyframes bar { from { transform: scaleY(0); } }
  `;
  const body = `
  ${head({ w: W, title: 'Ritmo semanal', right: 'contribuciones por día, 12 meses' })}
  ${bars}
  <path d="M0 ${base + 0.5} H${W}" stroke="${C.ink}"/>
  <path d="M0 ${base + 36.5} H${W}" stroke="${C.rule}"/>
  <text x="0" y="${base + 60}" font-size="12" fill="${C.muted}">Día más activo: <tspan fill="${C.ink}" font-weight="600">${DIAS[best]}</tspan></text>
  <text x="${W}" y="${base + 60}" text-anchor="end" font-size="12" fill="${C.muted}">${avg} contribuciones por día activo</text>
  `;
  return svg({
    w: HALF,
    h: H,
    title: 'Ritmo semanal de contribuciones',
    desc: `${order.map((d) => `${DIAS[d]}: ${weekday[d]}`).join(', ')}. Día más activo: ${DIAS[best]}.`,
    css,
    body: half(body, 6),
  });
}

// ---------- activity.svg ----------
// Línea de tinta por semana sobre retícula; el pico se anota con una guía.

function niceStep(max) {
  const raw = max / 3;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

function activity() {
  const W = 900;
  const H = 230;
  const pr = W - 40;
  const pt = 72;
  const pb = 196;
  const n = weekly.length;
  const max = Math.max(...weekly.map((w) => w.total), 1);
  const step = Math.max(niceStep(max), 1);
  const ymax = Math.ceil(max / step) * step;
  const X = (i) => r2((i / Math.max(n - 1, 1)) * pr);
  const Y = (v) => r2(pb - (v / ymax) * (pb - pt));

  let grid = '';
  for (let v = step; v <= ymax; v += step) {
    grid += `<path d="M0 ${r2(Y(v) + 0.5)} H${pr}" stroke="${C.rule}"/>`;
    grid += `<text x="${W}" y="${r2(Y(v) + 4)}" text-anchor="end" font-size="11" class="mono" fill="${C.faint}">${fmt(v)}</text>`;
  }
  grid += `<text x="${W}" y="${pb + 4}" text-anchor="end" font-size="11" class="mono" fill="${C.faint}">0</text>`;

  let months = '';
  let lastX = -100;
  weekly.forEach((w, i) => {
    const m = Number(w.start.slice(5, 7)) - 1;
    const prev = i ? Number(weekly[i - 1].start.slice(5, 7)) - 1 : -1;
    if (m === prev) return;
    const x = X(i);
    if (x - lastX < 44 || x > pr - 24) return;
    lastX = x;
    const label = m === 0 ? w.start.slice(0, 4) : MESES[m];
    months += `<path d="M${r2(x + 0.5)} ${pb + 1} V${pb + 5}" stroke="${C.rule2}"/>`;
    months += `<text x="${r2(x + 3)}" y="${pb + 18}" font-size="11" class="mono" fill="${m === 0 ? C.muted : C.faint}">${label}</text>`;
  });

  const d = weekly.map((w, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(w.total)}`).join(' ');
  const pi = weekly.findIndex((w) => w.total === max);
  const px = X(pi);
  const py = Y(max);
  const label = `${fmt(max)} contribuciones, semana del ${shortDate(weekly[pi].start)}`;
  const flip = px > W - 300;
  const note = `
  <g class="in" style="animation-delay:1.1s">
    <path d="M${r2(px + 0.5)} ${r2(py - 7)} V44" stroke="${C.muted}"/>
    <path d="M${px} 44.5 H${r2(flip ? px - 10 : px + 10)}" stroke="${C.muted}"/>
    <text x="${r2(flip ? px - 16 : px + 16)}" y="48" text-anchor="${flip ? 'end' : 'start'}" font-size="11" class="mono" fill="${C.ink}">${esc(label)}</text>
    <rect x="${r2(px - 3)}" y="${r2(py - 3)}" width="6" height="6" fill="${C.accent}"/>
  </g>`;

  const body = `
  ${head({ w: W, title: 'Contribuciones por semana', right: `${fmt(stats.total)} en 12 meses, actualizado el ${updated}` })}
  ${grid}
  <path d="M0 ${pb + 0.5} H${pr}" stroke="${C.ink}"/>
  ${months}
  <path d="${d}" fill="none" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round" pathLength="1" class="draw" style="animation-delay:.2s"/>
  ${note}
  `;
  return svg({
    w: W,
    h: H,
    title: 'Contribuciones por semana, últimos 12 meses',
    desc: `${fmt(stats.total)} contribuciones en ${n} semanas. Semana con más actividad: ${label}.`,
    body,
  });
}

// ---------- salida ----------

mkdirSync(OUT, { recursive: true });
for (const t of ['dark', 'light']) {
  setTheme(t);
  const dir = join(OUT, t);
  mkdirSync(dir, { recursive: true });
  const files = {
    'overview.svg': overview(),
    'languages.svg': languages(),
    'rhythm.svg': rhythm(),
    'activity.svg': activity(),
  };
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content, 'utf8');
}
writeFileSync(
  join(OUT, 'stats.json'),
  JSON.stringify({ updated: to.toISOString(), ...stats, weekday, languages: langs }, null, 2),
);
console.log(`Métricas de @${LOGIN} en ${OUT}/{dark,light}: ${stats.total} contribuciones, ${langs.length} lenguajes.`);
