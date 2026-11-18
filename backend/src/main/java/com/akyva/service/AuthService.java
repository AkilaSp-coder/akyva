package com.akyva.service;

import com.akyva.dto.auth.AuthResponse;
import com.akyva.dto.auth.LoginRequest;
import com.akyva.dto.auth.RefreshTokenRequest;
import com.akyva.dto.auth.RegisterRequest;
import com.akyva.dto.user.UserDto;
import com.akyva.entity.User;
import com.akyva.exception.BadRequestException;
import com.akyva.exception.UnauthorizedException;
import com.akyva.repository.UserRepository;
import com.akyva.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim().toLowerCase(Locale.ROOT);
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        // Generate unique AKYVA ID (e.g. AKY-9482-1049)
        String akyvaId = generateUniqueAkyvaId();

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .username(username)
                .displayName(request.getDisplayName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .akyvaId(akyvaId)
                .status("Online")
                .bio("Connecting beyond language with AKYVA")
                .profileImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80")
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenFromUserId(user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new UnauthorizedException("Invalid username/email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username/email or password");
        }

        String token = tokenProvider.generateTokenFromUserId(user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String userId = tokenProvider.getUserIdFromJWT(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String newToken = tokenProvider.generateTokenFromUserId(user.getId());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(mapToDto(user))
                .build();
    }

    private String generateUniqueAkyvaId() {
        int part1 = (int) (Math.random() * 9000) + 1000;
        int part2 = (int) (Math.random() * 9000) + 1000;
        String id = "AKY-" + part1 + "-" + part2;
        if (userRepository.findByAkyvaId(id).isPresent()) {
            return generateUniqueAkyvaId();
        }
        return id;
    }

    public static UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .bio(user.getBio())
                .status(user.getStatus())
                .akyvaId(user.getAkyvaId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
