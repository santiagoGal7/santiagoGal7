// Contenido del perfil. Editar aquí y ejecutar `node scripts/build-assets.mjs`.
import { C } from './lib/svg.mjs';

export const profile = {
  name: 'Santiago Gallo',
  user: 'santiagoGal7',
  role: 'Backend Developer',
  location: 'Colombia',
  email: 'santiagogal7i@gmail.com',
  tagline: 'Construyo APIs y backends que resuelven problemas reales.',
};

// Familias de la "tabla periódica" del stack.
export const families = {
  backend: { label: 'Backend', color: C.violet },
  quality: { label: 'Calidad y seguridad', color: C.blue },
  data: { label: 'Datos', color: C.cyan },
  frontend: { label: 'Frontend', color: C.amber },
  ai: { label: 'IA y automatización', color: C.pink },
  devops: { label: 'DevOps y herramientas', color: C.green },
};

// core: elementos principales del día a día (se marcan con brillo extra).
// Fila 1 solo usa las columnas 1 y 10; el hueco central es la cabecera.
export const elements = [
  // fila 1
  { sym: 'C#', name: 'C#', fam: 'backend', core: true },
  { sym: 'Pg', name: 'PostgreSQL', fam: 'data', core: true },
  // fila 2
  { sym: '.N', name: '.NET 10', fam: 'backend', core: true },
  { sym: 'As', name: 'ASP.NET Core', fam: 'backend', core: true },
  { sym: 'Ef', name: 'EF Core', fam: 'backend' },
  { sym: 'Md', name: 'MediatR', fam: 'backend' },
  { sym: 'Fv', name: 'FluentValidation', fam: 'backend' },
  { sym: 'Ca', name: 'Clean Arch.', fam: 'backend' },
  { sym: 'Jw', name: 'JWT', fam: 'quality' },
  { sym: 'Sw', name: 'Swagger', fam: 'quality' },
  { sym: 'Xu', name: 'xUnit', fam: 'quality' },
  { sym: 'Sb', name: 'Supabase', fam: 'data' },
  // fila 3
  { sym: 'Py', name: 'Python', fam: 'backend', core: true },
  { sym: 'Js', name: 'JavaScript', fam: 'frontend', core: true },
  { sym: 'Ts', name: 'TypeScript', fam: 'frontend' },
  { sym: 'Re', name: 'React', fam: 'frontend' },
  { sym: 'Nx', name: 'Next.js', fam: 'frontend' },
  { sym: 'Vi', name: 'Vite', fam: 'frontend' },
  { sym: 'Tw', name: 'Tailwind', fam: 'frontend' },
  { sym: 'Ht', name: 'HTML', fam: 'frontend' },
  { sym: 'Cs', name: 'CSS', fam: 'frontend' },
  { sym: 'Gs', name: 'Google Sheets', fam: 'data' },
  // fila 4
  { sym: 'N8', name: 'n8n', fam: 'ai', core: true },
  { sym: 'Ol', name: 'Ollama', fam: 'ai' },
  { sym: 'Gm', name: 'Gemini', fam: 'ai' },
  { sym: 'St', name: 'Streamlit', fam: 'ai' },
  { sym: 'Tg', name: 'Telegram Bots', fam: 'ai' },
  { sym: 'Nd', name: 'Node.js', fam: 'devops' },
  { sym: 'Dk', name: 'Docker', fam: 'devops' },
  { sym: 'Gt', name: 'Git', fam: 'devops' },
  { sym: 'Gh', name: 'GitHub Actions', fam: 'devops' },
  { sym: 'Nf', name: 'Netlify', fam: 'devops' },
];

export const now = [
  {
    title: 'Nodux',
    status: 'LIDERANDO',
    text: 'Lidero el backend de un sistema de gestión con APIs en .NET y PostgreSQL.',
    tags: ['.NET', 'PostgreSQL', 'APIs'],
    color: C.violet,
  },
  {
    title: 'CampusRooms',
    status: 'EN CURSO',
    text: 'Backend en .NET con Clean Architecture, asistente de IA en Python y frontend.',
    tags: ['Clean Arch', 'Python', 'IA'],
    color: C.cyan,
  },
  {
    title: 'Automatización',
    status: 'EXPERIMENTANDO',
    text: 'Flujos de automatización con n8n y prototipos de agentes de IA.',
    tags: ['n8n', 'Agentes', 'LLMs'],
    color: C.pink,
  },
];

// Colores oficiales de GitHub Linguist para las barras de lenguaje.
export const LANG_COLORS = {
  'C#': '#178600',
  Python: '#3572A5',
  JavaScript: '#F1E05A',
  TypeScript: '#3178C6',
  CSS: '#663399',
  HTML: '#E34C26',
  JSON: '#8B949E',
};

