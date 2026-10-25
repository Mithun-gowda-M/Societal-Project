package com.bloodconnect.controller;

import com.bloodconnect.dto.AuthResponse;
import com.bloodconnect.dto.LoginRequest;
import com.bloodconnect.dto.OtpVerificationRequest;
import com.bloodconnect.dto.RegisterRequest;
import com.bloodconnect.dto.ResendVerificationRequest;
import com.bloodconnect.dto.UserResponse;
import com.bloodconnect.dto.VerificationPendingResponse;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<VerificationPendingResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(authService.register(request));
    }

    @PostMapping("/verify-otp")
    public AuthResponse verifyRegistration(@Valid @RequestBody OtpVerificationRequest request) {
        return authService.verifyRegistration(request);
    }

    @PostMapping("/resend-otp")
    public VerificationPendingResponse resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        return authService.resendVerification(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse currentUser(@AuthenticationPrincipal AppUser user) {
        return authService.currentUser(user);
    }
}
