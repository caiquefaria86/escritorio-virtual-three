import * as THREE from 'three';
import { camera } from '../core/sceneManager.js';
import { setMarkerPosition, showMarker } from '../models/marker.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function setupMouseClick(rendererDom, floor, onClickPosition) {
  rendererDom.addEventListener('click', (event) => {
    const bounds = rendererDom.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    console.log(mouse.x, mouse.y);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(floor);
    if (intersects.length > 0) {
      const point = intersects[0].point.clone();
      onClickPosition(point);
      setMarkerPosition(point);
      showMarker(true);
    }
  });
}
