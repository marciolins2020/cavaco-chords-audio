import { Achievement, PracticeStats } from "@/types/practice";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-chord",
    name: "Primeira Nota",
    description: "Acertou seu primeiro acorde",
    icon: "♪",
    requirement: (stats) => stats.totalSuccesses >= 1,
  },
  {
    id: "basic-seven",
    name: "Sete Essenciais",
    description: "Dominou 7 acordes básicos",
    icon: "★",
    requirement: (stats) => stats.chordsMastered.length >= 7,
  },
  {
    id: "ten-mastered",
    name: "Mestre dos Dez",
    description: "Dominou 10 acordes diferentes",
    icon: "♛",
    requirement: (stats) => stats.chordsMastered.length >= 10,
  },
  {
    id: "samba-ready",
    name: "Pronto pro Samba",
    description: "Dominou os acordes básicos do samba (C, G, Am, F, Dm)",
    icon: "♫",
    requirement: (stats) =>
      ["C", "G", "Am", "F", "Dm"].every((c) => stats.chordsMastered.includes(c)),
  },
  {
    id: "week-streak",
    name: "Semana de Fogo",
    description: "Praticou 7 dias seguidos",
    icon: "▲",
    requirement: (stats) => stats.consecutiveDays >= 7,
  },
  {
    id: "speed-master",
    name: "Mestre da Velocidade",
    description: "Montou um acorde em menos de 3 segundos",
    icon: "⚡",
    requirement: (stats) => (stats.fastestTransition || Infinity) < 3000,
  },
  {
    id: "perfect-ten",
    name: "Dez Perfeitos",
    description: "10 acertos seguidos sem errar",
    icon: "✓",
    requirement: (stats) => stats.totalSuccesses >= 10 && stats.totalAttempts === stats.totalSuccesses,
  },
  {
    id: "persistent",
    name: "Persistente",
    description: "Fez mais de 50 tentativas de prática",
    icon: "●",
    requirement: (stats) => stats.totalAttempts >= 50,
  },
  {
    id: "hundred-club",
    name: "Clube dos 100",
    description: "100 acertos totais",
    icon: "◆",
    requirement: (stats) => stats.totalSuccesses >= 100,
  },
  {
    id: "chord-master",
    name: "Mestre dos Acordes",
    description: "Dominou 25 acordes diferentes",
    icon: "♕",
    requirement: (stats) => stats.chordsMastered.length >= 25,
  },
];

/**
 * Verifica quais conquistas foram desbloqueadas
 */
export function checkAchievements(stats: PracticeStats): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) =>
      !stats.achievements.includes(achievement.id) &&
      achievement.requirement(stats)
  );
}

/**
 * Retorna informações sobre o nível baseado nas estatísticas
 */
export function getLevelInfo(stats: PracticeStats): {
  level: string;
  progress: number;
  nextMilestone: string;
} {
  const mastered = stats.chordsMastered.length;

  if (mastered < 5) {
    return {
      level: "Iniciante",
      progress: (mastered / 5) * 100,
      nextMilestone: `Domine ${5 - mastered} acordes para avançar`,
    };
  } else if (mastered < 15) {
    return {
      level: "Intermediário",
      progress: ((mastered - 5) / 10) * 100,
      nextMilestone: `Domine ${15 - mastered} acordes para avançar`,
    };
  } else if (mastered < 30) {
    return {
      level: "Avançado",
      progress: ((mastered - 15) / 15) * 100,
      nextMilestone: `Domine ${30 - mastered} acordes para avançar`,
    };
  } else {
    return {
      level: "Profissional",
      progress: 100,
      nextMilestone: "Você dominou o cavaquinho!",
    };
  }
}
