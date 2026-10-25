package com.bloodconnect.service;

import com.bloodconnect.dto.AuthResponse;
import com.bloodconnect.dto.LoginRequest;
import com.bloodconnect.dto.RegisterRequest;
import com.bloodconnect.dto.VerificationPendingResponse;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.UserRole;
import com.bloodconnect.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    @Test
        void registerNormalizesEmailAndStartsVerificationWithoutIssuingToken() {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        JwtService jwtService = mock(JwtService.class);
                OtpVerificationService otpService = otpService();
        when(users.existsByEmail("donor@example.com")).thenReturn(false);
        when(encoder.encode("long-enough-password")).thenReturn("encoded-password");
        when(users.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

                VerificationPendingResponse response = new AuthService(users, encoder, authenticationManager, jwtService,
                                otpService).register(new RegisterRequest("  DONOR@Example.COM ", "long-enough-password",
                                UserRole.DONOR, "+15551234567"));

                assertThat(response.email()).isEqualTo("donor@example.com");
                assertThat(response.expiresInSeconds()).isEqualTo(600L);
        verify(users).existsByEmail("donor@example.com");
        verify(encoder).encode("long-enough-password");
                verify(otpService).issueForRegistration(any(AppUser.class));
                verify(jwtService, never()).createToken(any(AppUser.class));
    }

    @Test
    void registerRejectsDuplicateNormalizedEmail() {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(users.existsByEmail("donor@example.com")).thenReturn(true);

        assertThatThrownBy(() -> new AuthService(users, encoder, mock(AuthenticationManager.class),
                mock(JwtService.class), otpService()).register(
                new RegisterRequest(" DONOR@EXAMPLE.COM ", "long-enough-password", UserRole.DONOR,
                        "+15551234567")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
        verify(encoder, never()).encode(any());
    }

    @Test
    void registrationDoesNotPersistAccountWhenOtpDeliveryIsUnavailable() {
        UserRepository users = mock(UserRepository.class);
        OtpVerificationService otpService = otpService();
        when(users.existsByEmail("donor@example.com")).thenReturn(false);
        doThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE))
                .when(otpService).ensureDeliveryConfigured();

        assertThatThrownBy(() -> new AuthService(users, mock(PasswordEncoder.class),
                mock(AuthenticationManager.class), mock(JwtService.class), otpService).register(
                new RegisterRequest("donor@example.com", "long-enough-password", UserRole.DONOR,
                        "+15551234567")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        verify(users, never()).save(any(AppUser.class));
    }

    @Test
    void registerRejectsPasswordLongerThan72Utf8Bytes() {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(users.existsByEmail("donor@example.com")).thenReturn(false);
        String password = "\u00e9".repeat(37);

        assertThat(password).hasSize(37);
        assertThat(password.getBytes(java.nio.charset.StandardCharsets.UTF_8)).hasSize(74);
        assertThatThrownBy(() -> new AuthService(users, encoder, mock(AuthenticationManager.class),
                mock(JwtService.class), otpService()).register(
                new RegisterRequest("donor@example.com", password, UserRole.DONOR, "+15551234567")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        verify(encoder, never()).encode(any());
    }

    @Test
    void registerAcceptsPasswordAt72Utf8Bytes() {
        UserRepository users = mock(UserRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(users.existsByEmail("donor@example.com")).thenReturn(false);
        when(encoder.encode(any())).thenReturn("encoded-password");
        when(users.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        OtpVerificationService otpService = otpService();
        String password = "\u00e9".repeat(36);

        VerificationPendingResponse response = new AuthService(users, encoder, mock(AuthenticationManager.class),
                mock(JwtService.class), otpService).register(
                new RegisterRequest("donor@example.com", password, UserRole.DONOR, "+15551234567"));

        assertThat(password.getBytes(java.nio.charset.StandardCharsets.UTF_8)).hasSize(72);
        assertThat(response.email()).isEqualTo("donor@example.com");
        verify(encoder).encode(password);
        verify(otpService).issueForRegistration(any(AppUser.class));
    }

    @Test
    void loginNormalizesEmailBeforeAuthentication() {
        UserRepository users = mock(UserRepository.class);
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        JwtService jwtService = mock(JwtService.class);
        AppUser user = new AppUser("donor@example.com", "encoded-password", UserRole.DONOR);
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(jwtService.createToken(user)).thenReturn("signed-token");

        AuthResponse response = new AuthService(users, mock(PasswordEncoder.class), authenticationManager, jwtService,
                otpService())
                .login(new LoginRequest(" DONOR@Example.COM ", "plain-password"));

        assertThat(response.accessToken()).isEqualTo("signed-token");
        verify(authenticationManager).authenticate(org.mockito.ArgumentMatchers.argThat(token ->
                "donor@example.com".equals(token.getPrincipal())
                        && "plain-password".equals(token.getCredentials())));
    }

    @Test
    void currentUserReturnsOnlyPublicUserFields() {
        AppUser user = new AppUser("donor@example.com", "secret-hash", UserRole.DONOR);

        var response = new AuthService(mock(UserRepository.class), mock(PasswordEncoder.class),
                mock(AuthenticationManager.class), mock(JwtService.class), otpService()).currentUser(user);

        assertThat(response.email()).isEqualTo("donor@example.com");
        assertThat(response.role()).isEqualTo(UserRole.DONOR);
        assertThat(response).hasNoNullFieldsOrPropertiesExcept("id", "createdAt");
    }

        @Test
        void loginRejectsUnverifiedAccount() {
                UserRepository users = mock(UserRepository.class);
                AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
                AppUser user = new AppUser("donor@example.com", "encoded-password", UserRole.DONOR, "+15551234567");
                Authentication authentication = mock(Authentication.class);
                when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                                .thenReturn(authentication);
                when(authentication.getPrincipal()).thenReturn(user);

                assertThatThrownBy(() -> new AuthService(users, mock(PasswordEncoder.class), authenticationManager,
                                mock(JwtService.class), otpService()).login(new LoginRequest("donor@example.com", "plain-password")))
                                .isInstanceOf(ResponseStatusException.class)
                                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                                .isEqualTo(HttpStatus.FORBIDDEN);
        }

        private OtpVerificationService otpService() {
                OtpVerificationService otpService = mock(OtpVerificationService.class);
                when(otpService.getExpirationSeconds()).thenReturn(Duration.ofMinutes(10).toSeconds());
                return otpService;
        }
}
