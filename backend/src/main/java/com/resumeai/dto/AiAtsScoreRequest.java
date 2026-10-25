package com.resumeai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class AiAtsScoreRequest {
    @NotBlank(message = "Job description is required")
    private String jobDescription;
    private Map<String, Object> resumeContent;
    private String resumeText;
}
