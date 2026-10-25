package com.resumeai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "app", "ELEVATECV Backend API",
                "version", "1.0.0",
                "docs", "/swagger-ui/index.html",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "app", "ELEVATECV Backend API",
                "timestamp", Instant.now().toString()
        ));
    }
}
