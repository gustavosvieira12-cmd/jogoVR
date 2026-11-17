import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSessionRecordsForTests, readRecord, saveRecord } from '../src/storage';

const values = new Map<string, string>();
let storageUnavailable = false;
const storageMock = {
  getItem: (key: string) => { if (storageUnavailable) throw new Error('storage bloqueado'); return values.get(key) ?? null; },
  setItem: (key: string, value: string) => { if (storageUnavailable) throw new Error('storage bloqueado'); values.set(key, value); },
  removeItem: (key: string) => { values.delete(key); },
  clear: () => values.clear(),
};

beforeEach(() => { storageUnavailable = false; vi.stubGlobal('localStorage', storageMock); clearSessionRecordsForTests(); values.clear(); });
afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

describe('recordes isolados por modo e controle', () => {
  it('mantém o maior valor de cada uma das oito categorias após recarregar', () => {
    const modes = ['easy', 'medium', 'hard', 'impossible'] as const;
    for (const mode of modes) {
      saveRecord('desktop', mode, 11);
      saveRecord('vr', mode, 20);
    }
    expect(saveRecord('desktop', 'easy', 3)).toEqual({ best: 11, persisted: true });
    expect(readRecord('desktop', 'easy')).toBe(11);
    expect(readRecord('vr', 'easy')).toBe(20);
    expect(readRecord('desktop', 'impossible')).toBe(11);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('recusa pontuação inválida %s', score => {
    saveRecord('desktop', 'medium', 6);
    expect(saveRecord('desktop', 'medium', score)).toEqual({ best: 6, persisted: false });
    expect(readRecord('desktop', 'medium')).toBe(6);
  });

  it.each(['{broken', '-2', '1.5', '"texto"', 'null'])('trata valor inválido %s como zero', value => {
    localStorage.setItem('teste-de-reflexos:v2:recorde:desktop:medium', value);
    expect(readRecord('desktop', 'medium')).toBe(0);
  });

  it('continua a rodada e conserva o recorde da sessão com armazenamento bloqueado', () => {
    storageUnavailable = true;
    expect(saveRecord('desktop', 'hard', 6)).toEqual({ best: 6, persisted: false });
    expect(readRecord('desktop', 'hard')).toBe(6);
  });
});
