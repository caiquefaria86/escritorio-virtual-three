import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../../core/sceneManager.js';

const loader = new GLTFLoader();

const chairBoxes = [];

export function loadChair(position = new THREE.Vector3(0, 0, 0), rotationY = 0) {
  return new Promise((resolve, reject) => {
    loader.load('/models/chair/scene.glb', (gltf) => {
      const chair = gltf.scene;
      chair.position.copy(position);
      chair.rotation.y = rotationY;

      scene.add(chair);

      // Calcula e guarda a caixa de colisão
      const box = new THREE.Box3().setFromObject(chair);
      chairBoxes.push(box);

      resolve(chair);   
    }, undefined, reject);
  });
}

export function getTableBoundingBoxes() {
  return tableBoxes;
}