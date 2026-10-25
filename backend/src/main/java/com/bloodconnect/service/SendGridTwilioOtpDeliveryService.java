package com.bloodconnect.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class SendGridTwilioOtpDeliveryService implements OtpDeliveryService {

    private final RestClient restClient;
    private final String sendGridApiKey;
    private final String sendGridFromEmail;
    private final String twilioAccountSid;
    private final String twilioAuthToken;
    private final String twilioFromNumber;

    public SendGridTwilioOtpDeliveryService(
            RestClient.Builder restClientBuilder,
            @Value("${bloodconnect.sendgrid.api-key:}") String sendGridApiKey,
            @Value("${bloodconnect.sendgrid.from-email:}") String sendGridFromEmail,
            @Value("${bloodconnect.twilio.account-sid:}") String twilioAccountSid,
            @Value("${bloodconnect.twilio.auth-token:}") String twilioAuthToken,
            @Value("${bloodconnect.twilio.from-number:}") String twilioFromNumber
    ) {
        this.restClient = restClientBuilder.build();
        this.sendGridApiKey = sendGridApiKey;
        this.sendGridFromEmail = sendGridFromEmail;
        this.twilioAccountSid = twilioAccountSid;
        this.twilioAuthToken = twilioAuthToken;
        this.twilioFromNumber = twilioFromNumber;
    }

    @Override
    public void ensureConfigured() {
        if (sendGridApiKey.isBlank() || sendGridFromEmail.isBlank()) {
            throw deliveryUnavailable("Email");
        }
        if (twilioAccountSid.isBlank() || twilioAuthToken.isBlank() || twilioFromNumber.isBlank()) {
            throw deliveryUnavailable("SMS");
        }
    }

    @Override
    public void sendEmail(String email, String code) {
        if (sendGridApiKey.isBlank() || sendGridFromEmail.isBlank()) {
            throw deliveryUnavailable("Email");
        }
        Map<String, Object> payload = Map.of(
                "personalizations", List.of(Map.of("to", List.of(Map.of("email", email)))),
                "from", Map.of("email", sendGridFromEmail),
                "subject", "BloodConnect verification code",
                "content", List.of(Map.of("type", "text/plain", "value",
                    "Your BloodConnect verification code is %s. Use it soon to verify your account."
                        .formatted(code)))
        );
        try {
            restClient.post().uri("https://api.sendgrid.com/v3/mail/send")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + sendGridApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            throw deliveryUnavailable("Email");
        }
    }

    @Override
    public void sendSms(String phone, String code) {
        if (twilioAccountSid.isBlank() || twilioAuthToken.isBlank() || twilioFromNumber.isBlank()) {
            throw deliveryUnavailable("SMS");
        }
        String credentials = Base64.getEncoder().encodeToString(
                (twilioAccountSid + ":" + twilioAuthToken).getBytes(StandardCharsets.UTF_8));
        String body = "To=" + encode(phone) + "&From=" + encode(twilioFromNumber)
            + "&Body=" + encode("Your BloodConnect verification code is %s. Use it soon to verify your account."
            .formatted(code));
        try {
            restClient.post()
                    .uri("https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json", twilioAccountSid)
                    .header(HttpHeaders.AUTHORIZATION, "Basic " + credentials)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            throw deliveryUnavailable("SMS");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private ResponseStatusException deliveryUnavailable(String channel) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                channel + " verification delivery is not configured or is unavailable");
    }
}