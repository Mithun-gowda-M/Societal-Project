package com.bloodconnect.service;

import com.bloodconnect.entity.AppUser;
import com.bloodconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
public class OtpVerificationService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpDeliveryService deliveryService;
    private final Duration expiration;
    private final Duration resendCooldown;
    private final int maximumAttempts;
    private final int maximumResends;

    public OtpVerificationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            OtpDeliveryService deliveryService,
            @Value("${bloodconnect.otp.expiration:PT10M}") Duration expiration,
            @Value("${bloodconnect.otp.resend-cooldown:PT1M}") Duration resendCooldown,
            @Value("${bloodconnect.otp.max-attempts:5}") int maximumAttempts,
            @Value("${bloodconnect.otp.max-resends:3}") int maximumResends
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.deliveryService = deliveryService;
        this.expiration = expiration;
        this.resendCooldown = resendCooldown;
        this.maximumAttempts = maximumAttempts;
        this.maximumResends = maximumResends;
    }

    public void issueForRegistration(AppUser user) {
        issue(user, false);
    }

    public void resend(AppUser user) {
        if (user.areContactsVerified()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This account is already verified");
        }
        Instant now = Instant.now();
        if (user.getOtpSentAt() != null && now.isBefore(user.getOtpSentAt().plus(resendCooldown))) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Wait before requesting another verification code");
        }
        if (user.getOtpResends() >= maximumResends) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "The verification code resend limit has been reached");
        }
        issue(user, true);
    }

    public boolean verify(AppUser user, String emailCode, String phoneCode) {
        Instant now = Instant.now();
        if (user.areContactsVerified() || user.getEmailOtpHash() == null || user.getPhoneOtpHash() == null
                || user.getOtpExpiresAt() == null || !now.isBefore(user.getOtpExpiresAt())
                || user.getOtpAttempts() >= maximumAttempts) {
            return false;
        }

        boolean valid = passwordEncoder.matches(emailCode, user.getEmailOtpHash())
                & passwordEncoder.matches(phoneCode, user.getPhoneOtpHash());
        if (!valid) {
            user.incrementOtpAttempts();
            userRepository.save(user);
            return false;
        }

        user.markEmailVerified();
        user.markPhoneVerified();
        user.clearOtpChallenge();
        userRepository.save(user);
        return true;
    }

    public long getExpirationSeconds() {
        return expiration.toSeconds();
    }

    public void ensureDeliveryConfigured() {
        deliveryService.ensureConfigured();
    }

    private void issue(AppUser user, boolean resend) {
        deliveryService.ensureConfigured();
        String emailCode = newCode();
        String phoneCode;
        do {
            phoneCode = newCode();
        } while (phoneCode.equals(emailCode));
        Instant now = Instant.now();
        user.setOtpChallenge(passwordEncoder.encode(emailCode), passwordEncoder.encode(phoneCode),
                now.plus(expiration), now, resend);
        userRepository.save(user);
        deliveryService.sendEmail(user.getEmail(), emailCode);
        deliveryService.sendSms(user.getPhone(), phoneCode);
    }

    private String newCode() {
        return String.format(Locale.ROOT, "%06d", RANDOM.nextInt(1_000_000));
    }
}