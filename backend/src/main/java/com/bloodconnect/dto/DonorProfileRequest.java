package com.bloodconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

public record DonorProfileRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 30) String phone,
        @NotBlank @Pattern(regexp = "A[+-]|B[+-]|AB[+-]|O[+-]") String bloodGroup,
        @NotBlank @Size(max = 160) String location,
        @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
        @NotNull Boolean available
) {
}