import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { fetchTodayFeed } from './api.js';
import { scaleDistance, getScaledEarthRadius } from './physics.js';
import { showLoading, hideLoading, showDashboard, setImpactCallback, showImpactReport } from './ui.js';

let scene, camera, renderer, controls;
let earth, meteorites = [], trajectoryLines = [];
let raycaster, mouse;
let animatingMeteor = null;
let impactTrajectoryLine = null;
let selectedMeteor = null;

let timeScale = 1.0;
let isPaused = false;
let simulationTime = 0;

const EARTH_VISUAL_RADIUS = getScaledEarthRadius() * 0.4; //tweak if earth looks weird
const TRAJECTORY_POINTS = 120;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 2000);
    camera.position.set(0, 6, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('scene-container').appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 80;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    createSkybox();
    createEarth();
    createLights();
    setupTimeControls();
    setupClickHandler();

    setImpactCallback(triggerImpact);

    window.addEventListener('resize', onWindowResize);

    loadNeoData();
    animate();
}

function createSkybox() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000; //neos mix with stars fix later
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        const radius = 300 + Math.random() * 400;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.cos(phi);
        positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.4,
        sizeAttenuation: true
    });

    scene.add(new THREE.Points(starGeometry, starMaterial));
}

function createEarth() {
    const geometry = new THREE.SphereGeometry(EARTH_VISUAL_RADIUS, 64, 64);

    const material = new THREE.MeshPhongMaterial({
        color: 0x2244aa,
        emissive: 0x112244,
        specular: 0x444444,
        shininess: 30
    });

    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_VISUAL_RADIUS * 1.03, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide
    });

    scene.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));
}

function createLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(50, 30, 50);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    fillLight.position.set(-30, -20, -30);
    scene.add(fillLight);
}

function setupTimeControls() {
    const timeSlider = document.getElementById('time-slider');
    const timeSpeedDisplay = document.getElementById('time-speed-display');
    const pauseBtn = document.getElementById('time-pause');
    const resetBtn = document.getElementById('time-reset');

    timeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        timeScale = value / 100;
        timeSpeedDisplay.textContent = timeScale.toFixed(1) + 'x';
    });

    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? 'Play' : 'Pause';
        pauseBtn.classList.toggle('active', isPaused);
    });

    resetBtn.addEventListener('click', () => {
        simulationTime = 0;
        meteorites.forEach(meteor => {
            meteor.userData.trueAnomaly = meteor.userData.initialTrueAnomaly;
            updateMeteorPosition(meteor);
        });
    });
}

function setupClickHandler() {
    const dashboard = document.getElementById('dashboard');

    window.addEventListener('click', (event) => {
        if (animatingMeteor) return;

        const clickedOnUI = dashboard.contains(event.target) ||
            document.getElementById('time-control').contains(event.target);
        if (clickedOnUI) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(meteorites);

        if (intersects.length > 0) {
            const meteor = intersects[0].object;
            selectMeteor(meteor);
        }
    });

    document.getElementById('close-dashboard').addEventListener('click', () => {
        deselectMeteor();
        dashboard.classList.add('hidden');
    });
}

function selectMeteor(meteor) {
    if (selectedMeteor && selectedMeteor !== meteor) {
        resetMeteorColor(selectedMeteor);
    }

    selectedMeteor = meteor;
    meteor.userData.originalColor = meteor.material.color.getHex();
    meteor.userData.originalEmissive = meteor.material.emissive.getHex();

    meteor.material.color.setHex(0xff0000);
    meteor.material.emissive.setHex(0x660000);

    showDashboard(meteor.userData);
}

function deselectMeteor() {
    if (selectedMeteor) {
        resetMeteorColor(selectedMeteor);
        selectedMeteor = null;
    }
}

function resetMeteorColor(meteor) {
    if (meteor.userData.originalColor !== undefined) {
        meteor.material.color.setHex(meteor.userData.originalColor);
        meteor.material.emissive.setHex(meteor.userData.originalEmissive);
    }
}

async function loadNeoData() {
    showLoading();

    try {
        const neoList = await fetchTodayFeed();
        createMeteoriteObjects(neoList);
    } catch (error) {
        console.error('Failed to load NEO data:', error);
    }

    hideLoading();
}

