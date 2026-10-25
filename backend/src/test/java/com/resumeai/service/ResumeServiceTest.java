package com.resumeai.service;

import com.resumeai.dto.ResumeDto;
import com.resumeai.dto.ResumeRequest;
import com.resumeai.dto.ResumeSummaryDto;
import com.resumeai.entity.Resume;
import com.resumeai.entity.User;
import com.resumeai.exception.ResourceNotFoundException;
import com.resumeai.repository.ResumeRepository;
import com.resumeai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ResumeService resumeService;

    private User sampleUser;
    private Resume sampleResume;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Alex Smith")
                .email("alex@example.com")
                .username("alexsmith")
                .build();

        Map<String, Object> content = new HashMap<>();
        content.put("summary", "Experienced Software Engineer");

        sampleResume = Resume.builder()
                .id(10L)
                .user(sampleUser)
                .title("Software Engineer Resume")
                .targetRole("Senior Backend Developer")
                .templateName("Classic")
                .accentColor("#6366f1")
                .fontFamily("Inter")
                .content(content)
                .isPublic(false)
                .build();
    }

    @Test
    void getUserResumes_ReturnsSummaries() {
        when(resumeRepository.findByUserIdOrderByUpdatedAtDesc(1L))
                .thenReturn(List.of(sampleResume));

        List<ResumeSummaryDto> result = resumeService.getUserResumes(1L);

        assertEquals(1, result.size());
        assertEquals("Software Engineer Resume", result.get(0).getTitle());
        assertEquals("Senior Backend Developer", result.get(0).getTargetRole());
    }

    @Test
    void createResume_Success() {
        ResumeRequest req = new ResumeRequest();
        req.setTitle("New Resume");
        req.setTargetRole("DevOps Engineer");
        req.setTemplateName("Modern");

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(resumeRepository.save(any(Resume.class))).thenAnswer(i -> {
            Resume r = i.getArgument(0);
            r.setId(11L);
            return r;
        });

        ResumeDto created = resumeService.createResume(1L, req);

        assertNotNull(created);
        assertEquals(11L, created.getId());
        assertEquals("New Resume", created.getTitle());
        assertEquals("DevOps Engineer", created.getTargetRole());
        assertEquals("Modern", created.getTemplateName());
    }

    @Test
    void getResume_Found() {
        when(resumeRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sampleResume));

        ResumeDto dto = resumeService.getResume(10L, 1L);

        assertNotNull(dto);
        assertEquals(10L, dto.getId());
        assertEquals("Software Engineer Resume", dto.getTitle());
    }

    @Test
    void getResume_NotFound_ThrowsException() {
        when(resumeRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> resumeService.getResume(99L, 1L));
    }

    @Test
    void duplicateResume_CreatesCopyWithCopyTitle() {
        when(resumeRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sampleResume));
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(resumeRepository.save(any(Resume.class))).thenAnswer(i -> {
            Resume r = i.getArgument(0);
            r.setId(12L);
            return r;
        });

        ResumeDto copy = resumeService.duplicateResume(10L, 1L);

        assertNotNull(copy);
        assertEquals(12L, copy.getId());
        assertEquals("Software Engineer Resume (Copy)", copy.getTitle());
        assertFalse(copy.getIsPublic());
    }

    @Test
    void updateVisibility_TogglesCorrectly() {
        when(resumeRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sampleResume));
        when(resumeRepository.save(any(Resume.class))).thenAnswer(i -> i.getArgument(0));

        ResumeDto updated = resumeService.updateVisibility(10L, 1L, true);

        assertTrue(updated.getIsPublic());
        verify(resumeRepository).save(sampleResume);
    }

    @Test
    void getPublicPortfolio_ReturnsPublicResumes() {
        sampleResume.setIsPublic(true);
        when(resumeRepository.findByUserUsernameAndIsPublicTrue("alexsmith"))
                .thenReturn(List.of(sampleResume));

        List<ResumeDto> portfolio = resumeService.getPublicPortfolio("alexsmith");

        assertEquals(1, portfolio.size());
        assertEquals(10L, portfolio.get(0).getId());
        assertTrue(portfolio.get(0).getIsPublic());
    }
}
