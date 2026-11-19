// Arquitectura como plano: clientes, la API en cuatro capas y sus integraciones.
// Conexiones ortogonales; una sola request (en acento) recorre la ruta hasta PostgreSQL.
import { C, svg, esc, r2 } from '../lib/svg.mjs';

export function architecture() {
  const W = 900;
  const H = 404;

  const node = ({ x, y, w, h, title, sub }, i) => `
  <g class="in" style="animation-delay:${r2(0.1 + i * 0.05)}s">
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="2" fill="none" stroke="${C.rule2}"/>
    <text x="${x + 14}" y="${y + 23}" font-size="13.5" font-weight="600" fill="${C.ink}">${esc(title)}</text>
    <text x="${x + 14}" y="${y + 40}" font-size="11.5" fill="${C.muted}">${esc(sub)}</text>
  </g>`;

  // Columna izquierda: clientes
  const clients = [
    { x: 0, y: 70, w: 186, h: 54, title: 'Web (React)', sub: 'SPA o Next.js' },
    { x: 0, y: 160, w: 186, h: 54, title: 'Bot de Telegram', sub: 'vía n8n' },
    { x: 0, y: 250, w: 186, h: 54, title: 'Swagger y Postman', sub: 'pruebas y documentación' },
  ];
  const cy = clients.map((c) => c.y + c.h / 2);

  // Centro: la API con sus capas
  const ax = 250;
  const ay = 50;
  const aw = 400;
  const ah = 280;
  const lx = ax + 32;
  const lw = aw - 48;
  const L = (i) => ay + 48 + i * 56 + 23;
  const layers = [
    ['Presentation', 'Controllers, JWT, Swagger'],
    ['Application', 'MediatR, FluentValidation, DTOs'],
    ['Domain', 'Entidades y reglas de negocio'],
    ['Infrastructure', 'EF Core, repositorios, servicios'],
  ];
  let api = `
  <g class="in" style="animation-delay:.05s">
    <rect x="${ax + 0.5}" y="${ay + 0.5}" width="${aw - 1}" height="${ah - 1}" rx="2" fill="none" stroke="${C.rule2}"/>
    <text x="${ax + 16}" y="${ay + 29}" font-size="14" font-weight="600" fill="${C.ink}">API en ASP.NET Core</text>
    <text x="${ax + aw - 16}" y="${ay + 29}" text-anchor="end" font-size="11.5" fill="${C.muted}">.NET 10 con JWT</text>
  </g>`;
  layers.forEach(([name, sub], i) => {
    const y = ay + 48 + i * 56;
    const core = name === 'Domain';
    api += `
  <g class="in" style="animation-delay:${r2(0.2 + i * 0.07)}s">
    <rect x="${lx + 0.5}" y="${y + 0.5}" width="${lw - 1}" height="45" rx="2" fill="none" stroke="${core ? C.ink : C.rule2}"/>
    ${core ? `<rect x="${lx + 1}" y="${y + 1}" width="10" height="44" fill="url(#p-hatch)"/><path d="M${lx + 11.5} ${y + 1} V${y + 45}" stroke="${C.ink}"/>` : ''}
    <text x="${lx + 24}" y="${y + 20}" font-size="13" font-weight="600" fill="${C.ink}">${name}</text>
    <text x="${lx + 24}" y="${y + 36}" font-size="11.5" fill="${C.muted}">${esc(sub)}</text>
    <text x="${lx + lw - 12}" y="${y + 27}" text-anchor="end" font-size="11" class="mono" fill="${C.faint}">0${i + 1}</text>
  </g>`;
  });

  // Derecha: PostgreSQL (cilindro) e integraciones
  const dbx = 732;
  const dbw = 150;
  const dcx = dbx + dbw / 2;
  const db = `
  <g class="in" style="animation-delay:.3s">
    <ellipse cx="${dcx}" cy="70" rx="${dbw / 2}" ry="12" fill="none" stroke="${C.ink}"/>
    <path d="M${dbx} 70 V152 A${dbw / 2} 12 0 0 0 ${dbx + dbw} 152 V70" fill="none" stroke="${C.ink}"/>
    <text x="${dcx}" y="114" text-anchor="middle" font-size="14" font-weight="600" fill="${C.ink}">PostgreSQL</text>
    <text x="${dcx}" y="132" text-anchor="middle" font-size="11.5" fill="${C.muted}">migraciones EF Core</text>
  </g>`;
  const right = [
    { x: 714, y: 180, w: 186, h: 54, title: 'Agente IA', sub: 'Python y Gemini' },
    { x: 714, y: 262, w: 186, h: 54, title: 'n8n', sub: 'webhooks y flujos' },
  ];

  // Conexiones ortogonales. La persistencia sale del borde derecho de Infrastructure.
  const busL = 218;
  const lane = ax + 16;
  const busR = 674;
  const dbY = 125;
  const infraR = lx + lw;
  const aiY = right[0].y + right[0].h / 2;
  const n8nY = right[1].y + right[1].h / 2;
  const asyncX = 694;
  const wire = (d, delay = 0) => `<path d="${d}" fill="none" stroke="${C.rule2}" pathLength="1" class="draw" style="animation-delay:${delay}s"/>`;
  let wires = '';
  cy.forEach((y, i) => (wires += wire(`M186 ${y} H${busL}`, 0.2 + i * 0.05)));
  wires += wire(`M${busL} ${cy[0]} V${cy[2]}`, 0.3);
  wires += wire(`M${busL} ${L(0)} H${lane}`, 0.35);
  wires += `<path d="M${lane + 0.5} ${L(0)} V${L(3)}" stroke="${C.rule2}" stroke-dasharray="2 3"/>`;
  layers.forEach((_, i) => (wires += `<path d="M${lane} ${L(i) + 0.5} H${lx}" stroke="${C.rule2}"/>`));
  wires += wire(`M${infraR} ${L(3) + 0.5} H${busR}`, 0.45);
  wires += wire(`M${busR + 0.5} ${L(3)} V${dbY}`, 0.55);
  wires += wire(`M${busR} ${dbY + 0.5} H${dbx}`, 0.65);
  // Asíncrono: n8n queda a la altura de Infrastructure; el agente sube por su propio tramo.
  wires += `<path d="M${busR} ${n8nY + 0.5} H${right[1].x}" stroke="${C.rule2}" stroke-dasharray="4 3"/>`;
  wires += `<path d="M${asyncX + 0.5} ${n8nY} V${aiY + 0.5} H${right[0].x}" fill="none" stroke="${C.rule2}" stroke-dasharray="4 3"/>`;
  // Remate en la entrada de cada destino
  const tip = (x, y) => `<path d="M${x - 5} ${y - 3.5} L${x} ${y} L${x - 5} ${y + 3.5} Z" fill="${C.ink}"/>`;
  wires += tip(lx, L(0)) + tip(dbx, dbY) + tip(right[0].x, aiY) + tip(right[1].x, n8nY);

  // La request: recorre cliente, capas y PostgreSQL, se detiene y vuelve a empezar.
  // Dentro de la caja de Infrastructure se oculta, así no tapa su texto.
  const route = `M186 ${cy[0]} H${busL} V${L(0)} H${lane} V${L(3)} H${busR} V${dbY} H${dbx - 6}`;
  const iy = ay + 48 + 3 * 56;
  const packet = `
  <clipPath id="arch-clip"><path clip-rule="evenodd" d="M0 0 H${W} V${H} H0 Z M${lx} ${iy} H${infraR} V${iy + 46} H${lx} Z"/></clipPath>
  <g clip-path="url(#arch-clip)">
    <rect x="-3.5" y="-3.5" width="7" height="7" fill="${C.accent}">
      <animateMotion dur="4.4s" repeatCount="indefinite" path="${route}" keyPoints="0;1;1" keyTimes="0;0.82;1" calcMode="linear"/>
    </rect>
  </g>`;

  // Encabezados de columna, sin reglas
  const heads = [
    [0, 'Clientes'],
    [ax, 'Núcleo, Clean Architecture'],
    [714, 'Datos e integraciones'],
  ]
    .map(([x, t]) => `<text x="${x}" y="20" font-size="12.5" fill="${C.muted}">${t}</text>`)
    .join('');

  const steps = ['request', 'validación', 'caso de uso', 'dominio', 'persistencia'];
  const flow = steps.map((s) => `<tspan fill="${C.muted}">${s}</tspan>`).join(`<tspan fill="${C.faint}"> → </tspan>`);
  const foot = `
  <g class="in" style="animation-delay:.6s">
    <text x="0" y="364" font-size="12">${flow}</text>
    <path d="M0 387.5 H22" stroke="${C.rule2}"/>
    <text x="30" y="391" font-size="11.5" fill="${C.muted}">síncrono</text>
    <path d="M100 387.5 H122" stroke="${C.rule2}" stroke-dasharray="4 3"/>
    <text x="130" y="391" font-size="11.5" fill="${C.muted}">asíncrono</text>
    <rect x="208" y="384" width="7" height="7" fill="${C.accent}"/>
    <text x="223" y="391" font-size="11.5" fill="${C.muted}">request</text>
  </g>
  `;

  return svg({
    w: W,
    h: H,
    title: 'Cómo construyo un backend',
    desc: 'Clientes web, bots y Swagger llaman a una API en ASP.NET Core con autenticación JWT y Clean Architecture (Presentation, Application, Domain, Infrastructure), que persiste en PostgreSQL con EF Core y se integra con un agente de IA en Python y flujos de n8n.',
    body: heads + wires + clients.map(node).join('') + right.map((n, i) => node(n, i + 3)).join('') + db + api + packet + foot,
  });
}
