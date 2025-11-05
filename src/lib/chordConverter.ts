import { ChordEntry } from "@/types/chords";
import cavaquinhoSource from "@/data/cavaquinho-source.json";
import { calculateDifficulty as calcDiff } from "@/utils/chordAnalysis";

// Sanitiza o suffix para ser usado em URLs
function sanitizeSuffix(suffix: string): string {
  return suffix
    .replace(/\//g, '-')  // Substitui / por -
    .replace(/#/g, 'sharp')  // Substitui # por sharp
    .replace(/b/g, 'b');  // Mantém b
}

// Mapeamento de sufixos para qualidade e informações de intervalo
const SUFFIX_MAP: Record<string, { quality: string; intervals: string[]; description: string }> = {
  "major": { quality: "", intervals: ["1", "3", "5"], description: "Maior" },
  "minor": { quality: "m", intervals: ["1", "b3", "5"], description: "Menor" },
  "7": { quality: "7", intervals: ["1", "3", "5", "b7"], description: "Sétima" },
  "maj7": { quality: "maj7", intervals: ["1", "3", "5", "7"], description: "Sétima maior" },
  "m7": { quality: "m7", intervals: ["1", "b3", "5", "b7"], description: "Menor com sétima" },
  "mMaj7": { quality: "mMaj7", intervals: ["1", "b3", "5", "7"], description: "Menor com sétima maior" },
  "dim": { quality: "dim", intervals: ["1", "b3", "b5"], description: "Diminuto" },
  "dim7": { quality: "dim7", intervals: ["1", "b3", "b5", "bb7"], description: "Diminuto com sétima" },
  "aug": { quality: "aug", intervals: ["1", "3", "#5"], description: "Aumentado" },
  "sus2": { quality: "sus2", intervals: ["1", "2", "5"], description: "Suspenso 2" },
  "sus4": { quality: "sus4", intervals: ["1", "4", "5"], description: "Suspenso 4" },
  "6": { quality: "6", intervals: ["1", "3", "5", "6"], description: "Sexta" },
  "m6": { quality: "m6", intervals: ["1", "b3", "5", "6"], description: "Menor com sexta" },
  "6/9": { quality: "6-9", intervals: ["1", "3", "5", "6", "9"], description: "Sexta com nona" },
  "9": { quality: "9", intervals: ["1", "3", "5", "b7", "9"], description: "Nona" },
  "m9": { quality: "m9", intervals: ["1", "b3", "5", "b7", "9"], description: "Menor com nona" },
  "maj9": { quality: "maj9", intervals: ["1", "3", "5", "7", "9"], description: "Nona maior" },
  "add9": { quality: "add9", intervals: ["1", "3", "5", "9"], description: "Com nona adicionada" },
  "madd9": { quality: "madd9", intervals: ["1", "b3", "5", "9"], description: "Menor com nona adicionada" },
  "11": { quality: "11", intervals: ["1", "3", "5", "b7", "9", "11"], description: "Décima primeira" },
  "m11": { quality: "m11", intervals: ["1", "b3", "5", "b7", "9", "11"], description: "Menor com décima primeira" },
  "maj11": { quality: "maj11", intervals: ["1", "3", "5", "7", "9", "11"], description: "Décima primeira maior" },
  "13": { quality: "13", intervals: ["1", "3", "5", "b7", "9", "13"], description: "Décima terceira" },
  "m13": { quality: "m13", intervals: ["1", "b3", "5", "b7", "9", "13"], description: "Menor com décima terceira" },
  "maj13": { quality: "maj13", intervals: ["1", "3", "5", "7", "9", "13"], description: "Décima terceira maior" },
  "7b5": { quality: "7b5", intervals: ["1", "3", "b5", "b7"], description: "Sétima com quinta bemol" },
  "7#5": { quality: "7sharp5", intervals: ["1", "3", "#5", "b7"], description: "Sétima com quinta sustenida" },
  "7b9": { quality: "7b9", intervals: ["1", "3", "5", "b7", "b9"], description: "Sétima com nona bemol" },
  "7#9": { quality: "7sharp9", intervals: ["1", "3", "5", "b7", "#9"], description: "Sétima com nona sustenida" },
  "b9": { quality: "b9", intervals: ["1", "3", "5", "b7", "b9"], description: "Nona bemol" },
  "9b5": { quality: "9b5", intervals: ["1", "3", "b5", "b7", "9"], description: "Nona com quinta bemol" },
  "9#5": { quality: "9sharp5", intervals: ["1", "3", "#5", "b7", "9"], description: "Nona com quinta sustenida" },
  "7sus4": { quality: "7sus4", intervals: ["1", "4", "5", "b7"], description: "Sétima suspensa 4" },
  "7sus2": { quality: "7sus2", intervals: ["1", "2", "5", "b7"], description: "Sétima suspensa 2" },
  "m7b5": { quality: "m7b5", intervals: ["1", "b3", "b5", "b7"], description: "Meio-diminuto" },
  // Acordes complexos com barras no original
  "b9/4/7": { quality: "b9-4-7", intervals: ["1", "3", "5", "b7", "b9"], description: "Sétima alterada" },
  "9/7M": { quality: "9-7M", intervals: ["1", "3", "5", "7", "9"], description: "Nona com sétima maior" },
  "9/4/7M": { quality: "9-4-7M", intervals: ["1", "3", "5", "7", "9"], description: "Nona alterada" },
  "11/b5": { quality: "11-b5", intervals: ["1", "3", "b5", "b7", "11"], description: "Onze com quinta bemol" },
  "11/7/b9": { quality: "11-7-b9", intervals: ["1", "3", "5", "b7", "b9", "11"], description: "Onze alterado" },
  "7/11": { quality: "7-11", intervals: ["1", "3", "5", "b7", "11"], description: "Sétima com onze" },
  "b13/6": { quality: "b13-6", intervals: ["1", "3", "5", "b7", "b13"], description: "Sétima com décima terceira bemol" },
  "b13": { quality: "b13", intervals: ["1", "3", "5", "b7", "b13"], description: "Décima terceira bemol" },
  "13/7": { quality: "13-7", intervals: ["1", "3", "5", "b7", "13"], description: "Décima terceira dominante" },
  "13/9M": { quality: "13-9M", intervals: ["1", "3", "5", "7", "9", "13"], description: "Décima terceira maior" },
  "13/#11": { quality: "13-sharp11", intervals: ["1", "3", "5", "b7", "#11", "13"], description: "Décima terceira com onze sustenida" },
};

// Calcula as notas do acorde baseado na tônica e intervalos
function calculateNotes(root: string, intervals: string[]): string[] {
  const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const INTERVAL_SEMITONES: Record<string, number> = {
    "1": 0, "b2": 1, "2": 2, "b3": 3, "3": 4, "4": 5, "b5": 6, "5": 7,
    "#5": 8, "b6": 8, "6": 9, "bb7": 9, "b7": 10, "7": 11, "b9": 13, "9": 14, "#9": 15, "11": 17, "13": 21
  };
  
  const rootIndex = CHROMATIC.indexOf(root.replace('b', '#'));
  if (rootIndex === -1) return [root];
  
  return intervals.map(interval => {
    const semitones = INTERVAL_SEMITONES[interval] || 0;
    const noteIndex = (rootIndex + semitones) % 12;
    return CHROMATIC[noteIndex];
  });
}

// Calcula dificuldade baseado em frets e dedilhado
function calculateDifficulty(positions: any[]): 1 | 2 | 3 | 4 | 5 {
  if (!positions.length) return 3;
  
  // Usar a primeira posição para calcular dificuldade
  const firstPos = positions[0];
  return calcDiff({
    frets: firstPos.frets as [number, number, number, number],
    fingers: firstPos.fingers.map((f: number) => f === 0 ? null : f) as [number|null, number|null, number|null, number|null],
    barre: null,
  });
}

// Define tags baseado no tipo de acorde e posição
function generateTags(suffix: string, positions: any[]): string[] {
  const tags: string[] = [];
  
  if (suffix === "major") tags.push("básico");
  if (suffix === "minor") tags.push("menor");
  if (suffix.includes("7")) tags.push("sétima");
  if (suffix.includes("9")) tags.push("tensão");
  
  if (positions[0]?.frets.filter((f: number) => f === 0).length >= 2) {
    tags.push("aberto");
  }
  
  return tags;
}

// Converte o formato source para o formato ChordEntry
export function convertCavaquinhoChords(): ChordEntry[] {
  const chords: ChordEntry[] = [];
  
  for (const chord of cavaquinhoSource.chords) {
    const suffixInfo = SUFFIX_MAP[chord.suffix] || {
      quality: sanitizeSuffix(chord.suffix),
      intervals: ["1", "3", "5"],
      description: chord.suffix
    };
    
    // ID combina key + quality (já sanitizado no SUFFIX_MAP)
    const id = chord.key + suffixInfo.quality;
    const notes = calculateNotes(chord.key, suffixInfo.intervals);
    
    const variations = chord.positions.map((pos: any, idx: number) => ({
      frets: pos.frets as [number, number, number, number],
      fingers: pos.fingers.map((f: number) => f === 0 ? null : f) as [number|null, number|null, number|null, number|null],
      barre: pos.barre || null,
      label: idx === 0 ? "Principal" : `Posição ${idx + 1}`
    }));
    
    const difficulty = calculateDifficulty(chord.positions);
    const tags = generateTags(chord.suffix, chord.positions);
    
    chords.push({
      id,
      root: chord.key,
      quality: suffixInfo.quality,
      notes,
      intervals: suffixInfo.intervals,
      variations,
      tags,
      difficulty
    });
  }
  
  // Ordena por root e depois por complexidade da qualidade
  return chords.sort((a, b) => {
    if (a.root !== b.root) {
      return a.root.localeCompare(b.root);
    }
    return a.quality.localeCompare(b.quality);
  });
}

export const convertedChords = convertCavaquinhoChords();
