package com.resumeai.repository;

import com.resumeai.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {
    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime after);
}
