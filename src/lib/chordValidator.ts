/**
 * Validador Harmônico de Acordes para Cavaquinho (DGBD)
 * Verifica se um diagrama produz as notas corretas do acorde
 */

// Afinação do Cavaquinho: D4, G4, B4, D5
// Cordas: 1=D(grave), 2=G, 3=B, 4=D(agudo)
const OPEN_STRINGS = ['D', 'G', 'B', 'D'];

// Escala cromática (12 notas)
const CHROMATIC = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// Mapeamento de notas para índice cromático
const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5, 'F': 5, 'F#': 6, 'Gb': 6, 
  'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11
};

// Intervalos para cada tipo de acorde
const CHORD_INTERVALS: Record<string, number[]> = {
  'M': [0, 4, 7],                    // 1, 3, 5
  'm': [0, 3, 7],                    // 1, b3, 5
  '7': [0, 4, 7, 10],                // 1, 3, 5, b7
  'm7': [0, 3, 7, 10],               // 1, b3, 5, b7
  'maj7': [0, 4, 7, 11],             // 1, 3, 5, 7
  '7M': [0, 4, 7, 11],               // alias for maj7
  '6': [0, 4, 7, 9],                 // 1, 3, 5, 6
  'm6': [0, 3, 7, 9],                // 1, b3, 5, 6
  'dim': [0, 3, 6, 9],               // 1, b3, b5, bb7 (simétrico)
  'm7b5': [0, 3, 6, 10],             // 1, b3, b5, b7 (meio-diminuto)
  'm7(b5)': [0, 3, 6, 10],           // alias for m7b5
  '5+': [0, 4, 8],                   // 1, 3, #5 (aumentado)
  '(#5)': [0, 4, 8],                 // alias for 5+/aug
  'aug': [0, 4, 8],                  // alias
  '(b5)': [0, 4, 6],                 // 1, 3, b5
  'sus4': [0, 5, 7],                 // 1, 4, 5
  'sus2': [0, 2, 7],                 // 1, 2, 5
  '9': [0, 4, 7, 10, 14],            // 1, 3, 5, b7, 9
  'add9': [0, 4, 7, 14],             // 1, 3, 5, 9
  'madd9': [0, 3, 7, 14],            // 1, b3, 5, 9
  'madd11': [0, 3, 7, 17],           // 1, b3, 5, 11
  '7(9)': [0, 4, 7, 10, 14],         // 1, 3, 5, b7, 9
  '7(13)': [0, 4, 7, 10, 21],        // 1, 3, 5, b7, 13
  '7(b13)': [0, 4, 7, 10, 20],       // 1, 3, 5, b7, b13
  '7(b9)': [0, 4, 7, 10, 13],        // 1, 3, 5, b7, b9
  '7(b5)': [0, 4, 6, 10],            // 1, 3, b5, b7
  '7(#9)': [0, 4, 7, 10, 15],        // 1, 3, 5, b7, #9
  '7(#11)': [0, 4, 7, 10, 18],       // 1, 3, 5, b7, #11
  '6(9)': [0, 4, 7, 9, 14],          // 1, 3, 5, 6, 9
  '6(7M)': [0, 4, 7, 9, 11],         // 1, 3, 5, 6, 7
  '6(7M/9)': [0, 4, 7, 9, 11, 14],   // 1, 3, 5, 6, 7, 9
  '6(#11)': [0, 4, 7, 9, 18],        // 1, 3, 5, 6, #11
  '6(9/#11)': [0, 4, 7, 9, 14, 18],  // 1, 3, 5, 6, 9, #11
  '7M(9)': [0, 4, 7, 11, 14],        // 1, 3, 5, 7, 9
  '7M(#11)': [0, 4, 7, 11, 18],      // 1, 3, 5, 7, #11
  '7M(9/#11)': [0, 4, 7, 11, 14, 18],// 1, 3, 5, 7, 9, #11
  'm7(9)': [0, 3, 7, 10, 14],        // 1, b3, 5, b7, 9
  'm7(11)': [0, 3, 7, 10, 17],       // 1, b3, 5, b7, 11
  'm7(9/11)': [0, 3, 7, 10, 14, 17], // 1, b3, 5, b7, 9, 11
  '7(b9/13)': [0, 4, 7, 10, 13, 21], // 1, 3, 5, b7, b9, 13
  '7(#11/13)': [0, 4, 7, 10, 18, 21],// 1, 3, 5, b7, #11, 13
  '7(#5/#9)': [0, 4, 8, 10, 15],     // 1, 3, #5, b7, #9
};

