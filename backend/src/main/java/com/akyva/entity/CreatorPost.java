package com.akyva.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "creator_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatorPost {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 30)
    private String platform; // INSTAGRAM, YOUTUBE

    @Column(nullable = false)
    private String title;

    @Column(name = "script_prompt", columnDefinition = "TEXT")
    private String scriptPrompt;

    @Column(name = "script_content", columnDefinition = "TEXT")
    private String scriptContent;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String language = "en"; // en, ta (Tamil)

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, SCHEDULED, PUBLISHED

    @Column(name = "scheduled_for")
    private Instant scheduledFor;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "views_count")
    @Builder.Default
    private Integer viewsCount = 0;

    @Column(name = "likes_count")
    @Builder.Default
    private Integer likesCount = 0;

    @Column(name = "comments_count")
    @Builder.Default
    private Integer commentsCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
