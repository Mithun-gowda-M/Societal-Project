package com.bloodconnect;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.bloodconnect.entity.AppUser;
import com.bloodconnect.entity.UserRole;
import com.bloodconnect.repository.UserRepository;
import com.bloodconnect.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:admin-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "bloodconnect.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
        "bloodconnect.jwt.expiration=PT1H",
        "bloodconnect.admin.email=admin@example.com",
        "bloodconnect.admin.password=admin-test-password"
})
@AutoConfigureMockMvc
class AdminApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Test
    void configuredAdminCanListUsersWithoutPasswordData() throws Exception {
        String adminToken = login("admin@example.com", "admin-test-password");

        MvcResult response = mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@example.com"))
                .andExpect(jsonPath("$[0].role").value("ADMIN"))
                .andReturn();

        JsonNode users = objectMapper.readTree(response.getResponse().getContentAsString());
        assertThat(users.toString()).doesNotContain("password", "passwordHash", "admin-test-password");
    }

    @Test
    void regularUserCannotListAdminUsers() throws Exception {
        String donorToken = registerDonor("admin-test-donor@example.com");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void publicRegistrationCannotCreateAdminAccount() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"attacker@example.com","password":"strong-pass-123","role":"ADMIN","phone":"+15551234567"}
                                """))
                .andExpect(status().isForbidden());
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginPayload(email, password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).path("accessToken").asText();
    }

    private String registerDonor(String email) throws Exception {
        AppUser donor = userRepository.save(new AppUser(email, passwordEncoder.encode("test-only-password"),
            UserRole.DONOR));
        return jwtService.createToken(donor);
    }

    private record LoginPayload(String email, String password) {
    }
}