function createMeteoriteObjects(neoList) {
    neoList.forEach((neo, index) => {
        const avgDiameter = (neo.diameterMinMeters + neo.diameterMaxMeters) / 2;
        const visualRadius = Math.max(0.04, Math.min(0.15, avgDiameter / 600));

        const geometry = new THREE.SphereGeometry(visualRadius, 16, 16);
        const baseColor = neo.potentiallyHazardous ? 0xdd6644 : 0x8888aa;
        const material = new THREE.MeshPhongMaterial({
            color: baseColor,
            emissive: neo.potentiallyHazardous ? 0x331111 : 0x111122
        });

        const mesh = new THREE.Mesh(geometry, material);

        const periapsis = scaleDistance(neo.missDistanceKm) + EARTH_VISUAL_RADIUS + 0.5;
        const eccentricity = 1.5 + Math.random() * 1.0;
        const orbitRotation = Math.random() * Math.PI * 2;
        const inclination = (Math.random() - 0.5) * Math.PI * 0.6;

        const maxAngle = Math.acos(-1 / eccentricity) * 0.85;
        const initialAngle = -maxAngle + Math.random() * maxAngle * 0.5;

        mesh.userData = {
            id: neo.id,
            name: neo.name,
            diameterMeters: avgDiameter,
            velocityKmPerSec: neo.velocityKmPerSec,
            missDistanceKm: neo.missDistanceKm,
            isHazardous: neo.potentiallyHazardous,
            periapsis: periapsis,
            eccentricity: eccentricity,
            orbitRotation: orbitRotation,
            inclination: inclination,
            trueAnomaly: initialAngle,
            initialTrueAnomaly: initialAngle,
            baseAngularSpeed: 0.01 + Math.random() * 0.02
        };

        updateMeteorPosition(mesh);

        scene.add(mesh);
        meteorites.push(mesh);

        createTrajectoryLine(mesh);
    });
}

function getHyperbolicPosition(trueAnomaly, periapsis, eccentricity, orbitRotation, inclination) {
    const r = periapsis * (1 + eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));

    if (r < 0 || !isFinite(r)) {
        return null;
    }

    let x = r * Math.cos(trueAnomaly);
    let y = 0;
    let z = r * Math.sin(trueAnomaly);

    const cosInc = Math.cos(inclination);
    const sinInc = Math.sin(inclination);
    const tempY = y * cosInc - z * sinInc;
    const tempZ = y * sinInc + z * cosInc;
    y = tempY;
    z = tempZ;

    const cosRot = Math.cos(orbitRotation);
    const sinRot = Math.sin(orbitRotation);
    const finalX = x * cosRot - z * sinRot;
    const finalZ = x * sinRot + z * cosRot;

    return new THREE.Vector3(finalX, y, finalZ);
}

function updateMeteorPosition(meteor) {
    const data = meteor.userData;
    const pos = getHyperbolicPosition(
        data.trueAnomaly,
        data.periapsis,
        data.eccentricity,
        data.orbitRotation,
        data.inclination
    );

    if (pos) {
        meteor.position.copy(pos);
    }
}

function createTrajectoryLine(meteor) {
    const points = [];
    const data = meteor.userData;

    const maxAngle = Math.acos(-1 / data.eccentricity) * 0.85;

    for (let i = 0; i <= TRAJECTORY_POINTS; i++) {
        const t = i / TRAJECTORY_POINTS;
        const angle = -maxAngle + t * 2 * maxAngle;

        const pos = getHyperbolicPosition(
            angle,
            data.periapsis,
            data.eccentricity,
            data.orbitRotation,
            data.inclination
        );

        if (pos && pos.length() < 100) {
            points.push(pos);
        }
    }

    if (points.length < 2) return;

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color: 0x667777,
        dashSize: 0.12,
        gapSize: 0.08,
        transparent: true,
        opacity: 0.55
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    line.userData.meteorId = meteor.userData.id;

    scene.add(line);
    trajectoryLines.push(line);
}

function updateMeteorMovement(delta) {
    if (isPaused) return;

    const adjustedDelta = delta * timeScale;
    simulationTime += adjustedDelta;

    meteorites.forEach(meteor => {
        if (animatingMeteor && animatingMeteor.mesh === meteor) return;

        const data = meteor.userData;

        const currentR = meteor.position.length();
        const speedFactor = Math.sqrt(data.periapsis / Math.max(currentR, 0.1));

        data.trueAnomaly += data.baseAngularSpeed * (1 + speedFactor) * adjustedDelta;

        const maxAngle = Math.acos(-1 / data.eccentricity) * 0.85;

        if (data.trueAnomaly > maxAngle) {
            data.trueAnomaly = -maxAngle;
        }

        updateMeteorPosition(meteor);
    });
}

