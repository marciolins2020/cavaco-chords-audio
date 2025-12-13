// Smart Chord Database - Sistema CAGED para Cavaquinho
// Baseado no engine do RZD Music com formas abertas (shapes) em vez de apenas transposição

export interface ChordVariation {
  id: string;
  frets: [number, number, number, number];
  fingers: [number, number, number, number];
  barre: { fromString: 1 | 2 | 3 | 4; toString: 1 | 2 | 3 | 4; fret: number } | null;
  startFret: number;
}

export interface ChordDef {
  root: string;
  suffix: string;
  displayName: string;
  variations: ChordVariation[];
}

export interface ChordDatabase {
  version: string;
  chords: ChordDef[];
}

// Afinação padrão do Cavaquinho: D4, G4, B4, D5
export const TUNING_FREQUENCIES = [293.66, 392.00, 493.88, 587.33];

export const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const CHORD_TYPES = [
  'M', 'm', '7', 'm7', 'maj7', 
  '6', 'm6', 'dim', 'm7b5', 
  '5+', 'sus4', '9', 'add9'
];

const ROOT_INDICES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Definição de padrão de origem - formas abertas comuns no cavaquinho
interface SourcePattern {
  baseRoot: string;
  frets: number[];
  fingers: number[];
  barre?: number;
}

// Biblioteca de "Formas Móveis" baseadas no sistema CAGED
// Cada tipo de acorde tem múltiplas formas abertas (C, G, D, A, E, F)
const PATTERNS: Record<string, SourcePattern[]> = {
  'M': [
    { baseRoot: 'C', frets: [2, 0, 1, 2], fingers: [2, 0, 1, 3] },
    { baseRoot: 'G', frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0] },
    { baseRoot: 'D', frets: [0, 2, 3, 4], fingers: [0, 1, 2, 3] },
    { baseRoot: 'A', frets: [2, 2, 2, 2], fingers: [1, 1, 1, 1], barre: 2 },
    { baseRoot: 'F', frets: [3, 2, 1, 3], fingers: [3, 2, 1, 4] }
  ],
  'm': [
    { baseRoot: 'C', frets: [1, 0, 1, 1], fingers: [1, 0, 2, 3] },
    { baseRoot: 'G', frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] },
    { baseRoot: 'A', frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] },
    { baseRoot: 'E', frets: [2, 0, 0, 2], fingers: [2, 0, 0, 3] },
    { baseRoot: 'D', frets: [0, 2, 3, 3], fingers: [0, 1, 2, 3] }
  ],
  '7': [
    { baseRoot: 'C', frets: [2, 3, 1, 2], fingers: [2, 3, 1, 4] },
    { baseRoot: 'G', frets: [0, 0, 0, 3], fingers: [0, 0, 0, 1] },
    { baseRoot: 'D', frets: [0, 2, 1, 4], fingers: [0, 2, 1, 4] },
    { baseRoot: 'A', frets: [2, 0, 2, 2], fingers: [1, 0, 2, 3] }
  ],
  'm7': [
    { baseRoot: 'C', frets: [1, 3, 1, 1], fingers: [1, 3, 1, 1], barre: 1 },
    { baseRoot: 'D', frets: [0, 2, 1, 3], fingers: [0, 2, 1, 3] },
    { baseRoot: 'E', frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0] },
    { baseRoot: 'G', frets: [3, 3, 1, 3], fingers: [3, 4, 1, 3], barre: 3 },
    { baseRoot: 'A', frets: [2, 2, 1, 5], fingers: [2, 3, 1, 4] }
  ],
  'maj7': [
    { baseRoot: 'C', frets: [2, 4, 1, 2], fingers: [2, 4, 1, 3] },
    { baseRoot: 'F', frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] },
    { baseRoot: 'G', frets: [0, 0, 0, 4], fingers: [0, 0, 0, 4] }
  ],
  'dim': [
    { baseRoot: 'C', frets: [1, 2, 1, 4], fingers: [1, 2, 1, 4] },
    { baseRoot: 'D', frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] }
  ],
  'm7b5': [
    { baseRoot: 'C', frets: [4, 3, 1, 1], fingers: [4, 3, 1, 1] },
    { baseRoot: 'D', frets: [0, 1, 1, 0], fingers: [0, 1, 2, 0] },
    { baseRoot: 'A', frets: [1, 0, 1, 1], fingers: [1, 0, 2, 3] }
  ],
  '6': [
    { baseRoot: 'C', frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] },
    { baseRoot: 'G', frets: [0, 2, 0, 0], fingers: [0, 1, 0, 0] }
  ],
  'm6': [
    { baseRoot: 'C', frets: [1, 2, 1, 5], fingers: [1, 2, 1, 4] },
    { baseRoot: 'A', frets: [2, 2, 1, 4], fingers: [2, 3, 1, 4] }
  ],
  '5+': [
    { baseRoot: 'C', frets: [2, 1, 1, 2], fingers: [3, 1, 1, 4] },
    { baseRoot: 'G', frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] }
  ],
  'sus4': [
    { baseRoot: 'C', frets: [3, 0, 1, 3], fingers: [3, 0, 1, 4] },
    { baseRoot: 'D', frets: [0, 2, 3, 5], fingers: [0, 1, 2, 4] },
    { baseRoot: 'G', frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] }
  ],
  '9': [
    { baseRoot: 'C', frets: [2, 3, 1, 0], fingers: [2, 3, 1, 0] },
    { baseRoot: 'G', frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1] },
    { baseRoot: 'D', frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3] }
  ],
  'add9': [
    { baseRoot: 'C', frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] },
    { baseRoot: 'G', frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2] }
  ]
};

