
import * as THREE from 'three';
import { scene } from '../core/sceneManager';

let marker;

function createMarker() {
    const geometry = new THREE.OctahedronGeometry(0.23, 0);

    // Material para o corpo sólido e translúcido
    const solidMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.4
    });
    const solidMesh = new THREE.Mesh(geometry, solidMaterial);

    // Material para o contorno (wireframe)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Cor branca para o contorno
        wireframe: true
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

    // Agrupa os dois meshes para que se comportem como um único objeto
    marker = new THREE.Group();
    marker.add(solidMesh);
    marker.add(wireframeMesh);

    marker.visible = false;
    scene.add(marker);
}

function setMarkerPosition(position, height = 0.4) {
    if (marker) {
        marker.position.copy(position);
        marker.position.y += height;
    }
}

function showMarker(visible) {
    if (marker) {
        marker.visible = visible;
    }
}

function updateMarker() {
    if (marker && marker.visible) {
        marker.rotation.y += 0.05;
    }
}

export { createMarker, setMarkerPosition, showMarker, updateMarker };
