import type { Lesson } from "./lessons";
import { SELF_STUDY_TYPES, teachingTime } from "./lessonDisplay";

const NOT_SUPPLIED = "_not supplied_";

function ns(value: string | undefined | null): string {
  return value && value.trim() ? value : NOT_SUPPLIED;
}

// Mirrors lib/lessons.ts's formatDuration regex — keep both in sync if this changes.
export function parseDurationMinutes(iso: string | undefined | null): number {
  if (!iso?.startsWith("PT")) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ") || "0m";
}

export interface PlanOptions {
  workshopTitle?: string;
  // Computed by the caller from window.location — not hardcoded here.
  sourceUrl: string;
}

export function buildPlanMarkdown(
  lessons: Lesson[],
  opts: PlanOptions,
): string {
  const today = new Date().toISOString().slice(0, 10);

  const lessonBlocks = lessons.map((lesson, i) => {
    const topics = lesson.topics.length ? lesson.topics.join(", ") : NOT_SUPPLIED;
    const duration = ns(teachingTime(lesson)); // excludes self-study by design — see SELF_STUDY_TYPES

    return `### ${i + 1}. ${lesson.name || "Untitled Lesson"}
- **Topics:** ${topics}
- **Sub-topic:** ${ns(lesson.subTopic)}
- **Level:** ${ns(lesson.educationalLevel)} · **Duration:** ${duration}
- **URL:** ${ns(lesson.url)}

**Description:** ${ns(lesson.description)}

**Learning Objectives:**
${ns(lesson.learningObjectives)}

#### Local use
- Planned duration:
- What we'll omit or adapt:
- Setup:
- Instructor notes:
`;
  });

  const totalMinutes = lessons.reduce((sum, lesson) => {
    const type = (lesson.learningResourceType ?? "").toLowerCase().trim();
    if (SELF_STUDY_TYPES.has(type)) return sum;
    return sum + parseDurationMinutes(lesson.timeRequired);
  }, 0);

  return `# Workshop Planning Worksheet
_Generated: ${today} | Source: ${opts.sourceUrl}_

**Workshop / course title:** ${opts.workshopTitle?.trim() || ""}
**Intended learners:**
**Workshop goal:**
**Delivery mode:**
**Date or sessions:**

---

## Lessons (${lessons.length})

${lessonBlocks.join("\n---\n")}

## Total Listed Duration
**${formatMinutes(totalMinutes)}** across ${lessons.length} lessons (source-estimated; excludes self-paced material and does not include breaks, discussion, or setup — adjust for your session).

## Setup Requirements
_List any software, accounts, or data files learners need before the workshop._
`;
}

export function downloadPlan(filename: string, markdown: string): void {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
