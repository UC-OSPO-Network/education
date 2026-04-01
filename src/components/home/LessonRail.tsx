import { useEffect, useRef, useState } from 'react';
import type { Lesson } from '../../lib/lessons';
import type { ReactNode } from 'react';
import LessonPreviewCard from './LessonPreviewCard';

type LessonRailProps = {
  title: string;
  lessons: Lesson[];
  pathwayIcon?: ReactNode;
  showProgress?: boolean;
  initialVisibleCount?: number;
};

export default function LessonRail({
  title,
  lessons,
  pathwayIcon,
  showProgress = false,
  initialVisibleCount = 3,
}: LessonRailProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const [progress, setProgress] = useState({
    visible: false,
    thumbWidth: 0,
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frameId = 0;

    const updateProgress = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const thumb = thumbRef.current;
        const maxScroll = track.scrollWidth - track.clientWidth;

        if (maxScroll <= 1) {
          setProgress({
            visible: false,
            thumbWidth: 0,
          });
          if (thumb) {
            thumb.style.transform = 'translateX(0)';
          }
          return;
        }

        const thumbWidth = Math.max((track.clientWidth / track.scrollWidth) * 100, 16);
        const thumbOffset = (track.scrollLeft / maxScroll) * (100 - thumbWidth);
        if (thumb) {
          thumb.style.transform = `translateX(${thumbOffset}%)`;
        }

        setProgress({
          visible: true,
          thumbWidth,
        });
      });
    };

    updateProgress();

    track.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    const resizeObserver = new ResizeObserver(updateProgress);
    resizeObserver.observe(track);

    return () => {
      cancelAnimationFrame(frameId);
      track.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      resizeObserver.disconnect();
    };
  }, [lessons.length, initialVisibleCount]);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb || !progress.visible) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 1) {
      thumb.style.transform = 'translateX(0)';
      return;
    }

    const thumbOffset = (track.scrollLeft / maxScroll) * (100 - progress.thumbWidth);
    thumb.style.transform = `translateX(${thumbOffset}%)`;
  }, [progress.visible, progress.thumbWidth]);

  return (
    <section className="home-lesson-rail" aria-label={title}>
      <h3 className="home-lesson-rail__title">{title}</h3>

      <div className="home-lesson-rail__viewport">
        <div className="home-lesson-rail__track" ref={trackRef}>
          {lessons.map((lesson) => (
            <div className="home-lesson-rail__item" key={lesson.slug}>
              <LessonPreviewCard lesson={lesson} pathwayIcon={pathwayIcon} compact />
            </div>
          ))}
        </div>
      </div>

      {showProgress && progress.visible ? (
        <div className="home-lesson-rail__progress" aria-hidden="true">
          <span
            ref={thumbRef}
            className="home-lesson-rail__progress-thumb"
            style={{
              width: `${progress.thumbWidth}%`,
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
