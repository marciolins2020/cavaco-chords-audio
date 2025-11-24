// Type definitions for chord database
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

// Standard Cavaquinho Tuning: D4, G4, B4, D5
export const TUNING_FREQUENCIES = [293.66, 392.00, 493.88, 587.33];

export const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const CHORD_TYPES = [
  'M', 'm', '7', 'm7', 'maj7', 
  '6', 'm6', 'dim', 'm7b5', 
  '5+', 'sus4', '9'
];

// Base Templates (C Root)
const BASE_TEMPLATES: Record<string, { frets: number[], fingers: number[], barre?: number }[]> = {
  'M': [
    { frets: [2, 0, 1, 2], fingers: [2, 0, 1, 3] },
    { frets: [5, 5, 5, 5], fingers: [1, 1, 1, 1], barre: 5 },
    { frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] }
  ],
  'm': [
    { frets: [1, 0, 1, 1], fingers: [1, 0, 2, 3] },
    { frets: [5, 3, 4, 5], fingers: [3, 1, 2, 4] },
    { frets: [10, 8, 8, 10], fingers: [3, 1, 1, 4], barre: 8 }
  ],
  '7': [
    { frets: [2, 3, 1, 2], fingers: [2, 3, 1, 4] },
    { frets: [5, 3, 5, 5], fingers: [2, 1, 3, 4] },
    { frets: [8, 9, 8, 10], fingers: [1, 2, 1, 3], barre: 8 }
  ],
  'm7': [
    { frets: [1, 3, 1, 1], fingers: [1, 3, 1, 1], barre: 1 },
    { frets: [5, 3, 4, 3], fingers: [3, 1, 2, 1] },
    { frets: [8, 8, 8, 8], fingers: [1, 1, 1, 1], barre: 8 }
  ],
  'maj7': [
    { frets: [2, 4, 1, 2], fingers: [2, 4, 1, 3] },
    { frets: [5, 4, 5, 5], fingers: [2, 1, 3, 4] },
    { frets: [9, 9, 8, 9], fingers: [2, 3, 1, 4] }
  ],
  '6': [
    { frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] },
    { frets: [5, 2, 3, 5], fingers: [3, 1, 2, 4] }
  ],
  'm6': [
    { frets: [1, 2, 1, 5], fingers: [1, 2, 1, 4] },
    { frets: [5, 5, 4, 5], fingers: [3, 3, 1, 3], barre: 5 }
  ],
  'dim': [
    { frets: [1, 2, 1, 4], fingers: [1, 2, 1, 4] }, // Correct Symmetrical Shape
    { frets: [4, 5, 4, 7], fingers: [1, 2, 1, 4] }
  ],
  'm7b5': [
    { frets: [4, 3, 1, 1], fingers: [4, 3, 1, 1] },
    { frets: [8, 6, 7, 8], fingers: [3, 1, 2, 4] } 
  ],
  '5+': [
    { frets: [2, 1, 1, 2], fingers: [3, 1, 1, 2] },
    { frets: [6, 5, 5, 6], fingers: [3, 1, 1, 2] }
  ],
  'sus4': [
    { frets: [3, 0, 1, 3], fingers: [3, 0, 1, 4] },
    { frets: [5, 5, 6, 5], fingers: [1, 1, 2, 1], barre: 5 }
  ],
  '9': [
    { frets: [2, 3, 1, 0], fingers: [2, 3, 1, 0] },
    { frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] },
    { frets: [5, 3, 5, 5], fingers: [2, 1, 3, 4] }
  ]
};

const ROOT_OFFSETS: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

function generateFullDatabase(): ChordDatabase {
  const chords: ChordDef[] = [];
  ROOT_NOTES.forEach(root => {
    const offset = ROOT_OFFSETS[root] || 0;
    CHORD_TYPES.forEach(suffix => {
      const templates = BASE_TEMPLATES[suffix] || [];
      const variations: ChordVariation[] = [];
      templates.forEach((tpl, index) => {
        const newFrets = tpl.frets.map(fret => fret === -1 ? -1 : fret + offset);
        const activeFrets = newFrets.filter(f => f > 0);
        const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 0;
        let startingFret = 1;
        if (minFret > 3) startingFret = minFret - 1; 
        
        const newBarre = tpl.barre ? tpl.barre + offset : undefined;

        variations.push({
          id: `${root}-${suffix}-${index}`,
          frets: newFrets as [number, number, number, number],
          fingers: tpl.fingers as [number, number, number, number],
          barre: newBarre ? {
            fromString: 1 as 1 | 2 | 3 | 4,
            toString: 4 as 1 | 2 | 3 | 4,
            fret: newBarre
          } : null,
          startFret: startingFret
        });
      });
      chords.push({
        root, suffix, displayName: suffix === 'M' ? root : `${root}${suffix}`, variations
      });
    });
  });
  return { version: "4.0-advanced", chords };
}

export const DEFAULT_DB: ChordDatabase = generateFullDatabase();

/**
 * Valida se um objeto JSON tem a estrutura correta de ChordDatabase
 */
export function validateChordDatabase(data: any): data is ChordDatabase {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.chords)) return false;
  
  // Valida estrutura básica de cada acorde
  return data.chords.every((chord: any) => {
    if (!chord.root || !chord.suffix || !Array.isArray(chord.variations)) {
      return false;
    }
    
    // Valida cada variação
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

/**
 * Mescla dois bancos de dados de acordes
 * Acordes personalizados sobrescrevem os padrão se tiverem o mesmo root+suffix
 */
export function mergeChordDatabases(
  base: ChordDatabase,
  custom: ChordDatabase
): ChordDatabase {
  const merged = { ...base };
  const chordMap = new Map<string, ChordDef>();
  
  // Adiciona acordes base
  base.chords.forEach((chord) => {
    const key = `${chord.root}-${chord.suffix}`;
    chordMap.set(key, chord);
  });
  
  // Sobrescreve/adiciona acordes customizados
  custom.chords.forEach((chord) => {
    const key = `${chord.root}-${chord.suffix}`;
    chordMap.set(key, chord);
  });
  
  merged.chords = Array.from(chordMap.values());
  return merged;
}
