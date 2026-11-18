package com.akyva.repository;

import com.akyva.entity.StatusView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatusViewRepository extends JpaRepository<StatusView, String> {
    Optional<StatusView> findByStatusStoryIdAndViewerId(String statusStoryId, String viewerId);
    boolean existsByStatusStoryIdAndViewerId(String statusStoryId, String viewerId);
}
