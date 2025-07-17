import * as THREE from 'three';
import { getWallBoundingBoxes } from '../models/room.js';
import { getAllPropBoundingBoxes } from '../models/props/index.js';

export function willCollide(nextPosition, size = new THREE.Vector3(0.6, 1.8, 0.6)) {
  const futureBox = new THREE.Box3().setFromCenterAndSize(nextPosition, size);

  const walls = getWallBoundingBoxes();
  const props = getAllPropBoundingBoxes();

  return [...walls, ...props].some(box => box.intersectsBox(futureBox));
}
