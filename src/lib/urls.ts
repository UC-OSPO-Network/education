// Build a deployed absolute URL, honoring the site's base path (`/education/`
// in production) and Astro's trailing-slash output, so these URLs match the
// pages' own canonical URLs exactly.
export function absoluteUrl(site: URL | undefined, path: string): string {
  const base = import.meta.env.BASE_URL; // "/education/" in prod, "/" in dev
  const joined = `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`.replace(/\/?$/, "/");
  return new URL(joined, site ?? "https://ucospo.net").href;
}

// Same base-path resolution as absoluteUrl(), but for file-based endpoints
// (rss.xml, api/lessons.json, llms.txt, robots.txt) that must NOT get a
// trailing slash — these are static files on GitHub Pages, not directory
// routes, so a trailing slash 404s.
export function absoluteFileUrl(site: URL | undefined, path: string): string {
  const base = import.meta.env.BASE_URL; // "/education/" in prod, "/" in dev
  const joined = `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  return new URL(joined, site ?? "https://ucospo.net").href;
}
