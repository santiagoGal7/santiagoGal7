// Terminal "sobre mí": escribe un comando, imprime un record de C# y lo ejecuta.
// Todo en bucle con SMIL discreto para que parezca una terminal real.
import { C, svg, esc, r2, MONO_RATIO, BLINK_CSS } from '../lib/svg.mjs';

const K = {
  kw: C.violet,
  type: C.cyan,
  prop: C.blue,
  str: '#9ECE6A',
  p: C.sub,
  bool: C.orange,
  ok: C.green,
  dim: C.dim,
  text: C.text,
};

// Cada línea: lista de [texto, color]. Los espacios se respetan por columnas.
const prop = (type, name, value, valueColor = K.str) => [
  ['    ', K.p],
  ['public ', K.kw],
  [type.padEnd(9), K.type],
  [name.padEnd(9), K.prop],
  ['=> ', K.p],
  ...value.map((v) => (Array.isArray(v) ? v : [v, valueColor])),
  [';', K.p],
];
const list = (items) => {
  const out = [['[', K.p]];
  items.forEach((it, i) => {
    out.push([`"${it}"`, K.str]);
    if (i < items.length - 1) out.push([', ', K.p]);
  });
  out.push([']', K.p]);
  return out;
};

const CODE = [
  [['public ', K.kw], ['sealed ', K.kw], ['record ', K.kw], ['Developer', K.type]],
  [['{', K.p]],
  prop('string', 'Name', ['"Santiago Gallo"']),
  prop('string', 'Role', ['"Backend Developer"']),
  prop('string', 'Location', ['"Colombia"']),
  prop('string[]', 'Stack', list(['.NET', 'Python', 'JavaScript'])),
  prop('string[]', 'Focus', list(['APIs REST', 'Clean Architecture', 'Agentes de IA'])),
  prop('string', 'Now', ['"Liderando el backend de Nodux"']),
  prop('bool', 'Coffee', [['true', K.bool]]),
  [['}', K.p]],
];

