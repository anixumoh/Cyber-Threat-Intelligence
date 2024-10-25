import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    coverage: {
      provider: 'v8'
    },
    alias: {
      $lib: 'src/lib',
      $stores: 'src/stores',
      $src: 'src',
      $app: 'src/__tests__/app'
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'jsdom'
  }
});
