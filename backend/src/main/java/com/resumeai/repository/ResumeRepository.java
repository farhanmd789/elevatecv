package com.resumeai.repository;

import com.resumeai.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<Resume> findByIdAndUserId(Long id, Long userId);
    Optional<Resume> findByIdAndIsPublicTrue(Long id);
    List<Resume> findByUserUsernameAndIsPublicTrue(String username);
}
