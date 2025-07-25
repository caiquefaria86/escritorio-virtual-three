
import * as THREE from 'three';
import { scene } from '../core/sceneManager';

let marker;

function createMarker() {
    const geometry = new THREE.OctahedronGeometry(0.3, 0);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5
    });
    marker = new THREE.Mesh(geometry, material);
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
        marker.rotation.y += 0.01;
    }
}

export { createMarker, setMarkerPosition, showMarker, updateMarker };
