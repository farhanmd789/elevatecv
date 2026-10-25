package com.resumeai.service;

import com.resumeai.dto.*;
import com.resumeai.entity.Resume;
import com.resumeai.entity.User;
import com.resumeai.exception.ResourceNotFoundException;
import com.resumeai.repository.ResumeRepository;
import com.resumeai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public List<ResumeSummaryDto> getUserResumes(Long userId) {
        return resumeRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toSummaryDto)
                .toList();
    }

    @Transactional
    public ResumeDto createResume(Long userId, ResumeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resume resume = Resume.builder()
                .user(user)
                .title(request.getTitle())
                .targetRole(request.getTargetRole())
                .templateName(request.getTemplateName() != null ? request.getTemplateName() : "Classic")
                .accentColor(request.getAccentColor() != null ? request.getAccentColor() : "#6366f1")
                .fontFamily(request.getFontFamily() != null ? request.getFontFamily() : "Inter")
                .content(request.getContent() != null ? request.getContent() : new HashMap<>())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .build();

        resume = resumeRepository.save(resume);
        return toDto(resume);
    }

    public ResumeDto getResume(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or access denied"));
        return toDto(resume);
    }

    @Transactional
    public ResumeDto updateResume(Long resumeId, Long userId, ResumeRequest request) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or access denied"));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            resume.setTitle(request.getTitle().trim());
        }
        if (request.getTargetRole() != null) resume.setTargetRole(request.getTargetRole());
        if (request.getTemplateName() != null) resume.setTemplateName(request.getTemplateName());
        if (request.getAccentColor() != null) resume.setAccentColor(request.getAccentColor());
        if (request.getFontFamily() != null) resume.setFontFamily(request.getFontFamily());
        if (request.getContent() != null) resume.setContent(request.getContent());
        if (request.getIsPublic() != null) resume.setIsPublic(request.getIsPublic());

        resume = resumeRepository.save(resume);
        return toDto(resume);
    }

    @Transactional
    public void deleteResume(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or access denied"));
        resumeRepository.delete(resume);
    }

    @Transactional
    public ResumeDto duplicateResume(Long resumeId, Long userId) {
        Resume original = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or access denied"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> contentCopy = original.getContent() != null
                ? new HashMap<>(original.getContent())
                : new HashMap<>();

        Resume copy = Resume.builder()
                .user(user)
                .title(original.getTitle() + " (Copy)")
                .targetRole(original.getTargetRole())
                .templateName(original.getTemplateName())
                .accentColor(original.getAccentColor())
                .fontFamily(original.getFontFamily())
                .content(contentCopy)
                .isPublic(false)
                .build();

        copy = resumeRepository.save(copy);
        return toDto(copy);
    }

    @Transactional
    public ResumeDto updateVisibility(Long resumeId, Long userId, boolean isPublic) {
        Resume resume = resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or access denied"));
        resume.setIsPublic(isPublic);
        resume = resumeRepository.save(resume);
        return toDto(resume);
    }

    public List<ResumeDto> getPublicPortfolio(String username) {
        return resumeRepository.findByUserUsernameAndIsPublicTrue(username)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private ResumeSummaryDto toSummaryDto(Resume resume) {
        return ResumeSummaryDto.builder()
                .id(resume.getId())
                .title(resume.getTitle())
                .targetRole(resume.getTargetRole())
                .templateName(resume.getTemplateName())
                .isPublic(resume.getIsPublic())
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }

    private ResumeDto toDto(Resume resume) {
        return ResumeDto.builder()
                .id(resume.getId())
                .userId(resume.getUser().getId())
                .title(resume.getTitle())
                .targetRole(resume.getTargetRole())
                .templateName(resume.getTemplateName())
                .accentColor(resume.getAccentColor())
                .fontFamily(resume.getFontFamily())
                .content(resume.getContent())
                .isPublic(resume.getIsPublic())
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }
}
