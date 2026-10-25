package com.resumeai.service;

import com.resumeai.dto.AuthResponse;
import com.resumeai.dto.LoginRequest;
import com.resumeai.dto.SignupRequest;
import com.resumeai.entity.User;
import com.resumeai.exception.ConflictException;
import com.resumeai.repository.UserRepository;
import com.resumeai.security.CustomUserDetails;
import com.resumeai.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

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

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Jane Doe")
                .email("jane@example.com")
                .username("janedoe")
                .passwordHash("hashed_password")
                .build();
    }

    @Test
    void signup_Success() {
        SignupRequest request = new SignupRequest();
        request.setName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setUsername("janedoe");
        request.setPassword("password123");
        request.setConfirmPassword("password123");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("janedoe")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateToken(1L)).thenReturn("jwt.token.here");

        AuthResponse response = authService.signup(request);

        assertNotNull(response);
        assertEquals("jwt.token.here", response.getToken());
        assertEquals("Jane Doe", response.getUser().getName());
        assertEquals("janedoe", response.getUser().getUsername());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void signup_PasswordMismatch_ThrowsException() {
        SignupRequest request = new SignupRequest();
        request.setName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setUsername("janedoe");
        request.setPassword("password123");
        request.setConfirmPassword("differentPassword");

        assertThrows(IllegalArgumentException.class, () -> authService.signup(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void signup_EmailAlreadyExists_ThrowsConflict() {
        SignupRequest request = new SignupRequest();
        request.setName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setUsername("janedoe");
        request.setPassword("password123");
        request.setConfirmPassword("password123");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.signup(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("jane@example.com");
        request.setPassword("password123");

        Authentication auth = mock(Authentication.class);
        CustomUserDetails userDetails = new CustomUserDetails(sampleUser);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(1L)).thenReturn("jwt.token.here");
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt.token.here", response.getToken());
        assertEquals("Jane Doe", response.getUser().getName());
    }
}
