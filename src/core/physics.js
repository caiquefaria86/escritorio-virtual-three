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
    // Garante um delta mínimo para a simulação avançar
    const fixedTimeStep = 1 / 60; // 60 Hz
    const maxSubSteps = 10; // Limita o número de sub-passos para evitar espirais da morte
  
    const playerEntry = bodies.get('localPlayer');
    
    world.step(fixedTimeStep, delta, maxSubSteps);
  }
}

// Vincula um THREE.Mesh com um CANNON.Body
export function registerPhysicsObject(name, mesh, body, height = 0) {
  bodies.set(name, { mesh, body, height });
  world.addBody(body);
}

export function updatePhysicsMeshes() {
  for (const { mesh, body, height } of bodies.values()) {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
    // Aplica o offset vertical para alinhar a base do modelo com o centro do corpo físico
    if (height > 0) {
      mesh.position.y -= height / 2;
    }
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
    mass: 0, // Corpos estáticos têm massa 0
    type: CANNON.Body.STATIC, // Define o corpo como estático
    position: new CANNON.Vec3(center.x, center.y, center.z),
    shape,
    allowSleep: false, // Impede que o corpo durma
  });

  registerPhysicsObject(name, mesh, body, size.y);
}

export function createDynamicBox(name, mesh, mass = 5) {
  const box3 = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box3.getSize(size);
  const center = new THREE.Vector3();
  box3.getCenter(center);

  const shape = new CANNON.Box(
    new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
  );

  const body = new CANNON.Body({
    mass: mass,
    position: new CANNON.Vec3(center.x, center.y, center.z),
    shape,
    linearDamping: 0.1,
    angularDamping: 0.5,
  });

  registerPhysicsObject(name, mesh, body, size.y);
}

export function createPlayerBody(size, initialPosition = new CANNON.Vec3(0, 1, 0)) {
  const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
  const body = new CANNON.Body({
    mass: 50,
    position: initialPosition,
    shape,
    fixedRotation: true, // Removido para permitir rotação do corpo físico
    allowSleep: false, // Impede que o corpo do personagem durma
  });

  return body;
}

// Cria o chão físico como um box para garantir colisão
export function createGroundBox(name, size, floorPosition, mesh) {
  console.log('Creating ground box:', name, size, floorPosition);
  const groundHalfHeight = 0.1; // Metade da altura da caixa física do chão

  const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, groundHalfHeight, size.z / 2));
  const body = new CANNON.Body({
    mass: 0,
    type: CANNON.Body.STATIC, // Define explicitamente o corpo como estático
    // A posição do corpo é o seu centro. Para que a superfície superior esteja em `floorPosition.y`, o centro deve estar `floorPosition.y - groundHalfHeight`.
    position: new CANNON.Vec3(floorPosition.x, floorPosition.y - groundHalfHeight + 0.15, floorPosition.z),
    shape: new CANNON.Plane()
  })
  body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

  registerPhysicsObject(name, mesh, body);
}