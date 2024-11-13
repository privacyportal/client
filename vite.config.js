import { sveltekit } from '@sveltejs/kit/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/pdfjs-dist/cmaps',
          dest: 'assets/pdfjs-cmaps'
        }
      ]
    })
  ],
  esbuild: {
    drop: ['console', 'debugger']
  }
};

export default config;
