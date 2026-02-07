# Kinetic Energy Calculations

## The Core Formula

Kinetic energy (KE) is the energy an object possesses due to its motion:

```
KE = ½ × m × v²
```

Where:
- `KE` = Kinetic energy (Joules)
- `m` = Mass (kilograms)
- `v` = Velocity (meters per second)

## Why Velocity Is Squared

A meteorite traveling at 20 km/s has 4× the energy of one at 10 km/s (same mass). This quadratic relationship means small velocity changes have enormous energy consequences.

```
v = 10 km/s → KE ∝ 100
v = 20 km/s → KE ∝ 400  (4× more)
v = 30 km/s → KE ∝ 900  (9× more)
```

## Estimating Mass from NASA Data

NASA provides diameter, not mass. We estimate mass assuming:

1. **Spherical shape**:
   ```
   Volume = (4/3) × π × r³
   ```

2. **S-type asteroid density** (most common): 
   ```
   ρ = 3000 kg/m³
   ```

Combined:
```
mass = ρ × (4/3) × π × r³
     = 3000 × (4/3) × π × (diameter/2)³
```

### Implementation

```
function estimateMass(diameterMeters) {
    const DENSITY = 3000; // kg/m³, S-type asteroid
    const radius = diameterMeters / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    return DENSITY * volume;
}

function calculateKineticEnergy(diameterMeters, velocityKmPerSec) {
    const mass = estimateMass(diameterMeters);
    const velocityMps = velocityKmPerSec * 1000; // Convert to m/s
    return 0.5 * mass * Math.pow(velocityMps, 2);
}
```

## Putting It in Perspective

We express energy in "Hiroshima bomb equivalents" for human comprehension:

```
const HIROSHIMA_JOULES = 6.3e13; // 15 kilotons TNT

function toHiroshimas(joules) {
    return joules / HIROSHIMA_JOULES;
}
```

### Example: Chelyabinsk Meteor (2013)
- Diameter: ~20 meters
- Velocity: ~19 km/s
- Energy: ~500 kilotons ≈ **33 Hiroshimas**

## Slider Interaction

When the user adjusts velocity, we immediately recalculate:

```
velocitySlider.addEventListener('input', (e) => {
    const newVelocity = parseFloat(e.target.value);
    const ke = calculateKineticEnergy(selectedMeteor.diameter, newVelocity);
    displayEnergy(ke);
});
```

This real-time feedback demonstrates the quadratic relationship intuitively.

