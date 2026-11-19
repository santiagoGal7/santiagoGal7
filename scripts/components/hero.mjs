import { C, svg, esc, r2, rng, typewriter, BLINK_CSS } from '../lib/svg.mjs';
import { profile } from '../data.mjs';

export function hero() {
  const W = 900;
  const H = 340;
  const cx = 735;
  const cy = 170;
  const rand = rng(42);

  // Estrellas que titilan
  let stars = '';
  for (let i = 0; i < 46; i++) {
    const x = r2(rand() * W);
    const y = r2(rand() * H);
    const r = r2(0.4 + rand() * 1.1);
    const d = r2(rand() * 6);
    const dur = r2(2.5 + rand() * 4);
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" class="star" style="animation-duration:${dur}s;animation-delay:-${d}s"/>`;
  }

  // Rejilla de puntos de fondo
  let dots = '';
  for (let x = 20; x < W; x += 24) for (let y = 20; y < H; y += 24) dots += `M${x} ${y}h.01`;

  // Etiquetas orbitando el emblema (se mantienen derechas con contra-rotación)
  const orbit = ['.NET', 'C#', 'Python', 'SQL', 'n8n', 'IA'];
  const R = 118;
  let labels = '';
  orbit.forEach((label, i) => {
    const a = (i / orbit.length) * Math.PI * 2 - Math.PI / 2;
    const lx = r2(cx + Math.cos(a) * R);
    const ly = r2(cy + Math.sin(a) * R);
    const w = label.length * 8 + 20;
    labels += `
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 ${lx} ${ly}" to="-360 ${lx} ${ly}" dur="48s" repeatCount="indefinite"/>
        <rect x="${r2(lx - w / 2)}" y="${ly - 12}" width="${w}" height="24" rx="12" fill="${C.bg1}" stroke="${C.blue}" stroke-opacity="0.55"/>
        <text x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="12" class="mono" fill="${C.text}">${esc(label)}</text>
      </g>`;
  });

  const tw = typewriter({
    id: 'hero-tw',
    x: 82,
    y: 246,
    size: 16,
    cycle: 20,
    phrases: [
      { text: 'dotnet new webapi -n Nodux', fill: C.text },
      { text: 'python agent.py --model gemini', fill: C.text },
      { text: 'n8n execute --workflow agenda-bot', fill: C.text },
      { text: 'git commit -m "ship it"', fill: C.text },
    ],
  });

  const css = `
    ${BLINK_CSS}
    .star { animation: twinkle 4s ease-in-out infinite; }
    @keyframes twinkle { 0%,100% { opacity: .15; } 50% { opacity: .9; } }
    .blob { animation: drift 18s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
    .b2 { animation-duration: 22s; animation-delay: -6s; }
    .b3 { animation-duration: 26s; animation-delay: -12s; }
    @keyframes drift {
      0% { transform: translate(0,0) scale(1); }
      50% { transform: translate(60px,25px) scale(1.15); }
      100% { transform: translate(-40px,-20px) scale(.92); }
    }
    .pulse { animation: pulse 2s ease-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes pulse { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(3.2); opacity: 0; } }
    .rise { animation: rise .9s cubic-bezier(.2,.8,.2,1) both; }
    .d1 { animation-delay: .15s; } .d2 { animation-delay: .35s; } .d3 { animation-delay: .55s; } .d4 { animation-delay: .75s; }
    @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    .scan { animation: scan 6s ease-in-out infinite; }
    @keyframes scan { 0% { transform: translateX(-320px); } 100% { transform: translateX(${W + 40}px); } }
    .core { animation: breathe 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes breathe { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
  `;

  const defs = `
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="26"/></clipPath>
    <filter id="blur-xl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="46"/></filter>
    <radialGradient id="dot-fade" cx="0.3" cy="0.45" r="0.8">
      <stop offset="0" stop-color="#fff" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="dot-mask"><rect width="${W}" height="${H}" fill="url(#dot-fade)"/></mask>
    <linearGradient id="name-g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="520" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.35" stop-color="${C.blue}"/>
      <stop offset="0.7" stop-color="${C.violet}"/>
      <stop offset="1" stop-color="#FFFFFF"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="1040 0" dur="9s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="scan-g" x1="0" x2="1">
      <stop offset="0" stop-color="${C.cyan}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${C.cyan}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="arc-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.cyan}"/>
      <stop offset="1" stop-color="${C.violet}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="core-g">
      <stop offset="0" stop-color="${C.blueDeep}" stop-opacity="0.65"/>
      <stop offset="1" stop-color="${C.blueDeep}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="term-g" x1="0" x2="1">
      <stop offset="0" stop-color="${C.panel2}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${C.panel2}" stop-opacity="0.35"/>
    </linearGradient>
    ${tw.defs}
  `;

  const body = `
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#g-bg)"/>
    <g filter="url(#blur-xl)">
      <circle class="blob" cx="140" cy="70" r="130" fill="${C.blueDeep}" opacity="0.55"/>
      <circle class="blob b2" cx="760" cy="90" r="150" fill="${C.purple}" opacity="0.38"/>
      <circle class="blob b3" cx="470" cy="330" r="140" fill="${C.cyan}" opacity="0.22"/>
    </g>
    <path d="${dots}" stroke="${C.blue}" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round" mask="url(#dot-mask)"/>
    ${stars}

    <!-- Emblema -->
    <circle cx="${cx}" cy="${cy}" r="96" fill="url(#core-g)" class="core"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${C.blue}" stroke-opacity="0.25" stroke-dasharray="2 7">
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="90s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${cx}" cy="${cy}" r="84" fill="none" stroke="${C.line}" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="84" fill="none" stroke="url(#arc-g)" stroke-width="3" stroke-linecap="round" stroke-dasharray="130 400">
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${cx}" cy="${cy}" r="64" fill="none" stroke="${C.violet}" stroke-opacity="0.5" stroke-dasharray="60 20 10 20">
      <animateTransform attributeName="transform" type="rotate" from="360 ${cx} ${cy}" to="0 ${cx} ${cy}" dur="14s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${cx}" cy="${cy}" r="50" fill="${C.bg0}" stroke="url(#g-brand)" stroke-width="2"/>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="40" font-weight="800" fill="url(#g-brand)" class="mono" letter-spacing="-2">SG</text>
    <g>
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="48s" repeatCount="indefinite"/>
      ${labels}
    </g>

    <!-- Texto -->
    <g class="rise">
      <rect x="56" y="54" width="240" height="28" rx="14" fill="${C.green}" fill-opacity="0.1" stroke="${C.green}" stroke-opacity="0.45"/>
      <circle cx="74" cy="68" r="4" fill="${C.green}"/>
      <circle cx="74" cy="68" r="4" fill="${C.green}" class="pulse"/>
      <text x="88" y="72.5" font-size="12" class="mono" fill="${C.green}" letter-spacing="1.5">${esc(profile.role.toUpperCase())} · CO</text>
    </g>
    <text x="54" y="146" font-size="60" font-weight="800" fill="url(#name-g)" letter-spacing="-1.5" class="rise d1">${esc(profile.name)}</text>
    <text x="56" y="186" font-size="18" fill="${C.sub}" class="rise d2">${esc(profile.tagline)}</text>

    <g class="rise d3">
      <rect x="56" y="218" width="470" height="42" rx="12" fill="url(#term-g)" stroke="${C.line}"/>
      <text x="68" y="246" font-size="16" class="mono" fill="${C.green}">$</text>
      ${tw.body}
    </g>

    <g class="rise d4">
      <text x="56" y="294" font-size="12.5" fill="${C.dim}" class="mono">
        <tspan fill="${C.violet}">.NET</tspan> · <tspan fill="${C.cyan}">Python</tspan> · <tspan fill="${C.amber}">JavaScript</tspan> · <tspan fill="${C.blue}">PostgreSQL</tspan> · <tspan fill="${C.pink}">Agentes de IA</tspan>
      </text>
    </g>

    <!-- Barrido de luz inferior -->
    <rect x="0" y="${H - 2}" width="${W}" height="2" fill="${C.line}"/>
    <rect x="0" y="${H - 2}" width="300" height="2" fill="url(#scan-g)" class="scan"/>
  </g>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="26" fill="none" stroke="url(#g-stroke)"/>
  `;

  return svg({
    w: W,
    h: H,
    title: `${profile.name} — ${profile.role} en ${profile.location}`,
    desc: `${profile.tagline} Stack: .NET, Python, JavaScript, PostgreSQL y agentes de IA.`,
    defs,
    css,
    body,
  });
}
