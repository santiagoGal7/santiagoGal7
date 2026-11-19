// "Ahora mismo": tres tarjetas con estado en vivo y barra de progreso indeterminada.
import { C, svg, esc, panel, chipRow, wrap, textLines } from '../lib/svg.mjs';
import { now as items } from '../data.mjs';
import { ICONS } from './ui.mjs';

export function nowCards() {
  const W = 900;
  const H = 232;
  const gap = 15;
  const cw = (W - gap * 2) / 3;
  const icons = [ICONS.rocket, ICONS.flow, ICONS.spark];

  const css = `
    .pulse { animation: pulse 1.8s ease-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes pulse { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(3); opacity: 0; } }
    .run { animation: run 2.6s cubic-bezier(.45,0,.2,1) infinite; }
    @keyframes run { 0% { transform: translateX(-110px); } 100% { transform: translateX(${Math.round(cw)}px); } }
    .float { animation: float 5s ease-in-out infinite; }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  `;

  let defs = '';
  let body = '';
  items.forEach((it, i) => {
    const x = Math.round(i * (cw + gap));
    const delay = `${i * 0.6}s`;
    defs += `
    <linearGradient id="bar${i}" x1="0" x2="1">
      <stop offset="0" stop-color="${it.color}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${it.color}"/>
      <stop offset="1" stop-color="${it.color}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="track${i}"><rect x="${x + 20}" y="${H - 30}" width="${Math.round(cw - 40)}" height="4" rx="2"/></clipPath>
    <radialGradient id="glow${i}" cx="1" cy="0" r="1">
      <stop offset="0" stop-color="${it.color}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${it.color}" stop-opacity="0"/>
    </radialGradient>`;
    const lines = wrap(it.text, 36);
    body += `
  <g>
    ${panel({ x, y: 0, w: Math.round(cw), h: H })}
    <rect x="${x + 1}" y="1" width="${Math.round(cw) - 2}" height="${H - 2}" rx="17" fill="url(#glow${i})"/>
    <circle cx="${x + 26}" cy="30" r="4" fill="${it.color}"/>
    <circle cx="${x + 26}" cy="30" r="4" fill="${it.color}" class="pulse" style="animation-delay:${delay}"/>
    <text x="${x + 38}" y="34" font-size="10.5" class="mono" fill="${it.color}" letter-spacing="1.8">${esc(it.status)}</text>
    <g class="float" style="animation-delay:${delay}">
      <rect x="${x + Math.round(cw) - 58}" y="16" width="40" height="40" rx="12" fill="${it.color}" fill-opacity="0.12" stroke="${it.color}" stroke-opacity="0.4"/>
      <g transform="translate(${x + Math.round(cw) - 50} 24)" fill="none" stroke="${it.color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[i]}</g>
    </g>
    <text x="${x + 20}" y="84" font-size="22" font-weight="700" fill="${C.text}">${esc(it.title)}</text>
    ${textLines({ x: x + 20, y: 110, lines, size: 13, lh: 1.5 })}
    ${chipRow({ x: x + 20, y: H - 70, labels: it.tags, color: it.color, size: 10.5, h: 22, padX: 9, gap: 6, maxW: cw - 40 })}
    <rect x="${x + 20}" y="${H - 30}" width="${Math.round(cw - 40)}" height="4" rx="2" fill="${C.line}"/>
    <g clip-path="url(#track${i})"><rect x="${x + 20}" y="${H - 30}" width="110" height="4" fill="url(#bar${i})" class="run" style="animation-delay:${delay}"/></g>
  </g>`;
  });

  return svg({
    w: W,
    h: H,
    title: 'Ahora mismo',
    desc: items.map((i) => `${i.title}: ${i.text}`).join(' '),
    defs,
    css,
    body,
  });
}
