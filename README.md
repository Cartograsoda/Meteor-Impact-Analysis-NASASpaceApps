# NEO Collision Engine for 2025 NASA Space Apps Hackathon İzmir (Meteor Madness Challenge)

**A real-time 3D visualization and simulation platform of what if scenarios for Near-Earth Object (NEO) impact analysis, featuring physics-based damage assessment and somewhat working infrastructure damage mapping.**

- thank you for the opportunity to participate in the 2025 NASA Space Apps Challenge İzmir
- even though we were disqualified because we finished early and wanted to leave for the night to sleep
- we value your hard work but we also value our sleep :)

[![NASA Hackathon]](https://www.spaceappschallenge.org/)
[![Three.js]](https://threejs.org/)
[![Spring Boot]](https://spring.io/projects/spring-boot)
[![OpenStreetMap]](https://overpass-api.de/)

---

## Overview

NEO Collision Engine is a full-stack scientific visualization application that combines real-time NASA data,orbital mechanics simulation(not at a kerbal space program level :( ), to model asteroid impact scenarios. Built for the NASA Space Apps Challenge, it demonstrates the intersection of space science, physics, and web technologies.

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **Real-Time Data Integration** | Live NEO data from NASA's NeoWS REST API with intelligent caching |
| **3D Orbital Visualization** | WebGL-powered Three.js scene with hyperbolic flyby trajectories |
| **Impact Physics Engine** | Kinetic energy, crater formation, and seismic calculations |
| **Geospatial Impact Analysis** | OpenStreetMap Overpass API for infrastructure damage mapping |
| **Interactive 2D Impact Lab** | Leaflet.js-based damage zone visualization with affected facilities |

---

## Technical Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (ES6+)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Three.js │  │ Leaflet  │  │ Physics  │  │   UI Manager     │ │
│  │  Scene   │  │   Map    │  │  Engine  │  │  (Glassmorphism) │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │          │
│       └─────────────┴─────────────┴──────────────────┘          │
│                              │                                   │
│                      ┌───────▼───────┐                          │
│                      │   API Client  │                          │
│                      └───────┬───────┘                          │
└──────────────────────────────┼──────────────────────────────────┘
                               │ REST API
┌──────────────────────────────┼──────────────────────────────────┐
│                     Backend (Java 17)                            │
│                      ┌───────▼───────┐                          │
│                      │  Controllers  │                          │
│                      └───────┬───────┘                          │
│       ┌──────────────────────┼──────────────────────┐           │
│       ▼                      ▼                      ▼           │
│ ┌───────────┐         ┌───────────┐         ┌───────────┐       │
│ │NASA Proxy │         │ Overpass  │         │  Impact   │       │
│ │ Service   │         │  Service  │         │ Calculator│       │
│ └─────┬─────┘         └─────┬─────┘         └───────────┘       │
│       │                     │                                    │
└───────┼─────────────────────┼────────────────────────────────────┘
        │                     │
        ▼                     ▼
   NASA NeoWS API      OpenStreetMap Overpass API
```

### Backend Services (Spring Boot 3.2)

| Service | Responsibility |
|---------|---------------|
| `NasaProxyService` | Proxies NASA NeoWS API with response caching and rate limiting |
| `OverpassService` | Queries OpenStreetMap for infrastructure within impact radii |
| `ImpactController` | REST endpoint for impact damage calculations |

### Frontend Modules (Vanilla ES6+)

| Module | Responsibility |
|--------|---------------|
| `main.js` | Three.js scene, orbital mechanics, asteroid rendering |
| `physics.js` | Kinetic energy, crater diameter, earthquake magnitude |
| `impact-lab.js` | Leaflet.js 2D map, damage zones, infrastructure markers |
| `api.js` | Async REST client with error handling |
| `ui.js` | Dashboard state management, glassmorphism UI |

---

## Features

### 1. 3D Visualization Engine
- **Real NASA Data**: Fetches live NEO data from NASA's NeoWS API
- **Hyperbolic Flyby Trajectories**: Asteroids follow gravitationally-accurate curved paths
- **Interactive Selection**: Raycasting for asteroid selection with info panels
- **Time Control**: Adjustable simulation speed with pause/resume

### 2. Impact Simulation
- **Curved Collision Paths**: Bezier curve interpolation for realistic approach vectors
- **Velocity Scaling**: Asteroids accelerate according to gravitational attraction
- **Random Impact Points**: Geographically-distributed impact locations

### 3. Damage Assessment Engine
- **Kinetic Energy**: `KE = 0.5 × m × v²` with mass from volume and density
- **Crater Diameter**: Holsapple & Schmidt (1982) scaling laws
- **Seismic Magnitude**: Empirical energy-to-magnitude conversion
- **Thermal/Pressure/Shrapnel Zones**: Concentric damage radii

### 4. Impact Lab (Geospatial Analysis)
- **2D Map Overlay**: Leaflet.js with OpenStreetMap tiles
- **Damage Zone Visualization**: Color-coded concentric circles (thermal, pressure, shrapnel)
- **Infrastructure Query**: Real-time Overpass API queries for:
  - Clinics, hospitals, doctors
  - Schools, universities, kindergartens
  - Industrial sites, factories, warehouses
  - Farmland, orchards, vineyards
- **Facility Markers**: Interactive markers with distance and zone classification

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend Runtime** | Java 17 | Type-safe, high-performance server |
| **Backend Framework** | Spring Boot 3.2 | REST API, dependency injection |
| **Build Tool** | Maven | Dependency management, build automation |
| **3D Graphics** | Three.js 0.160.0 | WebGL abstraction, scene graph |
| **2D Maps** | Leaflet.js 1.9.4 | Interactive map rendering |
| **External APIs** | NASA NeoWS, Overpass | Real-time space and geo data |
| **Styling** | CSS3 Variables | Glassmorphism design system |

---

## Project Structure

```
nasahackathon/
├── backend/
│   └── src/main/java/com/neo/
│       ├── NeoApplication.java           # Spring Boot entry
│       ├── config/NasaApiConfig.java     # API configuration
│       ├── controller/
│       │   ├── NeoController.java        # NEO data endpoints
│       │   └── ImpactController.java     # Impact analysis endpoint
│       ├── model/
│       │   ├── NearEarthObject.java      # NEO data model
│       │   └── ImpactReport.java         # Impact assessment model
│       └── service/
│           ├── NasaProxyService.java     # NASA API proxy + caching
│           └── OverpassService.java      # OSM infrastructure queries
├── frontend/
│   ├── index.html                        # SPA entry point
│   ├── css/
│   │   ├── main.css                      # Design system
│   │   └── impact-lab.css                # Impact Lab styling
│   └── js/
│       ├── main.js                       # Three.js scene
│       ├── api.js                        # REST client
│       ├── physics.js                    # Impact calculations
│       ├── ui.js                         # UI state management
│       └── impact-lab.js                 # 2D map module
└── docs/
    ├── architecture/                     # Design patterns
    ├── concepts/                         # Technology guides
    └── physics/                          # Damage formulas
```

---

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.6+
- Modern browser with WebGL support

### Quick Start


# Start backend
cd backend
mvn spring-boot:run

# Serve frontend (VS Code Live Server or Python)
cd frontend
python -m http.server 5500


Access at `http://localhost:5500`

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/neo/feed` | GET | NEO data for date range |
| `/api/neo/feed/today` | GET | Today's NEO data |
| `/api/neo/health` | GET | Service health check |
| `/api/impact/query` | GET | Infrastructure impact analysis |

### Impact Query Parameters
```
GET /api/impact/query?lat=41.0082&lng=28.9784&kineticEnergy=1e15
```

---

## Physics Model

### Kinetic Energy
```
KE = 0.5 × m × v²
m = (4/3) × π × r³ × ρ
```
Where ρ = 3000 kg/m³ (S-type asteroid)(fixed for now)

### Crater Diameter (Holsapple-Schmidt)
```
D = K × (KE / ρ_target × g)^α
```

### Seismic Magnitude
```
M = (log₁₀(KE) - 4.8) / 1.5
```

### Damage Radii
```
Thermal:   R_t = 0.5 × (KE / 10¹⁵)^0.33 km
Pressure:  R_p = 1.2 × (KE / 10¹⁵)^0.33 km
Shrapnel:  R_s = 2.0 × (KE / 10¹⁵)^0.33 km
```

---

## Known Issues

> **Note:** Infrastructure data in the Impact Lab may occasionally be unavailable or incomplete due to Overpass API latencies and rate limiting. The data is fetched from OpenStreetMap in real-time, and response times can vary based on server load.

---

For git purposes
## License


See LICENSE file

tldr: you may do whatever you want with our part of code, for api's and libraries we do not claim any ownership of them.

## Acknowledgments

- **NASA NeoWS API** - Near-Earth Object data
- **OpenStreetMap & Overpass API** - Geospatial infrastructure data
- **Three.js** - WebGL rendering
- **Leaflet.js** - Interactive maps
- **Spring Boot** - Backend framework
