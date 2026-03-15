package com.ex.web.auth.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.Instant;

    @Entity
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    public class RefreshToken {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Integer tokenId;

        @JsonIgnoreProperties("user")
        @Column(nullable = false, length = 500)
        private String refreshToken;


        @Column(nullable = false)
        private Instant expirationTime;

        @JsonIgnore
        @OneToOne
        private User user;
    }
