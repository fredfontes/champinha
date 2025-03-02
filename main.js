import { createScene } from './game.js';
import { loadTracks } from './track.js';

let scene, camera, renderer;

function init() {
  const container = document.getElementById('game-container');
  const { scene: newScene, camera: newCamera, renderer: newRenderer } = createScene(container);
  scene = newScene;
  camera = newCamera;
  renderer = newRenderer;

  // Carrega os circuitos
  loadTracks(scene);

  // Inicia o loop de animação
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

init();