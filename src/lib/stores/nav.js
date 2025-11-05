import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';

const CONFIG = {
  '/': {
    // DEFAULTS
    logoColor: 'var(--primary-color)',
    isPublicPage: false,
    noHeader: false,
    showPrintButton: false,
    fullWidth: false
  },
  '/add-device': {
    isPublicPage: true,
    noHeader: false
  },
  '/oauth/authorize': {
    isPublicPage: false,
    noHeader: true,
    isE2EEBypassedPage: true
  },
  '/unsubscribe': {
    isPublicPage: true,
    noHeader: true
  },
  '/file-sharing/preview': {
    isPublicPage: true,
    noHeader: false,
    showPrintButton: true
  },
  '/file-sharing/preview/pdf-viewer': {
    isPublicPage: true,
    noHeader: true
  },
  '/support': {
    isE2EEBypassedPage: true
  }
};

// get all parent paths in order
// e.g. '/blog/tech/example' would return ['/', '/blog', '/blog/tech']
const parentPaths = (fullPath) => {
  let parentPath = '';
  return fullPath.split('/').map((child) => {
    if (!child.length) return '/';
    parentPath += '/' + child;
    return parentPath;
  });
};

export const navConfig = derived(page, ($page) => {
  const pathArr = parentPaths($page.url.pathname);
  return Object.assign({}, ...pathArr.map((path) => CONFIG[path]));
});

// mobile back button
export const navBackButton = writable(null);
