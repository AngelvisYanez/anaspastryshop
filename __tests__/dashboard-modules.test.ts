import { describe, expect, it } from 'vitest';
import { DASHBOARD_MODULES } from '@/lib/dashboard-modules';
import { listDashboardModules, moduleHref } from '@/lib/dashboard-module-list';

describe('dashboard modules', () => {
  it('lists every built-in page without database records', () => {
    const modules = listDashboardModules([]);
    expect(modules).toHaveLength(DASHBOARD_MODULES.length);
    expect(modules.map((item) => item.slug)).toContain('newsletter');
    expect(moduleHref('inicio')).toBe('/dashboard');
  });

  it('applies saved order and visibility while preserving built-in roles', () => {
    const modules = listDashboardModules([{ id: 'saved', slug: 'pagos', name: 'Changed', icon: 'Home', order: 1, isActive: false, roles: ['USER'] }]);
    expect(modules[0]).toMatchObject({ slug: 'pagos', order: 1, isActive: false, roles: ['ADMIN'] });
  });

  it('omits custom links without a registered page', () => {
    const modules = listDashboardModules([{ id: 'saved', slug: 'missing', name: 'Missing', icon: 'Home', order: 1, isActive: true, roles: ['ADMIN'] }]);
    expect(modules.some((item) => item.slug === 'missing')).toBe(false);
  });
});
