// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// https://astro.build/config
const isDev = !process.argv.some(arg => arg === 'build' || arg.includes('build'));

export default defineConfig({
  site: 'https://UC-OSPO-Network.github.io',
  // Align local dev with GitHub Pages (served under /education).
  // Keystatic requires root access in dev mode for its API to work correctly.
  base: isDev ? undefined : '/education/',
  // Keystatic injects non-prerendered routes, which require a server adapter in production builds.
  // This site deploys as a static build (GitHub Pages), so we only enable Keystatic in dev.
  integrations: [react(), ...(isDev ? [keystatic()] : [])],
});
