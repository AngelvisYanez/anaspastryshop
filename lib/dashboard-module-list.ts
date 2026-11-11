import { DASHBOARD_MODULES, isExistingModuleRoute } from './dashboard-modules';

export type ModuleRecord = { id: string; name: string; slug: string; icon: string; order: number; isActive: boolean; roles: string[] };

export function listDashboardModules(records: ModuleRecord[]): ModuleRecord[] {
  const builtIns = DASHBOARD_MODULES.map((item, index) => {
    const saved = records.find((record) => record.slug === item.slug);
    return {
      id: saved?.id ?? `builtin:${item.slug}`,
      name: item.name,
      slug: item.slug,
      icon: item.icon,
      order: saved?.order ?? (index + 1) * 10,
      isActive: saved?.isActive ?? true,
      roles: [...item.roles],
    };
  });
  const custom = records
    .filter((record) => !DASHBOARD_MODULES.some((item) => item.slug === record.slug) && isExistingModuleRoute(record.slug))
    .map((record) => ({ ...record, roles: ['ADMIN'] }));
  return [...builtIns, ...custom].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function moduleHref(slug: string) {
  return DASHBOARD_MODULES.find((item) => item.slug === slug)?.href ?? `/dashboard/${slug}`;
}
