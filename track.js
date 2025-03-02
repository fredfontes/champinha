class Track {
    constructor(scene, name, path) {
        this.scene = scene;
        this.name = name;
        this.path = path;
        this.geometry = new THREE.BufferGeometry().setFromPoints(path);
        this.material = new THREE.LineBasicMaterial({ color: 0xffffff });
        this.line = new THREE.Line(this.geometry, this.material);
        this.scene.add(this.line);
    }
}
