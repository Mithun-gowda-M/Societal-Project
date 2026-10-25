package com.bloodconnect.service;

import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.UserRole;
import com.bloodconnect.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OtpVerificationServiceTest {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @Test
    void sendsDistinctCodesAndVerifiesBothChannels() {
        UserRepository users = mock(UserRepository.class);
        OtpDeliveryService delivery = mock(OtpDeliveryService.class);
        AppUser user = unverifiedUser();
        when(users.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        var emailCode = org.mockito.ArgumentCaptor.forClass(String.class);
        var phoneCode = org.mockito.ArgumentCaptor.forClass(String.class);
        OtpVerificationService service = service(users, delivery);

        service.issueForRegistration(user);

        verify(delivery).sendEmail(org.mockito.ArgumentMatchers.eq(user.getEmail()), emailCode.capture());
        verify(delivery).sendSms(org.mockito.ArgumentMatchers.eq(user.getPhone()), phoneCode.capture());
        assertThat(emailCode.getValue()).matches("\\d{6}").isNotEqualTo(phoneCode.getValue());
        assertThat(user.getEmailOtpHash()).isNotEqualTo(emailCode.getValue());
        assertThat(user.getPhoneOtpHash()).isNotEqualTo(phoneCode.getValue());
        assertThat(user.getOtpExpiresAt()).isAfter(Instant.now());
        assertThat(user.areContactsVerified()).isFalse();

        assertThat(service.verify(user, emailCode.getValue(), phoneCode.getValue())).isTrue();
        assertThat(user.areContactsVerified()).isTrue();
        assertThat(user.getEmailOtpHash()).isNull();
        assertThat(user.getPhoneOtpHash()).isNull();
    }

    @Test
    void incorrectCodesCountTowardAttemptLimit() {
        UserRepository users = mock(UserRepository.class);
        AppUser user = unverifiedUser();
        user.setOtpChallenge(encoder.encode("123456"), encoder.encode("654321"),
                Instant.now().plusSeconds(600), Instant.now(), false);
        when(users.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        OtpVerificationService service = service(users, mock(OtpDeliveryService.class));

        for (int attempt = 0; attempt < 5; attempt++) {
            assertThat(service.verify(user, "000000", "000000")).isFalse();
        }

        assertThat(user.getOtpAttempts()).isEqualTo(5);
        assertThat(service.verify(user, "123456", "654321")).isFalse();
    }

    @Test
    void expiredCodesCannotVerify() {
        UserRepository users = mock(UserRepository.class);
        AppUser user = unverifiedUser();
        user.setOtpChallenge(encoder.encode("123456"), encoder.encode("654321"),
                Instant.now().minusSeconds(1), Instant.now().minusSeconds(700), false);
        OtpVerificationService service = service(users, mock(OtpDeliveryService.class));

        assertThat(service.verify(user, "123456", "654321")).isFalse();
        assertThat(user.areContactsVerified()).isFalse();
    }

    @Test
    void resendIsRateLimited() {
        UserRepository users = mock(UserRepository.class);
        AppUser user = unverifiedUser();
        user.setOtpChallenge(encoder.encode("123456"), encoder.encode("654321"),
                Instant.now().plusSeconds(600), Instant.now(), false);

        assertThatThrownBy(() -> service(users, mock(OtpDeliveryService.class)).resend(user))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
    }

    private OtpVerificationService service(UserRepository users, OtpDeliveryService delivery) {
        return new OtpVerificationService(users, encoder, delivery, Duration.ofMinutes(10),
                Duration.ofMinutes(1), 5, 3);
    }

    private AppUser unverifiedUser() {
        return new AppUser("donor@example.com", "encoded-password", UserRole.DONOR, "+15551234567");
    }
}
