package com.bloodconnect.controller;

import com.bloodconnect.dto.BloodRequestCreateRequest;
import com.bloodconnect.dto.BloodRequestResponse;
import com.bloodconnect.dto.DonorMatchResponse;
import com.bloodconnect.dto.RequestStatusRequest;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.service.BloodRequestService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@PreAuthorize("hasRole('REQUESTER')")
public class BloodRequestController {

    private final BloodRequestService requestService;

    public BloodRequestController(BloodRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<BloodRequestResponse> create(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody BloodRequestCreateRequest request
    ) {
        return org.springframework.http.ResponseEntity.status(201).body(requestService.create(user, request));
    }

    @GetMapping("/{requestId}")
    public BloodRequestResponse get(@AuthenticationPrincipal AppUser user, @PathVariable UUID requestId) {
        return requestService.get(requestId, user.getId());
    }

    @GetMapping("/{requestId}/matches")
    public List<DonorMatchResponse> matches(@AuthenticationPrincipal AppUser user,
                                            @PathVariable UUID requestId) {
        return requestService.matches(requestId, user.getId());
    }

    @PatchMapping("/{requestId}/status")
    public BloodRequestResponse updateStatus(@AuthenticationPrincipal AppUser user,
                                             @PathVariable UUID requestId,
                                             @Valid @RequestBody RequestStatusRequest request) {
        return requestService.updateStatus(requestId, user.getId(), request.status());
    }
}