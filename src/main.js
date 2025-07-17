import * as THREE from 'three';
import { scene, camera, renderer } from './core/sceneManager.js';
import { controls, updateControls } from './core/controls.js';
import { setupMouseClick } from './utils/raycaster.js';
import { loadCharacter, updateCharacter, getModelPosition, setTarget } from './models/character.js';
import { loadRoom, getRoomBoundingBox } from './models/room.js';
import { getCharacterModel } from './models/character.js';
import { loadAllProps } from './models/props/index.js';

let isObserving = false;
const keysPressed = {};
document.addEventListener('keydown', e => keysPressed[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keysPressed[e.key.toLowerCase()] = false);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') isObserving = true;
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') isObserving = false;
});

let floor;

let clock = new THREE.Clock();

loadCharacter().then(() => {
  const loop = () => {
    
    const delta = clock.getDelta();
    updateCharacter(delta, keysPressed);

    const model = getCharacterModel();
    if (model) {
      const modelPos = model.position.clone();

      if (isObserving) {
        controls.enabled = true;
        controls.target.copy(modelPos);
        controls.update();
      } else {
        controls.enabled = false;

        const offset = new THREE.Vector3(0, 2, -3);
        const cameraPos = modelPos.clone().add(offset.applyEuler(model.rotation));

        camera.position.lerp(cameraPos, .05);
        camera.lookAt(modelPos);
      }
    }

    updateControls(getModelPosition());
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  loop();
});

loadRoom().then((room) => {
  const box = getRoomBoundingBox();
  if (box) {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Cria o chão com mesmo tamanho e centralizado
    floor = new THREE.Mesh(
      new THREE.PlaneGeometry(size.x, size.z),
      new THREE.MeshBasicMaterial({ visible: true })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(center.x, box.min.y + 0.01, center.z);
    scene.add(floor);

    setupMouseClick(renderer.domElement, floor, setTarget);
  }

  // Luzes
  scene.add(new THREE.AmbientLight(0xffffff, .5));

  const directional1 = new THREE.DirectionalLight(0xffffff, .3);
  directional1.position.set(10, 12, 0);

  const directional2 = new THREE.DirectionalLight(0xffffff, .8);
  directional2.position.set(-10, 12, 0);
  
  scene.add(directional1);
  scene.add(directional2)

}).then(() => {
  return loadAllProps();
}).then(() => {
  console.log('Todas as props foram carregadas');
});
