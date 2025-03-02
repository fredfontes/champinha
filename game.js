class Game {
    constructor(scene) {
        this.scene = scene;
        this.tracks = [];
        this.bottleCaps = [];
        this.circuitIndex = 0;

        // Definição dos circuitos
        const circuits = [
            [
                new THREE.Vector3(-2, 0, 0),
                new THREE.Vector3(2, 0, 0),
                new THREE.Vector3(2, 0, 2),
                new THREE.Vector3(-2, 0, 2),
                new THREE.Vector3(-2, 0, 0)
            ],
            [
                new THREE.Vector3(-1, 0, 0),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(1, 0, 1),
                new THREE.Vector3(-1, 0, 1),
                new THREE.Vector3(-1, 0, 0)
            ],
            [
                new THREE.Vector3(-3, 0, 0),
                new THREE.Vector3(3, 0, 0),
                new THREE.Vector3(3, 0, 3),
                new THREE.Vector3(-3, 0, 3),
                new THREE.Vector3(-3, 0, 0)
            ]
        ];

        // Criação dos circuitos
        circuits.forEach((path, index) => {
            this.tracks.push(new Track(scene, `Circuito ${index + 1}`, path));
        });

        // Criação das tampinhas
        this.bottleCaps.push(new BottleCap(scene, 0xff0000));
        this.bottleCaps.push(new BottleCap(scene, 0x0000ff));

        // Eventos do mouse
        document.addEventListener('click', (event) => {
            const raycaster = new THREE.Raycaster();
            const mousePosition = new THREE.Vector2();
            mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
            mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mousePosition, scene.camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length > 0) {
                const target = intersects[0].point;
                // Movimentação da tampinha
                this.bottleCaps[0].move(target);
            }
        });

        // Troca de circuito
        document.addEventListener('keydown', (event) => {
            if (event.key === ' ') {
                this.circuitIndex = (this.circuitIndex + 1) % this.tracks.length;
                console.log(`Circuito ${this.circuitIndex + 1} selecionado`);
            }
        });
    }
}
