import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { camera, renderer } from './sceneManager.js';

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

export function updateControls(targetPosition) {
  if (targetPosition) {
    controls.target.copy(targetPosition);
    controls.update();
  }
}
