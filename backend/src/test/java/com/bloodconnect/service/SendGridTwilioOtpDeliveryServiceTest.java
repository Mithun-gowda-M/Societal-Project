package com.bloodconnect.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SendGridTwilioOtpDeliveryServiceTest {

    @Test
    void rejectsMissingDeliveryConfiguration() {
        SendGridTwilioOtpDeliveryService service = new SendGridTwilioOtpDeliveryService(
                RestClient.builder(), "", "", "", "", "");

        assertThatThrownBy(service::ensureConfigured)
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void acceptsCompleteDeliveryConfiguration() {
        SendGridTwilioOtpDeliveryService service = new SendGridTwilioOtpDeliveryService(
                RestClient.builder(), "sendgrid-test-key", "verified@example.com",
                "ACtest-account", "twilio-test-token", "+15551234567");

        assertThatCode(service::ensureConfigured).doesNotThrowAnyException();
    }
}
