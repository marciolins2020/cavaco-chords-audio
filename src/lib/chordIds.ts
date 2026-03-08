// Utility to generate consistent, URL-safe chord IDs across the app

/**
 * Generates a URL-safe chord ID from root + suffix.
 * Replaces problematic characters: / → _, # → s, ( → -, ) → removed
 */
export function makeChordId(root: string, suffix: string): string {
  // For suffixes that exist in SUFFIX_MAP, use quality; otherwise use suffix directly
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
