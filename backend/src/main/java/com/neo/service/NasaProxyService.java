package com.neo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neo.config.NasaApiConfig;
import com.neo.model.NearEarthObject;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NasaProxyService {

    private final NasaApiConfig config;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final Map<String, CachedResponse> cache;

    private static final Duration CACHE_TTL = Duration.ofHours(1);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    public NasaProxyService(NasaApiConfig config) {
        this.config = config;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        this.cache = new ConcurrentHashMap<>();
    }

    public List<NearEarthObject> fetchNeoFeed(LocalDate startDate, LocalDate endDate) {
        String cacheKey = buildCacheKey(startDate, endDate);

        CachedResponse cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.data;
        }

        String url = config.buildFeedUrl(
                startDate.format(DATE_FORMAT),
                endDate.format(DATE_FORMAT));

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("NASA API returned status: " + response.statusCode());
            }

            List<NearEarthObject> neoList = parseNasaResponse(response.body());
            cache.put(cacheKey, new CachedResponse(neoList));
            return neoList;

        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch NEO data: " + e.getMessage(), e);
        }
    }

    public List<NearEarthObject> fetchTodayFeed() {
        LocalDate today = LocalDate.now();
        return fetchNeoFeed(today, today);
    }

    private List<NearEarthObject> parseNasaResponse(String json) throws Exception {
        List<NearEarthObject> results = new ArrayList<>();
        JsonNode root = objectMapper.readTree(json);
        JsonNode nearEarthObjects = root.get("near_earth_objects");

        nearEarthObjects.fields().forEachRemaining(entry -> {
            String date = entry.getKey();
            JsonNode objects = entry.getValue();

            for (JsonNode obj : objects) {
                results.add(parseNeoObject(obj, date));
            }
        });

        return results;
    }

    private NearEarthObject parseNeoObject(JsonNode obj, String date) {
        String id = obj.get("id").asText();
        String name = obj.get("name").asText();
        boolean hazardous = obj.get("is_potentially_hazardous_asteroid").asBoolean();

        JsonNode diameter = obj.get("estimated_diameter").get("meters");
        double diameterMin = diameter.get("estimated_diameter_min").asDouble();
        double diameterMax = diameter.get("estimated_diameter_max").asDouble();

        JsonNode closeApproach = obj.get("close_approach_data").get(0);
        JsonNode relativeVelocity = closeApproach.get("relative_velocity");
        double velocityKmPerSec = relativeVelocity.get("kilometers_per_second").asDouble();

        JsonNode missDistance = closeApproach.get("miss_distance");
        double missDistanceKm = missDistance.get("kilometers").asDouble();

        return new NearEarthObject(
                id, name, diameterMin, diameterMax,
                velocityKmPerSec, missDistanceKm, hazardous, date);
    }

    private String buildCacheKey(LocalDate start, LocalDate end) {
        return start.format(DATE_FORMAT) + "_" + end.format(DATE_FORMAT);
    }

    private static class CachedResponse {
        final List<NearEarthObject> data;
        final long timestamp;

        CachedResponse(List<NearEarthObject> data) {
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_TTL.toMillis();
        }
    }
}
