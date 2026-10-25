package com.bloodconnect.service;

import com.bloodconnect.dto.DonorProfileRequest;
import com.bloodconnect.dto.DonorProfileResponse;
import com.bloodconnect.dto.DonorMatchResponse;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.DonorProfile;
import com.bloodconnect.repository.DonorProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class DonorService {

    private final DonorProfileRepository donorRepository;
    private final MatchingService matchingService;

    public DonorService(DonorProfileRepository donorRepository, MatchingService matchingService) {
        this.donorRepository = donorRepository;
        this.matchingService = matchingService;
    }

    @Transactional
    public DonorProfileResponse save(AppUser user, DonorProfileRequest request) {
        DonorProfile profile = donorRepository.findByUserId(user.getId())
                .orElseGet(() -> new DonorProfile(user, request.name(), request.phone(), request.bloodGroup(),
                        request.location(), request.latitude(), request.longitude(), request.available()));
        profile.update(request.name(), request.phone(), request.bloodGroup(), request.location(),
                request.latitude(), request.longitude(), request.available());
        return DonorProfileResponse.from(donorRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public DonorProfileResponse get(UUID userId) {
        return donorRepository.findByUserId(userId).map(DonorProfileResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor profile not found"));
    }

    @Transactional
    public DonorProfileResponse setAvailability(UUID userId, boolean available) {
        DonorProfile profile = donorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor profile not found"));
        profile.setAvailable(available);
        return DonorProfileResponse.from(profile);
    }

    @Transactional(readOnly = true)
    public List<DonorMatchResponse> nearby(String bloodGroup, Double latitude, Double longitude) {
        return matchingService.findMatches(bloodGroup, latitude, longitude);
    }
}