package com.bloodconnect.service;

import com.bloodconnect.dto.DonorMatchResponse;
import com.bloodconnect.entity.BloodRequest;
import com.bloodconnect.entity.DonorProfile;
import com.bloodconnect.repository.DonorProfileRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class MatchingService {

    private final DonorProfileRepository donorRepository;

    public MatchingService(DonorProfileRepository donorRepository) {
        this.donorRepository = donorRepository;
    }

    public List<DonorMatchResponse> match(BloodRequest request) {
        return findMatches(request.getBloodGroup(), request.getLatitude(), request.getLongitude());
    }

    public List<DonorMatchResponse> findMatches(String recipientGroup, Double latitude, Double longitude) {
        return donorRepository.findAllByAvailableTrue().stream()
                .filter(donor -> isCompatible(recipientGroup, donor.getBloodGroup()))
                .map(donor -> toMatch(recipientGroup, donor, latitude, longitude))
                .sorted(Comparator
                        .comparing(DonorMatchResponse::distanceKm, Comparator.nullsLast(Double::compareTo))
                        .thenComparing(Comparator.comparingInt(DonorMatchResponse::priorityScore).reversed())
                        .thenComparing(DonorMatchResponse::name, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public static boolean isCompatible(String recipientGroup, String donorGroup) {
        return switch (recipientGroup) {
            case "O-" -> donorGroup.equals("O-");
            case "O+" -> donorGroup.equals("O-") || donorGroup.equals("O+");
            case "A-" -> donorGroup.equals("O-") || donorGroup.equals("A-");
            case "A+" -> List.of("O-", "O+", "A-", "A+").contains(donorGroup);
            case "B-" -> donorGroup.equals("O-") || donorGroup.equals("B-");
            case "B+" -> List.of("O-", "O+", "B-", "B+").contains(donorGroup);
            case "AB-" -> List.of("O-", "A-", "B-", "AB-").contains(donorGroup);
            case "AB+" -> List.of("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+")
                    .contains(donorGroup);
            default -> false;
        };
    }

    private DonorMatchResponse toMatch(String recipientGroup, DonorProfile donor, Double latitude, Double longitude) {
        Double distance = null;
        if (latitude != null && longitude != null && donor.getLatitude() != null && donor.getLongitude() != null) {
            distance = distanceKm(latitude, longitude, donor.getLatitude(), donor.getLongitude());
        }
        int score = (donor.isAvailable() ? 20 : 0)
            + (donor.getBloodGroup().equals(recipientGroup) ? 50 : 30)
                + (distance == null ? 0 : Math.max(0, 30 - (int) Math.round(distance)));
        return DonorMatchResponse.from(donor, distance, score);
    }

    private static double distanceKm(double latitude1, double longitude1, double latitude2, double longitude2) {
        double earthRadiusKm = 6371.0088;
        double latitudeDelta = Math.toRadians(latitude2 - latitude1);
        double longitudeDelta = Math.toRadians(longitude2 - longitude1);
        double value = Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2)
                + Math.cos(Math.toRadians(latitude1)) * Math.cos(Math.toRadians(latitude2))
                * Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);
        value = Math.max(0, Math.min(1, value));
        return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)) * 10) / 10.0;
    }
}