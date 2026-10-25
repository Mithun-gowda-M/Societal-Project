package com.bloodconnect.dto;

import com.bloodconnect.entity.DonorProfile;

import java.util.UUID;

public record DonorMatchResponse(UUID id, String name, String bloodGroup, String location,
                                Double latitude, Double longitude, Double distanceKm,
                                int priorityScore, boolean available) {
    public static DonorMatchResponse from(DonorProfile donor, Double distanceKm, int priorityScore) {
        return new DonorMatchResponse(donor.getId(), donor.getName(), donor.getBloodGroup(), donor.getLocation(),
                donor.getLatitude(), donor.getLongitude(), distanceKm, priorityScore, donor.isAvailable());
    }
}