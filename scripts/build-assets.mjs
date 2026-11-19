// Genera todos los SVG estáticos del perfil en /assets/dark y /assets/light.
// El README elige la variante con <picture> según el tema de GitHub.
// Uso: node scripts/build-assets.mjs
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { THEMES, setTheme } from './lib/svg.mjs';
import { profile, sections } from './data.mjs';
import { hero } from './components/hero.mjs';
import { about } from './components/about.mjs';
import { nowCards } from './components/now.mjs';
import { stack } from './components/stack.mjs';
import { architecture } from './components/architecture.mjs';
import { featuredCard, projectCards } from './components/projects.mjs';
import { timelineSvg } from './components/timeline.mjs';
import { contactCard, footer } from './components/closing.mjs';
import { sectionHeader, button, navPill } from './components/ui.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets');
const written = [];

const NAV = {
  'sobre-mi': 'Sobre mí',
  ahora: 'Ahora',
  stack: 'Stack',
  arquitectura: 'Arquitectura',
  proyectos: 'Proyectos',
  trayectoria: 'Trayectoria',
  metricas: 'Métricas',
  contacto: 'Contacto',
};

const NAV_W = 858; // mismo ancho total que la fila de botones (290 + 290 + 278)

rmSync(out, { recursive: true, force: true });

for (const theme of Object.keys(THEMES)) {
  setTheme(theme);
  const write = (rel, content) => {
    const file = join(out, theme, rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content, 'utf8');
    written.push(relative(root, file).split('\\').join('/'));
  };

  write('hero.svg', hero());
  write('about.svg', about());
  write('now.svg', nowCards());
  write('stack.svg', stack());
  write('architecture.svg', architecture());
  write('timeline.svg', timelineSvg());
  write('contact.svg', contactCard());
  write('footer.svg', footer());

  write('projects/helpdesk.svg', featuredCard());
  for (const { slug, svg } of projectCards()) write(`projects/${slug}.svg`, svg);

  for (const s of sections) write(`headers/${s.n}-${s.id}.svg`, sectionHeader(s));

  // Botones y navegación ocupan el ancho completo: el README les da anchos en % sin espacios entre enlaces.
  write('buttons/github.svg', button({ label: 'GitHub', value: `@${profile.user}`, w: 290, gap: 12 }));
  write('buttons/repos.svg', button({ label: 'Repositorios', value: 'Ver todos', w: 290, gap: 12 }));
  write('buttons/email.svg', button({ label: 'Email', value: profile.email, w: 278 }));

  const natural = sections.map((s) => Math.round(NAV[s.id].length * 7.3 + 34));
  const extra = (NAV_W - natural.reduce((a, b) => a + b, 0)) / sections.length;
  sections.forEach((s, i) =>
    write(`nav/${s.id}.svg`, navPill({ label: NAV[s.id], n: s.n, w: Math.round(natural[i] + extra) }).svg),
  );
}

console.log(`✓ ${written.length} SVG generados (${Object.keys(THEMES).join(' + ')})`);
