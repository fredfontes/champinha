import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, cap, track, clock;
let mouseDownTime = 0;
let currentTurn = true; // Simula turnos simples (um jogador por enquanto)
let lapCount = 0;
const maxLaps = 3;

// Configurações iniciais
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2;

    clock = new THREE.Clock();

    // Luz
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Carregar pista inicial
    loadTrack(0);
    addPlaygroundElements();

    // Tampinha
    cap = createCap();
    scene.add(cap);

    // Eventos do mouse
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    // Seleção de pista
    document.getElementById('trackSelect').addEventListener('change', (e) => {
        loadTrack(parseInt(e.target.value));
    });

    animate();
}

// Criação da tampinha
function createCap() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const cap = new THREE.Mesh(geometry, material);
    cap.position.set(0, 0.05, 0);
    return cap;
}

// Carregar pista
function loadTrack(trackIndex) {
    if (track) scene.remove(track);
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Cor de terra
    track = new THREE.Mesh(geometry, material);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    // Definir limites da pista (arrays de pontos para cada pista)
    const tracks = [
        // Pista 1: Simples (retângulo)
        [
            new THREE.Vector2(-5, -5), new THREE.Vector2(5, -5),
            new THREE.Vector2(5, 5), new THREE.Vector2(-5, 5)
        ],
        // Pista 2: Curvas (simplificado)
        [
            new THREE.Vector2(-5, -5), new THREE.Vector2(0, -7),
            new THREE.Vector2(5, -5), new THREE.Vector2(5, 5),
            new THREE.Vector2(0, 7), new THREE.Vector2(-5, 5)
        ],
        // Pista 3: Obstáculos (com buracos)
        [
            new THREE.Vector2(-5, -5), new THREE.Vector2(5, -5),
            new THREE.Vector2(5, 0), new THREE.Vector2(0, 0),
            new THREE.Vector2(0, 5), new THREE.Vector2(-5, 5)
        ]
    ];
    track.userData.bounds = tracks[trackIndex];
    track.userData.startPosition = tracks[trackIndex][0].clone();
    resetCap();
}

// Elementos de parquinho
function addPlaygroundElements() {
    // Pá
    const shovelGeo = new THREE.BoxGeometry(0.2, 2, 0.5);
    const shovelMat = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const shovel = new THREE.Mesh(shovelGeo, shovelMat);
    shovel.position.set(-8, 1, -8);
    scene.add(shovel);

    // Balde
    const bucketGeo = new THREE.CylinderGeometry(0.5, 0.7, 1, 32);
    const bucketMat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const bucket = new THREE.Mesh(bucketGeo, bucketMat);
    bucket.position.set(8, 0.5, 8);
    scene.add(bucket);

    // Bolinhas
    const ballGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const ballMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(-8, 0.3, 8);
    scene.add(ball);
}

// Controle do mouse
function onMouseDown(event) {
    if (!currentTurn) return;
    mouseDownTime = clock.getElapsedTime();
}

function onMouseUp(event) {
    if (!currentTurn) return;
    const pressDuration = clock.getElapsedTime() - mouseDownTime;
    const force = Math.min(pressDuration * 5, 5); // Limite de força

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cap);

    if (intersects.length > 0) {
        const direction = new THREE.Vector3()
            .subVectors(raycaster.ray.direction, cap.position)
            .normalize();
        moveCap(direction, force);
    }
}

// Movimento da tampinha
function moveCap(direction, force) {
    const velocity = direction.multiplyScalar(force);
    const newPos = cap.position.clone().add(velocity);

    // Verificar se está dentro da pista
    if (isInsideTrack(newPos)) {
        cap.position.copy(newPos);
        checkLapCompletion();
    } else {
        resetCapToNearest();
    }
    currentTurn = false; // Fim do turno
    setTimeout(() => (currentTurn = true), 1000); // Próximo turno após 1s
}

// Verificar se está dentro da pista
function isInsideTrack(position) {
    const bounds = track.userData.bounds;
    let inside = false;
    for (let i = 0, j = bounds.length - 1; i < bounds.length; j = i++) {
        const xi = bounds[i].x, zi = bounds[i].y;
        const xj = bounds[j].x, zj = bounds[j].y;
        const intersect = ((zi > position.z) !== (zj > position.z)) &&
            (position.x < (xj - xi) * (position.z - zi) / (zj - zi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Verificar volta completa
function checkLapCompletion() {
    const start = track.userData.startPosition;
    if (cap.position.distanceTo(new THREE.Vector3(start.x, 0, start.y)) < 1 && lapCount < maxLaps) {
        lapCount++;
        if (lapCount === maxLaps) {
            alert("Fim do jogo! Você completou as 3 voltas!");
            resetGame();
        }
    }
}

// Resetar tampinha
function resetCap() {
    const start = track.userData.startPosition;
    cap.position.set(start.x, 0.05, start.y);
}

function resetCapToNearest() {
    const bounds = track.userData.bounds;
    let nearest = bounds[0];
    let minDist = cap.position.distanceTo(new THREE.Vector3(nearest.x, 0, nearest.y));
    for (let i = 1; i < bounds.length; i++) {
        const dist = cap.position.distanceTo(new THREE.Vector3(bounds[i].x, 0, bounds[i].y));
        if (dist < minDist) {
            minDist = dist;
            nearest = bounds[i];
        }
    }
    cap.position.set(nearest.x, 0.05, nearest.y);
}

function resetGame() {
    lapCount = 0;
    resetCap();
}

// Animação
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Ajustar tamanho da janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();