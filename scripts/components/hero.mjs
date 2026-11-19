// Portada: nombre y comando a la izquierda; a la derecha, la sección de una API
// en Clean Architecture dibujada como plano, con una request que la atraviesa.
import { C, svg, esc, typewriter, BLINK_CSS, cota, cross, titleBlock } from '../lib/svg.mjs';
import { profile } from '../data.mjs';

const LAYERS = [
  ['Presentation', 'Controllers, Swagger'],
  ['Application', 'MediatR, validación'],
  ['Domain', 'Entidades, reglas'],
  ['Infrastructure', 'EF Core, PostgreSQL'],
];

export function hero() {
  const W = 900;
  const H = 312;

  // Plano de la derecha
  const sx = 584;
  const sw = 300;
  const top = 66;
  const lh = 34;
  const gap = 8;
  const bottom = top + LAYERS.length * (lh + gap) - gap;
  const px = sx + sw - 26; // carril por donde baja la request

  let slabs = '';
  LAYERS.forEach(([name, hint], i) => {
    const y = top + i * (lh + gap);
    const core = name === 'Domain';
    slabs += `
    <g class="in" style="animation-delay:${0.25 + i * 0.07}s">
      <rect x="${sx + 0.5}" y="${y + 0.5}" width="${sw - 1}" height="${lh - 1}" rx="2" fill="none" stroke="${core ? C.ink : C.rule2}"/>
      ${core ? `<rect x="${sx + 1}" y="${y + 1}" width="9" height="${lh - 2}" fill="url(#p-hatch)"/><path d="M${sx + 10.5} ${y + 1} V${y + lh - 1}" stroke="${C.ink}"/>` : ''}
      <text x="${sx + 20}" y="${y + 21.5}" font-size="11.5" font-weight="600" class="mono" fill="${C.ink}">${esc(name)}</text>
      <text x="${sx + 128}" y="${y + 21.5}" font-size="11.5" fill="${C.muted}">${esc(hint)}</text>
    </g>`;
  });

  const tw = typewriter({
    id: 'hero-tw',
    x: 22,
    y: 190,
    size: 15,
    cycle: 20,
    phrases: [
      { text: 'dotnet new webapi -n Nodux' },
      { text: 'python agent.py --model gemini' },
      { text: 'n8n execute --workflow agenda-bot' },
      { text: 'git commit -m "ship it"' },
    ],
  });

  const css = `
    ${BLINK_CSS}
    .req { animation: req 3.6s linear infinite; }
    @keyframes req {
      0% { transform: translateY(0); opacity: 0; }
      6% { opacity: 1; }
      62% { transform: translateY(${bottom - top - 4}px); opacity: 1; }
      68%, 100% { transform: translateY(${bottom - top - 4}px); opacity: 0; }
    }
  `;

  const body = `
  <text x="-2" y="88" font-size="56" font-weight="700" letter-spacing="-1.6" fill="${C.ink}" class="in" style="animation-delay:.06s">${esc(profile.name)}</text>
  <text x="0" y="126" font-size="18" fill="${C.muted}" class="in" style="animation-delay:.12s">${esc(profile.tagline)}</text>

  <g class="in" style="animation-delay:.18s">
    <text x="0" y="190" font-size="15" class="mono" fill="${C.accent}">$</text>
    ${tw.body}
    <path d="M0 206.5 H470" stroke="${C.rule2}"/>
  </g>

  <text x="0" y="240" font-size="14" class="in" fill="${C.muted}" style="animation-delay:.24s">${esc(profile.role)}. Trabajo con .NET, C#, Python, PostgreSQL, n8n e IA.</text>

  <!-- Plano: sección de la API -->
  ${cross(sx - 12, top - 30)}${cross(sx + sw + 8, top - 30)}${cross(sx - 12, bottom + 16)}${cross(sx + sw + 8, bottom + 16)}
  <text x="${sx}" y="${top - 22}" font-size="11.5" fill="${C.muted}">Sección de la API en ASP.NET Core, .NET 10</text>
  ${cota({ x1: sx, x2: sx + sw, y: top - 12, draw: true, delay: 0.2 })}
  ${slabs}
  <path d="M${px + 0.5} ${top + 4} V${bottom - 4}" stroke="${C.rule2}" stroke-dasharray="2 3"/>
  <rect x="${px - 3}" y="${top + 2}" width="7" height="7" fill="${C.accent}" class="req"/>
  ${titleBlock({ x2: W, y: H - 40, base: 0, cells: [['autor', `@${profile.user}`], ['lugar', profile.location], ['hoja', '00 de 08']] })}
  `;

  return svg({
    w: W,
    h: H,
    title: `${profile.name} — ${profile.role} en ${profile.location}`,
    desc: `${profile.tagline} Stack: .NET, Python, JavaScript, PostgreSQL y agentes de IA.`,
    defs: tw.defs,
    css,
    body,
  });
}
