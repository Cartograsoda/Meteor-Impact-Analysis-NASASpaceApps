import {
    calculateKineticEnergy,
    jouleToHiroshimas,
    formatEnergy,
    calculateCraterDiameter,
    calculateEarthquakeMagnitude,
    calculateDestructionRadius,
    findNearestBenchmark,
    formatNumber
} from './physics.js';
import { showImpactLab } from './impact-lab.js';

const dashboard = document.getElementById('dashboard');
const impactReport = document.getElementById('impact-report');
const loadingIndicator = document.getElementById('loading');

const neoNameEl = document.getElementById('neo-name');
const neoDiameterEl = document.getElementById('neo-diameter');
const neoDistanceEl = document.getElementById('neo-distance');
const neoVelocityEl = document.getElementById('neo-velocity');
const neoHazardousEl = document.getElementById('neo-hazardous');

const velocitySlider = document.getElementById('velocity-slider');
const velocityDisplay = document.getElementById('velocity-display');
const kineticEnergyEl = document.getElementById('kinetic-energy');
const energyComparisonEl = document.getElementById('energy-comparison');

const craterSizeEl = document.getElementById('crater-size');
const earthquakeMagEl = document.getElementById('earthquake-mag');
const destructionRadiusEl = document.getElementById('destruction-radius');
const benchmarkEl = document.getElementById('benchmark-comparison');

let selectedNeo = null;
let onImpactSimulate = null;
let lastImpactData = null;

export function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

export function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

export function showDashboard(neoData) {
    selectedNeo = neoData;

    neoNameEl.textContent = neoData.name;
    neoDiameterEl.textContent = `${neoData.diameterMeters.toFixed(1)} m`;
    neoDistanceEl.textContent = `${formatNumber(neoData.missDistanceKm)} km`;
    neoVelocityEl.textContent = `${neoData.velocityKmPerSec.toFixed(2)} km/s`;
    neoHazardousEl.textContent = neoData.isHazardous ? 'YES' : 'NO';
    neoHazardousEl.style.color = neoData.isHazardous ? '#ff4a4a' : '#4aff4a';

    velocitySlider.value = Math.round(neoData.velocityKmPerSec);
    velocitySlider.max = Math.max(100, Math.round(neoData.velocityKmPerSec * 2));

    updateEnergyDisplay();
    dashboard.classList.remove('hidden');
}

export function hideDashboard() {
    dashboard.classList.add('hidden');
    selectedNeo = null;
}

export function setImpactCallback(callback) {
    onImpactSimulate = callback;
}

function updateEnergyDisplay() {
    if (!selectedNeo) return;

    const velocity = parseFloat(velocitySlider.value);
    const ke = calculateKineticEnergy(selectedNeo.diameterMeters, velocity);
    const hiroshimas = jouleToHiroshimas(ke);

    kineticEnergyEl.textContent = formatEnergy(ke);
    energyComparisonEl.textContent = `${formatNumber(hiroshimas, 1)} Hiroshima bombs`;
}

export function showImpactReport(diameterMeters, velocityKmPerSec) {
    const ke = calculateKineticEnergy(diameterMeters, velocityKmPerSec);

    const craterDiameter = calculateCraterDiameter(ke);
    const earthquakeMag = calculateEarthquakeMagnitude(ke);
    const destructionRad = calculateDestructionRadius(ke);
    const benchmark = findNearestBenchmark(ke);

    craterSizeEl.textContent = `${craterDiameter.toFixed(2)} km`;
    earthquakeMagEl.textContent = `M ${earthquakeMag.toFixed(1)}`;
    destructionRadiusEl.textContent = `${destructionRad.toFixed(1)} km`;
    benchmarkEl.textContent = `Comparable to: ${benchmark.name} - ${benchmark.description}`;

    lastImpactData = {
        diameterMeters,
        velocityKmPerSec,
        kineticEnergy: ke
    };

    impactReport.classList.remove('hidden');
}

function hideImpactReport() {
    impactReport.classList.add('hidden');
}

velocitySlider.addEventListener('input', () => {
    const velocity = parseFloat(velocitySlider.value);
    velocityDisplay.textContent = `${velocity} km/s`;
    updateEnergyDisplay();
});

document.getElementById('close-report').addEventListener('click', hideImpactReport);

document.getElementById('simulate-impact').addEventListener('click', () => {
    if (selectedNeo && onImpactSimulate) {
        const velocity = parseFloat(velocitySlider.value);
        onImpactSimulate(selectedNeo, velocity);
    }
});

document.getElementById('open-impact-lab')?.addEventListener('click', () => {
    if (lastImpactData) {
        hideImpactReport();
        showImpactLab({
            name: selectedNeo?.name || 'Unknown',
            diameterMeters: lastImpactData.diameterMeters
        }, lastImpactData.velocityKmPerSec);
    }
});
