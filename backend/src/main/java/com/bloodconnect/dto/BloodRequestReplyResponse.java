package com.bloodconnect.dto;

import com.bloodconnect.entity.BloodRequestReply;

import java.time.Instant;
import java.util.UUID;

public record BloodRequestReplyResponse(
        UUID id,
        UUID requestId,
        UUID donorUserId,
        String donorName,
        String donorPhone,
        String donorBloodGroup,
        String status,
        String notes,
        Instant respondedAt
) {
    public static BloodRequestReplyResponse from(BloodRequestReply reply) {
        return new BloodRequestReplyResponse(
                reply.getId(),
                reply.getRequest().getId(),
                reply.getDonorUser().getId(),
                reply.getDonorName(),
                reply.getDonorPhone(),
                reply.getDonorBloodGroup(),
                reply.getStatus(),
                reply.getNotes(),
                reply.getRespondedAt()
        );
    }
}

