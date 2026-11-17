import type { ControlType, Difficulty } from './config';
import { GAME_RULES, progressionForScore } from './config';

export type ChallengeKind = 'red' | 'blue' | 'gold';
export type ChallengeResult = 'hit' | 'miss' | 'block' | 'touch';
export type GameEvent = { type: 'life-lost'; livesRemaining: number } | { type: 'level-up'; level: number } | { type: 'game-over' };

export interface GameState {
  phase: 'playing' | 'paused' | 'over';
  difficulty: Difficulty;
  control: ControlType;
  score: number;
  lives: number;
  level: number;
  progress: number;
  target: number;
  activeSeconds: number;
  resolvedIds: Set<number>;
}

export function createGameState(difficulty: Difficulty, control: ControlType): GameState {
  return { phase: 'playing', difficulty, control, score: 0, lives: GAME_RULES.startingLives, ...progressionForScore(0), activeSeconds: 0, resolvedIds: new Set() };
}

export function advanceActiveTime(state: GameState, deltaSeconds: number) {
  if (state.phase !== 'playing' || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0 || deltaSeconds > 0.25) return false;
  state.activeSeconds += deltaSeconds;
  return true;
}

export function resolveChallenge(state: GameState, id: number, kind: ChallengeKind, result: ChallengeResult): GameEvent[] {
  if (state.phase !== 'playing' || state.resolvedIds.has(id)) return [];
  if ((kind === 'red' && result !== 'hit' && result !== 'miss') ||
      (kind === 'blue' && result !== 'hit' && result !== 'miss' && result !== 'block') ||
      (kind === 'gold' && result !== 'touch' && result !== 'miss')) return [];
  state.resolvedIds.add(id);
  const events: GameEvent[] = [];
  if ((kind === 'red' || kind === 'blue') && result === 'hit') {
    state.lives -= 1;
    events.push({ type: 'life-lost', livesRemaining: state.lives });
    if (state.lives === 0) {
      state.phase = 'over';
      events.push({ type: 'game-over' });
    }
    return events;
  }
  const points = kind === 'red' && result === 'miss' ? 3 : kind === 'blue' && result === 'block' ? 2 : kind === 'gold' && result === 'touch' ? 1 : 0;
  if (points === 0) return events;
  const oldLevel = state.level;
  state.score += points;
  Object.assign(state, progressionForScore(state.score));
  if (state.level > oldLevel) events.push({ type: 'level-up', level: state.level });
  return events;
}
