export type ChromeLink = {
  label: string;
  href: string;
  external?: boolean;
  matchPrefixes?: string[];
};

export type ChromeNavItem = ChromeLink & {
  children?: ChromeLink[];
  currentSite?: boolean;
};

export function stripBasePath(basePath: string, pathname: string) {
  if (!basePath) return pathname || "/";
  if (pathname === basePath) return "/";
  return pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname || "/";
}

export function normalizePath(basePath: string, pathname: string) {
  const stripped = stripBasePath(basePath, pathname);
  const normalized = stripped.startsWith("/") ? stripped : `/${stripped}`;
  return normalized.length > 1 ? normalized.replace(/\/$/, "") : normalized;
}

export function withBasePath(baseUrl: string, pathname: string) {
  if (/^https?:\/\//.test(pathname)) return pathname;
  const normalized = pathname === "/" ? "" : pathname.replace(/^\//, "");
  const prefix = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return normalized ? `${prefix}${normalized}` : prefix;
}

export function isCurrentLink(basePath: string, currentPathname: string, href: string) {
  if (/^https?:\/\//.test(href)) return false;
  const current = normalizePath(basePath, currentPathname);
  const candidate = normalizePath(basePath, href);
  if (candidate === "/") return current === "/";
  return current === candidate || current.startsWith(`${candidate}/`);
}

export function isCurrentItem(basePath: string, currentPathname: string, item: ChromeNavItem) {
  if (item.matchPrefixes?.some((prefix) => isCurrentLink(basePath, currentPathname, prefix))) return true;
  if (isCurrentLink(basePath, currentPathname, item.href)) return true;
  return item.children?.some((child) => isCurrentLink(basePath, currentPathname, child.href)) ?? false;
}

export const siteChrome = {
  brand: {
    label: "UC OSPO Network",
    subtitle: "Education",
    homeHref: "https://ucospo.net/",
  },
  nav: [
    {
      label: "About",
      href: "https://ucospo.net/about",
      external: true,
      children: [
        {
          label: "About UC OSPO Network",
          href: "https://ucospo.net/about",
          external: true,
        },
        {
          label: "Guiding Themes",
          href: "https://ucospo.net/about/guiding-themes",
          external: true,
        },
      ],
    },
    {
      label: "Events",
      href: "https://ucospo.net/events",
      external: true,
    },
    {
      label: "Blog",
      href: "https://ucospo.net/posts/",
      external: true,
    },
    {
      label: "Resources",
      href: "https://ucospo.net/oss-resources",
      external: true,
      children: [
        {
          label: "OSS Resources",
          href: "https://ucospo.net/oss-resources",
          external: true,
        },
        {
          label: "Template Guides",
          href: "https://ucospo.net/oss-resources",
          external: true,
        },
      ],
    },
    {
      label: "Education",
      href: "/",
      currentSite: true,
      matchPrefixes: ["/", "/lessons", "/pathways", "/develop-a-lesson", "/for-educators"],
      children: [
        { label: "All Pathways", href: "/" },
        { label: "All Lessons", href: "/lessons" },
        { label: "Browse Pathways", href: "/pathways" },
        { label: "Develop a Lesson", href: "/develop-a-lesson" },
        { label: "For Educators", href: "/for-educators" },
      ],
    },
  ] satisfies ChromeNavItem[],
  footer: {
    social: [
      {
        label: "GitHub",
        href: "https://github.com/UC-OSPO-Network/",
        icon: "/icons/github.svg",
        external: true,
      },
      {
        label: "Slack",
        href: "https://join.slack.com/t/uc-ospo-network/shared_invite/zt-3ecp5b20z-ECL~4DkCUslB0t3mbH9xUg",
        icon: "/icons/slack.svg",
        external: true,
      },
      {
        label: "RSS",
        href: "https://ucospo.net/atom.xml",
        icon: "/icons/rss.svg",
        external: true,
      },
    ] satisfies Array<ChromeLink & { icon: string }>,
  },
} as const;
