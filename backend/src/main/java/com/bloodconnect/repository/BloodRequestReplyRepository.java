package com.bloodconnect.repository;

import com.bloodconnect.entity.BloodRequestReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BloodRequestReplyRepository extends JpaRepository<BloodRequestReply, UUID> {
    List<BloodRequestReply> findByRequestIdOrderByRespondedAtDesc(UUID requestId);
    Optional<BloodRequestReply> findByRequestIdAndDonorUserId(UUID requestId, UUID donorUserId);
}

