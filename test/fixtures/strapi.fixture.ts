/**
 * Strapi API response fixtures for e2e tests.
 * These match the raw format returned by the Strapi API (before mapping).
 */

export const strapiModuleItems = [
  {
    documentId: 'mod-doc-1',
    locale: 'es',
    config: {
      uid: 'uid-1',
      moduleName: 'portfolio',
      title: { title: 'Portfolio', show: true },
      moduleId: 'mod-1',
      description: 'Portfolio module',
      country: ['CO', 'PY'],
      actions: [{ type: 'navigate', target: '/portfolio' }],
      form_objects: [],
      formatting: null,
      dataObjects: { backend: null, frontend: null },
    },
  },
  {
    documentId: 'mod-doc-2',
    locale: 'es',
    config: {
      uid: 'uid-2',
      moduleName: 'transfers',
      title: { title: 'Transfers', show: true },
      moduleId: 'mod-2',
      description: 'Transfers module',
      country: ['CO', 'BO'],
      actions: [],
      form_objects: [],
      formatting: null,
      dataObjects: { backend: null, frontend: null },
    },
  },
];

export const strapiTabsMenuItems = [
  {
    id: 1,
    label: 'Home',
    enabled: true,
    icon: 'home',
    route: '/home',
    menuId: 'main-menu',
    menuName: 'Main',
    menuType: 'bottom',
    country: 'CO',
    description: 'Home tab',
    fontSize: '14',
    locale: 'es',
  },
  {
    id: 2,
    label: 'Profile',
    enabled: true,
    icon: 'person',
    route: '/profile',
    menuId: 'main-menu',
    menuName: 'Main',
    menuType: 'bottom',
    country: 'PY',
    description: 'Profile tab',
    fontSize: '14',
    locale: 'es',
  },
  {
    id: 3,
    label: 'Settings',
    enabled: true,
    icon: 'settings',
    route: '/settings',
    menuId: 'settings-menu',
    menuName: 'Settings',
    menuType: 'side',
    country: 'CO',
    locale: 'es',
  },
];

export const strapiAboutMeMenuItems = [
  {
    id: 1,
    enable: true,
    order: 1,
    menuName: 'About',
    menuType: 'info',
    country: 'CO',
    maintenance_mode: false,
    title: 'About Me',
    description: 'User info section',
    locale: 'es',
  },
  {
    id: 2,
    enable: true,
    order: 2,
    menuName: 'Contact',
    menuType: 'contact',
    country: 'PY',
    maintenance_mode: false,
    title: 'Contact Info',
    description: 'Contact details',
    locale: 'es',
  },
  {
    id: 3,
    enable: false,
    order: 3,
    menuName: 'Settings',
    menuType: 'info',
    country: 'CO',
    maintenance_mode: true,
    title: 'Settings',
    locale: 'es',
  },
];

export function buildStrapiApiListResponse(items: unknown[]) {
  return { data: items, meta: { pagination: { total: items.length } } };
}

export function buildStrapiApiSingleResponse(item: unknown) {
  return { data: item, meta: {} };
}
