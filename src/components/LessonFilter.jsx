import { useState, useMemo } from 'react';
import LessonCard from './LessonCard.jsx';
import Fuse from 'fuse.js';

export default function LessonFilter({ lessons }) {
  const [filters, setFilters] = useState({
    ossRole: '',
    educationalLevel: '',
    learnerCategory: '',
    search: ''
  });

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const ossRoles = new Set();
    const levels = new Set();
    const categories = new Set();

    lessons.forEach(lesson => {
      if (lesson.oss_role) {
        lesson.oss_role.split(',').forEach(role => ossRoles.add(role.trim()));
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

  const fuse = useMemo(() => {
    if (!lessons || lessons.length === 0) return null;

    return new Fuse(lessons, {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "description", weight: 0.3 },
        { name: "keywords", weight: 0.2 },
        { name: "subTopic", weight: 0.1 },
      ],
      threshold: 0.4,        // typo tolerance
      ignoreLocation: true,
      includeMatches:true,
    });
  }, [lessons]);

  // Filter lessons based on current filters
  const filteredLessons = useMemo(() => {
    let result = lessons;
    // Apply fuzzy search first
    if (filters.search && fuse) {
      const fuseResults = fuse.search(filters.search);
      // Build a map for quick lookup
      const matchedLessonMap = new Map(
        fuseResults.map(r => [
          r.item.name,
          { ...r.item, _matches: r.matches }
        ])
      );
      result = result
                .filter(lesson => matchedLessonMap.has(lesson.name))
                .map(lesson => matchedLessonMap.get(lesson.name)
      );
    }
    // Apply remaining filters
    return result.filter(lesson => {
      if (filters.ossRole) {
        if (!lesson.oss_role?.includes(filters.ossRole)) return false;
      }
      if (filters.educationalLevel) {
        if (lesson.educationalLevel !== filters.educationalLevel) return false;
      }
      if (filters.learnerCategory) {
        if (lesson.learnerCategory !== filters.learnerCategory) return false;
      }
      return true;
    });
  }, [lessons, filters, fuse]);

      

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
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
      {/* Filter Controls */}
      <div style={{
        background: 'var(--uc-med-gray)',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        border: '2px solid var(--uc-border)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--uc-white)', fontWeight: '600' }}>
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search lessons..."
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--uc-border)',
                background: 'var(--uc-dark-gray)',
                color: 'var(--uc-white)'
              }}
            />
          </div>

          {/* OSS Role */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--uc-white)', fontWeight: '600' }}>
              OSS Role
            </label>
            <select
              value={filters.ossRole}
              onChange={(e) => handleFilterChange('ossRole', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--uc-border)',
                background: 'var(--uc-dark-gray)',
                color: 'var(--uc-white)'
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--uc-white)', fontWeight: '600' }}>
              Skill Level
            </label>
            <select
              value={filters.educationalLevel}
              onChange={(e) => handleFilterChange('educationalLevel', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--uc-border)',
                background: 'var(--uc-dark-gray)',
                color: 'var(--uc-white)'
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--uc-white)', fontWeight: '600' }}>
              Pathway
            </label>
            <select
              value={filters.learnerCategory}
              onChange={(e) => handleFilterChange('learnerCategory', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--uc-border)',
                background: 'var(--uc-dark-gray)',
                color: 'var(--uc-white)'
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
          <p style={{ margin: 0, color: 'var(--uc-light-gray)' }}>
            Showing {filteredLessons.length} of {lessons.length} lessons
          </p>
          <button
            onClick={clearFilters}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid var(--uc-gold)',
              color: 'var(--uc-gold)',
              borderRadius: '4px',
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
            color: 'var(--uc-light-gray)'
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
              matches={lesson._matches}
              pathwayIcon="📚"
            />
          ))
        )}
      </div>
    </div>
  );
}
