// Genera todos los SVG estáticos del perfil en /assets.
// Uso: node scripts/build-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { C } from './lib/svg.mjs';
import { profile, sections } from './data.mjs';
import { hero } from './components/hero.mjs';
import { about } from './components/about.mjs';
import { nowCards } from './components/now.mjs';
import { stack } from './components/stack.mjs';
import { architecture } from './components/architecture.mjs';
import { featuredCard, projectCards } from './components/projects.mjs';
import { timelineSvg } from './components/timeline.mjs';
import { contactCard, footer } from './components/closing.mjs';
import { sectionHeader, button, navPill, ICONS } from './components/ui.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets');
const written = [];

function write(rel, content) {
  const file = join(out, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
  written.push(relative(root, file).replaceAll('\\', '/'));
}

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

write('buttons/github.svg', button({ label: 'GitHub', value: `@${profile.user}`, icon: ICONS.code, color: C.blue, w: 250 }));
write('buttons/repos.svg', button({ label: 'Repositorios', value: 'Ver todos', icon: ICONS.rocket, color: C.violet, w: 250 }));
write('buttons/email.svg', button({ label: 'Email', value: profile.email, icon: ICONS.mail, color: C.cyan, w: 316 }));

const NAV = {
  'sobre-mi': ['Sobre mí', C.blue],
  ahora: ['Ahora', C.green],
  stack: ['Stack', C.cyan],
  arquitectura: ['Arquitectura', C.violet],
  proyectos: ['Proyectos', C.amber],
  trayectoria: ['Trayectoria', C.pink],
  metricas: ['Métricas', C.blue],
  contacto: ['Contacto', C.green],
};
for (const s of sections) {
  const [label, color] = NAV[s.id];
  write(`nav/${s.id}.svg`, navPill({ label, color }).svg);
}

console.log(`✓ ${written.length} SVG generados`);
for (const f of written) console.log('  ' + f);
