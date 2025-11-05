import { ChordEntry } from "@/types/chords";
import { convertedChords } from "@/lib/chordConverter";

export type HarmonicFunction = "tonica" | "subdominante" | "dominante" | "preparacao";

export interface HarmonicDegree {
  degree: string;
  chord: ChordEntry | null;
  function: HarmonicFunction;
}

export interface Progression {
  name: string;
  sequence: string[];
  style: string;
  description?: string;
}

export interface HarmonicField {
  key: string;
  degrees: HarmonicDegree[];
  progressions: Progression[];
}

// Encontrar acorde por root e quality
function findChord(root: string, quality: string = ""): ChordEntry | null {
  return convertedChords.find(c => c.root === root && c.quality === quality) || null;
}

// Mapeamento de graus para cada tonalidade
const DEGREE_MAP: Record<string, { root: string; quality: string; function: HarmonicFunction }[]> = {
  "C": [
    { root: "C", quality: "", function: "tonica" },
    { root: "D", quality: "m", function: "preparacao" },
    { root: "E", quality: "m", function: "preparacao" },
    { root: "F", quality: "", function: "subdominante" },
    { root: "G", quality: "", function: "dominante" },
    { root: "A", quality: "m", function: "preparacao" },
    { root: "B", quality: "dim", function: "dominante" },
  ],
  "G": [
    { root: "G", quality: "", function: "tonica" },
    { root: "A", quality: "m", function: "preparacao" },
    { root: "B", quality: "m", function: "preparacao" },
    { root: "C", quality: "", function: "subdominante" },
    { root: "D", quality: "", function: "dominante" },
    { root: "E", quality: "m", function: "preparacao" },
    { root: "F#", quality: "dim", function: "dominante" },
  ],
  "D": [
    { root: "D", quality: "", function: "tonica" },
    { root: "E", quality: "m", function: "preparacao" },
    { root: "F#", quality: "m", function: "preparacao" },
    { root: "G", quality: "", function: "subdominante" },
    { root: "A", quality: "", function: "dominante" },
    { root: "B", quality: "m", function: "preparacao" },
    { root: "C#", quality: "dim", function: "dominante" },
  ],
  "A": [
    { root: "A", quality: "", function: "tonica" },
    { root: "B", quality: "m", function: "preparacao" },
    { root: "C#", quality: "m", function: "preparacao" },
    { root: "D", quality: "", function: "subdominante" },
    { root: "E", quality: "", function: "dominante" },
    { root: "F#", quality: "m", function: "preparacao" },
    { root: "G#", quality: "dim", function: "dominante" },
  ],
  "E": [
    { root: "E", quality: "", function: "tonica" },
    { root: "F#", quality: "m", function: "preparacao" },
    { root: "G#", quality: "m", function: "preparacao" },
    { root: "A", quality: "", function: "subdominante" },
    { root: "B", quality: "", function: "dominante" },
    { root: "C#", quality: "m", function: "preparacao" },
    { root: "D#", quality: "dim", function: "dominante" },
  ],
  "F": [
    { root: "F", quality: "", function: "tonica" },
    { root: "G", quality: "m", function: "preparacao" },
    { root: "A", quality: "m", function: "preparacao" },
    { root: "Bb", quality: "", function: "subdominante" },
    { root: "C", quality: "", function: "dominante" },
    { root: "D", quality: "m", function: "preparacao" },
    { root: "E", quality: "dim", function: "dominante" },
  ],
};

// Progressões famosas por tonalidade
const PROGRESSIONS: Record<string, Progression[]> = {
  "C": [
    { name: "Samba Básico", sequence: ["C", "G", "Am", "F"], style: "samba", description: "Progressão mais comum no samba" },
    { name: "Blues do Choro", sequence: ["C", "C7", "F", "Fm"], style: "choro", description: "Cadência clássica do choro" },
    { name: "Bossa Nova", sequence: ["Cmaj7", "Dm7", "G7", "Cmaj7"], style: "bossa", description: "Som suave da bossa nova" },
    { name: "Samba Canção", sequence: ["C", "Am", "Dm", "G7"], style: "samba", description: "Para melodias românticas" },
  ],
  "G": [
    { name: "Samba Básico", sequence: ["G", "D", "Em", "C"], style: "samba", description: "Progressão mais comum no samba" },
    { name: "Pagode Clássico", sequence: ["G", "Bm", "C", "D"], style: "pagode", description: "Base do pagode romântico" },
    { name: "Choro Tradicional", sequence: ["G", "Am", "D7", "G"], style: "choro", description: "Estrutura típica do choro" },
  ],
  "D": [
    { name: "Samba Básico", sequence: ["D", "A", "Bm", "G"], style: "samba", description: "Progressão mais comum no samba" },
    { name: "Pagode Moderno", sequence: ["D", "F#m", "G", "A"], style: "pagode", description: "Som do pagode contemporâneo" },
    { name: "Samba de Raiz", sequence: ["D", "G", "A7", "D"], style: "samba", description: "Raízes do samba paulista" },
  ],
  "A": [
    { name: "Samba Básico", sequence: ["A", "E", "F#m", "D"], style: "samba", description: "Progressão mais comum no samba" },
    { name: "Samba Rock", sequence: ["A", "D", "E", "A"], style: "samba", description: "Groove do samba rock" },
  ],
  "E": [
    { name: "Samba Básico", sequence: ["E", "B", "C#m", "A"], style: "samba", description: "Progressão mais comum no samba" },
    { name: "Bossa Clássica", sequence: ["E", "A", "B7", "E"], style: "bossa", description: "Som clássico da bossa" },
  ],
  "F": [
    { name: "Samba Básico", sequence: ["F", "C", "Dm", "Bb"], style: "samba", description: "Progressão mais comum no samba" },
    { name: "Choro Moderno", sequence: ["F", "Gm", "C7", "F"], style: "choro", description: "Choro contemporâneo" },
  ],
};

/**
 * Retorna o campo harmônico de uma tonalidade
 */
export function getHarmonicField(key: string): HarmonicField | null {
  const degrees = DEGREE_MAP[key];
  if (!degrees) return null;

  const degreeNames = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];

  return {
    key,
    degrees: degrees.map((deg, idx) => ({
      degree: degreeNames[idx],
      chord: findChord(deg.root, deg.quality),
      function: deg.function,
    })),
    progressions: PROGRESSIONS[key] || [],
  };
}

/**
 * Retorna todas as tonalidades disponíveis
 */
export function getAvailableKeys(): string[] {
  return Object.keys(DEGREE_MAP);
}

/**
 * Informações sobre as funções harmônicas
 */
export const FUNCTION_INFO: Record<HarmonicFunction, { label: string; description: string; color: string }> = {
  tonica: {
    label: "Tônica",
    description: "Centro tonal, sensação de repouso e conclusão",
    color: "hsl(var(--primary))",
  },
  subdominante: {
    label: "Subdominante",
    description: "Afastamento da tônica, preparação para tensão",
    color: "hsl(var(--success))",
  },
  dominante: {
    label: "Dominante",
    description: "Máxima tensão, busca resolução na tônica",
    color: "hsl(var(--destructive))",
  },
  preparacao: {
    label: "Preparação",
    description: "Acordes auxiliares, criam movimento harmônico",
    color: "hsl(var(--warning))",
  },
};
