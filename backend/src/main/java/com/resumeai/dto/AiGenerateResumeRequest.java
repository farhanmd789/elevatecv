package com.resumeai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiGenerateResumeRequest {
    @NotBlank(message = "Target role is required")
    private String targetRole;
    private String jobDescription;
    private String userBackground;
}
