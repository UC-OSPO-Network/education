import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import LessonCard from "./LessonCard.jsx";
import type { Lesson } from "../lib/lessons";

interface LessonFilterProps {
  lessons: Lesson[];
}

export default function LessonFilter({ lessons }: LessonFilterProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    ossRole: "",
    educationalLevel: "",
    learnerCategory: "",
    search: "",
  });

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const filterOptions = useMemo(() => {
    const ossRoles = new Set<string>();
    const levels = new Set<string>();
    const categories = new Set<string>();

    lessons.forEach((lesson) => {
      if (lesson.oss_role) {
        lesson.oss_role.split(",").forEach((role) => ossRoles.add(role.trim()));
      }
      if (lesson.educationalLevel) levels.add(lesson.educationalLevel);
      if (lesson.learnerCategory) categories.add(lesson.learnerCategory);
    });

    return {
      ossRoles: Array.from(ossRoles).sort(),
      levels: Array.from(levels).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [lessons]);

  const lessonIndex = useMemo(() => {
    const index: Record<string, { name: string; url: string }> = {};
    lessons.forEach((lesson) => {
      if (!lesson.slug || !lesson.url) return;
      index[lesson.slug] = {
        name: lesson.name || lesson.slug,
        url: lesson.url,
      };
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
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    let result = lessons;

    if (filters.search && fuse) {
      result = fuse.search(filters.search).map((entry) => entry.item);
    }

    return result.filter((lesson) => {
      if (filters.ossRole && !lesson.oss_role?.includes(filters.ossRole)) return false;
      if (filters.educationalLevel && lesson.educationalLevel !== filters.educationalLevel) return false;
      if (filters.learnerCategory && lesson.learnerCategory !== filters.learnerCategory) return false;
      return true;
    });
  }, [filters, fuse, lessons]);

  function handleFilterChange(filterName: keyof typeof filters, value: string) {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  }

  function clearFilters() {
    setFilters({
      ossRole: "",
      educationalLevel: "",
      learnerCategory: "",
      search: "",
    });
  }

  return (
    <div className="content-container">
      {isLoading ? (
        <div className="empty-state">
          <p>Loading lessons...</p>
        </div>
      ) : (
        <>
          <section className="filter-panel" aria-label="Lesson filters">
            <div className="filter-grid">
              <div className="filter-field">
                <label htmlFor="lesson-search">Search</label>
                <input
                  id="lesson-search"
                  className="filter-input"
                  type="text"
                  value={filters.search}
                  onChange={(event) => handleFilterChange("search", event.target.value)}
                  placeholder="Search lessons"
                />
              </div>

              <div className="filter-field">
                <label htmlFor="lesson-role">OSS Role</label>
                <select
                  id="lesson-role"
                  className="filter-input"
                  value={filters.ossRole}
                  onChange={(event) => handleFilterChange("ossRole", event.target.value)}
                >
                  <option value="">All roles</option>
                  {filterOptions.ossRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="lesson-level">Skill Level</label>
                <select
                  id="lesson-level"
                  className="filter-input"
                  value={filters.educationalLevel}
                  onChange={(event) => handleFilterChange("educationalLevel", event.target.value)}
                >
                  <option value="">All levels</option>
                  {filterOptions.levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="lesson-pathway">Pathway</label>
                <select
                  id="lesson-pathway"
                  className="filter-input"
                  value={filters.learnerCategory}
                  onChange={(event) => handleFilterChange("learnerCategory", event.target.value)}
                >
                  <option value="">All pathways</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-summary">
              <p>
                Showing {filteredLessons.length} of {lessons.length} lessons
              </p>
              <button type="button" className="button-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </section>

          <div className="lesson-results">
            {filteredLessons.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                <p>No lessons found matching your criteria.</p>
                <button type="button" className="button-primary" onClick={clearFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredLessons.map((lesson) => (
                <LessonCard
                  key={lesson.slug}
                  lesson={lesson}
                  pathwayIcon="📚"
                  lessonIndex={lessonIndex}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
