package com.neo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neo.model.ImpactReport;
import com.neo.model.ImpactReport.InfrastructureItem;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class OverpassService {

    private static final String OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OverpassService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public ImpactReport generateImpactReport(double lat, double lng, double kineticEnergyJoules) {
        ImpactReport report = new ImpactReport(lat, lng, kineticEnergyJoules);

        System.out.println("=== Impact Report ===");
        System.out.println("Coords: " + lat + ", " + lng);

        // maybe make these configurable
        double searchRadiusMeters = Math.min(report.getShrapnelRadiusKm() * 1000, 15000);
        searchRadiusMeters = Math.max(searchRadiusMeters, 2000);

        List<InfrastructureItem> infrastructure = queryOverpass(lat, lng, searchRadiusMeters);

        int clinics = 0, schools = 0, industrial = 0, farmland = 0;
        for (InfrastructureItem item : infrastructure) {
            String type = item.getType();
            if ("hospital".equals(type) || "clinic".equals(type) || "doctors".equals(type))
                clinics++;
            if ("school".equals(type) || "university".equals(type) || "kindergarten".equals(type))
                schools++;
            if ("industrial".equals(type) || "factory".equals(type) || "warehouse".equals(type))
                industrial++;
            if ("farm".equals(type) || "farmland".equals(type) || "farmyard".equals(type))
                farmland++;
        }

        report.setHospitalsAffected(clinics);
        report.setSchoolsAffected(schools);
        report.setIndustrialAffected(industrial);
        report.setFarmlandAffected(farmland);
        report.setInfrastructure(infrastructure);

        System.out.println("Clinics: " + clinics + ", Schools: " + schools +
                ", Industrial: " + industrial + ", Farmland: " + farmland);
        System.out.println("=====================");

        return report;
    }

    private List<InfrastructureItem> queryOverpass(double lat, double lng, double radiusMeters) {
        List<InfrastructureItem> items = new ArrayList<>();

        String query = "[out:json][timeout:25];" +
                "(" +
                // Medical facilities
                "node[\"amenity\"~\"hospital|clinic|doctors\"](around:" + (int) radiusMeters + "," + lat + "," + lng
                + ");" +
                "way[\"amenity\"~\"hospital|clinic\"](around:" + (int) radiusMeters + "," + lat + "," + lng + ");" +
                // Educational facilities
                "node[\"amenity\"~\"school|university|college|kindergarten\"](around:" + (int) radiusMeters + "," + lat
                + "," + lng + ");" +
                "way[\"amenity\"~\"school|university\"](around:" + (int) radiusMeters + "," + lat + "," + lng + ");" +
                // Emergency services
                "node[\"amenity\"~\"fire_station|police\"](around:" + (int) radiusMeters + "," + lat + "," + lng + ");"
                +
                // Industrial areas
                "node[\"landuse\"=\"industrial\"](around:" + (int) radiusMeters + "," + lat + "," + lng + ");" +
                "way[\"landuse\"=\"industrial\"](around:" + (int) radiusMeters + "," + lat + "," + lng + ");" +
                "node[\"building\"~\"industrial|warehouse|factory\"](around:" + (int) radiusMeters + "," + lat + ","
                + lng + ");" +
                "way[\"building\"~\"industrial|warehouse|factory\"](around:" + (int) radiusMeters + "," + lat + ","
                + lng + ");" +
                // Agricultural areas
                "way[\"landuse\"~\"farmland|farmyard|orchard|vineyard\"](around:" + (int) radiusMeters + "," + lat + ","
                + lng + ");" +
                "node[\"landuse\"~\"farmland|farm\"](around:" + (int) radiusMeters + "," + lat + "," + lng + ");" +
                "way[\"building\"=\"farm\"](around:" + (int) radiusMeters + "," + lat + "," + lng + ");" +
                ");" +
                "out center;";

        System.out.println("Overpass query radius: " + (int) radiusMeters + "m");

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OVERPASS_API_URL))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofSeconds(30)) // increase if api slow
                    .POST(HttpRequest.BodyPublishers.ofString("data=" + java.net.URLEncoder.encode(query, "UTF-8")))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode elements = root.get("elements");

                if (elements != null && elements.isArray()) {
                    System.out.println("Overpass found: " + elements.size() + " elements");

                    for (JsonNode element : elements) {
                        InfrastructureItem item = parseElement(element, lat, lng);
                        if (item != null) {
                            items.add(item);
                        }
                    }
                }
            } else {
                System.err.println("Overpass HTTP " + response.statusCode());
            }
        } catch (Exception e) {
            System.err.println("Overpass error: " + e.getMessage());
        }

        return items;
    }

    private InfrastructureItem parseElement(JsonNode element, double impactLat, double impactLng) {
        double lat, lng;

        if (element.has("center")) {
            JsonNode center = element.get("center");
            lat = center.get("lat").asDouble();
            lng = center.get("lon").asDouble();
        } else if (element.has("lat") && element.has("lon")) {
            lat = element.get("lat").asDouble();
            lng = element.get("lon").asDouble();
        } else {
            return null;
        }

        double distance = haversineDistance(impactLat, impactLng, lat, lng);

        JsonNode tags = element.get("tags");
        if (tags == null)
            return null;

        String type = "unknown";
        String name = "Unnamed";

        // Determine type from tags
        if (tags.has("amenity")) {
            type = tags.get("amenity").asText();
        } else if (tags.has("landuse")) {
            type = tags.get("landuse").asText();
        } else if (tags.has("building")) {
            type = tags.get("building").asText();
        }

        // Get name
        if (tags.has("name"))
            name = tags.get("name").asText();
        else if (tags.has("name:en"))
            name = tags.get("name:en").asText();
        else if (tags.has("name:tr"))
            name = tags.get("name:tr").asText();
        else {
            // Generate descriptive name for unnamed features
            if ("industrial".equals(type))
                name = "Industrial Area";
            else if ("farmland".equals(type) || "farmyard".equals(type))
                name = "Agricultural Land";
            else if ("factory".equals(type))
                name = "Factory";
            else if ("warehouse".equals(type))
                name = "Warehouse";
            else if ("orchard".equals(type))
                name = "Orchard";
            else if ("vineyard".equals(type))
                name = "Vineyard";
        }

        // todo refine zone thresholds based on energy
        String zone = distance < 5 ? "thermal" : distance < 12 ? "pressure" : "shrapnel";

        return new InfrastructureItem(type, name, lat, lng, distance, zone);
    }

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
