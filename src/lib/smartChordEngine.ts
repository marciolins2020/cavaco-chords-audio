// Smart Chord Engine - baseado no sistema CAGED do RZD Music
// Gera acordes usando formas abertas (shapes) ao invés de apenas transpor de C

import { ChordEntry, Fingering } from '@/types/chords';

// Escala cromática completa
export const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const CHORD_TYPES = ['M', 'm', '7', 'm7', 'maj7', '6', 'm6', 'dim', 'm7b5', '5+', 'sus4', '9', 'add9'];

const ROOT_INDICES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Definição de padrão de origem
// Permite definir acordes baseados em sua "Forma Aberta" (e.g. Shape of C, Shape of G)
interface SourcePattern {
  baseRoot: string;    // Nota raiz desta forma específica (e.g. 'G')
  frets: number[];     // Casas [D, G, B, D] - 4 cordas. -1 = mute, 0 = solta
  fingers: number[];   // 0 = solta, 1-4 = dedos indicador a mínimo
  barre?: number;      // Casa da pestana se houver
}

// Biblioteca de "Formas Móveis" comumente usadas no Cavaquinho
// Isso garante que quando pedimos "G Maior", obtemos a forma aberta de G, não uma forma-C transposta
const PATTERNS: Record<string, SourcePattern[]> = {
  'M': [
    { baseRoot: 'C', frets: [2, 0, 1, 2], fingers: [2, 0, 1, 3] },     // Shape C (Clássica)
    { baseRoot: 'G', frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0] },     // Shape G (Aberta)
    { baseRoot: 'D', frets: [0, 2, 3, 4], fingers: [0, 1, 2, 3] },     // Shape D
    { baseRoot: 'A', frets: [2, 2, 2, 2], fingers: [1, 1, 1, 1], barre: 2 }, // Shape A (Pestana)
    { baseRoot: 'F', frets: [3, 2, 1, 3], fingers: [3, 2, 1, 4] }      // Shape F
  ],
  'm': [
    { baseRoot: 'C', frets: [1, 0, 1, 1], fingers: [1, 0, 2, 3] },     // Cm
    { baseRoot: 'G', frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] },     // Gm (Aberta)
    { baseRoot: 'A', frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] },     // Shape Am
    { baseRoot: 'E', frets: [2, 0, 0, 2], fingers: [2, 0, 0, 3] },     // Shape Em
    { baseRoot: 'D', frets: [0, 2, 3, 3], fingers: [0, 1, 2, 3] }      // Shape Dm
  ],
  '7': [
    { baseRoot: 'C', frets: [2, 3, 1, 2], fingers: [2, 3, 1, 4] },
    { baseRoot: 'G', frets: [0, 0, 0, 3], fingers: [0, 0, 0, 1] },     // G7 (Aberta)
    { baseRoot: 'D', frets: [0, 2, 1, 4], fingers: [0, 2, 1, 4] },     // D7
    { baseRoot: 'A', frets: [2, 0, 2, 2], fingers: [1, 0, 2, 3] }      // A7
  ],
  'm7': [
    { baseRoot: 'C', frets: [1, 3, 1, 1], fingers: [1, 3, 1, 1], barre: 1 },
    { baseRoot: 'D', frets: [0, 2, 1, 3], fingers: [0, 2, 1, 3] },     // Dm7
    { baseRoot: 'E', frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0] },     // Em7 (Aberta - E G B D)
    { baseRoot: 'G', frets: [3, 3, 1, 3], fingers: [3, 4, 1, 3], barre: 3 }, // Gm7 (Pestana)
    { baseRoot: 'A', frets: [2, 2, 1, 5], fingers: [2, 3, 1, 4] }      // Am7
  ],
  'maj7': [
    { baseRoot: 'C', frets: [2, 4, 1, 2], fingers: [2, 4, 1, 3] },
    { baseRoot: 'F', frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] },     // Fmaj7
    { baseRoot: 'G', frets: [0, 0, 0, 4], fingers: [0, 0, 0, 4] }      // Gmaj7
  ],
  'dim': [
    { baseRoot: 'C', frets: [1, 2, 1, 4], fingers: [1, 2, 1, 4] },     // Cdim
    { baseRoot: 'D', frets: [0, 1, 0, 1], fingers: [0, 1, 0, 2] }      // Ddim (parcial)
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
    { baseRoot: 'C', frets: [2, 1, 1, 2], fingers: [3, 1, 1, 4] },     // Caug
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

function transposeChord(pattern: SourcePattern, targetRoot: string): Fingering | null {
  const rootIdx = ROOT_INDICES[pattern.baseRoot];
  const targetIdx = ROOT_INDICES[targetRoot];
  
  // Calcula distância em semitons (sempre subindo, módulo 12)
  let semitones = targetIdx - rootIdx;
  if (semitones < 0) semitones += 12;

  const newFrets = pattern.frets.map(f => (f === -1 ? -1 : f + semitones));
  const newFingers = [...pattern.fingers];
  let barre = pattern.barre ? pattern.barre + semitones : undefined;

  // Detecta se precisamos de nova pestana
  // Se múltiplas cordas eram abertas (0) e agora estão presas na mesma casa (semitones),
  // provavelmente precisamos de pestana
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

  // Calcula casa inicial para exibição
  const activeFrets = newFrets.filter(f => f > 0);
  const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 0;
  
  // Se o acorde vai muito alto (e.g. casa 12+), provavelmente não é útil
  if (minFret > 12) return null;

  let startFret = 1;
  if (minFret > 4) {
    startFret = minFret - 1;
  }

  return {
    frets: newFrets as [number, number, number, number],
    fingers: newFingers.map(f => f || null) as [number | null, number | null, number | null, number | null],
    barre: barre ? { fromString: 1, toString: 4, fret: barre } : null,
    startFret,
    label: startFret > 1 ? `${startFret}ª casa` : 'aberto'
  };
}

// Mapeia suffix de exibição para suffix interno
const SUFFIX_DISPLAY_MAP: Record<string, string> = {
  'M': '',
  'm': 'm',
  '7': '7',
  'm7': 'm7',
  'maj7': 'maj7',
  '6': '6',
  'm6': 'm6',
  'dim': 'dim',
  'm7b5': 'm7b5',
  '5+': 'aug',
  'sus4': 'sus4',
  '9': '9',
  'add9': 'add9'
};

// Notas dos intervalos para cada tipo de acorde
const CHORD_INTERVALS: Record<string, string[]> = {
  'M': ['1', '3', '5'],
  'm': ['1', 'b3', '5'],
  '7': ['1', '3', '5', 'b7'],
  'm7': ['1', 'b3', '5', 'b7'],
  'maj7': ['1', '3', '5', '7'],
  '6': ['1', '3', '5', '6'],
  'm6': ['1', 'b3', '5', '6'],
  'dim': ['1', 'b3', 'b5', 'bb7'],
  'm7b5': ['1', 'b3', 'b5', 'b7'],
  '5+': ['1', '3', '#5'],
  'sus4': ['1', '4', '5'],
  '9': ['1', '3', '5', 'b7', '9'],
  'add9': ['1', '3', '5', '9']
};

// Gera as notas do acorde baseado na raiz e intervalos
function getChordNotes(root: string, suffix: string): string[] {
  const intervals = CHORD_INTERVALS[suffix] || ['1', '3', '5'];
  const rootIndex = ROOT_INDICES[root] || 0;
  const noteNames = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  const intervalToSemitones: Record<string, number> = {
    '1': 0, 'b2': 1, '2': 2, 'b3': 3, '3': 4, '4': 5, '#4': 6, 'b5': 6,
    '5': 7, '#5': 8, '6': 9, 'bb7': 9, 'b7': 10, '7': 11, '9': 14 % 12
  };

  return intervals.map(interval => {
    const semitones = intervalToSemitones[interval] || 0;
    return noteNames[(rootIndex + semitones) % 12];
  });
}

export function generateSmartChordDatabase(): ChordEntry[] {
  const chords: ChordEntry[] = [];

  ROOT_NOTES.forEach(targetRoot => {
    CHORD_TYPES.forEach(suffix => {
      const variations: Fingering[] = [];
      
      // Pega templates (específicos ou fallback genérico)
      const templates = PATTERNS[suffix] || [];

      // Tenta transpor TODOS os templates para esta raiz
      templates.forEach(tpl => {
        const variation = transposeChord(tpl, targetRoot);
        if (variation) variations.push(variation);
      });

      // Ordenação: "Best Fit" - acordes mais próximos primeiro
      variations.sort((a, b) => {
        const getAvg = (v: Fingering) => {
          const f = v.frets.filter(x => x > 0);
          if (f.length === 0) return 0;
          return f.reduce((sum, n) => sum + n, 0) / f.length;
        };
        return getAvg(a) - getAvg(b);
      });

      // Remove duplicatas (frets idênticas)
      const uniqueVariations: Fingering[] = [];
      const seen = new Set<string>();
      variations.forEach(v => {
        const key = v.frets.join(',');
        if (!seen.has(key)) {
          seen.add(key);
          uniqueVariations.push(v);
        }
      });

      const quality = SUFFIX_DISPLAY_MAP[suffix] || suffix;
      const displayName = quality === '' ? targetRoot : `${targetRoot}${quality}`;
      
      chords.push({
        id: displayName,
        root: targetRoot,
        quality,
        notes: getChordNotes(targetRoot, suffix),
        intervals: CHORD_INTERVALS[suffix] || ['1', '3', '5'],
        variations: uniqueVariations.slice(0, 5), // Máximo 5 variações
        difficulty: calculateDifficulty(uniqueVariations[0])
      });
    });
  });

  return chords;
}

function calculateDifficulty(variation?: Fingering): 1 | 2 | 3 | 4 | 5 {
  if (!variation) return 3;
  
  const { frets, barre } = variation;
  const activeFrets = frets.filter(f => f > 0);
  const hasOpenStrings = frets.some(f => f === 0);
  const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 0;
  const maxFret = activeFrets.length > 0 ? Math.max(...activeFrets) : 0;
  const span = maxFret - minFret;

  let difficulty = 1;
  
  // Pestana adiciona dificuldade
  if (barre) difficulty += 1;
  
  // Posição alta no braço
  if (minFret > 4) difficulty += 1;
  
  // Abertura grande entre dedos
  if (span >= 3) difficulty += 1;
  
  // Muitos dedos necessários
  if (activeFrets.length >= 4 && !hasOpenStrings) difficulty += 1;

  return Math.min(5, Math.max(1, difficulty)) as 1 | 2 | 3 | 4 | 5;
}

// Exporta banco de dados pronto
export const SMART_CHORD_DB = generateSmartChordDatabase();
