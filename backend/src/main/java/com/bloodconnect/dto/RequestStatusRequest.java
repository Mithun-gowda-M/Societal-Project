package com.bloodconnect.dto;

import com.bloodconnect.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;

public record RequestStatusRequest(@NotNull RequestStatus status) {
}