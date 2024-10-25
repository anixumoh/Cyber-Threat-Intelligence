import { sveltekit } from '@sveltejs/kit/vite';
import FullReload from 'vite-plugin-full-reload';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindConfig from './tailwind.config.cjs';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { isoImport } from 'vite-plugin-iso-import';

const target = 'https://tcmaster.blueliv.com';
const production = process.env.NODE_ENV === 'production';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [basicSsl(), sveltekit(), isoImport(), FullReload(['./dist/**/*'], { delay: 500 })],
  build: {
    sourcemap: true
  },
  optimizeDeps: {
    entries: production ? [] : ['src/routes/**/*.svelte']
  },
  assetsInclude: ['dist/*'],
  server: {
    port: 4200,
    https: true,
    proxy: {
      '/api/v2': {
        target,
        secure: false,
        changeOrigin: true,
        cookiePathRewrite: '/'
      },
      '/v2': {
        target,
        secure: false,
        changeOrigin: true,
        rewrite: (path) => {
          return path.replace(/^\/v2/, '/api/v2');
        },
        cookiePathRewrite: '/'
      },
      '/attack': {
        target,
        secure: false,
        changeOrigin: true,
        cookiePathRewrite: '/'
      }
    },
    cookiePathRewrite: '/'
  },
  css: {
    postcss: {
      plugins: [tailwind(tailwindConfig), autoprefixer]
    }
  }
};

export default config;
