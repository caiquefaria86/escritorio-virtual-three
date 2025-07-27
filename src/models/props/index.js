import { loadChair, getChairBoundingBoxes } from './chair.js';
import { loadTable, getTableBoundingBoxes } from './table.js';
import * as THREE from 'three';
import { createStaticBox, createDynamicBox } from '../../core/physics.js';

// Lista de todos os objetos a serem carregados na cena
const propsToLoad = [
  { name: 'table1', type: 'static', loader: loadTable, position: new THREE.Vector3(-1, 0, -1), rotation: 0 },
  { name: 'table2', type: 'static', loader: loadTable, position: new THREE.Vector3(5, 0, -1), rotation: 0 },
  { name: 'table3', type: 'static', loader: loadTable, position: new THREE.Vector3(10, 0, -1), rotation: 0 },
  { name: 'chair3', type: 'dynamic', loader: loadChair, position: new THREE.Vector3(8.9, 0, -1.5), rotation: 0 },
  { name: 'chair4', type: 'dynamic', loader: loadChair, position: new THREE.Vector3(8.9, 0, 2), rotation: 0 },
  // Adicione mais objetos aqui para carregar de forma inteligente
  // { name: 'chair4', type: 'dynamic', loader: loadChair, position: new THREE.Vector3(5, 0, -2), rotation: Math.PI / 2 }
];

export async function loadAllProps() {
  console.log('Iniciando carregamento inteligente de objetos...');
  for (const prop of propsToLoad) {
    try {
      // Aguarda o carregamento do modelo 3D
      const model = await prop.loader(prop.position, prop.rotation);

      // Cria o corpo físico correspondente (estático ou dinâmico)
      if (prop.type === 'static') {
        createStaticBox(prop.name, model);
      } else {
        createDynamicBox(prop.name, model);
      }
      console.log(`Objeto '${prop.name}' carregado com sucesso.`);

    } catch (error) {
      console.error(`Falha ao carregar o objeto '${prop.name}':`, error);
    }
  }
  console.log('Carregamento de todos os objetos concluído.');
}

export function getAllPropBoundingBoxes() {
  const tableBoxes = getTableBoundingBoxes();
  const chairBoxes = getChairBoundingBoxes();
  return tableBoxes.concat(chairBoxes);
}
