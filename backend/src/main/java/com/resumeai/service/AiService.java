package com.resumeai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeai.dto.*;
import com.resumeai.entity.AiUsageLog;
import com.resumeai.entity.User;
import com.resumeai.exception.AiException;
import com.resumeai.exception.RateLimitException;
import com.resumeai.exception.ResourceNotFoundException;
import com.resumeai.repository.AiUsageLogRepository;
import com.resumeai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final ChatClient chatClient;
    private final AiUsageLogRepository aiUsageLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.rate-limit.requests-per-hour:20}")
    private int requestsPerHour;

    // ─── Rate Limiting ────────────────────────────────────────────────────────

    private void checkRateLimit(Long userId) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long count = aiUsageLogRepository.countByUserIdAndCreatedAtAfter(userId, oneHourAgo);
        if (count >= requestsPerHour) {
            throw new RateLimitException(
                String.format("AI rate limit exceeded. You can make %d AI requests per hour. Please try again later.", requestsPerHour)
            );
        }
    }

    private void logUsage(Long userId, String feature) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AiUsageLog log = AiUsageLog.builder()
                .user(user)
                .feature(feature)
                .build();
        aiUsageLogRepository.save(log);
    }

    // ─── Generate Professional Summary ───────────────────────────────────────

    public String generateSummary(Long userId, AiSummaryRequest request) {
        checkRateLimit(userId);
        try {
            String contentJson = request.getResumeContent() != null
                    ? objectMapper.writeValueAsString(request.getResumeContent())
                    : "{}";

            String prompt = String.format("""
                You are an expert resume writer. Generate a compelling, ATS-friendly professional summary for a resume.
                
                Target Role: %s
                Current Summary (if any): %s
                Resume Details: %s
                
                Instructions:
                - Write 3-5 sentences (80-120 words)
                - Start with a strong professional title/label
                - Highlight key skills, experience, and unique value proposition
                - Use action-oriented language
                - Make it ATS-friendly with relevant keywords for the target role
                - Do NOT invent fake experience — only polish what's provided
                - Return ONLY the summary text, no labels, no markdown
                """,
                    request.getTargetRole(),
                    request.getCurrentSummary() != null ? request.getCurrentSummary() : "None provided",
                    contentJson
            );

            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            logUsage(userId, "summary");
            return result != null ? result.trim() : "";
        } catch (RateLimitException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error generating summary: {}", e.getMessage());
            throw new AiException("Failed to generate summary. Please try again in a moment.", e);
        }
    }

    // ─── Improve / Rewrite Text ───────────────────────────────────────────────

    public String improveText(Long userId, AiImproveRequest request) {
        checkRateLimit(userId);
        try {
            String prompt = String.format("""
                You are an expert resume writer specializing in ATS-friendly, impactful descriptions.
                
                Context: %s
                Role: %s
                Text to improve: %s
                
                Instructions:
                - Rewrite as strong, ATS-friendly bullet points
                - Use powerful action verbs (Developed, Led, Implemented, Designed, Optimized, etc.)
                - Quantify achievements where logically possible (e.g., "by 40%%", "for 50+ users")
                - Keep it concise — 2-5 bullet points
                - Do NOT invent fake metrics or employers — only enhance what's provided
                - Return ONLY the bullet points, one per line, starting with "•"
                """,
                    request.getContext() != null ? request.getContext() : "General professional context",
                    request.getRole() != null ? request.getRole() : "Professional",
                    request.getText()
            );

            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            logUsage(userId, "improve");
            return result != null ? result.trim() : "";
        } catch (RateLimitException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error improving text: {}", e.getMessage());
            throw new AiException("Failed to improve text. Please try again in a moment.", e);
        }
    }

    // ─── Generate Full Resume ─────────────────────────────────────────────────

    public Map<String, Object> generateFullResume(Long userId, AiGenerateResumeRequest request) {
        checkRateLimit(userId);
        try {
            String prompt = String.format("""
                You are an expert resume writer. Create a professional resume structure as JSON for the following:
                
                Target Role: %s
                Job Description: %s
                User Background: %s
                
                IMPORTANT: Do NOT invent fake employers, degrees, certifications, or companies.
                If the user hasn't provided background info, create a generic but realistic template structure.
                
                Return a valid JSON object with EXACTLY this structure (no markdown, no code blocks, pure JSON):
                {
                  "personalInfo": {
                    "fullName": "...",
                    "email": "...",
                    "phone": "...",
                    "location": "...",
                    "linkedin": "",
                    "github": "",
                    "portfolio": ""
                  },
                  "summary": "...",
                  "education": [
                    {
                      "degree": "...",
                      "institution": "...",
                      "year": "...",
                      "grade": "..."
                    }
                  ],
                  "skills": {
                    "technical": ["skill1", "skill2"],
                    "soft": ["skill1", "skill2"]
                  },
                  "projects": [
                    {
                      "title": "...",
                      "techStack": "...",
                      "description": "...",
                      "link": ""
                    }
                  ],
                  "experience": [
                    {
                      "company": "...",
                      "role": "...",
                      "duration": "...",
                      "description": "..."
                    }
                  ],
                  "certifications": ["..."],
                  "languages": ["English"]
                }
                """,
                    request.getTargetRole(),
                    request.getJobDescription() != null ? request.getJobDescription() : "Not provided",
                    request.getUserBackground() != null ? request.getUserBackground() : "Not provided"
            );

            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            logUsage(userId, "generate-resume");

            if (result == null || result.isBlank()) {
                throw new AiException("AI returned an empty response");
            }

            // Clean up the response — remove markdown code blocks if present
            String cleaned = result.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7);
            } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }

            return objectMapper.readValue(cleaned.trim(), new TypeReference<Map<String, Object>>() {});
        } catch (RateLimitException | AiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error generating full resume: {}", e.getMessage());
            throw new AiException("Failed to generate resume. Please try again in a moment.", e);
        }
    }

    // ─── ATS Score & Suggestions ──────────────────────────────────────────────

    public AiAtsScoreResponse getAtsScore(Long userId, AiAtsScoreRequest request) {
        checkRateLimit(userId);
        try {
            String resumeData;
            if (request.getResumeText() != null && !request.getResumeText().isBlank()) {
                resumeData = request.getResumeText().trim();
            } else if (request.getResumeContent() != null) {
                resumeData = objectMapper.writeValueAsString(request.getResumeContent());
            } else {
                resumeData = "No resume content provided";
            }

            String prompt = String.format("""
                You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume against the job description.
                
                Job Description:
                %s
                
                Resume Content:
                %s
                
                Return a valid JSON object (no markdown, no code blocks) with EXACTLY this structure:
                {
                  "score": <integer 0-100>,
                  "summary": "<2-3 sentence overall assessment>",
                  "missingKeywords": ["keyword1", "keyword2", "..."],
                  "improvements": ["improvement tip 1", "improvement tip 2", "..."],
                  "strengths": ["strength 1", "strength 2", "..."]
                }
                
                Scoring criteria:
                - Keyword match (40 points): How many job description keywords appear in the resume
                - Skills alignment (30 points): Technical/soft skills match
                - Experience relevance (20 points): Experience matches requirements  
                - Format/completeness (10 points): Complete sections, no gaps
                """,
                    request.getJobDescription(),
                    resumeData
            );

            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            logUsage(userId, "ats-score");

            if (result == null || result.isBlank()) {
                throw new AiException("AI returned an empty response");
            }

            String cleaned = result.trim();
            if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
            else if (cleaned.startsWith("```")) cleaned = cleaned.substring(3);
            if (cleaned.endsWith("```")) cleaned = cleaned.substring(0, cleaned.length() - 3);

            return objectMapper.readValue(cleaned.trim(), AiAtsScoreResponse.class);
        } catch (RateLimitException | AiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error getting ATS score: {}", e.getMessage());
            throw new AiException("Failed to analyze resume. Please try again in a moment.", e);
        }
    }

    // ─── Cover Letter Generator ───────────────────────────────────────────────

    public String generateCoverLetter(Long userId, AiCoverLetterRequest request) {
        checkRateLimit(userId);
        try {
            String resumeData;
            if (request.getResumeText() != null && !request.getResumeText().isBlank()) {
                resumeData = request.getResumeText().trim();
            } else if (request.getResumeContent() != null) {
                resumeData = objectMapper.writeValueAsString(request.getResumeContent());
            } else {
                resumeData = "No resume provided";
            }

            String prompt = String.format("""
                You are a professional cover letter writer. Write a compelling cover letter.
                
                Company: %s
                Hiring Manager: %s
                Job Description: %s
                Resume Content: %s
                
                Instructions:
                - Write a formal, professional cover letter (3-4 paragraphs)
                - Opening: Express enthusiasm for the specific role and company
                - Body: Match your key skills/experience to the job requirements
                - Closing: Strong call to action
                - Tone: Professional but personable
                - Length: 300-400 words
                - Do NOT invent fake experience — only use what's in the resume
                - Return ONLY the cover letter text, no labels
                """,
                    request.getCompanyName(),
                    request.getHiringManagerName() != null ? request.getHiringManagerName() : "Hiring Manager",
                    request.getJobDescription(),
                    resumeData
            );

            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            logUsage(userId, "cover-letter");
            return result != null ? result.trim() : "";
        } catch (RateLimitException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error generating cover letter: {}", e.getMessage());
            throw new AiException("Failed to generate cover letter. Please try again in a moment.", e);
        }
    }

    // ─── Parse Resume from Raw Text ──────────────────────────────────────────

    public Map<String, Object> parseResumeFromText(Long userId, String resumeText) {
        checkRateLimit(userId);
        try {
            String prompt = String.format("""
                You are an expert resume parser. Parse the following raw resume text into a structured JSON resume format.
                
                Resume Text:
                %s
                
                Extract all available information accurately. Do NOT invent fake data.
                Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:
                {
                  "personalInfo": {
                    "fullName": "",
                    "email": "",
                    "phone": "",
                    "location": "",
                    "linkedin": "",
                    "github": "",
                    "portfolio": ""
                  },
                  "summary": "",
                  "education": [
                    { "degree": "", "institution": "", "year": "", "grade": "" }
                  ],
                  "skills": {
                    "technical": ["Skill 1", "Skill 2"],
                    "soft": ["Skill 1", "Skill 2"]
                  },
                  "projects": [
                    { "title": "", "techStack": "", "description": "", "link": "" }
                  ],
                  "experience": [
                    { "company": "", "role": "", "duration": "", "description": "" }
                  ],
                  "certifications": ["Cert 1", "Cert 2"],
                  "languages": ["English"]
                }
                """,
                resumeText
            );

            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            logUsage(userId, "parse-resume");

            if (result == null || result.isBlank()) {
                throw new AiException("AI returned an empty response while parsing resume");
            }

            String cleaned = result.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7);
            } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }

            return objectMapper.readValue(cleaned.trim(), new TypeReference<Map<String, Object>>() {});
        } catch (RateLimitException | AiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error parsing resume from text: {}", e.getMessage());
            throw new AiException("Failed to parse resume text. Please try again.", e);
        }
    }
}
