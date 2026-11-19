// Diagrama de arquitectura con "paquetes" de datos viajando por las conexiones.
import { C, svg, esc } from '../lib/svg.mjs';
import { ICONS } from './ui.mjs';

export function architecture() {
  const W = 900;
  const H = 420;

  const node = ({ x, y, w, h, title, sub, color, icon }) => `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.panel}" stroke="${color}" stroke-opacity="0.55"/>
    <rect x="${x}" y="${y}" width="4" height="${h}" rx="2" fill="${color}"/>
    ${icon ? `<g transform="translate(${x + 14} ${y + h / 2 - 10}) scale(0.84)" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</g>` : ''}
    <text x="${x + (icon ? 44 : 16)}" y="${y + h / 2 - 3}" font-size="13" font-weight="700" fill="${C.text}">${esc(title)}</text>
    <text x="${x + (icon ? 44 : 16)}" y="${y + h / 2 + 14}" font-size="10.5" class="mono" fill="${C.sub}">${esc(sub)}</text>
  </g>`;

  // Capas de Clean Architecture dentro de la API
  const layers = [
    { t: 'Presentation', s: 'Controllers · JWT · Swagger', c: C.blue },
    { t: 'Application', s: 'MediatR · FluentValidation · DTOs', c: C.cyan },
    { t: 'Domain', s: 'Entidades · Reglas de negocio', c: C.violet },
    { t: 'Infrastructure', s: 'EF Core · Repositorios · Servicios', c: C.pink },
  ];
  const ax = 262;
  const ay = 54;
  const aw = 376;
  const lh = 58;
  let api = `
  <rect x="${ax}" y="${ay}" width="${aw}" height="${4 * lh + 62}" rx="18" fill="${C.bg1}" stroke="url(#g-stroke)" stroke-width="1.5"/>
  <text x="${ax + 20}" y="${ay + 30}" font-size="14" font-weight="700" fill="${C.text}">API · ASP.NET Core <tspan fill="${C.dim}" font-weight="400" class="mono" font-size="11">.NET 10</tspan></text>
  <g transform="translate(${ax + aw - 104} ${ay + 14})">
    <rect width="84" height="24" rx="12" fill="${C.amber}" fill-opacity="0.12" stroke="${C.amber}" stroke-opacity="0.5"/>
    <path d="M14 11v-2.5a3.5 3.5 0 0 1 7 0V11M12.5 11h10v7h-10z" fill="none" stroke="${C.amber}" stroke-width="1.4" stroke-linejoin="round"/>
    <text x="30" y="16.5" font-size="10.5" class="mono" fill="${C.amber}">JWT auth</text>
  </g>`;
  layers.forEach((l, i) => {
    const y = ay + 52 + i * lh;
    api += `
  <g>
    <rect x="${ax + 18}" y="${y}" width="${aw - 36}" height="${lh - 12}" rx="10" fill="${l.c}" fill-opacity="0.08" stroke="${l.c}" stroke-opacity="0.45"/>
    <rect x="${ax + 18}" y="${y}" width="${aw - 36}" height="${lh - 12}" rx="10" fill="none" stroke="${l.c}" stroke-width="1.6" class="hit" style="animation-delay:${0.35 * i}s"/>
    <text x="${ax + 36}" y="${y + 20}" font-size="13" font-weight="700" fill="${l.c}">${l.t}</text>
    <text x="${ax + 36}" y="${y + 36}" font-size="10.5" class="mono" fill="${C.sub}">${esc(l.s)}</text>
    <text x="${ax + aw - 34}" y="${y + 28}" text-anchor="end" font-size="10" class="mono" fill="${C.dim}">0${i + 1}</text>
  </g>`;
    if (i < layers.length - 1) {
      api += `<path d="M${ax + aw / 2} ${y + lh - 12} v12" stroke="${C.dim}" stroke-dasharray="3 3" class="flow"/>`;
    }
  });

  // Nodos externos
  const clients = [
    { x: 24, y: 78, w: 178, h: 56, title: 'Web · React', sub: 'SPA / Next.js', color: C.amber, icon: ICONS.code },
    { x: 24, y: 172, w: 178, h: 56, title: 'Bot · Telegram', sub: 'vía n8n', color: C.green, icon: ICONS.bot },
    { x: 24, y: 266, w: 178, h: 56, title: 'Swagger / Postman', sub: 'pruebas y docs', color: C.blue, icon: ICONS.ticket },
  ];
  const right = [
    { x: 700, y: 214, w: 176, h: 56, title: 'Agente IA', sub: 'Python · Gemini', color: C.pink, icon: ICONS.spark },
    { x: 700, y: 300, w: 176, h: 56, title: 'n8n', sub: 'webhooks · flujos', color: C.green, icon: ICONS.flow },
  ];

  // PostgreSQL como cilindro
  const db = `
  <g>
    <path d="M712 84 v86 c0 9 26 16 76 16 s76-7 76-16 v-86" fill="${C.panel}" stroke="${C.cyan}" stroke-opacity="0.6"/>
    <ellipse cx="788" cy="84" rx="76" ry="16" fill="${C.panel2}" stroke="${C.cyan}" stroke-opacity="0.75"/>
    <path d="M712 118 c0 9 26 16 76 16 s76-7 76-16" fill="none" stroke="${C.cyan}" stroke-opacity="0.3"/>
    <text x="788" y="150" text-anchor="middle" font-size="14" font-weight="700" fill="${C.text}">PostgreSQL</text>
    <text x="788" y="168" text-anchor="middle" font-size="10.5" class="mono" fill="${C.sub}">migraciones EF</text>
    <ellipse cx="788" cy="84" rx="40" ry="7" fill="${C.cyan}" opacity="0.25" class="dbpulse"/>
  </g>`;

  // Rutas de los paquetes
  const L = (i) => ay + 52 + i * lh + 23; // centro vertical de cada capa
  const paths = [
    { id: 'p1', d: `M202 106 C232 106 236 ${L(0)} ${ax + 18} ${L(0)}`, c: C.amber, dur: 2.6, begin: 0 },
    { id: 'p2', d: `M202 200 C232 200 236 ${L(0)} ${ax + 18} ${L(0)}`, c: C.green, dur: 2.6, begin: 0.9 },
    { id: 'p3', d: `M202 294 C236 294 236 ${L(0)} ${ax + 18} ${L(0)}`, c: C.blue, dur: 2.6, begin: 1.7 },
    { id: 'p4', d: `M${ax + aw - 18} ${L(3)} C${ax + aw + 40} ${L(3)} 690 200 730 182`, c: C.cyan, dur: 2.2, begin: 0.4 },
    { id: 'p5', d: `M${ax + aw - 18} ${L(1)} C${ax + aw + 30} ${L(1)} 670 242 700 242`, c: C.pink, dur: 2.4, begin: 1.2 },
    { id: 'p6', d: `M${ax + aw - 18} ${L(3)} C${ax + aw + 30} ${L(3)} 670 328 700 328`, c: C.green, dur: 2.4, begin: 0.2 },
  ];
  let wires = '';
  let packets = '';
  for (const p of paths) {
    wires += `<path id="${p.id}" d="${p.d}" fill="none" stroke="${p.c}" stroke-opacity="0.35" stroke-width="1.5"/>
    <path d="${p.d}" fill="none" stroke="${p.c}" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="4 10" class="flow"/>`;
    for (const k of [0, 1]) {
      packets += `
    <circle r="4" fill="${p.c}" filter="url(#f-glow)">
      <animateMotion dur="${p.dur}s" begin="${p.begin + k * p.dur / 2}s" repeatCount="indefinite" rotate="auto" ${p.id === 'p5' || p.id === 'p6' ? 'keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : ''}>
        <mpath xlink:href="#${p.id}"/>
      </animateMotion>
    </circle>`;
    }
  }

  const css = `
    .flow { animation: flow 1.2s linear infinite; }
    @keyframes flow { to { stroke-dashoffset: -28; } }
    .hit { opacity: 0; animation: hit 2.6s ease-in-out infinite; }
    @keyframes hit { 0%,100% { opacity: 0; } 20% { opacity: 1; } 45% { opacity: 0; } }
    .dbpulse { animation: dbp 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes dbp { 0%,100% { transform: scale(.8); opacity: .15; } 50% { transform: scale(1.4); opacity: .45; } }
  `;

  const labels = `
  <text x="24" y="30" font-size="11" class="mono" fill="${C.dim}">// clientes</text>
  <text x="${ax}" y="30" font-size="11" class="mono" fill="${C.dim}">// núcleo · Clean Architecture</text>
  <text x="700" y="30" font-size="11" class="mono" fill="${C.dim}">// datos e integraciones</text>
  <text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="11.5" class="mono" fill="${C.sub}">request <tspan fill="${C.blue}">→</tspan> validación <tspan fill="${C.cyan}">→</tspan> caso de uso <tspan fill="${C.violet}">→</tspan> dominio <tspan fill="${C.pink}">→</tspan> persistencia</text>
  `;

  return svg({
    w: W,
    h: H,
    title: 'Cómo construyo un backend',
    desc: 'Clientes web, bots y Swagger llaman a una API en ASP.NET Core con autenticación JWT y Clean Architecture (Presentation, Application, Domain, Infrastructure), que persiste en PostgreSQL con EF Core y se integra con un agente de IA en Python y flujos de n8n.',
    css,
    body: labels + wires + clients.map(node).join('') + right.map(node).join('') + db + api + packets,
  });
}
