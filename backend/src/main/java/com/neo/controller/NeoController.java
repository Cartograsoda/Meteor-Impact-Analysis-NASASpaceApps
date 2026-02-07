package com.neo.controller;

import com.neo.model.NearEarthObject;
import com.neo.service.NasaProxyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/neo")
@CrossOrigin(origins = "*") // maybe restrict this later
public class NeoController {

    private final NasaProxyService nasaProxyService;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    public NeoController(NasaProxyService nasaProxyService) {
        this.nasaProxyService = nasaProxyService;
    }

    @GetMapping("/feed")
    public ResponseEntity<List<NearEarthObject>> getFeed(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        if (startDate == null || endDate == null) {
            return ResponseEntity.ok(nasaProxyService.fetchTodayFeed()); // todo add better date validation
        }

        LocalDate start = LocalDate.parse(startDate, DATE_FORMAT);
        LocalDate end = LocalDate.parse(endDate, DATE_FORMAT);

        return ResponseEntity.ok(nasaProxyService.fetchNeoFeed(start, end));
    }

    @GetMapping("/feed/today")
    public ResponseEntity<List<NearEarthObject>> getTodayFeed() {
        return ResponseEntity.ok(nasaProxyService.fetchTodayFeed());
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("NEO Collision Engine API is running");
    }
}
