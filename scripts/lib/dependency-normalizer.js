const SLUG_TOKEN_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/gi;
const NO_DEPENDENCY_REGEX = /^(?:none|no dependency|n\/a)$/i;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

function normalizeComparable(value) {
  return normalizeString(value)
    .toLowerCase()
    .replace(/\bintro\b/g, 'introduction')
    .replace(/\bbasics\b/g, 'basic')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanUrlToken(value) {
  return normalizeString(value).replace(/[),.;:!?]+$/g, '');
}

function addUnique(values, value) {
  if (!value || values.includes(value)) return;
  values.push(value);
}

function cleanNote(value) {
  return normalizeString(value)
    .replace(/\s+/g, ' ')
    .replace(/^[\s:;,\-.]+/, '')
    .replace(/[\s:;,\-.]+$/, '')
    .trim();
}

export function isSlugToken(value) {
  const token = normalizeString(value).toLowerCase();
  return SLUG_TOKEN_REGEX.test(token) && /[a-z]/.test(token);
}

export function isHttpUrl(value) {
  try {
    const url = new URL(normalizeString(value));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function textLooksLikeExpectedName(text, expectedName) {
  if (!text || !expectedName) return false;
  const left = normalizeComparable(text);
  const right = normalizeComparable(expectedName);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

export function parseDependsOn(rawValue, context = {}) {
  const raw = normalizeString(rawValue);
  if (!raw || NO_DEPENDENCY_REGEX.test(raw)) {
    return { dependsOn: [], prerequisiteNotes: '', issues: [] };
  }

  const sortingIdToSlug = context.sortingIdToSlug ?? new Map();
  const sortingIdToName = context.sortingIdToName ?? new Map();
  const nameToSlug = context.nameToSlug ?? new Map();
  const knownSlugs = context.knownSlugs ?? null;

  const dependsOn = [];
  const notes = [];
  const issues = [];
  const chunks = raw
    .split(/[|\n;]+/)
    .map((chunk) => normalizeString(chunk))
    .filter(Boolean);

  const resolveSlugFromName = (text) => {
    const target = normalizeComparable(text);
    if (!target) return null;

    for (const [name, slug] of nameToSlug.entries()) {
      if (normalizeComparable(name) === target) {
        return slug;
      }
    }

    return null;
  };

  for (const chunk of chunks) {
    if (NO_DEPENDENCY_REGEX.test(chunk)) continue;

    let working = chunk;
    const urls = [...chunk.matchAll(URL_REGEX)].map((match) => cleanUrlToken(match[0])).filter(Boolean);
    for (const url of urls) {
      addUnique(dependsOn, url);
    }
    if (urls.length > 0) {
      working = working.replace(URL_REGEX, ' ');
    }

    working = normalizeString(working);
    if (!working) continue;

    if (isSlugToken(working)) {
      const token = working.toLowerCase();
      if (knownSlugs && knownSlugs.size > 0 && !knownSlugs.has(token)) {
        addUnique(notes, token);
        issues.push(`Unresolved slug-like token "${token}" in "${chunk}"`);
      } else {
        addUnique(dependsOn, token);
      }
      continue;
    }

    const embeddedSlugTokens = [
      ...working.matchAll(/\b[a-z0-9]+(?:-[a-z0-9]+)+\b/gi),
    ].map((match) => match[0].toLowerCase());
    for (const token of embeddedSlugTokens) {
      if (knownSlugs && knownSlugs.size > 0 && !knownSlugs.has(token)) {
        addUnique(notes, token);
        issues.push(`Unresolved slug-like token "${token}" in "${chunk}"`);
        continue;
      }
      addUnique(dependsOn, token);
    }
    if (embeddedSlugTokens.length > 0) {
      working = working.replace(/\b[a-z0-9]+(?:-[a-z0-9]+)+\b/gi, ' ');
    }

    const idMatches = [...working.matchAll(/\b(\d+)\b(?:\s*[–—-]\s*([^|;\n,]+))?/g)];
    const ids = idMatches.map((match) => String(Number(match[1])));
    if (ids.length === 0) {
      const note = cleanNote(working);
      if (note) addUnique(notes, note);
      continue;
    }

    for (const match of idMatches) {
      const id = String(Number(match[1]));
      const titleText = normalizeString(match[2] || '');
      const slugFromId = sortingIdToSlug.get(id);
      const slugFromTitle = titleText ? resolveSlugFromName(titleText) : null;

      if (slugFromTitle && (!slugFromId || slugFromTitle !== slugFromId)) {
        addUnique(dependsOn, slugFromTitle);
        if (slugFromId) {
          issues.push(
            `Sorting ID/name mismatch "${id}" -> "${sortingIdToName.get(id)}" but text says "${titleText}"`
          );
        }
      } else if (slugFromId) {
        addUnique(dependsOn, slugFromId);
      } else if (slugFromTitle) {
        addUnique(dependsOn, slugFromTitle);
      } else {
        issues.push(`Unresolved sorting ID "${id}" in "${chunk}"`);
      }
    }

    let noteCandidate = working;
    for (const match of idMatches) {
      const id = String(Number(match[1]));
      const titleText = normalizeString(match[2] || '');
      const expectedName = sortingIdToName.get(id) || '';
      const fullMatch = normalizeString(match[0]);

      if (!titleText) {
        noteCandidate = noteCandidate.replace(new RegExp(`\\b${id}\\b`, 'g'), ' ');
        continue;
      }

      // Reference-like numeric entries should not leak into prose notes.
      // Keep only free-form explanatory text after stripping the ID marker.
      if (textLooksLikeExpectedName(titleText, expectedName)) {
        noteCandidate = noteCandidate.replace(fullMatch, ' ');
      } else {
        noteCandidate = noteCandidate.replace(new RegExp(`\\b${id}\\b\\s*[–—-]\\s*`, 'g'), ' ');
      }
    }

    noteCandidate = noteCandidate.replace(/\s*,\s*/g, ' ');
    noteCandidate = noteCandidate.replace(/\b(?:and|or)\b/gi, ' ');
    const note = cleanNote(noteCandidate);
    if (note) addUnique(notes, note);
  }

  if (knownSlugs && knownSlugs.size > 0) {
    for (const ref of dependsOn) {
      if (isHttpUrl(ref)) continue;
      if (!knownSlugs.has(ref)) {
        issues.push(`Unresolved slug reference "${ref}"`);
      }
    }
  }

  return {
    dependsOn,
    prerequisiteNotes: notes.join(' | '),
    issues,
  };
}
