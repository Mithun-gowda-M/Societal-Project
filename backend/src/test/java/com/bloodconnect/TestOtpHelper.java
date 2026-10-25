package com.bloodconnect;

import com.bloodconnect.dto.OtpVerificationRequest;
import com.bloodconnect.service.OtpDeliveryService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mockito.ArgumentCaptor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

final class TestOtpHelper {

    private TestOtpHelper() {
    }

    static String verifyRegistration(MockMvc mockMvc, ObjectMapper objectMapper,
                                     OtpDeliveryService deliveryService, String email, String phone)
            throws Exception {
        ArgumentCaptor<String> emailCode = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> phoneCode = ArgumentCaptor.forClass(String.class);
        verify(deliveryService).sendEmail(eq(email), emailCode.capture());
        verify(deliveryService).sendSms(eq(phone), phoneCode.capture());

        MvcResult verification = mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(
                                new OtpVerificationRequest(email, emailCode.getValue(), phoneCode.getValue()))))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode response = objectMapper.readTree(verification.getResponse().getContentAsString());
        return response.path("accessToken").asText();
    }
}
