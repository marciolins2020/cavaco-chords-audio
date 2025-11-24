// Templates corretos baseados no repositório GitHub RZD
// Formato: [D, G, B, D] - Afinação padrão do Cavaquinho
// 0 = Solta, -1 = Abafada (X)

export const CORRECT_TEMPLATES: Record<string, { frets: number[], fingers: number[], barre?: number }[]> = {
  'major': [
    { frets: [2, 0, 1, 2], fingers: [2, 0, 1, 3] }, // C (E G C E)
    { frets: [5, 5, 5, 5], fingers: [1, 1, 1, 1], barre: 5 }, // C (Barre at 5)
    { frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] }  // Variation
  ],
  'minor': [
    { frets: [1, 0, 1, 1], fingers: [1, 0, 2, 3] }, // Cm (Eb G C Eb)
    { frets: [5, 3, 4, 5], fingers: [3, 1, 2, 4] },
    { frets: [10, 8, 8, 10], fingers: [3, 1, 1, 4], barre: 8 }
  ],
  '7': [
    { frets: [2, 3, 1, 2], fingers: [2, 3, 1, 4] }, // C7 (E Bb C E)
    { frets: [5, 3, 5, 5], fingers: [2, 1, 3, 4] },
    { frets: [8, 9, 8, 10], fingers: [1, 2, 1, 3], barre: 8 }
  ],
  'm7': [
    { frets: [1, 3, 1, 1], fingers: [1, 3, 1, 1], barre: 1 }, // Cm7 (Eb Bb C Eb)
    { frets: [5, 3, 4, 3], fingers: [3, 1, 2, 1] },
    { frets: [8, 8, 8, 8], fingers: [1, 1, 1, 1], barre: 8 }
  ],
  'maj7': [
    { frets: [2, 4, 1, 2], fingers: [2, 4, 1, 3] }, // Cmaj7 (E B C E)
    { frets: [5, 4, 5, 5], fingers: [2, 1, 3, 4] },
    { frets: [9, 9, 8, 9], fingers: [2, 3, 1, 4] }
  ],
  '6': [
    { frets: [2, 2, 1, 2], fingers: [2, 3, 1, 4] }, // C6 (E A C E)
    { frets: [5, 2, 3, 5], fingers: [3, 1, 2, 4] }
  ],
  'm6': [
    { frets: [1, 2, 1, 5], fingers: [1, 2, 1, 4] }, // Cm6 (Eb A C G)
    { frets: [5, 5, 4, 5], fingers: [3, 3, 1, 3], barre: 5 }
  ],
  'dim': [
    { frets: [1, 2, 1, 4], fingers: [1, 2, 1, 4] }, // Cdim7 (Eb A C Gb)
    { frets: [4, 5, 4, 7], fingers: [1, 2, 1, 4] }
  ],
  'm7b5': [
    { frets: [4, 3, 1, 1], fingers: [4, 3, 1, 1] }, // Cø (Gb Bb C Eb)
    { frets: [8, 6, 7, 8], fingers: [3, 1, 2, 4] }
  ],
  'aug': [
    { frets: [2, 1, 1, 2], fingers: [3, 1, 1, 2] }, // Caug (E G# C E)
    { frets: [6, 5, 5, 6], fingers: [3, 1, 1, 2] }
  ],
  'sus4': [
    { frets: [3, 0, 1, 3], fingers: [3, 0, 1, 4] }, // Csus4 (F G C F)
    { frets: [5, 5, 6, 5], fingers: [1, 1, 2, 1], barre: 5 }
  ],
  'sus2': [
    { frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] }, // Csus2 (D G C D)
    { frets: [5, 5, 3, 5], fingers: [2, 3, 1, 4] }
  ],
  '9': [
    { frets: [2, 3, 1, 0], fingers: [2, 3, 1, 0] }, // C9 (E Bb C D)
    { frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] },
    { frets: [5, 3, 5, 5], fingers: [2, 1, 3, 4] }
  ],
  'add9': [
    { frets: [0, 0, 1, 0], fingers: [0, 0, 1, 0] }, // C add9 (D G C D)
    { frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0] }
  ]
};

// Mapa de equivalências de notas para normalizar bemóis e sustenidos
export const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11
};

// Transpõe os templates de C para qualquer outra tonalidade
export function transposeTemplate(
  template: { frets: number[], fingers: number[], barre?: number },
  fromRoot: string,
  toRoot: string
): { frets: number[], fingers: number[], barre?: number } {
  const fromIndex = NOTE_TO_INDEX[fromRoot] || 0;
  const toIndex = NOTE_TO_INDEX[toRoot] || 0;
  const offset = toIndex - fromIndex;
  
  return {
    frets: template.frets.map(fret => fret === -1 ? -1 : fret + offset),
    fingers: template.fingers,
    barre: template.barre ? template.barre + offset : undefined
  };
}

// Obtém os templates corretos para um acorde específico
export function getCorrectTemplates(root: string, suffix: string): { frets: number[], fingers: number[], barre?: number }[] | null {
  const templates = CORRECT_TEMPLATES[suffix];
  if (!templates) return null;
  
  // Transpõe de C para a tonalidade desejada
  return templates.map(template => transposeTemplate(template, 'C', root));
}
