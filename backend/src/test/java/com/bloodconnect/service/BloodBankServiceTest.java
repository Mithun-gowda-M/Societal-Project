package com.bloodconnect.service;

import com.bloodconnect.dto.BloodBankResponse;
import com.bloodconnect.dto.BloodStockUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BloodBankServiceTest {

    private BloodBankService bloodBankService;

    @BeforeEach
    void setUp() {
        bloodBankService = new BloodBankService();
    }

    @Test
    void shouldReturnAllBangaloreBloodBanks() {
        List<BloodBankResponse> banks = bloodBankService.getAllBanks();
        assertThat(banks).hasSize(10);
        assertThat(banks).anyMatch(b -> b.name().contains("Victoria Hospital"));
        assertThat(banks).anyMatch(b -> b.name().contains("Rotary Bangalore TTK"));
    }

    @Test
    void shouldGetBloodBankById() {
        BloodBankResponse bank = bloodBankService.getBank("bank-1");
        assertThat(bank.name()).isEqualTo("Victoria Hospital Blood Bank (BMCRI)");
        assertThat(bank.stock()).containsKey("O+");
    }

    @Test
    void shouldUpdateStockUnits() {
        BloodBankResponse before = bloodBankService.getBank("bank-1");
        int initialOPlus = before.stock().get("O+");

        BloodBankResponse updated = bloodBankService.updateStock("bank-1", new BloodStockUpdateRequest("O+", 5));
        assertThat(updated.stock().get("O+")).isEqualTo(initialOPlus + 5);

        BloodBankResponse subtracted = bloodBankService.updateStock("bank-1", new BloodStockUpdateRequest("O+", -2));
        assertThat(subtracted.stock().get("O+")).isEqualTo(initialOPlus + 3);
    }
}
