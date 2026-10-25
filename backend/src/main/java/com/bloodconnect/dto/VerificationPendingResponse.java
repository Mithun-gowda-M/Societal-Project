package com.bloodconnect.dto;

public record VerificationPendingResponse(String email, long expiresInSeconds) {
}