# Impact Lab

## Overview

The Impact Lab is a 2D map-based visualization module that displays the real-world consequences of an asteroid impact. It queries OpenStreetMap for infrastructure data and displays affected facilities within the damage zones.

## Architecture

```
┌────────────────────────────────────────────────────┐
│                   Frontend                          │
│  ┌──────────────┐    ┌───────────────────────────┐ │
│  │  impact-lab  │───▶│     Leaflet.js Map        │ │
│  │     .js      │    │  - OSM Tile Layer         │ │
│  │              │    │  - Damage Zone Circles    │ │
│  └──────┬───────┘    │  - Infrastructure Markers │ │
│         │            └───────────────────────────┘ │
└─────────┼──────────────────────────────────────────┘
          │ GET /api/impact/query
┌─────────▼──────────────────────────────────────────┐
│                   Backend                           │
│  ┌──────────────┐    ┌───────────────────────────┐ │
│  │  Impact      │───▶│    OverpassService        │ │
│  │  Controller  │    │  - Infrastructure Query   │ │
│  └──────────────┘    │  - Distance Calculation   │ │
│                      └───────────┬───────────────┘ │
└──────────────────────────────────┼─────────────────┘
                                   │
                      ┌────────────▼────────────┐
                      │  OpenStreetMap          │
                      │  Overpass API           │
                      └─────────────────────────┘
```

## Damage Zones

Three concentric zones visualize different damage types:

| Zone | Color | Formula | Effect |
|------|-------|---------|--------|
| **Thermal** | Red | `0.5 × (KE/10¹⁵)^0.33 km` | Intense heat, fires |
| **Pressure** | Orange | `1.2 × (KE/10¹⁵)^0.33 km` | Building collapse, shockwave |
| **Shrapnel** | Yellow | `2.0 × (KE/10¹⁵)^0.33 km` | Flying debris, secondary damage |

## Infrastructure Queries

The Overpass API queries OpenStreetMap for:

### Medical Facilities
- `amenity=hospital`
- `amenity=clinic`
- `amenity=doctors`

### Educational Facilities
- `amenity=school`
- `amenity=university`
- `amenity=kindergarten`
- `amenity=college`

### Emergency Services
- `amenity=fire_station`
- `amenity=police`

### Critical Infrastructure
- `landuse=industrial`
- `building=factory`
- `building=warehouse`
- `landuse=farmland`
- `landuse=farmyard`
- `landuse=orchard`
- `landuse=vineyard`

## API Endpoint

```
GET /api/impact/query?lat={lat}&lng={lng}&kineticEnergy={joules}
```

### Response

```json
{
  "latitude": 41.0082,
  "longitude": 28.9784,
  "kineticEnergyJoules": 1e15,
  "thermalRadiusKm": 0.5,
  "pressureRadiusKm": 1.2,
  "shrapnelRadiusKm": 2.0,
  "hospitalsAffected": 5,
  "schoolsAffected": 12,
  "industrialAffected": 3,
  "farmlandAffected": 8,
  "infrastructure": [
    {
      "type": "hospital",
      "name": "City Hospital",
      "lat": 41.01,
      "lng": 28.98,
      "distanceKm": 0.8,
      "zone": "pressure"
    }
  ]
}
```

## Known Limitations

1. **API Latency**: Overpass API response times vary (5-30 seconds)
2. **Rate Limiting**: Heavy usage may trigger temporary blocks
3. **Data Completeness**: OpenStreetMap data quality varies by region
4. **Estimation Note**: Infrastructure counts are estimates based on available OSM data

## UI Icons

| Type | Icon |
|------|------|
| Hospital/Clinic | 🏥 |
| School | 🏫 |
| University | 🎓 |
| Fire Station | 🚒 |
| Police | 🚔 |
| Industrial/Factory | 🏭 |
| Warehouse | 📦 |
| Farm/Farmland | 🌾 |
| Orchard | 🌳 |
| Vineyard | 🍇 |