/**
 * Calcula a nota resultante dado uma corda e um traste
 */
export function getNoteAtFret(stringIndex: number, fret: number): string | null {
  if (fret === -1) return null; // muda (X)
  
  const openNote = OPEN_STRINGS[stringIndex];
  const openIndex = NOTE_TO_INDEX[openNote];
  const noteIndex = (openIndex + fret) % 12;
  
  return CHROMATIC[noteIndex];
}

/**
 * Calcula todas as notas de um diagrama de acorde
 */
export function getNotesFromFrets(frets: number[]): string[] {
  const notes: string[] = [];
  
  frets.forEach((fret, stringIndex) => {
    const note = getNoteAtFret(stringIndex, fret);
    if (note && !notes.includes(note)) {
      notes.push(note);
    }
  });
  
  return notes;
}

/**
 * Calcula as notas esperadas de um acorde
 */
export function getExpectedChordNotes(root: string, suffix: string): string[] {
  const rootIndex = NOTE_TO_INDEX[root];
  if (rootIndex === undefined) return [];
  
  const intervals = CHORD_INTERVALS[suffix] || CHORD_INTERVALS['M'];
  
  return intervals.map(interval => {
    const noteIndex = (rootIndex + (interval % 12)) % 12;
    return CHROMATIC[noteIndex];
  });
}

/**
 * Verifica se um diagrama é harmonicamente válido para um acorde
 * Retorna um objeto com:
 * - isValid: true se todas as notas pertencem ao acorde
 * - hasRoot: true se contém a tônica
 * - coverage: porcentagem das notas do acorde presentes
 * - wrongNotes: notas que não pertencem ao acorde
 */
export function validateChordDiagram(
  root: string, 
  suffix: string, 
  frets: number[]
): {
  isValid: boolean;
  hasRoot: boolean;
  coverage: number;
  wrongNotes: string[];
  diagramNotes: string[];
  expectedNotes: string[];
} {
  const diagramNotes = getNotesFromFrets(frets);
  const expectedNotes = getExpectedChordNotes(root, suffix);
  
  // Verifica se contém a tônica
  const hasRoot = diagramNotes.includes(root);
  
  // Encontra notas "erradas" (não pertencem ao acorde)
  const wrongNotes = diagramNotes.filter(note => !expectedNotes.includes(note));
  
  // Calcula cobertura (quantas notas do acorde estão presentes)
  const presentNotes = expectedNotes.filter(note => diagramNotes.includes(note));
  const coverage = presentNotes.length / expectedNotes.length;
  
  // Um acorde é válido se:
  // 1. Não tem notas erradas
  // 2. Contém a tônica (preferencialmente)
  // 3. Tem boa cobertura (pelo menos 50% das notas)
  const isValid = wrongNotes.length === 0 && coverage >= 0.5;
  
  return {
    isValid,
    hasRoot,
    coverage,
    wrongNotes,
    diagramNotes,
    expectedNotes
  };
}

/**
 * Encontra enarmônicas de uma nota
 */
export function getEnharmonic(note: string): string | null {
  const enharmonics: Record<string, string> = {
    'C#': 'Db', 'Db': 'C#',
    'D#': 'Eb', 'Eb': 'D#',
    'F#': 'Gb', 'Gb': 'F#',
    'G#': 'Ab', 'Ab': 'G#',
    'A#': 'Bb', 'Bb': 'A#'
  };
  return enharmonics[note] || null;
}

/**
 * Normaliza uma nota para sua forma canônica
 */
export function normalizeNote(note: string): number {
  return NOTE_TO_INDEX[note] ?? -1;
}
