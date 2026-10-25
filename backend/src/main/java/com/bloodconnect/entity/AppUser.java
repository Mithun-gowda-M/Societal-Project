package com.bloodconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "app_users")
public class AppUser implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(length = 30)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "email_verified", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean emailVerified = true;

    @Column(name = "phone_verified", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean phoneVerified = true;

    @Column(name = "email_otp_hash", length = 60)
    private String emailOtpHash;

    @Column(name = "phone_otp_hash", length = 60)
    private String phoneOtpHash;

    @Column(name = "otp_expires_at")
    private Instant otpExpiresAt;

    @Column(name = "otp_sent_at")
    private Instant otpSentAt;

    @Column(name = "otp_attempts", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private int otpAttempts;

    @Column(name = "otp_resends", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private int otpResends;

    protected AppUser() {
    }

    public AppUser(String email, String passwordHash, UserRole role) {
        this(email, passwordHash, role, null, true, true);
    }

    public AppUser(String email, String passwordHash, UserRole role, String phone) {
        this(email, passwordHash, role, phone, false, false);
    }

    private AppUser(String email, String passwordHash, UserRole role, String phone,
                    boolean emailVerified, boolean phoneVerified) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.phone = phone;
        this.emailVerified = emailVerified;
        this.phoneVerified = phoneVerified;
    }

    public void setOtpChallenge(String emailOtpHash, String phoneOtpHash, Instant expiresAt,
                                Instant sentAt, boolean resend) {
        this.emailOtpHash = emailOtpHash;
        this.phoneOtpHash = phoneOtpHash;
        this.otpExpiresAt = expiresAt;
        this.otpSentAt = sentAt;
        this.otpAttempts = 0;
        if (resend) this.otpResends++;
    }

    public void incrementOtpAttempts() {
        otpAttempts++;
    }

    public void markEmailVerified() {
        emailVerified = true;
        emailOtpHash = null;
    }

    public void markPhoneVerified() {
        phoneVerified = true;
        phoneOtpHash = null;
    }

    public void clearOtpChallenge() {
        emailOtpHash = null;
        phoneOtpHash = null;
        otpExpiresAt = null;
        otpSentAt = null;
        otpAttempts = 0;
        otpResends = 0;
    }

    @PrePersist
    void setCreatedAt() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public boolean isPhoneVerified() {
        return phoneVerified;
    }

    public boolean areContactsVerified() {
        return emailVerified && phoneVerified;
    }

    public String getEmailOtpHash() {
        return emailOtpHash;
    }

    public String getPhoneOtpHash() {
        return phoneOtpHash;
    }

    public Instant getOtpExpiresAt() {
        return otpExpiresAt;
    }

    public Instant getOtpSentAt() {
        return otpSentAt;
    }

    public int getOtpAttempts() {
        return otpAttempts;
    }

    public int getOtpResends() {
        return otpResends;
    }

    public UserRole getRole() {
        return role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
