import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import LessonCard from "./LessonCard.jsx";
import type { Lesson } from "../lib/lessons";
import type { HealthRecord } from "../lib/githubHealth";

interface LessonFilterProps {
  lessons: Lesson[];
  healthBySlug?: Record<string, HealthRecord | null>;
}

export default function LessonFilter({ lessons, healthBySlug = {} }: LessonFilterProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    educationalLevel: "",
    pathway: "",
    domain: "",
    search: "",
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const filterOptions = useMemo(() => {
    const roles = new Set<string>();
    const levels = new Set<string>();
    const pathways = new Set<string>();
    const domains = new Set<string>();

    lessons.forEach((lesson) => {
      lesson.roles.forEach((r) => roles.add(r));
      if (lesson.educationalLevel) levels.add(lesson.educationalLevel);
      lesson.pathways.forEach((p) => pathways.add(p));
      if (lesson.domain) domains.add(lesson.domain);
    });

    return {
      roles: Array.from(roles).sort(),
      levels: Array.from(levels).sort(),
      pathways: Array.from(pathways).sort(),
      domains: Array.from(domains).sort(),
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

  const fuse = useMemo(() => {
    if (!lessons.length) return null;
    return new Fuse(lessons, {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "keywords", weight: 0.2 },
        { name: "subTopic", weight: 0.1 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    let result = lessons;

    if (filters.search && fuse) {
      result = fuse.search(filters.search).map((entry) => entry.item);
    }

    return result.filter((lesson) => {
      if (filters.role && !lesson.roles.includes(filters.role)) return false;
      if (filters.educationalLevel && lesson.educationalLevel !== filters.educationalLevel) return false;
      if (filters.pathway && !lesson.pathways.includes(filters.pathway)) return false;
      if (filters.domain && lesson.domain !== filters.domain) return false;
      return true;
    });
  }, [filters, fuse, lessons]);

  function handleFilterChange(filterName: keyof typeof filters, value: string) {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  }

  function clearFilters() {
    setFilters({ role: "", educationalLevel: "", pathway: "", domain: "", search: "" });
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
        </div>

        <div className="lessons-filter__footer">
          <p className="lessons-filter__count">
            Showing {filteredLessons.length} of {lessons.length} lessons
          </p>
          <button type="button" className="lessons-filter__clear" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className="lessons-grid">
        {filteredLessons.length === 0 ? (
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
