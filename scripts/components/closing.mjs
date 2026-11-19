// Contacto como última hoja del plano y un footer de una línea.
import { C, svg, esc, BLINK_CSS, MONO_RATIO, titleBlock } from '../lib/svg.mjs';
import { profile } from '../data.mjs';

export function contactCard() {
  const W = 900;
  const H = 210;
  const size = 15;
  const mail = `mail ${profile.email}`;
  const cx = 22 + mail.length * size * MONO_RATIO + 3;

  const body = `
  <g class="in">
    <text x="-2" y="44" font-size="36" font-weight="700" letter-spacing="-0.9" fill="${C.ink}">¿Construimos algo juntos?</text>
    <text x="0" y="78" font-size="15.5" fill="${C.muted}">Proyectos, colaboraciones o una buena charla sobre backend e IA.</text>
  </g>
  <g class="in" style="animation-delay:.12s">
    <text x="0" y="128" font-size="${size}" class="mono"><tspan fill="${C.accent}">$</tspan><tspan x="22" fill="${C.ink}">${esc(mail)}</tspan></text>
    <rect x="${cx}" y="115" width="8" height="17" fill="${C.accent}" class="blink"/>
    <path d="M0 144.5 H470" stroke="${C.rule2}"/>
  </g>
  ${titleBlock({ x2: W, y: H - 40, base: 0, cells: [['autor', profile.name], ['lugar', profile.location], ['hoja', '08 de 08']] })}
  `;
  return svg({
    w: W,
    h: H,
    title: '¿Construimos algo juntos?',
    desc: `Escríbeme a ${profile.email} o por GitHub (@${profile.user}).`,
    css: BLINK_CSS,
    body,
  });
}

export function footer() {
  const W = 900;
  const H = 64;
  const body = `
  <path d="M0 16.5 H${W}" stroke="${C.rule}" pathLength="1" class="draw"/>
  <text x="0" y="46" font-size="13" fill="${C.ink}">Gracias por pasar.</text>
  <text x="${W}" y="46" text-anchor="end" font-size="12" fill="${C.muted}">${esc(profile.name)}, ${esc(profile.location)}. Métricas actualizadas a diario con GitHub Actions.</text>
  `;
  return svg({ w: W, h: H, title: 'Gracias por pasar', body });
}
