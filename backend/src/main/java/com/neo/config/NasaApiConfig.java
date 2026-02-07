package com.neo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NasaApiConfig {

    @Value("${nasa.api.key:DEMO_KEY}")
    private String apiKey;

    @Value("${nasa.api.baseUrl:https://api.nasa.gov/neo/rest/v1}")
    private String baseUrl;

    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String buildFeedUrl(String startDate, String endDate) {
        return String.format("%s/feed?start_date=%s&end_date=%s&api_key=%s",
                baseUrl, startDate, endDate, apiKey);
    }
}
