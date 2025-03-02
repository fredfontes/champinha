class BottleCap {
    constructor(scene, color) {
        this.scene = scene;
        this.geometry = new THREE.CircleGeometry(0.2, 32);
        this.material = new THREE.MeshBasicMaterial({ color: color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0.1, 0); // Ajuste a posição inicial
        this.scene.add(this.mesh);
    }

    move(to) {
        this.mesh.position.copy(to);
    }
}
