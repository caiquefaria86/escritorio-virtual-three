import { loadChair } from './chair.js';
import { loadTable, getTableBoundingBoxes } from './table.js';
import * as THREE from 'three';
import { createStaticBox } from '../../core/physics.js';

export async function loadAllProps() {
  await Promise.all([
    // loadTable(new THREE.Vector3(15, 0, -.96), Math.PI / 2).then(table => createStaticBox('table1', table)),
    // loadTable(new THREE.Vector3(10, 0, -.96), Math.PI / 2).then(table => createStaticBox('table2', table)),
    // loadTable(new THREE.Vector3(5, 0, -.96), Math.PI / 2).then(table => createStaticBox('table3', table)),
    // loadTable(new THREE.Vector3(1, 0, -.96), Math.PI / 2).then(table => createStaticBox('table4', table)),

    // loadChair(new THREE.Vector3(8.9, 0 , 0), Math.PI / 2).then(chair => createStaticBox('chair1', chair)),
    // loadChair(new THREE.Vector3(8.9, 0, 1.5), Math.PI / 2).then(chair => createStaticBox('chair2', chair)),
    loadChair(new THREE.Vector3(8.9, -.6 , -1.5), Math.PI / 2).then(chair => createStaticBox('chair3', chair)),
  ]);
}
export function getAllPropBoundingBoxes() {
  return allObjectBoxes;
}