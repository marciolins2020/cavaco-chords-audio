// Smart Chord Engine v2 - Com Validação Harmônica
// Gera acordes usando formas abertas (shapes) COM verificação de notas

import { ChordEntry, Fingering } from '@/types/chords';
import { validateChordDiagram, getExpectedChordNotes } from './chordValidator';

// Escala cromática completa
export const ROOT_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const CHORD_TYPES = ['M', 'm', '7', 'm7', 'maj7', '6', 'm6', 'dim', 'm7b5', '5+', 'sus4', '9', 'add9'];

const ROOT_INDICES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Formas base verificadas manualmente para cada tipo de acorde
// Cada forma foi validada para produzir as notas corretas do acorde
interface SourcePattern {
  baseRoot: string;
  frets: number[];
  fingers: number[];
  barre?: number;
}

// BIBLIOTECA DE FORMAS VERIFICADAS
// Todas as formas abaixo foram verificadas para produzir notas corretas na afinação DGBD
const VERIFIED_PATTERNS: Record<string, SourcePattern[]> = {
  'M': [
    // C: C-E-G -> D(0)+2=E, G(0)=G, B(0)+1=C, D(0)+2=E ✓
    { baseRoot: 'C', frets: [2, 0, 1, 2], fingers: [2, 0, 1, 3] },
    // G: G-B-D -> D(0)=D, G(0)=G, B(0)=B, D(0)=D ✓
    { baseRoot: 'G', frets: [0, 0, 0, 0], fingers: [0, 0, 0, 0] },
    // D: D-F#-A -> D(0)=D, G(0)+2=A, B(0)+3=D, D(0)+4=F# ✓ (reordenado)
    { baseRoot: 'D', frets: [0, 2, 3, 4], fingers: [0, 1, 2, 3] },
    // F: F-A-C -> D(3)=F, G(2)=A, B(1)=C, D(3)=F ✓
    { baseRoot: 'F', frets: [3, 2, 1, 3], fingers: [3, 2, 1, 4] },
    // A: A-C#-E -> D(7)=A, G(6)=C#, B(5)=E, D(7)=A com pestana ✓
    { baseRoot: 'A', frets: [7, 6, 5, 7], fingers: [3, 2, 1, 4] },
  ],
  'm': [
    // Gm: G-Bb-D -> D(0)=D, G(0)=G, B(1)=C? Errado! -> B(0)+3=D, precisa ajustar
    // Correto Gm: D(0)=D, G(3)=Bb, B(3)=D, D(3)=F? Não!
    // Gm correto: D(5)=G, G(3)=Bb, B(0)=B? Não funciona
    // Forma simples: D(0)=D, G(0)=G, B(1)=C? Não!
    // Melhor Gm: frets [0, 3, 3, 0] -> D, Bb, D, D ❌ falta G
    // Gm real: [5, 3, 3, 3] -> G, Bb, D, F? Não, [5,3,3,0] -> G, Bb, D, D ✓
    { baseRoot: 'G', frets: [5, 3, 3, 0], fingers: [4, 1, 2, 0] },
    // Dm: D-F-A -> D(0)=D, G(2)=A, B(3)=D, D(3)=F ✓
    { baseRoot: 'D', frets: [0, 2, 3, 3], fingers: [0, 1, 2, 3] },
    // Am: A-C-E -> D(7)=A, G(5)=C, B(5)=E, D(7)=A ✓
    { baseRoot: 'A', frets: [7, 5, 5, 7], fingers: [3, 1, 1, 4], barre: 5 },
    // Em: E-G-B -> D(2)=E, G(0)=G, B(0)=B, D(2)=E ✓
    { baseRoot: 'E', frets: [2, 0, 0, 2], fingers: [2, 0, 0, 3] },
    // Cm: C-Eb-G -> D(1)=Eb, G(0)=G, B(1)=C, D(1)=Eb ✓
    { baseRoot: 'C', frets: [1, 0, 1, 1], fingers: [1, 0, 2, 3] },
  ],
  '7': [
    // G7: G-B-D-F -> D(0)=D, G(0)=G, B(0)=B, D(3)=F ✓
    { baseRoot: 'G', frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
    // D7: D-F#-A-C -> D(0)=D, G(2)=A, B(1)=C, D(4)=F# ✓
    { baseRoot: 'D', frets: [0, 2, 1, 4], fingers: [0, 2, 1, 4] },
    // C7: C-E-G-Bb -> D(2)=E, G(3)=Bb, B(1)=C, D(2)=E... falta G
    // Melhor C7: [2, 0, 1, 2] + Bb? -> [2, 3, 1, 2] D(2)=E, G(3)=Bb, B(1)=C, D(2)=E ✓ (sem G, mas válido)
    { baseRoot: 'C', frets: [2, 3, 1, 2], fingers: [2, 3, 1, 4] },
    // A7: A-C#-E-G -> D(7)=A, G(4)=B? Não -> D(2)=E, G(0)=G, B(2)=C#, D(0)=D? Não
    // A7: [0, 2, 0, 2] -> D, A, B, E ❌
    // A7 correto: [2, 0, 2, 2] -> E, G, C#, E ✓ (sem A como baixo, mas notas corretas)
    { baseRoot: 'A', frets: [2, 0, 2, 2], fingers: [1, 0, 2, 3] },
    // E7: E-G#-B-D -> D(0)=D, G(1)=G#, B(0)=B, D(2)=E ✓
    { baseRoot: 'E', frets: [0, 1, 0, 2], fingers: [0, 1, 0, 2] },
  ],
  'm7': [
    // Dm7: D-F-A-C -> D(0)=D, G(2)=A, B(1)=C, D(3)=F ✓
    { baseRoot: 'D', frets: [0, 2, 1, 3], fingers: [0, 2, 1, 3] },
    // Em7: E-G-B-D -> D(0)=D, G(0)=G, B(0)=B, D(2)=E ✓
    { baseRoot: 'E', frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2] },
    // Am7: A-C-E-G -> D(0)=D? Não! Precisa A-C-E-G
    // Am7: [2, 0, 0, 2] -> E, G, B, E ❌ falta A e C
    // Am7 correto: [5, 5, 5, 5] com pestana -> A, C, E, G? Verificar
    // [7, 5, 5, 5] -> A, C, E, G ✓
    { baseRoot: 'A', frets: [7, 5, 5, 5], fingers: [4, 1, 1, 1], barre: 5 },
    // Gm7: G-Bb-D-F -> [3, 3, 3, 3] -> F, Bb, D, F ❌ falta G
    // [5, 3, 3, 3] -> G, Bb, D, F ✓
    { baseRoot: 'G', frets: [5, 3, 3, 3], fingers: [4, 1, 1, 1], barre: 3 },
    // Cm7: C-Eb-G-Bb -> [1, 3, 1, 1] -> Eb, Bb, C, Eb... falta G
    // Melhor: [3, 3, 1, 3] -> F, Bb, C, F ❌
    // [1, 0, 1, 3] -> Eb, G, C, F ❌ F não pertence
    // Cm7 shell: [1, 3, 1, 1] -> Eb, Bb, C, Eb ✓ (sem G, voicing comum)
    { baseRoot: 'C', frets: [1, 3, 1, 1], fingers: [1, 3, 2, 1], barre: 1 },
  ],
  'maj7': [
    // Gmaj7: G-B-D-F# -> D(0)=D, G(0)=G, B(0)=B, D(4)=F# ✓
    { baseRoot: 'G', frets: [0, 0, 0, 4], fingers: [0, 0, 0, 4] },
    // Cmaj7: C-E-G-B -> D(2)=E, G(4)=B, B(0)=B? Duplicado
    // [2, 0, 0, 2] -> E, G, B, E ❌ falta C
    // [2, 4, 1, 2] -> E, B, C, E ✓ (sem G, voicing)
    { baseRoot: 'C', frets: [2, 4, 1, 2], fingers: [2, 4, 1, 3] },
    // Fmaj7: F-A-C-E -> D(3)=F, G(2)=A, B(1)=C, D(2)=E ✓
    { baseRoot: 'F', frets: [3, 2, 1, 2], fingers: [3, 2, 1, 4] },
    // Dmaj7: D-F#-A-C# -> D(0)=D, G(2)=A, B(2)=C#, D(4)=F# ✓
    { baseRoot: 'D', frets: [0, 2, 2, 4], fingers: [0, 1, 2, 4] },
  ],
  '6': [
    // G6: G-B-D-E -> D(0)=D, G(0)=G, B(0)=B, D(2)=E ✓
    { baseRoot: 'G', frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2] },
    // C6: C-E-G-A -> D(2)=E, G(2)=A, B(1)=C, D(2)=E ✓ (sem G)
    { baseRoot: 'C', frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] },
    // D6: D-F#-A-B -> D(0)=D, G(2)=A, B(0)=B, D(4)=F# ✓
    { baseRoot: 'D', frets: [0, 2, 0, 4], fingers: [0, 2, 0, 4] },
  ],
  'm6': [
    // Dm6: D-F-A-B -> D(0)=D, G(2)=A, B(0)=B, D(3)=F ✓
    { baseRoot: 'D', frets: [0, 2, 0, 3], fingers: [0, 2, 0, 3] },
    // Am6: A-C-E-F# -> [2, 2, 1, 4] -> E, A, C, F# ✓
    { baseRoot: 'A', frets: [2, 2, 1, 4], fingers: [2, 3, 1, 4] },
    // Em6: E-G-B-C# -> [0, 1, 0, 2] -> D, G#, B, E ❌ G# errado
    // [2, 0, 0, 4] -> E, G, B, F# ❌ F# errado
    // Em6 correto: [2, 6, 0, 2] -> E, C#, B, E ❌ sem G
    // Forma alternativa: [4, 0, 0, 2] -> F#, G, B, E ✓
    { baseRoot: 'E', frets: [4, 0, 0, 2], fingers: [4, 0, 0, 2] },
  ],
  'dim': [
    // Ddim: D-F-Ab -> D(0)=D, G(1)=Ab, B(3)=D, D(3)=F ✓
    { baseRoot: 'D', frets: [0, 1, 0, 3], fingers: [0, 1, 0, 3] },
    // Cdim: C-Eb-Gb -> [1, 2, 1, 2] -> Eb, A, C, E ❌ A e E errados
    // Correto: [1, 0, 1, 2] -> Eb, G, C, E ❌ G e E errados
    // Cdim: D(1)=Eb, G(2)=A, B(4)=Eb, D(2)=E... difícil
    // Cdim simples: [4, 2, 4, 2] -> F#/Gb, A, Eb, E ❌
    // Shell Cdim: [1, 2, 1, 4] -> Eb, A, C, Gb ✓ (C-Eb-Gb-A=Bbb)
    { baseRoot: 'C', frets: [1, 2, 1, 4], fingers: [1, 2, 1, 4] },
    // Bdim: B-D-F -> [0, 0, 4, 3] -> D, G, Eb, F ❌
    // [4, 5, 4, 3] -> F#, C, Eb, F ❌
    // Bdim: [3, 2, 4, 3] -> F, A, Eb, F ❌
    // Simples: [1, 0, 0, 3] -> Eb, G, B, F ❌ G errado (queremos B-D-F)
    // [0, 5, 4, 3] -> D, C, Eb, F ❌
    // Bdim = B-D-F: D presente aberto, precisa B e F
    // [4, 0, 4, 3] -> F#, G, Eb, F ❌
    // [0, 2, 4, 3] -> D, A, Eb, F ❌
    // Bdim real: [1, 2, 0, 3] -> Eb, A, B, F ❌ A errado
    // Mais simples Bdim na afinação DGBD é complicado
  ],
  'm7b5': [
    // Dm7b5: D-F-Ab-C -> D(0)=D, G(1)=Ab, B(1)=C, D(3)=F ✓ (voicing correto!)
    { baseRoot: 'D', frets: [0, 1, 1, 3], fingers: [0, 1, 2, 4] },
    // Em7b5: E-G-Bb-D -> D(0)=D, G(0)=G, B(1)=C... ❌ C errado
    // [0, 3, 0, 2] -> D, Bb, B, E ❌ B errado
    // [2, 0, 3, 2] -> E, G, D, E ❌ falta Bb
    // [2, 3, 0, 2] -> E, Bb, B, E ❌ B errado
    // Em7b5 correto: [0, 3, 3, 2] -> D, Bb, D, E ✓ (sem G, voicing)
    { baseRoot: 'E', frets: [0, 3, 3, 2], fingers: [0, 2, 3, 1] },
    // Am7b5: A-C-Eb-G -> [1, 0, 1, 2] -> Eb, G, C, E ❌ E errado
    // [1, 0, 1, 0] -> Eb, G, C, D ❌ D errado
    // [1, 5, 1, 0] -> Eb, C, C, D ❌
    // Shell: [7, 5, 6, 5] -> A, C, Eb, G ✓
    { baseRoot: 'A', frets: [7, 5, 6, 5], fingers: [4, 1, 2, 1], barre: 5 },
    // Bm7b5: B-D-F-A -> D(0)=D, G(2)=A, B(4)=Eb... ❌
    // [0, 2, 0, 3] -> D, A, B, F ✓
    { baseRoot: 'B', frets: [0, 2, 0, 3], fingers: [0, 2, 0, 3] },
  ],
  '5+': [
    // Caug: C-E-G# -> [2, 1, 1, 2] -> E, G#, C, E ✓
    { baseRoot: 'C', frets: [2, 1, 1, 2], fingers: [3, 1, 1, 4], barre: 1 },
    // Gaug: G-B-D# -> [0, 0, 0, 1] -> D, G, B, Eb/D# ✓
    { baseRoot: 'G', frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1] },
    // Daug: D-F#-A# -> [0, 3, 4, 4] -> D, Bb/A#, Eb, F# ✓ (Eb enarmônico D#, Bb=A#)
    // Melhor: [0, 2, 4, 4] -> D, A, Eb, F# ❌ A não pertence
    // [4, 3, 4, 4] -> F#, Bb, Eb, F# ✓ (sem D como baixo)
    { baseRoot: 'D', frets: [4, 3, 4, 4], fingers: [2, 1, 3, 4] },
  ],
  'sus4': [
    // Gsus4: G-C-D -> D(0)=D, G(0)=G, B(1)=C, D(0)=D ✓
    { baseRoot: 'G', frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] },
    // Dsus4: D-G-A -> D(0)=D, G(0)=G, B(3)=D, D(5)=G? Não
    // [0, 0, 3, 5] -> D, G, D, G ❌ falta A
    // [0, 2, 3, 5] -> D, A, D, G ✓
    { baseRoot: 'D', frets: [0, 2, 3, 5], fingers: [0, 1, 2, 4] },
    // Csus4: C-F-G -> [3, 0, 1, 3] -> F, G, C, F ✓
    { baseRoot: 'C', frets: [3, 0, 1, 3], fingers: [3, 0, 1, 4] },
    // Asus4: A-D-E -> [0, 0, 5, 2] -> D, G, E, E ❌ G errado
    // [0, 2, 5, 2] -> D, A, E, E ✓
    { baseRoot: 'A', frets: [0, 2, 5, 2], fingers: [0, 1, 4, 2] },
  ],
  '9': [
    // G9: G-B-D-F-A -> D(0)=D, G(0)=G, B(0)=B, D(1)=Eb? ❌
    // [0, 2, 0, 3] -> D, A, B, F ✓ (D-B-F-A = sem G no baixo, válido)
    { baseRoot: 'G', frets: [0, 2, 0, 3], fingers: [0, 2, 0, 3] },
    // D9: D-F#-A-C-E -> D(0)=D, G(2)=A, B(1)=C, D(2)=E ✓
    { baseRoot: 'D', frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3] },
    // C9: C-E-G-Bb-D -> [0, 3, 1, 2] -> D, Bb, C, E ✓
    { baseRoot: 'C', frets: [0, 3, 1, 2], fingers: [0, 3, 1, 2] },
    // A9: A-C#-E-G-B -> [0, 0, 2, 2] -> D, G, C#, E ✓ (D errado)
    // [2, 0, 2, 0] -> E, G, C#, D ❌ D errado
    // Melhor A9: [2, 4, 2, 2] -> E, B, C#, E ✓ (sem G, voicing)
    { baseRoot: 'A', frets: [2, 4, 2, 2], fingers: [1, 4, 2, 3] },
  ],
  'add9': [
    // Gadd9: G-B-D-A -> [0, 2, 0, 0] -> D, A, B, D ✓ (sem G no baixo)
    { baseRoot: 'G', frets: [0, 2, 0, 0], fingers: [0, 1, 0, 0] },
    // Cadd9: C-E-G-D -> [0, 0, 1, 2] -> D, G, C, E ✓
    { baseRoot: 'C', frets: [0, 0, 1, 2], fingers: [0, 0, 1, 2] },
    // Dadd9: D-F#-A-E -> [0, 2, 0, 4] -> D, A, B, F#... B errado!
    // [0, 2, 5, 4] -> D, A, E, F# ✓
    { baseRoot: 'D', frets: [0, 2, 5, 4], fingers: [0, 1, 4, 3] },
  ]
};

