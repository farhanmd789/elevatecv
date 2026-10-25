package com.resumeai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiAtsScoreResponse {
    private int score;
    private String summary;
    private List<String> missingKeywords;
    private List<String> improvements;
    private List<String> strengths;
}
