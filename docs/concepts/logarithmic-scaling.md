# Logarithmic Scaling

## The Problem

Space is incomprehensibly vast. Consider these real distances:

| Object | Distance from Earth |
|--------|---------------------|
| Moon | 384,400 km |
| Typical NEO close approach | 5,000,000 km |
| Mars (at closest) | 54,600,000 km |

If we render Earth as a 1-unit sphere and scale linearly where 1 unit = 10,000 km:
- Moon renders at 38 units from center
- A NEO at 5 million km renders at 500 units away
- At that distance, the NEO appears as a sub-pixel dot

**Linear scaling fails because nearby objects dominate the viewport while distant objects vanish.**

## The Solution: Logarithmic Compression

Instead of:
```
visual_distance = real_distance / scale_factor
```

We use:
```
visual_distance = log₁₀(real_distance)
```

### Why Logarithms Work

Logarithms compress large ranges into manageable ones:

| Real Distance (km) | log₁₀(distance) |
|--------------------|-----------------|
| 100,000 | 5 |
| 1,000,000 | 6 |
| 10,000,000 | 7 |
| 100,000,000 | 8 |

A 1000x increase in real distance becomes just 3 units of visual distance.

### Visual Result

```
Linear Scaling:      [Earth]--------------------[Moon]--------------------------------------------------------[NEO at 500 units, invisible]

Logarithmic Scaling: [Earth]---[Moon at 5.6]---[NEO at 6.7]---[Distant object at 8]
```

All objects remain visible and spatially meaningful.

## Implementation

```
function scaleDistance(realDistanceKm) {
    const MIN_DISTANCE = 10000; // Prevent log(0) and keep near objects visible
    const clamped = Math.max(realDistanceKm, MIN_DISTANCE);
    return Math.log10(clamped);
}
```

### Edge Cases

1. **Distance = 0**: `log₁₀(0)` is undefined. We clamp to a minimum distance.
2. **Very small distances**: Objects closer than Earth's radius get clamped to prevent clipping.
3. **Direction preservation**: We apply scaling only to magnitude, keeping the direction vector intact.

## Trade-offs

| Advantage | Disadvantage |
|-----------|--------------|
| All objects visible | Relative distances are distorted |
| No objects at infinity | Users may misinterpret proximity |
| Works for any scale | Requires UI explanation |

We mitigate the distortion by displaying true distances in kilometers on the dashboard, making clear that visual positions are stylized.

