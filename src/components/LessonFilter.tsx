import { useState, useMemo, useEffect } from 'react';
import LessonCard from './LessonCard.jsx';
import type { SheetRow } from '../lib/getSheetData';


interface LessonFilterProps {
    lessons: SheetRow[];
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

    const filteredLessons = useMemo(() => {
        return lessons.filter((lesson) => {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    lesson.name?.toLowerCase().includes(searchLower) ||
                    lesson.description?.toLowerCase().includes(searchLower) ||
                    lesson.keywords?.toLowerCase().includes(searchLower);

                if (!matchesSearch) return false;
            }

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
    }, [lessons, filters]);

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
                <p>Loading lessons...</p>
            ) : (
                <>
                    <p>
                        Showing {filteredLessons.length} of {lessons.length} lessons
                    </p>

                    {filteredLessons.map((lesson, index) => (
                        <LessonCard key={index} lesson={lesson} pathwayIcon="📚" />
                    ))}
                </>
            )}
        </div>
    );
}
