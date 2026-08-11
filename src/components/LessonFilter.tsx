import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LessonCard from "./LessonCard.jsx";
import FacetCombobox, { type FacetOption } from "./FacetCombobox";
import type { Lesson } from "../lib/lessons";
import type { HealthRecord } from "../lib/githubHealth";
import { buildPlanMarkdown, downloadPlan } from "../lib/exportPlan";
import { EDUCATOR_TOOLKIT_ITEMS } from "../data/educatorToolkit";

const GETTING_STARTED_TOPIC = "Getting Started with Open Source";

interface LessonFilterProps {
  lessons: Lesson[];
  healthBySlug?: Record<string, HealthRecord | null>;
  pagefindPath: string;
  gettingStartedIntro?: string[];
}

// learningResourceType is free text in schema.org, so we define our own values.
// Surfaced via the help text on the Learning Type facet.
const TYPE_DEFINITIONS: Record<string, string> = {
  guide: "Self-study reading or reference, worked through at your own pace.",
  workshop: "Hands-on and designed to be taught, with active exercises.",
  course: "A structured, multi-part curriculum, often taught over several sessions.",
};

// "Designed for" (audience) and "OSS Role" (competency outcome) answer different
// questions — the background a learner brings vs. the role the lesson builds
// toward — so each gets its own explanatory note.
const AUDIENCE_HELP =
  "Who the lesson was designed for — the background or role a learner already brings. Pick the persona closest to you.";
const ROLE_HELP =
  "The open-source role this lesson builds competency in. Take or teach it to grow more effective in that role — for example, as a contributor or a maintainer.";

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

type PagefindResult = { data: () => Promise<{ url: string }> };
type PagefindModule = {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
};

// Facet axes, in display order. Each maps to a URL param and a set of lesson values.
type FacetKey =
  | "role"
  | "educationalLevel"
  | "domain"
  | "learningResourceType"
  | "audience"
  | "topic";

const FACETS: { key: FacetKey; label: string; param: string }[] = [
  { key: "role", label: "OSS Role", param: "role" },
  { key: "educationalLevel", label: "Skill Level", param: "level" },
  { key: "domain", label: "Domain", param: "domain" },
  { key: "learningResourceType", label: "Learning Type", param: "type" },
  { key: "audience", label: "Designed for", param: "audience" },
  { key: "topic", label: "Topic", param: "topic" },
];

const FACET_KEYS = FACETS.map((f) => f.key);
const FILTER_QUERY_PARAMS = ["q", ...FACETS.map((f) => f.param)];

// The values a lesson carries on a given facet. Array facets contribute all of
// their values; scalar facets contribute zero or one.
function lessonValues(lesson: Lesson, key: FacetKey): string[] {
  switch (key) {
    case "role":
      return lesson.roles;
    case "educationalLevel":
      return lesson.educationalLevel ? [lesson.educationalLevel] : [];
    case "domain":
      return lesson.domain ? [lesson.domain] : [];
    case "learningResourceType":
      return lesson.learningResourceType ? [lesson.learningResourceType] : [];
    case "audience":
      return lesson.audiences;
    case "topic":
      return lesson.topics;
  }
}

// any-within-a-facet: a lesson passes if no values are selected, or it carries
// at least one of the selected values. (all-across-facets is enforced by the
// caller AND-ing every facet together.)
function matchesFacet(lesson: Lesson, key: FacetKey, selected: string[]): boolean {
  if (selected.length === 0) return true;
  return lessonValues(lesson, key).some((v) => selected.includes(v));
}

type Filters = Record<FacetKey, string[]> & { search: string };

const emptyFilters: Filters = {
  role: [],
  educationalLevel: [],
  domain: [],
  learningResourceType: [],
  audience: [],
  topic: [],
  search: "",
};

function getInitialFilters(): Filters {
  if (typeof window === "undefined") return emptyFilters;

  const params = new URLSearchParams(window.location.search);
  const next: Filters = { ...emptyFilters, search: params.get("q") ?? "" };
  FACETS.forEach(({ key, param }) => {
    next[key] = (params.get(param) ?? "").split(",").map((v) => v.trim()).filter(Boolean);
  });
  return next;
}

