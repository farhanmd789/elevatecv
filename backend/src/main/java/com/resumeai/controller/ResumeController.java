package com.resumeai.controller;

import com.resumeai.dto.*;
import com.resumeai.security.CustomUserDetails;
import com.resumeai.service.AiService;
import com.resumeai.service.FileExtractionService;
import com.resumeai.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Tag(name = "Resumes", description = "Resume CRUD operations")
public class ResumeController {

    private final ResumeService resumeService;
    private final AiService aiService;
    private final FileExtractionService fileExtractionService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a resume file (PDF/TXT) and parse into a new resume")
    public ResponseEntity<ApiResponse<ResumeDto>> uploadResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) throws Exception {
        String extractedText = fileExtractionService.extractText(file);
        Map<String, Object> content = aiService.parseResumeFromText(userDetails.getId(), extractedText);

        String cleanTitle = (title != null && !title.isBlank())
                ? title
                : (file.getOriginalFilename() != null ? file.getOriginalFilename().replaceFirst("[.][^.]+$", "") : "Uploaded Resume");

        ResumeRequest request = new ResumeRequest();
        request.setTitle(cleanTitle);
        request.setTargetRole("");
        request.setTemplateName("Classic");
        request.setAccentColor("#6366f1");
        request.setFontFamily("Inter");
        request.setContent(content);
        request.setIsPublic(false);

        ResumeDto created = resumeService.createResume(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Resume imported successfully", created));
    }

    @GetMapping
    @Operation(summary = "Get all resumes for current user")
    public ResponseEntity<ApiResponse<List<ResumeSummaryDto>>> getUserResumes(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ResumeSummaryDto> resumes = resumeService.getUserResumes(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(resumes));
    }

    @PostMapping
    @Operation(summary = "Create a new resume")
    public ResponseEntity<ApiResponse<ResumeDto>> createResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ResumeRequest request) {
        ResumeDto resume = resumeService.createResume(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Resume created", resume));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resume by ID")
    public ResponseEntity<ApiResponse<ResumeDto>> getResume(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ResumeDto resume = resumeService.getResume(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(resume));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a resume")
    public ResponseEntity<ApiResponse<ResumeDto>> updateResume(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ResumeRequest request) {
        ResumeDto resume = resumeService.updateResume(id, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Resume updated", resume));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a resume")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        resumeService.deleteResume(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Resume deleted", null));
    }

    @PostMapping("/{id}/duplicate")
    @Operation(summary = "Duplicate a resume")
    public ResponseEntity<ApiResponse<ResumeDto>> duplicateResume(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ResumeDto resume = resumeService.duplicateResume(id, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Resume duplicated", resume));
    }

    @PatchMapping("/{id}/visibility")
    @Operation(summary = "Toggle resume public/private visibility")
    public ResponseEntity<ApiResponse<ResumeDto>> updateVisibility(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Boolean> body) {
        Boolean isPublic = body.get("isPublic");
        if (isPublic == null) {
            throw new IllegalArgumentException("isPublic field is required");
        }
        ResumeDto resume = resumeService.updateVisibility(id, userDetails.getId(), isPublic);
        return ResponseEntity.ok(ApiResponse.success("Visibility updated", resume));
    }
}
