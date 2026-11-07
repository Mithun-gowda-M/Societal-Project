package com.bloodconnect.dto;

import com.bloodconnect.entity.DonorProfile;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record DonorProfileResponse(UUID id, String name, String phone, String bloodGroup, String location,
                                   Double latitude, Double longitude, boolean available,
                                   LocalDate lastDonationDate, Instant updatedAt) {
    public static DonorProfileResponse from(DonorProfile profile) {
        return new DonorProfileResponse(profile.getId(), profile.getName(), profile.getPhone(),
                profile.getBloodGroup(), profile.getLocation(), profile.getLatitude(), profile.getLongitude(),
                profile.isAvailable(), profile.getLastDonationDate(), profile.getUpdatedAt());
    }
}