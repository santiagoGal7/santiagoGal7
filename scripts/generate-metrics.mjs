// Métricas en vivo generadas desde la API GraphQL de GitHub.
// Las ejecuta un workflow a diario y publica los SVG en la rama `metrics`.
// Uso local: GITHUB_TOKEN=$(gh auth token) node scripts/generate-metrics.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { C, svg, esc, r2, panel } from './lib/svg.mjs';
import { LANG_COLORS } from './data.mjs';

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

// Contador tipo odómetro: cada dígito es una tira 0-9 (x2) que rueda hasta su valor.
// El valor final va en el estilo en línea, así se ve correcto aunque no haya animación.
function odometer({ id, x, y, value, size = 28, fill = C.text, delay = 0, anchor = 'start' }) {
  const str = Number(value).toLocaleString('es-CO');
  const cw = size * 0.6;
  const lh = size * 1.2;
  const w = str.length * cw;
  const x0 = anchor === 'middle' ? x - w / 2 : x;
  let cols = '';
  [...str].forEach((ch, k) => {
    const cx = r2(x0 + k * cw + cw / 2);
    if (/\d/.test(ch)) {
      const d = Number(ch);
      let strip = '';
      for (let j = 0; j < 20; j++) {
        strip += `<text x="${cx}" y="${r2(y + j * lh)}" text-anchor="middle">${j % 10}</text>`;
      }
      cols += `<g class="roll" style="transform:translateY(${r2(-(10 + d) * lh)}px);animation-delay:${r2(delay + k * 0.07)}s">${strip}</g>`;
    } else {
      cols += `<text x="${cx}" y="${y}" text-anchor="middle">${esc(ch)}</text>`;
    }
  });
  return `
  <clipPath id="${id}"><rect x="${r2(x0 - 2)}" y="${r2(y - size * 0.95)}" width="${r2(w + 4)}" height="${r2(size * 1.25)}"/></clipPath>
  <g clip-path="url(#${id})" font-size="${size}" font-weight="700" class="mono" fill="${fill}">${cols}</g>`;
}

const ROLL_CSS = `
  .roll { animation: roll 2.4s cubic-bezier(.16,1,.3,1) both; }
  @keyframes roll { from { transform: translateY(0); } }
`;

const ICON = {
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
  commit: '<circle cx="12" cy="12" r="3.5"/><path d="M3 12h5.5M15.5 12H21"/>',
  pr: '<circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M6 8.2v7.6M18 15.8V10a3 3 0 0 0-3-3h-4M13 4.5L10.5 7 13 9.5"/>',
  repo: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7h6"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/>',
};

function header({ w, left, right }) {
  return `
  <circle cx="26" cy="30" r="4" fill="${C.green}" class="live"/>
  <text x="38" y="34" font-size="12" class="mono" fill="${C.sub}">${esc(left)}</text>
  <text x="${w - 24}" y="34" text-anchor="end" font-size="11" class="mono" fill="${C.dim}">${esc(right)}</text>`;
}

const LIVE_CSS = `
  .live { animation: live 1.8s ease-in-out infinite; }
  @keyframes live { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
  .fade { animation: fade .9s ease-out both; }
  @keyframes fade { from { opacity: 0; transform: translateY(8px); } }
`;

// ---------- overview.svg ----------

