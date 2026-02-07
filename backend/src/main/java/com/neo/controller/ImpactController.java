package com.neo.controller;

import com.neo.model.ImpactReport;
import com.neo.service.OverpassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/impact")
@CrossOrigin(origins = "*")
public class ImpactController {

    private final OverpassService overpassService;

    public ImpactController(OverpassService overpassService) {
        this.overpassService = overpassService;
    }

    @GetMapping("/query")
    public ResponseEntity<ImpactReport> queryImpact(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double kineticEnergy) {

        ImpactReport report = overpassService.generateImpactReport(lat, lng, kineticEnergy);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Impact API is running");
    }
}
