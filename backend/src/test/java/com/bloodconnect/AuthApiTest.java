package com.bloodconnect;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.bloodconnect.service.OtpDeliveryService;

import static org.mockito.Mockito.clearInvocations;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:bloodconnect-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "bloodconnect.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
        "bloodconnect.jwt.expiration=PT1H"
})
@AutoConfigureMockMvc
class AuthApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

        @MockitoBean
        private OtpDeliveryService otpDeliveryService;

    @Test
    void registerLoginAndGetCurrentUser() throws Exception {
        String email = "donor@example.com";
        String phone = "+15551234567";
        clearInvocations(otpDeliveryService);
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new com.bloodconnect.dto.RegisterRequest(
                                email, "strong-pass-123", com.bloodconnect.entity.UserRole.DONOR, phone))))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andReturn();

        JsonNode registrationBody = objectMapper.readTree(registration.getResponse().getContentAsString());
        assertThat(registrationBody.path("expiresInSeconds").asLong()).isEqualTo(600L);
        String registrationToken = TestOtpHelper.verifyRegistration(mockMvc, objectMapper, otpDeliveryService,
                email, phone);
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + registrationToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("donor@example.com"));

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"DONOR@example.com","password":"strong-pass-123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode loginBody = objectMapper.readTree(login.getResponse().getContentAsString());
        org.assertj.core.api.Assertions.assertThat(loginBody.path("accessToken").asText()).isNotBlank();
    }
}