export const featured = {
  slug: 'helpdesk',
  title: 'HelpDesk Backend',
  repo: 'help-desk-back',
  text: 'API REST para mesa de ayuda: tickets, usuarios, roles, asignaciones, alertas y reportes. Autenticación JWT con refresh tokens y pruebas unitarias y de integración.',
  tags: ['.NET 10', 'ASP.NET Core', 'EF Core', 'PostgreSQL', 'MediatR', 'FluentValidation', 'xUnit'],
  endpoints: [
    ['POST', '/api/auth/login'],
    ['POST', '/api/auth/refresh'],
    ['GET', '/api/agent/tickets'],
    ['PATCH', '/api/agent/tickets/{id}/status'],
    ['POST', '/api/agent/tickets/{id}/comments'],
    ['POST', '/api/admin/reports/tickets'],
    ['PATCH', '/api/admin/users/{id}/account-status'],
  ],
};

export const projects = [
  {
    slug: 'cv-agent',
    title: 'Evaluador de hojas de vida',
    repo: 'analizador_cv_agent',
    icon: 'scan',
    color: C.pink,
    text: 'Analiza un CV en PDF frente a una vacante y estima la afinidad. Corre en local con Ollama o en la nube con Google Gemini.',
    tags: ['Python', 'Streamlit', 'Ollama', 'Gemini'],
    langs: [['Python', 100]],
  },
  {
    slug: 'autotaller',
    title: 'AutoTallerManager',
    repo: 'Examen.NET_SantiagoGallo',
    icon: 'wrench',
    color: C.violet,
    text: 'Backend para un taller mecánico: clientes, vehículos, órdenes de servicio, stock, facturas y login con JWT.',
    tags: ['.NET 10', 'EF Core', 'PostgreSQL', 'JWT'],
    langs: [['C#', 90.8], ['JavaScript', 7.4], ['CSS', 1.8]],
  },
  {
    slug: 'agendabot',
    title: 'AgendaBot',
    repo: 'Proyecto_IA_Nivel1_Santiago_Gallo--Kevin_Pico',
    icon: 'bot',
    color: C.green,
    text: 'Bot de Telegram para citas, tareas, hábitos y reportes. Orquestado con n8n y con Google Sheets como base de datos. Con Kevin Pico.',
    tags: ['n8n', 'Telegram', 'Google Sheets'],
    langs: [['JSON', 100]],
    langNote: 'workflow n8n',
  },
  {
    slug: 'hotel',
    title: 'Hotel El Rincón del Carmen',
    repo: 'HotelRincondelCarmen',
    icon: 'bed',
    color: C.amber,
    demo: 'https://dashing-lamington-b8a2d6.netlify.app/',
    text: 'Web para explorar el hotel y gestionar reservas, con animaciones y formularios validados.',
    tags: ['React 19', 'TypeScript', 'Tailwind', 'GSAP'],
    langs: [['TypeScript', 93.4], ['CSS', 5.4], ['HTML', 1.2]],
  },
];

export const timeline = [
  { date: 'MAY 2025', title: 'Hola, GitHub', sub: 'Abro mi cuenta' },
  { date: 'JUL 2025', title: 'Gestor de Contenido', sub: 'Python · consola' },
  { date: 'SEP 2025', title: 'LuxTime', sub: 'Tienda de relojes' },
  { date: 'OCT 2025', title: 'Hotel y Compañías', sub: 'JS · Web Components' },
  { date: 'ENE 2026', title: 'AgendaBot', sub: 'n8n · Telegram' },
  { date: 'JUN 2026', title: 'AutoTaller + CV IA', sub: '.NET 10 · Gemini' },
  { date: 'AGO 2026', title: 'HelpDesk', sub: 'Clean Architecture' },
  { date: 'NOV 2026', title: 'Nodux y CampusRooms', sub: 'Liderando backend', now: true },
];

export const sections = [
  { id: 'sobre-mi', n: '01', title: 'Sobre mí', tag: 'whoami' },
  { id: 'ahora', n: '02', title: 'Ahora mismo', tag: 'status --live' },
  { id: 'stack', n: '03', title: 'Stack', tag: 'periodic --table' },
  { id: 'arquitectura', n: '04', title: 'Cómo construyo un backend', tag: 'architecture' },
  { id: 'proyectos', n: '05', title: 'Proyectos destacados', tag: 'ls ./projects' },
  { id: 'trayectoria', n: '06', title: 'Trayectoria', tag: 'git log --graph' },
  { id: 'metricas', n: '07', title: 'Métricas en vivo', tag: 'gh api graphql' },
  { id: 'contacto', n: '08', title: 'Contacto', tag: 'ping santiago' },
];
