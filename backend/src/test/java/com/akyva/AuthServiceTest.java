package com.akyva;

import com.akyva.dto.auth.AuthResponse;
import com.akyva.dto.auth.RegisterRequest;
import com.akyva.entity.User;
import com.akyva.exception.BadRequestException;
import com.akyva.repository.UserRepository;
import com.akyva.security.JwtTokenProvider;
import com.akyva.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("alex_akyva");
        registerRequest.setDisplayName("Alex Rivera");
        registerRequest.setEmail("alex@akyva.io");
        registerRequest.setPassword("securePassword123");
    }

    @Test
    @DisplayName("Should successfully register a new user and generate JWT token")
    void testRegisterSuccess() {
        when(userRepository.existsByUsername("alex_akyva")).thenReturn(false);
        when(userRepository.existsByEmail("alex@akyva.io")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed_bcrypt_secret");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenProvider.generateTokenFromUserId(any())).thenReturn("mocked.jwt.token");
        when(tokenProvider.generateRefreshToken(any())).thenReturn("mocked.refresh.token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("alex_akyva", response.getUser().getUsername());
        assertTrue(response.getUser().getAkyvaId().startsWith("AKY-"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException if username already exists")
    void testRegisterDuplicateUsername() {
        when(userRepository.existsByUsername("alex_akyva")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }
}
