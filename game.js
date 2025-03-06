// Cena e câmera
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    window.innerWidth / -100, window.innerWidth / 100,
    window.innerHeight / 100, window.innerHeight / -100,
    0.1, 1000
);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// Renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Texturas e materiais
const textureLoader = new THREE.TextureLoader();
const sandTexture = textureLoader.load('textures/sand_texture.jpg');
sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;

const displacementMap = textureLoader.load('textures/track_01_heightmap.jpg'); // Mapa de relevo

const planeGeometry = new THREE.PlaneGeometry(20, 20, 128, 128);
const planeMaterial = new THREE.MeshStandardMaterial({
    map: sandTexture,
    displacementMap: displacementMap,
    displacementScale: 1.0,
    roughness: 0.8
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Criar tampinhas menores
const caps = [];
const capGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 32);
const capMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

for (let i = 0; i < 3; i++) {
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.set(Math.random() * 8 - 4, 0.1, Math.random() * 8 - 4);
    cap.userData.velocity = new THREE.Vector3(0, 0, 0);
    scene.add(cap);
    caps.push(cap);
}

// Interação com tampinhas
let selectedCap = null;
let startPoint = new THREE.Vector2();
let isRotating = false;
let lastRotationPoint = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
    if (event.button === 2 || event.touches?.length === 2) {
        isRotating = true;
        lastRotationPoint.set(event.clientX, event.clientY);
        return;
    }
    
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(caps);
    
    if (intersects.length > 0) {
        selectedCap = intersects[0].object;
        startPoint.set(event.clientX, event.clientY);
    }
});

window.addEventListener('pointermove', (event) => {
    if (isRotating) {
        const deltaX = event.clientX - lastRotationPoint.x;
        scene.rotation.y += deltaX * 0.01;
        lastRotationPoint.set(event.clientX, event.clientY);
    }
});

window.addEventListener('pointerup', (event) => {
    if (isRotating) {
        isRotating = false;
        return;
    }
    
    if (selectedCap) {
        const endPoint = new THREE.Vector2(event.clientX, event.clientY);
        const direction = new THREE.Vector3(
            (startPoint.x - endPoint.x) * 0.01,
            0,
            (startPoint.y - endPoint.y) * 0.01
        );
        selectedCap.userData.velocity.copy(direction);
        selectedCap = null;
    }
});

// Atualizar movimento das tampinhas
function updateCaps() {
    caps.forEach(cap => {
        cap.position.add(cap.userData.velocity);
        cap.userData.velocity.multiplyScalar(0.98); // Atrito
    });
}

// Animação
function animate() {
    requestAnimationFrame(animate);
    updateCaps();
    renderer.render(scene, camera);
}

animate();

// Responsividade
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.left = window.innerWidth / -100;
    camera.right = window.innerWidth / 100;
    camera.top = window.innerHeight / 100;
    camera.bottom = window.innerHeight / -100;
    camera.updateProjectionMatrix();
});

// Impedir menu de contexto ao clicar com botão direito
window.addEventListener('contextmenu', (event) => event.preventDefault());
