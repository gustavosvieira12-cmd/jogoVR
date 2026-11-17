import { Quaternion, Vector3 } from 'three';
import type { WebXRManager } from 'three';

export interface XRFrameSample {
  head: Vector3;
  headRotation: Quaternion;
  hands: [Vector3, Vector3];
  rotations: [Quaternion, Quaternion];
  trackingValid: boolean;
  missingHands: string[];
}

/** Converte as poses do quadro XR para o referencial escolhido no WebXRManager. */
export function readXRFrame(frame: XRFrame, xr: WebXRManager): XRFrameSample | null {
  const session = xr.getSession();
  const referenceSpace = xr.getReferenceSpace();
  if (!session || !referenceSpace) return null;
  const viewer = frame.getViewerPose(referenceSpace);
  if (!viewer) return null;

  const hands: [Vector3, Vector3] = [new Vector3(), new Vector3()];
  const rotations: [Quaternion, Quaternion] = [new Quaternion(), new Quaternion()];
  const found = [false, false];
  const missingHands: string[] = [];
  for (const source of session.inputSources) {
    const index = source.handedness === 'left' ? 0 : source.handedness === 'right' ? 1 : -1;
    if (index === -1 || !source.gripSpace) continue;
    const pose = frame.getPose(source.gripSpace, referenceSpace);
    if (!pose) continue;
    const position = pose.transform.position;
    const orientation = pose.transform.orientation;
    hands[index]!.set(position.x, position.y, position.z);
    rotations[index]!.set(orientation.x, orientation.y, orientation.z, orientation.w);
    found[index] = true;
  }
  if (!found[0]) missingHands.push('esquerdo');
  if (!found[1]) missingHands.push('direito');
  return {
    head: new Vector3(viewer.transform.position.x, viewer.transform.position.y, viewer.transform.position.z),
    headRotation: new Quaternion(viewer.transform.orientation.x, viewer.transform.orientation.y, viewer.transform.orientation.z, viewer.transform.orientation.w),
    hands,
    rotations,
    trackingValid: found.every(Boolean),
    missingHands,
  };
}