function overview() {
  const W = 900;
  const H = 248;
  const tiles = [
    { label: 'Contribuciones', sub: 'últimos 12 meses', value: stats.total, color: C.green, icon: ICON.pulse },
    { label: 'Commits', sub: 'últimos 12 meses', value: stats.commits, color: C.blue, icon: ICON.commit },
    { label: 'Pull requests', sub: 'en total', value: stats.prs, color: C.violet, icon: ICON.pr },
    { label: 'Repos públicos', sub: 'propios, sin forks', value: stats.repos, color: C.cyan, icon: ICON.repo },
    stats.stars >= 10
      ? { label: 'Estrellas', sub: 'en mis repos', value: stats.stars, color: C.amber, icon: ICON.star }
      : { label: 'Lenguajes', sub: 'en repos públicos', value: langs.length, color: C.amber, icon: ICON.code },
    { label: 'Días activos', sub: 'últimos 12 meses', value: stats.activeDays, color: C.pink, icon: ICON.cal },
  ];
  const tw = 190;
  const th = 84;
  let body = panel({ x: 0, y: 0, w: W, h: H, rx: 20 });
  body += header({ w: W, left: 'actividad en GitHub', right: `actualizado ${updated} · cada 24 h` });

  tiles.forEach((t, i) => {
    const x = 24 + (i % 3) * (tw + 12);
    const y = 52 + Math.floor(i / 3) * (th + 12);
    body += `
  <g class="fade" style="animation-delay:${r2(i * 0.08)}s">
    <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="14" fill="${C.bg1}" stroke="${t.color}" stroke-opacity="0.32"/>
    <rect x="${x}" y="${y + 18}" width="3" height="${th - 36}" rx="1.5" fill="${t.color}"/>
    <text x="${x + 16}" y="${y + 22}" font-size="10" class="mono" fill="${C.dim}" letter-spacing="1.2">${esc(t.label.toUpperCase())}</text>
    <g transform="translate(${x + tw - 32} ${y + 10}) scale(0.75)" fill="none" stroke="${t.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ico" style="animation-delay:${r2(i * 0.4)}s">${t.icon}</g>
    ${odometer({ id: `od${i}`, x: x + 16, y: y + 56, value: t.value, size: 28, delay: 0.2 + i * 0.12 })}
    <text x="${x + 16}" y="${y + 74}" font-size="10" class="mono" fill="${C.sub}">${esc(t.sub)}</text>
  </g>`;
  });

  // Racha
  const px = 636;
  const pw = 240;
  const cx = px + pw / 2;
  const cy = 122;
  const r = 46;
  const circ = 2 * Math.PI * r;
  // Sin racha activa se muestra el récord (anillo completo) en lugar de un 0.
  const live = stats.current > 0;
  const shown = live ? stats.current : stats.longest;
  const p = !stats.longest ? 0 : live ? Math.max(stats.current / stats.longest, 0.06) : 1;
  body += `
  <g class="fade" style="animation-delay:.5s">
    <rect x="${px}" y="52" width="${pw}" height="${2 * th + 12}" rx="14" fill="${C.bg1}" stroke="${C.green}" stroke-opacity="0.32"/>
    <circle cx="${cx}" cy="${cy}" r="${r + 11}" fill="none" stroke="${C.line}" stroke-dasharray="2 6" class="spin"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.line}" stroke-width="8"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#ring)" stroke-width="8" stroke-linecap="round"
      stroke-dasharray="${r2(circ)} ${r2(circ)}" stroke-dashoffset="${r2(circ * (1 - p))}" transform="rotate(-90 ${cx} ${cy})" class="arc"/>
    <g>
      <circle cx="${cx}" cy="${cy - r - 11}" r="3" fill="${C.cyan}" filter="url(#f-glow)"/>
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="7s" repeatCount="indefinite"/>
    </g>
    ${odometer({ id: 'odst', x: cx, y: cy + 8, value: shown, size: 30, anchor: 'middle', delay: 0.6 })}
    <text x="${cx}" y="${cy + 25}" text-anchor="middle" font-size="10" class="mono" fill="${C.dim}">días</text>
    <text x="${cx}" y="${cy + 80}" text-anchor="middle" font-size="13" font-weight="700" fill="${C.text}">${live ? 'Racha actual' : 'Racha récord'}</text>
    <text x="${cx}" y="${cy + 98}" text-anchor="middle" font-size="10.5" class="mono" fill="${C.sub}">${live ? `récord: <tspan fill="${C.green}">${stats.longest} días</tspan>` : `en los últimos 12 meses`}</text>
  </g>`;

  const defs = `
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.green}"/>
      <stop offset="1" stop-color="${C.cyan}"/>
    </linearGradient>`;
  const css = `
    ${ROLL_CSS}
    ${LIVE_CSS}
    .arc { animation: arc 2.2s cubic-bezier(.16,1,.3,1) .6s both; }
    @keyframes arc { from { stroke-dashoffset: ${r2(circ)}; } }
    .spin { animation: spin 30s linear infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .ico { animation: ico 4s ease-in-out infinite; }
    @keyframes ico { 0%,100% { opacity: .6; } 50% { opacity: 1; } }
  `;
  return svg({
    w: W,
    h: H,
    title: 'Actividad en GitHub',
    desc: `Últimos 12 meses: ${stats.total} contribuciones, ${stats.commits} commits, ${stats.activeDays} días activos. ${stats.prs} pull requests, ${stats.repos} repos públicos, ${langs.length} lenguajes. Racha actual ${stats.current} días, récord ${stats.longest}.`,
    defs,
    css,
    body,
  });
}

