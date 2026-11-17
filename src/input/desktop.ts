import { Plane, Raycaster, Vector2, Vector3 } from 'three';
import type { Camera } from 'three';

/** Poses em metros; cada mão conserva sua última posição ao trocar a seleção. */
export class DesktopInput {
  readonly hands = [new Vector3(-0.25, 1.37, -0.35), new Vector3(0.25, 1.37, -0.35)];
  selectedHand = 0;
  private readonly keys = new Set<string>();

  reset() {
    this.keys.clear();
    this.selectedHand = 0;
    this.hands[0]!.set(-0.25, 1.37, -0.35);
    this.hands[1]!.set(0.25, 1.37, -0.35);
  }

  key(key: string, down: boolean) {
    if (down) this.keys.add(key.toLowerCase());
    else this.keys.delete(key.toLowerCase());
    if (down && key === '1') this.selectedHand = 0;
    if (down && key === '2') this.selectedHand = 1;
  }

  get headOffset() { return (Number(this.keys.has('d')) - Number(this.keys.has('a'))) * 0.28; }

  pointAt(x: number, y: number, camera: Camera) {
    const ray = new Raycaster();
    ray.setFromCamera(new Vector2(x, y), camera);
    const target = ray.ray.intersectPlane(new Plane(new Vector3(0, 0, 1), 0.35), new Vector3());
    if (target) this.hands[this.selectedHand]!.copy(target);
  }
}
