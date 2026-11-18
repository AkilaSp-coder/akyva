package com.akyva.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${akyva.security.jwt.secret}")
    private String jwtSecret;

    @Value("${akyva.security.jwt.expiration-ms:86400000}")
    private long jwtExpirationInMs;

    @Value("${akyva.security.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationInMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        if (jwtSecret.length() < 32) {
            String padded = (jwtSecret + "AKYVA_SUPER_SECRET_KEY_PADDING_2026_PRODUCTION").substring(0, 64);
            keyBytes = padded.getBytes(StandardCharsets.UTF_8);
        } else {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateTokenFromUserId(userPrincipal.getId(), jwtExpirationInMs);
    }

    public String generateTokenFromUserId(String userId) {
        return generateTokenFromUserId(userId, jwtExpirationInMs);
    }

    public String generateRefreshToken(String userId) {
        return generateTokenFromUserId(userId, refreshExpirationInMs);
    }

    private String generateTokenFromUserId(String userId, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUserIdFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }
}
