import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/sceneManager.js';
import * as CANNON from 'cannon-es';
import { world, initPhysics, createPlayerBody, registerPhysicsObject } from '../core/physics.js';
import { showMarker } from './marker.js';

// Função auxiliar para obter cookies (necessário para XSRF-TOKEN)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const token = parts.pop().split(';').shift();
        // O token do cookie está URL-encoded, então precisamos decodificá-lo
        const decodedToken = decodeURIComponent(token);
        return decodedToken;
    }
}

const gltfLoader = new GLTFLoader();

// Função genérica para carregar um modelo de jogador
export function loadPlayerModel(path = '/models/scene.gltf') {
  return new Promise((resolve, reject) => {
    gltfLoader.load(path, (gltf) => {
      const model = gltf.scene;
      const mixer = new THREE.AnimationMixer(model);

      const walkAction = mixer.clipAction(gltf.animations[0]);
      const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
      const idleAction = idleClip ? mixer.clipAction(idleClip) : null;

      if (idleAction) idleAction.play();

      resolve({ model, mixer, walkAction, idleAction });
    }, undefined, reject);
  });
}

let localPlayerModel, localPlayerMixer, localPlayerWalkAction, localPlayerIdleAction, targetPosition = null;
let playerBody;
let characterSize; // Variável para armazenar o tamanho do personagem

export function loadCharacter(path = '/models/scene.gltf', groundY = 0) {
  return new Promise(async (resolve) => {
    const { model, mixer, walkAction, idleAction } = await loadPlayerModel(path);
    localPlayerModel = model;
    localPlayerMixer = mixer;
    localPlayerWalkAction = walkAction;
    localPlayerIdleAction = idleAction;

    scene.add(localPlayerModel);

    // Calcula o tamanho do modelo para o corpo físico
    const box = new THREE.Box3().setFromObject(localPlayerModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    characterSize = size;

    // Inicializa física e corpo do player
    if (!world) initPhysics();
    // Posiciona o corpo físico um pouco acima do chão
    playerBody = createPlayerBody(size, new CANNON.Vec3(0, groundY + size.y / 2 + 0.1, 0));
    // world.addBody(playerBody); // REMOVIDO: Já é adicionado por registerPhysicsObject

    // REGISTRA O JOGADOR LOCAL COM O SISTEMA DE FÍSICA
    registerPhysicsObject('localPlayer', localPlayerModel, playerBody, characterSize.y);

    resolve({ model: localPlayerModel });
  });
}

let lastSentTime = 0;
const throttleInterval = 100; // ms

export function updateCharacter(deltaTime, keysPressed) {
  if (!localPlayerModel || !localPlayerMixer || !playerBody) return;

  const moveSpeed = 15; // Unidades por segundo
  const rotationSpeed = 2 * deltaTime;
  let isMoving = false;

  // // Zera a velocidade horizontal no início do frame para garantir que pare quando não houver input
  playerBody.velocity.x = 0;
  playerBody.velocity.z = 0;

  // Movimento por teclas
  if (keysPressed['arrowleft']) {
    localPlayerModel.rotation.y += rotationSpeed;
  }
  if (keysPressed['arrowright']) {
    localPlayerModel.rotation.y -= rotationSpeed;
  }
  if (keysPressed['arrowup']) {
    // Calcula direção de movimento
    const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(localPlayerModel.quaternion);
    playerBody.velocity.x = dir.x * moveSpeed;
    playerBody.velocity.z = dir.z * moveSpeed;
    isMoving = true;
  }

  // Movimento por clique
  if (targetPosition && localPlayerModel) {
    const currentPos = new THREE.Vector3().copy(playerBody.position);
    const dir = targetPosition.clone().sub(currentPos);
    dir.y = 0; // Ignoramos a diferença de altura para o movimento no plano XZ
    const distance = dir.length();

    if (distance > 0.1) {
      const angle = Math.atan2(dir.x, dir.z);
      localPlayerModel.rotation.y = angle;

      dir.normalize();
      playerBody.velocity.x = dir.x * moveSpeed;
      playerBody.velocity.z = dir.z * moveSpeed;
      isMoving = true;
    } else {
      // Chegou ao destino
      targetPosition = null;
      showMarker(false);
      isMoving = false;
    }
  }

  // Animations
  if (isMoving) {
    localPlayerIdleAction?.stop();
    localPlayerWalkAction?.play();

    // Envia dados de movimento para o backend (com throttling)
    const now = Date.now();
    if (now - lastSentTime > throttleInterval) {
      lastSentTime = now;
      const movementData = {
        position: { 
          x: parseFloat(playerBody.position.x.toFixed(2)),
          y: parseFloat(playerBody.position.y.toFixed(2)),
          z: parseFloat(playerBody.position.z.toFixed(2))
        },
        rotation: { 
          x: parseFloat(localPlayerModel.rotation.x.toFixed(2)),
          y: parseFloat(localPlayerModel.rotation.y.toFixed(2)),
          z: parseFloat(localPlayerModel.rotation.z.toFixed(2))
        }
      };

      fetch('http://localhost:8003/api/player/movement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'),
          'X-Requested-With': 'XMLHttpRequest' // Adiciona este cabeçalho
        },
        body: JSON.stringify(movementData),
        credentials: 'include' // Garante que os cookies sejam enviados
      }).catch(console.error);
    }

  } else {
    localPlayerWalkAction?.stop();
    localPlayerIdleAction?.play();
  }

  localPlayerMixer.update(deltaTime);
}

export function getModelPosition() {
  const pos = new THREE.Vector3();
  localPlayerModel.getWorldPosition(pos);
  return pos;
}

export function setTarget(position) {
  targetPosition = position;
}

export function getCharacterModel() {
  return localPlayerModel;
}

