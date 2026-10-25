package com.bloodconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BloodStockUpdateRequest(
        @NotBlank String group,
        @NotNull Integer delta
) {
}
