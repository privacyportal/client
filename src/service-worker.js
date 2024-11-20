/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

// List of assets to precache
const ASSETS = [...build, ...files];

// Cache all assets on install
self.addEventListener('install', (event) => {
  // Create a new cache and add all files to it
  async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

  event.waitUntil(addFilesToCache());
});

// Delete all expired cached assets on activation
self.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
			if (!key.startsWith(CACHE)) await caches.delete(key);
		}
	}

  event.waitUntil(deleteOldCaches());
});

// Respond from cache first
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // handle web share target
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    return event.respondWith(
      (async () => {
        const formData = await fetchEvent.request.formData();
        if (formData.has('pdfFile')) {
          // handle file as a target for file-sharing
          const file = formData.get('pdfFile');
          const keys = await caches.keys();
          let fsCacheName = keys.find(key => key.endsWith('file-sharing'))?.[0] || `${CACHE}-file-sharing`;
          const fsCache = await caches.open(fsCacheName);
          await fsCache.put('pdf-file', new Response(file));
          return Response.redirect('/file-sharing/sender?share-target', 303);
        } else {
          // handle Mail Relay alias creation by sharing urls / text
          const redirectURL = new URL('/mail-relay');
          for (const key of ['title', 'text', 'url']) {
            if (formData.has(key)) {
              redirectURL.searchParams.append(key, formData.get(key));
            }
          }
          return Response.redirect(redirectURL, 303);
        }
      })(),
    );
  }

  // only serve GET requests from the cache
	if (request.method !== 'GET') return;

  // only serve `build`/`files` from the cache
  if (url.origin !== location.origin || !ASSETS.includes(url.pathname)) return;

  async function respond() {
		const cache = await caches.open(CACHE);
    const response = await cache.match(url.pathname);
    if (!response) {
      console.error('Failed to respond from cache.');
      throw new Error('Failed to respond from cache.');
    }
    return response;
	}

  event.respondWith(respond());
});
