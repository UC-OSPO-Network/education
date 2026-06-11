import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LessonCard from "./LessonCard.jsx";
import type { Lesson } from "../lib/lessons";
import type { HealthRecord } from "../lib/githubHealth";

interface LessonFilterProps {
  lessons: Lesson[];
  healthBySlug?: Record<string, HealthRecord | null>;
  pagefindPath: string;
}

type PagefindResult = { data: () => Promise<{ url: string }> };
type PagefindModule = {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
};

const FILTER_QUERY_PARAMS = ["q", "role", "level", "pathway", "domain", "type", "audience", "topic"];

const emptyFilters = {
  role: "",
  educationalLevel: "",
  pathway: "",
  domain: "",
  learningResourceType: "",
  audience: "",
  topic: "",
  search: "",
};

function getInitialFilters() {
  if (typeof window === "undefined") return emptyFilters;

  const params = new URLSearchParams(window.location.search);
  return {
    role: params.get("role") ?? "",
    educationalLevel: params.get("level") ?? "",
    pathway: params.get("pathway") ?? "",
    domain: params.get("domain") ?? "",
    learningResourceType: params.get("type") ?? "",
    audience: params.get("audience") ?? "",
    topic: params.get("topic") ?? "",
    search: params.get("q") ?? "",
  };
}

