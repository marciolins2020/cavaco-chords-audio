// Smart Chord Database - Sistema CAGED para Cavaquinho COM Validação Harmônica
// Todas as formas são verificadas para produzir as notas corretas na afinação DGBD

import { validateChordDiagram, getExpectedChordNotes } from '@/lib/chordValidator';

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
  notes?: string[];
  intervals?: string[];
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

// Intervalos para cada tipo de acorde
const CHORD_INTERVALS: Record<string, string[]> = {
  'M': ['1', '3', '5'],
  'm': ['1', 'b3', '5'],
  '7': ['1', '3', '5', 'b7'],
  'm7': ['1', 'b3', '5', 'b7'],
  'maj7': ['1', '3', '5', '7'],
  '6': ['1', '3', '5', '6'],
  'm6': ['1', 'b3', '5', '6'],
  'dim': ['1', 'b3', 'b5'],
  'm7b5': ['1', 'b3', 'b5', 'b7'],
  '5+': ['1', '3', '#5'],
  'sus4': ['1', '4', '5'],
  '9': ['1', '3', '5', 'b7', '9'],
  'add9': ['1', '3', '5', '9']
};

// Definição de padrão de origem - formas abertas verificadas manualmente
interface SourcePattern {
  baseRoot: string;
  frets: number[];
  fingers: number[];
  barre?: number;
}

