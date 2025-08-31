package com.calendarfirst.backend.auth;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "verification_tokens", indexes = {@Index(name="idx_verif_token_hash", columnList = "tokenHash")})
public class VerificationToken {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 64) // SHA-256 hex length
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant usedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
