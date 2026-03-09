// Utility to generate consistent, URL-safe chord IDs across the app

/**
 * Generates a URL-safe chord ID from root + suffix.
 * Replaces problematic characters: / → _, # → s, ( → -, ) → removed
 */
export function makeChordId(root: string, suffix: string): string {
  const sanitized = suffix
    .replace(/\//g, '_')
    .replace(/#/g, 's')
    .replace(/\(/g, '-')
    .replace(/\)/g, '');
  return root + sanitized;
}

/**
 * Generates a display name for a chord.
 */
export function makeChordDisplayName(root: string, suffix: string): string {
  if (suffix === 'M' || suffix === 'major') return root;
  return `${root}${suffix}`;
}

/**
 * Map of alternative slug forms → canonical suffix used in CHORD_TYPES.
 * This allows URLs like /chord/Cmaj7 to resolve to the chord with suffix '7M'.
 */
const SLUG_ALIASES: Record<string, string> = {
  // maj7 variants
  'maj7': '7M',
  'Maj7': '7M',
  'M7': '7M',
  // dim variants
  'dim': '(b5)',
  'dim7': '(b5)',
  'º': '(b5)',
  // aug / 5+ variants
  'aug': '(s5)',
  '+': '(s5)',
  '5+': '(s5)',
  '5s': '(s5)',
  // m6 doesn't exist in CHORD_TYPES but '6' does for minor context
  // m7b5 variants
  'm7b5': 'm7-b5',
  'm7-b5': 'm7-b5',
  'ø': 'm7-b5',
  // 9 variants
  '9': '7-9',
  // sus4
  'sus': 'sus4',
};

/**
 * Tries to find a chord ID in the database by applying slug aliases.
 * Returns the matching chordDef key (root+suffix) or null.
 */
export function resolveChordSlug(
  urlId: string,
  chordIds: Set<string>
): string | null {
  // 1. Direct match
  if (chordIds.has(urlId)) return urlId;

  // 2. Parse root from the urlId
  const rootMatch = urlId.match(/^([A-G])([bs#]?)/);
  if (!rootMatch) return null;

  // Normalize root: 'b' stays, 's' or '#' → try both
  let root = rootMatch[1];
  const accidental = rootMatch[2];
  if (accidental === 's' || accidental === '#') {
    root += '#';
  } else if (accidental === 'b') {
    root += 'b';
  }
  // Also try enharmonic
  const ENHARMONIC: Record<string, string> = {
    'C#': 'Db', 'Db': 'C#', 'D#': 'Eb', 'Eb': 'D#',
    'F#': 'Gb', 'Gb': 'F#', 'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#',
  };

  const slugSuffix = urlId.slice(rootMatch[0].length);
  const rootsToTry = [root];
  if (ENHARMONIC[root]) rootsToTry.push(ENHARMONIC[root]);

  for (const tryRoot of rootsToTry) {
    // Try the suffix as-is with canonical makeChordId
    const directId = makeChordId(tryRoot, slugSuffix);
    if (chordIds.has(directId)) return directId;

    // Try each alias
    for (const [alias, canonical] of Object.entries(SLUG_ALIASES)) {
      if (slugSuffix.toLowerCase() === alias.toLowerCase()) {
        // Reverse the makeChordId: canonical is already sanitized suffix form
        // But we need to try the original suffix that produces this canonical form
        // Try generating ID directly with the canonical value
        const candidateId = tryRoot + canonical;
        if (chordIds.has(candidateId)) return candidateId;
      }
    }

    // Brute force: try all suffixes that start similarly
    // This catches cases like "m7(b5)" → sanitized "m7-b5"
    // Input slug might be "m7b5" or "m7-b5" etc.
    const lowerSlug = slugSuffix.toLowerCase();
    for (const id of chordIds) {
      if (!id.startsWith(tryRoot)) continue;
      const existingSuffix = id.slice(tryRoot.length).toLowerCase();
      // Normalize both by removing dashes and comparing
      const normExisting = existingSuffix.replace(/[-_]/g, '');
      const normInput = lowerSlug.replace(/[-_]/g, '');
      if (normExisting === normInput) return id;
    }
  }

  return null;
}
