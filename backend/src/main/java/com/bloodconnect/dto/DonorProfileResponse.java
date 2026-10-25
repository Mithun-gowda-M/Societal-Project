package com.bloodconnect.dto;

import com.bloodconnect.entity.DonorProfile;

import java.time.Instant;
import java.util.UUID;

public record DonorProfileResponse(UUID id, String name, String phone, String bloodGroup, String location,
                                   Double latitude, Double longitude, boolean available, Instant updatedAt) {
    public static DonorProfileResponse from(DonorProfile profile) {
        return new DonorProfileResponse(profile.getId(), profile.getName(), profile.getPhone(),
                profile.getBloodGroup(), profile.getLocation(), profile.getLatitude(), profile.getLongitude(),
                profile.isAvailable(), profile.getUpdatedAt());
    }
}