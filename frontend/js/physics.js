const ASTEROID_DENSITY_KG_M3 = 3000; //might add types of asteroids
const HIROSHIMA_JOULES = 6.3e13;
const EARTH_RADIUS_KM = 6371;

export function scaleDistance(realDistanceKm) {
    const MIN_DISTANCE = 10000;
    const clamped = Math.max(realDistanceKm, MIN_DISTANCE);
    return Math.log10(clamped);
}

export function getScaledEarthRadius() {
    return scaleDistance(EARTH_RADIUS_KM);
}

export function estimateMass(diameterMeters) {
    const radius = diameterMeters / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    return ASTEROID_DENSITY_KG_M3 * volume;
}

export function calculateKineticEnergy(diameterMeters, velocityKmPerSec) {
    const mass = estimateMass(diameterMeters);
    const velocityMps = velocityKmPerSec * 1000;
    return 0.5 * mass * Math.pow(velocityMps, 2);
}

export function jouleToHiroshimas(joules) {
    return joules / HIROSHIMA_JOULES;
}

export function formatEnergy(joules) {
    const exponent = Math.floor(Math.log10(joules));
    const mantissa = (joules / Math.pow(10, exponent)).toFixed(2);
    return `${mantissa} x 10^${exponent} J`;
}

export function calculateCraterDiameter(kineticEnergyJoules) {
    const energyMegatons = kineticEnergyJoules / 4.184e15;
    return 0.074 * Math.pow(energyMegatons, 0.29);
}

export function calculateEarthquakeMagnitude(kineticEnergyJoules) {
    const seismicEnergy = kineticEnergyJoules * 0.01; //what is this ffk
    return (Math.log10(seismicEnergy) - 4.8) / 1.5;
}

export function calculateDestructionRadius(kineticEnergyJoules) {
    const energyMegatons = kineticEnergyJoules / 4.184e15;
    return 1.4 * Math.pow(energyMegatons, 1 / 3);
}

const BENCHMARKS = [
    {
        name: "Chelyabinsk (2013)",
        energy: 500e3 * 4.184e9,
        description: "Shattered windows, 1,500 injured"
    },
    {
        name: "Tunguska (1908)",
        energy: 15e6 * 4.184e9,
        description: "Flattened 2,000 km2 of forest"
    },
    {
        name: "Meteor Crater (50,000 ya)",
        energy: 10e6 * 4.184e9,
        description: "1.2 km crater in Arizona"
    },
    {
        name: "Chicxulub (66 Ma)",
        energy: 1e8 * 4.184e15,
        description: "Mass extinction event"
    }
];

export function findNearestBenchmark(kineticEnergy) {
    const logEnergy = Math.log10(kineticEnergy);

    return BENCHMARKS.reduce((closest, benchmark) => {
        const diff = Math.abs(logEnergy - Math.log10(benchmark.energy));
        const closestDiff = Math.abs(logEnergy - Math.log10(closest.energy));
        return diff < closestDiff ? benchmark : closest;
    });
}

export function sphericalToCartesian(radius, theta, phi) {
    return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta)
    };
}

export function randomSpherePosition(scaledRadius) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return sphericalToCartesian(scaledRadius, theta, phi);
}

export function formatNumber(num, decimals = 2) {
    if (num >= 1e9) return (num / 1e9).toFixed(decimals) + ' billion';
    if (num >= 1e6) return (num / 1e6).toFixed(decimals) + ' million';
    if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'k';
    return num.toFixed(decimals);
}
