package com.resumeai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class AiCoverLetterRequest {
    @NotBlank(message = "Job description is required")
    private String jobDescription;
    @NotBlank(message = "Company name is required")
    private String companyName;
    private String hiringManagerName;
    private Map<String, Object> resumeContent;
    private String resumeText;
}
