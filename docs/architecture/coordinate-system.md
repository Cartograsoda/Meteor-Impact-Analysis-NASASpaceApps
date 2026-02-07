# Coordinate System

## Design Decision: Earth at Origin

We place Earth at the world origin `(0, 0, 0)`. All meteorite positions are relative to Earth.

### Why?

1. **Intuitive Raycasting**: Clicking objects is easier when calculations reference a fixed center.
2. **Camera Orbiting**: Orbit controls naturally rotate around `(0, 0, 0)`.
3. **Distance Calculations**: `distance = length(meteorite.position)` — no arithmetic needed.

## Spherical to Cartesian Conversion

NASA provides orbital data, but for visualization we need Cartesian coordinates. Given:
- `r` = distance from Earth (after logarithmic scaling)
- `θ` (theta) = azimuthal angle (longitude, 0-360°)
- `φ` (phi) = polar angle (latitude measured from pole, 0-180°)

Convert to Cartesian:

```
x = r * sin(φ) * cos(θ)
y = r * cos(φ)
z = r * sin(φ) * sin(θ)
```

### Visual Reference

```
        +Y (up)
         |
         |
         |_____ +X (right)
        /
       /
      +Z (toward viewer)
```

## Practical Implementation

Since NASA provides miss distance but not exact orbital position, we assign random angles to distribute meteorites around Earth:

```
function placeMeteorite(distanceKm) {
    const r = scaleDistance(distanceKm);
    const theta = Math.random() * Math.PI * 2;      // 0 to 2π
    const phi = Math.acos(2 * Math.random() - 1);   // Uniform sphere distribution
    
    return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
    );
}
```

### Why Random Angles?

The NASA NeoWS API provides close approach distance but not the actual position in the sky at any given moment. Rather than fabricate orbital mechanics, we distribute meteorites uniformly on a sphere at the correct distance. This is honest about what we know while still being visually informative.

## Earth Radius Consideration

When detecting collisions, we need the scaled Earth radius:

```
const EARTH_RADIUS_KM = 6371;
const scaledEarthRadius = scaleDistance(EARTH_RADIUS_KM); // ≈ 3.8 units
```

Collision occurs when:
```
meteorite.position.length() < scaledEarthRadius
```

