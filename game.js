// ===============================
// CONFIGURAÇÃO BÁSICA DO THREE.JS
// ===============================

// Criar cena
const scene = new THREE.Scene();

// Criar câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);  // Posição elevada para ver melhor a pista
camera.lookAt(0, 0, 0);  // Aponta para o centro da cena

// Criar renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===============================
// ILUMINAÇÃO PARA EVITAR TELA PRETA
// ===============================

// Luz ambiente (clareia a cena inteira)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Luz direcional (sol)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// ===============================
// ADICIONAR UM CHÃO PARA TESTE
// ===============================

// Criar um plano (pista)
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;  // Deitar o plano na horizontal
scene.add(groundMesh);

// ===============================
// FUNÇÃO DE ANIMAÇÃO (PARA RENDERIZAR)
// ===============================

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
