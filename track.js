export function loadTracks(scene) {
    const tracks = [];
  
    const track1 = createTrack({
      shape: 'circle',
      radius: 5,
      position: { x: 0, y: 0, z: 0 },
      decorations: ['pá', 'balde']
    });
    tracks.push(track1);
  
    const track2 = createTrack({
      shape: 'oval',
      radius: 7,
      position: { x: 15, y: 0, z: 0 },
      decorations: ['bolinhas']
    });
    tracks.push(track2);
  
    const track3 = createTrack({
      shape: 'square',
      size: 10,
      position: { x: -15, y: 0, z: 0 },
      decorations: ['areia']
    });
    tracks.push(track3);
  
    tracks.forEach(track => scene.add(track));
    return tracks;
  }
  
  function createTrack({ shape, radius, size, position, decorations }) {
    const trackGroup = new THREE.Group();
  
    let geometry;
    if (shape === 'circle') {
      geometry = new THREE.CircleGeometry(radius, 32);
    } else if (shape === 'oval') {
      geometry = new THREE.EllipseGeometry(radius, radius * 0.7, 32);
    } else if (shape === 'square') {
      geometry = new THREE.PlaneGeometry(size, size);
    }
  
    const material = new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.DoubleSide });
    const trackMesh = new THREE.Mesh(geometry, material);
    trackGroup.add(trackMesh);
  
    decorations.forEach(decoration => addDecoration(trackGroup, decoration));
  
    trackGroup.position.set(position.x, position.y, position.z);
    return trackGroup;
  }
  
  function addDecoration(group, type) {
    let mesh;
    if (type === 'pá') {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), new THREE.MeshBasicMaterial({ color: 0xFFA500 }));
    } else if (type === 'balde') {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 16), new THREE.MeshBasicMaterial({ color: 0xFFD700 }));
    } else if (type === 'bolinhas') {
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshBasicMaterial({ color: 0xFF69B4 }));
    }
    mesh.position.set(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5);
    group.add(mesh);
  }