import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export let world;
const bodies = new Map();

export function initPhysics() {
  world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
  });

  // Otimização para colisões entre muitos objetos
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;
}

export function stepPhysics(delta) {
  if (world) {
    world.step(1 / 60, delta);
  }
}

// Vincula um THREE.Mesh com um CANNON.Body
export function registerPhysicsObject(name, mesh, body) {
  bodies.set(name, { mesh, body });
  world.addBody(body);
}

export function updatePhysicsMeshes() {
  for (const { mesh, body } of bodies.values()) {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }
}

export function createStaticBox(name, mesh) {
  const box3 = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box3.getSize(size);
  const center = new THREE.Vector3();
  box3.getCenter(center);

  const shape = new CANNON.Box(
    new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
  );

  const body = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(center.x, center.y, center.z),
    shape,
  });

  registerPhysicsObject(name, mesh, body);
}

export function createPlayerBody(initialPosition = new CANNON.Vec3(0, 1, 0)) {
  const shape = new CANNON.Sphere(0.1);
  const body = new CANNON.Body({
    mass:  1,
    position: initialPosition,
    shape,
    fixedRotation: true,
  });

  return body;
}

// Cria o chão físico como um box para garantir colisão
export function createGroundBox(name, size, floorPosition, mesh) {
  const groundHalfHeight = 0.1; // Metade da altura da caixa física do chão

  const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, groundHalfHeight, size.z / 2));
  const body = new CANNON.Body({
    mass: 0,
    type: CANNON.Body.STATIC, // Define explicitamente o corpo como estático
    // A posição do corpo é o seu centro. Para que a superfície superior esteja em `floorPosition.y`, o centro deve estar `floorPosition.y - groundHalfHeight`.
    position: new CANNON.Vec3(floorPosition.x, floorPosition.y - groundHalfHeight, floorPosition.z),
    shape,
    // O chão visual (mesh) é rotacionado. O corpo físico precisa ter a mesma rotação.
    // quaternion: mesh.quaternion,
  });
  registerPhysicsObject(name, mesh, body);
}
