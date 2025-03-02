import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, cap, track, clock;
let mouseDownTime = 0;
let currentTurn = true;
let lapCount = 0;
const maxLaps = 3;

function init() {
    console.log("Inicializando o jogo...");

    // Cena
    scene = new THREE.Scene();
    console.log("Cena criada.");

    // Câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
    console.log("Câmera configurada.");

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const container = document.getElementById('game-container');
    if (container) {
        container.appendChild(renderer.domElement);
        console.log("Renderer adicionado ao container.");
    } else {
        console.error("Container #game-container não encontrado!");
    }

    // Controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Relógio
    clock = new THREE.Clock();

    // Luzes
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));
    console.log("Luzes adicionadas.");

    // Carregar pista inicial
    loadTrack(0);
    addPlaygroundElements();

    // Tampinha
    cap = createCap();
    scene.add(cap);
    console.log("Tampinha adicionada.");

    // Eventos
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.getElementById('trackSelect').addEventListener('change', (e) => {
        loadTrack(parseInt(e.target.value));
    });

    // Iniciar animação
    animate();
}

function createCap() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const cap = new THREE.Mesh(geometry, material);
    cap.position.set(0, 0.05, 0);
    return cap;
}

function loadTrack(trackIndex) {
    if (track) scene.remove(track);
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    track = new THREE.Mesh(geometry, material);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);
    console.log(`Pista ${trackIndex} carregada.`);

    const tracks = [
        [new THREE.Vector2(-5, -5), new THREE.Vector2(5, -5), new THREE.Vector2(5, 5), new THREE.Vector2(-5, 5)],
        [new THREE.Vector2(-5, -5), new THREE.Vector2(0, -7), new THREE.Vector2(5, -5), new THREE.Vector2(5, 5), new THREE.Vector2(0, 7), new THREE.Vector2(-5, 5)],
        [new THREE.Vector2(-5, -5), new THREE.Vector2(5, -5), new THREE.Vector2(5, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 5), new THREE.Vector2(-5, 5)]
    ];
    track.userData.bounds = tracks[trackIndex];
    track.userData.startPosition = tracks[trackIndex][0].clone();
    resetCap();
}

function addPlaygroundElements() {
    const shovelGeo = new THREE.BoxGeometry(0.2, 2, 0.5);
    const shovelMat = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const shovel = new THREE.Mesh(shovelGeo, shovelMat);
    shovel.position.set(-8, 1, -8);
    scene.add(shovel);

    const bucketGeo = new THREE.CylinderGeometry(0.5, 0.7, 1, 32);
    const bucketMat = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const bucket = new THREE.Mesh(bucketGeo, bucketMat);
    bucket.position.set(8, 0.5, 8);
    scene.add(bucket);

    const ballGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const ballMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(-8, 0.3, 8);
    scene.add(ball);
    console.log("Elementos de parquinho adicionados.");
}

function onMouseDown(event) {
    if (!currentTurn) return;
    mouseDownTime = clock.getElapsedTime();
}

function onMouseUp(event) {
    if (!currentTurn) return;
    const pressDuration = clock.getElapsedTime() - mouseDownTime;
    const force = Math.min(pressDuration * 5, 5);

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

function moveCap(direction, force) {
    const velocity = direction.multiplyScalar(force);
    const newPos = cap.position.clone().add(velocity);

    if (isInsideTrack(newPos)) {
        cap.position.copy(newPos);
        checkLapCompletion();
    } else {
        resetCapToNearest();
    }
    currentTurn = false;
    setTimeout(() => (currentTurn = true), 1000);
}

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

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    console.log("Frame renderizado.");
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log("Iniciando o jogo...");
init();