function transposeChord(pattern: SourcePattern, targetRoot: string): ChordVariation | null {
  const rootIdx = ROOT_INDICES[pattern.baseRoot];
  const targetIdx = ROOT_INDICES[targetRoot];
  
  let semitones = targetIdx - rootIdx;
  if (semitones < 0) semitones += 12;

  const newFrets = pattern.frets.map(f => (f === -1 ? -1 : f + semitones));
  const newFingers = [...pattern.fingers];
  let barre = pattern.barre ? pattern.barre + semitones : undefined;

  // Detecta quando cordas abertas viram pestana
  const openStringsNowFretted = pattern.frets
    .map((f, i) => ({ old: f, new: newFrets[i], index: i }))
    .filter(s => s.old === 0);

  if (openStringsNowFretted.length >= 2 && semitones > 0) {
    barre = semitones;
    openStringsNowFretted.forEach(s => {
      newFingers[s.index] = 1;
    });
  } else if (openStringsNowFretted.length === 1 && semitones > 0) {
    if (newFingers[openStringsNowFretted[0].index] === 0) {
      newFingers[openStringsNowFretted[0].index] = 1;
    }
  }

  const activeFrets = newFrets.filter(f => f > 0);
  const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 0;
  
  // Ignora acordes muito altos (acima da casa 12)
  if (minFret > 12) return null;

  let startFret = 1;
  if (minFret > 4) {
    startFret = minFret - 1;
  }

  return {
    id: `${targetRoot}-${semitones}-${pattern.baseRoot}`,
    frets: newFrets as [number, number, number, number],
    fingers: newFingers as [number, number, number, number],
    barre: barre ? { fromString: 1, toString: 4, fret: barre } : null,
    startFret
  };
}

function generateFullDatabase(): ChordDatabase {
  const chords: ChordDef[] = [];

  ROOT_NOTES.forEach(targetRoot => {
    CHORD_TYPES.forEach(suffix => {
      const variations: ChordVariation[] = [];
      const templates = PATTERNS[suffix] || [];

      // Transpõe todas as formas para esta raiz
      templates.forEach(tpl => {
        const variation = transposeChord(tpl, targetRoot);
        if (variation) variations.push(variation);
      });

      // Ordena por posição mais próxima primeiro
      variations.sort((a, b) => {
        const getAvg = (v: ChordVariation) => {
          const f = v.frets.filter(x => x > 0);
          if (f.length === 0) return 0;
          return f.reduce((sum, n) => sum + n, 0) / f.length;
        };
        return getAvg(a) - getAvg(b);
      });

      // Remove duplicatas
      const uniqueVariations: ChordVariation[] = [];
      const seen = new Set<string>();
      variations.forEach(v => {
        const key = v.frets.join(',');
        if (!seen.has(key)) {
          seen.add(key);
          uniqueVariations.push(v);
        }
      });

      chords.push({
        root: targetRoot,
        suffix,
        displayName: suffix === 'M' ? targetRoot : `${targetRoot}${suffix}`,
        variations: uniqueVariations.slice(0, 5) // Máximo 5 variações
      });
    });
  });

  return { version: "5.0-smart-caged", chords };
}

export const DEFAULT_DB: ChordDatabase = generateFullDatabase();

export function validateChordDatabase(data: any): data is ChordDatabase {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.chords)) return false;
  
  return data.chords.every((chord: any) => {
    if (!chord.root || !chord.suffix || !Array.isArray(chord.variations)) {
      return false;
    }
    return chord.variations.every((variation: any) => {
      return (
        Array.isArray(variation.frets) &&
        variation.frets.length === 4 &&
        Array.isArray(variation.fingers) &&
        variation.fingers.length === 4 &&
        typeof variation.startFret === "number"
      );
    });
  });
}

export function mergeChordDatabases(
  base: ChordDatabase,
  custom: ChordDatabase
): ChordDatabase {
  const merged = { ...base };
  const chordMap = new Map<string, ChordDef>();
  
  base.chords.forEach((chord) => {
    const key = `${chord.root}-${chord.suffix}`;
    chordMap.set(key, chord);
  });
  
  custom.chords.forEach((chord) => {
    const key = `${chord.root}-${chord.suffix}`;
    chordMap.set(key, chord);
  });
  
  merged.chords = Array.from(chordMap.values());
  return merged;
}
