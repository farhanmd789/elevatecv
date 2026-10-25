package com.resumeai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class ResumeRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String targetRole;
    private String templateName;
    private String accentColor;
    private String fontFamily;
    private Map<String, Object> content;
    private Boolean isPublic;
}
