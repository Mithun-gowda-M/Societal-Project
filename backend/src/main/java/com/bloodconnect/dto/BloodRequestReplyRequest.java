package com.bloodconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record BloodRequestReplyRequest(
        @NotBlank @Pattern(regexp = "ACCEPTED|DECLINED", flags = Pattern.Flag.CASE_INSENSITIVE) String status,
        String notes
) {
}

