import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';

const CONFIG = {
  '/': {
    // DEFAULTS
    logo_color: 'var(--primary-color)',
    public: false,
    noHeader: false
  },
  '/add-device': {
    public: true,
    noHeader: false
  },
  '/oauth/authorize': {
    public: false,
    noHeader: true
  },
  '/unsubscribe': {
    public: true,
    noHeader: true
  }
};

// get all parent paths in order
// e.g. '/blog/tech/example' would return ['/blog/tech', '/blog', '/']
const parentPaths = (fullPath) => {
  const pathComponents = fullPath.split('/');

  const result = [fullPath];
  while (pathComponents.length > 1) {
    pathComponents.pop();
    result.push(pathComponents.join('/') || '/');
  }
  return result;
};

// given a path such as '/blog/tech/example' and a lookup map it returns the correct config for that path
const pathConfigValue = (fullPath, key) => {
  const pathArr = parentPaths(fullPath);
  for (const parentPath of pathArr) {
    const value = (CONFIG[parentPath] || {})[key];
    if (value != null && value != undefined) return value;
  }
  // default
  return CONFIG['/'][key];
};

export const logoColor = derived(page, ($page) => pathConfigValue($page.url.pathname, 'logo_color'));
export const isPublicPage = derived(page, ($page) => pathConfigValue($page.url.pathname, 'public'));
export const noHeader = derived(page, ($page) => pathConfigValue($page.url.pathname, 'noHeader'));

// mobile back button
export const navBackButton = writable(null);
