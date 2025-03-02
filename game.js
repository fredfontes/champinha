import { detectCollision } from './utils.js';

export function createScene(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Posiciona a câmera
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  return { scene, camera, renderer };
}

export function moveCap(cap, direction, speed) {
  cap.position.addScaledVector(direction, speed);

  // Verifica colisão com as bordas da pista
  if (detectCollision(cap)) {
    cap.position.subScaledVector(direction, speed); // Volta à posição anterior
  }
}