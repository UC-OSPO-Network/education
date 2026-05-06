import { useState, useMemo, useEffect } from 'react';
import LessonCard from './LessonCard.jsx';
import type { Lesson } from '../lib/lessons';
import Fuse from 'fuse.js';

interface LessonFilterProps {
  lessons: Lesson[];
}

export default function LessonFilter({ lessons }: LessonFilterProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<{
    ossRole: string;
    educationalLevel: string;
    learnerCategory: string;
    search: string;
  }>({
    ossRole: '',
    educationalLevel: '',
    learnerCategory: '',
    search: ''
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
        lesson.oss_role.split(',').forEach((role) =>
          ossRoles.add(role.trim())
        );
      }
      if (lesson.educationalLevel) levels.add(lesson.educationalLevel);
      if (lesson.learnerCategory) categories.add(lesson.learnerCategory);
    });

    return {
      ossRoles: Array.from(ossRoles).sort(),
      levels: Array.from(levels).sort(),
      categories: Array.from(categories).sort()
    };
  }, [lessons]);

  const lessonIndex = useMemo(() => {
    const index: Record<string, { name: string; url: string }> = {};
    lessons.forEach((lesson) => {
      if (!lesson.slug || !lesson.url) return;
      index[lesson.slug] = {
        name: lesson.name || lesson.slug,
        url: lesson.url
      };
    });
    return index;
  }, [lessons]);

  const fuse = useMemo(() => {
    if (!lessons || lessons.length === 0) return null;

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

    // Apply fuzzy search
    if (filters.search && fuse) {
      result = fuse.search(filters.search).map(r => r.item);
    }

    return result.filter((lesson) => {
      if (filters.ossRole && !lesson.oss_role?.includes(filters.ossRole)) {
        return false;
      }

      if (
        filters.educationalLevel &&
        lesson.educationalLevel !== filters.educationalLevel
      ) {
        return false;
      }

      if (
        filters.learnerCategory &&
        lesson.learnerCategory !== filters.learnerCategory
      ) {
        return false;
      }

      return true;
    });
  }, [lessons, filters, fuse]);

  const handleFilterChange = (
    filterName: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      ossRole: '',
      educationalLevel: '',
      learnerCategory: '',
      search: ''
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Loading lessons...</p>
        </div>
      ) : (
        <>
          {/* Filter Controls */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {/* Search */}
              <div>
                <label htmlFor="lesson-search" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  Search
                </label>
                <input
                  id="lesson-search"
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search lessons..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              {/* OSS Role */}
              <div>
                <label htmlFor="lesson-oss-role" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  OSS Role
                </label>
                <select
                  id="lesson-oss-role"
                  value={filters.ossRole}
                  onChange={(e) => handleFilterChange('ossRole', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">All Roles</option>
                  {filterOptions.ossRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Skill Level */}
              <div>
                <label htmlFor="lesson-skill-level" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  Skill Level
                </label>
                <select
                  id="lesson-skill-level"
                  value={filters.educationalLevel}
                  onChange={(e) => handleFilterChange('educationalLevel', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">All Levels</option>
                  {filterOptions.levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Pathway */}
              <div>
                <label htmlFor="lesson-pathway" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  Pathway
                </label>
                <select
                  id="lesson-pathway"
                  value={filters.learnerCategory}
                  onChange={(e) => handleFilterChange('learnerCategory', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">All Pathways</option>
                  {filterOptions.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Showing {filteredLessons.length} of {lessons.length} lessons
              </p>
              <button
                onClick={clearFilters}
                style={{
                  padding: '0.65rem 1rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {filteredLessons.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)'
              }}>
                <p style={{ fontSize: '1.2rem' }}>No lessons found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--uc-gold)',
                    color: 'var(--uc-blue)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredLessons.map((lesson, index) => (
                <LessonCard
                  key={index}
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
