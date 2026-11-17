export const DIFFICULTIES = ['easy', 'medium', 'hard', 'impossible'] as const;
export type Difficulty = typeof DIFFICULTIES[number];
export type ControlType = 'desktop' | 'vr';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Fácil', medium: 'Médio', hard: 'Difícil', impossible: 'Impossível',
};

export const GAME_RULES = {
  startingLives: 3,
  firstLevelTarget: 6,
  targetIncreasePerLevel: 3,
  challengeWarningSeconds: 0.4,
  recoverySeconds: 0.35,
  ringWindowSeconds: 1.2,
  maximumActiveChallenges: 3,
  initialChallengeSequence: ['red', 'blue', 'gold'] as const,
  ringRadius: 0.08,
  headRadius: 0.11,
  projectileRadius: 0.07,
  shieldRadius: 0.15,
  shieldThickness: 0.03,
  handRadius: 0.05,
  resumePositionTolerance: 0.05,
  resumeRotationToleranceRadians: Math.PI / 18,
} as const;

export interface DifficultyProfile {
  initialFlightSeconds: number;
  highLevelFlightSeconds: number;
  initialIntervalSeconds: number;
  highLevelIntervalSeconds: number;
  perLevelFactor: number;
}

export const DIFFICULTY_PROFILES: Record<Difficulty, DifficultyProfile> = {
  easy: { initialFlightSeconds: 2, highLevelFlightSeconds: 1.2, initialIntervalSeconds: 2.2, highLevelIntervalSeconds: 1.3, perLevelFactor: 0.94 },
  medium: { initialFlightSeconds: 1.6, highLevelFlightSeconds: 0.7, initialIntervalSeconds: 1.6, highLevelIntervalSeconds: 0.7, perLevelFactor: 0.9 },
  hard: { initialFlightSeconds: 1.2, highLevelFlightSeconds: 0.6, initialIntervalSeconds: 1.2, highLevelIntervalSeconds: 0.6, perLevelFactor: 0.86 },
  impossible: { initialFlightSeconds: 0.7, highLevelFlightSeconds: 0.5, initialIntervalSeconds: 0.9, highLevelIntervalSeconds: 0.55, perLevelFactor: 0.82 },
};

export function targetForLevel(level: number): number {
  return GAME_RULES.firstLevelTarget + GAME_RULES.targetIncreasePerLevel * (level - 1);
}

export function pointsAtLevelStart(level: number): number {
  return (GAME_RULES.targetIncreasePerLevel * (level - 1) * (level + 2)) / 2;
}

export function progressionForScore(score: number) {
  const safeScore = Number.isSafeInteger(score) ? Math.max(0, score) : 0;
  let low = 1;
  let high = 2;
  while (pointsAtLevelStart(high) <= safeScore) high *= 2;
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (pointsAtLevelStart(middle) <= safeScore) low = middle;
    else high = middle;
  }
  const threshold = targetForLevel(low);
  return { level: low, progress: safeScore - pointsAtLevelStart(low), target: threshold };
}

export function difficultyAt(mode: Difficulty, level: number) {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  const profile = DIFFICULTY_PROFILES[mode];
  const factor = profile.perLevelFactor ** (safeLevel - 1);
  const flightSeconds = profile.highLevelFlightSeconds + (profile.initialFlightSeconds - profile.highLevelFlightSeconds) * factor;
  const challengeInterval = profile.highLevelIntervalSeconds + (profile.initialIntervalSeconds - profile.highLevelIntervalSeconds) * factor;
  return { level: safeLevel, flightSeconds, projectileSpeed: 2.4 / flightSeconds, challengeInterval };
}
