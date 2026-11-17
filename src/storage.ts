import type { ControlType, Difficulty } from './game/config';

const KEY_PREFIX = 'teste-de-reflexos:v2:recorde';
const sessionRecords = new Map<string, number>();

export function clearSessionRecordsForTests() {
  sessionRecords.clear();
}

function keyFor(control: ControlType, difficulty: Difficulty) {
  return `${KEY_PREFIX}:${control}:${difficulty}`;
}

function validScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function readRecord(control: ControlType, difficulty: Difficulty): number {
  const key = keyFor(control, difficulty);
  let best = sessionRecords.get(key) ?? 0;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      const value: unknown = JSON.parse(saved);
      if (validScore(value)) best = Math.max(best, value);
    }
  } catch {
    // O recorde da sessão continua disponível quando o navegador bloqueia storage.
  }
  sessionRecords.set(key, best);
  return best;
}

export function saveRecord(control: ControlType, difficulty: Difficulty, score: number): { best: number; persisted: boolean } {
  if (!validScore(score)) return { best: readRecord(control, difficulty), persisted: false };
  const key = keyFor(control, difficulty);
  const best = Math.max(score, readRecord(control, difficulty));
  sessionRecords.set(key, best);
  try {
    localStorage.setItem(key, JSON.stringify(best));
    return { best, persisted: true };
  } catch {
    return { best, persisted: false };
  }
}
