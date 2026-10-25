package com.bloodconnect.controller;

import com.bloodconnect.dto.AvailabilityRequest;
import com.bloodconnect.dto.DonorMatchResponse;
import com.bloodconnect.dto.DonorProfileRequest;
import com.bloodconnect.dto.DonorProfileResponse;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.service.DonorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/donors")
@PreAuthorize("hasRole('DONOR')")
public class DonorController {

    private final DonorService donorService;

    public DonorController(DonorService donorService) {
        this.donorService = donorService;
    }

    @PutMapping("/me")
    public DonorProfileResponse saveProfile(@AuthenticationPrincipal AppUser user,
                                            @Valid @RequestBody DonorProfileRequest request) {
        return donorService.save(user, request);
    }

    @GetMapping("/me")
    public DonorProfileResponse profile(@AuthenticationPrincipal AppUser user) {
        return donorService.get(user.getId());
    }

    @PatchMapping("/me/availability")
    public DonorProfileResponse availability(@AuthenticationPrincipal AppUser user,
                                             @Valid @RequestBody AvailabilityRequest request) {
        return donorService.setAvailability(user.getId(), request.available());
    }

    @GetMapping("/nearby")
    @PreAuthorize("hasAnyRole('DONOR', 'REQUESTER')")
    public List<DonorMatchResponse> nearby(
            @RequestParam @Pattern(regexp = "A[+-]|B[+-]|AB[+-]|O[+-]") String bloodGroup,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude
    ) {
        return donorService.nearby(bloodGroup, latitude, longitude);
    }
}