function splitAudience(audience: string) {
  return audience.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function LessonFilter({ lessons, healthBySlug = {}, pagefindPath }: LessonFilterProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSlugs, setSearchSlugs] = useState<Set<string> | null>(null);
  const [filters, setFilters] = useState(getInitialFilters);

  const pagefindRef = useRef<PagefindModule | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

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
    if (filters.role) url.searchParams.set("role", filters.role);
    if (filters.educationalLevel) url.searchParams.set("level", filters.educationalLevel);
    if (filters.pathway) url.searchParams.set("pathway", filters.pathway);
    if (filters.domain) url.searchParams.set("domain", filters.domain);
    if (filters.learningResourceType) url.searchParams.set("type", filters.learningResourceType);
    if (filters.audience) url.searchParams.set("audience", filters.audience);
    if (filters.topic) url.searchParams.set("topic", filters.topic);

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [filters]);

  const filterOptions = useMemo(() => {
    const roles = new Set<string>();
    const levels = new Set<string>();
    const pathways = new Set<string>();
    const domains = new Set<string>();
    const types = new Set<string>();
    const audiences = new Set<string>();
    const topics = new Set<string>();

    lessons.forEach((lesson) => {
      lesson.roles.forEach((r) => roles.add(r));
      if (lesson.educationalLevel) levels.add(lesson.educationalLevel);
      lesson.pathways.forEach((p) => pathways.add(p));
      if (lesson.domain) domains.add(lesson.domain);
      if (lesson.learningResourceType) types.add(lesson.learningResourceType);
      splitAudience(lesson.audience).forEach((audience) => audiences.add(audience));
      lesson.keywords.forEach((keyword) => topics.add(keyword));
    });

    return {
      roles: Array.from(roles).sort(),
      levels: Array.from(levels).sort(),
      pathways: Array.from(pathways).sort(),
      domains: Array.from(domains).sort(),
      types: Array.from(types).sort(),
      audiences: Array.from(audiences).sort(),
      topics: Array.from(topics).sort(),
    };
  }, [lessons]);

  const lessonIndex = useMemo(() => {
    const index: Record<string, { name: string; url: string }> = {};
    lessons.forEach((lesson) => {
      if (!lesson.slug || !lesson.url) return;
      index[lesson.slug] = { name: lesson.name || lesson.slug, url: lesson.url };
    });
    return index;
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    let result = lessons;

    if (searchSlugs !== null) {
      result = result.filter((l) => searchSlugs.has(l.slug));
    }

    return result.filter((lesson) => {
      if (filters.role && !lesson.roles.includes(filters.role)) return false;
      if (filters.educationalLevel && lesson.educationalLevel !== filters.educationalLevel) return false;
      if (filters.pathway && !lesson.pathways.includes(filters.pathway)) return false;
      if (filters.domain && lesson.domain !== filters.domain) return false;
      if (filters.learningResourceType && lesson.learningResourceType !== filters.learningResourceType) return false;
      if (filters.audience && !splitAudience(lesson.audience).includes(filters.audience)) return false;
      if (filters.topic && !lesson.keywords.includes(filters.topic)) return false;
      return true;
    });
  }, [filters, searchSlugs, lessons]);

  function handleFilterChange(filterName: keyof typeof filters, value: string) {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  }

  function clearFilters() {
    setFilters(emptyFilters);
  }

  if (isLoading) {
    return (
      <div className="lessons-loading">
        <p>Loading lessons…</p>
      </div>
    );
  }

  return (
    <div className="lessons-page">
      <div className="lessons-filter">
        <div className="lessons-filter__grid">
          <div className="lessons-filter__field">
            <label htmlFor="lesson-search" className="lessons-filter__label">Search</label>
            <input
              id="lesson-search"
              type="text"
              className="lessons-filter__input"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search lessons…"
            />
          </div>

          <div className="lessons-filter__field">
            <label htmlFor="lesson-role" className="lessons-filter__label">OSS Role</label>
            <select
              id="lesson-role"
              className="lessons-filter__select"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">All Roles</option>
              {filterOptions.roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="lessons-filter__field">
            <label htmlFor="lesson-level" className="lessons-filter__label">Skill Level</label>
            <select
              id="lesson-level"
              className="lessons-filter__select"
              value={filters.educationalLevel}
              onChange={(e) => handleFilterChange("educationalLevel", e.target.value)}
            >
              <option value="">All Levels</option>
              {filterOptions.levels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="lessons-filter__field">
            <label htmlFor="lesson-pathway" className="lessons-filter__label">Pathway</label>
            <select
              id="lesson-pathway"
              className="lessons-filter__select"
              value={filters.pathway}
              onChange={(e) => handleFilterChange("pathway", e.target.value)}
            >
              <option value="">All Pathways</option>
              {filterOptions.pathways.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="lessons-filter__field">
            <label htmlFor="lesson-domain" className="lessons-filter__label">Domain</label>
            <select
              id="lesson-domain"
              className="lessons-filter__select"
              value={filters.domain}
              onChange={(e) => handleFilterChange("domain", e.target.value)}
            >
              <option value="">All Domains</option>
              {filterOptions.domains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="lessons-filter__field">
            <label htmlFor="lesson-type" className="lessons-filter__label">Learning Type</label>
            <select
              id="lesson-type"
              className="lessons-filter__select"
              value={filters.learningResourceType}
              onChange={(e) => handleFilterChange("learningResourceType", e.target.value)}
            >
              <option value="">All Types</option>
              {filterOptions.types.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="lessons-filter__field">
            <label htmlFor="lesson-audience" className="lessons-filter__label">Audience</label>
            <select
              id="lesson-audience"
              className="lessons-filter__select"
              value={filters.audience}
              onChange={(e) => handleFilterChange("audience", e.target.value)}
            >
              <option value="">All Audiences</option>
              {filterOptions.audiences.map((audience) => (
                <option key={audience} value={audience}>{audience}</option>
              ))}
            </select>
          </div>

          <div className="lessons-filter__field">
            <label htmlFor="lesson-topic" className="lessons-filter__label">Topic</label>
            <select
              id="lesson-topic"
              className="lessons-filter__select"
              value={filters.topic}
              onChange={(e) => handleFilterChange("topic", e.target.value)}
            >
              <option value="">All Topics</option>
              {filterOptions.topics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="lessons-filter__footer">
          <p className="lessons-filter__count">
            {isSearching
              ? "Searching…"
              : `Showing ${filteredLessons.length} of ${lessons.length} lessons`}
          </p>
          <button type="button" className="lessons-filter__clear" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

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
            />
          ))
        )}
      </div>
    </div>
  );
}