export function about() {
  const W = 900;
  const D = 20; // ciclo en segundos
  const OFF = 19.2; // se limpia la pantalla
  const size = 14;
  const cw = size * MONO_RATIO;
  const lh = 23;
  const x0 = 30;
  const y0 = 74;
  const rows = 16;
  const H = y0 + rows * lh + 6;
  const kt = (t) => (t / D).toFixed(4);

  const vis = (on, off = OFF) =>
    `<animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" calcMode="discrete" values="0;1;0" keyTimes="0;${kt(on)};${kt(off)}"/>`;

  const lineY = (i) => y0 + i * lh;

  const renderTokens = (tokens, y) => {
    // Solo se ancla a la rejilla tras un espacio (mantiene las columnas alineadas);
    // los tokens pegados ("…" + ;) fluyen seguidos para no dejar huecos.
    let col = 0;
    let out = '';
    let glued = false;
    for (const [t, color] of tokens) {
      if (t.trim()) {
        const x = glued ? '' : ` x="${r2(x0 + col * cw)}"`;
        out += `<tspan${x} fill="${color}">${esc(t)}</tspan>`;
        glued = !/\s$/.test(t);
      } else {
        glued = false;
      }
      col += t.length;
    }
    return `<text y="${y}" font-size="${size}" class="mono">${out}</text>`;
  };

  let defs = '';
  let body = '';

  // Línea con prompt y comando que se escribe carácter a carácter.
  const typed = (id, i, cmd, start, cursorOff) => {
    const y = lineY(i);
    const tx = x0 + 2 * cw;
    const step = 0.075;
    const ev = [[0, 0]];
    for (let c = 1; c <= cmd.length; c++) ev.push([start + c * step, c * cw]);
    ev.push([OFF, 0]);
    const values = ev.map(([, w]) => r2(w)).join(';');
    const keys = ev.map(([t]) => kt(t)).join(';');
    defs += `
    <mask id="${id}" maskUnits="userSpaceOnUse">
      <rect x="${r2(tx)}" y="${y - 16}" height="22" width="0" fill="#fff">
        <animate attributeName="width" dur="${D}s" repeatCount="indefinite" calcMode="discrete" values="${values}" keyTimes="${keys}"/>
      </rect>
    </mask>`;
    const cvals = ev.slice(0, -1).map(([, w]) => r2(tx + w + 1)).join(';');
    const ckeys = ev.slice(0, -1).map(([t]) => kt(t)).join(';');
    body += `
    <g>${vis(start - 0.35)}
      <text x="${x0}" y="${y}" font-size="${size}" class="mono" fill="${C.green}">$</text>
    </g>
    <text x="${r2(tx)}" y="${y}" font-size="${size}" class="mono" fill="${C.text}" textLength="${r2(cmd.length * cw)}" lengthAdjust="spacingAndGlyphs" mask="url(#${id})">${esc(cmd)}</text>
    <rect x="${r2(tx + 1)}" y="${y - 12}" width="8" height="16" fill="${C.cyan}">
      <animate attributeName="x" dur="${D}s" repeatCount="indefinite" calcMode="discrete" values="${cvals}" keyTimes="${ckeys}"/>
      ${vis(start - 0.35, cursorOff)}
    </rect>`;
  };

  typed('cmd1', 0, 'cat Developer.cs', 0.6, 2.1);

  CODE.forEach((tokens, k) => {
    const t = 2.1 + k * 0.11;
    body += `<g>${vis(t)}${renderTokens(tokens, lineY(2 + k))}</g>`;
  });

  typed('cmd2', 12, 'dotnet run', 3.9, 4.9);

  body += `
    <g>${vis(4.9, 5.7)}<text x="${x0}" y="${lineY(13)}" font-size="${size}" class="mono" fill="${C.dim}">Compilando Developer.csproj...</text></g>
    <g>${vis(5.7)}<text y="${lineY(13)}" font-size="${size}" class="mono"><tspan x="${x0}" fill="${C.green}">✓ Build succeeded</tspan><tspan fill="${C.dim}"> · 0 warnings · 0 errors · 1.42s</tspan></text></g>
    <g>${vis(6.2)}<text y="${lineY(14)}" font-size="${size}" class="mono"><tspan x="${x0}" fill="${C.cyan}">→</tspan><tspan fill="${C.text}"> ¡Hola! Gracias por pasar por mi perfil.</tspan></text></g>
    <g>${vis(6.6)}
      <text x="${x0}" y="${lineY(15)}" font-size="${size}" class="mono" fill="${C.green}">$</text>
      <rect x="${r2(x0 + 2 * cw + 1)}" y="${lineY(15) - 12}" width="8" height="16" fill="${C.cyan}" class="blink"/>
    </g>`;

  const css = `${BLINK_CSS}`;

  const chrome = `
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="${C.bg0}" stroke="url(#g-stroke)"/>
  <path d="M1 44 H${W - 1}" stroke="${C.line}"/>
  <path d="M16.5 0.5 H${W - 16.5} A16 16 0 0 1 ${W - 0.5} 16.5 V44 H0.5 V16.5 A16 16 0 0 1 16.5 0.5z" fill="${C.panel2}"/>
  <circle cx="24" cy="22" r="6" fill="#FF5F57"/>
  <circle cx="44" cy="22" r="6" fill="#FEBC2E"/>
  <circle cx="64" cy="22" r="6" fill="#28C840"/>
  <text x="${W / 2}" y="27" text-anchor="middle" font-size="12.5" class="mono" fill="${C.sub}">santiago@dev: ~/perfil</text>
  <text x="${W - 22}" y="27" text-anchor="end" font-size="11" class="mono" fill="${C.dim}">pwsh · UTF-8</text>
  `;

  return svg({
    w: W,
    h: H,
    title: 'Sobre mí: terminal con un record de C#',
    desc: 'Santiago Gallo, Backend Developer en Colombia. Stack: .NET, Python y JavaScript. Enfoque: APIs REST, Clean Architecture y agentes de IA. Ahora lidera el backend de Nodux.',
    defs,
    css,
    body: chrome + body,
  });
}