function generateCurvedImpactPath(startPosition, numPoints) {
    const points = [];
    const startPos = startPosition.clone();
    const startDistance = startPos.length();

    const perpendicular = new THREE.Vector3(-startPos.z, 0, startPos.x).normalize();
    const curveStrength = startDistance * 0.3;

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;

        const easeT = t * t * (3 - 2 * t);

        const targetPos = new THREE.Vector3(0, 0, 0);
        const straightPoint = startPos.clone().lerp(targetPos, easeT);

        const curveFactor = Math.sin(t * Math.PI) * curveStrength * (1 - t);
        const curvedPoint = straightPoint.clone().add(perpendicular.clone().multiplyScalar(curveFactor));

        const minDist = EARTH_VISUAL_RADIUS * 0.95;
        if (curvedPoint.length() < minDist && i < numPoints) {
            curvedPoint.normalize().multiplyScalar(minDist);
        }

        points.push(curvedPoint);
    }

    points[points.length - 1] = new THREE.Vector3(0, 0, 0);

    return points;
}

function triggerImpact(neoData, velocity) {
    const meteor = meteorites.find(m => m.userData.id === neoData.id);
    if (!meteor) return;

    const oldTrajectory = trajectoryLines.find(l => l.userData.meteorId === neoData.id);
    if (oldTrajectory) {
        scene.remove(oldTrajectory);
        trajectoryLines = trajectoryLines.filter(l => l !== oldTrajectory);
    }

    const currentPosition = meteor.position.clone();
    const impactPath = generateCurvedImpactPath(currentPosition, 100);

    const geometry = new THREE.BufferGeometry().setFromPoints(impactPath);
    const material = new THREE.LineDashedMaterial({
        color: 0xff3333,
        dashSize: 0.1,
        gapSize: 0.05,
        transparent: true,
        opacity: 0.9
    });

    impactTrajectoryLine = new THREE.Line(geometry, material);
    impactTrajectoryLine.computeLineDistances();
    scene.add(impactTrajectoryLine);

    animatingMeteor = {
        mesh: meteor,
        velocity: velocity,
        path: impactPath,
        pathProgress: 0,
        baseSpeed: velocity * 0.002
    };

    deselectMeteor();
    document.getElementById('dashboard').classList.add('hidden');
}

function updateImpactAnimation(delta) {
    if (!animatingMeteor) return;

    const path = animatingMeteor.path;

    const currentPos = animatingMeteor.mesh.position;
    const distToEarth = currentPos.length();
    const speedMultiplier = 1 + (1 / Math.max(distToEarth, 0.5)) * 2;

    animatingMeteor.pathProgress += animatingMeteor.baseSpeed * speedMultiplier * delta;

    const progressClamped = Math.min(animatingMeteor.pathProgress, 1);
    const pathIndex = Math.floor(progressClamped * (path.length - 1));
    const pathFraction = (progressClamped * (path.length - 1)) - pathIndex;

    if (pathIndex < path.length - 1) {
        const p1 = path[pathIndex];
        const p2 = path[pathIndex + 1];
        const newPos = p1.clone().lerp(p2, pathFraction);
        animatingMeteor.mesh.position.copy(newPos);
    } else {
        animatingMeteor.mesh.position.copy(path[path.length - 1]);
    }

    if (animatingMeteor.mesh.position.length() < EARTH_VISUAL_RADIUS ||
        animatingMeteor.pathProgress >= 1) {

        const userData = animatingMeteor.mesh.userData;
        showImpactReport(userData.diameterMeters, animatingMeteor.velocity);

        if (impactTrajectoryLine) {
            scene.remove(impactTrajectoryLine);
            impactTrajectoryLine = null;
        }

        scene.remove(animatingMeteor.mesh);
        meteorites = meteorites.filter(m => m !== animatingMeteor.mesh);

        animatingMeteor = null;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let lastTime = 0;

function animate(time = 0) {
    requestAnimationFrame(animate);

    const delta = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    if (!isPaused) {
        earth.rotation.y += 0.002 * timeScale;
    }

    updateMeteorMovement(delta);
    updateImpactAnimation(delta);

    controls.update();
    renderer.render(scene, camera);
}

init();
