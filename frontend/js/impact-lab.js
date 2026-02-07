let map = null;
let impactMarker = null;
let damageCircles = [];
let infrastructureMarkers = [];
let currentImpactData = null;

const API_BASE_URL = 'http://localhost:8080/api/impact'; //change for production

export function initImpactLab() {
    const mapContainer = document.getElementById('impact-map');
    if (!mapContainer || map) return;

    map = L.map('impact-map').setView([39.9, 32.8], 6); //default to turkey

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19
    }).addTo(map);

    map.on('click', onMapClick);
}

export function showImpactLab(meteorData, velocity) {
    currentImpactData = {
        meteor: meteorData,
        velocity: velocity,
        kineticEnergy: calculateKineticEnergy(meteorData.diameterMeters, velocity)
    };

    document.getElementById('impact-lab').classList.remove('hidden');
    document.getElementById('scene-container').style.display = 'none';
    document.getElementById('click-prompt').classList.remove('hidden');

    if (!map) {
        initImpactLab();
    } else {
        map.invalidateSize();
    }

    updateImpactStats();
}

export function hideImpactLab() {
    document.getElementById('impact-lab').classList.add('hidden');
    document.getElementById('scene-container').style.display = 'block';
    clearImpactVisuals();
}

function calculateKineticEnergy(diameterMeters, velocityKmPerSec) {
    const radius = diameterMeters / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const density = 3000;
    const mass = volume * density;
    const velocityMPerSec = velocityKmPerSec * 1000;
    return 0.5 * mass * Math.pow(velocityMPerSec, 2);
}

function onMapClick(e) {
    if (!currentImpactData) return;

    const { lat, lng } = e.latlng;

    document.getElementById('click-prompt').classList.add('hidden');
    showLoadingOverlay();

    setImpactLocation(lat, lng);
    queryImpact(lat, lng);
}

function setImpactLocation(lat, lng) {
    clearImpactVisuals();

    impactMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'impact-marker',
            html: '<div style="width:20px;height:20px;background:#ff3333;border-radius:50%;border:3px solid #fff;box-shadow:0 0 20px #ff3333;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(map);

    const ke = currentImpactData.kineticEnergy;
    const scaleFactor = Math.pow(ke / 1e15, 0.33);

    const thermalRadius = 0.5 * scaleFactor * 1000;
    const pressureRadius = 1.2 * scaleFactor * 1000;
    const shrapnelRadius = 2.0 * scaleFactor * 1000;

    damageCircles.push(
        L.circle([lat, lng], { radius: shrapnelRadius, color: '#ffcc33', fillColor: '#ffcc33', fillOpacity: 0.15, weight: 2 }).addTo(map),
        L.circle([lat, lng], { radius: pressureRadius, color: '#ff8833', fillColor: '#ff8833', fillOpacity: 0.2, weight: 2 }).addTo(map),
        L.circle([lat, lng], { radius: thermalRadius, color: '#ff3333', fillColor: '#ff3333', fillOpacity: 0.3, weight: 2 }).addTo(map)
    );

    const outerCircle = damageCircles[0];
    if (outerCircle) {
        map.fitBounds(outerCircle.getBounds().pad(0.2));
    } else {
        map.setView([lat, lng], 10);
    }

    document.getElementById('thermal-radius').textContent = (thermalRadius / 1000).toFixed(2) + ' km';
    document.getElementById('pressure-radius').textContent = (pressureRadius / 1000).toFixed(2) + ' km';
    document.getElementById('shrapnel-radius').textContent = (shrapnelRadius / 1000).toFixed(2) + ' km';
}

