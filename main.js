document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    camera.position.z = 5;

    renderer.setSize(window.innerWidth, window.innerHeight);

    const game = new Game(scene);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

    // Adicionar elementos do parquinho
    const playgroundObjects = [
        {
            geometry: new THREE.SphereGeometry(0.5, 32, 32),
            material: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
            position: new THREE.Vector3(-1, 0.6, 1)
        },
        {
            geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5),
            material: new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
            position: new THREE.Vector3(1, 0.3, 1)
        }
    ];

    playgroundObjects.forEach((object) => {
        const mesh = new THREE.Mesh(object.geometry, object.material);
        mesh.position.copy(object.position);
        scene.add(mesh);
    });
});
