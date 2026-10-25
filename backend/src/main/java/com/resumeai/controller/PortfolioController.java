package com.resumeai.controller;

import com.resumeai.dto.*;
import com.resumeai.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio", description = "Public portfolio endpoints")
public class PortfolioController {

    private final ResumeService resumeService;

    @GetMapping("/{username}")
    @Operation(summary = "Get public portfolio for a user")
    public ResponseEntity<ApiResponse<List<ResumeDto>>> getPublicPortfolio(@PathVariable String username) {
        List<ResumeDto> resumes = resumeService.getPublicPortfolio(username);
        return ResponseEntity.ok(ApiResponse.success(resumes));
    }
}
