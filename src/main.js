import * as THREE from 'three';
import { scene, camera, renderer } from './core/sceneManager.js';
import { controls, updateControls } from './core/controls.js';
import { setupMouseClick } from './utils/raycaster.js';
import { loadCharacter, updateCharacter, getModelPosition, setTarget } from './models/character.js';
import { loadRoom, getRoomBoundingBox } from './models/room.js';
import { getCharacterModel } from './models/character.js';
import { loadAllProps } from './models/props/index.js';
// import CannonDebugger from 'cannon-es-debugger';
import { stepPhysics, updatePhysicsMeshes, world, registerPhysicsObject, createGroundBox, initPhysics } from './core/physics.js';
import * as CANNON from 'cannon-es';

// const cannonDebugger = CannonDebugger(scene, world, { color: 0x00ff00 });

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

initPhysics(); // Inicializa o mundo Cannon antes de tudo

// Função para criar o chão visual e físico
async function setupGround() {
  const room = await loadRoom();
  const box = getRoomBoundingBox();
  if (box) {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Chão visual
    floor = new THREE.Mesh(
      // new THREE.PlaneGeometry(size.x, size.z), // Apenas para raycast do mouse
      // new THREE.MeshBasicMaterial({ visible: false }) // O chão do modelo já é visível
      new THREE.PlaneGeometry(size.x, size.z),
      // Tornando o chão visível para depuração
      new THREE.MeshBasicMaterial({
        color: 0x00ff00, // Uma cor visível
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      })
    );
    floor.rotation.x = -Math.PI / 2;
    // Posiciona o chão visual exatamente na base do bounding box da sala
    floor.position.set(center.x, box.min.y, center.z);
    scene.add(floor);
    setupMouseClick(renderer.domElement, floor, setTarget);

    // Chão físico
    if (world) {
      createGroundBox('ground', size, floor.position, floor);
    }

    // Luzes
    scene.add(new THREE.AmbientLight(0xffffff, .5));
    const directional1 = new THREE.DirectionalLight(0xffffff, .3);
    directional1.position.set(10, 12, 0);
    const directional2 = new THREE.DirectionalLight(0xffffff, .8);
    directional2.position.set(-10, 12, 0);
    scene.add(directional1);
    scene.add(directional2);
  }
}

// Fluxo organizado: chão -> personagem -> loop -> props
setupGround().then(() => {
  return loadCharacter();
}).then(() => {
  const loop = () => {
    const delta = clock.getDelta();
    stepPhysics(delta);
    updatePhysicsMeshes();
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
}).then(() => {
  return loadAllProps();
}).then(() => {
  console.log('Todas as props foram carregadas');
});
