export interface PracticeSession {
  chordId: string;
  attempts: number;
  successes: number;
  lastPracticed: Date;
  mastered: boolean;
  bestTime?: number; // em milissegundos
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  requirement: (stats: PracticeStats) => boolean;
}

export interface PracticeStats {
  totalAttempts: number;
  totalSuccesses: number;
  chordsLearned: string[];
  chordsMastered: string[];
  consecutiveDays: number;
  lastPracticeDate?: Date;
  fastestTransition?: number;
  achievements: string[];
}

export type PracticeLevel = "iniciante" | "intermediario" | "avancado" | "profissional";

export interface LearningStage {
  level: PracticeLevel;
  stage: number;
  chords: string[];
  lesson: string;
  completed: boolean;
}
