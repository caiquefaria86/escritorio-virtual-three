import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/sceneManager.js';
import * as CANNON from 'cannon-es';
import { world, initPhysics, createPlayerBody, updatePhysicsMeshes } from '../core/physics.js';

const loader = new GLTFLoader();
let model, mixer, walkAction, idleAction, targetPosition = null;
let playerBody;

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

      // Inicializa física e corpo do player
      if (!world) initPhysics();
      playerBody = createPlayerBody(new CANNON.Vec3(model.position.x, model.position.y + 1, model.position.z));
      world.addBody(playerBody);

      resolve({ model });
    });
  });
}

export function updateCharacter(deltaTime, keysPressed) {
  if (!model || !mixer || !playerBody) return;

  const moveSpeed = 4 * deltaTime;
  const rotationSpeed = 3 * deltaTime;
  let isMoving = false;

  // Movimento físico
  if (keysPressed['arrowleft']) {
    model.rotation.y += rotationSpeed;
    isMoving = true;
  }
  if (keysPressed['arrowright']) {
    model.rotation.y -= rotationSpeed;
    isMoving = true;
  }
  if (keysPressed['arrowup']) {
    // Calcula direção de movimento
    const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(model.quaternion);
    playerBody.position.x += dir.x * moveSpeed;
    playerBody.position.z += dir.z * moveSpeed;
    isMoving = true;
  }

  // Movimento por clique
  if (targetPosition && model) {
    console.log('Movendo para o alvo:', targetPosition, 'Posição atual:', playerBody.position);
    const currentPos = new THREE.Vector3().copy(playerBody.position);
    const dir = targetPosition.clone().sub(currentPos);
    dir.y = 0; // Ignoramos a diferença de altura para o movimento no plano XZ
    const distance = dir.length();
    console.log(dir.y);

    if (distance > 0.1) {
      const angle = Math.atan2(dir.x, dir.z);
      model.rotation.y = angle;

      dir.normalize();
      playerBody.position.x += dir.x * moveSpeed;
      playerBody.position.z += dir.z * moveSpeed;
      isMoving = true;
    } else {
      // Chegou ao destino
      targetPosition = null;
    }
  }

  // Sincroniza modelo com corpo físico
  model.position.copy(playerBody.position);

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
  console.log("Novo alvo definido em:", position);
  targetPosition = position;
}

export function getCharacterModel() {
  return model;
}
