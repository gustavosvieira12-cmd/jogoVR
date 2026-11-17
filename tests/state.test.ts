import { describe, expect, it } from 'vitest';
import { DIFFICULTIES, difficultyAt, pointsAtLevelStart, progressionForScore, targetForLevel } from '../src/game/config';
import { advanceActiveTime, createGameState, resolveChallenge } from '../src/game/state';

describe('progressão por pontuação', () => {
  it.each([
    [0, 1, 0, 6], [5, 1, 5, 6], [6, 2, 0, 9], [8, 2, 2, 9], [14, 2, 8, 9],
    [15, 3, 0, 12], [26, 3, 11, 12], [27, 4, 0, 15], [42, 5, 0, 18],
    [231, 12, 0, 39], [15147, 100, 0, 303],
  ])('total %i dá nível %i, progresso %i/%i', (score, level, progress, target) => {
    expect(progressionForScore(score)).toEqual({ level, progress, target });
  });

  it('mantém metas ilimitadas e fronteiras adjacentes exatas', () => {
    for (let level = 1; level < 1000; level += 1) {
      const start = pointsAtLevelStart(level);
      expect(progressionForScore(start).level).toBe(level);
      expect(progressionForScore(start - 1).level).toBe(level - 1 === 0 ? 1 : level - 1);
      expect(targetForLevel(level)).toBe(3 * level + 3);
    }
  });

  it('aproveita pontos excedentes e emite somente um evento por avanço real', () => {
    const game = createGameState('medium', 'desktop');
    expect(resolveChallenge(game, 1, 'red', 'miss')).toEqual([]);
    expect(resolveChallenge(game, 2, 'blue', 'block')).toEqual([]);
    expect(game.score).toBe(5);
    expect(resolveChallenge(game, 3, 'red', 'miss')).toEqual([{ type: 'level-up', level: 2 }]);
    expect(game).toMatchObject({ score: 8, level: 2, progress: 2, target: 9, lives: 3 });
    expect(resolveChallenge(game, 3, 'red', 'miss')).toEqual([]);
    expect(resolveChallenge(game, 4, 'gold', 'touch')).toEqual([]);
    expect(game).toMatchObject({ score: 9, level: 2, progress: 3, target: 9 });
  });

  it('sobe gradualmente até o nível 12 ao ganhar pontos em partidas válidas', () => {
    const game = createGameState('medium', 'desktop');
    const advancementLevels: number[] = [];
    for (let id = 1; game.level < 12; id += 1) {
      const events = resolveChallenge(game, id, 'red', 'miss');
      for (const event of events) if (event.type === 'level-up') advancementLevels.push(event.level);
    }
    expect(game.score).toBe(pointsAtLevelStart(12));
    expect(game).toMatchObject({ level: 12, progress: 0, target: 39, lives: 3 });
    expect(advancementLevels).toEqual(Array.from({ length: 11 }, (_, index) => index + 2));
  });

  it('não aumenta nível por tempo e ignora alterações pausadas ou encerradas', () => {
    const game = createGameState('easy', 'desktop');
    expect(advanceActiveTime(game, 0.25)).toBe(true);
    expect(advanceActiveTime(game, 0.3)).toBe(false);
    game.phase = 'paused';
    expect(advanceActiveTime(game, 0.1)).toBe(false);
    expect(resolveChallenge(game, 1, 'red', 'miss')).toEqual([]);
    expect(game).toMatchObject({ activeSeconds: 0.25, score: 0, level: 1 });
  });
});

describe('perfis de dificuldade', () => {
  it('define os quatro modos desde o nível 1 e aproxima seus intervalos do valor assintótico', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'medium', 'hard', 'impossible']);
    const firstLevels = DIFFICULTIES.map(mode => difficultyAt(mode, 1));
    const expectedSpeed = [1.2, 1.5, 2, 2.4 / 0.7];
    firstLevels.forEach((value, index) => expect(value.projectileSpeed).toBeCloseTo(expectedSpeed[index]!, 8));
    expect(firstLevels.map(value => value.challengeInterval)).toEqual([2.2, 1.6, 1.2, 0.9]);
    for (const mode of DIFFICULTIES) {
      const level12 = difficultyAt(mode, 12);
      const level100 = difficultyAt(mode, 100);
      expect(level12.projectileSpeed).toBeGreaterThan(difficultyAt(mode, 1).projectileSpeed);
      expect(level12.challengeInterval).toBeLessThan(difficultyAt(mode, 1).challengeInterval);
      expect(level100.challengeInterval).toBeCloseTo(mode === 'easy' ? 1.3 : mode === 'medium' ? 0.7 : mode === 'hard' ? 0.6 : 0.55, 2);
      expect(Number.isFinite(level100.projectileSpeed)).toBe(true);
    }
    expect(difficultyAt('impossible', 1).projectileSpeed).toBeGreaterThan(difficultyAt('medium', 1).projectileSpeed);
    expect(difficultyAt('impossible', 1).challengeInterval).toBeLessThan(difficultyAt('medium', 1).challengeInterval);
  });
});

describe('vidas e eventos', () => {
  it('notifica danos sucessivos e termina uma vez ao chegar a zero', () => {
    const game = createGameState('impossible', 'vr');
    expect(resolveChallenge(game, 1, 'red', 'hit')).toEqual([{ type: 'life-lost', livesRemaining: 2 }]);
    expect(resolveChallenge(game, 2, 'blue', 'hit')).toEqual([{ type: 'life-lost', livesRemaining: 1 }]);
    expect(resolveChallenge(game, 3, 'red', 'hit')).toEqual([{ type: 'life-lost', livesRemaining: 0 }, { type: 'game-over' }]);
    expect(resolveChallenge(game, 4, 'red', 'miss')).toEqual([]);
  });
});
