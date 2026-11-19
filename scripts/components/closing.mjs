// Tarjeta de contacto y footer con ondas animadas.
import { C, svg, esc, r2, rng } from '../lib/svg.mjs';
import { profile } from '../data.mjs';

export function contactCard() {
  const W = 900;
  const H = 200;
  const cx = 770;
  const cy = 100;

  const css = `
    .wave { animation: wave 3s ease-out infinite; transform-box: fill-box; transform-origin: center; opacity: 0; }
    @keyframes wave { 0% { transform: scale(.4); opacity: .9; } 100% { transform: scale(1.9); opacity: 0; } }
    .fly { animation: fly 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes fly { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(6px,-8px) rotate(-4deg); } }
    .caret { animation: caret 1s steps(1) infinite; }
    @keyframes caret { 50% { opacity: 0; } }
  `;
  const defs = `
    <radialGradient id="cg" cx="0.85" cy="0.5" r="0.6">
      <stop offset="0" stop-color="${C.blueDeep}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${C.blueDeep}" stop-opacity="0"/>
    </radialGradient>
  `;
  const body = `
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="22" fill="url(#g-panel)" stroke="url(#g-stroke)"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="21" fill="url(#cg)"/>
  <text x="40" y="62" font-size="12" class="mono" fill="${C.cyan}" letter-spacing="2">¿HABLAMOS?</text>
  <text x="40" y="104" font-size="32" font-weight="800" fill="${C.text}">¿Construimos algo <tspan fill="url(#g-brand)">juntos</tspan>?</text>
  <text x="40" y="138" font-size="15" fill="${C.sub}">Proyectos, colaboraciones o una buena charla sobre backend e IA.</text>
  <text x="40" y="170" font-size="13" class="mono" fill="${C.dim}">$ mail ${esc(profile.email)}<tspan fill="${C.cyan}" class="caret"> ▍</tspan></text>
  ${[0, 1, 2].map((i) => `<circle cx="${cx}" cy="${cy}" r="56" fill="none" stroke="${C.blue}" stroke-width="1.5" class="wave" style="animation-delay:${i}s"/>`).join('')}
  <circle cx="${cx}" cy="${cy}" r="40" fill="${C.bg0}" stroke="url(#g-brand)" stroke-width="2"/>
  <g class="fly">
    <path d="M${cx - 18} ${cy + 1} L${cx + 19} ${cy - 15} L${cx + 7} ${cy + 18} L${cx - 1} ${cy + 6} Z" fill="${C.blue}" fill-opacity="0.2" stroke="${C.cyan}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M${cx - 1} ${cy + 6} L${cx + 19} ${cy - 15}" stroke="${C.cyan}" stroke-width="2" stroke-linecap="round"/>
  </g>
  `;
  return svg({
    w: W,
    h: H,
    title: '¿Construimos algo juntos?',
    desc: `Escríbeme a ${profile.email} o por GitHub (@${profile.user}).`,
    defs,
    css,
    body,
  });
}

export function footer() {
  const W = 900;
  const H = 150;
  const rand = rng(11);

  // Ondas: interpolación SMIL entre dos formas
  const wave = (amp, off, y) => {
    const pts = [];
    for (let x = 0; x <= W; x += 75) pts.push([x, y + Math.sin(x / 120 + off) * amp]);
    let d = `M0 ${H} L0 ${r2(pts[0][1])}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1];
      const [qx, qy] = pts[i];
      d += ` C${r2(px + 37.5)} ${r2(py)} ${r2(qx - 37.5)} ${r2(qy)} ${qx} ${r2(qy)}`;
    }
    return d + ` L${W} ${H} Z`;
  };
  const layers = [
    { y: 70, amp: 10, c: C.purple, o: 0.25, dur: 9 },
    { y: 86, amp: 12, c: C.blueDeep, o: 0.35, dur: 7 },
    { y: 102, amp: 8, c: C.cyan, o: 0.25, dur: 6 },
  ];
  let waves = '';
  layers.forEach((l) => {
    const a = wave(l.amp, 0, l.y);
    const b = wave(l.amp, Math.PI, l.y);
    waves += `<path d="${a}" fill="${l.c}" fill-opacity="${l.o}">
      <animate attributeName="d" dur="${l.dur}s" repeatCount="indefinite" values="${a};${b};${a}" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </path>`;
  });

  let sparks = '';
  for (let i = 0; i < 18; i++) {
    const x = r2(rand() * W);
    const d = r2(rand() * 6);
    const dur = r2(4 + rand() * 4);
    sparks += `<circle cx="${x}" cy="${H - 10}" r="${r2(0.8 + rand() * 1.4)}" fill="#fff" class="up" style="animation-delay:-${d}s;animation-duration:${dur}s"/>`;
  }

  const css = `
    .up { animation: up 6s linear infinite; opacity: 0; }
    @keyframes up { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: .8; } 100% { transform: translateY(-120px); opacity: 0; } }
  `;
  const defs = `<clipPath id="fc"><rect width="${W}" height="${H}" rx="0"/></clipPath>`;
  const body = `
  <g clip-path="url(#fc)">
    ${waves}
    ${sparks}
  </g>
  <text x="${W / 2}" y="34" text-anchor="middle" font-size="13" class="mono" fill="#7D8BA6">Gracias por pasar <tspan fill="${C.pink}">♥</tspan> hecho con café, .NET y SVG</text>
  <text x="${W / 2}" y="${H - 18}" text-anchor="middle" font-size="11" class="mono" fill="#FFFFFF" fill-opacity="0.75">Santiago Gallo · Colombia · métricas actualizadas a diario con GitHub Actions</text>
  `;
  return svg({ w: W, h: H, title: 'Gracias por pasar', defs, css, body });
}
