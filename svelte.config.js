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
    csp: {
      directives: {
        'script-src': ['self']
      }
    }
  }
};

export default config;
