// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

// https://astro.build/config
const isDev = !process.argv.some(arg => arg === 'build' || arg.includes('build'));
// Astro's `redirects` targets aren't base-prefixed automatically — do it ourselves
// so the generated meta-refresh actually lands on /education/lessons in production.
const base = isDev ? '' : '/education';

export default defineConfig({
  site: 'https://ucospo.net',
  // Keystatic requires root access in dev mode for its API to work correctly.
  base: isDev ? undefined : '/education/',
  // Pathway pages retired 2026-07-24 (43 lessons doesn't justify a separate
  // curated-sequence layer alongside Topics) — these URLs were live and indexed
  // with canonical tags + Course JSON-LD (#183-185), so send them to /lessons
  // rather than 404ing.
  redirects: {
    '/pathways': `${base}/lessons`,
    '/pathways/getting-started': `${base}/lessons`,
    '/pathways/contributing': `${base}/lessons`,
    '/pathways/maintaining': `${base}/lessons`,
    '/pathways/strategic': `${base}/lessons`,
  },
  // Keystatic injects non-prerendered routes, which require a server adapter in production builds.
  // This site deploys as a static build (GitHub Pages), so we only enable Keystatic in dev.
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes('/keystatic') }),
    ...(isDev ? [keystatic()] : []),
  ],
});
