import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { DesktopInput } from '../src/input/desktop';
import { sphereContact } from '../src/game/collisions';

describe('gestos no computador', () => {
  const camera = new PerspectiveCamera(85, 16 / 9, 0.1, 80);
  camera.position.set(0, 1.62, 0);
  camera.updateMatrixWorld();

  it('aponta no centro da tela e alcança o plano dos anéis', () => {
    const input = new DesktopInput();
    input.pointAt(0, 0, camera);
    expect(input.hands[0]!.distanceTo(new Vector3(0, 1.62, -0.35))).toBeLessThan(1e-6);
  });

  it('conserva cada mão ao alternar a seleção', () => {
    const input = new DesktopInput();
    input.pointAt(-0.3, 0.1, camera);
    const left = input.hands[0]!.clone();
    input.key('2', true);
    input.pointAt(0.3, 0.1, camera);
    expect(input.hands[0]).toEqual(left);
    expect(input.hands[1]!.x).toBeGreaterThan(0);
  });

  it('mostra o alvo dourado e permite alcançar seu centro pelo mouse', () => {
    const target = new Vector3(0.2, 1.37, -0.35);
    const screen = target.clone().project(camera);
    expect(Math.abs(screen.x)).toBeLessThan(1);
    expect(Math.abs(screen.y)).toBeLessThan(1);
    const input = new DesktopInput();
    input.pointAt(screen.x, screen.y, camera);
    expect(input.hands[0]!.distanceTo(target)).toBeLessThan(1e-6);
  });

  it('soltar uma tecla mantém a outra e reset limpa movimentos presos', () => {
    const input = new DesktopInput();
    input.key('a', true); input.key('d', true); input.key('d', false);
    expect(input.headOffset).toBe(-0.28);
    input.reset();
    expect(input.headOffset).toBe(0);
  });
});

describe('contatos entre quadros', () => {
  it('detecta um projétil que cruza o jogador inteiro em um quadro', () => {
    const zero = new Vector3();
    expect(sphereContact(new Vector3(0, 0, -1), new Vector3(0, 0, 1), zero, zero, 0.18)).toBeCloseTo(0.41);
  });
  it('não detecta contato quando a cabeça já saiu da trajetória', () => {
    const head = new Vector3(0.28, 0, 0);
    expect(sphereContact(new Vector3(0, 0, -1), new Vector3(0, 0, 1), head, head, 0.18)).toBeNull();
  });
});
