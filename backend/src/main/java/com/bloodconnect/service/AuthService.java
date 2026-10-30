package com.bloodconnect.service;

import com.bloodconnect.dto.AuthResponse;
import com.bloodconnect.dto.LoginRequest;
import com.bloodconnect.dto.RegisterRequest;
import com.bloodconnect.dto.OtpVerificationRequest;
import com.bloodconnect.dto.ResendVerificationRequest;
import com.bloodconnect.dto.UserResponse;
import com.bloodconnect.dto.VerificationPendingResponse;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.UserRole;
import com.bloodconnect.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final OtpVerificationService otpVerificationService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            OtpVerificationService otpVerificationService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.otpVerificationService = otpVerificationService;
    }

    public VerificationPendingResponse register(RegisterRequest request) {
        if (request.role() == UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Administrator accounts are provisioned by server configuration");
        }
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at most 72 UTF-8 bytes");
        }

        otpVerificationService.ensureDeliveryConfigured();
        AppUser user = userRepository.save(new AppUser(
                email,
                passwordEncoder.encode(request.password()),
            request.role(),
            request.phone()
        ));
        otpVerificationService.issueForRegistration(user);
        return new VerificationPendingResponse(email, otpVerificationService.getExpirationSeconds());
        }

        public AuthResponse verifyRegistration(OtpVerificationRequest request) {
        String email = normalizeEmail(request.email());
        AppUser user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "The verification code is invalid or expired"));
        if (!otpVerificationService.verify(user, request.emailCode(), request.phoneCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "The verification code is invalid or expired");
        }
        return createAuthResponse(user);
        }

        public VerificationPendingResponse resendVerification(ResendVerificationRequest request) {
        String email = normalizeEmail(request.email());
        AppUser user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Verification cannot be resent for this account"));
        otpVerificationService.resend(user);
        return new VerificationPendingResponse(email, otpVerificationService.getExpirationSeconds());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizeEmail(request.email()), request.password())
        );
        AppUser user = (AppUser) authentication.getPrincipal();
        if (!user.areContactsVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Verify your email and phone before logging in");
        }
        return createAuthResponse(user);
    }

    public UserResponse currentUser(AppUser user) {
        return UserResponse.from(user);
    }

    private AuthResponse createAuthResponse(AppUser user) {
        return new AuthResponse("Bearer", jwtService.createToken(user), jwtService.getExpirationSeconds(),
                UserResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
