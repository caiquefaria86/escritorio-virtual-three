import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/sceneManager.js';
import { getRoomBoundingBox } from './room.js';

const loader = new GLTFLoader();
let model, mixer, walkAction, idleAction, targetPosition = null;

export function loadCharacter(path = '/models/scene.gltf') {
  return new Promise((resolve) => {
    loader.load(path, (gltf) => {
      model = gltf.scene;
      scene.add(model);
      mixer = new THREE.AnimationMixer(model);

      walkAction = mixer.clipAction(gltf.animations[0]);
      const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
      if (idleClip) {
        idleAction = mixer.clipAction(idleClip);
        idleAction.play();
      }

      resolve({ model });
    });
  });
}

export function updateCharacter(deltaTime, keysPressed) {
  if (!model || !mixer) return;

  const moveSpeed = 4 * deltaTime;
  const rotationSpeed = 3 * deltaTime;
  let isMoving = false;

  if (keysPressed['arrowleft']) {
    model.rotation.y += rotationSpeed;
    isMoving = true;
  }
  if (keysPressed['arrowright']) {
    model.rotation.y -= rotationSpeed;
    isMoving = true;
  }
  if (keysPressed['arrowup']) {
    model.translateZ(moveSpeed);
    isMoving = true;
  }

    // --- MOVIMENTO COM CLIQUE ---
  if (targetPosition && model) {
    const currentPos = model.position.clone();
    const dir = targetPosition.clone().sub(currentPos);
    const distance = dir.length();

    if (distance > 0.1) {
      const angle = Math.atan2(dir.x, dir.z);
      model.rotation.y = angle;

      const moveVec = dir.normalize().multiplyScalar(moveSpeed);
      const nextPos = model.position.clone().add(moveVec);

     const collides = false; // desativa colisão temporariamente
      if (!collides) {
        model.position.copy(nextPos);
        isMoving = true;
      }
    } else {
      targetPosition = null; // chegou
    }
  }
  
  // Animations
  if (isMoving) {
    idleAction?.stop();
    walkAction?.play();
  } else {
    walkAction?.stop();
    idleAction?.play();
  }

  mixer.update(deltaTime);
}

export function getModelPosition() {
  const pos = new THREE.Vector3();
  model.getWorldPosition(pos);
  return pos;
}

export function setTarget(position) {
  targetPosition = position;
}

export function getCharacterModel() {
  return model;
}
