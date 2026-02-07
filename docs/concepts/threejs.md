# Three.js

## What Is It?

Three.js is a JavaScript library that abstracts WebGL, the low-level browser API for GPU-accelerated 3D graphics. It provides an intuitive scene graph model instead of raw shader programming.

## Why We Chose It

### 1. Abstraction Level
Raw WebGL requires writing shaders in GLSL (OpenGL Shading Language) and managing vertex buffers manually. Three.js gives us high-level primitives:

```
// WebGL: ~200 lines of shader code + buffer management
// Three.js:
const sphere = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshPhongMaterial({ color: 0x0077ff });
const mesh = new THREE.Mesh(sphere, material);
scene.add(mesh);
```

### 2. The Scene Graph Model
Three.js organizes 3D worlds hierarchically:

```
Scene
├── Camera (what we see through)
├── Lights (illuminate objects)
└── Objects (meshes, groups)
    └── Children (inherit parent transforms)
```

Moving a parent moves all children. This makes complex animations tractable.

### 3. Materials and Lighting
Built-in materials respond to light realistically:

| Material | Use Case |
|----------|----------|
| `MeshBasicMaterial` | Unlit, always visible |
| `MeshPhongMaterial` | Shiny surfaces with specular highlights |
| `MeshStandardMaterial` | Physically-based rendering (PBR) |

### 4. Raycasting
Three.js provides hit-testing out of the box:

```
const raycaster = new THREE.Raycaster();
raycaster.setFromCamera(mousePosition, camera);
const intersects = raycaster.intersectObjects(scene.children);
```

This lets us detect which meteorite the user clicked.

## The Render Loop

Three.js requires a manual animation loop:

```
function animate() {
    requestAnimationFrame(animate);  // Schedule next frame
    earth.rotation.y += 0.001;       // Update state
    renderer.render(scene, camera);  // Draw
}
animate();
```

`requestAnimationFrame` syncs to the display's refresh rate (usually 60 FPS).

## The Alternative Considered

**Babylon.js** is more feature-rich (built-in physics, audio), but:
- Larger bundle size (~500KB vs ~150KB gzipped)
- Steeper learning curve
- Overkill for our visualization needs

Three.js is the Goldilocks choice: powerful enough, lean enough.

