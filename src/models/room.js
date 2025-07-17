import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from '../core/sceneManager.js';

const loader = new GLTFLoader();
let roomBoundingBox = null;

export function loadRoom(path = '/models/room.glb') {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const room = gltf.scene;
        scene.add(room);

        // Bounding box da sala
        roomBoundingBox = new THREE.Box3().setFromObject(room);
        
        // (opcional) debug do tamanho:
        const size = new THREE.Vector3();
        roomBoundingBox.getSize(size);
        console.log('Room size:', size);

        resolve(room);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

export function getRoomBoundingBox() {
  return roomBoundingBox;
}