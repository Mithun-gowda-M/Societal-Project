package com.bloodconnect.service;

import com.bloodconnect.dto.BloodRequestCreateRequest;
import com.bloodconnect.dto.BloodRequestReplyRequest;
import com.bloodconnect.dto.BloodRequestReplyResponse;
import com.bloodconnect.dto.BloodRequestResponse;
import com.bloodconnect.dto.DonorMatchResponse;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.BloodRequest;
import com.bloodconnect.entity.BloodRequestReply;
import com.bloodconnect.entity.DonorProfile;
import com.bloodconnect.entity.RequestStatus;
import com.bloodconnect.repository.BloodRequestReplyRepository;
import com.bloodconnect.repository.BloodRequestRepository;
import com.bloodconnect.repository.DonorProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class BloodRequestService {

    private final BloodRequestRepository requestRepository;
    private final BloodRequestReplyRepository replyRepository;
    private final DonorProfileRepository donorRepository;
    private final MatchingService matchingService;

    public BloodRequestService(BloodRequestRepository requestRepository, MatchingService matchingService) {
        this(requestRepository, null, null, matchingService);
    }

    public BloodRequestService(BloodRequestRepository requestRepository,
                               BloodRequestReplyRepository replyRepository,
                               DonorProfileRepository donorRepository,
                               MatchingService matchingService) {
        this.requestRepository = requestRepository;
        this.replyRepository = replyRepository;
        this.donorRepository = donorRepository;
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

    @Transactional
    public BloodRequestReplyResponse replyToRequest(AppUser donorUser, UUID requestId, BloodRequestReplyRequest replyRequest) {
        BloodRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blood request not found"));

        DonorProfile donorProfile = donorRepository.findByUserId(donorUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complete your donor profile before replying to requests"));

        String statusUpper = replyRequest.status().toUpperCase();
        BloodRequestReply reply = replyRepository.findByRequestIdAndDonorUserId(requestId, donorUser.getId())
                .orElseGet(() -> new BloodRequestReply(
                        request,
                        donorUser,
                        donorProfile.getName(),
                        donorProfile.getPhone(),
                        donorProfile.getBloodGroup(),
                        statusUpper,
                        replyRequest.notes()
                ));

        reply.setStatus(statusUpper);
        if (replyRequest.notes() != null) {
            reply.setNotes(replyRequest.notes());
        }

        return BloodRequestReplyResponse.from(replyRepository.save(reply));
    }

    @Transactional(readOnly = true)
    public List<BloodRequestReplyResponse> getReplies(UUID requestId) {
        if (!requestRepository.existsById(requestId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Blood request not found");
        }
        return replyRepository.findByRequestIdOrderByRespondedAtDesc(requestId).stream()
                .map(BloodRequestReplyResponse::from)
                .toList();
    }

    private BloodRequest getOwnedRequest(UUID requestId, UUID requesterId) {
        return requestRepository.findByIdAndRequesterId(requestId, requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blood request not found"));
    }
}