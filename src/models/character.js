import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/sceneManager.js';
import * as CANNON from 'cannon-es';
import { world, initPhysics, createPlayerBody, updatePhysicsMeshes } from '../core/physics.js';
import { showMarker } from './marker.js';

const loader = new GLTFLoader();
let model, mixer, walkAction, idleAction, targetPosition = null;
let playerBody;
let characterSize; // Variável para armazenar o tamanho do personagem

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

      // Calcula o tamanho do modelo para o corpo físico
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      characterSize = size;

      // Inicializa física e corpo do player
      if (!world) initPhysics();
      playerBody = createPlayerBody(size, new CANNON.Vec3(0, 5, 0));
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
    const currentPos = new THREE.Vector3().copy(playerBody.position);
    const dir = targetPosition.clone().sub(currentPos);
    dir.y = 0; // Ignoramos a diferença de altura para o movimento no plano XZ
    const distance = dir.length();

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
      showMarker(false);
    }
  }

  // Sincroniza modelo com corpo físico
  model.position.copy(playerBody.position);
  // Ajusta a posição Y do modelo visual para compensar a diferença entre o centro do corpo físico e a base do modelo visual
  model.position.y -= characterSize.y / 2;

  // Animations
  if (isMoving) {
    idleAction?.stop();
    walkAction?.play();

    // --- LOG PARA MULTIPLAYER ---
    // Envia os dados de movimento para o backend aqui
    console.log({
      position: { 
        x: playerBody.position.x.toFixed(2),
        y: playerBody.position.y.toFixed(2),
        z: playerBody.position.z.toFixed(2)
      },
      rotation: { 
        x: model.rotation.x.toFixed(2),
        y: model.rotation.y.toFixed(2),
        z: model.rotation.z.toFixed(2)
      }
    });
    // --- FIM DO LOG ---

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
