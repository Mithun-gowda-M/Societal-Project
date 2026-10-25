package com.bloodconnect.service;

import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.UserRole;
import com.bloodconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Component
public class AdminAccountInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private String password;

    public AdminAccountInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${bloodconnect.admin.email:admin@bloodconnect.local}") String email,
            @Value("${bloodconnect.admin.password:}") String password
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        String configuredPassword = password;
        password = null;
        if (configuredPassword == null || configuredPassword.isBlank()) return;
        if (configuredPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("Configured admin password must be at most 72 UTF-8 bytes");
        }
        if (email.isBlank()) throw new IllegalStateException("Configured admin email must not be blank");

        userRepository.findByEmail(email).ifPresentOrElse(existing -> {
            if (existing.getRole() != UserRole.ADMIN) {
                throw new IllegalStateException("Configured admin email belongs to a non-admin account");
            }
        }, () -> userRepository.save(new AppUser(email, passwordEncoder.encode(configuredPassword), UserRole.ADMIN)));
    }
}