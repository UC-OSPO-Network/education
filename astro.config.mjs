// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://UC-OSPO-Network.github.io',
  base: '/education',
  integrations: [react()],
});
