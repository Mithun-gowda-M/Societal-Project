package com.bloodconnect.dto;

import com.bloodconnect.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 10, max = 72) String password,
                @NotNull UserRole role,
                @NotBlank @Pattern(regexp = "\\+[1-9]\\d{7,14}") String phone
) {
        public RegisterRequest(String email, String password, UserRole role) {
                this(email, password, role, null);
        }
}
