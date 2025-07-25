import { loadChair, getChairBoundingBoxes } from './chair.js';
import { loadTable, getTableBoundingBoxes } from './table.js';
import * as THREE from 'three';
import { createStaticBox, createDynamicBox } from '../../core/physics.js';

export async function loadAllProps() {
  await Promise.all([
    loadTable(new THREE.Vector3(0, 0 , 0), 0).then(table => createStaticBox('table1', table)),
    loadChair(new THREE.Vector3(8.9, 0 , -1.5), 0).then(chair => createDynamicBox('chair3', chair)),
  ]);
}
export function getAllPropBoundingBoxes() {
  const tableBoxes = getTableBoundingBoxes();
  const chairBoxes = getChairBoundingBoxes();
  return tableBoxes.concat(chairBoxes);
}