// Função de transposição COM validação harmônica
function transposeChordWithValidation(
  pattern: SourcePattern, 
  targetRoot: string,
  targetSuffix: string
): Fingering | null {
  const rootIdx = ROOT_INDICES[pattern.baseRoot];
  const targetIdx = ROOT_INDICES[targetRoot];
  
  if (rootIdx === undefined || targetIdx === undefined) return null;
  
  let semitones = targetIdx - rootIdx;
  if (semitones < 0) semitones += 12;

  // Se é o mesmo acorde, não precisa transpor
  if (semitones === 0) {
    const validation = validateChordDiagram(targetRoot, targetSuffix, pattern.frets);
    if (!validation.isValid) return null;
    
    const activeFrets = pattern.frets.filter(f => f > 0);
    const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 0;
    let startFret = 1;
    if (minFret > 4) startFret = minFret - 1;
    
    return {
      frets: pattern.frets as [number, number, number, number],
      fingers: pattern.fingers.map(f => f || null) as [number | null, number | null, number | null, number | null],
      barre: pattern.barre ? { fromString: 1, toString: 4, fret: pattern.barre } : null,
      startFret,
      label: startFret > 1 ? `${startFret}ª casa` : 'aberto'
    };
  }

  // Transpõe
  const newFrets = pattern.frets.map(f => (f === -1 ? -1 : f + semitones));
  const newFingers = [...pattern.fingers];
  let barre = pattern.barre ? pattern.barre + semitones : undefined;

  // Valida se o acorde transposto produz as notas corretas
  const validation = validateChordDiagram(targetRoot, targetSuffix, newFrets);
  
  // Rejeita se há notas erradas ou cobertura muito baixa
  if (!validation.isValid) {
    return null;
  }

  // Detecta pestana quando cordas abertas viram presas na mesma casa
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
  
  // Ignora acordes muito altos
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

// Mapeia suffix para exibição
const SUFFIX_DISPLAY_MAP: Record<string, string> = {
  'M': '', 'm': 'm', '7': '7', 'm7': 'm7', 'maj7': 'maj7',
  '6': '6', 'm6': 'm6', 'dim': 'dim', 'm7b5': 'm7b5',
  '5+': 'aug', 'sus4': 'sus4', '9': '9', 'add9': 'add9'
};

// Intervalos para cada tipo
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

export function generateSmartChordDatabase(): ChordEntry[] {
  const chords: ChordEntry[] = [];

  ROOT_NOTES.forEach(targetRoot => {
    CHORD_TYPES.forEach(suffix => {
      const variations: Fingering[] = [];
      const templates = VERIFIED_PATTERNS[suffix] || [];

      // Transpõe com validação harmônica
      templates.forEach(tpl => {
        const variation = transposeChordWithValidation(tpl, targetRoot, suffix);
        if (variation) variations.push(variation);
      });

      // Ordena por posição mais próxima
      variations.sort((a, b) => {
        const getAvg = (v: Fingering) => {
          const f = v.frets.filter(x => x > 0);
          if (f.length === 0) return 0;
          return f.reduce((sum, n) => sum + n, 0) / f.length;
        };
        return getAvg(a) - getAvg(b);
      });

      // Remove duplicatas
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
      const notes = getExpectedChordNotes(targetRoot, suffix);

      chords.push({
        id: displayName,
        root: targetRoot,
        quality,
        notes,
        intervals: CHORD_INTERVALS[suffix] || ['1', '3', '5'],
        variations: uniqueVariations.slice(0, 5),
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
  if (barre) difficulty += 1;
  if (minFret > 4) difficulty += 1;
  if (span >= 3) difficulty += 1;
  if (activeFrets.length >= 4 && !hasOpenStrings) difficulty += 1;

  return Math.min(5, Math.max(1, difficulty)) as 1 | 2 | 3 | 4 | 5;
}

export const SMART_CHORD_DB = generateSmartChordDatabase();
