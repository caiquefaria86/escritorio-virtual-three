import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../../core/sceneManager.js';

const loader = new GLTFLoader();

const tableBoxes = [];

export function loadTable(position = new THREE.Vector3(0, 0, 0), rotationY = 0) {
  return new Promise((resolve, reject) => {
    loader.load('/models/mesa.glb', (gltf) => {
      const table = gltf.scene;
      table.position.copy(position);
      table.rotation.y = rotationY;

      scene.add(table);

      // Calcula e guarda a caixa de colisão
      const box = new THREE.Box3().setFromObject(table);
      tableBoxes.push(box);

      resolve(table);
    }, undefined, reject);
  });
}

export function getTableBoundingBoxes() {
  return tableBoxes;
}