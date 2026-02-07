package com.neo.model;

// We don't know if we can use auto getter/setter libraries like Lombok.
public class NearEarthObject {

    private String id;
    private String name;
    private double diameterMinMeters;
    private double diameterMaxMeters;
    private double velocityKmPerSec;
    private double missDistanceKm;
    private boolean isPotentiallyHazardous;
    private String closeApproachDate;

    public NearEarthObject() {
    }

    public NearEarthObject(String id, String name, double diameterMinMeters, double diameterMaxMeters,
            double velocityKmPerSec, double missDistanceKm, boolean isPotentiallyHazardous,
            String closeApproachDate) {
        this.id = id;
        this.name = name;
        this.diameterMinMeters = diameterMinMeters;
        this.diameterMaxMeters = diameterMaxMeters;
        this.velocityKmPerSec = velocityKmPerSec;
        this.missDistanceKm = missDistanceKm;
        this.isPotentiallyHazardous = isPotentiallyHazardous;
        this.closeApproachDate = closeApproachDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getDiameterMinMeters() {
        return diameterMinMeters;
    }

    public void setDiameterMinMeters(double diameterMinMeters) {
        this.diameterMinMeters = diameterMinMeters;
    }

    public double getDiameterMaxMeters() {
        return diameterMaxMeters;
    }

    public void setDiameterMaxMeters(double diameterMaxMeters) {
        this.diameterMaxMeters = diameterMaxMeters;
    }

    public double getVelocityKmPerSec() {
        return velocityKmPerSec;
    }

    public void setVelocityKmPerSec(double velocityKmPerSec) {
        this.velocityKmPerSec = velocityKmPerSec;
    }

    public double getMissDistanceKm() {
        return missDistanceKm;
    }

    public void setMissDistanceKm(double missDistanceKm) {
        this.missDistanceKm = missDistanceKm;
    }

    public boolean isPotentiallyHazardous() {
        return isPotentiallyHazardous;
    }

    public void setPotentiallyHazardous(boolean potentiallyHazardous) {
        isPotentiallyHazardous = potentiallyHazardous;
    }

    public String getCloseApproachDate() {
        return closeApproachDate;
    }

    public void setCloseApproachDate(String closeApproachDate) {
        this.closeApproachDate = closeApproachDate;
    }

    public double getAverageDiameterMeters() {
        return (diameterMinMeters + diameterMaxMeters) / 2.0;
    }
}
