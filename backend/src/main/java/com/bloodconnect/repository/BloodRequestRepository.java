package com.bloodconnect.repository;

import com.bloodconnect.entity.BloodRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, UUID> {
    Optional<BloodRequest> findByIdAndRequesterId(UUID id, UUID requesterId);
}