export default function LessonFilter({ lessons, healthBySlug = {}, pagefindPath, gettingStartedIntro = [] }: LessonFilterProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchSlugs, setSearchSlugs] = useState<Set<string> | null>(null);
  const [filters, setFilters] = useState<Filters>(getInitialFilters);

  // Workshop Planning Worksheet selection — independent of the active filters, so a
  // selection made under one facet state survives narrowing/widening the visible grid.
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [workshopTitle, setWorkshopTitle] = useState("");
  const [trayAnnouncement, setTrayAnnouncement] = useState("");
  const reorderButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pendingFocusKeyRef = useRef<string | null>(null);

  const pagefindRef = useRef<PagefindModule | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPagefind = useCallback(async (): Promise<PagefindModule | null> => {
    if (pagefindRef.current) return pagefindRef.current;
    try {
      // @vite-ignore: runtime path, not a static import
      const pf = await import(/* @vite-ignore */ pagefindPath + "pagefind.js") as PagefindModule;
      pagefindRef.current = pf;
      return pf;
    } catch {
      return null;
    }
  }, [pagefindPath]);

  const knownSlugs = useMemo(() => new Set(lessons.map((l) => l.slug)), [lessons]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = filters.search.trim();
    if (!query) {
      setSearchSlugs(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      const pf = await loadPagefind();
      if (!pf) {
        setSearchSlugs(null);
        setIsSearching(false);
        return;
      }

      try {
        const response = await pf.search(query);
        const pages = await Promise.all(response.results.map((r) => r.data()));
        const slugs = new Set(
          pages
            .map((p) => p.url.split("/").filter(Boolean).pop() ?? "")
            .filter((s) => knownSlugs.has(s)),
        );
        setSearchSlugs(slugs);
      } catch {
        setSearchSlugs(null);
      }

      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters.search, loadPagefind, knownSlugs]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    FILTER_QUERY_PARAMS.forEach((param) => url.searchParams.delete(param));

    if (filters.search.trim()) url.searchParams.set("q", filters.search.trim());
    FACETS.forEach(({ key, param }) => {
      if (filters[key].length) url.searchParams.set(param, filters[key].join(","));
    });

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [filters]);

  const filterOptions = useMemo(() => {
    const sets: Record<FacetKey, Set<string>> = {
      role: new Set(),
      educationalLevel: new Set(),
      domain: new Set(),
      learningResourceType: new Set(),
      audience: new Set(),
      topic: new Set(),
    };
    lessons.forEach((lesson) => {
      FACET_KEYS.forEach((key) => {
        lessonValues(lesson, key).forEach((v) => sets[key].add(v));
      });
    });
    const options = {} as Record<FacetKey, string[]>;
    FACET_KEYS.forEach((key) => {
      options[key] = Array.from(sets[key]).sort();
    });
    return options;
  }, [lessons]);

  const lessonIndex = useMemo(() => {
    const index: Record<string, { name: string; url: string }> = {};
    lessons.forEach((lesson) => {
      if (!lesson.slug || !lesson.url) return;
      index[lesson.slug] = { name: lesson.name || lesson.slug, url: lesson.url };
    });
    return index;
  }, [lessons]);

  // Built from the full lesson set, not filteredLessons — a selection made under one
  // facet state must not disappear from the tray when a different facet narrows the grid.
  const lessonsBySlug = useMemo(() => {
    const map: Record<string, Lesson> = {};
    lessons.forEach((lesson) => {
      map[lesson.slug] = lesson;
    });
    return map;
  }, [lessons]);

  const selectedLessons = useMemo(
    () => selectedSlugs.map((slug) => lessonsBySlug[slug]).filter((l): l is Lesson => Boolean(l)),
    [selectedSlugs, lessonsBySlug],
  );

  function toggleSelected(slug: string) {
    setSelectedSlugs((prev) => {
      const isAdding = !prev.includes(slug);
      const name = lessonsBySlug[slug]?.name ?? slug;
      const nextCount = isAdding ? prev.length + 1 : prev.length - 1;
      setTrayAnnouncement(`${isAdding ? "Added" : "Removed"} "${name}". ${nextCount} selected.`);
      return isAdding ? [...prev, slug] : prev.filter((s) => s !== slug);
    });
  }

  function moveSelected(slug: string, direction: -1 | 1) {
    setSelectedSlugs((prev) => {
      const i = prev.indexOf(slug);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      // If the moved item now sits at the boundary in the direction it just moved, its
      // "move further" button will be disabled next render — queue a focus shift to the
      // sibling button that stays enabled, instead of letting focus drop to <body>.
      const atBoundary = direction === -1 ? j === 0 : j === next.length - 1;
      pendingFocusKeyRef.current = atBoundary ? `${slug}-${direction === -1 ? "down" : "up"}` : null;
      return next;
    });
  }

  useEffect(() => {
    if (!pendingFocusKeyRef.current) return;
    reorderButtonRefs.current[pendingFocusKeyRef.current]?.focus();
    pendingFocusKeyRef.current = null;
  }, [selectedSlugs]);

  function clearSelection() {
    setSelectedSlugs([]);
    setTrayAnnouncement("Cleared workshop plan selection.");
  }

  function handleDownload() {
    const sourceUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${import.meta.env.BASE_URL}lessons`
        : "";
    const markdown = buildPlanMarkdown(selectedLessons, { workshopTitle, sourceUrl });
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadPlan(`workshop-planning-worksheet-${dateStr}.md`, markdown);
    setTrayAnnouncement(`Downloaded worksheet with ${selectedLessons.length} lessons.`);
  }

  // Lessons passing the full-text search, before facet filtering. The base set
  // for live facet counts.
  const searchedLessons = useMemo(
    () => (searchSlugs === null ? lessons : lessons.filter((l) => searchSlugs.has(l.slug))),
    [lessons, searchSlugs],
  );

  const filteredLessons = useMemo(
    () => searchedLessons.filter((l) => FACET_KEYS.every((k) => matchesFacet(l, k, filters[k]))),
    [searchedLessons, filters],
  );

  // For each facet, how many lessons each value would yield given the *other*
  // active facets (and the search). Drill-down preview counts.
  const facetCounts = useMemo(() => {
    const counts = {} as Record<FacetKey, Map<string, number>>;
    FACET_KEYS.forEach((key) => {
      const subset = searchedLessons.filter((l) =>
        FACET_KEYS.every((k) => k === key || matchesFacet(l, k, filters[k])),
      );
      const m = new Map<string, number>();
      subset.forEach((l) => {
        lessonValues(l, key).forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
      });
      counts[key] = m;
    });
    return counts;
  }, [searchedLessons, filters]);

  function toggleValue(key: FacetKey, value: string) {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  function setSearch(value: string) {
    setFilters((prev) => ({ ...prev, search: value }));
  }

  function clearFilters() {
    setFilters(emptyFilters);
  }

  function displayValue(key: FacetKey, value: string): string {
    if (key === "learningResourceType") return titleCase(value);
    return value;
  }

  function renderHelp(key: FacetKey) {
    if (key === "role") return <p className="lessons-filter__help">{ROLE_HELP}</p>;
    if (key === "audience") return <p className="lessons-filter__help">{AUDIENCE_HELP}</p>;
    if (key === "learningResourceType") {
      return (
        <dl className="lessons-filter__help">
          {Object.entries(TYPE_DEFINITIONS).map(([term, def]) => (
            <div key={term} className="lessons-filter__help-item">
              <dt>{titleCase(term)}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      );
    }
    return null;
  }

  function facetOptions(key: FacetKey): FacetOption[] {
    const counts = facetCounts[key];
    return filterOptions[key].map((value) => ({
      value,
      label: displayValue(key, value),
      count: counts.get(value) ?? 0,
    }));
  }

  const activeFilterCount =
    FACET_KEYS.reduce((sum, k) => sum + filters[k].length, 0) + (filters.search.trim() ? 1 : 0);

  // Facet-conditional entry-point copy: a static section becomes visible
  // content only when the facet value that motivates it is selected, instead
  // of always rendering above the catalog. See Phase 2 of
  // docs/PLAN-lessons-education-redesign-2026-08-04.md.
  const showGettingStartedNote = filters.topic.includes(GETTING_STARTED_TOPIC) && gettingStartedIntro.length > 0;
  const showEducatorToolkit = filters.audience.includes("Educator");

  return (
    <div className={`lessons-page${selectedSlugs.length > 0 ? " lessons-page--tray-open" : ""}`}>
      <div className="lessons-filter">
        <div className="lessons-filter__field lessons-filter__field--search">
          <label htmlFor="lesson-search" className="lessons-filter__label">Search</label>
          <input
            id="lesson-search"
            type="text"
            className="lessons-filter__input"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons…"
          />
        </div>

        <div className="lessons-filter__grid">
          {FACETS.map(({ key, label }) => {
            const options = facetOptions(key);
            if (options.length === 0) return null;
            return (
              <FacetCombobox
                key={key}
                facetKey={key}
                label={label}
                options={options}
                selected={filters[key]}
                onToggle={(value) => toggleValue(key, value)}
                helpText={renderHelp(key)}
              />
            );
          })}
        </div>

        <div className="lessons-filter__footer">
          <p className="lessons-filter__count">
            {isSearching
              ? "Searching…"
              : `Showing ${filteredLessons.length} of ${lessons.length} lessons`}
          </p>
          {activeFilterCount > 0 && (
            <button type="button" className="lessons-filter__clear" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {trayAnnouncement}
      </div>

      {selectedSlugs.length > 0 && (
        <section className="workshop-tray" aria-labelledby="workshop-tray-heading">
          <h2 id="workshop-tray-heading" className="sr-only">Workshop plan selection</h2>
          <div className="workshop-tray__summary">
            <span className="workshop-tray__count">
              {selectedSlugs.length} lesson{selectedSlugs.length === 1 ? "" : "s"} selected
            </span>
            <label className="workshop-tray__title-field">
              <span className="sr-only">Workshop or course title</span>
              <input
                type="text"
                placeholder="Workshop or course title (optional)"
                value={workshopTitle}
                onChange={(e) => setWorkshopTitle(e.target.value)}
              />
            </label>
            <div className="workshop-tray__actions">
              <button type="button" className="lessons-filter__clear" onClick={clearSelection}>
                Clear
              </button>
              <button type="button" className="workshop-tray__download" onClick={handleDownload}>
                Download Worksheet
              </button>
            </div>
          </div>

          <ol className="workshop-tray__list">
            {selectedLessons.map((lesson, i) => (
              <li key={lesson.slug} className="workshop-tray__item">
                <span className="workshop-tray__item-name">{lesson.name || lesson.slug}</span>
                <div className="workshop-tray__item-controls">
                  <button
                    type="button"
                    ref={(el) => { reorderButtonRefs.current[`${lesson.slug}-up`] = el; }}
                    disabled={i === 0}
                    onClick={() => moveSelected(lesson.slug, -1)}
                    aria-label={`Move "${lesson.name}" earlier in the plan`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    ref={(el) => { reorderButtonRefs.current[`${lesson.slug}-down`] = el; }}
                    disabled={i === selectedLessons.length - 1}
                    onClick={() => moveSelected(lesson.slug, 1)}
                    aria-label={`Move "${lesson.name}" later in the plan`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSelected(lesson.slug)}
                    aria-label={`Remove "${lesson.name}" from the plan`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {showGettingStartedNote && (
        <section className="page-section facet-note" aria-labelledby="getting-started-note-heading">
          <p className="page-intro__eyebrow">New to open source?</p>
          <h2 id="getting-started-note-heading" className="section-heading">Getting Started with Open Source</h2>
          {gettingStartedIntro.map((paragraph, i) => (
            <p key={i} className="section-copy">{paragraph}</p>
          ))}
        </section>
      )}

      {showEducatorToolkit && (
        <section className="toolkit-container" aria-labelledby="educator-toolkit-heading">
          <h2 id="educator-toolkit-heading" className="toolkit-heading">Using Externally Hosted Lessons in Your Teaching</h2>
          <p className="toolkit-subhead">
            This catalog is a curated index, not a content host — every lesson links to a resource
            maintained elsewhere. That means adoption is on you to verify. Here's what to check first.
          </p>
          <div className="checklist">
            {EDUCATOR_TOOLKIT_ITEMS.map((item) => (
              <div key={item.title} className="checklist-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
          <p className="page-intro__note">
            Teaching one of these lessons? We're here to help,{" "}
            <a href="https://github.com/UC-OSPO-Network/education/discussions" target="_blank" rel="noopener noreferrer">
              start a discussion on GitHub
            </a>
            .
          </p>
        </section>
      )}

      <div className="lessons-grid">
        {isSearching ? (
          <div className="lessons-loading">
            <p>Searching…</p>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="lessons-empty">
            <p className="lessons-empty__message">No lessons match your filters.</p>
            <button type="button" className="lessons-filter__clear" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          filteredLessons.map((lesson) => (
            <LessonCard
              key={lesson.slug}
              lesson={lesson}
              lessonIndex={lessonIndex}
              health={healthBySlug[lesson.slug] ?? null}
              isSelected={selectedSlugs.includes(lesson.slug)}
              onToggle={toggleSelected}
            />
          ))
        )}
      </div>
    </div>
  );
}
