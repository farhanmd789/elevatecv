package com.resumeai.controller;

import com.resumeai.dto.*;
import com.resumeai.security.CustomUserDetails;
import com.resumeai.service.AiService;
import com.resumeai.service.FileExtractionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "Gemini-powered AI resume features")
public class AiController {

    private final AiService aiService;
    private final FileExtractionService fileExtractionService;

    @PostMapping(value = "/extract-text", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Extract text from uploaded PDF or text resume")
    public ResponseEntity<ApiResponse<String>> extractText(
            @RequestParam("file") MultipartFile file) throws Exception {
        String text = fileExtractionService.extractText(file);
        return ResponseEntity.ok(ApiResponse.success("Text extracted", text));
    }

    @PostMapping("/summary")
    @Operation(summary = "Generate a professional summary")
    public ResponseEntity<ApiResponse<String>> generateSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AiSummaryRequest request) {
        String summary = aiService.generateSummary(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Summary generated", summary));
    }

    @PostMapping("/improve")
    @Operation(summary = "Improve / rewrite text into ATS-friendly bullet points")
    public ResponseEntity<ApiResponse<String>> improveText(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AiImproveRequest request) {
        String improved = aiService.improveText(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Text improved", improved));
    }

    @PostMapping("/generate-resume")
    @Operation(summary = "Generate a full resume structure from a target role")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AiGenerateResumeRequest request) {
        Map<String, Object> resume = aiService.generateFullResume(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Resume generated", resume));
    }

    @PostMapping("/ats-score")
    @Operation(summary = "Get ATS score and improvement suggestions")
    public ResponseEntity<ApiResponse<AiAtsScoreResponse>> getAtsScore(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AiAtsScoreRequest request) {
        AiAtsScoreResponse score = aiService.getAtsScore(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("ATS analysis complete", score));
    }

    @PostMapping("/cover-letter")
    @Operation(summary = "Generate a cover letter from the resume and job description")
    public ResponseEntity<ApiResponse<String>> generateCoverLetter(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AiCoverLetterRequest request) {
        String letter = aiService.generateCoverLetter(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cover letter generated", letter));
    }
}
