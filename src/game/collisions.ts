import { Vector3 } from 'three';

/** Primeiro contato entre duas esferas móveis no intervalo de um quadro. */
export function sphereContact(a0: Vector3, a1: Vector3, b0: Vector3, b1: Vector3, radius: number): number | null {
  const offset = a0.clone().sub(b0);
  const motion = a1.clone().sub(a0).sub(b1.clone().sub(b0));
  const c = offset.lengthSq() - radius * radius;
  if (c <= 0) return 0;
  const a = motion.lengthSq();
  if (a < 1e-12) return null;
  const b = 2 * offset.dot(motion);
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const time = (-b - Math.sqrt(discriminant)) / (2 * a);
  return time >= 0 && time <= 1 ? time : null;
}

export const INTRO_SEQUENCE = ['red', 'blue', 'gold'] as const;