async function queryImpact(lat, lng) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/query?lat=${lat}&lng=${lng}&kineticEnergy=${currentImpactData.kineticEnergy}`
        );

        if (!response.ok) throw new Error('Impact query failed');

        const report = await response.json();
        displayImpactReport(report);
    } catch (error) {
        console.error('Impact query error:', error);
        displayFallbackReport();
    } finally {
        hideLoadingOverlay();
    }
}

function displayImpactReport(report) {
    document.getElementById('hospitals-count').textContent = report.hospitalsAffected;
    document.getElementById('schools-count').textContent = report.schoolsAffected;
    document.getElementById('industrial-count').textContent = report.industrialAffected || 0;
    document.getElementById('farmland-count').textContent = report.farmlandAffected || 0;

    const listContainer = document.getElementById('infrastructure-list');
    listContainer.innerHTML = '';

    if (report.infrastructure && report.infrastructure.length > 0) {
        report.infrastructure.slice(0, 25).forEach(item => {
            const div = document.createElement('div');
            div.className = 'infrastructure-item';
            div.innerHTML = `
                <div class="infrastructure-icon">${getInfrastructureIcon(item.type)}</div>
                <div class="infrastructure-details">
                    <div class="infrastructure-name">${item.name}</div>
                    <div class="infrastructure-distance">${item.distanceKm.toFixed(2)} km - ${item.zone} zone</div>
                </div>
            `;
            listContainer.appendChild(div);

            addInfrastructureMarker(item);
        });
    } else {
        listContainer.innerHTML = '<p style="color:var(--text-secondary);font-size:0.85rem;">No infrastructure data in this area</p>';
    }
}

function displayFallbackReport() {
    document.getElementById('hospitals-count').textContent = 'N/A';
    document.getElementById('schools-count').textContent = 'N/A';
    document.getElementById('industrial-count').textContent = 'N/A';
    document.getElementById('farmland-count').textContent = 'N/A';
}

function addInfrastructureMarker(item) {
    const color = item.zone === 'thermal' ? '#ff3333' : item.zone === 'pressure' ? '#ff8833' : '#ffcc33';

    const marker = L.circleMarker([item.lat, item.lng], {
        radius: 6,
        fillColor: color,
        color: '#fff',
        weight: 1,
        fillOpacity: 0.8
    }).bindPopup(`<b>${item.name}</b><br>${item.type}<br>${item.distanceKm.toFixed(2)} km from impact`);

    marker.addTo(map);
    infrastructureMarkers.push(marker);
}

function getInfrastructureIcon(type) {
    const icons = {
        hospital: '🏥',
        clinic: '🏥',
        doctors: '⚕️',
        school: '🏫',
        university: '🎓',
        kindergarten: '🧒',
        college: '🎓',
        fire_station: '🚒',
        police: '🚔',
        industrial: '🏭',
        factory: '🏭',
        warehouse: '📦',
        farm: '🌾',
        farmland: '🌾',
        farmyard: '🚜',
        orchard: '🌳',
        vineyard: '🍇'
    };
    return icons[type] || '📍';
}

function clearImpactVisuals() {
    if (impactMarker) {
        map.removeLayer(impactMarker);
        impactMarker = null;
    }

    damageCircles.forEach(c => map.removeLayer(c));
    damageCircles = [];

    infrastructureMarkers.forEach(m => map.removeLayer(m));
    infrastructureMarkers = [];
}

function updateImpactStats() {
    if (!currentImpactData) return;

    document.getElementById('impact-meteor-name').textContent = currentImpactData.meteor.name;
    document.getElementById('impact-velocity').textContent = currentImpactData.velocity.toFixed(1) + ' km/s';
    document.getElementById('impact-energy').textContent = formatEnergy(currentImpactData.kineticEnergy);
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
}

function formatEnergy(joules) {
    if (joules >= 1e18) return (joules / 1e18).toFixed(2) + ' EJ';
    if (joules >= 1e15) return (joules / 1e15).toFixed(2) + ' PJ';
    if (joules >= 1e12) return (joules / 1e12).toFixed(2) + ' TJ';
    return (joules / 1e9).toFixed(2) + ' GJ';
}

function showLoadingOverlay() {
    document.getElementById('impact-loading').classList.remove('hidden');
}

function hideLoadingOverlay() {
    document.getElementById('impact-loading').classList.add('hidden');
}

document.getElementById('back-to-space')?.addEventListener('click', hideImpactLab);
