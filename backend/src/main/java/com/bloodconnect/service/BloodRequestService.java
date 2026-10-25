package com.bloodconnect.service;

import com.bloodconnect.dto.BloodRequestCreateRequest;
import com.bloodconnect.dto.BloodRequestResponse;
import com.bloodconnect.dto.DonorMatchResponse;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.BloodRequest;
import com.bloodconnect.entity.RequestStatus;
import com.bloodconnect.repository.BloodRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class BloodRequestService {

    private final BloodRequestRepository requestRepository;
    private final MatchingService matchingService;

    public BloodRequestService(BloodRequestRepository requestRepository, MatchingService matchingService) {
        this.requestRepository = requestRepository;
        this.matchingService = matchingService;
    }

    @Transactional
    public BloodRequestResponse create(AppUser user, BloodRequestCreateRequest request) {
        BloodRequest saved = requestRepository.save(new BloodRequest(user, request.patientName(), request.bloodGroup(),
                request.units(), request.hospital(), request.location(), request.latitude(), request.longitude(),
                request.urgency().toUpperCase(), request.contact(), request.message()));
        return BloodRequestResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<DonorMatchResponse> matches(UUID requestId, UUID requesterId) {
        BloodRequest request = getOwnedRequest(requestId, requesterId);
        if (request.getStatus() != RequestStatus.OPEN) {
            return List.of();
        }
        return matchingService.match(request);
    }

    @Transactional(readOnly = true)
    public BloodRequestResponse get(UUID requestId, UUID requesterId) {
        return BloodRequestResponse.from(getOwnedRequest(requestId, requesterId));
    }

    @Transactional
    public BloodRequestResponse updateStatus(UUID requestId, UUID requesterId, RequestStatus status) {
        BloodRequest request = getOwnedRequest(requestId, requesterId);
        request.setStatus(status);
        return BloodRequestResponse.from(request);
    }

    private BloodRequest getOwnedRequest(UUID requestId, UUID requesterId) {
        return requestRepository.findByIdAndRequesterId(requestId, requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blood request not found"));
    }
}