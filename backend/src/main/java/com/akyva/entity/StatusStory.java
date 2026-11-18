package com.akyva.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "statuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusStory {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String type = "TEXT"; // TEXT, IMAGE, VIDEO

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "media_url", length = 1024)
    private String mediaUrl;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(name = "bg_gradient", length = 100)
    private String bgGradient;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String privacy = "CONTACTS";

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "statusStory", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StatusView> views = new ArrayList<>();
}
