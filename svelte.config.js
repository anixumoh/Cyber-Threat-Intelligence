import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { optimizeImports } from 'carbon-preprocess-svelte';

const production = process.env.NODE_ENV === 'production';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: production ? [vitePreprocess(), optimizeImports()] : [vitePreprocess()],
  kit: {
    files: {
      assets: 'dist'
    },
    alias: {
      $lib: 'src/lib',
      $stores: 'src/stores',
      $src: 'src'
    },
    adapter: adapter({
      fallback: 'index.html'
    })
  },
  vitePlugin: {
    inspector: {
      showToggleButton: 'always',
      toggleKeyCombo: 'alt-shift'
    }
  }
};

export default config;
