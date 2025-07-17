import { loadChair } from './chair.js';
import { loadTable, getTableBoundingBoxes } from './table.js';
import * as THREE from 'three';

export async function loadAllProps() {
  await Promise.all([
    // loadTable(new THREE.Vector3(2, 0, -1), Math.PI / 4),
    loadTable(new THREE.Vector3(15, 0, -.96), Math.PI / 2),
    loadTable(new THREE.Vector3(10, 0, -.96), Math.PI / 2),
    loadTable(new THREE.Vector3(5, 0, -.96), Math.PI / 2),
    loadTable(new THREE.Vector3(1, 0, -.96), Math.PI / 2),

    loadChair(new THREE.Vector3(8.9, 0, 0), Math.PI / 2),
    loadChair(new THREE.Vector3(8.9, 0, 1.5), Math.PI / 2),
    loadChair(new THREE.Vector3(8.9, 0, -1.5), Math.PI / 2),


  ]);
}
export function getAllPropBoundingBoxes() {
  return allObjectBoxes;
}