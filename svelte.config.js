import adapter from '@sveltejs/adapter-cloudflare';

const { PROJECT } = process.env;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],
  preprocess: [],
  kit: {
    // hydrate the <div id="svelte"> element in src/app.html
    adapter: adapter(),
    files: {
      routes: PROJECT ? `src/routes/${PROJECT}` : 'src/routes/main'
    },
    outDir: PROJECT ? `.svelte-kit-${PROJECT}` : '.svelte-kit-main',
    prerender: {},
    serviceWorker: {
      register: !PROJECT || PROJECT === 'main'
    },
    csp: {
      directives: {
        'script-src': ['self'],
        'frame-ancestors': ['self'],
        'frame-src': ['self', 'blob:'],
        'object-src': ['self', 'blob:']
      }
    }
  }
};

export default config;
