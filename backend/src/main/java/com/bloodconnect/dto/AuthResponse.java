package com.bloodconnect.dto;

public record AuthResponse(String tokenType, String accessToken, long expiresInSeconds, UserResponse user) {
}
