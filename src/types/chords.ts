export type StringIndex = 1 | 2 | 3 | 4; // 1 = corda mais aguda (D4), 4 = corda mais grave (D3)
export type Fret = number; // 0 = solta, 1..15 = casa, -1 = X (mute)

export interface Fingering {
  frets: [Fret, Fret, Fret, Fret]; // ordem: cordas 4-3-2-1
  fingers?: [number|null, number|null, number|null, number|null]; // dedos 1..4 ou null
  barre?: { fromString: StringIndex; toString: StringIndex; fret: Fret } | null;
  startFret?: number; // Casa inicial para o diagrama
  label?: string; // "aberto", "pestana 5", etc
}

export interface ChordEntry {
  id: string; // ex: "C7"
  root: string; // ex: "C"
  quality: string; // "", "m", "7", "maj7", etc
  notes: string[]; // ex: ["C","E","G","Bb"]
  intervals: string[]; // ex: ["1","3","5","b7"]
  variations: Fingering[];
  tags?: string[]; // ex: ["pagode","aberto"]
  difficulty?: 1|2|3|4|5;
}
