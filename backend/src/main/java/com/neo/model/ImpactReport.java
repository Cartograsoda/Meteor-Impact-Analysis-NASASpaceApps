package com.neo.model;

import java.util.List;

/**
 * NOTE: We don't know if we can use auto getter/setter libraries like Lombok.
 */
public class ImpactReport {
    private double latitude;
    private double longitude;
    private double kineticEnergyJoules;
    private double thermalRadiusKm;
    private double pressureRadiusKm;
    private double shrapnelRadiusKm;
    private int hospitalsAffected;
    private int schoolsAffected;
    private int roadsAffected;
    private int industrialAffected;
    private int farmlandAffected;
    private long estimatedPopulation;
    private List<InfrastructureItem> infrastructure;

    public ImpactReport() {
    }

    public ImpactReport(double lat, double lng, double ke) {
        this.latitude = lat;
        this.longitude = lng;
        this.kineticEnergyJoules = ke;
        calculateRadii();
    }

    private void calculateRadii() {
        double scaleFactor = Math.pow(kineticEnergyJoules / 1e15, 0.33);
        this.thermalRadiusKm = 0.5 * scaleFactor;
        this.pressureRadiusKm = 1.2 * scaleFactor;
        this.shrapnelRadiusKm = 2.0 * scaleFactor;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getKineticEnergyJoules() {
        return kineticEnergyJoules;
    }

    public void setKineticEnergyJoules(double ke) {
        this.kineticEnergyJoules = ke;
        calculateRadii();
    }

    public double getThermalRadiusKm() {
        return thermalRadiusKm;
    }

    public double getPressureRadiusKm() {
        return pressureRadiusKm;
    }

    public double getShrapnelRadiusKm() {
        return shrapnelRadiusKm;
    }

    public int getHospitalsAffected() {
        return hospitalsAffected;
    }

    public void setHospitalsAffected(int count) {
        this.hospitalsAffected = count;
    }

    public int getSchoolsAffected() {
        return schoolsAffected;
    }

    public void setSchoolsAffected(int count) {
        this.schoolsAffected = count;
    }

    public int getRoadsAffected() {
        return roadsAffected;
    }

    public void setRoadsAffected(int count) {
        this.roadsAffected = count;
    }

    public int getIndustrialAffected() {
        return industrialAffected;
    }

    public void setIndustrialAffected(int count) {
        this.industrialAffected = count;
    }

    public int getFarmlandAffected() {
        return farmlandAffected;
    }

    public void setFarmlandAffected(int count) {
        this.farmlandAffected = count;
    }

    public long getEstimatedPopulation() {
        return estimatedPopulation;
    }

    public void setEstimatedPopulation(long pop) {
        this.estimatedPopulation = pop;
    }

    public List<InfrastructureItem> getInfrastructure() {
        return infrastructure;
    }

    public void setInfrastructure(List<InfrastructureItem> items) {
        this.infrastructure = items;
    }

    public static class InfrastructureItem {
        private String type;
        private String name;
        private double lat;
        private double lng;
        private double distanceKm;
        private String zone;

        public InfrastructureItem() {
        }

        public InfrastructureItem(String type, String name, double lat, double lng, double distance, String zone) {
            this.type = type;
            this.name = name;
            this.lat = lat;
            this.lng = lng;
            this.distanceKm = distance;
            this.zone = zone;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public double getLat() {
            return lat;
        }

        public void setLat(double lat) {
            this.lat = lat;
        }

        public double getLng() {
            return lng;
        }

        public void setLng(double lng) {
            this.lng = lng;
        }

        public double getDistanceKm() {
            return distanceKm;
        }

        public void setDistanceKm(double d) {
            this.distanceKm = d;
        }

        public String getZone() {
            return zone;
        }

        public void setZone(String zone) {
            this.zone = zone;
        }
    }
}
