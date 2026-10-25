package com.bloodconnect;

import com.bloodconnect.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:otp-unconfigured-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "bloodconnect.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
        "bloodconnect.jwt.expiration=PT1H",
        "bloodconnect.sendgrid.api-key=",
        "bloodconnect.sendgrid.from-email=",
        "bloodconnect.twilio.account-sid=",
        "bloodconnect.twilio.auth-token=",
        "bloodconnect.twilio.from-number="
})
@AutoConfigureMockMvc
class OtpDeliveryUnavailableApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void registrationFailsWithoutPersistingAccountWhenDeliveryIsUnconfigured() throws Exception {
        String email = "delivery-unavailable@example.com";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"delivery-unavailable@example.com","password":"strong-pass-123",
                                "role":"DONOR","phone":"+14155550123"}
                                """))
                .andExpect(status().isServiceUnavailable());

        assertThat(userRepository.findByEmail(email)).isEmpty();
    }
}
