/**
 * DEFAULT_DB - Banco de dados local de acordes para Cavaquinho
 * 
 * Este arquivo contém o dicionário base de acordes embutido no app.
 * O app pode funcionar completamente offline com esses acordes.
 * 
 * Estrutura:
 * - root: Nota fundamental (C, D, E, F, G, A, B)
 * - suffix: Tipo do acorde (major, minor, 7, maj7, etc)
 * - positions: Array de variações/posições do acorde
 *   - frets: [corda4, corda3, corda2, corda1] (0 = solta, -1 = abafada)
 *   - fingers: [dedo4, dedo3, dedo2, dedo1] (0 = não usar, 1-4 = dedos)
 *   - barre: Casa da pestana (se houver)
 *   - baseFret: Casa inicial (1 = próxima ao corpo, aumenta em direção à boca)
 */

export interface ChordPosition {
  frets: [number, number, number, number];
  fingers: [number, number, number, number];
  barre?: number | null;
  baseFret: number;
}

export interface ChordDefinition {
  key: string;
  suffix: string;
  positions: ChordPosition[];
}

export interface ChordDatabase {
  version: string;
  description: string;
  tuning: string;
  author: string;
  chords: ChordDefinition[];
}

/**
 * DEFAULT_DB - Banco de dados padrão de acordes
 * Importado do cavaquinho-source.json para manter compatibilidade
 */
import cavaquinhoSource from "@/data/cavaquinho-source.json";

export const DEFAULT_DB: ChordDatabase = {
  version: "1.0",
  description: cavaquinhoSource.main.description,
  tuning: cavaquinhoSource.main.tuning,
  author: cavaquinhoSource.main.author,
  chords: cavaquinhoSource.chords as ChordDefinition[],
};

/**
 * Valida se um objeto JSON tem a estrutura correta de ChordDatabase
 */
export function validateChordDatabase(data: any): data is ChordDatabase {
  if (!data || typeof data !== "object") return false;
  if (!Array.isArray(data.chords)) return false;
  
  // Valida estrutura básica de cada acorde
  return data.chords.every((chord: any) => {
    if (!chord.key || !chord.suffix || !Array.isArray(chord.positions)) {
      return false;
    }
    
    // Valida cada posição
    return chord.positions.every((pos: any) => {
      return (
        Array.isArray(pos.frets) &&
        pos.frets.length === 4 &&
        Array.isArray(pos.fingers) &&
        pos.fingers.length === 4 &&
        typeof pos.baseFret === "number"
      );
    });
  });
}

/**
 * Mescla dois bancos de dados de acordes
 * Acordes personalizados sobrescrevem os padrão se tiverem o mesmo key+suffix
 */
export function mergeChordDatabases(
  base: ChordDatabase,
  custom: ChordDatabase
): ChordDatabase {
  const merged = { ...base };
  const chordMap = new Map<string, ChordDefinition>();
  
  // Adiciona acordes base
  base.chords.forEach((chord) => {
    const key = `${chord.key}-${chord.suffix}`;
    chordMap.set(key, chord);
  });
  
  // Sobrescreve/adiciona acordes customizados
  custom.chords.forEach((chord) => {
    const key = `${chord.key}-${chord.suffix}`;
    chordMap.set(key, chord);
  });
  
  merged.chords = Array.from(chordMap.values());
  return merged;
}