// BIBLIOTECA DE FORMAS VERIFICADAS para afinação DGBD
// Cada forma foi validada manualmente para produzir as notas corretas do acorde
const VERIFIED_PATTERNS: Record<string, SourcePattern[]> = {
  'M': [
    // C: C-E-G -> [2,0,1,2] = E,G,C,E ✓
    { baseRoot: 'C', frets: [2, 0, 1, 2], fingers: [2, 0, 1, 3] },
    // G: G-B-D -> [0,0,0,0] = D,G,B,D ✓
    { baseRoot: 'G', frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0] },
    // D: D-F#-A -> [0,2,3,4] = D,A,D,F# ✓
    { baseRoot: 'D', frets: [0, 2, 3, 4], fingers: [0, 1, 2, 3] },
    // F: F-A-C -> [3,2,1,3] = F,A,C,F ✓
    { baseRoot: 'F', frets: [3, 2, 1, 3], fingers: [3, 2, 1, 4] },
  ],
  'm': [
    // Dm: D-F-A -> [0,2,3,3] = D,A,D,F ✓
    { baseRoot: 'D', frets: [0, 2, 3, 3], fingers: [0, 1, 2, 3] },
    // Em: E-G-B -> [2,0,0,2] = E,G,B,E ✓
    { baseRoot: 'E', frets: [2, 0, 0, 2], fingers: [2, 0, 0, 3] },
    // Am: A-C-E -> [7,5,5,7] = A,C,E,A ✓
    { baseRoot: 'A', frets: [7, 5, 5, 7], fingers: [3, 1, 1, 4], barre: 5 },
    // Cm: C-Eb-G -> [1,0,1,1] = Eb,G,C,Eb ✓
    { baseRoot: 'C', frets: [1, 0, 1, 1], fingers: [1, 0, 2, 3] },
  ],
  '7': [
    // G7: G-B-D-F -> [0,0,0,3] = D,G,B,F ✓
    { baseRoot: 'G', frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
    // D7: D-F#-A-C -> [0,2,1,4] = D,A,C,F# ✓
    { baseRoot: 'D', frets: [0, 2, 1, 4], fingers: [0, 2, 1, 4] },
    // E7: E-G#-B-D -> [0,1,0,2] = D,G#,B,E ✓
    { baseRoot: 'E', frets: [0, 1, 0, 2], fingers: [0, 1, 0, 2] },
    // C7: C-E-G-Bb -> [2,3,1,2] = E,Bb,C,E ✓ (voicing sem G)
    { baseRoot: 'C', frets: [2, 3, 1, 2], fingers: [2, 3, 1, 4] },
  ],
  'm7': [
    // Dm7: D-F-A-C -> [0,2,1,3] = D,A,C,F ✓
    { baseRoot: 'D', frets: [0, 2, 1, 3], fingers: [0, 2, 1, 3] },
    // Em7: E-G-B-D -> [0,0,0,2] = D,G,B,E ✓
    { baseRoot: 'E', frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2] },
    // Am7: A-C-E-G -> [7,5,5,5] = A,C,E,G ✓
    { baseRoot: 'A', frets: [7, 5, 5, 5], fingers: [4, 1, 1, 1], barre: 5 },
    // Gm7: G-Bb-D-F -> [5,3,3,3] = G,Bb,D,F ✓
    { baseRoot: 'G', frets: [5, 3, 3, 3], fingers: [4, 1, 1, 1], barre: 3 },
  ],
  'maj7': [
    // Gmaj7: G-B-D-F# -> [0,0,0,4] = D,G,B,F# ✓
    { baseRoot: 'G', frets: [0, 0, 0, 4], fingers: [0, 0, 0, 4] },
    // Fmaj7: F-A-C-E -> [3,2,1,2] = F,A,C,E ✓
    { baseRoot: 'F', frets: [3, 2, 1, 2], fingers: [3, 2, 1, 4] },
    // Dmaj7: D-F#-A-C# -> [0,2,2,4] = D,A,C#,F# ✓
    { baseRoot: 'D', frets: [0, 2, 2, 4], fingers: [0, 1, 2, 4] },
  ],
  '6': [
    // G6: G-B-D-E -> [0,0,0,2] = D,G,B,E ✓
    { baseRoot: 'G', frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2] },
    // D6: D-F#-A-B -> [0,2,0,4] = D,A,B,F# ✓
    { baseRoot: 'D', frets: [0, 2, 0, 4], fingers: [0, 2, 0, 4] },
    // C6: C-E-G-A -> [2,2,1,2] = E,A,C,E ✓ (voicing)
    { baseRoot: 'C', frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] },
  ],
  'm6': [
    // Dm6: D-F-A-B -> [0,2,0,3] = D,A,B,F ✓
    { baseRoot: 'D', frets: [0, 2, 0, 3], fingers: [0, 2, 0, 3] },
    // Am6: A-C-E-F# -> [2,2,1,4] = E,A,C,F# ✓
    { baseRoot: 'A', frets: [2, 2, 1, 4], fingers: [2, 3, 1, 4] },
  ],
  'dim': [
    // Ddim: D-F-Ab -> [0,1,0,3] = D,Ab,B,F ✗ B errado
    // Corrigido: [0,1,3,3] = D,Ab,D,F ✓ (sem terça, mas válido)
    { baseRoot: 'D', frets: [0, 1, 3, 3], fingers: [0, 1, 2, 3] },
  ],
  'm7b5': [
    // Dm7b5: D-F-Ab-C -> [0,1,1,3] = D,Ab,C,F ✓
    { baseRoot: 'D', frets: [0, 1, 1, 3], fingers: [0, 1, 2, 4] },
    // Bm7b5: B-D-F-A -> [0,2,0,3] = D,A,B,F ✓
    { baseRoot: 'B', frets: [0, 2, 0, 3], fingers: [0, 2, 0, 3] },
  ],
  '5+': [
    // Caug: C-E-G# -> [2,1,1,2] = E,G#,C,E ✓
    { baseRoot: 'C', frets: [2, 1, 1, 2], fingers: [3, 1, 1, 4], barre: 1 },
    // Gaug: G-B-D# -> [0,0,0,1] = D,G,B,D# ✓
    { baseRoot: 'G', frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1] },
  ],
  'sus4': [
    // Gsus4: G-C-D -> [0,0,1,0] = D,G,C,D ✓
    { baseRoot: 'G', frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] },
    // Dsus4: D-G-A -> [0,0,0,5] = D,G,B,G ✗
    // Corrigido: [0,2,3,5] = D,A,D,G ✓
    { baseRoot: 'D', frets: [0, 2, 3, 5], fingers: [0, 1, 2, 4] },
    // Csus4: C-F-G -> [3,0,1,3] = F,G,C,F ✓
    { baseRoot: 'C', frets: [3, 0, 1, 3], fingers: [3, 0, 1, 4] },
  ],
  '9': [
    // D9: D-F#-A-C-E -> [0,2,1,2] = D,A,C,E ✓ (voicing sem F#)
    { baseRoot: 'D', frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3] },
    // C9: C-E-G-Bb-D -> [0,3,1,2] = D,Bb,C,E ✓
    { baseRoot: 'C', frets: [0, 3, 1, 2], fingers: [0, 3, 1, 2] },
  ],
  'add9': [
    // Gadd9: G-B-D-A -> [0,2,0,0] = D,A,B,D ✓ (voicing)
    { baseRoot: 'G', frets: [0, 2, 0, 0], fingers: [0, 1, 0, 0] },
    // Cadd9: C-E-G-D -> [0,0,1,2] = D,G,C,E ✓
    { baseRoot: 'C', frets: [0, 0, 1, 2], fingers: [0, 0, 1, 2] },
    // Dadd9: D-F#-A-E -> [0,2,5,4] = D,A,E,F# ✓
    { baseRoot: 'D', frets: [0, 2, 5, 4], fingers: [0, 1, 4, 3] },
  ]
};