// ---------- languages.svg ----------

function languages() {
  const W = 440;
  const H = 290;
  const top = langs.slice(0, 6);
  const rest = langs.slice(6).reduce((s, l) => s + l.size, 0);
  const sum = langs.reduce((s, l) => s + l.size, 0) || 1;
  const items = top.map((l) => ({ ...l, color: l.color || LANG_COLORS[l.name] || C.dim }));
  if (rest > 0) items.push({ name: 'Otros', size: rest, repos: null, color: C.dim });

  const cx = 110;
  const cy = 160;
  const r = 64;
  const sw = 20;
  const circ = 2 * Math.PI * r;
  const gap = items.length > 1 ? 2.5 : 0;
  let acc = 0;
  let segs = '';
  let legend = '';
  items.forEach((l, i) => {
    const frac = l.size / sum;
    const len = Math.max(frac * circ - gap, 0.5);
    segs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${l.color}" stroke-width="${sw}"
      stroke-dasharray="${r2(len)} ${r2(circ)}" stroke-dashoffset="${r2(-acc)}" transform="rotate(-90 ${cx} ${cy})" class="seg" style="animation-delay:${r2(0.15 + i * 0.12)}s"/>`;
    acc += frac * circ;

    const ly = 74 + i * 29;
    const pct = frac * 100;
    const pctTxt = pct >= 10 ? pct.toFixed(0) : pct.toFixed(1);
    legend += `
  <g class="fade" style="animation-delay:${r2(0.2 + i * 0.1)}s">
    <circle cx="222" cy="${ly - 4}" r="4.5" fill="${l.color}"/>
    <text x="234" y="${ly}" font-size="12.5" font-weight="600" fill="${C.text}">${esc(l.name)}</text>
    <text x="416" y="${ly}" text-anchor="end" font-size="11" class="mono" fill="${C.sub}">${pctTxt}%${l.repos ? ` <tspan fill="${C.dim}">· ${l.repos}r</tspan>` : ''}</text>
    <rect x="234" y="${ly + 6}" width="182" height="3" rx="1.5" fill="${C.line}"/>
    <rect x="234" y="${ly + 6}" width="${r2(Math.max(182 * (l.size / items[0].size), 3))}" height="3" rx="1.5" fill="${l.color}" class="grow" style="animation-delay:${r2(0.3 + i * 0.1)}s"/>
  </g>`;
  });

  const lead = items[0] || { name: '—', size: 0 };
  const body = `
  ${panel({ x: 0, y: 0, w: W, h: H, rx: 20 })}
  ${header({ w: W, left: 'lenguajes · por bytes', right: `${langs.length} en ${stats.repos} repos` })}
  <circle cx="${cx}" cy="${cy}" r="${r + sw / 2 + 10}" fill="none" stroke="${C.line}" stroke-dasharray="2 5" class="spin"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.line}" stroke-width="${sw}"/>
  ${segs}
  <text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="24" font-weight="800" fill="${C.text}" class="fade">${((lead.size / sum) * 100).toFixed(0)}%</text>
  <text x="${cx}" y="${cy + 21}" text-anchor="middle" font-size="11" class="mono" fill="${lead.color}">${esc(lead.name)}</text>
  ${legend}
  `;
  const css = `
    ${LIVE_CSS}
    .seg { animation: seg 1.4s cubic-bezier(.16,1,.3,1) both; }
    @keyframes seg { from { stroke-dasharray: 0 ${r2(circ)}; } }
    .grow { animation: grow 1.2s cubic-bezier(.16,1,.3,1) both; transform-box: fill-box; transform-origin: left; }
    @keyframes grow { from { transform: scaleX(0); } }
    .spin { animation: spin 40s linear infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  return svg({
    w: W,
    h: H,
    title: 'Lenguajes más usados',
    desc: items.map((l) => `${l.name} ${((l.size / sum) * 100).toFixed(1)}%`).join(', '),
    css,
    body,
  });
}

// ---------- rhythm.svg ----------

function rhythm() {
  const W = 440;
  const H = 290;
  const order = [1, 2, 3, 4, 5, 6, 0];
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const short = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const max = Math.max(...weekday, 1);
  const best = weekday.indexOf(Math.max(...weekday));
  const base = 222;
  const maxH = 130;
  const bw = 34;
  const x0 = 34;
  const span = 372;
  const gap = (span - 7 * bw) / 6;
  let bars = '';
  order.forEach((wd, i) => {
    const v = weekday[wd];
    const h = Math.max((v / max) * maxH, 4);
    const x = r2(x0 + i * (bw + gap));
    const top = wd === best && v > 0;
    bars += `
  <g>
    <rect x="${x}" y="${base - maxH}" width="${bw}" height="${maxH}" rx="9" fill="${C.line}" fill-opacity="0.35"/>
    <rect x="${x}" y="${r2(base - h)}" width="${bw}" height="${r2(h)}" rx="9" fill="url(#${top ? 'bt' : 'bb'})" class="bar" style="animation-delay:${r2(0.1 + i * 0.09)}s"/>
    ${top ? `<rect x="${x}" y="${r2(base - h)}" width="${bw}" height="${r2(h)}" rx="9" fill="none" stroke="${C.amber}" stroke-width="1.5" class="glow"/>` : ''}
    <text x="${r2(x + bw / 2)}" y="${r2(base - h - 8)}" text-anchor="middle" font-size="10.5" class="mono fade" fill="${top ? C.amber : C.sub}" style="animation-delay:${r2(0.6 + i * 0.09)}s">${v}</text>
    <text x="${r2(x + bw / 2)}" y="${base + 18}" text-anchor="middle" font-size="11" class="mono" fill="${top ? C.text : C.dim}">${short[wd]}</text>
  </g>`;
  });
  const avg = stats.activeDays ? (stats.total / stats.activeDays).toFixed(1) : '0';
  const body = `
  ${panel({ x: 0, y: 0, w: W, h: H, rx: 20 })}
  ${header({ w: W, left: 'ritmo semanal', right: 'últimos 12 meses' })}
  ${bars}
  <path d="M24 ${base} H${W - 24}" stroke="${C.line}"/>
  <text x="24" y="${H - 18}" font-size="12" fill="${C.sub}">Día más activo: <tspan font-weight="700" fill="${C.amber}">${names[best]}</tspan></text>
  <text x="${W - 24}" y="${H - 18}" text-anchor="end" font-size="11" class="mono" fill="${C.dim}">${avg} contrib./día activo</text>
  `;
  const defs = `
    <linearGradient id="bb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.blue}"/>
      <stop offset="1" stop-color="${C.purple}" stop-opacity="0.55"/>
    </linearGradient>
    <linearGradient id="bt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.amber}"/>
      <stop offset="1" stop-color="${C.pink}" stop-opacity="0.6"/>
    </linearGradient>`;
  const css = `
    ${LIVE_CSS}
    .bar { animation: bar 1.3s cubic-bezier(.16,1,.3,1) both; transform-box: fill-box; transform-origin: bottom; }
    @keyframes bar { from { transform: scaleY(0); } }
    .glow { animation: glow 2.4s ease-in-out infinite; }
    @keyframes glow { 0%,100% { opacity: .2; } 50% { opacity: 1; } }
  `;
  return svg({
    w: W,
    h: H,
    title: 'Ritmo semanal',
    desc: order.map((wd) => `${names[wd]}: ${weekday[wd]}`).join(', ') + `. Día más activo: ${names[best]}.`,
    defs,
    css,
    body,
  });
}

// ---------- activity.svg ----------

function activity() {
  const W = 900;
  const H = 250;
  const px0 = 56;
  const px1 = W - 26;
  const py0 = 62;
  const py1 = 196;
  const n = weekly.length;
  const rawMax = Math.max(...weekly.map((w) => w.total), 1);
  const niceStep = rawMax <= 4 ? 1 : Math.ceil(rawMax / 4 / 5) * 5 || 1;
  const max = Math.max(niceStep * 4, rawMax);
  const X = (i) => px0 + (i / Math.max(n - 1, 1)) * (px1 - px0);
  const Y = (v) => py1 - (v / max) * (py1 - py0);
  const pts = weekly.map((w, i) => [r2(X(i)), r2(Y(w.total))]);

  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const mx = r2((ax + bx) / 2);
    d += ` C${mx} ${ay} ${mx} ${by} ${bx} ${by}`;
  }
  const area = `${d} L${pts[pts.length - 1][0]} ${py1} L${pts[0][0]} ${py1} Z`;

  let grid = '';
  for (let k = 0; k <= 4; k++) {
    const v = (max / 4) * k;
    const y = r2(Y(v));
    grid += `<path d="M${px0} ${y} H${px1}" stroke="${C.line}" ${k ? 'stroke-dasharray="3 5"' : ''}/>
    <text x="${px0 - 10}" y="${y + 4}" text-anchor="end" font-size="10" class="mono" fill="${C.dim}">${Math.round(v)}</text>`;
  }
  let months = '';
  let lastM = -1;
  weekly.forEach((w, i) => {
    const m = Number(w.start.slice(5, 7)) - 1;
    if (m !== lastM && i > 0) {
      months += `<text x="${r2(X(i))}" y="${py1 + 20}" text-anchor="middle" font-size="10" class="mono" fill="${C.dim}">${MESES[m]}</text>`;
    }
    lastM = m;
  });

  const peakI = weekly.reduce((bi, w, i) => (w.total > weekly[bi].total ? i : bi), 0);
  const [pkx, pky] = pts[peakI];
  const peakLabelX = Math.min(Math.max(pkx, px0 + 50), px1 - 50);
  const pw = px1 - px0;

  const body = `
  ${panel({ x: 0, y: 0, w: W, h: H, rx: 20 })}
  ${header({ w: W, left: 'contribuciones por semana · últimos 12 meses', right: `${stats.total} en total · pico ${weekly[peakI].total}/semana` })}
  ${grid}
  ${months}
  <clipPath id="rv"><rect x="${px0 - 6}" y="${py0 - 30}" width="${pw + 12}" height="${py1 - py0 + 40}">
    <animate attributeName="width" from="0" to="${pw + 12}" dur="2.4s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1"/>
  </rect></clipPath>
  <g clip-path="url(#rv)">
    <path d="${area}" fill="url(#ar)"/>
    <path id="ln" d="${d}" fill="none" stroke="url(#lg)" stroke-width="2.5" stroke-linejoin="round" filter="url(#f-glow)"/>
  </g>
  <g class="fade" style="animation-delay:2.2s">
    <path d="M${pkx} ${pky} V${py1}" stroke="${C.amber}" stroke-opacity="0.5" stroke-dasharray="2 3"/>
    <circle cx="${pkx}" cy="${pky}" r="5" fill="none" stroke="${C.amber}" stroke-width="1.5" class="ping"/>
    <circle cx="${pkx}" cy="${pky}" r="4" fill="${C.amber}"/>
    <text x="${peakLabelX}" y="${r2(Math.max(pky - 12, py0 - 6))}" text-anchor="middle" font-size="10.5" class="mono" fill="${C.amber}">pico · ${weekly[peakI].total}</text>
  </g>
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" begin="2.4s" dur="0.4s" fill="freeze"/>
    <circle r="9" fill="${C.cyan}" opacity="0.3" filter="url(#f-soft)"/>
    <circle r="3.5" fill="#fff"/>
    <animateMotion dur="9s" begin="2.4s" repeatCount="indefinite"><mpath xlink:href="#ln"/></animateMotion>
  </g>
  `;
  const defs = `
    <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.blue}" stop-opacity="0.4"/>
      <stop offset="1" stop-color="${C.purple}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.blue}"/>
      <stop offset="0.5" stop-color="${C.cyan}"/>
      <stop offset="1" stop-color="${C.green}"/>
    </linearGradient>`;
  const css = `
    ${LIVE_CSS}
    .ping { animation: ping 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes ping { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(3); opacity: 0; } }
  `;
  return svg({
    w: W,
    h: H,
    title: 'Contribuciones por semana',
    desc: `${stats.total} contribuciones en los últimos 12 meses. Semana con más actividad: ${weekly[peakI].total} contribuciones (semana del ${weekly[peakI].start}).`,
    defs,
    css,
    body,
  });
}

// ---------- escritura ----------

mkdirSync(OUT, { recursive: true });
const files = { 'overview.svg': overview(), 'languages.svg': languages(), 'rhythm.svg': rhythm(), 'activity.svg': activity() };
for (const [name, content] of Object.entries(files)) writeFileSync(join(OUT, name), content, 'utf8');
writeFileSync(join(OUT, 'stats.json'), JSON.stringify({ updated: to.toISOString(), ...stats, weekday, languages: langs }, null, 2));

console.log(`✓ métricas de @${LOGIN} → ${OUT}`);
console.log(JSON.stringify(stats));
