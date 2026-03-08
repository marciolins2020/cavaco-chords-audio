import { Fingering } from "@/types/chords";

/**
 * Calcula a dificuldade de uma posição de acorde
 * Retorna um valor de 1 (muito fácil) a 5 (muito difícil)
 */
export function calculateDifficulty(position: Fingering): 1 | 2 | 3 | 4 | 5 {
  let score = 0;

  // 1. Posição no braço (casas mais altas = mais difícil)
  const usedFrets = position.frets.filter((f) => f > 0);
  if (usedFrets.length > 0) {
    const avgFret = usedFrets.reduce((a, b) => a + b, 0) / usedFrets.length;
    score += Math.min(avgFret * 0.3, 3);
  }

  // 2. Abertura dos dedos (maior distância = mais difícil)
  if (usedFrets.length > 0) {
    const span = Math.max(...usedFrets) - Math.min(...usedFrets);
    score += Math.min(span * 0.5, 2);
  }

  // 3. Pestana (adiciona dificuldade significativa)
  const hasBarre = position.barre && position.barre.fret > 0;
  if (hasBarre) score += 2;

  // 4. Número de dedos usados
  const fingersUsed = position.fingers
    ? position.fingers.filter((f) => f && f > 0).length
    : usedFrets.length;
  score += Math.min(fingersUsed * 0.3, 1.5);

  // 5. Cordas mudas (X) - um pouco mais difícil
  const mutedStrings = position.frets.filter((f) => f === -1).length;
  if (mutedStrings > 0) score += 0.5;

  // 6. Cordas soltas facilitam
  const openStrings = position.frets.filter((f) => f === 0).length;
  if (openStrings > 0) score -= 0.5;

  // Normalizar para 1-5
  const normalized = Math.max(1, Math.min(5, Math.round(score)));
  return normalized as 1 | 2 | 3 | 4 | 5;
}

/**
 * Retorna informações sobre a dificuldade
 */
export function getDifficultyInfo(difficulty: 1 | 2 | 3 | 4 | 5) {
  const labels = {
    1: { label: "Muito Fácil", emoji: "", color: "hsl(var(--success))" },
    2: { label: "Fácil", emoji: "", color: "hsl(var(--success) / 0.7)" },
    3: { label: "Médio", emoji: "", color: "hsl(var(--warning))" },
    4: { label: "Difícil", emoji: "", color: "hsl(var(--warning) / 0.7)" },
    5: { label: "Muito Difícil", emoji: "", color: "hsl(var(--destructive))" },
  };

  return labels[difficulty];
}

/**
 * Calcula a distância entre duas posições de acorde
 * Usado para encontrar acordes similares
 */
export function calculateChordDistance(
  frets1: number[],
  frets2: number[]
): number {
  return frets1.reduce((sum, fret, i) => {
    const fret2 = frets2[i];
    
    // Se ambos são cordas mudas, distância zero
    if (fret === -1 && fret2 === -1) return sum;
    
    // Se um é mudo e outro não, grande penalidade
    if (fret === -1 || fret2 === -1) return sum + 5;
    
    // Diferença normal de casas
    return sum + Math.abs(fret - fret2);
  }, 0);
}

/**
 * Compara dois arrays de frets para verificar se são iguais
 */
export function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}
