# Impact Damage Assessment

## Overview

When a meteorite impacts Earth, we calculate three damage metrics:
1. **Crater Diameter**
2. **Earthquake Magnitude**
3. **Destruction Radius**

## Crater Diameter

We use a simplified form of the Pi-scaling crater formula:

```
D = 1.8 × ρᵢ^0.11 × ρₜ^(-1/3) × gₑ^(-0.22) × dᵢ^0.13 × W^0.22
```

For practical implementation, we use the Holsapple scaling relation simplified for Earth impacts:

```
function calculateCraterDiameter(kineticEnergyJoules) {
    // Empirical fit for terrestrial impacts
    // Returns diameter in kilometers
    const energyMegatons = kineticEnergyJoules / 4.184e15;
    return 0.074 * Math.pow(energyMegatons, 0.29);
}
```

### Reference Points

| Event | Energy (MT) | Crater Diameter |
|-------|-------------|-----------------|
| Barringer Crater | ~10 MT | 1.2 km |
| Chicxulub (dinosaur extinction) | ~100,000,000 MT | 180 km |

## Earthquake Magnitude

Impact energy correlates to seismic energy release. We use the Gutenberg-Richter relation:

```
log₁₀(E) = 1.5M + 4.8
```

Solving for magnitude:

```
function calculateMagnitude(kineticEnergyJoules) {
    // Only ~1% of kinetic energy converts to seismic waves
    const seismicEnergy = kineticEnergyJoules * 0.01;
    return (Math.log10(seismicEnergy) - 4.8) / 1.5;
}
```

### Reference Points

| Magnitude | Equivalent |
|-----------|------------|
| 4.0 | Minor earthquake |
| 7.0 | Major earthquake (building damage) |
| 9.0 | Megathrust earthquake (2011 Japan) |
| 12.0 | Chicxulub impact |

## Destruction Radius (Thermal + Blast)

We calculate the radius where overpressure exceeds structural tolerances.

```
function calculateDestructionRadius(kineticEnergyJoules) {
    // Simplified nuclear weapons effects scaling
    // 10 psi overpressure (complete building destruction)
    const energyMegatons = kineticEnergyJoules / 4.184e15;
    return 1.4 * Math.pow(energyMegatons, 1/3); // km
}
```

## Historical Benchmarks

We compare calculated damage to known events:

```
const BENCHMARKS = {
    tunguska: {
        name: "Tunguska Event (1908)",
        energy: 15e6 * 4.184e9, // 15 MT in Joules
        description: "Flattened 2,000 km² of Siberian forest"
    },
    chelyabinsk: {
        name: "Chelyabinsk (2013)",
        energy: 500e3 * 4.184e9, // 500 kT
        description: "Shattered windows across city, 1,500 injured"
    },
    chicxulub: {
        name: "Chicxulub (66 Ma)",
        energy: 1e8 * 4.184e15, // 100 million MT
        description: "Mass extinction event"
    }
};

function getNearestBenchmark(kineticEnergy) {
    // Find the benchmark closest in magnitude
    return Object.values(BENCHMARKS).reduce((closest, benchmark) => {
        const diff = Math.abs(Math.log10(kineticEnergy) - Math.log10(benchmark.energy));
        const closestDiff = Math.abs(Math.log10(kineticEnergy) - Math.log10(closest.energy));
        return diff < closestDiff ? benchmark : closest;
    });
}
```

## Damage Report UI

The final damage report displays:

```
╔══════════════════════════════════════╗
║       IMPACT ASSESSMENT REPORT       ║
╠══════════════════════════════════════╣
║ Kinetic Energy:  4.2 × 10¹⁷ J        ║
║                  (6,670 Hiroshimas)  ║
║ Crater Diameter: 3.2 km              ║
║ Earthquake:      M 8.4               ║
║ Destruction:     45 km radius        ║
╠══════════════════════════════════════╣
║ Comparable to:   Tunguska Event      ║
║ "Would flatten a major city"         ║
╚══════════════════════════════════════╝
```

