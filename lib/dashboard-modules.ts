export const DASHBOARD_MODULES = [
  { slug: 'inicio', name: 'Inicio', href: '/dashboard', icon: 'Home', roles: ['ADMIN', 'USER'] },
  { slug: 'mis-cursos', name: 'Mis Cursos & Workshops', href: '/dashboard/mis-cursos', icon: 'BookOpen', roles: ['USER'] },
  { slug: 'cursos', name: 'Cursos & Workshops', href: '/dashboard/cursos', icon: 'BookOpen', roles: ['ADMIN'] },
  { slug: 'galeria', name: 'Galería & Instagram', href: '/dashboard/galeria', icon: 'Images', roles: ['ADMIN'] },
  { slug: 'usuarios', name: 'Usuarios', href: '/dashboard/usuarios', icon: 'Users', roles: ['ADMIN'] },
  { slug: 'pagos', name: 'Pagos', href: '/dashboard/pagos', icon: 'CreditCard', roles: ['ADMIN'] },
  { slug: 'cupones', name: 'Cupones', href: '/dashboard/cupones', icon: 'Tag', roles: ['ADMIN'] },
  { slug: 'metodos-pago', name: 'Métodos de Pago', href: '/dashboard/metodos-pago', icon: 'Wallet', roles: ['ADMIN'] },
  { slug: 'emails', name: 'Emails', href: '/dashboard/emails', icon: 'Mail', roles: ['ADMIN'] },
  { slug: 'newsletter', name: 'Newsletter', href: '/dashboard/newsletter', icon: 'Mail', roles: ['ADMIN'] },
  { slug: 'logs', name: 'Registro de Eventos', href: '/dashboard/logs', icon: 'Activity', roles: ['ADMIN'] },
  { slug: 'settings', name: 'Configuración', href: '/dashboard/settings', icon: 'Settings', roles: ['ADMIN', 'USER'] },
  { slug: 'modulos', name: 'Módulos del Sistema', href: '/dashboard/modulos', icon: 'Layers', roles: ['ADMIN'] },
  { slug: 'api-config', name: 'Configuración de APIs', href: '/dashboard/api-config', icon: 'Code', roles: ['ADMIN'] },
] as const;

export const EXTRA_MODULE_ROUTES = ['/dashboard/cursos/create'] as const;
export const moduleBySlug = (slug: string) => DASHBOARD_MODULES.find((item) => item.slug === slug);
export const isExistingModuleRoute = (slug: string) => EXTRA_MODULE_ROUTES.includes(`/dashboard/${slug}` as typeof EXTRA_MODULE_ROUTES[number]);
