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
    
    console.log(`stepPhysics: delta=${delta.toFixed(4)}`);
    const playerEntry = bodies.get('localPlayer');
    if (playerEntry && playerEntry.body) {
      console.log(`playerBody velocity BEFORE step: x=${playerEntry.body.velocity.x.toFixed(2)}, y=${playerEntry.body.velocity.y.toFixed(2)}, z=${playerEntry.body.velocity.z.toFixed(2)}`);
    }
    
    world.step(fixedTimeStep, delta, maxSubSteps);

    // Adiciona log para depuração da posição do playerBody após o passo da física
    if (playerEntry && playerEntry.body) {
      console.log(`playerBody position AFTER step: x=${playerEntry.body.position.x.toFixed(2)}, y=${playerEntry.body.position.y.toFixed(2)}, z=${playerEntry.body.position.z.toFixed(2)}`);
    }
  }
}

// Vincula um THREE.Mesh com um CANNON.Body
export function registerPhysicsObject(name, mesh, body, height = 0) {
  bodies.set(name, { mesh, body, height });
  world.addBody(body);
}

export function updatePhysicsMeshes() {
  console.log('updatePhysicsMeshes called. Registered bodies:', Array.from(bodies.keys()));
  for (const { mesh, body, height } of bodies.values()) {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
    // Aplica o offset vertical para alinhar a base do modelo com o centro do corpo físico
    if (height > 0) {
      mesh.position.y -= height / 2;
    }
    // Adiciona log para depuração
    if (body.mass > 0) { // Apenas para corpos dinâmicos (personagem)
      console.log(`Body ${body.id} position: x=${body.position.x.toFixed(2)}, y=${body.position.y.toFixed(2)}, z=${body.position.z.toFixed(2)}`);
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
    fixedRotation: true,
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