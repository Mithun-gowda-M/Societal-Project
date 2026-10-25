package com.bloodconnect.dto;

import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, String email, UserRole role, Instant createdAt) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }
}
