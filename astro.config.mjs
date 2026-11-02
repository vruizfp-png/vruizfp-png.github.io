// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://vruizfp-png.github.io',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});