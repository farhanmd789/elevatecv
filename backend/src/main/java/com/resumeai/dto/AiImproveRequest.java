package com.resumeai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiImproveRequest {
    @NotBlank(message = "Text to improve is required")
    private String text;
    private String context;
    private String role;
}
