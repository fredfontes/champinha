// Configuração inicial
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz e ambiente
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Mundo físico com Cannon.js
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Criar pista (simples para começar)
const groundMaterial = new CANNON.Material();
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Adicionando um plano visual para a pista
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);

// Posição inicial da câmera
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

// Criar material da tampinha
const tampinhaMaterial = new CANNON.Material();

// Criar física da tampinha
const tampinhaShape = new CANNON.Circle(0.5);
const tampinhaBody = new CANNON.Body({
    mass: 1,
    material: tampinhaMaterial,
    position: new CANNON.Vec3(0, 0.5, 0)
});
tampinhaBody.addShape(tampinhaShape);
world.addBody(tampinhaBody);

// Criar visual da tampinha
const tampinhaGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
const tampinhaMaterialVisual = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const tampinhaMesh = new THREE.Mesh(tampinhaGeometry, tampinhaMaterialVisual);
scene.add(tampinhaMesh);

let isPressing = false;
let pressTime = 0;

// Detectar clique/toque
window.addEventListener("mousedown", () => {
    isPressing = true;
    pressTime = Date.now();
});

window.addEventListener("mouseup", () => {
    isPressing = false;
    let force = Math.min((Date.now() - pressTime) / 100, 10);
    
    // Aplicar impulso na direção do clique
    tampinhaBody.applyImpulse(new CANNON.Vec3(force, 0, force), tampinhaBody.position);
});

function animate() {
  requestAnimationFrame(animate);
  
  // Atualizar a física
  world.step(1 / 60);
  
  // Sincronizar a tampinha visual com a física
  tampinhaMesh.position.copy(tampinhaBody.position);
  tampinhaMesh.quaternion.copy(tampinhaBody.quaternion);
  
  renderer.render(scene, camera);
}
animate();

function criarPista(tipo) {
  if (tipo === 1) {
      // Circuito com curvas suaves
  } else if (tipo === 2) {
      // Circuito com rampas e cruzamentos
  } else {
      // Circuito misto
  }
}