// Função de transposição COM validação harmônica
function transposeChordWithValidation(
  pattern: SourcePattern, 
  targetRoot: string,
  targetSuffix: string
): ChordVariation | null {
  const rootIdx = ROOT_INDICES[pattern.baseRoot];
  const targetIdx = ROOT_INDICES[targetRoot];
  
  if (rootIdx === undefined || targetIdx === undefined) return null;
  
  let semitones = targetIdx - rootIdx;
  if (semitones < 0) semitones += 12;

  // Se é o mesmo acorde, retorna a forma original (já validada)
  if (semitones === 0) {
    const validation = validateChordDiagram(targetRoot, targetSuffix, pattern.frets);
    if (!validation.isValid) {
      console.warn(`Forma base inválida: ${targetRoot}${targetSuffix}`, validation);
      return null;
    }
    
    const activeFrets = pattern.frets.filter(f => f > 0);
    const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 0;
    let startFret = 1;
    if (minFret > 4) startFret = minFret - 1;
    
    return {
      id: `${targetRoot}-${targetSuffix}-base`,
      frets: pattern.frets as [number, number, number, number],
      fingers: pattern.fingers.map(f => f || 0) as [number, number, number, number],
      barre: pattern.barre ? { fromString: 1, toString: 4, fret: pattern.barre } : null,
      startFret
    };
  }

  // Transpõe todos os trastes
  const newFrets = pattern.frets.map(f => (f === -1 ? -1 : f + semitones));
  const newFingers = [...pattern.fingers];
  let barre = pattern.barre ? pattern.barre + semitones : undefined;

  // VALIDAÇÃO HARMÔNICA: verifica se as notas resultantes pertencem ao acorde
  const validation = validateChordDiagram(targetRoot, targetSuffix, newFrets);
  
  if (!validation.isValid) {
    // Acorde transposto tem notas erradas - REJEITA
    return null;
  }

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
    id: `${targetRoot}-${targetSuffix}-${semitones}`,
    frets: newFrets as [number, number, number, number],
    fingers: newFingers.map(f => f || 0) as [number, number, number, number],
    barre: barre ? { fromString: 1, toString: 4, fret: barre } : null,
    startFret
  };
}

function generateFullDatabase(): ChordDatabase {
  const chords: ChordDef[] = [];

  ROOT_NOTES.forEach(targetRoot => {
    CHORD_TYPES.forEach(suffix => {
      const variations: ChordVariation[] = [];
      const templates = VERIFIED_PATTERNS[suffix] || [];

      // Transpõe todas as formas COM validação harmônica
      templates.forEach(tpl => {
        const variation = transposeChordWithValidation(tpl, targetRoot, suffix);
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

      // Obtém as notas teóricas do acorde
      const notes = getExpectedChordNotes(targetRoot, suffix);

      chords.push({
        root: targetRoot,
        suffix,
        displayName: suffix === 'M' ? targetRoot : `${targetRoot}${suffix}`,
        variations: uniqueVariations.slice(0, 5), // Máximo 5 variações
        notes,
        intervals: CHORD_INTERVALS[suffix] || ['1', '3', '5']
      });
    });
  });

  return { version: "6.0-validated", chords };
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
