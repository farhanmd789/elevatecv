package com.resumeai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class AiSummaryRequest {
    @NotBlank(message = "Target role is required")
    private String targetRole;
    private String currentSummary;
    private Map<String, Object> resumeContent;
}
