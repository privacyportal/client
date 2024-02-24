import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  esbuild: {
    drop: ['console', 'debugger']
  }
};

export default config;
